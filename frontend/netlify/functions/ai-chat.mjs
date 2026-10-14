// Proxy IA (production Netlify) — POST /.netlify/functions/ai-chat
// Toute la logique est dans ../lib/aiCore.js (partagée avec src/setupProxy.js en dev).
// La clé AI_API_KEY se définit dans Netlify → Site configuration → Environment variables.
import core from '../lib/aiCore.js';

export default async (req) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Méthode non autorisée.' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
        });
    }
    const out = await core.handleChat({
        authorization: req.headers.get('authorization'),
        rawBody: await req.text(),
    });
    // out.body est soit une chaîne JSON, soit le flux SSE de Groq (réponse en streaming).
    return new Response(out.body, { status: out.status, headers: out.headers });
};
