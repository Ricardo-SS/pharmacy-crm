/**
 * Authentication module for handling user login, logout, and permissions
 */

// Import the database module (assuming it's in a separate file)
import * as db from "./db.js" // Adjust the path as needed

const auth = {
  // Current user
  currentUser: null,

  // Initialize auth
  init: function () {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      this.currentUser = JSON.parse(userData)
    }
  },

  // Login user
  login: function (email, senha, cargo) {
    // Get users from database
    const users = db.getAll("users")

    // Find user with matching credentials
    const user = users.find((u) => u.email === email && u.senha === senha && u.cargo === cargo)

    if (user) {
      // Store user data (except password)
      const { senha: _, ...userData } = user
      this.currentUser = userData
      localStorage.setItem("currentUser", JSON.stringify(userData))
      return userData
    }

    return null
  },

  // Logout user
  logout: function () {
    this.currentUser = null
    localStorage.removeItem("currentUser")
  },

  // Check if user is logged in
  isLoggedIn: function () {
    return this.currentUser !== null
  },

  // Get current user
  getCurrentUser: function () {
    return this.currentUser
  },

  // Check if user has permission
  hasPermission: function (permission) {
    if (!this.isLoggedIn()) return false

    const cargo = this.currentUser.cargo

    switch (permission) {
      case "admin":
        return cargo === "admin"

      case "gerente":
        return cargo === "admin" || cargo === "gerente"

      case "vendedor":
        return cargo === "admin" || cargo === "gerente" || cargo === "vendedor"

      default:
        return false
    }
  },

  // Verify admin password (for exiting fullscreen)
  verifyAdminPassword: (password) => {
    const users = db.getAll("users")
    const adminUser = users.find((u) => u.cargo === "admin")

    if (adminUser && adminUser.senha === password) {
      return true
    }

    return false
  },

  // Register new user (only admin can register gerente, gerente can register vendedor)
  registerUser: function (userData) {
    if (!this.isLoggedIn()) return false

    const currentUserCargo = this.currentUser.cargo
    const newUserCargo = userData.cargo

    // Check permissions
    if (
      (newUserCargo === "admin" && currentUserCargo !== "admin") ||
      (newUserCargo === "gerente" && currentUserCargo !== "admin") ||
      (newUserCargo === "vendedor" && currentUserCargo !== "admin" && currentUserCargo !== "gerente")
    ) {
      return false
    }

    // Add user to database
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
    }

    db.add("users", newUser)
    return true
  },

  // Update user
  updateUser: function (userId, userData) {
    if (!this.isLoggedIn()) return false

    const currentUserCargo = this.currentUser.cargo
    const user = db.getById("users", userId)

    if (!user) return false

    // Check permissions
    if (
      (user.cargo === "admin" && currentUserCargo !== "admin") ||
      (user.cargo === "gerente" && currentUserCargo !== "admin") ||
      (user.cargo === "vendedor" && currentUserCargo !== "admin" && currentUserCargo !== "gerente")
    ) {
      return false
    }

    // Update user
    db.update("users", userId, userData)

    // Update current user if it's the same
    if (this.currentUser.id === userId) {
      const updatedUser = db.getById("users", userId)
      const { senha, ...updatedUserData } = updatedUser
      this.currentUser = updatedUserData
      localStorage.setItem("currentUser", JSON.stringify(updatedUserData))
    }

    return true
  },

  // Delete user
  deleteUser: function (userId) {
    if (!this.isLoggedIn()) return false

    const currentUserCargo = this.currentUser.cargo
    const user = db.getById("users", userId)

    if (!user) return false

    // Check permissions
    if (
      (user.cargo === "admin" && currentUserCargo !== "admin") ||
      (user.cargo === "gerente" && currentUserCargo !== "admin") ||
      (user.cargo === "vendedor" && currentUserCargo !== "admin" && currentUserCargo !== "gerente")
    ) {
      return false
    }

    // Cannot delete yourself
    if (this.currentUser.id === userId) {
      return false
    }

    // Delete user
    return db.delete("users", userId)
  },
}

// Initialize auth
document.addEventListener("DOMContentLoaded", () => {
  auth.init()
})

// Make auth available globally
window.auth = auth
