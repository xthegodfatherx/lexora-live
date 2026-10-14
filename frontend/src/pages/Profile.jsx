// pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaBuilding, FaCamera, 
  FaEdit, FaSave, FaTimes, FaIdCard, FaCalendarAlt,
  FaVenusMars, FaMapMarkerAlt, FaSpinner
} from 'react-icons/fa';
import axiosInstance from '../axios'; // Adjust path as needed

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [userData, setUserData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    employeeId: '',
    bio: '',
    sexe: '',
    dateNaissance: '',
    adresse: '',
    profileImage: null,
    role: '',
    is_active: true
  });

  const [formData, setFormData] = useState(userData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // GET /auth/users/me/ → { status, data: {…} } : le profil courant avec les 7 ids
      // d'organisation (FRONTEND_FEATURES.md §3). Ne pas décoder le token pour ça.
      const response = await axiosInstance.get('/auth/users/me/');
      const user = response.data?.data || response.data?.user || response.data;

      if (user && typeof user === 'object') {
        const userData = {
          id: user.id,
          firstName: user.prenom || '',
          lastName: user.nom || '',
          email: user.email || '',
          phone: user.telephone || '',
          position: user.role_display || user.role || '',
          department: getDepartmentName(user),
          employeeId: user.matricule || '',
          bio: user.bio || 'Aucune biographie disponible.',
          sexe: user.sexe || '',
          dateNaissance: user.date_naissance || '',
          adresse: user.adresse || '',
          profileImage: user.photo_profil || null,
          role: user.role || '',
          is_active: user.is_active !== undefined ? user.is_active : true
        };
        
        setUserData(userData);
        setFormData(userData);
        
        if (user.photo_profil) {
          setImagePreview(user.photo_profil);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Impossible de charger le profil. Veuillez réessayer.');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get department name based on user's IDs
  const getDepartmentName = (user) => {
    if (user.direction_detail) {
      return user.direction_detail.nom || 'Direction';
    }
    if (user.departement_detail) {
      return user.departement_detail.nom || 'Département';
    }
    if (user.direction_centrale_detail) {
      return user.direction_centrale_detail.nom || 'Direction Centrale';
    }
    if (user.activite_detail) {
      return user.activite_detail.nom || 'Activité';
    }
    return localStorage.getItem('org_unit_nom') || 'Non assigné';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Prepare form data for API
      const formDataToSend = new FormData();
      
      // Add all fields
      const fields = {
        nom: formData.lastName,
        prenom: formData.firstName,
        email: formData.email,
        telephone: formData.phone,
        adresse: formData.adresse,
        sexe: formData.sexe,
        date_naissance: formData.dateNaissance,
        bio: formData.bio
      };

      Object.keys(fields).forEach(key => {
        if (fields[key] !== undefined && fields[key] !== null) {
          formDataToSend.append(key, fields[key]);
        }
      });

      // Add image if changed
      if (imageFile) {
        formDataToSend.append('photo_profil', imageFile);
      }

      // Update profile using the dedicated endpoint
      const response = await axiosInstance.patch(
        `/auth/users/me/update/`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data.status === 'success') {
        setSuccessMessage('Profil mis à jour avec succès !');
        setUserData(formData);
        setIsEditing(false);
        
        // Update localStorage with new data
        if (formData.firstName && formData.lastName) {
          localStorage.setItem('nom_complet', `${formData.firstName} ${formData.lastName}`);
        }
        
        // Refresh user data from API
        setTimeout(() => {
          fetchUserProfile();
        }, 500);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(
        err.response?.data?.message || 
        'Erreur lors de la mise à jour du profil. Veuillez réessayer.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setImagePreview(userData.profileImage);
    setImageFile(null);
    setIsEditing(false);
    setError(null);
    setSuccessMessage('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get sexe display
  const getSexeDisplay = (sexe) => {
    const sexeMap = {
      'M': 'Masculin',
      'F': 'Féminin',
      'H': 'Homme',
      'Femme': 'Femme'
    };
    return sexeMap[sexe] || sexe || 'Non spécifié';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="text-4xl text-orange-500 animate-spin" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-gray-800">
          <FaUser className="text-orange-500" /> Mon Profil
        </h1>
        {!isEditing && (
          <button 
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit /> Modifier le profil
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr]">
        
        {/* Left Section - Profile Image */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 text-center flex flex-col items-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                <FaUser className="text-5xl md:text-6xl" />
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-0 left-0 right-0 bg-black/60 py-2 cursor-pointer hover:bg-black/80 transition-all duration-300 flex items-center justify-center">
                <FaCamera className="text-white text-lg" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {userData.firstName} {userData.lastName}
          </h2>
          <p className="text-gray-600 text-sm mb-1">{userData.position}</p>
          <p className="text-gray-500 text-xs">
            {userData.is_active ? '✅ Compte actif' : '❌ Compte inactif'}
          </p>
          <div className="mt-3 w-full border-t border-orange-200 pt-3">
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Matricule:</span> {userData.employeeId || 'Non assigné'}
            </p>
          </div>
        </div>

        {/* Right Section - Profile Details */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* First Name */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <FaUser className="text-orange-500 text-xs" /> Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    required
                  />
                ) : (
                  <p className="px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700">
                    {userData.firstName || 'Non renseigné'}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <FaUser className="text-orange-500 text-xs" /> Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    required
                  />
                ) : (
                  <p className="px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700">
                    {userData.lastName || 'Non renseigné'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <FaEnvelope className="text-orange-500 text-xs" /> Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    required
                  />
                ) : (
                  <p className="px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700">
                    {userData.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <FaPhone className="text-orange-500 text-xs" /> Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  />
                ) : (
                  <p className="px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700">
                    {userData.phone || 'Non renseigné'}
                  </p>
                )}
              </div>

              {/* Sexe */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <FaVenusMars className="text-orange-500 text-xs" /> Sexe
                </label>
                {isEditing ? (
                  <select
                    name="sexe"
                    value={formData.sexe || ''}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  >
                    <option value="">Non spécifié</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                ) : (
                  <p className="px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700">
                    {getSexeDisplay(userData.sexe)}
                  </p>
                )}
              </div>

              {/* Date de naissance */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <FaCalendarAlt className="text-orange-500 text-xs" /> Date de naissance
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance || ''}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  />
                ) : (
                  <p className="px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700">
                    {formatDate(userData.dateNaissance)}
                  </p>
                )}
              </div>

              {/* Address - Full Width */}
              <div className="flex flex-col md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <FaMapMarkerAlt className="text-orange-500 text-xs" /> Adresse
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse || ''}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  />
                ) : (
                  <p className="px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700">
                    {userData.adresse || 'Non renseigné'}
                  </p>
                )}
              </div>

              {/* Bio - Full Width */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 mb-1.5">
                  Biographie
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 resize-y"
                  />
                ) : (
                  <p className="px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700 leading-relaxed">
                    {userData.bio}
                  </p>
                )}
              </div>

              {/* Role - Read Only */}
              <div className="flex flex-col md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <FaBuilding className="text-orange-500 text-xs" /> Rôle
                </label>
                <div className="px-3 py-2.5 bg-orange-50 rounded-lg text-orange-700 font-medium">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {userData.position || userData.role || 'Non assigné'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t-2 border-gray-100">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave /> Enregistrer
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-400 text-white rounded-lg font-medium hover:bg-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/30 hover:-translate-y-0.5"
                  onClick={handleCancel}
                >
                  <FaTimes /> Annuler
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;