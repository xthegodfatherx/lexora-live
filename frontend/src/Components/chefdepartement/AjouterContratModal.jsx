// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const AjouterContratModal = ({ isOpen, onClose, onSuccess, axiosInstance }) => {
//     const [activeTab, setActiveTab] = useState('upload');
//     const [file, setFile] = useState(null);
//     const [filePreview, setFilePreview] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         type_contrat: 'fourniture',
//         societe_b_nom: '',
//         pays_partie_b: 'Algérie',
//         montant: '',
//         devise: 'DZD',
//         // Formulaire manuel
//         numero_contrat: '',
//         titre: '',
//         objet: '',
//         date_signature: '',
//         date_debut: '',
//         date_fin: '',
//         conditions_paiement: '',
//         societe_a_nom: 'SONATRACH',
//         societe_a_representant_nom: '',
//         societe_a_representant_prenom: '',
//         societe_a_representant_fonction: '',
//         societe_b_siege_social: '',
//         societe_b_representant_nom: '',
//         societe_b_representant_prenom: '',
//         societe_b_representant_fonction: '',
//         notification_adresse_ligne1: '',
//         notification_adresse_ligne2: '',
//         fax_fournisseur: '',
//         telephone_fournisseur: '',
//         email_fournisseur: '',
//         nom_client: '',
//         prenom_client: '',
//         fonction_client: '',
//         nom_fournisseur: '',
//         prenom_fournisseur: '',
//         fonction_fournisseur: '',
//         // Métadonnées
//         delai_livraison_mois: '',
//         penalite_retard_pct: '',
//         duree_garantie_mois: '',
//         caution_bonne_fin_pct: '',
//         tribunal_competent: ''
//     });
//     const [currentStep, setCurrentStep] = useState(1);

//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile && selectedFile.type === 'application/pdf') {
//             setFile(selectedFile);
//             setFilePreview(selectedFile.name);
//         } else {
//             alert('Veuillez sélectionner un fichier PDF valide');
//         }
//     };

//     const handleDeleteFile = () => {
//         setFile(null);
//         setFilePreview(null);
//         document.getElementById('pdf-upload') && (document.getElementById('pdf-upload').value = '');
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleUploadSubmit = async (e) => {
//         e.preventDefault();
//         if (!file) {
//             alert('Veuillez sélectionner un fichier PDF');
//             return;
//         }

//         setLoading(true);
//         const data = new FormData();
//         data.append('fichier', file);
        
//         // Ajouter les champs complémentaires
//         if (formData.type_contrat) data.append('type_contrat', formData.type_contrat);
//         if (formData.societe_b_nom) data.append('societe_b_nom', formData.societe_b_nom);
//         if (formData.pays_partie_b) data.append('pays_partie_b', formData.pays_partie_b);
//         if (formData.montant) data.append('montant', formData.montant);
//         if (formData.devise) data.append('devise', formData.devise);

//         try {
//             const response = await axiosInstance.post('/clm/contrats/upload/', data, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
            
//             if (response.data.success) {
//                 onSuccess(`Contrat ${response.data.contrat.numero_contrat} créé avec succès`);
//                 handleClose();
//             }
//         } catch (err) {
//             console.error("Erreur upload:", err);
//             alert(err.response?.data?.error || "Erreur lors de l'upload du contrat");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!formData.societe_b_nom || !formData.objet) {
//             alert('Veuillez remplir les champs obligatoires (Fournisseur et Objet)');
//             return;
//         }

//         setLoading(true);
//         const data = new FormData();
//         Object.keys(formData).forEach(key => {
//             if (formData[key]) {
//                 data.append(key, formData[key]);
//             }
//         });

//         try {
//             const response = await axiosInstance.post('/clm/contrats/formulaire/', data, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
            
//             if (response.data.success) {
//                 onSuccess(`Contrat ${response.data.contrat.numero_contrat} créé avec succès`);
//                 handleClose();
//             }
//         } catch (err) {
//             console.error("Erreur création:", err);
//             alert(err.response?.data?.error || "Erreur lors de la création du contrat");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleClose = () => {
//         setActiveTab('upload');
//         setFile(null);
//         setFilePreview(null);
//         setCurrentStep(1);
//         setFormData({
//             type_contrat: 'fourniture',
//             societe_b_nom: '',
//             pays_partie_b: 'Algérie',
//             montant: '',
//             devise: 'DZD',
//             numero_contrat: '',
//             titre: '',
//             objet: '',
//             date_signature: '',
//             date_debut: '',
//             date_fin: '',
//             conditions_paiement: '',
//             societe_a_nom: 'SONATRACH',
//             societe_a_representant_nom: '',
//             societe_a_representant_prenom: '',
//             societe_a_representant_fonction: '',
//             societe_b_siege_social: '',
//             societe_b_representant_nom: '',
//             societe_b_representant_prenom: '',
//             societe_b_representant_fonction: '',
//             notification_adresse_ligne1: '',
//             notification_adresse_ligne2: '',
//             fax_fournisseur: '',
//             telephone_fournisseur: '',
//             email_fournisseur: '',
//             nom_client: '',
//             prenom_client: '',
//             fonction_client: '',
//             nom_fournisseur: '',
//             prenom_fournisseur: '',
//             fonction_fournisseur: '',
//             delai_livraison_mois: '',
//             penalite_retard_pct: '',
//             duree_garantie_mois: '',
//             caution_bonne_fin_pct: '',
//             tribunal_competent: ''
//         });
//         onClose();
//     };

//     if (!isOpen) return null;

//     // Steps pour le formulaire manuel
//     const steps = [
//         { id: 1, title: 'Général' },
//         { id: 2, title: 'Parties' },
//         { id: 3, title: 'Détails' },
//         { id: 4, title: 'Métadonnées' }
//     ];

//     return (
//         <AnimatePresence>
//             {isOpen && (
//                 <motion.div 
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//                 >
//                     <motion.div 
//                         initial={{ scale: 0.9, opacity: 0, y: 50 }}
//                         animate={{ scale: 1, opacity: 1, y: 0 }}
//                         exit={{ scale: 0.9, opacity: 0, y: 50 }}
//                         className="w-[750px] max-h-[90vh] overflow-y-auto bg-white shadow-lg p-6 font-poppins rounded-2xl scrollbar-hidden"
//                     >
//                         {/* En-tête */}
//                         <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
//                             <h1 className="text-xl font-semibold text-gray-800">Nouveau Contrat</h1>
//                             <button 
//                                 onClick={handleClose}
//                                 className="p-1 hover:bg-gray-100 rounded-full transition"
//                             >
//                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                                     <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
//                                 </svg>
//                             </button>
//                         </div>

//                         {/* Onglets */}
//                         <div className="flex gap-4 mb-4 border-b border-gray-200">
//                             <button
//                                 onClick={() => setActiveTab('upload')}
//                                 className={`pb-2 text-sm font-medium transition ${
//                                     activeTab === 'upload' 
//                                         ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
//                                         : 'text-gray-600 hover:text-[#FF8500]'
//                                 }`}
//                             >
//                                 Upload PDF (OCR)
//                             </button>
//                             <button
//                                 onClick={() => setActiveTab('manuel')}
//                                 className={`pb-2 text-sm font-medium transition ${
//                                     activeTab === 'manuel' 
//                                         ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
//                                         : 'text-gray-600 hover:text-[#FF8500]'
//                                 }`}
//                             >
//                                 Formulaire manuel
//                             </button>
//                         </div>

//                         {/* Upload PDF */}
//                         {activeTab === 'upload' && (
//                             <form onSubmit={handleUploadSubmit} className="space-y-4">
//                                 <div 
//                                     className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-[25px] flex flex-col justify-center items-center transition hover:border-[#FF8500]"
//                                     onDragOver={(e) => e.preventDefault()}
//                                     onDrop={(e) => {
//                                         e.preventDefault();
//                                         const droppedFile = e.dataTransfer.files[0];
//                                         if (droppedFile && droppedFile.type === 'application/pdf') {
//                                             setFile(droppedFile);
//                                             setFilePreview(droppedFile.name);
//                                         } else {
//                                             alert('Veuillez déposer un fichier PDF valide');
//                                         }
//                                     }}
//                                 >
//                                     <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
//                                         <path d="M30 10V30M30 30V50M30 30H50M30 30H10" stroke="#FF8500" strokeWidth="4" strokeLinecap="round"/>
//                                         <circle cx="30" cy="30" r="28" stroke="#FF8500" strokeWidth="4" strokeDasharray="4 4"/>
//                                     </svg>
                                    
//                                     <p className="text-sm text-gray-600 mt-2">
//                                         Glissez votre PDF ici ou
//                                     </p>
                                    
//                                     <button
//                                         type="button"
//                                         onClick={() => document.getElementById('pdf-upload').click()}
//                                         className="mt-2 px-4 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-[25px] hover:bg-[#e67800] transition"
//                                     >
//                                         Choisir un fichier
//                                     </button>

//                                     <input
//                                         type="file"
//                                         id="pdf-upload"
//                                         accept=".pdf"
//                                         onChange={handleFileChange}
//                                         className="hidden"
//                                     />
//                                 </div>

//                                 {/* Prévisualisation fichier */}
//                                 {filePreview && (
//                                     <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-[25px] border border-gray-300">
//                                         <div className="flex items-center gap-2">
//                                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                                 <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FF8500" strokeWidth="2"/>
//                                                 <path d="M14 2V8H20" stroke="#FF8500" strokeWidth="2"/>
//                                             </svg>
//                                             <p className="text-xs text-gray-700 truncate max-w-[400px]">{filePreview}</p>
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={handleDeleteFile}
//                                             className="p-1 hover:bg-gray-200 rounded-full transition"
//                                         >
//                                             <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                                                 <path d="M15 5L5 15M5 5L15 15" stroke="#FF8500" strokeWidth="2"/>
//                                             </svg>
//                                         </button>
//                                     </div>
//                                 )}

//                                 {/* Champs complémentaires */}
//                                 <div className="grid grid-cols-2 gap-3 pt-2">
//                                     <div>
//                                         <label className="block text-xs text-gray-600 mb-1">Type de contrat</label>
//                                         <select
//                                             name="type_contrat"
//                                             value={formData.type_contrat}
//                                             onChange={handleInputChange}
//                                             className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                         >
//                                             <option value="service">Service</option>
//                                             <option value="fourniture">Fourniture</option>
//                                             <option value="travaux">Travaux</option>
//                                             <option value="partenariat">Partenariat</option>
//                                             <option value="vente">Vente</option>
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs text-gray-600 mb-1">Fournisseur</label>
//                                         <input
//                                             type="text"
//                                             name="societe_b_nom"
//                                             value={formData.societe_b_nom}
//                                             onChange={handleInputChange}
//                                             className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                             placeholder="Nom du fournisseur"
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs text-gray-600 mb-1">Pays</label>
//                                         <input
//                                             type="text"
//                                             name="pays_partie_b"
//                                             value={formData.pays_partie_b}
//                                             onChange={handleInputChange}
//                                             className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                         />
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-2">
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Montant</label>
//                                             <input
//                                                 type="number"
//                                                 name="montant"
//                                                 value={formData.montant}
//                                                 onChange={handleInputChange}
//                                                 className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 placeholder="0"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Devise</label>
//                                             <select
//                                                 name="devise"
//                                                 value={formData.devise}
//                                                 onChange={handleInputChange}
//                                                 className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
//                                             >
//                                                 <option value="DZD">DZD</option>
//                                                 <option value="EUR">EUR</option>
//                                                 <option value="USD">USD</option>
//                                             </select>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Boutons */}
//                                 <div className="flex gap-3 justify-end mt-4 pt-3 border-t border-gray-200">
//                                     <button
//                                         type="button"
//                                         onClick={handleClose}
//                                         className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-[25px] hover:bg-gray-300 transition"
//                                     >
//                                         Annuler
//                                     </button>
//                                     <button
//                                         type="submit"
//                                         disabled={!file || loading}
//                                         className={`px-5 py-1.5 text-white text-sm font-medium rounded-[25px] transition flex items-center gap-2 ${
//                                             file && !loading
//                                                 ? 'bg-[#FF8500] hover:bg-[#e67800]' 
//                                                 : 'bg-gray-300 cursor-not-allowed'
//                                         }`}
//                                     >
//                                         {loading && (
//                                             <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                                             </svg>
//                                         )}
//                                         {loading ? 'Analyse en cours...' : 'Analyser et créer'}
//                                     </button>
//                                 </div>
//                             </form>
//                         )}

//                         {/* Formulaire manuel */}
//                         {activeTab === 'manuel' && (
//                             <form onSubmit={handleFormSubmit} className="space-y-4">
//                                 {/* Steps */}
//                                 <div className="flex items-center justify-between mb-4">
//                                     {steps.map((step) => (
//                                         <div
//                                             key={step.id}
//                                             className={`flex items-center gap-2 cursor-pointer ${
//                                                 currentStep >= step.id ? 'text-[#FF8500]' : 'text-gray-400'
//                                             }`}
//                                             onClick={() => setCurrentStep(step.id)}
//                                         >
//                                             <div className={`
//                                                 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
//                                                 ${currentStep >= step.id ? 'bg-orange-100' : 'bg-gray-100'}
//                                             `}>
//                                                 {step.id}
//                                             </div>
//                                             <span className="text-xs hidden sm:inline">{step.title}</span>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* Step 1: Général */}
//                                 {currentStep === 1 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">N° contrat</label>
//                                                 <input
//                                                     type="text"
//                                                     name="numero_contrat"
//                                                     value={formData.numero_contrat}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                     placeholder="Auto-généré"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Titre *</label>
//                                                 <input
//                                                     type="text"
//                                                     name="titre"
//                                                     value={formData.titre}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Objet *</label>
//                                             <textarea
//                                                 name="objet"
//                                                 value={formData.objet}
//                                                 onChange={handleInputChange}
//                                                 rows="3"
//                                                 className="w-full px-3 py-2 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 placeholder="Description détaillée..."
//                                             />
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date signature</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_signature"
//                                                     value={formData.date_signature}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date début</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_debut"
//                                                     value={formData.date_debut}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date fin</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_fin"
//                                                     value={formData.date_fin}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Montant</label>
//                                                 <input
//                                                     type="number"
//                                                     name="montant"
//                                                     value={formData.montant}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Devise</label>
//                                                 <select
//                                                     name="devise"
//                                                     value={formData.devise}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
//                                                 >
//                                                     <option value="DZD">DZD</option>
//                                                     <option value="EUR">EUR</option>
//                                                     <option value="USD">USD</option>
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Conditions paiement</label>
//                                                 <input
//                                                     type="text"
//                                                     name="conditions_paiement"
//                                                     value={formData.conditions_paiement}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                     placeholder="30 jours après facture"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Type contrat *</label>
//                                             <select
//                                                 name="type_contrat"
//                                                 value={formData.type_contrat}
//                                                 onChange={handleInputChange}
//                                                 className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
//                                             >
//                                                 <option value="service">Service</option>
//                                                 <option value="fourniture">Fourniture</option>
//                                                 <option value="travaux">Travaux</option>
//                                                 <option value="partenariat">Partenariat</option>
//                                                 <option value="vente">Vente</option>
//                                             </select>
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 2: Parties */}
//                                 {currentStep === 2 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
//                                         <div className="bg-gray-50 p-3 rounded-[20px]">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Partie A (Client - SONATRACH)</h3>
//                                             <div className="grid grid-cols-3 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Représentant Nom</label>
//                                                     <input type="text" name="societe_a_representant_nom" value={formData.societe_a_representant_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Prénom</label>
//                                                     <input type="text" name="societe_a_representant_prenom" value={formData.societe_a_representant_prenom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fonction</label>
//                                                     <input type="text" name="societe_a_representant_fonction" value={formData.societe_a_representant_fonction} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-gray-50 p-3 rounded-[20px]">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Partie B (Fournisseur) *</h3>
//                                             <div className="grid grid-cols-2 gap-3 mb-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Nom société *</label>
//                                                     <input type="text" name="societe_b_nom" value={formData.societe_b_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Siège social</label>
//                                                     <input type="text" name="societe_b_siege_social" value={formData.societe_b_siege_social} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                             <div className="grid grid-cols-3 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Représentant Nom</label>
//                                                     <input type="text" name="societe_b_representant_nom" value={formData.societe_b_representant_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Prénom</label>
//                                                     <input type="text" name="societe_b_representant_prenom" value={formData.societe_b_representant_prenom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fonction</label>
//                                                     <input type="text" name="societe_b_representant_fonction" value={formData.societe_b_representant_fonction} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Pays Partie B</label>
//                                             <input type="text" name="pays_partie_b" value={formData.pays_partie_b} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 3: Détails contractuels */}
//                                 {currentStep === 3 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
//                                         <div className="bg-gray-50 p-3 rounded-[20px]">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Contacts (Article 21)</h3>
//                                             <div className="grid grid-cols-2 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Adresse ligne 1</label>
//                                                     <input type="text" name="notification_adresse_ligne1" value={formData.notification_adresse_ligne1} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Adresse ligne 2</label>
//                                                     <input type="text" name="notification_adresse_ligne2" value={formData.notification_adresse_ligne2} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fax</label>
//                                                     <input type="text" name="fax_fournisseur" value={formData.fax_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Téléphone</label>
//                                                     <input type="text" name="telephone_fournisseur" value={formData.telephone_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div className="col-span-2">
//                                                     <label className="block text-xs text-gray-600 mb-1">Email</label>
//                                                     <input type="email" name="email_fournisseur" value={formData.email_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-gray-50 p-3 rounded-[20px]">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Signatures (Article 22)</h3>
//                                             <div className="grid grid-cols-2 gap-3">
//                                                 <div>
//                                                     <h4 className="text-xs text-gray-600 mb-2">Client</h4>
//                                                     <input type="text" name="nom_client" placeholder="Nom" value={formData.nom_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="prenom_client" placeholder="Prénom" value={formData.prenom_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="fonction_client" placeholder="Fonction" value={formData.fonction_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <h4 className="text-xs text-gray-600 mb-2">Fournisseur</h4>
//                                                     <input type="text" name="nom_fournisseur" placeholder="Nom" value={formData.nom_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="prenom_fournisseur" placeholder="Prénom" value={formData.prenom_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="fonction_fournisseur" placeholder="Fonction" value={formData.fonction_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 4: Métadonnées */}
//                                 {currentStep === 4 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Délai livraison (mois)</label>
//                                             <input type="number" name="delai_livraison_mois" value={formData.delai_livraison_mois} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Pénalité retard (%)</label>
//                                             <input type="number" step="0.01" name="penalite_retard_pct" value={formData.penalite_retard_pct} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Durée garantie (mois)</label>
//                                             <input type="number" name="duree_garantie_mois" value={formData.duree_garantie_mois} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Caution bonne fin (%)</label>
//                                             <input type="number" step="0.01" name="caution_bonne_fin_pct" value={formData.caution_bonne_fin_pct} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div className="col-span-2">
//                                             <label className="block text-xs text-gray-600 mb-1">Tribunal compétent</label>
//                                             <input type="text" name="tribunal_competent" value={formData.tribunal_competent} onChange={handleInputChange} className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm" placeholder="Laghouat" />
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Navigation */}
//                                 <div className="flex justify-between pt-4 border-t border-gray-200">
//                                     <button
//                                         type="button"
//                                         onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
//                                         className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-[25px] hover:bg-gray-300 transition"
//                                     >
//                                         Précédent
//                                     </button>
                                    
//                                     {currentStep < 4 ? (
//                                         <button
//                                             type="button"
//                                             onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
//                                             className="px-5 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-[25px] hover:bg-[#e67800] transition"
//                                         >
//                                             Suivant
//                                         </button>
//                                     ) : (
//                                         <div className="flex gap-3">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleClose}
//                                                 className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-[25px] hover:bg-gray-300 transition"
//                                             >
//                                                 Annuler
//                                             </button>
//                                             <button
//                                                 type="submit"
//                                                 disabled={loading}
//                                                 className="px-5 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-[25px] hover:bg-[#e67800] transition disabled:opacity-50 flex items-center gap-2"
//                                             >
//                                                 {loading && (
//                                                     <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                                                     </svg>
//                                                 )}
//                                                 {loading ? 'Création...' : 'Créer le contrat'}
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </form>
//                         )}
//                     </motion.div>
//                 </motion.div>
//             )}
            
//             <style jsx>{`
//                 .scrollbar-hidden {
//                     scrollbar-width: none;
//                     -ms-overflow-style: none;
//                 }
//                 .scrollbar-hidden::-webkit-scrollbar {
//                     display: none;
//                 }
//             `}</style>
//         </AnimatePresence>
//     );
// };

// export default AjouterContratModal;















// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const AjouterContratModal = ({ isOpen, onClose, onSuccess, axiosInstance }) => {
//     const [activeTab, setActiveTab] = useState('upload');
//     const [file, setFile] = useState(null);
//     const [filePreview, setFilePreview] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
    
//     // Form data pour le formulaire manuel uniquement
//     const [formData, setFormData] = useState({
//         numero_contrat: '',
//         titre: '',
//         type_contrat: 'fourniture',
//         societe_b_nom: '',
//         pays_partie_b: 'Algérie',
//         objet: '',
//         date_signature: '',
//         date_debut: '',
//         date_fin: '',
//         montant: '',
//         devise: 'DZD',
//         conditions_paiement: '',
//         societe_a_nom: 'SONATRACH',
//         societe_a_representant_nom: '',
//         societe_a_representant_prenom: '',
//         societe_a_representant_fonction: '',
//         societe_b_siege_social: '',
//         societe_b_representant_nom: '',
//         societe_b_representant_prenom: '',
//         societe_b_representant_fonction: '',
//         notification_adresse_ligne1: '',
//         notification_adresse_ligne2: '',
//         fax_fournisseur: '',
//         telephone_fournisseur: '',
//         email_fournisseur: '',
//         nom_client: '',
//         prenom_client: '',
//         fonction_client: '',
//         nom_fournisseur: '',
//         prenom_fournisseur: '',
//         fonction_fournisseur: '',
//         delai_livraison_mois: '',
//         penalite_retard_pct: '',
//         duree_garantie_mois: '',
//         caution_bonne_fin_pct: '',
//         tribunal_competent: ''
//     });
//     const [currentStep, setCurrentStep] = useState(1);

//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile && selectedFile.type === 'application/pdf') {
//             setFile(selectedFile);
//             setFilePreview(selectedFile.name);
//             setError('');
//         } else {
//             setError('Veuillez sélectionner un fichier PDF valide');
//         }
//     };

//     const handleDeleteFile = () => {
//         setFile(null);
//         setFilePreview(null);
//         setError('');
//         const input = document.getElementById('pdf-upload');
//         if (input) input.value = '';
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     // UPLOAD PDF - UNIQUEMENT LE FICHIER, SANS CHAMPS SUPPLEMENTAIRES
//     const handleUploadSubmit = async (e) => {
//         e.preventDefault();
//         if (!file) {
//             setError('Veuillez sélectionner un fichier PDF');
//             return;
//         }

//         setLoading(true);
//         setError('');

//         const data = new FormData();
//         data.append('fichier', file);
        
//         // PLUS AUCUN CHAMP SUPPLEMENTAIRE !!!

//         try {
//             const response = await axiosInstance.post('/clm/contrats/upload/', data, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
            
//             if (response.data.success) {
//                 onSuccess(`Contrat ${response.data.contrat.numero_contrat} créé avec succès`);
//                 handleClose();
//             }
//         } catch (err) {
//             console.error("Erreur upload:", err);
//             setError(err.response?.data?.error || "Erreur lors de l'upload du contrat");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!formData.societe_b_nom || !formData.objet) {
//             alert('Veuillez remplir les champs obligatoires (Fournisseur et Objet)');
//             return;
//         }

//         setLoading(true);
//         const data = new FormData();
//         Object.keys(formData).forEach(key => {
//             if (formData[key]) {
//                 data.append(key, formData[key]);
//             }
//         });

//         try {
//             const response = await axiosInstance.post('/clm/contrats/formulaire/', data, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
            
//             if (response.data.success) {
//                 onSuccess(`Contrat ${response.data.contrat.numero_contrat} créé avec succès`);
//                 handleClose();
//             }
//         } catch (err) {
//             console.error("Erreur création:", err);
//             alert(err.response?.data?.error || "Erreur lors de la création du contrat");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleClose = () => {
//         setActiveTab('upload');
//         setFile(null);
//         setFilePreview(null);
//         setError('');
//         setCurrentStep(1);
//         setFormData({
//             numero_contrat: '',
//             titre: '',
//             type_contrat: 'fourniture',
//             societe_b_nom: '',
//             pays_partie_b: 'Algérie',
//             objet: '',
//             date_signature: '',
//             date_debut: '',
//             date_fin: '',
//             montant: '',
//             devise: 'DZD',
//             conditions_paiement: '',
//             societe_a_nom: 'SONATRACH',
//             societe_a_representant_nom: '',
//             societe_a_representant_prenom: '',
//             societe_a_representant_fonction: '',
//             societe_b_siege_social: '',
//             societe_b_representant_nom: '',
//             societe_b_representant_prenom: '',
//             societe_b_representant_fonction: '',
//             notification_adresse_ligne1: '',
//             notification_adresse_ligne2: '',
//             fax_fournisseur: '',
//             telephone_fournisseur: '',
//             email_fournisseur: '',
//             nom_client: '',
//             prenom_client: '',
//             fonction_client: '',
//             nom_fournisseur: '',
//             prenom_fournisseur: '',
//             fonction_fournisseur: '',
//             delai_livraison_mois: '',
//             penalite_retard_pct: '',
//             duree_garantie_mois: '',
//             caution_bonne_fin_pct: '',
//             tribunal_competent: ''
//         });
//         onClose();
//     };

//     if (!isOpen) return null;

//     const steps = [
//         { id: 1, title: 'Général' },
//         { id: 2, title: 'Parties' },
//         { id: 3, title: 'Détails' },
//         { id: 4, title: 'Métadonnées' }
//     ];

//     return (
//         <AnimatePresence>
//             {isOpen && (
//                 <motion.div 
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//                 >
//                     <motion.div 
//                         initial={{ scale: 0.9, opacity: 0, y: 50 }}
//                         animate={{ scale: 1, opacity: 1, y: 0 }}
//                         exit={{ scale: 0.9, opacity: 0, y: 50 }}
//                         className="w-[750px] max-h-[90vh] overflow-y-auto bg-white shadow-lg p-6 rounded-2xl"
//                     >
//                         {/* En-tête */}
//                         <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
//                             <h1 className="text-xl font-semibold text-gray-800">Nouveau Contrat</h1>
//                             <button 
//                                 onClick={handleClose}
//                                 className="p-1 hover:bg-gray-100 rounded-full transition"
//                             >
//                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                                     <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
//                                 </svg>
//                             </button>
//                         </div>

//                         {/* Onglets */}
//                         <div className="flex gap-4 mb-4 border-b border-gray-200">
//                             <button
//                                 onClick={() => setActiveTab('upload')}
//                                 className={`pb-2 text-sm font-medium transition ${
//                                     activeTab === 'upload' 
//                                         ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
//                                         : 'text-gray-600 hover:text-[#FF8500]'
//                                 }`}
//                             >
//                                 Upload PDF 
//                             </button>
//                             <button
//                                 onClick={() => setActiveTab('manuel')}
//                                 className={`pb-2 text-sm font-medium transition ${
//                                     activeTab === 'manuel' 
//                                         ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
//                                         : 'text-gray-600 hover:text-[#FF8500]'
//                                 }`}
//                             >
//                                 Formulaire manuel
//                             </button>
//                         </div>

//                         {/* Upload PDF - SIMPLIFIÉ, SANS CHAMPS SUPPLEMENTAIRES */}
//                         {activeTab === 'upload' && (
//                             <form onSubmit={handleUploadSubmit} className="space-y-4">
//                                 {/* Message info */}
//                                 <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
//                                     <div className="flex items-center gap-2">
//                                         <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         <p className="text-xs text-blue-700">
//                                             L'analyse OCR extraira automatiquement toutes les informations du contrat.
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Zone de drop */}
//                                 <div 
//                                     className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col justify-center items-center transition hover:border-[#FF8500] cursor-pointer"
//                                     onDragOver={(e) => e.preventDefault()}
//                                     onDrop={(e) => {
//                                         e.preventDefault();
//                                         const droppedFile = e.dataTransfer.files[0];
//                                         if (droppedFile && droppedFile.type === 'application/pdf') {
//                                             setFile(droppedFile);
//                                             setFilePreview(droppedFile.name);
//                                             setError('');
//                                         } else {
//                                             setError('Veuillez déposer un fichier PDF valide');
//                                         }
//                                     }}
//                                     onClick={() => document.getElementById('pdf-upload').click()}
//                                 >
//                                     <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
//                                         <path d="M30 10V30M30 30V50M30 30H50M30 30H10" stroke="#FF8500" strokeWidth="4" strokeLinecap="round"/>
//                                         <circle cx="30" cy="30" r="28" stroke="#FF8500" strokeWidth="4" strokeDasharray="4 4"/>
//                                     </svg>
                                    
//                                     <p className="text-sm text-gray-600 mt-2">
//                                         Glissez votre PDF ici ou
//                                     </p>
                                    
//                                     <button
//                                         type="button"
//                                         className="mt-2 px-4 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition"
//                                     >
//                                         Choisir un fichier
//                                     </button>

//                                     <input
//                                         type="file"
//                                         id="pdf-upload"
//                                         accept=".pdf"
//                                         onChange={handleFileChange}
//                                         className="hidden"
//                                     />
//                                 </div>

