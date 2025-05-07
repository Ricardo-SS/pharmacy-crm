/**
 * Login page script
 */

// Import the auth module (assuming it's in a separate file)
import * as auth from "./auth.js" // Adjust the path if necessary

document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  document.getElementById("current-year").textContent = new Date().getFullYear()

  // Check if already logged in
  if (auth.isLoggedIn()) {
    const userRole = auth.getCurrentUser().cargo
    if (userRole === "vendedor") {
      window.location.href = "pdv.html"
    } else {
      window.location.href = "dashboard.html"
    }
    return
  }

  // Login form
  const loginForm = document.getElementById("login-form")
  const loginButton = document.getElementById("login-button")
  const loginError = document.getElementById("login-error")

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Get form values
    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value
    const cargo = document.getElementById("cargo").value

    // Add button animation
    loginButton.classList.add("processing")

    // Disable button and show loading
    loginButton.disabled = true
    loginButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Entrando...'

    // Hide previous error
    loginError.classList.remove("active")

    // Simulate network delay
    setTimeout(() => {
      // Attempt login
      const user = auth.login(email, senha, cargo)

      if (user) {
        // Successful login
        if (user.cargo === "vendedor") {
          window.location.href = "pdv.html"
        } else {
          window.location.href = "dashboard.html"
        }
      } else {
        // Failed login
        loginError.textContent = "Email, senha ou cargo inválidos."
        loginError.classList.add("active")
        loginButton.disabled = false
        loginButton.innerHTML = "Entrar"
        loginButton.classList.remove("processing")

        // Shake animation for error
        loginForm.classList.add("shake")
        setTimeout(() => {
          loginForm.classList.remove("shake")
        }, 500)
      }
    }, 1000)
  })

  // Add shake animation style
  const style = document.createElement("style")
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    .processing {
      position: relative;
      pointer-events: none;
    }
  `
  document.head.appendChild(style)
})
