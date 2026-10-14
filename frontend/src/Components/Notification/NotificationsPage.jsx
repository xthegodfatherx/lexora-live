// // // Components/Notification/NotificationsPage.jsx
// // import React, { useState, useEffect } from 'react';
// // import { axiosInstance } from '../../axios';

// // const NotificationsPage = () => {
// //     const [notifications, setNotifications] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [filter, setFilter] = useState('all'); // all, unread, read

// //     useEffect(() => {
// //         fetchNotifications();
// //     }, []);

// //     const fetchNotifications = async () => {
// //         try {
// //             const response = await axiosInstance.get('/notifications/all');
// //             setNotifications(response.data.notifications || []);
// //         } catch (err) {
// //             console.error('Erreur:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const markAsRead = async (id) => {
// //         try {
// //             await axiosInstance.put(`/notifications/${id}/read`);
// //             setNotifications(prev =>
// //                 prev.map(n => n.id === id ? { ...n, read: true } : n)
// //             );
// //         } catch (err) {
// //             console.error('Erreur:', err);
// //         }
// //     };

// //     const markAllAsRead = async () => {
// //         try {
// //             await axiosInstance.put('/notifications/read-all');
// //             setNotifications(prev =>
// //                 prev.map(n => ({ ...n, read: true }))
// //             );
// //         } catch (err) {
// //             console.error('Erreur:', err);
// //         }
// //     };

// //     const deleteNotification = async (id) => {
// //         try {
// //             await axiosInstance.delete(`/notifications/${id}`);
// //             setNotifications(prev => prev.filter(n => n.id !== id));
// //         } catch (err) {
// //             console.error('Erreur:', err);
// //         }
// //     };

// //     const filteredNotifications = notifications.filter(notif => {
// //         if (filter === 'unread') return !notif.read;
// //         if (filter === 'read') return notif.read;
// //         return true;
// //     });

// //     const getNotificationIcon = (type) => {
// //         switch (type) {
// //             case 'validation': return '✅';
// //             case 'rejet': return '❌';
// //             case 'reservation': return '🔄';
// //             case 'message': return '💬';
// //             case 'alert': return '⚠️';
// //             default: return '📋';
// //         }
// //     };

// //     const getNotificationColor = (type) => {
// //         switch (type) {
// //             case 'validation': return 'bg-green-100';
// //             case 'rejet': return 'bg-red-100';
// //             case 'reservation': return 'bg-orange-100';
// //             case 'message': return 'bg-blue-100';
// //             case 'alert': return 'bg-yellow-100';
// //             default: return 'bg-gray-100';
// //         }
// //     };

// //     return (
// //         <div className="max-w-4xl mx-auto p-6">
// //             <div className="flex justify-between items-center mb-6">
// //                 <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
// //                 <button
// //                     onClick={markAllAsRead}
// //                     className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
// //                 >
// //                     Tout marquer comme lu
// //                 </button>
// //             </div>

// //             {/* Filtres */}
// //             <div className="flex gap-2 mb-6">
// //                 <button
// //                     onClick={() => setFilter('all')}
// //                     className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
// //                         filter === 'all' 
// //                             ? 'bg-orange-500 text-white' 
// //                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
// //                     }`}
// //                 >
// //                     Toutes
// //                 </button>
// //                 <button
// //                     onClick={() => setFilter('unread')}
// //                     className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
// //                         filter === 'unread' 
// //                             ? 'bg-orange-500 text-white' 
// //                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
// //                     }`}
// //                 >
// //                     Non lues
// //                 </button>
// //                 <button
// //                     onClick={() => setFilter('read')}
// //                     className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
// //                         filter === 'read' 
// //                             ? 'bg-orange-500 text-white' 
// //                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
// //                     }`}
// //                 >
// //                     Lues
// //                 </button>
// //             </div>

// //             {/* Liste des notifications */}
// //             {loading ? (
// //                 <div className="flex justify-center py-12">
// //                     <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
// //                 </div>
// //             ) : filteredNotifications.length === 0 ? (
// //                 <div className="text-center py-12 bg-white rounded-xl shadow-sm">
// //                     <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
// //                     </svg>
// //                     <p className="text-gray-500">Aucune notification</p>
// //                 </div>
// //             ) : (
// //                 <div className="space-y-3">
// //                     {filteredNotifications.map(notif => (
// //                         <div
// //                             key={notif.id}
// //                             className={`p-4 rounded-xl border cursor-pointer transition ${
// //                                 notif.read 
// //                                     ? 'bg-white border-gray-200' 
// //                                     : 'bg-blue-50 border-blue-200 shadow-sm'
// //                             }`}
// //                             onClick={() => markAsRead(notif.id)}
// //                         >
// //                             <div className="flex items-start gap-3">
// //                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getNotificationColor(notif.type)}`}>
// //                                     {getNotificationIcon(notif.type)}
// //                                 </div>
// //                                 <div className="flex-1">
// //                                     <div className="flex justify-between items-start">
// //                                         <p className="font-medium text-gray-800">{notif.title}</p>
// //                                         <button
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 deleteNotification(notif.id);
// //                                             }}
// //                                             className="text-gray-400 hover:text-red-500 transition"
// //                                         >
// //                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// //                                             </svg>
// //                                         </button>
// //                                     </div>
// //                                     <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
// //                                     <p className="text-xs text-gray-400 mt-2">
// //                                         {new Date(notif.created_at).toLocaleString('fr-FR')}
// //                                     </p>
// //                                 </div>
// //                                 {!notif.read && (
// //                                     <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
// //                                 )}
// //                             </div>
// //                         </div>
// //                     ))}
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default NotificationsPage;
// import React, { useState, useEffect, useCallback } from 'react';
// import { axiosInstance } from '../../axios';

