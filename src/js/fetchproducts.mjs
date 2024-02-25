import { showLoadingIndicator, hideLoadingIndicator } from "./utilities.mjs";

export async function fetchAllProductDetails() { 
  showLoadingIndicator();

    try {
        const response = await fetch('https://api.noroff.dev/api/v1/rainy-days');

        if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`);
    }
    const productDetails = await response.json();
    return productDetails;
    
    } catch (error) {
      console.error('Error fetching product details: ', error);
    } finally {
      hideLoadingIndicator();
    }
}

export async function fetchProductDetailsById(id) {
  showLoadingIndicator();
  try {
      const response = await fetch(`https://api.noroff.dev/api/v1/rainy-days/${id}`);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const specificProductDetails = await response.json();
      return specificProductDetails;
  } catch (error) {
      console.error('Error fetching products:', error);
  } finally {
      hideLoadingIndicator();
  }
}