//                                 {/* Prévisualisation fichier */}
//                                 {filePreview && (
//                                     <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-xl border border-gray-300">
//                                         <div className="flex items-center gap-2">
//                                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                                 <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FF8500" strokeWidth="2"/>
//                                                 <path d="M14 2V8H20" stroke="#FF8500" strokeWidth="2"/>
//                                             </svg>
//                                             <p className="text-xs text-gray-700 truncate max-w-[400px]">{filePreview}</p>
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={handleDeleteFile}
//                                             className="p-1 hover:bg-gray-200 rounded-full transition"
//                                         >
//                                             <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                                                 <path d="M15 5L5 15M5 5L15 15" stroke="#FF8500" strokeWidth="2"/>
//                                             </svg>
//                                         </button>
//                                     </div>
//                                 )}

//                                 {/* Message d'erreur */}
//                                 {error && (
//                                     <div className="p-2 bg-red-50 text-red-600 text-sm rounded-xl">
//                                         {error}
//                                     </div>
//                                 )}

//                                 {/* Boutons */}
//                                 <div className="flex gap-3 justify-end pt-3 border-t border-gray-200">
//                                     <button
//                                         type="button"
//                                         onClick={handleClose}
//                                         className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
//                                     >
//                                         Annuler
//                                     </button>
//                                     <button
//                                         type="submit"
//                                         disabled={!file || loading}
//                                         className={`px-5 py-1.5 text-white text-sm font-medium rounded-xl transition flex items-center gap-2 ${
//                                             file && !loading
//                                                 ? 'bg-[#FF8500] hover:bg-[#e67800]' 
//                                                 : 'bg-gray-300 cursor-not-allowed'
//                                         }`}
//                                     >
//                                         {loading && (
//                                             <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                                             </svg>
//                                         )}
//                                         {loading ? 'Analyse en cours...' : 'Analyser et créer'}
//                                     </button>
//                                 </div>
//                             </form>
//                         )}

//                         {/* Formulaire manuel (inchangé) */}
//                         {activeTab === 'manuel' && (
//                             <form onSubmit={handleFormSubmit} className="space-y-4">
//                                 {/* Steps */}
//                                 <div className="flex items-center justify-between mb-4">
//                                     {steps.map((step) => (
//                                         <div
//                                             key={step.id}
//                                             className={`flex items-center gap-2 cursor-pointer ${
//                                                 currentStep >= step.id ? 'text-[#FF8500]' : 'text-gray-400'
//                                             }`}
//                                             onClick={() => setCurrentStep(step.id)}
//                                         >
//                                             <div className={`
//                                                 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
//                                                 ${currentStep >= step.id ? 'bg-orange-100' : 'bg-gray-100'}
//                                             `}>
//                                                 {step.id}
//                                             </div>
//                                             <span className="text-xs hidden sm:inline">{step.title}</span>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* Step 1: Général */}
//                                 {currentStep === 1 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">N° contrat</label>
//                                                 <input
//                                                     type="text"
//                                                     name="numero_contrat"
//                                                     value={formData.numero_contrat}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                     placeholder="Auto-généré"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Titre *</label>
//                                                 <input
//                                                     type="text"
//                                                     name="titre"
//                                                     value={formData.titre}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Objet *</label>
//                                             <textarea
//                                                 name="objet"
//                                                 value={formData.objet}
//                                                 onChange={handleInputChange}
//                                                 rows="3"
//                                                 className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 placeholder="Description détaillée..."
//                                             />
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date signature</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_signature"
//                                                     value={formData.date_signature}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date début</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_debut"
//                                                     value={formData.date_debut}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date fin</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_fin"
//                                                     value={formData.date_fin}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Montant</label>
//                                                 <input
//                                                     type="number"
//                                                     name="montant"
//                                                     value={formData.montant}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Devise</label>
//                                                 <select
//                                                     name="devise"
//                                                     value={formData.devise}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
//                                                 >
//                                                     <option value="DZD">DZD</option>
//                                                     <option value="EUR">EUR</option>
//                                                     <option value="USD">USD</option>
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Conditions paiement</label>
//                                                 <input
//                                                     type="text"
//                                                     name="conditions_paiement"
//                                                     value={formData.conditions_paiement}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                     placeholder="30 jours après facture"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Type contrat *</label>
//                                             <select
//                                                 name="type_contrat"
//                                                 value={formData.type_contrat}
//                                                 onChange={handleInputChange}
//                                                 className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
//                                             >
//                                                 <option value="service">Service</option>
//                                                 <option value="fourniture">Fourniture</option>
//                                                 <option value="travaux">Travaux</option>
//                                                 <option value="partenariat">Partenariat</option>
//                                                 <option value="vente">Vente</option>
//                                             </select>
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 2: Parties */}
//                                 {currentStep === 2 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
//                                         <div className="bg-gray-50 p-3 rounded-xl">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Client</h3>
//                                             <div className="grid grid-cols-3 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Nom société</label>
//                                                     <input type="text" name="societe_a_representant_nom" value={formData.societe_a_representant_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Représentant Nom</label>
//                                                     <input type="text" name="societe_a_representant_prenom" value={formData.societe_a_representant_prenom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fonction</label>
//                                                     <input type="text" name="societe_a_representant_fonction" value={formData.societe_a_representant_fonction} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-gray-50 p-3 rounded-xl">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Fournisseur *</h3>
//                                             <div className="grid grid-cols-2 gap-3 mb-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Nom société *</label>
//                                                     <input type="text" name="societe_b_nom" value={formData.societe_b_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Siège social</label>
//                                                     <input type="text" name="societe_b_siege_social" value={formData.societe_b_siege_social} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                             <div className="grid grid-cols-3 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Représentant Nom</label>
//                                                     <input type="text" name="societe_b_representant_nom" value={formData.societe_b_representant_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 {/* <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Prénom</label>
//                                                     <input type="text" name="societe_b_representant_prenom" value={formData.societe_b_representant_prenom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div> */}
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fonction</label>
//                                                     <input type="text" name="societe_b_representant_fonction" value={formData.societe_b_representant_fonction} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Pays fournisseur</label>
//                                             <input type="text" name="pays_partie_b" value={formData.pays_partie_b} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 3: Détails contractuels */}
//                                 {currentStep === 3 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
//                                         <div className="bg-gray-50 p-3 rounded-xl">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Contacts</h3>
//                                             <div className="grid grid-cols-2 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Adresse client</label>
//                                                     <input type="text" name="notification_adresse_ligne1" value={formData.notification_adresse_ligne1} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Adresse fournisseur</label>
//                                                     <input type="text" name="notification_adresse_ligne2" value={formData.notification_adresse_ligne2} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fax</label>
//                                                     <input type="text" name="fax_fournisseur" value={formData.fax_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Téléphone</label>
//                                                     <input type="text" name="telephone_fournisseur" value={formData.telephone_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div className="col-span-2">
//                                                     <label className="block text-xs text-gray-600 mb-1">Email</label>
//                                                     <input type="email" name="email_fournisseur" value={formData.email_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-gray-50 p-3 rounded-xl">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Signatures</h3>
//                                             <div className="grid grid-cols-2 gap-3">
//                                                 <div>
//                                                     <h4 className="text-xs text-gray-600 mb-2">Client</h4>
//                                                     <input type="text" name="nom_client" placeholder="Nom" value={formData.nom_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="prenom_client" placeholder="Prénom" value={formData.prenom_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="fonction_client" placeholder="Fonction" value={formData.fonction_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <h4 className="text-xs text-gray-600 mb-2">Fournisseur</h4>
//                                                     <input type="text" name="nom_fournisseur" placeholder="Nom" value={formData.nom_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="prenom_fournisseur" placeholder="Prénom" value={formData.prenom_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="fonction_fournisseur" placeholder="Fonction" value={formData.fonction_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 4: Métadonnées */}
//                                 {currentStep === 4 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Délai livraison (mois)</label>
//                                             <input type="number" name="delai_livraison_mois" value={formData.delai_livraison_mois} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Pénalité retard (%)</label>
//                                             <input type="number" step="0.01" name="penalite_retard_pct" value={formData.penalite_retard_pct} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Durée garantie (mois)</label>
//                                             <input type="number" name="duree_garantie_mois" value={formData.duree_garantie_mois} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Caution bonne fin (%)</label>
//                                             <input type="number" step="0.01" name="caution_bonne_fin_pct" value={formData.caution_bonne_fin_pct} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div className="col-span-2">
//                                             <label className="block text-xs text-gray-600 mb-1">Tribunal compétent</label>
//                                             <input type="text" name="tribunal_competent" value={formData.tribunal_competent} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" placeholder="Laghouat" />
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Navigation */}
//                                 <div className="flex justify-between pt-4 border-t border-gray-200">
//                                     <button
//                                         type="button"
//                                         onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
//                                         className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
//                                     >
//                                         Précédent
//                                     </button>
                                    
//                                     {currentStep < 4 ? (
//                                         <button
//                                             type="button"
//                                             onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
//                                             className="px-5 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition"
//                                         >
//                                             Suivant
//                                         </button>
//                                     ) : (
//                                         <div className="flex gap-3">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleClose}
//                                                 className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
//                                             >
//                                                 Annuler
//                                             </button>
//                                             <button
//                                                 type="submit"
//                                                 disabled={loading}
//                                                 className="px-5 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition disabled:opacity-50 flex items-center gap-2"
//                                             >
//                                                 {loading && (
//                                                     <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                                                     </svg>
//                                                 )}
//                                                 {loading ? 'Création...' : 'Créer le contrat'}
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </form>
//                         )}
//                     </motion.div>
//                 </motion.div>
//             )}
//         </AnimatePresence>
//     );
// };