// // ─── Config ────────────────────────────────────────────────────────────────
// const SEVERITE_CONFIG = {
//     critique: { bg: 'bg-red-50',     border: 'border-red-300',    badge: 'bg-red-100 text-red-800',      dot: 'bg-red-500',    label: 'Critique' },
//     eleve:    { bg: 'bg-orange-50',  border: 'border-orange-300', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', label: 'Élevé'    },
//     moyen:    { bg: 'bg-yellow-50',  border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', label: 'Moyen'    },
//     faible:   { bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400',   label: 'Faible'   },
// };

// const ESCALADE_CONFIG = {
//     warning:  { icon: '⚠️', badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200', label: 'Avertissement' },
//     alert:    { icon: '🔔', badge: 'bg-orange-100 text-orange-800 border border-orange-200', label: 'Alerte'        },
//     escalade: { icon: '🚨', badge: 'bg-red-100 text-red-800 border border-red-200',          label: 'Escalade'      },
// };

// const NOTIF_CONFIG = {
//     validation:  { icon: '✅', bg: 'bg-green-100'  },
//     rejet:       { icon: '❌', bg: 'bg-red-100'    },
//     reservation: { icon: '🔄', bg: 'bg-orange-100' },
//     message:     { icon: '💬', bg: 'bg-blue-100'   },
//     alert:       { icon: '⚠️', bg: 'bg-yellow-100' },
// };

// const NOTIFIANT_LABEL = {
//     chef_departement:    'Chef de département',
//     directeur_direction: 'Directeur de direction',
//     directeur_activite:  "Directeur d'activité",
// };

// const fmtDate = (d) =>
//     new Date(d).toLocaleString('fr-FR', {
//         day: '2-digit', month: 'short', year: 'numeric',
//         hour: '2-digit', minute: '2-digit',
//     });

// // ════════════════════════════════════════════════════════════════════════════
// // URL helper — centralise le préfixe pour éviter toute désynchronisation
// // Adapter RISK_BASE si ton montage Express diffère (ex: '/api/risk-alerts')
// // ════════════════════════════════════════════════════════════════════════════
// const RISK_BASE = '/notifications/risk-alerts';   // ← ajuster si besoin

// // ════════════════════════════════════════════════════════════════════════════
// // COMPOSANT PRINCIPAL
// // ════════════════════════════════════════════════════════════════════════════
// const NotificationsPage = () => {
//     const [activeTab, setActiveTab]           = useState('general');

//     // Notifications générales
//     const [notifications, setNotifications]   = useState([]);
//     const [notifFilter, setNotifFilter]       = useState('all');
//     const [loadingNotif, setLoadingNotif]     = useState(true);

//     // Alertes risque retard
//     const [riskAlerts, setRiskAlerts]         = useState([]);
//     const [riskStats, setRiskStats]           = useState(null);
//     const [riskFilter, setRiskFilter]         = useState('all');
//     const [severiteFilter, setSeveriteFilter] = useState('all');
//     const [loadingRisk, setLoadingRisk]       = useState(false);
//     const [resolvingId, setResolvingId]       = useState(null);
//     const [resolveModal, setResolveModal]     = useState(null);
//     const [riskError, setRiskError]           = useState(null);

//     // ── Fetch notifications générales ────────────────────────────────────
//     const fetchNotifications = useCallback(async () => {
//         setLoadingNotif(true);
//         try {
//             const res = await axiosInstance.get('/notifications/all');
//             setNotifications(res.data.notifications || []);
//         } catch (err) {
//             console.error('[NotificationsPage] fetchNotifications:', err);
//         } finally {
//             setLoadingNotif(false);
//         }
//     }, []);

//     // ── Fetch alertes risque ──────────────────────────────────────────────
//     const fetchRiskAlerts = useCallback(async () => {
//         setLoadingRisk(true);
//         setRiskError(null);
//         try {
//             // Construction des params — on n'envoie pas les params vides
//             const params = { type: 'retard' };
//             if (riskFilter !== 'all')      params.statut   = riskFilter;
//             if (severiteFilter !== 'all')  params.severite = severiteFilter;

