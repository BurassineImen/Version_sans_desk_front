import React, { useState } from 'react';
import './Login.css';

// Custom Alert Component
const CustomAlert = ({ message, onClose }) => {
  return (
    <div className="custom-alert-modal">
      <div className="custom-alert-content">
        <p>{message}</p>
        <button className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
      <style jsx>{`
        .custom-alert-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .custom-alert-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 400px;
          text-align: center;
        }
        .custom-alert-content p {
          margin-bottom: 20px;
          font-size: 16px;
          color: #333;
        }
      `}</style>
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // empêche le rechargement
    if (!username.trim() || !password.trim()) {
      const message = 'Veuillez remplir tous les champs';
      setAlertMessage(message);
      setShowAlert(true);
      return;
    }
    try {
      // Assuming onLogin returns a promise or throws an error on failure
      await onLogin(username, password);
    } catch (error) {
      console.error('Erreur de connexion :', error);
      const message =
        error.message.includes('network')
          ? 'Erreur réseau : impossible de se connecter au serveur'
          : error.message || 'Nom d\'utilisateur ou mot de passe incorrect';
      setAlertMessage(message);
      setShowAlert(true);
    }
  };

  return (
    <div className="login-container">
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="login-box">
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                console.log('Username changed to:', e.target.value); // debug
                setUsername(e.target.value);
              }}
              placeholder="Nom d'utilisateur"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                console.log('Password changed to:', e.target.value); // debug
                setPassword(e.target.value);
              }}
              placeholder="Mot de passe"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Se connecter
          </button>
        </form>
      </div>
      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f2f5;
          font-family: 'Arial', sans-serif;
        }
        .login-box {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        .login-box h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
        .btn {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-primary:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default Login;