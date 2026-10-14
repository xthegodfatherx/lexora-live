const { id } = require('./store');
const corpus = require('./corpus');

const ROUTE = { analyse: 'DER-AJ', veille: 'DER-RVJ', patrimonial: 'DER-SJOP' };
const CANAUX = ['activite', 'dg', 'direction_contrats', 'direction_differends', 'direction_conformite'];
const ACTIVITES = ['Amont', 'Aval', 'TRC', 'LNG', 'Commerce', 'E-P', 'LOS', 'COM', 'RPC'];
const TYPES_ACTIF = ['foncier', 'participation', 'concession', 'droit_reel'];
const STATUTS_ACTIF = ['actif', 'litigieux', 'en_regularisation'];

const CHEF = new Set(['responsable_departement', 'admin']);
const DIRECTEUR = new Set(['directeur_direction', 'directeur_centrale', 'admin']);
const REDACTEUR = new Set(['agent', 'responsable_departement', 'directeur_direction', 'admin']);

function hasRole(user, set) {
  return set.has(user?.role);
}

function businessDays(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  let n = 0;
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 5 && day !== 6) n += 1;
  }
  return n;
}

function addBusinessDays(date, n) {
  const d = new Date(date);
  let left = n;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 5 && d.getDay() !== 6) left -= 1;
  }
  return d;
}

function nextRef(db, dept) {
  const year = new Date().getFullYear();
  const key = `${dept}-${year}`;
  db.seq[key] = (db.seq[key] || 0) + 1;
  return `${dept}-${year}-${String(db.seq[key]).padStart(4, '0')}`;
}

function log(dossier, user, action, commentaire) {
  dossier.historique.push({
    action,
    par: user.nom,
    role: user.role,
    date: new Date().toISOString(),
    commentaire: commentaire || '',
  });
}

function createDossier(db, body, user) {
  const type = body.type;
  if (!ROUTE[type]) {
    const err = new Error('Type requis : analyse, veille ou patrimonial');
    err.status = 400;
    throw err;
  }
  if (!body.objet || !String(body.objet).trim()) {
    const err = new Error("L'objet est obligatoire");
    err.status = 400;
    throw err;
  }
  const canal = CANAUX.includes(body.canal) ? body.canal : 'activite';
  const departement = ROUTE[type];
  const dossier = {
    id: id(),
    reference: nextRef(db, departement),
    type,
    departement,
    canal,
    urgence: canal === 'dg' ? 'critique' : (body.urgence || 'normale'),
    prioritaire: canal === 'dg',
    activite: body.activite || '',
    objet: String(body.objet).trim(),
    textesApplicables: body.textesApplicables || '',
    delai: body.delai || null,
    documentRecu: body.documentRecu || '',
    actifId: body.actifId || null,
    analysteNom: '',
    statut: 'assigne',
    corps: '',
    citations: [],
    satisfaction: null,
    signature: null,
    dateSaisie: new Date().toISOString(),
    dateLivraison: null,
    dateArchive: null,
    demandeur: { id: user.id, nom: user.nom, role: user.role },
    historique: [],
  };
  log(dossier, user, 'saisie', `Routage automatique vers ${departement} (canal ${canal})`);
  db.dossiers.unshift(dossier);
  return dossier;
}

function patchDossier(db, dossierId, body, user) {
  const d = db.dossiers.find((x) => x.id === dossierId);
  if (!d) return null;
  if (!['assigne', 'en_cours', 'rejete_chef', 'rejete_directeur'].includes(d.statut)) {
    const err = new Error('Le dossier n\'est plus modifiable à ce stade');
    err.status = 400;
    throw err;
  }
  if (!hasRole(user, REDACTEUR) && user.id !== d.demandeur?.id) {
    const err = new Error('Rôle insuffisant pour modifier le dossier');
    err.status = 403;
    throw err;
  }
  for (const key of ['objet', 'textesApplicables', 'activite', 'delai', 'corps', 'documentRecu', 'urgence', 'citations']) {
    if (body[key] !== undefined) d[key] = body[key];
  }
  log(d, user, 'modification', '');
  return d;
}

