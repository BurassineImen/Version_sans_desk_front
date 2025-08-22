import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Assuming you have a CSS file for styling

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Section principale */}
        <div className="footer-content">
          {/* Colonne 1 - À propos */}
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="footer-icon">🏷️</span>
              LabelPrint Pro
            </h3>
            <p className="footer-description">
              Solution professionnelle pour la création et l'impression 
              d'étiquettes produit. Gérez vos rayons avec simplicité et efficacité.
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Utilisateurs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Étiquettes créées</span>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Navigation */}
          <div className="footer-section">
            <h4 className="footer-section-title">Navigation</h4>
            <nav className="footer-nav">
              <Link to="/" className="footer-link">
                <span className="footer-link-icon">📊</span>
                Dashboard
              </Link>
              <Link to="/categories" className="footer-link">
                <span className="footer-link-icon">📂</span>
                Catégories
              </Link>
              <Link to="/labels" className="footer-link">
                <span className="footer-link-icon">🏷️</span>
                Étiquettes
              </Link>
              <Link to="/print" className="footer-link">
                <span className="footer-link-icon">🖨️</span>
                Impression
              </Link>
            </nav>
          </div>

          {/* Colonne 3 - Support */}
          <div className="footer-section">
            <h4 className="footer-section-title">Support</h4>
            <nav className="footer-nav">
              <a href="#" className="footer-link">
                <span className="footer-link-icon">📖</span>
                Documentation
              </a>
              <a href="#" className="footer-link">
                <span className="footer-link-icon">🎥</span>
                Tutoriels
              </a>
              <a href="#" className="footer-link">
                <span className="footer-link-icon">💬</span>
                Support
              </a>
              <a href="#" className="footer-link">
                <span className="footer-link-icon">🐛</span>
                Signaler un bug
              </a>
            </nav>
          </div>

          {/* Colonne 4 - Contact */}
          <div className="footer-section">
            <h4 className="footer-section-title">Contact</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span className="contact-text">support@labelprint.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">+33 1 23 45 67 89</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <span className="contact-text">www.labelprint.com</span>
              </div>
            </div>
            
            {/* Réseaux sociaux */}
            <div className="footer-social">
              <a href="#" className="social-link" title="LinkedIn">
                <span>💼</span>
              </a>
              <a href="#" className="social-link" title="Twitter">
                <span>🐦</span>
              </a>
              <a href="#" className="social-link" title="YouTube">
                <span>📺</span>
              </a>
              <a href="#" className="social-link" title="GitHub">
                <span>💻</span>
              </a>
            </div>
          </div>
        </div>

        {/* Section inférieure */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-legal">
              <span className="copyright">
                © {currentYear} LabelPrint Pro. Tous droits réservés.
              </span>
              <div className="legal-links">
                <a href="#" className="legal-link">Conditions d'utilisation</a>
                <a href="#" className="legal-link">Politique de confidentialité</a>
                <a href="#" className="legal-link">Cookies</a>
              </div>
            </div>
            
            <div className="footer-version">
              <span className="version-info">
                <span className="version-icon">🔧</span>
                Version 2.1.0
              </span>
              <span className="build-info">Build 2024.12.15</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;