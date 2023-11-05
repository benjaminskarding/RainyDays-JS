// Function to toggle the visibility of the dropdown
function toggleFiltersDropdown(event) {
    event.preventDefault();
    var content = document.getElementById('filtersContent');
    if (content.classList.contains('active')) {
        content.classList.remove('active');
    } else {
        content.classList.add('active');
    }
}

// Function to close the dropdown
function closeFiltersDropdown(event) {
    event.preventDefault();
    document.getElementById('filtersContent').classList.remove('active');
}

// Attach event listeners
document.querySelector('.toggleFiltersDropdown').addEventListener('click', toggleDropdown);
document.querySelector('.closeFiltersDropdown').addEventListener('click', closeDropdown);
