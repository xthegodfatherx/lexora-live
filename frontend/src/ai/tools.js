import { toAbsoluteUrl } from '../axios';
import { rolePath, screensForRole, ROLE_LABELS } from './roles';

// ─────────────────────────────────────────────────────────────────────────────
// Registre des outils de l'assistant (AI_ASSISTANT_FEATURES.md §3).
//
// PRINCIPE : le modèle ne fait que DEMANDER un outil ; c'est ce fichier qui
// l'exécute, dans le navigateur, via axiosInstance — donc avec le JWT de
// l'utilisateur. Le périmètre appliqué par le backend (département, direction…)
// limite automatiquement ce que l'IA peut voir : aucun droit supplémentaire.
//
// Règles : résultats ÉLAGUÉS (quota de tokens), calculs faits en JS (jamais par
// le modèle), toute écriture passe par une carte de confirmation (`confirm`).
// Absents exprès : suppression/désactivation d'utilisateurs, rôles, affectations,
// mots de passe, suppression de documents, et les endpoints cassés (FEATURES §1).
// ─────────────────────────────────────────────────────────────────────────────

const RD = ['responsable_departement'];

// ── utilitaires ─────────────────────────────────────────────────────────────
const fr = (text) => (typeof text === 'string' ? text.split(' / ')[0].trim() : text);
const clip = (text, max) => (typeof text === 'string' && text.length > max ? `${text.slice(0, max)}…` : text);
const compact = (obj) => Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false && !(Array.isArray(v) && !v.length)),
);
const pick = (obj, keys) => keys.reduce((acc, k) => {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') acc[k] = obj[k];
    return acc;
}, {});
const dayMs = 86400000;
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const daysUntil = (iso) => (iso ? Math.round((new Date(`${iso}T00:00:00`) - startOfToday()) / dayMs) : null);
const remember = (ctx, type, id, data) => { if (ctx.entities && id !== undefined && id !== null) ctx.entities[type][String(id)] = data; };

export const newEntityStore = () => ({ contrat: {}, document: {}, alerte: {}, utilisateur: {} });

// ── contrats ────────────────────────────────────────────────────────────────
const contratEntity = (c) => pick(c, ['id', 'numero_contrat', 'titre', 'statut', 'type_contrat_code', 'partie_b_nom', 'montant', 'devise', 'date_fin', 'date_limite_livraison', 'est_en_retard', 'risques_critiques', 'risques_non_resolus']);

const contratRow = (c) => compact({
    id: c.id,
    numero: c.numero_contrat,
    titre: clip(c.titre, 90),
    type: c.type_contrat_code,
    statut: c.statut,
    fournisseur: c.partie_b_nom,
    pays: c.pays_partie_b,
    international: c.is_international,
    montant: c.montant,
    devise: c.devise,
    date_debut: c.date_debut,
    date_fin: c.date_fin,
    limite_livraison: c.date_limite_livraison,
    en_retard: c.est_en_retard,
    risques_non_resolus: c.risques_non_resolus,
    risques_critiques: c.risques_critiques,
});

const contratMini = (c, extra) => compact({ id: c.id, numero: c.numero_contrat, titre: clip(c.titre, 70), fournisseur: c.partie_b_nom, ...extra });

const serverFilters = (a) => compact({
    search: a.recherche,
    statut: a.statut,
    type_contrat: a.type_contrat,
    type_partie: a.type_partie,
    is_international: typeof a.international === 'boolean' ? String(a.international) : undefined,
});

const allCache = new Map(); // clé filtres → { at, rows } (60 s) : évite de re-paginer à chaque question
export const clearContratCache = () => allCache.clear();

async function fetchAllContrats(api, filters) {
    const key = JSON.stringify(filters);
    const hit = allCache.get(key);
    if (hit && Date.now() - hit.at < 60000) return hit.rows;
    const rows = [];
    let total = Infinity;
    while (rows.length < total && rows.length < 1000) {
        const { data } = await api.get('/clm/contrats/', { params: { ...filters, limit: 100, offset: rows.length } });
        const page = data.results || [];
        total = typeof data.total === 'number' ? data.total : page.length;
        if (!page.length) break;
        rows.push(...page);
    }
    allCache.set(key, { at: Date.now(), rows });
    return rows;
}

const emptyScopeHint = (ctx) => (
    ctx.role !== 'admin' && !['directeur_centrale', 'directeur_direction'].includes(ctx.role) && !ctx.departementId
        ? "Aucun département n'est affecté à cet utilisateur : sa liste de contrats est vide tant qu'un responsable ne l'a pas affecté."
        : undefined
);

const needsClientFilter = (a) => a.en_retard === true || a.montant_min !== undefined || a.montant_max !== undefined
    || a.devise || a.date_fin_avant || a.date_fin_apres;

const clientFilter = (rows, a) => rows.filter((c) => {
    if (a.en_retard === true && !c.est_en_retard) return false;
    if (a.montant_min !== undefined && !(Number(c.montant) >= Number(a.montant_min))) return false;
    if (a.montant_max !== undefined && !(Number(c.montant) <= Number(a.montant_max))) return false;
    if (a.devise && String(c.devise || '').toUpperCase() !== String(a.devise).toUpperCase()) return false;
    if (a.date_fin_avant && !(c.date_fin && c.date_fin <= a.date_fin_avant)) return false;
    if (a.date_fin_apres && !(c.date_fin && c.date_fin >= a.date_fin_apres)) return false;
    return true;
});

const SORTS = ['date_creation', '-date_creation', 'montant', '-montant', 'date_fin', '-date_fin'];
const sortRows = (rows, tri) => {
    if (!SORTS.includes(tri)) return rows;
    const desc = tri.startsWith('-');
    const field = tri.replace('-', '');
    return [...rows].sort((x, y) => {
        const a = x[field]; const b = y[field];
        if (a === b) return 0;
        if (a === null || a === undefined) return 1;
        if (b === null || b === undefined) return -1;
        return (a > b ? 1 : -1) * (desc ? -1 : 1);
    });
};

