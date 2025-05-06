/**
 * Utility functions for the application
 */

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Format date
function formatDate(dateString, includeTime = false) {
  if (!dateString) return ""

  const date = new Date(dateString)
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }

  if (includeTime) {
    options.hour = "2-digit"
    options.minute = "2-digit"
  }

  return date.toLocaleDateString("pt-BR", options)
}

// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(dateString) {
  if (!dateString) return ""

  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date()
  return formatDateForInput(now)
}

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Show loading overlay
function showLoading() {
  document.getElementById("loading-overlay").classList.add("active")
}

// Hide loading overlay
function hideLoading() {
  document.getElementById("loading-overlay").classList.remove("active")
}

// Show toast notification
function showToast(message, type = "success", duration = 3000) {
  // Create toast element if it doesn't exist
  let toastContainer = document.querySelector(".toast-container")

  if (!toastContainer) {
    toastContainer = document.createElement("div")
    toastContainer.className = "toast-container"
    document.body.appendChild(toastContainer)
  }

  // Create toast
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `

  // Add to container
  toastContainer.appendChild(toast)

  // Show toast
  setTimeout(() => {
    toast.classList.add("show")
  }, 10)

  // Close button
  const closeBtn = toast.querySelector(".toast-close")
  closeBtn.addEventListener("click", () => {
    toast.classList.remove("show")
    setTimeout(() => {
      toast.remove()
    }, 300)
  })

  // Auto close
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, duration)
}

// Confirm dialog
function confirmDialog(message, confirmCallback, cancelCallback = null) {
  // Create modal if it doesn't exist
  let confirmModal = document.getElementById("confirm-modal")

  if (!confirmModal) {
    confirmModal = document.createElement("div")
    confirmModal.id = "confirm-modal"
    confirmModal.className = "modal"
    confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirmação</h3>
                    <button class="modal-close" id="close-confirm-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p id="confirm-message"></p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancel-confirm">Cancelar</button>
                    <button class="btn btn-primary" id="confirm-action">Confirmar</button>
                </div>
            </div>
        `
    document.body.appendChild(confirmModal)
  }

  // Set message
  document.getElementById("confirm-message").textContent = message

  // Show modal
  confirmModal.classList.add("active")

  // Event listeners
  const closeBtn = document.getElementById("close-confirm-modal")
  const cancelBtn = document.getElementById("cancel-confirm")
  const confirmBtn = document.getElementById("confirm-action")

  const closeModal = () => {
    confirmModal.classList.remove("active")
  }

  const handleCancel = () => {
    closeModal()
    if (cancelCallback) cancelCallback()
  }

  const handleConfirm = () => {
    closeModal()
    confirmCallback()
  }

  // Remove existing event listeners
  closeBtn.replaceWith(closeBtn.cloneNode(true))
  cancelBtn.replaceWith(cancelBtn.cloneNode(true))
  confirmBtn.replaceWith(confirmBtn.cloneNode(true))

  // Add new event listeners
  document.getElementById("close-confirm-modal").addEventListener("click", handleCancel)
  document.getElementById("cancel-confirm").addEventListener("click", handleCancel)
  document.getElementById("confirm-action").addEventListener("click", handleConfirm)
}

// Add CSS styles for toast
const toastStyles = document.createElement("style")
toastStyles.textContent = `
    .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .toast {
        background-color: var(--white);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
        padding: 1rem;
        min-width: 250px;
        max-width: 350px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .toast.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .toast-success {
        border-left: 4px solid var(--success-color);
    }
    
    .toast-success i {
        color: var(--success-color);
    }
    
    .toast-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .toast-error i {
        color: var(--danger-color);
    }
    
    .toast-warning {
        border-left: 4px solid var(--warning-color);
    }
    
    .toast-warning i {
        color: var(--warning-color);
    }
    
    .toast-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: var(--gray-500);
    }
`
document.head.appendChild(toastStyles)

// Export functions
window.utils = {
  formatCurrency,
  formatDate,
  formatDateForInput,
  getCurrentDate,
  generateId,
  showLoading,
  hideLoading,
  showToast,
  confirmDialog,
}
