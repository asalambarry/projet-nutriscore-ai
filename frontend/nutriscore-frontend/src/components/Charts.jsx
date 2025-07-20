
import { BarChart3, Info, TrendingUp } from 'lucide-react';
import { getNutriScoreColor, getNutriScoreText } from '../services/api';

// Composant Bar Chart pour distribution Nutri-Score
export const NutriScoreDistributionChart = ({ data = {}, className = '' }) => {
    const scores = ['A', 'B', 'C', 'D', 'E'];
    const maxValue = Math.max(...Object.values(data));

    return (
        <div className={`chart-container ${className}`}>
            <div className="chart-header">
                <h3 className="chart-title">
                    <BarChart3 size={20} />
                    Distribution des Nutri-Scores
                </h3>
                <p className="chart-subtitle">Répartition des produits par score nutritionnel</p>
            </div>

            <div className="bar-chart">
                {scores.map(score => {
                    const count = data[score] || 0;
                    const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;

                    return (
                        <div key={score} className="bar-item">
                            <div className="bar-label">
                                <span
                                    className="nutri-badge"
                                    style={{ backgroundColor: getNutriScoreColor(score) }}
                                >
                                    {score}
                                </span>
                                <span className="nutri-text">{getNutriScoreText(score)}</span>
                            </div>
                            <div className="bar-wrapper">
                                <div
                                    className="bar-fill"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: getNutriScoreColor(score)
                                    }}
                                />
                                <span className="bar-value">{count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Composant pour afficher les top marques/catégories avec barres verticales
export const TopItemsChart = ({ data = {}, title, icon: Icon, className = '' }) => {
    const items = Object.entries(data).slice(0, 5);
    const maxValue = Math.max(...Object.values(data));

    return (
        <div className={`chart-container ${className}`}>
            <div className="chart-header">
                <h3 className="chart-title">
                    {Icon && <Icon size={20} />}
                    {title}
                </h3>
            </div>

            <div className="vertical-bar-chart chart-vertical-bars">
                {items.map(([item, count], index) => {
                    const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;
                    const height = Math.max(percentage, 5); // Hauteur minimum pour la visibilité

                    return (
                        <div key={item} className="vertical-bar-item">
                            <div className="vertical-bar-wrapper">
                                <div
                                    className="vertical-bar-fill"
                                    style={{
                                        height: `${height}%`,
                                        animationDelay: `${index * 0.2}s`
                                    }}
                                />
                                <span className="vertical-bar-value">{count}</span>
                            </div>
                            <div className="vertical-bar-label">
                                <span className="brand-name" title={item}>
                                    {item.length > 10 ? `${item.substring(0, 10)}...` : item}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Composant pour matrice de corrélation simplifiée
export const CorrelationMatrix = ({ data = {}, className = '' }) => {
    const nutrients = Object.keys(data);

    const getCorrelationColor = (value) => {
        const absValue = Math.abs(value);
        if (absValue >= 0.7) return '#e74c3c'; // Rouge fort
        if (absValue >= 0.5) return '#f39c12'; // Orange
        if (absValue >= 0.3) return '#f1c40f'; // Jaune
        return '#95a5a6'; // Gris
    };

    const getCorrelationText = (value) => {
        const absValue = Math.abs(value);
        if (absValue >= 0.7) return 'Forte';
        if (absValue >= 0.5) return 'Modérée';
        if (absValue >= 0.3) return 'Faible';
        return 'Très faible';
    };

    return (
        <div className={`chart-container correlation-matrix ${className}`}>
            <div className="chart-header">
                <h3 className="chart-title">
                    <TrendingUp size={20} />
                    Corrélations entre Nutriments
                </h3>
                <div className="correlation-legend">
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
                        <span>Forte (≥0.7)</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#f39c12' }}></div>
                        <span>Modérée (≥0.5)</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#f1c40f' }}></div>
                        <span>Faible (≥0.3)</span>
                    </div>
                </div>
            </div>

            <div className="correlation-grid">
                {nutrients.map(nutrient1 => (
                    <div key={nutrient1} className="correlation-row">
                        <div className="nutrient-label">{nutrient1}</div>
                        <div className="correlation-cells">
                            {nutrients.map(nutrient2 => {
                                const correlation = data[nutrient1]?.[nutrient2] || data[nutrient2]?.[nutrient1] || 0;

                                return (
                                    <div
                                        key={`${nutrient1}-${nutrient2}`}
                                        className="correlation-cell"
                                        style={{ backgroundColor: getCorrelationColor(correlation) }}
                                        title={`${nutrient1} - ${nutrient2}: ${correlation.toFixed(3)} (${getCorrelationText(correlation)})`}
                                    >
                                        <span className="correlation-value">{correlation.toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Composant pour distribution d'un nutriment
export const NutrientDistribution = ({ data, nutrient, className = '' }) => {
    if (!data || !data.bins) return null;

    const { bins, total_values, min, max, avg } = data;
    const maxCount = Math.max(...bins.map(bin => bin.count));

    return (
        <div className={`chart-container nutrient-distribution ${className}`}>
            <div className="chart-header">
                <h3 className="chart-title">
                    <Info size={20} />
                    Distribution - {nutrient}
                </h3>
                <div className="distribution-stats">
                    <span>Total: {total_values}</span>
                    <span>Min: {min.toFixed(1)}</span>
                    <span>Moy: {avg.toFixed(1)}</span>
                    <span>Max: {max.toFixed(1)}</span>
                </div>
            </div>

            <div className="histogram">
                {bins.map((bin, index) => {
                    const height = maxCount > 0 ? (bin.count / maxCount) * 100 : 0;

                    return (
                        <div key={index} className="histogram-bar">
                            <div
                                className="histogram-fill"
                                style={{ height: `${height}%` }}
                                title={`${bin.range}: ${bin.count} produits`}
                            />
                            <div className="histogram-label">
                                <span className="range-label">{bin.range}</span>
                                <span className="count-label">{bin.count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Composant pour afficher des statistiques clés
export const StatsCards = ({ analytics, className = '' }) => {
    const {
        total_analyzed = 0,
        nutri_score_distribution = {},
        nutrition_descriptive = {}
    } = analytics;

    const bestScore = nutri_score_distribution.A || 0;
    const worstScore = nutri_score_distribution.E || 0;
    const avgEnergy = nutrition_descriptive.energy?.mean || 0;

    const stats = [
        {
            label: 'Produits analysés',
            value: total_analyzed,
            icon: '📊',
            color: '#3498db'
        },
        {
            label: 'Score A (Excellent)',
            value: bestScore,
            icon: '🟢',
            color: '#00a550'
        },
        {
            label: 'Score E (Mauvais)',
            value: worstScore,
            icon: '🔴',
            color: '#e63946'
        },
        {
            label: 'Énergie moyenne',
            value: `${avgEnergy.toFixed(0)} kcal`,
            icon: '⚡',
            color: '#f39c12'
        }
    ];

    return (
        <div className={`stats-cards ${className}`}>
            {stats.map((stat, index) => (
                <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Composant d'état de chargement pour les graphiques
export const ChartSkeleton = ({ height = '300px', className = '' }) => (
    <div className={`chart-skeleton ${className}`} style={{ height }}>
        <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
        </div>
        <div className="skeleton-body">
            <div className="skeleton-bars">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton-bar" style={{ height: `${60 + Math.random() * 40}%` }}></div>
                ))}
            </div>
        </div>
    </div>
);