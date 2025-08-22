import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <div className="logo-content">
            <span className="logo-icon">🏷️</span>
            <div className="logo-text">
              <h1>PetroDollar</h1>
              <span className="logo-subtitle">Pro</span>
            </div>
          </div>
        </Link>

        <nav className={`nav ${isMobileMenuOpen ? 'nav-mobile-open' : ''}`}>
          <Link 
            to="/" 
            className={isActive('/')}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link 
            to="/categories" 
            className={isActive('/categories')}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📂</span>
            <span className="nav-text">Catégories</span>
          </Link>
          <Link 
            to="/labels" 
            className={isActive('/labels')}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">🏷️</span>
            <span className="nav-text">Étiquettes</span>
          </Link>
          <Link 
            to="/print" 
            className={isActive('/print')}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">🖨️</span>
            <span className="nav-text">Impression</span>
          </Link>
          <Link 
            to="/settings" 
            className={isActive('/settings')}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Paramètres</span>
          </Link>
        </nav>

        <div className="header-actions">
          <button className="btn-logout" title="Déconnexion" onClick={onLogout}>
            <span>🚪</span>
          </button>
        </div>

        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Menu mobile"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;