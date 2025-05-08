# iOS Text Selection Customization - Setup Instructions

Follow these steps to add custom text selection handling to your iOS app:

## 1. Add Swift Files to the Project

1. In Xcode, right-click on the "App" folder (under App/App)
2. Select "Add Files to 'App'..."
3. Navigate to and select the following files:
   - `TextSelectionHandler.swift`
   - `TextSelectionConfigurer.swift`
   - `GetCapacitorWebView.swift`
   - `DirectCapacitorAccess.swift`
4. Make sure "Copy items if needed" is checked
5. Click "Add"

## 2. Modify AppDelegate.swift

1. Open `AppDelegate.swift` (under App/App)
2. Add these imports near the top of the file (with other imports):
   ```swift
   import WebKit
   ```

3. Find the `application(_:didFinishLaunchingWithOptions:)` method
4. Add this line before the `return true` statement:
   ```swift
   TextSelectionConfigurer.configure()
   ```

   The method should look something like this:
   ```swift
   func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
       // Override point for customization after application launch.
       TextSelectionConfigurer.configure()
       return true
   }
   ```

## 3. Build the React App with JavaScript Fixes

1. Make sure you've added the updated JavaScript files to your project:
   - `src/utils/reader/directPopupTrigger.js`
   - Updated `src/utils/reader/iOSTextSelection.ts`

2. Build your React app:
   ```bash
   yarn build
   ```

## 4. Sync and Build the iOS Project

1. Sync the updated web content to the iOS project:
   ```bash
   npx cap sync ios
   ```

2. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

3. Build and run the app on an iOS device or simulator

## How It Works

This solution has two parts working together:

### 1. Swift/Native Side:
- Intercepts text selection in the iOS WebView
- Suppresses the default iOS selection menu
- Triggers JavaScript code to show your custom menu
- Handles debugging and error cases

### 2. JavaScript Side:
- Sets up a handler for text selection events
- Directly interfaces with your app's popup menu component
- Attempts multiple approaches to show the popup menu
- Works with or without the native plugin

## Troubleshooting

If text selection doesn't show your custom menu:

1. **Check console logs**: Look for "KOODO_DEBUG" entries to see exactly what's happening
2. **Check selection event**: Verify the text selection event is being detected
3. **Check popup menu**: Make sure your app's popup menu component is working properly
4. **Check Redux connection**: If your app uses Redux, verify that it's handling the menu actions correctly

## Additional Debug Options

You can manually test the popup menu by:

1. Opening the WebView console
2. Running this command:
   ```javascript
   window.testShowPopup()
   ```

This will attempt to show the popup menu at the center of the screen.

## Tips for Further Customization

1. **Menu appearance**: You can modify the `directPopupTrigger.js` file to change how the popup menu appears
2. **Selection behavior**: Adjust the `TextSelectionHandler.swift` file to change how text is selected
3. **Integration with Redux**: If your app uses Redux, you can update the code to dispatch to your store

## Common Issues and Solutions

1. **Menu doesn't appear**: Check the console logs and verify that the `custom-text-selection` event is firing
2. **Selection isn't detected**: Check the Swift console logs to verify the selection is being captured
3. **Wrong menu position**: Adjust the coordinate calculations in the JavaScript code
4. **Network errors**: Make sure your app has the proper permissions to access network resources

If you continue to experience issues, try adding more detailed console logging to isolate the problem.