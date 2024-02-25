import { isCheckoutPage } from "./utilities.mjs";
import { sortAlphabeticallyAToZ, sortAlphabeticallyZToA, sortByPriceHighToLow, sortByPriceLowToHigh} from "./sortAndFiltering.mjs";
import { fetchAndDisplayListOfAllProducts } from "./listOfProducts.mjs";


const menuButton = document.getElementById('openMenuOverlay');
const menuCloseButton = document.getElementById('closeMenuOverlay');

const cartButton = document.getElementById('openCartOverlay');
const cartCloseButton = document.getElementById('closeCartOverlay');

const menuOverlay = document.getElementById('menuOverlay');
const cartOverlay = document.getElementById('shoppingCartOverlay');

// Hamburger menu overlay open and close

function openMenuOverlay() {
    menuOverlay.classList.add('active');
}

function closeMenuOverlay() {
    menuOverlay.classList.remove('active');
}

function closeMenuOnOutsideClick(event) {
    // Check if the overlay is active and the click target is not within the overlay
    if (menuOverlay.classList.contains('active') && !menuOverlay.contains(event.target) && event.target !== menuButton) {
        closeMenuOverlay();
    }
}

// Cart overlay open and close
export function openCartOverlay() {
    cartOverlay.classList.add('active');
}

export function closeCartOverlay() {
    cartOverlay.classList.remove('active');
}

export function closeCartOnOutsideClick(event) {
    if (cartOverlay.classList.contains('active') && !cartOverlay.contains(event.target) && event.target !==cartButton) {
        closeCartOverlay();
    }
}

// Event listeners for open and close cart and menu

export function setupEventListenersForOpenAndCloseCartandMenu() {
    // Hamburger Menu
    menuButton.addEventListener('click', function(event) {
        // Prevents the click on menu from closing overlay immediately after it opens
        event.stopPropagation();
        openMenuOverlay();
    });
    menuCloseButton.addEventListener('click', closeMenuOverlay);
    // Shopping Cart
    cartButton.addEventListener('click', function(event) {
        event.stopPropagation();
        openCartOverlay();
    });
    cartCloseButton.addEventListener('click', closeCartOverlay);

    // Delay adding event listeners so it doesnt react to the initial click
    setTimeout(() => {
        document.addEventListener('click', closeMenuOnOutsideClick);
        document.addEventListener('click', closeCartOnOutsideClick);
    }, 0);

    // Prevent clicks within the overlay from closing it
    menuOverlay.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    cartOverlay.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}

export function securityCodeOverlay() {
    if(isCheckoutPage()) {
        const whatsThisLink = document.getElementById('whatsThisCvv');
        const cvvOverlay = document.getElementById('cvvInfoOverlay');
    
        whatsThisLink.addEventListener('click', function(event) {
            event.preventDefault();
            cvvOverlay.classList.add('active');
            event.stopPropagation(); 
        });
    
        // Close button event listener
        const closeCvvInfoButton = document.getElementById('closeCvvInfo');
        if (closeCvvInfoButton) {
            closeCvvInfoButton.addEventListener('click', function() {
                cvvOverlay.classList.remove('active');
                event.stopPropagation(); 
            });
        }
    
        // Event listener for closing the overlay when clicking outside of it
        document.addEventListener('click', function(event) {
            if (cvvOverlay.classList.contains('active') && !cvvOverlay.contains(event.target)) {
                cvvOverlay.classList.remove('active');
            }
        });
    
        // Stop click events inside the overlay from affecting
        cvvOverlay.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
}

export function setupSizeChartOverlay() {
    const sizeInfoLink = document.querySelector('.sizing-info');
    const sizingOverlay = document.getElementById('sizingOverlay');

    sizeInfoLink.addEventListener('click', function(event) {
        event.preventDefault(); 
        sizingOverlay.classList.add('active'); 
    });

    const closeSizeChartButton = document.getElementById('closeSizeChart');
    if (closeSizeChartButton) {
        closeSizeChartButton.addEventListener('click', function() {
            sizingOverlay.classList.remove('active');
        });
    }

    document.addEventListener('click', function(event) {
        if (sizingOverlay.classList.contains('active') && !sizingOverlay.contains(event.target) && event.target !== sizeInfoLink) {
            sizingOverlay.classList.remove('active');
        }
    });

    sizingOverlay.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}

export function setupFilterOverlayListeners() {
    const filterOverlayButton = document.getElementById('filterButton'); 
    const filterOverlay = document.getElementById('overlayFiltersContent');
    const closeFilterOverlayButton = document.querySelector('.closeFiltersOverlay'); 

    // Filter overlay open and close
    function openFilterOverlay() {
        filterOverlay.classList.add('active');
    }

    function closeFilterOverlay() {
        filterOverlay.classList.remove('active');
    }

    filterOverlayButton.addEventListener('click', function(event) {
        event.stopPropagation();
        openFilterOverlay();
    });

    closeFilterOverlayButton.addEventListener('click', closeFilterOverlay);

    // Close overlay when clicking outside of it
    document.addEventListener('click', function(event) {
        if (!filterOverlay.contains(event.target) && event.target !== filterOverlayButton) {
            closeFilterOverlay();
        }
    });

    // Prevent clicks inside the overlay from closing it
    filterOverlay.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}

export function setupSortDropdownListeners() {
    const sortDropdownToggle = document.getElementById('sortDropdownToggle');
    const sortDropdownContent = document.getElementById('sortDropdownContent');


    function toggleSortDropdown() {
        const isOpen = sortDropdownToggle.getAttribute('aria-expanded') === 'true';
        sortDropdownToggle.setAttribute('aria-expanded', !isOpen);
        sortDropdownContent.setAttribute('aria-hidden', isOpen);

        sortDropdownContent.classList.toggle('active', !isOpen);
    }


    sortDropdownToggle.addEventListener('click', function(event) {
        event.stopPropagation(); 
        toggleSortDropdown();
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!sortDropdownContent.contains(event.target) && event.target !== sortDropdownToggle) {
            sortDropdownToggle.setAttribute('aria-expanded', 'false');
            sortDropdownContent.setAttribute('aria-hidden', 'true');
            sortDropdownContent.classList.remove('active');
        }
    });


    sortDropdownContent.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    document.getElementById('sortDropdownContent').addEventListener('click', function(event) {
        if (event.target.tagName === 'A') {
            event.preventDefault();

            let sortFunction;
            switch (event.target.textContent) {
                case 'Price: Low to High':
                    sortFunction = sortByPriceLowToHigh;
                    break;
                case 'Price: High to Low':
                    sortFunction = sortByPriceHighToLow;
                    break;
                case 'Alphabetically: A to Z':
                    sortFunction = sortAlphabeticallyAToZ;
                    break;
                case 'Alphabetically: Z to A':
                    sortFunction = sortAlphabeticallyZToA;
                    break;
            }


            fetchAndDisplayListOfAllProducts(sortFunction);
        }
    });
}