//             // Appel 1 : liste filtrée (pour l'affichage)
//             const res = await axiosInstance.get(`${RISK_BASE}/`, { params });
//             const alerts = res.data.alerts || [];
//             setRiskAlerts(alerts);

//             // Appel 2 : toutes les alertes retard pour les stats globales (sans filtre statut/sev)
//             const statsRes = await axiosInstance.get(`${RISK_BASE}/`, {
//                 params: { type: 'retard', limit: 999 },
//             });
//             const all    = statsRes.data.alerts || [];
//             const active = all.filter(a => ['nouveau', 'en_cours'].includes(a.statut));
//             setRiskStats({
//                 total:     all.length,
//                 active:    active.length,
//                 critique:  active.filter(a => a.severite === 'critique').length,
//                 eleve:     active.filter(a => a.severite === 'eleve').length,
//                 escalades: all.filter(a => a.escalade?.escalader).length,
//             });
//         } catch (err) {
//             console.error('[NotificationsPage] fetchRiskAlerts:', err);
//             const status = err?.response?.status;
//             if (status === 404) {
//                 setRiskError('Route introuvable (404) — vérifier le montage Express : app.use("/notifications/risk-alerts", riskAlertRoutes)');
//             } else if (status === 401 || status === 403) {
//                 setRiskError('Non autorisé — vérifier le JWT dans axiosInstance.');
//             } else {
//                 setRiskError(`Erreur ${status || 'réseau'} — ${err.message}`);
//             }
//         } finally {
//             setLoadingRisk(false);
//         }
//     }, [riskFilter, severiteFilter]);

//     useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

//     useEffect(() => {
//         if (activeTab === 'risques') fetchRiskAlerts();
//     }, [activeTab, fetchRiskAlerts]);

//     // ── Actions notifications générales ─────────────────────────────────
//     const markNotifAsRead = async (id) => {
//         try {
//             await axiosInstance.put(`/notifications/${id}/read`);
//             setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
//         } catch (err) { console.error(err); }
//     };

//     const markAllAsRead = async () => {
//         try {
//             await axiosInstance.put('/notifications/read-all');
//             setNotifications(prev => prev.map(n => ({ ...n, read: true })));
//         } catch (err) { console.error(err); }
//     };

//     const deleteNotif = async (id, e) => {
//         e.stopPropagation();
//         try {
//             await axiosInstance.delete(`/notifications/${id}`);
//             setNotifications(prev => prev.filter(n => n.id !== id));
//         } catch (err) { console.error(err); }
//     };

//     // ── Action : changer statut alerte risque ────────────────────────────
//     const updateAlertStatus = async (alertId, statut, note = '') => {
//         setResolvingId(alertId);
//         try {
//             // PATCH /notifications/risk-alerts/:id  avec body JSON
//             await axiosInstance.patch(`${RISK_BASE}/${alertId}`, {
//                 statut,
//                 resolution_note: note,
//             });
//             setRiskAlerts(prev =>
//                 prev.map(a =>
//                     a._id === alertId
//                         ? { ...a, statut, resolution_note: note, resolved_at: statut === 'resolu' ? new Date() : null }
//                         : a
//                 )
//             );
//             setResolveModal(null);
//         } catch (err) {
//             console.error('[NotificationsPage] updateAlertStatus:', err);
//         } finally {
//             setResolvingId(null);
//         }
//     };

//     // ── Filtre notifs ─────────────────────────────────────────────────────
//     const filteredNotifs = notifications.filter(n => {
//         if (notifFilter === 'unread') return !n.read;
//         if (notifFilter === 'read')   return n.read;
//         return true;
//     });
//     const unreadCount    = notifications.filter(n => !n.read).length;
//     const activeRiskCount = riskStats?.active ?? 0;

//     // ════════════════════════════════════════════════════════════════════════
//     return (
//         <div className="max-w-5xl mx-auto p-6">

//             {/* En-tête */}
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
//                 {activeTab === 'general' && unreadCount > 0 && (
//                     <button onClick={markAllAsRead} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
//                         Tout marquer comme lu
//                     </button>
//                 )}
//                 {activeTab === 'risques' && (
//                     <button onClick={fetchRiskAlerts} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
//                         </svg>
//                         Rafraîchir
//                     </button>
//                 )}
//             </div>

//             {/* Onglets */}
//             <div className="flex gap-1 mb-6 border-b border-gray-200">
//                 {/* <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} badge={unreadCount} badgeColor="bg-blue-500">
//                     Général
//                 </TabButton> */}
//                 <TabButton active={activeTab === 'risques'} onClick={() => setActiveTab('risques')} badge={activeRiskCount} badgeColor="bg-red-500">
//                     Alertes risque retard
//                 </TabButton>
//             </div>

