import React, { useState, useEffect } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact,
  isPlatform
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { home, cashOutline, listOutline, readerOutline } from 'ionicons/icons';

import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import ManagementPage from './pages/ManagementPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

    useEffect(() => {
        if (isPlatform('capacitor')) {
            // Set the style and hide the status bar when the component mounts
            StatusBar.setStyle({ style: Style.Dark });
            StatusBar.hide();

            // The interval is also wrapped in the platform check
            const interval = setInterval(() => {
                StatusBar.hide();
            }, 2000);

            return () => {
                clearInterval(interval);
            };
        }
    }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
  
  const showTabs = isLoggedIn && !['/login'].includes(location.pathname);

  return (
    <IonTabs>
      <IonRouterOutlet>
        {/* The Login page route, without tabs */}
        <Route exact path="/login">
          {isLoggedIn ? <Redirect to="/home" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
        </Route>
        
        {/* All other app routes that require authentication and have tabs */}
        <Route exact path="/home">
          {isLoggedIn ? <Home /> : <Redirect to="/login" />}
        </Route>
        <Route exact path="/income">
          {isLoggedIn ? <IncomePage /> : <Redirect to="/income" />}
        </Route>
        <Route exact path="/expenses">
          {isLoggedIn ? <ExpensesPage /> : <Redirect to="/login" />}
        </Route>
        <Route exact path="/management">
          {isLoggedIn ? <ManagementPage /> : <Redirect to="/login" />}
        </Route>

        {/* Default route redirect */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
      
      {showTabs && (
        <IonTabBar slot="bottom" id="navbar">
          <IonTabButton tab="home" href="/home">
            <IonIcon aria-hidden="true" icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="income" href="/income">
            <IonIcon aria-hidden="true" icon={cashOutline} />
            <IonLabel>Income</IonLabel>
          </IonTabButton>

          <IonTabButton tab="expenses" href="/expenses">
            <IonIcon aria-hidden="true" icon={listOutline} />
            <IonLabel>Expenses</IonLabel>
          </IonTabButton>

          <IonTabButton tab="management" href="/management">
            <IonIcon aria-hidden="true" icon={readerOutline} />
            <IonLabel>Management</IonLabel>
          </IonTabButton>
        </IonTabBar>
      )}
    </IonTabs>
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AppContent />
    </IonReactRouter>
  </IonApp>
);

export default App;
