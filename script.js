
// ============================================================
//  My ToDoList - dashboard logic
//  Data is stored in Firebase Firestore (per user).
// ============================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// ---------- HTML elements ----------
const input = document.querySelector(".input-box");
const addBtn = document.querySelector(".add-button");
const dueDateInput = document.querySelector(".due-date");
const priorityInput = document.querySelector(".priority-input");
const importantInput = document.querySelector(".important");

const todayList = document.querySelector("#present");
const upcomingList = document.querySelector("#upcoming-list");
const importantList = document.querySelector("#important");
const completedList = document.querySelector("#complete");

const todayCount = document.querySelector("#today .completed-day");
const upcomingCount = document.querySelector("#upcoming .completed-day");
const importantCount = document.querySelector("#important-tasks .completed-day");
const completedCount = document.querySelector("#completed .completed-day");

const progressRing = document.querySelector(".progress-ring");
const progressText = document.querySelector("#progress-text");
const progressLabel = document.querySelector("#progress-label");

const dateText = document.querySelector("#date-text");
const userEmail = document.querySelector("#user-email");
const userAvatar = document.querySelector("#user-avatar");
const logoutBtn = document.querySelector("#logout-btn");

// ---------- State ----------
let tasks = [];
let currentUser = null;

// ---------- Helpers ----------

// Today's date as YYYY-MM-DD (local time, so it matches the date input)
function getLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const today = getLocalDate();

// Show the current date in the right-hand card
dateText.textContent = new Date().toDateString();

// Reference to this user's document in Firestore
function userDocRef() {
    return doc(db, "users", currentUser.uid);
}

// ---------- Firestore read / write ----------

// Save the whole task list for the signed-in user
async function saveTasks() {
    if (!currentUser) return;

    try {
        await setDoc(userDocRef(), { tasks }, { merge: true });
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Could not save your tasks. Please check your connection.");
    }
}

// Load the task list for the signed-in user
async function loadTasks() {
    try {
        const snapshot = await getDoc(userDocRef());

        tasks =
            snapshot.exists() && Array.isArray(snapshot.data().tasks)
                ? snapshot.data().tasks
                : [];
    } catch (error) {
        console.error("Could not load tasks:", error);
        tasks = [];
    }

    renderTasks();
}

// ---------- Task actions ----------

// Add a new task
function addTask() {
    const name = input.value.trim();

    if (!name) {
        alert("Please enter a task.");
        input.focus();
        return;
    }

    const task = {
        id: Date.now().toString(),
        name: name,
        dueDate: dueDateInput.value || today,
        priority: priorityInput.value,
        important: importantInput.checked,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    renderTasks();

    // Reset the form
    input.value = "";
    dueDateInput.value = "";
    priorityInput.value = "Medium";
    importantInput.checked = false;
    input.focus();
}

addBtn.addEventListener("click", addTask);

// Add task when Enter is pressed
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

// Build one <li> for a task
function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item";

    // Checkbox toggles completed state
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;

        saveTasks();
        renderTasks();
    });

    // Task name
    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.name;

    if (task.completed) {
        text.classList.add("completed");
    }

    // Priority + due date (+ important star)
    const details = document.createElement("small");
    details.className = "task-details";
    details.textContent =
        `${task.important ? "★ " : ""}${task.priority} • ${task.dueDate}`;

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
        tasks = tasks.filter((item) => item.id !== task.id);

        saveTasks();
        renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(details);
    li.appendChild(deleteBtn);

    return li;
}

// Fill a <ul> with tasks (or an empty message)
function displayList(list, taskArray, emptyMessage) {
    list.innerHTML = "";

    if (taskArray.length === 0) {
        const li = document.createElement("li");
        li.textContent = emptyMessage;
        list.appendChild(li);
        return;
    }

    taskArray.forEach((task) => {
        list.appendChild(createTaskElement(task));
    });
}

// Update the circular progress ring (today's tasks only)
function updateProgress(todayTasks) {
    const total = todayTasks.length;
    const completed = todayTasks.filter((task) => task.completed).length;

    const percentage = total === 0 ? 0 : (completed / total) * 100;

    progressRing.style.setProperty("--progress", `${percentage}%`);

    progressText.textContent = `${completed}/${total}`;

    if (total === 0) {
        progressLabel.textContent = "No tasks for today yet.";
    } else if (completed === total) {
        progressLabel.textContent = "All today's tasks completed! ♥";
    } else {
        progressLabel.textContent =
            `${Math.round(percentage)}% completed. Keep going!`;
    }
}

// ---------- Rendering ----------

function renderTasks() {
    // Today: due today and not completed
    const todayTasks = tasks.filter(
        (task) => !task.completed && task.dueDate === today
    );

    // Upcoming: due after today and not completed
    const upcomingTasks = tasks.filter(
        (task) => !task.completed && task.dueDate > today
    );

    // Important: every important task (completed or not)
    const importantTasks = tasks.filter((task) => task.important);

    // Completed: every completed task
    const completedTasks = tasks.filter((task) => task.completed);

    displayList(todayList, todayTasks, "Add your first task for today.");
    displayList(upcomingList, upcomingTasks, "No upcoming tasks.");
    displayList(importantList, importantTasks, "No important tasks.");
    displayList(completedList, completedTasks, "No completed tasks yet.");

    // Section counters
    const todayAll = tasks.filter((task) => task.dueDate === today);
    const todayDone = todayAll.filter((task) => task.completed);

    todayCount.textContent = `${todayDone.length}/${todayAll.length}`;
    upcomingCount.textContent = upcomingTasks.length;
    importantCount.textContent = importantTasks.length;
    completedCount.textContent = completedTasks.length;

    // Progress uses all of today's tasks (done + not done)
    updateProgress(todayAll);
}

// ---------- Auth ----------

// Logout
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout error:", error);
        alert("Unable to log out. Please try again.");
    }
});

// Keep the dashboard in sync with the login state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;

        const email = user.email || "Logged in";
        userEmail.textContent = email;
        userAvatar.textContent = email.charAt(0).toUpperCase();

        loadTasks();
    } else {
        // Not signed in -> send to login page
        window.location.href = "login.html";
    }
});
