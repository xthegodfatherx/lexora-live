import { axiosInstance } from '../axios';

// « Point du jour » affiché à l'ouverture de l'assistant.
// 100 % calculé en JS à partir des API (aucun appel IA : instantané, exact, et ça
// n'entame pas le quota de tokens). Chaque ligne renvoie vers une question prête.

const DAY = 86400000;

async function contratsFacts() {
    const rows = [];
    let total = Infinity;
    while (rows.length < total && rows.length < 500) {
        const { data } = await axiosInstance.get('/clm/contrats/', { params: { limit: 100, offset: rows.length } });
        const page = data.results || [];
        total = typeof data.total === 'number' ? data.total : page.length;
        if (!page.length) break;
        rows.push(...page);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const soon = rows.filter((c) => {
        if (c.statut !== 'actif' || !c.date_fin) return false;
        const days = Math.round((new Date(`${c.date_fin}T00:00:00`) - today) / DAY);
        return days >= 0 && days <= 30;
    }).length;
    return {
        total: rows.length,
        retard: rows.filter((c) => c.est_en_retard).length,
        brouillons: rows.filter((c) => c.statut === 'brouillon').length,
        critiques: rows.filter((c) => c.risques_critiques > 0).length,
        soon,
    };
}

const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

/** @returns {Promise<Array<{icon, label, question, tone}>>} lignes à afficher (peut être vide). */
export async function loadBriefing(role) {
    const [contrats, alertes, unread] = await Promise.allSettled([
        contratsFacts(),
        axiosInstance.get('/notifications/risk-alerts', { params: { statut: 'nouveau', limit: 1 } }),
        axiosInstance.get('/notifications/unread/count'),
    ]);

    const items = [];
    if (contrats.status === 'fulfilled') {
        const c = contrats.value;
        if (c.retard) items.push({ icon: '⏰', tone: 'red', label: plural(c.retard, 'livraison en retard', 'livraisons en retard'), question: 'Quels sont mes contrats en retard et que dois-je faire ?' });
        if (c.critiques) items.push({ icon: '🚨', tone: 'red', label: plural(c.critiques, 'contrat avec risque critique', 'contrats avec risque critique'), question: 'Quels contrats présentent des risques critiques ?' });
        if (c.soon) items.push({ icon: '📅', tone: 'orange', label: `${plural(c.soon, 'contrat expire', 'contrats expirent')} sous 30 jours`, question: 'Quels contrats expirent dans les 30 prochains jours ?' });
        if (c.brouillons && role === 'responsable_departement') items.push({ icon: '📝', tone: 'gray', label: plural(c.brouillons, 'brouillon à finaliser', 'brouillons à finaliser'), question: 'Quels brouillons me reste-t-il à finaliser et que leur manque-t-il ?' });
        if (!items.length && c.total) items.push({ icon: '✅', tone: 'green', label: `${plural(c.total, 'contrat suivi', 'contrats suivis')}, aucun retard`, question: 'Fais la synthèse de mon portefeuille de contrats' });
    }
    if (alertes.status === 'fulfilled') {
        const n = alertes.value.data.total || 0;
        if (n) items.push({ icon: '⚠️', tone: 'orange', label: plural(n, 'nouvelle alerte de risque', 'nouvelles alertes de risque'), question: 'Quelles sont les nouvelles alertes de risque à traiter ?' });
    }
    if (unread.status === 'fulfilled') {
        const n = unread.value.data.unreadCount || 0;
        if (n) items.push({ icon: '💬', tone: 'blue', label: plural(n, 'message non lu', 'messages non lus'), question: 'Ai-je des messages non lus ? De qui ?' });
    }
    return items;
}