function assigner(db, dossierId, body, user) {
  const d = db.dossiers.find((x) => x.id === dossierId);
  if (!d) return null;
  if (!hasRole(user, CHEF) && !hasRole(user, DIRECTEUR)) {
    const err = new Error('Seul le chef de département ou le directeur peut assigner');
    err.status = 403;
    throw err;
  }
  d.analysteNom = body.analysteNom || user.nom;
  d.statut = 'en_cours';
  log(d, user, 'assignation', `Analyste : ${d.analysteNom}`);
  return d;
}

const TRANSITIONS = {
  soumis_chef: { from: ['en_cours', 'rejete_chef', 'rejete_directeur'], roles: REDACTEUR, label: 'Soumis au chef de département' },
  valide_chef: { from: ['soumis_chef'], roles: CHEF, label: 'Validé par le chef de département' },
  rejete_chef: { from: ['soumis_chef'], roles: CHEF, label: 'Renvoyé par le chef de département' },
  soumis_directeur: { from: ['valide_chef'], roles: CHEF, label: 'Soumis au directeur DER' },
  valide_directeur: { from: ['soumis_directeur'], roles: DIRECTEUR, label: 'Validé par le directeur DER' },
  rejete_directeur: { from: ['soumis_directeur'], roles: DIRECTEUR, label: 'Renvoyé par le directeur DER' },
  livre: { from: ['valide_directeur'], roles: new Set([...CHEF, ...DIRECTEUR]), label: 'Livré au demandeur' },
  archive: { from: ['livre'], roles: new Set([...CHEF, ...DIRECTEUR]), label: 'Archivé dans la mémoire interne' },
};

function transition(db, dossierId, action, body, user) {
  const d = db.dossiers.find((x) => x.id === dossierId);
  if (!d) return null;
  const rule = TRANSITIONS[action];
  if (!rule) {
    const err = new Error('Transition inconnue');
    err.status = 400;
    throw err;
  }
  if (!rule.from.includes(d.statut)) {
    const err = new Error(`Transition impossible depuis le statut ${d.statut}`);
    err.status = 400;
    throw err;
  }
  if (!rule.roles.has(user.role)) {
    const err = new Error('Rôle insuffisant pour cette validation');
    err.status = 403;
    throw err;
  }
  d.statut = action === 'livre' ? 'livre' : action === 'archive' ? 'archive' : action;
  if (action === 'livre') d.dateLivraison = new Date().toISOString();
  if (action === 'archive') d.dateArchive = new Date().toISOString();
  log(d, user, action, body?.commentaire || rule.label);
  return d;
}

function signer(db, dossierId, user) {
  const d = db.dossiers.find((x) => x.id === dossierId);
  if (!d) return null;
  if (!['valide_directeur', 'livre', 'archive'].includes(d.statut)) {
    const err = new Error('Le sceau interne est apposé après validation du directeur DER');
    err.status = 400;
    throw err;
  }
  if (!hasRole(user, DIRECTEUR) && !hasRole(user, CHEF)) {
    const err = new Error('Seul le chef ou le directeur peut apposer le sceau');
    err.status = 403;
    throw err;
  }
  const crypto = require('crypto');
  const empreinte = crypto.createHash('sha256').update(`${d.reference}\n${d.corps || ''}\n${d.objet}`).digest('hex');
  d.signature = {
    signataire: user.nom,
    role: user.role,
    date: new Date().toISOString(),
    empreinte,
    tampon: 'DCJ — Direction Études et Réglementation',
    nature: 'Sceau interne (empreinte du livrable). Ce n\'est pas un certificat qualifié.',
  };
  log(d, user, 'sceau', d.signature.empreinte.slice(0, 16));
  return d;
}

