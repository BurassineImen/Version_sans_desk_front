import React, { useState, useRef, useEffect } from 'react';
import { Printer, Eye, Filter, Grid, List, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Fonction pour générer les barres EAN-13
const generateEAN13Bars = (code) => {
  const paddedCode = String(code).padEnd(13, '0').substring(0, 13);
  const startPattern = '101';
  const middlePattern = '01010';
  const endPattern = '101';

  const leftPatterns = [
    '0001101', '0011001', '0010011', '0111101', '0100011',
    '0110001', '0101111', '0111011', '0110111', '0001011'
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

// Composant Barcode pour générer les codes-barres
const Barcode = ({ value }) => {
  const [barcodeDataUrl, setBarcodeDataUrl] = useState('');

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 100;
    const height = 40;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    const bars = generateEAN13Bars(value);
    ctx.fillStyle = 'black';
    const barWidth = width / bars.length;

    bars.split('').forEach((bar, index) => {
      if (bar === '1') {
        ctx.fillRect(index * barWidth, 0, barWidth, height - 10);
      }
    });

    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value, width / 2, height - 2);

    setBarcodeDataUrl(canvas.toDataURL());
  }, [value]);

  return (
    <div className="barcode-container">
      {barcodeDataUrl && (
        <img
          src={barcodeDataUrl}
          alt={`Code-barres ${value}`}
          style={{ width: '100%', height: '40px', objectFit: 'contain' }}
        />
      )}
    </div>
  );
};

