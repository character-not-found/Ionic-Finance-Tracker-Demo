import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.demotuk.ionic',
  appName: 'Demo Finance Tracker App',
  webDir: 'dist',
  plugins:{
    Keyboard: {
      resize: 'ionic',
    },
    StatusBar: {
      style: 'DARK',
      overlayWebView: false
    },
    CapacitorHttp: {
      enabled: true,
    },
  }
};

export default config;
