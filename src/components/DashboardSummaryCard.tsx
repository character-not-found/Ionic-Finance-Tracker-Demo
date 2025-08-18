// src/components/DashboardSummaryCard.tsx
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
} from '@ionic/react';
import React from 'react';
import { DashboardSummary } from '../services/apiService';
import StateWrapper from './StateWrapper';

// Defining the props for the component
interface DashboardSummaryCardProps {
    loading: boolean;
    error: string;
    dashboardData: DashboardSummary;
    getProfitLossColor: (value: number) => string;
    title: string;
    onTitleClick: (e: React.MouseEvent) => void;
}

const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({ dashboardData, loading, error, getProfitLossColor, title, onTitleClick }) => {
    const hasData = dashboardData && (dashboardData.netProfitLoss !== undefined);
    return (
        <StateWrapper loading={loading} error={error} hasData={hasData}>
            <IonCard className='dashboard-summary-card'>
                <IonCardHeader onClick={onTitleClick} style={{ cursor: "pointer"}}>
                    <IonCardTitle>{title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <div className="summary-item">
                        <h4>Net Profit/Loss</h4>
                        <p className={`summary-value profit-loss-display ${getProfitLossColor(dashboardData.netProfitLoss)}`}>
                            {dashboardData.netProfitLoss.toFixed(2)} €
                        </p>
                    </div>
                    <div className="summary-item">
                        <h4>Monthly Daily Income Average</h4>
                        <p className={`summary-value monthly-average-display ${getProfitLossColor(dashboardData.monthlyDailyIncomeAvg)}`}>
                            {dashboardData.monthlyDailyIncomeAvg.toFixed(2)} €
                        </p>
                    </div>
                    <div className="summary-item">
                        <h4>Cash on Hand</h4>
                        <p className={`summary-value cash-on-hand-display ${getProfitLossColor(dashboardData.cashOnHand)}`}>
                            {dashboardData.cashOnHand.toFixed(2)} €
                        </p>
                    </div>
                </IonCardContent>
            </IonCard>
        </StateWrapper>
    );
};

export default DashboardSummaryCard;