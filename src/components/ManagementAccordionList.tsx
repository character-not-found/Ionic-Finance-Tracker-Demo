import React, { useState } from 'react';
import {
    IonList,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
} from '@ionic/react';
import {
    chevronForwardOutline,
    chevronDownOutline,
    pencilOutline,
    trashOutline,
} from 'ionicons/icons';
import { IncomeData, DailyExpenseData, FixedCostData } from '../services/apiService';
import { ManagementRecord } from '../pages/ManagementPage';

interface ManagementAccordionListProps {
    data: ManagementRecord[];
    dataType: 'income' | 'daily_expense' | 'fixed';
    onEdit: (record: ManagementRecord) => void;
    onDelete: (record: ManagementRecord) => void;
}

const ManagementAccordionList: React.FC<ManagementAccordionListProps> = ({ data, dataType, onEdit, onDelete }) => {
    const [expandedItem, setExpandedItem] = useState<number | null>(null);

    const headers = {
        income: ['Date', 'Amount (€)', 'Type'],
        daily_expense: ['Date', 'Amount (€)', 'Description'],
        fixed: ['Date', 'Amount (€)', 'Description'],
    };

    const getIncomeType = (record: IncomeData) => {
        const hasTours = typeof record.tours_revenue_eur === 'number' && record.tours_revenue_eur > 0;
        const hasTransfers = typeof record.transfers_revenue_eur === 'number' && record.transfers_revenue_eur > 0;
        if (hasTours && hasTransfers) return 'Both';
        if (hasTours) return 'Tours';
        if (hasTransfers) return 'Transfers';
        return 'Income';
    };

    const renderMainColumns = (record: ManagementRecord) => {
        switch (dataType) {
            case 'income': {
                const incomeRecord = record as IncomeData;
                const totalAmount = (incomeRecord.tours_revenue_eur || 0) + (incomeRecord.transfers_revenue_eur || 0);
                return (
                    <>
                        <IonCol size="4"><p className="ion-text-center">{incomeRecord.income_date}</p></IonCol>
                        <IonCol size="4"><p className="ion-text-center">{totalAmount.toFixed(0)} €</p></IonCol>
                        <IonCol size="4"><p className="ion-text-center">{getIncomeType(incomeRecord)}</p></IonCol>
                    </>
                );
            }
            case 'daily_expense': {
                const dailyExpenseRecord = record as DailyExpenseData;
                return (
                    <>
                        <IonCol size="4"><p className="ion-text-center">{dailyExpenseRecord.cost_date}</p></IonCol>
                        <IonCol size="4"><p className="ion-text-center">{dailyExpenseRecord.amount} €</p></IonCol>
                        <IonCol size="4"><p className="ion-text-center">{dailyExpenseRecord.description}</p></IonCol>
                    </>
                );
            }
            case 'fixed': {
                const fixedCostRecord = record as FixedCostData;
                return (
                    <>
                        <IonCol size="4"><p className="ion-text-center">{fixedCostRecord.cost_date}</p></IonCol>
                        <IonCol size="4"><p className="ion-text-center">{fixedCostRecord.amount_eur} €</p></IonCol>
                        <IonCol size="4"><p className="ion-text-center">{fixedCostRecord.description}</p></IonCol>
                    </>
                );
            }
            default:
                return null;
        }
    };

    const toggleItem = (doc_id: number) => {
        setExpandedItem(expandedItem === doc_id ? null : doc_id);
    };

    const handleEditClick = (e: React.MouseEvent, record: ManagementRecord) => {
        e.stopPropagation();
        onEdit(record);
    };

    const handleDeleteClick = (record: ManagementRecord) => {
        onDelete(record);
    };

    return (
        <IonList className="management-accordion-list">
            <IonGrid className="management-list-header">
                <IonRow className="ion-text-center">
                    {headers[dataType].map((header, index) => (
                        <IonCol key={index} className="ion-text-bold">
                            {header}
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>
            {data.map(record => (
                <div key={record.doc_id}>
                    <IonItem onClick={() => { 
                            if (record.doc_id !== undefined) {
                                toggleItem(record.doc_id)
                            }
                        }} 
                        detail={false}
                        lines="none"
                    >
                        <IonGrid className="management-list">
                            <IonRow className="ion-align-items-center">
                                {renderMainColumns(record)}
                                <IonIcon
                                    slot="end"
                                    icon={expandedItem === record.doc_id ? chevronDownOutline : chevronForwardOutline}
                                />
                            </IonRow>
                            <div
                                className={`expanded-content${expandedItem === record.doc_id ? ' expanded' : ''}`}
                                aria-hidden={expandedItem !== record.doc_id}
                                style={{ pointerEvents: expandedItem === record.doc_id ? 'auto' : 'none' }}
                            >
                                <IonGrid className="management-list-item-grid">
                                    <IonRow className="ion-justify-content-between ion-padding-horizontal">
                                        <IonCol size="auto">
                                            <IonButton onClick={(e) => handleEditClick(e, record)} fill="solid" color="secondary" size="small">
                                                <IonIcon slot="start" icon={pencilOutline} />
                                                Edit
                                            </IonButton>
                                        </IonCol>
                                        <IonCol size="auto">
                                            <IonButton onClick={() => handleDeleteClick(record)} fill="solid" color="danger" size="small">
                                                <IonIcon slot="start" icon={trashOutline} />
                                                Delete
                                            </IonButton>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            </div>
                        </IonGrid>
                    </IonItem>
                </div>
            ))}
        </IonList>
    );
};

export default ManagementAccordionList;