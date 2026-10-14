// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { axiosInstance } from '../../axios';
// import DocumentForm from './DocumentForm';

// const DocumentListe = ({ isReadOnly = false, initialFilter = {}, showSearchOnly = false, onViewDocument }) => {
//     const [documents, setDocuments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [showForm, setShowForm] = useState(false);
//     const [editingDocument, setEditingDocument] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedCategory, setSelectedCategory] = useState(initialFilter.categorie || '');
//     const [selectedStatut, setSelectedStatut] = useState(initialFilter.statut || '');
//     const [hoveredCard, setHoveredCard] = useState(null);
//     const [page, setPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [totalDocuments, setTotalDocuments] = useState(0);
//     const [showPdfModal, setShowPdfModal] = useState(false);
//     const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
//     const [selectedPdfTitle, setSelectedPdfTitle] = useState('');
//     const [pdfError, setPdfError] = useState('');

//     const ORANGE_COLOR = '#FF8500';
//     const ORANGE_GRADIENT = 'from-orange-500 to-amber-500';

//     const categories = [
//         { value: '', label: 'Toutes les catégories' },
//         { value: 'CONSTITUTION', label: 'Constitution' },
//         { value: 'TRAITES_ET_ACCORDS', label: 'Traités et Accords' },
//         { value: 'LOIS', label: 'Lois' },
//         { value: 'ORDONNANCES', label: 'Ordonnances' },
//         { value: 'DECRETS', label: 'Décrets' },
//         { value: 'DECISIONS_ET_ARRETES', label: 'Décisions et Arrêtés' },
//         { value: 'TEXTES_REGLEMENTAIRES', label: 'Textes Règlementaires' },
//         { value: 'CONTRATS_ET_MODELES', label: 'Contrats et Modèles' },
//         { value: 'DOCUMENTATION_INTERNE', label: 'Documentation Interne' },
//         { value: 'JURISPRUDENCE', label: 'Jurisprudence' }
//     ];

//     const statusOptions = [
//         { value: '', label: 'Tous les statuts' },
//         { value: 'EN_VIGUEUR', label: 'En vigueur' },
//         { value: 'ABROGE', label: 'Abrogé' },
//         { value: 'MODIFIE', label: 'Modifié' }
//     ];

//     const statusColors = {
//         'EN_VIGUEUR': 'bg-green-100 text-green-700',
//         'ABROGE': 'bg-red-100 text-red-700',
//         'MODIFIE': 'bg-yellow-100 text-yellow-700'
//     };

//     const statusLabels = {
//         'EN_VIGUEUR': 'En vigueur',
//         'ABROGE': 'Abrogé',
//         'MODIFIE': 'Modifié'
//     };

//     // // Fonction pour construire l'URL complète du PDF
//     // const getPdfUrl = (pdfUrl) => {
//     //     if (!pdfUrl) return null;
        
//     //     // Si l'URL est déjà complète
//     //     if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
//     //         return pdfUrl;
//     //     }
        
//     //     // Récupérer l'URL de base du axiosInstance
//     //     const baseURL = axiosInstance.defaults.baseURL || '';
        
//     //     // Nettoyer l'URL du PDF (enlever les slashes en trop)
//     //     const cleanPdfUrl = pdfUrl.startsWith('/') ? pdfUrl : `/${pdfUrl}`;
//     //     const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
        
//     //     return `${cleanBaseURL}${cleanPdfUrl}`;
//     // };
//     // Dans DocumentListe.js, remplacez les fonctions getPdfUrl et handleOpenPdf par :

// // Fonction pour construire l'URL complète du PDF
// const getPdfUrl = (pdfUrl) => {
//     if (!pdfUrl) return null;
    
//     // Si l'URL est déjà complète
//     if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
//         return pdfUrl;
//     }
    
//     // Récupérer l'URL de base du axiosInstance
//     const baseURL = axiosInstance.defaults.baseURL || API_URL;
//     const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    
//     // Nettoyer l'URL du PDF
//     let cleanPdfUrl = pdfUrl;
    
//     // Remplacer les backslashes par des slashes (pour Windows)
//     cleanPdfUrl = cleanPdfUrl.replace(/\\/g, '/');
    
//     // Si l'URL ne commence pas par /uploads/, l'ajouter
//     if (!cleanPdfUrl.startsWith('/uploads/') && cleanPdfUrl.includes('uploads')) {
//         const filename = cleanPdfUrl.split('/').pop();
//         cleanPdfUrl = `/uploads/${filename}`;
//     }
    