// Composant principal Print
const Print = () => {
  const [categories, setCategories] = useState([]);
  const [categoryLabels, setCategoryLabels] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [printMode, setPrintMode] = useState('category');
  const [showPreview, setShowPreview] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const previewRef = useRef(null);

  // Récupérer les catégories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError('Erreur lors du chargement des catégories');
      }
    } catch (error) {
      setError('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer tous les produits
  const fetchAllLabels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/products');
      if (response.ok) {
        const data = await response.json();
        setAllLabels(data);
      } else {
        setError('Erreur lors du chargement des produits');
      }
    } catch (error) {
      setError('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les produits par catégorie
  const fetchProductsByCategory = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:5000/categories/${categoryId}/products`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      const data = await response.json();
      setCategoryLabels(data);
      if (printMode === 'category' && selectedLabels.length === 0) {
        setSelectedLabels(data.map(label => label.id));
      }
    } catch (error) {
      setError('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner ou désélectionner tous les produits d'une catégorie
  const toggleSelectAllCategoryProducts = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:5000/categories/${categoryId}/products`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      const data = await response.json();
      if (printMode === 'category') {
        setCategoryLabels(data);
      }

      const categoryProductIds = data.map(label => label.id);
      const allSelected = categoryProductIds.every(id => selectedLabels.includes(id));
      setSelectedLabels(prev =>
        allSelected
          ? prev.filter(id => !categoryProductIds.includes(id))
          : [...new Set([...prev, ...categoryProductIds])]
      );
    } catch (error) {
      setError('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les catégories et tous les labels au montage
  useEffect(() => {
    fetchCategories();
    fetchAllLabels();
  }, []);

  // Charger les produits par catégorie lorsque la catégorie change
  useEffect(() => {
    if (printMode === 'category' && selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      setCategoryLabels([]);
      if (printMode !== 'selected') {
        setSelectedLabels([]);
      }
    }
  }, [printMode, selectedCategory]);

  // Gérer la sélection/désélection d'une étiquette
  const handleLabelSelection = (labelId) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  // Tronquer le texte si trop long
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  // Sélectionner les étiquettes à imprimer
  const getLabelsForPrint = () => {
    if (printMode === 'category' && selectedCategory) {
      return categoryLabels.filter(label => selectedLabels.includes(label.id));
    } else if (printMode === 'selected') {
      return allLabels.filter(label => selectedLabels.includes(label.id));
    }
    return allLabels;
  };

  // Gérer l'impression
  const handlePrint = () => {
    const printLabels = getLabelsForPrint();
    if (printLabels.length === 0) {
      alert('Aucune étiquette sélectionnée pour l\'impression');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const printContent = generatePrintHTML(printLabels);
    const today = new Date().toISOString().split('T')[0];
    printWindow.document.title = `CBC - LE ${today}`;
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Gérer l'enregistrement en PDF
  const handleSaveAsPDF = async () => {
    const printLabels = getLabelsForPrint();
    if (printLabels.length === 0) {
      alert('Aucune étiquette sélectionnée pour l\'enregistrement PDF');
      return;
    }

    const element = previewRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      const today = new Date().toISOString().split('T')[0];
      pdf.save(`CBC_Etiquettes_${today}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur s\'est produite lors de l\'enregistrement du PDF.');
    }
  };

  // Générer le HTML pour l'impression
  const generatePrintHTML = (printLabels) => {
    const labelWidth = 175;
    const labelHeight = 120;
    const labelsPerRow = 4;
    const labelsPerPage = 40;
    const rowHeight = labelHeight + 10;
    const pageHeaderHeight = 26;
    const pageHeight = rowHeight * 10 + pageHeaderHeight;

    const pages = [];
    for (let i = 0; i < printLabels.length; i += labelsPerPage) {
      const pageLabels = printLabels.slice(i, i + labelsPerPage);
      if (pageLabels.length === 0) continue;
      const labelsHTML = pageLabels.map((label, index) => {
        const categoryColor = label.Category?.color || '#000000';
        const displayUnit = label.unit === 'kg' ? 'g' : label.unit === 'l' ? 'l' : label.unit === 'pc' ? 'pièce' : label.unit || 'pièce';
        const priceUnit = displayUnit === 'unit' ? 'pièce' : displayUnit === 'g' ? 'kg' : displayUnit === 'ml' || displayUnit === 'l' ? 'l' : 'pièce';
        const pricePerUnit = label.pricePerUnit ? `prix/${priceUnit} ${label.pricePerUnit}€` : '';
        const quantity = displayUnit === 'pièce' && !label.unit ? label.quantity || '' : label.quantity && displayUnit ? `${label.quantity}${displayUnit}` : label.quantity || '';
        const isLastInRow = (index + 1) % labelsPerRow === 0;
        const marginRight = isLastInRow ? '0px' : '10px';

        return `
          <div class="print-label" style="width: ${labelWidth}px; height: ${labelHeight}px; background-color: white; border: 0.3px dashed #000; border-radius: 0px; padding: 9px; font-size: 5px; margin-right: ${marginRight};">
            <div class="label-header" style="height: 55px;">
              <div class="product-name">${truncateText(label.name, 20)}</div>
              <div class="price-frame" style="background-color: ${categoryColor}; border: 1px solid ${categoryColor}; border-top-left-radius: 60px; margin-left: 10px; width: 90%; padding: 0px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                <div class="price-main" style="color: #000000">${label.price}€</div>
                <div class="price-details">
                  <span class="price-unit" style="color: #000000">${pricePerUnit}</span>
                  <span class="quantity" style="color: #000000">${quantity}</span>
                </div>
              </div>
            </div>
            <div class="label-footer" style="height: 65px;">
              ${
                label.barcode
                  ? `
                    <div class="barcode-section">
                      <img src="${generateBarcodeDataUrl(label.barcode)}" class="barcode-image" style="width: 100%; height: 40px; object-fit: contain;" />
                      <div class="barcode-number">${label.barcode}</div>
                    </div>
                  `
                  : '<div class="barcode-section"><div class="barcode-placeholder"></div></div>'
              }
            </div>
          </div>
        `;
      }).join('');

      pages.push(`
        <div class="print-page">
          <div style="text-align: center; margin-bottom: 13px; font-size: 10px; color: #666;">
            <p>Impression de ${pageLabels.length} étiquettes - ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(${labelsPerRow}, ${labelWidth}px); grid-gap: 10px; width: ${labelWidth * labelsPerRow + (labelsPerRow - 1) * 10}px; margin: 0 auto; max-width: 100%;">
            ${labelsHTML}
          </div>
        </div>
      `);
    }

    const today = new Date().toISOString().split('T')[0];
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CBC - LE ${today}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: white; }
          @page { size: A4; margin: 5mm; }
          .print-page { width: 100%; height: ${pageHeight}px; page-break-after: always; padding: 3px; box-sizing: border-box; margin: 0 auto; max-width: 210mm; }
          .print-label { width: ${labelWidth}px; height: ${labelHeight}px; border: 0.3px dashed #000; border-radius: 0px; padding: 9px; margin: 0; display: inline-block; vertical-align: top; box-sizing: border-box; page-break-inside: avoid; position: relative; overflow: hidden; background-color: white; font-size: 5px; }
          .label-header { height: 55px; display: flex; flex-direction: column; margin-bottom: 4px; }
          .product-name { font-size: 15px; font-weight: bold; color: #000; line-height: 1.2; height: 20px; overflow: hidden; text-align: left; }
          .price-frame { flex: 1; margin-left: 10px; width: 90%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .price-main { font-size: 17px; font-weight: bold; color: #000000; text-align: center; margin-left: 60px; }
          .price-details { width: 90%; display: flex; justify-content: space-between; font-size: 8px; margin-top: 0.1px; }
          .price-unit { text-align: left; color: #000000; }
          .quantity { text-align: right; color: #000000; }
          .label-footer { height: 65px; }
          .barcode-section { height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; margin-top: 0px; }
          .barcode-image { width: 100%; height: 40px; object-fit: contain; }
          .barcode-number { font-family: monospace; font-size: 8px; color: #000; line-height: 1; height: 10px; display: flex; align-items: center; }
          .barcode-placeholder { height: 50px; }
          @media print {
            body { margin: 0; padding: 0; }
            .print-page { margin: 0 auto; padding: 5px; width: 100%; height: ${pageHeight}px; max-width: 210mm; }
            .print-label { width: ${labelWidth}px !important; height: ${labelHeight}px !important; background-color: white !important; border: 0.3px dashed #000 !important; border-radius: 0px !important; margin: 0 !important; }
            .price-frame { background-color: inherit !important; width: 90% !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        ${pages.join('')}
      </body>
      </html>
    `;
  };

  // Générer l'URL du code-barres
  const generateBarcodeDataUrl = (code) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 100;
    const height = 40;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    const bars = generateEAN13Bars(code);
    ctx.fillStyle = 'black';
    const barWidth = width / bars.length;

    bars.split('').forEach((bar, index) => {
      if (bar === '1') {
        ctx.fillRect(index * barWidth, 0, barWidth, height - 10);
      }
    });

    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(code, width / 2, height - 2);

    return canvas.toDataURL();
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e9ecef', padding: '20px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>🏷️ Impression des Étiquettes</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: showPreview ? '#6c757d' : 'transparent',
                  color: showPreview ? 'white' : '#6c757d',
                  border: '1px solid #6c757d',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={16} />
                {showPreview ? 'Masquer' : 'Afficher'} aperçu
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: getLabelsForPrint().length === 0 ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: getLabelsForPrint().length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onClick={handlePrint}
                disabled={getLabelsForPrint().length === 0}
              >
                <Printer size={16} />
                Imprimer ({getLabelsForPrint().length})
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: getLabelsForPrint().length === 0 ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: getLabelsForPrint().length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onClick={handleSaveAsPDF}
                disabled={getLabelsForPrint().length === 0}
              >
                <Printer size={16} />
                Enregistrer en PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ width: '300px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Mode d'impression
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="category"
                checked={printMode === 'category'}
                onChange={(e) => setPrintMode(e.target.value)}
              />
              Par catégorie
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="selected"
                checked={printMode === 'selected'}
                onChange={(e) => setPrintMode(e.target.value)}
              />
              Sélection manuelle
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="all"
                checked={printMode === 'all'}
                onChange={(e) => setPrintMode(e.target.value)}
              />
              Toutes les étiquettes
            </label>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {loading && <p style={{ textAlign: 'center', color: '#666' }}>Chargement...</p>}
          {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
          {printMode === 'category' && !loading && !error && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} /> Sélection par catégorie
              </h3>
              {categories.length === 0 && <p>Aucune catégorie disponible</p>}
              {categories.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {categories.map((cat) => {
                    const categoryProducts = allLabels.filter(label => label.categoryId === cat.id);
                    const selectedCount = categoryProducts.filter(label => selectedLabels.includes(label.id)).length;
                    return (
                      <div
                        key={cat.id}
                        style={{
                          padding: '15px',
                          border: `2px solid ${selectedCategory === cat.id.toString() ? cat.color : '#e9ecef'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: selectedCategory === cat.id.toString() ? `${cat.color}10` : 'white'
                        }}
                        onClick={() => {
                          setSelectedCategory(selectedCategory === cat.id.toString() ? '' : cat.id.toString());
                          if (selectedCategory !== cat.id.toString()) {
                            fetchProductsByCategory(cat.id);
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0, color: cat.color }}>{cat.name}</h4>
                          <span style={{ backgroundColor: cat.color, color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                            {selectedCount}/{categoryProducts.length}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                          {categoryProducts.length} étiquettes disponibles
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              {selectedCategory && categoryLabels.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Produits de la catégorie sélectionnée :</h4>
                    <button
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'transparent',
                        color: categories.find(cat => cat.id.toString() === selectedCategory)?.color || '#000000',
                        border: `1px solid ${categories.find(cat => cat.id.toString() === selectedCategory)?.color || '#000000'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onClick={() => toggleSelectAllCategoryProducts(selectedCategory)}
                    >
                      {categoryLabels.every(label => selectedLabels.includes(label.id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr',
                      gap: '10px'
                    }}
                  >
                    {categoryLabels.map((label) => {
                      const displayUnit = label.unit === 'kg' ? 'g' : label.unit === 'l' ? 'l' : label.unit === 'pc' ? 'pièce' : label.unit || 'pièce';
                      const priceUnit = displayUnit === 'g' ? 'kg' : displayUnit === 'ml' || displayUnit === 'l' ? 'l' : 'pièce';
                      const pricePerUnit = label.pricePerUnit ? `prix/${priceUnit} ${label.pricePerUnit}€` : '';
                      const quantity = displayUnit === 'pièce' && !label.unit ? label.quantity || '' : label.quantity && displayUnit ? `${label.quantity}${displayUnit}` : label.quantity || '';

                      return (
                        <div
                          key={label.id}
                          style={{
                            padding: '10px',
                            border: `2px solid ${selectedLabels.includes(label.id) ? '#28a745' : '#e9ecef'}`,
                            borderRadius: '6px',
                            backgroundColor: selectedLabels.includes(label.id) ? '#28a74510' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleLabelSelection(label.id)}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              border: '2px solid #28a745',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: selectedLabels.includes(label.id) ? '#28a745' : 'transparent'
                            }}
                          >
                            {selectedLabels.includes(label.id) && <Check size={12} color="white" />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{label.name}</h5>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                              {quantity} | {pricePerUnit} | {label.price}€
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {printMode === 'selected' && !loading && !error && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <List size={18} /> Sélection manuelle
                </h3>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    style={{
                      padding: '8px',
                      backgroundColor: viewMode === 'grid' ? '#007bff' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : '#007bff',
                      border: '1px solid #007bff',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    style={{
                      padding: '8px',
                      backgroundColor: viewMode === 'list' ? '#007bff' : 'transparent',
                      color: viewMode === 'list' ? 'white' : '#007bff',
                      border: '1px solid #007bff',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>

              {categories.length}
              {categories.length > 0 && categories.map((category) => {
                const categoryProducts = allLabels.filter((label) => label.categoryId === category.id);
                const selectedCount = categoryProducts.filter((label) => selectedLabels.includes(label.id)).length;

                return (
                  <div key={category.id} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: category.color }}>{category.name}</h4>
                      <button
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'transparent',
                          color: category.color,
                          border: `1px solid ${category.color}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        onClick={() => toggleSelectAllCategoryProducts(category.id)}
                      >
                        {selectedCount === categoryProducts.length ? 'Tout désélectionner' : 'Tout sélectionner'} ({selectedCount}/{categoryProducts.length})
                      </button>
                    </div>

                    {categoryProducts.length === 0 && <p>Aucun produit dans cette catégorie</p>}
                    {categoryProducts.length > 0 && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr',
                          gap: '10px'
                        }}
                      >
                        {categoryProducts.map((label) => {
                          const displayUnit = label.unit === 'kg' ? 'g' : label.unit === 'l' ? 'l' : label.unit === 'pc' ? 'pièce' : label.unit || 'pièce';
                          const priceUnit = displayUnit === 'g' ? 'kg' : displayUnit === 'ml' || displayUnit === 'l' ? 'l' : 'pièce';
                          const pricePerUnit = label.pricePerUnit ? `prix/${priceUnit} ${label.pricePerUnit}€` : '';
                          const quantity = displayUnit === 'pièce' && !label.unit ? label.quantity || '' : label.quantity && displayUnit ? `${label.quantity}${displayUnit}` : label.quantity || '';

                          return (
                            <div
                              key={label.id}
                              style={{
                                padding: '10px',
                                border: `2px solid ${selectedLabels.includes(label.id) ? '#28a745' : '#e9ecef'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                backgroundColor: selectedLabels.includes(label.id) ? '#28a74510' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}
                              onClick={() => handleLabelSelection(label.id)}
                            >
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  border: '2px solid #28a745',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: selectedLabels.includes(label.id) ? '#28a745' : 'transparent'
                                }}
                              >
                                {selectedLabels.includes(label.id) && <Check size={12} color="white" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <h5 style={{ margin: 0, fontSize: '14px' }}>{label.name}</h5>
                                  <span style={{ fontWeight: 'bold', color: '#000000' }}>{label.price}€</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  {quantity} | {pricePerUnit}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {printMode === 'all' && !loading && !error && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List size={18} /> Toutes les étiquettes
              </h3>
              <p>{allLabels.length} étiquettes disponibles</p>
            </div>
          )}

          {showPreview && !loading && !error && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} /> Aperçu avant impression
              </h3>
              <div
                ref={previewRef}
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ marginBottom: '15px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                  <p>Aperçu de {getLabelsForPrint().length} étiquette(s) - 4 par ligne</p>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 175px)',
                    gridGap: '10px',
                    width: '710px',
                    margin: '0 auto'
                  }}
                >
                  {getLabelsForPrint().map((label) => {
                    const categoryColor = label.Category?.color || '#000000';
                    const displayUnit = label.unit === 'kg' ? 'g' : label.unit === 'l' ? 'l' : label.unit === 'pc' ? 'pièce' : label.unit || 'pièce';
                    const priceUnit = displayUnit === 'g' ? 'kg' : displayUnit === 'ml' || displayUnit === 'l' ? 'l' : 'pièce';
                    const pricePerUnit = label.pricePerUnit ? `prix/${priceUnit} ${label.pricePerUnit}€` : '';
                    const quantity = displayUnit === 'pièce' && !label.unit ? label.quantity || '' : label.quantity && displayUnit ? `${label.quantity}${displayUnit}` : label.quantity || '';

                    return (
                      <div
                        key={label.id}
                        style={{
                          width: '175px',
                          height: '120px',
                          border: '0.3px dashed #000',
                          borderRadius: '0px',
                          padding: '4px',
                          backgroundColor: 'white',
                          fontSize: '5px',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '95px',
                            display: 'flex',
                            flexDirection: 'column',
                            marginBottom: '12px'
                          }}
                        >
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 'bold',
                              height: '18px',
                              overflow: 'hidden',
                              textAlign: 'left'
                            }}
                          >
                            {truncateText(label.name, 20)}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              border: `1px solid ${categoryColor}`,
                              borderTopLeftRadius: '60px',
                              marginLeft: '10px',
                              width: '90%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: categoryColor,
                              padding: '0px',
                              WebkitPrintColorAdjust: 'exact',
                              printColorAdjust: 'exact'
                            }}
                          >
                            <div style={{ fontSize: '17px', fontWeight: 'bold', marginLeft: '60px', color: '#000000' }}>
                              {label.price}€
                            </div>
                            <div
                              style={{
                                width: '90%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '8px',
                                marginTop: '0.1px'
                              }}
                            >
                              <span style={{ textAlign: 'left', color: '#000000' }}>{pricePerUnit}</span>
                              <span style={{ textAlign: 'right', color: '#000000' }}>{quantity}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ height: '65px', marginBottom: '4px' }}>
                          {label.barcode ? (
                            <div style={{ height: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: '-10px' }}>
                              <Barcode value={label.barcode} />
                              <div style={{ fontFamily: 'monospace', fontSize: '8px', color: '#000', lineHeight: 1, height: '10px', display: 'flex', alignItems: 'center' }}>
                                {label.barcode}
                              </div>
                            </div>
                          ) : (
                            <div style={{ height: '50px' }}></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Print;