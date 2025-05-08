import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fictionchat.app',
  appName: 'koodo-reader-fictionchat',
  webDir: 'build',
  server: {
    allowNavigation: ["cloud.960960.xyz", "*.960960.xyz"]
  },
  ios: {
    limitsNavigationsToAppBoundDomains: false,
    webViewConfiguration: {
      applicationNameForUserAgent: "KoodoReaderApp"
    }
  }
};

export default config;