// // export default AjouterContratModal;
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const AjouterContratModal = ({ isOpen, onClose, onSuccess, axiosInstance }) => {
//     const [activeTab, setActiveTab] = useState('upload');
//     const [file, setFile] = useState(null);
//     const [filePreview, setFilePreview] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
    
//     // Champs supplémentaires pour l'upload PDF
//     const [pdfFormData, setPdfFormData] = useState({
//         date_signature: '',
//         date_debut: '',
        
//     });
    
//     // Form data pour le formulaire manuel uniquement
//     const [formData, setFormData] = useState({
//         numero_contrat: '',
//         titre: '',
//         type_contrat: 'fourniture',
//         societe_b_nom: '',
//         pays_partie_b: 'Algérie',
//         objet: '',
//         date_signature: '',
//         date_debut: '',
//         date_fin: '',
//         montant: '',
//         devise: 'DZD',
//         conditions_paiement: '',
//         societe_a_nom: 'SONATRACH',
//         societe_a_representant_nom: '',
//         societe_a_representant_prenom: '',
//         societe_a_representant_fonction: '',
//         societe_b_siege_social: '',
//         societe_b_representant_nom: '',
//         societe_b_representant_prenom: '',
//         societe_b_representant_fonction: '',
//         notification_adresse_ligne1: '',
//         notification_adresse_ligne2: '',
//         fax_fournisseur: '',
//         telephone_fournisseur: '',
//         email_fournisseur: '',
//         nom_client: '',
//         prenom_client: '',
//         fonction_client: '',
//         nom_fournisseur: '',
//         prenom_fournisseur: '',
//         fonction_fournisseur: '',
//         delai_livraison_mois: '',
//         penalite_retard_pct: '',
//         duree_garantie_mois: '',
//         caution_bonne_fin_pct: '',
//         tribunal_competent: ''
//     });
//     const [currentStep, setCurrentStep] = useState(1);

//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile && selectedFile.type === 'application/pdf') {
//             setFile(selectedFile);
//             setFilePreview(selectedFile.name);
//             setError('');
//         } else {
//             setError('Veuillez sélectionner un fichier PDF valide');
//         }
//     };

//     const handleDeleteFile = () => {
//         setFile(null);
//         setFilePreview(null);
//         setError('');
//         const input = document.getElementById('pdf-upload');
//         if (input) input.value = '';
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handlePdfInputChange = (e) => {
//         const { name, value } = e.target;
//         setPdfFormData(prev => ({ ...prev, [name]: value }));
//     };

//     // UPLOAD PDF - AVEC CHAMPS DE DATES
//     const handleUploadSubmit = async (e) => {
//         e.preventDefault();
//         if (!file) {
//             setError('Veuillez sélectionner un fichier PDF');
//             return;
//         }

//         setLoading(true);
//         setError('');

//         const data = new FormData();
//         data.append('fichier', file);
        
//         // Ajouter les champs de dates
//         if (pdfFormData.date_signature) data.append('date_signature', pdfFormData.date_signature);
//         if (pdfFormData.date_debut) data.append('date_debut', pdfFormData.date_debut);

//         try {
//             const response = await axiosInstance.post('/clm/contrats/upload/', data, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
            
//             if (response.data.success) {
//                 onSuccess(`Contrat ${response.data.contrat.numero_contrat} créé avec succès`);
//                 handleClose();
//             }
//         } catch (err) {
//             console.error("Erreur upload:", err);
//             setError(err.response?.data?.error || "Erreur lors de l'upload du contrat");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!formData.societe_b_nom || !formData.objet) {
//             alert('Veuillez remplir les champs obligatoires (Fournisseur et Objet)');
//             return;
//         }

//         setLoading(true);
//         const data = new FormData();
//         Object.keys(formData).forEach(key => {
//             if (formData[key]) {
//                 data.append(key, formData[key]);
//             }
//         });

//         try {
//             const response = await axiosInstance.post('/clm/contrats/formulaire/', data, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
            
//             if (response.data.success) {
//                 onSuccess(`Contrat ${response.data.contrat.numero_contrat} créé avec succès`);
//                 handleClose();
//             }
//         } catch (err) {
//             console.error("Erreur création:", err);
//             alert(err.response?.data?.error || "Erreur lors de la création du contrat");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleClose = () => {
//         setActiveTab('upload');
//         setFile(null);
//         setFilePreview(null);
//         setError('');
//         setPdfFormData({
//             date_signature: '',
//             date_debut: '',
//         });
//         setCurrentStep(1);
//         setFormData({
//             numero_contrat: '',
//             titre: '',
//             type_contrat: 'fourniture',
//             societe_b_nom: '',
//             pays_partie_b: 'Algérie',
//             objet: '',
//             date_signature: '',
//             date_debut: '',
//             montant: '',
//             devise: 'DZD',
//             conditions_paiement: '',
//             societe_a_nom: 'SONATRACH',
//             societe_a_representant_nom: '',
//             societe_a_representant_prenom: '',
//             societe_a_representant_fonction: '',
//             societe_b_siege_social: '',
//             societe_b_representant_nom: '',
//             societe_b_representant_prenom: '',
//             societe_b_representant_fonction: '',
//             notification_adresse_ligne1: '',
//             notification_adresse_ligne2: '',
//             fax_fournisseur: '',
//             telephone_fournisseur: '',
//             email_fournisseur: '',
//             nom_client: '',
//             prenom_client: '',
//             fonction_client: '',
//             nom_fournisseur: '',
//             prenom_fournisseur: '',
//             fonction_fournisseur: '',
//             delai_livraison_mois: '',
//             penalite_retard_pct: '',
//             duree_garantie_mois: '',
//             caution_bonne_fin_pct: '',
//             tribunal_competent: ''
//         });
//         onClose();
//     };

//     if (!isOpen) return null;

//     const steps = [
//         { id: 1, title: 'Général' },
//         { id: 2, title: 'Parties' },
//         { id: 3, title: 'Détails' },
//         { id: 4, title: 'Métadonnées' }
//     ];

//     return (
//         <AnimatePresence>
//             {isOpen && (
//                 <motion.div 
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//                 >
//                     <motion.div 
//                         initial={{ scale: 0.9, opacity: 0, y: 50 }}
//                         animate={{ scale: 1, opacity: 1, y: 0 }}
//                         exit={{ scale: 0.9, opacity: 0, y: 50 }}
//                         className="w-[750px] max-h-[90vh] overflow-y-auto bg-white shadow-lg p-6 rounded-2xl"
//                     >
//                         {/* En-tête */}
//                         <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
//                             <h1 className="text-xl font-semibold text-gray-800">Nouveau Contrat</h1>
//                             <button 
//                                 onClick={handleClose}
//                                 className="p-1 hover:bg-gray-100 rounded-full transition"
//                             >
//                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                                     <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
//                                 </svg>
//                             </button>
//                         </div>

//                         {/* Onglets */}
//                         <div className="flex gap-4 mb-4 border-b border-gray-200">
//                             <button
//                                 onClick={() => setActiveTab('upload')}
//                                 className={`pb-2 text-sm font-medium transition ${
//                                     activeTab === 'upload' 
//                                         ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
//                                         : 'text-gray-600 hover:text-[#FF8500]'
//                                 }`}
//                             >
//                                 Upload PDF 
//                             </button>
//                             <button
//                                 onClick={() => setActiveTab('manuel')}
//                                 className={`pb-2 text-sm font-medium transition ${
//                                     activeTab === 'manuel' 
//                                         ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
//                                         : 'text-gray-600 hover:text-[#FF8500]'
//                                 }`}
//                             >
//                                 Formulaire manuel
//                             </button>
//                         </div>

//                         {/* Upload PDF - AVEC CHAMPS DE DATES */}
//                         {activeTab === 'upload' && (
//                             <form onSubmit={handleUploadSubmit} className="space-y-4">
//                                 {/* Message info */}
//                                 <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
//                                     <div className="flex items-center gap-2">
//                                         <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         <p className="text-xs text-blue-700">
//                                             L'analyse OCR extraira automatiquement toutes les informations du contrat.
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Zone de drop */}
//                                 <div 
//                                     className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col justify-center items-center transition hover:border-[#FF8500] cursor-pointer"
//                                     onDragOver={(e) => e.preventDefault()}
//                                     onDrop={(e) => {
//                                         e.preventDefault();
//                                         const droppedFile = e.dataTransfer.files[0];
//                                         if (droppedFile && droppedFile.type === 'application/pdf') {
//                                             setFile(droppedFile);
//                                             setFilePreview(droppedFile.name);
//                                             setError('');
//                                         } else {
//                                             setError('Veuillez déposer un fichier PDF valide');
//                                         }
//                                     }}
//                                     onClick={() => document.getElementById('pdf-upload').click()}
//                                 >
//                                     <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
//                                         <path d="M30 10V30M30 30V50M30 30H50M30 30H10" stroke="#FF8500" strokeWidth="4" strokeLinecap="round"/>
//                                         <circle cx="30" cy="30" r="28" stroke="#FF8500" strokeWidth="4" strokeDasharray="4 4"/>
//                                     </svg>
                                    
//                                     <p className="text-sm text-gray-600 mt-2">
//                                         Glissez votre PDF ici ou
//                                     </p>
                                    
//                                     <button
//                                         type="button"
//                                         className="mt-2 px-4 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition"
//                                     >
//                                         Choisir un fichier
//                                     </button>

//                                     <input
//                                         type="file"
//                                         id="pdf-upload"
//                                         accept=".pdf"
//                                         onChange={handleFileChange}
//                                         className="hidden"
//                                     />
//                                 </div>

//                                 {/* Prévisualisation fichier */}
//                                 {filePreview && (
//                                     <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-xl border border-gray-300">
//                                         <div className="flex items-center gap-2">
//                                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                                 <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FF8500" strokeWidth="2"/>
//                                                 <path d="M14 2V8H20" stroke="#FF8500" strokeWidth="2"/>
//                                             </svg>
//                                             <p className="text-xs text-gray-700 truncate max-w-[400px]">{filePreview}</p>
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={handleDeleteFile}
//                                             className="p-1 hover:bg-gray-200 rounded-full transition"
//                                         >
//                                             <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                                                 <path d="M15 5L5 15M5 5L15 15" stroke="#FF8500" strokeWidth="2"/>
//                                             </svg>
//                                         </button>
//                                     </div>
//                                 )}

//                                 {/* Champs de dates supplémentaires */}
//                                 {filePreview && (
//                                     <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-200">
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Date signature</label>
//                                             <input
//                                                 type="date"
//                                                 name="date_signature"
//                                                 value={pdfFormData.date_signature}
//                                                 onChange={handlePdfInputChange}
//                                                 className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Date début</label>
//                                             <input
//                                                 type="date"
//                                                 name="date_debut"
//                                                 value={pdfFormData.date_debut}
//                                                 onChange={handlePdfInputChange}
//                                                 className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                             />
//                                         </div>
//                                         {/* <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Date fin</label>
//                                             <input
//                                                 type="date"
//                                                 name="date_fin"
//                                                 value={pdfFormData.date_fin}
//                                                 onChange={handlePdfInputChange}
//                                                 className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                             />
//                                         </div> */}
//                                     </div>
//                                 )}

//                                 {/* Message d'erreur */}
//                                 {error && (
//                                     <div className="p-2 bg-red-50 text-red-600 text-sm rounded-xl">
//                                         {error}
//                                     </div>
//                                 )}

//                                 {/* Boutons */}
//                                 <div className="flex gap-3 justify-end pt-3 border-t border-gray-200">
//                                     <button
//                                         type="button"
//                                         onClick={handleClose}
//                                         className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
//                                     >
//                                         Annuler
//                                     </button>
//                                     <button
//                                         type="submit"
//                                         disabled={!file || loading}
//                                         className={`px-5 py-1.5 text-white text-sm font-medium rounded-xl transition flex items-center gap-2 ${
//                                             file && !loading
//                                                 ? 'bg-[#FF8500] hover:bg-[#e67800]' 
//                                                 : 'bg-gray-300 cursor-not-allowed'
//                                         }`}
//                                     >
//                                         {loading && (
//                                             <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                                             </svg>
//                                         )}
//                                         {loading ? 'Analyse en cours...' : 'Analyser et créer'}
//                                     </button>
//                                 </div>
//                             </form>
//                         )}

//                         {/* Formulaire manuel */}
//                         {activeTab === 'manuel' && (
//                             <form onSubmit={handleFormSubmit} className="space-y-4">
//                                 {/* Steps */}
//                                 <div className="flex items-center justify-between mb-4">
//                                     {steps.map((step) => (
//                                         <div
//                                             key={step.id}
//                                             className={`flex items-center gap-2 cursor-pointer ${
//                                                 currentStep >= step.id ? 'text-[#FF8500]' : 'text-gray-400'
//                                             }`}
//                                             onClick={() => setCurrentStep(step.id)}
//                                         >
//                                             <div className={`
//                                                 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
//                                                 ${currentStep >= step.id ? 'bg-orange-100' : 'bg-gray-100'}
//                                             `}>
//                                                 {step.id}
//                                             </div>
//                                             <span className="text-xs hidden sm:inline">{step.title}</span>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* Step 1: Général */}
//                                 {currentStep === 1 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">N° contrat</label>
//                                                 <input
//                                                     type="text"
//                                                     name="numero_contrat"
//                                                     value={formData.numero_contrat}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                     placeholder="Auto-généré"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Titre *</label>
//                                                 <input
//                                                     type="text"
//                                                     name="titre"
//                                                     value={formData.titre}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Objet *</label>
//                                             <textarea
//                                                 name="objet"
//                                                 value={formData.objet}
//                                                 onChange={handleInputChange}
//                                                 rows="3"
//                                                 className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 placeholder="Description détaillée..."
//                                             />
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date signature</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_signature"
//                                                     value={formData.date_signature}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date début</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_debut"
//                                                     value={formData.date_debut}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             {/* <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Date fin</label>
//                                                 <input
//                                                     type="date"
//                                                     name="date_fin"
//                                                     value={formData.date_fin}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div> */}
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-3">
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Montant</label>
//                                                 <input
//                                                     type="number"
//                                                     name="montant"
//                                                     value={formData.montant}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Devise</label>
//                                                 <select
//                                                     name="devise"
//                                                     value={formData.devise}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
//                                                 >
//                                                     <option value="DZD">DZD</option>
//                                                     <option value="EUR">EUR</option>
//                                                     <option value="USD">USD</option>
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs text-gray-600 mb-1">Conditions paiement</label>
//                                                 <input
//                                                     type="text"
//                                                     name="conditions_paiement"
//                                                     value={formData.conditions_paiement}
//                                                     onChange={handleInputChange}
//                                                     className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
//                                                     placeholder="30 jours après facture"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Type contrat *</label>
//                                             <select
//                                                 name="type_contrat"
//                                                 value={formData.type_contrat}
//                                                 onChange={handleInputChange}
//                                                 className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
//                                             >
//                                                 <option value="service">Service</option>
//                                                 <option value="fourniture">Fourniture</option>
//                                                 <option value="travaux">Travaux</option>
//                                                 <option value="partenariat">Partenariat</option>
//                                                 <option value="vente">Vente</option>
//                                             </select>
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 2: Parties */}
//                                 {currentStep === 2 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
//                                         <div className="bg-gray-50 p-3 rounded-xl">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Client</h3>
//                                             <div className="grid grid-cols-3 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Nom société</label>
//                                                     <input type="text" name="societe_a_representant_nom" value={formData.societe_a_representant_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Représentant Nom</label>
//                                                     <input type="text" name="societe_a_representant_prenom" value={formData.societe_a_representant_prenom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fonction</label>
//                                                     <input type="text" name="societe_a_representant_fonction" value={formData.societe_a_representant_fonction} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-gray-50 p-3 rounded-xl">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Fournisseur *</h3>
//                                             <div className="grid grid-cols-2 gap-3 mb-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Nom société *</label>
//                                                     <input type="text" name="societe_b_nom" value={formData.societe_b_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Siège social</label>
//                                                     <input type="text" name="societe_b_siege_social" value={formData.societe_b_siege_social} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                             <div className="grid grid-cols-3 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Représentant Nom</label>
//                                                     <input type="text" name="societe_b_representant_nom" value={formData.societe_b_representant_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Prénom</label>
//                                                     <input type="text" name="societe_b_representant_prenom" value={formData.societe_b_representant_prenom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fonction</label>
//                                                     <input type="text" name="societe_b_representant_fonction" value={formData.societe_b_representant_fonction} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Pays fournisseur</label>
//                                             <input type="text" name="pays_partie_b" value={formData.pays_partie_b} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 3: Détails contractuels */}
//                                 {currentStep === 3 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
//                                         <div className="bg-gray-50 p-3 rounded-xl">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Contacts</h3>
//                                             <div className="grid grid-cols-2 gap-3">
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Adresse client</label>
//                                                     <input type="text" name="notification_adresse_ligne1" value={formData.notification_adresse_ligne1} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Adresse fournisseur</label>
//                                                     <input type="text" name="notification_adresse_ligne2" value={formData.notification_adresse_ligne2} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Fax</label>
//                                                     <input type="text" name="fax_fournisseur" value={formData.fax_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-xs text-gray-600 mb-1">Téléphone</label>
//                                                     <input type="text" name="telephone_fournisseur" value={formData.telephone_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div className="col-span-2">
//                                                     <label className="block text-xs text-gray-600 mb-1">Email</label>
//                                                     <input type="email" name="email_fournisseur" value={formData.email_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-gray-50 p-3 rounded-xl">
//                                             <h3 className="font-medium text-sm text-gray-800 mb-3">Signatures</h3>
//                                             <div className="grid grid-cols-2 gap-3">
//                                                 <div>
//                                                     <h4 className="text-xs text-gray-600 mb-2">Client</h4>
//                                                     <input type="text" name="nom_client" placeholder="Nom" value={formData.nom_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="prenom_client" placeholder="Prénom" value={formData.prenom_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="fonction_client" placeholder="Fonction" value={formData.fonction_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                                 <div>
//                                                     <h4 className="text-xs text-gray-600 mb-2">Fournisseur</h4>
//                                                     <input type="text" name="nom_fournisseur" placeholder="Nom" value={formData.nom_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="prenom_fournisseur" placeholder="Prénom" value={formData.prenom_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
//                                                     <input type="text" name="fonction_fournisseur" placeholder="Fonction" value={formData.fonction_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Step 4: Métadonnées */}
//                                 {currentStep === 4 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Délai livraison (mois)</label>
//                                             <input type="number" name="delai_livraison_mois" value={formData.delai_livraison_mois} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Pénalité retard (%)</label>
//                                             <input type="number" step="0.01" name="penalite_retard_pct" value={formData.penalite_retard_pct} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Durée garantie (mois)</label>
//                                             <input type="number" name="duree_garantie_mois" value={formData.duree_garantie_mois} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs text-gray-600 mb-1">Caution bonne fin (%)</label>
//                                             <input type="number" step="0.01" name="caution_bonne_fin_pct" value={formData.caution_bonne_fin_pct} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
//                                         </div>
//                                         <div className="col-span-2">
//                                             <label className="block text-xs text-gray-600 mb-1">Tribunal compétent</label>
//                                             <input type="text" name="tribunal_competent" value={formData.tribunal_competent} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" placeholder="Laghouat" />
//                                         </div>
//                                     </motion.div>
//                                 )}

