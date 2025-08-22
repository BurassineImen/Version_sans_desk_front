import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Masquer l'écran de chargement une fois React chargé
const hideLoading = () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
};

// Créer le root React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendre l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Masquer le chargement après le rendu
setTimeout(hideLoading, 100);