import { showLoadingIndicator, hideLoadingIndicator, isAboutPage } from './utilities.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu } from './overlays.mjs';
import { loadCartFromLocalStorage, updateCartOverlay } from './cart.mjs';

document.addEventListener('DOMContentLoaded', () => {
    showLoadingIndicator();
    if (isAboutPage()) {
        setupEventListenersForOpenAndCloseCartandMenu();
        loadCartFromLocalStorage();
        updateCartOverlay();
        hideLoadingIndicator();
    }
});