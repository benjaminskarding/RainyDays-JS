import { getAllUrlParams } from './URL_Parameters.mjs';
import { showLoadingIndicator, hideLoadingIndicator } from './utilities.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu, setupSizeChartOverlay } from './overlays.mjs';
import { fetchProductDetailsById, fetchAllProductDetails } from './fetchproducts.mjs';
import { updateCartOverlay, addToCart, loadCartFromLocalStorage } from './cart.mjs';

let selectedSize = null;
let productDetails = null;

async function displayMainProductDetails() {
    showLoadingIndicator();
    const productId = new URLSearchParams(window.location.search).get('id');
    if (!productId) {
        console.error('Product ID is not specified in the URL.');
        return;
    }

    try {
        productDetails = await fetchProductDetailsById(productId);
        if (productDetails) {
            document.querySelector('.product-big-img').src = productDetails.image;
            document.querySelector('.product-name').textContent = productDetails.title;
            
            const priceElement = document.getElementById('productPrice');
            if (productDetails.onSale) {
                priceElement.innerHTML = `<span class="original-price">$${productDetails.price}</span>
                                          <span class="sale-price">$${productDetails.discountedPrice}</span>`;
            } else {
                priceElement.textContent = `$${productDetails.price}`;
            }

            document.querySelector('.product-description').textContent = productDetails.description;
            // Color option html generating
            const colorOptionsContainer = document.querySelector('.color-options');
            colorOptionsContainer.innerHTML = `<button class="color-option selected" data-color="${productDetails.baseColor}">${productDetails.baseColor}</button>`;
            // Size option html generating
            const sizeOptionsContainer = document.querySelector('.size-options');
            sizeOptionsContainer.innerHTML = '';
            productDetails.sizes.forEach(size => {
                const sizeButton = document.createElement('button');
                sizeButton.textContent = size;
                sizeButton.className = 'p2 size-option';
                sizeButton.setAttribute('role', 'radio');
                sizeButton.setAttribute('aria-checked', 'false');
                sizeButton.setAttribute('aria-label', size);
                sizeButton.setAttribute('data-size', size);
                sizeOptionsContainer.appendChild(sizeButton);

                sizeButton.addEventListener('click', function() {
                    selectedSize = size;
                    document.getElementById('sizeButton').textContent = 'ADD TO CART'; 
                    document.querySelectorAll('.size-option').forEach(button => {
                        button.classList.remove('selected'); 
                    });
                    sizeButton.classList.add('selected'); 
                });
            });
            const addToCartButton = document.getElementById('sizeButton');
            addToCartButton.addEventListener('click', function() {
                addToCart(productDetails, selectedSize); 
                this.textContent = 'ADDED TO CART'; 
                this.disabled = true; 

                // Timeout to reset text and re-enable button
                setTimeout(() => {
                    this.textContent = 'SELECT A SIZE'; 
                    this.disabled = false; 
     
                    selectedSize = null; 
                    document.querySelectorAll('.size-option').forEach(button => {
                        button.classList.remove('selected');
                    });
                }, 2500); 
            });
        } else {
            console.error('No product details found.');
        }
    } catch (error) {
        console.error('Failed to fetch product details:', error);
    } finally {
        hideLoadingIndicator();
    }
}

export function setupSizeSelection() {
    showLoadingIndicator();
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', event => {
            selectedSize = event.target.getAttribute('data-size');
            document.getElementById('sizeButton').textContent = 'ADD TO CART';
        });
    });
    hideLoadingIndicator();
}

export function setupAddToCartButton() {
    showLoadingIndicator();
    const addToCartButton = document.getElementById('sizeButton');
    addToCartButton.addEventListener('click', () => {
        if (!selectedSize) {
            alert('Please select a size first!');
            return;
        }

        addToCart(productDetails, selectedSize);
    });
    hideLoadingIndicator();
}

async function displayAdditionalProducts(currentProductId) {
    showLoadingIndicator();
    const params = getAllUrlParams();
    const gender = params.gender || 'all'; 
    const allProducts = await fetchAllProductDetails();

    // Filter out the current product and select based on gender
    const additionalProducts = allProducts
        .filter(product => product.id !== currentProductId && product.gender.toLowerCase() === gender.toLowerCase())
        .slice(0, 6);

    const insertionPoint = document.querySelector('.horizontalText');

    // Append additional products after the insertion point
    additionalProducts.forEach((product, index) => {
        // Determine price display based on the onSale status
        let priceHTML = product.onSale
            ? `<p class="original-price">£${product.price.toFixed(2)}</p>
               <p class="sale-price">£${product.discountedPrice.toFixed(2)}</p>`
            : `<p class="product-price">£${product.price.toFixed(2)}</p>`;

        const productURL = `${product.title.replace(/\s+/g, '-').toLowerCase()}.html?id=${product.id}&gender=${encodeURIComponent(gender)}`;
        const productElement = document.createElement('div');
        productElement.id = `product${index + 1}`;
        productElement.className = 'content-small-shared-attributes';
        productElement.innerHTML = `
            <a href="${productURL}" class="image-frame">
                <img src="${product.image}" alt="${product.title}" aria-label="${product.title} Jacket">
            </a>
            <div class="text-frame">
                <h3>${product.title}</h3>
                <p class="p2">${product.description}</p>
                ${priceHTML}
            </div>
        `;

        // Insert the new element after the 'COMPLETE YOUR KIT' heading
        insertionPoint.insertAdjacentElement('afterend', productElement);
    });
    hideLoadingIndicator();
}


function updateBreadcrumbsForGender(gender) {
    showLoadingIndicator();
    const genderText = gender.charAt(0).toUpperCase() + gender.slice(1);

    const breadcrumbGender = document.getElementById('breadcrumb-gender');
    if (breadcrumbGender) {
        breadcrumbGender.textContent = genderText;
        breadcrumbGender.href = `list_of_products.html?gender=${gender}`;
    }

    // Continue Shopping link in cart overlay
    const continueShoppingLink = document.querySelector('.continue-shopping.list-of-products-link');
    if (continueShoppingLink) {
        continueShoppingLink.href = `list_of_products.html?gender=${gender}`;
    }
    hideLoadingIndicator();
}


document.addEventListener('DOMContentLoaded', async () => {
    const params = getAllUrlParams(); 
    updateBreadcrumbsForGender(params.gender || 'all');
    displayMainProductDetails();
    setupEventListenersForOpenAndCloseCartandMenu();
    setupAddToCartButton();
    setupSizeSelection();
    loadCartFromLocalStorage();
    updateCartOverlay();
    setupSizeChartOverlay();
    const currentProductId = new URLSearchParams(window.location.search).get('id');
    if (currentProductId) {
        await displayAdditionalProducts(currentProductId);
    }
});