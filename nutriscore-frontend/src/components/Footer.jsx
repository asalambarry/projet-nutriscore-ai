import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Nutri-Score App</h4>
          <p>Application d'analyse nutritionnelle avec prédiction automatique du Nutri-Score</p>
        </div>

        <div className="footer-section">
          <h4>Fonctionnalités</h4>
          <ul>
            <li>Ajout de produits</li>
            <li>Prédiction ML du Nutri-Score</li>
            <li>Gestion des produits</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>À propos</h4>
          <p>Développé avec React & Flask</p>
          <p>Machine Learning intégré</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Nutri-Score App. Projet alimentaire.</p>
      </div>
    </footer>
  );
};

export default Footer;