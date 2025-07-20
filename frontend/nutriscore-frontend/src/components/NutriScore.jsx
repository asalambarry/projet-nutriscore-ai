

import { getNutriScoreColor, getNutriScoreText } from '../services/api';
import './NutriScore.css';

// Fonction utilitaire pour normaliser le grade
const normalizeGrade = (grade) => {
    if (!grade) return null;
    if (typeof grade !== 'string' && typeof grade !== 'number') return null;
    return String(grade).toUpperCase();
};

const NutriScore = ({
    grade,
    probabilities = {},
    size = 'md',
    showDetails = false,
    showProbabilities = false,
    className = ''
}) => {
    const gradeUpper = normalizeGrade(grade);
    if (!gradeUpper) return null;

    const color = getNutriScoreColor(gradeUpper);
    const description = getNutriScoreText(gradeUpper);

    // Calculer la probabilité principale
    const mainProbability = probabilities[gradeUpper] || 0;
    const probabilityPercent = Math.round(mainProbability * 100);

    return (
        <div className={`nutri-score-container ${className}`}>
            {/* Badge principal du Nutri-Score */}
            <div className={`nutri-score-badge ${size}`}>
                <div
                    className="nutri-score-circle"
                    style={{ backgroundColor: color }}
                >
                    <span className="nutri-score-letter">{gradeUpper}</span>
                </div>

                {showDetails && (
                    <div className="nutri-score-info">
                        <span className="nutri-score-description">{description}</span>
                        {probabilityPercent > 0 && (
                            <span className="nutri-score-confidence">
                                {probabilityPercent}% de confiance
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Détails des probabilités */}
            {showProbabilities && probabilities && (
                <div className="nutri-score-probabilities">
                    <h4 className="probabilities-title">Probabilités détaillées</h4>
                    <div className="probabilities-list">
                        {Object.entries(probabilities).map(([prob_grade, probability]) => (
                            <div
                                key={prob_grade}
                                className={`probability-item ${prob_grade.toLowerCase() === gradeUpper.toLowerCase() ? 'active' : ''}`}
                            >
                                <div className="probability-header">
                                    <span
                                        className="probability-grade"
                                        style={{ backgroundColor: getNutriScoreColor(prob_grade) }}
                                    >
                                        {prob_grade}
                                    </span>
                                    <span className="probability-text">
                                        {getNutriScoreText(prob_grade)}
                                    </span>
                                    <span className="probability-value">
                                        {Math.round(probability * 100)}%
                                    </span>
                                </div>
                                <div className="probability-bar">
                                    <div
                                        className="probability-fill"
                                        style={{
                                            width: `${probability * 100}%`,
                                            backgroundColor: getNutriScoreColor(prob_grade)
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Composant pour afficher une échelle Nutri-Score complète
export const NutriScoreScale = ({ currentGrade, className = '' }) => {
    const grades = [
        { letter: 'A', color: '#00a550', description: 'Excellent' },
        { letter: 'B', color: '#85c440', description: 'Bon' },
        { letter: 'C', color: '#f9b000', description: 'Moyen' },
        { letter: 'D', color: '#ff8c00', description: 'Médiocre' },
        { letter: 'E', color: '#e63946', description: 'Mauvais' }
    ];

    return (
        <div className={`nutri-score-scale ${className}`}>
            <div className="scale-title">Échelle Nutri-Score</div>
            <div className="scale-grades">
                {grades.map((grade) => (
                    <div
                        key={grade.letter}
                        className={`scale-grade ${currentGrade?.toUpperCase() === grade.letter ? 'current' : ''}`}
                    >
                        <div
                            className="scale-circle"
                            style={{ backgroundColor: grade.color }}
                        >
                            {grade.letter}
                        </div>
                        <span className="scale-description">{grade.description}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Composant simplifié pour les listes
export const NutriScoreBadge = ({ grade, size = 'sm', className = '' }) => {
    const gradeUpper = normalizeGrade(grade);
    if (!gradeUpper) return <div className="nutri-score-placeholder">-</div>;

    const color = getNutriScoreColor(gradeUpper);

    return (
        <div
            className={`nutri-score-simple ${size} ${className}`}
            style={{ backgroundColor: color }}
            title={`Nutri-Score ${gradeUpper} - ${getNutriScoreText(gradeUpper)}`}
        >
            {gradeUpper}
        </div>
    );
};

export default NutriScore;