// Components/Assistant/ContratAi.jsx — IA dans le détail d'un contrat :
// résumé, explication d'un risque (+ clause proposée), vérification avant soumission.
import React, { useState } from 'react';
import { aiHelper, aiErrorMessage } from '../../ai/aiClient';
import { trimContratDetail } from '../../ai/tools';
import { openAssistant } from '../../ai/launcher';
import Markdown from './Markdown';
import { Sparkle } from './ChatAiTools';

const fr = (text) => (typeof text === 'string' ? text.split(' / ')[0].trim() : text);

const useHelper = () => {
    const [state, setState] = useState({ busy: false, result: null, error: '' });
    const run = async (task, input) => {
        setState({ busy: true, result: null, error: '' });
        try {
            setState({ busy: false, result: await aiHelper(task, input), error: '' });
        } catch (e) {
            setState({ busy: false, result: null, error: aiErrorMessage(e) });
        }
    };
    return [state, run, () => setState({ busy: false, result: null, error: '' })];
};

// Le modèle renvoie parfois un point coupé en deux ({constat} puis {correction} seul) : on recolle,
// et on écarte tout ce qui n'a pas de constat.
const normalizePoints = (points) => (Array.isArray(points) ? points : []).reduce((acc, p) => {
    if (!p || typeof p !== 'object') return acc;
    const last = acc[acc.length - 1];
    if (!p.constat && p.correction && last && !last.correction) last.correction = String(p.correction);
    else if (p.constat) acc.push({ gravite: ['bloquant', 'important', 'conseil'].includes(p.gravite) ? p.gravite : 'conseil', champ: String(p.champ || ''), constat: String(p.constat), correction: p.correction ? String(p.correction) : '' });
    return acc;
}, []);

const Disclaimer = () => (
    <p className="mt-3 text-[11px] text-gray-400">Généré par IA à partir des données du contrat — à vérifier ; ne remplace pas un avis juridique.</p>
);

const contexteContrat = (details, contrat) => {
    const c = (details && details.contrat) || contrat || {};
    return { ecran: 'Détail du contrat', contrat_id: c.id, contrat_numero: c.numero_contrat };
};

