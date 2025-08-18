import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'TukNRoll',
  webDir: 'dist',
  plugins:{
    Keyboard: {
      resize: 'ionic',
    },
    StatusBar: {
      style: 'DARK',
      overlayWebView: false
    }
  }
};

export default config;
