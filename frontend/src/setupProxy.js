// Chargé automatiquement par le serveur de dev CRA (`npm start`) — jamais inclus dans le bundle.
//
// Monte en local les mêmes routes que les fonctions Netlify de production, pour que le
// code React appelle la même URL partout. react-scripts charge tout le fichier .env dans
// process.env du serveur de dev : AI_API_KEY est donc lisible ICI, sans jamais être
// injectée dans le JavaScript envoyé au navigateur (seules les REACT_APP_* le sont).
const { Readable } = require('stream');
const core = require('../netlify/lib/aiCore');

const MAX_BODY = 6 * 1024 * 1024;

const readBody = (req) => new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_BODY) {
            reject(new Error('body too large'));
            req.destroy();
            return;
        }
        chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
});

const mount = (app, path, handler) => {
    app.post(path, async (req, res) => {
        try {
            const out = await handler({ authorization: req.headers.authorization, rawBody: await readBody(req) });
            res.status(out.status);
            Object.entries(out.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
            if (out.body && typeof out.body === 'object' && typeof out.body.getReader === 'function') {
                const stream = Readable.fromWeb(out.body);
                req.on('close', () => stream.destroy());
                stream.on('error', () => res.end());
                stream.pipe(res);
            } else {
                res.end(out.body);
            }
        } catch (e) {
            res.status(500).json({ error: "Erreur interne de l'assistant (dev)." });
        }
    });
};

module.exports = function setupProxy(app) {
    mount(app, '/.netlify/functions/ai-chat', core.handleChat);
    mount(app, '/.netlify/functions/ai-transcribe', core.handleTranscribe);
};
