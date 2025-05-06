export const initializeData = () => {
  // Verificar se já existem dados no localStorage
  const usuarioLogado = localStorage.getItem("usuarioLogado")
  const clientes = localStorage.getItem("clientes")
  const produtos = localStorage.getItem("produtos")
  const vendas = localStorage.getItem("vendas")
  const dadosFarmacia = localStorage.getItem("dadosFarmacia")

  // Inicializar clientes de exemplo se não existirem
  if (!clientes) {
    const clientesIniciais = [
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
    localStorage.setItem("clientes", JSON.stringify(clientesIniciais))
  }

  // Inicializar produtos de exemplo se não existirem
  if (!produtos) {
    const produtosIniciais = [
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
    localStorage.setItem("produtos", JSON.stringify(produtosIniciais))
  }

  // Inicializar vendas de exemplo se não existirem
  if (!vendas) {
    const vendasIniciais = [
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
    localStorage.setItem("vendas", JSON.stringify(vendasIniciais))
  }

  // Inicializar dados da farmácia se não existirem
  if (!dadosFarmacia) {
    const farmaciaInicial = {
      nome: "PharmaCRM",
      cnpj: "12.345.678/0001-90",
      endereco: "Rua das Farmácias, 123 - Centro",
      cidade: "São Paulo - SP",
      telefone: "(11) 3456-7890",
      email: "contato@pharmacrm.com.br",
      responsavelTecnico: "Dr. José Santos",
      crf: "CRF-SP 12345",
    }
    localStorage.setItem("dadosFarmacia", JSON.stringify(farmaciaInicial))
  }

  return true
}
