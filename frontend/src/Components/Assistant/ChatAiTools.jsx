// Components/Assistant/ChatAiTools.jsx — aides IA dans les conversations entre personnes.
// Rien n'est jamais envoyé automatiquement : l'IA remplit le champ de saisie, l'utilisateur relit et envoie.
// Rien ne part vers l'IA sans un clic explicite (pas d'analyse en arrière-plan des conversations).
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../axios';
import { aiHelper, aiErrorMessage } from '../../ai/aiClient';
import { runAssistant } from '../../ai/runAssistant';
import { toolsForRole, newEntityStore } from '../../ai/tools';
import Markdown from './Markdown';

export const Sparkle = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l1.9 5.6a3 3 0 001.9 1.9L21.4 11.4l-5.6 1.9a3 3 0 00-1.9 1.9L12 20.8l-1.9-5.6a3 3 0 00-1.9-1.9L2.6 11.4l5.6-1.9a3 3 0 001.9-1.9L12 2z" />
    </svg>
);

/** Messages de la conversation → format court envoyé aux helpers ({de, texte}). */
export const toHelperMessages = (messages, currentUserId, otherName, max = 40) => (messages || [])
    .slice(-max)
    .map((m) => ({
        de: String(m.senderId) === String(currentUserId) ? 'Moi' : (m.senderName || otherName || 'Interlocuteur'),
        texte: m.content,
    }));

const ACTIONS = [
    { key: 'rediger', label: 'Rédiger à partir de mon idée', hint: 'Transforme quelques mots en message complet' },
    { key: 'corriger', label: 'Corriger', hint: 'Orthographe et grammaire' },
    { key: 'formel', label: 'Plus formel' },
    { key: 'court', label: 'Plus court' },
    { key: 'juridique', label: 'Ton juridique' },
    { key: 'cordial', label: 'Plus cordial' },
    { key: 'ar', label: 'Traduire en arabe' },
    { key: 'en', label: 'Traduire en anglais' },
    { key: 'fr', label: 'Traduire en français' },
];

