import Foundation
import Capacitor
import WebKit

// A custom plugin for handling text selection in iOS WebViews
@objc(TextSelectionHandler)
public class TextSelectionHandler: NSObject {
    
    // Shared instance for easy access
    @objc public static let shared = TextSelectionHandler()
    
    // The web view we're working with
    private weak var webView: WKWebView?
    
    // The original delegate to forward calls to
    private weak var originalDelegate: WKUIDelegate?
    
    // Configure this handler for a specific web view
    @objc public func configure(webView: WKWebView) {
        self.webView = webView
        self.originalDelegate = webView.uiDelegate
        
        print("TextSelectionHandler: Configuring for WebView: \(webView)")
        
        // Create our custom UI delegate
        let customDelegate = CustomWebViewDelegate(originalDelegate: originalDelegate, handler: self)
        
        // Set our delegate as the web view's delegate
        webView.uiDelegate = customDelegate
        
        // Add JavaScript to help with debugging
        injectJavaScript(into: webView)
    }
    
    // Inject JavaScript to help with debugging
    private func injectJavaScript(into webView: WKWebView) {
        // First, inject our debug helper script
        let debugScript = """
        (function() {
            console.log('KOODO_DEBUG: Setting up text selection handler');
            
            // Create global function to directly trigger the popup menu
            window.koodoShowPopupMenu = function(text, x, y) {
                console.log('KOODO_DEBUG: koodoShowPopupMenu called with', { text, x, y });
                
                // Create a custom event that Koodo will listen for
                const event = new CustomEvent('custom-text-selection', {
                    detail: { selectedText: text, x, y }
                });
                
                // Dispatch the event to trigger Koodo's listener
                document.dispatchEvent(event);
                
                // Try to directly access React components
                try {
                    // Try to find the popup menu container
                    const popupMenu = document.querySelector('.popup-menu-container');
                    if (popupMenu) {
                        console.log('KOODO_DEBUG: Found popup-menu-container, making visible');
                        popupMenu.style.display = 'block';
                        popupMenu.style.left = x + 'px';
                        popupMenu.style.top = y + 'px';
                        
                        // Try to find and call handleOpenMenu from the React component props
                        const react = findReactComponent(popupMenu);
                        if (react && react.props && react.props.handleOpenMenu) {
                            console.log('KOODO_DEBUG: Found React component, calling handleOpenMenu');
                            react.props.handleOpenMenu(true);
                            react.props.handleMenuMode('menu');
                        }
                    }
                } catch (e) {
                    console.error('KOODO_DEBUG: Error accessing React components', e);
                }
                
                return true;
            };
            
            // Helper function to find React component instance from DOM node
            function findReactComponent(dom) {
                const key = Object.keys(dom).find(key => key.startsWith('__reactProps$'));
                if (key) {
                    return dom[key];
                }
                return null;
            }
            
            // Log to verify the script loaded
            console.log('KOODO_DEBUG: Text selection handler setup complete');
        })();
        """
        
        // Execute the debug script
        webView.evaluateJavaScript(debugScript, completionHandler: { (result, error) in
            if let error = error {
                print("TextSelectionHandler: Error injecting debug script: \(error)")
            } else {
                print("TextSelectionHandler: Debug script injection successful")
            }
        })
    }
    
    // Handle text selection
    @objc public func handleTextSelection(text: String, x: CGFloat, y: CGFloat) {
        print("TextSelectionHandler: Text selected: '\(text)' at position: (\(x), \(y))")
        
        // Escape the text for JavaScript
        let escapedText = text.replacingOccurrences(of: "\\", with: "\\\\")
                             .replacingOccurrences(of: "\"", with: "\\\"")
                             .replacingOccurrences(of: "'", with: "\\'")
                             .replacingOccurrences(of: "\n", with: "\\n")
                             .replacingOccurrences(of: "\r", with: "\\r")
        
        // Try to trigger Koodo's popup menu via our global function
        let jsCode = """
        if (typeof window.koodoShowPopupMenu === 'function') {
            console.log('KOODO_DEBUG: Calling koodoShowPopupMenu function');
            window.koodoShowPopupMenu("\(escapedText)", \(x), \(y));
        } else {
            console.error('KOODO_DEBUG: koodoShowPopupMenu function not found');
            
            // Fallback: Try direct event dispatch
            console.log('KOODO_DEBUG: Falling back to direct event dispatch');
            var event = new CustomEvent('custom-text-selection', {
                detail: {
                    x: \(x),
                    y: \(y),
                    selectedText: "\(escapedText)"
                }
            });
            document.dispatchEvent(event);
        }
        """
        
        webView?.evaluateJavaScript(jsCode, completionHandler: { (result, error) in
            if let error = error {
                print("TextSelectionHandler: Error triggering popup: \(error)")
            } else {
                print("TextSelectionHandler: Popup trigger attempt successful")
            }
        })
    }
}

// Custom delegate to override the WebView's text selection behavior
class CustomWebViewDelegate: NSObject, WKUIDelegate {
    private weak var originalDelegate: WKUIDelegate?
    private weak var handler: TextSelectionHandler?
    
    init(originalDelegate: WKUIDelegate?, handler: TextSelectionHandler) {
        self.originalDelegate = originalDelegate
        self.handler = handler
        super.init()
        print("CustomWebViewDelegate: Initialized")
    }
    
    // Prevent the default menu items from showing
    @available(iOS 13.0, *)
    func webView(_ webView: WKWebView, contextMenuConfigurationForElement elementInfo: WKContextMenuElementInfo, completionHandler: @escaping (UIContextMenuConfiguration?) -> Void) {
        print("CustomWebViewDelegate: contextMenuConfigurationForElement called")
        // Returning nil prevents the default menu
        completionHandler(nil)
    }
    
    // Intercept long press that would trigger text selection menu
    func webView(_ webView: WKWebView, handleLongPress longPressGestureRecognizer: UILongPressGestureRecognizer) {
        if longPressGestureRecognizer.state == .began {
            print("CustomWebViewDelegate: Long press detected")
            // Get location in webview
            let location = longPressGestureRecognizer.location(in: webView)
            
            // Get the selected text via JavaScript
            webView.evaluateJavaScript("document.getSelection().toString()", completionHandler: { [weak self] (result, error) in
                if let error = error {
                    print("CustomWebViewDelegate: Error getting selection: \(error)")
                    return
                }
                
                guard let selectedText = result as? String, !selectedText.isEmpty else {
                    print("CustomWebViewDelegate: No text selected or empty selection")
                    return
                }
                
                print("CustomWebViewDelegate: Selected text: '\(selectedText)'")
                
                // Handle the selected text
                self?.handler?.handleTextSelection(text: selectedText, x: location.x, y: location.y)
            })
            
            // Prevent the default selection menu by toggling enabled state
            longPressGestureRecognizer.isEnabled = false
            longPressGestureRecognizer.isEnabled = true
        }
    }
    
    // Forward UI delegate methods to the original delegate
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        originalDelegate?.webView?(webView, runJavaScriptAlertPanelWithMessage: message, initiatedByFrame: frame, completionHandler: completionHandler)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        originalDelegate?.webView?(webView, runJavaScriptConfirmPanelWithMessage: message, initiatedByFrame: frame, completionHandler: completionHandler)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        originalDelegate?.webView?(webView, runJavaScriptTextInputPanelWithPrompt: prompt, defaultText: defaultText, initiatedByFrame: frame, completionHandler: completionHandler)
    }
}