//     // S'assurer que l'URL commence par /
//     if (!cleanPdfUrl.startsWith('/')) {
//         cleanPdfUrl = `/${cleanPdfUrl}`;
//     }
    
//     return `${cleanBaseURL}${cleanPdfUrl}`;
// };

// // Fonction pour ouvrir le PDF
// const handleOpenPdf = async (pdfUrl, title) => {
//     setPdfError('');
    
//     if (!pdfUrl) {
//         setPdfError('URL du PDF non disponible');
//         return;
//     }
    
//     const fullUrl = getPdfUrl(pdfUrl);
//     console.log('📄 Opening PDF:', fullUrl);
    
//     // Vérifier si le PDF existe avant d'ouvrir le modal
//     try {
//         const response = await fetch(fullUrl, { method: 'HEAD' });
//         if (response.ok) {
//             setSelectedPdfUrl(fullUrl);
//             setSelectedPdfTitle(title);
//             setShowPdfModal(true);
//         } else {
//             setPdfError(`Le fichier PDF est introuvable (Status: ${response.status}).\nURL: ${fullUrl}`);
//         }
//     } catch (error) {
//         console.error('Erreur vérification PDF:', error);
//         setPdfError(`Erreur de connexion: ${error.message}\nURL: ${fullUrl}`);
//     }
// };

//     // Fonction pour vérifier si le PDF existe
//     const checkPdfExists = async (pdfUrl) => {
//         try {
//             const fullUrl = getPdfUrl(pdfUrl);
//             if (!fullUrl) return false;
            
//             const response = await fetch(fullUrl, { method: 'HEAD' });
//             return response.ok;
//         } catch (error) {
//             console.error('Erreur vérification PDF:', error);
//             return false;
//         }
//     };

//     const fetchDocuments = async () => {
//         try {
//             setLoading(true);
//             setError('');
            
//             let url = `/bib/documents?page=${page}&limit=12`;
//             if (selectedCategory) url += `&categorie=${selectedCategory}`;
//             if (selectedStatut && !initialFilter.statut) url += `&statut=${selectedStatut}`;
            
//             const response = await axiosInstance.get(url);
            
//             if (response.data.success) {
//                 setDocuments(response.data.data);
//                 setTotalPages(Math.ceil(response.data.total / 12));
//                 setTotalDocuments(response.data.total);
//             }
//         } catch (err) {
//             console.error('Erreur:', err);
//             setError('Impossible de charger les documents');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSearch = async () => {
//         if (!searchTerm.trim()) {
//             fetchDocuments();
//             return;
//         }
        
//         try {
//             setLoading(true);
//             const response = await axiosInstance.get(`/bib/search?q=${searchTerm}`);
//             if (response.data.success) {
//                 setDocuments(response.data.data);
//                 setTotalDocuments(response.data.total);
//             }
//         } catch (err) {
//             console.error('Erreur recherche:', err);
//             setError('Erreur lors de la recherche');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
//             try {
//                 const response = await axiosInstance.delete(`/bib/documents/${id}`);
//                 if (response.data.success) {
//                     fetchDocuments();
//                 }
//             } catch (err) {
//                 setError('Impossible de supprimer le document');
//             }
//         }
//     };

//     // const handleOpenPdf = async (pdfUrl, title) => {
//     //     setPdfError('');
//     //     const fullUrl = getPdfUrl(pdfUrl);
        
//     //     if (!fullUrl) {
//     //         setPdfError('URL du PDF non disponible');
//     //         return;
//     //     }
        
//     //     // Vérifier si le PDF existe avant d'ouvrir le modal
//     //     const exists = await checkPdfExists(pdfUrl);
        
//     //     if (!exists) {
//     //         setPdfError('Le fichier PDF est introuvable. Veuillez contacter l\'administrateur.');
//     //         return;
//     //     }
        
//     //     setSelectedPdfUrl(fullUrl);
//     //     setSelectedPdfTitle(title);
//     //     setShowPdfModal(true);
//     // };

//     useEffect(() => {
//         if (!searchTerm && !showSearchOnly) {
//             fetchDocuments();
//         }
//     }, [page, selectedCategory, selectedStatut]);