/** Bouton ✨ du champ de saisie : rédiger / changer de ton / traduire le brouillon. */
export const ComposeAiMenu = ({ value, onApply, context }) => {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [previous, setPrevious] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const run = async (key) => {
        setOpen(false);
        setError('');
        const texte = (value || '').trim();
        if (!texte) { setError("Écrivez d'abord quelques mots."); return; }
        setBusy(true);
        try {
            let result;
            if (key === 'rediger') result = await aiHelper('rediger', { brouillon: texte, contexte: context });
            else if (['ar', 'en', 'fr'].includes(key)) result = await aiHelper('traduire', { texte, langue: key });
            else result = await aiHelper('ton', { texte, ton: key });
            if (result) { setPrevious(value); onApply(result); }
        } catch (e) {
            setError(aiErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                disabled={busy}
                title="Aide à la rédaction (IA)"
                className="h-full px-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition disabled:opacity-60"
            >
                {busy ? <span className="block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Sparkle className="w-5 h-5" />}
            </button>
            {open && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Améliorer mon message</p>
                    {ACTIONS.map((a) => (
                        <button key={a.key} type="button" onClick={() => run(a.key)} className="w-full px-3 py-1.5 text-left text-sm hover:bg-orange-50">
                            {a.label}
                            {a.hint && <span className="block text-[11px] text-gray-400">{a.hint}</span>}
                        </button>
                    ))}
                </div>
            )}
            {(error || previous !== null) && (
                <div className="absolute bottom-full mb-2 left-14 whitespace-nowrap text-xs">
                    {error && <span className="px-2 py-1 rounded-lg bg-red-50 text-red-600">{error}</span>}
                    {!error && previous !== null && !open && (
                        <button type="button" onClick={() => { onApply(previous); setPrevious(null); }} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                            ↩ Annuler la modification IA
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

/** Suggestions de réponse — à la demande (un clic), jamais en arrière-plan. */
export const ReplySuggestions = ({ messages, currentUserId, otherName, onPick }) => {
    const [state, setState] = useState({ busy: false, items: [], error: '' });
    const last = messages && messages[messages.length - 1];
    const lastId = last && last._id;
    const incoming = last && String(last.senderId) !== String(currentUserId);

    useEffect(() => { setState({ busy: false, items: [], error: '' }); }, [lastId]);

    if (!incoming) return null;

    const load = async () => {
        setState({ busy: true, items: [], error: '' });
        try {
            const result = await aiHelper('suggestions', { messages: toHelperMessages(messages, currentUserId, otherName, 8) });
            const items = Array.isArray(result && result.suggestions) ? result.suggestions.filter((s) => typeof s === 'string' && s.trim()).slice(0, 3) : [];
            setState({ busy: false, items, error: items.length ? '' : 'Aucune suggestion.' });
        } catch (e) {
            setState({ busy: false, items: [], error: aiErrorMessage(e) });
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 mb-2">
            {state.items.length === 0 && (
                <button type="button" onClick={load} disabled={state.busy} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition disabled:opacity-60">
                    <Sparkle className="w-3.5 h-3.5" /> {state.busy ? 'Recherche de réponses…' : 'Suggérer des réponses'}
                </button>
            )}
            {state.items.map((s) => (
                <button key={s} type="button" dir="auto" onClick={() => onPick(s)} className="px-3 py-1 rounded-full text-xs border border-orange-200 bg-white text-gray-700 hover:bg-orange-50 transition text-left">
                    {s}
                </button>
            ))}
            {state.error && <span className="text-xs text-red-500">{state.error}</span>}
        </div>
    );
};

/** Résumé de la conversation (décisions, échéances, actions). */
export const ConversationSummary = ({ messages, currentUserId, otherName, onClose }) => {
    const [state, setState] = useState({ busy: true, text: '', error: '' });

    useEffect(() => {
        let alive = true;
        aiHelper('resumer_conversation', { messages: toHelperMessages(messages, currentUserId, otherName, 60) })
            .then((text) => { if (alive) setState({ busy: false, text, error: '' }); })
            .catch((e) => { if (alive) setState({ busy: false, text: '', error: aiErrorMessage(e) }); });
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="mx-5 mt-3 p-4 rounded-2xl border border-orange-200 bg-orange-50/60">
            <div className="flex justify-between items-center mb-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-orange-700"><Sparkle /> Résumé de la conversation</p>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" title="Fermer">×</button>
            </div>
            {state.busy && <p className="text-sm text-gray-500 animate-pulse">Lecture des {messages.length} messages…</p>}
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            {state.text && <Markdown text={state.text} className="text-gray-700" />}
        </div>
    );
};

/** « @lexora question » tapé dans une conversation : réponse PRIVÉE (lecture seule), insérable dans le champ. */
export const InlineAssistant = ({ question, userRole, userId, otherName, messages, onInsert, onClose }) => {
    const navigate = useNavigate();
    const [state, setState] = useState({ busy: true, status: 'Réflexion…', text: '', error: '' });

    useEffect(() => {
        const controller = new AbortController();
        const extrait = toHelperMessages(messages, userId, otherName, 12).map((m) => `${m.de} : ${m.texte}`).join('\n');
        runAssistant({
            apiMessages: [{ role: 'user', content: question }],
            tools: toolsForRole(userRole, { readOnly: true }),
            context: { ecran: 'Messagerie', interlocuteur: otherName, extrait },
            ctx: { api: axiosInstance, role: userRole, userId, departementId: localStorage.getItem('departement_id') || '', navigate, entities: newEntityStore() },
            onStatus: (status) => setState((s) => ({ ...s, status })),
            onDelta: (text) => setState((s) => ({ ...s, text })),
            requestConfirmation: async () => ({ ok: false }),
            signal: controller.signal,
        })
            .then((out) => setState({ busy: false, status: '', text: out.text, error: '' }))
            .catch((e) => { if (e.name !== 'AbortError') setState({ busy: false, status: '', text: '', error: aiErrorMessage(e) }); });
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question]);

    return (
        <div className="mb-3 p-3 rounded-2xl border border-orange-200 bg-orange-50/70 max-h-64 overflow-y-auto">
            <div className="flex justify-between items-start gap-2 mb-1">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-700"><Sparkle className="w-3.5 h-3.5" /> Assistant Lexora · visible par vous seul</p>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 leading-none" title="Fermer">×</button>
            </div>
            <p className="text-xs text-gray-500 mb-2" dir="auto">« {question} »</p>
            {state.busy && !state.text && <p className="text-sm text-gray-500 animate-pulse">{state.status}</p>}
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            {state.text && <Markdown text={state.text.replace(/\[\[[^\]]*\]?\]?/g, '')} className="text-gray-800" />}
            {!state.busy && state.text && (
                <button type="button" onClick={() => onInsert(state.text.replace(/[*_`#>]/g, '').trim())} className="mt-2 px-3 py-1 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600">
                    Insérer dans ma réponse
                </button>
            )}
        </div>
    );
};

/** Traduction d'un message reçu (menu contextuel) → texte affiché sous la bulle. */
export const translateMessage = (texte, langue) => aiHelper('traduire', { texte, langue });
