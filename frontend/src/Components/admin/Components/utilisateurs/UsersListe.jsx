// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { axiosInstance } from '../../../../axios';
// import { ReactComponent as EditIcon }   from '../../../../Assets/Icons/edit.svg';
// import { ReactComponent as DeleteIcon } from '../../../../Assets/Icons/Delete.svg';
// import { ReactComponent as SearchIcon } from '../../../../Assets/Icons/Search.svg';
// import AjouterUtilisateurModal from './AjouterUtilisateurModal';

// // ─── CONSTANTES RÔLES (alignées sur le backend Django) ────────────────────────
// const ROLES = [
//   { value: 'admin',                          label: 'Admin',                          color: '#FF4444' },
//   { value: 'agent',                          label: 'Agent',                          color: '#6B7280' },
//   { value: 'vice_presedent',                 label: 'Vice Président',                 color: '#7C3AED' },
//   { value: 'directeur_direction',            label: 'Directeur de Direction',         color: '#8B5CF6' },
//   { value: 'responsable_departement',        label: 'Responsable de Département',     color: '#06B6D4' },
//   { value: 'directeur_centrale',             label: 'Directeur Centrale',             color: '#EC4899' },
//   { value: 'assistant_directeur_centrale',   label: 'Assistant Directeur Centrale',   color: '#F59E0B' },
//   { value: 'directeur_direction_activite',   label: 'Directeur Direction Activité',   color: '#10B981' },
//   { value: 'directeur_division_activite',    label: 'Directeur Division Activité',    color: '#14B8A6' },
//   { value: 'responsable_direction_division', label: 'Responsable Direction Division', color: '#3B82F6' },
//   { value: 'responsable_departement_division','label': 'Responsable Département Division', color: '#FF8500' },
// ];

// // 🔥 Rôles qui nécessitent un popup (champ supplémentaire)
// // On retire vice_presedent, directeur_centrale, directeur_direction de cette liste
// const ROLES_WITH_EXTRA = {
//   responsable_departement:        { field: 'departement_id',         label: 'Département',              endpoint: '/juridique/departements/' },
//   assistant_directeur_centrale:   { field: 'direction_centrale_id',  label: 'Direction Centrale',       endpoint: '/juridique/directions-centrales/' },
//   directeur_direction_activite:   { field: 'direction_activite_id',  label: 'Direction Activité',       endpoint: '/juridique/direction_activite/' },
//   directeur_division_activite:    { field: 'division_activite_id',   label: 'Division Activité',        endpoint: '/juridique/division/' },
//   responsable_direction_division: { field: 'direction_activite_id',  label: 'Direction de Division',    endpoint: '/juridique/structure/' },
//   responsable_departement_division:{ field: 'departement_activite_id','label': 'Département Division',  endpoint: '/juridique/departemet_activite/' },
// };

// // ─── HELPER ───────────────────────────────────────────────────────────────────
// const extractArray = (data) => {
//   if (Array.isArray(data))                      return data;
//   if (data?.data && Array.isArray(data.data))   return data.data;
//   if (data?.results && Array.isArray(data.results)) return data.results;
//   for (const key in data) {
//     if (Array.isArray(data[key])) return data[key];
//   }
//   return [];
// };

// const getDisplayName = (item) =>
//   item?.nom || item?.name || item?.libelle || item?.label || `ID: ${item?._id || item?.id}`;

// const getItemId = (item) => item?._id || item?.id;

// // ─── MODAL MODIFIER UTILISATEUR ───────────────────────────────────────────────
// const ModifierUtilisateur = ({ onCancel, user, onSuccess }) => {
//   const [formData, setFormData] = useState({
//     nom:            user.nom            || '',
//     prenom:         user.prenom         || '',
//     email:          user.email          || '',
//     adresse:        user.adresse        || '',
//     date_naissance: user.date_naissance || '',
//     sexe:           user.sexe           || '',
//     telephone:      user.telephone      || '',
//     matricule:      user.matricule      || '',
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       Object.entries(formData).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, v); });
//       await axiosInstance.put(`/auth/users/${user.id}/update/`, fd, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       onSuccess();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Erreur serveur');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(p => ({ ...p, [name]: value }));
//   };

//   const inputCls = "w-full h-9 px-3 rounded-[20px] border border-gray-300 focus:border-[#FF8500] focus:outline-none text-sm";

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="w-[600px] bg-white shadow-2xl p-8 rounded-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-semibold text-gray-800">Modifier Utilisateur</h2>
//           <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F4F4F" strokeWidth="2">
//               <path d="M18 6L6 18M6 6L18 18" />
//             </svg>
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-3">
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
//               <input type="text" name="nom" value={formData.nom} onChange={handleChange} className={inputCls} required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
//               <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className={inputCls} required />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
//             <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className={inputCls} />
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date naissance</label>
//               <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} className={inputCls} />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
//               <select name="sexe" value={formData.sexe} onChange={handleChange} className={`${inputCls} bg-white`}>
//                 <option value="">Sélectionner</option>
//                 <option value="M">Masculin</option>
//                 <option value="F">Féminin</option>
//               </select>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
//               <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className={inputCls} />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
//               <input type="text" name="matricule" value={formData.matricule} onChange={handleChange} className={inputCls} />
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 mt-3">
//             <button type="button" onClick={onCancel} className="px-6 py-2 rounded-[25px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm">
//               Annuler
//             </button>
//             <button type="submit" disabled={loading} className="px-6 py-2 rounded-[25px] bg-[#FF8500] text-white hover:bg-[#e67800] transition disabled:opacity-50 text-sm">
//               {loading ? 'Modification...' : 'Modifier'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // ─── MODAL SUPPRIMER UTILISATEUR ──────────────────────────────────────────────
// const DeleteUtilisateur = ({ onCancel, user, onSuccess }) => {
//   const [loading, setLoading] = useState(false);

