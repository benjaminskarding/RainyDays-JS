import { updateElementsWithParams, getAllUrlParams} from './URL_Parameters.mjs';
import { fetchAllProductDetails } from './fetchproducts.mjs';
import { showLoadingIndicator, hideLoadingIndicator, isListOfProductsPage, capitalizeFirstLetter} from './utilities.mjs';
import { loadCartFromLocalStorage, updateCartOverlay } from './cart.mjs';
import { setupEventListenersForOpenAndCloseCartandMenu, setupFilterOverlayListeners, setupSortDropdownListeners } from './overlays.mjs';
import { sortAlphabeticallyAToZ, sortAlphabeticallyZToA, sortByPriceHighToLow, sortByPriceLowToHigh } from './sortAndFiltering.mjs';

// Global state to track filters and sorting
const state = {
    filters: {
      gender: [],
      color: [],
      priceFrom: null,
      priceTo: null
    },
    sortFunction: null 
  };



  export async function fetchAndDisplayListOfAllProducts() {
    showLoadingIndicator();

    try {
        const products = await fetchAllProductDetails();
        updateFilterIndicators(products);

        // Start with all products, then apply filters sequentially
        let filteredProducts = products.filter(product => {
            // Check for gender
            if (state.filters.gender.length > 0 && !state.filters.gender.includes(product.gender.toLowerCase())) {
                return false;
            }
            // Check for color
            if (state.filters.color.length > 0 && !state.filters.color.includes(product.baseColor.toLowerCase())) {
                return false;
            }
            // Apply price filter
            const productPrice = product.onSale ? product.discountedPrice : product.price;
            if ((state.filters.priceFrom && productPrice < parseFloat(state.filters.priceFrom)) || 
                (state.filters.priceTo && productPrice > parseFloat(state.filters.priceTo))) {
                return false;
            }

            return true; 
        });
        
        // Apply sorting
        if (state.sortFunction) {
            if (Array.isArray(filteredProducts)) {
                filteredProducts = state.sortFunction(filteredProducts);
            } else {
                console.error('Expected filteredProducts to be an array before sorting');
            }
        }
        // Display the filtered and sorted products
        const mainGrid = document.querySelector('.main-grid');
        mainGrid.innerHTML = '';
        filteredProducts.forEach(product => {
            const productElement = createProductElement(product, getAllUrlParams().gender || 'all');
            mainGrid.appendChild(productElement);
        });

        // Update page title based on gender filter
        const currentGender = state.filters.gender.length === 1 ? capitalizeFirstLetter(state.filters.gender[0]) : 'all';
        updatePageTitle(currentGender);

        // Update the URL with selected filters
        updateURLWithFilters();
    } catch (error) {
        console.error("Error displaying products", error);
    } finally {
        hideLoadingIndicator();
    }
}

function setupInitialFiltersFromURL() {
    const params = getAllUrlParams();
    if (params.gender) {
        state.filters.gender = params.gender.split(',').map(g => g.toLowerCase());

        state.filters.gender.forEach(gender => {
            document.querySelector(`input[name="Gender"][value="${gender}"]`).checked = true;
        });
    }
    applyFilters(); 
}

