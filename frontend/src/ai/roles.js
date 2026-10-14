// Rôles backend (snake_case, dont la faute volontaire `vice_presedent`) → routes et écrans.
// Reflète les sous-arbres de src/App.js : n'ajouter ici qu'un écran qui a une route.

export const ROLE_PATHS = {
    admin: '/admin',
    vice_presedent: '/vice-president',
    directeur_centrale: '/directeur-centrale',
    assistant_directeur_centrale: '/assistant-directeur-centrale',
    directeur_direction: '/directeur-direction',
    responsable_departement: '/responsable-departement',
    directeur_direction_activite: '/directeur-direction-activite',
    directeur_division_activite: '/directeur-division-activite',
    responsable_direction_division: '/responsable-direction-division',
    responsable_departement_division: '/responsable-departement-division',
    agent: '/agent',
};

export const ROLE_LABELS = {
    admin: 'Administrateur',
    agent: 'Agent',
    vice_presedent: 'Vice-président',
    directeur_direction: 'Directeur de direction',
    responsable_departement: 'Responsable de département',
    directeur_centrale: 'Directeur central',
    assistant_directeur_centrale: 'Assistant du directeur central',
    directeur_direction_activite: "Directeur de direction d'activité",
    directeur_division_activite: "Directeur de division d'activité",
    responsable_direction_division: 'Responsable de direction (division)',
    responsable_departement_division: 'Responsable de département (division)',
};

const COMMON = {
    dashboard: 'Tableau de bord',
    notifications: 'Alertes et notifications',
    profile: 'Mon profil',
};

const SCREENS = {
    admin: {
        ...COMMON,
        utilisateurs: 'Gestion des utilisateurs',
        affectation: 'Affectation des rôles',
        'directions-centrales': 'Directions centrales (structure)',
        activites: 'Activités (structure)',
        bib: 'Bibliothèque juridique',
    },
    vice_presedent: {
        ...COMMON,
        affectation: "Affectations d'activité",
        'directions-centrales': 'Directions centrales',
        activites: 'Activités',
    },
    directeur_centrale: { ...COMMON, 'directions-centrales': 'Directions centrales', activites: 'Activités' },
    assistant_directeur_centrale: { ...COMMON, 'directions-centrales': 'Directions centrales', activites: 'Activités' },
    directeur_direction: { ...COMMON, affectationdep: 'Affectation des départements' },
    responsable_departement: { ...COMMON, contrat: 'Mes contrats', activites: 'Activités' },
    directeur_direction_activite: { ...COMMON, activites: 'Activités' },
};

/** Écrans ouvrables pour ce rôle : { chemin relatif: libellé }. */
export const screensForRole = (role) => SCREENS[role] || COMMON;

export const rolePath = (role) => ROLE_PATHS[role] || null;

export const currentUser = () => ({
    id: localStorage.getItem('user_id') || '',
    role: localStorage.getItem('role') || '',
    nom: localStorage.getItem('nom_complet') || '',
    departementId: localStorage.getItem('departement_id') || '',
});

/** Interrupteur de déploiement (booléen non secret → autorisé dans le bundle). */
export const AI_ENABLED = process.env.REACT_APP_AI_ENABLED !== 'false';
