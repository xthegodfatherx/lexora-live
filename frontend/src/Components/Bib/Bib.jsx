import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../../axios';
import DocumentListe from './DocumentList';
import DocumentDetail from './DocumentDetail';

const CATEGORY_LABELS = {
    CONSTITUTION: 'Constitution',
    TRAITES_ET_ACCORDS: 'Traités et accords',
    LOIS: 'Lois',
    ORDONNANCES: 'Ordonnances',
    DECRETS: 'Décrets',
    DECISIONS_ET_ARRETES: 'Décisions et arrêtés',
    TEXTES_REGLEMENTAIRES: 'Textes réglementaires',
    CONTRATS_ET_MODELES: 'Contrats et modèles',
    DOCUMENTATION_INTERNE: 'Documentation interne',
    JURISPRUDENCE: 'Jurisprudence',
};

const STATUS_LABELS = {
    EN_VIGUEUR: 'En vigueur',
    MODIFIE: 'Modifié',
    ABROGE: 'Abrogé',
};

const LibraryStats = ({ stats }) => {
    if (!stats) {
        return <p className="text-center text-gray-500 py-10">Chargement des statistiques…</p>;
    }
    const maxCategory = Math.max(1, ...(stats.parCategorie || []).map((row) => row.total));
    const statusTone = {
        EN_VIGUEUR: 'bg-emerald-500',
        MODIFIE: 'bg-amber-500',
        ABROGE: 'bg-rose-500',
    };
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Corpus', value: stats.total },
                    { label: 'En vigueur', value: stats.enVigueur },
                    { label: 'Catégories', value: (stats.parCategorie || []).length },
                    { label: 'Statuts', value: (stats.parStatut || []).length },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                        <p className="text-xs sm:text-sm text-gray-500">{item.label}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-[#FF8500] mt-1">{item.value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Répartition par catégorie</h3>
                    <div className="space-y-3">
                        {(stats.parCategorie || []).map((row) => (
                            <div key={row._id}>
                                <div className="flex items-center justify-between gap-3 text-sm mb-1">
                                    <span className="text-gray-700 truncate">{CATEGORY_LABELS[row._id] || row._id}</span>
                                    <span className="font-semibold text-gray-800">{row.total}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${(row.total / maxCategory) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Répartition par statut</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(stats.parStatut || []).map((row) => (
                            <div key={row._id} className="rounded-2xl border border-gray-100 p-4">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${statusTone[row._id] || 'bg-gray-400'}`} />
                                <span className="text-sm text-gray-600">{STATUS_LABELS[row._id] || row._id}</span>
                                <p className="text-2xl font-bold text-gray-800 mt-2">{row.total}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Bib = () => {
    const [activeSection, setActiveSection] = useState('documents');
    const [nbDocuments, setNbDocuments] = useState(0);
    const [nbEnVigueur, setNbEnVigueur] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hoveredCard, setHoveredCard] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [libraryStats, setLibraryStats] = useState(null);
    
    // Récupérer le rôle de l'utilisateur
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'admin';
    const isChef = userRole === 'chef';
    const isReadOnly = isChef; // Le chef peut seulement consulter

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError('');
                
                const [allDocs, enVigueurDocs] = await Promise.all([
                    axiosInstance.get('/bib/documents?limit=1'),
                    axiosInstance.get('/bib/documents?limit=1&statut=EN_VIGUEUR')
                ]);

                setNbDocuments(allDocs.data.total || 0);
                setNbEnVigueur(enVigueurDocs.data.total || 0);
                const stats = await axiosInstance.get('/bib/stats');
                setLibraryStats(stats.data.data || null);

            } catch (err) {
                console.error("Erreur:", err);
                setError("Impossible de charger les statistiques");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const ORANGE_COLOR = '#FF8500';
    const ORANGE_GRADIENT = 'from-orange-500 to-amber-500';

    const cards = [
        {
            id: 'documents',
            title: 'Documents Juridiques',
            description: 'Consultez et gérez tous les documents juridiques',
            count: nbDocuments,
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <path d="M17 21v-4H7v4" />
                    <path d="M7 3v4h10V3" />
                </svg>
            )
        },
        {
            id: 'enVigueur',
            title: 'Documents en Vigueur',
            description: 'Documents juridiques actuellement en vigueur',
            count: nbEnVigueur,
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'recherche',
            title: 'Recherche Avancée',
            description: 'Recherche par mots-clés, catégories et dates',
            count: null,
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            id: 'stats',
            title: 'Statistiques',
            description: 'Analyses et rapports sur les documents',
            count: null,
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        }
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20
            }
        }),
        hover: {
            y: -10,
            scale: 1.02,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 15
            }
        },
        tap: {
            scale: 0.98
        }
    };

    const contentVariants = {
        hidden: { opacity: 0, x: -30, scale: 0.98 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 25
            }
        },
        exit: {
            opacity: 0,
            x: 30,
            scale: 0.98,
            transition: {
                duration: 0.3
            }
        }
    };

    const handleViewDocument = (document) => {
        setSelectedDocument(document);
        setShowDetail(true);
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
                <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                Bibliothèque Juridique
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 mt-1">
                                Gérez et consultez les documents juridiques
                                {isChef && <span className="text-blue-500 ml-1">(Consultation uniquement)</span>}
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

            <div className="p-4 sm:p-6 lg:p-8">
                {/* Cartes de navigation */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10"
                >
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            whileTap="tap"
                            onHoverStart={() => setHoveredCard(card.id)}
                            onHoverEnd={() => setHoveredCard(null)}
                            onClick={() => setActiveSection(card.id)}
                            className={`
                                relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer
                                transition-shadow duration-300
                                ${activeSection === card.id ? 'shadow-2xl ring-2 ring-[#FF8500]' : 'hover:shadow-xl'}
                            `}
                        >
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{
                                    x: hoveredCard === card.id ? '100%' : '-100%'
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeInOut"
                                }}
                            />
                            
                            <motion.div 
                                className={`absolute inset-0 bg-gradient-to-br ${ORANGE_GRADIENT} opacity-0`}
                                animate={{
                                    opacity: hoveredCard === card.id ? 0.05 : 0
                                }}
                                transition={{ duration: 0.3 }}
                            />
                            
                            <div className="relative p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <motion.div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                        style={{
                                            background: activeSection === card.id ? `${ORANGE_COLOR}20` : `${ORANGE_COLOR}10`,
                                            color: ORANGE_COLOR
                                        }}
                                        animate={{
                                            scale: hoveredCard === card.id ? 1.1 : 1,
                                            rotate: hoveredCard === card.id ? [0, -5, 5, 0] : 0
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {card.icon}
                                    </motion.div>
                                    
                                    {card.count !== null && !loading && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: index * 0.1 }}
                                            className="text-right"
                                        >
                                            <span 
                                                className="text-3xl font-bold"
                                                style={{ color: ORANGE_COLOR }}
                                            >
                                                {card.count}
                                            </span>
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

                                {isChef && card.id === 'documents' && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full"
                                    >
                                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="text-xs text-gray-500">Lecture seule</span>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Contenu dynamique */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                        <div className="border-b border-gray-200 px-4 py-4 sm:px-6 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="p-2 rounded-xl"
                                        style={{
                                            background: `${ORANGE_COLOR}10`,
                                            color: ORANGE_COLOR
                                        }}
                                    >
                                        {cards.find(c => c.id === activeSection)?.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                                            {cards.find(c => c.id === activeSection)?.title}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {cards.find(c => c.id === activeSection)?.description}
                                        </p>
                                    </div>
                                </div>
                                
                                {isChef && (
                                    <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                                        <span className="text-xs text-gray-500">Mode consultation</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-6">
                            {activeSection === 'documents' && (
                                <DocumentListe 
                                    isReadOnly={isReadOnly} 
                                    onViewDocument={handleViewDocument}
                                />
                            )}
                            {activeSection === 'enVigueur' && (
                                <DocumentListe 
                                    isReadOnly={isReadOnly}
                                    initialFilter={{ statut: 'EN_VIGUEUR' }}
                                    onViewDocument={handleViewDocument}
                                />
                            )}
                            {activeSection === 'recherche' && (
                                <DocumentListe 
                                    isReadOnly={isReadOnly}
                                    showSearchOnly={true}
                                    onViewDocument={handleViewDocument}
                                />
                            )}
                            {activeSection === 'stats' && (
                                <LibraryStats stats={libraryStats} />
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Modal Détail du document */}
            <AnimatePresence>
                {showDetail && selectedDocument && (
                    <DocumentDetail
                        document={selectedDocument}
                        onClose={() => {
                            setShowDetail(false);
                            setSelectedDocument(null);
                        }}
                        isReadOnly={isReadOnly}
                    />
                )}
            </AnimatePresence>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default Bib;