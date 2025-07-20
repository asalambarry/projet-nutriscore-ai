// ===========================================
// PAGE RECHERCHE - Version Premium
// ===========================================

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Package, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiService, queryKeys } from '../services/api';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const {
    data: searchResults,
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: queryKeys.search({ q: searchQuery }),
    queryFn: () => apiService.advancedSearch({ q: searchQuery }),
    enabled: searchQuery.length > 0,
    retry: 1
  });

  const products = searchResults?.products || [];
  const totalResults = searchResults?.total || 0;



  // État de chargement
  if (isLoading) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h1 className="search-title">
            <Search size={28} />
            Recherche en cours...
          </h1>
          <p className="search-query">"{searchQuery}"</p>
        </div>

        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p className="loading-text">Analyse des produits en cours...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (isError) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h1 className="search-title">
            <AlertCircle size={28} />
            Erreur de recherche
          </h1>
        </div>

        <div className="error-container">
          <AlertCircle size={48} className="error-icon" />
          <h2>Oops ! Une erreur s'est produite</h2>
          <p>Impossible d'effectuer la recherche pour "{searchQuery}"</p>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // Aucune requête de recherche
  if (!searchQuery) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h1 className="search-title">
            <Search size={28} />
            Recherche de produits
          </h1>
        </div>

        <div className="empty-search-container">
          <Search size={64} className="empty-search-icon" />
          <h2>Recherchez un produit alimentaire</h2>
          <p>Utilisez la barre de recherche pour trouver des produits et analyser leur Nutri-Score</p>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      {/* Header de recherche */}
      <div className="search-header">
        <h1 className="search-title">
          <Search size={28} />
          Résultats de recherche
        </h1>
        <p className="search-query">"{searchQuery}"</p>
        <div className="search-stats">
          <span className="results-count">
            {totalResults > 0 ? `${totalResults} produit${totalResults > 1 ? 's' : ''} trouvé${totalResults > 1 ? 's' : ''}` : 'Aucun produit trouvé'}
          </span>
        </div>
      </div>

      {/* Résultats de recherche */}
      <div className="search-results">
        {products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Message de fin de résultats */}
            {products.length >= 20 && (
              <div className="search-footer">
                <p>Affichage des {products.length} premiers résultats</p>
                <p className="search-tip">
                  💡 Précisez votre recherche pour des résultats plus ciblés
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="no-results-container">
            <Package size={64} className="no-results-icon" />
            <h2>Aucun produit trouvé</h2>
            <p>Nous n'avons trouvé aucun produit correspondant à "{searchQuery}"</p>

            <div className="search-suggestions">
              <h3>Suggestions :</h3>
              <ul>
                <li>Vérifiez l'orthographe de votre recherche</li>
                <li>Essayez des termes plus généraux</li>
                <li>Recherchez par marque ou catégorie</li>
              </ul>
            </div>

            <div className="search-actions">
              <Link to="/add-product" className="btn btn-primary">
                Ajouter ce produit
              </Link>
              <Link to="/products" className="btn btn-ghost">
                Voir tous les produits
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;