const signUpForm = document.getElementById("signup-form");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("emailIdInput");
const password = document.getElementById("passwordInput");
const contact = document.getElementById("contact");
const gender = document.getElementById("gender");
const city = document.getElementById("city");
const state = document.getElementById("state");
const age = document.getElementById("age");
const userType = document.getElementsByName('userType');

const firstNameError = document.getElementById("no-first-name");
const lastNameError = document.getElementById("no-last-name");
const emailError = document.getElementById("no-email");
const passwordError = document.getElementById("no-password");
const contactError = document.getElementById("no-telephone");
const genderError = document.getElementById("no-gender");
const cityError = document.getElementById("no-city");
const stateError = document.getElementById("no-state");
const ageError = document.getElementById("no-age");
const userError = document.getElementById('no-type')


if(signUpForm){
    signUpForm.addEventListener("submit", (event) => {
        var checked = false;
        for (var i = 0; i < userType.length; i++) {
            if (userType[i].checked) {
                checked = true;
                break;
            }
        }
        if(firstName.value && lastName.value && email.value && password.value &&
            contact.value && gender.value && city.value && state.value && age.value && 
            checked) {
                firstNameError.value = true;
                lastNameError.value = true;
                emailError.value = true;
                passwordError.value = true;
                contactError.value = true;
                genderError.value = true;
                cityError.value = true;
                stateError.value = true;
                ageError.value = true;
                userError.value = true;
                signUpForm.unbind().submit(); 
        }
        else{
            event.preventDefault();
            firstNameError.hidden = firstName.value;
            lastNameError.hidden = lastName.value;
            emailError.hidden = email.value;
            passwordError.hidden = password.value;
            contactError.hidden = contact.value;
            genderError.hidden = gender.value;
            cityError.hidden = city.value;
            stateError .hidden = state.value;
            ageError.hidden = age.value;
            userError.hidden = checked;
        }
    })
    email.addEventListener('input', ()=>{
        emailError.hidden=true;
    })
    password.addEventListener('input', ()=>{
        passwordError.hidden=true;
    })
    firstName.addEventListener('input', ()=>{
        firstNameError.hidden=true;
    })
    contact.addEventListener('input', ()=>{
        contactError.hidden=true;
    })
    gender.addEventListener('input', ()=>{
        genderError.hidden=true;
    })
    city.addEventListener('input', ()=>{
        cityError.hidden=true;
    })
    state.addEventListener('input', ()=>{
        stateError.hidden=true;
    })
    age.addEventListener('input', ()=>{
        ageError.hidden=true;
    })

}
else{}