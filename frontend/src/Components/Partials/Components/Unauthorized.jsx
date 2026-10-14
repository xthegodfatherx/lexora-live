import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 text-center">
    <h1 className="text-6xl font-bold text-myorange mb-4">403</h1>
    <p className="text-2xl font-semibold text-gray-800 mb-2">Accès non autorisé</p>
    <p className="text-gray-500 mb-6 max-w-md">
      Vous n'avez pas les droits nécessaires pour accéder à cette page.
      Connectez-vous avec un compte disposant des autorisations requises.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-myorange text-white rounded-full font-semibold shadow-md hover:opacity-90"
    >
      Retour à l'accueil
    </Link>
  </div>
);

export default Unauthorized;