async function rechercherContrats(a, ctx) {
    const limite = Math.min(Math.max(parseInt(a.limite, 10) || 10, 1), 20);
    const filters = serverFilters(a);
    let rows;
    let total;
    if (needsClientFilter(a)) {
        rows = sortRows(clientFilter(await fetchAllContrats(ctx.api, filters), a), a.tri || '-date_creation');
        total = rows.length;
    } else {
        const { data } = await ctx.api.get('/clm/contrats/', { params: { ...filters, ordering: SORTS.includes(a.tri) ? a.tri : undefined, limit: limite, offset: 0 } });
        rows = data.results || [];
        total = typeof data.total === 'number' ? data.total : rows.length;
    }
    const shown = rows.slice(0, limite);
    shown.forEach((c) => remember(ctx, 'contrat', c.id, contratEntity(c)));
    return compact({ total, affiches: shown.length, contrats: shown.map(contratRow), remarque: total === 0 ? emptyScopeHint(ctx) : undefined });
}

const addAmount = (bucket, devise, montant) => {
    const n = Number(montant);
    if (!Number.isFinite(n) || !n) return;
    const d = devise || 'devise inconnue';
    bucket[d] = Math.round(((bucket[d] || 0) + n) * 100) / 100;
};

async function statistiquesContrats(a, ctx) {
    const horizon = Math.min(Math.max(parseInt(a.echeance_jours, 10) || 90, 1), 730);
    const rows = await fetchAllContrats(ctx.api, serverFilters(a));
    rows.forEach((c) => remember(ctx, 'contrat', c.id, contratEntity(c)));
    if (!rows.length) return compact({ total: 0, remarque: emptyScopeHint(ctx) || 'Aucun contrat ne correspond dans votre périmètre.' });

    const parStatut = {};
    const parType = {};
    const montants = {};
    const fournisseurs = {};
    rows.forEach((c) => {
        parStatut[c.statut] = (parStatut[c.statut] || 0) + 1;
        const type = c.type_contrat_code || 'autre';
        parType[type] = parType[type] || { nombre: 0, montants: {} };
        parType[type].nombre += 1;
        addAmount(parType[type].montants, c.devise, c.montant);
        addAmount(montants, c.devise, c.montant);
        const f = c.partie_b_nom || 'Non renseigné';
        fournisseurs[f] = fournisseurs[f] || { nom: f, nombre: 0, montants: {} };
        fournisseurs[f].nombre += 1;
        addAmount(fournisseurs[f].montants, c.devise, c.montant);
    });

    const actifs = rows.filter((c) => c.statut === 'actif');
    const withDays = (list, field) => list
        .map((c) => ({ c, jours: daysUntil(c[field]) }))
        .filter((x) => x.jours !== null);
    const echeances = withDays(actifs, 'date_fin').filter((x) => x.jours >= 0 && x.jours <= horizon).sort((x, y) => x.jours - y.jours);
    const depasses = withDays(actifs, 'date_fin').filter((x) => x.jours < 0).sort((x, y) => x.jours - y.jours);
    const retards = rows.filter((c) => c.est_en_retard)
        .map((c) => ({ c, jours: daysUntil(c.date_limite_livraison) }))
        .sort((x, y) => (x.jours ?? 0) - (y.jours ?? 0));
    const brouillons = rows.filter((c) => c.statut === 'brouillon');
    const critiques = rows.filter((c) => c.risques_critiques > 0);

    return compact({
        total: rows.length,
        par_statut: parStatut,
        par_type: parType,
        montant_total_par_devise: montants,
        internationaux: rows.filter((c) => c.is_international).length,
        livraisons_en_retard: compact({
            nombre: retards.length,
            contrats: retards.slice(0, 8).map((x) => contratMini(x.c, { limite_livraison: x.c.date_limite_livraison, jours_de_retard: x.jours !== null ? Math.abs(x.jours) : undefined })),
        }),
        [`actifs_expirant_sous_${horizon}_jours`]: compact({
            nombre: echeances.length,
            dont_sous_30_jours: echeances.filter((x) => x.jours <= 30).length,
            contrats: echeances.slice(0, 8).map((x) => contratMini(x.c, { date_fin: x.c.date_fin, jours_restants: x.jours })),
        }),
        actifs_dont_la_date_de_fin_est_depassee: compact({
            nombre: depasses.length,
            contrats: depasses.slice(0, 5).map((x) => contratMini(x.c, { date_fin: x.c.date_fin })),
        }),
        brouillons_non_soumis: compact({ nombre: brouillons.length, contrats: brouillons.slice(0, 6).map((c) => contratMini(c)) }),
        risques: compact({
            non_resolus_total: rows.reduce((s, c) => s + (c.risques_non_resolus || 0), 0),
            contrats_avec_risque_critique: critiques.length,
            contrats: critiques.slice(0, 6).map((c) => contratMini(c, { risques_critiques: c.risques_critiques })),
        }),
        principaux_fournisseurs: Object.values(fournisseurs).sort((x, y) => y.nombre - x.nombre).slice(0, 6),
    });
}

const risqueRow = (r) => compact({
    id: r.id, code: r.code, type: r.type, severite: r.severite, niveau_alerte: r.niveau_alerte,
    description: clip(fr(r.description), 260), suggestion: clip(fr(r.suggestion), 260),
    article: r.article_ref, occurrences: r.occurrence_count > 1 ? r.occurrence_count : undefined, resolu: r.resolu,
});

/** Détail élagué d'un contrat — sert aussi aux helpers (résumé, vérification). */
export function trimContratDetail(data) {
    const c = (data && data.contrat) || data || {};
    const r = (data && data.risques) || {};
    const contrat = compact({
        ...pick(c, ['id', 'numero_contrat', 'titre', 'statut', 'objet', 'partie_a_nom', 'partie_b_nom', 'pays_partie_b', 'type_partie',
            'montant', 'devise', 'conditions_paiement', 'date_signature', 'date_debut', 'date_fin', 'delai_livraison_mois',
            'date_limite_livraison', 'jours_restants_livraison', 'societe_b_siege_social']),
        type: c.type_contrat_code,
        international: c.is_international,
        en_retard: c.est_en_retard,
        representant_a: [c.rep_a_prenom, c.rep_a_nom, c.rep_a_fonction].filter(Boolean).join(' ') || undefined,
        representant_b: [c.rep_b_prenom, c.rep_b_nom, c.rep_b_fonction].filter(Boolean).join(' ') || undefined,
        importe_par_ocr: c.ocr_effectue,
    });
    if (contrat.objet) contrat.objet = clip(contrat.objet, 900);
    if (contrat.conditions_paiement) contrat.conditions_paiement = clip(contrat.conditions_paiement, 500);
    const actifs = [...(r.retard || []), ...(r.imprecision || []), ...(r.different || [])];
    return compact({
        contrat,
        metadonnees: data && data.metadonnees && Object.keys(data.metadonnees).length ? data.metadonnees : undefined,
        risques: compact({
            total: r.total, non_resolus: r.non_resolus, critiques: r.critiques,
            liste: actifs.slice(0, 12).map(risqueRow),
            deja_resolus: (r.resolus || []).length || undefined,
        }),
        // escalade / notifications_en_attente / decisions : toujours vides côté serveur → retirés.
    });
}

async function resolveContratId(a, ctx) {
    if (a.id !== undefined && a.id !== null && a.id !== '') return a.id;
    if (!a.numero) throw new Error('Indique id ou numero.');
    const { data } = await ctx.api.get('/clm/contrats/', { params: { search: a.numero, limit: 5 } });
    const rows = data.results || [];
    const exact = rows.find((c) => String(c.numero_contrat).toLowerCase() === String(a.numero).toLowerCase());
    const found = exact || rows[0];
    if (!found) throw new Error(`Aucun contrat « ${a.numero} » dans votre périmètre.`);
    return found.id;
}

async function detailContrat(a, ctx) {
    const id = await resolveContratId(a, ctx);
    const { data } = await ctx.api.get(`/clm/contrats/${id}/`);
    const c = data.contrat || data;
    remember(ctx, 'contrat', c.id, {
        ...contratEntity(c),
        risques_critiques: data.risques ? data.risques.critiques : undefined,
        risques_non_resolus: data.risques ? data.risques.non_resolus : undefined,
    });
    return trimContratDetail(data);
}

// ── alertes de risque ───────────────────────────────────────────────────────
const alerteEntity = (al) => ({
    ...pick(al, ['_id', 'contrat_id', 'code', 'type', 'severite', 'statut', 'createdAt', 'occurrence_count']),
    description: clip(fr(al.description), 200),
    niveau: al.escalade && al.escalade.niveau,
});
const alerteRow = (al) => compact({
    id: al._id, contrat_id: al.contrat_id, code: al.code, type: al.type, severite: al.severite, statut: al.statut,
    niveau_escalade: al.escalade && al.escalade.niveau,
    description: clip(fr(al.description), 240), suggestion: clip(fr(al.suggestion), 200),
    occurrences: al.occurrence_count > 1 ? al.occurrence_count : undefined,
    date: al.createdAt ? String(al.createdAt).slice(0, 10) : undefined,
    note_resolution: clip(al.resolution_note, 160),
});

async function alertesRisque(a, ctx) {
    const limit = Math.min(Math.max(parseInt(a.limite, 10) || 10, 1), 20);
    const { data } = await ctx.api.get('/notifications/risk-alerts', {
        params: compact({ contrat_id: a.contrat_id, type: a.type, severite: a.severite, statut: a.statut, page: a.page || 1, limit }),
    });
    const alerts = data.alerts || [];
    alerts.forEach((al) => remember(ctx, 'alerte', al._id, alerteEntity(al)));
    return compact({ total: data.total ?? alerts.length, page: data.page, pages: data.pages, alertes: alerts.map(alerteRow) });
}

// ── bibliothèque juridique ──────────────────────────────────────────────────
const docEntity = (d) => pick(d, ['_id', 'titre', 'categorie', 'reference', 'statut', 'pdfUrl', 'datePublication', 'organismeEmetteur']);
const docRow = (d, full) => compact({
    id: d._id, titre: clip(d.titre, 140), categorie: d.categorie, reference: d.reference,
    organisme: d.organismeEmetteur, date: d.datePublication ? String(d.datePublication).slice(0, 10) : undefined,
    statut: d.statut, // EN_VIGUEUR | ABROGE | MODIFIE
    mots_cles: Array.isArray(d.motsCles) ? d.motsCles.slice(0, 8).join(', ') : d.motsCles,
    resume: clip(d.resume, full ? 1200 : 260),
});

async function rechercherBibliotheque(a, ctx) {
    const queries = (Array.isArray(a.requetes) ? a.requetes : [a.requetes]).map((q) => String(q || '').trim()).filter(Boolean).slice(0, 4);
    if (!queries.length) throw new Error('Donne au moins un mot-clé dans "requetes".');
    const found = new Map();
    const misses = [];
    for (const q of queries) {
        const { data } = await ctx.api.get('/bib/search', { params: { q } });
        const docs = data.data || [];
        if (!docs.length) misses.push(q);
        docs.forEach((d) => {
            const entry = found.get(d._id) || { d, score: 0 };
            entry.score += 1;
            found.set(d._id, entry);
        });
    }
    let docs = [...found.values()].sort((x, y) => y.score - x.score).map((x) => x.d);
    if (a.categorie) docs = docs.filter((d) => d.categorie === a.categorie);
    docs.slice(0, 8).forEach((d) => remember(ctx, 'document', d._id, docEntity(d)));
    return compact({
        total: docs.length,
        documents: docs.slice(0, 8).map((d) => docRow(d)),
        requetes_sans_resultat: misses,
        remarque: docs.length ? undefined : 'Aucun texte correspondant dans la bibliothèque Lexora. Ne cite pas de texte de mémoire comme s’il y figurait.',
    });
}

