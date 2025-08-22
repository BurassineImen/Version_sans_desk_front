import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Labels from './pages/Labels';
import LabelToday from './pages/LabelToday';
import Print from './pages/Print';
import Settings from './pages/Settings';
import './styles/globals.css';

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
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
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

// PrivateRoute component to protect authenticated routes
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleLogin = (username, password) => {
    // TODO: Replace with secure authentication (e.g., API call or OAuth)
    // For demo purposes, checking against environment variables or a mock check
    const validUsername = process.env.REACT_APP_ADMIN_USERNAME || 'Admin';
    const validPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'mekki/';

    if (username === validUsername && password === validPassword) {
      setIsAuthenticated(true);
    } else {
      setAlertMessage('Identifiants incorrects. Veuillez utiliser les identifiants valides.');
      setShowAlert(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AppProvider>
      <Router>
        <div className="app">
          {showAlert && (
            <CustomAlert
              message={alertMessage}
              onClose={() => setShowAlert(false)}
            />
          )}
          <Routes>
            <Route
              path="/login"
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <>
                    <Header onLogout={handleLogout} />
                    <main className="main-content">
                      <Dashboard />
                    </main>
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <>
                    <Header onLogout={handleLogout} />
                    <main className="main-content">
                      <Categories />
                    </main>
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/labels"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <>
                    <Header onLogout={handleLogout} />
                    <main className="main-content">
                      <Labels />
                    </main>
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/print"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <>
                    <Header onLogout={handleLogout} />
                    <main className="main-content">
                      <Print />
                    </main>
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/labelsToday"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <>
                    <Header onLogout={handleLogout} />
                    <main className="main-content">
                      <LabelToday />
                    </main>
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <>
                    <Header onLogout={handleLogout} />
                    <main className="main-content">
                      <Settings />
                    </main>
                  </>
                </PrivateRoute>
              }
            />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;