const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { records, MODULES } = require('./seed');

const PORT = process.env.PORT || 8087;
const SECRET = process.env.JWT_SECRET || 'lexora-local-dev';
const db = records.map((item) => ({ ...item, liens: item.liens.map((link) => ({ ...link })) }));
const journal = [];

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[^\p{L}\p{N}+]+/gu, ' ')
    .trim();
}

function readUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    return { id: Number(payload.user_id), role: payload.role || 'agent' };
  } catch {
    return null;
  }
}

function requireUser(req, res, next) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Session invalide' });
  req.user = user;
  return next();
}

function profile(role) {
  if (role === 'admin' || role === 'responsable_departement') return 'responsable';
  if (['directeur_centrale', 'directeur_direction', 'directeur_direction_activite', 'directeur_division_activite', 'vice_presedent'].includes(role)) return 'juriste';
  if (['assistant_directeur_centrale', 'responsable_direction_division', 'responsable_departement_division'].includes(role)) return 'veilleur';
  return 'lecteur';
}

function canSee(user, item) {
  const kind = profile(user.role);
  if (kind === 'responsable') return true;
  if (item.confidentialite === 'confidentiel_dossier') {
    if (kind !== 'juriste') return false;
    return (item.equipe || []).map(Number).includes(Number(user.id));
  }
  if (item.confidentialite === 'restreint') return kind !== 'lecteur';
  return true;
}

function visible(user) {
  return db.filter((item) => canSee(user, item));
}

function moduleOf(id) {
  return MODULES.find((item) => item.id === id);
}

function label(item, lang) {
  if (lang === 'ar' && item.titre_ar) return item.titre_ar;
  if (lang === 'en' && item.titre_en) return item.titre_en;
  return item.titre_fr;
}

function publicItem(item, lang) {
  return {
    id: item.id,
    module: item.module,
    confidentialite: item.confidentialite,
    statut: item.statut,
    annee: item.annee,
    titre: label(item, lang),
    titre_fr: item.titre_fr,
    titre_ar: item.titre_ar,
    titre_en: item.titre_en,
    resume: lang === 'ar' && item.resume_ar ? item.resume_ar : item.resume_fr,
    themes: item.themes,
    pays: item.pays,
  };
}

function findItem(id) {
  return db.find((item) => item.id === id);
}

function linksOf(item, user, lang) {
  const outgoing = (item.liens || [])
    .map((link) => {
      const target = findItem(link.id);
      if (!target || !canSee(user, target)) return null;
      return { ...link, titre: label(target, lang), moduleLabel: (moduleOf(target.module) || {}).fr };
    })
    .filter(Boolean);
  const incoming = visible(user)
    .filter((other) => other.id !== item.id && (other.liens || []).some((link) => link.id === item.id))
    .map((other) => ({
      module: other.module,
      id: other.id,
      relation: 'cité par',
      titre: label(other, lang),
      moduleLabel: (moduleOf(other.module) || {}).fr,
    }));
  return { sortants: outgoing, entrants: incoming };
}

function itemsForModule(user, moduleId) {
  const rows = visible(user);
  if (moduleId === 'energie') {
    return rows.filter((item) => item.module === 'arbitrages' && (item.champs.secteur === 'energie' || item.themes.includes('hydrocarbures')));
  }
  return rows.filter((item) => item.module === moduleId);
}

function haystack(item) {
  return normalize(JSON.stringify({
    titre_fr: item.titre_fr,
    titre_ar: item.titre_ar,
    titre_en: item.titre_en,
    resume_fr: item.resume_fr,
    resume_ar: item.resume_ar,
    themes: item.themes,
    pays: item.pays,
    champs: item.champs,
  }));
}

function parseQuery(raw) {
  const text = String(raw || '');
  const range = text.match(/(\d{4})\s*-\s*(\d{4})/);
  const withoutRange = text.replace(/(\d{4})\s*-\s*(\d{4})/, ' ');
  const [kept, ...excludedParts] = withoutRange.split(/\s+SAUF\s+/i);
  const groups = kept.split(/\s+OU\s+/i).map((group) => normalize(group.replace(/\+/g, ' ')).split(/\s+/).filter(Boolean));
  const excluded = normalize(excludedParts.join(' ')).split(/\s+/).filter(Boolean);
  return {
    groups: groups.filter((group) => group.length),
    excluded,
    from: range ? Number(range[1]) : null,
    to: range ? Number(range[2]) : null,
  };
}

function matches(item, query) {
  if (query.from && item.annee && item.annee < query.from) return false;
  if (query.to && item.annee && item.annee > query.to) return false;
  const text = haystack(item);
  if (query.excluded.some((term) => text.includes(term))) return false;
  if (!query.groups.length) return true;
  return query.groups.some((group) => group.every((term) => text.includes(term)));
}

function excerpt(item, terms) {
  const source = `${item.resume_fr} ${item.titre_fr}`;
  const hit = terms.flat().find((term) => normalize(source).includes(term));
  if (!hit) return item.resume_fr.slice(0, 180);
  const index = normalize(source).indexOf(hit);
  const start = Math.max(0, index - 40);
  return `${start ? '…' : ''}${source.slice(start, start + 180)}…`;
}

