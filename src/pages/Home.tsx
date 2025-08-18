// src/pages/HomePage.tsx
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    useIonViewWillEnter,
    IonHeader,
    IonToolbar,
    IonPopover,
    IonList,
    IonItem,
    IonLabel
} from '@ionic/react';
import React, { useState, useRef } from 'react';
import { DashboardSummary, GlobalSummary } from '../services/apiService';
import './Home.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/scrollbar';
import '@ionic/react/css/ionic-swiper.css';
import { format } from 'date-fns';

import DashboardSummaryCard from '../components/DashboardSummaryCard';
import CategoryChartCard from '../components/CategoryChartCard';
import GlobalSummaryCard from '../components/GlobalSummaryCard';
import { fetchDashboardSummaryData, fetchIncomeCategoryChartData, fetchExpenseCategoryChartData, ChartData, fetchGlobalSummaryData } from '../services/dashboardService';

const HomePage: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardSummary>({
        netProfitLoss: 0,
        monthlyDailyIncomeAvg: 0,
        cashOnHand: 0,
        totalMonthlyExpenses: 0,
        totalMonthlyIncome: 0
    });

    const [incomeCategoryData, setIncomeCategoryData] = useState<ChartData>({ labels: [], datasets: []});
    const [expenseCategoryData, setExpenseCategoryData] = useState<ChartData>({ labels: [], datasets: []});
    const [globalSummaryData, setGlobalSummaryData] = useState<GlobalSummary | null>(null);

    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    const [showMonthPopover, setShowMonthPopover] = useState(false);
    const [popoverEvent, setPopoverEvent] = useState<React.MouseEvent | undefined>(undefined);
    const [monthList, setMonthList] = useState<Date[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const spinnerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchDataForMonth = async (year: number, month: number) => {
        setLoading(true);
        setError('');
        try {
            const [summaryData, incomeChartData, expenseChartData] = await Promise.all([
                fetchDashboardSummaryData(year, month),
                fetchIncomeCategoryChartData(year, month),
                fetchExpenseCategoryChartData(year, month)
            ]);
            setDashboardData(summaryData);
            setIncomeCategoryData(incomeChartData);
            setExpenseCategoryData(expenseChartData);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            if (spinnerTimeoutRef.current) {
                clearTimeout(spinnerTimeoutRef.current);
            }
            setLoading(false);
        }
    };

    const fetchGlobalData = async () => {
            setLoading(true);
        setError('');
        try {
            const globalSummary = await fetchGlobalSummaryData();
            setGlobalSummaryData(globalSummary);
        } catch (err) {
            console.error('Failed to fetch global summary data:', err);
            setError('Failed to load global summary data.');
        } finally {
            if (spinnerTimeoutRef.current) {
                clearTimeout(spinnerTimeoutRef.current);
            }
            setLoading(false);
        }
    }

    const getLastSixMonths = () => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 6; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(date);
        }
        return months.reverse();
    };

    const handleTitleClick = (e: React.MouseEvent) => {
        setPopoverEvent(e);
        setShowMonthPopover(true);
    };

    const handleMonthSelect = (month: Date) => {
        setSelectedMonth(month);
        setShowMonthPopover(false);
        fetchDataForMonth(month.getFullYear(), month.getMonth() + 1);
        fetchGlobalData();
    };
    
    // Use the Ionic lifecycle hook to fetch data every time the page is entered
    useIonViewWillEnter(() => {
        setMonthList(getLastSixMonths());
        const today = new Date();
        fetchDataForMonth(today.getFullYear(), today.getMonth() + 1);
        fetchGlobalData();
    });

    const getProfitLossColor = (value: number) => {
        return value >= 0 ? 'positive-amount' : 'negative-amount';
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <div className="logo-container">
                        <img src="/assets/logos/demo_logo.svg" alt="Demo Logo" />
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonGrid className='home-grid'>
                    <IonRow className='ion-justify-content-center'>
                        <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4" className='swiper-container'>
                            <Swiper modules={[Scrollbar]} scrollbar={{ draggable: true }} initialSlide={1}>
                                <SwiperSlide>
                                    <GlobalSummaryCard
                                        loading={loading}
                                        error={error}
                                        globalSummaryData={globalSummaryData}
                                        getProfitLossColor={getProfitLossColor}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <DashboardSummaryCard
                                        loading={loading}
                                        error={error}
                                        dashboardData={dashboardData}
                                        getProfitLossColor={getProfitLossColor}
                                        title={`${format(selectedMonth, 'MMMM')} Overview`}
                                        onTitleClick={handleTitleClick}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <CategoryChartCard
                                        loading={loading}
                                        error={error}
                                        title={`${format(selectedMonth, 'MMMM')} Income`}
                                        chartData={incomeCategoryData}
                                        totalAmount={dashboardData.totalMonthlyIncome}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <CategoryChartCard
                                        loading={loading}
                                        error={error}
                                        title={`${format(selectedMonth, 'MMMM')} Expenses`}
                                        chartData={expenseCategoryData}
                                        totalAmount={dashboardData.totalMonthlyExpenses}
                                    />
                                </SwiperSlide>
                            </Swiper>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <IonPopover
                    isOpen={showMonthPopover}
                    onDidDismiss={() => setShowMonthPopover(false)}
                    event={popoverEvent}
                    className='months-popover'

                >
                    <IonList inset={true} lines='full' className='months-list'>
                        {monthList.map((month) => (
                            <IonItem
                                key={month.toISOString()}
                                button
                                onClick={() => handleMonthSelect(month)}
                            >
                                <IonLabel>{format(month, 'MMMM')}</IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                </IonPopover>
            </IonContent>
        </IonPage>
    )
};

export default HomePage;
