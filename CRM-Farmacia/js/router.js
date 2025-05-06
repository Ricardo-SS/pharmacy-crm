/**
 * Router module for handling page navigation
 */

// Import necessary modules
import * as auth from "./auth.js"
import * as ui from "./ui.js"
import * as utils from "./utils.js"

const router = {
  // Current page
  currentPage: "dashboard",

  // Page modules
  modules: {
    clientes: null,
    produtos: null,
    pdv: null,
    caixa: null,
    relatorios: null,
    configuracoes: null,
  },

  // Initialize router
  init: function () {
    this.setupEventListeners()
    this.handleInitialRoute()
  },

  // Setup event listeners
  setupEventListeners: function () {
    // Menu items
    const menuItems = document.querySelectorAll(".sidebar-menu-item")

    menuItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()

        const page = item.getAttribute("data-page")
        this.navigate(page)
      })
    })

    // Handle hash changes
    window.addEventListener("hashchange", () => {
      this.handleHashChange()
    })
  },

  // Handle initial route
  handleInitialRoute: function () {
    // Check if there's a hash in the URL
    if (window.location.hash) {
      const page = window.location.hash.substring(1)
      this.navigate(page)
    } else {
      // Default to dashboard
      this.navigate("dashboard")
    }

    // Check if user is vendedor and should go to PDV in fullscreen
    const user = auth.getCurrentUser()
    if (user && user.cargo === "vendedor") {
      this.navigate("pdv")

      // Enter fullscreen mode
      const pdvPage = document.getElementById("pdv-page")
      if (pdvPage) {
        pdvPage.classList.add("fullscreen-mode")
        ui.enterFullscreen(document.documentElement)
      }
    }
  },

  // Handle hash change
  handleHashChange: function () {
    if (window.location.hash) {
      const page = window.location.hash.substring(1)
      this.navigate(page, false) // Don't update hash again
    }
  },

  // Navigate to page
  navigate: function (page, updateHash = true) {
    // Check if page exists
    const pageElement = document.getElementById(`${page}-page`)

    if (!pageElement) {
      console.error(`Page "${page}" not found`)
      return
    }

    // Update current page
    this.currentPage = page

    // Update active menu item
    document.querySelectorAll(".sidebar-menu-item").forEach((item) => {
      item.classList.remove("active")
    })

    const menuItem = document.querySelector(`.sidebar-menu-item[data-page="${page}"]`)
    if (menuItem) {
      menuItem.classList.add("active")
    }

    // Hide all pages
    document.querySelectorAll(".page").forEach((p) => {
      p.classList.remove("active")
    })

    // Show selected page
    pageElement.classList.add("active")

    // Update hash if needed
    if (updateHash) {
      window.location.hash = page
    }

    // Load page content if needed
    this.loadPageContent(page)
  },

  // Load page content
  loadPageContent: function (page) {
    // Check if page is already loaded
    if (document.querySelector(`#${page}-page .page-content-loaded`)) {
      return
    }

    // Load page content based on page name
    switch (page) {
      case "clientes":
        this.loadModule("clientes")
        break

      case "produtos":
        this.loadModule("produtos")
        break

      case "pdv":
        this.loadModule("pdv")
        break

      case "caixa":
        this.loadModule("caixa")
        break

      case "relatorios":
        this.loadModule("relatorios")
        break

      case "configuracoes":
        this.loadModule("configuracoes")
        break
    }
  },

  // Load module
  loadModule: function (moduleName) {
    // Check if module is already loaded
    if (this.modules[moduleName]) {
      return
    }

    // Show loading
    utils.showLoading()

    // Load module script
    const script = document.createElement("script")
    script.src = `js/${moduleName}.js`

    script.onload = () => {
      // Initialize module
      if (window[moduleName] && typeof window[moduleName].init === "function") {
        window[moduleName].init()
      }

      // Store module reference
      this.modules[moduleName] = window[moduleName]

      // Hide loading
      utils.hideLoading()
    }

    script.onerror = () => {
      console.error(`Failed to load module "${moduleName}"`)
      utils.hideLoading()
    }

    document.body.appendChild(script)
  },
}

// Initialize router
document.addEventListener("DOMContentLoaded", () => {
  router.init()
})

// Make router available globally
window.router = router
