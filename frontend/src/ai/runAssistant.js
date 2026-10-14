import { chatCompletion } from './aiClient';
import { toolDefinitions, toolError } from './tools';

// Boucle d'outils de l'assistant (AI_ASSISTANT_FEATURES.md §2.5) :
//   modèle → tool_calls → exécution locale (JWT de l'utilisateur) → résultats → modèle …
// Chaque tour est un appel court au proxy ; MAX_HOPS borne le coût et le quota.
const MAX_HOPS = 5;
const MAX_RESULT_CHARS = 5500;

const CARD_TOKEN = /\[\[(contrat|document|alerte|utilisateur):([^\]|]+)(?:\|[^\]]*)?\]\]/g;

const parseArgs = (raw) => {
    if (!raw) return {};
    try {
        const value = JSON.parse(raw);
        return value && typeof value === 'object' ? value : {};
    } catch (e) {
        return null;
    }
};

/** Retire les jetons [[type:id]] du texte et renvoie les fiches correspondantes. */
export function extractCards(text, entities, touched) {
    const cards = [];
    const seen = new Set();
    const push = (type, id) => {
        const data = entities[type] && entities[type][String(id).trim()];
        const key = `${type}:${String(id).trim()}`;
        if (data && !seen.has(key) && cards.length < 6) {
            seen.add(key);
            cards.push({ type, id: String(id).trim(), data });
        }
    };
    const clean = (text || '').replace(CARD_TOKEN, (match, type, id) => { push(type, id); return ''; })
        .replace(/\[\[(?:contrat|document|alerte|utilisateur):[^\]]*\]\]/g, '') // jeton vide ou mal formé
        .replace(/^([ \t]*(?:[-*•]|\d+[.)])[ \t]+)[:—–-][ \t]*/gm, '$1') // « - [[…]] : Nom » → « - Nom »
        .replace(/^[ \t]*[:—–][ \t]*/gm, '')
        .replace(/^[ \t]*(?:[-*•]|\d+[.)])[ \t]*$/gm, '') // puce devenue vide une fois le jeton retiré
        .replace(/\n{3,}/g, '\n\n').trim();
    // Le modèle n'a cité aucune fiche : on montre les éléments consultés pendant ce tour.
    if (!cards.length && touched && touched.length) touched.slice(0, 4).forEach(({ type, id }) => push(type, id));
    return { text: clean, cards };
}

/**
 * @param {object} p
 * @param {Array}  p.apiMessages   historique au format API (user / assistant / tool)
 * @param {Array}  p.tools         outils autorisés pour ce rôle (registre tools.js)
 * @param {object} p.ctx           { api, role, userId, departementId, navigate, closeChat, entities }
 * @param {object} p.context       contexte d'écran envoyé au proxy
 * @param {function} p.requestConfirmation  async ({tool, args, preview}) → {ok:true, args} | {ok:false}
 * @returns {{ apiMessages: Array, text: string, cards: Array }}
 */
export async function runAssistant({ apiMessages, tools, ctx, context, onDelta, onStatus, onWait, requestConfirmation, signal }) {
    const messages = [...apiMessages];
    const definitions = toolDefinitions(tools, ctx.role);
    const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
    const touched = []; // entités vues pendant ce tour, de la plus récente à la plus ancienne

    const track = (before) => {
        ['contrat', 'document', 'alerte', 'utilisateur'].forEach((type) => {
            Object.keys(ctx.entities[type]).forEach((id) => {
                if (!before[type].has(id)) touched.unshift({ type, id });
            });
        });
    };

    for (let hop = 0; hop <= MAX_HOPS; hop += 1) {
        const final = hop === MAX_HOPS;
        if (onStatus) onStatus(hop === 0 ? 'Réflexion…' : 'Rédaction de la réponse…');
        const reply = await chatCompletion({
            messages, tools: definitions, context, final, onWait, signal,
            onDelta: (chunk, full) => { if (onDelta) onDelta(full); },
        });

        if (!reply.tool_calls || !reply.tool_calls.length || final) {
            messages.push({ role: 'assistant', content: reply.content || '' });
            const { text, cards } = extractCards(reply.content, ctx.entities, touched);
            return { apiMessages: messages, text: text || "Je n'ai pas pu formuler de réponse. Pouvez-vous reformuler ?", cards };
        }

        if (onDelta) onDelta(''); // le texte éventuel de ce tour n'était qu'une transition
        messages.push({ role: 'assistant', content: reply.content || '', tool_calls: reply.tool_calls });
        let terminal = null; // outil qui ouvre un écran : on conclut sans nouvel appel IA

        for (const call of reply.tool_calls) {
            const tool = byName[call.function.name];
            const args = parseArgs(call.function.arguments);
            let result;

            if (!tool) {
                result = { erreur: `Outil « ${call.function.name} » indisponible pour cet utilisateur.` };
            } else if (args === null) {
                result = { erreur: 'Arguments illisibles (JSON invalide). Réessaie.' };
            } else {
                if (onStatus) onStatus(`${tool.label}…`);
                const before = Object.fromEntries(Object.entries(ctx.entities).map(([t, m]) => [t, new Set(Object.keys(m))]));
                try {
                    let finalArgs = args;
                    let cancelled = false;
                    if (tool.confirm) {
                        const preview = tool.preview ? await tool.preview(args, ctx) : { titre: 'Confirmer cette action ?', lignes: [] };
                        const decision = await requestConfirmation({ tool, args, preview });
                        if (decision && decision.ok) finalArgs = decision.args || args;
                        else cancelled = true;
                    }
                    result = cancelled
                        ? { annule: true, message: "L'utilisateur a annulé cette action. Ne la relance pas." }
                        : await tool.run(finalArgs, ctx);
                    if (tool.terminal && result && result.ok) terminal = { tool, result };
                } catch (e) {
                    if (e && e.name === 'AbortError') throw e;
                    result = toolError(e);
                }
                track(before);
            }

            let content = JSON.stringify(result);
            if (content.length > MAX_RESULT_CHARS) content = `${content.slice(0, MAX_RESULT_CHARS)}… (résultat tronqué)`;
            messages.push({ role: 'tool', tool_call_id: call.id, content });
        }

        if (terminal) {
            const text = terminal.tool.finalText(terminal.result);
            messages.push({ role: 'assistant', content: text });
            return { apiMessages: messages, text, cards: [], closeChat: true };
        }
    }
    // Inatteignable : le dernier tour (final) retourne toujours.
    return { apiMessages: messages, text: '', cards: [] };
}