//   const handleDelete = async () => {
//     setLoading(true);
//     try {
//       await axiosInstance.delete(`/auth/users/${user.id}/delete/`);
//       onSuccess();
//     } catch {
//       alert('Erreur lors de la suppression');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="w-[500px] bg-white shadow-2xl p-8 rounded-2xl">
//         <div className="flex justify-center mb-4">
//           <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
//             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD21E" strokeWidth="2">
//               <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
//             </svg>
//           </div>
//         </div>
//         <h2 className="text-xl font-semibold text-center mb-2">Confirmation</h2>
//         <p className="text-center text-gray-600 mb-6">
//           Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{user?.prenom} {user?.nom}</span> ?
//         </p>
//         <div className="flex gap-4 justify-center">
//           <button onClick={onCancel} className="px-6 py-2 rounded-[25px] bg-gray-200 hover:bg-gray-300 transition">
//             Annuler
//           </button>
//           <button onClick={handleDelete} disabled={loading} className="px-6 py-2 rounded-[25px] bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50">
//             {loading ? 'Suppression...' : 'Supprimer'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── MODAL AFFECTATION AVEC CHAMP SUPPLÉMENTAIRE ─────────────────────────────
// const ExtraFieldModal = ({ user, role, onConfirm, onCancel }) => {
//   const config = ROLES_WITH_EXTRA[role.value];
//   const [items, setItems]     = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState('');

//   useEffect(() => {
//     axiosInstance.get(config.endpoint)
//       .then(r => setItems(extractArray(r.data)))
//       .catch(() => setItems([]))
//       .finally(() => setLoading(false));
//   }, [config.endpoint]);

//   const handleConfirm = () => {
//     if (!selected) { alert(`Veuillez sélectionner ${config.label}`); return; }
//     onConfirm({ [config.field]: selected });
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl"
//         onClick={e => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">
//             Assigner : <span className="text-[#FF8500]">{role.label}</span>
//           </h3>
//           <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F4F4F" strokeWidth="2">
//               <path d="M18 6L6 18M6 6L18 18" />
//             </svg>
//           </button>
//         </div>

//         <p className="text-sm text-gray-500 mb-4">
//           Attribuer à <span className="font-semibold text-gray-700">{user.prenom} {user.nom}</span>
//         </p>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             {config.label} <span className="text-red-500">*</span>
//           </label>
//           {loading ? (
//             <div className="flex items-center gap-2 py-3">
//               <div className="w-4 h-4 border-2 border-[#FF8500] border-t-transparent rounded-full animate-spin" />
//               <span className="text-sm text-gray-400">Chargement...</span>
//             </div>
//           ) : (
//             <select
//               value={selected}
//               onChange={e => setSelected(e.target.value)}
//               className="w-full h-10 px-3 rounded-[20px] border border-gray-300 focus:border-[#FF8500] focus:outline-none text-sm bg-white"
//             >
//               <option value="">-- Sélectionner {config.label} --</option>
//               {items.map(item => (
//                 <option key={getItemId(item)} value={getItemId(item)}>
//                   {getDisplayName(item)}
//                 </option>
//               ))}
//               {items.length === 0 && <option disabled>Aucun élément disponible</option>}
//             </select>
//           )}
//         </div>

//         <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
//           <button onClick={onCancel} className="px-5 py-2 rounded-[25px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm">
//             Annuler
//           </button>
//           <button onClick={handleConfirm} disabled={loading || !selected} className="px-5 py-2 rounded-[25px] bg-[#FF8500] text-white hover:bg-[#e67800] transition disabled:opacity-50 text-sm">
//             Confirmer
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // ─── ROLE SELECTOR (sans scroll) ──────────────────────────────────────────────
// const RoleSelector = ({ user, onUpdate, isLoading }) => {
//   const [isOpen, setIsOpen]           = useState(false);
//   const [extraModal, setExtraModal]   = useState(null);
//   const containerRef                  = useRef(null);

//   const currentRole = ROLES.find(r => r.value === user.role) || {
//     value: user.role, label: user.role || 'Sans rôle', color: '#94a3b8',
//   };

//   useEffect(() => {
//     const handler = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const handleRoleClick = (role) => {
//     if (role.value === user.role) { setIsOpen(false); return; }

//     setIsOpen(false);

//     // 🔥 Vérifier si le rôle nécessite un popup (uniquement ceux dans ROLES_WITH_EXTRA)
//     if (ROLES_WITH_EXTRA[role.value]) {
//       setExtraModal(role);
//     } else {
//       // ✅ Assignation directe pour: admin, agent, vice_presedent, directeur_centrale, directeur_direction
//       onUpdate(user.id, role.value, {});
//     }
//   };

//   const handleExtraConfirm = (extraData) => {
//     onUpdate(user.id, extraModal.value, extraData);
//     setExtraModal(null);
//   };

//   return (
//     <>
//       <div className="relative" ref={containerRef}>
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={() => !isLoading && setIsOpen(o => !o)}
//           disabled={isLoading}
//           className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] transition-all min-w-[170px] border disabled:opacity-50"
//           style={{ backgroundColor: `${currentRole.color}10`, borderColor: `${currentRole.color}30` }}
//         >
//           {isLoading ? (
//             <div className="w-2 h-2 rounded-full animate-spin border-2 border-[#FF8500] border-t-transparent" />
//           ) : (
//             <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentRole.color }} />
//           )}
//           <span className="text-[11px] font-bold uppercase tracking-wide truncate flex-1 text-left" style={{ color: currentRole.color }}>
//             {isLoading ? 'Mise à jour...' : currentRole.label}
//           </span>
//           {!isLoading && (
//             <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
//                  fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: currentRole.color }}>
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
//             </svg>
//           )}
//         </motion.button>

