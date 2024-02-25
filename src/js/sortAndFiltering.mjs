// Sort by

export function sortByPriceLowToHigh(products) {
    return products.sort((a, b) => {
        // Use discounted price if on sale
        let priceA = a.onSale ? a.discountedPrice : a.price;
        let priceB = b.onSale ? b.discountedPrice : b.price;
        return priceA - priceB;
    });
}

export function sortByPriceHighToLow(products) {
    return products.sort((a, b) => {
        let priceA = a.onSale ? a.discountedPrice : a.price;
        let priceB = b.onSale ? b.discountedPrice : b.price;
        return priceB - priceA;
    });
}

export function sortAlphabeticallyAToZ(products) {
    return products.sort((a, b) => a.title.localeCompare(b.title));
}

export function sortAlphabeticallyZToA(products) {
    return products.sort((a, b) => b.title.localeCompare(a.title));
}

