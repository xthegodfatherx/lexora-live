import React from 'react';
import { motion } from 'framer-motion';
import { axiosInstance } from '../../axios';
import { AI_ENABLED } from '../../ai/roles';
import { DocumentQa } from '../Assistant/DocumentAi';

const DocumentDetail = ({ document, onClose, isReadOnly }) => {
    const ORANGE_COLOR = '#FF8500';

    const categories = {
        'CONSTITUTION': 'Constitution',
        'TRAITES_ET_ACCORDS': 'Traités et Accords',
        'LOIS': 'Lois',
        'ORDONNANCES': 'Ordonnances',
        'DECRETS': 'Décrets',
        'DECISIONS_ET_ARRETES': 'Décisions et Arrêtés',
        'TEXTES_REGLEMENTAIRES': 'Textes Règlementaires',
        'CONTRATS_ET_MODELES': 'Contrats et Modèles',
        'DOCUMENTATION_INTERNE': 'Documentation Interne',
        'JURISPRUDENCE': 'Jurisprudence'
    };

    const statusLabels = {
        'EN_VIGUEUR': 'En vigueur',
        'ABROGE': 'Abrogé',
        'MODIFIE': 'Modifié'
    };

    const fileHref = !document?.pdfUrl
        ? ''
        : /^https?:\/\//i.test(document.pdfUrl)
            ? document.pdfUrl
            : `${String(axiosInstance.defaults.baseURL || '').replace(/\/+$/, '')}${document.pdfUrl.startsWith('/') ? document.pdfUrl : `/${document.pdfUrl}`}`;

    const statusColors = {
        'EN_VIGUEUR': 'bg-green-100 text-green-700',
        'ABROGE': 'bg-red-100 text-red-700',
        'MODIFIE': 'bg-yellow-100 text-yellow-700'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Détail du document</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* En-tête avec icône PDF */}
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-orange-50" style={{ color: ORANGE_COLOR }}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{document.titre}</h1>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[document.statut]}`}>
                                    {statusLabels[document.statut]}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                    {categories[document.categorie]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Informations détaillées */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {document.reference && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Référence</label>
                                <p className="text-gray-800">{document.reference}</p>
                            </div>
                        )}
                        
                        {document.organismeEmetteur && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Organisme émetteur</label>
                                <p className="text-gray-800">{document.organismeEmetteur}</p>
                            </div>
                        )}
                        
                        {document.datePublication && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Date de publication</label>
                                <p className="text-gray-800">{new Date(document.datePublication).toLocaleDateString('fr-FR')}</p>
                            </div>
                        )}
                        
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase">Date d'ajout</label>
                            <p className="text-gray-800">{new Date(document.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    {/* Mots-clés */}
                    {document.motsCles && document.motsCles.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase">Mots-clés</label>
                            <div className="flex flex-wrap gap-2">
                                {document.motsCles.map((mot, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                        {mot}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Résumé */}
                    {document.resume && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase">Résumé</label>
                            <p className="text-gray-700 leading-relaxed">{document.resume}</p>
                        </div>
                    )}

                    {/* IA : résumé et questions sur le contenu du PDF (à la demande) */}
                    {AI_ENABLED && document.pdfUrl && <DocumentQa document={document} />}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        {fileHref ? (
                        <a
                            href={fileHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FF8500] text-white rounded-lg font-medium hover:bg-[#e67600] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Ouvrir le PDF
                        </a>
                        ) : (
                        <p className="flex-1 px-4 py-3 text-sm text-gray-500 bg-gray-50 rounded-lg">Aucun fichier PDF pour ce document.</p>
                        )}
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DocumentDetail;