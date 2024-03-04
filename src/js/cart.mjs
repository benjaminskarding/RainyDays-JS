import { showLoadingIndicator, hideLoadingIndicator, isCheckoutPage } from './utilities.mjs';
import { updateItemsTotal, updateOrderTotal } from './checkout.mjs';

export let cart = [];

export function saveCartToLocalStorage() {
    showLoadingIndicator();
    localStorage.setItem('cart', JSON.stringify(cart));
    hideLoadingIndicator();
}

export function loadCartFromLocalStorage() {
    showLoadingIndicator();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    hideLoadingIndicator();
}

export function clearCart() {
    showLoadingIndicator();
    cart = [];
    localStorage.removeItem('cart');
    updateCartOverlay(); 
    hideLoadingIndicator();
}

export function addToCart(product, selectedSize) {
    showLoadingIndicator();
    // Check if the item already exists in the cart
    let existingItem = cart.find(item => item.id === product.id && item.size === selectedSize);
    
    if (existingItem) {
        existingItem.quantity++; 
    } else {
        // Create new cart item if it doesn't exist
        const cartItem = {
            id: product.id,
            name: product.title,
            size: selectedSize,
            color: product.baseColor,
            price: product.price, 
            discountedPrice: product.onSale ? product.discountedPrice : product.price, // Discounted price if on sale, otherwise original price
            onSale: product.onSale,
            image: product.image,
            quantity: 1
        };
        cart.push(cartItem);
    }
    saveCartToLocalStorage();
    updateCartOverlay();
    hideLoadingIndicator();
}

