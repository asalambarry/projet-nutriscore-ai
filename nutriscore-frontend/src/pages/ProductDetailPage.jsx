// ===========================================
// PAGE DÉTAIL PRODUIT - Placeholder
// ===========================================

import { Eye } from 'lucide-react';

const ProductDetailPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Détail du produit</h1>
        <p className="page-subtitle">
          Informations complètes et analyse nutritionnelle
        </p>
      </div>

      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Eye size={64} />
          </div>
          <h3 className="empty-state-title">Page détail en cours de développement</h3>
          <p className="empty-state-description">
            Cette page affichera bientôt tous les détails d'un produit avec son analyse nutritionnelle complète.
          </p>
          <a href="/products" className="btn btn-primary">
            Voir tous les produits
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;