//                                 {/* Navigation */}
//                                 <div className="flex justify-between pt-4 border-t border-gray-200">
//                                     <button
//                                         type="button"
//                                         onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
//                                         className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
//                                     >
//                                         Précédent
//                                     </button>
                                    
//                                     {currentStep < 4 ? (
//                                         <button
//                                             type="button"
//                                             onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
//                                             className="px-5 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition"
//                                         >
//                                             Suivant
//                                         </button>
//                                     ) : (
//                                         <div className="flex gap-3">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleClose}
//                                                 className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
//                                             >
//                                                 Annuler
//                                             </button>
//                                             <button
//                                                 type="submit"
//                                                 disabled={loading}
//                                                 className="px-5 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition disabled:opacity-50 flex items-center gap-2"
//                                             >
//                                                 {loading && (
//                                                     <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                                                     </svg>
//                                                 )}
//                                                 {loading ? 'Création...' : 'Créer le contrat'}
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </form>
//                         )}
//                     </motion.div>
//                 </motion.div>
//             )}
//         </AnimatePresence>
//     );
// };

// export default AjouterContratModal;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_ENABLED } from '../../ai/roles';
import { FieldAiButton } from '../Assistant/ContratAi';

// prefill : champs proposés par l'assistant IA (outil preparer_contrat) — rien n'est enregistré
// tant que l'utilisateur n'a pas relu et cliqué sur Enregistrer.
const AjouterContratModal = ({ isOpen, onClose, onSuccess, axiosInstance, prefill }) => {
    const [activeTab, setActiveTab] = useState('upload');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Champs supplémentaires pour l'upload PDF
    const [pdfFormData, setPdfFormData] = useState({
        date_signature: '',
        date_debut: '',
    });
    
    // Form data pour le formulaire manuel
    const [formData, setFormData] = useState({
        numero_contrat: '',
        titre: '',
        type_contrat: 'fourniture',
        societe_b_nom: '',
        pays_partie_b: 'Algérie',
        objet: '',
        date_signature: '',
        date_debut: '',
        montant: '',
        devise: 'DZD',
        conditions_paiement: '',
        societe_a_nom: 'SONATRACH',
        societe_a_representant_nom: '',
        societe_a_representant_prenom: '',
        societe_a_representant_fonction: '',
        societe_b_siege_social: '',
        societe_b_representant_nom: '',
        societe_b_representant_prenom: '',
        societe_b_representant_fonction: '',
        notification_adresse_ligne1: '',
        fax_fournisseur: '',
        telephone_fournisseur: '',
        email_fournisseur: '',
        nom_client: '',
        prenom_client: '',
        fonction_client: '',
        nom_fournisseur: '',
        prenom_fournisseur: '',
        fonction_fournisseur: '',
        delai_livraison_mois: '',
        duree_garantie_mois: '',
        caution_bonne_fin_pct: '',
        caution_bonne_fin_dzd: '',
        tribunal_competent: ''
    });
    const [currentStep, setCurrentStep] = useState(1);

    // Ouverture depuis l'assistant : onglet manuel, champs proposés fusionnés dans le formulaire.
    useEffect(() => {
        if (isOpen && prefill) {
            setActiveTab('manuel');
            setCurrentStep(1);
            setFormData(prev => ({ ...prev, ...prefill }));
        }
    }, [isOpen, prefill]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setFilePreview(selectedFile.name);
            setError('');
        } else {
            setError('Veuillez sélectionner un fichier PDF valide');
        }
    };

    const handleDeleteFile = () => {
        setFile(null);
        setFilePreview(null);
        setError('');
        const input = document.getElementById('pdf-upload');
        if (input) input.value = '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Liste des champs qui doivent être des nombres
        const numericFields = [
            'montant', 
            'delai_livraison_mois', 
            'duree_garantie_mois',
            'caution_bonne_fin_pct', 
            'caution_bonne_fin_dzd'
        ];
        
        let processedValue = value;
        
        // Pour les champs numériques, stocker comme nombre si valeur non vide
        if (numericFields.includes(name) && value !== '') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                processedValue = numValue;
            } else {
                processedValue = '';
            }
        }
        
        setFormData(prev => {
            const newData = { ...prev, [name]: processedValue };
            
            // Calcul automatique de caution_bonne_fin_dzd si caution_bonne_fin_pct est rempli
            if (name === 'caution_bonne_fin_pct' && prev.montant && processedValue !== '') {
                const montant = typeof prev.montant === 'number' ? prev.montant : parseFloat(prev.montant);
                const pct = typeof processedValue === 'number' ? processedValue : parseFloat(processedValue);
                if (!isNaN(montant) && !isNaN(pct)) {
                    newData.caution_bonne_fin_dzd = (montant * pct) / 100;
                }
            }
            if (name === 'montant' && prev.caution_bonne_fin_pct && processedValue !== '') {
                const montant = typeof processedValue === 'number' ? processedValue : parseFloat(processedValue);
                const pct = typeof prev.caution_bonne_fin_pct === 'number' ? prev.caution_bonne_fin_pct : parseFloat(prev.caution_bonne_fin_pct);
                if (!isNaN(montant) && !isNaN(pct)) {
                    newData.caution_bonne_fin_dzd = (montant * pct) / 100;
                }
            }
            
            return newData;
        });
    };

    const handlePdfInputChange = (e) => {
        const { name, value } = e.target;
        setPdfFormData(prev => ({ ...prev, [name]: value }));
    };

    // UPLOAD PDF
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Veuillez sélectionner un fichier PDF');
            return;
        }

        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('fichier', file);
        
        if (pdfFormData.date_signature) data.append('date_signature', pdfFormData.date_signature);
        if (pdfFormData.date_debut) data.append('date_debut', pdfFormData.date_debut);

        try {
            const response = await axiosInstance.post('/clm/contrats/upload/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000 // OCR : le serveur peut mettre jusqu'à 300 s (FRONTEND_API_GUIDE.md §4)
            });
            
            if (response.data.success) {
                onSuccess(`Contrat ${response.data.contrat.numero_contrat} créé avec succès`);
                handleClose();
            }
        } catch (err) {
            console.error("Erreur upload:", err);
            setError(err.response?.data?.error || "Erreur lors de l'upload du contrat");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // Validation des champs obligatoires
        const requiredFields = ['societe_b_nom', 'objet'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            setError(`Veuillez remplir les champs obligatoires: ${missingFields.join(', ')}`);
            return;
        }
        
        // Préparer les données avec les bons types
        const dataToSend = {};
        
        // Liste des champs numériques
        const numericFields = [
            'montant', 
            'delai_livraison_mois', 
            'duree_garantie_mois',
            'caution_bonne_fin_pct', 
            'caution_bonne_fin_dzd'
        ];
        
        // Liste des champs de date
        const dateFields = ['date_signature', 'date_debut'];
        
        Object.keys(formData).forEach(key => {
            let value = formData[key];
            
            // Ignorer les champs vides ou null/undefined
            if (value === '' || value === null || value === undefined) {
                return;
            }
            
            // Traitement spécial pour les champs numériques
            if (numericFields.includes(key)) {
                // Convertir en nombre
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                // Vérifier si c'est un nombre valide et non NaN
                if (!isNaN(numValue) && isFinite(numValue)) {
                    dataToSend[key] = numValue;
                }
                return;
            }
            
            // Pour les champs de date, garder comme string (YYYY-MM-DD)
            if (dateFields.includes(key)) {
                dataToSend[key] = value;
                return;
            }
            
            // Pour tous les autres champs, garder comme string
            dataToSend[key] = value;
        });

        // Ajouter le type_contrat s'il est présent
        if (formData.type_contrat) {
            dataToSend.type_contrat = formData.type_contrat;
        }

        console.log('📤 Données envoyées au backend:', JSON.stringify(dataToSend, null, 2));
        
        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('/clm/contrats/formulaire/', dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.data.success) {
                onSuccess(`Contrat ${response.data.contrat.numero_contrat} créé avec succès`);
                handleClose();
            }
        } catch (err) {
            console.error("❌ Erreur création:", err);
            console.error("📝 Détails réponse:", err.response?.data);
            
            // Afficher un message d'erreur plus précis
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.details) {
                setError(`Erreur: ${JSON.stringify(err.response.data.details)}`);
            } else {
                setError("Erreur lors de la création du contrat");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setActiveTab('upload');
        setFile(null);
        setFilePreview(null);
        setError('');
        setPdfFormData({
            date_signature: '',
            date_debut: '',
        });
        setCurrentStep(1);
        setFormData({
            numero_contrat: '',
            titre: '',
            type_contrat: 'fourniture',
            societe_b_nom: '',
            pays_partie_b: 'Algérie',
            objet: '',
            date_signature: '',
            date_debut: '',
            montant: '',
            devise: 'DZD',
            conditions_paiement: '',
            societe_a_nom: 'SONATRACH',
            societe_a_representant_nom: '',
            societe_a_representant_prenom: '',
            societe_a_representant_fonction: '',
            societe_b_siege_social: '',
            societe_b_representant_nom: '',
            societe_b_representant_prenom: '',
            societe_b_representant_fonction: '',
            notification_adresse_ligne1: '',
            fax_fournisseur: '',
            telephone_fournisseur: '',
            email_fournisseur: '',
            nom_client: '',
            prenom_client: '',
            fonction_client: '',
            nom_fournisseur: '',
            prenom_fournisseur: '',
            fonction_fournisseur: '',
            delai_livraison_mois: '',
            duree_garantie_mois: '',
            caution_bonne_fin_pct: '',
            caution_bonne_fin_dzd: '',
            tribunal_competent: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    const steps = [
        { id: 1, title: 'Général' },
        { id: 2, title: 'Parties' },
        { id: 3, title: 'Détails' },
        { id: 4, title: 'Métadonnées' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        className="w-[800px] max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-2xl"
                    >
                        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-3 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h1 className="text-xl font-semibold text-gray-800">Nouveau Contrat</h1>
                                <button 
                                    onClick={handleClose}
                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>

                            {prefill && (
                                <p className="mt-3 px-3 py-2 rounded-xl bg-orange-50 text-xs text-orange-700">
                                    ✨ Formulaire pré-rempli par l'assistant à partir de votre demande. Vérifiez chaque champ : rien n'est enregistré tant que vous n'avez pas validé.
                                </p>
                            )}

                            {/* Onglets */}
                            <div className="flex gap-6 mt-4">
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={`pb-2 text-sm font-medium transition ${
                                        activeTab === 'upload' 
                                            ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
                                            : 'text-gray-600 hover:text-[#FF8500]'
                                    }`}
                                >
                                    📄 Upload PDF
                                </button>
                                <button
                                    onClick={() => setActiveTab('manuel')}
                                    className={`pb-2 text-sm font-medium transition ${
                                        activeTab === 'manuel' 
                                            ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
                                            : 'text-gray-600 hover:text-[#FF8500]'
                                    }`}
                                >
                                    ✏️ Formulaire manuel
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Upload PDF */}
                            {activeTab === 'upload' && (
                                <form onSubmit={handleUploadSubmit} className="space-y-4">
                                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs text-blue-700">
                                                L'analyse OCR extraira automatiquement toutes les informations du contrat.
                                            </p>
                                        </div>
                                    </div>

                                    <div 
                                        className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col justify-center items-center transition hover:border-[#FF8500] cursor-pointer"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const droppedFile = e.dataTransfer.files[0];
                                            if (droppedFile && droppedFile.type === 'application/pdf') {
                                                setFile(droppedFile);
                                                setFilePreview(droppedFile.name);
                                                setError('');
                                            } else {
                                                setError('Veuillez déposer un fichier PDF valide');
                                            }
                                        }}
                                        onClick={() => document.getElementById('pdf-upload').click()}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
                                            <path d="M30 10V30M30 30V50M30 30H50M30 30H10" stroke="#FF8500" strokeWidth="4" strokeLinecap="round"/>
                                            <circle cx="30" cy="30" r="28" stroke="#FF8500" strokeWidth="4" strokeDasharray="4 4"/>
                                        </svg>
                                        
                                        <p className="text-sm text-gray-600 mt-2">
                                            Glissez votre PDF ici ou
                                        </p>
                                        
                                        <button
                                            type="button"
                                            className="mt-2 px-4 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition"
                                        >
                                            Choisir un fichier
                                        </button>

                                        <input
                                            type="file"
                                            id="pdf-upload"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {filePreview && (
                                        <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-xl border border-gray-300">
                                            <div className="flex items-center gap-2">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FF8500" strokeWidth="2"/>
                                                    <path d="M14 2V8H20" stroke="#FF8500" strokeWidth="2"/>
                                                </svg>
                                                <p className="text-xs text-gray-700 truncate max-w-[400px]">{filePreview}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleDeleteFile}
                                                className="p-1 hover:bg-gray-200 rounded-full transition"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                                    <path d="M15 5L5 15M5 5L15 15" stroke="#FF8500" strokeWidth="2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    {filePreview && (
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Date signature</label>
                                                <input
                                                    type="date"
                                                    name="date_signature"
                                                    value={pdfFormData.date_signature}
                                                    onChange={handlePdfInputChange}
                                                    className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Date début</label>
                                                <input
                                                    type="date"
                                                    name="date_debut"
                                                    value={pdfFormData.date_debut}
                                                    onChange={handlePdfInputChange}
                                                    className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-2 bg-red-50 text-red-600 text-sm rounded-xl">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3 justify-end pt-3 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!file || loading}
                                            className={`px-5 py-2 text-white text-sm font-medium rounded-xl transition flex items-center gap-2 ${
                                                file && !loading
                                                    ? 'bg-[#FF8500] hover:bg-[#e67800]' 
                                                    : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                        >
                                            {loading && (
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                </svg>
                                            )}
                                            {loading ? 'Analyse en cours...' : 'Analyser et créer'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Formulaire manuel */}
                            {activeTab === 'manuel' && (
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    {/* Steps */}
                                    <div className="flex items-center justify-between mb-6">
                                        {steps.map((step) => (
                                            <div
                                                key={step.id}
                                                className={`flex items-center gap-2 cursor-pointer ${
                                                    currentStep >= step.id ? 'text-[#FF8500]' : 'text-gray-400'
                                                }`}
                                                onClick={() => setCurrentStep(step.id)}
                                            >
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                                    ${currentStep >= step.id ? 'bg-orange-100' : 'bg-gray-100'}
                                                `}>
                                                    {step.id}
                                                </div>
                                                <span className="text-xs hidden sm:inline">{step.title}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="p-2 bg-red-50 text-red-600 text-sm rounded-xl mb-3">
                                            {error}
                                        </div>
                                    )}

                                    {/* Step 1: Général */}
                                    {currentStep === 1 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">N° contrat</label>
                                                    <input
                                                        type="text"
                                                        name="numero_contrat"
                                                        value={formData.numero_contrat}
                                                        onChange={handleInputChange}
                                                        className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                        placeholder="Auto-généré"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Titre</label>
                                                    <input
                                                        type="text"
                                                        name="titre"
                                                        value={formData.titre}
                                                        onChange={handleInputChange}
                                                        className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    Objet <span className="text-red-500">*</span>
                                                    {AI_ENABLED && (
                                                        <FieldAiButton
                                                            champ="objet"
                                                            value={formData.objet}
                                                            contrat={{ titre: formData.titre, type_contrat: formData.type_contrat, societe_b_nom: formData.societe_b_nom, pays_partie_b: formData.pays_partie_b }}
                                                            onResult={(text) => setFormData(prev => ({ ...prev, objet: text }))}
                                                        />
                                                    )}
                                                </label>
                                                <textarea
                                                    name="objet"
                                                    value={formData.objet}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                    placeholder="Description détaillée..."
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Date signature</label>
                                                    <input
                                                        type="date"
                                                        name="date_signature"
                                                        value={formData.date_signature}
                                                        onChange={handleInputChange}
                                                        className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Date début</label>
                                                    <input
                                                        type="date"
                                                        name="date_debut"
                                                        value={formData.date_debut}
                                                        onChange={handleInputChange}
                                                        className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Montant</label>
                                                    <input
                                                        type="number"
                                                        name="montant"
                                                        value={formData.montant}
                                                        onChange={handleInputChange}
                                                        className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Devise</label>
                                                    <select
                                                        name="devise"
                                                        value={formData.devise}
                                                        onChange={handleInputChange}
                                                        className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
                                                    >
                                                        <option value="DZD">DZD</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="USD">USD</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">
                                                        Conditions paiement
                                                        {AI_ENABLED && (
                                                            <FieldAiButton
                                                                champ="conditions_paiement"
                                                                court
                                                                value={formData.conditions_paiement}
                                                                contrat={{ titre: formData.titre, type_contrat: formData.type_contrat, montant: formData.montant, devise: formData.devise }}
                                                                onResult={(text) => setFormData(prev => ({ ...prev, conditions_paiement: text }))}
                                                            />
                                                        )}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="conditions_paiement"
                                                        value={formData.conditions_paiement}
                                                        onChange={handleInputChange}
                                                        className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                        placeholder="30 jours après facture"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Type contrat</label>
                                                <select
                                                    name="type_contrat"
                                                    value={formData.type_contrat}
                                                    onChange={handleInputChange}
                                                    className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
                                                >
                                                    <option value="service">Service</option>
                                                    <option value="fourniture">Fourniture</option>
                                                    <option value="travaux">Travaux</option>
                                                    <option value="partenariat">Partenariat</option>
                                                    <option value="vente">Vente</option>
                                                </select>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Parties */}
                                    {currentStep === 2 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-xl">
                                                <h3 className="font-medium text-sm text-gray-800 mb-3">Client (SONATRACH)</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Représentant Nom</label>
                                                        <input type="text" name="societe_a_representant_nom" value={formData.societe_a_representant_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Prénom</label>
                                                        <input type="text" name="societe_a_representant_prenom" value={formData.societe_a_representant_prenom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Fonction</label>
                                                        <input type="text" name="societe_a_representant_fonction" value={formData.societe_a_representant_fonction} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-xl">
                                                <h3 className="font-medium text-sm text-gray-800 mb-3">
                                                    Fournisseur <span className="text-red-500">*</span>
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Nom société *</label>
                                                        <input type="text" name="societe_b_nom" value={formData.societe_b_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Siège social</label>
                                                        <input type="text" name="societe_b_siege_social" value={formData.societe_b_siege_social} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Représentant Nom</label>
                                                        <input type="text" name="societe_b_representant_nom" value={formData.societe_b_representant_nom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Prénom</label>
                                                        <input type="text" name="societe_b_representant_prenom" value={formData.societe_b_representant_prenom} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Fonction</label>
                                                        <input type="text" name="societe_b_representant_fonction" value={formData.societe_b_representant_fonction} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Pays fournisseur</label>
                                                <input type="text" name="pays_partie_b" value={formData.pays_partie_b} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Détails */}
                                    {currentStep === 3 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-xl">
                                                <h3 className="font-medium text-sm text-gray-800 mb-3">Coordonnées</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Adresse client</label>
                                                        <input type="text" name="notification_adresse_ligne1" value={formData.notification_adresse_ligne1} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Fax</label>
                                                        <input type="text" name="fax_fournisseur" value={formData.fax_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Téléphone</label>
                                                        <input type="text" name="telephone_fournisseur" value={formData.telephone_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-xs text-gray-600 mb-1">Email</label>
                                                        <input type="email" name="email_fournisseur" value={formData.email_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-xl">
                                                <h3 className="font-medium text-sm text-gray-800 mb-3">Signataires</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-700 mb-2">Client</h4>
                                                        <input type="text" name="nom_client" placeholder="Nom" value={formData.nom_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
                                                        <input type="text" name="prenom_client" placeholder="Prénom" value={formData.prenom_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
                                                        <input type="text" name="fonction_client" placeholder="Fonction" value={formData.fonction_client} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-700 mb-2">Fournisseur</h4>
                                                        <input type="text" name="nom_fournisseur" placeholder="Nom" value={formData.nom_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
                                                        <input type="text" name="prenom_fournisseur" placeholder="Prénom" value={formData.prenom_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm mb-2" />
                                                        <input type="text" name="fonction_fournisseur" placeholder="Fonction" value={formData.fonction_fournisseur} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 4: Métadonnées */}
                                    {currentStep === 4 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Délai livraison (mois)</label>
                                                    <input type="number" name="delai_livraison_mois" value={formData.delai_livraison_mois} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Durée garantie (mois)</label>
                                                    <input type="number" name="duree_garantie_mois" value={formData.duree_garantie_mois} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Caution bonne fin (%)</label>
                                                    <input type="number" step="0.01" name="caution_bonne_fin_pct" value={formData.caution_bonne_fin_pct} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Caution bonne fin (DZD)</label>
                                                    <input type="number" name="caution_bonne_fin_dzd" value={formData.caution_bonne_fin_dzd} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-gray-600 mb-1">Tribunal compétent</label>
                                                    <input type="text" name="tribunal_competent" value={formData.tribunal_competent} onChange={handleInputChange} className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] outline-none text-sm" placeholder="Ex: Alger, Laghouat..." />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Navigation */}
                                    <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                            className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
                                        >
                                            Précédent
                                        </button>
                                        
                                        {currentStep < 4 ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                                                className="px-5 py-2 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition"
                                            >
                                                Suivant
                                            </button>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-5 py-2 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {loading && (
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                        </svg>
                                                    )}
                                                    {loading ? 'Création...' : 'Créer le contrat'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AjouterContratModal;