//         <AnimatePresence>
//           {isOpen && (
//             <motion.div
//               initial={{ opacity: 0, y: 6, scale: 0.96 }}
//               animate={{ opacity: 1, y: 4, scale: 1 }}
//               exit={{ opacity: 0, y: 6, scale: 0.96 }}
//               className="absolute left-0 top-full z-[100] w-[240px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
//               style={{ maxHeight: 'auto', overflowY: 'visible' }} // 🔥 Suppression du scroll
//             >
//               {ROLES.map(role => (
//                 <button
//                   key={role.value}
//                   onClick={() => handleRoleClick(role)}
//                   className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-all ${
//                     user.role === role.value
//                       ? 'bg-gray-50 text-gray-900 cursor-default'
//                       : 'hover:bg-orange-50 text-gray-600 hover:text-[#FF8500]'
//                   }`}
//                 >
//                   <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
//                   <span className="flex-1 text-left">{role.label}</span>
//                   {/* 🔥 Icône seulement pour les rôles qui nécessitent un popup */}
//                   {ROLES_WITH_EXTRA[role.value] && (
//                     <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
//                     </svg>
//                   )}
//                   {user.role === role.value && (
//                     <svg className="w-3.5 h-3.5 text-[#FF8500]" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                     </svg>
//                   )}
//                 </button>
//               ))}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Modal champ supplémentaire */}
//       {extraModal && (
//         <ExtraFieldModal
//           user={user}
//           role={extraModal}
//           onConfirm={handleExtraConfirm}
//           onCancel={() => setExtraModal(null)}
//         />
//       )}
//     </>
//   );
// };

// // ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
// const UsersListe = () => {
//   const [users, setUsers]               = useState([]);
//   const [loading, setLoading]           = useState(false);
//   const [updatingRoles, setUpdatingRoles] = useState({});
//   const [searchTerm, setSearchTerm]     = useState('');
//   const [selectedRole, setSelectedRole] = useState('');
//   const [showSuccess, setShowSuccess]   = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [showCreateModal, setShowCreateModal]     = useState(false);
//   const [showModifyModal, setShowModifyModal]     = useState(false);
//   const [userToModify, setUserToModify] = useState(null);

//   // ── Fetch utilisateurs
//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await axiosInstance.get('/auth/users/');
//       setUsers(res.data.users || res.data.data || res.data || []);
//     } catch (err) {
//       console.error('Erreur chargement utilisateurs:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchUsers(); }, []);

//   // ── Toast succès
//   const showToast = (msg) => {
//     setSuccessMessage(msg);
//     setShowSuccess(true);
//     setTimeout(() => setShowSuccess(false), 3500);
//   };

//   // ── Assign role → POST /affectation/assign-role/
//   const updateRole = async (userId, role, extraData = {}) => {
//     setUpdatingRoles(p => ({ ...p, [userId]: true }));
//     try {
//       const payload = { user_id: userId, role, ...extraData };
//       const res = await axiosInstance.post('/affectation/assign-role/', payload);

//       if (res.data.status === 'success') {
//         const roleLabel = ROLES.find(r => r.value === role)?.label || role;
//         showToast(`Rôle "${roleLabel}" affecté avec succès`);

//         // Mise à jour locale en utilisant full_user retourné par le back
//         const updatedUser = res.data.data;
//         setUsers(prev => prev.map(u =>
//           String(u.id) === String(userId)
//             ? {
//                 ...u,
//                 role:                     role,
//                 direction_centrale_id:    updatedUser.direction_centrale_id    || u.direction_centrale_id,
//                 direction_id:             updatedUser.direction_id             || u.direction_id,
//                 departement_id:           updatedUser.departement_id           || u.departement_id,
//                 direction_activite_id:    updatedUser.direction_activite_id    || u.direction_activite_id,
//                 division_activite_id:     updatedUser.division_activite_id     || u.division_activite_id,
//                 structure_id:             updatedUser.structure_id             || u.structure_id,
//               }
//             : u
//         ));
//       } else {
//         alert(res.data.message || "Erreur lors de l'affectation");
//       }
//     } catch (err) {
//       const data = err.response?.data || {};
//       const errorMap = {
//         MISSING_USER_ID:    '❌ user_id manquant.',
//         MISSING_ROLE:       '❌ Rôle manquant.',
//         INVALID_ROLE:       `❌ Rôle invalide. Disponibles : ${data.valid_roles?.join(', ') || ''}`,
//         USER_NOT_FOUND:     '❌ Utilisateur introuvable.',
//         CANNOT_MODIFY_ADMIN:'⛔ Impossible de modifier un administrateur.',
//         UPDATE_FAILED:      '❌ Mise à jour du rôle échouée.',
//         FORBIDDEN:          '⛔ Accès refusé.',
//       };
//       alert(errorMap[data.code] || data.message || "Erreur lors de l'affectation du rôle");
//     } finally {
//       setUpdatingRoles(p => ({ ...p, [userId]: false }));
//     }
//   };

//   // ── Filtres
//   const filteredUsers = users.filter(u => {
//     const s = searchTerm.toLowerCase();
//     return (
//       (u.nom || '').toLowerCase().includes(s) ||
//       (u.prenom || '').toLowerCase().includes(s) ||
//       (u.email || '').toLowerCase().includes(s) ||
//       (u.matricule || '').toLowerCase().includes(s)
//     ) && (selectedRole ? u.role === selectedRole : true);
//   });

//   const getRoleCount = (v) => users.filter(u => u.role === v).length;

