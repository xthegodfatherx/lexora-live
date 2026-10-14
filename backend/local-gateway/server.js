const fs = require('fs');
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const PORT = Number(process.env.PORT) || 8083;
const WEB_ROOT = process.env.WEB_ROOT || path.join(__dirname, '..', '..', 'frontend', 'build');
const DER_PORT = 8086;
const ARB_PORT = 8087;
const SECRET = 'lexora-local-dev';

const USERS = [
  { id: 2, email: 'admin@sonatrach.dz', password: 'Test1234!', role: 'admin', nom: 'Admin', prenom: 'Root' },
  { id: 3, email: 'vp@sonatrach.dz', password: 'Test1234!', role: 'vice_presedent', nom: 'Benali', prenom: 'Karim' },
  { id: 4, email: 'dd@sonatrach.dz', password: 'Test1234!', role: 'directeur_direction', nom: 'Meziane', prenom: 'Sara', direction_id: 'dcj-der', activite_id: 'act-trc' },
  { id: 5, email: 'rd@sonatrach.dz', password: 'Test1234!', role: 'responsable_departement', nom: 'Haddad', prenom: 'Yacine', direction_id: 'dcj-der', departement_id: 'der-aj' },
  { id: 6, email: 'agent@lexora.test', password: 'Test1234!', role: 'agent', nom: 'Saidi', prenom: 'Lina', direction_id: 'dcj-der', departement_id: 'der-aj' },
  { id: 7, email: 'dc@lexora.test', password: 'Test1234!', role: 'directeur_centrale', nom: 'Kaci', prenom: 'Omar', direction_centrale_id: 'dcj' },
  { id: 8, email: 'adc@lexora.test', password: 'Test1234!', role: 'assistant_directeur_centrale', nom: 'Boudiaf', prenom: 'Nadia', direction_centrale_id: 'dcj' },
  { id: 9, email: 'dda@lexora.test', password: 'Test1234!', role: 'directeur_direction_activite', nom: 'Cherif', prenom: 'Amine', activite_id: 'act-trc' },
  { id: 10, email: 'ddiv@lexora.test', password: 'Test1234!', role: 'directeur_division_activite', nom: 'Hamdi', prenom: 'Samir', activite_id: 'act-trc' },
  { id: 11, email: 'rdd@lexora.test', password: 'Test1234!', role: 'responsable_direction_division', nom: 'Belkacem', prenom: 'Ines', activite_id: 'act-trc' },
  { id: 12, email: 'rdepd@lexora.test', password: 'Test1234!', role: 'responsable_departement_division', nom: 'Mansouri', prenom: 'Yanis', activite_id: 'act-trc' },
];

const ORG = [
  {
    _id: 'dcj',
    code: 'DCJ',
    nom: 'Direction Centrale Juridique',
    description: 'Direction centrale juridique de SONATRACH',
    actif: true,
    organigramme: {
      directions: [
        {
          _id: 'dcj-der',
          code: 'DER',
          nom: 'Direction Études et Réglementation',
          departements: [
            { _id: 'der-aj', code: 'DER-AJ', nom: 'Analyses Juridiques' },
            { _id: 'der-rvj', code: 'DER-RVJ', nom: 'Réglementation et Veille Juridique' },
            { _id: 'der-sjop', code: 'DER-SJOP', nom: 'Suivi Juridique des Opérations Patrimoniales' },
          ],
        },
        {
          _id: 'dcj-cont',
          code: 'DC',
          nom: 'Direction Contrats',
          departements: [
            { _id: 'dc-cont', code: 'DC-CONT', nom: 'Département Contrats' },
          ],
        },
        {
          _id: 'dcj-drd',
          code: 'DRD',
          nom: 'Direction Règlement des Différends',
          departements: [
            { _id: 'drd-ci', code: 'DRD-CI', nom: 'Contentieux interne' },
          ],
        },
      ],
    },
  },
];

const ACTIVITES = [
  { _id: 'act-trc', code: 'TRC', nom: 'Transport par canalisations', description: 'Réseau de pipelines de brut et de gaz : exploitation, maintenance et projets de canalisations.', actif: true },
  { _id: 'act-amont', code: 'AMONT', nom: 'Amont', description: 'Exploration et production des hydrocarbures.', actif: true },
  { _id: 'act-aval', code: 'AVAL', nom: 'Aval', description: 'Raffinage, pétrochimie et distribution des produits.', actif: true },
  { _id: 'act-lng', code: 'LNG', nom: 'LNG', description: 'Liquéfaction et commercialisation du gaz naturel liquéfié.', actif: true },
  { _id: 'act-com', code: 'COM', nom: 'Commerce', description: 'Trading et export des hydrocarbures.', actif: true },
];

const DIRECTIONS_ACTIVITE = [
  { _id: 'dir-trc-exp', code: 'EXP', nom: 'Direction Exploitation', description: 'Exploitation du réseau et des stations de pompage.', activite: 'act-trc', actif: true },
  { _id: 'dir-trc-prj', code: 'PRJ', nom: 'Direction Projets canalisations', description: 'Études et réalisation des nouveaux tronçons.', activite: 'act-trc', actif: true },
  { _id: 'dir-am-expl', code: 'EXPL', nom: 'Direction Exploration', description: 'Campagnes sismiques et forages d\'exploration.', activite: 'act-amont', actif: true },
  { _id: 'dir-av-raf', code: 'RAF', nom: 'Direction Raffinage', description: 'Pilotage des raffineries et de la qualité des produits.', activite: 'act-aval', actif: true },
  { _id: 'dir-lng-com', code: 'CGNL', nom: 'Direction Commercialisation GNL', description: 'Contrats de vente et programmation des cargaisons.', activite: 'act-lng', actif: true },
  { _id: 'dir-com-trd', code: 'TRD', nom: 'Direction Trading', description: 'Opérations de négoce sur les marchés internationaux.', activite: 'act-com', actif: true },
];

