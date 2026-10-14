import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import logoImg from '../../Assets/Images/logologinsonatrach.svg';
import { IoIosArrowBack } from "react-icons/io";

function ResetPasswordConfirm() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      setMessage({
        text: 'Les mots de passe ne correspondent pas.',
        isError: true
      });
      return;
    }

    // Vérification de la longueur du mot de passe
    if (newPassword.length < 6) {
      setMessage({
        text: 'Le mot de passe doit contenir au moins 6 caractères.',
        isError: true
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', isError: false });

    try {
      // Appel à l'endpoint reset-password-confirm/
      await axiosInstance.post('/auth/reset-password-confirm/', {
        uid,
        token,
        new_password: newPassword
      });
      
      setIsSuccess(true);
      setMessage({
        text: 'Votre mot de passe a été réinitialisé avec succès !',
        isError: false
      });

      // Redirection vers login après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error("Erreur:", error);
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setMessage({
        text: errorMessage,
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100vh] w-screen flex items-center justify-center bg-gray-100">
      <div className="w-screen h-screen flex shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200">
        {/* Left Side - Image */}
        <div className="w-1/2 h-full hidden md:block">
          <img className="w-full h-full object-cover" src={logoImg} alt="Login" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex flex-col px-6 md:px-12 py-8 bg-white rounded-lg relative">
          <button
            onClick={() => navigate('/login')}
            className="mb-4 flex items-center text-[#FF8500] font-semibold hover:underline"
          >
            <IoIosArrowBack className="mr-1 text-xl" />
            Retour
          </button>

          <div className="flex flex-col justify-center items-center flex-grow">
            <h2 className="text-2xl font-bold text-[#FF8500] text-center mb-6">
              {isSuccess ? 'Succès !' : 'Nouveau mot de passe'}
            </h2>

            <div className='w-full md:w-[80%]'>
              {!isSuccess ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-semibold font-[Poppins] text-gray-700 text-left">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="mt-1 w-full px-4 py-2 border rounded-full text-[#FF8500] border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold font-[Poppins] text-gray-700 text-left">
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="mt-1 w-full px-4 py-2 border rounded-full text-[#FF8500] border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Confirmez votre mot de passe"
                    />
                  </div>

                  {message.text && (
                    <div className={`p-3 rounded-lg text-sm ${
                      message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full mt-4 py-3 font-nunito text-white bg-gradient-to-r from-[#FF8500] to-orange-600 rounded-full font-semibold text-lg shadow-md transition-opacity ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Réinitialisation...
                      </span>
                    ) : (
                      'Réinitialiser le mot de passe'
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                    {message.text}
                  </div>
                  <p className="text-gray-600">
                    Vous allez être redirigé vers la page de connexion...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordConfirm;