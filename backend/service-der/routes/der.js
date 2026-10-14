const express = require('express');
const { update, load } = require('../store');
const domain = require('../domain');
const corpus = require('../corpus');
const { dossierPdf, rapportPdf } = require('../pdf');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const fail = (res, err) => res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur interne' });

router.get('/structure', (req, res) => {
  res.json({
    success: true,
    data: {
      directionCentrale: { code: 'DCJ', nom: 'Direction Centrale Juridique' },
      direction: { code: 'DER', nom: 'Direction Études et Réglementation' },
      departements: [
        { code: 'DER-AJ', nom: 'Analyses Juridiques', mission: 'Analyser les problèmes juridiques et formuler des avis motivés' },
        { code: 'DER-RVJ', nom: 'Réglementation et Veille Juridique', mission: 'Surveiller les textes et produire des commentaires' },
        { code: 'DER-SJOP', nom: 'Suivi Juridique des Opérations Patrimoniales', mission: 'Suivre le patrimoine juridique de SONATRACH' },
      ],
      livrables: [
        "Rapports d'analyse juridique",
        'Avis juridiques',
        'Fiches de textes réglementaires',
        'Comptes rendus de suivi patrimonial',
      ],
    },
  });
});

router.get('/meta', (req, res) => {
  res.json({
    success: true,
    data: {
      canaux: domain.CANAUX,
      activites: domain.ACTIVITES,
      typesActif: domain.TYPES_ACTIF,
      statutsActif: domain.STATUTS_ACTIF,
      typesDossier: ['analyse', 'veille', 'patrimonial'],
    },
  });
});

router.get('/dashboard', (req, res) => {
  const data = update((db) => {
    const kpi = domain.kpis(db);
    return {
      kpi,
      compteurs: {
        dossiers: db.dossiers.length,
        enCours: db.dossiers.filter((d) => !['livre', 'archive'].includes(d.statut)).length,
        fiches: db.fiches.length,
        actifs: db.actifs.length,
        alertesOuvertes: db.alertes.filter((a) => !a.lu).length,
      },
    };
  });
  res.json({ success: true, data });
});

router.get('/rapports/mensuel', (req, res) => {
  const data = update((db) => domain.rapportMensuel(db, req.query.mois));
  res.json({ success: true, data });
});

router.get('/rapports/mensuel/pdf', async (req, res) => {
  try {
    const data = update((db) => domain.rapportMensuel(db, req.query.mois));
    const pdf = await rapportPdf(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="DER-rapport-${data.mois}.pdf"`);
    res.send(pdf);
  } catch (err) {
    fail(res, err);
  }
});

router.get('/dossiers', (req, res) => {
  const data = load();
  res.json({ success: true, data: domain.filterDossiers(data, req.query) });
});

router.post('/dossiers', (req, res) => {
  try {
    const data = update((db) => domain.createDossier(db, req.body || {}, req.user));
    res.status(201).json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/dossiers/:id', (req, res) => {
  const d = load().dossiers.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
  res.json({ success: true, data: d });
});

router.patch('/dossiers/:id', (req, res) => {
  try {
    const data = update((db) => domain.patchDossier(db, req.params.id, req.body || {}, req.user));
    if (!data) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/dossiers/:id/assigner', (req, res) => {
  try {
    const data = update((db) => domain.assigner(db, req.params.id, req.body || {}, req.user));
    if (!data) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/dossiers/:id/transition', (req, res) => {
  try {
    const data = update((db) => domain.transition(db, req.params.id, req.body?.action, req.body || {}, req.user));
    if (!data) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/dossiers/:id/assister', (req, res) => {
  try {
    const db = load();
    const d = db.dossiers.find((x) => x.id === req.params.id);
    if (!d) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    const template = db.templates.find((t) => t.id === req.body?.templateId) || db.templates.find((t) => t.departement === d.departement) || db.templates[0];
    const data = corpus.rediger(db, d, template);
    res.json({ success: true, data: { ...data, template: template?.nom, moteur: 'corpus interne' } });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/dossiers/:id/signer', (req, res) => {
  try {
    const data = update((db) => domain.signer(db, req.params.id, req.user));
    if (!data) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/dossiers/:id/pdf', async (req, res) => {
  try {
    const d = load().dossiers.find((x) => x.id === req.params.id);
    if (!d) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    const pdf = await dossierPdf(d);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${d.reference}.pdf"`);
    res.send(pdf);
  } catch (err) {
    fail(res, err);
  }
});

