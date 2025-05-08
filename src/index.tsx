import React from "react";
import ReactDOM from "react-dom";
import "./assets/styles/reset.css";
import "./assets/styles/global.css";
import "./assets/styles/style.css";
import { Provider } from "react-redux";
import "./i18n";
import store from "./store";
import Router from "./router/index";
import StyleUtil from "./utils/reader/styleUtil";
import { initSystemFont, initTheme } from "./utils/reader/launchUtil";
// Initialize theme and fonts
initTheme();
initSystemFont();

// Try to initialize Capacitor if available
const initializeCapacitor = async () => {
  try {
    // Dynamic import to prevent build errors
    const { Capacitor } = await import('@capacitor/core');
    
    if (Capacitor.isPluginAvailable('TextSelection') && Capacitor.getPlatform() === 'ios') {
      console.log('iOS text selection plugin registered successfully');
    }
  } catch (err) {
    // Capacitor not available, this is expected in web/desktop environments
    console.log('Capacitor not available (expected in non-iOS environments)');
  }
};

// Only try to initialize in browser environments
if (typeof window !== 'undefined') {
  initializeCapacitor();
}
ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
  document.getElementById("root")
);
StyleUtil.applyTheme();
