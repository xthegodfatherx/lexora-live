// Dictée vocale (production Netlify) — POST /.netlify/functions/ai-transcribe
// Corps JSON : { audio: <base64>, mime: 'audio/webm', langue?: 'fr'|'ar'|'en' } → { texte }
import core from '../lib/aiCore.js';

export default async (req) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Méthode non autorisée.' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
        });
    }
    const out = await core.handleTranscribe({
        authorization: req.headers.get('authorization'),
        rawBody: await req.text(),
    });
    return new Response(out.body, { status: out.status, headers: out.headers });
};