async function listerDocuments(a, ctx) {
    const limit = Math.min(Math.max(parseInt(a.limite, 10) || 10, 1), 20);
    const { data } = await ctx.api.get('/bib/documents', { params: compact({ page: a.page || 1, limit, categorie: a.categorie }) });
    const docs = data.data || [];
    docs.forEach((d) => remember(ctx, 'document', d._id, docEntity(d)));
    return compact({ total: data.total, page: data.page, documents: docs.map((d) => docRow(d)) });
}

async function detailDocument(a, ctx) {
    const { data } = await ctx.api.get(`/bib/documents/${encodeURIComponent(a.id)}`);
    const d = data.data || data;
    remember(ctx, 'document', d._id, docEntity(d));
    return docRow(d, true);
}

// ── utilisateurs & organisation ─────────────────────────────────────────────
const usersOf = (data) => data.users || data.data || (Array.isArray(data) ? data : []);
// Volontairement minimal : ni e-mail, ni téléphone, ni matricule envoyés au modèle.
const userRow = (u) => compact({
    id: u.id, nom: u.nom_complet || [u.prenom, u.nom].filter(Boolean).join(' '),
    role: u.role || 'aucun rôle', role_libelle: ROLE_LABELS[u.role], actif: u.is_active === false ? 'non' : undefined,
});
const userEntity = (u) => ({ id: u.id, nom_complet: u.nom_complet || [u.prenom, u.nom].filter(Boolean).join(' '), role: u.role });
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

async function publicUsers(ctx) {
    const { data } = await ctx.api.get('/auth/all_users/public/');
    return usersOf(data);
}

async function rechercherUtilisateur(a, ctx) {
    let users = await publicUsers(ctx);
    if (a.q) users = users.filter((u) => norm(`${u.nom_complet} ${u.prenom} ${u.nom}`).includes(norm(a.q)));
    if (a.role) users = users.filter((u) => u.role === a.role);
    users.slice(0, 10).forEach((u) => remember(ctx, 'utilisateur', u.id, userEntity(u)));
    return { total: users.length, utilisateurs: users.slice(0, 10).map(userRow) };
}

const UNIT_KEYS = ['activite_id', 'direction_id', 'departement_id', 'direction_centrale_id', 'structure_id', 'direction_activite_id', 'division_activite_id'];
const hasUnit = (u) => UNIT_KEYS.some((k) => u[k]);

async function listerUtilisateurs(a, ctx) {
    const { data } = await ctx.api.get('/auth/users/');
    const all = usersOf(data);
    let users = all;
    if (a.filtre === 'sans_role') users = users.filter((u) => !u.role);
    if (a.filtre === 'inactifs') users = users.filter((u) => u.is_active === false);
    if (a.filtre === 'sans_unite') users = users.filter((u) => !hasUnit(u));
    if (a.role) users = users.filter((u) => u.role === a.role);
    if (a.q) users = users.filter((u) => norm(`${u.nom_complet} ${u.prenom} ${u.nom}`).includes(norm(a.q)));
    const parRole = {};
    all.forEach((u) => { const k = u.role || 'aucun rôle'; parRole[k] = (parRole[k] || 0) + 1; });
    users.slice(0, 15).forEach((u) => remember(ctx, 'utilisateur', u.id, userEntity(u)));
    return {
        note: 'Comptes hors administrateurs.',
        total_utilisateurs: all.length,
        repartition_par_role: parRole,
        // compteurs calculés ici : le modèle n'a pas à les déduire de la liste
        sans_role: all.filter((u) => !u.role).length,
        sans_unite_affectee: all.filter((u) => !hasUnit(u)).length,
        inactifs: all.filter((u) => u.is_active === false).length,
        correspondants: users.length,
        utilisateurs: users.slice(0, 15).map((u) => ({ ...userRow(u), unite_affectee: hasUnit(u) ? 'oui' : 'non' })),
    };
}

// Chemins réels du service juridique — les bizarreries font partie de l'API (FEATURES §6).
const ORG = {
    directions_centrales: { path: '/juridique/directions-centrales' },
    directions: { path: '/juridique/directions', parent: 'directionCentrale' },
    departements: { path: '/juridique/departements', parent: 'direction' },
    activites: { path: '/juridique/activites' },
    directions_activite: { path: '/juridique/direction_activite', parent: 'activite' },
    departements_activite: { path: '/juridique/departemet_activite', parent: 'directionActivite' },
    divisions: { path: '/juridique/division', parent: 'activite' },
    structures: { path: '/juridique/structure', parent: 'division' },
};

const orgTree = (node, depth = 0) => {
    if (Array.isArray(node)) return node.slice(0, 25).map((n) => orgTree(n, depth));
    if (!node || typeof node !== 'object') return node;
    const out = compact({ id: node._id, code: node.code, nom: node.nom, type: node.type, actif: node.actif === false ? 'non' : undefined });
    if (depth < 4) {
        Object.entries(node).forEach(([k, v]) => {
            if (Array.isArray(v) && v.length && typeof v[0] === 'object') out[k] = orgTree(v, depth + 1);
        });
    }
    return out;
};

async function structureOrg(a, ctx) {
    if (a.type === 'organigramme') {
        if (!a.id) throw new Error("Donne l'id de la direction centrale (obtenu via type=directions_centrales).");
        const { data } = await ctx.api.get(`/juridique/directions-centrales/${encodeURIComponent(a.id)}/organigramme`);
        return { organigramme: orgTree(data.data || data) };
    }
    const def = ORG[a.type];
    if (!def) throw new Error('Type inconnu.');
    const params = def.parent && a.parent_id ? { [def.parent]: a.parent_id } : undefined;
    const { data } = await ctx.api.get(def.path, { params });
    const items = data.data || [];
    return { type: a.type, total: data.count ?? items.length, elements: items.slice(0, 40).map((n) => compact({ id: n._id, code: n.code, nom: n.nom, type: n.type, actif: n.actif === false ? 'non' : undefined })) };
}

