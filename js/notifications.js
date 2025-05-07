/**
 * Notifications module for handling system notifications
 */

const notifications = {
  // Initialize notifications
  init: function () {
    this.loadNotifications()
  },

  // Load notifications
  loadNotifications: function () {
    // Get notifications container
    const notificationContent = document.getElementById("notification-content")
    const notificationCount = document.getElementById("notification-count")

    if (!notificationContent || !notificationCount) return

    // Get notifications
    const notifications = this.getNotifications()

    // Update count
    const newNotifications = notifications.filter((n) => n.isNew)
    notificationCount.textContent = newNotifications.length

    // Clear container
    notificationContent.innerHTML = ""

    // Add notifications
    if (notifications.length > 0) {
      notifications.forEach((notification) => {
        const item = document.createElement("div")
        item.className = "dropdown-item"

        const content = document.createElement("div")
        content.className = "d-flex align-center gap-2"

        const indicator = document.createElement("div")
        indicator.className = "notification-indicator"
        indicator.style.width = "8px"
        indicator.style.height = "8px"
        indicator.style.borderRadius = "50%"
        indicator.style.backgroundColor = notification.isNew ? "var(--primary-color)" : "var(--gray-300)"
        indicator.style.marginTop = "6px"

        const text = document.createElement("span")
        text.textContent = notification.texto

        content.appendChild(indicator)
        content.appendChild(text)
        item.appendChild(content)

        // Mark as read on click
        item.addEventListener("click", () => {
          this.markAsRead(notification.id)
          this.loadNotifications()
        })

        notificationContent.appendChild(item)
      })
    } else {
      const emptyItem = document.createElement("div")
      emptyItem.className = "dropdown-item text-center"
      emptyItem.textContent = "Nenhuma notificação"
      notificationContent.appendChild(emptyItem)
    }
  },

  // Get notifications
  getNotifications: () => {
    // In a real app, this would come from the server
    // For now, we'll generate some based on the data

    const notifications = []

    // Check for low stock products
    // Assuming db is defined elsewhere or imported
    if (typeof db !== "undefined" && db && typeof db.getAll === "function") {
      const produtos = db.getAll("produtos")
      const produtosBaixoEstoque = produtos.filter((p) => p.quantidadeDisponivel <= p.quantidadeMinima)

      if (produtosBaixoEstoque.length > 0) {
        notifications.push({
          id: "low-stock",
          texto: `${produtosBaixoEstoque.length} produtos estão com estoque baixo`,
          isNew: true,
        })
      }
    }

    // Check for client birthdays
    if (typeof db !== "undefined" && db && typeof db.getAll === "function") {
      const clientes = db.getAll("clientes")
      const hoje = new Date()
      const mesAtual = hoje.getMonth() + 1

      const aniversariantes = clientes.filter((cliente) => {
        if (!cliente.dataNascimento) return false
        const nascimento = new Date(cliente.dataNascimento)
        return nascimento.getMonth() + 1 === mesAtual
      })

      if (aniversariantes.length > 0) {
        notifications.push({
          id: "birthdays",
          texto: `${aniversariantes.length} clientes fazem aniversário este mês`,
          isNew: true,
        })
      }
    }

    // Check for clients with pending payments
    if (typeof db !== "undefined" && db && typeof db.getAll === "function") {
      const clientes = db.getAll("clientes")
      const clientesDevendo = clientes.filter((c) => c.valorDevendo > 0)

      if (clientesDevendo.length > 0) {
        notifications.push({
          id: "pending-payments",
          texto: `${clientesDevendo.length} clientes estão com pagamentos pendentes`,
          isNew: false,
        })
      }
    }

    return notifications
  },

  // Mark notification as read
  markAsRead: function (id) {
    // In a real app, this would update the server
    // For now, we'll just update the UI
    const notifications = this.getNotifications()
    const notification = notifications.find((n) => n.id === id)

    if (notification) {
      notification.isNew = false
    }
  },

  // Add notification
  addNotification: function (text, isNew = true) {
    // In a real app, this would update the server
    // For now, we'll just update the UI
    const notifications = this.getNotifications()

    notifications.push({
      id: "notification-" + Date.now(),
      texto: text,
      isNew: isNew,
    })

    this.loadNotifications()
  },
}

// Initialize notifications
document.addEventListener("DOMContentLoaded", () => {
  notifications.init()
})

// Make notifications available globally
window.notifications = notifications
