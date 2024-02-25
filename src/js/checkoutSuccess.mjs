import { showLoadingIndicator, hideLoadingIndicator } from './utilities.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu } from './overlays.mjs';
import { loadCartFromLocalStorage, updateCartOverlay } from './cart.mjs';

function clearCart() {
    localStorage.removeItem('cart');
    // If you're also tracking items count or other related data, clear them as well
    localStorage.removeItem('cartItemCount');
    // Update any on-page cart indicators as needed
    // For example:
    document.getElementById('cartCounter').textContent = '0';
}

document.addEventListener('DOMContentLoaded', () => {
    showLoadingIndicator();
    setupEventListenersForOpenAndCloseCartandMenu();
    loadCartFromLocalStorage();
    updateCartOverlay();
    clearCart();
    hideLoadingIndicator();
});