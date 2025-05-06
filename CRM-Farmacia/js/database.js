/**
 * Database module for handling data storage and retrieval
 * Currently uses localStorage, but can be extended to use a real database
 */

// Database namespace
const db = {
  // Initialize database
  init: function () {
    // Check if data exists, if not, create sample data
    if (!localStorage.getItem("initialized")) {
      this.createSampleData()
      localStorage.setItem("initialized", "true")
    }
  },

  // Create sample data
  createSampleData: () => {
    // Sample users
    const users = [
      {
        id: "1",
        nome: "Administrador",
        email: "admin@pharmacrm.com",
        senha: "admin123", // In a real app, this would be hashed
        cargo: "admin",
        dataCadastro: new Date().toISOString(),
      },
      {
        id: "2",
        nome: "Gerente",
        email: "gerente@pharmacrm.com",
        senha: "gerente123",
        cargo: "gerente",
        dataCadastro: new Date().toISOString(),
      },
      {
        id: "3",
        nome: "Vendedor",
        email: "vendedor@pharmacrm.com",
        senha: "vendedor123",
        cargo: "vendedor",
        dataCadastro: new Date().toISOString(),
      },
    ]
    localStorage.setItem("users", JSON.stringify(users))

    // Sample clients
    const clientes = [
      {
        id: "1",
        nome: "João Silva",
        telefone: "(11) 98765-4321",
        email: "joao.silva@email.com",
        endereco: "Rua das Flores, 123 - São Paulo, SP",
        dataNascimento: "1985-05-15",
        sexo: "masculino",
        limiteCredito: 500,
        valorDevendo: 0,
        tipoCliente: "normal",
        dataCadastro: "2022-01-10T10:30:00",
        alergias: "Penicilina, Dipirona",
      },
      {
        id: "2",
        nome: "Maria Oliveira",
        telefone: "(11) 91234-5678",
        email: "maria.oliveira@email.com",
        endereco: "Av. Paulista, 1000 - São Paulo, SP",
        dataNascimento: "1990-10-20",
        sexo: "feminino",
        limiteCredito: 1000,
        valorDevendo: 150,
        tipoCliente: "vip",
        dataCadastro: "2021-06-15T14:20:00",
        alergias: "",
      },
      {
        id: "3",
        nome: "Carlos Santos",
        telefone: "(11) 97777-8888",
        email: "carlos.santos@email.com",
        endereco: "Rua Augusta, 500 - São Paulo, SP",
        dataNascimento: "1978-03-25",
        sexo: "masculino",
        limiteCredito: 300,
        valorDevendo: 50,
        tipoCliente: "normal",
        dataCadastro: "2022-08-05T09:15:00",
        alergias: "Ibuprofeno",
      },
      {
        id: "4",
        nome: "Ana Pereira",
        telefone: "(11) 95555-6666",
        email: "ana.pereira@email.com",
        endereco: "Rua Oscar Freire, 200 - São Paulo, SP",
        dataNascimento: "1995-07-12",
        sexo: "feminino",
        limiteCredito: 200,
        valorDevendo: 0,
        tipoCliente: "novo",
        dataCadastro: "2023-02-20T16:40:00",
        alergias: "",
      },
      {
        id: "5",
        nome: "Rafael Mendes",
        telefone: "(11) 93333-4444",
        email: "rafael.mendes@email.com",
        endereco: "Rua Haddock Lobo, 800 - São Paulo, SP",
        dataNascimento: "1982-12-03",
        sexo: "masculino",
        limiteCredito: 800,
        valorDevendo: 200,
        tipoCliente: "vip",
        dataCadastro: "2021-04-10T11:00:00",
        alergias: "Aspirina, Amoxicilina",
      },
    ]
    localStorage.setItem("clientes", JSON.stringify(clientes))

    // Sample products
    const produtos = [
      {
        id: "1",
        nome: "Dipirona 500mg",
        codigoBarras: "7891234567890",
        dataValidade: "2025-06-30",
        necessitaReceita: false,
        tipo: "Analgésico",
        grupo: "Analgésicos",
        descricao: "Analgésico e antitérmico para alívio de dores e febres.",
        preco: 5.99,
        quantidadeDisponivel: 120,
        quantidadeMinima: 20,
        quantidadeVendida: 30,
      },
      {
        id: "2",
        nome: "Amoxicilina 500mg",
        codigoBarras: "7891234567891",
        dataValidade: "2024-08-15",
        necessitaReceita: true,
        tipo: "Antibiótico",
        grupo: "Antibióticos",
        descricao: "Antibiótico para tratamento de infecções bacterianas.",
        preco: 28.5,
        quantidadeDisponivel: 45,
        quantidadeMinima: 10,
        quantidadeVendida: 15,
      },
      {
        id: "3",
        nome: "Vitamina C 1g",
        codigoBarras: "7891234567892",
        dataValidade: "2025-01-20",
        necessitaReceita: false,
        tipo: "Suplemento",
        grupo: "Vitaminas",
        descricao: "Suplemento de vitamina C para fortalecer o sistema imunológico.",
        preco: 15.9,
        quantidadeDisponivel: 80,
        quantidadeMinima: 15,
        quantidadeVendida: 25,
      },
      {
        id: "4",
        nome: "Ibuprofeno 400mg",
        codigoBarras: "7891234567893",
        dataValidade: "2024-11-10",
        necessitaReceita: false,
        tipo: "Anti-inflamatório",
        grupo: "Anti-inflamatórios",
        descricao: "Anti-inflamatório não esteroidal para alívio de dores e inflamações.",
        preco: 12.75,
        quantidadeDisponivel: 60,
        quantidadeMinima: 10,
        quantidadeVendida: 20,
      },
      {
        id: "5",
        nome: "Omeprazol 20mg",
        codigoBarras: "7891234567894",
        dataValidade: "2025-03-25",
        necessitaReceita: false,
        tipo: "Antiácido",
        grupo: "Gastrointestinais",
        descricao: "Inibidor da bomba de prótons para tratamento de problemas gástricos.",
        preco: 9.99,
        quantidadeDisponivel: 100,
        quantidadeMinima: 20,
        quantidadeVendida: 35,
      },
      {
        id: "6",
        nome: "Losartana 50mg",
        codigoBarras: "7891234567895",
        dataValidade: "2024-09-15",
        necessitaReceita: true,
        tipo: "Anti-hipertensivo",
        grupo: "Cardiovasculares",
        descricao: "Medicamento para controle da pressão arterial.",
        preco: 18.5,
        quantidadeDisponivel: 40,
        quantidadeMinima: 15,
        quantidadeVendida: 10,
      },
      {
        id: "7",
        nome: "Paracetamol 750mg",
        codigoBarras: "7891234567896",
        dataValidade: "2025-05-10",
        necessitaReceita: false,
        tipo: "Analgésico",
        grupo: "Analgésicos",
        descricao: "Analgésico e antitérmico para alívio de dores e febres.",
        preco: 6.9,
        quantidadeDisponivel: 90,
        quantidadeMinima: 20,
        quantidadeVendida: 40,
      },
      {
        id: "8",
        nome: "Multivitamínico",
        codigoBarras: "7891234567897",
        dataValidade: "2025-02-28",
        necessitaReceita: false,
        tipo: "Suplemento",
        grupo: "Vitaminas",
        descricao: "Suplemento com diversas vitaminas e minerais.",
        preco: 25.9,
        quantidadeDisponivel: 70,
        quantidadeMinima: 10,
        quantidadeVendida: 15,
      },
      {
        id: "9",
        nome: "Cefalexina 500mg",
        codigoBarras: "7891234567898",
        dataValidade: "2024-10-05",
        necessitaReceita: true,
        tipo: "Antibiótico",
        grupo: "Antibióticos",
        descricao: "Antibiótico para tratamento de infecções bacterianas.",
        preco: 32.75,
        quantidadeDisponivel: 5,
        quantidadeMinima: 10,
        quantidadeVendida: 10,
      },
      {
        id: "10",
        nome: "Loratadina 10mg",
        codigoBarras: "7891234567899",
        dataValidade: "2025-04-15",
        necessitaReceita: false,
        tipo: "Antialérgico",
        grupo: "Antialérgicos",
        descricao: "Anti-histamínico para alívio de sintomas alérgicos.",
        preco: 8.5,
        quantidadeDisponivel: 110,
        quantidadeMinima: 20,
        quantidadeVendida: 30,
      },
    ]
    localStorage.setItem("produtos", JSON.stringify(produtos))

    // Sample sales
    const vendas = [
      {
        id: "1",
        data: "2023-05-15T10:30:00",
        cliente: {
          id: "1",
          nome: "João Silva",
          telefone: "(11) 98765-4321",
        },
        itens: [
          {
            id: "1",
            nome: "Dipirona 500mg",
            preco: 5.99,
            quantidade: 2,
          },
          {
            id: "3",
            nome: "Vitamina C 1g",
            preco: 15.9,
            quantidade: 1,
          },
        ],
        subTotal: 27.88,
        desconto: 0,
        valorTotal: 27.88,
        metodoPagamento: "dinheiro",
        valorRecebido: 30,
        troco: 2.12,
        observacoes: "",
      },
      {
        id: "2",
        data: "2023-05-16T15:45:00",
        cliente: {
          id: "2",
          nome: "Maria Oliveira",
          telefone: "(11) 91234-5678",
        },
        itens: [
          {
            id: "2",
            nome: "Amoxicilina 500mg",
            preco: 28.5,
            quantidade: 1,
          },
          {
            id: "5",
            nome: "Omeprazol 20mg",
            preco: 9.99,
            quantidade: 2,
          },
        ],
        subTotal: 48.48,
        desconto: 5,
        valorTotal: 43.48,
        metodoPagamento: "credito",
        valorRecebido: 43.48,
        troco: 0,
        observacoes: "Cliente apresentou receita médica para a Amoxicilina.",
      },
    ]
    localStorage.setItem("vendas", JSON.stringify(vendas))

    // Sample cash movements
    const movimentacoes = [
      {
        id: "1",
        data: "2023-05-15T08:00:00",
        tipo: "saldo_inicial",
        valor: 500,
        descricao: "Saldo inicial do dia",
        formaPagamento: "dinheiro",
      },
      {
        id: "2",
        data: "2023-05-15T14:30:00",
        tipo: "entrada",
        valor: 100,
        descricao: "Recebimento de pagamento pendente",
        formaPagamento: "dinheiro",
      },
      {
        id: "3",
        data: "2023-05-15T16:45:00",
        tipo: "saida",
        valor: 50,
        descricao: "Pagamento de entregador",
        formaPagamento: "dinheiro",
      },
    ]
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes))

    // Pharmacy data
    const dadosFarmacia = {
      nome: "PharmaCRM",
      cnpj: "12.345.678/0001-90",
      endereco: "Rua das Farmácias, 123 - Centro",
      cidade: "São Paulo - SP",
      telefone: "(11) 3456-7890",
      email: "contato@pharmacrm.com.br",
      responsavelTecnico: "Dr. José Santos",
      crf: "CRF-SP 12345",
    }
    localStorage.setItem("dadosFarmacia", JSON.stringify(dadosFarmacia))
  },

  // Generic CRUD operations

  // Get all items from a collection
  getAll: (collection) => {
    const items = localStorage.getItem(collection)
    return items ? JSON.parse(items) : []
  },

  // Get item by ID
  getById: function (collection, id) {
    const items = this.getAll(collection)
    return items.find((item) => item.id === id) || null
  },

  // Add item to collection
  add: function (collection, item) {
    const items = this.getAll(collection)

    // Generate ID if not provided
    if (!item.id) {
      item.id = this.generateId()
    }

    items.push(item)
    localStorage.setItem(collection, JSON.stringify(items))
    return item
  },

  // Generate a unique ID
  generateId: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),

  // Update item in collection
  update: function (collection, id, updatedItem) {
    const items = this.getAll(collection)
    const index = items.findIndex((item) => item.id === id)

    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem }
      localStorage.setItem(collection, JSON.stringify(items))
      return items[index]
    }

    return null
  },

  // Delete item from collection
  delete: function (collection, id) {
    const items = this.getAll(collection)
    const filteredItems = items.filter((item) => item.id !== id)

    if (items.length !== filteredItems.length) {
      localStorage.setItem(collection, JSON.stringify(filteredItems))
      return true
    }

    return false
  },

  // Search items in collection
  search: function (collection, query, fields) {
    const items = this.getAll(collection)
    const lowercaseQuery = query.toLowerCase()

    return items.filter((item) => {
      return fields.some((field) => {
        const value = item[field]
        if (typeof value === "string") {
          return value.toLowerCase().includes(lowercaseQuery)
        }
        return false
      })
    })
  },

  // Filter items in collection
  filter: function (collection, filterFn) {
    const items = this.getAll(collection)
    return items.filter(filterFn)
  },

  // Clear all data (for testing)
  clear: () => {
    localStorage.clear()
  },

  // Export data as JSON
  exportData: function () {
    const data = {}
    const collections = ["users", "clientes", "produtos", "vendas", "movimentacoes", "dadosFarmacia"]

    collections.forEach((collection) => {
      data[collection] = this.getAll(collection)
    })

    return JSON.stringify(data)
  },

  // Import data from JSON
  importData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData)

      for (const collection in data) {
        localStorage.setItem(collection, JSON.stringify(data[collection]))
      }

      return true
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  },
}

// Initialize database
document.addEventListener("DOMContentLoaded", () => {
  db.init()
})

// Make database available globally
window.db = db
