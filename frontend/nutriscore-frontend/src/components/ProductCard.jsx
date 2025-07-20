
import {
    Building2,
    Edit,
    Eye,
    Heart,
    Package,
    Star,
    Tag,
    Trash2,
    TrendingUp,
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

  // Données nutritionnelles pour l'affichage
  const nutrition = product.nutrition || {};
  const nutritionSummary = [
    {
      label: 'Énergie',
      value: `${Math.round(parseFloat(nutrition.energy) || 0)}`,
      unit: 'kcal',
      icon: Zap,
      color: '#f093fb'
    },
    {
      label: 'Sucres',
      value: `${(parseFloat(nutrition.sugars) || 0).toFixed(1)}`,
      unit: 'g',
      icon: Heart,
      color: '#ff6b7a'
    },
    {
      label: 'Sel',
      value: `${(parseFloat(nutrition.salt) || 0).toFixed(1)}`,
      unit: 'g',
      icon: Star,
      color: '#4facfe'
    },
    {
      label: 'Protéines',
      value: `${(parseFloat(nutrition.proteins) || 0).toFixed(1)}`,
      unit: 'g',
      icon: TrendingUp,
      color: '#43e97b'
    }
  ];

  // Accès correct au Nutri-Score
  const nutriScore = product.nutri_score?.grade || product.predicted_nutri_score?.grade || 'N/A';
  const nutriScoreValue = nutriScore !== 'N/A' ? nutriScore : null;

  // Fonction pour obtenir la couleur du Nutri-Score
  const getNutriScoreColor = (score) => {
    const colors = {
      'A': '#00b894',
      'B': '#00cec9',
      'C': '#fdcb6e',
      'D': '#e17055',
      'E': '#d63031'
    };
    return colors[score] || '#95a5a6';
  };

  // Déterminer si le produit a une bonne qualité nutritionnelle
  const isHealthy = nutriScoreValue && ['A', 'B'].includes(nutriScoreValue);

  return (
    <div className={`product-card-premium ${variant} ${className} ${isHealthy ? 'healthy' : ''}`}>

        {/* Badge de qualité nutritionnelle */}
        {isHealthy && (
          <div className="quality-badge">
            <Star size={16} />
            <span>Excellent</span>
          </div>
        )}

        {/* Container de l'image avec overlay */}
        <div className="image-container">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-image"
              loading="lazy"
            />
          ) : (
            <div className="image-placeholder">
              <Package size={48} />
              <span>Aucune image</span>
            </div>
          )}

          {/* Overlay avec gradient */}
          <div className="image-overlay"></div>

          {/* Nutri-Score Badge sur l'image */}
          {nutriScoreValue && (
            <div
              className="nutri-score-overlay"
              style={{ backgroundColor: getNutriScoreColor(nutriScoreValue) }}
            >
              <span className="score-letter">{nutriScoreValue}</span>
              <span className="score-label">Nutri-Score</span>
            </div>
          )}
        </div>

        {/* Contenu principal de la carte */}
        <div className="card-content">

          {/* En-tête du produit */}
          <div className="product-header">
            <h3 className="product-name">{product.name}</h3>

            <div className="product-meta">
              {product.brand && (
                <div className="meta-item brand">
                  <Building2 size={14} />
                  <span>{product.brand}</span>
                </div>
              )}
              {product.category && (
                <div className="meta-item category">
                  <Tag size={14} />
                  <span>{product.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* Grille nutritionnelle moderne */}
          <div className="nutrition-grid">
            {nutritionSummary.map((item, index) => (
              <div key={index} className="nutrition-item" style={{'--accent-color': item.color}}>
                <div className="nutrition-icon">
                  <item.icon size={16} />
                </div>
                <div className="nutrition-data">
                  <span className="nutrition-value">
                    {item.value}
                    <span className="nutrition-unit">{item.unit}</span>
                  </span>
                  <span className="nutrition-label">{item.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Prédiction IA */}
          {product.predicted_nutri_score && (
            <div className="ai-prediction">
              <div className="ai-badge">
                <Zap size={12} />
                <span>Prédiction IA</span>
              </div>
              <div className="prediction-confidence">
                Précision: {((parseFloat(product.predicted_nutri_score.confidence) || 0) * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>

        {/* Actions (si activées) */}
        {showActions && (
          <div className="card-actions">
            <button
              onClick={handleDelete}
              className="action-btn delete"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
            <Link
              to={`/products/${product._id}/edit`}
              className="action-btn edit"
              title="Modifier"
            >
              <Edit size={16} />
            </Link>
            <Link
              to={`/products/${product._id}`}
              className="action-btn view"
              title="Voir détails"
            >
              <Eye size={16} />
            </Link>
          </div>
        )}

        {/* Indicateur de hover */}
        <div className="hover-indicator"></div>

        {/* Zone cliquable pour voir le détail */}
        <Link to={`/products/${product._id}`} className="card-overlay-link" aria-label={`Voir les détails de ${product.name}`}></Link>
    </div>
  );
};

export default ProductCard;