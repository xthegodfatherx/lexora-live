const STOP = new Set('les des une que qui dans pour par sur avec sans est son ses aux cet cette ces du au ou et ou en de la le un d l a au aux ne pas plus tout tous comme entre sous vers par'.split(' '));

const IMPACTS = [
  { activite: 'Amont', mots: ['hydrocarbure', 'exploration', 'forage', 'puits', 'gisement', 'perimetre', 'amont'] },
  { activite: 'Aval', mots: ['raffinage', 'raffinerie', 'carburant', 'aval', 'distribution', 'stockage'] },
  { activite: 'TRC', mots: ['canalisation', 'pipeline', 'oleoduc', 'gazoduc', 'transport'] },
  { activite: 'LNG', mots: ['gnl', 'lng', 'liquefaction', 'methanier', 'gaz naturel liquefie'] },
  { activite: 'Commerce', mots: ['commercialisation', 'exportation', 'importation', 'prix', 'vente'] },
  { activite: 'Personnel', mots: ['travail', 'salarie', 'syndicat', 'remuneration', 'licenciement'] },
  { activite: 'Marchés', mots: ['marche public', 'appel d offres', 'soumission', 'adjudication'] },
];

const GLOSSARY = [
  ['avis juridique', 'رأي قانوني'],
  ['rapport d\'analyse', 'تقرير تحليل'],
  ['texte applicable', 'النص الواجب التطبيق'],
  ['hydrocarbures', 'المحروقات'],
  ['marché public', 'صفقة عمومية'],
  ['code du travail', 'قانون العمل'],
  ['code civil', 'القانون المدني'],
  ['journal officiel', 'الجريدة الرسمية'],
  ['direction générale', 'الإدارة العامة'],
  ['sonatrach', 'سوناطراك'],
  ['concession', 'امتياز'],
  ['droit réel', 'حق عيني'],
  ['foncier', 'عقاري'],
  ['participation', 'مساهمة'],
  ['échéance', 'أجل'],
  ['renouvellement', 'تجديد'],
  ['en vigueur', 'ساري المفعول'],
  ['abrogé', 'ملغى'],
  ['modifié', 'معدّل'],
  ['contrat', 'عقد'],
  ['obligation', 'التزام'],
  ['responsabilité', 'مسؤولية'],
  ['contentieux', 'نزاع'],
  ['conformité', 'مطابقة'],
  ['patrimoine', 'ذمة مالية'],
  ['actif', 'أصل'],
  ['autorisation', 'ترخيص'],
  ['décret', 'مرسوم'],
  ['loi', 'قانون'],
  ['ordonnance', 'أمر'],
  ['circulaire', 'منشور'],
  ['investissement', 'استثمار'],
  ['partenariat', 'شراكة'],
  ['personnel', 'المستخدمون'],
  ['litige', 'خصومة'],
  ['signature', 'توقيع'],
  ['validation', 'تأشير'],
  ['archivage', 'حفظ'],
  ['veille juridique', 'الرصد القانوني'],
  ['analyse juridique', 'تحليل قانوني'],
];

function fold(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, ' ');
}

function tokens(text) {
  return fold(text).split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t));
}

function docsFrom(db) {
  const docs = [];
  for (const t of db.templates || []) {
    docs.push({ id: t.id, kind: 'modele', ref: t.code, title: t.nom, body: t.corps });
  }
  for (const f of db.fiches || []) {
    docs.push({
      id: f.id,
      kind: 'fiche',
      ref: f.reference,
      title: f.titre,
      body: `${f.texte || ''}\n${f.resume || ''}\n${(f.impact || []).map((i) => i.activite).join(' ')}`,
    });
  }
  for (const c of db.commentaires || []) {
    const last = c.versions?.[c.versions.length - 1];
    docs.push({ id: c.id, kind: 'commentaire', ref: c.ficheId, title: `Commentaire ${c.ficheId}`, body: last?.corps || '' });
  }
  for (const d of db.dossiers || []) {
    if (!['valide_directeur', 'livre', 'archive'].includes(d.statut)) continue;
    docs.push({
      id: d.id,
      kind: 'dossier',
      ref: d.reference,
      title: d.objet,
      body: `${d.objet}\n${d.textesApplicables || ''}\n${d.corps || ''}`,
    });
  }
  for (const a of db.actifs || []) {
    docs.push({
      id: a.id,
      kind: 'actif',
      ref: a.reference,
      title: a.intitule,
      body: `${a.type} ${a.activite} ${a.statutJuridique} ${(a.documents || []).join(' ')}`,
    });
  }
  return docs.filter((d) => d.body && d.body.trim());
}

