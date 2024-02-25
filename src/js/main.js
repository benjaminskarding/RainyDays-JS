import { fetchAllProductDetails } from './fetchproducts.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu } from './overlays.mjs';
import { showLoadingIndicator, hideLoadingIndicator } from './utilities.mjs';
import { loadCartFromLocalStorage, updateCartOverlay } from './cart.mjs';

async function DisplayHomepageProducts() {
    showLoadingIndicator();
    
    try {
        // Fetch product data
        const products = await fetchAllProductDetails();

        // Filter products by gender and limit to first 4 items
        const femaleProducts = products.filter(product => product.gender === 'Female').slice(0, 4);
        const maleProducts = products.filter(product => product.gender === 'Male').slice(0, 4);

        // Select the DOM elements where products will be inserted
        const grid1 = document.querySelector('.nestedGrid1'); // Female products grid
        const grid2 = document.querySelector('.nestedGrid2'); // Male products grid

        // Clear existing content in grids
        grid1.innerHTML = '';
        grid2.innerHTML = '';

        // Populate grids with limited number of products
        femaleProducts.forEach(product => grid1.appendChild(createHomepageProducts(product)));
        maleProducts.forEach(product => grid2.appendChild(createHomepageProducts(product)));

    } catch (error) {
        console.error("Error fetching products:", error);
    } finally {
        hideLoadingIndicator();
    }
}

function createHomepageProducts(product) {
    const element = document.createElement('div');
    element.className = 'content-small-shared-attributes product';
    element.setAttribute('data-product-id', product.id); // Dynamically set data-product-id

    const formattedTitle = product.title.toLowerCase().replace(/\s+/g, '-');
    const priceDisplay = product.onSale ?
        `<p class="original-price">£${product.price}</p><p class="sale-price">£${product.discountedPrice}</p>` :
        `<p class="product-price">£${product.price}</p>`;

    element.innerHTML = `
    <a href="${formattedTitle}.html?id=${product.id}&gender=${product.gender}" class="image-frame product-link">
        <img src="${product.image}" alt="${product.title}" aria-label="${product.title}">
    </a>
    <div class="text-frame">
        <h4 class="product-name">${product.title}</h4>
        <p class="text-aligned-center product-description">${product.description}</p>
        ${priceDisplay}
    </div>
    `;

    return element;
}

// Newsletter signup functionality
const newsletterSignupButton = document.querySelector('#sign-up-news');
const termsCheckbox = document.querySelector('#termsCheckbox');
const emailInput = document.querySelector('#emailInp');

newsletterSignupButton.addEventListener('click', function(event) {
    event.preventDefault();

    // Check if the email is valid
    if (!emailInput.checkValidity()) {
        alert('Please enter a valid email address.');
        return; 
    }

    if (!termsCheckbox.checked) {
        alert('Please agree to the terms and conditions before signing up');
        return; 
    }

    // If both conditions are met, change the button text
    this.textContent = 'SUCCESS!';
});


document.addEventListener('DOMContentLoaded', () => {
    DisplayHomepageProducts();
    setupEventListenersForOpenAndCloseCartandMenu();
    loadCartFromLocalStorage();
    updateCartOverlay();
})


