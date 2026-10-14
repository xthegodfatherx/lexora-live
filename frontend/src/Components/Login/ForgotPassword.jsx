import React, { useState } from 'react';
import axiosInstance from '../../axios';
import { useNavigate } from 'react-router-dom';

import logoImg from '../../Assets/Images/logologinsonatrach.svg';
import { IoIosArrowBack } from "react-icons/io";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', isError: false });

    try {
      // Utilisation du bon endpoint : reset-password/
      await axiosInstance.post('/auth/reset-password/', { email });
      setMessage({
        text: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
        isError: false
      });
    } catch (error) {
      console.error("Erreur:", error);
      let errorMessage = 'Une erreur est survenue. Veuillez vérifier votre email et réessayer.';
      
      if (error.response) {
        // Si le serveur renvoie un message d'erreur spécifique
        errorMessage = error.response.data.message || errorMessage;
        
        // Si l'utilisateur n'est pas trouvé
        if (error.response.status === 404) {
          errorMessage = 'Aucun compte associé à cet email.';
        }
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
              Mot de passe oublié
            </h2>

            <div className='w-full md:w-[80%]'>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold font-[Poppins] text-gray-700 text-left">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 w-full px-4 py-2 border rounded-full text-[#FF8500] border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Entrez votre email"
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
                      Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer le lien'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;