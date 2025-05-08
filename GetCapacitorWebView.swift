import Foundation
import UIKit
import WebKit
import Capacitor

@objc public class GetCapacitorWebView: NSObject {
    
    @objc public static func getWebView() -> WKWebView? {
        // Get a reference to the AppDelegate
        guard let appDelegate = UIApplication.shared.delegate else {
            return nil
        }
        
        // Try to access the bridge property using Swift's reflection
        let mirror = Mirror(reflecting: appDelegate)
        for (label, value) in mirror.children {
            // Look for a property named "bridge"
            if label == "bridge" || label == "_bridge" {
                // Try to get the webView from the bridge using reflection
                let bridgeMirror = Mirror(reflecting: value)
                for (bridgeLabel, bridgeValue) in bridgeMirror.children {
                    if bridgeLabel == "webView" || bridgeLabel == "_webView" {
                        if let webView = bridgeValue as? WKWebView {
                            print("Found Capacitor WebView through reflection")
                            return webView
                        }
                    }
                }
            }
        }
        
        // Fallback: Search for WKWebView in the view hierarchy
        print("Falling back to searching for WebView in hierarchy")
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let keyWindow = windowScene.windows.first,
              let rootVC = keyWindow.rootViewController else {
            return nil
        }
        
        if let webViewController = findWebViewController(rootVC),
           let webView = findWebView(in: webViewController.view) {
            print("Found WebView in view hierarchy")
            return webView
        }
        
        return nil
    }
    
    // Helper method to find a view controller containing a WKWebView
    private static func findWebViewController(_ viewController: UIViewController) -> UIViewController? {
        // Check if this view controller's view contains a WKWebView
        if let _ = findWebView(in: viewController.view) {
            return viewController
        }
        
        // Check container view controllers
        if let navVC = viewController as? UINavigationController {
            return navVC.viewControllers.compactMap { findWebViewController($0) }.first
        } else if let tabVC = viewController as? UITabBarController {
            return tabVC.viewControllers?.compactMap { findWebViewController($0) }.first
        }
        
        // Check child view controllers
        for childVC in viewController.children {
            if let result = findWebViewController(childVC) {
                return result
            }
        }
        
        return nil
    }
    
    // Helper method to find a WKWebView in a view hierarchy
    private static func findWebView(in view: UIView) -> WKWebView? {
        // Check if this view is a WKWebView
        if let webView = view as? WKWebView {
            return webView
        }
        
        // Check subviews
        for subview in view.subviews {
            if let webView = findWebView(in: subview) {
                return webView
            }
        }
        
        return nil
    }
}