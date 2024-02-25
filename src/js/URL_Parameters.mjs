export function updateElementsWithParams() {
    const allParams = getAllUrlParams(); 

    const elementsToUpdate = document.querySelectorAll('.product-link, .list-of-products-link');
    elementsToUpdate.forEach(link => {
        let href = new URL(link.href, window.location.origin);

        Object.keys(allParams).forEach(key => {
            if (allParams[key]) href.searchParams.set(key, allParams[key]);
        });

        link.href = href.toString();
    });
}

export function getAllUrlParams() {
    const params = new URLSearchParams(window.location.search);
    let allParams = {};
    for (let param of params.keys()) {
        allParams[param] = params.get(param);
    }
    return allParams;
}