//             {/* ══ ONGLET GÉNÉRAL ══ */}
//             {/* {activeTab === 'general' && (
//                 <div>
//                     <div className="flex gap-2 mb-5">
//                         {[['all','Toutes'],['unread','Non lues'],['read','Lues']].map(([v,l]) => (
//                             <FilterChip key={v} active={notifFilter === v} onClick={() => setNotifFilter(v)}>{l}</FilterChip>
//                         ))}
//                     </div>
//                     {loadingNotif ? <LoadingSpinner /> : filteredNotifs.length === 0 ? (
//                         <EmptyState message="Aucune notification" />
//                     ) : (
//                         <div className="space-y-2">
//                             {filteredNotifs.map(notif => {
//                                 const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.alert;
//                                 return (
//                                     <div key={notif.id} onClick={() => markNotifAsRead(notif.id)}
//                                         className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition hover:shadow-sm ${notif.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
//                                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${cfg.bg}`}>
//                                             {cfg.icon}
//                                         </div>
//                                         <div className="flex-1 min-w-0">
//                                             <div className="flex justify-between items-start gap-2">
//                                                 <p className="font-medium text-gray-800 text-sm">{notif.title}</p>
//                                                 <button onClick={(e) => deleteNotif(notif.id, e)} className="text-gray-300 hover:text-red-400 transition flex-shrink-0">
//                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
//                                                     </svg>
//                                                 </button>
//                                             </div>
//                                             <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
//                                             <p className="text-xs text-gray-400 mt-1">{fmtDate(notif.created_at)}</p>
//                                         </div>
//                                         {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </div>
//             )} */}

//             {/* ══ ONGLET RISQUES ══ */}
//             {activeTab === 'risques' && (
//                 <div>
//                     {/* Bandeau erreur explicatif */}
//                     {riskError && (
//                         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
//                             <p className="font-medium mb-1">⚠️ Erreur de chargement</p>
//                             <p className="font-mono text-xs">{riskError}</p>
//                             <p className="mt-2 text-xs text-red-600">
//                                 Vérifier dans <code className="bg-red-100 px-1 rounded">app.js</code> :{' '}
//                                 <code className="bg-red-100 px-1 rounded">app.use('/notifications/risk-alerts', riskAlertRoutes)</code>
//                             </p>
//                         </div>
//                     )}

//                     {/* Stats */}
//                     {riskStats && !riskError && (
//                         <div className="grid grid-cols-5 gap-3 mb-5">
//                             <StatCard label="Total"     value={riskStats.total}     color="text-gray-700" />
//                             <StatCard label="Actives"   value={riskStats.active}    color="text-orange-600" />
//                             <StatCard label="Critiques" value={riskStats.critique}  color="text-red-600" />
//                             <StatCard label="Élevées"   value={riskStats.eleve}     color="text-orange-500" />
//                             <StatCard label="Escalades" value={riskStats.escalades} color="text-red-700" highlight={riskStats.escalades > 0} />
//                         </div>
//                     )}

//                     {/* Filtres statut */}
//                     <div className="flex flex-wrap gap-2 mb-4">
//                         {[['all','Tous statuts'],['nouveau','Nouveau'],['en_cours','En cours'],['resolu','Résolu'],['ignore','Ignoré']].map(([v,l]) => (
//                             <FilterChip key={v} active={riskFilter === v} onClick={() => setRiskFilter(v)}>{l}</FilterChip>
//                         ))}
//                     </div>

//                     {/* Filtres sévérité */}
//                     <div className="flex flex-wrap gap-2 mb-5">
//                         {[['all','Toutes sévérités'],['critique','Critique'],['eleve','Élevé'],['moyen','Moyen'],['faible','Faible']].map(([v,l]) => (
//                             <FilterChip key={v} active={severiteFilter === v} onClick={() => setSeveriteFilter(v)} variant="secondary">{l}</FilterChip>
//                         ))}
//                     </div>

//                     {/* Liste */}
//                     {loadingRisk ? <LoadingSpinner /> : riskAlerts.length === 0 && !riskError ? (
//                         <EmptyState message="Aucune alerte risque retard" sub="Les alertes apparaissent ici après analyse d'un contrat CLM." />
//                     ) : !riskError && (
//                         <div className="space-y-3">
//                             {riskAlerts.map(alert => {
//                                 const sev = SEVERITE_CONFIG[alert.severite] || SEVERITE_CONFIG.faible;
//                                 const esc = ESCALADE_CONFIG[alert.escalade?.niveau] || ESCALADE_CONFIG.warning;
//                                 const isResolved = ['resolu', 'ignore'].includes(alert.statut);
//                                 return (
//                                     <div key={alert._id} className={`rounded-xl border p-4 transition ${sev.bg} ${sev.border} ${isResolved ? 'opacity-60' : ''}`}>
//                                         {/* Badges */}
//                                         <div className="flex flex-wrap items-center gap-2 mb-2">
//                                             <span className="font-mono font-bold text-sm text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded">
//                                                 {alert.code}
//                                             </span>
//                                             <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sev.badge}`}>
//                                                 <span className={`inline-block w-1.5 h-1.5 rounded-full ${sev.dot} mr-1`} />
//                                                 {sev.label}
//                                             </span>
//                                             <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${esc.badge}`}>
//                                                 {esc.icon} {esc.label}
//                                             </span>
//                                             <span className="ml-auto"><StatusBadge statut={alert.statut} /></span>
//                                         </div>

