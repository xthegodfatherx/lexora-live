// Components/Notification/NotificationCenter.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { axiosInstance } from '../../axios';

// ─── Config sévérité (badge couleur) ───────────────────────────────────────
const SEV_DOT = {
    critique: 'bg-red-500',
    eleve:    'bg-orange-500',
    moyen:    'bg-yellow-500',
    faible:   'bg-blue-400',
};

const SEV_BADGE = {
    critique: 'bg-red-100 text-red-700',
    eleve:    'bg-orange-100 text-orange-700',
    moyen:    'bg-yellow-100 text-yellow-700',
    faible:   'bg-blue-100 text-blue-700',
};

const fmtDateShort = (d) =>
    new Date(d).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
    });

// ════════════════════════════════════════════════════════════════════════════
// NotificationCenter - Alertes risque retard uniquement
// ════════════════════════════════════════════════════════════════════════════
const NotificationCenter = ({ userRole, userId, onNavigate }) => {
    // ── État
    const [riskAlerts, setRiskAlerts]       = useState([]);
    const [riskCount, setRiskCount]         = useState(0);
    const [isOpen, setIsOpen]               = useState(false);
    const [loading, setLoading]             = useState(false);
    const dropdownRef = useRef(null);

    // ── Fetch alertes risque retard (actives uniquement)
    const fetchRiskAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/notifications/risk-alerts/', {
                params: { type: 'retard', statut: 'nouveau', limit: 5 },
            });
            const alerts = res.data.alerts || [];
            setRiskAlerts(alerts);
            setRiskCount(res.data.total || alerts.length);
        } catch (err) {
            console.error('[NotificationCenter] fetchRiskAlerts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Chargement initial + polling 30s
    useEffect(() => {
        fetchRiskAlerts();
        const interval = setInterval(fetchRiskAlerts, 30_000);
        return () => clearInterval(interval);
    }, [fetchRiskAlerts]);

    // ── Fermer au clic extérieur
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Total badge (bulle rouge sur la cloche)
    const totalBadge = riskCount;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* ── Bouton cloche ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Ouvrir les alertes risque"
            >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                {totalBadge > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full leading-none">
                        {totalBadge > 99 ? '99+' : totalBadge}
                    </span>
                )}
            </button>

            {/* ── Dropdown ── */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                        <span className="font-semibold text-gray-800 text-sm">
                            Alertes risque retard
                            {riskCount > 0 && (
                                <span className="ml-2 text-xs font-normal text-red-500">
                                    ({riskCount} active{riskCount > 1 ? 's' : ''})
                                </span>
                            )}
                        </span>
                        <button
                            onClick={fetchRiskAlerts}
                            className="text-gray-400 hover:text-gray-600 transition"
                            title="Rafraîchir"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                        </button>
                    </div>

                    {/* Corps scrollable */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading && riskAlerts.length === 0 ? (
                            <div className="flex justify-center py-10">
                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : riskAlerts.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-50 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-400">Aucune alerte active</p>
                                <p className="text-xs text-gray-300 mt-1">Tous les risques sont sous contrôle</p>
                            </div>
                        ) : (
                            riskAlerts.map(alert => {
                                const sevBadge = SEV_BADGE[alert.severite] || SEV_BADGE.faible;
                                const sevDot   = SEV_DOT[alert.severite]   || SEV_DOT.faible;
                                const isEscalade = alert.escalade?.escalader;

                                return (
                                    <div
                                        key={alert._id}
                                        className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => {
                                            setIsOpen(false);
                                            onNavigate?.('/notifications?tab=risques');
                                        }}
                                    >
                                        <div className="flex items-start gap-2">
                                            {/* Icône escalade / warning */}
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isEscalade ? 'bg-red-100' : 'bg-orange-100'}`}>
                                                {isEscalade ? '🚨' : '⚠️'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className="font-mono text-xs font-bold text-gray-600">{alert.code}</span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${sevBadge}`}>
                                                        <span className={`inline-block w-1 h-1 rounded-full ${sevDot} mr-0.5`} />
                                                        {alert.severite}
                                                    </span>
                                                    {isEscalade && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                                            Escalade
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                                                    {alert.description?.split(' / ')[0] || alert.description}
                                                </p>
                                                <div className="flex items-center justify-between mt-0.5">
                                                    <p className="text-xs text-gray-400">
                                                        Contrat #{alert.contrat_id}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {fmtDateShort(alert.createdAt)}
                                                    </p>
                                                </div>
                                                {alert.occurrence_count > 1 && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {alert.occurrence_count} occurrence{alert.occurrence_count > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onNavigate?.('/notifications?tab=risques');
                            }}
                            className="text-xs text-orange-500 hover:text-orange-600 font-medium transition"
                        >
                            Voir toutes les alertes →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;