/** Onglet « Assistant IA » du détail d'un contrat. `details` = réponse brute de GET /clm/contrats/<id>/. */
export const ContratAiTab = ({ details, contrat, onHandOff }) => {
    const [summary, runSummary] = useHelper();
    const [check, runCheck] = useHelper();
    const data = details || { contrat };
    const statut = ((details && details.contrat) || contrat || {}).statut;
    const GRAVITE = {
        bloquant: 'bg-red-100 text-red-700',
        important: 'bg-orange-100 text-orange-700',
        conseil: 'bg-blue-100 text-blue-700',
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <button type="button" disabled={summary.busy} onClick={() => runSummary('resume_contrat', { contrat: trimContratDetail(data) })} className="inline-flex items-center gap-2 px-4 py-2 rounded-[25px] bg-[#FF8500] text-white text-sm font-medium hover:bg-orange-600 transition disabled:opacity-60">
                    <Sparkle /> {summary.busy ? 'Analyse en cours…' : 'Résumer ce contrat'}
                </button>
                {statut === 'brouillon' && (
                    <button type="button" disabled={check.busy} onClick={() => runCheck('verifier_brouillon', { contrat: trimContratDetail(data) })} className="inline-flex items-center gap-2 px-4 py-2 rounded-[25px] border border-[#FF8500] text-[#FF8500] text-sm font-medium hover:bg-orange-50 transition disabled:opacity-60">
                        <Sparkle /> {check.busy ? 'Relecture…' : 'Vérifier avant soumission'}
                    </button>
                )}
                <button type="button" onClick={() => { openAssistant({ context: contexteContrat(details, contrat) }); if (onHandOff) onHandOff(); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-[25px] bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                    Poser une question sur ce contrat
                </button>
            </div>

            {summary.error && <p className="text-sm text-red-600">{summary.error}</p>}
            {summary.result && (
                <div className="bg-gray-50 p-4 rounded-[20px]">
                    <Markdown text={summary.result} className="text-gray-700" />
                    <Disclaimer />
                </div>
            )}

            {check.error && <p className="text-sm text-red-600">{check.error}</p>}
            {check.result && (
                <div className="bg-gray-50 p-4 rounded-[20px]">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                        {check.result.pret ? '✅ Rien de bloquant détecté' : '⚠️ À corriger avant de soumettre (la soumission est irréversible)'}
                    </p>
                    <div className="space-y-2">
                        {normalizePoints(check.result.points).map((p, i) => (
                            <div key={`${p.champ}-${i}`} className="bg-white border border-gray-200 rounded-2xl p-3 text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${GRAVITE[p.gravite] || GRAVITE.conseil}`}>{p.gravite}</span>
                                    <span className="font-medium text-gray-800">{p.champ}</span>
                                </div>
                                <p className="text-gray-600">{p.constat}</p>
                                {p.correction && <p className="mt-1 text-gray-800"><strong>Correction :</strong> {p.correction}</p>}
                            </div>
                        ))}
                        {!normalizePoints(check.result.points).length && <p className="text-sm text-gray-500">Aucun point à signaler.</p>}
                    </div>
                    <Disclaimer />
                </div>
            )}

            {!summary.result && !check.result && !summary.busy && !check.busy && !summary.error && !check.error && (
                <p className="text-sm text-gray-500">
                    L'assistant lit les informations, métadonnées et risques de ce contrat. Rien n'est modifié : il s'agit d'une aide à la lecture.
                </p>
            )}
        </div>
    );
};

/** Dans le formulaire de contrat : rédige/améliore un champ à partir de ce qui est déjà saisi. */
export const FieldAiButton = ({ champ, value, contrat, onResult, court = false }) => {
    const [state, run] = useHelper();
    const [previous, setPrevious] = useState(null);

    const generate = async () => {
        const mots = String(value || '').trim() || [contrat.titre, contrat.societe_b_nom].filter(Boolean).join(' — ');
        if (!mots) return;
        setPrevious(value || '');
        await run('rediger_clause', { champ, court, mots_cles: mots, contrat });
    };

    React.useEffect(() => {
        if (typeof state.result === 'string' && state.result) onResult(court ? state.result.replace(/\s*\n+\s*/g, ' ') : state.result);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.result]);

    return (
        <span className="inline-flex items-center gap-2 ml-2">
            <button type="button" onClick={generate} disabled={state.busy} title="L'IA rédige à partir de ce que vous avez saisi — relisez avant d'enregistrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition disabled:opacity-60">
                <Sparkle className="w-3 h-3" /> {state.busy ? 'Rédaction…' : "Rédiger avec l'IA"}
            </button>
            {previous !== null && state.result && !state.busy && (
                <button type="button" onClick={() => { onResult(previous); setPrevious(null); }} className="text-[11px] text-gray-500 underline">Annuler</button>
            )}
            {state.error && <span className="text-[11px] text-red-600">{state.error}</span>}
        </span>
    );
};

/** Sous un risque : « Expliquer / Que faire ? » → explication + clause corrigée proposée + textes liés. */
export const RisqueAi = ({ risque, details, contrat, onHandOff }) => {
    const [state, run, reset] = useHelper();
    const c = (details && details.contrat) || contrat || {};

    const explain = () => run('expliquer_risque', {
        risque: {
            code: risque.code, type: risque.type, severite: risque.severite, niveau_alerte: risque.niveau_alerte,
            description: fr(risque.description), suggestion: fr(risque.suggestion), article: risque.article_ref, occurrences: risque.occurrence_count,
        },
        contrat: trimContratDetail({ contrat: c, metadonnees: details && details.metadonnees }),
    });

    return (
        <div className="mt-2">
            {!state.result && (
                <button type="button" onClick={explain} disabled={state.busy} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/70 hover:bg-white transition disabled:opacity-60">
                    <Sparkle className="w-3.5 h-3.5" /> {state.busy ? 'Analyse…' : 'Expliquer / Que faire ?'}
                </button>
            )}
            {state.error && <p className="mt-1 text-xs text-red-700">{state.error}</p>}
            {state.result && (
                <div className="mt-2 p-3 rounded-2xl bg-white text-gray-700 border border-gray-200">
                    <Markdown text={state.result} />
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                openAssistant({
                                    context: contexteContrat(details, contrat),
                                    question: `Cherche dans la bibliothèque juridique les textes qui concernent ce risque du contrat ${c.numero_contrat || ''} : ${risque.code} — ${fr(risque.description)}`,
                                });
                                if (onHandOff) onHandOff();
                            }}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100"
                        >
                            ⚖️ Textes juridiques liés
                        </button>
                        <button type="button" onClick={reset} className="px-3 py-1 rounded-full text-xs text-gray-500 hover:bg-gray-100">Masquer</button>
                    </div>
                </div>
            )}
        </div>
    );
};
