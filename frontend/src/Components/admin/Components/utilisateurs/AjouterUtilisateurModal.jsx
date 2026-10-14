import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AjouterUtilisateurModal = ({ isOpen, onClose, onSuccess, axiosInstance }) => {
    const [activeTab, setActiveTab] = useState('manuel');
    const [formData, setFormData] = useState({
        email: '',
        nom: '',
        prenom: '',
        matricule: '',
        telephone: '',
        adresse: '',
        sexe: '',
        date_naissance: '',
        mot_de_passe: '',
        en_brouillon: false,
        photo_profil: null
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const sexeOptions = [
        { value: 'M', label: 'Masculin' },
        { value: 'F', label: 'Féminin' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Gestion de la photo
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo_profil: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (extension !== 'xlsx' && extension !== 'xls') {
                alert('Format de fichier non supporté. Veuillez choisir un fichier Excel (.xlsx ou .xls)');
                return;
            }
            setSelectedFile(file);
            setFilePreview(file.name);
        }
    };

    const handleDeleteFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        document.getElementById('file-upload') && (document.getElementById('file-upload').value = '');
    };

    const validateForm = () => {
        const newErrors = {};
        // Seul l'email est obligatoire pour la création
        if (!formData.email && !formData.en_brouillon) newErrors.email = 'L\'email est requis';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }
        return newErrors;
    };

    const handleSubmitManuel = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        
        const formDataToSend = new FormData();
        const fields = [
            'email', 'nom', 'prenom', 'matricule', 'telephone',
            'adresse', 'sexe', 'date_naissance', 'mot_de_passe', 'en_brouillon'
        ];
        
        fields.forEach(field => {
            if (formData[field] !== null && formData[field] !== '') {
                formDataToSend.append(field, formData[field]);
            }
        });

        // Ajouter la photo si présente
        if (formData.photo_profil) {
            formDataToSend.append('photo_profil', formData.photo_profil);
        }

        if (formData.en_brouillon && !formData.mot_de_passe) {
            formDataToSend.delete('mot_de_passe');
        }

        try {
            const response = await axiosInstance.post('/auth/users/create/', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.status === 'success') {
                setGeneratedPassword(response.data.credentials?.generated_password || 'Mot de passe envoyé par email');
                setShowPasswordModal(true);
                resetForm();
                onSuccess(response.data.message);
            }
        } catch (err) {
            console.error("Erreur création:", err);
            if (err.response?.status === 500 && err.response?.data?.includes('Duplicate entry')) {
                alert("Cet email est déjà utilisé. Veuillez en choisir un autre.");
            } else {
                alert(err.response?.data?.message || "Erreur lors de la création de l'utilisateur");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setLoading(true);
        const formDataExcel = new FormData();
        formDataExcel.append('file', selectedFile);

        try {
            const response = await axiosInstance.post('/users/import/', formDataExcel, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data) {
                setShowPasswordModal(false);
                resetForm();
                onSuccess(response.data.message || 'Utilisateurs importés avec succès');
                handleClose();
            }
        } catch (err) {
            console.error("Erreur import:", err);
            alert(err.response?.data?.message || "Erreur lors de l'import des utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            ['Nom', 'Prénom', 'Email', 'Matricule', 'Téléphone', 'Adresse', 'Sexe', 'Date Naissance'],
            ['Dupont', 'Jean', 'jean.dupont@email.com', 'EMP001', '0612345678', '123 Rue Exemple', 'M', '1990-01-01']
        ];
        
        let csvContent = templateData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'template_utilisateurs.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            nom: '',
            prenom: '',
            matricule: '',
            telephone: '',
            adresse: '',
            sexe: '',
            date_naissance: '',
            mot_de_passe: '',
            en_brouillon: false,
            photo_profil: null
        });
        setPhotoPreview(null);
        setErrors({});
        setSelectedFile(null);
        setFilePreview(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
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
                            className="w-[700px] max-h-[90vh] overflow-y-auto bg-white shadow-lg p-6 font-poppins rounded-2xl scrollbar-hidden"
                        >
                            {/* En-tête */}
                            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
                                <h1 className="text-xl font-semibold text-gray-800">Ajouter Utilisateur</h1>
                                <button 
                                    onClick={handleClose}
                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Message info */}
                            {/* <div className="mb-4 p-3 bg-blue-50 rounded-[25px] border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs text-blue-700">
                                        Seul l'email est obligatoire. Les autres champs peuvent être remplis plus tard.
                                    </p>
                                </div>
                            </div> */}

                            {/* Onglets */}
                            <div className="flex gap-4 mb-4 border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('manuel')}
                                    className={`pb-2 text-sm font-medium transition ${
                                        activeTab === 'manuel' 
                                            ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
                                            : 'text-gray-600 hover:text-[#FF8500]'
                                    }`}
                                >
                                    Manuel
                                </button>
                                <button
                                    onClick={() => setActiveTab('excel')}
                                    className={`pb-2 text-sm font-medium transition ${
                                        activeTab === 'excel' 
                                            ? 'text-[#FF8500] border-b-2 border-[#FF8500]' 
                                            : 'text-gray-600 hover:text-[#FF8500]'
                                    }`}
                                >
                                    Importer Excel
                                </button>
                            </div>

                            {/* Formulaire Manuel */}
                            {activeTab === 'manuel' && (
                                <form id="formManuel" onSubmit={handleSubmitManuel} className="space-y-3">
                                    {/* Photo de profil */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Photo de profil</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-[25px] hover:bg-gray-200 transition-colors">
                                                Choisir une photo
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Ligne 1: Nom et Prénom */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Nom</label>
                                            <input
                                                type="text"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleInputChange}
                                                className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                placeholder="Nom"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Prénom</label>
                                            <input
                                                type="text"
                                                name="prenom"
                                                value={formData.prenom}
                                                onChange={handleInputChange}
                                                className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                placeholder="Prénom"
                                            />
                                        </div>
                                    </div>

                                    {/* Ligne 2: Email (obligatoire) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required={!formData.en_brouillon}
                                                className={`w-full h-9 px-3 rounded-[25px] border focus:border-[#FF8500] outline-none text-sm ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="email@exemple.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Matricule</label>
                                            <input
                                                type="text"
                                                name="matricule"
                                                value={formData.matricule}
                                                onChange={handleInputChange}
                                                className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                placeholder="EMP001"
                                            />
                                        </div>
                                    </div>

                                    {/* Ligne 3: Téléphone et Sexe */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Téléphone</label>
                                            <input
                                                type="tel"
                                                name="telephone"
                                                value={formData.telephone}
                                                onChange={handleInputChange}
                                                className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                placeholder="0612345678"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Sexe</label>
                                            <select
                                                name="sexe"
                                                value={formData.sexe}
                                                onChange={handleInputChange}
                                                className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm bg-white"
                                            >
                                                <option value="">Sélectionner</option>
                                                {sexeOptions.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Ligne 4: Date naissance et Adresse */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Date naissance</label>
                                            <input
                                                type="date"
                                                name="date_naissance"
                                                value={formData.date_naissance}
                                                onChange={handleInputChange}
                                                className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Adresse</label>
                                            <input
                                                type="text"
                                                name="adresse"
                                                value={formData.adresse}
                                                onChange={handleInputChange}
                                                className="w-full h-9 px-3 rounded-[25px] border border-gray-300 focus:border-[#FF8500] outline-none text-sm"
                                                placeholder="Adresse complète"
                                            />
                                        </div>
                                    </div>

                                    {/* Checkbox Brouillon */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            name="en_brouillon"
                                            id="en_brouillon"
                                            checked={formData.en_brouillon}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 accent-[#FF8500]"
                                        />
                                        <label htmlFor="en_brouillon" className="text-sm text-gray-700">
                                            Mettre en brouillon (créer sans envoyer d'email)
                                        </label>
                                    </div>
                                </form>
                            )}

                            {/* Formulaire Import Excel */}
                            {activeTab === 'excel' && (
                                <form id="formExcel" onSubmit={handleFileUpload} className="space-y-4">
                                    <div 
                                        className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-[25px] flex flex-col justify-center items-center transition hover:border-[#FF8500]"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const file = e.dataTransfer.files[0];
                                            if (file) {
                                                const extension = file.name.split('.').pop().toLowerCase();
                                                if (extension === 'xlsx' || extension === 'xls') {
                                                    setSelectedFile(file);
                                                    setFilePreview(file.name);
                                                } else {
                                                    alert('Format de fichier non supporté');
                                                }
                                            }
                                        }}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
                                            <path d="M30 10V30M30 30V50M30 30H50M30 30H10" stroke="#FF8500" strokeWidth="4" strokeLinecap="round"/>
                                            <circle cx="30" cy="30" r="28" stroke="#FF8500" strokeWidth="4" strokeDasharray="4 4"/>
                                        </svg>
                                        
                                        <p className="text-sm text-gray-600 mt-2">
                                            Glissez votre fichier Excel ici ou
                                        </p>
                                        
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('file-upload').click()}
                                            className="mt-2 px-4 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-[25px] hover:bg-[#e67800] transition"
                                        >
                                            Choisir un fichier
                                        </button>

                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Prévisualisation fichier */}
                                    {selectedFile && (
                                        <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-[25px] border border-gray-300">
                                            <div className="flex items-center gap-2">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FF8500" strokeWidth="2"/>
                                                    <path d="M14 2V8H20" stroke="#FF8500" strokeWidth="2"/>
                                                </svg>
                                                <p className="text-xs text-gray-700 truncate max-w-[250px]">{filePreview}</p>
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

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleDownloadTemplate}
                                            className="text-[#FF8500] hover:text-[#e67800] text-xs font-medium underline"
                                        >
                                            Télécharger le modèle Excel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Boutons d'action */}
                            <div className="flex gap-3 justify-end mt-4 pt-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-[25px] hover:bg-gray-300 transition disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Annuler
                                </button>
                                
                                {activeTab === 'manuel' ? (
                                    <button
                                        type="submit"
                                        form="formManuel"
                                        disabled={loading}
                                        className="px-5 py-1.5 bg-[#FF8500] text-white text-sm font-medium rounded-[25px] hover:bg-[#e67800] transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading && (
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                        )}
                                        {loading ? 'Ajout...' : 'Ajouter'}
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        form="formExcel"
                                        disabled={!selectedFile || loading}
                                        className={`px-5 py-1.5 text-white text-sm font-medium rounded-[25px] transition flex items-center gap-2 ${
                                            selectedFile && !loading
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
                                        {loading ? 'Import...' : 'Importer'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal mot de passe */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Utilisateur créé avec succès !</h3>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Mot de passe temporaire :</p>
                                    <code className="text-lg font-mono font-bold text-[#FF8500] bg-white px-4 py-2 rounded-lg border">
                                        {generatedPassword}
                                    </code>
                                    <p className="text-xs text-gray-500 mt-3">
                                        ⚠️ Ce mot de passe sera affiché une seule fois. Veuillez le communiquer à l'utilisateur.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        handleClose();
                                    }}
                                    className="w-full px-4 py-2.5 bg-[#FF8500] text-white rounded-xl font-medium hover:bg-[#e67800] transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Styles pour scrollbar invisible */}
            <style jsx>{`
                .scrollbar-hidden {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                .scrollbar-hidden::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
            `}</style>
        </>
    );
};

export default AjouterUtilisateurModal;