//                                         {/* Description */}
//                                         <p className="text-sm text-gray-700 leading-relaxed mb-2">
//                                             {alert.description?.split(' / ')[0]}
//                                         </p>

//                                         {/* Meta */}
//                                         <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
//                                             {alert.article_ref && (
//                                                 <span className="flex items-center gap-1">
//                                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
//                                                     </svg>
//                                                     {alert.article_ref}
//                                                 </span>
//                                             )}
//                                             <span>Contrat #{alert.contrat_id}</span>
//                                             <span>{fmtDate(alert.createdAt)}</span>
//                                             {alert.occurrence_count > 1 && (
//                                                 <span className="text-red-600 font-medium">
//                                                     {alert.occurrence_count} occurrences — {NOTIFIANT_LABEL[alert.escalade?.notifier] || alert.escalade?.notifier}
//                                                 </span>
//                                             )}
//                                         </div>

//                                         {/* Suggestion */}
//                                         {alert.suggestion && (
//                                             <div className="text-xs text-gray-600 bg-white/60 border border-white/80 rounded-lg px-3 py-2 mb-3">
//                                                 <span className="font-medium text-gray-700">Suggestion : </span>
//                                                 {alert.suggestion.split(' / ')[0]}
//                                             </div>
//                                         )}

//                                         {/* Note résolution */}
//                                         {alert.resolution_note && (
//                                             <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
//                                                 <span className="font-medium">Note : </span>{alert.resolution_note}
//                                             </div>
//                                         )}

//                                         {/* Actions */}
//                                         {!isResolved && (
//                                             <div className="flex gap-2 flex-wrap mt-1">
//                                                 {alert.statut === 'nouveau' && (
//                                                     <ActionButton onClick={() => updateAlertStatus(alert._id, 'en_cours')} loading={resolvingId === alert._id} color="blue">
//                                                         Prendre en charge
//                                                     </ActionButton>
//                                                 )}
//                                                 <ActionButton onClick={() => setResolveModal({ alertId: alert._id, note: '' })} loading={false} color="green">
//                                                     Marquer résolu
//                                                 </ActionButton>
//                                                 <ActionButton onClick={() => updateAlertStatus(alert._id, 'ignore')} loading={resolvingId === alert._id} color="gray">
//                                                     Ignorer
//                                                 </ActionButton>
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Modal résolution */}
//             {resolveModal && (
//                 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
//                         <h2 className="text-lg font-semibold text-gray-800 mb-1">Résoudre l'alerte</h2>
//                         <p className="text-sm text-gray-500 mb-4">Note optionnelle sur la résolution.</p>
//                         <textarea
//                             rows={3}
//                             value={resolveModal.note}
//                             onChange={e => setResolveModal(prev => ({ ...prev, note: e.target.value }))}
//                             placeholder="Actions prises, raison de résolution..."
//                             className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 mb-4"
//                         />
//                         <div className="flex gap-2 justify-end">
//                             <button onClick={() => setResolveModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={() => updateAlertStatus(resolveModal.alertId, 'resolu', resolveModal.note)}
//                                 disabled={resolvingId === resolveModal.alertId}
//                                 className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
//                             >
//                                 {resolvingId === resolveModal.alertId ? 'En cours…' : 'Confirmer'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // ── Sub-components ────────────────────────────────────────────────────────────
// const TabButton = ({ active, onClick, children, badge, badgeColor }) => (
//     <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition ${active ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
//         {children}
//         {badge > 0 && <span className={`text-xs text-white ${badgeColor} rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center`}>{badge > 99 ? '99+' : badge}</span>}
//     </button>
// );

// const FilterChip = ({ active, onClick, children, variant = 'primary' }) => (
//     <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${active ? (variant === 'primary' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-white') : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
//         {children}
//     </button>
// );

// const StatCard = ({ label, value, color, highlight }) => (
//     <div className={`bg-white rounded-xl border p-3 text-center ${highlight ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
//         <p className={`text-2xl font-bold ${color}`}>{value}</p>
//         <p className="text-xs text-gray-500 mt-0.5">{label}</p>
//     </div>
// );

