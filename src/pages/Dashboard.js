import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import axios from 'axios';
const Dashboard = () => {
  const { categories, labels } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [mostCategories, setMostCategories] = useState(false);
    const[markets, setMarkets] = useState(null);

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
        marketId:''
      });
      const [calculatedPricePerUnit, setCalculatedPricePerUnit] = useState('');
  const [stats, setStats] = useState({
    totalLabels: 0,
    totalCategories: 0,
    todayLabels: 0,
    weekLabels: 0,
  });
  
    const [countCategories, setCountCategories] = useState(null);
    const [countProducts, setCountProducts] = useState(null);
    const [countAllProducts, setCountAllProducts] = useState(null);
    const [recentsProducts, setRecentsProducts]= useState(null);
const [countCat, setCountCat]= useState(null);
     const fetchMarkets = async () => {
          try {
            
          console.log("Appel fetch Markets...");
            const response = await fetch('http://localhost:5000/markets');
            if (response.ok) {
              const data = await response.json();
              setMarkets(data);
            } else {
              alert('Erreur lors du chargement des markets');
            }
          } catch (error) {
            alert('Erreur de connexion: ' + error.message);
          }
        };
         useEffect(() => {
          fetchMarkets();
        }, []);
  useEffect(() => {
    if (formData.price && formData.quantity && formData.unit) {
      const price = parseFloat(formData.price) || 0;
      const quantity = parseFloat(formData.quantity) || 0;
      let pricePerUnit = '';
      if (formData.unit === 'g') {
        pricePerUnit = quantity > 0 ? `prix/kg ${(price / quantity * 1000).toFixed(2)}€` : '';
      } else if (formData.unit === 'ml' || formData.unit === 'l') {
        const quantityInLiters = formData.unit === 'ml' ? quantity / 1000 : quantity;
        pricePerUnit = quantityInLiters > 0 ? `prix/l ${(price / quantityInLiters).toFixed(2)}€` : '';
      } else if (formData.unit === 'pièce') {
        pricePerUnit = quantity > 0 ? `prix/pc ${(price / quantity).toFixed(2)}€` : '';
      }
      setCalculatedPricePerUnit(pricePerUnit);
    } else {
      setCalculatedPricePerUnit('');
    }
  }, [formData.price, formData.quantity, formData.unit]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
    const fetchCustomCategories = async () => {
    try {
      
    console.log("Appel fetch...");
      const response = await fetch('http://localhost:5000/categories');
      if (response.ok) {
        const data = await response.json();
        setCountCategories(data.length);
      } else {
        alert('Erreur lors du chargement des c atégories');
      }
    } catch (error) {
      alert('Erreur de connexion: ' + error.message);
    }
  };
   useEffect(() => {
    fetchCustomCategories();
  }, []);
const updateLabel = async (id, data) => {
  try {
    const response = await fetch(`http://localhost:5000/products/updateProduct/${id}`, {
      method: 'PUT', // ou PATCH si tu ne modifies qu'une partie
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du produit');
    }

    const updateLabel = await response.json();
    console.log('Produit mis à jour:', updateLabel);

    return updateLabel;
  } catch (error) {
    console.error(error);
    alert('Erreur lors de la mise à jour du produit');
  }
  
};

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (
    formData.name.trim() &&
    formData.price &&
    formData.quantity &&
    formData.categoryId &&
    formData.unit &&
     formData.marketId 
  ) {
    const price = parseFloat(formData.price);
    const quantity = parseFloat(formData.quantity);
    let pricePerUnit = '';
    let unitForPricePerUnit = formData.unit;

    if (formData.unit === 'g') {
      pricePerUnit = (price / quantity * 1000).toFixed(2);
      unitForPricePerUnit = 'kg';
    } else if (formData.unit === 'ml' || formData.unit === 'l') {
      const quantityInLiters = formData.unit === 'ml' ? quantity / 1000 : quantity;
      pricePerUnit = (price / quantityInLiters).toFixed(2);
      unitForPricePerUnit = 'l';
    } else if (formData.unit === 'pièce') {
      pricePerUnit = (price / quantity).toFixed(2);
      unitForPricePerUnit = 'pc';
    }

    const labelData = {
      name: formData.name,
      price: price.toFixed(2),
      quantity: quantity.toFixed(2),
      pricePerUnit,
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
     

        // Réinitialisation du formulaire
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
          marketId:''
        });
        setShowModal(false);
        setIsEditing(false);
        setCalculatedPricePerUnit('');
      } else {
        const errorData = await response.json();
        alert('Erreur lors de l’ajout du produit : ' + (errorData.message || ''));
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
      alert('Erreur réseau lors de l’ajout du produit.');
    }

  }
};

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.price && formData.quantity && formData.categoryId && formData.unit && formData.marketId) {
      const price = parseFloat(formData.price);
      const quantity = parseFloat(formData.quantity);
      let pricePerUnit = '';
      let unitForPricePerUnit = formData.unit;
      if (formData.unit === 'g') {
        pricePerUnit = (price / quantity * 1000).toFixed(2);
        unitForPricePerUnit = 'kg';
      } else if (formData.unit === 'ml' || formData.unit === 'l') {
        const quantityInLiters = formData.unit === 'ml' ? quantity / 1000 : quantity;
        pricePerUnit = (price / quantityInLiters).toFixed(2);
        unitForPricePerUnit = 'l';
      } else if (formData.unit === 'pièce') {
        pricePerUnit = (price / quantity).toFixed(2);
        unitForPricePerUnit = 'pc';
      }

      const labelData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        price: price.toFixed(2),
        quantity: quantity.toFixed(2),
        pricePerUnit,
        unit: unitForPricePerUnit,
        marketId: parseInt(formData.marketId)
      };
       
   
      await updateLabel(formData.id, labelData);
      await fetchRecentsProducts();
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
        marketId:''
      });
      setIsEditing(false);
      setCalculatedPricePerUnit('');
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
      marketId:''
    });
    setShowModal(false);
    setIsEditing(false);
    setCalculatedPricePerUnit('');
  };
  const handleEdit = (label) => {
    if (label && label.id) {
      setFormData({
        id: label.id,
        name: label.name || '',
        price: label.price || '',
        quantity: label.quantity || '',
        pricePerUnit: label.pricePerUnit || '',
        barcode: label.barcode || '', 
        marketId : label.marketId ? label.marketId.toString() : '',
        categoryId: label.categoryId ? label.categoryId.toString() : '',
        description: label.description || '',
        unit: label.unit === 'kg' ? 'g' : label.unit === 'l' ? 'l' : label.unit === 'pc' ? 'pièce' : '',
      });
      setIsEditing(true);
      setShowModal(true);
    }
  };

 const fetchCustomProducts = async () => {
  try {
    console.log("Appel fetch...");
    const response = await fetch('http://localhost:5000/products');
    if (response.ok) {
      const data = await response.json();

      // Obtenir la date d’aujourd’hui en format ISO sans l’heure (ex: "2025-07-20")
      const today = new Date().toISOString().split('T')[0];

      // Filtrer les produits créés aujourd’hui
      const productsToday = data.filter(product => {
        const productDate = new Date(product.createdAt).toISOString().split('T')[0];
        return productDate === today;
      });

      setCountProducts(productsToday.length);
      setCountAllProducts(data.length)
    } else {
      alert('Erreur lors du chargement des produits');
    }
  } catch (error) {
    alert('Erreur de connexion: ' + error.message);
  }
};

