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
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonHeader,
    IonToolbar
} from '@ionic/react';
import './ExpensesPage.css';
import apiService, { DailyExpenseData, FixedCostData } from '../services/apiService';
import { useFormLogic } from '../hooks/useFormLogic';

const ExpensesPage: React.FC = () => {
    const [expenseType, setExpenseType] = useState<'daily' | 'fixed'>('daily');

    const [dailyExpenseDate, setDailyExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [dailyExpenseAmount, setDailyExpenseAmount] = useState<number>(0);
    const [dailyExpenseDescription, setDailyExpenseDescription] = useState<string>('');
    const [dailyExpenseCategory, setDailyExpenseCategory] = useState<string>('');
    const [dailyExpensePaymentMethod, setDailyExpensePaymentMethod] = useState<string>('');

    const [fixedCostDate, setFixedCostDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [fixedCostAmount, setFixedCostAmount] = useState<number>(0);
    const [fixedCostDescription, setFixedCostDescription] = useState<string>('');
    const [fixedCostType, setFixedCostType] = useState<string>('');
    const [fixedCostCategory, setFixedCostCategory] = useState<string>('');
    const [fixedCostRecipient, setFixedCostRecipient] = useState<string>('');
    const [fixedCostPaymentMethod, setFixedCostPaymentMethod] = useState<string>('');

    const dailyExpenseCategories = [
        "Garage", "Tuk Maintenance", "Diesel", "Food", "Electricity", "Others",
        "Insurance", "Licenses", "Vehicle Purchase", "Marketing", "Non-Business Related",
        "Membership Fees", "Bank Deposit"
    ];

    const fixedCostCategories = [
        "Garage", "Tuk Maintenance", "Diesel", "Food", "Electricity", "Others",
        "Insurance", "Licenses", "Vehicle Purchase", "Marketing", "Non-Business Related",
        "Membership Fees", "Bank Deposit"
    ];

    const fixedCostTypes = [
        "One-Off", "Annual", "Monthly", "Initial Investment"
    ];

    const paymentMethods = ["Cash", "Debit Card", "Bank Transfer"];

    const [focusedFieldType, setFocusedFieldType] = useState<string | null>(null);

    const { loading, setLoading, showToast, setShowToast, toastMessage, isError, showMessage, isKeyboardOpen } = useFormLogic();

    /**
     * Handles the submission of the daily expense form.
     * @param e The form event.
     */
    const handleDailyExpenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;

        const dailyExpenseData: DailyExpenseData = {
            cost_date: (form.elements.namedItem('dailyExpenseDate') as HTMLInputElement).value,
            amount: parseFloat((form.elements.namedItem('dailyExpenseAmount') as HTMLInputElement).value),
            description: (form.elements.namedItem('dailyExpenseDescription') as HTMLInputElement).value,
            category: (form.elements.namedItem('dailyExpenseCategory') as HTMLSelectElement).value,
            payment_method: (form.elements.namedItem('dailyExpensePaymentMethod') as HTMLSelectElement).value
        };

        setLoading(true);

        try {
            const success = await apiService.registerDailyExpense(dailyExpenseData);

            setLoading(false);

            if (success) {
                showMessage('Daily expense registered successfully!');
                setDailyExpenseAmount(0);
                setDailyExpenseDescription('');
                setDailyExpenseCategory('');
                setDailyExpensePaymentMethod('');
            } else {
                showMessage('Failed to register daily expense. Please try again.', true);
            }
         } catch (error) {
            console.error('Error registering daily expense:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFixedCostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;

        setLoading(true);

        const fixedCostData: FixedCostData = {
            cost_date: (form.elements.namedItem('fixedCostDate') as HTMLInputElement).value,
            amount_eur: parseFloat((form.elements.namedItem('fixedCostAmount') as HTMLInputElement).value),
            description: (form.elements.namedItem('fixedCostDescription') as HTMLInputElement).value,
            cost_frequency: (form.elements.namedItem('fixedCostType') as HTMLSelectElement).value,
            category: (form.elements.namedItem('fixedCostCategory') as HTMLSelectElement).value,
            recipient: (form.elements.namedItem('fixedCostRecipient') as HTMLInputElement).value,
            payment_method: (form.elements.namedItem('fixedCostPaymentMethod') as HTMLSelectElement).value
        };

        try {
            const success = await apiService.registerFixedCost(fixedCostData);

            setLoading(false);

            if (success) {
                setFixedCostAmount(0);
                setFixedCostDescription('');
                setFixedCostType('');
                setFixedCostCategory('');
                setFixedCostRecipient('');
                setFixedCostPaymentMethod('');
            } else {
                showMessage('Failed to register fixed cost. Please try again.', true);
            }
       } catch (error) {
            console.error('Error registering fixed cost:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFocus = (type: string) => {
        setFocusedFieldType(type);
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
            <IonContent fullscreen className={`expenses-content ${isKeyboardOpen ? (
                focusedFieldType === 'number' ? 
                    'keyboard-up-numeric' : 
                    (expenseType === 'daily' ? 'keyboard-up-daily' : 'keyboard-up-fixed')
                ) : ''}`}
            >
                <IonGrid>
                    <IonRow className="ion-justify-content-center">
                        <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                            <IonCard className="expenses-card align-center">
                                <IonCardHeader>
                                    <IonCardTitle>Register New Expense</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <IonSegment
                                        value={expenseType}
                                        onIonChange={(e) => setExpenseType(e.detail.value as 'daily' | 'fixed')}
                                        className="form-toggle-segment"
                                        color="secondary"
                                    >
                                        <IonSegmentButton value="daily">
                                            <IonLabel className='segment-label'>Daily Expense</IonLabel>
                                        </IonSegmentButton>
                                        <IonSegmentButton value="fixed">
                                            <IonLabel className='segment-label'>Fixed Cost</IonLabel>
                                        </IonSegmentButton>
                                    </IonSegment>

                                    {expenseType === 'daily' ? (
                                        <form onSubmit={handleDailyExpenseSubmit}>
                                            <IonList>
                                                <IonItem>
                                                    <IonLabel position="stacked">Date</IonLabel>
                                                    <IonInput
                                                        name="dailyExpenseDate"
                                                        type="date"
                                                        value={dailyExpenseDate}
                                                        onIonChange={e => setDailyExpenseDate(e.detail.value!)}
                                                        required
                                                    />
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Amount (€)</IonLabel>
                                                    <IonInput
                                                        name="dailyExpenseAmount"
                                                        type="number"
                                                        value={dailyExpenseAmount}
                                                        onIonChange={e => setDailyExpenseAmount(parseFloat(e.detail.value!))}
                                                        onIonFocus={() => handleFocus('number')}
                                                        step="1"
                                                        min="0"
                                                        required
                                                    />
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Description</IonLabel>
                                                    <IonInput
                                                        name="dailyExpenseDescription"
                                                        type="text"
                                                        value={dailyExpenseDescription}
                                                        onIonChange={e => setDailyExpenseDescription(e.detail.value!)}
                                                        onIonFocus={() => handleFocus('text')}
                                                        required
                                                    />
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Category</IonLabel>
                                                    <IonSelect
                                                        name="dailyExpenseCategory"
                                                        value={dailyExpenseCategory}
                                                        placeholder="Select Category"
                                                        onIonChange={e => setDailyExpenseCategory(e.detail.value)}
                                                        required
                                                    >
                                                        {dailyExpenseCategories.map((category) => (
                                                            <IonSelectOption key={category} value={category}>{category}</IonSelectOption>
                                                        ))}                                                      
                                                    </IonSelect>
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Payment Method</IonLabel>
                                                    <IonSelect
                                                        name="dailyExpensePaymentMethod"
                                                        value={dailyExpensePaymentMethod}
                                                        placeholder="Select Payment Method"
                                                        onIonChange={e => setDailyExpensePaymentMethod(e.detail.value)}
                                                        required
                                                    >
                                                        {paymentMethods.map((method) => (
                                                            <IonSelectOption key={method} value={method}>{method}</IonSelectOption>
                                                        ))}
                                                    </IonSelect>
                                                </IonItem>
                                            </IonList>
                                            <IonButton expand="block" type="submit" className="ion-margin-top" disabled={loading} shape='round'>
                                                {loading ? 'Registering...' : 'Register Daily Expense'}
                                            </IonButton>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleFixedCostSubmit}>
                                            <IonList>
                                                <IonItem>
                                                    <IonLabel position="stacked">Date</IonLabel>
                                                    <IonInput
                                                        name="fixedCostDate"
                                                        type="date"
                                                        value={fixedCostDate}
                                                        onIonChange={e => setFixedCostDate(e.detail.value!)}
                                                        required
                                                    />
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Amount (€)</IonLabel>
                                                    <IonInput
                                                        name="fixedCostAmount"
                                                        type="number"
                                                        value={fixedCostAmount}
                                                        onIonChange={e => setFixedCostAmount(parseFloat(e.detail.value!))}
                                                        onIonFocus={() => handleFocus('number')}
                                                        step="1"
                                                        min="0"
                                                        required
                                                    />
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Description</IonLabel>
                                                    <IonInput
                                                        name="fixedCostDescription"
                                                        type="text"
                                                        value={fixedCostDescription}
                                                        onIonChange={e => setFixedCostDescription(e.detail.value!)}
                                                        onIonFocus={() => handleFocus('text')}
                                                        required
                                                    />
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Cost Type</IonLabel>
                                                    <IonSelect
                                                        name="fixedCostType"
                                                        value={fixedCostType}
                                                        placeholder="Select Type"
                                                        onIonChange={e => setFixedCostType(e.detail.value)}
                                                        required
                                                    >
                                                        {fixedCostTypes.map((category) => (
                                                            <IonSelectOption key={category} value={category}>{category}</IonSelectOption>
                                                        ))} 
                                                    </IonSelect>
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Category</IonLabel>
                                                    <IonSelect
                                                        name="fixedCostCategory"
                                                        value={fixedCostCategory}
                                                        placeholder="Select Category"
                                                        onIonChange={e => setFixedCostCategory(e.detail.value)}
                                                        required
                                                    >
                                                        {fixedCostCategories.map((category) => (
                                                            <IonSelectOption key={category} value={category}>{category}</IonSelectOption>
                                                        ))} 
                                                    </IonSelect>
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Recipient</IonLabel>
                                                    <IonInput
                                                        name="fixedCostRecipient"
                                                        type="text"
                                                        value={fixedCostRecipient}
                                                        onIonChange={e => setFixedCostRecipient(e.detail.value!)}
                                                        onIonFocus={() => handleFocus('text')}
                                                    />
                                                </IonItem>
                                                <IonItem>
                                                    <IonLabel position="stacked">Payment Method</IonLabel>
                                                    <IonSelect
                                                        name="fixedCostPaymentMethod"
                                                        value={fixedCostPaymentMethod}
                                                        placeholder="Select Payment Method"
                                                        onIonChange={e => setFixedCostPaymentMethod(e.detail.value)}
                                                        required
                                                    >
                                                        {paymentMethods.map((category) => (
                                                            <IonSelectOption key={category} value={category}>{category}</IonSelectOption>
                                                        ))} 
                                                    </IonSelect>
                                                </IonItem>
                                            </IonList>
                                            <IonButton expand="block" type="submit" className="ion-margin-top" disabled={loading} shape='round'>
                                                {loading ? 'Registering...' : 'Register Fixed Cost'}
                                            </IonButton>
                                        </form>
                                    )}
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

export default ExpensesPage;
