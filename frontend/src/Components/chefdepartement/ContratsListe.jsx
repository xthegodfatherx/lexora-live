import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../../axios';
import AjouterContratModal from './AjouterContratModal';
import DetailsContratModal from './DetailsContratModal';
import { PREFILL_KEY, PREFILL_EVENT } from '../../ai/tools';
import { ReactComponent as SearchIcon } from '../../Assets/Icons/Search.svg';
import { ReactComponent as EditIcon } from '../../Assets/Icons/edit.svg';
import { ReactComponent as DeleteIcon } from '../../Assets/Icons/Delete.svg';
import { ReactComponent as PdfIcon } from '../../Assets/Icons/draft.svg';

const ContratsListe = () => {
    const [contrats, setContrats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });

    // Statistiques
    const [stats, setStats] = useState({
        total: 0,
        brouillon: 0,
        actif: 0,
        expire: 0,
        risques_critiques: 0
    });

    const statusOptions = [
        { value: '', label: 'Tous les statuts' },
        { value: 'brouillon', label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
        { value: 'actif', label: 'Actif', color: 'bg-green-100 text-green-600' },
        { value: 'expire', label: 'Expiré', color: 'bg-red-100 text-red-600' },
        { value: 'resilie', label: 'Résilié', color: 'bg-orange-100 text-orange-600' }
    ];

    const typeOptions = [
        { value: '', label: 'Tous les types' },
        { value: 'service', label: 'Service' },
        { value: 'fourniture', label: 'Fourniture' },
        { value: 'travaux', label: 'Travaux' },
        { value: 'partenariat', label: 'Partenariat' },
        { value: 'vente', label: 'Vente' }
    ];

    const fetchContrats = async () => {
        setLoading(true);
        try {
            let url = `/clm/contrats/?limit=${pagination.limit}&offset=${pagination.offset}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (selectedStatus) url += `&statut=${selectedStatus}`;
            if (selectedType) url += `&type_contrat=${selectedType}`;

            const response = await axiosInstance.get(url);
            const data = response.data;
            
            setContrats(data.results || []);
            setPagination(prev => ({
                ...prev,
                total: data.total || 0
            }));
            
            // Calculer les stats depuis la liste
            const allContrats = data.results || [];
            setStats({
                total: data.total || 0,
                brouillon: allContrats.filter(c => c.statut === 'brouillon').length,
                actif: allContrats.filter(c => c.statut === 'actif').length,
                expire: allContrats.filter(c => c.statut === 'expire').length,
                risques_critiques: allContrats.reduce((sum, c) => sum + (c.risques_critiques || 0), 0)
            });
        } catch (err) {
            console.error("Erreur chargement contrats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContrats();
    }, [searchTerm, selectedStatus, selectedType, pagination.offset]);

    // Assistant IA (outil preparer_contrat) : ouvre « Nouveau contrat » pré-rempli.
    // sessionStorage couvre l'arrivée sur l'écran ; l'évènement couvre le cas où l'écran est déjà ouvert.
    const [prefill, setPrefill] = useState(null);
    useEffect(() => {
        const consume = () => {
            const raw = sessionStorage.getItem(PREFILL_KEY);
            if (!raw) return;
            sessionStorage.removeItem(PREFILL_KEY);
            try {
                setPrefill(JSON.parse(raw));
                setShowCreateModal(true);
            } catch (e) {
                console.error('Pré-remplissage illisible:', e);
            }
        };
        consume();
        window.addEventListener(PREFILL_EVENT, consume);
        return () => window.removeEventListener(PREFILL_EVENT, consume);
    }, []);

    const handleSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccess(true);
        fetchContrats();
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleGeneratePDF = async (contrat) => {
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
            
            handleSuccess('PDF généré avec succès');
        } catch (err) {
            console.error("Erreur génération PDF:", err);
            alert("Erreur lors de la génération du PDF");
        }
    };

    const openDetails = (contrat) => {
        setSelectedContrat(contrat);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option?.color || 'bg-gray-100 text-gray-600';
    };

    const getTypeLabel = (typeCode) => {
        const option = typeOptions.find(opt => opt.value === typeCode);
        return option?.label || typeCode;
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.05, duration: 0.3 }
        }),
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* En-tête */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95"
            >
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Gestion des Contrats</h1>
                            <p className="text-gray-500 mt-1">
                                Gérez vos contrats, analysez les risques et suivez les échéances
                            </p>
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
                </div>
            </motion.div>

            {/* Contenu principal */}
            <div className="p-8">
                <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                    {/* Cartes statistiques */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-xs text-blue-600">Total contrats</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-gray-600">{stats.brouillon}</div>
                            <div className="text-xs text-gray-600">Brouillons</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.actif}</div>
                            <div className="text-xs text-green-600">Actifs</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.expire}</div>
                            <div className="text-xs text-red-600">Expirés</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.risques_critiques}</div>
                            <div className="text-xs text-orange-600">Risques critiques</div>
                        </div>
                    </div>

                    {/* Bouton Ajouter */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 bg-[#FF8500] text-white rounded-[20px] text-sm font-medium hover:bg-[#e67800] transition-all duration-200 flex items-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            Nouveau Contrat
                        </button>
                    </div>

                    {/* Filtres et recherche */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-[43px] px-4 rounded-[20px] border-2 border-[#D9E1E7] outline-none focus:border-[#FF8500] bg-white"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="h-[43px] px-4 rounded-[20px] border-2 border-[#D9E1E7] outline-none focus:border-[#FF8500] bg-white"
                        >
                            {typeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        <div className="h-[43px] rounded-[20px] border-2 border-[#D9E1E7] hover:border-[#FF8500] focus-within:border-[#FF8500] transition-colors duration-200">
                            <div className="w-full h-full flex items-center px-4">
                                <SearchIcon className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par n°, titre, fournisseur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-full border-0 outline-none px-4 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tableau */}
                    <div className="rounded-lg border border-gray-100 overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#F9F9F9] to-[#F0F0F0] border-b border-[#E4E4E4]">
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">N° Contrat</th>
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">Titre</th>
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">Fournisseur</th>
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">Type</th>
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">Montant</th>
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">Statut</th>
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">Risques</th>
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-[#FF8500] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Chargement des contrats...</p>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence>
                                        {contrats.map((contrat, index) => (
                                            <motion.tr 
                                                key={contrat.id}
                                                custom={index}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="border-b border-gray-100 hover:bg-[#FFF9F0] transition-colors duration-150 cursor-pointer"
                                                onClick={() => openDetails(contrat)}
                                            >
                                                <td className="py-3 px-3">
                                                    <span className="text-sm font-mono text-[#FF8500]">
                                                        {contrat.numero_contrat}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="text-sm text-gray-800 truncate max-w-[200px]">
                                                        {contrat.titre}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-sm text-gray-600">
                                                    {contrat.partie_b_nom || '-'}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                        {getTypeLabel(contrat.type_contrat_code)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-sm text-gray-600">
                                                    {contrat.montant?.toLocaleString()} {contrat.devise}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(contrat.statut)}`}>
                                                        {contrat.statut}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    {contrat.risques_critiques > 0 && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                                                            {contrat.risques_critiques} critique(s)
                                                        </span>
                                                    )}
                                                    {contrat.risques_total > 0 && contrat.risques_critiques === 0 && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">
                                                            {contrat.risques_total} risque(s)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center gap-2">
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleGeneratePDF(contrat)} 
                                                            className="p-1.5 hover:bg-red-50 rounded-full transition-all duration-200"
                                                            title="Générer PDF"
                                                        >
                                                            <PdfIcon className="w-3.5 h-3.5 text-red-500" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>

                        {contrats.length === 0 && !loading && (
                            <div className="text-center py-12 px-4">
                                <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500">Aucun contrat trouvé</p>
                                <p className="text-xs text-gray-400 mt-1">Cliquez sur "Nouveau Contrat" pour commencer</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.total > pagination.limit && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Affichage de {pagination.offset + 1} à {Math.min(pagination.offset + pagination.limit, pagination.total)} sur {pagination.total}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                                    disabled={pagination.offset === 0}
                                    className="px-3 py-1 rounded-[20px] bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition"
                                >
                                    Précédent
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                                    disabled={pagination.offset + pagination.limit >= pagination.total}
                                    className="px-3 py-1 rounded-[20px] bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition"
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AjouterContratModal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); setPrefill(null); }}
                onSuccess={handleSuccess}
                axiosInstance={axiosInstance}
                prefill={prefill}
            />

            <DetailsContratModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedContrat(null);
                }}
                contrat={selectedContrat}
                axiosInstance={axiosInstance}
                onUpdate={fetchContrats}
            />

            {/* Message succès */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-lg shadow-xl z-50 text-sm font-medium"
                    >
                        ✅ {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContratsListe;












// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { axiosInstance } from '../../axios';
// import AjouterContratModal from './AjouterContratModal';
// import DetailsContratModal from './DetailsContratModal';

// const ContratsListe = () => {
//     const [contrats, setContrats] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedStatus, setSelectedStatus] = useState('');
//     const [selectedType, setSelectedType] = useState('');
//     const [selectedContrat, setSelectedContrat] = useState(null);
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [showDetailsModal, setShowDetailsModal] = useState(false);
//     const [showSuccess, setShowSuccess] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');
//     const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });

//     const [stats, setStats] = useState({
//         total: 0,
//         brouillon: 0,
//         actif: 0,
//         expire: 0,
//         risques_critiques: 0
//     });

//     const statusOptions = [
//         { value: '', label: 'Tous les statuts' },
//         { value: 'brouillon', label: 'Brouillon' },
//         { value: 'actif', label: 'Actif' },
//         { value: 'expire', label: 'Expiré' },
//         { value: 'resilie', label: 'Résilié' }
//     ];

//     const typeOptions = [
//         { value: '', label: 'Tous les types' },
//         { value: 'service', label: 'Service' },
//         { value: 'fourniture', label: 'Fourniture' },
//         { value: 'travaux', label: 'Travaux' },
//         { value: 'partenariat', label: 'Partenariat' },
//         { value: 'vente', label: 'Vente' }
//     ];

//     const fetchContrats = async () => {
//         setLoading(true);
//         try {
//             let url = `/clm/contrats/?limit=${pagination.limit}&offset=${pagination.offset}`;
//             if (searchTerm) url += `&search=${searchTerm}`;
//             if (selectedStatus) url += `&statut=${selectedStatus}`;
//             if (selectedType) url += `&type_contrat=${selectedType}`;

//             const response = await axiosInstance.get(url);
//             const data = response.data;
            
//             setContrats(data.results || []);
//             setPagination(prev => ({
//                 ...prev,
//                 total: data.total || 0
//             }));
            
//             const allContrats = data.results || [];
//             setStats({
//                 total: data.total || 0,
//                 brouillon: allContrats.filter(c => c.statut === 'brouillon').length,
//                 actif: allContrats.filter(c => c.statut === 'actif').length,
//                 expire: allContrats.filter(c => c.statut === 'expire').length,
//                 risques_critiques: allContrats.reduce((sum, c) => sum + (c.risques_critiques || 0), 0)
//             });
//         } catch (err) {
//             console.error("Erreur chargement contrats:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchContrats();
//     }, [searchTerm, selectedStatus, selectedType, pagination.offset]);

//     const handleSuccess = (message) => {
//         setSuccessMessage(message);
//         setShowSuccess(true);
//         fetchContrats();
//         setTimeout(() => setShowSuccess(false), 3000);
//     };

//     const handleGeneratePDF = async (contrat) => {
//         try {
//             const response = await axiosInstance.get(`/clm/contrats/${contrat.id}/pdf/`, {
//                 responseType: 'blob'
//             });
            
//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', `Contrat_${contrat.numero_contrat}.pdf`);
//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//             window.URL.revokeObjectURL(url);
//             handleSuccess('PDF généré avec succès');
//         } catch (err) {
//             alert("Erreur lors de la génération du PDF");
//         }
//     };

//     const openDetails = (contrat) => {
//         setSelectedContrat(contrat);
//         setShowDetailsModal(true);
//     };

//     const getStatusColor = (status) => {
//         const colors = {
//             'brouillon': 'bg-gray-100 text-gray-700',
//             'actif': 'bg-green-100 text-green-700',
//             'expire': 'bg-red-100 text-red-700',
//             'resilie': 'bg-orange-100 text-orange-700'
//         };
//         return colors[status] || 'bg-gray-100 text-gray-700';
//     };

//     const getStatusLabel = (status) => {
//         const labels = {
//             'brouillon': 'Brouillon',
//             'actif': 'Actif',
//             'expire': 'Expiré',
//             'resilie': 'Résilié'
//         };
//         return labels[status] || status;
//     };

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* En-tête simplifié */}
//             <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//                 <div className="px-6 py-4">
//                     <h1 className="text-xl font-bold text-gray-800">Gestion des Contrats</h1>
//                     <p className="text-gray-500 text-sm">Gérez vos contrats, analysez les risques et suivez les échéances</p>
//                 </div>
//             </div>

//             <div className="p-6">
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    
//                     {/* Cartes stats - Compactes */}
//                     <div className="grid grid-cols-5 gap-3 p-4 border-b border-gray-100">
//                         <div className="text-center p-2 bg-blue-50 rounded-lg">
//                             <div className="text-xl font-bold text-blue-600">{stats.total}</div>
//                             <div className="text-xs text-blue-600">Total</div>
//                         </div>
//                         <div className="text-center p-2 bg-gray-50 rounded-lg">
//                             <div className="text-xl font-bold text-gray-600">{stats.brouillon}</div>
//                             <div className="text-xs text-gray-600">Brouillons</div>
//                         </div>
//                         <div className="text-center p-2 bg-green-50 rounded-lg">
//                             <div className="text-xl font-bold text-green-600">{stats.actif}</div>
//                             <div className="text-xs text-green-600">Actifs</div>
//                         </div>
//                         <div className="text-center p-2 bg-red-50 rounded-lg">
//                             <div className="text-xl font-bold text-red-600">{stats.expire}</div>
//                             <div className="text-xs text-red-600">Expirés</div>
//                         </div>
//                         <div className="text-center p-2 bg-orange-50 rounded-lg">
//                             <div className="text-xl font-bold text-orange-600">{stats.risques_critiques}</div>
//                             <div className="text-xs text-orange-600">Risques</div>
//                         </div>
//                     </div>

//                     {/* Filtres + Bouton */}
//                     <div className="p-4 border-b border-gray-100">
//                         <div className="flex gap-3">
//                             <select
//                                 value={selectedStatus}
//                                 onChange={(e) => setSelectedStatus(e.target.value)}
//                                 className="h-9 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:border-[#FF8500] outline-none"
//                             >
//                                 {statusOptions.map(opt => (
//                                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                                 ))}
//                             </select>

//                             <select
//                                 value={selectedType}
//                                 onChange={(e) => setSelectedType(e.target.value)}
//                                 className="h-9 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:border-[#FF8500] outline-none"
//                             >
//                                 {typeOptions.map(opt => (
//                                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                                 ))}
//                             </select>

//                             <div className="flex-1 relative">
//                                 <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                 </svg>
//                                 <input
//                                     type="text"
//                                     placeholder="Rechercher..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:border-[#FF8500] outline-none"
//                                 />
//                             </div>

//                             <button
//                                 onClick={() => setShowCreateModal(true)}
//                                 className="px-4 h-9 bg-[#FF8500] text-white rounded-lg text-sm font-medium hover:bg-[#e67800] transition flex items-center gap-1 whitespace-nowrap"
//                             >
//                                 <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
//                                     <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
//                                 </svg>
//                                 Nouveau
//                             </button>
//                         </div>
//                     </div>

//                     {/* TABLEAU - SANS SCROLL HORIZONTAL */}
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead>
//                                 <tr className="bg-gray-50 border-b border-gray-200">
//                                     <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">N° Contrat</th>
//                                     <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Titre</th>
//                                     <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Fournisseur</th>
//                                     <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Type</th>
//                                     <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Montant</th>
//                                     <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Statut</th>
//                                     <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Risques</th>
//                                     <th className="py-2 px-3 text-center text-xs font-semibold text-gray-500 w-10">PDF</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {loading ? (
//                                     <tr>
//                                         <td colSpan="8" className="py-8 text-center">
//                                             <div className="flex justify-center">
//                                                 <div className="w-6 h-6 border-2 border-[#FF8500] border-t-transparent rounded-full animate-spin"></div>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ) : contrats.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="8" className="py-8 text-center text-gray-400">
//                                             Aucun contrat trouvé
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     contrats.map((contrat) => (
//                                         <tr 
//                                             key={contrat.id}
//                                             onClick={() => openDetails(contrat)}
//                                             className="border-b border-gray-100 hover:bg-orange-50/30 cursor-pointer transition"
//                                         >
//                                             <td className="py-2 px-3">
//                                                 <span className="text-sm font-mono text-[#FF8500]">
//                                                     {contrat.numero_contrat}
//                                                 </span>
//                                             </td>
//                                             <td className="py-2 px-3">
//                                                 <div className="text-sm text-gray-800 max-w-[200px] truncate" title={contrat.titre}>
//                                                     {contrat.titre || '-'}
//                                                 </div>
//                                             </td>
//                                             <td className="py-2 px-3">
//                                                 <div className="text-sm text-gray-600 max-w-[180px] truncate" title={contrat.partie_b_nom}>
//                                                     {contrat.partie_b_nom || '-'}
//                                                 </div>
//                                             </td>
//                                             <td className="py-2 px-3">
//                                                 <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
//                                                     {contrat.type_contrat_code === 'fourniture' ? 'Fourniture' :
//                                                      contrat.type_contrat_code === 'service' ? 'Service' :
//                                                      contrat.type_contrat_code === 'travaux' ? 'Travaux' :
//                                                      contrat.type_contrat_code === 'partenariat' ? 'Partenariat' : 'Vente'}
//                                                 </span>
//                                             </td>
//                                             <td className="py-2 px-3">
//                                                 <span className="text-sm text-gray-700 whitespace-nowrap">
//                                                     {contrat.montant?.toLocaleString()} {contrat.devise}
//                                                 </span>
//                                             </td>
//                                             <td className="py-2 px-3">
//                                                 <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(contrat.statut)}`}>
//                                                     {getStatusLabel(contrat.statut)}
//                                                 </span>
//                                             </td>
//                                             <td className="py-2 px-3">
//                                                 {contrat.risques_critiques > 0 ? (
//                                                     <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600">
//                                                         {contrat.risques_critiques} critique(s)
//                                                     </span>
//                                                 ) : contrat.risques_total > 0 ? (
//                                                     <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-600">
//                                                         {contrat.risques_total} risque(s)
//                                                     </span>
//                                                 ) : (
//                                                     <span className="text-xs text-gray-400">-</span>
//                                                 )}
//                                             </td>
//                                             <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
//                                                 <button
//                                                     onClick={() => handleGeneratePDF(contrat)}
//                                                     className="p-1 hover:bg-gray-100 rounded transition"
//                                                     title="Générer PDF"
//                                                 >
//                                                     <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                                                     </svg>
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination simplifiée */}
//                     {pagination.total > pagination.limit && (
//                         <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 bg-gray-50/50">
//                             <span className="text-xs text-gray-500">
//                                 {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} sur {pagination.total}
//                             </span>
//                             <div className="flex gap-2">
//                                 <button
//                                     onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
//                                     disabled={pagination.offset === 0}
//                                     className="px-3 py-1 rounded-lg bg-white border border-gray-300 text-xs disabled:opacity-50 hover:bg-gray-50"
//                                 >
//                                     ←
//                                 </button>
//                                 <button
//                                     onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
//                                     disabled={pagination.offset + pagination.limit >= pagination.total}
//                                     className="px-3 py-1 rounded-lg bg-white border border-gray-300 text-xs disabled:opacity-50 hover:bg-gray-50"
//                                 >
//                                     →
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Modals */}
//             <AjouterContratModal
//                 isOpen={showCreateModal}
//                 onClose={() => setShowCreateModal(false)}
//                 onSuccess={handleSuccess}
//                 axiosInstance={axiosInstance}
//             />

//             <DetailsContratModal
//                 isOpen={showDetailsModal}
//                 onClose={() => {
//                     setShowDetailsModal(false);
//                     setSelectedContrat(null);
//                 }}
//                 contrat={selectedContrat}
//                 axiosInstance={axiosInstance}
//                 onUpdate={fetchContrats}
//             />

//             {/* Message succès */}
//             <AnimatePresence>
//                 {showSuccess && (
//                     <motion.div 
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: 20 }}
//                         className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white py-1.5 px-4 rounded-lg shadow-lg z-50 text-sm"
//                     >
//                         ✅ {successMessage}
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };

// export default ContratsListe;