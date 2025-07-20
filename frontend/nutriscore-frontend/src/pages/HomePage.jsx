// ===========================================
// PAGE D'ACCUEIL - VERSION PREMIUM ATTRACTIVE
// ===========================================

import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Brain,
  CheckCircle,
  ChevronRight,
  Package,
  Plus,
  Shield,
  Sparkles,
  Star,
  Target,
  Zap
} from 'lucide-react';
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

  const features = [
    {
      icon: Brain,
      title: "IA Avancée",
      description: "Prédiction précise basée sur l'intelligence artificielle et le machine learning"
    },
    {
      icon: Zap,
      title: "Analyse Instantanée",
      description: "Résultats en temps réel pour tous vos produits alimentaires"
    },
    {
      icon: Shield,
      title: "Données Fiables",
      description: "Base de données certifiée OpenFoodFacts avec plus de 1M de produits"
    },
    {
      icon: Target,
      title: "Précision 78.6%",
      description: "Modèle Random Forest optimisé pour des prédictions fiables"
    }
  ];

  const benefits = [
    "Améliorer votre alimentation",
    "Prendre des décisions éclairées",
    "Suivre vos habitudes nutritionnelles",
    "Découvrir des alternatives saines"
  ];

  return (
    <div className="home-page-premium">
      {/* Hero Section avec gradient animé */}
      <section className="hero-premium">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Propulsé par l'IA</span>
          </div>

          <h1 className="hero-title">
            Découvrez le
            <span className="highlight"> Nutri-Score</span>
            <br />de vos produits
          </h1>

          <p className="hero-description">
            Analysez instantanément la qualité nutritionnelle de vos aliments
            grâce à notre IA avancée. Prenez des décisions éclairées pour votre santé.
          </p>

          <div className="hero-actions">
            <Link to="/add" className="cta-primary">
              <Plus size={20} />
              <span>Analyser un produit</span>
              <ChevronRight size={16} />
            </Link>

            <Link to="/dashboard" className="cta-secondary">
              <BarChart3 size={20} />
              <span>Voir Dashboard</span>
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{totalProducts}+</div>
              <div className="stat-label">Produits analysés</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">78.6%</div>
              <div className="stat-label">Précision IA</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Base de données</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Features */}
      <section className="features-section">
        <div className="section-header">
          <h2>Pourquoi choisir notre application ?</h2>
          <p>Une technologie de pointe au service de votre santé</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="feature-icon">
                <feature.icon size={32} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Benefits */}
      <section className="benefits-section">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2>Transformez votre alimentation</h2>
            <p>Notre application vous aide à :</p>
            <ul className="benefits-list">
              {benefits.map((benefit, index) => (
                <li key={index} className="benefit-item">
                  <CheckCircle size={20} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link to="/products" className="benefits-cta">
              Voir mes produits
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="benefits-visual">
            <div className="nutri-score-demo">
              <div className="score-badge score-a">A</div>
              <div className="score-badge score-b">B</div>
              <div className="score-badge score-c">C</div>
              <div className="score-badge score-d">D</div>
              <div className="score-badge score-e">E</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Produits Récents */}
      {products.length > 0 && (
        <section className="recent-products-section">
          <div className="section-header">
            <h2>Derniers produits analysés</h2>
            <Link to="/products" className="view-all">
              Voir tout
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="products-grid">
            {loadingProducts ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="product-card-premium skeleton">
                  <div className="skeleton-top-bar"></div>
                  <div className="skeleton-image-container">
                    <div className="skeleton-image">
                      <Package size={48} className="skeleton-icon" />
                    </div>
                    <div className="skeleton-nutri-badge"></div>
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-header">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-meta">
                        <div className="skeleton-tag"></div>
                        <div className="skeleton-tag"></div>
                      </div>
                    </div>
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
                  </div>
                  <div className="skeleton-hover-indicator"></div>
                </div>
              ))
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  variant="premium"
                  showActions={false}
                  className="product-card-home"
                />
              ))
            )}
          </div>
        </section>
      )}

      {/* Call to Action Final */}
      <section className="final-cta">
        <div className="cta-content">
          <Star className="cta-icon" size={48} />
          <h2>Prêt à améliorer votre alimentation ?</h2>
          <p>Commencez dès maintenant à analyser vos produits</p>
          <Link to="/add" className="cta-final">
            Commencer maintenant
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;