// Components/Assistant/DocumentAi.jsx — IA dans la bibliothèque juridique :
//  - DocumentAutofill : à l'import, propose les métadonnées à partir des premières pages du PDF
//  - DocumentQa       : résume un document ou répond à une question sur son contenu
import React, { useState } from 'react';
import { aiHelper, aiErrorMessage } from '../../ai/aiClient';
import { extractPdfText } from '../../ai/pdfText';
import { toAbsoluteUrl } from '../../axios';
import Markdown from './Markdown';
import { Sparkle } from './ChatAiTools';

const CATEGORIES = ['CONSTITUTION', 'TRAITES_ET_ACCORDS', 'LOIS', 'ORDONNANCES', 'DECRETS', 'DECISIONS_ET_ARRETES', 'TEXTES_REGLEMENTAIRES', 'CONTRATS_ET_MODELES', 'DOCUMENTATION_INTERNE', 'JURISPRUDENCE'];
const SCANNED = "Ce PDF est un document scanné (aucun texte lisible) : l'IA ne peut pas le lire. Renseignez la fiche à la main.";

const readError = (e) => (e && e.name && /Password|InvalidPDF|MissingPDF|UnexpectedResponse/.test(e.name)
    ? 'Impossible de lire ce PDF (protégé, corrompu ou inaccessible).'
    : aiErrorMessage(e));

/** Bouton du formulaire d'import. onFill reçoit uniquement des champs valides et NON vides. */
export const DocumentAutofill = ({ file, onFill }) => {
    const [state, setState] = useState({ busy: false, note: '', error: '' });
    if (!file) return null;

    const run = async () => {
        setState({ busy: true, note: '', error: '' });
        try {
            const pdf = await extractPdfText(file, { maxPages: 4, maxChars: 9000 });
            if (pdf.scanned) { setState({ busy: false, note: '', error: SCANNED }); return; }
            const r = await aiHelper('autofill_document', { texte: pdf.text, nom_fichier: file.name }) || {};
            const clean = (v) => (typeof v === 'string' ? v.trim() : '');
            const fields = {};
            if (clean(r.titre)) fields.titre = clean(r.titre).slice(0, 300);
            if (CATEGORIES.includes(clean(r.categorie))) fields.categorie = clean(r.categorie);
            if (clean(r.reference)) fields.reference = clean(r.reference).slice(0, 120);
            if (clean(r.organismeEmetteur)) fields.organismeEmetteur = clean(r.organismeEmetteur).slice(0, 200);
            if (/^\d{4}-\d{2}-\d{2}$/.test(clean(r.datePublication))) fields.datePublication = clean(r.datePublication);
            const mots = Array.isArray(r.motsCles) ? r.motsCles.join(', ') : clean(r.motsCles);
            if (mots) fields.motsCles = mots.slice(0, 300);
            if (clean(r.resume)) fields.resume = clean(r.resume).slice(0, 1200);
            onFill(fields);
            const count = Object.keys(fields).length;
            setState({ busy: false, error: '', note: count ? `${count} champ${count > 1 ? 's' : ''} proposé${count > 1 ? 's' : ''} d'après les ${pdf.pagesRead} premières pages — relisez avant d'enregistrer.` : "L'IA n'a rien trouvé d'exploitable dans ce PDF." });
        } catch (e) {
            setState({ busy: false, note: '', error: readError(e) });
        }
    };

    return (
        <div className="mt-2">
            <button type="button" onClick={run} disabled={state.busy} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition disabled:opacity-60">
                <Sparkle className="w-3.5 h-3.5" /> {state.busy ? 'Lecture du PDF…' : 'Remplir la fiche avec l’IA'}
            </button>
            {state.note && <p className="mt-1 text-xs text-green-700">{state.note}</p>}
            {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
        </div>
    );
};

/** Fiche d'un document : résumé et questions sur le contenu du PDF. */
export const DocumentQa = ({ document: doc }) => {
    const [pdf, setPdf] = useState(null);
    const [question, setQuestion] = useState('');
    const [state, setState] = useState({ busy: false, status: '', answer: '', error: '' });
    const url = doc && doc.pdfUrl ? toAbsoluteUrl(doc.pdfUrl) : null;
    if (!url) return null;

    const ask = async (q) => {
        setState({ busy: true, status: pdf ? 'Analyse…' : 'Lecture du PDF…', answer: '', error: '' });
        try {
            let loaded = pdf;
            if (!loaded) {
                loaded = await extractPdfText(url, { maxPages: 12, maxChars: 12000 });
                setPdf(loaded);
            }
            if (loaded.scanned) { setState({ busy: false, status: '', answer: '', error: SCANNED }); return; }
            setState((s) => ({ ...s, status: 'Analyse…' }));
            const answer = await aiHelper('document_qa', { titre: doc.titre, texte: loaded.text, question: q || undefined });
            setState({ busy: false, status: '', answer, error: '' });
        } catch (e) {
            setState({ busy: false, status: '', answer: '', error: readError(e) });
        }
    };

    return (
        <div className="mt-4 p-4 rounded-2xl border border-orange-200 bg-orange-50/50">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-orange-700 mb-2"><Sparkle /> Assistant IA</p>
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => ask('')} disabled={state.busy} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FF8500] text-white hover:bg-orange-600 transition disabled:opacity-60">
                    Résumer ce document
                </button>
                <form className="flex-1 min-w-[220px] flex gap-2" onSubmit={(e) => { e.preventDefault(); if (question.trim()) ask(question.trim()); }}>
                    <input
                        dir="auto"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Poser une question sur ce texte…"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 bg-white"
                    />
                    <button type="submit" disabled={state.busy || !question.trim()} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-white disabled:opacity-50">Demander</button>
                </form>
            </div>
            {state.busy && <p className="mt-3 text-sm text-gray-500 animate-pulse">{state.status}</p>}
            {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
            {state.answer && (
                <div className="mt-3 p-3 rounded-xl bg-white border border-gray-200 text-gray-700">
                    <Markdown text={state.answer} />
                    <p className="mt-2 text-[11px] text-gray-400">
                        Généré par IA{pdf && pdf.truncated ? ` à partir d'un extrait (${pdf.pagesRead} page${pdf.pagesRead > 1 ? 's' : ''} sur ${pdf.pages})` : ''} — à vérifier dans le texte officiel.
                    </p>
                </div>
            )}
        </div>
    );
};