useEffect(() => {
  fetchCustomProducts();
}, []);





 const fetchRecentsProducts = async () => {
  try {
    console.log("Appel fetch...");
    const response = await fetch('http://localhost:5000/products');
    if (response.ok) {
      const data = await response.json();

      // Trier les produits par date de création décroissante
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Prendre les 6 premiers
      const lastSix = sorted.slice(0, 6);
      setRecentsProducts(lastSix);
    } else {
      alert('Erreur lors du chargement des produits');
    }
  } catch (error) {
    alert('Erreur de connexion: ' + error.message);
  }
};

useEffect(() => {
  fetchRecentsProducts();
}, []);



  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayLabels = labels.filter((label) => {
      const labelDate = new Date(label.createdAt || today);
      return labelDate.toDateString() === today.toDateString();
    }).length;

    const weekLabels = labels.filter((label) => {
      const labelDate = new Date(label.createdAt || today);
      return labelDate >= weekAgo;
    }).length;

    
    setStats({
      totalLabels: labels.length,
      totalCategories: categories.length,
      todayLabels,
      weekLabels,
    });
  }, [labels, categories]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRecentLabels = () => {
    return labels
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);
  };

  /*const getMostUsedCategories = () => {
    const categoryCounts = categories.map((category) => ({
      ...category,
      count: labels.filter((label) => label.categoryId === category.id).length,
    }));

    return categoryCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };*/



