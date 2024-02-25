import { showLoadingIndicator, hideLoadingIndicator } from './utilities.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu } from './overlays.mjs';
import { clearCart } from './cart.mjs';



document.addEventListener('DOMContentLoaded', () => {
    showLoadingIndicator();
    clearCart();
    setupEventListenersForOpenAndCloseCartandMenu();
    hideLoadingIndicator();
});