function satisfaction(db, dossierId, body, user) {
  const d = db.dossiers.find((x) => x.id === dossierId);
  if (!d) return null;
  if (!['livre', 'archive'].includes(d.statut)) {
    const err = new Error('La satisfaction se saisit à réception du livrable');
    err.status = 400;
    throw err;
  }
  const note = Number(body.note);
  if (!(note >= 1 && note <= 5)) {
    const err = new Error('La note est un entier de 1 à 5');
    err.status = 400;
    throw err;
  }
  d.satisfaction = { note, commentaire: body.commentaire || '', par: user.nom, date: new Date().toISOString() };
  log(d, user, 'satisfaction', String(note));
  return d;
}

function filterDossiers(db, q) {
  return db.dossiers.filter((d) => {
    if (q.type && d.type !== q.type) return false;
    if (q.departement && d.departement !== q.departement) return false;
    if (q.statut && d.statut !== q.statut) return false;
    if (q.activite && d.activite !== q.activite) return false;
    if (q.theme && !`${d.objet} ${d.corps}`.toLowerCase().includes(String(q.theme).toLowerCase())) return false;
    if (q.texte && !`${d.textesApplicables} ${d.corps}`.toLowerCase().includes(String(q.texte).toLowerCase())) return false;
    if (q.dateFrom && d.dateSaisie < q.dateFrom) return false;
    if (q.dateTo && d.dateSaisie > `${q.dateTo}T23:59:59`) return false;
    if (q.search) {
      const blob = `${d.reference} ${d.objet} ${d.activite} ${d.corps}`.toLowerCase();
      if (!blob.includes(String(q.search).toLowerCase())) return false;
    }
    return true;
  });
}

function createFiche(db, body, user) {
  if (!body.titre || !body.texte) {
    const err = new Error('Titre et texte sont obligatoires');
    err.status = 400;
    throw err;
  }
  const source = db.sources.find((s) => s.id === body.sourceId) || db.sources[0];
  const imp = corpus.impact(body.texte);
  const lies = corpus.search(db, body.texte, 3).filter((d) => d.kind === 'fiche').map((d) => ({ id: d.id, ref: d.ref, title: d.title }));
  const fiche = {
    id: id(),
    reference: nextRef(db, 'DER-RVJ'),
    sourceId: source?.id || 'jora',
    sourceNom: source?.nom || '',
    titre: body.titre,
    texte: body.texte,
    resume: corpus.resume(body.texte),
    impact: imp,
    textesLies: lies,
    statutTexte: body.statutTexte || 'en_vigueur',
    createdAt: new Date().toISOString(),
    auteur: user.nom,
  };
  db.fiches.unshift(fiche);
  notifyWatch(db, fiche);
  return fiche;
}

function notifyWatch(db, fiche) {
  for (const profil of db.profils) {
    const themeHit = (profil.themes || []).some((t) => `${fiche.titre} ${fiche.texte}`.toLowerCase().includes(String(t).toLowerCase()));
    const actHit = (profil.activites || []).some((a) => (fiche.impact || []).some((i) => i.activite === a));
    if (!themeHit && !actHit) continue;
    db.alertes.unshift({
      id: id(),
      kind: 'veille',
      ficheId: fiche.id,
      message: `Nouveau texte pour le profil ${profil.nom} : ${fiche.titre}`,
      destinataire: profil.nom,
      createdAt: new Date().toISOString(),
      lu: false,
    });
  }
}

function commenter(db, body, user) {
  if (!body.ficheId || !body.corps) {
    const err = new Error('ficheId et corps sont obligatoires');
    err.status = 400;
    throw err;
  }
  let doc = db.commentaires.find((c) => c.ficheId === body.ficheId);
  const version = { n: 1, corps: body.corps, auteur: user.nom, date: new Date().toISOString() };
  if (!doc) {
    doc = { id: id(), ficheId: body.ficheId, versions: [version] };
    db.commentaires.unshift(doc);
  } else {
    version.n = doc.versions.length + 1;
    doc.versions.push(version);
  }
  return doc;
}

