/**
 * UI module for handling UI interactions
 */

// Import auth module or declare it if it's a global variable
// Assuming auth is a global variable, declare it here. If it's a module, import it.
// Example:
// import auth from './auth';
const auth = window.auth // Assuming auth is available globally

const ui = {
  // Initialize UI
  init: function () {
    this.setupSidebar()
    this.setupTopbar()
    this.setupTabs()
    this.setupFullscreenExit()
  },

  // Setup sidebar
  setupSidebar: function () {
    const sidebarToggle = document.getElementById("sidebar-toggle")
    const sidebar = document.getElementById("sidebar")

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active")
      })
    }

    // Set user info in sidebar
    const user = auth.getCurrentUser()
    if (user) {
      document.getElementById("user-initial").textContent = user.nome.charAt(0)
      document.getElementById("user-name").textContent = user.nome
      document.getElementById("user-role").textContent = this.translateRole(user.cargo)
    }

    // Logout button
    const logoutButton = document.getElementById("logout-button")
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        auth.logout()
        window.location.href = "index.html"
      })
    }
  },

  // Setup topbar
  setupTopbar: () => {
    // Set current date
    const currentDateElement = document.getElementById("current-date")
    if (currentDateElement) {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      currentDateElement.textContent = new Date().toLocaleDateString("pt-BR", options)
    }

    // Notification dropdown
    const notificationBtn = document.getElementById("notification-btn")
    const notificationMenu = document.getElementById("notification-menu")

    if (notificationBtn && notificationMenu) {
      notificationBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        notificationMenu.classList.toggle("active")
      })

      // Close when clicking outside
      document.addEventListener("click", (e) => {
        if (!notificationMenu.contains(e.target) && e.target !== notificationBtn) {
          notificationMenu.classList.remove("active")
        }
      })
    }
  },

  // Setup tabs
  setupTabs: () => {
    const tabButtons = document.querySelectorAll(".tab-button")

    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab")

        // Remove active class from all buttons and panes
        document.querySelectorAll(".tab-button").forEach((btn) => {
          btn.classList.remove("active")
        })
        document.querySelectorAll(".tab-pane").forEach((pane) => {
          pane.classList.remove("active")
        })

        // Add active class to clicked button and corresponding pane
        this.classList.add("active")
        document.getElementById(`${tabId}-tab`).classList.add("active")
      })
    })
  },

  // Setup fullscreen exit
  setupFullscreenExit: () => {
    const exitModal = document.getElementById("exit-fullscreen-modal")
    const closeExitModal = document.getElementById("close-exit-modal")
    const cancelExit = document.getElementById("cancel-exit")
    const confirmExit = document.getElementById("confirm-exit")
    const adminPassword = document.getElementById("admin-password")
    const exitError = document.getElementById("exit-error")

    if (exitModal) {
      // Close modal
      const closeModal = () => {
        exitModal.classList.remove("active")
        adminPassword.value = ""
        exitError.textContent = ""
      }

      if (closeExitModal) {
        closeExitModal.addEventListener("click", closeModal)
      }

      if (cancelExit) {
        cancelExit.addEventListener("click", closeModal)
      }

      if (confirmExit) {
        confirmExit.addEventListener("click", () => {
          const password = adminPassword.value

          if (auth.verifyAdminPassword(password)) {
            // Exit fullscreen
            if (document.exitFullscreen) {
              document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen()
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen()
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen()
            }

            closeModal()

            // Remove fullscreen class from PDV
            const pdvPage = document.getElementById("pdv-page")
            if (pdvPage) {
              pdvPage.classList.remove("fullscreen-mode")
            }
          } else {
            exitError.textContent = "Senha de administrador incorreta."
          }
        })
      }
    }
  },

  // Enter fullscreen mode
  enterFullscreen: (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  },

  // Show exit fullscreen modal
  showExitFullscreenModal: () => {
    const exitModal = document.getElementById("exit-fullscreen-modal")
    if (exitModal) {
      exitModal.classList.add("active")
      document.getElementById("admin-password").focus()
    }
  },

  // Translate role to Portuguese
  translateRole: (role) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "gerente":
        return "Gerente"
      case "vendedor":
        return "Vendedor"
      default:
        return role
    }
  },

  // Create element with classes
  createElement: (tag, classes = [], attributes = {}, content = "") => {
    const element = document.createElement(tag)

    // Add classes
    if (classes.length > 0) {
      element.classList.add(...classes)
    }

    // Add attributes
    for (const key in attributes) {
      element.setAttribute(key, attributes[key])
    }

    // Add content
    if (content) {
      element.innerHTML = content
    }

    return element
  },

  // Create button with icon
  createButton: function (text, icon, classes = [], attributes = {}) {
    const button = this.createElement("button", ["btn", ...classes], attributes)

    if (icon) {
      button.innerHTML = `<i class="fas fa-${icon}"></i> ${text}`
    } else {
      button.textContent = text
    }

    return button
  },

  // Create badge
  createBadge: function (text, type = "primary") {
    return this.createElement("span", ["badge", `badge-${type}`], {}, text)
  },

  // Create alert
  createAlert: function (message, type = "info") {
    return this.createElement("div", ["alert", `alert-${type}`], {}, message)
  },

  // Create card
  createCard: function (title, content, icon = null) {
    const card = this.createElement("div", ["card"])

    // Card header
    if (title) {
      const header = this.createElement("div", ["card-header"])
      const titleElement = this.createElement("h3", ["card-title"])

      if (icon) {
        titleElement.innerHTML = `<i class="fas fa-${icon}"></i> ${title}`
      } else {
        titleElement.textContent = title
      }

      header.appendChild(titleElement)
      card.appendChild(header)
    }

    // Card content
    const cardContent = this.createElement("div", ["card-content"])

    if (typeof content === "string") {
      cardContent.innerHTML = content
    } else if (content instanceof HTMLElement) {
      cardContent.appendChild(content)
    }

    card.appendChild(cardContent)

    return card
  },
}

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
  ui.init()
})

// Make UI available globally
window.ui = ui
