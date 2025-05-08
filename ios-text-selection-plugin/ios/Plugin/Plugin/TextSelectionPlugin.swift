import Foundation
import Capacitor
import WebKit

/**
 * Custom plugin to override iOS text selection menu in WebView
 */
@objc(TextSelectionPlugin)
public class TextSelectionPlugin: CAPPlugin {
    private var webViewDelegate: TextSelectionWebViewDelegate?
    
    override public func load() {
        // Configure the WebView delegate when the plugin loads
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let webView = self.bridge?.webView else { return }
            
            // Store the original delegate to forward calls
            let originalDelegate = webView.uiDelegate
            
            // Create our custom delegate
            self.webViewDelegate = TextSelectionWebViewDelegate(originalDelegate: originalDelegate, plugin: self)
            
            // Set our delegate as the webView's delegate
            webView.uiDelegate = self.webViewDelegate
        }
    }
    
    // Method to be called from JavaScript to show our custom text selection menu
    @objc func showCustomTextSelectionMenu(_ call: CAPPluginCall) {
        guard let x = call.getDouble("x"),
              let y = call.getDouble("y"),
              let selectedText = call.getString("selectedText") else {
            call.reject("Missing required parameters: x, y, or selectedText")
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                call.reject("Plugin not available")
                return
            }
            
            // Send data back to JavaScript with success
            self.notifyListeners("textSelectionMenuShown", data: [
                "success": true,
                "x": x,
                "y": y,
                "selectedText": selectedText
            ])
            
            call.resolve()
        }
    }
    
    // Method to handle text selection action
    @objc func handleTextSelectionAction(_ call: CAPPluginCall) {
        guard let action = call.getString("action"),
              let selectedText = call.getString("selectedText") else {
            call.reject("Missing required parameters: action or selectedText")
            return
        }
        
        // Notify JavaScript about the action
        self.notifyListeners("textSelectionAction", data: [
            "action": action,
            "selectedText": selectedText
        ])
        
        call.resolve()
    }
}

// Custom WebView delegate to override text selection behavior
class TextSelectionWebViewDelegate: NSObject, WKUIDelegate {
    private weak var originalDelegate: WKUIDelegate?
    private weak var plugin: TextSelectionPlugin?
    
    init(originalDelegate: WKUIDelegate?, plugin: TextSelectionPlugin) {
        self.originalDelegate = originalDelegate
        self.plugin = plugin
        super.init()
    }
    
    // This method is called when the edit menu is about to appear
    func webView(_ webView: WKWebView, shouldShowMenuItems menuItems: [UIMenuItem], forElementWith attributes: [String : String], at point: CGPoint) -> [UIMenuItem] {
        // This is where we could customize the menu items
        // For now, we're preventing the default menu by returning an empty array
        return []
    }
    
    // This intercepts the long press that would trigger the text selection menu
    func webView(_ webView: WKWebView, handleLongPress longPressGestureRecognizer: UILongPressGestureRecognizer) {
        if longPressGestureRecognizer.state == .began {
            // Get the location in the web view
            let location = longPressGestureRecognizer.location(in: webView)
            
            // Execute JavaScript to get the selected text
            webView.evaluateJavaScript("document.getSelection().toString()", completionHandler: { [weak self] (result, error) in
                guard let self = self, let selectedText = result as? String, !selectedText.isEmpty else {
                    // If no text is selected, allow the default behavior
                    return
                }
                
                // Notify the plugin about the text selection
                self.plugin?.notifyListeners("textSelected", data: [
                    "x": location.x,
                    "y": location.y,
                    "selectedText": selectedText
                ])
                
                // Prevent default iOS text selection menu
                longPressGestureRecognizer.isEnabled = false
                longPressGestureRecognizer.isEnabled = true
            })
        }
    }
    
    // Forward other delegate methods to the original delegate
    public func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        originalDelegate?.webView?(webView, runJavaScriptAlertPanelWithMessage: message, initiatedByFrame: frame, completionHandler: completionHandler)
    }
    
    public func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        originalDelegate?.webView?(webView, runJavaScriptConfirmPanelWithMessage: message, initiatedByFrame: frame, completionHandler: completionHandler)
    }
    
    public func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        originalDelegate?.webView?(webView, runJavaScriptTextInputPanelWithPrompt: prompt, defaultText: defaultText, initiatedByFrame: frame, completionHandler: completionHandler)
    }
}