// const StatusBadge = ({ statut }) => {
//     const cfg = { nouveau: 'bg-blue-100 text-blue-800', en_cours: 'bg-orange-100 text-orange-800', resolu: 'bg-green-100 text-green-800', ignore: 'bg-gray-100 text-gray-600' }[statut] || 'bg-gray-100 text-gray-600';
//     const lbl = { nouveau: 'Nouveau', en_cours: 'En cours', resolu: 'Résolu', ignore: 'Ignoré' }[statut] || statut;
//     return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg}`}>{lbl}</span>;
// };

// const ActionButton = ({ onClick, loading, color, children }) => {
//     const colors = { blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200', green: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200', gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200' };
//     return (
//         <button onClick={onClick} disabled={loading} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${colors[color]}`}>
//             {loading ? 'En cours…' : children}
//         </button>
//     );
// };

// const LoadingSpinner = () => (
//     <div className="flex justify-center py-16">
//         <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
//     </div>
// );

// const EmptyState = ({ message, sub }) => (
//     <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
//         <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
//             <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
//             </svg>
//         </div>
//         <p className="text-gray-500 font-medium">{message}</p>
//         {sub && <p className="text-xs text-gray-400 mt-1 max-w-xs">{sub}</p>}
//     </div>
// );

// export default NotificationsPage;
// Components/Notification/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../../axios';
import { AI_ENABLED } from '../../ai/roles';
import { AlerteAiAdvice, NoteAiButton } from '../Assistant/AlerteAi';

