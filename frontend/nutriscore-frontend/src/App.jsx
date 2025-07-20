// ===========================================
// APP PRINCIPAL - NUTRI-SCORE SIMPLIFIÉ
// ===========================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import { NotificationProvider } from './contexts/NotificationContext';

// Import des styles globaux
import './App.css';
import './styles/globals.css';

// Lazy loading des pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AddProductPage = lazy(() => import('./pages/AddProductPage'));
const EditProductPage = lazy(() => import('./pages/EditProductPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Composant de chargement
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p className="loading-text">Chargement...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Router>
          <div className="app">
            {/* Header fixe */}
            <Header />

            {/* Contenu principal */}
            <main className="main-content">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Page d'accueil */}
                  <Route path="/" element={<HomePage />} />

                  {/* Ajouter un produit */}
                  <Route path="/add-product" element={<AddProductPage />} />

                  {/* Liste des produits */}
                  <Route path="/products" element={<ProductsPage />} />

                  {/* Modifier un produit - DOIT être avant /products/:id */}
                  <Route path="/products/:id/edit" element={<EditProductPage />} />

                  {/* Détail d'un produit */}
                  <Route path="/products/:id" element={<ProductDetailPage />} />

                  {/* Recherche */}
                  <Route path="/search" element={<SearchPage />} />

                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Page 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

// Page 404
const NotFoundPage = () => (
  <div className="not-found-page">
    <div className="not-found-content">
      <div className="not-found-icon">🔍</div>
      <h1 className="not-found-title">Page non trouvée</h1>
      <p className="not-found-description">
        La page que vous recherchez n'existe pas.
      </p>
      <a href="/" className="btn btn-primary">
        Retour à l'accueil
      </a>
    </div>
  </div>
);

export default App;
