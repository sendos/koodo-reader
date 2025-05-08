import Foundation
import UIKit
import WebKit
import Capacitor

@objc public class DirectCapacitorAccess: NSObject {
    
    @objc public static func getWebView() -> WKWebView? {
        // Try to find CAPBridgeViewController in the view hierarchy
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let keyWindow = windowScene.windows.first,
              let rootVC = keyWindow.rootViewController else {
            return nil
        }
        
        // Look for CAPBridgeViewController
        let capViewController = findCapacitorViewController(rootVC)
        if let capacitorVC = capViewController {
            print("Found CAPBridgeViewController")
            
            // Try to access the webView property using reflection
            let mirror = Mirror(reflecting: capacitorVC)
            for (label, value) in mirror.children {
                if label == "webView" || label == "_webView" {
                    if let webView = value as? WKWebView {
                        print("Found webView in CAPBridgeViewController")
                        return webView
                    }
                }
            }
            
            // Alternative: Look for WebView in the view hierarchy
            if let webView = findWebView(in: capacitorVC.view) {
                print("Found WebView in CAPBridgeViewController view hierarchy")
                return webView
            }
        }
        
        // Fallback: Try a direct search for WKWebView in the view hierarchy
        print("Falling back to general WebView search")
        if let webViewController = findWebViewController(rootVC),
           let webView = findWebView(in: webViewController.view) {
            print("Found WebView through general search")
            return webView
        }
        
        return nil
    }
    
    // Find a view controller that might be or contain a CAPBridgeViewController
    private static func findCapacitorViewController(_ viewController: UIViewController) -> UIViewController? {
        // Check if this is the CAPBridgeViewController
        let vcName = String(describing: type(of: viewController))
        if vcName.contains("CAPBridgeViewController") || vcName.contains("Capacitor") {
            return viewController
        }
        
        // Check container view controllers
        if let navVC = viewController as? UINavigationController {
            for vc in navVC.viewControllers {
                if let capVC = findCapacitorViewController(vc) {
                    return capVC
                }
            }
        } else if let tabVC = viewController as? UITabBarController {
            for vc in tabVC.viewControllers ?? [] {
                if let capVC = findCapacitorViewController(vc) {
                    return capVC
                }
            }
        }
        
        // Check child view controllers
        for childVC in viewController.children {
            if let capVC = findCapacitorViewController(childVC) {
                return capVC
            }
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
            for vc in navVC.viewControllers {
                if let webVC = findWebViewController(vc) {
                    return webVC
                }
            }
        } else if let tabVC = viewController as? UITabBarController {
            for vc in tabVC.viewControllers ?? [] {
                if let webVC = findWebViewController(vc) {
                    return webVC
                }
            }
        }
        
        // Check child view controllers
        for childVC in viewController.children {
            if let webVC = findWebViewController(childVC) {
                return webVC
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