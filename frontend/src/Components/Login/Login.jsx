import React, { useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import axiosInstance from '../../axios';
import logoImg from '../../Assets/Images/image.png';

function Login() {
  const [formData, updateFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    updateFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const getRolePath = (role) => {
    const rolePaths = {
      'admin':                          '/admin',
      'agent':                          '/agent',
      'vice_presedent':                 '/vice-president',
      'directeur_direction':            '/directeur-direction',
      'responsable_departement':        '/responsable-departement',
      'directeur_centrale':             '/directeur-centrale',
      'assistant_directeur_centrale':   '/assistant-directeur-centrale',
      'directeur_direction_activite':   '/directeur-direction-activite',
      'directeur_division_activite':    '/directeur-division-activite',
      'responsable_direction_division': '/responsable-direction-division',
      'responsable_departement_division': '/responsable-departement-division',
    };
    return rolePaths[role] || '/login';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/login/', {
        email: formData.email,
        password: formData.password,
      });

      const {
        access, refresh, role, nom_complet, photo_profil,
        user_id, activite_id, direction_id, departement_id,
        direction_centrale_id, structure_id,
        direction_activite_id, division_activite_id,
        activite_detail, direction_detail, departement_detail, direction_centrale_detail,
        direction_activite_detail, division_activite_detail, structure_detail,
      } = response.data;

      // `role` peut être null (compte sans rôle attribué) : aucun layout ne l'acceptera.
      if (!role) {
        setErrorMessage("Votre compte n'a pas encore de rôle attribué. Contactez l'administrateur.");
        return;
      }

      localStorage.setItem('access_token',           access);
      localStorage.setItem('refresh_token',          refresh);
      localStorage.setItem('role',                   role);
      localStorage.setItem('nom_complet',            nom_complet);
      localStorage.setItem('user_id',                user_id);
      localStorage.setItem('photo_profil',           photo_profil || '');
      if (activite_id)            localStorage.setItem('activite_id',            activite_id);
      if (direction_id)           localStorage.setItem('direction_id',           direction_id);
      if (departement_id)         localStorage.setItem('departement_id',         departement_id);
      if (direction_centrale_id)  localStorage.setItem('direction_centrale_id',  direction_centrale_id);
      if (structure_id)           localStorage.setItem('structure_id',           structure_id);
      if (direction_activite_id)  localStorage.setItem('direction_activite_id',  direction_activite_id);
      if (division_activite_id)   localStorage.setItem('division_activite_id',   division_activite_id);

      // Nom de l'unité d'organisation (résolu par le backend au login) — affiché sur la page Profil.
      const orgDetail = departement_detail || direction_detail || direction_centrale_detail || activite_detail
        || direction_activite_detail || division_activite_detail || structure_detail;
      localStorage.setItem('org_unit_nom', orgDetail?.nom || '');

      axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + access;
      navigate(getRolePath(role));
    } catch (error) {
      console.error('Erreur de connexion :', error);
      const serverMessage = error.response?.data?.message || error.response?.data?.detail;
      if (serverMessage) setErrorMessage(serverMessage);
      else if (!error.response) setErrorMessage("Le serveur n'a pas répondu. Ouvrez http://localhost:3000 et réessayez.");
      else setErrorMessage('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 sm:p-6">
      <div className="relative w-full max-w-5xl min-h-[560px] md:h-[600px] flex shadow-lg rounded-2xl overflow-hidden bg-white border border-gray-200">
        {/* Image en fond d'écran flouté sur mobile/tablette */}
        <div className="absolute inset-0 md:hidden">
          <img className="w-full h-full object-cover" src={logoImg} alt="" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        {/* Image en colonne sur desktop */}
        <div className="hidden md:block md:w-1/2">
          <img className="w-full h-full object-cover" src={logoImg} alt="Login" />
        </div>

        <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center items-center px-4 py-10 sm:px-6 md:px-12">
          <div className="w-full max-w-sm md:max-w-none md:w-[80%] bg-white/95 md:bg-transparent rounded-2xl md:rounded-none shadow-xl md:shadow-none p-6 sm:p-8 md:p-0">
            <h2 className="text-xl font-bold text-center md:text-left mb-6 md:mb-4">
              <span className="text-[#FF8500]">SONATRACH</span>
              <span className="text-gray-800">LEXORA</span>
            </h2>
            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 text-left">
                  Email
                </label>
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  className="mt-1 w-full px-4 py-2 border rounded-full text-myorange border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 text-left">
                  Mot de passe
                </label>
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  className="mt-1 w-full px-4 py-2 border rounded-full text-myorange border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={handleChange}
                />
              </div>
              {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
              <div className="text-sm text-myorange text-right">
                <NavLink to="/mot-de-passe-oublie" className="hover:underline">
                  Mot de passe oublié ?
                </NavLink>
              </div>
              <button
                type="submit"
                className="w-full mt-2 sm:mt-4 py-3 text-white bg-gradient-to-r from-myorange to-orange-400 rounded-full font-semibold text-lg shadow-md hover:opacity-90"
              >
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;