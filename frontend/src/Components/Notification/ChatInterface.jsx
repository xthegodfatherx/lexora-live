// Components/Notification/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { axiosInstance } from '../../axios';
import { AI_ENABLED } from '../../ai/roles';
import AssistantPanel from '../Assistant/AssistantPanel';
import { ComposeAiMenu, ReplySuggestions, ConversationSummary, InlineAssistant, Sparkle, toHelperMessages, translateMessage } from '../Assistant/ChatAiTools';
import { aiErrorMessage } from '../../ai/aiClient';

// initialAssistant : { context, question, nonce } — ouverture directe sur l'assistant IA (voir ai/launcher.js)
const ChatInterface = ({ userRole, userId, onClose, onMessagesRead, initialAssistant }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, message: null });
    const messagesEndRef = useRef(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [conversationUnreadCount, setConversationUnreadCount] = useState({});
    
    // État pour stocker les IDs des conversations qui ont été lues
    const [readConversations, setReadConversations] = useState(new Set());

    const currentUserId = userId?.toString();

    // ── Assistant IA ──
    const [assistantOpen, setAssistantOpen] = useState(AI_ENABLED && !!initialAssistant);
    const [showSummary, setShowSummary] = useState(false);
    const [lexoraQuestion, setLexoraQuestion] = useState(null);   // « @lexora … » tapé dans une conversation
    const [translations, setTranslations] = useState({});          // messageId → { busy, text, error }

    useEffect(() => {
        if (AI_ENABLED && initialAssistant) {
            setAssistantOpen(true);
            setSelectedConversation(null);
        }
    }, [initialAssistant]);

    const openAssistantPanel = () => {
        setAssistantOpen(true);
        setSelectedConversation(null);
    };

    const selectConversation = (conv) => {
        setAssistantOpen(false);
        setShowSummary(false);
        setLexoraQuestion(null);
        setSelectedConversation(conv);
    };

    const translate = async (message, langue) => {
        setContextMenu({ show: false, x: 0, y: 0, message: null });
        setTranslations(prev => ({ ...prev, [message._id]: { busy: true } }));
        try {
            const text = await translateMessage(message.content, langue);
            setTranslations(prev => ({ ...prev, [message._id]: { text } }));
        } catch (err) {
            setTranslations(prev => ({ ...prev, [message._id]: { error: aiErrorMessage(err) } }));
        }
    };

    // Charger les conversations initiales
    useEffect(() => {
        fetchConversations();
        fetchUsers();
        updateGlobalUnreadCount();
        
        // Rafraîchir toutes les 10 secondes (sans marquer comme lu)
        const interval = setInterval(() => {
            fetchConversations();
            updateGlobalUnreadCount();
        }, 10000);
        
        return () => clearInterval(interval);
    }, []);

    // Ne marquer comme lu que quand on sélectionne une conversation
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation._id);
            // Marquer comme lu UNIQUEMENT ici
            markConversationAsRead(selectedConversation._id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(u => 
                (u.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (u.role?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    useEffect(() => {
        const handleClick = () => setContextMenu({ show: false, x: 0, y: 0, message: null });
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const markConversationAsRead = async (conversationId) => {
        try {
            await axiosInstance.put(`/notifications/messages/conversation/${conversationId}/read`);
            
            // Ajouter à l'ensemble des conversations lues
            setReadConversations(prev => new Set([...prev, conversationId]));
            
            // Mettre à jour le compteur local
            setConversationUnreadCount(prev => ({
                ...prev,
                [conversationId]: 0
            }));
            
            if (onMessagesRead) onMessagesRead();
            await updateGlobalUnreadCount();
        } catch (err) {
            console.error('Erreur marquage lu:', err);
        }
    };

    const fetchConversations = async () => {
        try {
            const response = await axiosInstance.get('/notifications/conversations');
            const convs = response.data || [];
            
            // Compter les messages non lus pour chaque conversation
            const unreadCountsMap = {};
            
            for (const conv of convs) {
                // Si la conversation a déjà été lue, ne pas recompter
                if (readConversations.has(conv._id)) {
                    unreadCountsMap[conv._id] = 0;
                    continue;
                }
                
                try {
                    const msgsResp = await axiosInstance.get(`/notifications/messages/${conv._id}`);
                    const messagesList = msgsResp.data.messages || [];
                    
                    const unreadMessages = messagesList.filter(msg => 
                        msg.senderId?.toString() !== currentUserId && 
                        !msg.readBy?.some(r => r.userId?.toString() === currentUserId)
                    );
                    
                    unreadCountsMap[conv._id] = unreadMessages.length;
                } catch (e) {
                    unreadCountsMap[conv._id] = 0;
                }
            }
            
            setConversations(convs);
            setConversationUnreadCount(unreadCountsMap);
        } catch (err) {
            console.error('Erreur chargement conversations:', err);
            setConversations([]);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/auth/all_users/public/');
            
            let usersList = [];
            if (response.data.users) usersList = response.data.users;
            else if (response.data.data) usersList = response.data.data;
            else if (Array.isArray(response.data)) usersList = response.data;
            
            const otherUsers = usersList.filter(u => {
                const uId = u.id?.toString();
                return uId && uId !== currentUserId;
            });
            
            const formattedUsers = otherUsers.map(u => ({
                id: u.id,
                role: u.role,
                nom_complet: u.nom_complet || `${u.prenom || ''} ${u.nom || ''}`.trim() || u.role,
                email: u.email
            }));
            
            setUsers(formattedUsers);
            setFilteredUsers(formattedUsers);
        } catch (err) {
            console.error('Erreur chargement utilisateurs:', err);
            if (err.response?.status === 403) {
                const participantsFromConvos = new Map();
                conversations.forEach(conv => {
                    conv.participants?.forEach(p => {
                        if (p.userId?.toString() !== currentUserId && !participantsFromConvos.has(p.userId)) {
                            participantsFromConvos.set(p.userId, {
                                id: p.userId,
                                role: p.role,
                                nom_complet: p.nom_complet || p.role || 'Utilisateur'
                            });
                        }
                    });
                });
                setUsers(Array.from(participantsFromConvos.values()));
                setFilteredUsers(Array.from(participantsFromConvos.values()));
            } else {
                setUsers([]);
                setFilteredUsers([]);
            }
        }
    };

    const fetchMessages = async (conversationId) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/notifications/messages/${conversationId}`);
            setMessages(response.data.messages || []);
        } catch (err) {
            console.error('Erreur chargement messages:', err);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const updateGlobalUnreadCount = async () => {
        try {
            const response = await axiosInstance.get('/notifications/unread/count');
            setUnreadCounts({ total: response.data.unreadCount || 0 });
            if (onMessagesRead && response.data.unreadCount === 0) onMessagesRead();
        } catch (err) {
            console.error('Erreur compteur non lus:', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const lexora = AI_ENABLED && newMessage.trim().match(/^@lexora[\s,:]+(.+)$/is);
        if (lexora) {
            setLexoraQuestion(lexora[1].trim());
            setNewMessage('');
            return;
        }

        try {
            const response = await axiosInstance.post('/notifications/messages', {
                conversationId: selectedConversation._id,
                content: newMessage
            });

            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
            await fetchConversations();
            scrollToBottom();
        } catch (err) {
            console.error('Erreur envoi message:', err);
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await axiosInstance.delete(`/notifications/messages/${messageId}`);
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
            setContextMenu({ show: false, x: 0, y: 0, message: null });
        } catch (err) {
            console.error('Erreur suppression message:', err);
            alert('Erreur lors de la suppression du message');
        }
    };

    const startEditMessage = (message) => {
        setEditingMessage(message);
        setEditContent(message.content);
        setContextMenu({ show: false, x: 0, y: 0, message: null });
    };

    const updateMessage = async () => {
        if (!editContent.trim() || !editingMessage) return;

        try {
            const response = await axiosInstance.put(`/notifications/messages/${editingMessage._id}`, {
                content: editContent
            });
            setMessages(prev => prev.map(msg => 
                msg._id === editingMessage._id ? response.data : msg
            ));
            setEditingMessage(null);
            setEditContent('');
        } catch (err) {
            console.error('Erreur modification message:', err);
            alert('Erreur lors de la modification du message');
        }
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setEditContent('');
    };

    const handleContextMenu = (e, message) => {
        e.preventDefault();
        if (message.senderId?.toString() !== currentUserId && !AI_ENABLED) return;
        
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            message: message
        });
    };

    const createDirectConversation = async (targetUser) => {
        if (!targetUser) return;
        
        try {
            const response = await axiosInstance.post('/notifications/conversations/direct', {
                targetUserId: targetUser.id.toString(),
                targetUserRole: targetUser.role,
                targetUserName: targetUser.nom_complet
            });
            
            setConversations(prev => [response.data, ...prev]);
            setAssistantOpen(false);
            setSelectedConversation(response.data);
            setShowNewChat(false);
            setSearchTerm('');
            await fetchConversations();
        } catch (err) {
            console.error('Erreur création conversation:', err);
            alert('Erreur lors de la création de la conversation');
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    const getConversationName = (conv) => {
        if (!conv || !conv.participants) return 'Conversation';
        const other = conv.participants.find(p => p.userId?.toString() !== currentUserId);
        return other?.nom_complet || other?.role || 'Utilisateur';
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div
                className="flex w-full max-w-6xl h-[90vh] my-auto mx-auto bg-white/95 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sidebar des conversations */}
                <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-200/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                                {unreadCounts.total > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                                        {unreadCounts.total}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition shadow-lg"
                                    title="Nouvelle conversation"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-200/70 transition"
                                    title="Fermer"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {AI_ENABLED && (
                        <div
                            onClick={openAssistantPanel}
                            className={`px-5 py-3 border-b border-gray-200/70 cursor-pointer transition flex items-center gap-3 ${assistantOpen ? 'bg-orange-50/80' : 'hover:bg-gray-50/80'}`}
                        >
                            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shadow flex-shrink-0">
                                <Sparkle className="w-5 h-5" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                    Assistant Lexora
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-orange-100 text-orange-700">IA</span>
                                </p>
                                <p className="text-sm text-gray-500 truncate">Contrats, risques, textes juridiques…</p>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 text-gray-500">
                                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="mb-2 font-medium">Aucune conversation</p>
                                <p className="text-sm mb-4">Commencez une nouvelle discussion</p>
                                <button onClick={() => setShowNewChat(true)} className="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                                    Nouvelle conversation
                                </button>
                            </div>
                        ) : (
                            conversations.map(conv => {
                                const unreadCountValue = conversationUnreadCount[conv._id] || 0;
                                const hasUnread = unreadCountValue > 0;
                                
                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => selectConversation(conv)}
                                        className={`px-5 py-3 border-b border-gray-100/50 cursor-pointer transition relative ${
                                            !assistantOpen && selectedConversation?._id === conv._id ? 'bg-orange-50/80' : 'hover:bg-gray-50/80'
                                        } ${hasUnread ? 'bg-blue-100/80 hover:bg-blue-200/80' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-medium truncate ${hasUnread ? 'font-bold text-gray-900' : 'text-gray-800'}`}>
                                                        {getConversationName(conv)}
                                                    </p>
                                                    {unreadCountValue > 0 && (
                                                        <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                                                            {unreadCountValue > 99 ? '99+' : unreadCountValue}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-sm truncate mt-0.5 ${hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                                    {conv.lastMessage || 'Nouvelle conversation'}
                                                </p>
                                            </div>
                                            <span className="flex-shrink-0 ml-2 text-xs text-gray-400">
                                                {conv.lastMessageAt && formatDate(conv.lastMessageAt)}
                                            </span>
                                        </div>
                                        {unreadCountValue > 0 && (
                                            <div className="mt-1">
                                                <span className="text-xs text-red-600 font-medium">
                                                    {unreadCountValue} nouveau{unreadCountValue > 1 ? 'x' : ''} message{unreadCountValue > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Zone de chat - le reste reste identique */}
                <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm">
                    {assistantOpen ? (
                        <AssistantPanel
                            userId={currentUserId}
                            userRole={userRole}
                            onClose={onClose}
                            initial={initialAssistant}
                            onWriteTo={(u) => createDirectConversation({ id: u.id, role: u.role, nom_complet: u.nom_complet })}
                        />
                    ) : selectedConversation ? (
                        <>
                            <div className="px-5 py-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {getConversationName(selectedConversation)}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Conversation privée</p>
                                    </div>
                                    {AI_ENABLED && messages.length >= 4 && (
                                        <button
                                            onClick={() => setShowSummary(v => !v)}
                                            className="ml-auto mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
                                            title="Résumé IA : décisions, échéances, actions"
                                        >
                                            <Sparkle className="w-3.5 h-3.5" /> Résumer
                                        </button>
                                    )}
                                    <button 
                                        onClick={onClose} 
                                        className="p-2 rounded-full hover:bg-gray-100/50 transition"
                                        title="Fermer"
                                    >
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {showSummary && (
                                <ConversationSummary
                                    messages={messages}
                                    currentUserId={currentUserId}
                                    otherName={getConversationName(selectedConversation)}
                                    onClose={() => setShowSummary(false)}
                                />
                            )}

                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white/30">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                        <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p className="text-base font-medium">Aucun message</p>
                                        <p className="text-sm">Soyez le premier à envoyer un message</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isCurrentUser = msg.senderId?.toString() === currentUserId;
                                        const isUnread = !isCurrentUser && !msg.readBy?.some(r => r.userId?.toString() === currentUserId);
                                        const isEditing = editingMessage?._id === msg._id;
                                        
                                        return (
                                            <div 
                                                key={idx} 
                                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                                onContextMenu={(e) => handleContextMenu(e, msg)}
                                            >
                                                {isEditing ? (
                                                    <div className="w-full max-w-[70%]">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editContent}
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && updateMessage()}
                                                                className="flex-1 px-4 py-2.5 border border-orange-300 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 bg-white"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={updateMessage}
                                                                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isCurrentUser ? 'bg-orange-500 text-white' : `bg-white/90 backdrop-blur-sm text-gray-800 border shadow-sm ${isUnread ? 'border-blue-400 bg-blue-50/90' : 'border-gray-200'}`}`}>
                                                        <p dir="auto" className="text-sm break-words leading-relaxed">{msg.content}</p>
                                                        {translations[msg._id] && (
                                                            <p dir="auto" className={`mt-1.5 pt-1.5 border-t text-sm italic break-words ${isCurrentUser ? 'border-orange-300 text-orange-50' : 'border-gray-200 text-gray-600'}`}>
                                                                {translations[msg._id].busy ? 'Traduction…' : (translations[msg._id].text || translations[msg._id].error)}
                                                            </p>
                                                        )}
                                                        <div className={`flex justify-end items-center gap-2 mt-1 ${isCurrentUser ? 'text-orange-100' : 'text-gray-400'}`}>
                                                            <span className="text-xs">{formatDate(msg.createdAt)}</span>
                                                            {isUnread && <span className="text-xs text-blue-500 font-medium">● Non lu</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {contextMenu.show && (
                                <div
                                    className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[160px]"
                                    style={{ top: contextMenu.y, left: contextMenu.x }}
                                >
                                    {AI_ENABLED && [['fr', 'français'], ['ar', 'arabe'], ['en', 'anglais']].map(([code, label]) => (
                                        <button
                                            key={code}
                                            onClick={() => translate(contextMenu.message, code)}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 flex items-center gap-2"
                                        >
                                            <Sparkle className="w-4 h-4 text-orange-500" />
                                            Traduire en {label}
                                        </button>
                                    ))}
                                    {contextMenu.message?.senderId?.toString() === currentUserId && (<>
                                    <button
                                        onClick={() => startEditMessage(contextMenu.message)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => deleteMessage(contextMenu.message._id)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Supprimer
                                    </button>
                                    </>)}
                                </div>
                            )}

                            <div className="px-5 py-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
                                {AI_ENABLED && lexoraQuestion && (
                                    <InlineAssistant
                                        question={lexoraQuestion}
                                        userRole={userRole}
                                        userId={currentUserId}
                                        otherName={getConversationName(selectedConversation)}
                                        messages={messages}
                                        onInsert={(text) => { setNewMessage(text); setLexoraQuestion(null); }}
                                        onClose={() => setLexoraQuestion(null)}
                                    />
                                )}
                                {AI_ENABLED && !lexoraQuestion && (
                                    <ReplySuggestions
                                        messages={messages}
                                        currentUserId={currentUserId}
                                        otherName={getConversationName(selectedConversation)}
                                        onPick={setNewMessage}
                                    />
                                )}
                                <div className="flex gap-3">
                                    {AI_ENABLED && (
                                        <ComposeAiMenu
                                            value={newMessage}
                                            onApply={setNewMessage}
                                            context={toHelperMessages(messages, currentUserId, getConversationName(selectedConversation), 8)}
                                        />
                                    )}
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        dir="auto"
                                        placeholder={AI_ENABLED ? 'Écrivez votre message…  (@lexora + question pour interroger l’assistant)' : 'Écrivez votre message...'}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition text-base bg-white/80 backdrop-blur-sm"
                                        autoFocus
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Envoyer
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-400">
                            <svg className="w-24 h-24 mb-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-lg text-gray-500 mb-2 font-medium">Sélectionnez une conversation</p>
                            <p className="text-sm text-gray-400 mb-5">ou commencez une nouvelle discussion</p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow-lg"
                            >
                                Nouvelle conversation
                            </button>
                            {AI_ENABLED && (
                                <button
                                    onClick={openAssistantPanel}
                                    className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50 transition font-medium"
                                >
                                    <Sparkle className="w-4 h-4" /> Demander à l'assistant Lexora
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Nouvelle conversation */}
                {showNewChat && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNewChat(false)}>
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-96 max-h-[85vh] overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()}>
                            <div className="px-5 py-4 border-b border-gray-200/50 bg-gradient-to-r from-orange-50/80 to-white/80">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900">Nouvelle conversation</h3>
                                    <button onClick={() => setShowNewChat(false)} className="p-1 rounded-full hover:bg-gray-100/50">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="relative mb-4">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Rechercher un utilisateur..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 bg-white/80 backdrop-blur-sm"
                                    />
                                </div>
                                <div className="border border-gray-200/50 rounded-lg max-h-64 overflow-y-auto bg-white/50">
                                    {filteredUsers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Aucun utilisateur trouvé</p>
                                        </div>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => createDirectConversation(user)}
                                                className="px-3 py-3 cursor-pointer hover:bg-orange-50/50 transition border-b border-gray-100/50 last:border-0 flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-orange-100/80 flex items-center justify-center text-orange-600 font-semibold">
                                                    {user.nom_complet?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{user.nom_complet}</p>
                                                    <p className="text-xs text-gray-500">{user.role}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="px-5 py-3 border-t border-gray-200/50 bg-gray-50/50 flex justify-end">
                                <button onClick={() => setShowNewChat(false)} className="px-4 py-2 bg-gray-200/80 rounded-lg hover:bg-gray-300/80 transition">
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default ChatInterface;