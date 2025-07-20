
import { Heart, List, Menu, Plus, Search, Target, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigation SPA vers la page de recherche
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(''); // Vider le champ après recherche
        }
    };

    const isActive = (path) => location.pathname === path;


    const NutriPredictLogo = () => (
        <svg width="48" height="48" viewBox="0 0 48 48" className="logo-svg">
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="50%" stopColor="#764ba2" />
                    <stop offset="100%" stopColor="#f093fb" />
                </linearGradient>
                <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2ecc71" />
                    <stop offset="100%" stopColor="#27ae60" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Cercle principal avec gradient */}
            <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" filter="url(#glow)" opacity="0.9" />

            {/* Lettres NP stylisées */}
            <text x="24" y="30" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui">
                NP
            </text>

            {/* Feuille décorative */}
            <path d="M 32 16 Q 38 12 40 18 Q 38 24 32 20 Q 30 18 32 16" fill="url(#leafGradient)" opacity="0.8" />

            {/* Particules brillantes */}
            <circle cx="16" cy="16" r="1.5" fill="#f093fb" opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="36" cy="32" r="1" fill="#667eea" opacity="0.7">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
            </circle>
        </svg>
    );

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo et titre premium */}
                <div className="header-brand">
                    <Link to="/" className="brand-link">
                        <div className="logo-container">
                            <NutriPredictLogo />
                            <div className="logo-shine"></div>
                        </div>
                        <div className="brand-text">
                            <h1 className="brand-title">
                                <span className="brand-nutri">Nutri</span>
                                <span className="brand-predict">Predict</span>
                            </h1>
                            <p className="brand-subtitle">
                                <Zap size={12} className="subtitle-icon" />
                                IA Nutritionnelle Avancée
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Barre de recherche premium - Desktop */}
                <div className="search-container desktop-only">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Analysez un produit alimentaire..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <div className="search-gradient"></div>
                        </div>
                        <button type="submit" className="search-btn">
                            <Target size={18} />
                            <span>Rechercher</span>
                        </button>
                    </form>
                </div>

                {/* Navigation premium - Desktop */}
                <nav className="nav-desktop desktop-only">
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
                    >
                        <Heart size={18} />
                        <span>Accueil</span>
                        <div className="nav-indicator"></div>
                    </Link>
                    <Link
                        to="/products"
                        className={`nav-link ${isActive('/products') ? 'nav-link-active' : ''}`}
                    >
                        <List size={18} />
                        <span>Produits</span>
                        <div className="nav-indicator"></div>
                    </Link>
                    <Link
                        to="/add-product"
                        className={`nav-link nav-link-cta ${isActive('/add-product') ? 'nav-link-active' : ''}`}
                    >
                        <Plus size={18} />
                        <span>Analyser</span>
                        <div className="nav-indicator"></div>
                    </Link>
                </nav>

                {/* Menu mobile button */}
                <button
                    className="mobile-menu-btn mobile-only"
                    onClick={toggleMobileMenu}
                    aria-label="Menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    <div className="mobile-btn-bg"></div>
                </button>
            </div>

            {/* Menu mobile */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <div className="mobile-menu-backdrop" onClick={toggleMobileMenu}></div>
                <div className="mobile-menu-content">
                    {/* Recherche mobile */}
                    <div className="mobile-search">
                        <form onSubmit={handleSearch} className="mobile-search-form">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={20} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <button type="submit" className="mobile-search-btn">
                                Analyser
                            </button>
                        </form>
                    </div>

                    {/* Navigation mobile */}
                    <nav className="mobile-nav">
                        <Link
                            to="/"
                            className={`mobile-nav-link ${isActive('/') ? 'mobile-nav-link-active' : ''}`}
                            onClick={toggleMobileMenu}
                        >
                            <Heart size={20} />
                            <span>Accueil</span>
                        </Link>
                        <Link
                            to="/products"
                            className={`mobile-nav-link ${isActive('/products') ? 'mobile-nav-link-active' : ''}`}
                            onClick={toggleMobileMenu}
                        >
                            <List size={20} />
                            <span>Produits</span>
                        </Link>
                        <Link
                            to="/add-product"
                            className={`mobile-nav-link mobile-nav-link-cta ${isActive('/add-product') ? 'mobile-nav-link-active' : ''}`}
                            onClick={toggleMobileMenu}
                        >
                            <Plus size={20} />
                            <span>Analyser un produit</span>
                        </Link>
                    </nav>

                    {/* Informations app mobile */}
                    <div className="mobile-app-info">
                        <div className="mobile-logo">
                            <NutriPredictLogo />
                        </div>
                        <h3>NutriPredict</h3>
                        <p>Intelligence Artificielle pour une alimentation saine</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;