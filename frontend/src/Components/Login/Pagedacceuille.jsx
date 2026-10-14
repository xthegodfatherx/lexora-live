import React, { useState, useEffect, useRef } from 'react';
import './Styles/IntroPage.css';
import Typed from 'typed.js';

import Login from './Login';
import logoImage from '../../Assets/Icons/sonatrach.png'; // <-- normal import

function Pagedacceuille() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const typedElement = useRef(null);
  const typedInstance = useRef(null);

  useEffect(() => {
    typedInstance.current = new Typed(typedElement.current, {
      strings: ['SONATRACH LEXORA'],
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 1600,
      loop: true,
    });

    return () => {
      if (typedInstance.current) {
        typedInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      {!isVisible && (
        <div className="introPage">
          {/* Use <img> for PNG */}
          <img src={logoImage} alt="SONATRACH Logo" className="log-img" style={{ height: '100px' }} />

          <div style={{ marginTop: "1rem" }}>
            <span
              ref={typedElement}
              className="multi-texte"
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: "2rem",
                color: "#FF8500", // fixed color
                fontWeight: "500"
              }}
            ></span>
          </div>

          <div className="company-logo">
            <span>made by</span>
            <div className="meta-company">
              <span className="text-myorange">A Group of CS Students</span>
            </div>
          </div>
        </div>
      )}
      {isVisible && <Login />}
    </div>
  );
}

export default Pagedacceuille;
