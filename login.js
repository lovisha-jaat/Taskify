
import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Get HTML elements
const loginForm = document.querySelector("form");
const emailInput = document.querySelector(".einput");
const passwordInput = document.querySelector(".pinput");
const rememberCheckbox = document.querySelector("#remember");

const googleButton = document.querySelector(".google-btn");
const githubButton = document.querySelector(".github-btn");
const forgotPassword = document.querySelector(".forget p");


// Remember Me
function applyPersistence() {

    const persistence = rememberCheckbox.checked
        ? browserLocalPersistence
        : browserSessionPersistence;

    return setPersistence(auth, persistence);
}


// Show errors
function showError(error) {

    console.error(error);

    const messages = {
        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/user-disabled":
            "This account has been disabled.",

        "auth/popup-closed-by-user":
            "The sign-in window was closed.",

        "auth/unauthorized-domain":
            "This website domain is not authorized in Firebase.",

        "auth/operation-not-allowed":
            "This sign-in method is not enabled in Firebase."
    };

    alert(messages[error.code] || "Something went wrong. Please try again.");
}


// Email and password login
loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {

        await applyPersistence();

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert("Login successful!");

        window.location.href = "index.html";

    } catch (error) {

        showError(error);

    }

});


// Google and GitHub login
async function socialLogin(provider) {

    try {

        await applyPersistence();

        await signInWithPopup(auth, provider);

        window.location.href = "index.html";

    } catch (error) {

        showError(error);

    }

}


// Google login
googleButton.addEventListener("click", () => {
    socialLogin(new GoogleAuthProvider());
});


// GitHub login
githubButton.addEventListener("click", () => {
    socialLogin(new GithubAuthProvider());
});


// Forgot password
forgotPassword.addEventListener("click", async () => {

    const email = emailInput.value.trim();

    if (!email) {
        alert("Please enter your email address first.");
        emailInput.focus();
        return;
    }

    try {

        await sendPasswordResetEmail(auth, email);

        alert("Password reset email sent. Please check your inbox.");

    } catch (error) {

        showError(error);

    }

});


// If the user is already signed in, go straight to the dashboard
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "index.html";
    }
});
