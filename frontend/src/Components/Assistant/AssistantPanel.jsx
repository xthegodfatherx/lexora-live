// Components/Assistant/AssistantPanel.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../axios';
import DetailsContratModal from '../chefdepartement/DetailsContratModal';
import { runAssistant } from '../../ai/runAssistant';
import { toolsForRole, newEntityStore } from '../../ai/tools';
import { loadHistory, saveHistory, clearHistory } from '../../ai/history';
import { aiErrorMessage } from '../../ai/aiClient';
import { suggestedPrompts } from '../../ai/prompts';
import { loadBriefing } from '../../ai/briefing';
import { rolePath, ROLE_LABELS } from '../../ai/roles';
import Markdown from './Markdown';
import AssistantCards from './AssistantCards';
import ActionConfirmCard from './ActionConfirmCard';
import useDictation from './useDictation';

const TONES = {
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const contextLabel = (context) => {
    if (!context) return '';
    if (context.contrat_numero) return `contrat ${context.contrat_numero}`;
    if (context.contrat_id) return `contrat #${context.contrat_id}`;
    if (context.document_titre) return `document « ${context.document_titre} »`;
    if (context.alerte_id) return 'alerte affichée';
    return context.ecran || '';
};

const Sparkle = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l1.9 5.6a3 3 0 001.9 1.9L21.4 11.4l-5.6 1.9a3 3 0 00-1.9 1.9L12 20.8l-1.9-5.6a3 3 0 00-1.9-1.9L2.6 11.4l5.6-1.9a3 3 0 001.9-1.9L12 2z" />
        <path d="M19 2l.7 2.1a1.5 1.5 0 00.9.9L22.7 5.7l-2.1.7a1.5 1.5 0 00-.9.9L19 9.4l-.7-2.1a1.5 1.5 0 00-.9-.9L15.3 5.7l2.1-.7a1.5 1.5 0 00.9-.9L19 2z" opacity=".6" />
    </svg>
);

