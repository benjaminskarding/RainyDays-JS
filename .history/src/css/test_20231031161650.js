document.addEventListener("DOMContentLoaded", function() {
    const addNewAddressRadio = document.getElementById("addNewAddressRadio");
    const addNewAddressForm = document.getElementById("addnewAddressForm");
  
    addNewAddressRadio.addEventListener("change", function() {
      if (this.checked) {
        addNewAddressForm.style.display = "block";
      }
    });
  });
  