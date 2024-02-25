import { showLoadingIndicator, hideLoadingIndicator } from './utilities.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu } from './overlays.mjs';
import { loadCartFromLocalStorage, updateCartOverlay } from './cart.mjs';

document.addEventListener('DOMContentLoaded', function() {
    showLoadingIndicator();
    setupEventListenersForOpenAndCloseCartandMenu();
    loadCartFromLocalStorage();
    updateCartOverlay();
    
    try {
        const contactForm = document.querySelector('#contactForm');
        const submitButton = document.querySelector('#submitFormBtn');

        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            if (contactForm.checkValidity()) {
                submitButton.textContent = 'THANK YOU!'; 
                submitButton.disabled = true;
                contactForm.reset(); 
            }
        });
    }
    catch (error) {
        console.error('Failed to submit form', error);
    }
    finally {
        hideLoadingIndicator();
    }
});

