import React from 'react';
import { ROLE_LABELS } from '../../ai/roles';
import { documentPdfUrl } from '../../ai/tools';

// Fiches cliquables affichées sous une réponse de l'assistant (contrat, document, alerte, utilisateur).

const STATUT = {
    brouillon: ['Brouillon', 'bg-gray-100 text-gray-600'],
    actif: ['Actif', 'bg-green-100 text-green-700'],
    expire: ['Expiré', 'bg-red-100 text-red-700'],
    resilie: ['Résilié', 'bg-orange-100 text-orange-700'],
};
const SEVERITE = {
    critique: 'bg-red-100 text-red-700',
    eleve: 'bg-orange-100 text-orange-700',
    moyen: 'bg-yellow-100 text-yellow-700',
    faible: 'bg-blue-100 text-blue-700',
};
const DOC_STATUT = {
    EN_VIGUEUR: ['En vigueur', 'bg-green-100 text-green-700'],
    ABROGE: ['Abrogé', 'bg-red-100 text-red-700'],
    MODIFIE: ['Modifié', 'bg-yellow-100 text-yellow-700'],
};
const ALERTE_STATUT = { nouveau: 'Nouveau', en_cours: 'En cours', resolu: 'Résolu', ignore: 'Ignoré' };

const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('fr-FR');
};
const fmtMontant = (montant, devise) => (
    montant === null || montant === undefined ? '' : `${Number(montant).toLocaleString('fr-FR')} ${devise || ''}`.trim()
);

const Badge = ({ className, children }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${className}`}>{children}</span>
);

const Shell = ({ icon, onClick, title, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="w-full text-left flex gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition"
    >
        <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-base">{icon}</span>
        <span className="flex-1 min-w-0">{children}</span>
    </button>
);

const ContratCard = ({ data, onOpen }) => {
    const [label, tone] = STATUT[data.statut] || [data.statut, 'bg-gray-100 text-gray-600'];
    return (
        <Shell icon="📄" onClick={() => onOpen(data)} title="Ouvrir le détail du contrat">
            <span className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold text-gray-700">{data.numero_contrat}</span>
                {data.statut && <Badge className={tone}>{label}</Badge>}
                {data.est_en_retard && <Badge className="bg-red-100 text-red-700">En retard</Badge>}
                {data.risques_critiques > 0 && <Badge className="bg-red-600 text-white">{data.risques_critiques} critique{data.risques_critiques > 1 ? 's' : ''}</Badge>}
            </span>
            <span className="block text-sm font-medium text-gray-900 truncate mt-0.5">{data.titre}</span>
            <span className="block text-xs text-gray-500 truncate">
                {[data.partie_b_nom, fmtMontant(data.montant, data.devise), data.date_fin && `fin ${fmtDate(data.date_fin)}`].filter(Boolean).join(' · ')}
            </span>
        </Shell>
    );
};

const DocumentCard = ({ data }) => {
    const url = documentPdfUrl(data);
    const [label, tone] = DOC_STATUT[data.statut] || [null, ''];
    return (
        <Shell icon="⚖️" onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')} title={url ? 'Ouvrir le PDF' : 'PDF indisponible'}>
            <span className="flex items-center gap-2 flex-wrap">
                {data.reference && <span className="font-mono text-xs font-semibold text-gray-700">{data.reference}</span>}
                {label && <Badge className={tone}>{label}</Badge>}
            </span>
            <span className="block text-sm font-medium text-gray-900 truncate mt-0.5">{data.titre}</span>
            <span className="block text-xs text-gray-500 truncate">
                {[data.categorie && data.categorie.replace(/_/g, ' ').toLowerCase(), data.organismeEmetteur, fmtDate(data.datePublication)].filter(Boolean).join(' · ')}
            </span>
        </Shell>
    );
};

const AlerteCard = ({ data, onOpen }) => (
    <Shell icon={data.niveau === 'escalade' ? '🚨' : '⚠️'} onClick={() => onOpen(data)} title="Voir dans les alertes">
        <span className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-gray-700">{data.code}</span>
            {data.severite && <Badge className={SEVERITE[data.severite] || SEVERITE.faible}>{data.severite}</Badge>}
            {data.statut && <Badge className="bg-gray-100 text-gray-600">{ALERTE_STATUT[data.statut] || data.statut}</Badge>}
        </span>
        <span className="block text-sm text-gray-800 mt-0.5 line-clamp-2">{data.description}</span>
        <span className="block text-xs text-gray-500">Contrat #{data.contrat_id}{data.createdAt ? ` · ${fmtDate(data.createdAt)}` : ''}</span>
    </Shell>
);

const UtilisateurCard = ({ data, onWrite }) => (
    <Shell icon="👤" onClick={() => onWrite(data)} title="Ouvrir une conversation">
        <span className="block text-sm font-medium text-gray-900 truncate">{data.nom_complet}</span>
        <span className="block text-xs text-gray-500 truncate">{ROLE_LABELS[data.role] || data.role || 'Aucun rôle'} · Écrire un message</span>
    </Shell>
);

const AssistantCards = ({ cards, onOpenContrat, onOpenAlerte, onWriteTo }) => {
    if (!cards || !cards.length) return null;
    return (
        <div className="mt-2 grid gap-2">
            {cards.map((card) => {
                const key = `${card.type}-${card.id}`;
                if (card.type === 'contrat') return <ContratCard key={key} data={card.data} onOpen={onOpenContrat} />;
                if (card.type === 'document') return <DocumentCard key={key} data={card.data} />;
                if (card.type === 'alerte') return <AlerteCard key={key} data={card.data} onOpen={onOpenAlerte} />;
                if (card.type === 'utilisateur') return <UtilisateurCard key={key} data={card.data} onWrite={onWriteTo} />;
                return null;
            })}
        </div>
    );
};

export default AssistantCards;
