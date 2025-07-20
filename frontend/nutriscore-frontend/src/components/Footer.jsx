import {
  ArrowUp,
  Award,
  Github,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Target,
  TrendingUp,
  Twitter,
  Users,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* Section principale */}
      <div className="footer-main">
        <div className="footer-container">

          {/* Section Marque */}
          <div className="footer-section brand-section">
            <div className="footer-logo">
              <div className="logo-icon">
                <Target className="logo-symbol" />
                <div className="logo-shine"></div>
              </div>
              <h3 className="brand-name">NutriPredict</h3>
            </div>
            <p className="brand-description">
              L'intelligence artificielle au service de votre nutrition.
              Analysez, prédisez et optimisez vos choix alimentaires avec notre IA avancée.
            </p>
            <div className="brand-stats">
              <div className="stat-item">
                <Users size={16} />
                <span>1000+ utilisateurs</span>
              </div>
              <div className="stat-item">
                <TrendingUp size={16} />
                <span>95% précision IA</span>
              </div>
              <div className="stat-item">
                <Award size={16} />
                <span>Innovation 2025</span>
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="footer-section">
            <h4 className="section-title">
              <Zap size={18} />
              Navigation
            </h4>
            <ul className="footer-links">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/products">Mes Produits</Link></li>
              <li><Link to="/add-product">Analyser</Link></li>
              <li><Link to="/scanner">Scanner</Link></li>
            </ul>
          </div>

          {/* Section Fonctionnalités */}
          <div className="footer-section">
            <h4 className="section-title">
              <Heart size={18} />
              Fonctionnalités
            </h4>
            <ul className="footer-links">
              <li>
                <Shield size={14} />
                Prédiction IA Nutri-Score
              </li>
              <li>
                <Target size={14} />
                Analyse nutritionnelle
              </li>
              <li>
                <Star size={14} />
                Recommandations personnalisées
              </li>
              <li>
                <TrendingUp size={14} />
                Suivi de qualité
              </li>
            </ul>
          </div>

          {/* Section Contact */}
          <div className="footer-section">
            <h4 className="section-title">
              <Mail size={18} />
              Contact
            </h4>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>hello@nutripredict.fr</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>Paris, France</span>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="social-links">
              <a href="#" className="social-link twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-link github">
                <Github size={18} />
              </a>
              <a href="#" className="social-link email">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Section bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="bottom-content">
            <div className="copyright">
              <p>© 2025 <strong>NutriPredict</strong> - Intelligence Nutritionnelle</p>
              <p className="sub-text">Développé avec ❤️ et React + Flask + IA</p>
            </div>
            <div className="footer-actions">
              <button className="scroll-top" onClick={scrollToTop}>
                <ArrowUp size={16} />
                Retour haut
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;