export function createProductElement(product, gender) {
    showLoadingIndicator();
    const element = document.createElement('div');
    const formattedTitle = product.title.toLowerCase().replace(/\s+/g, '-');

    element.className = 'content-small-shared-attributes product';

    // Determine price display based on sale status
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

// Sort By 
function applySort(sortFunction) {
    state.sortFunction = sortFunction;
    fetchAndDisplayListOfAllProducts();
}

function applyFilters() {
    // Update state filters based on checkbox selections
    state.filters.gender = Array.from(document.querySelectorAll('input[name="Gender"]:checked')).map(checkbox => checkbox.value);
    state.filters.color = Array.from(document.querySelectorAll('input[name="Color"]:checked')).map(checkbox => checkbox.value);
    state.filters.priceFrom = document.getElementById('filter-price-from').value || null;
    state.filters.priceTo = document.getElementById('filter-price-to').value || null;

    fetchAndDisplayListOfAllProducts(); 
}

// Update filter counters
function updateFilterIndicators(products) {
    const colorCount = {};
  
    document.querySelectorAll('input[name="Color"]').forEach(input => {
      colorCount[input.value] = 0;
    });
  
    products.forEach(product => {
      if (state.filters.gender.length === 0 || state.filters.gender.includes(product.gender.toLowerCase())) {
        const baseColor = product.baseColor.toLowerCase();
        colorCount[baseColor] = (colorCount[baseColor] || 0) + 1;
      }
    });
  
    for (let color in colorCount) {
      const colorCounterId = `${color}ItemsCounter`;
      const colorCounterElement = document.getElementById(colorCounterId);
      if (colorCounterElement) {
        colorCounterElement.textContent = `(${colorCount[color]})`;
      }
    }
}

function updateURLWithFilters() {
    const url = new URL(window.location);

    if (state.filters.gender.length > 0) {
        const capitalizedGenders = state.filters.gender.map(gender => capitalizeFirstLetter(gender));
        url.searchParams.set('gender', capitalizedGenders.join(','));
    } else {
        url.searchParams.delete('gender');
    }

    if (state.filters.color.length > 0) {
        url.searchParams.set('color', state.filters.color.join(','));
    } else {
        url.searchParams.delete('color');
    }

    if (state.filters.priceFrom) {
        url.searchParams.set('priceFrom', state.filters.priceFrom);
    } else {
        url.searchParams.delete('priceFrom');
    }

    if (state.filters.priceTo) {
        url.searchParams.set('priceTo', state.filters.priceTo);
    } else {
        url.searchParams.delete('priceTo');
    }

    // Update URL without reloading
    window.history.pushState({}, '', url);
}

function updatePageTitle(gender) {
    showLoadingIndicator();
    const pageTitle1 = document.getElementById('pageTitle1');
    const pageTitle2 = document.getElementById('pageTitle2');
    if (pageTitle1 && pageTitle2) {
        let genderText = 'SHOP ALL';
        if (gender.toLowerCase() === 'male') {
            genderText = 'SHOP MENS';
        } else if (gender.toLowerCase() === 'female') {
            genderText = 'SHOP WOMENS';
        }
        pageTitle1.textContent = genderText;
        pageTitle2.textContent = genderText;
    }
    hideLoadingIndicator();
}

document.addEventListener('DOMContentLoaded', () => {
    if(isListOfProductsPage()) {
        updateElementsWithParams();
        setupInitialFiltersFromURL();
        fetchAndDisplayListOfAllProducts();
        setupEventListenersForOpenAndCloseCartandMenu();
        setupFilterOverlayListeners();
        setupSortDropdownListeners();
        loadCartFromLocalStorage();
        updateCartOverlay();
        // Sort by listeners
        document.getElementById('sortLowToHigh').addEventListener('click', () => {
            applySort(sortByPriceLowToHigh);
        });
        document.getElementById('sortHighToLow').addEventListener('click', () => {
            applySort(sortByPriceHighToLow);
        });
        document.getElementById('sortAToZ').addEventListener('click', () => {
            applySort(sortAlphabeticallyAToZ);
        });
        document.getElementById('sortZToA').addEventListener('click', () => {
            applySort(sortAlphabeticallyZToA);
        });
        // Filter checkboxes listeners
        document.querySelectorAll('input[name="Gender"], input[name="Color"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
        // Price listeners
        document.getElementById('filter-price-from').addEventListener('change', applyFilters);
        document.getElementById('filter-price-to').addEventListener('change', applyFilters);
        }
        // Only one gender checkbox can be checked at a time
        document.querySelectorAll('input[name="Gender"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                
                // Uncheck the opposite gender checkbox
                document.querySelectorAll('input[name="Gender"]').forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
                applyFilters();
            });
        }); 
})


