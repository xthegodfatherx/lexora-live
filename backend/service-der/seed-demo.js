const { update } = require('./store');
const domain = require('./domain');

const ADMIN = { id: '2', role: 'admin', nom: 'Root Admin' };
const CHEF = { id: '4', role: 'responsable_departement', nom: 'Yacine Haddad' };
const DIRECTEUR = { id: '5', role: 'directeur_direction', nom: 'Sara Meziane' };

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  return daysFromNow(-n);
}

function run() {
  return update((db) => {
    db.dossiers = [];
    db.fiches = [];
    db.commentaires = [];
    db.actifs = [];
    db.operations = [];
    db.alertes = [];
    db.profils = [];
    db.journal = [];
    db.seq = {};

    const analyse = domain.createDossier(db, {
      type: 'analyse',
      canal: 'dg',
      activite: 'TRC',
      objet: 'Régime fiscal des contrats d\'exploration pétrolière',
      textesApplicables: 'Loi sur les hydrocarbures, Code des impôts directs',
      delai: daysFromNow(5),
    }, ADMIN);
    domain.assigner(db, analyse.id, { analysteNom: 'Amina Benali' }, CHEF);
    analyse.corps = 'Le régime fiscal applicable combine la redevance superficiaire et la taxe sur le revenu pétrolier. Position recommandée : confirmer l\'assiette avant transmission à la Direction Générale.';
    analyse.dateSaisie = `${daysAgo(8)}T08:00:00.000Z`;
    for (const action of ['soumis_chef', 'valide_chef', 'soumis_directeur', 'valide_directeur', 'livre']) {
      const actor = action === 'valide_directeur' || action === 'livre' ? DIRECTEUR : CHEF;
      domain.transition(db, analyse.id, action, {}, actor);
    }
    analyse.dateLivraison = `${daysAgo(2)}T16:00:00.000Z`;
    domain.signer(db, analyse.id, DIRECTEUR);
    domain.satisfaction(db, analyse.id, { note: 5, commentaire: 'Avis clair et dans le délai.' }, ADMIN);

    const veille = domain.createDossier(db, {
      type: 'veille',
      canal: 'direction_contrats',
      activite: 'Commerce',
      urgence: 'haute',
      objet: 'Avis sur le projet de décret des marchés publics',
      textesApplicables: 'Code des marchés publics',
      documentRecu: 'Projet de décret transmis par la Direction Contrats, articles 12 à 18 sur les délais de recours.',
      delai: daysFromNow(3),
    }, CHEF);
    domain.assigner(db, veille.id, { analysteNom: 'Nadia Cherif' }, CHEF);
    domain.transition(db, veille.id, 'soumis_chef', { commentaire: 'Prêt pour relecture du chef' }, CHEF);

    const patrimoine = domain.createDossier(db, {
      type: 'patrimonial',
      canal: 'activite',
      activite: 'Amont',
      objet: 'Renouvellement de la concession de Hassi R\'Mel',
      textesApplicables: 'Loi sur les hydrocarbures — titres miniers',
      delai: daysFromNow(12),
    }, ADMIN);
    domain.assigner(db, patrimoine.id, { analysteNom: 'Karim Mansouri' }, CHEF);

    const archive = domain.createDossier(db, {
      type: 'analyse',
      canal: 'direction_conformite',
      activite: 'Aval',
      objet: 'Conformité du stockage de carburants aux normes environnementales',
      textesApplicables: 'Décret environnement, loi hydrocarbures',
      delai: daysAgo(1),
    }, ADMIN);
    domain.assigner(db, archive.id, { analysteNom: 'Amina Benali' }, CHEF);
    archive.corps = 'Le dépôt de carburants doit disposer d\'une autorisation environnementale à jour. Écart constaté sur le plan de prévention.';
    for (const action of ['soumis_chef', 'valide_chef', 'soumis_directeur', 'valide_directeur', 'livre', 'archive']) {
      const actor = action === 'valide_directeur' || action === 'livre' || action === 'archive' ? DIRECTEUR : CHEF;
      domain.transition(db, archive.id, action, {}, actor);
    }
    domain.satisfaction(db, archive.id, { note: 4, commentaire: 'Utile, délai un peu long.' }, ADMIN);

    const ficheHydro = domain.createFiche(db, {
      sourceId: 'hydro',
      titre: 'Loi sur les hydrocarbures — titres et transport',
      statutTexte: 'en_vigueur',
      texte: 'La loi sur les hydrocarbures encadre l\'exploration, le transport par canalisation et le renouvellement des concessions. Elle vise l\'amont, le gaz naturel liquéfié et les obligations de remise en état.',
    }, CHEF);
    const ficheTravail = domain.createFiche(db, {
      sourceId: 'codes',
      titre: 'Code du travail — dispositions applicables au personnel',
      statutTexte: 'modifie',
      texte: 'Le code du travail fixe la rémunération, les conditions de licenciement et le rôle du syndicat pour le personnel de SONATRACH.',
    }, CHEF);
    domain.createFiche(db, {
      sourceId: 'marches',
      titre: 'Marchés publics — délais de recours des soumissionnaires',
      statutTexte: 'en_vigueur',
      texte: 'Les textes des marchés publics organisent l\'appel d\'offres, l\'adjudication et le délai de recours d\'un soumissionnaire évincé.',
    }, CHEF);

    domain.commenter(db, { ficheId: ficheHydro.id, corps: 'Version 1 — le transport par canalisation reste soumis à autorisation préalable.' }, CHEF);
    domain.commenter(db, { ficheId: ficheHydro.id, corps: 'Version 2 — ajouter l\'impact sur les concessions arrivant à échéance sous 90 jours.' }, DIRECTEUR);

    const concession = domain.createActif(db, {
      intitule: 'Concession Hassi R\'Mel',
      type: 'concession',
      activite: 'Amont',
      statutJuridique: 'actif',
      echeance: daysFromNow(18),
      documents: ['Titre minier HRM-2014', 'Arrêté d\'attribution'],
      textesIds: [ficheHydro.id],
    });
    domain.createActif(db, {
      intitule: 'Assiette foncière — base de Laghouat',
      type: 'foncier',
      activite: 'TRC',
      statutJuridique: 'en_regularisation',
      echeance: daysFromNow(60),
      documents: ['Acte notarié', 'Permis de construire'],
      textesIds: [ficheHydro.id],
    });
    domain.createActif(db, {
      intitule: 'Participation NAFTAL',
      type: 'participation',
      activite: 'Aval',
      statutJuridique: 'litigieux',
      echeance: daysFromNow(200),
      documents: ['Statuts', 'Registre de commerce'],
    });

    const cession = domain.createOperation(db, { actifId: concession.id, nature: 'cession', objet: 'Cession partielle du périmètre sud' }, CHEF);
    domain.deciderOperation(db, cession.id, 'approuve', DIRECTEUR);
    domain.createOperation(db, { actifId: concession.id, nature: 'acquisition', objet: 'Extension du périmètre nord' }, CHEF);

    db.profils.unshift({
      id: 'profil-trc',
      nom: 'Veille TRC',
      activites: ['TRC', 'Amont'],
      themes: ['hydrocarbures', 'canalisation'],
      createdAt: new Date().toISOString(),
    });

    domain.ensureEcheances(db);
    db.journal.unshift({
      id: 'journal-demo',
      sourceId: 'jora',
      date: new Date().toISOString(),
      trouves: 0,
      message: 'Jeu de démonstration local chargé. La collecte JORA reste disponible.',
      http: 0,
    });
    return { dossiers: db.dossiers.length, fiches: db.fiches.length, actifs: db.actifs.length, alertes: db.alertes.length };
  });
}

if (require.main === module) {
  const result = run();
  console.log('Démo DER chargée', result);
}

module.exports = { run };
