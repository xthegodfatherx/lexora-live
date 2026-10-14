// Extraction du texte d'un PDF dans le navigateur (pdf.js, chargé à la demande).
// Sert à : pré-remplir la fiche d'un document à l'import, résumer / interroger un document.
// Limite connue : un PDF scanné n'a pas de couche texte (et la clé IA n'a pas de modèle
// de vision) → on renvoie scanned:true et l'interface l'explique.

let libPromise = null;
const loadPdfJs = () => {
    if (!libPromise) {
        libPromise = import('pdfjs-dist/build/pdf').then((mod) => {
            const lib = mod && mod.getDocument ? mod : mod.default;
            lib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ''}/pdf.worker.min.js`;
            return lib;
        }).catch((e) => { libPromise = null; throw e; });
    }
    return libPromise;
};

// Recompose les lignes d'une page à partir des fragments de texte de pdf.js.
const pageText = (content) => {
    const lines = [];
    let line = '';
    content.items.forEach((item) => {
        line += item.str;
        if (item.hasEOL) {
            lines.push(line.trim());
            line = '';
        } else if (item.str && !item.str.endsWith(' ')) {
            line += ' ';
        }
    });
    lines.push(line.trim());
    return lines.join('\n');
};

/**
 * @param {File|Blob|string} source  fichier choisi par l'utilisateur, ou URL absolue (/uploads est public)
 * @returns {Promise<{ text: string, pages: number, pagesRead: number, truncated: boolean, scanned: boolean }>}
 */
export async function extractPdfText(source, { maxPages = 8, maxChars = 12000 } = {}) {
    const lib = await loadPdfJs();
    const params = typeof source === 'string'
        ? { url: source, withCredentials: false }
        : { data: new Uint8Array(await source.arrayBuffer()) };
    const pdf = await lib.getDocument(params).promise;

    const pagesRead = Math.min(pdf.numPages, maxPages);
    let text = '';
    try {
        for (let n = 1; n <= pagesRead && text.length < maxChars; n += 1) {
            const page = await pdf.getPage(n);
            text += `${pageText(await page.getTextContent())}\n\n`;
        }
    } finally {
        pdf.destroy();
    }

    text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    const scanned = text.replace(/\s/g, '').length < 80;
    return {
        text: text.slice(0, maxChars),
        pages: pdf.numPages,
        pagesRead,
        truncated: text.length > maxChars || pdf.numPages > pagesRead,
        scanned,
    };
}
