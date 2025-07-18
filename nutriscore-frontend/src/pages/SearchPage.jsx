// ===========================================
// PAGE RECHERCHE - Simplifiée
// ===========================================

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiService, queryKeys } from '../services/api';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const {
    data: searchResults,
    isLoading,
    error
  } = useQuery({
    queryKey: queryKeys.search({ q: searchQuery }),
    queryFn: () => apiService.advancedSearch({ q: searchQuery }),
    enabled: searchQuery.length > 0
  });

  const products = searchResults?.products || [];

  return (
    <div className="search-page">
      <div className="search-results">
        {isLoading && <p>Recherche en cours...</p>}

        {error && <p className="error">Erreur lors de la recherche</p>}

        {!isLoading && !error && searchQuery && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && !error && searchQuery && products.length === 0 && (
          <p>Aucun produit trouvé</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;