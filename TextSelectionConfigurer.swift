import Foundation
import Capacitor
import WebKit
import UIKit

@objc public class TextSelectionConfigurer: NSObject {
    
    // To be called when the app starts up
    @objc public static func configure() {
        // Wait for the app to fully initialize
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            configureWebView()
        }
    }
    
    private static func configureWebView() {
        // Try multiple approaches to get the WebView
        var webView: WKWebView?
        
        // Approach 1: Try DirectCapacitorAccess
        if let directWebView = DirectCapacitorAccess.getWebView() {
            webView = directWebView
            print("Found WebView using DirectCapacitorAccess")
        }
        // Approach 2: Try GetCapacitorWebView
        else if let reflectionWebView = GetCapacitorWebView.getWebView() {
            webView = reflectionWebView
            print("Found WebView using GetCapacitorWebView")
        }
        
        // If we found a WebView, configure the text selection handler
        if let webView = webView {
            // Configure our text selection handler with the WebView
            TextSelectionHandler.shared.configure(webView: webView)
            print("Successfully configured WebView with custom text selection handler")
        } else {
            print("Could not find Capacitor WebView - retrying in 1 second")
            
            // Retry after a delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                configureWebView()
            }
        }
    }
}