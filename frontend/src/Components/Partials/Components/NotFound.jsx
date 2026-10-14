import React from 'react';
import '../Styles/NotFound.css';
import notFoundImg from '../../../Assets/Images/not-found.png'

const NotFound = () => {
    return (
        <div className="not-found-container">
            <img
                src={notFoundImg} // lien image d'illustration
                alt="Page non trouvée"
                className="not-found-image"
            />
            <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h1>404</h1>
                <p className="error-title">Page non trouvée</p>
                <p className="error-text">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <a href="/" className="home-button">Retour à l'accueil</a>
            </div>
        </div>
    );
};

export default NotFound;
