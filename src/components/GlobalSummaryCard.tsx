// src/components/GlobalSummaryCard.tsx
import React, { useEffect, useRef } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { GlobalSummary } from '../services/apiService';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import StateWrapper from './StateWrapper';

interface GlobalSummaryCardProps {
    loading: boolean;
    error: string;
    globalSummaryData: GlobalSummary | null;
    getProfitLossColor: (value: number) => string;
}

const GlobalSummaryCard: React.FC<GlobalSummaryCardProps> = ({
    loading,
    error,
    globalSummaryData,
    getProfitLossColor,
}) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        Chart.register(ChartDataLabels);

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        if (globalSummaryData && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Total Income', 'Total Expenses'],
                        datasets: [
                            {
                                label: 'Amount (€)',
                                data: [globalSummaryData.total_global_income, globalSummaryData.total_global_expenses],
                                backgroundColor: [
                                    globalSummaryData.incomeColors[4],
                                    globalSummaryData.expenseColors[4],
                                ],
                                borderWidth: 0,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                                        }
                                        return label;
                                    }
                                }
                            },
                            datalabels: {
                                color: '#000',
                                formatter: (value) => {
                                    return `${value.toFixed(2)} €`;
                                },
                                anchor: 'center',
                                align: 'center',
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: '#c6d8e8',
                                    callback: function(value: string | number) {
                                        return value + ' €';
                                    }
                                }
                            },
                            x: {
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: '#c6d8e8',
                                }
                            },
                        },
                    },
                });
            }
        }
    }, [globalSummaryData]);

    // Use the new StateWrapper to handle the different data states.
    return (
        <StateWrapper loading={loading} error={error} hasData={!!globalSummaryData}>
            <IonCard className='dashboard-summary-card'>
                <IonCardHeader>
                    <IonCardTitle className="text-2xl font-bold tracking-tight">Global Summary</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <div className="h-48 my-4 global-summary-chart">
                        <canvas ref={chartRef}></canvas>
                    </div>
                    <div className="summary-item">
                        <h4>Global Net Profit/Loss</h4>
                        <p className={`summary-value profit-loss-display ${getProfitLossColor(globalSummaryData?.net_global_profit || 0)}`}>
                            {(globalSummaryData?.net_global_profit || 0).toFixed(2)} €
                        </p>
                    </div>
                </IonCardContent>
            </IonCard>
        </StateWrapper>
    );
};

export default GlobalSummaryCard;