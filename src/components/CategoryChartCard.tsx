import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
} from '@ionic/react';
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartData } from '../services/dashboardService';
import StateWrapper from './StateWrapper';

Chart.register(...registerables, ChartDataLabels);

interface CategoryChartCardProps {
    title: string;
    chartData: ChartData;
    totalAmount: number;
    loading: boolean;
    error: string;
}

const CategoryChartCard: React.FC<CategoryChartCardProps> = ({ title, chartData, totalAmount, loading, error }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current && chartData.labels.length > 0) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            chartInstance.current = new Chart(chartRef.current, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        // We will disable the legend here and handle it with a custom component if needed
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const dataArr = context.chart.data.datasets[0].data as number[];
                                    const sum = dataArr.reduce((acc, curr) => acc + curr, 0);
                                    const percentage = (Number(value) * 100 / sum).toFixed(2) + "%";
                                    return `${label}: ${value}€ (${percentage})`;
                                }
                            }
                        },
                        // The datalabels plugin will display the percentage on the chart
                        datalabels: {
                            color: '#fff',
                            formatter: (value, ctx) => {
                                const dataArr = ctx.chart.data.datasets[0].data as number[];
                                const sum = dataArr.reduce((acc, curr) => acc + curr, 0);
                                const percentage = (Number(value) * 100 / sum).toFixed(2) + "%";
                                return percentage;
                            },
                        },
                    },
                    elements: {
                        arc: {
                            borderWidth: 1,
                        }
                    }
                },
            });
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);

    const hasData = chartData && chartData.labels.length > 0;

    return (
        <StateWrapper loading={loading} error={error} hasData={hasData}>
            <IonCard className="dashboard-summary-card">
                <IonCardHeader>
                    <IonCardTitle>{title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <div className="chart-container">
                        <canvas ref={chartRef}></canvas>
                    </div>
                        <div className="legend-container">
                            {chartData.labels.map((label, index) => (
                                <div key={index} className="legend-item">
                                    <span 
                                        className="legend-color-box" 
                                        style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] as string }}
                                    ></span>
                                    <span className="legend-label">{label}</span>
                                </div>
                            ))}
                        </div>
                    <div className="total-summary-card-bottom">
                        Total: {totalAmount.toFixed(2)} €
                    </div>
                </IonCardContent>
            </IonCard>
        </StateWrapper>
    );
};

export default CategoryChartCard;