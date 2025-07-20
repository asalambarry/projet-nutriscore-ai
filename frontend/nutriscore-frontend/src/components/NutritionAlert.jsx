import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import './NutritionAlert.css';

const NutritionAlert = ({ grade, showRecommendations = false, productId = null, onClose = null }) => {
    const [advice, setAdvice] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRecs, setShowRecs] = useState(false);

    useEffect(() => {
        fetchNutritionAdvice();
        if (showRecommendations && productId && ['D', 'E'].includes(grade?.toUpperCase())) {
            fetchRecommendations();
        }
    }, [grade, productId, showRecommendations]);

    const fetchNutritionAdvice = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/nutrition-advice/${grade}`);
            if (response.ok) {
                const data = await response.json();
                setAdvice(data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des conseils:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        if (!productId) return;

        try {
            const response = await fetch(`http://127.0.0.1:5001/api/products/${productId}/recommendations`);
            if (response.ok) {
                const data = await response.json();
                setRecommendations(data.recommendations || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des recommandations:', error);
        }
    };

    const getIcon = () => {
        if (!advice) return <Info size={20} />;

        switch (advice.status) {
            case 'excellent':
            case 'good':
                return <CheckCircle size={20} />;
            case 'moderate':
                return <Info size={20} />;
            case 'poor':
            case 'very_poor':
                return <AlertTriangle size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    const getAlertClass = () => {
        if (!advice) return 'nutrition-alert';
        return `nutrition-alert nutrition-alert--${advice.color}`;
    };

    if (loading || !advice) {
        return (
            <div className="nutrition-alert nutrition-alert--loading">
                <div className="loading-spinner"></div>
                <span>Chargement des conseils nutritionnels...</span>
            </div>
        );
    }

    return (
        <div className={getAlertClass()}>
            {onClose && (
                <button className="nutrition-alert__close" onClick={onClose}>
                    <X size={16} />
                </button>
            )}

            <div className="nutrition-alert__header">
                <div className="nutrition-alert__icon">
                    {getIcon()}
                </div>
                <div className="nutrition-alert__content">
                    <h4 className="nutrition-alert__title">
                        {advice.icon} {advice.message}
                    </h4>
                    <p className="nutrition-alert__description">
                        {advice.description}
                    </p>
                </div>
            </div>

            {/* Recommandations pour les mauvais scores */}
            {showRecommendations && ['D', 'E'].includes(grade?.toUpperCase()) && recommendations.length > 0 && (
                <div className="nutrition-alert__recommendations">
                    <div className="recommendations-header">
                        <h5>🌟 Alternatives plus saines :</h5>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setShowRecs(!showRecs)}
                        >
                            {showRecs ? 'Masquer' : `Voir ${recommendations.length} alternatives`}
                        </button>
                    </div>

                    {showRecs && (
                        <div className="recommendations-list">
                            {recommendations.slice(0, 3).map((product) => (
                                <div key={product.id} className="recommendation-item">
                                    <div className="recommendation-info">
                                        <h6 className="recommendation-name">{product.name}</h6>
                                        <span className="recommendation-brand">{product.brand}</span>
                                    </div>
                                    <div className={`nutri-score-badge nutri-score-badge--${product.nutri_score.grade?.toLowerCase()}`}>
                                        {product.nutri_score.grade}
                                    </div>
                                </div>
                            ))}

                            {recommendations.length > 3 && (
                                <div className="recommendations-more">
                                    <span>+{recommendations.length - 3} autres alternatives</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Message d'encouragement pour les bons scores */}
            {['A', 'B'].includes(grade?.toUpperCase()) && (
                <div className="nutrition-alert__encouragement">
                    <p>
                        🎉 <strong>Excellent choix !</strong> Continuez sur cette voie pour une alimentation saine.
                    </p>
                </div>
            )}
        </div>
    );
};

export default NutritionAlert;