import { ArrowLeft, BarChart3, Calendar, Package, Tag, Utensils } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NutriScore from '../components/NutriScore';
import NutritionAlert from '../components/NutritionAlert';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5001/api/products/${id}`);

      if (!response.ok) {
        throw new Error('Produit non trouvé');
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNutritionValue = (value, unit = 'g') => {
    if (value === null || value === undefined) return 'Non spécifié';
    return `${value}${unit}`;
  };

  const getNutritionColor = (value, type) => {
    // Couleurs selon les seuils nutritionnels
    const thresholds = {
      energy: { low: 200, medium: 400 }, // kJ
      sugars: { low: 5, medium: 15 }, // g
      saturated_fat: { low: 1.5, medium: 5 }, // g
      salt: { low: 0.3, medium: 1.5 }, // g
      fiber: { low: 3, medium: 6 }, // g (inverse: plus = mieux)
      proteins: { low: 5, medium: 15 } // g (inverse: plus = mieux)
    };

    if (!thresholds[type] || value === null || value === undefined) return '';

    const { low, medium } = thresholds[type];

    // Pour fibres et protéines, plus c'est haut, mieux c'est
    if (type === 'fiber' || type === 'proteins') {
      if (value >= medium) return 'nutrition-value--good';
      if (value >= low) return 'nutrition-value--medium';
      return 'nutrition-value--poor';
    }

    // Pour les autres, moins c'est mieux
    if (value <= low) return 'nutrition-value--good';
    if (value <= medium) return 'nutrition-value--medium';
    return 'nutrition-value--poor';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Produit non trouvé</h2>
          <p>{error || 'Ce produit n\'existe pas ou a été supprimé.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            <ArrowLeft size={20} />
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header avec navigation */}
      <div className="product-detail-header">
        <button className="btn btn-ghost" onClick={() => navigate('/products')}>
          <ArrowLeft size={20} />
          Retour aux produits
        </button>

        <div className="product-badges">
          <span className="badge badge-outline">
            <Calendar size={16} />
            {formatDate(product.created_at)}
          </span>
          {product.source && (
            <span className="badge badge-outline">
              <Package size={16} />
              {product.source}
            </span>
          )}
        </div>
      </div>

      {/* Informations principales */}
      <div className="product-detail-main">
        <div className="product-info-card">
          <div className="product-header">
            <div className="product-title-section">
              <h1 className="product-title">{product.name}</h1>
              {product.brand && (
                <p className="product-brand">
                  <Tag size={16} />
                  {product.brand}
                </p>
              )}
              {product.category && (
                <p className="product-category">
                  <Utensils size={16} />
                  {product.category}
                </p>
              )}
            </div>

            <div className="product-nutriscore">
              <NutriScore
                grade={product.nutri_score?.grade}
                probabilities={product.nutri_score?.probabilities}
                showProbabilities={true}
              />
            </div>
          </div>

          {/* Alerte nutritionnelle avec recommandations */}
          <NutritionAlert
            grade={product.nutri_score?.grade}
            showRecommendations={true}
            productId={product._id}
          />

          {/* Ingrédients */}
          {product.ingredients && (
            <div className="product-section">
              <h3 className="section-title">
                <Utensils size={20} />
                Ingrédients
              </h3>
              <p className="ingredients-text">{product.ingredients}</p>
            </div>
          )}

          {/* Valeurs nutritionnelles */}
          {product.nutrition && (
            <div className="product-section">
              <h3 className="section-title">
                <BarChart3 size={20} />
                Valeurs nutritionnelles (pour 100g/100ml)
              </h3>

              <div className="nutrition-grid">
                <div className={`nutrition-item ${getNutritionColor(product.nutrition.energy, 'energy')}`}>
                  <span className="nutrition-label">Énergie</span>
                  <span className="nutrition-value">
                    {formatNutritionValue(product.nutrition.energy, ' kJ')}
                  </span>
                </div>

                <div className={`nutrition-item ${getNutritionColor(product.nutrition.sugars, 'sugars')}`}>
                  <span className="nutrition-label">Sucres</span>
                  <span className="nutrition-value">
                    {formatNutritionValue(product.nutrition.sugars)}
                  </span>
                </div>

                <div className={`nutrition-item ${getNutritionColor(product.nutrition.saturated_fat, 'saturated_fat')}`}>
                  <span className="nutrition-label">Graisses saturées</span>
                  <span className="nutrition-value">
                    {formatNutritionValue(product.nutrition.saturated_fat)}
                  </span>
                </div>

                <div className={`nutrition-item ${getNutritionColor(product.nutrition.salt, 'salt')}`}>
                  <span className="nutrition-label">Sel</span>
                  <span className="nutrition-value">
                    {formatNutritionValue(product.nutrition.salt)}
                  </span>
                </div>

                <div className={`nutrition-item ${getNutritionColor(product.nutrition.fiber, 'fiber')}`}>
                  <span className="nutrition-label">Fibres</span>
                  <span className="nutrition-value">
                    {formatNutritionValue(product.nutrition.fiber)}
                  </span>
                </div>

                <div className={`nutrition-item ${getNutritionColor(product.nutrition.proteins, 'proteins')}`}>
                  <span className="nutrition-label">Protéines</span>
                  <span className="nutrition-value">
                    {formatNutritionValue(product.nutrition.proteins)}
                  </span>
                </div>

                <div className="nutrition-item">
                  <span className="nutrition-label">Fruits, légumes, noix</span>
                  <span className="nutrition-value">
                    {formatNutritionValue(product.nutrition.fruits_vegetables_nuts, '%')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Code-barres si disponible */}
          {product.barcode && (
            <div className="product-section">
              <h3 className="section-title">Code-barres</h3>
              <p className="barcode-text">{product.barcode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;