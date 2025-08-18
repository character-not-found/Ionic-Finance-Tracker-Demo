import React, { useState, useCallback } from 'react';
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonLabel,
    IonCol,
    IonRow,
    IonGrid,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonSpinner,
    IonModal,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonAlert,
    useIonViewWillEnter
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import apiService, { IncomeData, DailyExpenseData, FixedCostData } from '../services/apiService';
import ManagementAccordionList from '../components/ManagementAccordionList';
import './ManagementPage.css';
import { useFormLogic } from '../hooks/useFormLogic';

export type ManagementRecord =
  | (IncomeData & { doc_id?: number; dataType: 'income' })
  | (DailyExpenseData & { doc_id?: number; dataType: 'daily_expense' })
  | (FixedCostData & { doc_id?: number; dataType: 'fixed' });

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

const fixedCostTypes = ["One-Off", "Annual", "Monthly", "Initial Investment"];

const paymentMethods = ["Cash", "Debit Card", "Bank Transfer"];

const ManagementPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedRecord, setEditedRecord] = useState<ManagementRecord | null>(null);
    const [data, setData] = useState<Record<'income' | 'daily_expense' | 'fixed', ManagementRecord[]>>({
        income: [],
        daily_expense: [],
        fixed: [],
    });
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ManagementRecord | null>(null);
    const [dataType, setDataType] = useState<'income' | 'daily_expense' | 'fixed'>('income');
    const [focusedFieldType, setFocusedFieldType] = useState<string | null>(null);
    const { loading, setLoading, isError, isKeyboardOpen } = useFormLogic();

    const assignIncomeType = (records: IncomeData[]): ManagementRecord[] =>
        records.map(record => ({ ...record, dataType: 'income' }));

    const assignDailyExpenseType = (records: DailyExpenseData[]): ManagementRecord[] =>
        records.map(record => ({ ...record, dataType: 'daily_expense' }));

    const assignFixedCostType = (records: FixedCostData[]): ManagementRecord[] =>
        records.map(record => ({ ...record, dataType: 'fixed' }));

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [incomeRes, dailyRes, fixedRes] = await Promise.all([
                apiService.getLatestIncomeRecords(),
                apiService.getLatestDailyExpenses(),
                apiService.getLatestFixedCosts(),
            ]);

            setData({
                income: assignIncomeType(incomeRes || []),
                daily_expense: assignDailyExpenseType(dailyRes || []),
                fixed: assignFixedCostType(fixedRes || []),
            });
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, [setData, setLoading]);

    useIonViewWillEnter(() => {
        fetchAllData();
    });

    const handleSegmentChange = (event: CustomEvent) => {
        const value = event.detail.value as 'income' | 'daily_expense' | 'fixed';
        setDataType(value);
    };

    const handleEdit = (record: ManagementRecord) => {
        setEditedRecord(record);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: CustomEvent, key: keyof ManagementRecord) => {
        const value = e.detail.value;
        setEditedRecord(prev => prev ? { ...prev, [key]: value } : null);
    };

    const handleDelete = (record: ManagementRecord) => {
        setItemToDelete(record);
        setShowDeleteAlert(true);
    };

    const handleDeleteConfirmation = async () => {
        if (itemToDelete && itemToDelete.doc_id !== undefined) {
            try {
                const success = await apiService.deleteRecord(itemToDelete);
                if (success) {
                    await fetchAllData(); 
                    console.log(`Successfully deleted ${itemToDelete.dataType} record with id: ${itemToDelete.doc_id}`);
                } else {
                    console.error('Failed to delete record.');
                }
            } catch (error) {
                console.error('Network error during record deletion:', error);
            }
        }
        setShowDeleteAlert(false);
        setItemToDelete(null);
    };

    const handleSave = async () => {
        if (!editedRecord) {
            console.error('No record to save');
            return;
        };

        setLoading(true);
        const success = await apiService.updateRecord(editedRecord);

        if (success) {
            console.log('Successfully saved edited record:', editedRecord);
            await fetchAllData(); 
            setIsModalOpen(false);
        } else {
            console.error('Failed to save record.');
        }
        setLoading(false);
        setIsModalOpen(false);
    };

    const handleFocus = (type: 'text' | 'number' | 'date') => {
        setFocusedFieldType(type);
    };

    const renderModalFields = () => {
        if (!editedRecord) return null;

        const fields = {
            income: [
                { label: 'Date', key: 'income_date', type: 'date' },
                { label: 'Tours Revenue (€)', key: 'tours_revenue_eur', type: 'number' },
                { label: 'Transfers Revenue (€)', key: 'transfers_revenue_eur', type: 'number' },
                { label: 'Hours Worked', key: 'hours_worked', type: 'number' },
            ],
            daily_expense: [
                { label: 'Date', key: 'cost_date', type: 'date' },
                { label: 'Amount (€)', key: 'amount', type: 'number' },
                { label: 'Description', key: 'description', type: 'text' },
                { label: 'Category', key: 'category' },
                { label: 'Payment Method', key: 'payment_method' },
            ],
            fixed: [
                { label: 'Date', key: 'cost_date', type: 'date' },
                { label: 'Amount (€)', key: 'amount_eur', type: 'number' },
                { label: 'Description', key: 'description', type: 'text' },
                { label: 'Category', key: 'category' },
                { label: 'Payment Method', key: 'payment_method' },
                { label: 'Cost Type', key: 'cost_frequency' },
                { label: 'Recipient', key: 'recipient', type: 'text' },
            ],
        };

        const getOptions = (key: string) => {
            if (key === 'category' && editedRecord.dataType === 'daily_expense') {
                return dailyExpenseCategories;
            } else if (key === 'category' && editedRecord.dataType === 'fixed') {
                return fixedCostCategories;
            } else if (key === 'payment_method') {
                return paymentMethods;
            } else if (key === 'cost_frequency') {
                return fixedCostTypes;
            }
            return [];
        };        

        return fields[editedRecord.dataType].map(field => (
            <IonItem key={field.key}>
                <IonLabel position="stacked">{field.label}</IonLabel>
                {field.key === 'category' || field.key === 'payment_method' || field.key === 'cost_frequency' ? (
                <IonSelect
                    value={editedRecord[field.key as keyof ManagementRecord] as string}
                    onIonChange={e => handleInputChange(e, field.key as keyof ManagementRecord)}
                    placeholder={`Select ${field.label}`}
                >
                    {getOptions(field.key).map(option => (
                        <IonSelectOption key={option} value={option}>{option}</IonSelectOption>
                    ))}
                </IonSelect>
            ) : (
                <IonInput
                    type={field.type as 'text' | 'number' | 'date'}
                    value={editedRecord[field.key as keyof ManagementRecord]}
                    onIonChange={e => handleInputChange(e, field.key as keyof ManagementRecord)}
                    onIonFocus={() => handleFocus(field.type as 'text' | 'number' | 'date')}
                />
            )}
            </IonItem>
        ));
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <div className="logo-container">
                        <img src="/assets/logos/tuk-n-roll-logo_verde-1.svg" alt="TukNRoll Logo" />
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonGrid>
                    <IonRow className="ion-justify-content-center">
                        <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                            <IonCard className="management-card align-center">
                                <IonCardHeader>
                                    <IonCardTitle>Data Management</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <IonSegment value={dataType} onIonChange={handleSegmentChange} className="form-toggle-segment" color="secondary">
                                        <IonSegmentButton value="income">
                                            <IonLabel className='segment-label'>Income</IonLabel>
                                        </IonSegmentButton>
                                        <IonSegmentButton value="daily_expense">
                                            <IonLabel className='segment-label'>Daily Expense</IonLabel>
                                        </IonSegmentButton>
                                        <IonSegmentButton value="fixed">
                                            <IonLabel className='segment-label'>Fixed Cost</IonLabel>
                                        </IonSegmentButton>
                                    </IonSegment>
                                    <IonRow className="ion-justify-content-center">
                                        <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                                            <IonCard className="align-center grid-list-card">
                                                {loading ? (
                                                    <div className="ion-text-center">
                                                        <IonSpinner name="crescent" color="primary" />
                                                        <p>Loading data...</p>
                                                    </div>
                                                ) : isError ? (
                                                    <IonText color="danger">
                                                        <p className="ion-text-center">{isError}</p>
                                                    </IonText>
                                                ) : (
                                                    <ManagementAccordionList
                                                        data={data[dataType]}
                                                        dataType={dataType}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                                                                            />
                                                )}
                                            </IonCard>
                                        </IonCol>
                                    </IonRow> 
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
            <IonModal
                isOpen={isModalOpen}
                initialBreakpoint={1}
                onDidDismiss={() => setIsModalOpen(false)}
                id='edit-modal'
                className={`management-content ${isKeyboardOpen ? 
                    (focusedFieldType === 'number' ? 'keyboard-up-numeric' : 'keyboard-up-alphanumeric') : 
                    ''}`}
            >
                <IonHeader>
                    <IonToolbar>
                        <div className="logo-container">
                            <img src="/assets/logos/tuk-n-roll-logo_verde-1.svg" alt="TukNRoll Logo" />
                        </div>
                        <IonButton slot="end" onClick={() => setIsModalOpen(false)} className='close-button'>
                            <IonIcon icon={closeOutline} />
                        </IonButton>                
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <IonGrid className='management-edit-grid'>
                        {renderModalFields()}
                        <IonRow className="ion-justify-content-end ion-padding-top">
                            <IonCol size="auto">
                                <IonButton onClick={() => setIsModalOpen(false)} color="medium">Cancel</IonButton>
                            </IonCol>
                            <IonCol size="auto">
                                <IonButton onClick={handleSave}>Save</IonButton>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonContent>
            </IonModal>
            <IonAlert
                isOpen={showDeleteAlert}
                onDidDismiss={() => setShowDeleteAlert(false)}
                message={'Are you sure you want to delete this record?\n\nThis action cannot be undone.'}
                cssClass='alert-message-pre-line'
                buttons={[
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            setShowDeleteAlert(false);
                            setItemToDelete(null);
                        },
                    },
                    {
                        text: 'Delete',
                        cssClass: 'danger',
                        handler: () => {
                            handleDeleteConfirmation();
                        },
                    },
                ]}
            />       
        </IonPage>
    );
};

export default ManagementPage;