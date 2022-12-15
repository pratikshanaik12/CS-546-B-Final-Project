const propertyForm = document.getElementById('createPropertyForm');

const address = document.getElementById('address');
const description = document.getElementById('description');
const laundry = document.getElementById('laundry');
const rent = document.getElementById('rent');
const area = document.getElementById('area');
const bed = document.getElementById('bed');
const bath = document.getElementById('bath');

const addressError = document.getElementById('no-address');
const descriptionError = document.getElementById('no-description');
const laundryError = document.getElementById('no-laundry');
const rentError = document.getElementById('no-rent');
const areaError = document.getElementById('no-area');
const bedError = document.getElementById('no-bed');
const bathError = document.getElementById('no-bath');

if(propertyForm){
    propertyForm.addEventListener("submit", (event) => {
        if(address.value && description.value && laundry.value && rent.value &&
            area.value && bed.value && bath.value) {
                addressError.value = true;
                descriptionError.value = true;
                laundryError.value = true;
                rentError.value = true;
                areaError.value = true;
                bedError.value = true;
                bathError.value = true;
                propertyForm.submit(); 
        }
        else{
            event.preventDefault();
            addressError.hidden = addressError.value;
            descriptionError.hidden = descriptionError.value;
            laundryError.hidden = laundryError.value;
            rentError.hidden = rentError.value;
            areaError.hidden = areaError.value;
            bedError.hidden = bedError.value;
            bathError.hidden = bathError.value;
        }
    })
}
