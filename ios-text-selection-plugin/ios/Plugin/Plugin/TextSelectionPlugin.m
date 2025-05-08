#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(TextSelectionPlugin, "TextSelection",
           CAP_PLUGIN_METHOD(showCustomTextSelectionMenu, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(handleTextSelectionAction, CAPPluginReturnPromise);
)