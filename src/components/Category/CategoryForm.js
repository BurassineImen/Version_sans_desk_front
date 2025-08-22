import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../Common/Button';
import Input from '../Common/Input';

const CategoryForm = ({ onClose }) => {
  const { addCategory } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCategory(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <h3>Nouvelle Catégorie</h3>
      
      <Input
        label="Nom"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        type="textarea"
      />
      
      <Input
        label="Couleur"
        value={formData.color}
        onChange={(e) => setFormData({...formData, color: e.target.value})}
        type="color"
      />
      
      <div className="form-actions">
        <Button type="submit" variant="primary">Créer</Button>
        <Button type="button" onClick={onClose} variant="secondary">Annuler</Button>
      </div>
    </form>
  );
};

export default CategoryForm;