const DEPARTEMENTS_ACTIVITE = [
  { _id: 'dep-trc-res', code: 'RES', nom: 'Département Réseau', description: 'Surveillance du linéaire et des points de livraison.', directionActivite: 'dir-trc-exp', actif: true },
  { _id: 'dep-trc-mnt', code: 'MNT', nom: 'Département Maintenance', description: 'Maintenance des stations et de la protection cathodique.', directionActivite: 'dir-trc-exp', actif: true },
  { _id: 'dep-trc-etu', code: 'ETU', nom: 'Département Études', description: 'Études de tracé, d\'impact et de dimensionnement.', directionActivite: 'dir-trc-prj', actif: true },
  { _id: 'dep-trc-rea', code: 'REA', nom: 'Département Réalisation', description: 'Suivi des chantiers de pose.', directionActivite: 'dir-trc-prj', actif: true },
  { _id: 'dep-am-geo', code: 'GEO', nom: 'Département Géosciences', description: 'Interprétation géologique et réservoir.', directionActivite: 'dir-am-expl', actif: true },
  { _id: 'dep-av-proc', code: 'PROC', nom: 'Département Procédés', description: 'Schémas de procédé et performance des unités.', directionActivite: 'dir-av-raf', actif: true },
  { _id: 'dep-lng-ctr', code: 'CTR-GNL', nom: 'Département Contrats GNL', description: 'Clauses de livraison FOB et fenêtres de chargement.', directionActivite: 'dir-lng-com', actif: true },
  { _id: 'dep-com-exp', code: 'EXP-COM', nom: 'Département Export', description: 'Nominations et exécution des ventes export.', directionActivite: 'dir-com-trd', actif: true },
];

const DIVISIONS = [
  { _id: 'div-trc-ctr', code: 'CTR', nom: 'Division Région Centre', description: 'Hassi Messaoud et Ouargla.', activite: 'act-trc', actif: true },
  { _id: 'div-trc-est', code: 'EST', nom: 'Division Région Est', description: 'Skikda et Béjaïa.', activite: 'act-trc', actif: true },
  { _id: 'div-am-hm', code: 'HMD', nom: 'Division Production Hassi Messaoud', description: 'Gisement de Hassi Messaoud.', activite: 'act-amont', actif: true },
  { _id: 'div-av-skd', code: 'SKD', nom: 'Division Raffinage Skikda', description: 'Complexe de raffinage de Skikda.', activite: 'act-aval', actif: true },
  { _id: 'div-lng-skd', code: 'GL1', nom: 'Division Complexes GL Skikda', description: 'Unités de liquéfaction de Skikda.', activite: 'act-lng', actif: true },
  { _id: 'div-com-med', code: 'MED', nom: 'Division Méditerranée', description: 'Flux export vers le bassin méditerranéen.', activite: 'act-com', actif: true },
];

const STRUCTURES = [
  { _id: 'str-trc-drc', code: 'DRC', nom: 'Direction régionale Centre', description: 'Coordination des opérations du centre.', type: 'direction', division: 'div-trc-ctr', actif: true },
  { _id: 'str-trc-sta', code: 'STA', nom: 'Département Stations', description: 'Stations de pompage de la région centre.', type: 'departement', division: 'div-trc-ctr', actif: true },
  { _id: 'str-trc-dre', code: 'DRE', nom: 'Direction régionale Est', description: 'Terminaux de Skikda et Béjaïa.', type: 'direction', division: 'div-trc-est', actif: true },
  { _id: 'str-am-dp', code: 'DP-HMD', nom: 'Direction production Hassi Messaoud', description: 'Production du gisement.', type: 'direction', division: 'div-am-hm', actif: true },
  { _id: 'str-am-puits', code: 'PUITS', nom: 'Département Puits', description: 'Interventions et complétion des puits.', type: 'departement', division: 'div-am-hm', actif: true },
  { _id: 'str-av-dr', code: 'DR-SKD', nom: 'Direction raffinage Skikda', description: 'Conduite des unités de raffinage.', type: 'direction', division: 'div-av-skd', actif: true },
  { _id: 'str-lng-exp', code: 'EXP-GNL', nom: 'Direction exploitation GNL', description: 'Conduite des trains de liquéfaction.', type: 'direction', division: 'div-lng-skd', actif: true },
  { _id: 'str-com-bur', code: 'BUR-MED', nom: 'Bureau commercial Méditerranée', description: 'Suivi des clients du bassin.', type: 'departement', division: 'div-com-med', actif: true },
];

const CONTRACTS = [
  {
    id: 1, numero_contrat: 'SH-2026-TRC-014', titre: 'Transport de brut — tronçon Hassi Messaoud / Béjaïa',
    type_contrat: 'Service / خدمة', type_contrat_code: 'service', statut: 'actif',
    partie_a_nom: 'SONATRACH', partie_b_nom: 'Enac Pipe', pays_partie_b: 'Algérie',
    objet: 'Exploitation et maintenance du tronçon sud du pipeline.',
    montant: 1850000000, devise: 'DZD', date_signature: '2026-02-01', date_debut: '2026-03-01', date_fin: '2027-03-01',
    est_en_retard: true, risques_total: 2, risques_critiques: 1, risques_non_resolus: 2,
    departement_id: 'der-aj', direction_id: 'dcj-der',
  },
  {
    id: 2, numero_contrat: 'SH-2026-FRN-008', titre: 'Fourniture de vannes de sécurité',
    type_contrat: 'Fournitures / توريد', type_contrat_code: 'fourniture', statut: 'brouillon',
    partie_a_nom: 'SONATRACH', partie_b_nom: 'Sarl EquipDZ', pays_partie_b: 'Algérie',
    objet: 'Fourniture et pose de vannes sur les stations de pompage.',
    montant: 640000000, devise: 'DZD', date_signature: null, date_debut: '2026-11-01', date_fin: '2027-11-01',
    est_en_retard: false, risques_total: 1, risques_critiques: 0, risques_non_resolus: 1,
    departement_id: 'der-aj', direction_id: 'dcj-der',
  },
  {
    id: 3, numero_contrat: 'SH-2025-LNG-003', titre: 'Contrat de vente GNL — cargaisons 2026',
    type_contrat: 'Vente / بيع', type_contrat_code: 'vente', statut: 'actif',
    partie_a_nom: 'SONATRACH', partie_b_nom: 'MedEnergy Trading', pays_partie_b: 'Italie',
    objet: 'Vente de gaz naturel liquéfié, livraison FOB Skikda.',
    montant: 42000000, devise: 'USD', date_signature: '2025-11-12', date_debut: '2026-01-01', date_fin: '2026-12-31',
    est_en_retard: false, risques_total: 3, risques_critiques: 1, risques_non_resolus: 3,
    departement_id: 'der-aj', direction_id: 'dcj-der',
  },
];

