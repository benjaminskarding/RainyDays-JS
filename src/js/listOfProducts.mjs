import { updateElementsWithParams, getAllUrlParams} from './URL_Parameters.mjs';
import { fetchAllProductDetails } from './fetchproducts.mjs';
import { showLoadingIndicator, hideLoadingIndicator, isListOfProductsPage} from './utilities.mjs';
import { loadCartFromLocalStorage, updateCartOverlay } from './cart.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu, setupFilterOverlayListeners, setupSortDropdownListeners } from './overlays.mjs';



function updatePageTitle(gender) {
    showLoadingIndicator();
    const pageTitle1 = document.getElementById('pageTitle1');
    const pageTitle2 = document.getElementById('pageTitle2');
        if (pageTitle1 && pageTitle2) {
            const genderText = gender === 'Female' ? 'WOMENS' : 'MENS';
            pageTitle1.textContent = `SHOP ${genderText}`;
            pageTitle2.textContent = `SHOP ${genderText}`;
        }
    hideLoadingIndicator();
}

export async function fetchAndDisplayListOfAllProducts(sortFunction = null) {
    showLoadingIndicator();

    try {
        const products = await fetchAllProductDetails();
        const params = getAllUrlParams();

        // Filter products based on URL Params
        let filteredProducts = products.filter(product => {
            return (params.gender === 'all' || product.gender === params.gender)
        })

        // Apply sorting
        if (sortFunction && typeof sortFunction === 'function') {
            filteredProducts = sortFunction(filteredProducts);
        }

        const mainGrid = document.querySelector('.main-grid');
        mainGrid.innerHTML = '';

        // Generate HTML for filtered products 
        filteredProducts.forEach(product => {
            const productElement = createProductElement(product, params.gender || 'all');
            mainGrid.appendChild(productElement);
        });

    } catch (error) {
        console.error("Error displaying products", error);
    } finally {
        hideLoadingIndicator();
    }
}

export function createProductElement(product, gender) {
    showLoadingIndicator();
    const element = document.createElement('div');
    const formattedTitle = product.title.toLowerCase().replace(/\s+/g, '-');

    element.className = 'content-small-shared-attributes product';

    // Determine price display based on the onSale status
    let priceHTML;
    if (product.onSale) {
        priceHTML = `
            <p class="original-price">$${product.price}</p>
            <p class="sale-price">$${product.discountedPrice}</p>
        `;
    } else {
        priceHTML = `<p class="product-price">$${product.price}</p>`;
    }

    element.innerHTML = `
    <a href="${formattedTitle}.html?id=${product.id}&gender=${gender}" class="image-frame product-link">
        <img src="${product.image}" alt="${product.title}" aria-label="${product.title}">
    </a>
    <div class="text-frame">
        <h4 class="product-name">${product.title}</h4>
        <p class="text-aligned-center product-description">${product.description}</p>
        ${priceHTML}
    </div>
    `;
    hideLoadingIndicator();
    return element;
    
}


document.addEventListener('DOMContentLoaded', () => {
    if(isListOfProductsPage()) {
        const params = getAllUrlParams(); 
        updateElementsWithParams();
        updatePageTitle(params.gender || 'all');
        fetchAndDisplayListOfAllProducts();
        setupEventListenersForOpenAndCloseCartandMenu();
        setupFilterOverlayListeners();
        setupSortDropdownListeners();
        loadCartFromLocalStorage();
        updateCartOverlay();
    }
})


