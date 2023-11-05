// Function to toggle the visibility of the dropdown
function toggleDropdown(event) {
    event.preventDefault();
    var content = document.getElementById('filterContent');
    if (content.classList.contains('active')) {
        content.classList.remove('active');
    } else {
        content.classList.add('active');
    }
}

// Function to close the dropdown
function closeDropdown(event) {
    event.preventDefault();
    document.getElementById('filterContent').classList.remove('active');
}

// Attach event listeners
document.querySelector('.toggleDropdown').addEventListener('click', toggleDropdown);
document.querySelector('.closeDropdown').addEventListener('click', closeDropdown);
