/**
 * Dashboard module for handling dashboard functionality
 */

// Import necessary modules (assuming they are in separate files)
import { db } from "./db.js"
import { utils } from "./utils.js"

const dashboard = {
  // Initialize dashboard
  init: function () {
    this.loadStats()
    this.loadCharts()
    this.loadAlerts()
  },

  // Load dashboard statistics
  loadStats: () => {
    // Get data
    const clientes = db.getAll("clientes")
    const produtos = db.getAll("produtos")
    const vendas = db.getAll("vendas")

    // Calculate stats
    const totalClientes = clientes.length
    const totalProdutos = produtos.length

    // Filter sales from today
    const hoje = new Date().toISOString().split("T")[0]
    const vendasHoje = vendas.filter((v) => v.data.split("T")[0] === hoje)
    const receitaHoje = vendasHoje.reduce((acc, v) => acc + v.valorTotal, 0)

    // Count low stock products
    const produtosBaixoEstoque = produtos.filter((p) => p.quantidadeDisponivel < p.quantidadeMinima).length

    // Update UI
    document.getElementById("total-clientes").textContent = totalClientes
    document.getElementById("total-produtos").textContent = totalProdutos
    document.getElementById("vendas-hoje").textContent = vendasHoje.length
    document.getElementById("receita-hoje").textContent = utils.formatCurrency(receitaHoje)
    document.getElementById("total-alertas").textContent = produtosBaixoEstoque
  },

  // Load charts
  loadCharts: function () {
    this.loadSalesChart()
  },

  // Load sales chart
  loadSalesChart: () => {
    const salesChartElement = document.getElementById("sales-chart")

    if (!salesChartElement) return

    // Get sales data
    const vendas = db.getAll("vendas")

    // Group sales by day
    const salesByDay = {}
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

    // Get last 7 days
    const today = new Date()
    const last7Days = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)

      const dayName = daysOfWeek[date.getDay()]
      const dateString = date.toISOString().split("T")[0]

      last7Days.push({
        date: dateString,
        day: dayName,
      })

      salesByDay[dateString] = 0
    }

    // Count sales for each day
    vendas.forEach((venda) => {
      const date = venda.data.split("T")[0]
      if (salesByDay[date] !== undefined) {
        salesByDay[date]++
      }
    })

    // Create chart HTML
    let chartHTML = '<div class="sales-chart">'

    // Add bars
    chartHTML += '<div class="chart-bars">'

    last7Days.forEach((day) => {
      const sales = salesByDay[day.date]
      const height = sales > 0 ? (sales / 10) * 100 : 0 // Scale height (max 10 sales = 100%)

      chartHTML += `
                <div class="chart-bar-container">
                    <div class="chart-bar" style="height: ${Math.min(100, Math.max(5, height))}%"></div>
                    <div class="chart-label">${day.day}</div>
                </div>
            `
    })

    chartHTML += "</div>"

    // Add total
    const totalSales = Object.values(salesByDay).reduce((acc, val) => acc + val, 0)
    chartHTML += `<div class="chart-footer">
            <div>Última semana</div>
            <div>${totalSales} vendas</div>
        </div>`

    chartHTML += "</div>"

    // Add chart to page
    salesChartElement.innerHTML = chartHTML
  },

  // Load alerts
  loadAlerts: function () {
    this.loadLowStockAlerts()
    this.loadBirthdayAlerts()
  },

  // Load low stock alerts
  loadLowStockAlerts: () => {
    const lowStockContent = document.getElementById("low-stock-content")

    if (!lowStockContent) return

    // Get products with low stock
    const produtos = db.getAll("produtos")
    const produtosBaixoEstoque = produtos
      .filter((p) => p.quantidadeDisponivel <= p.quantidadeMinima)
      .sort((a, b) => a.quantidadeDisponivel - b.quantidadeDisponivel)
      .slice(0, 5)

    // Create HTML
    if (produtosBaixoEstoque.length > 0) {
      let html = '<div class="alert-list">'

      produtosBaixoEstoque.forEach((produto) => {
        html += `
                    <div class="alert-item">
                        <div class="alert-item-content">
                            <div class="alert-item-title">${produto.nome}</div>
                            <div class="alert-item-subtitle text-danger">
                                <i class="fas fa-exclamation-triangle"></i>
                                Restam apenas ${produto.quantidadeDisponivel} unidades
                            </div>
                        </div>
                        <span class="badge badge-danger">Repor</span>
                    </div>
                `
      })

      html += `
                <button class="btn btn-outline btn-sm w-100 mt-2" onclick="router.navigate('produtos')">
                    Ver todos os produtos
                </button>
            </div>`

      lowStockContent.innerHTML = html
    } else {
      lowStockContent.innerHTML = '<div class="empty-alert">Nenhum produto com estoque baixo</div>'
    }
  },

  // Load birthday alerts
  loadBirthdayAlerts: () => {
    const birthdayContent = document.getElementById("birthday-content")

    if (!birthdayContent) return

    // Get clients with birthdays this month
    const clientes = db.getAll("clientes")
    const mesAtual = new Date().getMonth() + 1

    const aniversariantes = clientes
      .filter((cliente) => {
        if (!cliente.dataNascimento) return false
        const nascimento = new Date(cliente.dataNascimento)
        return nascimento.getMonth() + 1 === mesAtual
      })
      .sort((a, b) => {
        const diaA = new Date(a.dataNascimento).getDate()
        const diaB = new Date(b.dataNascimento).getDate()
        return diaA - diaB
      })
      .slice(0, 5)

    // Create HTML
    if (aniversariantes.length > 0) {
      let html = '<div class="alert-list">'

      aniversariantes.forEach((cliente) => {
        const dataNascimento = new Date(cliente.dataNascimento)
        const dia = dataNascimento.getDate().toString().padStart(2, "0")
        const mes = (dataNascimento.getMonth() + 1).toString().padStart(2, "0")

        html += `
                    <div class="alert-item">
                        <div class="alert-item-content">
                            <div class="alert-item-title">${cliente.nome}</div>
                            <div class="alert-item-subtitle">
                                <i class="fas fa-calendar"></i>
                                ${dia}/${mes}
                            </div>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="dashboard.enviarParabens('${cliente.id}')">
                            <i class="fas fa-envelope"></i>
                            Parabéns
                        </button>
                    </div>
                `
      })

      html += "</div>"

      birthdayContent.innerHTML = html
    } else {
      birthdayContent.innerHTML = '<div class="empty-alert">Nenhum aniversariante este mês</div>'
    }
  },

  // Send birthday wishes
  enviarParabens: (clienteId) => {
    const cliente = db.getById("clientes", clienteId)

    if (cliente) {
      utils.showToast(`Parabéns enviado para ${cliente.nome}!`, "success")
    }
  },
}

// Add CSS for sales chart
const chartStyles = document.createElement("style")
chartStyles.textContent = `
    .sales-chart {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .chart-bars {
        flex: 1;
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding-bottom: 8px;
    }
    
    .chart-bar-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }
    
    .chart-bar {
        width: 100%;
        background-color: var(--primary-color);
        border-radius: 4px 4px 0 0;
    }
    
    .chart-label {
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-muted);
    }
    
    .chart-footer {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 16px;
    }
    
    .alert-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .alert-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .alert-item:last-child {
        border-bottom: none;
    }
    
    .alert-item-title {
        font-weight: 500;
    }
    
    .alert-item-subtitle {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 4px;
    }
    
    .alert-item-subtitle i {
        margin-right: 4px;
    }
`
document.head.appendChild(chartStyles)

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  dashboard.init()
})

// Make dashboard available globally
window.dashboard = dashboard
