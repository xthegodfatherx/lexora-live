import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_ENABLED } from '../../ai/roles';
import { ContratAiTab, RisqueAi } from '../Assistant/ContratAi';

const DetailsContratModal = ({ isOpen, onClose, contrat, axiosInstance, onUpdate }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [generatingPDF, setGeneratingPDF] = useState(false);

    useEffect(() => {
        if (isOpen && contrat) {
            fetchDetails();
        }
    }, [isOpen, contrat]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/clm/contrats/${contrat.id}/`);
            setDetails(response.data);
        } catch (err) {
            console.error("Erreur chargement détails:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = async () => {
        setGeneratingPDF(true);
        try {
            const response = await axiosInstance.get(`/clm/contrats/${contrat.id}/pdf/`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Contrat_${contrat.numero_contrat}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erreur génération PDF:", err);
            alert("Erreur lors de la génération du PDF");
        } finally {
            setGeneratingPDF(false);
        }
    };

    const getSeverityColor = (severite) => {
        const colors = {
            'critique': 'bg-red-100 text-red-700 border-red-200',
            'eleve': 'bg-orange-100 text-orange-700 border-orange-200',
            'moyen': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'faible': 'bg-blue-100 text-blue-700 border-blue-200'
        };
        return colors[severite] || 'bg-gray-100 text-gray-700';
    };

    const getStatusBadge = (status) => {
        const colors = {
            'brouillon': 'bg-gray-100 text-gray-600',
            'actif': 'bg-green-100 text-green-600',
            'expire': 'bg-red-100 text-red-600',
            'resilie': 'bg-orange-100 text-orange-600'
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    if (!isOpen) return null;

    const contratData = details?.contrat || contrat;
    const risques = details?.risques || { retard: [], imprecision: [], different: [], total: 0 };
    const metadonnees = details?.metadonnees || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        className="w-[900px] max-h-[90vh] overflow-y-auto bg-white shadow-lg p-6 font-poppins rounded-2xl scrollbar-hidden"
                    >
                        {/* En-tête */}
                        <div className="flex justify-between items-start pb-3 mb-4 border-b border-gray-200">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-semibold text-gray-800">{contratData?.titre}</h1>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(contratData?.statut)}`}>
                                        {contratData?.statut}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">N° {contratData?.numero_contrat}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleGeneratePDF}
                                    disabled={generatingPDF}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                    title="Générer PDF"
                                >
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#FF8500] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <>
                                {/* Tabs */}
                                <div className="flex gap-4 mb-4 border-b border-gray-200">
                                    {[
                                        { id: 'info', label: 'Informations' },
                                        { id: 'risques', label: 'Risques', badge: risques.total },
                                        { id: 'metadonnees', label: 'Métadonnées' },
                                        ...(AI_ENABLED ? [{ id: 'ia', label: '✨ Assistant IA' }] : [])
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`pb-2 text-sm font-medium transition flex items-center gap-1 ${
                                                activeTab === tab.id 
                                                    ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
                                                    : 'text-gray-600 hover:text-[#FF8500]'
                                            }`}
                                        >
                                            {tab.label}
                                            {tab.badge > 0 && (
                                                <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-600">
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Informations */}
                                {activeTab === 'info' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-[20px]">
                                                <h3 className="font-medium text-sm text-gray-800 mb-2">Informations générales</h3>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Type:</span>
                                                        <span>{contratData?.type_contrat}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Montant:</span>
                                                        <span className="font-medium">{contratData?.montant?.toLocaleString()} {contratData?.devise}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Conditions paiement:</span>
                                                        <span>{contratData?.conditions_paiement || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-[20px]">
                                                <h3 className="font-medium text-sm text-gray-800 mb-2">Dates</h3>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Signature:</span>
                                                        <span>{contratData?.date_signature || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Début:</span>
                                                        <span>{contratData?.date_debut || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Fin:</span>
                                                        <span>{contratData?.date_fin || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-[20px]">
                                            <h3 className="font-medium text-sm text-gray-800 mb-2">Parties</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Client (Partie A)</p>
                                                    <p className="font-medium">{contratData?.partie_a_nom || 'SONATRACH'}</p>
                                                    {contratData?.rep_a_nom && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Rep: {contratData.rep_a_prenom} {contratData.rep_a_nom} ({contratData.rep_a_fonction})
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Fournisseur (Partie B)</p>
                                                    <p className="font-medium">{contratData?.partie_b_nom}</p>
                                                    <p className="text-xs text-gray-500">{contratData?.pays_partie_b}</p>
                                                    {contratData?.rep_b_nom && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Rep: {contratData.rep_b_prenom} {contratData.rep_b_nom} ({contratData.rep_b_fonction})
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-[20px]">
                                            <h3 className="font-medium text-sm text-gray-800 mb-2">Objet du contrat</h3>
                                            <p className="text-sm text-gray-600">{contratData?.objet || 'Non spécifié'}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Tab Risques */}
                                {activeTab === 'risques' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                        {/* Résumé */}
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="bg-red-50 p-3 rounded-[20px] text-center">
                                                <div className="text-xl font-bold text-red-600">{risques.retard?.length || 0}</div>
                                                <div className="text-xs text-red-600">Retards</div>
                                            </div>
                                            <div className="bg-yellow-50 p-3 rounded-[20px] text-center">
                                                <div className="text-xl font-bold text-yellow-600">{risques.imprecision?.length || 0}</div>
                                                <div className="text-xs text-yellow-600">Imprécisions</div>
                                            </div>
                                            <div className="bg-orange-50 p-3 rounded-[20px] text-center">
                                                <div className="text-xl font-bold text-orange-600">{risques.different?.length || 0}</div>
                                                <div className="text-xs text-orange-600">Différends</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-[20px] text-center">
                                                <div className="text-xl font-bold text-gray-600">{risques.total || 0}</div>
                                                <div className="text-xs text-gray-600">Total</div>
                                            </div>
                                        </div>

                                        {/* Liste des risques */}
                                        {['retard', 'imprecision', 'different'].map(category => {
                                            const risquesList = risques[category] || [];
                                            if (risquesList.length === 0) return null;
                                            
                                            return (
                                                <div key={category} className="space-y-2">
                                                    <h4 className="font-medium text-sm text-gray-800 capitalize">
                                                        Risques de {category}
                                                    </h4>
                                                    {risquesList.map((risque) => (
                                                        <div
                                                            key={risque.id}
                                                            className={`border rounded-[20px] p-3 ${getSeverityColor(risque.severite)}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div>
                                                                    <h5 className="font-medium text-sm">{risque.code}</h5>
                                                                    <p className="text-xs mt-1">{risque.description}</p>
                                                                </div>
                                                                <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-white bg-opacity-50">
                                                                    {risque.severite}
                                                                </span>
                                                            </div>
                                                            {risque.suggestion && (
                                                                <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                                                                    <p className="text-xs">
                                                                        <strong>Suggestion:</strong> {risque.suggestion}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {risque.occurrence_count > 1 && (
                                                                <p className="text-xs mt-1 opacity-75">
                                                                    Occurrences: {risque.occurrence_count} | Niveau: {risque.niveau_alerte}
                                                                </p>
                                                            )}
                                                            {AI_ENABLED && (
                                                                <RisqueAi risque={risque} details={details} contrat={contrat} onHandOff={onClose} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}

                                        {risques.total === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-sm">Aucun risque détecté</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Tab Assistant IA : résumé, vérification avant soumission, question libre */}
                                {activeTab === 'ia' && AI_ENABLED && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <ContratAiTab details={details} contrat={contrat} onHandOff={onClose} />
                                    </motion.div>
                                )}

                                {/* Tab Métadonnées */}
                                {activeTab === 'metadonnees' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
                                        {Object.keys(metadonnees).length === 0 ? (
                                            <div className="col-span-2 text-center py-8 text-gray-500">
                                                <p className="text-sm">Aucune métadonnée spécifique</p>
                                            </div>
                                        ) : (
                                            Object.entries(metadonnees).map(([key, value]) => (
                                                <div key={key} className="bg-gray-50 p-2 rounded-[20px]">
                                                    <p className="text-xs text-gray-500">{key.replace(/_/g, ' ').toUpperCase()}</p>
                                                    <p className="text-sm font-medium">{value}</p>
                                                </div>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </>
                        )}

                        {/* Footer */}
                        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-[25px] hover:bg-gray-300 transition"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            
            <style jsx>{`
                .scrollbar-hidden {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .scrollbar-hidden::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </AnimatePresence>
    );
};

export default DetailsContratModal;