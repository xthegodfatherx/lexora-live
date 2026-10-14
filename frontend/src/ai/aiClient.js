import { axiosInstance } from '../axios';

// ─────────────────────────────────────────────────────────────────────────────
// Client du proxy IA. Le navigateur ne parle JAMAIS à Groq : il appelle le proxy
// (fonction Netlify en prod, src/setupProxy.js en dev) qui détient AI_API_KEY.
// On n'utilise pas axiosInstance ici : sa baseURL est le backend Lexora, alors
// que le proxy est servi par la même origine que l'app.
// ─────────────────────────────────────────────────────────────────────────────
const CHAT_URL = '/.netlify/functions/ai-chat';
const TRANSCRIBE_URL = '/.netlify/functions/ai-transcribe';

const MAX_AUTO_WAIT = 25; // secondes : au-delà on rend la main à l'utilisateur
const MAX_RATE_RETRIES = 2;

export class AiError extends Error {
    constructor(message, status, retryAfter) {
        super(message);
        this.name = 'AiError';
        this.status = status;
        this.retryAfter = retryAfter;
        this.retriable = false;
    }
}

const MAX_GENERATION_RETRIES = 2;

const sleep = (seconds, signal) => new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, seconds * 1000);
    if (signal) {
        signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
    }
});

const rawPost = (url, payload, signal) => fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
    body: JSON.stringify(payload),
    signal,
});

const readError = async (res) => {
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    const retry = Number(res.headers.get('retry-after')) || (data && data.retry_after) || undefined;
    if (res.status === 404) {
        return new AiError("Le service de l'assistant n'est pas déployé sur ce serveur.", 404);
    }
    return new AiError((data && data.error) || `L'assistant a rencontré une erreur (${res.status}).`, res.status, retry);
};

/**
 * POST vers le proxy avec :
 *  - 401 → un appel backend via axiosInstance déclenche le refresh « single-flight »
 *    existant (src/axios.js), puis on rejoue une fois ;
 *  - 429 → attente du Retry-After (quota Groq par minute) puis nouvel essai.
 */
async function post(url, payload, { signal, onWait } = {}) {
    let refreshed = false;
    let rateRetries = 0;
    for (;;) {
        let res;
        try {
            res = await rawPost(url, payload, signal);
        } catch (e) {
            if (e.name === 'AbortError') throw e;
            throw new AiError("Impossible de joindre l'assistant. Vérifiez votre connexion.", 0);
        }
        if (res.ok) return res;

        if (res.status === 401 && !refreshed) {
            refreshed = true;
            try {
                await axiosInstance.get('/auth/users/me/');
                continue;
            } catch (e) {
                throw new AiError('Session expirée. Reconnectez-vous.', 401);
            }
        }

        const error = await readError(res);
        if (res.status === 429 && rateRetries < MAX_RATE_RETRIES && (error.retryAfter || 5) <= MAX_AUTO_WAIT) {
            rateRetries += 1;
            const wait = Math.max(2, error.retryAfter || 5);
            if (onWait) onWait(wait);
            await sleep(wait, signal);
            if (onWait) onWait(0);
            continue;
        }
        throw error;
    }
}

// Reconstitue le message de l'assistant à partir du flux SSE (format OpenAI/Groq).
async function readStream(res, onDelta) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const message = { role: 'assistant', content: '' };
    const calls = [];
    let buffer = '';

    const handleLine = (line) => {
        if (!line.startsWith('data:')) return;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') return;
        let chunk;
        try { chunk = JSON.parse(data); } catch (e) { return; }
        if (chunk.error) {
            // Groq valide l'appel d'outil en fin de génération : un nom d'outil inventé ou des arguments
            // mal formés arrivent ICI, au milieu du flux (HTTP 200 déjà envoyé). Le message du fournisseur
            // est en anglais et technique : on ne l'affiche jamais, on retente.
            const error = new AiError("L'assistant n'a pas réussi à formuler sa réponse. Réessayez.", 502);
            error.retriable = true;
            throw error;
        }
        const delta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta;
        if (!delta) return;
        if (delta.content) {
            message.content += delta.content;
            if (onDelta) onDelta(delta.content, message.content);
        }
        (delta.tool_calls || []).forEach((tc, position) => {
            const index = typeof tc.index === 'number' ? tc.index : position;
            if (!calls[index]) calls[index] = { id: '', type: 'function', function: { name: '', arguments: '' } };
            const call = calls[index];
            if (tc.id) call.id = tc.id;
            if (tc.function && tc.function.name) call.function.name += tc.function.name;
            if (tc.function && tc.function.arguments) call.function.arguments += tc.function.arguments;
        });
    };

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        lines.forEach(handleLine);
    }
    if (buffer) handleLine(buffer);

    const toolCalls = calls.filter((c) => c && c.function.name);
    if (toolCalls.length) message.tool_calls = toolCalls;
    return message;
}

/**
 * Un tour de l'assistant. Retourne { role:'assistant', content, tool_calls? }.
 * `final: true` interdit tout nouvel appel d'outil (dernier tour de la boucle).
 */
export async function chatCompletion({ messages, tools, context, final = false, onDelta, onWait, signal }) {
    for (let attempt = 0; ; attempt += 1) {
        try {
            const res = await post(CHAT_URL, { mode: 'assistant', messages, tools, context, final, stream: true }, { signal, onWait });
            const type = res.headers.get('content-type') || '';
            if (type.includes('text/event-stream') && res.body) return await readStream(res, onDelta);

            // Repli : le proxy a répondu en JSON (pas de streaming disponible).
            const data = await res.json();
            const message = data.message || { role: 'assistant', content: '' };
            if (message.content && onDelta) onDelta(message.content, message.content);
            return message;
        } catch (e) {
            if (!(e instanceof AiError) || !e.retriable || attempt >= MAX_GENERATION_RETRIES) throw e;
            if (onDelta) onDelta('', ''); // efface le texte partiel de la tentative ratée
        }
    }
}

/** Tâche courte à prompt serveur (rediger, ton, traduire, suggestions, resume_contrat…). */
export async function aiHelper(task, input, { signal, onWait } = {}) {
    const res = await post(CHAT_URL, { mode: 'helper', task, input }, { signal, onWait });
    const data = await res.json();
    return data.result;
}

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

/** Dictée : blob audio (MediaRecorder) → texte. */
export async function transcribe(blob, langue) {
    const audio = await blobToBase64(blob);
    const res = await post(TRANSCRIBE_URL, { audio, mime: blob.type || 'audio/webm', langue });
    const data = await res.json();
    return data.texte || '';
}

/** Message d'erreur affichable tel quel. */
export const aiErrorMessage = (e) => {
    if (e instanceof AiError) {
        if (e.status === 429) {
            return `L'assistant est très sollicité${e.retryAfter ? ` — réessayez dans ${e.retryAfter} s` : ''}.`;
        }
        return e.message;
    }
    return "L'assistant a rencontré une erreur inattendue.";
};