//     const cardVariants = {
//         hidden: { opacity: 0, y: 30, scale: 0.95 },
//         visible: (i) => ({
//             opacity: 1,
//             y: 0,
//             scale: 1,
//             transition: {
//                 delay: i * 0.05,
//                 duration: 0.4,
//                 type: "spring",
//                 stiffness: 200,
//                 damping: 20
//             }
//         }),
//         hover: {
//             y: -8,
//             scale: 1.02,
//             transition: {
//                 type: "spring",
//                 stiffness: 400,
//                 damping: 15
//             }
//         }
//     };

//   // PDF Modal Component amélioré
// const PdfViewerModal = () => (
//     <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
//         onClick={() => {
//             setShowPdfModal(false);
//             setPdfError('');
//         }}
//     >
//         <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
//             onClick={(e) => e.stopPropagation()}
//         >
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-lg bg-[#FF8500] bg-opacity-10 flex items-center justify-center">
//                         <svg className="w-5 h-5 text-[#FF8500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                     </div>
//                     <div>
//                         <h3 className="font-semibold text-gray-800">{selectedPdfTitle}</h3>
//                         <p className="text-xs text-gray-500">Document PDF</p>
//                     </div>
//                 </div>
//                 <div className="flex gap-2">
//                     <a
//                         href={selectedPdfUrl}
//                         download
//                         className="px-3 py-1.5 text-sm text-[#FF8500] border border-[#FF8500] rounded-lg hover:bg-[#FF8500] hover:text-white transition-all"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                     >
//                         <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                         </svg>
//                         Télécharger
//                     </a>
//                     <button
//                         onClick={() => {
//                             setShowPdfModal(false);
//                             setPdfError('');
//                         }}
//                         className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
//                     >
//                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                     </button>
//                 </div>
//             </div>

//             {/* PDF Viewer */}
//             <div className="flex-1 bg-gray-100">
//                 {pdfError ? (
//                     <div className="flex flex-col items-center justify-center h-full p-8 text-center">
//                         <div className="w-20 h-20 mx-auto mb-4 text-red-500">
//                             <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-800 mb-2">Erreur de chargement</h3>
//                         <p className="text-gray-600 mb-4 whitespace-pre-line">{pdfError}</p>
//                         <button
//                             onClick={() => {
//                                 setShowPdfModal(false);
//                                 setPdfError('');
//                             }}
//                             className="px-4 py-2 bg-[#FF8500] text-white rounded-lg hover:bg-[#e67600] transition-colors"
//                         >
//                             Fermer
//                         </button>
//                     </div>
//                 ) : (
//                     <iframe
//                         key={selectedPdfUrl}
//                         src={`${selectedPdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
//                         className="w-full h-full"
//                         title={selectedPdfTitle}
//                         style={{ border: 'none' }}
//                         onError={() => setPdfError('Impossible de charger le fichier PDF. Vérifiez que le fichier existe.')}
//                     />
//                 )}
//             </div>
//         </motion.div>
//     </motion.div>
// );

//     return (
//         <div className="space-y-6">
//             {/* Filtres et recherche */}
//             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//                 <div className="flex-1 max-w-md">
//                     <div className="relative group">
//                         <input
//                             type="text"
//                             placeholder="Rechercher par titre, référence ou résumé..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//                             className="w-full px-4 py-2.5 pl-10 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8500] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
//                         />
//                         <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[#FF8500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                         </svg>
//                         {searchTerm && (
//                             <button
//                                 onClick={() => {
//                                     setSearchTerm('');
//                                     fetchDocuments();
//                                 }}
//                                 className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
//                             >
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         )}
//                     </div>
//                 </div>

//                 <div className="flex gap-3">
//                     <select
//                         value={selectedCategory}
//                         onChange={(e) => setSelectedCategory(e.target.value)}
//                         className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8500] bg-gray-50 hover:bg-white transition-all cursor-pointer"
//                     >
//                         {categories.map(cat => (
//                             <option key={cat.value} value={cat.value}>{cat.label}</option>
//                         ))}
//                     </select>

//                     {!initialFilter.statut && (
//                         <select
//                             value={selectedStatut}
//                             onChange={(e) => setSelectedStatut(e.target.value)}
//                             className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8500] bg-gray-50 hover:bg-white transition-all cursor-pointer"
//                         >
//                             {statusOptions.map(opt => (
//                                 <option key={opt.value} value={opt.value}>{opt.label}</option>
//                             ))}
//                         </select>
//                     )}

