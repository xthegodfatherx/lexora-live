// Components/Assistant/AlerteAi.jsx — IA sur les alertes de risque :
// « Que faire ? » (explication + prochaines étapes) et rédaction de la note de résolution.
import React, { useState } from 'react';
import { aiHelper, aiErrorMessage } from '../../ai/aiClient';
import { openAssistant } from '../../ai/launcher';
import Markdown from './Markdown';
import { Sparkle } from './ChatAiTools';

const fr = (text) => (typeof text === 'string' ? text.split(' / ')[0].trim() : text);

const alertForAi = (alert) => ({
    code: alert.code,
    type: alert.type,
    severite: alert.severite,
    statut: alert.statut,
    contrat_id: alert.contrat_id,
    description: fr(alert.description),
    suggestion: fr(alert.suggestion),
    article: alert.article_ref,
    occurrences: alert.occurrence_count,
    niveau_escalade: alert.escalade && alert.escalade.niveau,
    escalader: alert.escalade && alert.escalade.escalader,
});

/** Bouton « Que faire ? » sous une alerte. */
export const AlerteAiAdvice = ({ alert }) => {
    const [state, setState] = useState({ busy: false, text: '', error: '' });

    const explain = async () => {
        setState({ busy: true, text: '', error: '' });
        try {
            setState({ busy: false, text: await aiHelper('expliquer_alerte', { alerte: alertForAi(alert) }), error: '' });
        } catch (e) {
            setState({ busy: false, text: '', error: aiErrorMessage(e) });
        }
    };

    return (
        <div className="mb-3">
            {!state.text && (
                <button type="button" onClick={explain} disabled={state.busy} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/70 border border-white hover:bg-white transition disabled:opacity-60">
                    <Sparkle className="w-3.5 h-3.5 text-orange-500" /> {state.busy ? 'Analyse…' : 'Que faire ?'}
                </button>
            )}
            {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
            {state.text && (
                <div className="p-3 rounded-xl bg-white border border-gray-200 text-gray-700">
                    <Markdown text={state.text} />
                    <div className="mt-2 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => openAssistant({
                                context: { ecran: 'Alertes de risque', alerte_id: alert._id, contrat_id: alert.contrat_id },
                                question: `Aide-moi à traiter l'alerte ${alert.code} du contrat #${alert.contrat_id} : résume le contrat, dis-moi qui prévenir et prépare un message d'escalade si nécessaire.`,
                            })}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100"
                        >
                            Approfondir avec l'assistant
                        </button>
                        <button type="button" onClick={() => setState({ busy: false, text: '', error: '' })} className="px-3 py-1 rounded-full text-xs text-gray-500 hover:bg-gray-100">Masquer</button>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400">Généré par IA — à vérifier.</p>
                </div>
            )}
        </div>
    );
};

/** Dans la fenêtre « Résoudre l'alerte » : transforme quelques mots en note de résolution propre. */
export const NoteAiButton = ({ alert, note, onResult }) => {
    const [state, setState] = useState({ busy: false, error: '' });

    const write = async () => {
        if (!note.trim()) { setState({ busy: false, error: "Décrivez d'abord en quelques mots ce qui a été fait." }); return; }
        setState({ busy: true, error: '' });
        try {
            const text = await aiHelper('note_resolution', { alerte: alert ? alertForAi(alert) : {}, action: note });
            if (text) onResult(text);
            setState({ busy: false, error: '' });
        } catch (e) {
            setState({ busy: false, error: aiErrorMessage(e) });
        }
    };

    return (
        <div className="-mt-2 mb-4 flex items-center gap-2">
            <button type="button" onClick={write} disabled={state.busy} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition disabled:opacity-60">
                <Sparkle className="w-3.5 h-3.5" /> {state.busy ? 'Rédaction…' : 'Mettre en forme avec l’IA'}
            </button>
            {state.error && <span className="text-xs text-red-600">{state.error}</span>}
        </div>
    );
};
