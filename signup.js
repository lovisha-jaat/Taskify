
import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Get HTML elements
const signupForm = document.querySelector("form");
const emailInput = document.querySelector(".einput");
const passwordInput = document.querySelector(".pinput");
const rememberCheckbox = document.querySelector("#remember");

const googleButton = document.querySelector(".google-btn");
const githubButton = document.querySelector(".github-btn");

// Validate password
function validatePassword(password) {

    const rules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$]/.test(password)
    };

    const messages = {
        length: "At least 8 characters",
        uppercase: "One uppercase letter (A-Z)",
        lowercase: "One lowercase letter (a-z)",
        number: "One digit (0-9)",
        special: "One special character (@#$!)"
    };

    Object.keys(rules).forEach((rule) => {

        const element = document.getElementById(rule);

        if (element) {
            element.classList.toggle("valid", rules[rule]);
            element.classList.toggle("invalid", !rules[rule]);

            element.textContent =
                (rules[rule] ? "✔ " : "✖ ") + messages[rule];
        }

    });

    return Object.values(rules).every(Boolean);
}


// Validate password while typing
passwordInput.addEventListener("input", () => {
    validatePassword(passwordInput.value);
});


// Remember Me
function applyPersistence() {

    const persistence = rememberCheckbox.checked
        ? browserLocalPersistence
        : browserSessionPersistence;

    return setPersistence(auth, persistence);
}


// Display errors
function showError(error) {

    console.error(error);

    const messages = {
        "auth/email-already-in-use":
            "This email is already registered. Please log in.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/weak-password":
            "Your password is too weak.",

        "auth/popup-closed-by-user":
            "The sign-in window was closed.",

        "auth/unauthorized-domain":
            "This website domain is not authorized in Firebase.",

        "auth/operation-not-allowed":
            "This sign-in method is not enabled in Firebase."
    };

    alert(messages[error.code] || "Something went wrong. Please try again.");
}


// Email and password signup
signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validatePassword(password)) {
        alert("Please satisfy all password requirements.");
        return;
    }

    try {

        await applyPersistence();

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert("Account created successfully!");

        window.location.href = "index.html";

    } catch (error) {

        showError(error);

    }

});


// Google and GitHub signup/login
async function socialSignup(provider) {

    try {

        await applyPersistence();

        await signInWithPopup(auth, provider);

        window.location.href = "index.html";

    } catch (error) {

        showError(error);

    }

}


// Google signup
googleButton.addEventListener("click", () => {
    socialSignup(new GoogleAuthProvider());
});


// GitHub signup
githubButton.addEventListener("click", () => {
    socialSignup(new GithubAuthProvider());
});


// If the user is already signed in, go straight to the dashboard
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "index.html";
    }
});
