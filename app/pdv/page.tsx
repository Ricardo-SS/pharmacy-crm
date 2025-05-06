"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect } from "react"
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

  const [dadosVenda, setDadosVenda] = useState({
    subTotal: 0,
    desconto: 0,
    total: 0,
    cupomAplicado: false,
    metodoPagamento: "dinheiro",
    valorRecebido: 0,
    troco: 0,
    observacoes: "",
  })

  useEffect(() => {
    // Carregar produtos e clientes
    const storedProdutos = JSON.parse(localStorage.getItem("produtos") || "[]")
    const storedClientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    setProdutos(storedProdutos)
    setClientes(storedClientes)
    setLoading(false)
  }, [])

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

  const handleProdutoSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleClienteSearch = (e) => {
    setSearchClienteTerm(e.target.value)
    setIsClienteDialogOpen(true)
  }

  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente)
    setSearchClienteTerm("")
    setIsClienteDialogOpen(false)
  }

  const handleRemoveCliente = () => {
    setSelectedCliente(null)
  }

  const adicionarProdutoCarrinho = (produto) => {
    // Verificar se o produto está disponível em estoque
    if (produto.quantidadeDisponivel <= 0) {
      toast({
        variant: "destructive",
        description: "Produto indisponível em estoque.",
      })
      return
    }

    // Verificar se o cliente tem alergia a este medicamento
    if (selectedCliente && selectedCliente.alergias) {
      const alergias = selectedCliente.alergias.toLowerCase()
      if (
        (produto.nome && alergias.includes(produto.nome.toLowerCase())) ||
        (produto.grupo && alergias.includes(produto.grupo.toLowerCase()))
      ) {
        setProdutoComAlergia(produto)
        setAlergiaAlertOpen(true)
        return
      }
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
  }

  const adicionarComAlergia = () => {
    if (!produtoComAlergia) return

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
  }

  const incrementarProduto = (produtoId) => {
    const produto = produtos.find((p) => p.id === produtoId)

    // Verificar estoque antes de incrementar
    const itemNoCarrinho = carrinhoVenda.find((item) => item.id === produtoId)
    if (itemNoCarrinho && itemNoCarrinho.quantidade >= produto.quantidadeDisponivel) {
      toast({
        variant: "destructive",
        description: "Quantidade máxima em estoque atingida.",
      })
      return
    }

    const novoCarrinho = carrinhoVenda.map((item) =>
      item.id === produtoId ? { ...item, quantidade: item.quantidade + 1 } : item,
    )
    setCarrinhoVenda(novoCarrinho)
  }

  const decrementarProduto = (produtoId) => {
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
  }

  const removerProduto = (produtoId) => {
    const novoCarrinho = carrinhoVenda.filter((item) => item.id !== produtoId)
    setCarrinhoVenda(novoCarrinho)
  }

  const aplicarCupom = (codigo) => {
    // Simular aplicação de cupom de desconto
    if (codigo === "FARMACIA10") {
      const desconto = dadosVenda.subTotal * 0.1 // 10% de desconto
      setDadosVenda((prev) => ({
        ...prev,
        desconto,
        cupomAplicado: true,
      }))

      toast({
        description: `Cupom aplicado! Desconto de R$ ${desconto.toFixed(2)}`,
      })
    } else {
      toast({
        variant: "destructive",
        description: "Cupom inválido ou expirado.",
      })
    }
  }

  const handleDescontoChange = (e) => {
    const valor = Number.parseFloat(e.target.value) || 0
    setDadosVenda((prev) => ({
      ...prev,
      desconto: valor,
      cupomAplicado: false, // Reset cupom se o desconto for editado manualmente
    }))
  }

  const handleValorRecebidoChange = (e) => {
    const valor = Number.parseFloat(e.target.value) || 0
    setDadosVenda((prev) => ({
      ...prev,
      valorRecebido: valor,
      troco: Math.max(0, valor - prev.total),
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
    // Verificar se tem produtos no carrinho
    if (carrinhoVenda.length === 0) {
      toast({
        variant: "destructive",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
      })
      return
    }

    // Verificar se o valor recebido é suficiente (apenas para pagamento em dinheiro)
    if (dadosVenda.metodoPagamento === "dinheiro" && dadosVenda.valorRecebido < dadosVenda.total) {
      toast({
        variant: "destructive",
        description: "Valor recebido é menor que o valor total da venda.",
      })
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
      valorTotal: dadosVenda.total,
      metodoPagamento: dadosVenda.metodoPagamento,
      valorRecebido: dadosVenda.valorRecebido,
      troco: dadosVenda.troco,
      observacoes: dadosVenda.observacoes,
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

    // Atualizar histórico do cliente
    if (selectedCliente) {
      const clientesAtualizados = [...clientes]
      const index = clientesAtualizados.findIndex((c) => c.id === selectedCliente.id)
      if (index !== -1) {
        clientesAtualizados[index] = {
          ...clientesAtualizados[index],
          ultimaCompra: new Date().toISOString(),
          produtosComprados: [
            ...(clientesAtualizados[index].produtosComprados || []),
            ...carrinhoVenda.map((item) => item.id),
          ],
        }
        localStorage.setItem("clientes", JSON.stringify(clientesAtualizados))
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
    setDadosVenda({
      subTotal: 0,
      desconto: 0,
      total: 0,
      cupomAplicado: false,
      metodoPagamento: "dinheiro",
      valorRecebido: 0,
      troco: 0,
      observacoes: "",
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Ponto de Venda (PDV)
        </h1>
        <p className="text-gray-500">Registre suas vendas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
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
                  placeholder="Digite o nome ou código de barras do produto"
                  value={searchTerm}
                  onChange={handleProdutoSearch}
                  className="pl-10"
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
                      {filteredProdutos.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium">
                            {produto.nome}
                            {produto.necessitaReceita && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Requer Receita
                              </Badge>
                            )}
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
                              disabled={produto.quantidadeDisponivel <= 0}
                              onClick={() => adicionarProdutoCarrinho(produto)}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Adicionar</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                <Button variant="outline" size="sm" className="text-red-600" onClick={() => setCarrinhoVenda([])}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {carrinhoVenda.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
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
                      {carrinhoVenda.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.nome}</TableCell>
                          <TableCell>R$ {item.preco.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => decrementarProduto(item.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">{item.quantidade}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => incrementarProduto(item.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>R$ {(item.preco * item.quantidade).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-600"
                              onClick={() => removerProduto(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCliente ? (
                <PdvClienteInfo cliente={selectedCliente} onRemove={handleRemoveCliente} />
              ) : (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar cliente por nome ou CPF"
                      value={searchClienteTerm}
                      onChange={handleClienteSearch}
                      className="pl-10"
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
                    <span className="text-gray-600">Desconto</span>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={dadosVenda.desconto}
                        onChange={handleDescontoChange}
                        className="text-right"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => aplicarCupom("FARMACIA10")}
                    >
                      Aplicar Cupom
                    </Button>
                    {dadosVenda.cupomAplicado && (
                      <Badge variant="outline" className="text-green-600">
                        FARMACIA10 aplicado
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="font-bold text-lg">R$ {dadosVenda.total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setIsPagamentoDialogOpen(true)}
                  disabled={carrinhoVenda.length === 0}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Finalizar Venda
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
                          <Button size="sm" onClick={() => handleSelectCliente(cliente)}>
                            Selecionar
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
            <Button variant="destructive" onClick={adicionarComAlergia}>
              Adicionar mesmo assim
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
                />
                <div className="flex justify-between text-sm pt-1">
                  <span>Troco:</span>
                  <span className="font-medium">R$ {dadosVenda.troco.toFixed(2)}</span>
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
                rows={2}
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {dadosVenda.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Desconto:</span>
                <span>R$ {dadosVenda.desconto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2">
                <span>Total:</span>
                <span>R$ {dadosVenda.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPagamentoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={finalizarVenda}
              className="bg-green-600 hover:bg-green-700"
              disabled={
                (dadosVenda.metodoPagamento === "dinheiro" && dadosVenda.valorRecebido < dadosVenda.total) ||
                (dadosVenda.metodoPagamento === "fiado" && !selectedCliente)
              }
            >
              <Check className="mr-2 h-4 w-4" />
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
