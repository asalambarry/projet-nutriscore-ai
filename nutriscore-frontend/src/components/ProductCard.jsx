// ===========================================
// PRODUCT CARD COMPONENT - Version Simplifiée
// ===========================================

import { Building2, Edit, Tag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NutriScoreBadge } from './NutriScore';
import './ProductCard.css';

const ProductCard = ({
  product,
  onDelete,
  showActions = true,
  variant = 'default',
  className = ''
}) => {
  if (!product) return null;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(product);
  };

  // Données nutritionnelles - CORRIGÉ : utilisation de product.nutrition.*
  const nutrition = product.nutrition || {};
  const nutritionSummary = [
    { label: 'Énergie', value: `${nutrition.energy || 0} kcal` },
    { label: 'Sucres', value: `${nutrition.sugars || 0}g` },
    { label: 'Sel', value: `${nutrition.salt || 0}g` },
    { label: 'Protéines', value: `${nutrition.proteins || 0}g` }
  ];

  // Accès correct au Nutri-Score
  const nutriScore = product.nutri_score?.grade || product.predicted_nutri_score?.grade || 'N/A';

  return (
    <div className={`product-card ${variant} ${className}`}>
      {/* En-tête du produit */}
      <div className="product-header">
        <div className="product-main-info">
          <h3 className="product-name">{product.name}</h3>
          {product.brand && (
            <div className="product-brand">
              <Building2 size={14} />
              <span>{product.brand}</span>
            </div>
          )}
          {product.category && (
            <div className="product-category">
              <Tag size={14} />
              <span>{product.category}</span>
            </div>
          )}
        </div>
        <div className="product-nutri-score">
          <NutriScoreBadge grade={nutriScore} />
        </div>
      </div>

      {/* Informations nutritionnelles */}
      <div className="product-nutrition">
        <div className="nutrition-grid">
          {nutritionSummary.map((item, index) => (
            <div key={index} className="nutrition-item">
              <span className="nutrition-label">{item.label}</span>
              <span className="nutrition-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="product-actions">
          <Link
            to={`/edit/${product._id || product.id}`}
            className="btn btn-edit"
            title="Modifier le produit"
          >
            <Edit size={16} />
            Modifier
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-delete"
            title="Supprimer le produit"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

// Skeleton de chargement
export const ProductCardSkeleton = () => (
  <div className="product-card skeleton">
    <div className="product-header skeleton-header">
      <div className="skeleton-text skeleton-title"></div>
      <div className="skeleton-nutri-score"></div>
    </div>
    <div className="product-nutrition skeleton-nutrition">
      <div className="nutrition-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="nutrition-item skeleton-item">
            <div className="skeleton-text skeleton-label"></div>
            <div className="skeleton-text skeleton-value"></div>
          </div>
        ))}
      </div>
    </div>
    <div className="product-actions skeleton-actions">
      <div className="skeleton-button"></div>
      <div className="skeleton-button"></div>
    </div>
  </div>
);

export default ProductCard;