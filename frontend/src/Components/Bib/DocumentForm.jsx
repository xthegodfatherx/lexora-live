import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { axiosInstance } from '../../axios';
import { AI_ENABLED } from '../../ai/roles';
import { DocumentAutofill } from '../Assistant/DocumentAi';

const DocumentForm = ({ document, onClose, isReadOnly }) => {
    const [formData, setFormData] = useState({
        titre: '',
        categorie: 'LOIS',
        reference: '',
        organismeEmetteur: '',
        datePublication: '',
        motsCles: '',
        resume: '',
        statut: 'EN_VIGUEUR'
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const ORANGE_COLOR = '#FF8500';
    const isEditing = !!document;

    const categories = [
        { value: 'CONSTITUTION', label: 'Constitution' },
        { value: 'TRAITES_ET_ACCORDS', label: 'Traités et Accords' },
        { value: 'LOIS', label: 'Lois' },
        { value: 'ORDONNANCES', label: 'Ordonnances' },
        { value: 'DECRETS', label: 'Décrets' },
        { value: 'DECISIONS_ET_ARRETES', label: 'Décisions et Arrêtés' },
        { value: 'TEXTES_REGLEMENTAIRES', label: 'Textes Règlementaires' },
        { value: 'CONTRATS_ET_MODELES', label: 'Contrats et Modèles' },
        { value: 'DOCUMENTATION_INTERNE', label: 'Documentation Interne' },
        { value: 'JURISPRUDENCE', label: 'Jurisprudence' }
    ];

    const statusOptions = [
        { value: 'EN_VIGUEUR', label: 'En vigueur' },
        { value: 'ABROGE', label: 'Abrogé' },
        { value: 'MODIFIE', label: 'Modifié' }
    ];

    useEffect(() => {
        if (document) {
            setFormData({
                titre: document.titre || '',
                categorie: document.categorie || 'LOIS',
                reference: document.reference || '',
                organismeEmetteur: document.organismeEmetteur || '',
                datePublication: document.datePublication ? document.datePublication.split('T')[0] : '',
                motsCles: document.motsCles ? document.motsCles.join(', ') : '',
                resume: document.resume || '',
                statut: document.statut || 'EN_VIGUEUR'
            });
        }
    }, [document]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.titre) {
            setError('Le titre est requis');
            return;
        }
        
        if (!pdfFile && !isEditing) {
            setError('Le fichier PDF est requis');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('titre', formData.titre);
            submitData.append('categorie', formData.categorie);
            if (formData.reference) submitData.append('reference', formData.reference);
            if (formData.organismeEmetteur) submitData.append('organismeEmetteur', formData.organismeEmetteur);
            if (formData.datePublication) submitData.append('datePublication', formData.datePublication);
            if (formData.motsCles) submitData.append('motsCles', formData.motsCles);
            if (formData.resume) submitData.append('resume', formData.resume);
            if (formData.statut) submitData.append('statut', formData.statut);
            if (pdfFile) submitData.append('pdf', pdfFile);

            let response;
            if (isEditing) {
                response = await axiosInstance.put(`/bib/documents/${document._id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await axiosInstance.post('/bib/documents', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                onClose();
            } else {
                setError(response.data.message || 'Erreur lors de l\'enregistrement');
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
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
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Modifier le document' : 'Nouveau document'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Titre *
                        </label>
                        <input
                            type="text"
                            name="titre"
                            value={formData.titre}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500] focus:border-transparent"
                            placeholder="Titre du document"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catégorie *
                            </label>
                            <select
                                name="categorie"
                                value={formData.categorie}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500]"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Référence
                            </label>
                            <input
                                type="text"
                                name="reference"
                                value={formData.reference}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500]"
                                placeholder="ex: Loi n°2024-001"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organisme émetteur
                            </label>
                            <input
                                type="text"
                                name="organismeEmetteur"
                                value={formData.organismeEmetteur}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500]"
                                placeholder="ex: Ministère de la Justice"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de publication
                            </label>
                            <input
                                type="date"
                                name="datePublication"
                                value={formData.datePublication}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mots-clés
                        </label>
                        <input
                            type="text"
                            name="motsCles"
                            value={formData.motsCles}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500]"
                            placeholder="Séparés par des virgules (ex: contrat, loi, fiscalité)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Séparez les mots-clés par des virgules
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Résumé
                        </label>
                        <textarea
                            name="resume"
                            value={formData.resume}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500]"
                            placeholder="Brève description du document..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Statut
                        </label>
                        <select
                            name="statut"
                            value={formData.statut}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500]"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fichier PDF {!isEditing && '*'}
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF8500] transition-colors cursor-pointer">
                                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm text-gray-600">
                                    {pdfFile ? pdfFile.name : (isEditing ? 'Changer le PDF (optionnel)' : 'Cliquez pour sélectionner un PDF')}
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {/* IA : propose titre, catégorie, référence, mots-clés, résumé… d'après le PDF choisi.
                            Ne remplit que les champs encore vides : ce que l'utilisateur a saisi n'est jamais écrasé. */}
                        {AI_ENABLED && !isEditing && (
                            <DocumentAutofill
                                file={pdfFile}
                                onFill={(fields) => setFormData(prev => {
                                    const next = { ...prev };
                                    Object.entries(fields).forEach(([key, value]) => {
                                        if (key === 'categorie' || !String(prev[key] || '').trim()) next[key] = value;
                                    });
                                    return next;
                                })}
                            />
                        )}
                        {isEditing && document?.pdfUrl && !pdfFile && (
                            <p className="text-xs text-gray-500 mt-2">
                                PDF actuel: {document.pdfUrl.split('/').pop()}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex-1 px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </motion.button>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="flex-1 px-6 py-2 bg-[#FF8500] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default DocumentForm;