function audit(user, action, target) {
  journal.unshift({
    id: `arb-${Date.now()}`,
    at: new Date().toISOString(),
    actorId: user.id,
    role: user.role,
    action,
    target,
  });
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/arbitrage/health', (req, res) => res.json({ success: true, service: 'arbitrage', status: 'UP' }));

app.use('/arbitrage', requireUser);

app.get('/arbitrage/modules', (req, res) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'fr';
  const data = MODULES.map((item) => ({
    ...item,
    libelle: lang === 'ar' ? item.ar : item.fr,
    total: item.id === 'dashboard' ? null : itemsForModule(req.user, item.id).length,
  }));
  res.json({ success: true, data, role: profile(req.user.role) });
});

app.get('/arbitrage/search', (req, res) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'fr';
  const query = parseQuery(req.query.q || '');
  const hits = visible(req.user).filter((item) => matches(item, query));
  const groups = {};
  hits.forEach((item) => {
    const key = item.module;
    if (!groups[key]) groups[key] = [];
    groups[key].push({ ...publicItem(item, lang), extrait: excerpt(item, query.groups) });
  });
  res.json({
    success: true,
    total: hits.length,
    data: MODULES.filter((item) => groups[item.id]).map((item) => ({
      module: item.id,
      libelle: lang === 'ar' ? item.ar : item.fr,
      total: groups[item.id].length,
      resultats: groups[item.id],
    })),
  });
});

app.get('/arbitrage/dashboard', (req, res) => {
  const rows = visible(req.user);
  const dossiers = rows.filter((item) => item.module === 'dossiers');
  const arbitrages = rows.filter((item) => item.module === 'arbitrages');
  const by = (list, pick) => {
    const map = new Map();
    list.forEach((item) => {
      const key = pick(item) || '—';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([label, total]) => ({ label, total }));
  };
  const montants = dossiers.reduce((sum, item) => sum + (Number(item.champs.montants?.reclames) || 0), 0);
  const provisionnes = dossiers.reduce((sum, item) => sum + (Number(item.champs.montants?.provisionnes) || 0), 0);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 30);
  const echeances = dossiers.flatMap((item) => (item.champs.delais || []).filter((delai) => new Date(delai.date) <= horizon).map((delai) => ({
    dossier: item.titre_fr,
    ...delai,
  })));
  res.json({
    success: true,
    data: {
      arbitrages: arbitrages.length,
      dossiers: dossiers.length,
      sentences: rows.filter((item) => item.module === 'sentences').length,
      questions: rows.filter((item) => item.module === 'questions').length,
      parInstitution: by(arbitrages, (item) => item.champs.institution),
      parPays: by(rows.filter((item) => item.pays.includes('DZ') || item.pays.includes('IT')), (item) => item.pays.filter((pays) => pays !== 'DZ')[0] || 'DZ'),
      montantsReclames: montants,
      montantsProvisionnes: provisionnes,
      echeances,
      veille: rows.filter((item) => item.module === 'veille').map((item) => publicItem(item, 'fr')),
    },
  });
});

app.get('/arbitrage/audit', (req, res) => {
  if (profile(req.user.role) !== 'responsable' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Journal réservé à l\'administrateur et au responsable.' });
  }
  res.json({ success: true, data: journal });
});

app.get('/arbitrage/modules/:moduleId', (req, res) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'fr';
  const meta = moduleOf(req.params.moduleId === 'energie' ? 'energie' : req.params.moduleId);
  if (!meta && req.params.moduleId !== 'energie') return res.status(404).json({ success: false, message: 'Module introuvable' });
  const found = MODULES.find((item) => item.id === req.params.moduleId);
  if (!found) return res.status(404).json({ success: false, message: 'Module introuvable' });
  res.json({ success: true, module: found, data: itemsForModule(req.user, req.params.moduleId).map((item) => publicItem(item, lang)) });
});

app.get('/arbitrage/items/:id', (req, res) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'fr';
  const item = findItem(req.params.id);
  if (!item || !canSee(req.user, item)) return res.status(404).json({ success: false, message: 'Introuvable' });
  if (item.confidentialite === 'confidentiel_dossier') {
    audit(req.user, 'Consultation d\'un dossier confidentiel', item.titre_fr);
  }
  res.json({ success: true, data: { ...item, titre: label(item, lang), liensResolus: linksOf(item, req.user, lang) } });
});

app.post('/arbitrage/veille', (req, res) => {
  const kind = profile(req.user.role);
  if (kind === 'lecteur') return res.status(403).json({ success: false, message: 'Lecture seule' });
  const body = req.body || {};
  if (!body.titre_fr) return res.status(400).json({ success: false, message: 'Le titre est obligatoire' });
  const item = recSafe(body);
  db.unshift(item);
  audit(req.user, 'Ajout d\'une veille', item.titre_fr);
  res.status(201).json({ success: true, data: publicItem(item, 'fr') });
});

function recSafe(body) {
  return {
    id: `vei-${Date.now()}`,
    module: 'veille',
    confidentialite: 'public_interne',
    statut: 'brouillon',
    annee: new Date().getFullYear(),
    equipe: [],
    titre_fr: String(body.titre_fr).slice(0, 180),
    titre_ar: String(body.titre_ar || ''),
    titre_en: '',
    resume_fr: String(body.resume_fr || ''),
    resume_ar: '',
    themes: Array.isArray(body.themes) ? body.themes : [],
    pays: body.pays ? [body.pays] : [],
    liens: [],
    champs: { categorie: body.categorie || 'Publications', etiquettes: body.themes || [], suivi: 'a_traiter', pays: body.pays || '' },
  };
}

app.listen(PORT, () => {
  console.log(`Service arbitrage sur http://localhost:${PORT}`);
});
