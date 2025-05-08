# iOS Text Selection Plugin for Koodo Reader

This plugin overrides iOS's default text selection menu with a custom implementation that works with Koodo Reader's popup system.

## Prerequisites

- Node.js and Yarn 
- Xcode 14 or later (for iOS development)
- CocoaPods (for iOS dependency management)

## Building the Plugin

1. Install plugin dependencies:
```bash
cd ios-text-selection-plugin
yarn install
```

2. Build the plugin:
```bash
yarn build
```

This compiles TypeScript files and creates a distribution bundle.

## Installing the Plugin

1. Install the plugin in your app:
```bash
# From the main app directory
yarn add ./ios-text-selection-plugin
```

2. Synchronize the Capacitor project:
```bash
npx cap sync ios
```

3. Open the iOS project in Xcode:
```bash
npx cap open ios
```

## Troubleshooting Build Issues

If you encounter build errors:

1. Check the plugin's dependencies are installed:
```bash
cd ios-text-selection-plugin
yarn install
```

2. Make sure TypeScript and Rollup are properly installed:
```bash
yarn add -D typescript rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs rimraf
```

3. Try cleaning the build and rebuilding:
```bash
yarn clean
yarn build
```

4. If you see path errors, check that all import paths in the main app are using the module name:
```typescript
// Correct
import { TextSelection } from 'ios-text-selection-plugin';

// Incorrect
import { TextSelection } from './ios-text-selection-plugin/src/index';
```

## How it works

This plugin:

1. Creates a custom delegate for the WebView that intercepts text selection events
2. Prevents the default iOS text selection menu from appearing
3. Triggers a JavaScript event with the selected text and coordinates
4. The Koodo Reader app displays its own popup menu at those coordinates
5. Actions in the popup menu are passed back to the plugin for any iOS-specific handling

## Testing

To test the plugin:

1. Build and run the Koodo Reader app on an iOS simulator or device
2. Open a book
3. Select text by long-pressing on it
4. Verify that the Koodo Reader popup menu appears instead of the iOS default menu
5. Verify that all menu options work correctly

## Developer Notes

The plugin uses a custom WKUIDelegate to override the default text selection behavior. The key methods are:

- `webView(_:shouldShowMenuItems:forElementWith:at:)` - Prevents default menu
- `webView(_:handleLongPress:)` - Intercepts long press gestures 
- `showCustomTextSelectionMenu` - Shows our custom menu
- `handleTextSelectionAction` - Handles text selection actions

For more details, see the Swift implementation in the plugin's source code.