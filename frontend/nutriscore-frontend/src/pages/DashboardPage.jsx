
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import {
    ChartSkeleton,
    NutriScoreDistributionChart,
    StatsCards
} from '../components/Charts';
import { VerticalBarChart } from '../components/VerticalBarChart';
import { apiService, queryKeys } from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  // Récupération des données analytiques
  const { data: analytics, isLoading: loadingAnalytics, error: analyticsError } = useQuery({
    queryKey: queryKeys.analytics(),
    queryFn: () => apiService.getAnalytics(),
  });

  const nutrientLabels = {
    'energy': 'Énergie (kcal)',
    'sugars': 'Sucres (g)',
    'salt': 'Sel (g)',
    'proteins': 'Protéines (g)'
  };

  if (analyticsError) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <h2>Erreur de chargement</h2>
          <p>Impossible de charger les données d'analyse.</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* En-tête */}
      <div className="dashboard-header">
        <h1>📊 Dashboard Nutritionnel</h1>
        <p className="dashboard-subtitle">
          Analyses détaillées basées sur {analytics?.total_analyzed || 0} produits alimentaires
        </p>
      </div>

      {/* Cartes de statistiques principales */}
      {loadingAnalytics ? (
        <div className="stats-skeleton">
          {[...Array(4)].map((_, i) => (
            <ChartSkeleton key={i} height="120px" />
          ))}
        </div>
      ) : (
        <StatsCards analytics={analytics} />
      )}

            {/* Grille principale des graphiques */}
      <div className="dashboard-grid">

        {/* Distribution des Nutri-Scores - GRAPHIQUE PRINCIPAL */}
        <div className="chart-section full-width main-chart">
          {loadingAnalytics ? (
            <ChartSkeleton height="400px" />
          ) : (
            <NutriScoreDistributionChart
              data={analytics?.nutri_score_distribution}
            />
          )}
        </div>

        {/* Top marques - GRAPHIQUE À BARRES VERTICALES */}
        <div className="chart-section full-width">
          {loadingAnalytics ? (
            <ChartSkeleton height="400px" />
          ) : (
            <VerticalBarChart
              data={Object.fromEntries(Object.entries(analytics?.top_brands || {}).slice(0, 5))}
              title="🏢 Top 5 Marques"
              icon={Building2}
            />
          )}
        </div>

        {/* Indicateurs clés nutritionnels */}
        <div className="nutrition-insights full-width">
          <h2>🎯 Indicateurs Nutritionnels Clés</h2>
          {loadingAnalytics ? (
            <ChartSkeleton height="300px" />
          ) : (
            <div className="insights-grid">
              {['energy', 'sugars', 'salt', 'proteins'].map(nutrient => {
                const stats = analytics?.nutrition_descriptive?.[nutrient];
                if (!stats) return null;

                return (
                  <div key={nutrient} className="insight-card">
                    <h4>{nutrientLabels[nutrient]}</h4>
                    <div className="insight-value">{stats.mean?.toFixed(1)}</div>
                    <div className="insight-label">Moyenne</div>
                    <div className="insight-range">
                      {stats.min?.toFixed(1)} - {stats.max?.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Résumé simplifié */}
        <div className="simple-summary full-width">
          <div className="summary-cards">
            <div className="summary-card quality">
              <div className="summary-icon">🎯</div>
              <div className="summary-text">
                <h3>Qualité des Données</h3>
                <p>{analytics?.total_analyzed || 0} produits analysés avec une précision de 78.6%</p>
              </div>
            </div>
            <div className="summary-card trends">
              <div className="summary-icon">📈</div>
              <div className="summary-text">
                <h3>Tendances Principales</h3>
                <p>Distribution inégale des Nutri-Scores, prédominance des scores moyens (C, D)</p>
              </div>
            </div>
            <div className="summary-card performance">
              <div className="summary-icon">⚡</div>
              <div className="summary-text">
                <h3>Performance ML</h3>
                <p>Modèle Random Forest avec corrélations fortes entre nutriments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;