const MEMBRES = {
    direction_responsables_departement: (id) => `/affectation/directions/${id}/responsables-departement/`,
    departement_responsables: (id) => `/affectation/departements/${id}/responsables-departement/`,
    activite_directeurs_direction: (id) => `/affectation/activites/${id}/directeurs-direction/`,
    activite_vice_presidents: (id) => `/affectation/activites/${id}/vice-presidents/`,
    activite_directeurs_direction_activite: (id) => `/affectation/activites/${id}/directeurs-direction-activite/`,
    direction_centrale_directeurs: (id) => `/affectation/directions-centrales/${id}/directeurs-centrale/`,
    direction_centrale_assistants: (id) => `/affectation/directions-centrales/${id}/assistants/`,
    structure_responsables_direction_division: (id) => `/affectation/structures/${id}/responsables-direction-division/`,
    structure_responsables_departement_division: (id) => `/affectation/structures/${id}/responsables-departement-division/`,
};

async function membresUnite(a, ctx) {
    const build = MEMBRES[a.relation];
    if (!build) throw new Error('Relation inconnue.');
    const { data } = await ctx.api.get(build(encodeURIComponent(a.id)));
    const users = Array.isArray(data.data) ? data.data : [];
    users.forEach((u) => remember(ctx, 'utilisateur', u.id, userEntity(u)));
    return { total: data.count ?? users.length, membres: users.slice(0, 15).map(userRow) };
}

// ── messagerie ──────────────────────────────────────────────────────────────
async function messagerieEtat(a, ctx) {
    // NB : ne PAS lire /notifications/messages/<id> ici — cet appel marque les messages comme lus.
    const [convs, unread] = await Promise.all([
        ctx.api.get('/notifications/conversations'),
        ctx.api.get('/notifications/unread/count'),
    ]);
    const me = String(ctx.userId);
    const list = Array.isArray(convs.data) ? convs.data : [];
    return {
        messages_non_lus: unread.data.unreadCount || 0,
        conversations: list.slice(0, 10).map((c) => {
            const other = (c.participants || []).find((p) => String(p.userId) !== me) || {};
            return compact({ avec: other.nom_complet || other.role, dernier_message: clip(c.lastMessage, 120), date: c.lastMessageAt ? String(c.lastMessageAt).slice(0, 16).replace('T', ' ') : undefined });
        }),
    };
}

async function envoyerMessage(a, ctx) {
    const content = String(a.contenu || '').trim();
    if (!content) throw new Error('Message vide.');
    const target = ctx.entities.utilisateur[String(a.destinataire_id)] || (await publicUsers(ctx).then((us) => us.map(userEntity).find((u) => String(u.id) === String(a.destinataire_id))));
    if (!target) throw new Error('Destinataire introuvable : utilise rechercher_utilisateur pour obtenir son id.');
    const conv = await ctx.api.post('/notifications/conversations/direct', {
        targetUserId: String(target.id), targetUserRole: target.role, targetUserName: target.nom_complet,
    });
    await ctx.api.post('/notifications/messages', { conversationId: conv.data._id, content });
    return { ok: true, message: `Message envoyé à ${target.nom_complet}.` };
}

// ── actions CLM / alertes ───────────────────────────────────────────────────
const ALERT_STATUTS = ['nouveau', 'en_cours', 'resolu', 'ignore'];

async function traiterAlerte(a, ctx) {
    if (!ALERT_STATUTS.includes(a.statut)) throw new Error('Statut invalide.');
    const { data } = await ctx.api.patch(`/notifications/risk-alerts/${encodeURIComponent(a.alerte_id)}`, compact({ statut: a.statut, resolution_note: a.note }));
    return { ok: true, alerte: alerteRow(data.alert || data) };
}

const EDITABLE = ['titre', 'type_contrat', 'pays_partie_b', 'objet', 'date_signature', 'date_debut', 'date_fin', 'montant', 'devise', 'conditions_paiement'];

async function modifierBrouillon(a, ctx) {
    const body = pick(a.champs && typeof a.champs === 'object' ? a.champs : a, EDITABLE); // jamais partie_b_nom : ignoré en silence par le backend
    if (!Object.keys(body).length) throw new Error('Aucun champ modifiable fourni.');
    const { data } = await ctx.api.put(`/clm/contrats/${encodeURIComponent(a.id)}/update/`, body);
    clearContratCache();
    return { ok: true, champs_modifies: Object.keys(body), numero: data.contrat && data.contrat.numero_contrat };
}

async function soumettreContrat(a, ctx) {
    await ctx.api.post(`/clm/contrats/${encodeURIComponent(a.id)}/submit/`);
    clearContratCache();
    return { ok: true, message: 'Contrat soumis : il est maintenant actif et ne peut plus être modifié.' };
}

async function renvoyerAlertes(a, ctx) {
    const { data } = await ctx.api.post(`/clm/contrats/${encodeURIComponent(a.contrat_id)}/analyser/`);
    return compact({ ok: true, risques_retard_renvoyes: (data.risques_retard || []).length, notifications_envoyees: data.notification && data.notification.sent_count });
}

export const PREFILL_KEY = 'lexora_ai_prefill_contrat';
export const PREFILL_EVENT = 'lexora:prefill-contrat';
const PREFILL_FIELDS = ['numero_contrat', 'titre', 'type_contrat', 'societe_b_nom', 'pays_partie_b', 'objet', 'date_signature', 'date_debut',
    'montant', 'devise', 'conditions_paiement', 'societe_b_siege_social', 'delai_livraison_mois', 'duree_garantie_mois', 'caution_bonne_fin_pct', 'tribunal_competent'];