function search(db, query, limit = 5) {
  const q = tokens(query);
  if (!q.length) return [];
  const docs = docsFrom(db).map((d) => ({ ...d, toks: tokens(`${d.title} ${d.body}`) }));
  const df = new Map();
  for (const d of docs) {
    for (const t of new Set(d.toks)) df.set(t, (df.get(t) || 0) + 1);
  }
  const n = docs.length || 1;
  const weight = (toks) => {
    const tf = new Map();
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    let score = 0;
    for (const t of q) {
      const f = tf.get(t) || 0;
      if (!f) continue;
      const idf = Math.log((n + 1) / ((df.get(t) || 0) + 1)) + 1;
      score += (f / toks.length) * idf;
    }
    return score;
  };
  return docs
    .map((d) => ({ ...d, score: weight(d.toks) }))
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ toks, ...d }) => ({
      ...d,
      extrait: excerpt(d.body, q),
    }));
}

function excerpt(body, q) {
  const clean = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const low = fold(clean);
  let at = -1;
  for (const t of q) {
    at = low.indexOf(t);
    if (at >= 0) break;
  }
  if (at < 0) return clean.slice(0, 280);
  const start = Math.max(0, at - 80);
  return `${start ? '…' : ''}${clean.slice(start, start + 320)}${start + 320 < clean.length ? '…' : ''}`;
}

function resume(texte) {
  const clean = (texte || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const ranked = sentences.map((s) => ({
    s,
    n: IMPACTS.reduce((acc, g) => acc + g.mots.filter((m) => fold(s).includes(fold(m))).length, 0),
  }));
  const picked = [];
  if (sentences[0]) picked.push(sentences[0]);
  for (const row of ranked.filter((r) => r.n > 0).slice(0, 3)) {
    if (!picked.includes(row.s)) picked.push(row.s);
  }
  if (picked.length < 2 && sentences[1]) picked.push(sentences[1]);
  return picked.join(' ').slice(0, 1200);
}

function impact(texte) {
  const low = fold(texte);
  return IMPACTS
    .map((g) => {
      const hits = g.mots.filter((m) => low.includes(fold(m)));
      return hits.length ? { activite: g.activite, raison: `Termes relevés : ${hits.join(', ')}`, termes: hits } : null;
    })
    .filter(Boolean);
}

function applicability(texte, contrat) {
  const hits = impact(`${texte || ''} ${contrat || ''}`);
  const shared = impact(texte).filter((a) => fold(contrat || '').includes(fold(a.activite)) || a.termes.some((t) => fold(contrat || '').includes(fold(t))));
  if (!texte || !contrat) {
    return { applicable: null, message: 'Indiquez le texte et le contrat à comparer.', impacts: hits };
  }
  if (shared.length) {
    return {
      applicable: true,
      message: `Le corpus interne relève un recoupement sur : ${shared.map((s) => s.activite).join(', ')}. Ceci est une aide à la lecture, à faire valider par le juriste.`,
      impacts: shared,
    };
  }
  return {
    applicable: false,
    message: "Aucun terme commun déterminant n'a été trouvé entre ce texte et ce contrat dans le corpus interne. Cela ne prouve pas l'inapplicabilité.",
    impacts: hits,
  };
}

function question(db, q) {
  const found = search(db, q, 4);
  if (!found.length) {
    return {
      reponse: "Le corpus interne SONATRACH ne contient pas de passage permettant de répondre. Aucune source externe n'a été consultée.",
      sources: [],
    };
  }
  const lignes = found.map((d) => `• ${d.ref || d.kind} — ${d.title} : ${d.extrait}`);
  return {
    reponse: `Réponse établie uniquement à partir du corpus interne :\n${lignes.join('\n')}`,
    sources: found.map(({ id, kind, ref, title, extrait }) => ({ id, kind, ref, title, extrait })),
  };
}

function rediger(db, dossier, template) {
  const trouvailles = search(db, `${dossier.objet || ''} ${dossier.textesApplicables || ''}`, 4);
  const citations = trouvailles.length
    ? trouvailles.map((t) => `- ${t.ref || t.kind} — ${t.title} : ${t.extrait}`).join('\n')
    : '- Aucun précédent interne trouvé pour cet objet.';
  const map = {
    reference: dossier.reference || '',
    date: new Date().toLocaleDateString('fr-DZ'),
    activite: dossier.activite || '',
    objet: dossier.objet || '',
    textes: dossier.textesApplicables || '[à compléter]',
    source: dossier.sourceNom || '',
    citations,
  };
  let corps = template?.corps || TEMP_FALLBACK;
  corps = corps.replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? '');
  return { corps, citations: trouvailles.map(({ id, kind, ref, title, extrait }) => ({ id, kind, ref, title, extrait })) };
}

const TEMP_FALLBACK = `Objet : {{objet}}\nActivité : {{activite}}\nTextes : {{textes}}\n\n{{citations}}`;

function traduire(texte, vers) {
  const target = vers === 'fr' ? 'fr' : 'ar';
  let out = texte || '';
  const pairs = GLOSSARY
    .map(([fr, ar]) => (target === 'ar' ? [fr, ar] : [ar, fr]))
    .sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of pairs) {
    const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, to);
  }
  return {
    texte: out,
    vers: target,
    methode: 'glossaire juridique interne',
    note: "Traduction par glossaire embarqué. Les phrases hors glossaire restent dans la langue source. Aucun service externe n'est appelé.",
  };
}

module.exports = { search, resume, impact, applicability, question, rediger, traduire, tokens };
