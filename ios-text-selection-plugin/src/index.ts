import type { PluginListenerHandle } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

export interface TextSelectionPlugin {
  /**
   * Show a custom text selection menu
   * @param options Options for showing the text selection menu
   * @returns Promise that resolves when the menu is shown
   */
  showCustomTextSelectionMenu(options: {
    x: number;
    y: number;
    selectedText: string;
  }): Promise<void>;

  /**
   * Handle a text selection action
   * @param options Options for the text selection action
   * @returns Promise that resolves when the action is handled
   */
  handleTextSelectionAction(options: {
    action: string;
    selectedText: string;
  }): Promise<void>;
}

/**
 * Text selection event listeners
 */
export interface TextSelectionListeners {
  /**
   * Called when text is selected
   */
  textSelected: (info: {
    x: number;
    y: number;
    selectedText: string;
  }) => void;

  /**
   * Called when the text selection menu is shown
   */
  textSelectionMenuShown: (info: {
    success: boolean;
    x: number;
    y: number;
    selectedText: string;
  }) => void;

  /**
   * Called when a text selection action is performed
   */
  textSelectionAction: (info: {
    action: string;
    selectedText: string;
  }) => void;
}

const TextSelection = registerPlugin<TextSelectionPlugin>('TextSelection');

export { TextSelection };