const DOCUMENTS = [
  { _id: 'doc-1', titre: 'Loi n° 19-13 régissant les activités d\'hydrocarbures', categorie: 'LOIS', reference: '19-13', organismeEmetteur: 'JORA n° 79', datePublication: '2019-12-11', statut: 'EN_VIGUEUR', resume: 'Régime juridique, institutionnel et fiscal des activités d\'hydrocarbures.', motsCles: ['hydrocarbures', 'concession'], pdfUrl: 'https://www.joradp.dz/FTP/jo-francais/2019/F2019079.pdf' },
  { _id: 'doc-2', titre: 'Loi n° 23-12 fixant les règles générales des marchés publics', categorie: 'LOIS', reference: '23-12', organismeEmetteur: 'JORA n° 51', datePublication: '2023-08-05', statut: 'EN_VIGUEUR', resume: 'Règles de passation, d\'exécution et de recours. Le décret présidentiel n° 15-247 demeure pour les marchés lancés avant cette loi.', motsCles: ['marché', 'recours'], pdfUrl: 'https://www.joradp.dz/FTP/jo-francais/2023/F2023051.pdf' },
  { _id: 'doc-3', titre: 'Circulaire DCJ — avis juridiques', categorie: 'DOCUMENTATION_INTERNE', reference: 'DCJ-CIR-07', organismeEmetteur: 'DCJ', datePublication: '2026-01-15', statut: 'EN_VIGUEUR', resume: 'Circuit interne de validation des avis : chef de département puis directeur. Document non publié au Journal officiel.', motsCles: ['DER', 'avis'], pdfUrl: '' },
  { _id: 'doc-4', titre: 'Loi n° 90-11 relative aux relations de travail', categorie: 'LOIS', reference: '90-11', organismeEmetteur: 'JORA n° 17', datePublication: '1990-04-21', statut: 'MODIFIE', resume: 'Relations de travail, rémunération et rupture du contrat. Publiée au Journal officiel n° 17 du 25 avril 1990.', motsCles: ['travail', 'personnel'], pdfUrl: 'https://www.joradp.dz/FTP/jo-francais/1990/F1990017.pdf' },
  { _id: 'doc-5', titre: 'Constitution — révision du 1er novembre 2020', categorie: 'CONSTITUTION', reference: '20-442', organismeEmetteur: 'JORA n° 82', datePublication: '2020-12-30', statut: 'EN_VIGUEUR', resume: 'Révision constitutionnelle promulguée par le décret présidentiel n° 20-442.', motsCles: ['constitution', 'domaine'], pdfUrl: 'https://www.joradp.dz/FTP/jo-francais/2020/F2020082.pdf' },
  { _id: 'doc-6', titre: 'Accord Algérie–Italie sur la protection des investissements', categorie: 'TRAITES_ET_ACCORDS', reference: 'BIT-IT-1991', organismeEmetteur: 'Signé à Alger', datePublication: '1991-05-18', statut: 'EN_VIGUEUR', resume: 'Promotion et protection réciproques des investissements. Texte authentique français, arabe et italien. Ratifié par le décret présidentiel n° 91-346.', motsCles: ['BIT', 'investissement'], pdfUrl: 'https://www.italaw.com/sites/default/files/laws/italaw8990.pdf' },
  { _id: 'doc-7', titre: 'Ordonnance n° 03-11 relative à la monnaie et au crédit', categorie: 'ORDONNANCES', reference: '03-11', organismeEmetteur: 'JORA n° 52', datePublication: '2003-08-26', statut: 'MODIFIE', resume: 'Statut de la Banque d\'Algérie, contrôle des changes et activité bancaire. Modifiée notamment par l\'ordonnance n° 10-04.', motsCles: ['change', 'crédit'], pdfUrl: 'https://www.joradp.dz/FTP/jo-francais/2003/F2003052.pdf' },
  { _id: 'doc-8', titre: 'Arrêté d\'attribution — concession Hassi R\'Mel', categorie: 'DECISIONS_ET_ARRETES', reference: 'ARR-HRM-2014', organismeEmetteur: 'ALNAFT', datePublication: '2014-03-02', statut: 'EN_VIGUEUR', resume: 'Titre minier interne : périmètre, durée et remise en état. Non publié comme texte général au Journal officiel.', motsCles: ['concession', 'amont'], pdfUrl: '' },
  { _id: 'doc-9', titre: 'Modèle d\'avis juridique SONATRACH', categorie: 'CONTRATS_ET_MODELES', reference: 'TPL-AVIS', organismeEmetteur: 'DCJ', datePublication: '2026-02-01', statut: 'EN_VIGUEUR', resume: 'Trame interne des avis : saisine, textes applicables, analyse, conclusion.', motsCles: ['modèle', 'avis'], pdfUrl: '' },
  { _id: 'doc-10', titre: 'Arrêt — compétence du tribunal d\'Alger', categorie: 'JURISPRUDENCE', reference: 'CA-ALG-2022-118', organismeEmetteur: 'Cour d\'Alger', datePublication: '2022-05-19', statut: 'EN_VIGUEUR', resume: 'Décision de juridiction non diffusée au Journal officiel. Extrait de travail sur la clause attributive.', motsCles: ['contentieux', 'juridiction'], pdfUrl: '' },
  { _id: 'doc-11', titre: 'Loi n° 01-10 portant loi minière', categorie: 'LOIS', reference: '01-10', organismeEmetteur: 'JORA n° 35', datePublication: '2001-07-03', statut: 'MODIFIE', resume: 'Loi minière du 3 juillet 2001. Elle abroge la loi n° 84-06 du 7 janvier 1984 relative aux activités minières.', motsCles: ['mines', 'abrogation'], pdfUrl: 'https://www.joradp.dz/FTP/jo-francais/2001/F2001035.pdf' },
  { _id: 'doc-12', titre: 'Loi n° 23-17 sur le foncier économique', categorie: 'LOIS', reference: '23-17', organismeEmetteur: 'JORA n° 73', datePublication: '2023-11-15', statut: 'EN_VIGUEUR', resume: 'Conditions et modalités d\'octroi du foncier économique relevant du domaine privé de l\'État, destiné aux projets d\'investissement.', motsCles: ['foncier', 'investissement'], pdfUrl: 'https://www.joradp.dz/FTP/JO-FRANCAIS/2023/F2023073.pdf' },
  { _id: 'doc-13', titre: 'Loi n° 07-01 relative aux coopératives d\'épargne et de crédit', categorie: 'LOIS', reference: '07-01', organismeEmetteur: 'JORA n° 15', datePublication: '2007-02-27', statut: 'EN_VIGUEUR', resume: 'Publiée au Journal officiel n° 15 du 28 février 2007. L\'édition arabe correspond au fichier A2007015.', motsCles: ['coopérative', 'crédit'], pdfUrl: 'https://www.joradp.dz/FTP/jo-arabe/2007/A2007015.pdf' },
  { _id: 'doc-14', titre: 'Décret présidentiel n° 15-247 — marchés publics', categorie: 'DECRETS', reference: '15-247', organismeEmetteur: 'JORA n° 50', datePublication: '2015-09-16', statut: 'MODIFIE', resume: 'Réglementation des marchés publics et des délégations de service public, y compris les délais de recours. Journal officiel n° 50 du 20 septembre 2015.', motsCles: ['marché', 'recours'], pdfUrl: 'https://www.joradp.dz/FTP/JO-FRANCAIS/2015/F2015050.pdf' },
];

