import React, { useState, useEffect, useRef } from 'react';
import './Styles/IntroPage.css';
import { ReactComponent as LogoIcon } from '../../Assets/Icons/logo.svg';
import Typed from 'typed.js';

function IntroPage({ onTimeout }) {
    const [isVisible, setIsVisible] = useState(true);
    const typedElement = useRef(null);
    const typedInstance = useRef(null);

    useEffect(() => {
        // Lancer l'animation Typed
        typedInstance.current = new Typed(typedElement.current, {
            strings: ['Code Grade'],
            typeSpeed: 80,
            backSpeed: 40,
            backDelay: 1600,
            loop: true,
        });

        // Nettoyage
        return () => {
            if (typedInstance.current) {
                typedInstance.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onTimeout();
        }, 3000); // Afficher pendant 3 secondes

        return () => clearTimeout(timer);
    }, [onTimeout]);

    return (
        isVisible && (
            <div className="introPage">

                <LogoIcon className="log-img" style={{ height: '100px' }} />

                <div style={{ marginTop: "1rem" }}>
                    <span ref={typedElement} className="multi-texte" style={{ fontFamily: "Nunito, sans-serif", fontSize: "2rem", color: "#925FE2", fontWeight: "500" }}></span>
                </div>

                <div className="company-logo">
                    <span>made with ❤️ by</span>
                    <div className="meta-company">
                        <span className="gradiant-text">A Group of CS Students</span>
                    </div>
                </div>
            </div>
        )
    );
}

export default IntroPage;
