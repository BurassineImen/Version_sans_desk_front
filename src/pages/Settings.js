import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    issueDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  // Pre-made issue messages
  const presetMessages = [
    {
      id: '1',
      label: 'Problème d\'affichage',
      description: 'L\'interface utilisateur présente des erreurs d\'affichage ou des éléments mal alignés.',
    },
    {
      id: '2',
      label: 'Erreur de fonctionnalité',
      description: 'Une fonctionnalité spécifique (par exemple, ajout d\'étiquette, impression) ne fonctionne pas comme prévu.',
    },
    {
      id: '3',
      label: 'Problème de performance',
      description: 'L\'application est lente ou ne répond pas correctement.',
    },
  ];

  // Initialize EmailJS and verify configuration
  useEffect(() => {
    // Log environment variables for debugging
    console.log('Environment variables:', {
      serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
      templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
    });

    if (!process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS Public Key is missing. Add REACT_APP_EMAILJS_PUBLIC_KEY to .env');
      setSubmitMessage('Erreur : Clé publique EmailJS manquante. Contactez l’administrateur.');
      return;
    }
    if (!process.env.REACT_APP_EMAILJS_SERVICE_ID) {
      console.error('EmailJS Service ID is missing. Add REACT_APP_EMAILJS_SERVICE_ID to .env');
      setSubmitMessage('Erreur : ID de service EmailJS manquant. Contactez l’administrateur.');
      return;
    }
    if (!process.env.REACT_APP_EMAILJS_TEMPLATE_ID) {
      console.error('EmailJS Template ID is missing. Add REACT_APP_EMAILJS_TEMPLATE_ID to .env');
      setSubmitMessage('Erreur : ID de modèle EmailJS manquant. Contactez l’administrateur.');
      return;
    }

    try {
      emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('EmailJS initialization failed:', error);
      setSubmitMessage('Erreur d’initialisation EmailJS. Contactez l’administrateur.');
    }
  }, []);

  const handlePresetChange = (e) => {
    const selectedId = e.target.value;
    setSelectedPreset(selectedId);
    const preset = presetMessages.find((msg) => msg.id === selectedId);
    setFormData({
      ...formData,
      issueDescription: preset ? preset.description : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.issueDescription.trim()) {
      setSubmitMessage('Veuillez fournir une description du problème.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // EmailJS sending logic
      // Verify your EmailJS template uses {{the_project}} and {{the_email}}.
      // The email you received shows these placeholders, so the payload must match.
      // If the template still doesn’t populate, recreate it in EmailJS with exact field names.
      const payload = {
        the_project: formData.issueDescription,
        the_email: 'no-reply@tunivita.com',
      };
      console.log('Sending payload to EmailJS:', payload); // Debug payload
      const response = await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        payload
      );

      console.log('EmailJS response:', response); // Debug full response
      if (response.status === 200) {
        setSubmitMessage('Votre problème a été signalé avec succès. Vous recevrez une réponse dans les 24 heures.');
        setFormData({ issueDescription: '' });
        setSelectedPreset('');
      } else {
        throw new Error(`Réponse inattendue d’EmailJS: Status ${response.status}`);
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      let errorMessage = 'Erreur lors de l’envoi de l’email. Réessayez plus tard ou contactez directement bourassineimen5@gmail.com.';
      if (error.text) {
        if (error.text.includes('Bad Request')) {
          errorMessage = 'Erreur : Les champs {{the_project}} et {{the_email}} ne correspondent pas au modèle. Vérifiez ou recréez le modèle dans EmailJS.';
        } else if (error.text.includes('Unauthorized')) {
          errorMessage = 'Erreur : Clé publique EmailJS invalide. Vérifiez REACT_APP_EMAILJS_PUBLIC_KEY dans .env.';
        } else if (error.text.includes('Service ID not found')) {
          errorMessage = 'Erreur : ID de service EmailJS invalide. Vérifiez REACT_APP_EMAILJS_SERVICE_ID dans .env.';
        } else {
          errorMessage = `Erreur EmailJS : ${error.text}. Contactez l’administrateur.`;
        }
      } else if (error.message) {
        errorMessage = `Erreur : ${error.message}`;
      }
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ issueDescription: '' });
    setSelectedPreset('');
    setSubmitMessage('');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Paramètres</h1>
        <Link to="/" className="btn btn-primary">
          Retour
        </Link>
      </div>

      <div className="issue-form">
        <h3>Signaler un problème</h3>
        <p>
          Décrivez votre problème ci-dessous ou choisissez un message prédéfini. Votre message sera envoyé à{' '}
          <a href="mailto:bourassineimen5@gmail.com">bourassineimen5@gmail.com</a>, avec une réponse garantie dans les 24 heures.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="presetMessages">Messages prédéfinis</label>
            <select
              id="presetMessages"
              value={selectedPreset}
              onChange={handlePresetChange}
              className="form-select"
            >
              <option value="">Choisir un message prédéfini (facultatif)</option>
              {presetMessages.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="issueDescription">Description du problème *</label>
            <textarea
              id="issueDescription"
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              placeholder="Décrivez le problème que vous rencontrez..."
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </form>
        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('succès') ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;