//                     {!isReadOnly && !showSearchOnly && (
//                         <motion.button
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => {
//                                 setEditingDocument(null);
//                                 setShowForm(true);
//                             }}
//                             className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
//                         >
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//                             </svg>
//                             Nouveau Document
//                         </motion.button>
//                     )}
//                 </div>
//             </div>

//             {/* Résultats */}
//             <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center gap-2">
//                     <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-600 font-medium">
//                         {totalDocuments}
//                     </span>
//                     <span className="text-gray-500">document{totalDocuments !== 1 ? 's' : ''}</span>
//                 </div>
//                 {loading && (
//                     <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-[#FF8500] rounded-full animate-pulse" />
//                         <span className="text-gray-500">Chargement...</span>
//                     </div>
//                 )}
//             </div>

//             {error && (
//                 <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200"
//                 >
//                     {error}
//                 </motion.div>
//             )}

//             {/* Grille des cartes avec fond PDF */}
//             {!loading && documents.length === 0 && !error && (
//                 <div className="text-center py-12">
//                     <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <p className="text-gray-500">Aucun document trouvé</p>
//                 </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 <AnimatePresence>
//                     {documents.map((doc, index) => (
//                         <motion.div
//                             key={doc._id}
//                             custom={index}
//                             variants={cardVariants}
//                             initial="hidden"
//                             animate="visible"
//                             whileHover="hover"
//                             onHoverStart={() => setHoveredCard(doc._id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             className="relative rounded-2xl overflow-hidden group cursor-pointer"
//                             style={{
//                                 background: `repeating-linear-gradient(
//                                     0deg,
//                                     #f5f0e8 0px,
//                                     #f5f0e8 28px,
//                                     #e8e0d0 29px,
//                                     #e8e0d0 30px
//                                 )`,
//                                 boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
//                             }}
//                             onClick={() => onViewDocument && onViewDocument(doc)}
//                         >
//                             {/* Effet de pliure de page */}
//                             <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent to-black/5 rounded-bl-2xl" />
                            
//                             <motion.div
//                                 className={`absolute inset-0 bg-gradient-to-br ${ORANGE_GRADIENT} opacity-0`}
//                                 animate={{
//                                     opacity: hoveredCard === doc._id ? 0.08 : 0
//                                 }}
//                             />

//                             <div className="absolute top-4 right-4 z-10">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${statusColors[doc.statut]}`}>
//                                     {statusLabels[doc.statut]}
//                                 </span>
//                             </div>

//                             <div className="p-5 relative">
//                                 {/* Icône PDF */}
//                                 <div className="flex items-start justify-between mb-3">
//                                     <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 shadow-inner" style={{ color: ORANGE_COLOR }}>
//                                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                                         </svg>
//                                     </div>
//                                     <span className="text-xs text-gray-400 font-mono">
//                                         {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
//                                     </span>
//                                 </div>

//                                 <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 font-serif">
//                                     {doc.titre}
//                                 </h3>

//                                 {doc.reference && (
//                                     <p className="text-xs text-gray-500 mb-2 font-mono">
//                                         Réf: {doc.reference}
//                                     </p>
//                                 )}

//                                 <div className="mb-3">
//                                     <span className="text-xs px-2 py-1 bg-white/80 rounded-full shadow-sm">
//                                         {categories.find(c => c.value === doc.categorie)?.label || doc.categorie}
//                                     </span>
//                                 </div>

//                                 {doc.organismeEmetteur && (
//                                     <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
//                                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                                         </svg>
//                                         {doc.organismeEmetteur}
//                                     </p>
//                                 )}

//                                 {doc.motsCles && doc.motsCles.length > 0 && (
//                                     <div className="flex flex-wrap gap-1 mt-3">
//                                         {doc.motsCles.slice(0, 2).map((mot, idx) => (
//                                             <span key={idx} className="px-1.5 py-0.5 bg-white/70 rounded text-xs text-gray-600 shadow-sm">
//                                                 {mot}
//                                             </span>
//                                         ))}
//                                         {doc.motsCles.length > 2 && (
//                                             <span className="text-xs text-gray-400">+{doc.motsCles.length - 2}</span>
//                                         )}
//                                     </div>
//                                 )}

//                                 <div className="flex gap-2 mt-4 pt-3 border-t border-gray-300/30">
//                                     <button
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             handleOpenPdf(doc.pdfUrl, doc.titre);
//                                         }}
//                                         className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all"
//                                     >
//                                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                                         </svg>
//                                         Lire
//                                     </button>
                                    
//                                     {!isReadOnly && (
//                                         <>
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     setEditingDocument(doc);
//                                                     setShowForm(true);
//                                                 }}
//                                                 className="px-3 py-1.5 bg-white/80 border border-gray-300 rounded-lg text-xs font-medium hover:bg-white transition-all"
//                                             >
//                                                 Modifier
//                                             </button>
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleDelete(doc._id);
//                                                 }}
//                                                 className="px-3 py-1.5 bg-white/80 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-all"
//                                             >
//                                                 Supprimer
//                                             </button>
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//                         </motion.div>
//                     ))}
//                 </AnimatePresence>
//             </div>

//             {/* Pagination */}
//             {!searchTerm && totalPages > 1 && (
//                 <div className="flex justify-center gap-2 mt-8">
//                     <button
//                         onClick={() => setPage(p => Math.max(1, p - 1))}
//                         disabled={page === 1}
//                         className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
//                     >
//                         Précédent
//                     </button>
//                     <div className="flex gap-2">
//                         {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                             let pageNum;
//                             if (totalPages <= 5) {
//                                 pageNum = i + 1;
//                             } else if (page <= 3) {
//                                 pageNum = i + 1;
//                             } else if (page >= totalPages - 2) {
//                                 pageNum = totalPages - 4 + i;
//                             } else {
//                                 pageNum = page - 2 + i;
//                             }
                            
//                             return (
//                                 <button
//                                     key={pageNum}
//                                     onClick={() => setPage(pageNum)}
//                                     className={`w-10 h-10 rounded-xl font-medium transition-all ${
//                                         page === pageNum
//                                             ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
//                                             : 'border border-gray-200 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     {pageNum}
//                                 </button>
//                             );
//                         })}
//                     </div>
//                     <button
//                         onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                         disabled={page === totalPages}
//                         className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
//                     >
//                         Suivant
//                     </button>
//                 </div>
//             )}

//             {/* Modal Formulaire */}
//             <AnimatePresence>
//                 {showForm && (
//                     <DocumentForm
//                         document={editingDocument}
//                         onClose={() => {
//                             setShowForm(false);
//                             setEditingDocument(null);
//                             fetchDocuments();
//                         }}
//                         isReadOnly={isReadOnly}
//                     />
//                 )}
//             </AnimatePresence>

//             {/* Modal PDF Viewer avec gestion d'erreur */}
//             <AnimatePresence>
//                 {showPdfModal && <PdfViewerModal />}
//             </AnimatePresence>
//         </div>
//     );
// };

// export default DocumentListe;







import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance, API_URL } from '../../axios';
import DocumentForm from './DocumentForm';

