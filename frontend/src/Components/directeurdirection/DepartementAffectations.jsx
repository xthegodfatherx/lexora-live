// DepartementAffectations.jsx - Version corrigée avec la route Express
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../../axios';
import { ReactComponent as SearchIcon } from '../../Assets/Icons/Search.svg';
import { ReactComponent as EditIcon } from '../../Assets/Icons/edit.svg';
import { ReactComponent as TrashIcon } from '../../Assets/Icons/Delete.svg';
import { ReactComponent as RefreshIcon } from '../../Assets/Icons/edit.svg';

const DepartementAffectations = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // États pour les responsables département
    const [responsables, setResponsables] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [directionInfo, setDirectionInfo] = useState(null);
    
    // États pour les modals
    const [showAffecterModal, setShowAffecterModal] = useState(false);
    const [showReaffecterModal, setShowReaffecterModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDepartementId, setSelectedDepartementId] = useState('');
    const [updating, setUpdating] = useState(false);
    
    // Récupérer les infos depuis localStorage
    const userRole = localStorage.getItem('role');
    const userDirectionId = localStorage.getItem('direction_id');
    const isDirecteurDirection = userRole === 'directeur_direction';
    const ORANGE_COLOR = '#FF8500';

    // Configuration des endpoints
    const endpoints = {
        listNonAffectes: '/affectation/users/responsables-departement/',
        listAffectes: '/affectation/users/responsables-departement/affectes/',
        assign: '/affectation/assign-departement/',
        reassign: '/affectation/reassign-departement/',
        remove: (userId) => `/affectation/users/${userId}/remove-departement/`,
        // 🔥 Utilisation de la route Express avec le paramètre directionId
        departementsByDirection: (directionId) => `/juridique/departements/direction/${directionId}`,
        departementsAll: '/juridique/departements/',
    };

    // Fonction utilitaire pour extraire les données
    const extractResponsablesFromResponse = (response) => {
        if (!response?.data) return [];
        
        if (response.data.data?.directeurs) return response.data.data.directeurs;
        if (response.data.data?.responsables) return response.data.data.responsables;
        if (response.data.users) return response.data.users;
        if (response.data.data?.users) return response.data.data.users;
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.data.data)) return response.data.data;
        
        return [];
    };

    const extractDepartementsFromResponse = (response) => {
        if (!response?.data) return [];
        
        // Format de réponse attendu de Express: { status: "success", data: [...] }
        if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        // Format: { status: "success", data: { departements: [...] } }
        if (response.data.data?.departements && Array.isArray(response.data.data.departements)) {
            return response.data.data.departements;
        }
        // Format direct: tableau
        if (Array.isArray(response.data)) {
            return response.data;
        }
        
        console.warn("Format départements non reconnu:", response.data);
        return [];
    };

    // Charger les données
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            await Promise.all([
                fetchResponsables(),
                fetchDepartements(),
                fetchDirectionInfo()
            ]);
        } catch (err) {
            console.error("Erreur chargement données:", err);
            setError("Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les responsables département
    const fetchResponsables = async () => {
        try {
            const [nonAffectesRes, affectesRes] = await Promise.all([
                axiosInstance.get(endpoints.listNonAffectes),
                axiosInstance.get(endpoints.listAffectes)
            ]);
            
            const nonAffectes = extractResponsablesFromResponse(nonAffectesRes);
            const affectes = extractResponsablesFromResponse(affectesRes);
            
            const affectesMap = new Map(affectes.map(u => [u.id, u.departement_id]));
            const allUsers = [...nonAffectes, ...affectes];
            
            setResponsables(allUsers.map(user => ({
                ...user,
                departement_id: affectesMap.get(user.id) || user.departement_id || null
            })));
            
            console.log(`✅ Responsables département chargés: ${allUsers.length}`);
        } catch (err) {
            console.error("Erreur chargement responsables:", err);
            setResponsables([]);
        }
    };

    // 🔥 Récupérer les départements - Version corrigée pour Express
    const fetchDepartements = async () => {
        try {
            let response;
            
            if (isDirecteurDirection && userDirectionId) {
                // Utiliser la route filtrée par direction
                console.log(`📌 Filtrage des départements par direction: ${userDirectionId}`);
                response = await axiosInstance.get(endpoints.departementsByDirection(userDirectionId));
            } else {
                // Admin: récupérer tous les départements
                response = await axiosInstance.get(endpoints.departementsAll);
            }
            
            const departementsData = extractDepartementsFromResponse(response);
            setDepartements(departementsData);
            console.log(`✅ Départements chargés: ${departementsData.length}`);
            
            // Afficher les départements pour debug
            if (departementsData.length > 0) {
                console.log("Départements:", departementsData.map(d => ({ id: d._id, nom: d.nom, direction: d.direction_id })));
            }
        } catch (err) {
            console.error("Erreur chargement départements:", err);
            setDepartements([]);
        }
    };

    // Récupérer les informations de la direction
    const fetchDirectionInfo = async () => {
        try {
            if (isDirecteurDirection && userDirectionId) {
                const response = await axiosInstance.get(`/juridique/directions/${userDirectionId}`);
                setDirectionInfo(response.data.data || response.data);
                console.log("✅ Direction info:", response.data);
            }
        } catch (err) {
            console.error("Erreur chargement direction:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccess(true);
        fetchData();
        setTimeout(() => setShowSuccess(false), 3000);
    };

    // Assignation d'un département
    const handleAssign = async () => {
        if (!selectedUser || !selectedDepartementId) return;
        
        setUpdating(true);
        try {
            const payload = {
                user_id: selectedUser.id,
                departement_id: selectedDepartementId
            };
            
            console.log("📤 Assign payload:", payload);
            
            const response = await axiosInstance.patch(endpoints.assign, payload);
            
            if (response.data.status === 'success') {
                setShowAffecterModal(false);
                setSelectedUser(null);
                setSelectedDepartementId('');
                handleSuccess(response.data.message || `Département affecté à ${selectedUser.nom_complet}`);
            }
        } catch (err) {
            console.error("Erreur assignation:", err);
            const errorMsg = err.response?.data?.message || err.response?.data?.code || "Erreur lors de l'affectation";
            alert(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    // Réassignation
    const handleReassign = async () => {
        if (!selectedUser || !selectedDepartementId) return;
        
        setUpdating(true);
        try {
            const payload = {
                user_id: selectedUser.id,
                departement_id: selectedDepartementId
            };
            
            const response = await axiosInstance.put(endpoints.reassign, payload);
            
            if (response.data.status === 'success') {
                setShowReaffecterModal(false);
                setSelectedUser(null);
                setSelectedDepartementId('');
                handleSuccess(response.data.message || `Département réaffecté à ${selectedUser.nom_complet}`);
            }
        } catch (err) {
            console.error("Erreur réassignation:", err);
            const errorMsg = err.response?.data?.message || err.response?.data?.code || "Erreur lors de la réaffectation";
            alert(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    // Suppression d'affectation
    const handleRemove = async () => {
        if (!selectedUser) return;
        
        setUpdating(true);
        try {
            const response = await axiosInstance.delete(endpoints.remove(selectedUser.id));
            
            if (response.data.status === 'success') {
                setShowRemoveModal(false);
                setSelectedUser(null);
                handleSuccess(response.data.message || `Affectation supprimée pour ${selectedUser.nom_complet}`);
            }
        } catch (err) {
            console.error("Erreur suppression:", err);
            const errorMsg = err.response?.data?.message || "Erreur lors de la suppression";
            alert(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    const openAssignModal = (user) => {
        setSelectedUser(user);
        setSelectedDepartementId('');
        setShowAffecterModal(true);
    };

    const openReassignModal = (user) => {
        setSelectedUser(user);
        setSelectedDepartementId(user.departement_id || '');
        setShowReaffecterModal(true);
    };

    const openRemoveModal = (user) => {
        setSelectedUser(user);
        setShowRemoveModal(true);
    };

    const getDepartementName = (departementId) => {
        if (!departementId) return 'Non affecté';
        const departement = departements.find(d => 
            String(d._id || d.id) === String(departementId)
        );
        return departement?.nom || departement?.code || departementId;
    };

    // Filtrer les utilisateurs
    const filteredResponsables = responsables.filter(user => 
        user.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: "spring", stiffness: 200, damping: 20 } }
    };

    const contentVariants = {
        hidden: { opacity: 0, x: -30, scale: 0.98 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, x: 30, scale: 0.98, transition: { duration: 0.3 } }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.3 } })
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } },
        exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95"
            >
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Gestion des Départements
                                {directionInfo && (
                                    <span className="text-sm font-normal text-gray-500 ml-3">
                                        Direction: {directionInfo.nom}
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {isDirecteurDirection 
                                    ? "Affectez les départements de votre direction aux responsables département"
                                    : "Gérez les affectations des départements aux responsables département"}
                            </p>
                        </div>
                        
                        {loading && (
                            <motion.div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#FF8500] rounded-full animate-pulse" />
                                <span className="text-sm text-gray-500">Chargement...</span>
                            </motion.div>
                        )}
                    </div>
                    
                    {error && (
                        <motion.div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <div className="p-8">
                {/* Carte d'information */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FF8500]/10 text-[#FF8500]">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                    <path d="M17 21v-4H7v4" />
                                    <path d="M7 3v4h10V3" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Responsables Département</h2>
                                <p className="text-sm text-gray-500">
                                    Total: {responsables.length} responsable(s)
                                    {departements.length > 0 && ` - ${departements.length} département(s) disponible(s)`}
                                </p>
                                {isDirecteurDirection && userDirectionId && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        ID Direction: {userDirectionId}
                                    </p>
                                )}
                            </div>
                        </div>
                        {isDirecteurDirection && (
                            <div className="px-4 py-2 bg-green-50 rounded-xl">
                                <span className="text-sm text-green-600">✓ Vous avez accès aux départements de votre direction</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Barre de recherche */}
                <div className="mb-6">
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF8500] focus:outline-none transition-all bg-white"
                        />
                    </div>
                </div>

                {/* Tableau des responsables */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key="departement-table"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                        <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#FF8500]/10 text-[#FF8500]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Liste des Responsables Département</h2>
                                    <p className="text-sm text-gray-500">
                                        Affectez un département à chaque responsable
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-[#F9F9F9] to-[#F0F0F0] border-b border-[#E4E4E4]">
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-[#4A4A4A] rounded-l-lg w-[30%]">Utilisateur</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-[#4A4A4A] w-[25%]">Email</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-[#4A4A4A] w-[25%]">Département affecté</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-[#4A4A4A] rounded-r-lg w-[20%]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="py-12 text-center">
                                                    <div className="flex justify-center">
                                                        <div className="w-8 h-8 border-3 border-[#FF8500] border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">Chargement...</p>
                                                </td>
                                            </tr>
                                        ) : filteredResponsables.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-12 text-center">
                                                    <div className="text-center">
                                                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <p className="text-gray-500">Aucun responsable département trouvé</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <AnimatePresence>
                                                {filteredResponsables.map((user, index) => {
                                                    const hasDepartement = !!user.departement_id;
                                                    return (
                                                        <motion.tr 
                                                            key={user.id}
                                                            custom={index}
                                                            variants={tableRowVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            className="border-b border-gray-100 hover:bg-[#FFF9F0] transition-colors duration-150"
                                                        >
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center gap-3">
                                                                    {user.photo_profil ? (
                                                                        <img src={user.photo_profil} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-[#FF8500]/10 flex items-center justify-center text-[#FF8500] font-medium text-sm">
                                                                            {user.nom_complet?.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="font-medium text-gray-800 text-sm">{user.nom_complet}</div>
                                                                        <div className="text-xs text-gray-400">ID: {user.id}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="text-sm text-gray-600">{user.email}</div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                                                    hasDepartement 
                                                                        ? 'bg-green-100 text-green-700' 
                                                                        : 'bg-gray-100 text-gray-500'
                                                                }`}>
                                                                    {getDepartementName(user.departement_id)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex gap-2">
                                                                    {!hasDepartement ? (
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                            onClick={() => openAssignModal(user)}
                                                                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 bg-[#FF8500] text-white hover:bg-[#e67800]"
                                                                        >
                                                                            <EditIcon className="w-3 h-3" />
                                                                            Affecter
                                                                        </motion.button>
                                                                    ) : (
                                                                        <>
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.02 }}
                                                                                whileTap={{ scale: 0.98 }}
                                                                                onClick={() => openReassignModal(user)}
                                                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 bg-[#FF8500]/10 text-[#FF8500] hover:bg-[#FF8500] hover:text-white"
                                                                            >
                                                                                <RefreshIcon className="w-3 h-3" />
                                                                                Modifier
                                                                            </motion.button>
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.02 }}
                                                                                whileTap={{ scale: 0.98 }}
                                                                                onClick={() => openRemoveModal(user)}
                                                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                                                            >
                                                                                <TrashIcon className="w-3 h-3" />
                                                                                Supprimer
                                                                            </motion.button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Modal d'affectation */}
            <AnimatePresence>
                {showAffecterModal && selectedUser && (
                    <motion.div 
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={(e) => e.target === e.currentTarget && setShowAffecterModal(false)}
                    >
                        <div className="w-[550px] bg-white shadow-lg p-6 rounded-2xl">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                <h1 className="text-lg font-semibold text-gray-800">
                                    Affecter un département
                                </h1>
                                <button 
                                    onClick={() => {
                                        setShowAffecterModal(false);
                                        setSelectedUser(null);
                                        setSelectedDepartementId('');
                                    }} 
                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#FF8500]/20 flex items-center justify-center text-[#FF8500] font-medium">
                                        {selectedUser.nom_complet?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{selectedUser.nom_complet}</p>
                                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleAssign(); }} className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                        Département à affecter <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedDepartementId}
                                        onChange={(e) => setSelectedDepartementId(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] focus:ring-1 focus:ring-[#FF8500] outline-none bg-white text-left"
                                    >
                                        <option value="">-- Sélectionner un département --</option>
                                        {departements.map(dep => (
                                            <option key={dep._id || dep.id} value={dep._id || dep.id}>
                                                {dep.nom} {dep.code && `(${dep.code})`}
                                            </option>
                                        ))}
                                    </select>
                                    {departements.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {isDirecteurDirection 
                                                ? "Aucun département disponible dans votre direction"
                                                : "Aucun département disponible"}
                                        </p>
                                    )}
                                </div>

                                {isDirecteurDirection && userDirectionId && (
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500">
                                             Vous ne pouvez affecter que les départements de votre direction (ID: {userDirectionId})
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAffecterModal(false);
                                            setSelectedUser(null);
                                            setSelectedDepartementId('');
                                        }}
                                        className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating || !selectedDepartementId || departements.length === 0}
                                        className="px-5 py-2 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {updating && (
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                        )}
                                        {updating ? 'Affectation...' : 'Affecter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de réaffectation */}
            <AnimatePresence>
                {showReaffecterModal && selectedUser && (
                    <motion.div 
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={(e) => e.target === e.currentTarget && setShowReaffecterModal(false)}
                    >
                        <div className="w-[550px] bg-white shadow-lg p-6 rounded-2xl">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                <h1 className="text-lg font-semibold text-gray-800">
                                    Modifier l'affectation
                                </h1>
                                <button 
                                    onClick={() => {
                                        setShowReaffecterModal(false);
                                        setSelectedUser(null);
                                        setSelectedDepartementId('');
                                    }} 
                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#FF8500]/20 flex items-center justify-center text-[#FF8500] font-medium">
                                        {selectedUser.nom_complet?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{selectedUser.nom_complet}</p>
                                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                <p className="text-sm text-yellow-700">
                                    Département actuel: <strong>{getDepartementName(selectedUser.departement_id)}</strong>
                                </p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleReassign(); }} className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                        Nouveau département <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedDepartementId}
                                        onChange={(e) => setSelectedDepartementId(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] focus:ring-1 focus:ring-[#FF8500] outline-none bg-white text-left"
                                    >
                                        <option value="">-- Sélectionner un département --</option>
                                        {departements.map(dep => (
                                            <option key={dep._id || dep.id} value={dep._id || dep.id}>
                                                {dep.nom} {dep.code && `(${dep.code})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReaffecterModal(false);
                                            setSelectedUser(null);
                                            setSelectedDepartementId('');
                                        }}
                                        className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating || !selectedDepartementId}
                                        className="px-5 py-2 bg-[#FF8500] text-white text-sm font-medium rounded-xl hover:bg-[#e67800] transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {updating && (
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                        )}
                                        {updating ? 'Modification...' : 'Modifier'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de suppression */}
            <AnimatePresence>
                {showRemoveModal && selectedUser && (
                    <motion.div 
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={(e) => e.target === e.currentTarget && setShowRemoveModal(false)}
                    >
                        <div className="w-[450px] bg-white shadow-lg p-6 rounded-2xl">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                <h1 className="text-lg font-semibold text-gray-800">
                                    Supprimer l'affectation
                                </h1>
                                <button 
                                    onClick={() => {
                                        setShowRemoveModal(false);
                                        setSelectedUser(null);
                                    }} 
                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-6 text-center">
                                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <TrashIcon className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Confirmer la suppression
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Êtes-vous sûr de vouloir supprimer l'affectation de <strong>{selectedUser.nom_complet}</strong> ?
                                </p>
                                <p className="text-sm text-gray-400">
                                    Département actuel: <strong>{getDepartementName(selectedUser.departement_id)}</strong>
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRemoveModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    disabled={updating}
                                    className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {updating && (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                    )}
                                    {updating ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message succès */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-lg shadow-xl z-50 text-sm"
                    >
                        ✅ {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DepartementAffectations;