router.post('/dossiers/:id/satisfaction', (req, res) => {
  try {
    const data = update((db) => domain.satisfaction(db, req.params.id, req.body || {}, req.user));
    if (!data) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/modeles', (req, res) => {
  res.json({ success: true, data: load().templates });
});

router.post('/modeles', (req, res) => {
  try {
    if (!req.body?.nom || !req.body?.corps) return res.status(400).json({ success: false, message: 'Nom et corps obligatoires' });
    const { id } = require('../store');
    const data = update((db) => {
      const tpl = {
        id: id(),
        code: req.body.code || 'MODELE',
        nom: req.body.nom,
        departement: req.body.departement || 'DER-AJ',
        corps: req.body.corps,
        createdAt: new Date().toISOString(),
      };
      db.templates.unshift(tpl);
      return tpl;
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/veille/sources', (req, res) => {
  res.json({ success: true, data: load().sources });
});

router.post('/veille/collecte', async (req, res) => {
  try {
    const dbHolder = load();
    const entry = await domain.collecter(dbHolder);
    require('../store').save(dbHolder);
    res.json({ success: true, data: entry });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/veille/journal', (req, res) => {
  res.json({ success: true, data: load().journal });
});

router.get('/veille/fiches', (req, res) => {
  const { statut } = req.query;
  let rows = load().fiches;
  if (statut) rows = rows.filter((f) => f.statutTexte === statut);
  res.json({ success: true, data: rows });
});

router.post('/veille/fiches', (req, res) => {
  try {
    const data = update((db) => domain.createFiche(db, req.body || {}, req.user));
    res.status(201).json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/veille/commentaires', (req, res) => {
  const rows = load().commentaires.filter((c) => !req.query.ficheId || c.ficheId === req.query.ficheId);
  res.json({ success: true, data: rows });
});

router.post('/veille/commentaires', (req, res) => {
  try {
    const data = update((db) => domain.commenter(db, req.body || {}, req.user));
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/veille/profils', (req, res) => {
  res.json({ success: true, data: load().profils });
});

router.post('/veille/profils', (req, res) => {
  const { id } = require('../store');
  const data = update((db) => {
    const profil = {
      id: id(),
      nom: req.body?.nom || req.user.nom,
      activites: req.body?.activites || [],
      themes: req.body?.themes || [],
      createdAt: new Date().toISOString(),
    };
    db.profils.unshift(profil);
    return profil;
  });
  res.status(201).json({ success: true, data });
});

router.get('/patrimoine/actifs', (req, res) => {
  const data = update((db) => {
    domain.ensureEcheances(db);
    return db.actifs;
  });
  res.json({ success: true, data });
});

router.post('/patrimoine/actifs', (req, res) => {
  try {
    const data = update((db) => domain.createActif(db, req.body || {}));
    res.status(201).json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/patrimoine/operations', (req, res) => {
  res.json({ success: true, data: load().operations });
});

router.post('/patrimoine/operations', (req, res) => {
  try {
    const data = update((db) => domain.createOperation(db, req.body || {}, req.user));
    res.status(201).json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/patrimoine/operations/:id/decision', (req, res) => {
  try {
    const data = update((db) => domain.deciderOperation(db, req.params.id, req.body?.decision, req.user));
    if (!data) return res.status(404).json({ success: false, message: 'Opération introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/alertes', (req, res) => {
  const data = update((db) => {
    domain.ensureEcheances(db);
    return db.alertes;
  });
  res.json({ success: true, data });
});

router.post('/alertes/:id/lu', (req, res) => {
  const data = update((db) => {
    const a = db.alertes.find((x) => x.id === req.params.id);
    if (a) a.lu = true;
    return a;
  });
  if (!data) return res.status(404).json({ success: false, message: 'Alerte introuvable' });
  res.json({ success: true, data });
});

router.post('/corpus/recherche', (req, res) => {
  const data = corpus.search(load(), req.body?.q || '', Number(req.body?.limit) || 6);
  res.json({ success: true, data, moteur: 'tf-idf interne' });
});

router.post('/corpus/question', (req, res) => {
  const db = load();
  if (req.body?.texte && req.body?.contrat) {
    return res.json({ success: true, data: corpus.applicability(req.body.texte, req.body.contrat) });
  }
  res.json({ success: true, data: corpus.question(db, req.body?.question || '') });
});

router.post('/corpus/impact', (req, res) => {
  res.json({ success: true, data: corpus.impact(req.body?.texte || '') });
});

router.post('/corpus/traduire', (req, res) => {
  res.json({ success: true, data: corpus.traduire(req.body?.texte || '', req.body?.vers || 'ar') });
});

module.exports = router;
