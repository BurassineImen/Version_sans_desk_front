import React, { useState, useEffect } from 'react';

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

const Barcode = ({ value }) => {
  const [barcodeDataUrl, setBarcodeDataUrl] = useState('');

  useEffect(() => {
    generateBarcode(value);
  }, [value]);

  const generateBarcode = (code) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 200;
    const height = 60;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    const bars = generateEAN13Bars(code);

    ctx.fillStyle = 'black';
    const barWidth = width / bars.length;

    const barsArray = bars.split('');
    barsArray.forEach((bar, index) => {
      if (bar === '1') {
        ctx.fillRect(index * barWidth, 0, barWidth, height - 15);
      }
    });

    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(code, width / 2, height - 2);

    setBarcodeDataUrl(canvas.toDataURL());
  };

  const generateEAN13Bars = (code) => {
    const paddedCode = code.padEnd(13, '0').substring(0, 13);

    const startPattern = '101';
    const middlePattern = '01010';
    const endPattern = '101';

    const leftPatterns = [
      '0001101', '0011001', '0010011', '0111101', '0100011',
      '0110001', '0101111', '0111011', '0110117', '0001011'
    ];

    const rightPatterns = [
      '1110010', '1100110', '1101100', '1000010', '1011100',
      '1001110', '1010000', '1000100', '1001000', '1110100'
    ];

    let bars = startPattern;

    for (let i = 0; i < 6; i++) {
      const digit = parseInt(paddedCode[i] || '0');
      bars += leftPatterns[digit] || leftPatterns[0];
    }

    bars += middlePattern;

    for (let i = 6; i < 12; i++) {
      const digit = parseInt(paddedCode[i] || '0');
      bars += rightPatterns[digit] || rightPatterns[0];
    }

    bars += endPattern;

    return bars;
  };

  return (
    <div className="barcode-container">
      {barcodeDataUrl && (
        <img
          src={barcodeDataUrl}
          alt={`Code-barres ${value}`}
          className="barcode-image"
        />
      )}
    </div>
  );
};

// Fonction pour formater le prix en respectant la saisie utilisateur (ex: 2,90)
const formatPrice = (price) => {
  if (!price) return '';
  return String(price).replace('.', ',');
};

// Fonction pour convertir une chaîne avec virgule en nombre pour les calculs
const parseFrenchNumber = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(',', '.')) || 0;
};