async function preparerContrat(a, ctx) {
    const prefill = pick(a, PREFILL_FIELDS);
    // Un 0 sur un champ numérique = valeur inventée par le modèle, pas une saisie : on l'écarte.
    ['montant', 'delai_livraison_mois', 'duree_garantie_mois', 'caution_bonne_fin_pct'].forEach((k) => { if (!Number(prefill[k])) delete prefill[k]; });
    if (!Object.keys(prefill).length) throw new Error('Aucun champ fourni.');
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
    ctx.navigate(`${rolePath(ctx.role)}/contrat`);
    // Si l'écran est déjà monté, il n'y aura pas de remontage : on le prévient par évènement.
    setTimeout(() => window.dispatchEvent(new CustomEvent(PREFILL_EVENT)), 150);
    // NB : on ne ferme pas le chat ici — outil « terminal », c'est le panneau qui ferme une fois la réponse enregistrée.
    const missing = ['titre', 'type_contrat', 'societe_b_nom', 'objet'].filter((k) => !prefill[k]);
    return compact({
        ok: true,
        message: "Formulaire « Nouveau contrat » ouvert et pré-rempli. Rien n'est enregistré : l'utilisateur doit vérifier puis cliquer sur Enregistrer.",
        champs_pre_remplis: Object.keys(prefill),
        champs_obligatoires_encore_vides: missing,
    });
}

async function ouvrirEcran(a, ctx) {
    const screens = screensForRole(ctx.role);
    if (!screens[a.ecran] || !rolePath(ctx.role)) throw new Error("Écran indisponible pour ce rôle.");
    ctx.navigate(`${rolePath(ctx.role)}/${a.ecran}`);
    return { ok: true, message: `Écran « ${screens[a.ecran]} » ouvert.`, ecran: screens[a.ecran] };
}