export function updateCartOverlay() {
    showLoadingIndicator();
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartBlock = document.getElementById('emptyCartblock');
    const itemsAddedToCartBlock = document.getElementById('itemsAddedtoCartBlock');
    const cartTotalValue = document.getElementById('cartTotalValue'); 

    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length > 0) {
        emptyCartBlock.style.display = 'none';
        itemsAddedToCartBlock.style.display = 'block';
        cartItemsContainer.innerHTML = '';

        cart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.quantity * (item.onSale ? item.discountedPrice : item.price);

            let itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.setAttribute('data-id', item.id);
            itemElement.setAttribute('data-size', item.size);
            
            // Create price HTML based on whether the item is on sale
            const priceHTML = item.onSale
                ? `<span class="original-price">$${item.price}</span>
                   <span class="sale-price">$${item.discountedPrice.toFixed(2)}</span>`
                : `<span class="product-price">$${item.price.toFixed(2)}</span>`;

            itemElement.innerHTML = `
                <h4>${item.name}</h4>
                <div class="attribute">
                    <span class="label">Size:</span>
                    <span class="value">${item.size}</span>
                </div>
                <div class="attribute">
                    <span class="label">Color:</span>
                    <span class="value">${item.color}</span>
                </div>
                <div class="attribute">
                    <span class="label">Price:</span>
                    <span class="value">${priceHTML}</span>
                </div>
                <div class="attribute quantity-control">
                    <span class="label">Quantity:</span>
                    <span class="value">${item.quantity}</span>
                    <div class="quantity-attribute">
                        <button class="cartQuantityDec" onclick="decrementQuantity('${item.id}', '${item.size}')">
                            <img src="assets/project_images/Icons/minus.svg" style="cursor: pointer;" alt="Decrease quantity"/>
                        </button>
                        <button class="cartQuantityInc" onclick="incrementQuantity('${item.id}', '${item.size}')">
                            <img src="assets/project_images/Icons/plus.svg" style="cursor: pointer;" alt="Increase quantity"/>
                        </button>
                    </div>
                </div>
                
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    } else {
        emptyCartBlock.style.display = 'block';
        itemsAddedToCartBlock.style.display = 'none';
        cartItemsContainer.innerHTML = '';
    }
    // Update all cart counters
    document.querySelectorAll('.cart-counter').forEach(counter => {
        counter.textContent = totalItems.toString();
    });
    // Update total price of cart
    if(cartTotalValue) {
        cartTotalValue.textContent = totalPrice.toFixed(2);
    }
    hideLoadingIndicator();
}

// Increment & Decrement item quantities
export function decrementQuantity(id, size) {
    showLoadingIndicator();
    const itemIndex = cart.findIndex(item => item.id === id && item.size === size);
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
        } else {
            cart.splice(itemIndex, 1);
        }
        saveCartToLocalStorage();
        updateCartOverlay();
        
        if (isCheckoutPage()) {
            updateCheckoutPage();
            updateItemsTotal();
            updateOrderTotal();
        }
    }
    hideLoadingIndicator();
}

export function incrementQuantity(id, size) {
    showLoadingIndicator();
    const itemIndex = cart.findIndex(item => item.id === id && item.size === size);
    if (itemIndex !== -1) {
        cart[itemIndex].quantity++;
        saveCartToLocalStorage();
        updateCartOverlay();

        if (isCheckoutPage()) {
            updateCheckoutPage();
            updateItemsTotal();
            updateOrderTotal();
        }
    }
    hideLoadingIndicator();
}

// Create HTML for checkout page based on current cart content

function createDesktopLayoutItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.setAttribute('data-id', item.id);
    itemElement.setAttribute('data-size', item.size);
    
    // Calculate discount
    let discountPercentage = 0;
    if (item.onSale) {
        discountPercentage = ((item.price - item.discountedPrice) / item.price * 100).toFixed(0);
    }

    // Calculate the item total price
    const itemTotalPrice = item.onSale ? item.discountedPrice : item.price;

    itemElement.innerHTML = `
        <div class="productRow">
            <div class="columnOrderSummary">
                <div class="productName p3">${item.name}</div>
                <div class="productSize p2">Size: ${item.size}</div>
                <div class="productColor p2">Color: ${item.color}</div>
            </div>
            <div class="columnQuantity p2">${item.quantity}</div>
            <div class="columnPrice p2">${item.price}</div>
            <div class="columnDiscount p2">${discountPercentage}%</div>
            <div class="columnItemTotal p2 js-item-total">$${(item.quantity * itemTotalPrice).toFixed(2)}</div>
        </div>
    `;

    return itemElement;
}

function createMobileLayoutItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item-mobile';
    itemElement.setAttribute('data-id', item.id);
    itemElement.setAttribute('data-size', item.size);
    
    // Calculate discount
    let discountPercentage = 0;
    if (item.onSale) {
        discountPercentage = ((item.price - item.discountedPrice) / item.price * 100).toFixed(0);
    }
    
    // Calculate the item total price
    const itemTotalPrice = item.onSale ? item.discountedPrice : item.price;

    itemElement.innerHTML = `
        <div class="mobile-product-name p3">${item.name}</div>
        <div class="mobile-attribute p2">Size: ${item.size}</div>
        <div class="mobile-attribute p2">Color: ${item.color}</div>
        <div class="mobile-attribute p2">Quantity: ${item.quantity}</div>
        <div class="mobile-attribute p2">Price: $ ${item.price}</div>
        <div class="mobile-discount-item-total">
        <div class="mobile-attribute p2">Discount: ${discountPercentage}%</div>
        <div class="mobile-attribute p2">Item Total: $ <span class="js-item-total">${(item.quantity * itemTotalPrice).toFixed(2)}</span></div>
        </div>
    `;
    return itemElement;
}

// Update checkout page by calling relevant HTML generating function, based on viewport width.
// Also updates checkout page items total and order total.
export function updateCheckoutPage() {
    if (isCheckoutPage()) {
        showLoadingIndicator();
        const productsContainer = document.getElementById('productsContainer');
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        productsContainer.innerHTML = ''; 
    
        if (cart.length > 0) {
            cart.forEach(item => {
                let itemElement;
                if (viewportWidth <= 958) {
                    // Mobile layout
                    itemElement = createMobileLayoutItemElement(item);
                } else {
                    // Desktop layout
                    itemElement = createDesktopLayoutItemElement(item);
                }
                productsContainer.appendChild(itemElement);
            });
        } else {
            updateItemsTotal();
            updateOrderTotal();
        }
        hideLoadingIndicator(); 
    }
}

// Make increment & decrement functions globally accessible. Ensures elements can be updated not only in cart.
window.decrementQuantity = decrementQuantity;
window.incrementQuantity = incrementQuantity;

// Timer on resize to ensure updates only trigger once resizing ends, fixing HTML update issues.
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (isCheckoutPage()) {
            updateCheckoutPage();
            updateItemsTotal();
            updateOrderTotal();
        }
    }, 100);
});


