// AffectationVicePresident.jsx - Version avec le même design que Affectations.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { axiosInstance } from '../../../../axios';
import { ReactComponent as SearchIcon } from '../../../../Assets/Icons/Search.svg';
import { ReactComponent as EditIcon } from '../../../../Assets/Icons/edit.svg';
import { ReactComponent as TrashIcon } from '../../../../Assets/Icons/Delete.svg';
import { ReactComponent as RefreshIcon } from '../../../../Assets/Icons/edit.svg';

const AffectationVicePresident = () => {
    const [activeSection, setActiveSection] = useState('direction_activite');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // États pour Direction Activité
    const [directeursDirection, setDirecteursDirection] = useState([]);
    const [directionsActivite, setDirectionsActivite] = useState([]);
    
    // États pour Division Activité
    const [directeursDivision, setDirecteursDivision] = useState([]);
    const [divisionsActivite, setDivisionsActivite] = useState([]);
    
    // États pour les modals
    const [showAffecterModal, setShowAffecterModal] = useState(false);
    const [showReaffecterModal, setShowReaffecterModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [updating, setUpdating] = useState(false);
    const [currentAction, setCurrentAction] = useState('');

    // Récupérer les infos depuis localStorage
    const userRole = localStorage.getItem('role');
    const vicePresidentActiviteId = localStorage.getItem('activite_id');
    
    // Récupérer les infos de l'activité
    let activiteInfo = null;
    try {
        const activiteDetail = localStorage.getItem('activite_detail');
        if (activiteDetail) {
            activiteInfo = JSON.parse(activiteDetail);
        }
    } catch (e) {
        console.error('Erreur parsing activite_detail:', e);
    }
    
    const ORANGE_COLOR = '#FF8500';
    const ORANGE_GRADIENT = 'from-orange-500 to-amber-500';

    // 🔥 Fonction pour extraire les directeurs de la réponse API
    const extractDirecteursFromResponse = (response) => {
        if (!response?.data) return [];
        
        // Format: { status: "success", data: [...] }
        if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        
        // Format: { status: "success", data: { directeurs: [...] } }
        if (response.data.data?.directeurs && Array.isArray(response.data.data.directeurs)) {
            return response.data.data.directeurs;
        }
        
        // Format alternatif: { status: "success", users: [...] }
        if (response.data.users && Array.isArray(response.data.users)) {
            return response.data.users;
        }
        
        // Format alternatif: tableau direct
        if (Array.isArray(response.data)) {
            return response.data;
        }
        
        console.warn("Format non reconnu:", response.data);
        return [];
    };

    // 🔥 Fonction pour extraire les items (directions/divisions activité)
    const extractItemsFromResponse = (response) => {
        if (!response?.data) return [];
        
        // Si la réponse a une structure data.data (tableau)
        if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        
        // Format avec directions_activite ou divisions_activite
        if (response.data.data?.directions_activite) {
            return response.data.data.directions_activite;
        }
        if (response.data.data?.divisions_activite) {
            return response.data.data.divisions_activite;
        }
        
        // Si la réponse est directement un tableau
        if (Array.isArray(response.data)) {
            return response.data;
        }
        
        return [];
    };

    // Configuration des sections
    const sections = {
        direction_activite: {
            title: 'Direction Activité',
            description: 'Affectation des directions activité aux directeurs direction activité',
            role: 'directeur_direction_activite',
            users: directeursDirection,
            items: directionsActivite,
            itemLabel: 'Direction Activité',
            itemLabelLower: 'direction activité',
            endpoints: {
                listNonAffectes: '/affectation/users/directeurs-direction-activite/',
                listAffectes: '/affectation/users/directeurs-direction-activite/affectes/',
                assign: '/affectation/assign-direction-activite/',
                reassign: '/affectation/reassign-direction-activite/',
                remove: (userId) => `/affectation/users/${userId}/remove-direction-activite/`,
                items: vicePresidentActiviteId 
                    ? `/juridique/direction_activite/?activite=${vicePresidentActiviteId}`
                    : '/juridique/direction_activite/'
            },
            getUserItemId: (user) => user.direction_activite_id,
            getItemName: (item) => item.nom || item.libelle,
            getItemId: (item) => item._id || item.id,
            filterByActivite: true
        },
        division_activite: {
            title: 'Division Activité',
            description: 'Affectation des divisions activité aux directeurs division activité',
            role: 'directeur_division_activite',
            users: directeursDivision,
            items: divisionsActivite,
            itemLabel: 'Division Activité',
            itemLabelLower: 'division activité',
            endpoints: {
                listNonAffectes: '/affectation/users/directeurs-division-activite/',
                listAffectes: '/affectation/users/directeurs-division-activite/affectes/',
                assign: '/affectation/assign-division-activite/',
                reassign: '/affectation/reassign-division-activite/',
                remove: (userId) => `/affectation/users/${userId}/remove-division-activite/`,
                items: vicePresidentActiviteId 
                    ? `/juridique/division/?activite=${vicePresidentActiviteId}`
                    : '/juridique/division/'
            },
            getUserItemId: (user) => user.division_activite_id,
            getItemName: (item) => item.nom || item.libelle,
            getItemId: (item) => item._id || item.id,
            filterByActivite: true
        }
    };

    const currentSection = sections[activeSection];

    // Charger les données initiales
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            await Promise.all([
                fetchDirecteursDirectionActivite(),
                fetchDirectionsActivite(),
                fetchDirecteursDivisionActivite(),
                fetchDivisionsActivite()
            ]);
        } catch (err) {
            console.error("Erreur chargement données:", err);
            setError("Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Direction Activité
    const fetchDirecteursDirectionActivite = async () => {
        try {
            const [nonAffectesRes, affectesRes] = await Promise.all([
                axiosInstance.get('/affectation/users/directeurs-direction-activite/'),
                axiosInstance.get('/affectation/users/directeurs-direction-activite/affectes/')
            ]);
            
            let nonAffectes = extractDirecteursFromResponse(nonAffectesRes);
            let affectes = extractDirecteursFromResponse(affectesRes);
            
            // Filtrer par activité du VP
            if (vicePresidentActiviteId) {
                nonAffectes = nonAffectes.filter(d => d.activite_id === vicePresidentActiviteId);
                affectes = affectes.filter(d => d.activite_id === vicePresidentActiviteId);
            }
            
            const affectesMap = new Map(affectes.map(u => [u.id, u.direction_activite_id]));
            const allUsers = [...nonAffectes, ...affectes];
            
            setDirecteursDirection(allUsers.map(user => ({
                ...user,
                direction_activite_id: affectesMap.get(user.id) || user.direction_activite_id || null
            })));
            
            console.log(`✅ Directeurs direction activité chargés: ${allUsers.length}`);
            console.log(`   - Non affectés: ${nonAffectes.length}, Affectés: ${affectes.length}`);
        } catch (err) {
            console.error("❌ Erreur chargement directeurs direction activité:", err);
            setDirecteursDirection([]);
        }
    };

    const fetchDirectionsActivite = async () => {
        try {
            const url = sections.direction_activite.endpoints.items;
            console.log(`📌 Chargement directions activité depuis: ${url}`);
            
            const response = await axiosInstance.get(url);
            const items = extractItemsFromResponse(response);
            setDirectionsActivite(items);
            console.log(`✅ Directions activité chargées: ${items.length}`);
        } catch (err) {
            console.error("❌ Erreur chargement directions activité:", err);
            setDirectionsActivite([]);
        }
    };

    // 🔥 Division Activité
    const fetchDirecteursDivisionActivite = async () => {
        try {
            const [nonAffectesRes, affectesRes] = await Promise.all([
                axiosInstance.get('/affectation/users/directeurs-division-activite/'),
                axiosInstance.get('/affectation/users/directeurs-division-activite/affectes/')
            ]);
            
            let nonAffectes = extractDirecteursFromResponse(nonAffectesRes);
            let affectes = extractDirecteursFromResponse(affectesRes);
            
            // Filtrer par activité du VP
            if (vicePresidentActiviteId) {
                nonAffectes = nonAffectes.filter(d => d.activite_id === vicePresidentActiviteId);
                affectes = affectes.filter(d => d.activite_id === vicePresidentActiviteId);
            }
            
            const affectesMap = new Map(affectes.map(u => [u.id, u.division_activite_id]));
            const allUsers = [...nonAffectes, ...affectes];
            
            setDirecteursDivision(allUsers.map(user => ({
                ...user,
                division_activite_id: affectesMap.get(user.id) || user.division_activite_id || null
            })));
            
            console.log(`✅ Directeurs division activité chargés: ${allUsers.length}`);
            console.log(`   - Non affectés: ${nonAffectes.length}, Affectés: ${affectes.length}`);
        } catch (err) {
            console.error("❌ Erreur chargement directeurs division activité:", err);
            setDirecteursDivision([]);
        }
    };

    const fetchDivisionsActivite = async () => {
        try {
            const url = sections.division_activite.endpoints.items;
            console.log(`📌 Chargement divisions activité depuis: ${url}`);
            
            const response = await axiosInstance.get(url);
            const items = extractItemsFromResponse(response);
            setDivisionsActivite(items);
            console.log(`✅ Divisions activité chargées: ${items.length}`);
        } catch (err) {
            console.error("❌ Erreur chargement divisions activité:", err);
            setDivisionsActivite([]);
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

    // Assignation
    const handleAssign = async () => {
        if (!selectedUser || !selectedItemId) return;
        
        setUpdating(true);
        try {
            const payload = {
                user_id: selectedUser.id,
                [`${activeSection === 'direction_activite' ? 'direction_activite_id' : 'division_activite_id'}`]: selectedItemId
            };
            
            console.log("📤 Assign payload:", payload);
            
            const response = await axiosInstance.patch(
                currentSection.endpoints.assign,
                payload
            );
            
            if (response.data.status === 'success') {
                setShowAffecterModal(false);
                setSelectedUser(null);
                setSelectedItemId('');
                handleSuccess(response.data.message || `${currentSection.itemLabel} affectée à ${selectedUser.nom_complet}`);
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
        if (!selectedUser || !selectedItemId) return;
        
        setUpdating(true);
        try {
            const payload = {
                user_id: selectedUser.id,
                [`${activeSection === 'direction_activite' ? 'direction_activite_id' : 'division_activite_id'}`]: selectedItemId
            };
            
            console.log("📤 Reassign payload:", payload);
            
            const response = await axiosInstance.patch(
                currentSection.endpoints.reassign,
                payload
            );
            
            if (response.data.status === 'success') {
                setShowReaffecterModal(false);
                setSelectedUser(null);
                setSelectedItemId('');
                handleSuccess(response.data.message || `${currentSection.itemLabel} réaffectée à ${selectedUser.nom_complet}`);
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
            const response = await axiosInstance.delete(
                currentSection.endpoints.remove(selectedUser.id)
            );
            
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
        setSelectedItemId('');
        setCurrentAction('assign');
        setShowAffecterModal(true);
    };

    const openReassignModal = (user) => {
        setSelectedUser(user);
        setSelectedItemId(currentSection.getUserItemId(user) || '');
        setCurrentAction('reassign');
        setShowReaffecterModal(true);
    };

    const openRemoveModal = (user) => {
        setSelectedUser(user);
        setShowRemoveModal(true);
    };

    const getItemName = (itemId) => {
        if (!itemId) return 'Non affecté';
        const item = currentSection.items.find(i => 
            String(currentSection.getItemId(i)) === String(itemId)
        );
        return item ? currentSection.getItemName(item) : itemId;
    };

    // Filtrer les utilisateurs
    const filteredUsers = currentSection.users.filter(user => 
        user.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cartes pour les onglets
    const cards = [
        {
            id: 'direction_activite',
            title: 'Direction Activité',
            description: 'Affectation des directions activité aux directeurs',
            count: directeursDirection.length,
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-6 9 6v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path d="M9 22V12h6v10" />
                    <path d="M12 3v3" />
                    <path d="M7 7l2 2" />
                    <path d="M17 7l-2 2" />
                </svg>
            )
        },
        {
            id: 'division_activite',
            title: 'Division Activité',
            description: 'Affectation des divisions activité aux directeurs',
            count: directeursDivision.length,
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <path d="M17 21v-4H7v4" />
                    <path d="M7 3v4h10V3" />
                    <path d="M4 12h16" />
                    <path d="M12 8v8" />
                </svg>
            )
        }
    ];

    // Animations
    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 200, damping: 20 }
        }),
        hover: { y: -10, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 15 } }
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

    // Nombre total d'items par section
    const getItemsCount = (sectionId) => {
        if (sectionId === 'direction_activite') return directionsActivite.length;
        return divisionsActivite.length;
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
                                Affectations - Vice Président
                                {activiteInfo && (
                                    <span className="text-sm font-normal text-gray-500 ml-3">
                                        Activité: {activiteInfo.nom}
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Gérez les affectations des directions et divisions d'activité
                            </p>
                            {vicePresidentActiviteId && (
                                <p className="text-xs text-gray-400 mt-1">
                                    ID Activité: {vicePresidentActiviteId} 
                                </p>
                            )}
                        </div>
                        
                        {loading && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-2 h-2 bg-[#FF8500] rounded-full animate-pulse" />
                                <span className="text-sm text-gray-500">Chargement...</span>
                            </motion.div>
                        )}
                    </div>
                    
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                        >
                            {error}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <div className="p-8">
                {/* Cartes des sections */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10"
                >
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            onClick={() => setActiveSection(card.id)}
                            className={`
                                relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer
                                transition-shadow duration-300
                                ${activeSection === card.id ? 'shadow-2xl ring-2 ring-[#FF8500]' : 'hover:shadow-xl'}
                            `}
                        >
                            <div className="relative p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <motion.div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                        style={{
                                            background: activeSection === card.id ? `${ORANGE_COLOR}20` : `${ORANGE_COLOR}10`,
                                            color: ORANGE_COLOR
                                        }}
                                    >
                                        {card.icon}
                                    </motion.div>
                                    
                                    {loading ? (
                                        <div className="w-12 h-8 bg-gray-200 rounded-lg animate-pulse" />
                                    ) : (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: index * 0.1 }}
                                            className="text-right"
                                        >
                                            <span className="text-3xl font-bold" style={{ color: ORANGE_COLOR }}>
                                                {card.count}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {getItemsCount(card.id)} {card.id === 'direction_activite' ? 'directions' : 'divisions'}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 text-left">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 text-left leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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

                {/* Contenu actif */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                        <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="p-2 rounded-xl"
                                    style={{ background: `${ORANGE_COLOR}10`, color: ORANGE_COLOR }}
                                >
                                    {cards.find(c => c.id === activeSection)?.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {currentSection.title} - {currentSection.itemLabel}s
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {currentSection.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-[#F9F9F9] to-[#F0F0F0] border-b border-[#E4E4E4]">
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-[#4A4A4A] rounded-l-lg w-[35%]">Utilisateur</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-[#4A4A4A] w-[30%]">Email</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-[#4A4A4A] w-[20%]">{currentSection.itemLabel} affectée</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-[#4A4A4A] rounded-r-lg w-[15%]">Actions</th>
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
                                        ) : filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-12 text-center">
                                                    <div className="text-center">
                                                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <p className="text-gray-500">Aucun utilisateur trouvé dans votre activité</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <AnimatePresence>
                                                {filteredUsers.map((user, index) => {
                                                    const hasItem = !!currentSection.getUserItemId(user);
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
                                                                    hasItem 
                                                                        ? 'bg-green-100 text-green-700' 
                                                                        : 'bg-gray-100 text-gray-500'
                                                                }`}>
                                                                    {getItemName(currentSection.getUserItemId(user))}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex gap-2">
                                                                    {!hasItem ? (
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
                                    Affecter une {currentSection.itemLabelLower}
                                </h1>
                                <button 
                                    onClick={() => {
                                        setShowAffecterModal(false);
                                        setSelectedUser(null);
                                        setSelectedItemId('');
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
                                        {currentSection.itemLabel} à affecter <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedItemId}
                                        onChange={(e) => setSelectedItemId(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] focus:ring-1 focus:ring-[#FF8500] outline-none bg-white text-left"
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {currentSection.items.map(item => (
                                            <option key={currentSection.getItemId(item)} value={currentSection.getItemId(item)}>
                                                {currentSection.getItemName(item)}
                                            </option>
                                        ))}
                                    </select>
                                    {currentSection.items.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠️ Aucune {currentSection.itemLabelLower} disponible pour votre activité
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAffecterModal(false);
                                            setSelectedUser(null);
                                            setSelectedItemId('');
                                        }}
                                        className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating || !selectedItemId}
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
                                        setSelectedItemId('');
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
                                    Affectation actuelle: <strong>{getItemName(currentSection.getUserItemId(selectedUser))}</strong>
                                </p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleReassign(); }} className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                        Nouvelle {currentSection.itemLabel} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedItemId}
                                        onChange={(e) => setSelectedItemId(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-[#FF8500] focus:ring-1 focus:ring-[#FF8500] outline-none bg-white text-left"
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {currentSection.items.map(item => (
                                            <option key={currentSection.getItemId(item)} value={currentSection.getItemId(item)}>
                                                {currentSection.getItemName(item)}
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
                                            setSelectedItemId('');
                                        }}
                                        className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating || !selectedItemId}
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
                                    {currentSection.itemLabel} actuelle: <strong>{getItemName(currentSection.getUserItemId(selectedUser))}</strong>
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

export default AffectationVicePresident;