// ===========================================
// PAGE D'ACCUEIL - Version simplifiée
// ===========================================

import { useQuery } from '@tanstack/react-query';
import { BarChart3, List, Plus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiService, queryKeys } from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const { data: recentProducts, isLoading: loadingProducts } = useQuery({
    queryKey: queryKeys.products({ limit: 6 }),
    queryFn: () => apiService.getProducts({ limit: 6 }),
  });

  const { data: stats } = useQuery({
    queryKey: queryKeys.stats(),
    queryFn: () => apiService.getStats(),
  });

  const products = recentProducts?.products || [];
  const totalProducts = stats?.total_products || 0;
  const gradeDistribution = stats?.grade_distribution || {};

  // Calculer les meilleures notes
  const topGrades = Object.entries(gradeDistribution)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 3);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Nutri-Score</h1>
        <p className="subtitle">Analysez la qualité nutritionnelle de vos produits</p>
      </div>

      <div className="quick-actions">
        <Link to="/add" className="action-card primary">
          <Plus size={24} />
          <span>Ajouter</span>
        </Link>
        <Link to="/products" className="action-card secondary">
          <List size={24} />
          <span>Mes produits</span>
        </Link>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalProducts}</div>
            <div className="stat-label">Produits analysés</div>
          </div>
        </div>

        {topGrades.length > 0 && (
          <div className="stat-card">
            <div className="stat-icon nutri-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="nutri-grades">
                {topGrades.map(([grade, count]) => (
                  <span key={grade} className={`grade-badge grade-${grade.toLowerCase()}`}>
                    {grade}: {count}
                  </span>
                ))}
              </div>
              <div className="stat-label">Répartition Nutri-Score</div>
            </div>
          </div>
        )}
      </div>

      {!loadingProducts && products.length > 0 && (
        <div className="recent-section">
          <h2>Produits récents</h2>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                variant="compact"
              />
            ))}
          </div>
        </div>
      )}

      {totalProducts === 0 && (
        <div className="empty-state">
          <h3>Commencez votre analyse nutritionnelle</h3>
          <p>Ajoutez votre premier produit pour voir ses statistiques Nutri-Score</p>
          <Link to="/add" className="btn btn-primary">
            <Plus size={20} />
            Ajouter mon premier produit
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;