const AUDIT = [
  { id: 'a1', at: '2026-10-13T07:42:00.000Z', actor: 'Root Admin', role: 'admin', domain: 'connexion', action: 'Connexion réussie', target: 'admin@sonatrach.dz', result: 'Jeton émis' },
  { id: 'a2', at: '2026-10-13T07:55:00.000Z', actor: 'Root Admin', role: 'admin', domain: 'structure', action: 'Création d\'une direction', target: 'DER — Études et Réglementation', result: 'Enregistré' },
  { id: 'a3', at: '2026-10-13T08:10:00.000Z', actor: 'Root Admin', role: 'admin', domain: 'affectation', action: 'Affectation d\'un directeur de direction', target: 'Sara Meziane → DER', result: 'Périmètre mis à jour' },
  { id: 'a4', at: '2026-10-13T09:05:00.000Z', actor: 'Yacine Haddad', role: 'responsable_departement', domain: 'contrat', action: 'Création d\'un contrat (brouillon)', target: 'SH-2026-FRN-008', result: 'Brouillon' },
  { id: 'a5', at: '2026-10-13T09:40:00.000Z', actor: 'Sara Meziane', role: 'directeur_direction', domain: 'contrat', action: 'Consultation des risques', target: 'SH-2026-TRC-014', result: '2 risques non résolus' },
  { id: 'a6', at: '2026-10-13T10:15:00.000Z', actor: 'Root Admin', role: 'admin', domain: 'bibliotheque', action: 'Dépôt d\'un document', target: 'Loi n° 19-13', result: 'Indexé — en vigueur' },
  { id: 'a7', at: '2026-10-13T11:02:00.000Z', actor: 'Yacine Haddad', role: 'responsable_departement', domain: 'der', action: 'Soumission au chef de département', target: 'Avis marchés publics', result: 'En validation' },
  { id: 'a8', at: '2026-10-13T14:20:00.000Z', actor: 'Sara Meziane', role: 'directeur_direction', domain: 'der', action: 'Validation directeur et livraison', target: 'DER-AJ-2026-0001', result: 'Livré à la Direction Générale' },
  { id: 'a9', at: '2026-10-13T16:05:00.000Z', actor: 'Karim Benali', role: 'vice_presedent', domain: 'connexion', action: 'Connexion réussie', target: 'vp@sonatrach.dz', result: 'Jeton émis' },
  { id: 'a10', at: '2026-10-13T17:30:00.000Z', actor: 'Root Admin', role: 'admin', domain: 'connexion', action: 'Déconnexion', target: 'admin@sonatrach.dz', result: 'Session invalidée' },
  { id: 'a11', at: '2026-10-14T00:12:00.000Z', actor: 'Omar Kaci', role: 'directeur_centrale', domain: 'connexion', action: 'Connexion réussie', target: 'dc@lexora.test', result: 'Jeton émis' },
  { id: 'a12', at: '2026-10-14T00:18:00.000Z', actor: 'Système', role: 'system', domain: 'alerte', action: 'Alerte d\'échéance patrimoniale', target: 'Concession Hassi R\'Mel — 18 jours', result: 'Notification créée' },
];

const affectation = {
  centrale: [
    { id: 7, email: 'dc@lexora.test', nom: 'Kaci', prenom: 'Omar', nom_complet: 'Omar Kaci', role: 'directeur_centrale', direction_centrale_id: 'dcj' },
    { id: 20, email: 'fb@lexora.test', nom: 'Bensaid', prenom: 'Farid', nom_complet: 'Farid Bensaid', role: 'directeur_centrale', direction_centrale_id: null },
  ],
  activite: [
    { id: 3, email: 'vp@sonatrach.dz', nom: 'Benali', prenom: 'Karim', nom_complet: 'Karim Benali', role: 'vice_presedent', activite_id: 'act-trc' },
    { id: 21, email: 'la@lexora.test', nom: 'Amrani', prenom: 'Leila', nom_complet: 'Leila Amrani', role: 'vice_presedent', activite_id: null },
  ],
  direction: [
    { id: 4, email: 'dd@sonatrach.dz', nom: 'Meziane', prenom: 'Sara', nom_complet: 'Sara Meziane', role: 'directeur_direction', direction_id: 'dcj-der' },
    { id: 22, email: 'rb@lexora.test', nom: 'Bouzid', prenom: 'Riad', nom_complet: 'Riad Bouzid', role: 'directeur_direction', direction_id: null },
  ],
};

function audit(entry) {
  AUDIT.unshift({ id: `a${Date.now()}`, at: new Date().toISOString(), ...entry });
}

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    nom: u.nom,
    prenom: u.prenom,
    nom_complet: `${u.prenom} ${u.nom}`,
    is_active: true,
    activite_id: u.activite_id || null,
    direction_id: u.direction_id || null,
    departement_id: u.departement_id || null,
    direction_centrale_id: u.direction_centrale_id || null,
    division_activite_id: null,
    direction_activite_id: null,
    structure_id: null,
  };
}

function sign(user) {
  const access = jwt.sign({ user_id: user.id, token_type: 'access', role: user.role }, SECRET, { expiresIn: '1d' });
  const refresh = jwt.sign({ user_id: user.id, token_type: 'refresh' }, SECRET, { expiresIn: '7d' });
  return { access, refresh };
}

function readUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    return USERS.find((u) => u.id === payload.user_id) || null;
  } catch {
    return null;
  }
}

function requireUser(req, res, next) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ status: 'error', message: 'Session invalide', detail: 'Token invalide ou expiré.' });
  req.user = user;
  return next();
}

const app = express();
app.use(cors({ origin: true, credentials: true }));

app.use('/der', (req, res) => {
  const headers = { ...req.headers, host: `localhost:${DER_PORT}` };
  const preq = http.request({
    hostname: '127.0.0.1',
    port: DER_PORT,
    path: req.originalUrl,
    method: req.method,
    headers,
  }, (pres) => {
    res.writeHead(pres.statusCode || 502, pres.headers);
    pres.pipe(res);
  });
  preq.on('error', () => res.status(502).json({ success: false, message: 'service-der indisponible sur le port 8086' }));
  req.pipe(preq);
});

