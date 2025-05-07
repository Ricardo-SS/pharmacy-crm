/**
 * Main application script
 */

// Declare variables for modules
const auth = window.auth // Assuming auth is exposed globally
const ui = window.ui // Assuming ui is exposed globally
const notifications = window.notifications // Assuming notifications is exposed globally
const dashboard = window.dashboard // Assuming dashboard is exposed globally
const router = window.router // Assuming router is exposed globally

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  if (!auth.isLoggedIn()) {
    window.location.href = "index.html"
    return
  }

  // Initialize components
  ui.init()
  notifications.init()
  dashboard.init()
  router.init()

  // Handle fullscreen change
  document.addEventListener("fullscreenchange", handleFullscreenChange)
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
  document.addEventListener("mozfullscreenchange", handleFullscreenChange)
  document.addEventListener("MSFullscreenChange", handleFullscreenChange)

  function handleFullscreenChange() {
    const isFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement

    // If exited fullscreen and user is vendedor, show exit modal
    const user = auth.getCurrentUser()
    const pdvPage = document.getElementById("pdv-page")

    if (
      !isFullscreen &&
      user &&
      user.cargo === "vendedor" &&
      pdvPage &&
      pdvPage.classList.contains("fullscreen-mode")
    ) {
      // Re-enter fullscreen after a short delay
      setTimeout(() => {
        ui.enterFullscreen(document.documentElement)
      }, 100)

      // Show exit modal
      ui.showExitFullscreenModal()
    }
  }
})
