// Direct popup trigger for iOS text selection
export function setupIOSTextSelectionHandler() {
  console.log('Setting up iOS text selection handler');
  
  // Global function to show the popup menu
  window.showPopupForIOSSelection = (selectedText, x, y) => {
    console.log('showPopupForIOSSelection called:', { selectedText, x, y });
    
    // Look for all popup menu containers in the DOM
    const popupMenuContainers = document.querySelectorAll('.popup-menu-container');
    console.log('Found', popupMenuContainers.length, 'popup menu containers');
    
    if (popupMenuContainers.length > 0) {
      // Get the popup container
      const popupContainer = popupMenuContainers[0];
      
      // Make it visible
      popupContainer.style.display = 'block';
      popupContainer.style.left = `${x}px`;
      popupContainer.style.top = `${y}px`;
      
      // Find all global store instances
      if (window.store && window.store.dispatch) {
        // Try to dispatch directly to Redux
        try {
          window.store.dispatch({ 
            type: 'reader/handleOpenMenu', 
            payload: true 
          });
          window.store.dispatch({ 
            type: 'reader/handleMenuMode', 
            payload: 'menu' 
          });
          console.log('Dispatched Redux actions to show menu');
        } catch (e) {
          console.error('Error dispatching to Redux:', e);
        }
      }
      
      return true;
    }
    
    return false;
  };
  
  // Listen for custom text selection events
  document.addEventListener('custom-text-selection', (event) => {
    const { selectedText, x, y } = event.detail;
    console.log('Received custom-text-selection event:', { selectedText, x, y });
    window.showPopupForIOSSelection(selectedText, x, y);
  });
  
  console.log('iOS text selection handler setup complete');
  return true;
}

// Manual test function (for debugging)
export function testShowPopup() {
  if (window.showPopupForIOSSelection) {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    window.showPopupForIOSSelection('Test selection', x, y);
    return 'Tried to show popup at center of screen';
  }
  return 'showPopupForIOSSelection not available';
}