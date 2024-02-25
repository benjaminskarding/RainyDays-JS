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
        // Create a new cart item if it doesn't exist
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

    // Update cart counters and total price
    document.querySelectorAll('.cart-counter').forEach(counter => {
        counter.textContent = totalItems.toString();
    });

    if(cartTotalValue) {
        cartTotalValue.textContent = totalPrice.toFixed(2);
    }

    hideLoadingIndicator();
}

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


// Update Checkout page

function createCheckoutPageCartItemElement(item) {
    showLoadingIndicator();


    let discountPercentage = 0;
    let priceHTML;

    // Calculate discount
    if (item.onSale) {
        discountPercentage = ((item.price - item.discountedPrice) / item.price * 100).toFixed(0);
        priceHTML = `<div class="original-price">$${item.price.toFixed(2)}</div>
                     <div class="sale-price">$${item.discountedPrice.toFixed(2)}</div>
                     <div class="discount-percentage">${discountPercentage}% OFF</div>`;
    } else {
        priceHTML = `<div class="product-price">$${item.price.toFixed(2)}</div>`;
    }

    const itemTotalPrice = item.onSale ? item.discountedPrice : item.price;

    // Create the row for the product item
    const itemElement = document.createElement('div');
    itemElement.className = 'productRow';

    // Fill the row with product details
    itemElement.innerHTML = `
        <div class="columnOrderSummary">
            <div class="productName p3">${item.name}</div>
            <div class="productSize p2">Size: ${item.size}</div>
            <div class="productColor p2">Color: ${item.color}</div>
        </div>
        <div class="columnQuantity p2">${item.quantity}</div>
        <div class="columnPrice p2">${item.price}</div>
        <div class="columnDiscount p2">${discountPercentage}%</div>
        <div class="columnItemTotal p2">$${(item.quantity * itemTotalPrice).toFixed(2)}</div>
    `;
    hideLoadingIndicator();
    return itemElement;
    
}

export function updateCheckoutPage() {
    if (isCheckoutPage()) {
        showLoadingIndicator();
        const productsContainer = document.getElementById('productsContainer');
        productsContainer.innerHTML = ''; 
    
        if (cart.length > 0) {
            cart.forEach(item => {
                productsContainer.appendChild(createCheckoutPageCartItemElement(item));
            });
        }
      
        hideLoadingIndicator(); 
    }
    
}


window.decrementQuantity = decrementQuantity;
window.incrementQuantity = incrementQuantity;