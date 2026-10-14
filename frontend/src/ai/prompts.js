// Questions suggérées sur l'écran d'accueil de l'assistant, selon le rôle.
const COMMON = [
    'Cherche dans la bibliothèque les textes sur les pénalités de retard',
    'Que puis-je faire dans Lexora avec mon rôle ?',
];

const BY_ROLE = {
    responsable_departement: [
        'Quels sont mes contrats en retard ?',
        'Fais la synthèse de mon portefeuille de contrats',
        'Quelles alertes critiques dois-je traiter ?',
        'Quels contrats expirent dans les 90 jours ?',
        'Prépare un nouveau contrat de fourniture',
    ],
    admin: [
        'Quels utilisateurs n’ont pas encore de rôle ?',
        'Donne-moi la synthèse de tous les contrats',
        'Quels contrats présentent des risques critiques ?',
        'Comment affecter un directeur à une direction ?',
    ],
    directeur_direction: [
        'Synthèse des contrats et des risques de ma direction',
        'Quels contrats de ma direction sont en retard ?',
        'Qui sont les responsables de département de ma direction ?',
    ],
    directeur_centrale: [
        'Synthèse des contrats de ma direction centrale',
        'Quels contrats expirent dans les 90 jours ?',
        'Où se concentrent les risques critiques ?',
    ],
    vice_presedent: [
        'Synthèse des contrats de mon périmètre',
        'Comment affecter un directeur de direction d’activité ?',
    ],
};

const DEFAULT = [
    'Quels sont les contrats de mon département ?',
    'Ai-je des messages non lus ?',
];

export const suggestedPrompts = (role) => [...(BY_ROLE[role] || DEFAULT), ...COMMON].slice(0, 6);
