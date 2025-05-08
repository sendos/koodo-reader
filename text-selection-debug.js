// Debug script for text selection in iOS
// Add this script to your app by including it in your HTML or injecting it

(function() {
    // Keep reference to the original event listeners
    const originalAddEventListener = document.addEventListener;
    
    // Override addEventListener to log when custom-text-selection is registered
    document.addEventListener = function(type, listener, options) {
        if (type === 'custom-text-selection') {
            console.log('KOODO_DEBUG: Registering listener for custom-text-selection event');
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Add our own listener for the custom event
    originalAddEventListener.call(document, 'custom-text-selection', function(event) {
        console.log('KOODO_DEBUG: text-selection-debug.js received custom-text-selection event', event.detail);
        
        // Try to find and trigger Koodo Reader's popup menu
        tryTriggerKoodoPopup(event.detail);
    });
    
    // Try different approaches to trigger Koodo Reader's popup menu
    function tryTriggerKoodoPopup(detail) {
        const { x, y, selectedText } = detail;
        console.log(`KOODO_DEBUG: Trying to trigger popup for text: "${selectedText}" at (${x}, ${y})`);
        
        // Approach 1: Look for PopupMenu component
        const popupMenuContainer = document.querySelector('.popup-menu-container');
        if (popupMenuContainer) {
            console.log('KOODO_DEBUG: Found popup-menu-container element');
            
            // Try to make it visible
            popupMenuContainer.style.display = 'block';
            popupMenuContainer.style.left = `${x}px`;
            popupMenuContainer.style.top = `${y}px`;
            
            // Look for handleOpenMenu function in React component
            if (window.handleOpenMenu) {
                console.log('KOODO_DEBUG: Found handleOpenMenu function');
                window.handleOpenMenu(true);
            }
        } else {
            console.log('KOODO_DEBUG: popup-menu-container not found');
        }
        
        // Approach 2: Dispatch a mouseup event at the position to trigger Koodo's native handler
        try {
            console.log('KOODO_DEBUG: Dispatching custom mouseup event');
            const mouseEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y
            });
            document.elementFromPoint(x, y)?.dispatchEvent(mouseEvent);
        } catch (e) {
            console.error('KOODO_DEBUG: Error dispatching mouseup event', e);
        }
        
        // Approach 3: Look for React components in the window object
        console.log('KOODO_DEBUG: Searching for React components in window');
        for (const key in window) {
            if (key.includes('Popup') || key.includes('Menu')) {
                console.log(`KOODO_DEBUG: Found potential React component: ${key}`);
            }
        }
    }
    
    // Add global function to manually trigger the popup
    window.debugTriggerPopup = function(text, x, y) {
        console.log('KOODO_DEBUG: Manually triggering popup');
        const event = new CustomEvent('custom-text-selection', {
            detail: { selectedText: text, x, y }
        });
        document.dispatchEvent(event);
    };
    
    // Set up a MutationObserver to detect popup-related elements
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.classList?.contains('popup-menu-container') || 
                        node.querySelector?.('.popup-menu-container')) {
                        console.log('KOODO_DEBUG: Popup menu element added to DOM');
                    }
                }
            }
        }
    });
    
    // Start observing the document body
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('KOODO_DEBUG: Text selection debug script loaded');
})();