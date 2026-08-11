import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skumarantailors.app',
  appName: 'S Kumaran Tailors',
  webDir: 'out',
  server: {
    url: 'https://skumarantailors.vercel.app',
    cleartext: false,
  }
};

export default config;
