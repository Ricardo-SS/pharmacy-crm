"use client"

import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  AlertTriangle,
  Check,
  Barcode,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  Clock,
  Maximize,
  Minimize,
  Lock,
  Loader2,
  Bell,
  Tag,
  Keyboard,
  AlertCircle,
} from "lucide-react"
import PdvClienteInfo from "@/components/pdv-cliente-info"
import { useRouter } from "next/navigation"

export default function PDVPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchClienteTerm, setSearchClienteTerm] = useState("")
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [filteredProdutos, setFilteredProdutos] = useState([])
  const [filteredClientes, setFilteredClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [carrinhoVenda, setCarrinhoVenda] = useState([])
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [alergiaAlertOpen, setAlergiaAlertOpen] = useState(false)
  const [produtoComAlergia, setProdutoComAlergia] = useState(null)
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false)
  const [isPagamentoDialogOpen, setIsPagamentoDialogOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [isExitLoading, setIsExitLoading] = useState(false)
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [actionLoading, setActionLoading] = useState("")
  const [medicamentoRecorrenteAlert, setMedicamentoRecorrenteAlert] = useState(null)
  const [keyboardShortcutsHelp, setKeyboardShortcutsHelp] = useState(false)
  const [cupomCode, setCupomCode] = useState("")
  const searchInputRef = useRef(null)
  const clienteInputRef = useRef(null)

  // Modificar a inicialização do estado para começar com campos vazios
  const [dadosVenda, setDadosVenda] = useState({
    subTotal: 0,
    desconto: 0,
    descontoPercentual: 0,
    total: 0,
    cupomAplicado: false,
    cupomCode: "",
    metodoPagamento: "dinheiro",
    valorRecebido: "",
    troco: 0,
    observacoes: "",
  })

  // Mapeamento de teclas para ações comuns
  const shortcuts = {
    F1: "Ajuda (este painel)",
    F2: "Buscar produto",
    F3: "Buscar cliente",
    F4: "Finalizar venda",
    F5: "Modo tela cheia",
    F8: "Limpar carrinho",
    "+": "Aumentar quantidade do produto selecionado",
    "-": "Diminuir quantidade do produto selecionado",
    Delete: "Remover produto do carrinho",
    Escape: "Fechar diálogos",
  }

  useEffect(() => {
    // Verificar se o usuário está logado
    const loggedUser = JSON.parse(localStorage.getItem("usuarioLogado") || "null")
    setUsuarioLogado(loggedUser)

    // Se for vendedor, entrar em modo tela cheia automaticamente
    if (loggedUser && loggedUser.cargo.toLowerCase() === "vendedor") {
      requestFullscreen()
    }

    // Carregar produtos e clientes
    const storedProdutos = JSON.parse(localStorage.getItem("produtos") || "[]")
    const storedClientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    setProdutos(storedProdutos)
    setClientes(storedClientes)
    setLoading(false)

    // Iniciar relógio
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Configurar manipulador de teclas
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      clearInterval(timer)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleKeyDown = (e) => {
    // Não processar atalhos se um campo de texto estiver em foco
    const activeElement = document.activeElement
    const isInputActive =
      activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable

    // Se enter for pressionado em um input de busca, fazer a busca
    if (e.key === "Enter" && isInputActive) {
      return
    }

    // Processar teclas independentemente do foco
    if (e.key === "Escape") {
      // Fechar diálogos abertos
      if (alergiaAlertOpen) setAlergiaAlertOpen(false)
      else if (isClienteDialogOpen) setIsClienteDialogOpen(false)
      else if (isPagamentoDialogOpen) setIsPagamentoDialogOpen(false)
      else if (keyboardShortcutsHelp) setKeyboardShortcutsHelp(false)
      return
    }

    // Não processar outros atalhos se um campo estiver em foco
    if (isInputActive) return

    // Manipular atalhos de teclado
    switch (e.key) {
      case "F1":
        e.preventDefault()
        setKeyboardShortcutsHelp((prev) => !prev)
        break
      case "F2":
        e.preventDefault()
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
        break
      case "F3":
        e.preventDefault()
        if (clienteInputRef.current) {
          clienteInputRef.current.focus()
        }
        break
      case "F4":
        e.preventDefault()
        if (carrinhoVenda.length > 0) {
          setIsPagamentoDialogOpen(true)
        }
        break
      case "F5":
        e.preventDefault()
        isFullscreen ? handleExitFullscreen() : requestFullscreen()
        break
      case "F8":
        e.preventDefault()
        if (carrinhoVenda.length > 0) {
          setActionLoading("limparCarrinho")
          setTimeout(() => {
            setCarrinhoVenda([])
            setActionLoading("")
            toast({
              description: "Carrinho limpo com sucesso.",
            })
          }, 500)
        }
        break
      case "+":
        e.preventDefault()
        if (carrinhoVenda.length > 0) {
          incrementarProduto(carrinhoVenda[0].id)
        }
        break
      case "-":
        e.preventDefault()
        if (carrinhoVenda.length > 0) {
          decrementarProduto(carrinhoVenda[0].id)
        }
        break
      case "Delete":
        e.preventDefault()
        if (carrinhoVenda.length > 0) {
          removerProduto(carrinhoVenda[0].id)
        }
        break
    }
  }

  const requestFullscreen = () => {
    const element = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
    setIsFullscreen(true)
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
    setIsFullscreen(false)
  }

  const handleExitFullscreen = () => {
    // Se for vendedor, pedir senha de admin
    if (usuarioLogado && usuarioLogado.cargo.toLowerCase() === "vendedor") {
      setIsExitDialogOpen(true)
    } else {
      exitFullscreen()
    }
  }

  const handleExitConfirm = () => {
    setIsExitLoading(true)

    // Verificar senha de admin
    setTimeout(() => {
      if (adminPassword === "admin") {
        exitFullscreen()
        setIsExitDialogOpen(false)
        setAdminPassword("")
      } else {
        toast({
          variant: "destructive",
          description: "Senha de administrador incorreta.",
        })
      }
      setIsExitLoading(false)
    }, 1000)
  }

  useEffect(() => {
    // Filtrar produtos pela busca
    if (searchTerm) {
      const filtered = produtos.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (produto.codigoBarras && produto.codigoBarras.includes(searchTerm)),
      )
      setFilteredProdutos(filtered)
    } else {
      setFilteredProdutos([])
    }
  }, [searchTerm, produtos])

  useEffect(() => {
    // Filtrar clientes pela busca
    if (searchClienteTerm) {
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchClienteTerm.toLowerCase()) ||
          (cliente.cpf && cliente.cpf.includes(searchClienteTerm)),
      )
      setFilteredClientes(filtered)
    } else {
      setFilteredClientes([])
    }
  }, [searchClienteTerm, clientes])

  useEffect(() => {
    // Calcular valores da venda
    const subTotal = carrinhoVenda.reduce((acc, item) => acc + item.preco * item.quantidade, 0)

    const total = subTotal - dadosVenda.desconto

    setDadosVenda((prev) => ({
      ...prev,
      subTotal,
      total,
      troco: Math.max(0, prev.valorRecebido - total),
    }))
  }, [carrinhoVenda, dadosVenda.desconto, dadosVenda.valorRecebido])

  // Verificar medicamentos recorrentes ao selecionar cliente
  useEffect(() => {
    if (
      selectedCliente &&
      selectedCliente.medicamentosRecorrentes &&
      selectedCliente.medicamentosRecorrentes.length > 0
    ) {
      // Verificar quais medicamentos precisam ser renovados
      const hoje = new Date()
      const medicamentosParaRenovar = []

      selectedCliente.medicamentosRecorrentes.forEach((med) => {
        const ultimaCompra = selectedCliente.ultimaCompraRecorrente?.[med]

        if (!ultimaCompra) {
          // Nunca comprado ainda
          medicamentosParaRenovar.push({
            nome: med,
            diasAtraso: 0,
            status: "novo",
          })
        } else {
          const dataUltimaCompra = new Date(ultimaCompra)
          const diasDesdeUltimaCompra = Math.floor((hoje - dataUltimaCompra) / (1000 * 60 * 60 * 24))

          if (diasDesdeUltimaCompra >= 25) {
            medicamentosParaRenovar.push({
              nome: med,
              diasAtraso: diasDesdeUltimaCompra - 30,
              status: diasDesdeUltimaCompra >= 30 ? "vencido" : "próximo",
            })
          }
        }
      })

      if (medicamentosParaRenovar.length > 0) {
        setMedicamentoRecorrenteAlert(medicamentosParaRenovar)
      }
    }

    // Verificar se o cliente tem cupons disponíveis
    if (selectedCliente && selectedCliente.cupons && selectedCliente.cupons.length > 0) {
      // Verificar se há cupons válidos
      const cuponsValidos = selectedCliente.cupons.filter((cupom) => {
        // Verificar se o cupom tem data de validade e se ainda é válido
        if (cupom.validade) {
          const dataValidade = new Date(cupom.validade)
          return dataValidade >= new Date()
        }
        // Se não tiver data de validade, considerar válido
        return true
      })

      if (cuponsValidos.length > 0) {
        // Aplicar o primeiro cupom válido automaticamente
        const cupomParaAplicar = cuponsValidos[0]

        toast({
          description: `Cliente possui cupom "${cupomParaAplicar.codigo}" disponível. Aplicando automaticamente.`,
        })

        aplicarCupom(cupomParaAplicar.codigo)
      }
    }
  }, [selectedCliente])

  const handleProdutoSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleClienteSearch = (e) => {
    setSearchClienteTerm(e.target.value)
    setIsClienteDialogOpen(true)
  }

  const handleSelectCliente = useCallback(
    (cliente) => {
      setActionLoading("selectCliente")

      // Simular tempo de processamento
      setTimeout(() => {
        setSelectedCliente(cliente)
        setSearchClienteTerm("")
        setIsClienteDialogOpen(false)
        setActionLoading("")

        toast({
          description: `Cliente ${cliente.nome} selecionado.`,
        })

        // Verificar se há produtos no carrinho que causam alergia
        if (cliente.alergias && carrinhoVenda.length > 0) {
          const alergias = cliente.alergias
            .toLowerCase()
            .split(",")
            .map((a) => a.trim())

          const produtosComAlergia = carrinhoVenda.filter((produto) => {
            return alergias.some(
              (alergia) =>
                produto.nome.toLowerCase().includes(alergia) ||
                (produto.grupo && produto.grupo.toLowerCase().includes(alergia)),
            )
          })

          if (produtosComAlergia.length > 0) {
            toast({
              variant: "destructive",
              title: "Alerta de Alergia",
              description: `O cliente possui alergia a ${produtosComAlergia.length} produto(s) no carrinho!`,
            })
          }
        }
      }, 500)
    },
    [carrinhoVenda, toast],
  )

  const handleRemoveCliente = () => {
    setActionLoading("removeCliente")

    // Simular tempo de processamento
    setTimeout(() => {
      setSelectedCliente(null)
      setMedicamentoRecorrenteAlert(null)
      setActionLoading("")

      toast({
        description: "Cliente removido da venda.",
      })
    }, 500)
  }

  const verificarAlergia = (produto, cliente) => {
    if (!cliente || !cliente.alergias) return false

    const alergias = cliente.alergias
      .toLowerCase()
      .split(",")
      .map((a) => a.trim())

    return alergias.some(
      (alergia) =>
        produto.nome.toLowerCase().includes(alergia) ||
        (produto.grupo && produto.grupo.toLowerCase().includes(alergia)),
    )
  }

  const adicionarProdutoCarrinho = useCallback(
    (produto) => {
      setActionLoading(`add-${produto.id}`)

      // Simular tempo de processamento
      setTimeout(() => {
        // Verificar se o produto está disponível em estoque
        if (produto.quantidadeDisponivel <= 0) {
          toast({
            variant: "destructive",
            description: "Produto indisponível em estoque.",
          })
          setActionLoading("")
          return
        }

        // Verificar se o cliente tem alergia a este medicamento
        if (selectedCliente && verificarAlergia(produto, selectedCliente)) {
          setProdutoComAlergia(produto)
          setAlergiaAlertOpen(true)
          setActionLoading("")
          return
        }

        // Verificar se o produto já está no carrinho
        const produtoNoCarrinho = carrinhoVenda.find((item) => item.id === produto.id)

        if (produtoNoCarrinho) {
          // Incrementar quantidade do produto no carrinho
          const novoCarrinho = carrinhoVenda.map((item) =>
            item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
          )
          setCarrinhoVenda(novoCarrinho)
        } else {
          // Adicionar produto ao carrinho
          setCarrinhoVenda([...carrinhoVenda, { ...produto, quantidade: 1 }])
        }

        setSearchTerm("")
        setActionLoading("")

        toast({
          description: `${produto.nome} adicionado ao carrinho.`,
        })
      }, 500)
    },
    [carrinhoVenda, selectedCliente, toast],
  )

  const adicionarComAlergia = () => {
    if (!produtoComAlergia) return

    setActionLoading(`addAlergia-${produtoComAlergia.id}`)

    // Simular tempo de processamento
    setTimeout(() => {
      // Adicionar produto mesmo com alerta de alergia
      const produtoNoCarrinho = carrinhoVenda.find((item) => item.id === produtoComAlergia.id)

      if (produtoNoCarrinho) {
        const novoCarrinho = carrinhoVenda.map((item) =>
          item.id === produtoComAlergia.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        )
        setCarrinhoVenda(novoCarrinho)
      } else {
        setCarrinhoVenda([...carrinhoVenda, { ...produtoComAlergia, quantidade: 1 }])
      }

      setAlergiaAlertOpen(false)
      setProdutoComAlergia(null)
      setActionLoading("")

      toast({
        variant: "warning",
        description: `Produto adicionado mesmo com alerta de alergia.`,
      })
    }, 500)
  }

  const incrementarProduto = useCallback(
    (produtoId) => {
      setActionLoading(`increment-${produtoId}`)

      // Simular tempo de processamento
      setTimeout(() => {
        const produto = produtos.find((p) => p.id === produtoId)

        // Verificar estoque antes de incrementar
        const itemNoCarrinho = carrinhoVenda.find((item) => item.id === produtoId)
        if (itemNoCarrinho && itemNoCarrinho.quantidade >= produto.quantidadeDisponivel) {
          toast({
            variant: "destructive",
            description: "Quantidade máxima em estoque atingida.",
          })
          setActionLoading("")
          return
        }

        const novoCarrinho = carrinhoVenda.map((item) =>
          item.id === produtoId ? { ...item, quantidade: item.quantidade + 1 } : item,
        )
        setCarrinhoVenda(novoCarrinho)
        setActionLoading("")
      }, 300)
    },
    [carrinhoVenda, produtos, toast],
  )

  const decrementarProduto = useCallback(
    (produtoId) => {
      setActionLoading(`decrement-${produtoId}`)

      // Simular tempo de processamento
      setTimeout(() => {
        const novoCarrinho = carrinhoVenda
          .map((item) => {
            if (item.id === produtoId) {
              const novaQuantidade = item.quantidade - 1
              return novaQuantidade > 0 ? { ...item, quantidade: novaQuantidade } : null
            }
            return item
          })
          .filter(Boolean)

        setCarrinhoVenda(novoCarrinho)
        setActionLoading("")
      }, 300)
    },
    [carrinhoVenda],
  )

  const removerProduto = useCallback(
    (produtoId) => {
      setActionLoading(`remove-${produtoId}`)

      // Simular tempo de processamento
      setTimeout(() => {
        const novoCarrinho = carrinhoVenda.filter((item) => item.id !== produtoId)
        setCarrinhoVenda(novoCarrinho)
        setActionLoading("")

        toast({
          description: "Produto removido do carrinho.",
        })
      }, 500)
    },
    [carrinhoVenda, toast],
  )

  const handleDescontoChange = (e) => {
    const percentual = Number.parseFloat(e.target.value) || 0
    const valorDesconto = dadosVenda.subTotal * (percentual / 100)
    setDadosVenda((prev) => ({
      ...prev,
      descontoPercentual: percentual,
      desconto: valorDesconto,
      cupomAplicado: false, // Reset cupom se o desconto for editado manualmente
      cupomCode: "",
    }))
  }

  // Substituir a função limparCampoAoClicar para limpar completamente o campo
  const limparCampoAoClicar = (e) => {
    e.target.value = ""
  }

  const aplicarCupom = (codigo) => {
    setActionLoading("cupom")

    // Simular tempo de processamento
    setTimeout(() => {
      // Buscar cupons cadastrados
      const cupons = JSON.parse(localStorage.getItem("cupons") || "[]")
      const cupomEncontrado = cupons.find((c) => c.codigo === codigo)

      if (cupomEncontrado && cupomEncontrado.quantidade > 0) {
        // Verificar se o cupom está válido
        if (cupomEncontrado.validade) {
          const dataValidade = new Date(cupomEncontrado.validade)
          if (dataValidade < new Date()) {
            toast({
              variant: "destructive",
              description: "Cupom expirado.",
            })
            setActionLoading("")
            return
          }
        }

        // Aplicar desconto conforme o tipo de cupom
        let desconto = 0
        let descontoPercentual = 0

        if (cupomEncontrado.tipo === "percentual") {
          descontoPercentual = cupomEncontrado.valor
          desconto = dadosVenda.subTotal * (descontoPercentual / 100)
        } else {
          desconto = Math.min(cupomEncontrado.valor, dadosVenda.subTotal) // Não permitir desconto maior que o subtotal
          descontoPercentual = (desconto / dadosVenda.subTotal) * 100
        }

        setDadosVenda((prev) => ({
          ...prev,
          desconto,
          descontoPercentual,
          cupomAplicado: true,
          cupomCode: codigo,
        }))

        toast({
          description: `Cupom aplicado! Desconto de ${descontoPercentual.toFixed(1)}% (R$ ${desconto.toFixed(2)})`,
        })
      } else if (codigo === "FARMACIA10") {
        // Manter o cupom padrão para compatibilidade
        const descontoPercentual = 10
        const desconto = dadosVenda.subTotal * (descontoPercentual / 100) // 10% de desconto
        setDadosVenda((prev) => ({
          ...prev,
          desconto,
          descontoPercentual,
          cupomAplicado: true,
          cupomCode: codigo,
        }))

        toast({
          description: `Cupom aplicado! Desconto de ${descontoPercentual}% (R$ ${desconto.toFixed(2)})`,
        })
      } else {
        toast({
          variant: "destructive",
          description: "Cupom inválido, expirado ou esgotado.",
        })
      }
      setActionLoading("")
      setCupomCode("")
    }, 800)
  }

  // Modificar o handleValorRecebidoChange para aceitar string vazia
  const handleValorRecebidoChange = (e) => {
    const valor = e.target.value === "" ? "" : Number.parseFloat(e.target.value) || 0
    setDadosVenda((prev) => ({
      ...prev,
      valorRecebido: valor,
      troco: valor === "" ? 0 : Math.max(0, Number(valor) - prev.total),
    }))
  }

  const handlePagamentoMetodoChange = (metodo) => {
    setDadosVenda((prev) => ({
      ...prev,
      metodoPagamento: metodo,
    }))
  }

  const handleObservacoesChange = (e) => {
    setDadosVenda((prev) => ({
      ...prev,
      observacoes: e.target.value,
    }))
  }

  const finalizarVenda = () => {
    setActionLoading("finalizarVenda")

    // Simular tempo de processamento
    setTimeout(() => {
      // Verificar se tem produtos no carrinho
      if (carrinhoVenda.length === 0) {
        toast({
          variant: "destructive",
          description: "Adicione produtos ao carrinho antes de finalizar a venda.",
        })
        setActionLoading("")
        return
      }

      // Verificar se o valor recebido é suficiente (apenas para pagamento em dinheiro)
      if (dadosVenda.metodoPagamento === "dinheiro" && dadosVenda.valorRecebido < dadosVenda.total) {
        toast({
          variant: "destructive",
          description: "Valor recebido é menor que o valor total da venda.",
        })
        setActionLoading("")
        return
      }

      // Criar a venda
      const venda = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        cliente: selectedCliente,
        itens: carrinhoVenda,
        subTotal: dadosVenda.subTotal,
        desconto: dadosVenda.desconto,
        descontoPercentual: dadosVenda.descontoPercentual,
        valorTotal: dadosVenda.total,
        metodoPagamento: dadosVenda.metodoPagamento,
        valorRecebido: dadosVenda.valorRecebido,
        troco: dadosVenda.troco,
        observacoes: dadosVenda.observacoes,
        cupomAplicado: dadosVenda.cupomAplicado,
        cupomCode: dadosVenda.cupomCode,
        vendedor: usuarioLogado ? usuarioLogado.nome : "Não identificado",
      }

      // Salvar a venda
      const vendas = JSON.parse(localStorage.getItem("vendas") || "[]")
      localStorage.setItem("vendas", JSON.stringify([...vendas, venda]))

      // Atualizar estoque
      const produtosAtualizados = [...produtos]
      carrinhoVenda.forEach((item) => {
        const index = produtosAtualizados.findIndex((p) => p.id === item.id)
        if (index !== -1) {
          produtosAtualizados[index] = {
            ...produtosAtualizados[index],
            quantidadeDisponivel: produtosAtualizados[index].quantidadeDisponivel - item.quantidade,
            quantidadeVendida: (produtosAtualizados[index].quantidadeVendida || 0) + item.quantidade,
          }
        }
      })
      localStorage.setItem("produtos", JSON.stringify(produtosAtualizados))

      // Atualizar histórico do cliente e registro de medicamentos recorrentes
      if (selectedCliente) {
        const clientesAtualizados = [...clientes]
        const index = clientesAtualizados.findIndex((c) => c.id === selectedCliente.id)
        if (index !== -1) {
          // Preparar objeto para registrar compras de medicamentos recorrentes
          const ultimaCompraRecorrente = { ...(clientesAtualizados[index].ultimaCompraRecorrente || {}) }

          // Atualizar a data da última compra para medicamentos recorrentes
          if (selectedCliente.medicamentosRecorrentes) {
            carrinhoVenda.forEach((item) => {
              if (
                selectedCliente.medicamentosRecorrentes.some((med) =>
                  item.nome.toLowerCase().includes(med.toLowerCase()),
                )
              ) {
                // Encontrou um medicamento recorrente no carrinho
                selectedCliente.medicamentosRecorrentes.forEach((med) => {
                  if (item.nome.toLowerCase().includes(med.toLowerCase())) {
                    ultimaCompraRecorrente[med] = new Date().toISOString()
                  }
                })
              }
            })
          }

          // Se um cupom do cliente foi usado, remover da lista de cupons do cliente
          if (dadosVenda.cupomAplicado && dadosVenda.cupomCode && clientesAtualizados[index].cupons) {
            clientesAtualizados[index].cupons = clientesAtualizados[index].cupons.filter(
              (cupom) => cupom.codigo !== dadosVenda.cupomCode,
            )
          }

          clientesAtualizados[index] = {
            ...clientesAtualizados[index],
            ultimaCompra: new Date().toISOString(),
            ultimaCompraRecorrente: ultimaCompraRecorrente,
            produtosComprados: [
              ...(clientesAtualizados[index].produtosComprados || []),
              ...carrinhoVenda.map((item) => item.id),
            ],
          }
          localStorage.setItem("clientes", JSON.stringify(clientesAtualizados))
        }
      }

      // Atualizar quantidade de cupons disponíveis
      if (dadosVenda.cupomAplicado && dadosVenda.cupomCode) {
        const cupons = JSON.parse(localStorage.getItem("cupons") || "[]")
        const cupomIndex = cupons.findIndex((c) => c.codigo === dadosVenda.cupomCode)

        if (cupomIndex !== -1 && cupons[cupomIndex].quantidade > 0) {
          cupons[cupomIndex].quantidade -= 1
          localStorage.setItem("cupons", JSON.stringify(cupons))
        }
      }

      // Emitir cupom e reiniciar venda
      toast({
        description: "Venda finalizada com sucesso!",
      })

      // Redirecionar para página do cupom
      router.push(`/pdv/cupom?id=${venda.id}`)

      // Limpar o carrinho e dados da venda
      setCarrinhoVenda([])
      setSelectedCliente(null)
      setMedicamentoRecorrenteAlert(null)
      setDadosVenda({
        subTotal: 0,
        desconto: 0,
        descontoPercentual: 0,
        total: 0,
        cupomAplicado: false,
        cupomCode: "",
        metodoPagamento: "dinheiro",
        valorRecebido: "",
        troco: 0,
        observacoes: "",
      })
      setActionLoading("")
    }, 1500)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const adicionarMedicamentoRecorrenteAoCarrinho = (medicamento) => {
    // Buscar produto pelo nome
    const produtoEncontrado = produtos.find((p) => p.nome.toLowerCase().includes(medicamento.toLowerCase()))

    if (produtoEncontrado) {
      adicionarProdutoCarrinho(produtoEncontrado)
    } else {
      toast({
        variant: "destructive",
        description: `Medicamento ${medicamento} não encontrado no cadastro.`,
      })
    }
  }

  // Modificar o ShortcutHelpBar para não sobrepor a sidebar
  const ShortcutHelpBar = () => {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 text-xs flex justify-center space-x-4 z-40 ml-16">
        <span className="flex items-center">
          <Keyboard className="h-3 w-3 mr-1" />
          Atalhos:
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">F1</kbd> Ajuda
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">F2</kbd> Produto
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">F3</kbd> Cliente
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">F4</kbd> Finalizar
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">F5</kbd> Tela cheia
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">+/-</kbd> Qtd
        </span>
      </div>
    )
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? "pb-12" : ""}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Ponto de Venda (PDV)
          </h1>
          <p className="text-gray-500">Registre suas vendas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{formatTime(currentTime)}</span>
            </div>
            <p className="text-xs text-gray-500">{formatDate(currentTime)}</p>
          </div>
          <Button variant="outline" size="icon" onClick={isFullscreen ? handleExitFullscreen : requestFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${isFullscreen ? "h-[calc(100vh-180px)]" : ""}`}>
        <div className={`lg:col-span-2 space-y-4 ${isFullscreen ? "overflow-y-auto pr-2" : ""}`}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Digite o nome ou código de barras do produto (F2)"
                  value={searchTerm}
                  onChange={handleProdutoSearch}
                  className="pl-10"
                  ref={searchInputRef}
                />
              </div>

              {filteredProdutos.length > 0 && (
                <div className="mt-2 border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden md:table-cell">Detalhes</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProdutos.map((produto) => {
                        const temAlergia = selectedCliente && verificarAlergia(produto, selectedCliente)

                        return (
                          <TableRow key={produto.id} className={temAlergia ? "bg-red-50" : ""}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {produto.nome}
                                {temAlergia && (
                                  <AlertCircle
                                    className="h-4 w-4 text-red-500"
                                    title="Cliente tem alergia a este produto"
                                  />
                                )}
                                {produto.necessitaReceita && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    Requer Receita
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {produto.codigoBarras && (
                                <span className="text-xs flex items-center">
                                  <Barcode className="h-3 w-3 mr-1" /> {produto.codigoBarras}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>R$ {produto.preco?.toFixed(2) || "0.00"}</TableCell>
                            <TableCell>
                              <span className={produto.quantidadeDisponivel <= 0 ? "text-red-600" : "text-green-600"}>
                                {produto.quantidadeDisponivel}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                disabled={produto.quantidadeDisponivel <= 0 || actionLoading === `add-${produto.id}`}
                                onClick={() => adicionarProdutoCarrinho(produto)}
                                className={temAlergia ? "bg-amber-500 hover:bg-amber-600" : ""}
                              >
                                {actionLoading === `add-${produto.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                                <span className="sr-only">Adicionar</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrinho
              </CardTitle>
              {carrinhoVenda.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600"
                  disabled={actionLoading === "limparCarrinho"}
                  onClick={() => {
                    setActionLoading("limparCarrinho")
                    setTimeout(() => {
                      setCarrinhoVenda([])
                      setActionLoading("")
                      toast({
                        description: "Carrinho limpo com sucesso.",
                      })
                    }, 500)
                  }}
                >
                  {actionLoading === "limparCarrinho" ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Limpar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {carrinhoVenda.length > 0 ? (
                <div
                  className={`border rounded-md overflow-hidden ${isFullscreen ? "max-h-[calc(100vh-450px)] overflow-y-auto" : ""}`}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrinhoVenda.map((item) => {
                        const temAlergia = selectedCliente && verificarAlergia(item, selectedCliente)

                        return (
                          <TableRow key={item.id} className={temAlergia ? "bg-red-50" : ""}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {item.nome}
                                {temAlergia && (
                                  <AlertCircle
                                    className="h-4 w-4 text-red-500"
                                    title="Cliente tem alergia a este produto"
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>R$ {item.preco.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={actionLoading === `decrement-${item.id}`}
                                  onClick={() => decrementarProduto(item.id)}
                                >
                                  {actionLoading === `decrement-${item.id}` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Minus className="h-3 w-3" />
                                  )}
                                </Button>
                                <span className="w-6 text-center">{item.quantidade}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={actionLoading === `increment-${item.id}`}
                                  onClick={() => incrementarProduto(item.id)}
                                >
                                  {actionLoading === `increment-${item.id}` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Plus className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>R$ {(item.preco * item.quantidade).toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-blue-600"
                                disabled={actionLoading === `remove-${item.id}`}
                                onClick={() => removerProduto(item.id)}
                              >
                                {actionLoading === `remove-${item.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-500">Carrinho vazio</h3>
                  <p className="text-gray-500 text-sm mt-1">Busque e adicione produtos ao carrinho</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className={`space-y-4 ${isFullscreen ? "overflow-y-auto pr-2 h-full" : ""}`}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCliente ? (
                <PdvClienteInfo
                  cliente={selectedCliente}
                  onRemove={handleRemoveCliente}
                  loading={actionLoading === "removeCliente"}
                />
              ) : (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar cliente por nome ou CPF (F3)"
                      value={searchClienteTerm}
                      onChange={handleClienteSearch}
                      className="pl-10"
                      ref={clienteInputRef}
                    />
                  </div>
                  <Button
                    variant="link"
                    className="px-0 mt-1 h-auto text-blue-600"
                    onClick={() => router.push("/clientes")}
                  >
                    + Cadastrar novo cliente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {medicamentoRecorrenteAlert && medicamentoRecorrenteAlert.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                  <Bell className="h-4 w-4" />
                  Medicamentos Recorrentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 mb-2">
                  Este cliente possui medicamentos de uso contínuo que precisam ser renovados:
                </p>
                <div className="space-y-2">
                  {medicamentoRecorrenteAlert.map((med, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{med.nome}</span>
                        <p className="text-xs text-amber-700">
                          {med.status === "novo"
                            ? "Primeira compra"
                            : med.status === "vencido"
                              ? `Atrasado ${med.diasAtraso} dias`
                              : "Próximo ao vencimento"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-600 text-amber-600"
                        onClick={() => adicionarMedicamentoRecorrenteAoCarrinho(med.nome)}
                      >
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Resumo da Venda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {dadosVenda.subTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Desconto (%)</span>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={dadosVenda.descontoPercentual}
                        onChange={handleDescontoChange}
                        onClick={limparCampoAoClicar}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Código do cupom"
                        value={cupomCode}
                        onChange={(e) => setCupomCode(e.target.value)}
                        onClick={limparCampoAoClicar}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                      disabled={actionLoading === "cupom" || !cupomCode}
                      onClick={() => aplicarCupom(cupomCode)}
                    >
                      {actionLoading === "cupom" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : "Aplicar"}
                    </Button>
                  </div>

                  {dadosVenda.cupomAplicado && (
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-green-600">
                        Cupom {dadosVenda.cupomCode} aplicado
                      </Badge>
                      <span className="text-sm text-green-600">
                        -{dadosVenda.descontoPercentual.toFixed(1)}% (R$ {dadosVenda.desconto.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>
                // Modificar o resumo da venda para valores maiores
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="font-bold text-xl text-blue-600">R$ {dadosVenda.total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsPagamentoDialogOpen(true)}
                  disabled={carrinhoVenda.length === 0 || actionLoading === "finalizarVenda"}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Finalizar Venda (F4)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Modal de Clientes */}
      <Dialog open={isClienteDialogOpen} onOpenChange={setIsClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            {filteredClientes.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.telefone}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            disabled={actionLoading === "selectCliente"}
                            onClick={() => handleSelectCliente(cliente)}
                          >
                            {actionLoading === "selectCliente" ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              "Selecionar"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6">
                <User className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
                <p className="text-gray-500 mt-1">Tente outra busca ou cadastre um novo cliente.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClienteDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Alerta de Alergia */}
      <Dialog open={alergiaAlertOpen} onOpenChange={setAlergiaAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerta de Alergia
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="font-medium">Atenção! O cliente {selectedCliente?.nome} possui alergia a este medicamento.</p>
            <p className="mt-2 text-gray-600">
              Produto: <strong>{produtoComAlergia?.nome}</strong>
            </p>
            <p className="mt-4 text-red-600 font-medium">Deseja continuar com a venda mesmo assim?</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAlergiaAlertOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading === `addAlergia-${produtoComAlergia?.id}`}
              onClick={adicionarComAlergia}
            >
              {actionLoading === `addAlergia-${produtoComAlergia?.id}` ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Adicionar mesmo assim"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Pagamento */}
      <Dialog open={isPagamentoDialogOpen} onOpenChange={setIsPagamentoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={dadosVenda.metodoPagamento === "dinheiro" ? "default" : "outline"}
                  onClick={() => handlePagamentoMetodoChange("dinheiro")}
                  className="justify-start"
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Dinheiro
                </Button>
                <Button
                  variant={dadosVenda.metodoPagamento === "credito" ? "default" : "outline"}
                  onClick={() => handlePagamentoMetodoChange("credito")}
                  className="justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cartão
                </Button>
                <Button
                  variant={dadosVenda.metodoPagamento === "pix" ? "default" : "outline"}
                  onClick={() => handlePagamentoMetodoChange("pix")}
                  className="justify-start"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  PIX
                </Button>
                <Button
                  variant={dadosVenda.metodoPagamento === "fiado" ? "default" : "outline"}
                  onClick={() => handlePagamentoMetodoChange("fiado")}
                  className="justify-start"
                  disabled={!selectedCliente}
                >
                  <User className="h-4 w-4 mr-2" />
                  Fiado
                </Button>
              </div>
            </div>
            {dadosVenda.metodoPagamento === "dinheiro" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Recebido (R$)</label>
                <Input
                  type="number"
                  min={dadosVenda.total}
                  step="0.01"
                  value={dadosVenda.valorRecebido}
                  onChange={handleValorRecebidoChange}
                  onClick={limparCampoAoClicar}
                />
                // Modificar a seção de troco para destacar mais
                <div className="flex justify-between text-sm pt-1">
                  <span>Troco:</span>
                  <span className="font-medium text-lg text-green-600">R$ {dadosVenda.troco.toFixed(2)}</span>
                </div>
              </div>
            )}
            {dadosVenda.metodoPagamento === "fiado" && !selectedCliente && (
              <div className="text-red-500 text-sm">Selecione um cliente para utilizar pagamento fiado.</div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                placeholder="Observações da venda"
                value={dadosVenda.observacoes}
                onChange={handleObservacoesChange}
                onClick={(e) => (e.target.value === "" ? null : e.target.select())}
                rows={2}
              />
            </div>
            // Modificar o modal de pagamento para valores maiores
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-lg">R$ {dadosVenda.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Desconto:</span>
                <span className="text-lg text-red-600">R$ {dadosVenda.desconto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-xl pt-2">
                <span>Total:</span>
                <span className="text-blue-600">R$ {dadosVenda.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPagamentoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={finalizarVenda}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                actionLoading === "finalizarVenda" ||
                (dadosVenda.metodoPagamento === "dinheiro" && dadosVenda.valorRecebido < dadosVenda.total) ||
                (dadosVenda.metodoPagamento === "fiado" && !selectedCliente)
              }
            >
              {actionLoading === "finalizarVenda" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Pagamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Saída do Modo Tela Cheia */}
      <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Autenticação Necessária
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">Digite a senha de administrador para sair do modo tela cheia:</p>
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Senha de administrador"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExitConfirm} disabled={isExitLoading}>
              {isExitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de atalhos de teclado */}
      <Dialog open={keyboardShortcutsHelp} onOpenChange={setKeyboardShortcutsHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atalhos de Teclado</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">Utilize os seguintes atalhos para agilizar seu atendimento:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(shortcuts).map(([key, description]) => (
                <div key={key} className="flex justify-between p-2 border-b">
                  <Badge variant="outline" className="font-mono">
                    {key}
                  </Badge>
                  <span className="text-sm">{description}</span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyboardShortcutsHelp(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isFullscreen && <ShortcutHelpBar />}
    </div>
  )
}