async function telechargerPdfContrat(a, ctx) {
    const id = await resolveContratId(a, ctx);
    const res = await ctx.api.get(`/clm/contrats/${id}/pdf/`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Contrat_${a.numero || id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    return { ok: true, message: 'Téléchargement du PDF lancé.' };
}

// ── schémas ─────────────────────────────────────────────────────────────────
// COMPACTS exprès : ils sont renvoyés à chaque tour de boucle et le quota Groq se
// compte en tokens/minute. Pas de description là où le nom du champ suffit.
const str = (description, extra) => ({ type: 'string', ...(description ? { description } : {}), ...extra });
const num = (description) => ({ type: 'number', ...(description ? { description } : {}) });
const bool = { type: 'boolean' };
const obj = (properties, required) => ({ type: 'object', properties, ...(required ? { required } : {}) });
const STATUTS = ['brouillon', 'actif', 'expire', 'resilie'];
const TYPES = ['service', 'fourniture', 'travaux', 'partenariat', 'vente', 'transfert'];
const CATEGORIES = ['CONSTITUTION', 'TRAITES_ET_ACCORDS', 'LOIS', 'ORDONNANCES', 'DECRETS', 'DECISIONS_ET_ARRETES', 'TEXTES_REGLEMENTAIRES', 'CONTRATS_ET_MODELES', 'DOCUMENTATION_INTERNE', 'JURISPRUDENCE'];
const DATE = str('AAAA-MM-JJ');

const contratFilters = {
    recherche: str('numéro, titre, fournisseur ou objet'),
    statut: str('', { enum: STATUTS }),
    type_contrat: str('', { enum: TYPES }),
    type_partie: str('', { enum: ['nationale', 'etrangere'] }),
    international: bool,
};

const contratFields = {
    titre: str(), type_contrat: str('', { enum: TYPES }), pays_partie_b: str(), objet: str(),
    date_signature: DATE, date_debut: DATE, montant: num(), devise: str(), conditions_paiement: str(),
};

const line = (label, value) => (value === undefined || value === null || value === '' ? null : [label, String(value)]);
const contratLabel = (ctx, id) => {
    const c = ctx.entities.contrat[String(id)];
    return c ? `${c.numero_contrat} — ${c.titre}` : `#${id}`;
};
const findUser = async (ctx, id) => ctx.entities.utilisateur[String(id)]
    || publicUsers(ctx).then((users) => users.map(userEntity).find((u) => String(u.id) === String(id))).catch(() => null);

const TOOLS = [
    {
        name: 'rechercher_contrats', label: 'Recherche dans les contrats', roles: 'all', run: rechercherContrats,
        description: "Liste les contrats du périmètre de l'utilisateur. Pour des totaux ou des échéances : statistiques_contrats.",
        parameters: obj({
            ...contratFilters, en_retard: bool, montant_min: num(), montant_max: num(), devise: str(),
            date_fin_avant: DATE, date_fin_apres: DATE, tri: str('', { enum: SORTS }), limite: num('max 20'),
        }),
    },
    {
        name: 'statistiques_contrats', label: 'Calcul des statistiques des contrats', roles: 'all', run: statistiquesContrats,
        description: 'Agrégats sur TOUS les contrats du périmètre : par statut/type, montants par devise, retards, échéances proches, brouillons, risques critiques, fournisseurs.',
        parameters: obj({ ...contratFilters, echeance_jours: num('défaut 90') }),
    },
    {
        name: 'detail_contrat', label: 'Lecture du contrat', roles: 'all', run: detailContrat,
        description: "Détail d'un contrat : parties, objet, montant, dates, métadonnées, risques détectés et suggestions.",
        parameters: obj({ id: num(), numero: str('ex. CTR-2026-001') }),
    },
    {
        name: 'alertes_risque', label: 'Lecture des alertes de risque', roles: 'all', run: alertesRisque,
        description: 'Alertes de risque et leur statut de traitement (filtrables par contrat).',
        parameters: obj({
            contrat_id: num(), type: str('', { enum: ['retard', 'imprecision', 'different'] }),
            severite: str('', { enum: ['faible', 'moyen', 'eleve', 'critique'] }), statut: str('', { enum: ALERT_STATUTS }), limite: num('max 20'),
        }),
    },
    {
        name: 'rechercher_bibliotheque', label: 'Recherche dans la bibliothèque juridique', roles: 'all', run: rechercherBibliotheque,
        description: 'Cherche des textes juridiques (lois, décrets, modèles…) par mots-clés : donner 2 à 4 formulations courtes.',
        parameters: obj({ requetes: { type: 'array', items: { type: 'string' } } }, ['requetes']),
    },
    {
        name: 'lister_documents', label: 'Lecture de la bibliothèque', roles: 'all', run: listerDocuments,
        description: 'Documents récents de la bibliothèque, par catégorie.',
        parameters: obj({ categorie: str('', { enum: CATEGORIES }), page: num(), limite: num('max 20') }),
    },
    {
        name: 'detail_document', label: 'Lecture du document', roles: 'all', run: detailDocument,
        description: "Fiche complète d'un document de la bibliothèque.",
        parameters: obj({ id: str() }, ['id']),
    },
    {
        name: 'rechercher_utilisateur', label: "Recherche dans l'annuaire", roles: 'all', run: rechercherUtilisateur,
        description: 'Trouve un utilisateur par nom et/ou rôle exact (donne son id).',
        parameters: obj({ q: str('nom'), role: str('ex. admin, directeur_direction') }),
    },
    {
        name: 'structure_org', label: "Lecture de l'organisation", roles: 'all', run: structureOrg,
        description: "Unités de l'organisation par type (filtrables par parent_id), ou organigramme d'une direction centrale (type=organigramme + id).",
        parameters: obj({ type: str('', { enum: [...Object.keys(ORG), 'organigramme'] }), parent_id: str(), id: str() }, ['type']),
    },
    {
        name: 'membres_unite', label: "Recherche des responsables de l'unité", roles: 'all', run: membresUnite,
        description: 'Qui dirige ou compose une unité.',
        parameters: obj({ relation: str('', { enum: Object.keys(MEMBRES) }), id: str("id de l'unité") }, ['relation', 'id']),
    },
    {
        name: 'messagerie_etat', label: 'Lecture de la messagerie', roles: 'all', run: messagerieEtat,
        description: 'Messages non lus et dernières conversations.',
        parameters: obj({}),
    },
    {
        name: 'lister_utilisateurs', label: 'Analyse des comptes utilisateurs', roles: ['admin'], run: listerUtilisateurs,
        description: 'Comptes par rôle et liste filtrée.',
        parameters: obj({ filtre: str('', { enum: ['tous', 'sans_role', 'inactifs', 'sans_unite'] }), role: str(), q: str('nom') }),
    },
    {
        name: 'ouvrir_ecran', label: "Ouverture de l'écran", roles: 'all', run: ouvrirEcran,
        description: "Ouvre un écran de l'application.",
        // terminal : la boucle s'arrête ici (pas de nouvel appel IA), le chat se ferme sur l'écran demandé.
        terminal: true,
        finalText: (result) => `J'ai ouvert l'écran **${result.ecran}**.`,
    },
    {
        name: 'telecharger_pdf_contrat', label: 'Génération du PDF', roles: 'all', run: telechargerPdfContrat,
        description: "Télécharge le PDF d'un contrat.",
        parameters: obj({ id: num(), numero: str() }),
    },

    // ── écritures : toujours derrière une carte de confirmation ──
    {
        name: 'envoyer_message', label: 'Préparation du message', roles: 'all', run: envoyerMessage, confirm: true,
        description: "Envoie un message interne (l'utilisateur confirme avant l'envoi). L'id vient de rechercher_utilisateur ou membres_unite.",
        parameters: obj({ destinataire_id: num(), contenu: str('texte prêt à envoyer') }, ['destinataire_id', 'contenu']),
        preview: async (a, ctx) => {
            const target = await findUser(ctx, a.destinataire_id);
            return {
                titre: 'Envoyer ce message ?', bouton: 'Envoyer',
                lignes: [line('Destinataire', target ? `${target.nom_complet} — ${ROLE_LABELS[target.role] || target.role || 'sans rôle'}` : `Utilisateur #${a.destinataire_id} (introuvable)`)].filter(Boolean),
                editable: { champ: 'contenu', label: 'Message' },
            };
        },
    },
    {
        name: 'traiter_alerte', label: "Préparation du traitement de l'alerte", roles: 'all', run: traiterAlerte, confirm: true,
        description: "Change le statut d'une alerte de risque, avec note de résolution facultative.",
        parameters: obj({ alerte_id: str(), statut: str('', { enum: ALERT_STATUTS }), note: str() }, ['alerte_id', 'statut']),
        preview: async (a, ctx) => {
            const al = ctx.entities.alerte[String(a.alerte_id)];
            return {
                titre: 'Mettre à jour cette alerte ?', bouton: 'Mettre à jour',
                lignes: [
                    line('Alerte', al ? `${al.code} — contrat #${al.contrat_id}` : a.alerte_id),
                    line('Description', al && al.description),
                    line('Nouveau statut', { nouveau: 'Nouveau', en_cours: 'En cours', resolu: 'Résolu', ignore: 'Ignoré' }[a.statut] || a.statut),
                ].filter(Boolean),
                editable: a.statut === 'resolu' || a.note ? { champ: 'note', label: 'Note de résolution' } : undefined,
            };
        },
    },
    {
        name: 'preparer_contrat', label: 'Préparation du formulaire de contrat', roles: RD, run: preparerContrat,
        terminal: true,
        finalText: (result) => {
            const LABELS = { titre: 'titre', type_contrat: 'type de contrat', societe_b_nom: 'fournisseur', objet: 'objet', pays_partie_b: 'pays', montant: 'montant', devise: 'devise', date_signature: 'date de signature', date_debut: 'date de début', conditions_paiement: 'conditions de paiement', societe_b_siege_social: 'siège social', delai_livraison_mois: 'délai de livraison', duree_garantie_mois: 'garantie', caution_bonne_fin_pct: 'caution de bonne fin', tribunal_competent: 'tribunal compétent', numero_contrat: 'numéro' };
            const list = (keys) => keys.map((k) => LABELS[k] || k).join(', ');
            const missing = result.champs_obligatoires_encore_vides || [];
            return `J'ai ouvert le formulaire **Nouveau contrat**, pré-rempli avec : ${list(result.champs_pre_remplis || [])}.\n\nRien n'est enregistré : vérifiez chaque champ puis validez.${missing.length ? ` Il reste à renseigner (obligatoire) : **${list(missing)}**.` : ''} Je n'ai rempli que ce que vous m'avez indiqué — les dates et les autres valeurs sont à saisir par vous.`;
        },
        description: "Ouvre le formulaire « Nouveau contrat » pré-rempli (rien n'est enregistré). Ne remplis QUE ce que l'utilisateur a dit : n'invente ni date, ni délai, ni garantie, ni montant. La durée du contrat n'est pas un champ : écris-la dans l'objet. Obligatoires : titre, type_contrat, societe_b_nom, objet.",
        parameters: obj({
            ...contratFields, societe_b_nom: str('fournisseur'), societe_b_siege_social: str(),
            delai_livraison_mois: num(), duree_garantie_mois: num(), caution_bonne_fin_pct: num(), tribunal_competent: str(),
        }),
    },
    {
        name: 'modifier_brouillon', label: 'Préparation de la modification', roles: RD, run: modifierBrouillon, confirm: true,
        description: 'Modifie un contrat BROUILLON. Champs possibles : titre, type_contrat, pays_partie_b, objet, date_signature, date_debut, date_fin, montant, devise, conditions_paiement (fournisseur non modifiable).',
        parameters: obj({ id: num(), champs: { type: 'object', description: 'champ → nouvelle valeur' } }, ['id', 'champs']),
        preview: async (a, ctx) => ({
            titre: 'Modifier ce brouillon ?', bouton: 'Modifier',
            lignes: [
                line('Contrat', contratLabel(ctx, a.id)),
                ...Object.entries(pick(a.champs && typeof a.champs === 'object' ? a.champs : a, EDITABLE)).map(([k, v]) => line(k.replace(/_/g, ' '), v)),
            ].filter(Boolean),
        }),
    },
    {
        name: 'renvoyer_alertes', label: 'Préparation du renvoi des alertes', roles: RD, run: renvoyerAlertes, confirm: true,
        description: "Renvoie les risques de RETARD non résolus d'un contrat au service de notification (ne ré-analyse pas).",
        parameters: obj({ contrat_id: num() }, ['contrat_id']),
        preview: async (a, ctx) => ({ titre: 'Renvoyer les alertes de retard ?', bouton: 'Renvoyer', lignes: [line('Contrat', contratLabel(ctx, a.contrat_id))].filter(Boolean) }),
    },
    {
        name: 'soumettre_contrat', label: 'Préparation de la soumission', roles: RD, run: soumettreContrat, confirm: true,
        description: 'Soumet un brouillon (devient ACTIF). IRRÉVERSIBLE : seulement sur demande explicite.',
        parameters: obj({ id: num() }, ['id']),
        preview: async (a, ctx) => ({
            titre: 'Soumettre définitivement ce contrat ?', bouton: 'Soumettre', danger: true,
            avertissement: 'Action irréversible : une fois actif, le contrat ne peut plus être modifié.',
            lignes: [line('Contrat', contratLabel(ctx, a.id))].filter(Boolean),
        }),
    },
];

/** Outils visibles pour ce rôle (moins d'outils = meilleur choix du modèle, et moins de tokens). */
export function toolsForRole(role, { readOnly = false } = {}) {
    return TOOLS.filter((t) => (t.roles === 'all' || t.roles.includes(role)) && !(readOnly && (t.confirm || t.name === 'preparer_contrat' || t.name === 'ouvrir_ecran')));
}

/** Définitions envoyées au modèle. */
export function toolDefinitions(tools, role) {
    return tools.map((t) => {
        let parameters = t.parameters;
        let description = t.description;
        if (t.name === 'ouvrir_ecran') {
            const screens = screensForRole(role);
            parameters = obj({ ecran: str('', { enum: Object.keys(screens) }) }, ['ecran']);
            description = `${t.description} Écrans : ${Object.entries(screens).map(([k, v]) => `${k} = ${v}`).join(' ; ')}.`;
        }
        return { type: 'function', function: { name: t.name, description, parameters } };
    });
}

/** Erreur réseau/HTTP → résultat lisible par le modèle (il l'explique à l'utilisateur). */
export function toolError(e) {
    const status = e && e.response && e.response.status;
    const data = (e && e.response && e.response.data) || {};
    if (!status) {
        if (e && e.response === undefined && e.request) return { erreur: 'Service Lexora injoignable (réseau ou service arrêté). Réessayer plus tard.' };
        return { erreur: (e && e.message) || 'Erreur inconnue.' };
    }
    if (status === 403) return { erreur: "Accès refusé : hors du périmètre de l'utilisateur ou action non autorisée pour son rôle." };
    if (status === 404) return { erreur: data.error || data.message || 'Introuvable (ou déjà traité).' };
    if (status >= 502 && status <= 504) return { erreur: 'Ce service Lexora est momentanément indisponible. Réessayer plus tard.' };
    const message = data.error || data.message || data.detail;
    return { erreur: typeof message === 'string' ? message : `Erreur ${status}.` };
}

/** URL publique du PDF d'un document de la bibliothèque. */
export const documentPdfUrl = (doc) => (doc && doc.pdfUrl ? toAbsoluteUrl(doc.pdfUrl) : null);
