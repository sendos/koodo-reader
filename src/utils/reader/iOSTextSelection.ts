import { ConfigService } from "../../assets/lib/kookit-extra-browser.min";
import { setupIOSTextSelectionHandler } from "./directPopupTrigger";

// Only import Capacitor if it's available at build time
let Capacitor: any = null;
try {
  Capacitor = require('@capacitor/core').Capacitor;
} catch (e) {
  // Capacitor not available, we'll handle this gracefully
  console.log('Capacitor not available at build time');
}

// Check if we're running on iOS with Capacitor
export const isCapacitoriOS = () => {
  if (typeof window !== 'undefined' && window.navigator) {
    // First check by user agent if we're on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIOS) {
      // If on iOS, check if Capacitor is available
      if (Capacitor && Capacitor.getPlatform && Capacitor.getPlatform() === 'ios') {
        return true;
      }
      
      // Also check window.Capacitor
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        return true;
      }
    }
  }
  
  return false;
};

// Try to import our custom plugin dynamically to avoid errors in other environments
export const getTextSelectionPlugin = async () => {
  if (isCapacitoriOS()) {
    try {
      // We'll use the Capacitor plugin registry if available
      if (typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.Plugins) {
        return (window as any).Capacitor.Plugins.TextSelection;
      }
    } catch (error) {
      console.error('Failed to load iOS text selection plugin:', error);
    }
  }
  return null;
};

// Initialize the iOS text selection handler
export const initializeIOSTextSelection = async () => {
  console.log('Initializing iOS text selection handler');
  
  // First, set up our direct popup trigger JavaScript
  setupIOSTextSelectionHandler();
  
  // Then, if the plugin is available, set up the native listener
  if (isCapacitoriOS()) {
    const TextSelection = await getTextSelectionPlugin();
    if (TextSelection) {
      // Add event listener for text selection events from native iOS
      TextSelection.addListener('textSelected', (info: any) => {
        if (!info || !info.selectedText) return;
        
        console.log('Received textSelected event from iOS plugin:', info);
        
        // Show our custom popup menu
        showCustomTextSelectionMenu(info.x, info.y, info.selectedText);
      });
      
      console.log('iOS text selection native plugin initialized');
    } else {
      console.log('iOS text selection plugin not available, using JavaScript fallback only');
    }
  }
};

// Show our custom text selection menu
export const showCustomTextSelectionMenu = async (x: number, y: number, selectedText: string) => {
  if (!selectedText) return;
  
  console.log('Showing custom text selection menu:', { x, y, selectedText });
  
  // Use our direct popup trigger
  if (typeof window !== 'undefined' && (window as any).showPopupForIOSSelection) {
    (window as any).showPopupForIOSSelection(selectedText, x, y);
  } else {
    // Fallback: Dispatch event directly
    const event = new CustomEvent('custom-text-selection', {
      detail: { x, y, selectedText }
    });
    document.dispatchEvent(event);
  }
  
  // If the native plugin is available, inform it we've shown the menu
  const TextSelection = await getTextSelectionPlugin();
  if (TextSelection) {
    TextSelection.showCustomTextSelectionMenu({
      x,
      y,
      selectedText
    });
  }
};

// Handle a text selection action
export const handleTextSelectionAction = async (action: string, selectedText: string) => {
  if (!isCapacitoriOS() || !selectedText) return;
  
  const TextSelection = await getTextSelectionPlugin();
  if (TextSelection) {
    TextSelection.handleTextSelectionAction({
      action,
      selectedText
    });
  }
};

// Export a helper to get selected text (compatible with the existing method)
export const getIOSSelection = () => {
  // This will be called by the native plugin through the event listener
  return null;
};