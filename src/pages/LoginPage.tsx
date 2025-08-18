import React, { useState, useEffect } from 'react';
import {    IonPage,
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
    IonAlert,
    IonHeader,
    IonToolbar,
} from '@ionic/react';
import { Keyboard } from '@capacitor/keyboard';
import { type PluginListenerHandle } from '@capacitor/core';
import './LoginPage.css';
import apiService from '../services/apiService';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);


    useEffect(() => {
        let showKeyboardListener: PluginListenerHandle;
        let hideKeyboardListener: PluginListenerHandle;

        const setupListeners = async () => {
            showKeyboardListener = await Keyboard.addListener('keyboardWillShow', () => {
                setIsKeyboardOpen(true);
            });

            hideKeyboardListener = await Keyboard.addListener('keyboardWillHide', () => {
                setIsKeyboardOpen(false);
            });
        };

        setupListeners();

        // Cleanup the event listeners on component unmount
        return () => {
            if (showKeyboardListener) {
                showKeyboardListener.remove();
            }
            if (hideKeyboardListener) {
                hideKeyboardListener.remove();
            }
        };
    }, []);
    
    const handleLogin = async () => {
        console.log('Login attempt started.');

        if (!username || !password) {
            console.log('Login attempt failed: Missing username or password.');
            setShowAlert(true);
            return;
        }

        const userCredentials = { username, password };

        // Attempt to login via the remote API
        const loggedIn = await apiService.loginUser(userCredentials);

        if (loggedIn) {
            onLoginSuccess(username);
        } else {
            setShowAlert(true);
        }
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
                <IonGrid className={`absolute-center-content ${isKeyboardOpen ? 'keyboard-up' : ''}`}>
                    <IonRow className="ion-justify-content-center">
                        <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                            <IonCard className="login-card align-center" color="tertiary">
                                <IonCardHeader className="ion-text-center">
                                    <IonCardTitle>Login</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <IonInput
                                        label="Username"
                                        labelPlacement="stacked"
                                        type="text"
                                        placeholder="Enter your username"
                                        fill="outline"
                                        value={username}
                                        onIonChange={(e) => setUsername(e.detail.value!)}
                                        className='ion-margin-bottom'
                                    />
                                    <IonInput
                                        label="Password"
                                        labelPlacement="stacked"
                                        type="password"
                                        placeholder="Enter your password"
                                        fill="outline"
                                        value={password}
                                        onIonChange={(e) => setPassword(e.detail.value!)}
                                        className='ion-margin-bottom'
                                    />
                                    <IonButton
                                        expand="full"
                                        type="submit"
                                        className="login-button"
                                        color="primary"
                                        onClick={handleLogin}
                                        shape='round'
                                    >
                                        Login
                                    </IonButton>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header={'Login Failed'}
                    message={'Please check your username and password.'}
                    buttons={['OK']}
                />
            </IonContent>
        </IonPage>
    );
};

export default LoginPage;