// ─── Config ────────────────────────────────────────────────────────────────
const SEVERITE_CONFIG = {
    critique: { bg: 'bg-red-50',     border: 'border-red-300',    badge: 'bg-red-100 text-red-800',      dot: 'bg-red-500',    label: 'Critique' },
    eleve:    { bg: 'bg-orange-50',  border: 'border-orange-300', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', label: 'Élevé'    },
    moyen:    { bg: 'bg-yellow-50',  border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', label: 'Moyen'    },
    faible:   { bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400',   label: 'Faible'   },
};

const ESCALADE_CONFIG = {
    warning:  { icon: '⚠️', badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200', label: 'Avertissement' },
    alert:    { icon: '🔔', badge: 'bg-orange-100 text-orange-800 border border-orange-200', label: 'Alerte'        },
    escalade: { icon: '🚨', badge: 'bg-red-100 text-red-800 border border-red-200',          label: 'Escalade'      },
};

const NOTIFIANT_LABEL = {
    chef_departement:    'Chef de département',
    directeur_direction: 'Directeur de direction',
    directeur_activite:  "Directeur d'activité",
};

const fmtDate = (d) =>
    new Date(d).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

// URL helper — centralise le préfixe pour éviter toute désynchronisation
const RISK_BASE = '/notifications/risk-alerts';

// ════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL - Alertes risque retard uniquement
// ════════════════════════════════════════════════════════════════════════════
const NotificationsPage = () => {
    // Alertes risque retard
    const [riskAlerts, setRiskAlerts]         = useState([]);
    const [riskStats, setRiskStats]           = useState(null);
    const [riskFilter, setRiskFilter]         = useState('all');
    const [severiteFilter, setSeveriteFilter] = useState('all');
    const [loadingRisk, setLoadingRisk]       = useState(false);
    const [resolvingId, setResolvingId]       = useState(null);
    const [resolveModal, setResolveModal]     = useState(null);
    const [riskError, setRiskError]           = useState(null);

    // ── Fetch alertes risque ──────────────────────────────────────────────
    const fetchRiskAlerts = useCallback(async () => {
        setLoadingRisk(true);
        setRiskError(null);
        try {
            // Construction des params — on n'envoie pas les params vides
            const params = { type: 'retard' };
            if (riskFilter !== 'all')      params.statut   = riskFilter;
            if (severiteFilter !== 'all')  params.severite = severiteFilter;

            // Appel 1 : liste filtrée (pour l'affichage)
            const res = await axiosInstance.get(`${RISK_BASE}/`, { params });
            const alerts = res.data.alerts || [];
            setRiskAlerts(alerts);

            // Appel 2 : toutes les alertes retard pour les stats globales (sans filtre statut/sev)
            const statsRes = await axiosInstance.get(`${RISK_BASE}/`, {
                params: { type: 'retard', limit: 999 },
            });
            const all    = statsRes.data.alerts || [];
            const active = all.filter(a => ['nouveau', 'en_cours'].includes(a.statut));
            setRiskStats({
                total:     all.length,
                active:    active.length,
                critique:  active.filter(a => a.severite === 'critique').length,
                eleve:     active.filter(a => a.severite === 'eleve').length,
                escalades: all.filter(a => a.escalade?.escalader).length,
            });
        } catch (err) {
            console.error('[NotificationsPage] fetchRiskAlerts:', err);
            const status = err?.response?.status;
            if (status === 404) {
                setRiskError('Route introuvable (404) — vérifier le montage Express : app.use("/notifications/risk-alerts", riskAlertRoutes)');
            } else if (status === 401 || status === 403) {
                setRiskError('Non autorisé — vérifier le JWT dans axiosInstance.');
            } else {
                setRiskError(`Erreur ${status || 'réseau'} — ${err.message}`);
            }
        } finally {
            setLoadingRisk(false);
        }
    }, [riskFilter, severiteFilter]);

    useEffect(() => {
        fetchRiskAlerts();
    }, [fetchRiskAlerts]);

    // ── Action : changer statut alerte risque ────────────────────────────
    const updateAlertStatus = async (alertId, statut, note = '') => {
        setResolvingId(alertId);
        try {
            await axiosInstance.patch(`${RISK_BASE}/${alertId}`, {
                statut,
                resolution_note: note,
            });
            setRiskAlerts(prev =>
                prev.map(a =>
                    a._id === alertId
                        ? { ...a, statut, resolution_note: note, resolved_at: statut === 'resolu' ? new Date() : null }
                        : a
                )
            );
            // Rafraîchir les stats après modification
            fetchRiskAlerts();
            setResolveModal(null);
        } catch (err) {
            console.error('[NotificationsPage] updateAlertStatus:', err);
        } finally {
            setResolvingId(null);
        }
    };

    const activeRiskCount = riskStats?.active ?? 0;

    // ════════════════════════════════════════════════════════════════════════
    return (
        <div className="max-w-5xl mx-auto p-6">

            {/* En-tête */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Alertes risque retard</h1>
                <button 
                    onClick={fetchRiskAlerts} 
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Rafraîchir
                </button>
            </div>

            {/* Indicateur actif */}
            {activeRiskCount > 0 && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-orange-700 font-medium">
                        {activeRiskCount} alerte{activeRiskCount > 1 ? 's' : ''} active{activeRiskCount > 1 ? 's' : ''} nécessitant votre attention
                    </span>
                </div>
            )}

            {/* Bandeau erreur explicatif */}
            {riskError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <p className="font-medium mb-1">⚠️ Erreur de chargement</p>
                    <p className="font-mono text-xs">{riskError}</p>
                    <p className="mt-2 text-xs text-red-600">
                        Vérifier dans <code className="bg-red-100 px-1 rounded">app.js</code> :{' '}
                        <code className="bg-red-100 px-1 rounded">app.use('/notifications/risk-alerts', riskAlertRoutes)</code>
                    </p>
                </div>
            )}

            {/* Stats */}
            {riskStats && !riskError && (
                <div className="grid grid-cols-5 gap-3 mb-5">
                    <StatCard label="Total"     value={riskStats.total}     color="text-gray-700" />
                    <StatCard label="Actives"   value={riskStats.active}    color="text-orange-600" />
                    <StatCard label="Critiques" value={riskStats.critique}  color="text-red-600" />
                    <StatCard label="Élevées"   value={riskStats.eleve}     color="text-orange-500" />
                    <StatCard label="Escalades" value={riskStats.escalades} color="text-red-700" highlight={riskStats.escalades > 0} />
                </div>
            )}

            {/* Filtres statut */}
            <div className="flex flex-wrap gap-2 mb-4">
                {[['all','Tous statuts'],['nouveau','Nouveau'],['en_cours','En cours'],['resolu','Résolu'],['ignore','Ignoré']].map(([v,l]) => (
                    <FilterChip key={v} active={riskFilter === v} onClick={() => setRiskFilter(v)}>{l}</FilterChip>
                ))}
            </div>

            {/* Filtres sévérité */}
            <div className="flex flex-wrap gap-2 mb-5">
                {[['all','Toutes sévérités'],['critique','Critique'],['eleve','Élevé'],['moyen','Moyen'],['faible','Faible']].map(([v,l]) => (
                    <FilterChip key={v} active={severiteFilter === v} onClick={() => setSeveriteFilter(v)} variant="secondary">{l}</FilterChip>
                ))}
            </div>

            {/* Liste */}
            {loadingRisk ? <LoadingSpinner /> : riskAlerts.length === 0 && !riskError ? (
                <EmptyState message="Aucune alerte risque retard" sub="Les alertes apparaissent ici après analyse d'un contrat CLM." />
            ) : !riskError && (
                <div className="space-y-3">
                    {riskAlerts.map(alert => {
                        const sev = SEVERITE_CONFIG[alert.severite] || SEVERITE_CONFIG.faible;
                        const esc = ESCALADE_CONFIG[alert.escalade?.niveau] || ESCALADE_CONFIG.warning;
                        const isResolved = ['resolu', 'ignore'].includes(alert.statut);
                        return (
                            <div key={alert._id} className={`rounded-xl border p-4 transition ${sev.bg} ${sev.border} ${isResolved ? 'opacity-60' : ''}`}>
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-mono font-bold text-sm text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded">
                                        {alert.code}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sev.badge}`}>
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${sev.dot} mr-1`} />
                                        {sev.label}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${esc.badge}`}>
                                        {esc.icon} {esc.label}
                                    </span>
                                    <span className="ml-auto"><StatusBadge statut={alert.statut} /></span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    {alert.description?.split(' / ')[0]}
                                </p>

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                                    {alert.article_ref && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                            {alert.article_ref}
                                        </span>
                                    )}
                                    <span>Contrat #{alert.contrat_id}</span>
                                    <span>{fmtDate(alert.createdAt)}</span>
                                    {alert.occurrence_count > 1 && (
                                        <span className="text-red-600 font-medium">
                                            {alert.occurrence_count} occurrences — {NOTIFIANT_LABEL[alert.escalade?.notifier] || alert.escalade?.notifier}
                                        </span>
                                    )}
                                </div>

                                {/* Suggestion */}
                                {alert.suggestion && (
                                    <div className="text-xs text-gray-600 bg-white/60 border border-white/80 rounded-lg px-3 py-2 mb-3">
                                        <span className="font-medium text-gray-700">Suggestion : </span>
                                        {alert.suggestion.split(' / ')[0]}
                                    </div>
                                )}

                                {/* Note résolution */}
                                {alert.resolution_note && (
                                    <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                                        <span className="font-medium">Note : </span>{alert.resolution_note}
                                    </div>
                                )}

                                {/* IA : explication de l'alerte et prochaines étapes (à la demande) */}
                                {AI_ENABLED && !isResolved && <AlerteAiAdvice alert={alert} />}

                                {/* Actions */}
                                {!isResolved && (
                                    <div className="flex gap-2 flex-wrap mt-1">
                                        {alert.statut === 'nouveau' && (
                                            <ActionButton onClick={() => updateAlertStatus(alert._id, 'en_cours')} loading={resolvingId === alert._id} color="blue">
                                                Prendre en charge
                                            </ActionButton>
                                        )}
                                        <ActionButton onClick={() => setResolveModal({ alertId: alert._id, note: '' })} loading={false} color="green">
                                            Marquer résolu
                                        </ActionButton>
                                        <ActionButton onClick={() => updateAlertStatus(alert._id, 'ignore')} loading={resolvingId === alert._id} color="gray">
                                            Ignorer
                                        </ActionButton>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal résolution */}
            {resolveModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">Résoudre l'alerte</h2>
                        <p className="text-sm text-gray-500 mb-4">Note optionnelle sur la résolution.</p>
                        <textarea
                            rows={3}
                            value={resolveModal.note}
                            onChange={e => setResolveModal(prev => ({ ...prev, note: e.target.value }))}
                            placeholder="Actions prises, raison de résolution..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 mb-4"
                        />
                        {AI_ENABLED && (
                            <NoteAiButton
                                alert={riskAlerts.find(a => a._id === resolveModal.alertId)}
                                note={resolveModal.note}
                                onResult={(text) => setResolveModal(prev => (prev ? { ...prev, note: text } : prev))}
                            />
                        )}
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setResolveModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                Annuler
                            </button>
                            <button
                                onClick={() => updateAlertStatus(resolveModal.alertId, 'resolu', resolveModal.note)}
                                disabled={resolvingId === resolveModal.alertId}
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {resolvingId === resolveModal.alertId ? 'En cours…' : 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FilterChip = ({ active, onClick, children, variant = 'primary' }) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${active ? (variant === 'primary' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-white') : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
        {children}
    </button>
);

const StatCard = ({ label, value, color, highlight }) => (
    <div className={`bg-white rounded-xl border p-3 text-center ${highlight ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
);

const StatusBadge = ({ statut }) => {
    const cfg = { nouveau: 'bg-blue-100 text-blue-800', en_cours: 'bg-orange-100 text-orange-800', resolu: 'bg-green-100 text-green-800', ignore: 'bg-gray-100 text-gray-600' }[statut] || 'bg-gray-100 text-gray-600';
    const lbl = { nouveau: 'Nouveau', en_cours: 'En cours', resolu: 'Résolu', ignore: 'Ignoré' }[statut] || statut;
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg}`}>{lbl}</span>;
};

const ActionButton = ({ onClick, loading, color, children }) => {
    const colors = { blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200', green: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200', gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200' };
    return (
        <button onClick={onClick} disabled={loading} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${colors[color]}`}>
            {loading ? 'En cours…' : children}
        </button>
    );
};

const LoadingSpinner = () => (
    <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

const EmptyState = ({ message, sub }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
        </div>
        <p className="text-gray-500 font-medium">{message}</p>
        {sub && <p className="text-xs text-gray-400 mt-1 max-w-xs">{sub}</p>}
    </div>
);

export default NotificationsPage;