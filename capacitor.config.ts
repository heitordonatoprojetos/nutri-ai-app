import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nutriai.app',
  appName: 'Nutri AI',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      // Replace VITE_GOOGLE_WEB_CLIENT_ID with your OAuth 2.0 Web Client ID from Google Cloud Console
      // (NOT the Android client ID — the Web Application type one)
      // This is needed for native Android sign-in via Capacitor.
      // On web, Firebase handles this automatically via authDomain.
      scopes: ['profile', 'email'],
      serverClientId: process.env.VITE_GOOGLE_WEB_CLIENT_ID || '',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