const DocumentListe = ({ isReadOnly = false, initialFilter = {}, showSearchOnly = false, onViewDocument }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialFilter.categorie || '');
    const [selectedStatut, setSelectedStatut] = useState(initialFilter.statut || '');
    const [hoveredCard, setHoveredCard] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
    const [selectedPdfTitle, setSelectedPdfTitle] = useState('');
    const [pdfError, setPdfError] = useState('');

    const ORANGE_COLOR = '#FF8500';
    const ORANGE_GRADIENT = 'from-orange-500 to-amber-500';

    const categoryColors = {
        'CONSTITUTION': 'from-purple-500 to-purple-600',
        'LOIS': 'from-blue-500 to-blue-600',
        'DECRETS': 'from-green-500 to-green-600',
        'ORDONNANCES': 'from-yellow-500 to-yellow-600',
        'TRAITES_ET_ACCORDS': 'from-indigo-500 to-indigo-600',
        'JURISPRUDENCE': 'from-red-500 to-red-600',
        'default': 'from-gray-500 to-gray-600'
    };

    const categories = [
        { value: '', label: '📚 Toutes les catégories' },
        { value: 'CONSTITUTION', label: '⚖️ Constitution' },
        { value: 'TRAITES_ET_ACCORDS', label: '📜 Traités et Accords' },
        { value: 'LOIS', label: '📋 Lois' },
        { value: 'ORDONNANCES', label: '📝 Ordonnances' },
        { value: 'DECRETS', label: '📑 Décrets' },
        { value: 'DECISIONS_ET_ARRETES', label: '⚖️ Décisions et Arrêtés' },
        { value: 'TEXTES_REGLEMENTAIRES', label: '📏 Textes Règlementaires' },
        { value: 'CONTRATS_ET_MODELES', label: '🤝 Contrats et Modèles' },
        { value: 'DOCUMENTATION_INTERNE', label: '🏢 Documentation Interne' },
        { value: 'JURISPRUDENCE', label: '🏛️ Jurisprudence' }
    ];

    const statusOptions = [
        { value: '', label: '📊 Tous les statuts' },
        { value: 'EN_VIGUEUR', label: '✅ En vigueur' },
        { value: 'ABROGE', label: '❌ Abrogé' },
        { value: 'MODIFIE', label: '🔄 Modifié' }
    ];

    const statusStyles = {
        'EN_VIGUEUR': { bg: 'bg-emerald-500', icon: '✅', label: 'En vigueur' },
        'ABROGE': { bg: 'bg-rose-500', icon: '❌', label: 'Abrogé' },
        'MODIFIE': { bg: 'bg-amber-500', icon: '🔄', label: 'Modifié' }
    };

    const getPdfUrl = (pdfUrl) => {
        if (!pdfUrl) return null;
        if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) return pdfUrl;
        const baseURL = axiosInstance.defaults.baseURL || API_URL;
        const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
        let cleanPdfUrl = pdfUrl.replace(/\\/g, '/');
        if (!cleanPdfUrl.startsWith('/uploads/') && cleanPdfUrl.includes('uploads')) {
            const filename = cleanPdfUrl.split('/').pop();
            cleanPdfUrl = `/uploads/${filename}`;
        }
        if (!cleanPdfUrl.startsWith('/')) cleanPdfUrl = `/${cleanPdfUrl}`;
        if (cleanPdfUrl === '/') return null;
        return `${cleanBaseURL}${cleanPdfUrl}`;
    };

    const handleOpenPdf = async (pdfUrl, title) => {
        const fullUrl = getPdfUrl(pdfUrl);
        setSelectedPdfTitle(title);
        if (!fullUrl) {
            setSelectedPdfUrl('');
            setPdfError('Ce document n\'a pas de fichier PDF.');
            setShowPdfModal(true);
            return;
        }
        if (/^https?:\/\//i.test(fullUrl)) {
            window.open(fullUrl, '_blank', 'noopener,noreferrer');
            return;
        }
        setPdfError('');
        setSelectedPdfUrl(fullUrl);
        setShowPdfModal(true);
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError('');
            let url = `/bib/documents?page=${page}&limit=12`;
            if (selectedCategory) url += `&categorie=${selectedCategory}`;
            if (selectedStatut && !initialFilter.statut) url += `&statut=${selectedStatut}`;
            const response = await axiosInstance.get(url);
            if (response.data.success) {
                setDocuments(response.data.data);
                setTotalPages(Math.ceil(response.data.total / 12));
                setTotalDocuments(response.data.total);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les documents');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchDocuments();
            return;
        }
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/bib/search?q=${searchTerm}`);
            if (response.data.success) {
                setDocuments(response.data.data);
                setTotalDocuments(response.data.total);
            }
        } catch (err) {
            console.error('Erreur recherche:', err);
            setError('Erreur lors de la recherche');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            try {
                const response = await axiosInstance.delete(`/bib/documents/${id}`);
                if (response.data.success) fetchDocuments();
            } catch (err) {
                setError('Impossible de supprimer le document');
            }
        }
    };

    useEffect(() => {
        if (!searchTerm && !showSearchOnly) fetchDocuments();
    }, [page, selectedCategory, selectedStatut]);

    // Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 60,
            scale: 0.9
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                mass: 0.8
            }
        },
        hover: {
            y: -12,
            scale: 1.02,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 15
            }
        }
    };

    const statusBadgeVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: { 
            scale: 1, 
            rotate: 0,
            transition: { type: "spring", stiffness: 300, damping: 15 }
        }
    };

    const iconVariants = {
        hidden: { scale: 0, rotate: -90 },
        visible: { 
            scale: 1, 
            rotate: 0,
            transition: { type: "spring", stiffness: 400, damping: 12 }
        },
        hover: {
            rotate: 10,
            scale: 1.1,
            transition: { duration: 0.2 }
        }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { 
            scale: 1.05,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    // PDF Modal Component
    const PdfViewerModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => {
                setShowPdfModal(false);
                setPdfError('');
            }}
        >
            <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.7, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-amber-500">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-3"
                    >
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{selectedPdfTitle}</h3>
                            <p className="text-xs text-white/80">Document PDF</p>
                        </div>
                    </motion.div>
                    <div className="flex gap-2">
                        {selectedPdfUrl && <motion.a
                            variants={buttonVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            href={selectedPdfUrl}
                            download
                            className="px-3 py-1.5 text-sm text-white border border-white/50 rounded-lg hover:bg-white/20 transition-all"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Télécharger
                        </motion.a>}
                        <motion.button
                            variants={buttonVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => {
                                setShowPdfModal(false);
                                setPdfError('');
                            }}
                            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
                <div className="flex-1 bg-gray-100">
                    {pdfError ? (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full p-8 text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-6 text-red-500">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Erreur de chargement</h3>
                            <p className="text-gray-600 mb-6">{pdfError}</p>
                            <motion.button
                                variants={buttonVariants}
                                initial="initial"
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setPdfError('');
                                }}
                                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium shadow-lg"
                            >
                                Fermer
                            </motion.button>
                        </motion.div>
                    ) : (
                        <iframe
                            key={selectedPdfUrl}
                            src={`${selectedPdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                            className="w-full h-full"
                            title={selectedPdfTitle}
                            style={{ border: 'none' }}
                            onError={() => setPdfError('Impossible de charger le fichier PDF.')}
                        />
                    )}
                </div>
            </motion.div>
        </motion.div>
    );

    // Loading Component
    const LoadingGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                    <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse" />
                            <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                            <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/2" />
                            <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-2/3" />
                        </div>
                        <div className="flex gap-2 pt-4">
                            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header avec animation */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-white rounded-2xl shadow-xl p-4 sm:p-6"
                >
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                        <div className="flex-1 w-full lg:max-w-md">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="🔍 Rechercher par titre, référence ou résumé..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-5 py-3.5 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8500] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                />
                                <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#FF8500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchTerm && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        onClick={() => {
                                            setSearchTerm('');
                                            fetchDocuments();
                                        }}
                                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full sm:w-auto px-4 sm:px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8500] bg-gray-50 hover:bg-white transition-all cursor-pointer font-medium"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>

                            {!initialFilter.statut && (
                                <select
                                    value={selectedStatut}
                                    onChange={(e) => setSelectedStatut(e.target.value)}
                                    className="w-full sm:w-auto px-4 sm:px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8500] bg-gray-50 hover:bg-white transition-all cursor-pointer font-medium"
                                >
                                    {statusOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            )}

                            {!isReadOnly && !showSearchOnly && (
                                <motion.button
                                    variants={buttonVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => {
                                        setEditingDocument(null);
                                        setShowForm(true);
                                    }}
                                    className="w-full sm:w-auto justify-center px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nouveau Document
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Statistiques */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6 pt-6 border-t border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-md"
                            >
                                {totalDocuments}
                            </motion.div>
                            <span className="text-gray-600 font-medium">document{totalDocuments !== 1 ? 's' : ''} trouvé{totalDocuments !== 1 ? 's' : ''}</span>
                        </div>
                        {loading && (
                            <div className="flex items-center gap-2">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"
                                />
                                <span className="text-gray-500">Chargement...</span>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200"
                    >
                        ⚠️ {error}
                    </motion.div>
                )}

                {/* Grille des cartes */}
                {loading ? (
                    <LoadingGrid />
                ) : documents.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-2xl shadow-lg"
                    >
                        <svg className="w-32 h-32 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">📭 Aucun document trouvé</p>
                        <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    >
                        <AnimatePresence>
                            {documents.map((doc, index) => {
                                const categoryGradient = categoryColors[doc.categorie] || categoryColors.default;
                                const statusStyle = statusStyles[doc.statut] || statusStyles['EN_VIGUEUR'];
                                return (
                                    <motion.div
                                        key={doc._id}
                                        variants={cardVariants}
                                        whileHover="hover"
                                        onHoverStart={() => setHoveredCard(doc._id)}
                                        onHoverEnd={() => setHoveredCard(null)}
                                        className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
                                        onClick={() => onViewDocument && onViewDocument(doc)}
                                    >
                                        {/* Bandeau coloré animé */}
                                        <motion.div 
                                            className={`h-2 bg-gradient-to-r ${categoryGradient}`}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                        
                                        <div className="p-4 sm:p-6">
                                            {/* En-tête */}
                                            <div className="flex justify-between items-start mb-5">
                                                <motion.div 
                                                    variants={iconVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    whileHover="hover"
                                                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg"
                                                >
                                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </motion.div>
                                                <motion.span 
                                                    variants={statusBadgeVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusStyle.bg} text-white shadow-md flex items-center gap-1`}
                                                >
                                                    <span>{statusStyle.icon}</span>
                                                    <span>{statusStyle.label}</span>
                                                </motion.span>
                                            </div>

                                            {/* Titre */}
                                            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 min-h-[56px] group-hover:text-orange-600 transition-colors">
                                                {doc.titre || "Sans titre"}
                                            </h3>

                                            {/* Référence */}
                                            {doc.reference && (
                                                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1 font-mono">
                                                    📌 Réf: {doc.reference}
                                                </p>
                                            )}
                                            {typeof doc.pdfUrl === 'string' && doc.pdfUrl.startsWith('http') && (
                                                <p className="text-xs text-emerald-700 mb-3">Source officielle — Journal officiel ou texte publié</p>
                                            )}

                                            {/* Catégorie */}
                                            <div className="mb-4">
                                                <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r ${categoryGradient} text-white shadow-sm`}>
                                                    {categories.find(c => c.value === doc.categorie)?.label?.split(' ')[1] || doc.categorie || "Non catégorisé"}
                                                </span>
                                            </div>

                                            {/* Organisme émetteur */}
                                            {doc.organismeEmetteur && (
                                                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                                                    <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span className="line-clamp-1">{doc.organismeEmetteur}</span>
                                                </p>
                                            )}

                                            {/* Mots-clés */}
                                            {doc.motsCles && doc.motsCles.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-5">
                                                    {doc.motsCles.slice(0, 3).map((mot, idx) => (
                                                        <motion.span 
                                                            key={idx}
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors cursor-pointer"
                                                        >
                                                            #{mot}
                                                        </motion.span>
                                                    ))}
                                                    {doc.motsCles.length > 3 && (
                                                        <span className="px-2.5 py-1 text-xs text-gray-400">
                                                            +{doc.motsCles.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Date */}
                                            <p className="text-xs text-gray-400 mb-5 flex items-center gap-1">
                                                📅 Créé le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                                            </p>

                                            {/* Boutons d'action */}
                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                                <motion.button
                                                    variants={buttonVariants}
                                                    initial="initial"
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenPdf(doc.pdfUrl, doc.titre);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Lire
                                                </motion.button>
                                                
                                                {!isReadOnly && (
                                                    <>
                                                        <motion.button
                                                            variants={buttonVariants}
                                                            initial="initial"
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingDocument(doc);
                                                                setShowForm(true);
                                                            }}
                                                            className="px-3 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-medium hover:border-orange-500 hover:text-orange-600 transition-all"
                                                        >
                                                            ✏️
                                                        </motion.button>
                                                        <motion.button
                                                            variants={buttonVariants}
                                                            initial="initial"
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(doc._id);
                                                            }}
                                                            className="px-3 py-2.5 border-2 border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-all"
                                                        >
                                                            🗑️
                                                        </motion.button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Pagination */}
                {!searchTerm && totalPages > 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-3 mt-8"
                    >
                        <motion.button
                            variants={buttonVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium"
                        >
                            ← Précédent
                        </motion.button>
                        <div className="flex gap-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                
                                return (
                                    <motion.button
                                        key={pageNum}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-11 h-11 rounded-xl font-bold transition-all ${
                                            page === pageNum
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                                                : 'border-2 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </motion.button>
                                );
                            })}
                        </div>
                        <motion.button
                            variants={buttonVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium"
                        >
                            Suivant →
                        </motion.button>
                    </motion.div>
                )}

                {/* Modals */}
                <AnimatePresence>
                    {showForm && (
                        <DocumentForm
                            document={editingDocument}
                            onClose={() => {
                                setShowForm(false);
                                setEditingDocument(null);
                                fetchDocuments();
                            }}
                            isReadOnly={isReadOnly}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showPdfModal && <PdfViewerModal />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DocumentListe;