app.use('/arbitrage', (req, res) => {
  const headers = { ...req.headers, host: `localhost:${ARB_PORT}` };
  const preq = http.request({
    hostname: '127.0.0.1',
    port: ARB_PORT,
    path: req.originalUrl,
    method: req.method,
    headers,
  }, (pres) => {
    res.writeHead(pres.statusCode || 502, pres.headers);
    pres.pipe(res);
  });
  preq.on('error', () => res.status(502).json({ success: false, message: 'service-arbitrage indisponible sur le port 8087' }));
  req.pipe(preq);
});

app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ success: true, service: 'local-gateway', status: 'UP' }));

app.post(['/auth/login', '/auth/login/'], (req, res) => {
  const user = USERS.find((u) => u.email === req.body?.email && u.password === req.body?.password);
  if (!user) return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect.' });
  const tokens = sign(user);
  const profile = publicUser(user);
  audit({ actor: profile.nom_complet, role: user.role, domain: 'connexion', action: 'Connexion réussie', target: user.email, result: 'Jeton émis' });
  res.json({
    status: 'success',
    message: `Logged in as ${profile.nom_complet}`,
    ...tokens,
    ...profile,
    user_id: String(user.id),
    photo_profil: null,
  });
});

app.post(['/auth/logout', '/auth/logout/'], (req, res) => {
  const user = readUser(req);
  if (user) audit({ actor: `${user.prenom} ${user.nom}`, role: user.role, domain: 'connexion', action: 'Déconnexion', target: user.email, result: 'Session invalidée' });
  res.json({ status: 'success' });
});

app.post(['/auth/token/refresh', '/auth/token/refresh/'], (req, res) => {
  try {
    const payload = jwt.verify(req.body?.refresh || '', SECRET);
    const user = USERS.find((u) => u.id === payload.user_id);
    if (!user) return res.status(401).json({ detail: 'Token invalide ou expiré.', code: 'token_not_valid' });
    res.json(sign(user));
  } catch {
    res.status(401).json({ detail: 'Token invalide ou expiré.', code: 'token_not_valid' });
  }
});

app.get(['/auth/users/me', '/auth/users/me/'], requireUser, (req, res) => {
  res.json({ status: 'success', data: publicUser(req.user) });
});

app.get(['/auth/users', '/auth/users/'], requireUser, (req, res) => {
  const users = USERS.filter((u) => u.role !== 'admin').map(publicUser);
  res.json({ status: 'success', count: users.length, total_users: users.length, users });
});

app.get('/juridique/dashboard/counters', (req, res) => {
  res.json({
    success: true,
    data: { directionsCentrales: 1, directions: 3, departements: 5, activites: ACTIVITES.length, directionsActivite: DIRECTIONS_ACTIVITE.length, departementsActivite: DEPARTEMENTS_ACTIVITE.length, divisions: DIVISIONS.length, structures: STRUCTURES.length },
  });
});

app.get('/juridique/dashboard/directions-par-direction-centrale', (req, res) => {
  res.json({ success: true, data: [{ directionCentraleId: 'dcj', nom: 'Direction Centrale Juridique', code: 'DCJ', count: 3 }] });
});

app.get('/juridique/dashboard/activites-breakdown', (req, res) => {
  res.json({ success: true, data: { directionsActivite: DIRECTIONS_ACTIVITE.length, departementsActivite: DEPARTEMENTS_ACTIVITE.length, divisions: DIVISIONS.length, structures: STRUCTURES.length } });
});

app.get('/juridique/directions-centrales', (req, res) => {
  res.json({ success: true, count: ORG.length, data: ORG.map(({ organigramme, ...dc }) => dc) });
});

app.get('/juridique/directions-centrales/:id/organigramme', (req, res) => {
  const dc = ORG.find((item) => item._id === req.params.id);
  if (!dc) return res.status(404).json({ success: false, message: 'Introuvable' });
  res.json({ success: true, data: dc.organigramme });
});

function dropWhere(rows, field, id) {
  const removed = [];
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (String(rows[index][field]) === String(id)) removed.push(rows.splice(index, 1)[0]);
  }
  return removed;
}

function structureAudit(action, target) {
  audit({ actor: 'Root Admin', role: 'admin', domain: 'structure', action, target, result: 'Organigramme mis à jour' });
}

