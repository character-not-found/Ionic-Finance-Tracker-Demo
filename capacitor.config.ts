import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.demotuk.ionic',
  appName: 'Demo Finance Tracker App',
  webDir: 'dist',
  plugins:{
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: false
    },
    StatusBar: {
      style: 'DARK',
      overlayWebView: false
    },
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: false,
      splashImmersive: false,
      layoutName: "launch_screen",
    },
    EdgeToEdge: {
      backgroundColor: "#1a202c",
    },
  }
};

export default config;
