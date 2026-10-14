// Copie le worker de pdf.js dans public/ (lancé par `prestart` et `prebuild`).
// L'assistant IA extrait le texte des PDF de la bibliothèque dans le navigateur
// (src/ai/pdfText.js) ; pdf.js a besoin de son worker servi comme fichier statique.
// Le fichier copié est ignoré par git : il suit toujours la version installée.
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js');
const target = path.join(__dirname, '..', 'public', 'pdf.worker.min.js');

try {
    fs.copyFileSync(source, target);
    console.log('pdf.worker.min.js → public/');
} catch (e) {
    // Non bloquant : sans worker, seules les fonctions « lire un PDF » de l'assistant sont indisponibles.
    console.warn('Worker pdf.js non copié :', e.message);
}
