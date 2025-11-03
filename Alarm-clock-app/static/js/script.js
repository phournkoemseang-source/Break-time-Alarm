// List of allowed usernames
const users = ["admin", "koemseang","teacher yon", "lita", "teacher puthy", "teacher rady"];

// Shared password for all users
const sharedPassword = "1234";

// Handle login
const form = document.getElementById("loginForm");
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Check if username is in the list and password matches
  if (users.includes(username.toLowerCase()) && password === sharedPassword) {
    // Save username for later (optional)
    localStorage.setItem("loggedUser", username);
    window.location.href = "home.html";
  } else {
    alert("Invalid username or password!");
  }
});

// Handle sign-up button
const signupBtn = document.getElementById("signupBtn");
signupBtn.addEventListener("click", () => {
  alert("Signup page coming soon!");
});

