// ===========================================
// PAGE LISTE PRODUITS - Ultra Simplifiée
// ===========================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { apiService, queryKeys } from '../services/api';
import './ProductsPage.css';

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
      limit: 12
    }),
    queryFn: () => apiService.getProducts({
      page: currentPage,
      limit: 12
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
  const totalPages = Math.ceil((productsData?.pagination?.total_products || 0) / 12);

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Liste des produits */}
        <div className="products-section">
          {isLoading ? (
            <div className="products-grid">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Erreur de chargement</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>Aucun produit</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {products.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Précédent
            </button>

            <span className="pagination-info">
              Page {currentPage} sur {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;