import React from 'react';
import './VerticalBarChart.css';

export const VerticalBarChart = ({ data = {}, title, icon: Icon }) => {
    const items = Object.entries(data).slice(0, 5);
    const maxValue = Math.max(...Object.values(data));

    console.log('VerticalBarChart - Données reçues:', { data, items, maxValue, title });

    return (
        <div className="vertical-chart-container">
            <div className="vertical-chart-header">
                <h3 className="vertical-chart-title">
                    {Icon && <Icon size={20} />}
                    {title}
                </h3>
            </div>

            <div className="bars-container">
                {items.map(([item, count], index) => {
                    const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;
                    const height = Math.max(percentage, 10); // Hauteur minimum pour visibilité

                    const colors = [
                        'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                        'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)',
                        'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)',
                        'linear-gradient(180deg, #43e97b 0%, #38f9d7 100%)',
                        'linear-gradient(180deg, #fa709a 0%, #fee140 100%)'
                    ];

                    return (
                        <div key={item} className="bar-column">
                            <div className="bar-wrapper-new">
                                <div
                                    className="bar-fill-new"
                                    style={{
                                        height: `${height}%`,
                                        background: colors[index] || colors[0],
                                        animationDelay: `${index * 0.3}s`
                                    }}
                                />
                                <div className="bar-value-new">{count}</div>
                            </div>
                            <div className="bar-label-new">
                                <span title={item}>
                                    {item.length > 8 ? `${item.substring(0, 8)}...` : item}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VerticalBarChart;