const IconButton = ({ title, onClick, active, children }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className={`p-1.5 rounded-lg transition ${active ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
    >
        {children}
    </button>
);

/**
 * Conversation avec l'assistant IA (rendue dans le volet droit de ChatInterface).
 * @param {object}   initial  { context, question, nonce } — ouverture contextuelle depuis un écran (launcher.js)
 * @param {function} onWriteTo  ouvre une conversation humaine avec l'utilisateur d'une fiche
 */
const AssistantPanel = ({ userId, userRole, onClose, onWriteTo, initial }) => {
    const navigate = useNavigate();
    const stored = useMemo(() => loadHistory(userId), [userId]);
    const [ui, setUi] = useState(stored.ui);
    const apiRef = useRef(stored.api);
    const entitiesRef = useRef(newEntityStore());
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState('');
    const [streamText, setStreamText] = useState('');
    const [waitSeconds, setWaitSeconds] = useState(0);
    const [pending, setPending] = useState(null);
    const [context, setContext] = useState((initial && initial.context) || null);
    const [briefing, setBriefing] = useState(null);
    const [openContrat, setOpenContrat] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const abortRef = useRef(null);
    const resolverRef = useRef(null);
    const endRef = useRef(null);
    const inputRef = useRef(null);
    const busyRef = useRef(false);
    const handledNonce = useRef(null);

    const tools = useMemo(() => toolsForRole(userRole), [userRole]);
    const prenom = (localStorage.getItem('nom_complet') || '').split(' ')[0];

    const closeChat = useCallback(() => { if (onClose) onClose(); }, [onClose]);

    useEffect(() => { saveHistory(userId, ui, apiRef.current); }, [ui, userId]);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [ui, streamText, pending, status, waitSeconds]);

    // Point du jour : seulement sur l'écran d'accueil (pas d'historique).
    useEffect(() => {
        if (ui.length) return undefined;
        let alive = true;
        loadBriefing(userRole).then((items) => { if (alive) setBriefing(items); }).catch(() => { if (alive) setBriefing([]); });
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole, ui.length === 0]);

    useEffect(() => () => {
        if (resolverRef.current) resolverRef.current({ ok: false });
        if (abortRef.current) abortRef.current.abort();
    }, []);

    const requestConfirmation = useCallback((request) => new Promise((resolve) => {
        resolverRef.current = resolve;
        setPending(request);
    }), []);

    const settle = (decision) => {
        const resolve = resolverRef.current;
        resolverRef.current = null;
        setPending(null);
        if (resolve) resolve(decision);
    };

    const send = useCallback(async (raw, { replaceLast = false } = {}) => {
        const text = String(raw || '').trim();
        if (!text || busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        setInput('');
        setStreamText('');
        setStatus('Réflexion…');
        setUi((prev) => {
            const base = replaceLast ? prev : prev.filter((m) => !m.error);
            return [...base, { id: newId(), role: 'user', text }];
        });

        const controller = new AbortController();
        abortRef.current = controller;
        try {
            const out = await runAssistant({
                apiMessages: [...apiRef.current, { role: 'user', content: text }],
                tools,
                context,
                ctx: {
                    api: axiosInstance, role: userRole, userId, departementId: localStorage.getItem('departement_id') || '',
                    navigate, closeChat, entities: entitiesRef.current,
                },
                onDelta: setStreamText,
                onStatus: setStatus,
                onWait: setWaitSeconds,
                requestConfirmation,
                signal: controller.signal,
            });
            apiRef.current = out.apiMessages;
            setUi((prev) => [...prev, { id: newId(), role: 'assistant', text: out.text, cards: out.cards }]);
            // L'outil a ouvert un écran (formulaire, page) : on ferme le chat, une fois l'historique enregistré.
            if (out.closeChat) setTimeout(closeChat, 700);
        } catch (e) {
            const aborted = e && e.name === 'AbortError';
            setUi((prev) => [...prev, {
                id: newId(), role: 'assistant', error: true, retry: text,
                text: aborted ? 'Réponse interrompue.' : aiErrorMessage(e),
            }]);
        } finally {
            abortRef.current = null;
            busyRef.current = false;
            setBusy(false);
            setStatus('');
            setStreamText('');
            setWaitSeconds(0);
            setPending(null);
        }
    }, [context, tools, userRole, userId, navigate, closeChat, requestConfirmation]);

    // Ouverture contextuelle (bouton « Demander à l'assistant » d'un écran).
    useEffect(() => {
        if (!initial || initial.nonce === handledNonce.current) return;
        handledNonce.current = initial.nonce;
        setContext(initial.context || null);
        if (initial.question) setTimeout(() => send(initial.question), 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial]);

    const stop = () => {
        if (resolverRef.current) settle({ ok: false });
        if (abortRef.current) abortRef.current.abort();
    };

    const retry = (message) => {
        setUi((prev) => {
            const idx = prev.findIndex((m) => m.id === message.id);
            // retire la bulle d'erreur ET la question qui la précède : send() la remet.
            return prev.filter((m, i) => i !== idx && !(i === idx - 1 && m.role === 'user'));
        });
        setTimeout(() => send(message.retry, { replaceLast: true }), 0);
    };

    const regenerate = () => {
        const api = apiRef.current;
        const lastUser = api.map((m) => m.role).lastIndexOf('user');
        if (lastUser === -1 || busyRef.current) return;
        const question = api[lastUser].content;
        apiRef.current = api.slice(0, lastUser);
        setUi((prev) => {
            const idx = prev.map((m) => m.role).lastIndexOf('user');
            return idx === -1 ? prev : prev.slice(0, idx);
        });
        setTimeout(() => send(question, { replaceLast: true }), 0);
    };

    const reset = () => {
        stop();
        apiRef.current = [];
        entitiesRef.current = newEntityStore();
        clearHistory(userId);
        setUi([]);
        setBriefing(null);
    };

    const copy = async (message) => {
        try {
            await navigator.clipboard.writeText(message.text);
            setCopiedId(message.id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch (e) { /* presse-papiers refusé : rien */ }
    };

    const vote = (message, value) => setUi((prev) => prev.map((m) => (m.id === message.id ? { ...m, feedback: m.feedback === value ? null : value } : m)));

    // Export d'une réponse (synthèse de portefeuille…) : fenêtre d'impression → « Enregistrer en PDF ».
    const exportMessage = (message) => {
        const node = document.getElementById(`ai-msg-${message.id}`);
        const win = node && window.open('', '_blank', 'width=820,height=900');
        if (!win) return;
        win.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Assistant Lexora — ${new Date().toLocaleDateString('fr-FR')}</title>
<style>body{font-family:Nunito,Arial,sans-serif;color:#1f2937;max-width:720px;margin:32px auto;padding:0 24px;line-height:1.55;font-size:14px}
h1{font-size:18px;color:#FF8500;border-bottom:2px solid #FF8500;padding-bottom:8px}table{border-collapse:collapse;width:100%;font-size:12px;margin:8px 0}
th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left}th{background:#f9fafb}blockquote{border-left:4px solid #fdba74;margin:8px 0;padding:6px 12px;background:#fff7ed}
ul,ol{padding-left:22px}footer{margin-top:28px;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}button,svg{display:none}</style></head>
<body><h1>SONATRACH · Lexora — Assistant</h1>${node.innerHTML}
<footer>Généré par l'assistant Lexora le ${new Date().toLocaleString('fr-FR')} pour ${localStorage.getItem('nom_complet') || ''}. Document d'aide à l'analyse — à vérifier ; ne remplace pas un avis juridique.</footer></body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 300);
    };

    const dictation = useDictation((text) => {
        setInput((prev) => (prev ? `${prev.trimEnd()} ${text}` : text));
        inputRef.current?.focus();
    });

    const openAlerte = () => {
        const base = rolePath(userRole);
        if (base) { navigate(`${base}/notifications`); closeChat(); }
    };

    const lastAssistantId = [...ui].reverse().find((m) => m.role === 'assistant' && !m.error)?.id;

    return (
        <>
            {/* En-tête */}
            <div className="px-5 py-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shadow">
                            <Sparkle className="w-5 h-5" />
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-gray-800">Assistant Lexora</h3>
                            <p className="text-xs text-gray-500 truncate">
                                {ROLE_LABELS[userRole] || 'Utilisateur'} · répond à partir de vos données Lexora
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {ui.length > 0 && (
                            <button type="button" onClick={reset} className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition" title="Effacer et recommencer">
                                Nouvelle discussion
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100/50 transition" title="Fermer">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                {context && contextLabel(context) && (
                    <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-50 text-xs text-orange-700">
                        <span>📌 Contexte : {contextLabel(context)}</span>
                        <button type="button" onClick={() => setContext(null)} title="Retirer le contexte" className="hover:text-orange-900">×</button>
                    </div>
                )}
            </div>

            {/* Fil */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/30">
                {ui.length === 0 && !busy && (
                    <div className="max-w-2xl mx-auto pt-4">
                        <h2 className="text-xl font-bold text-gray-800">Bonjour{prenom ? ` ${prenom}` : ''} 👋</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Je consulte vos contrats, alertes, textes juridiques et messages — uniquement ce que votre rôle vous permet de voir. Toute action passe par votre confirmation.
                        </p>

                        <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Point du jour</p>
                            {briefing === null && <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />}
                            {briefing && briefing.length === 0 && <p className="text-sm text-gray-400">Rien à signaler pour le moment.</p>}
                            <div className="flex flex-wrap gap-2">
                                {(briefing || []).map((item) => (
                                    <button key={item.label} type="button" onClick={() => send(item.question)} className={`px-3 py-2 rounded-xl text-sm font-medium transition ${TONES[item.tone] || TONES.gray}`}>
                                        {item.icon} {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Essayez</p>
                            <div className="grid sm:grid-cols-2 gap-2">
                                {suggestedPrompts(userRole).map((prompt) => (
                                    <button key={prompt} type="button" onClick={() => send(prompt)} className="text-left px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50/40 transition">
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {ui.map((message) => (message.role === 'user' ? (
                    <div key={message.id} className="flex justify-end">
                        <div dir="auto" className="max-w-[75%] px-4 py-2.5 rounded-2xl bg-orange-500 text-white text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {message.text}
                        </div>
                    </div>
                ) : (
                    <div key={message.id} className="flex gap-2.5">
                        <span className="flex-shrink-0 w-7 h-7 mt-1 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center">
                            <Sparkle className="w-3.5 h-3.5" />
                        </span>
                        <div className="max-w-[85%] min-w-0">
                            <div className={`px-4 py-3 rounded-2xl border shadow-sm ${message.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-800'}`}>
                                <div id={`ai-msg-${message.id}`}><Markdown text={message.text} /></div>
                                {message.error && message.retry && (
                                    <button type="button" onClick={() => retry(message)} className="mt-2 text-xs font-semibold underline">Réessayer</button>
                                )}
                            </div>
                            <AssistantCards cards={message.cards} onOpenContrat={setOpenContrat} onOpenAlerte={openAlerte} onWriteTo={onWriteTo} />
                            {!message.error && (
                                <div className="mt-1 flex items-center gap-0.5">
                                    <IconButton title={copiedId === message.id ? 'Copié !' : 'Copier'} onClick={() => copy(message)} active={copiedId === message.id}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </IconButton>
                                    <IconButton title="Réponse utile" onClick={() => vote(message, 'up')} active={message.feedback === 'up'}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                    </IconButton>
                                    <IconButton title="Réponse à améliorer" onClick={() => vote(message, 'down')} active={message.feedback === 'down'}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                                    </IconButton>
                                    <IconButton title="Imprimer / enregistrer en PDF" onClick={() => exportMessage(message)}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    </IconButton>
                                    {message.id === lastAssistantId && !busy && (
                                        <IconButton title="Régénérer la réponse" onClick={regenerate}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </IconButton>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )))}

                {busy && (
                    <div className="flex gap-2.5">
                        <span className="flex-shrink-0 w-7 h-7 mt-1 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center">
                            <Sparkle className="w-3.5 h-3.5 animate-pulse" />
                        </span>
                        <div className="max-w-[85%] min-w-0 space-y-2">
                            {streamText && (
                                <div className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-sm">
                                    <Markdown text={streamText.replace(/\[\[[^\]]*\]?\]?/g, '')} />
                                </div>
                            )}
                            {pending ? (
                                <ActionConfirmCard
                                    preview={pending.preview}
                                    args={pending.args}
                                    onConfirm={(args) => settle({ ok: true, args })}
                                    onCancel={() => settle({ ok: false })}
                                />
                            ) : !streamText && (
                                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-500 shadow-sm">
                                    <span className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:120ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:240ms]" />
                                    </span>
                                    {waitSeconds > 0 ? `Assistant très sollicité — nouvelle tentative dans ${waitSeconds} s…` : status}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Saisie */}
            <div className="px-5 pt-3 pb-2 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        dir="auto"
                        rows={Math.min(5, Math.max(1, input.split('\n').length))}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
                        }}
                        placeholder={dictation.state === 'recording' ? 'Je vous écoute…' : 'Posez une question sur vos contrats, alertes, textes juridiques…'}
                        className="flex-1 resize-none px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition text-base bg-white/80"
                        autoFocus
                    />
                    {dictation.supported && (
                        <button
                            type="button"
                            onClick={dictation.toggle}
                            disabled={dictation.state === 'transcribing'}
                            title={dictation.state === 'recording' ? 'Arrêter la dictée' : 'Dicter (français / arabe)'}
                            className={`p-3 rounded-xl transition disabled:opacity-50 ${dictation.state === 'recording' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {dictation.state === 'transcribing' ? (
                                <span className="block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8M12 15a4 4 0 01-4-4V6a4 4 0 118 0v5a4 4 0 01-4 4z" /></svg>
                            )}
                        </button>
                    )}
                    {busy ? (
                        <button type="button" onClick={stop} className="px-5 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition font-medium flex items-center gap-2 shadow-lg">
                            <span className="w-3 h-3 bg-white rounded-sm" /> Arrêter
                        </button>
                    ) : (
                        <button type="button" onClick={() => send(input)} disabled={!input.trim()} className="px-5 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            Envoyer
                        </button>
                    )}
                </div>
                {dictation.error && <p className="mt-1 text-xs text-red-600">{dictation.error}</p>}
                <p className="mt-1.5 text-[11px] text-center text-gray-400">
                    L'assistant peut se tromper : vérifiez les informations importantes. Il aide à l'analyse et ne remplace pas un avis juridique.
                </p>
            </div>

            {openContrat && (
                <DetailsContratModal
                    isOpen
                    contrat={openContrat}
                    axiosInstance={axiosInstance}
                    onClose={() => setOpenContrat(null)}
                />
            )}
        </>
    );
};

export default AssistantPanel;
