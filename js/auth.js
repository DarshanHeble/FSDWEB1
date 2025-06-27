// Form validation and submission handling
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  const signinForm = document.getElementById("signinForm");

  if (signinForm) {
    signinForm.addEventListener("submit", handleSignin);
  }
});

function handleSignup(e) {
  e.preventDefault();

  // Get form values
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validate form
  if (!validateSignupForm(fullName, email, password, confirmPassword)) {
    return;
  }

  // For demo purposes, store user in localStorage
  const user = {
    fullName,
    email,
    password, // In a real app, never store passwords in localStorage
  };

  localStorage.setItem(
    "users",
    JSON.stringify([...JSON.parse(localStorage.getItem("users") || "[]"), user])
  );
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Redirect to dashboard
  window.location.href = "dashboard.html";
}

function handleSignin(e) {
  e.preventDefault();

  // Get form values
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validate form
  if (!validateSigninForm(email, password)) {
    return;
  }

  // Check if user exists (demo only)
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
  } else {
    showError("email", "Invalid email or password");
  }
}

function validateSignupForm(fullName, email, password, confirmPassword) {
  let isValid = true;

  if (fullName.length < 2) {
    showError("fullName", "Name must be at least 2 characters long");
    isValid = false;
  }

  if (!validateEmail(email)) {
    showError("email", "Please enter a valid email address");
    isValid = false;
  }

  if (password.length < 6) {
    showError("password", "Password must be at least 6 characters long");
    isValid = false;
  }

  if (password !== confirmPassword) {
    showError("confirmPassword", "Passwords do not match");
    isValid = false;
  }

  return isValid;
}

function validateSigninForm(email, password) {
  let isValid = true;

  if (!validateEmail(email)) {
    showError("email", "Please enter a valid email address");
    isValid = false;
  }

  if (password.length < 6) {
    showError("password", "Password must be at least 6 characters long");
    isValid = false;
  }

  return isValid;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const formGroup = input.parentElement;

  formGroup.classList.add("error");

  let errorMessage = formGroup.querySelector(".error-message");
  if (!errorMessage) {
    errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    formGroup.appendChild(errorMessage);
  }

  errorMessage.textContent = message;
}

// Clear error when input changes
document.addEventListener("input", (e) => {
  if (e.target.tagName === "INPUT") {
    const formGroup = e.target.parentElement;
    formGroup.classList.remove("error");
    const errorMessage = formGroup.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }
});