const fetchMostUsedCategories = async () => {
  try {
    const response = await fetch('http://localhost:5000/categories/most-used');
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des catégories populaires');
    }
    const data = await response.json();
    setMostCategories(data);
    setCountCat(data.count) // 🔁 ton useState ici
  } catch (error) {
    console.error(error);
    alert('Erreur lors du chargement des catégories');
  }
};

useEffect(() => {
  fetchMostUsedCategories();
}, []);




  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="greeting-section">
          <h1 className="greeting-title">
            {getGreeting()} MEKKI ! 👋
          </h1>
          <p className="greeting-subtitle">
            Gérez vos étiquettes efficacement
          </p>
        </div>
        <div className="time-section">
          <div className="current-time">
            <span className="time-icon">🕐</span>
            <span className="time-display">{formatTime(currentTime)}</span>
          </div>
          <div className="current-date">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Aperçu général
        </h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-header">
              <div className="stat-icon">📁</div>
              <div className="stat-trend up">↗️</div>
            </div>
            <div className="stat-content">
              <h3>Catégories</h3>
              <p className="stat-number">{countCategories}</p>
              <p className="stat-description">Catégories créées</p>
            </div>
            <Link to="/categories" className="stat-link">
              <span>Gérer les catégories</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>
          <div className="stat-card secondary">
            <div className="stat-header">
              <div className="stat-icon">🏷️</div>
              <div className="stat-trend up">↗️</div>
            </div>
            <div className="stat-content">
              <h3>Étiquettes</h3>
              <p className="stat-number">{countAllProducts}</p>
              <p className="stat-description">Total créées</p>
            </div>
            <Link to="/labels" className="stat-link">
              <span>Gérer les étiquettes</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>
          <div className="stat-card tertiary">
            <div className="stat-header">
              <div className="stat-icon">📈</div>
              <div className="stat-trend up">↗️</div>
            </div>
            <div className="stat-content">
              <h3>Aujourd'hui</h3>
              <p className="stat-number">{countProducts}</p>
              <p className="stat-description">Étiquettes créées</p>
            </div>
            <Link to="/labelsToday" className="stat-link">
              <span>Voir les détails</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>
          <div className="stat-card quaternary">
            <div className="stat-header">
              <div className="stat-icon">🖨️</div>
              <div className="stat-trend neutral">📄</div>
            </div>
            <div className="stat-content">
              <h3>Impression</h3>
              <p className="stat-number">PDF</p>
              <p className="stat-description">Format disponible</p>
            </div>
            <Link to="/print" className="stat-link">
              <span>Imprimer maintenant</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="actions-section">
        <h2 className="section-title">
          <span className="section-icon">⚡</span>
          Actions rapides
        </h2>
        <div className="action-buttons">
          <Link to="/categories" className="action-btn primary">
            <span className="action-icon">➕</span>
            <div className="action-content">
              <span className="action-title">Nouvelle catégorie</span>
              <span className="action-description">Organiser vos produits</span>
            </div>
          </Link>
          <Link to="/labels" className="action-btn secondary">
            <span className="action-icon">🏷️</span>
            <div className="action-content">
              <span className="action-title">Nouvelle étiquette</span>
              <span className="action-description">Créer une étiquette produit</span>
            </div>
          </Link>
          <Link to="/print" className="action-btn tertiary">
            <span className="action-icon">🖨️</span>
            <div className="action-content">
              <span className="action-title">Imprimer en lot</span>
              <span className="action-description">Impression multiple</span>
            </div>
          </Link>
        </div>
      </div>
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
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    step="0.01"
                    required
                    placeholder="2.00"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Quantité *</label>
                  <input
                    type="number"
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    step="0.01"
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
                    { markets ? markets.map((mark) => (
                      <option key={mark.id} value={mark.id}>{mark.name}</option>
                    )) :null }
                  </select>
                </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="barcode">Code-barres</label>
                  <input
                    type="text"
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
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

      <div className="dashboard-content">
        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🕒</span>
            Étiquettes récentes
          </h2>
          <div className="recent-labels">
            {recentsProducts ? (
              <div className="labels-grid">
                {recentsProducts.map((product) => (
                  <div key={product.id} className="label-preview-card">
                    <div className="label-preview-header">
                      <h4 className="label-name">{product.name}</h4>
                      <span className="label-status new">Nouveau</span>
                    </div>
                    <div className="label-preview-content">
                      <div className="label-price">
                        <span className="price-value">{product.price}€</span>
                        {product.pricePerUnit && (
                          <span className="price-unit">/ {product.pricePerUnit}</span>
                        )}
                      </div>
                      <div className="label-details">
                        <p className="label-category">
                          <span className="category-icon">📂</span>
                          {product.Category?.name || 'Sans catégorie'}
                        </p>
                      </div>
                    </div>
                    <div className="label-preview-actions">
                      <button className="preview-btn edit"
                       onClick={() => handleEdit(product)}>
                        <span>✏️</span>
                        Modifier
                      </button>
                      <Link to="/print" className="preview-btn print">
                        <span>🖨️</span>
                        Imprimer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Aucune étiquette créée</h3>
                <p>Commencez par créer votre première étiquette</p>
                <Link to="/labels" className="empty-action">
                  Créer une étiquette
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Catégories populaires
          </h2>
          <div className="categories-stats">
            {mostCategories.length > 0 ? (
              <div className="categories-list">
                {mostCategories.map((category, index) => (
                  <div key={category.id} className="category-stat-item">
                    <div className="category-rank">#{index + 1}</div>
                    <div className="category-info">
                      <h4 className="category-name">{category.name}</h4>
                      <p className="category-count"> {category.count} étiquettes</p>
                    </div>
                    <div className="category-progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${stats.totalLabels ? ( category.count / stats.totalLabels) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>Aucune catégorie</h3>
                <p>Créez des catégories pour organiser vos étiquettes</p>
                <Link to="/categories" className="empty-action">
                  Créer une catégorie
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="tips-section">
        <h2 className="section-title">
          <span className="section-icon">💡</span>
          Conseils du jour
        </h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h3>Organisation</h3>
            <p>Utilisez des catégories pour organiser vos étiquettes par rayon ou type de produit.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🖨️</div>
            <h3>Impression</h3>
            <p>Imprimez en lots pour gagner du temps lors de la préparation de vos étiquettes.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔍</div>
            <h3>Filtrage</h3>
            <p>Utilisez les filtres dans la page des étiquettes pour trouver rapidement ce dont vous avez besoin.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;