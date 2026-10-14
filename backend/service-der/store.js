const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data', 'store.json');

const SOURCES = [
  { id: 'jora', nom: 'Journal Officiel (JORA)', type: 'Textes nationaux', pertinence: 'Tous les textes impactant les hydrocarbures', url: 'https://www.joradp.dz/HAR/Index.htm', mode: 'collecte' },
  { id: 'hydro', nom: 'Loi sur les hydrocarbures', type: 'Sectoriel', pertinence: 'Impact direct sur toutes les Activités', url: '', mode: 'reference' },
  { id: 'codes', nom: 'CPCA, Code civil, Code du travail', type: 'Général', pertinence: 'Contrats, litiges, personnel', url: '', mode: 'reference' },
  { id: 'marches', nom: 'Textes relatifs aux marchés publics', type: 'Marchés', pertinence: "Appels d'offres et contrats", url: '', mode: 'reference' },
  { id: 'bit', nom: 'Conventions bilatérales, BIT', type: 'International', pertinence: 'Partenariats et investissements', url: '', mode: 'reference' },
  { id: 'circulaires', nom: 'Circulaires et instructions', type: 'Interne', pertinence: 'Procédures SONATRACH', url: '', mode: 'reference' },
];

const TEMPLATES = [
  {
    id: 'tpl-avis',
    code: 'AVIS',
    nom: "Avis juridique SONATRACH",
    departement: 'DER-AJ',
    corps: `AVIS JURIDIQUE
Référence : {{reference}}
Date : {{date}}
Activité demanderesse : {{activite}}
Objet : {{objet}}

1. Saisine
{{objet}}

2. Textes applicables
{{textes}}

3. Analyse
[Exposé des faits, qualification juridique, application des textes cités.]

4. Conclusion
[Avis motivé. Position recommandée à la Direction Générale ou à l'Activité.]

Citations du corpus interne
{{citations}}`,
  },
  {
    id: 'tpl-rapport',
    code: 'RAPPORT',
    nom: "Rapport d'analyse juridique",
    departement: 'DER-AJ',
    corps: `RAPPORT D'ANALYSE JURIDIQUE
Référence : {{reference}}
Destinataire : Direction Générale
Activité : {{activite}}
Objet : {{objet}}

I. Contexte
II. Problème juridique
III. Textes et précédents internes
{{textes}}
{{citations}}
IV. Recommandations
V. Suites à donner`,
  },
  {
    id: 'tpl-fiche',
    code: 'FICHE',
    nom: 'Fiche de texte réglementaire',
    departement: 'DER-RVJ',
    corps: `FICHE DE TEXTE
Source : {{source}}
Objet : {{objet}}

Résumé
[Essentiel du texte.]

Impact SONATRACH
[Activités concernées et obligations nouvelles.]

Textes liés
{{textes}}`,
  },
  {
    id: 'tpl-cr',
    code: 'CR-PATRIMOINE',
    nom: 'Compte rendu de suivi patrimonial',
    departement: 'DER-SJOP',
    corps: `COMPTE RENDU DE SUIVI PATRIMONIAL
Référence : {{reference}}
Activité de rattachement : {{activite}}
Objet : {{objet}}

État juridique de l'actif
Échéances
Décision proposée`,
  },
];

function id() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function empty() {
  return {
    dossiers: [],
    templates: TEMPLATES.map((t) => ({ ...t, createdAt: new Date().toISOString() })),
    fiches: [],
    commentaires: [],
    actifs: [],
    operations: [],
    alertes: [],
    profils: [],
    sources: SOURCES,
    journal: [],
    seq: {},
  };
}

function load() {
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const db = JSON.parse(raw);
    db.sources = SOURCES.map((s) => ({ ...s, ...(db.sources || []).find((x) => x.id === s.id) }));
    if (!db.templates?.length) db.templates = empty().templates;
    return db;
  } catch {
    const db = empty();
    save(db);
    return db;
  }
}

function save(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

function update(mutator) {
  const db = load();
  const result = mutator(db);
  save(db);
  return result;
}

module.exports = { load, save, update, id, SOURCES, TEMPLATES };