//   const rowVariants = {
//     hidden:  { opacity: 0, x: -16 },
//     visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
//     exit:    { opacity: 0, x: 16, transition: { duration: 0.15 } },
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* En-tête */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
//         className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95"
//       >
//         <div className="px-8 py-6 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
//             <p className="text-gray-500 mt-1 text-sm">Gérez les utilisateurs, leurs rôles et leurs affectations</p>
//           </div>
//           {loading && (
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-[#FF8500] rounded-full animate-pulse" />
//               <span className="text-sm text-gray-400">Chargement...</span>
//             </div>
//           )}
//         </div>
//       </motion.div>

//       {/* Contenu */}
//       <div className="p-8">
//         <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">

//           {/* Bouton ajouter */}
//           <div className="flex justify-end mb-6">
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="px-5 py-2.5 bg-[#FF8500] text-white rounded-[20px] text-sm font-medium hover:bg-[#e67800] transition flex items-center gap-2"
//             >
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                 <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//               </svg>
//               Ajouter Utilisateur
//             </button>
//           </div>

//           {/* Filtres */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <select
//               value={selectedRole}
//               onChange={e => setSelectedRole(e.target.value)}
//               className="h-[43px] px-4 rounded-[20px] border-2 border-[#D9E1E7] outline-none focus:border-[#FF8500] bg-white text-sm"
//             >
//               <option value="">Tous les rôles ({users.length})</option>
//               {ROLES.map(r => (
//                 <option key={r.value} value={r.value}>
//                   {r.label} ({getRoleCount(r.value)})
//                 </option>
//               ))}
//             </select>
//             <div className="h-[43px] rounded-[20px] border-2 border-[#D9E1E7] hover:border-[#FF8500] focus-within:border-[#FF8500] transition-colors flex items-center px-4 gap-3">
//               <SearchIcon className="text-gray-400 flex-shrink-0" />
//               <input
//                 type="text"
//                 placeholder="Rechercher nom, email, matricule..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="flex-1 border-0 outline-none text-sm"
//               />
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500">
//             <span className="px-2 py-1 bg-gray-100 rounded-full">Total : {filteredUsers.length} utilisateur(s)</span>
//             {selectedRole && (
//               <span className="px-2 py-1 bg-[#FF8500]/10 rounded-full text-[#FF8500]">
//                 Filtre : {ROLES.find(r => r.value === selectedRole)?.label}
//               </span>
//             )}
//           </div>

//           {/* Tableau */}
//           <div className="rounded-lg border border-gray-100 overflow-x-auto">
//             <table className="w-full min-w-[980px]">
//               <thead>
//                 <tr className="bg-gradient-to-r from-[#F9F9F9] to-[#F0F0F0] border-b border-[#E4E4E4]">
//                   {['Matricule', 'Nom complet', 'Email', 'Téléphone', 'Rôle', 'Actions'].map(h => (
//                     <th key={h} className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="7" className="py-12 text-center">
//                       <div className="w-8 h-8 border-4 border-[#FF8500] border-t-transparent rounded-full animate-spin mx-auto" />
//                       <p className="text-xs text-gray-400 mt-2">Chargement...</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   <AnimatePresence>
//                     {filteredUsers.map((user, i) => {
//                       // Construire le résumé d'affectation
//                       const affectation = [
//                         user.direction_centrale_detail?.nom,
//                         user.direction_detail?.nom,
//                         user.departement_detail?.nom,
//                         user.direction_activite_detail?.nom,
//                         user.division_activite_detail?.nom,
//                       ].filter(Boolean).join(' › ');

//                       return (
//                         <motion.tr
//                           key={user.id}
//                           custom={i}
//                           variants={rowVariants}
//                           initial="hidden" animate="visible" exit="exit"
//                           className="border-b border-gray-100 hover:bg-[#FFF9F0] transition-colors"
//                         >
//                           <td className="py-3 px-3">
//                             <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono">
//                               {user.matricule || '—'}
//                             </span>
//                            </td>
//                           <td className="py-3 px-3">
//                             <div className="flex items-center gap-2">
//                               {user.photo_profil ? (
//                                 <img src={user.photo_profil} alt="" className="w-7 h-7 rounded-full object-cover" />
//                               ) : (
//                                 <div className="w-7 h-7 rounded-full bg-[#FF8500]/10 flex items-center justify-center text-[#FF8500] text-xs font-semibold">
//                                   {user.prenom?.[0]}{user.nom?.[0]}
//                                 </div>
//                               )}
//                               <span className="text-sm font-medium text-gray-800">{user.prenom} {user.nom}</span>
//                             </div>
//                            </td>
//                           <td className="py-3 px-3 text-sm text-gray-600 truncate max-w-[180px]" title={user.email}>
//                             {user.email}
//                            </td>
                        
                        
//                           <td className="py-3 px-3 text-sm text-gray-500">
//                             {user.telephone || '—'}
//                            </td>
//                              <td className="py-3 px-3">
//                             <RoleSelector
//                               user={user}
//                               onUpdate={updateRole}
//                               isLoading={!!updatingRoles[user.id]}
//                             />
//                            </td>
//                           <td className="py-3 px-3">
//                             <div className="flex items-center gap-1">
//                               <motion.button
//                                 whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//                                 onClick={() => { setUserToModify(user); setShowModifyModal(true); }}
//                                 className="p-1.5 hover:bg-[#FF8500]/10 rounded-full transition"
//                                 title="Modifier"
//                               >
//                                 <EditIcon className="w-3.5 h-3.5 text-gray-500 hover:text-[#FF8500]" />
//                               </motion.button>
//                               <motion.button
//                                 whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//                                 onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
//                                 className="p-1.5 hover:bg-red-50 rounded-full transition"
//                                 title="Supprimer"
//                               >
//                                 <DeleteIcon className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
//                               </motion.button>
//                             </div>
//                            </td>
//                         </motion.tr>
//                       );
//                     })}
//                   </AnimatePresence>
//                 )}
//               </tbody>
//             </table>

//             {filteredUsers.length === 0 && !loading && (
//               <div className="text-center py-12">
//                 <svg className="w-16 h-16 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
//                     d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//                 <p className="text-gray-400">Aucun utilisateur trouvé</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {showDeleteConfirm && selectedUser && (
//         <DeleteUtilisateur
//           onCancel={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
//           user={selectedUser}
//           onSuccess={() => { setShowDeleteConfirm(false); setSelectedUser(null); showToast('Utilisateur supprimé'); fetchUsers(); }}
//         />
//       )}

//       {showModifyModal && userToModify && (
//         <ModifierUtilisateur
//           onCancel={() => { setShowModifyModal(false); setUserToModify(null); }}
//           user={userToModify}
//           onSuccess={() => { setShowModifyModal(false); setUserToModify(null); showToast('Utilisateur modifié avec succès'); fetchUsers(); }}
//         />
//       )}

//       <AjouterUtilisateurModal
//         isOpen={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         onSuccess={(msg) => { showToast(msg || 'Utilisateur créé avec succès'); fetchUsers(); }}
//         axiosInstance={axiosInstance}
//       />

//       {/* Toast */}
//       <AnimatePresence>
//         {showSuccess && (
//           <motion.div
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//             className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2.5 px-5 rounded-xl shadow-xl z-50 text-sm font-medium flex items-center gap-2"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
//             </svg>
//             {successMessage}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };
// UsersListe.jsx - Solution complète
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../../../../axios';
import { ReactComponent as EditIcon } from '../../../../Assets/Icons/edit.svg';
import { ReactComponent as DeleteIcon } from '../../../../Assets/Icons/Delete.svg';
import { ReactComponent as SearchIcon } from '../../../../Assets/Icons/Search.svg';
import AjouterUtilisateurModal from './AjouterUtilisateurModal';

// ─── CONSTANTES RÔLES ────────────────────────────────────────────────────────
const ROLES = [
  { value: 'admin', label: 'Admin', color: '#FF4444', requiresPopup: false },
  { value: 'agent', label: 'Agent', color: '#6B7280', requiresPopup: false },
  { value: 'vice_presedent', label: 'Vice Président', color: '#7C3AED', requiresPopup: false },
  { value: 'directeur_direction', label: 'Directeur de Direction', color: '#8B5CF6', requiresPopup: false },
  { value: 'directeur_centrale', label: 'Directeur Centrale', color: '#EC4899', requiresPopup: false },
  { 
    value: 'responsable_departement', 
    label: 'Responsable de Département', 
    color: '#06B6D4', 
    requiresPopup: true, 
    popupType: 'simple',
    config: {
      title: 'Direction',
      endpoint: '/juridique/directions/',
      field: 'direction_id'
    }
  },
  { 
    value: 'assistant_directeur_centrale', 
    label: 'Assistant Directeur Centrale', 
    color: '#F59E0B', 
    requiresPopup: true, 
    popupType: 'simple',
    config: {
      title: 'Direction Centrale',
      endpoint: '/juridique/directions-centrales/',
      field: 'direction_centrale_id'
    }
  },
  { 
    value: 'directeur_direction_activite', 
    label: 'Directeur Direction Activité', 
    color: '#10B981', 
    requiresPopup: true, 
    popupType: 'simple',
    config: {
      title: 'Activité',
      endpoint: '/juridique/activites/',
      field: 'activite_id'
    }
  },
  { 
    value: 'directeur_division_activite', 
    label: 'Directeur Division Activité', 
    color: '#14B8A6', 
    requiresPopup: true, 
    popupType: 'simple',
    config: {
      title: 'Activité',
      endpoint: '/juridique/activites/',
      field: 'activite_id'
    }
  },
  { 
    value: 'responsable_direction_division', 
    label: 'Responsable Direction Division', 
    color: '#3B82F6', 
    requiresPopup: true, 
    popupType: 'cascade',
    config: {
      firstTitle: 'Activité',
      firstEndpoint: '/juridique/activites/',
      firstField: 'activite_id',
      secondTitle: 'Division',
      secondEndpoint: (id) => `/juridique/division/?activite=${id}`,
      secondField: 'division_activite_id'
    }
  },
  { 
    value: 'responsable_departement_division', 
    label: 'Responsable Département Division', 
    color: '#FF8500', 
    requiresPopup: true, 
    popupType: 'cascade',
    config: {
      firstTitle: 'Activité',
      firstEndpoint: '/juridique/activites/',
      firstField: 'activite_id',
      secondTitle: 'Division',
      secondEndpoint: (id) => `/juridique/division/?activite=${id}`,
      secondField: 'division_activite_id'
    }
  },
];

const ROLE_DISPLAY = {
  'admin': 'Admin',
  'agent': 'Agent',
  'vice_presedent': 'Vice Président',
  'directeur_direction': 'Directeur de Direction',
  'responsable_departement': 'Responsable de Département',
  'directeur_centrale': 'Directeur Centrale',
  'assistant_directeur_centrale': 'Assistant Directeur Centrale',
  'directeur_direction_activite': 'Directeur Direction Activité',
  'directeur_division_activite': 'Directeur Division Activité',
  'responsable_direction_division': 'Responsable Direction Division',
  'responsable_departement_division': 'Responsable Département Division',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
};

const getDisplayName = (item) =>
  item?.nom || item?.name || item?.libelle || item?.label || `ID: ${item?._id || item?.id}`;

const getItemId = (item) => item?._id || item?.id;

// ─── MODAL POPUP SIMPLE ─────────────────────────────────────────────────────
const SimplePopupModal = React.memo(({ user, role, onConfirm, onCancel }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [loading, setLoading] = useState(true);
  const config = role.config;

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await axiosInstance.get(config.endpoint);
        setItems(extractArray(response.data));
      } catch (error) {
        console.error('Erreur chargement:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, [config.endpoint]);

  const handleConfirm = () => {
    if (!selectedItem) {
      alert(`Veuillez sélectionner ${config.title}`);
      return;
    }
    onConfirm({ [config.field]: selectedItem });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Assigner : <span className="text-[#FF8500]">{role.label}</span>
          </h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F4F4F" strokeWidth="2">
              <path d="M18 6L6 18M6 6L18 18" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Attribution à <span className="font-semibold text-gray-700">{user.prenom} {user.nom}</span>
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.title} <span className="text-red-500">*</span>
          </label>
          {loading ? (
            <div className="flex items-center gap-2 py-3">
              <div className="w-4 h-4 border-2 border-[#FF8500] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Chargement...</span>
            </div>
          ) : (
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full h-10 px-3 rounded-[20px] border border-gray-300 focus:border-[#FF8500] focus:outline-none text-sm bg-white"
            >
              <option value="">-- Sélectionner {config.title} --</option>
              {items.map(item => (
                <option key={getItemId(item)} value={getItemId(item)}>
                  {getDisplayName(item)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-5 py-2 rounded-[25px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedItem}
            className="px-5 py-2 rounded-[25px] bg-[#FF8500] text-white hover:bg-[#e67800] transition disabled:opacity-50 text-sm"
          >
            Confirmer
          </button>
        </div>
      </motion.div>
    </div>
  );
});

SimplePopupModal.displayName = 'SimplePopupModal';

// ─── MODAL POPUP CASCADE (Activité → Division) ──────────────────────────────
const CascadePopupModal = React.memo(({ user, role, onConfirm, onCancel }) => {
  const [step, setStep] = useState(1);
  const [firstItems, setFirstItems] = useState([]);
  const [secondItems, setSecondItems] = useState([]);
  const [selectedFirst, setSelectedFirst] = useState('');
  const [selectedSecond, setSelectedSecond] = useState('');
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const config = role.config;

  // Charger les activités
  useEffect(() => {
    const loadFirstItems = async () => {
      try {
        const response = await axiosInstance.get(config.firstEndpoint);
        setFirstItems(extractArray(response.data));
      } catch (error) {
        console.error('Erreur chargement:', error);
        setFirstItems([]);
      } finally {
        setLoadingFirst(false);
      }
    };
    loadFirstItems();
  }, [config.firstEndpoint]);

  // Charger les division quand une activité est sélectionnée
  const loadSecondItems = async (firstId) => {
    setLoadingSecond(true);
    try {
      const endpoint = typeof config.secondEndpoint === 'function'
        ? config.secondEndpoint(firstId)
        : config.secondEndpoint;
      const response = await axiosInstance.get(endpoint);
      setSecondItems(extractArray(response.data));
    } catch (error) {
      console.error('Erreur chargement second items:', error);
      setSecondItems([]);
    } finally {
      setLoadingSecond(false);
    }
  };

  const handleFirstChange = async (firstId) => {
    setSelectedFirst(firstId);
    setSelectedSecond('');
    setStep(2);
    await loadSecondItems(firstId);
  };

  const handleConfirm = () => {
    if (!selectedSecond) {
      alert(`Veuillez sélectionner ${config.secondTitle}`);
      return;
    }
    onConfirm({
      [config.firstField]: selectedFirst,
      [config.secondField]: selectedSecond
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Assigner : <span className="text-[#FF8500]">{role.label}</span>
          </h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F4F4F" strokeWidth="2">
              <path d="M18 6L6 18M6 6L18 18" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Attribution à <span className="font-semibold text-gray-700">{user.prenom} {user.nom}</span>
        </p>

        {/* Indicateur d'étape */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-[#FF8500]' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-[#FF8500]' : 'bg-gray-200'}`} />
        </div>

        {/* Étape 1 */}
        {step === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.firstTitle} <span className="text-red-500">*</span>
            </label>
            {loadingFirst ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-[#FF8500] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Chargement...</span>
              </div>
            ) : (
              <select
                value={selectedFirst}
                onChange={(e) => handleFirstChange(e.target.value)}
                className="w-full h-10 px-3 rounded-[20px] border border-gray-300 focus:border-[#FF8500] focus:outline-none text-sm bg-white"
              >
                <option value="">-- Sélectionner {config.firstTitle} --</option>
                {firstItems.map(item => (
                  <option key={getItemId(item)} value={getItemId(item)}>
                    {getDisplayName(item)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Étape 2 */}
        {step === 2 && (
          <div>
            <div className="mb-4 p-3 bg-orange-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">{config.firstTitle} sélectionné</p>
              <p className="text-sm font-medium text-gray-700">
                {firstItems.find(i => getItemId(i) === selectedFirst)?.nom || selectedFirst}
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.secondTitle} <span className="text-red-500">*</span>
            </label>
            {loadingSecond ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-[#FF8500] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Chargement...</span>
              </div>
            ) : (
              <select
                value={selectedSecond}
                onChange={(e) => setSelectedSecond(e.target.value)}
                className="w-full h-10 px-3 rounded-[20px] border border-gray-300 focus:border-[#FF8500] focus:outline-none text-sm bg-white"
              >
                <option value="">-- Sélectionner {config.secondTitle} --</option>
                {secondItems.map(item => (
                  <option key={getItemId(item)} value={getItemId(item)}>
                    {getDisplayName(item)}
                  </option>
                ))}
                {secondItems.length === 0 && !loadingSecond && (
                  <option disabled>Aucune {config.secondTitle.toLowerCase()} disponible</option>
                )}
              </select>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 rounded-[25px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm"
            >
              Retour
            </button>
          )}
          <button onClick={onCancel} className="px-5 py-2 rounded-[25px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm">
            Annuler
          </button>
          {step === 1 ? (
            <button
              onClick={() => selectedFirst && handleFirstChange(selectedFirst)}
              disabled={!selectedFirst || loadingFirst}
              className="px-5 py-2 rounded-[25px] bg-[#FF8500] text-white hover:bg-[#e67800] transition disabled:opacity-50 text-sm"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!selectedSecond || loadingSecond}
              className="px-5 py-2 rounded-[25px] bg-[#FF8500] text-white hover:bg-[#e67800] transition disabled:opacity-50 text-sm"
            >
              Confirmer
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
});

CascadePopupModal.displayName = 'CascadePopupModal';

// ─── ROLE SELECTOR ──────────────────────────────────────────────────────────
const RoleSelector = React.memo(({ user, onUpdate, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupRole, setPopupRole] = useState(null);
  const containerRef = useRef(null);

  const currentRole = ROLES.find(r => r.value === user.role) || {
    value: user.role,
    label: ROLE_DISPLAY[user.role] || user.role || 'Sans rôle',
    color: '#94a3b8',
    requiresPopup: false,
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRoleClick = (role) => {
    if (role.value === user.role) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    if (role.requiresPopup) {
      setPopupRole(role);
    } else {
      onUpdate(user.id, role.value, {});
    }
  };

  const handlePopupConfirm = (extraData) => {
    onUpdate(user.id, popupRole.value, extraData);
    setPopupRole(null);
  };

  return (
    <>
      <div className="relative" ref={containerRef}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => !isLoading && setIsOpen(o => !o)}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] transition-all min-w-[170px] border disabled:opacity-50"
          style={{ backgroundColor: `${currentRole.color}10`, borderColor: `${currentRole.color}30` }}
        >
          {isLoading ? (
            <div className="w-2 h-2 rounded-full animate-spin border-2 border-[#FF8500] border-t-transparent" />
          ) : (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentRole.color }} />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wide truncate flex-1 text-left" style={{ color: currentRole.color }}>
            {isLoading ? 'Mise à jour...' : currentRole.label}
          </span>
          {!isLoading && (
            <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: currentRole.color }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              className="absolute left-0 top-full z-[100] w-[260px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              {ROLES.map(role => (
                <button
                  key={role.value}
                  onClick={() => handleRoleClick(role)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-all ${user.role === role.value
                      ? 'bg-gray-50 text-gray-900 cursor-default'
                      : 'hover:bg-orange-50 text-gray-600 hover:text-[#FF8500]'
                    }`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                  <span className="flex-1 text-left">{role.label}</span>
                  {role.requiresPopup && (
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {user.role === role.value && (
                    <svg className="w-3.5 h-3.5 text-[#FF8500]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {popupRole && popupRole.popupType === 'simple' && (
        <SimplePopupModal
          user={user}
          role={popupRole}
          onConfirm={handlePopupConfirm}
          onCancel={() => setPopupRole(null)}
        />
      )}

      {popupRole && popupRole.popupType === 'cascade' && (
        <CascadePopupModal
          user={user}
          role={popupRole}
          onConfirm={handlePopupConfirm}
          onCancel={() => setPopupRole(null)}
        />
      )}
    </>
  );
});

RoleSelector.displayName = 'RoleSelector';

// ─── MODAL MODIFIER UTILISATEUR ─────────────────────────────────────────────
const ModifierUtilisateur = ({ onCancel, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: user.nom || '',
    prenom: user.prenom || '',
    email: user.email || '',
    adresse: user.adresse || '',
    date_naissance: user.date_naissance || '',
    sexe: user.sexe || '',
    telephone: user.telephone || '',
    matricule: user.matricule || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, v); });
      await axiosInstance.put(`/auth/users/${user.id}/update/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const inputCls = "w-full h-9 px-3 rounded-[20px] border border-gray-300 focus:border-[#FF8500] focus:outline-none text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[600px] bg-white shadow-2xl p-8 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Modifier Utilisateur</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F4F4F" strokeWidth="2">
              <path d="M18 6L6 18M6 6L18 18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className={inputCls} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date naissance</label>
              <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <select name="sexe" value={formData.sexe} onChange={handleChange} className={`${inputCls} bg-white`}>
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
              <input type="text" name="matricule" value={formData.matricule} onChange={handleChange} className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 mt-3">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-[25px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-[25px] bg-[#FF8500] text-white hover:bg-[#e67800] transition disabled:opacity-50 text-sm">
              {loading ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── MODAL SUPPRIMER UTILISATEUR ────────────────────────────────────────────
const DeleteUtilisateur = ({ onCancel, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/auth/users/${user.id}/delete/`);
      onSuccess();
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[500px] bg-white shadow-2xl p-8 rounded-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD21E" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Confirmation</h2>
        <p className="text-center text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{user?.prenom} {user?.nom}</span> ?
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={onCancel} className="px-6 py-2 rounded-[25px] bg-gray-200 hover:bg-gray-300 transition">
            Annuler
          </button>
          <button onClick={handleDelete} disabled={loading} className="px-6 py-2 rounded-[25px] bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50">
            {loading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL USERSLISTE ─────────────────────────────────────────
const UsersListe = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingRoles, setUpdatingRoles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [userToModify, setUserToModify] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/auth/users/');
      setUsers(res.data.users || res.data.data || res.data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = useCallback((msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
  }, []);

  const updateRole = useCallback(async (userId, role, extraData = {}) => {
    setUpdatingRoles(prev => ({ ...prev, [userId]: true }));
    try {
      const payload = { user_id: userId, role, ...extraData };
      const res = await axiosInstance.post('/affectation/assign-role/', payload);

      if (res.data.status === 'success') {
        const roleLabel = ROLES.find(r => r.value === role)?.label || role;
        showToast(`Rôle "${roleLabel}" affecté avec succès`);
        const updatedUser = res.data.data;
        setUsers(prev => prev.map(u =>
          String(u.id) === String(userId) ? { ...u, ...updatedUser } : u
        ));
      } else {
        alert(res.data.message || "Erreur lors de l'affectation");
      }
    } catch (err) {
      const data = err.response?.data || {};
      const errorMessages = {
        MISSING_USER_ID: '❌ user_id manquant.',
        MISSING_ROLE: '❌ Rôle manquant.',
        INVALID_ROLE: '❌ Rôle invalide.',
        USER_NOT_FOUND: '❌ Utilisateur introuvable.',
        CANNOT_MODIFY_ADMIN: '⛔ Impossible de modifier un administrateur.',
        MISSING_DIRECTION_CENTRALE_ID: '❌ La direction centrale est obligatoire.',
        MISSING_DIRECTION_ID: '❌ La direction est obligatoire.',
        MISSING_ACTIVITE_ID: "❌ L'activité est obligatoire.",
        MISSING_DIVISION_ACTIVITE_ID: '❌ La division activité est obligatoire.',
        UPDATE_FAILED: '❌ Mise à jour du rôle échouée.',
      };
      alert(errorMessages[data.code] || data.message || "Erreur lors de l'affectation");
    } finally {
      setUpdatingRoles(prev => ({ ...prev, [userId]: false }));
    }
  }, [showToast]);

  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    return (
      (u.nom || '').toLowerCase().includes(s) ||
      (u.prenom || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.matricule || '').toLowerCase().includes(s)
    ) && (selectedRole ? u.role === selectedRole : true);
  });

  const getRoleCount = useCallback((roleValue) => {
    return users.filter(u => u.role === roleValue).length;
  }, [users]);

  const rowVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
    exit: { opacity: 0, x: 16, transition: { duration: 0.15 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95"
      >
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
            <p className="text-gray-500 mt-1 text-sm">Gérez les utilisateurs, leurs rôles et leurs affectations</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FF8500] rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Chargement...</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="p-8">
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-[#FF8500] text-white rounded-[20px] text-sm font-medium hover:bg-[#e67800] transition flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Ajouter Utilisateur
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="h-[43px] px-4 rounded-[20px] border-2 border-[#D9E1E7] outline-none focus:border-[#FF8500] bg-white text-sm"
            >
              <option value="">Tous les rôles ({users.length})</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label} ({getRoleCount(r.value)})
                </option>
              ))}
            </select>
            <div className="h-[43px] rounded-[20px] border-2 border-[#D9E1E7] hover:border-[#FF8500] focus-within:border-[#FF8500] transition-colors flex items-center px-4 gap-3">
              <SearchIcon className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Rechercher nom, email, matricule..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 border-0 outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-full">Total : {filteredUsers.length} utilisateur(s)</span>
            {selectedRole && (
              <span className="px-2 py-1 bg-[#FF8500]/10 rounded-full text-[#FF8500]">
                Filtre : {ROLES.find(r => r.value === selectedRole)?.label}
              </span>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="bg-gradient-to-r from-[#F9F9F9] to-[#F0F0F0] border-b border-[#E4E4E4]">
                  {['Matricule', 'Nom complet', 'Email', 'Téléphone', 'Rôle', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-3 text-left text-xs font-semibold text-[#4A4A4A]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="w-8 h-8 border-4 border-[#FF8500] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-gray-400 mt-2">Chargement...</p>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredUsers.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="border-b border-gray-100 hover:bg-[#FFF9F0] transition-colors"
                      >
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono">
                            {user.matricule || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {user.photo_profil ? (
                              <img src={user.photo_profil} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#FF8500]/10 flex items-center justify-center text-[#FF8500] text-xs font-semibold">
                                {user.prenom?.[0]}{user.nom?.[0]}
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-800">{user.prenom} {user.nom}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600 truncate max-w-[180px]" title={user.email}>
                          {user.email}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-500">
                          {user.telephone || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <RoleSelector
                            user={user}
                            onUpdate={updateRole}
                            isLoading={!!updatingRoles[user.id]}
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => { setUserToModify(user); setShowModifyModal(true); }}
                              className="p-1.5 hover:bg-[#FF8500]/10 rounded-full transition"
                              title="Modifier"
                            >
                              <EditIcon className="w-3.5 h-3.5 text-gray-500 hover:text-[#FF8500]" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
                              className="p-1.5 hover:bg-red-50 rounded-full transition"
                              title="Supprimer"
                            >
                              <DeleteIcon className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-400">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && selectedUser && (
        <DeleteUtilisateur
          onCancel={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
          user={selectedUser}
          onSuccess={() => { setShowDeleteConfirm(false); setSelectedUser(null); showToast('Utilisateur supprimé'); fetchUsers(); }}
        />
      )}

      {showModifyModal && userToModify && (
        <ModifierUtilisateur
          onCancel={() => { setShowModifyModal(false); setUserToModify(null); }}
          user={userToModify}
          onSuccess={() => { setShowModifyModal(false); setUserToModify(null); showToast('Utilisateur modifié avec succès'); fetchUsers(); }}
        />
      )}

      <AjouterUtilisateurModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(msg) => { showToast(msg || 'Utilisateur créé avec succès'); fetchUsers(); }}
        axiosInstance={axiosInstance}
      />

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2.5 px-5 rounded-xl shadow-xl z-50 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersListe;