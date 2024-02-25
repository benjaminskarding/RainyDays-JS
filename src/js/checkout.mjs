import { showLoadingIndicator, hideLoadingIndicator, isCheckoutPage} from './utilities.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu, securityCodeOverlay } from './overlays.mjs';
import { loadCartFromLocalStorage, updateCartOverlay, updateCheckoutPage } from './cart.mjs';

function setupNewDeliveryAddressFormToggle() {
    if (isCheckoutPage()) {
    const addNewAddressForm = document.getElementById('addnewAddressForm');
    const sameAsBillingAddressRadio = document.getElementById('sameAsBillingAddressRadio');
    const addNewAddressRadio = document.getElementById('addNewAddressRadio');
    const newAddressFields = addNewAddressForm.querySelectorAll('input, select');

    function toggleRequiredOnNewAddressFields(isRequired) {
        newAddressFields.forEach(field => {
            field.required = isRequired;
            field.setAttribute('aria-required', isRequired);
        });
    }

    // Initially hide new address form
    toggleRequiredOnNewAddressFields(false);

    sameAsBillingAddressRadio.addEventListener('change', function() {
        addNewAddressForm.style.display = 'none';
        toggleRequiredOnNewAddressFields(false);
    });

    addNewAddressRadio.addEventListener('change', function() {
        addNewAddressForm.style.display = 'block';
        toggleRequiredOnNewAddressFields(true);
    });
    }
}

// Voucher & Gift Card Code functionality

const validVoucherCodes = ['NOROFF', 'GIFT', 'VOUCHER'];

function applyVoucher() {
    if(isCheckoutPage()) {
        const voucherCodeInput = document.getElementById('voucherCode');
        const applyVoucherButton = document.querySelector('.applyVoucherBtn');
        const itemsTotalSpan = document.getElementById('itemsTotal');
        const orderTotalSpan = document.getElementById('orderTotal');
        const voucherForm = document.querySelector('.billingSummary form');
    
        voucherForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const enteredCode = voucherCodeInput.value.toUpperCase();
            const isValidVoucher = validVoucherCodes.includes(enteredCode);
    
            if (isValidVoucher) {
                const discountAmount = 10; 
                applyVoucherButton.textContent = 'APPLIED';
                const newTotal = parseFloat(orderTotalSpan.textContent) - discountAmount;
                orderTotalSpan.textContent = newTotal.toFixed(2); 
            
                // Check if a discount has already been applied, if so, update it instead of adding a new line
                let discountRow = document.querySelector('.calculation-row.discount');
                if (discountRow) {
                    discountRow.querySelector('.calc-value').textContent = `$ -${discountAmount.toFixed(2)}`;
                } else {
                    // Create and insert the discount row underneath the Items Total
                    discountRow = `
                        <div class="calculation-row discount">
                            <span class="calc-label">Voucher Discount:</span>
                            <span class="calc-value">$ -${discountAmount.toFixed(2)}</span>
                        </div>`;
                    const itemsTotalRow = document.querySelector('.order-calculation-container .calculation-row:first-child');
                    itemsTotalRow.insertAdjacentHTML('afterend', discountRow);
                }
            } else {
                applyVoucherButton.textContent = 'INVALID';
            }
        });
    }
    
}

// Update the items total based on cart items
export function updateItemsTotal() {
    if (isCheckoutPage()) {
        const itemTotalElements = document.querySelectorAll('.columnItemTotal');

        let itemsTotal = Array.from(itemTotalElements).reduce((total, itemElement) => {
            const itemTotalValue = parseFloat(itemElement.textContent.replace('$', ''));
            return total + itemTotalValue;
        }, 0);
    
        const itemsTotalSpan = document.getElementById('itemsTotal');
        itemsTotalSpan.textContent = itemsTotal.toFixed(2);
    }
    
}

// Calculate and update the order total
export function updateOrderTotal() {
    if (isCheckoutPage()) {
        const itemsTotal = parseFloat(document.getElementById('itemsTotal').textContent) || 0;
        const shippingCost = parseFloat(document.getElementById('shippingCost').textContent.replace('$', '')) || 0;
        const voucherDiscount = parseFloat(document.querySelector('.calculation-row.discount .calc-value')?.textContent.replace('$', '')) || 0;
    
        const orderTotal = itemsTotal + shippingCost - Math.abs(voucherDiscount);
        document.getElementById('orderTotal').textContent = orderTotal.toFixed(2);
    }  
}

function placeOrder() {
    if(isCheckoutPage()) {
        const placeOrderButton = document.getElementById('placeOrder');
        placeOrderButton.addEventListener('click', function(event) {
            event.preventDefault();
    
            let isValid = true;
    
            // Validate billing address form
            const billingAddressForm = document.querySelector('.billingAddress form');
            if (!billingAddressForm.reportValidity()) {
                isValid = false;
            }
    
            // Validate delivery address form only if 'Add a new address' is selected
            if (document.getElementById('addNewAddressRadio').checked) {
                const deliveryAddressForm = document.getElementById('addnewAddressForm');
                if (!deliveryAddressForm.reportValidity()) {
                    isValid = false;
                }
            }
    
            // Validate payment form
            const paymentForm = document.querySelector('.payment form');
            if (!paymentForm.reportValidity()) {
                isValid = false;
            }
    
            // If all individual forms are valid, allow checkout success navigation
            if (isValid) {
                window.location.href = 'checkout_success_page.html';
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    showLoadingIndicator();
    setupEventListenersForOpenAndCloseCartandMenu();
    loadCartFromLocalStorage();
    updateCartOverlay();
    updateCheckoutPage();
    setupNewDeliveryAddressFormToggle();
    updateItemsTotal();
    applyVoucher();
    updateOrderTotal();
    securityCodeOverlay();
    placeOrder();
    hideLoadingIndicator();
})