import React, { useState } from 'react';

// Carte de confirmation d'une action d'écriture proposée par l'assistant.
// RÈGLE : l'IA propose, l'humain clique. Rien n'est exécuté sans ce clic — c'est
// aussi ce qui neutralise une injection de prompt (au pire : une mauvaise proposition).
const ActionConfirmCard = ({ preview, args, onConfirm, onCancel }) => {
    const editable = preview.editable;
    const [value, setValue] = useState(editable ? String(args[editable.champ] || '') : '');
    const blocked = editable && editable.champ === 'contenu' && !value.trim();

    return (
        <div className={`rounded-2xl border-2 p-4 bg-white shadow-sm ${preview.danger ? 'border-red-300' : 'border-orange-300'}`}>
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span>{preview.danger ? '⚠️' : '✋'}</span>{preview.titre}
            </p>

            {preview.lignes && preview.lignes.length > 0 && (
                <dl className="mt-3 space-y-1.5 text-sm">
                    {preview.lignes.map(([label, val]) => (
                        <div key={label} className="flex gap-2">
                            <dt className="w-28 flex-shrink-0 text-gray-500 capitalize">{label}</dt>
                            <dd dir="auto" className="flex-1 text-gray-900 break-words whitespace-pre-wrap">{val}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {editable && (
                <label className="block mt-3">
                    <span className="text-xs text-gray-500">{editable.label} — modifiable avant confirmation</span>
                    <textarea
                        dir="auto"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={Math.min(8, Math.max(3, value.split('\n').length + 1))}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                    />
                </label>
            )}

            {preview.avertissement && (
                <p className="mt-3 px-3 py-2 rounded-lg bg-red-50 text-xs text-red-700">{preview.avertissement}</p>
            )}

            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                    Annuler
                </button>
                <button
                    type="button"
                    disabled={blocked}
                    onClick={() => onConfirm(editable ? { ...args, [editable.champ]: value } : args)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition disabled:opacity-50 ${preview.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                    {preview.bouton || 'Confirmer'}
                </button>
            </div>
        </div>
    );
};

export default ActionConfirmCard;
