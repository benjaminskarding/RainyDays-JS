// Loading spinner

const loadingIndicator = document.getElementById('loadingIndicator');

export function showLoadingIndicator() {
    loadingIndicator.style.display = 'block';
}

export function hideLoadingIndicator() {
    loadingIndicator.style.display = 'none';
}

// Check if current page is x


export function isCheckoutPage() {
    return window.location.pathname.includes('checkout_page.html'); 
}


export function isAboutPage() {
    return window.location.pathname.includes('about_page.html'); 
}


export function isListOfProductsPage() {
    return window.location.pathname.includes('list_of_products.html'); 
}


// Helper function to capitalize the first letter of each word
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }