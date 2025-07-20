// ===========================================
// PAGE LISTE PRODUITS - DESIGN PREMIUM
// ===========================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Sparkles } from 'lucide-react';
import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { apiService, queryKeys } from '../services/api';
import './ProductsPage.css';

// Skeleton premium pour les cartes de chargement
const ProductCardPremiumSkeleton = () => (
  <div className="product-card-premium skeleton">
    {/* Barre colorée en haut */}
    <div className="skeleton-top-bar"></div>

    {/* Container image */}
    <div className="skeleton-image-container">
      <div className="skeleton-image">
        <Package size={48} className="skeleton-icon" />
      </div>
      <div className="skeleton-nutri-badge"></div>
    </div>

    {/* Contenu */}
    <div className="skeleton-content">
      {/* En-tête */}
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-meta">
          <div className="skeleton-tag"></div>
          <div className="skeleton-tag"></div>
        </div>
      </div>

      {/* Grille nutritionnelle */}
      <div className="skeleton-nutrition-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-nutrition-item">
            <div className="skeleton-nutrition-icon"></div>
            <div className="skeleton-nutrition-data">
              <div className="skeleton-nutrition-value"></div>
              <div className="skeleton-nutrition-label"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Badge IA */}
      <div className="skeleton-ai-badge"></div>
    </div>

    {/* Indicateur de hover */}
    <div className="skeleton-hover-indicator"></div>
  </div>
);

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  // Query pour récupérer les produits
  const {
    data: productsData,
    isLoading,
    error
  } = useQuery({
    queryKey: queryKeys.products({
      page: currentPage,
      limit: 6
    }),
    queryFn: () => apiService.getProducts({
      page: currentPage,
      limit: 6
    }),
    keepPreviousData: true
  });

  // Mutation pour supprimer un produit
  const deleteProductMutation = useMutation({
    mutationFn: apiService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['stats']);
    },
    onError: (error) => {
      console.error('Erreur suppression:', error);
    }
  });

  const handleDelete = (product) => {
    if (window.confirm(`Supprimer "${product.name}" ?`)) {
      deleteProductMutation.mutate(product._id || product.id);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const products = productsData?.products || [];
  const totalPages = Math.ceil((productsData?.pagination?.total_products || 0) / 6);

  return (
    <div className="page-container">
      <div className="page-content">

        {/* En-tête premium de la page */}
        <div className="products-page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                <Sparkles className="title-icon" />
                Catalogue des Produits
              </h1>
              <p className="page-subtitle">
                Explorez notre base de données nutritionnelle avec prédictions IA
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{productsData?.pagination?.total_products || 0}</span>
                <span className="stat-label">Produits</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{totalPages}</span>
                <span className="stat-label">Pages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des produits avec grille premium */}
        <div className="products-section-premium">
          {isLoading ? (
            <div className="products-grid-premium">
              {[...Array(6)].map((_, i) => (
                <ProductCardPremiumSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="error-state-premium">
              <Package size={64} />
              <h3>Erreur de chargement</h3>
              <p>Impossible de récupérer les produits</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state-premium">
              <Package size={64} />
              <h3>Aucun produit trouvé</h3>
              <p>La base de données est vide ou aucun résultat ne correspond à votre recherche</p>
            </div>
          ) : (
            <div className="products-grid-premium">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onDelete={handleDelete}
                  variant="premium"
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination premium améliorée */}
        {products.length > 0 && totalPages > 1 && (
          <div className="pagination-premium">
            {/* Bouton Précédent */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn-premium prev"
            >
              ← Précédent
            </button>

            {/* Numéros de pages */}
            <div className="pagination-numbers">
              {(() => {
                const pages = [];
                const maxVisible = 5; // Nombre max de pages visibles

                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                // Ajuster si on est proche de la fin
                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1);
                }

                // Page 1 si pas visible
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="pagination-number"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(<span key="dots1" className="pagination-dots">...</span>);
                  }
                }

                // Pages visibles
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`pagination-number ${i === currentPage ? 'active' : ''}`}
                    >
                      {i}
                    </button>
                  );
                }

                // Dernière page si pas visible
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="dots2" className="pagination-dots">...</span>);
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="pagination-number"
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            {/* Bouton Suivant */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn-premium next"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;