function orgRoutes(path, rows, parentField, prefix, onDelete) {
  app.get(path, (req, res) => {
    const value = parentField ? req.query[parentField] : undefined;
    const data = value ? rows.filter((row) => String(row[parentField]) === String(value)) : rows.slice();
    res.json({ success: true, count: data.length, data });
  });
  app.post(path, (req, res) => {
    const body = req.body || {};
    if (!body.code || !body.nom) return res.status(400).json({ success: false, message: 'Code et nom obligatoires' });
    const item = { _id: `${prefix}-${Date.now()}`, actif: body.actif !== false, ...body };
    rows.push(item);
    structureAudit(`Création — ${prefix}`, item.nom);
    res.status(201).json({ success: true, data: item });
  });
  app.put(`${path}/:id`, (req, res) => {
    const item = rows.find((row) => row._id === req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    const id = item._id;
    Object.assign(item, req.body, { _id: id });
    structureAudit(`Modification — ${prefix}`, item.nom);
    res.json({ success: true, data: item });
  });
  app.delete(`${path}/:id`, (req, res) => {
    const index = rows.findIndex((row) => row._id === req.params.id);
    if (index < 0) return res.status(404).json({ success: false, message: 'Introuvable' });
    const [removed] = rows.splice(index, 1);
    if (onDelete) onDelete(removed);
    structureAudit(`Suppression — ${prefix}`, removed.nom);
    res.json({ success: true, message: 'Supprimé' });
  });
}

orgRoutes('/juridique/activites', ACTIVITES, null, 'activite', (activite) => {
  dropWhere(DIRECTIONS_ACTIVITE, 'activite', activite._id).forEach((direction) => {
    dropWhere(DEPARTEMENTS_ACTIVITE, 'directionActivite', direction._id);
  });
  dropWhere(DIVISIONS, 'activite', activite._id).forEach((division) => {
    dropWhere(STRUCTURES, 'division', division._id);
  });
});
orgRoutes('/juridique/direction_activite', DIRECTIONS_ACTIVITE, 'activite', 'direction', (direction) => {
  dropWhere(DEPARTEMENTS_ACTIVITE, 'directionActivite', direction._id);
});
orgRoutes('/juridique/departemet_activite', DEPARTEMENTS_ACTIVITE, 'directionActivite', 'departement');
orgRoutes('/juridique/division', DIVISIONS, 'activite', 'division', (division) => {
  dropWhere(STRUCTURES, 'division', division._id);
});
orgRoutes('/juridique/structure', STRUCTURES, 'division', 'structure');

const PARAMETRES = {
  organisation: {
    raisonSociale: 'SONATRACH',
    directionCentrale: 'Direction Centrale Juridique',
    code: 'DCJ',
    langue: 'fr',
    fuseau: 'Africa/Algiers',
  },
  calendrier: {
    joursOuvres: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi'],
  },
  alertes: {
    contratsJours: 90,
    patrimoineJours: 90,
    delaiAvisJoursOuvres: 5,
    notificationsActives: true,
  },
  securite: {
    dureeJetonHeures: 24,
    dureeRefreshJours: 7,
    invalidationSession: true,
  },
  activites: [
    { activiteId: 'act-trc', seuilAlerteJours: 90, devise: 'DZD' },
    { activiteId: 'act-amont', seuilAlerteJours: 60, devise: 'DZD' },
    { activiteId: 'act-aval', seuilAlerteJours: 90, devise: 'DZD' },
    { activiteId: 'act-lng', seuilAlerteJours: 45, devise: 'USD' },
    { activiteId: 'act-com', seuilAlerteJours: 30, devise: 'USD' },
  ],
};

const ROLES = [
  { code: 'admin', nom: 'Administrateur', perimetre: 'Accès complet : rôles, utilisateurs, paramètres' },
  { code: 'vice_presedent', nom: 'Vice-président', perimetre: 'Consultation et affectations, sans modification structurelle' },
  { code: 'directeur_centrale', nom: 'Directeur central', perimetre: 'Contrats, validations et risques de la direction centrale' },
  { code: 'assistant_directeur_centrale', nom: 'Assistant directeur central', perimetre: 'Gestion administrative et documents juridiques' },
  { code: 'directeur_direction', nom: 'Directeur de direction', perimetre: 'Sa direction et les départements rattachés' },
  { code: 'directeur_direction_activite', nom: 'Directeur de direction d\'activité', perimetre: 'Son activité' },
  { code: 'directeur_division_activite', nom: 'Directeur de division d\'activité', perimetre: 'Affectations et suivi de sa division' },
  { code: 'responsable_departement', nom: 'Responsable de département', perimetre: 'Contrats et risques de son département' },
  { code: 'responsable_direction_division', nom: 'Responsable de direction d\'activité', perimetre: 'Suivi de l\'activité et des ressources' },
  { code: 'responsable_departement_division', nom: 'Responsable de département de division', perimetre: 'Affectations au sein de la division' },
  { code: 'agent', nom: 'Agent', perimetre: 'Tâches de son département' },
];

const WEEK_DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function parametresView() {
  return {
    organisation: PARAMETRES.organisation,
    calendrier: {
      joursOuvres: PARAMETRES.calendrier.joursOuvres,
      weekend: WEEK_DAYS.filter((day) => !PARAMETRES.calendrier.joursOuvres.includes(day)),
    },
    alertes: PARAMETRES.alertes,
    securite: PARAMETRES.securite,
    activites: ACTIVITES.map((activite) => {
      const saved = PARAMETRES.activites.find((row) => row.activiteId === activite._id) || {};
      return {
        activiteId: activite._id,
        code: activite.code,
        nom: activite.nom,
        seuilAlerteJours: saved.seuilAlerteJours ?? 90,
        devise: saved.devise || 'DZD',
        actif: activite.actif !== false,
      };
    }),
    roles: ROLES,
  };
}

app.get('/juridique/parametres', (req, res) => {
  res.json({ success: true, data: parametresView() });
});

app.put('/juridique/parametres', (req, res) => {
  const body = req.body || {};
  const jours = Array.isArray(body.calendrier?.joursOuvres)
    ? body.calendrier.joursOuvres.filter((day) => WEEK_DAYS.includes(day))
    : PARAMETRES.calendrier.joursOuvres;
  if (!jours.length) return res.status(400).json({ success: false, message: 'Au moins un jour ouvré est requis.' });
  const nombre = (value, min, max, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  };
  if (body.organisation) {
    PARAMETRES.organisation = {
      ...PARAMETRES.organisation,
      raisonSociale: String(body.organisation.raisonSociale || PARAMETRES.organisation.raisonSociale).trim(),
      directionCentrale: String(body.organisation.directionCentrale || PARAMETRES.organisation.directionCentrale).trim(),
      code: String(body.organisation.code || PARAMETRES.organisation.code).trim(),
      langue: body.organisation.langue === 'ar' ? 'ar' : 'fr',
      fuseau: 'Africa/Algiers',
    };
  }
  PARAMETRES.calendrier.joursOuvres = jours;
  if (body.alertes) {
    PARAMETRES.alertes = {
      contratsJours: nombre(body.alertes.contratsJours, 1, 365, PARAMETRES.alertes.contratsJours),
      patrimoineJours: nombre(body.alertes.patrimoineJours, 1, 365, PARAMETRES.alertes.patrimoineJours),
      delaiAvisJoursOuvres: nombre(body.alertes.delaiAvisJoursOuvres, 1, 30, PARAMETRES.alertes.delaiAvisJoursOuvres),
      notificationsActives: Boolean(body.alertes.notificationsActives),
    };
  }
  if (body.securite) {
    PARAMETRES.securite = {
      dureeJetonHeures: nombre(body.securite.dureeJetonHeures, 1, 72, PARAMETRES.securite.dureeJetonHeures),
      dureeRefreshJours: nombre(body.securite.dureeRefreshJours, 1, 30, PARAMETRES.securite.dureeRefreshJours),
      invalidationSession: Boolean(body.securite.invalidationSession),
    };
  }
  if (Array.isArray(body.activites)) {
    PARAMETRES.activites = body.activites
      .filter((row) => ACTIVITES.some((activite) => activite._id === row.activiteId))
      .map((row) => ({
        activiteId: row.activiteId,
        seuilAlerteJours: nombre(row.seuilAlerteJours, 1, 365, 90),
        devise: ['DZD', 'USD', 'EUR'].includes(row.devise) ? row.devise : 'DZD',
      }));
  }
  const actor = readUser(req);
  audit({
    actor: actor ? `${actor.prenom} ${actor.nom}` : 'Système',
    role: actor?.role || 'system',
    domain: 'structure',
    action: 'Modification des paramètres centraux',
    target: PARAMETRES.organisation.directionCentrale,
    result: 'Paramètres enregistrés',
  });
  res.json({ success: true, message: 'Paramètres enregistrés', data: parametresView() });
});

app.get('/juridique/directions', (req, res) => {
  const directions = ORG.flatMap((dc) => dc.organigramme.directions.map((d) => ({ ...d, directionCentrale: dc._id })));
  res.json({ success: true, count: directions.length, data: directions });
});

app.get('/audit/events', (req, res) => {
  const domainFilter = req.query.domain;
  const rows = domainFilter ? AUDIT.filter((e) => e.domain === domainFilter) : AUDIT;
  res.json({ success: true, total: rows.length, data: rows });
});

app.get(['/clm/dashboard/stats', '/clm/dashboard/stats/'], (req, res) => {
  res.json({
    success: true,
    data: {
      total: CONTRACTS.length,
      enRetard: CONTRACTS.filter((c) => c.est_en_retard).length,
      expires: 0,
      expirantBientot: 1,
      risques: { critiques: 2, non_resolus: 6 },
      parStatut: [
        { statut: 'actif', statut_label: 'Actif', total: 2 },
        { statut: 'brouillon', statut_label: 'Brouillon', total: 1 },
      ],
      parType: [
        { code: 'service', type_contrat: 'Service', total: 1 },
        { code: 'fourniture', type_contrat: 'Fourniture', total: 1 },
        { code: 'vente', type_contrat: 'Vente', total: 1 },
      ],
    },
  });
});

app.get(['/clm/contrats', '/clm/contrats/'], (req, res) => {
  let rows = CONTRACTS.slice();
  if (req.query.statut) rows = rows.filter((c) => c.statut === req.query.statut);
  if (req.query.type_contrat) rows = rows.filter((c) => c.type_contrat_code === req.query.type_contrat);
  if (req.query.search) {
    const q = String(req.query.search).toLowerCase();
    rows = rows.filter((c) => `${c.titre} ${c.numero_contrat} ${c.partie_b_nom}`.toLowerCase().includes(q));
  }
  res.json({ success: true, total: rows.length, limit: 20, offset: 0, results: rows });
});

app.get(['/clm/contrats/:id', '/clm/contrats/:id/'], (req, res) => {
  const contrat = CONTRACTS.find((c) => String(c.id) === req.params.id);
  if (!contrat) return res.status(404).json({ success: false, error: 'Contrat non trouvé' });
  res.json({
    success: true,
    ...contrat,
    metadonnees: { tribunal_competent: 'Alger', penalite_retard_pct: '0.5' },
    risques: {
      total: contrat.risques_total,
      non_resolus: contrat.risques_non_resolus,
      critiques: contrat.risques_critiques,
      retard: [{ id: 1, code: 'R-01', type: 'retard', description: 'Livraison au-delà de la date limite / تأخر التسليم', severite: 'eleve', suggestion: 'Relancer le fournisseur', resolu: false }],
      imprecision: [],
      different: [],
      resolus: [],
    },
  });
});

function withCreatedAt(doc) {
  return {
    ...doc,
    createdAt: doc.createdAt || doc.datePublication,
    pdfUrl: doc.pdfUrl || `/uploads/bib/${doc._id}.pdf`,
  };
}

function pdfText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/[()\\]/g, (char) => `\\${char}`);
}

