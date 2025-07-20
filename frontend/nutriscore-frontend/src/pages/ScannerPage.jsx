// ===========================================
// PAGE SCANNER - Placeholder
// ===========================================

import { Scan } from 'lucide-react';

const ScannerPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Scanner un produit</h1>
        <p className="page-subtitle">
          Scannez le code-barres d'un produit pour analyser son Nutri-Score
        </p>
      </div>

      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Scan size={64} />
          </div>
          <h3 className="empty-state-title">Scanner en cours de développement</h3>
          <p className="empty-state-description">
            Cette fonctionnalité sera bientôt disponible. En attendant, vous pouvez ajouter des produits manuellement.
          </p>
          <a href="/add" className="btn btn-primary">
            Ajouter manuellement
          </a>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;