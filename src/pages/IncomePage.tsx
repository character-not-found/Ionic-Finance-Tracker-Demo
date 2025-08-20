import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonInput,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonToast,
    IonHeader,
    IonToolbar
} from '@ionic/react';
import './IncomePage.css';
import apiService, { IncomeData } from '../services/apiService';
import { useFormLogic } from '../hooks/useFormLogic';

const IncomePage: React.FC = () => {
    const [incomeDate, setIncomeDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [toursRevenue, setToursRevenue] = useState<number>(0);
    const [transfersRevenue, setTransfersRevenue] = useState<number>(0);
    const [hoursWorked, setHoursWorked] = useState<number>(0);

    const { loading, setLoading, showToast, setShowToast, toastMessage, isError, showMessage, isKeyboardOpen } = useFormLogic();

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;

        const incomeData: IncomeData = {
            income_date: incomeDate,
            tours_revenue_eur: parseFloat((form.elements.namedItem('toursRevenue') as HTMLInputElement).value) || 0,
            transfers_revenue_eur: parseFloat((form.elements.namedItem('transfersRevenue') as HTMLInputElement).value) || 0,
            hours_worked: parseFloat((form.elements.namedItem('hoursWorked') as HTMLInputElement).value) || 0
        };

        if (hoursWorked === 0) {
            setTimeout(() => {
                showMessage('You must enter a value for Hours Worked.', true);
            }, 300)
            return;
        }

        setLoading(true)

        try {
            const success = await apiService.registerIncome(incomeData);

            setLoading(false);

            if (success) {
                showMessage('Income registered successfully!');
                setIncomeDate(new Date().toISOString().split('T')[0]);
                setToursRevenue(0);
                setTransfersRevenue(0);
                setHoursWorked(0);
            } else {
                showMessage('Failed to register income. Please try again.', true);
            }
        } catch (error) {
            console.error('Error registering income:', error);
        } finally {
            setLoading(false);
        }
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
            <IonContent fullscreen className={`income-content ${isKeyboardOpen ? 'keyboard-up' : ''}`}>
                <IonGrid className='income-grid'>
                    <IonRow className="ion-justify-content-center">
                        <IonCol size="12" size-md="8" size-lg="6" sizeXl="4">
                            <IonCard className="income-card align-center">
                                <IonCardHeader className='ion-text-center'>
                                    <IonCardTitle>Register New Income</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={handleFormSubmit}>
                                        <IonList>
                                            <IonItem>
                                                <IonLabel position="stacked">Date</IonLabel>
                                                <IonInput
                                                    type="date"
                                                    value={incomeDate}
                                                    onIonChange={e => setIncomeDate(e.detail.value!)}
                                                    required
                                                />
                                            </IonItem>
                                            <IonItem>
                                                <IonLabel position="stacked">Tours Revenue (€)</IonLabel>
                                                <IonInput
                                                    name="toursRevenue"
                                                    type="number"
                                                    value={toursRevenue}
                                                    onIonChange={e => setToursRevenue(e.detail.value === '' ? 0 : parseFloat(e.detail.value!))}
                                                    step="1"
                                                    min="0"
                                                />
                                            </IonItem>
                                            <IonItem>
                                                <IonLabel position="stacked">Transfers Revenue (€)</IonLabel>
                                                <IonInput
                                                    name="transfersRevenue"
                                                    type="number"
                                                    value={transfersRevenue}
                                                    onIonChange={e => setTransfersRevenue(e.detail.value === '' ? 0 : parseFloat(e.detail.value!))}
                                                    step="1"
                                                    min="0"
                                                />
                                            </IonItem>
                                            <IonItem>
                                                <IonLabel position="stacked">Hours Worked</IonLabel>
                                                <IonInput
                                                    name="hoursWorked"
                                                    type="number"
                                                    value={hoursWorked}
                                                    onIonChange={e => setHoursWorked(e.detail.value === '' ? 0 : parseFloat(e.detail.value!))}
                                                    step="1"
                                                    min="0"
                                                />
                                            </IonItem>
                                        </IonList>
                                        <IonButton expand="block" type="submit" className="ion-margin-top" shape='round' disabled={loading}>
                                            {loading ? 'Registering...' : 'Register Income'}
                                        </IonButton>
                                    </form>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={5000}
                    color={isError ? 'danger' : 'success'}
                    positionAnchor='navbar'
                    cssClass={"toast-above-tabs"}
                />
            </IonContent>
        </IonPage>
    );
};

export default IncomePage;