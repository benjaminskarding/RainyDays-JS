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

// Update the filter indicators
function updateFilterIndicators(products) {
    const colorCount = {};
  
    document.querySelectorAll('input[name="Color"]').forEach(input => {
      colorCount[input.value] = 0;
    });
  
    products.forEach(product => {
      // Count all products using filter state
      if (state.filters.gender.length === 0 || state.filters.gender.includes(product.gender.toLowerCase())) {
        const baseColor = product.baseColor.toLowerCase();
        colorCount[baseColor] = (colorCount[baseColor] || 0) + 1;
      }
    });
  
    // Updating color counts
    for (let color in colorCount) {
      const colorCounterId = `${color}ItemsCounter`;
      const colorCounterElement = document.getElementById(colorCounterId);
      if (colorCounterElement) {
        colorCounterElement.textContent = `(${colorCount[color]})`;
      }
    }
  }
  

export async function fetchAndDisplayListOfAllProducts() {
    showLoadingIndicator();

    try {
        const products = await fetchAllProductDetails();
        updateFilterIndicators(products);

        // Filter products based on URL Params
        let filteredProducts = products.filter(product => {
            // Check for gender
            if (state.filters.gender && state.filters.gender.length > 0) {
                if (!state.filters.gender.includes(product.gender.toLowerCase())) {
                    return false;
                }
            }
            
            // Check for color
            if (state.filters.color && state.filters.color.length > 0) {
                if (!state.filters.color.includes(product.baseColor.toLowerCase())) {
                    return false;
                }
            }

            // Apply price filter
            const productPrice = product.onSale ? product.discountedPrice : product.price;
            if ((state.filters.priceFrom && productPrice < state.filters.priceFrom) || 
                (state.filters.priceTo && productPrice > state.filters.priceTo)) {
                return false;
            }

            return true;
        });

        // Apply sorting
        if (state.sortFunction) {
            filteredProducts = state.sortFunction(filteredProducts);
        }

        // Display the filtered and sorted products
        const mainGrid = document.querySelector('.main-grid');
        mainGrid.innerHTML = '';
        filteredProducts.forEach(product => {
            const productElement = createProductElement(product, getAllUrlParams().gender || 'all');
            mainGrid.appendChild(productElement);
        });

        // Update page title after the products have been filtered and displayed
        const currentGender = state.filters.gender.length === 1 ? state.filters.gender[0] : 'all';
        updatePageTitle(currentGender);
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

// Apply filters and update product display
function applyFilters() {
    // Get selected genders from checkboxes
    const selectedGenders = Array.from(document.querySelectorAll('input[name="Gender"]:checked')).map(checkbox => checkbox.value);
    
    // Update state filters
    state.filters.gender = selectedGenders;
    state.filters.color = Array.from(document.querySelectorAll('input[name="Color"]:checked')).map(checkbox => checkbox.value);
    state.filters.priceFrom = document.getElementById('filter-price-from').value || null;
    state.filters.priceTo = document.getElementById('filter-price-to').value || null;

    // Update URL with selected gender
    updateURLWithFilters(selectedGenders);
    fetchAndDisplayListOfAllProducts(); 
}

function applySort(sortFunction) {
    state.sortFunction = sortFunction;
    fetchAndDisplayListOfAllProducts();
}

// Update URL parameters based on filters
function updateURLWithFilters(selectedGenders) {
    const url = new URL(window.location);
    // Update gender parameter in the URL
    if (selectedGenders.length > 0) {
      // Capitalize the first letter of each gender
      const capitalizedGenders = selectedGenders.map(gender => capitalizeFirstLetter(gender));
      url.searchParams.set('gender', capitalizedGenders.join(','));
    } else {
      url.searchParams.delete('gender');
    }
  
    // Update the URL without reloading the page
    window.history.pushState({}, '', url);
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
        // Event listener for filter checkboxes
        document.querySelectorAll('input[name="Gender"], input[name="Color"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
        // Event listener for price 
        document.getElementById('filter-price-from').addEventListener('change', applyFilters);
        document.getElementById('filter-price-to').addEventListener('change', applyFilters);
        }
        // Ensure that only one gender checkbox can be checked at a time
        document.querySelectorAll('input[name="Gender"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                
                // Uncheck other gender checkbox
                document.querySelectorAll('input[name="Gender"]').forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
        
                applyFilters();
            });
        }); 
})