function daysUntil(date) {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(date);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

function ensureEcheances(db) {
  const now = new Date().toISOString();
  for (const actif of db.actifs) {
    if (!actif.echeance) continue;
    const left = daysUntil(actif.echeance);
    for (const window of [90, 30]) {
      if (left < 0 || left > window) continue;
      const kind = `echeance_${window}`;
      const exists = db.alertes.some((a) => a.kind === kind && a.actifId === actif.id);
      if (exists) continue;
      db.alertes.unshift({
        id: id(),
        kind,
        actifId: actif.id,
        message: `${actif.reference} — ${actif.intitule} : échéance dans ${left} jour(s) (seuil ${window} j)`,
        echeance: actif.echeance,
        createdAt: now,
        lu: false,
      });
    }
  }
}

function createActif(db, body) {
  if (!body.intitule) {
    const err = new Error("L'intitulé de l'actif est obligatoire");
    err.status = 400;
    throw err;
  }
  if (body.type && !TYPES_ACTIF.includes(body.type)) {
    const err = new Error('Type d\'actif invalide');
    err.status = 400;
    throw err;
  }
  const actif = {
    id: id(),
    reference: nextRef(db, 'ACT'),
    intitule: body.intitule,
    type: body.type || 'foncier',
    activite: body.activite || '',
    statutJuridique: STATUTS_ACTIF.includes(body.statutJuridique) ? body.statutJuridique : 'actif',
    documents: Array.isArray(body.documents) ? body.documents : [],
    textesIds: Array.isArray(body.textesIds) ? body.textesIds : [],
    echeance: body.echeance || null,
    createdAt: new Date().toISOString(),
  };
  db.actifs.unshift(actif);
  ensureEcheances(db);
  return actif;
}

function createOperation(db, body, user) {
  if (!body.actifId || !body.nature) {
    const err = new Error('actifId et nature (acquisition ou cession) sont obligatoires');
    err.status = 400;
    throw err;
  }
  const op = {
    id: id(),
    actifId: body.actifId,
    nature: body.nature,
    objet: body.objet || '',
    statut: 'soumis',
    demandeur: user.nom,
    historique: [{ action: 'soumis', par: user.nom, date: new Date().toISOString() }],
  };
  db.operations.unshift(op);
  return op;
}

function deciderOperation(db, opId, decision, user) {
  const op = db.operations.find((o) => o.id === opId);
  if (!op) return null;
  if (!hasRole(user, DIRECTEUR) && !hasRole(user, CHEF)) {
    const err = new Error('Approbation réservée au chef ou au directeur');
    err.status = 403;
    throw err;
  }
  if (!['approuve', 'rejete'].includes(decision)) {
    const err = new Error('Décision : approuve ou rejete');
    err.status = 400;
    throw err;
  }
  op.statut = decision;
  op.historique.push({ action: decision, par: user.nom, date: new Date().toISOString() });
  return op;
}

function onTime(d) {
  if (!d.dateLivraison) return false;
  const limit = d.delai ? new Date(d.delai) : addBusinessDays(d.dateSaisie, 5);
  return new Date(d.dateLivraison) <= limit;
}

function kpis(db) {
  ensureEcheances(db);
  const livres = db.dossiers.filter((d) => d.dateLivraison);
  const delais = livres.map((d) => businessDays(d.dateSaisie, d.dateLivraison));
  const moyen = delais.length ? Math.round((delais.reduce((a, b) => a + b, 0) / delais.length) * 10) / 10 : null;
  const aTemps = livres.filter(onTime).length;
  const taux = livres.length ? Math.round((aTemps / livres.length) * 1000) / 10 : null;
  const month = new Date().toISOString().slice(0, 7);
  const textesMois = db.fiches.filter((f) => (f.createdAt || '').startsWith(month)).length;
  const proches = db.actifs.filter((a) => a.echeance && daysUntil(a.echeance) >= 0 && daysUntil(a.echeance) <= 90);
  const nonAlertes = proches.filter((a) => !db.alertes.some((al) => al.actifId === a.id && String(al.kind).startsWith('echeance')));
  const notes = db.dossiers.map((d) => d.satisfaction?.note).filter((n) => typeof n === 'number');
  const satisfactionMoy = notes.length ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10 : null;
  return {
    delaiMoyenJoursOuvres: { valeur: moyen, cible: '< 5', atteint: moyen !== null && moyen < 5 },
    tauxRespectDelais: { valeur: taux, cible: '> 90%', atteint: taux !== null && taux > 90 },
    textesTraitesMois: { valeur: textesMois, mois: month, cible: 'Exhaustif' },
    actifsEcheance90j: { valeur: proches.length, nonAlertes: nonAlertes.length, cible: '0 non alerté' },
    satisfaction: { valeur: satisfactionMoy, cible: '> 4/5', reponses: notes.length, atteint: satisfactionMoy !== null && satisfactionMoy > 4 },
  };
}

function rapportMensuel(db, mois) {
  const m = mois || new Date().toISOString().slice(0, 7);
  const dossiers = db.dossiers.filter((d) => (d.dateLivraison || d.dateSaisie || '').startsWith(m));
  const fiches = db.fiches.filter((f) => (f.createdAt || '').startsWith(m));
  return {
    mois: m,
    analyses: dossiers.map((d) => ({
      reference: d.reference,
      type: d.type,
      objet: d.objet,
      activite: d.activite,
      statut: d.statut,
      delaiJoursOuvres: d.dateLivraison ? businessDays(d.dateSaisie, d.dateLivraison) : null,
    })),
    veille: fiches.map((f) => ({
      reference: f.reference,
      titre: f.titre,
      resume: f.resume,
      impact: f.impact,
    })),
    patrimoine: {
      actifs: db.actifs.length,
      echeances: db.actifs.filter((a) => a.echeance).map((a) => ({ reference: a.reference, intitule: a.intitule, echeance: a.echeance, jours: daysUntil(a.echeance) })),
      alertes: db.alertes.filter((a) => String(a.kind).startsWith('echeance')).length,
    },
    indicateurs: kpis(db),
  };
}

async function collecter(db) {
  const source = db.sources.find((s) => s.id === 'jora');
  const entry = { id: id(), sourceId: 'jora', date: new Date().toISOString(), trouves: 0, message: '' };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(source.url, { signal: ctrl.signal, headers: { 'User-Agent': 'LEXORA-DER-veille' } });
    clearTimeout(timer);
    const html = await res.text();
    const titles = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]{12,180})</gi)]
      .map((m) => ({ href: m[1], titre: m[2].replace(/\s+/g, ' ').trim() }))
      .filter((m) => /décret|arrêté|loi|ordonnance|journal/i.test(m.titre))
      .slice(0, 15);
    entry.trouves = titles.length;
    entry.message = titles.length ? `${titles.length} intitulé(s) repérés sur le JORA` : 'Page atteinte, aucun intitulé nouveau reconnu';
    entry.http = res.status;
    for (const t of titles) {
      const deja = db.fiches.some((f) => f.titre === t.titre);
      if (deja) continue;
      createFiche(db, {
        sourceId: 'jora',
        titre: t.titre,
        texte: `Intitulé relevé sur ${source.url} (${t.href}). Le texte intégral doit être versé par DER-RVJ pour analyse d'impact complète. ${t.titre}`,
        statutTexte: 'en_vigueur',
      }, { nom: 'Collecte JORA', role: 'agent', id: 'veille' });
    }
  } catch (err) {
    entry.message = `Collecte interrompue : ${err.message}. Saisir la fiche manuellement.`;
    entry.http = 0;
  }
  db.journal.unshift(entry);
  return entry;
}

module.exports = {
  ROUTE,
  CANAUX,
  ACTIVITES,
  TYPES_ACTIF,
  STATUTS_ACTIF,
  createDossier,
  patchDossier,
  assigner,
  transition,
  signer,
  satisfaction,
  filterDossiers,
  createFiche,
  commenter,
  ensureEcheances,
  createActif,
  createOperation,
  deciderOperation,
  kpis,
  rapportMensuel,
  collecter,
  daysUntil,
};
