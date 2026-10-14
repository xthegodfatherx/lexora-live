// Components/Partials/Components/TopBar.jsx
import React, { useState, useEffect } from 'react';
import '../Styles/TopBar.css';
import { ReactComponent as NotificationIcon } from '../../../Assets/Icons/remindersonatrach.svg';
import defaultAccountPicture from '../../../Assets/Images/default_picture.jpeg';
import NotificationCenter from '../../Notification/NotificationCenter';
import ChatInterface from '../../Notification/ChatInterface';
import { axiosInstance } from '../../../axios';
import { AI_ENABLED } from '../../../ai/roles';
import { ASSISTANT_EVENT } from '../../../ai/launcher';

function TopBar() {
    const [showChat, setShowChat] = useState(false);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    // Ouverture directe sur l'assistant IA : { context, question, nonce } (voir ai/launcher.js)
    const [assistantRequest, setAssistantRequest] = useState(null);
    const [userInfo, setUserInfo] = useState({
        nom_complet: '',
        role: '',
        user_id: null
    });
    
    const profilePicture = localStorage.getItem('photo_profil');
    const imageSrc = profilePicture && profilePicture !== 'null' && profilePicture !== '' 
        ? profilePicture 
        : defaultAccountPicture;

    useEffect(() => {
        const nom_complet = localStorage.getItem('nom_complet') || '';
        const role = localStorage.getItem('role') || '';
        const user_id = localStorage.getItem('user_id') || localStorage.getItem('id');
        
        setUserInfo({
            nom_complet,
            role,
            user_id
        });
    }, []);

    // Récupérer le nombre de messages non lus
    const fetchUnreadCount = async () => {
        if (!userInfo.user_id) return;
        try {
            const response = await axiosInstance.get('/notifications/unread/count');
            setUnreadMessagesCount(response.data.unreadCount || 0);
        } catch (err) {
            console.error('Erreur chargement compteur messages:', err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(interval);
    }, [userInfo.user_id]);

    // Assistant IA : bouton flottant, Ctrl+K, et demandes contextuelles des écrans (openAssistant)
    useEffect(() => {
        if (!AI_ENABLED) return undefined;
        const open = (detail) => {
            setAssistantRequest({ context: detail?.context || null, question: detail?.question || '', nonce: Date.now() });
            setShowChat(true);
        };
        const onEvent = (e) => open(e.detail);
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                open(null);
            }
        };
        window.addEventListener(ASSISTANT_EVENT, onEvent);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener(ASSISTANT_EVENT, onEvent);
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    const closeChat = () => {
        setShowChat(false);
        setAssistantRequest(null);
    };

    // Fonction pour mettre à jour le compteur après lecture des messages
    const handleMessagesRead = () => {
        fetchUnreadCount();
    };

    return (
        <div className='topbar-container'>
            <div className='topbar-wrapper'>
                <div className="user-params-box">
                    <NotificationCenter 
                        userRole={userInfo.role} 
                        userId={userInfo.user_id}
                    />

                    {/* Bouton Chat avec badge */}
                    <div className="param-box chat-button">
                        <button 
                            onClick={() => setShowChat(true)}
                            className="bg-transparent border-none cursor-pointer p-1 relative"
                            title="Messages"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {unreadMessagesCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Profil utilisateur */}
                    <div className="user-line-box">
                        <div className="user-account">
                            <img 
                                src={imageSrc} 
                                alt="Profile" 
                                className="profile-picture"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultAccountPicture;
                                }}
                            />
                        </div>
                        <div className="user-props">
                            <span style={{ fontSize: "0.9rem", fontWeight: "550" }}>
                                {userInfo.nom_complet}
                            </span>
                            <span style={{ fontSize: "0.75rem", fontWeight: "430", color: "#00000050" }}>
                                {userInfo.role === 'responsable_structure' ? 'Responsable Structure' :
                                 userInfo.role === 'responsable_departement' ? 'Responsable Département' :
                                 userInfo.role === 'directeur_region' ? 'Directeur Région' :
                                 userInfo.role === 'directeur_direction' ? 'Directeur Direction' :
                                 userInfo.role === 'divisionnaire' ? 'Divisionnaire' :
                                 userInfo.role === 'admin' ? 'Administrateur' :
                                 userInfo.role === 'chef' ? 'Chef' :
                                 userInfo.role === 'directeur' ? 'Directeur National' :
                                 userInfo.role === 'agent' ? 'Agent' :
                                 userInfo.role || 'Utilisateur'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Chat - Version simplifiée car ChatInterface a déjà son propre overlay */}
            {showChat && (
                <ChatInterface 
                    userRole={userInfo.role}
                    userId={userInfo.user_id}
                    onClose={closeChat}
                    onMessagesRead={handleMessagesRead}
                    initialAssistant={assistantRequest}
                />
            )}

            {/* Lanceur flottant de l'assistant IA — présent sur tous les écrans (TopBar est dans chaque layout) */}
            {AI_ENABLED && !showChat && userInfo.user_id && (
                <button
                    onClick={() => { setAssistantRequest({ context: null, question: '', nonce: Date.now() }); setShowChat(true); }}
                    title="Assistant Lexora (Ctrl+K)"
                    aria-label="Ouvrir l'assistant Lexora"
                    className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-xl hover:scale-105 hover:shadow-2xl transition flex items-center justify-center"
                >
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2l1.9 5.6a3 3 0 001.9 1.9L21.4 11.4l-5.6 1.9a3 3 0 00-1.9 1.9L12 20.8l-1.9-5.6a3 3 0 00-1.9-1.9L2.6 11.4l5.6-1.9a3 3 0 001.9-1.9L12 2z" />
                    </svg>
                </button>
            )}
        </div>
    );
}

export default TopBar;