function samplePdf(doc) {
  const lines = [
    `Reference : ${doc.reference || '-'}`,
    `Emetteur : ${doc.organismeEmetteur || '-'}`,
    `Publication : ${doc.datePublication || '-'}`,
    `Statut : ${doc.statut || '-'}`,
    '',
    doc.resume || '',
    '',
    `Mots-cles : ${(doc.motsCles || []).join(', ')}`,
    '',
    'Extrait de demonstration LEXORA. Le texte integral reste dans le corpus interne.',
  ];
  const commands = ['BT', '/F1 16 Tf', '48 790 Td', `(${pdfText(doc.titre)}) Tj`, '/F1 11 Tf'];
  lines.forEach((line) => {
    const chunks = pdfText(line).match(/.{1,90}/g) || [''];
    chunks.forEach((chunk) => {
      commands.push('0 -18 Td', `(${chunk}) Tj`);
    });
  });
  commands.push('ET');
  const stream = commands.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(body));
    body += object;
  });
  const xref = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    body += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body);
}

function countBy(field) {
  const counts = new Map();
  for (const doc of DOCUMENTS) counts.set(doc[field], (counts.get(doc[field]) || 0) + 1);
  return [...counts.entries()].map(([_id, total]) => ({ _id, total }));
}

app.get('/bib/documents', (req, res) => {
  let rows = DOCUMENTS.map(withCreatedAt);
  if (req.query.statut) rows = rows.filter((d) => d.statut === req.query.statut);
  if (req.query.categorie) rows = rows.filter((d) => d.categorie === req.query.categorie);
  const total = rows.length;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || total);
  const start = (page - 1) * limit;
  res.json({ success: true, total, data: rows.slice(start, start + limit) });
});

app.get('/bib/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total: DOCUMENTS.length,
      enVigueur: DOCUMENTS.filter((d) => d.statut === 'EN_VIGUEUR').length,
      parCategorie: countBy('categorie'),
      parStatut: countBy('statut'),
    },
  });
});

app.get('/uploads/bib/:file', (req, res) => {
  const id = String(req.params.file || '').replace(/\.pdf$/i, '');
  const doc = DOCUMENTS.find((item) => item._id === id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${id}.pdf"`);
  res.send(samplePdf(doc));
});

app.get('/bib/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const rows = DOCUMENTS.filter((d) => `${d.titre} ${d.resume} ${(d.motsCles || []).join(' ')}`.toLowerCase().includes(q)).map(withCreatedAt);
  res.json({ success: true, total: rows.length, data: rows });
});

app.get('/notifications/unread/count', (req, res) => res.json({ unreadCount: 2 }));

app.get('/notifications/risk-alerts', (req, res) => res.json({ total: 2, alerts: [
  { id: 'ra-1', contrat_id: 1, statut: 'nouveau', description: 'Pénalité de retard sur le tronçon TRC' },
  { id: 'ra-2', contrat_id: 3, statut: 'nouveau', description: 'Clause de force majeure imprécise sur le GNL' },
] }));

app.get('/notifications/conversations', (req, res) => res.json([
  { _id: 'conv-1', participants: [2, 5], lastMessage: 'Merci de valider l\'avis fiscal TRC.', lastMessageAt: new Date().toISOString() },
]));

function directorsPayload(rows) {
  return { status: 'success', count: rows.length, data: { count: rows.length, directeurs: rows } };
}