const Labels = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    quantity: '',
    pricePerUnit: '',
    barcode: '',
    categoryId: '',
    description: '',
    unit: '',
    marketId: ''
  });
  const [calculatedPricePerUnit, setCalculatedPricePerUnit] = useState('');
  const [newLabelIds, setNewLabelIds] = useState([]);
  const [categories, setCategories] = useState(null);
  const [markets, setMarkets] = useState(null);
  const [products, setProducts] = useState([]);

  const fetchCategories = async () => {
    try {
      console.log("Appel fetch Categories...");
      const response = await fetch('http://localhost:5000/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setAlertMessage('Erreur lors du chargement des catégories');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage('Erreur de connexion: ' + error.message);
      setShowAlert(true);
    }
  };

  const fetchMarkets = async () => {
    try {
      console.log("Appel fetch Markets...");
      const response = await fetch('http://localhost:5000/markets');
      if (response.ok) {
        const data = await response.json();
        setMarkets(data);
      } else {
        setAlertMessage('Erreur lors du chargement des marchés');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage('Erreur de connexion: ' + error.message);
      setShowAlert(true);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = 'http://localhost:5000/products';
      if (selectedCategory) {
        url = `http://localhost:5000/categories/${selectedCategory}/products`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setAlertMessage('Erreur de connexion');
      setShowAlert(true);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const url = categoryId
        ? `http://localhost:5000/categories/${categoryId}/products`
        : `http://localhost:5000/products`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setAlertMessage('Erreur de connexion');
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMarkets();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (formData.price && formData.quantity && formData.unit) {
      const price = parseFrenchNumber(formData.price);
      const quantity = parseFrenchNumber(formData.quantity);
      let pricePerUnit = '';
      if (formData.unit === 'g') {
        pricePerUnit = quantity > 0 ? `prix/kg ${formatPrice((price / quantity * 1000).toFixed(2))}€` : '';
      } else if (formData.unit === 'ml' || formData.unit === 'l') {
        const quantityInLiters = formData.unit === 'ml' ? quantity / 1000 : quantity;
        pricePerUnit = quantityInLiters > 0 ? `prix/l ${formatPrice((price / quantityInLiters).toFixed(2))}€` : '';
      } else if (formData.unit === 'pièce') {
        pricePerUnit = quantity > 0 ? `prix/pc ${formatPrice((price / quantity).toFixed(2))}€` : '';
      }
      setCalculatedPricePerUnit(pricePerUnit);
    } else {
      setCalculatedPricePerUnit('');
    }
  }, [formData.price, formData.quantity, formData.unit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.name.trim() &&
      formData.price &&
      formData.quantity &&
      formData.categoryId &&
      formData.unit &&
      formData.marketId &&
      formData.barcode.trim()
    ) {
      const price = parseFrenchNumber(formData.price);
      const quantity = parseFrenchNumber(formData.quantity);
      let pricePerUnit = '';
      let unitForPricePerUnit = formData.unit;

      if (formData.unit === 'g') {
        pricePerUnit = quantity > 0 ? (price / quantity * 1000).toFixed(2) : '0,00';
        unitForPricePerUnit = 'kg';
      } else if (formData.unit === 'ml' || formData.unit === 'l') {
        const quantityInLiters = formData.unit === 'ml' ? quantity / 1000 : quantity;
        pricePerUnit = quantityInLiters > 0 ? (price / quantityInLiters).toFixed(2) : '0,00';
        unitForPricePerUnit = 'l';
      } else if (formData.unit === 'pièce') {
        pricePerUnit = quantity > 0 ? (price / quantity).toFixed(2) : '0,00';
        unitForPricePerUnit = 'pc';
      }

      const labelData = {
        name: formData.name,
        price: formatPrice(formData.price),
        quantity: formatPrice(formData.quantity),
        pricePerUnit: formatPrice(pricePerUnit),
        barcode: formData.barcode,
        categoryId: parseInt(formData.categoryId),
        marketId: parseInt(formData.marketId),
        description: formData.description,
        unit: unitForPricePerUnit,
      };

      try {
        const response = await fetch('http://localhost:5000/products/addProduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(labelData),
        });

        if (response.ok) {
          const newLabel = await response.json();
          if (newLabel && newLabel.id) {
            setNewLabelIds((prev) => [...prev, newLabel.id]);
            setTimeout(() => {
              setNewLabelIds((prev) => prev.filter((id) => id !== newLabel.id));
            }, 5000);
          }

          setFormData({
            id: null,
            name: '',
            price: '',
            quantity: '',
            pricePerUnit: '',
            barcode: '',
            categoryId: '',
            description: '',
            unit: '',
            marketId: '',
          });
          setShowModal(false);
          setIsEditing(false);
          setAlertMessage('Produit ajouté avec succès');
          setShowAlert(true);
          await fetchProductsByCategory(selectedCategory);
        } else {
          const errorData = await response.json();
          const message = errorData.error && errorData.error.includes('Validation error')
            ? 'Il y a une autre étiquette avec ce code-barres.'
            : errorData.error || 'Erreur lors de l’ajout du produit.';
          setAlertMessage(message);
          setShowAlert(true);
        }
      } catch (error) {
        console.error('Erreur réseau :', error);
        setAlertMessage('Erreur réseau lors de l’ajout du produit.');
        setShowAlert(true);
      }
    } else {
      setAlertMessage('Il faut remplir les champs vides');
      setShowAlert(true);
    }
  };

  const updateLabel = async (id, data) => {
    try {
      const response = await fetch(`http://localhost:5000/products/updateProduct/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.error && errorData.error.includes('Validation error')
          ? 'Il y a une autre étiquette avec ce code-barres.'
          : errorData.error || 'Erreur lors de la mise à jour du produit.';
        setAlertMessage(message);
        setShowAlert(true);
        return null;
      }

      const updatedLabel = await response.json();
      console.log('Produit mis à jour:', updatedLabel);
      return updatedLabel;
    } catch (error) {
      console.error(error);
      setAlertMessage('Erreur réseau lors de la mise à jour du produit.');
      setShowAlert(true);
      return null;
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.name.trim() &&
      formData.price &&
      formData.quantity &&
      formData.categoryId &&
      formData.unit &&
      formData.marketId &&
      formData.barcode.trim()
    ) {
      const price = parseFrenchNumber(formData.price);
      const quantity = parseFrenchNumber(formData.quantity);
      let pricePerUnit = '';
      let unitForPricePerUnit = formData.unit;

      if (formData.unit === 'g') {
        pricePerUnit = quantity > 0 ? (price / quantity * 1000).toFixed(2) : '0,00';
        unitForPricePerUnit = 'kg';
      } else if (formData.unit === 'ml' || formData.unit === 'l') {
        const quantityInLiters = formData.unit === 'ml' ? quantity / 1000 : quantity;
        pricePerUnit = quantityInLiters > 0 ? (price / quantityInLiters).toFixed(2) : '0,00';
        unitForPricePerUnit = 'l';
      } else if (formData.unit === 'pièce') {
        pricePerUnit = quantity > 0 ? (price / quantity).toFixed(2) : '0,00';
        unitForPricePerUnit = 'pc';
      }

      const labelData = {
        name: formData.name,
        price: formatPrice(formData.price),
        quantity: formatPrice(formData.quantity),
        pricePerUnit: formatPrice(pricePerUnit),
        barcode: formData.barcode,
        categoryId: parseInt(formData.categoryId),
        marketId: parseInt(formData.marketId),
        description: formData.description,
        unit: unitForPricePerUnit,
      };

      const updated = await updateLabel(formData.id, labelData);
      if (updated) {
        await fetchProductsByCategory(selectedCategory);
        setShowModal(false);
        setFormData({
          id: null,
          name: '',
          price: '',
          quantity: '',
          pricePerUnit: '',
          barcode: '',
          categoryId: '',
          description: '',
          unit: '',
          marketId: '',
        });
        setIsEditing(false);
        setCalculatedPricePerUnit('');
        setAlertMessage('Produit mis à jour avec succès');
        setShowAlert(true);
      }
    } else {
      setAlertMessage('Il faut remplir les champs vides');
      setShowAlert(true);
    }
  };

  const handleEdit = (label) => {
    if (label && label.id) {
      setFormData({
        id: label.id,
        name: label.name || '',
        price: formatPrice(label.price),
        quantity: formatPrice(label.quantity),
        pricePerUnit: formatPrice(label.pricePerUnit),
        barcode: label.barcode || '',
        marketId: label.marketId ? label.marketId.toString() : '',
        categoryId: label.categoryId ? label.categoryId.toString() : '',
        description: label.description || '',
        unit: label.unit === 'kg' ? 'g' : label.unit === 'l' ? 'l' : label.unit === 'pc' ? 'pièce' : '',
      });
      setIsEditing(true);
      setShowModal(true);
    }
  };

  const deleteLabel = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/products/deleteProduct/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Échec de la suppression du produit ${id}`);
      }

      console.log(`Produit ${id} supprimé avec succès`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du produit :', error);
      setAlertMessage('Erreur lors de la suppression du produit.');
      setShowAlert(true);
      return false;
    }
  };

  const handleDelete = (id) => {
    if (id) {
      setAlertMessage('Êtes-vous sûr de vouloir supprimer cette étiquette ?');
      setShowConfirm(true);
      setConfirmAction(() => async () => {
        const success = await deleteLabel(id);
        if (success) {
          await fetchProductsByCategory(selectedCategory);
          setAlertMessage('Produit supprimé avec succès');
          setShowAlert(true);
        }
        setShowConfirm(false);
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      id: null,
      name: '',
      price: '',
      quantity: '',
      pricePerUnit: '',
      barcode: '',
      categoryId: '',
      description: '',
      unit: '',
      marketId: '',
    });
    setShowModal(false);
    setIsEditing(false);
    setCalculatedPricePerUnit('');
  };

  return (
    <div className="labels-page">
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
      <style jsx>{`
        .labels-page {
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
        .filters {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }
        .filter-select {
          padding: 8px;
          font-size: 16px;
          border-radius: 4px;
          border: 1px solid #ccc;
          width: 200px;
        }
        .label-form, .modal-form {
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .modal {
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
        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 15px;
        }
        .form-group {
          flex: 1;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #007bff;
          outline: none;
        }
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
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
          transition: background-color 0.3s;
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
        .btn-edit {
          background: #ffc107;
          color: black;
        }
        .labels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .label-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s;
          position: relative;
        }
        .label-card:hover {
          transform: translateY(-5px);
        }
        .label-card.new-label::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: #28a745;
          border-radius: 8px 8px 0 0;
          animation: fadeOut 5s forwards;
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .label-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .label-header h3 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }
        .label-category {
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .label-details {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
        }
        .label-details p {
          margin: 8px 0;
          font-size: 14px;
          color: #444;
        }
        .barcode-container {
          margin-top: 15px;
          text-align: center;
        }
        .barcode-image {
          max-width: 100%;
          height: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .label-actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .empty-state {
          text-align: center;
          padding: 30px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 20px;
        }
      `}</style>

      <div className="page-header">
        <h1>Gestion des Étiquettes</h1>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                id: null,
                name: '',
                price: '',
                quantity: '',
                pricePerUnit: '',
                barcode: '',
                categoryId: '',
                description: '',
                unit: '',
                marketId: ''
              });
              setIsEditing(false);
              setShowModal(true);
            }}
          >
            🏷️ Nouvelle étiquette
          </button>
        </div>
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => {
          const selected = e.target.value;
          setSelectedCategory(selected);
          fetchProductsByCategory(selected);
        }}
        className="filter-select"
      >
        <option value="">Toutes les catégories</option>
        {categories ? categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        )) : null}
      </select>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-form">
              <h3>{isEditing ? 'Modifier Étiquette' : 'Nouvelle Étiquette'}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nom du produit *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: Kinder Bueno"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Prix TTC (€) *</label>
                  <input
                    type="text"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(',', '.') })}
                    required
                    placeholder="2,00"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Quantité *</label>
                  <input
                    type="text"
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value.replace(',', '.') })}
                    required
                    placeholder="35"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="unit">Unité *</label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une unité</option>
                    <option value="g">Gramme (g)</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="l">Litre (l)</option>
                    <option value="pièce">Pièce</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prix unitaire calculé</label>
                  <div style={{ padding: '8px', background: '#e9ecef', borderRadius: '4px' }}>
                    {calculatedPricePerUnit || 'Remplissez prix, quantité et unité'}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="categoryId">Catégorie *</label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories ? categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    )) : null}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="marketId">Marché *</label>
                <select
                  id="marketId"
                  value={formData.marketId}
                  onChange={(e) => setFormData({ ...formData, marketId: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un marché</option>
                  {markets ? markets.map((mark) => (
                    <option key={mark.id} value={mark.id}>{mark.name}</option>
                  )) : null}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="barcode">Code-barres *</label>
                  <input
                    type="text"
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    required
                    placeholder="1234567890123"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Informations supplémentaires..."
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={isEditing ? handleEditSubmit : handleSubmit}>
                  {isEditing ? 'Mettre à jour' : 'Créer'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {products.length > 0 ? (
        <div className="labels-grid">
          {products.map((label) => (
            <div
              key={label.id}
              className={`label-card ${newLabelIds.includes(label.id) ? 'new-label' : ''}`}
            >
              <div className="label-header">
                <h3>{label.name}</h3>
                <span
                  className="label-category"
                  style={{ backgroundColor: (label.Category?.color) }}
                >
                  {label.Category?.name || 'Sans catégorie'}
                </span>
              </div>
              <div className="label-details">
                <p><strong>Prix:</strong> {formatPrice(label.price)}€</p>
                <p><strong>Quantité:</strong> {formatPrice(label.quantity)}{label.unit === 'pc' ? '' : label.unit}</p>
                <p><strong>Prix unitaire:</strong> {label.pricePerUnit ? `prix/${label.unit} ${formatPrice(label.pricePerUnit)}€` : '-'}</p>
                {label.barcode && (
                  <div>
                    <p><strong>Code-barres:</strong> {label.barcode}</p>
                    <Barcode value={label.barcode} />
                  </div>
                )}
                {label.description && <p><strong>Description:</strong> {label.description}</p>}
              </div>
              <div className="label-actions">
                <button
                  className="btn btn-edit"
                  onClick={() => handleEdit(label)}
                >
                  ✏️ Modifier
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(label.id)}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>
            {selectedCategory
              ? 'Aucune étiquette dans cette catégorie'
              : 'Aucune étiquette créée pour le moment'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                id: null,
                name: '',
                price: '',
                quantity: '',
                pricePerUnit: '',
                barcode: '',
                categoryId: '',
                description: '',
                unit: '',
                marketId: ''
              });
              setIsEditing(false);
              setShowModal(true);
            }}
          >
            Créer votre première étiquette
          </button>
        </div>
      )}
    </div>
  );
};

export default Labels;