
import { List, Menu, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigation vers la page de recherche
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo et titre */}
        <div className="header-brand">
          <Link to="/" className="brand-link">
            <div className="logo">
              <span className="logo-icon">🥗</span>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">NutriScore</h1>
              <p className="brand-subtitle">Analysez vos aliments</p>
            </div>
          </Link>
        </div>

        {/* Barre de recherche - Desktop */}
        <div className="search-container desktop-only">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button">
              Rechercher
            </button>
          </form>
        </div>

        {/* Navigation - Desktop */}
        <nav className="nav-desktop">
          <Link
            to="/add"
            className={`nav-link ${location.pathname === '/add' ? 'active' : ''}`}
          >
            <Plus size={18} />
            <span>Ajouter</span>
          </Link>
          <Link
            to="/products"
            className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
          >
            <List size={18} />
            <span>Mes produits</span>
          </Link>
        </nav>

        {/* Menu mobile button */}
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {/* Recherche mobile */}
          <div className="mobile-search">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </form>
          </div>

          {/* Navigation mobile */}
          <nav className="mobile-nav">
            <Link
              to="/add"
              className={`mobile-nav-link ${location.pathname === '/add' ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Plus size={20} />
              <span>Ajouter un produit</span>
            </Link>
            <Link
              to="/products"
              className={`mobile-nav-link ${location.pathname === '/products' ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <List size={20} />
              <span>Mes produits</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;