function structureName(id) {
  const centrale = ORG.find((item) => item._id === id);
  if (centrale) return centrale.nom;
  const activite = ACTIVITES.find((item) => item._id === id);
  if (activite) return activite.nom;
  for (const dc of ORG) {
    const direction = dc.organigramme.directions.find((item) => item._id === id);
    if (direction) return direction.nom;
  }
  return id || '—';
}

function applyAssignment(list, idField, body, verb, req) {
  const person = list.find((item) => String(item.id) === String(body.user_id));
  if (!person) return { error: 'Utilisateur introuvable' };
  if (!body[idField]) return { error: 'Structure manquante' };
  person[idField] = body[idField];
  const actor = readUser(req);
  audit({
    actor: actor ? `${actor.prenom} ${actor.nom}` : 'Système',
    role: actor?.role || 'system',
    domain: 'affectation',
    action: verb,
    target: `${person.nom_complet} → ${structureName(body[idField])}`,
    result: 'Périmètre mis à jour',
  });
  return { person };
}

app.get('/affectation/users/directeurs-centrale', (req, res) => {
  res.json(directorsPayload(affectation.centrale.filter((user) => !user.direction_centrale_id)));
});
app.get('/affectation/users/directeurs-centrale/affectes', (req, res) => {
  res.json(directorsPayload(affectation.centrale.filter((user) => user.direction_centrale_id)));
});
app.get('/affectation/users/directeurs-activite/non-affectes', (req, res) => {
  res.json(directorsPayload(affectation.activite.filter((user) => !user.activite_id)));
});
app.get('/affectation/users/directeurs-activite/affectes', (req, res) => {
  res.json(directorsPayload(affectation.activite.filter((user) => user.activite_id)));
});
app.get('/affectation/users/directeurs-direction', (req, res) => {
  res.json(directorsPayload(affectation.direction.filter((user) => !user.direction_id)));
});
app.get('/affectation/users/directeurs-direction/affectes', (req, res) => {
  res.json(directorsPayload(affectation.direction.filter((user) => user.direction_id)));
});

app.patch('/affectation/assign-direction-centrale', (req, res) => {
  const result = applyAssignment(affectation.centrale, 'direction_centrale_id', req.body, 'Affectation d\'un directeur central', req);
  if (result.error) return res.status(400).json({ status: 'error', message: result.error });
  res.json({ status: 'success', message: `Direction centrale affectée à ${result.person.nom_complet}` });
});
app.put('/affectation/reassign-direction-centrale', (req, res) => {
  const result = applyAssignment(affectation.centrale, 'direction_centrale_id', req.body, 'Réaffectation d\'un directeur central', req);
  if (result.error) return res.status(400).json({ status: 'error', message: result.error });
  res.json({ status: 'success', message: `Direction centrale réaffectée à ${result.person.nom_complet}` });
});
app.delete('/affectation/users/:userId/remove-direction-centrale', (req, res) => {
  const person = affectation.centrale.find((user) => String(user.id) === req.params.userId);
  if (!person) return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
  person.direction_centrale_id = null;
  const actor = readUser(req);
  audit({ actor: actor ? `${actor.prenom} ${actor.nom}` : 'Système', role: actor?.role || 'system', domain: 'affectation', action: 'Retrait d\'une direction centrale', target: person.nom_complet, result: 'Périmètre retiré' });
  res.json({ status: 'success', message: `Affectation retirée pour ${person.nom_complet}` });
});

app.patch('/affectation/assign-activite', (req, res) => {
  const result = applyAssignment(affectation.activite, 'activite_id', req.body, 'Affectation d\'une activité', req);
  if (result.error) return res.status(400).json({ status: 'error', message: result.error });
  res.json({ status: 'success', message: `Activité affectée à ${result.person.nom_complet}` });
});
app.put('/affectation/reassign-activite', (req, res) => {
  const result = applyAssignment(affectation.activite, 'activite_id', req.body, 'Réaffectation d\'une activité', req);
  if (result.error) return res.status(400).json({ status: 'error', message: result.error });
  res.json({ status: 'success', message: `Activité réaffectée à ${result.person.nom_complet}` });
});
app.delete('/affectation/users/:userId/remove-activite', (req, res) => {
  const person = affectation.activite.find((user) => String(user.id) === req.params.userId);
  if (!person) return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
  person.activite_id = null;
  const actor = readUser(req);
  audit({ actor: actor ? `${actor.prenom} ${actor.nom}` : 'Système', role: actor?.role || 'system', domain: 'affectation', action: 'Retrait d\'une activité', target: person.nom_complet, result: 'Périmètre retiré' });
  res.json({ status: 'success', message: `Affectation retirée pour ${person.nom_complet}` });
});

app.patch('/affectation/assign-direction', (req, res) => {
  const result = applyAssignment(affectation.direction, 'direction_id', req.body, 'Affectation d\'un directeur de direction', req);
  if (result.error) return res.status(400).json({ status: 'error', message: result.error });
  res.json({ status: 'success', message: `Direction affectée à ${result.person.nom_complet}` });
});
app.put('/affectation/reassign-direction', (req, res) => {
  const result = applyAssignment(affectation.direction, 'direction_id', req.body, 'Réaffectation d\'un directeur de direction', req);
  if (result.error) return res.status(400).json({ status: 'error', message: result.error });
  res.json({ status: 'success', message: `Direction réaffectée à ${result.person.nom_complet}` });
});
app.delete('/affectation/users/:userId/remove-direction', (req, res) => {
  const person = affectation.direction.find((user) => String(user.id) === req.params.userId);
  if (!person) return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
  person.direction_id = null;
  const actor = readUser(req);
  audit({ actor: actor ? `${actor.prenom} ${actor.nom}` : 'Système', role: actor?.role || 'system', domain: 'affectation', action: 'Retrait d\'une direction', target: person.nom_complet, result: 'Périmètre retiré' });
  res.json({ status: 'success', message: `Affectation retirée pour ${person.nom_complet}` });
});

const indexFile = path.join(WEB_ROOT, 'index.html');
const hasWeb = fs.existsSync(indexFile);
if (hasWeb) app.use(express.static(WEB_ROOT));

const API_PREFIX = /^\/(auth|bib|juridique|affectation|clm|notifications|uploads|audit|health|der|arbitrage)(\/|$)/;

app.use((req, res) => {
  if (hasWeb && req.method === 'GET' && !API_PREFIX.test(req.path)) {
    return res.sendFile(indexFile);
  }
  res.status(404).json({ success: false, message: `Route locale introuvable: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`Passerelle locale sur http://localhost:${PORT}`);
});
