import React, { ReactNode } from 'react';
import { IonCard, IonSpinner, IonText } from '@ionic/react';

interface StateWrapperProps {
    loading: boolean;
    error?: string;
    hasData: boolean;
    children: ReactNode;
}

const StateWrapper: React.FC<StateWrapperProps> = ({ loading, error, hasData, children }) => {
    if (loading) {
        return (
            <IonCard className="h-full flex flex-col justify-center items-center ion-padding">
                <IonSpinner name="crescent" color="light" />
                <IonText>
                    <p className="ion-margin-top">Loading...</p>
                </IonText>
            </IonCard>
        );
    }

    if (error) {
        return (
            <IonCard className="h-full flex flex-col justify-center items-center ion-padding">
                <IonText color="danger">
                    <p>Error loading data: {error}</p>
                </IonText>
            </IonCard>
        );
    }

    if (!hasData) {
        return (
            <IonCard className="dashboard-summary-card no-data">
                <IonText>
                    <h4>No data available.</h4>
                </IonText>
            </IonCard>
        );
    }

    return <>{children}</>;
};

export default StateWrapper;