import React, { useState, useEffect } from 'react';
import './Categories.css';

// Custom Alert Component
const CustomAlert = ({ message, onClose, showConfirm = false, onConfirm }) => {
  return (
    <div className="custom-alert-modal">
      <div className="custom-alert-content">
        <p>{message}</p>
        <div className="custom-alert-actions">
          {showConfirm && (
            <button className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
          )}
          <button className="btn btn-primary" onClick={showConfirm ? onConfirm : onClose}>
            {showConfirm ? 'Confirmer' : 'OK'}
          </button>
        </div>
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
        .custom-alert-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .btn {
          padding: 10px 20px;
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
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn-secondary:hover {
          background: #545b62;
        }
      `}</style>
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState(null);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#3b82f6' });
  };

  const fetchCategories = async () => {
    try {
      console.log("Appel fetch Categories...");
      const response = await fetch('http://localhost:5000/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        const message = 'Erreur lors du chargement des catégories';
        setAlertMessage(message);
        setShowAlert(true);
      }
    } catch (error) {
      const message = 'Erreur de connexion: ' + error.message;
      setAlertMessage(message);
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/categories/category/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Échec de la suppression de la catégorie');
      }

      console.log(`Catégorie ${id} supprimée avec succès`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie :', error);
      const message = 'Erreur lors de la suppression de la catégorie';
      setAlertMessage(message);
      setShowAlert(true);
      return false;
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const response = await fetch('http://localhost:5000/categories/addCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l’ajout de la catégorie');
      }

      const newCategory = await response.json();
      console.log('Catégorie ajoutée :', newCategory);
      return newCategory;
    } catch (error) {
      console.error('Erreur lors de l’ajout :', error);
      const message = 'Erreur lors de la création de la catégorie';
      setAlertMessage(message);
      setShowAlert(true);
      return null;
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const response = await fetch(`http://localhost:5000/categories/category/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la catégorie');
      }

      const updatedCategory = await response.json();
      console.log('Catégorie mise à jour:', updatedCategory);
      return updatedCategory;
    } catch (error) {
      console.error(error);
      const message = 'Erreur lors de la mise à jour de la catégorie';
      setAlertMessage(message);
      setShowAlert(true);
      return null;
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editCategory && formData.name.trim()) {
      await updateCategory(editCategory.id, formData);
      await fetchCategories();
      resetForm();
      setShowEditPanel(false);
      setEditCategory(null);
      setAlertMessage('Catégorie mise à jour avec succès');
      setShowAlert(true);
    } else {
      setAlertMessage('Le nom de la catégorie est requis');
      setShowAlert(true);
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
    });
    setShowEditPanel(true);
  };

  const handleDelete = (id) => {
    if (id) {
      setAlertMessage('Êtes-vous sûr de vouloir supprimer cette catégorie ? Les étiquettes associées seront également supprimées.');
      setShowConfirm(true);
      setConfirmAction(() => async () => {
        const success = await deleteCategory(id);
        if (success) {
          await fetchCategories();
          setAlertMessage('Catégorie supprimée avec succès');
          setShowAlert(true);
        }
        setShowConfirm(false);
      });
    }
  };

  const handleColorChange = (value) => {
    if (value.startsWith('#')) {
      setFormData({ ...formData, color: value });
    } else {
      setFormData({ ...formData, color: `#${value}` });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const newCat = await addCategory(formData);
      if (newCat) {
        await fetchCategories();
        resetForm();
        setShowCreatePanel(false);
        setAlertMessage('Catégorie ajoutée avec succès');
        setShowAlert(true);
      }
    } else {
      setAlertMessage('Le nom de la catégorie est requis');
      setShowAlert(true);
    }
  };

  const handleCreateCancel = () => {
    setShowCreatePanel(false);
    resetForm();
  };

  const handleEditCancel = () => {
    setShowEditPanel(false);
    setEditCategory(null);
    resetForm();
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  return (
    <div className="categories-page">
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      {showConfirm && (
        <CustomAlert
          message={alertMessage}
          showConfirm={true}
          onConfirm={confirmAction}
          onClose={() => setShowConfirm(false)}
        />
      )}
      <div className="page-header">
        <h1>Gestion des Catégories</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreatePanel(true)}
        >
          ➕ Nouvelle catégorie
        </button>
      </div>
      {categories ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header" style={{ backgroundColor: category.color }}>
                <h3>{category.name}</h3>
              </div>
              <div className="category-content">
                <p>{category.description || 'Aucune description'}</p>
              </div>
              <div className="category-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEdit(category)}
                >
                  ✏️ Modifier
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(category.id)}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Aucune catégorie créée pour le moment</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreatePanel(true)}
          >
            Créer votre première catégorie
          </button>
        </div>
      )}

      {/* Panneau de création */}
      {showCreatePanel && (
        <div className="create-panel">
          <div className="create-panel-content">
            <button
              className="create-panel-close"
              onClick={handleCreateCancel}
              aria-label="Fermer"
            >
              ×
            </button>
            <h3>Créer une nouvelle catégorie</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label htmlFor="create-name">Nom *</label>
                <input
                  type="text"
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Fruits"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-description">Description</label>
                <textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la catégorie..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-color">Couleur</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="create-color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#000000"
                    className="color-text-input"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    title="Entrez un code couleur hexadécimal (ex: #FF0000 ou FF0000)"
                  />
                </div>
                <small className="color-help">
                  Utilisez le sélecteur de couleur ou entrez un code hexadécimal (ex: #FF0000)
                </small>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Créer la catégorie
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCreateCancel}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Panneau d'édition */}
      {showEditPanel && editCategory && (
        <div className="edit-panel">
          <div className="edit-panel-content">
            <button
              className="edit-panel-close"
              onClick={handleEditCancel}
              aria-label="Fermer"
            >
              ×
            </button>
            <h3>Modifier la catégorie : {editCategory.name}</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-name">Nom *</label>
                <input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-color">Couleur</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="edit-color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#000000"
                    className="color-text-input"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    title="Entrez un code couleur hexadécimal (ex: #FF0000 ou FF0000)"
                  />
                </div>
                <small className="color-help">
                  Utilisez le sélecteur de couleur ou entrez un code hexadécimal (ex: #FF0000)
                </small>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Sauvegarder les modifications
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleEditCancel}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style jsx>{`
        .categories-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Arial', sans-serif;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        .category-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }
        .category-card:hover {
          transform: translateY(-5px);
        }
        .category-header {
          padding: 15px;
          color: white;
        }
        .category-header h3 {
          margin: 0;
          font-size: 18px;
        }
        .category-content {
          padding: 15px;
        }
        .category-content p {
          margin: 0;
          color: #444;
        }
        .category-actions {
          padding: 10px 15px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          border-top: 1px solid #e0e0e0;
        }
        .create-panel, .edit-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .create-panel-content, .edit-panel-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          position: relative;
        }
        .create-panel-close, .edit-panel-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #333;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }
        .color-input-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .color-picker {
          width: 50px;
          height: 38px;
          padding: 0;
          border: none;
        }
        .color-text-input {
          flex: 1;
        }
        .color-help {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 12px;
        }
        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
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
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn-secondary:hover {
          background: #545b62;
        }
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        .btn-danger:hover {
          background: #b02a37;
        }
        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }
        .empty-state {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Categories;