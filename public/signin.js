const signInForm = document.getElementById("signin-form");
const loginEmail = document.getElementById("emailIdInput");
const loginPassword = document.getElementById("passwordInput");
const loginEmailError = document.getElementById('no-email');
const loginPasswordError = document.getElementById('no-password');
const loginStudent = document.getElementById('student');
const loginOwner = document.getElementById('owner')
const loginUserError = document.getElementById('no-type')

if(signInForm) {

    signInForm.addEventListener("submit", (event) => {
        
        if (loginEmail.value && loginPassword.value && (loginStudent.checked || loginOwner.checked)) {
            loginEmailError.hidden = true;
            loginPasswordError.hidden = true;
            loginUserError.hidden = true;
            signInForm.submit();
        } else {
            event.preventDefault();
            loginEmailError.hidden = loginEmail.value;
            loginPasswordError.hidden = loginPassword.value;
            loginUserError.hidden = false;
        }
    })
}