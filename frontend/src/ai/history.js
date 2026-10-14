// Historique de l'assistant, par utilisateur, dans localStorage.
// NB : le logout fait localStorage.clear() → l'historique disparaît à la déconnexion
// (voulu : poste partagé, données de contrats). Un historique persistant = côté backend.

const KEY = (userId) => `lexora_ai_history_${userId || 'anonyme'}`;
const MAX_UI = 60;
const MAX_API = 24;
const OLD_TOOL_RESULT = 500; // les vieux résultats d'outils sont raccourcis (quota de tokens)

/** Garde une fin d'historique valide pour l'API : commence par un message `user`,
 *  ne finit jamais sur un appel d'outil sans résultat. */
export function trimApiMessages(messages) {
    let list = (messages || []).slice(-MAX_API);
    const first = list.findIndex((m) => m.role === 'user');
    list = first === -1 ? [] : list.slice(first);

    // Retirer une fin incomplète (assistant.tool_calls sans tous ses résultats `tool`).
    for (;;) {
        const last = list[list.length - 1];
        if (!last) break;
        if (last.role === 'assistant' && !(last.tool_calls && last.tool_calls.length)) break;
        list.pop();
    }

    const lastUser = list.map((m) => m.role).lastIndexOf('user');
    return list.map((m, i) => (
        m.role === 'tool' && i < lastUser && typeof m.content === 'string' && m.content.length > OLD_TOOL_RESULT
            ? { ...m, content: `${m.content.slice(0, OLD_TOOL_RESULT)}… (ancien résultat abrégé)` }
            : m
    ));
}

export function loadHistory(userId) {
    try {
        const raw = localStorage.getItem(KEY(userId));
        if (!raw) return { ui: [], api: [] };
        const data = JSON.parse(raw);
        const ui = Array.isArray(data.ui) ? data.ui.filter((m) => !m.error) : [];
        while (ui.length && ui[ui.length - 1].role === 'user') ui.pop(); // question restée sans réponse (chat fermé en cours de route)
        return { ui, api: trimApiMessages(Array.isArray(data.api) ? data.api : []) };
    } catch (e) {
        return { ui: [], api: [] };
    }
}

export function saveHistory(userId, ui, api) {
    try {
        localStorage.setItem(KEY(userId), JSON.stringify({ ui: ui.slice(-MAX_UI), api: trimApiMessages(api), at: Date.now() }));
    } catch (e) {
        // quota localStorage plein : on repart d'un historique vide plutôt que de casser le chat
        try { localStorage.removeItem(KEY(userId)); } catch (ignored) { /* rien */ }
    }
}

export function clearHistory(userId) {
    try { localStorage.removeItem(KEY(userId)); } catch (e) { /* rien */ }
}
