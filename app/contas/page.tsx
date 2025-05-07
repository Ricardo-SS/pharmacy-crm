"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, ArrowDown, ArrowUp, CalendarClock, Search, PlusCircle, Check, Loader2 } from "lucide-react"

export default function ContasPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("pagar")
  const [searchTerm, setSearchTerm] = useState("")
  const [contas, setContas] = useState([])
  const [clientes, setClientes] = useState([])
  const [filteredContas, setFilteredContas] = useState([])
  const [isContaDialogOpen, setIsContaDialogOpen] = useState(false)
  const [isQuitarDialogOpen, setIsQuitarDialogOpen] = useState(false)
  const [contaParaQuitar, setContaParaQuitar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")

  const [formData, setFormData] = useState({
    id: "",
    tipo: "pagar", // pagar ou receber
    descricao: "",
    valor: "",
    dataVencimento: "",
    dataPagamento: "",
    status: "pendente", // pendente, pago, atrasado
    metodoPagamento: "dinheiro",
    clienteId: "", // para contas a receber
    fornecedor: "", // para contas a pagar
    categoria: "outros",
    observacoes: "",
  })

  const categorias = {
    pagar: ["fornecedor", "aluguel", "energia", "água", "internet", "telefone", "impostos", "funcionários", "outros"],
    receber: ["venda", "serviço", "empréstimo", "outros"],
  }

  useEffect(() => {
    // Carregar contas e clientes
    const storedContas = JSON.parse(localStorage.getItem("contas") || "[]")
    const storedClientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    setContas(storedContas)
    setClientes(storedClientes)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Filtrar contas de acordo com a aba ativa e termo de busca
    let filtered = contas.filter((conta) => conta.tipo === activeTab)

    if (searchTerm) {
      filtered = filtered.filter(
        (conta) =>
          conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (conta.fornecedor && conta.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (conta.tipo === "receber" &&
            conta.clienteId &&
            getClienteNome(conta.clienteId).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Atualizar status das contas
    const hoje = new Date()
    filtered = filtered.map((conta) => {
      if (conta.status === "pendente" && new Date(conta.dataVencimento) < hoje && !conta.dataPagamento) {
        return { ...conta, status: "atrasado" }
      }
      return conta
    })

    setFilteredContas(filtered)
  }, [contas, activeTab, searchTerm, clientes])

  const handleTabChange = (value) => {
    setActiveTab(value)
    setFormData((prev) => ({
      ...prev,
      tipo: value,
      categoria: value === "pagar" ? "fornecedor" : "venda",
    }))
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const resetForm = () => {
    setFormData({
      id: "",
      tipo: activeTab,
      descricao: "",
      valor: "",
      dataVencimento: "",
      dataPagamento: "",
      status: "pendente",
      metodoPagamento: "dinheiro",
      clienteId: "",
      fornecedor: "",
      categoria: activeTab === "pagar" ? "fornecedor" : "venda",
      observacoes: "",
    })
  }

  const openNovaContaDialog = () => {
    resetForm()
    setIsContaDialogOpen(true)
  }

  const prepararQuitarConta = (conta) => {
    setContaParaQuitar(conta)
    setIsQuitarDialogOpen(true)
  }

  const quitarConta = () => {
    setActionLoading("quitar")

    setTimeout(() => {
      const contasAtualizadas = contas.map((c) =>
        c.id === contaParaQuitar.id
          ? {
              ...c,
              status: "pago",
              dataPagamento: new Date().toISOString(),
            }
          : c,
      )

      setContas(contasAtualizadas)
      localStorage.setItem("contas", JSON.stringify(contasAtualizadas))

      // Se for uma conta a receber de um cliente, atualizar o saldo devedor do cliente
      if (contaParaQuitar.tipo === "receber" && contaParaQuitar.clienteId) {
        const clientesAtualizados = clientes.map((cliente) => {
          if (cliente.id === contaParaQuitar.clienteId) {
            const novoSaldo = Math.max(0, (cliente.valorDevendo || 0) - Number(contaParaQuitar.valor))
            return {
              ...cliente,
              valorDevendo: novoSaldo,
            }
          }
          return cliente
        })

        localStorage.setItem("clientes", JSON.stringify(clientesAtualizados))
        setClientes(clientesAtualizados)
      }

      toast({
        description: "Conta quitada com sucesso.",
      })

      setIsQuitarDialogOpen(false)
      setContaParaQuitar(null)
      setActionLoading("")
    }, 1000)
  }

  // Modificar a função handleFormSubmit para permitir contas a receber sem cliente
  const handleFormSubmit = (e) => {
    e.preventDefault()
    setActionLoading("salvar")

    setTimeout(() => {
      // Validar valores
      if (!formData.descricao || !formData.valor || !formData.dataVencimento) {
        toast({
          variant: "destructive",
          description: "Preencha todos os campos obrigatórios.",
        })
        setActionLoading("")
        return
      }

      // Preparar os dados para salvar
      const novaConta = {
        ...formData,
        id: formData.id || Date.now().toString(),
        valor: Number(formData.valor),
        status: new Date(formData.dataVencimento) < new Date() ? "atrasado" : "pendente",
      }

      // Se for uma conta a receber e tiver cliente, atualizar o saldo devedor do cliente
      if (novaConta.tipo === "receber" && novaConta.clienteId && !formData.id) {
        const clientesAtualizados = clientes.map((cliente) => {
          if (cliente.id === novaConta.clienteId) {
            return {
              ...cliente,
              valorDevendo: (cliente.valorDevendo || 0) + Number(novaConta.valor),
            }
          }
          return cliente
        })

        localStorage.setItem("clientes", JSON.stringify(clientesAtualizados))
        setClientes(clientesAtualizados)
      }

      // Salvar a conta
      if (formData.id) {
        // Edição
        const contasAtualizadas = contas.map((c) => (c.id === formData.id ? novaConta : c))
        setContas(contasAtualizadas)
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas))

        toast({
          description: "Conta atualizada com sucesso.",
        })
      } else {
        // Nova conta
        const contasAtualizadas = [...contas, novaConta]
        setContas(contasAtualizadas)
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas))

        toast({
          description: "Conta registrada com sucesso.",
        })
      }

      setIsContaDialogOpen(false)
      resetForm()
      setActionLoading("")
    }, 1000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Modificar a função getClienteNome para lidar com clienteId vazio
  const getClienteNome = (id) => {
    if (!id || id === "none") return "Cliente não especificado"
    const cliente = clientes.find((c) => c.id === id)
    return cliente ? cliente.nome : "Cliente não encontrado"
  }

  const formatarData = (dataIso) => {
    if (!dataIso) return ""
    const data = new Date(dataIso)
    return data.toLocaleDateString("pt-BR")
  }

  const getSituacaoBadge = (conta) => {
    switch (conta.status) {
      case "pago":
        return <Badge className="bg-green-600">Pago</Badge>
      case "atrasado":
        return <Badge variant="destructive">Atrasado</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  const calcularTotais = () => {
    const contasDoTipo = contas.filter((c) => c.tipo === activeTab)

    const pendentes = contasDoTipo
      .filter((c) => c.status !== "pago")
      .reduce((total, conta) => total + Number(conta.valor), 0)

    const vencidas = contasDoTipo
      .filter((c) => c.status === "atrasado")
      .reduce((total, conta) => total + Number(conta.valor), 0)

    const pagas = contasDoTipo
      .filter((c) => c.status === "pago")
      .reduce((total, conta) => total + Number(conta.valor), 0)

    return { pendentes, vencidas, pagas }
  }

  const totais = calcularTotais()

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Contas {activeTab === "pagar" ? "a Pagar" : "a Receber"}
          </h1>
          <p className="text-gray-500">Gerenciamento de contas financeiras</p>
        </div>
        <Button onClick={openNovaContaDialog} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total {activeTab === "pagar" ? "a Pagar" : "a Receber"}
                </p>
                <h3 className="text-2xl font-bold mt-1">R$ {totais.pendentes.toFixed(2)}</h3>
                <p className="text-xs text-gray-500 mt-1">Contas pendentes</p>
              </div>
              <div className={`${activeTab === "pagar" ? "bg-red-50" : "bg-green-50"} p-2 rounded-full`}>
                {activeTab === "pagar" ? (
                  <ArrowUp className="h-5 w-5 text-red-600" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Vencidas</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">R$ {totais.vencidas.toFixed(2)}</h3>
                <p className="text-xs text-gray-500 mt-1">Contas atrasadas</p>
              </div>
              <div className="bg-red-50 p-2 rounded-full">
                <CalendarClock className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total {activeTab === "pagar" ? "Pago" : "Recebido"}</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">R$ {totais.pagas.toFixed(2)}</h3>
                <p className="text-xs text-gray-500 mt-1">Contas quitadas</p>
              </div>
              <div className="bg-green-50 p-2 rounded-full">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pagar" className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="receber" className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4" />
            Contas a Receber
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder={`Buscar ${activeTab === "pagar" ? "fornecedor" : "cliente"}...`}
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      </div>

      {filteredContas.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>{activeTab === "pagar" ? "Fornecedor" : "Cliente"}</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{conta.descricao}</span>
                      <span className="text-xs text-gray-500">{conta.categoria}</span>
                    </div>
                  </TableCell>
                  <TableCell>{activeTab === "pagar" ? conta.fornecedor : getClienteNome(conta.clienteId)}</TableCell>
                  <TableCell>{formatarData(conta.dataVencimento)}</TableCell>
                  <TableCell>R$ {Number(conta.valor).toFixed(2)}</TableCell>
                  <TableCell>{getSituacaoBadge(conta)}</TableCell>
                  <TableCell className="text-right">
                    {conta.status !== "pago" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                        onClick={() => prepararQuitarConta(conta)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Quitar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <CreditCard className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">Nenhuma conta encontrada</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm
              ? "Tente outro termo de busca."
              : `Cadastre sua primeira conta ${activeTab === "pagar" ? "a pagar" : "a receber"}.`}
          </p>
        </div>
      )}

      {/* Modal de Nova Conta / Editar Conta */}
      <Dialog open={isContaDialogOpen} onOpenChange={setIsContaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formData.id ? "Editar Conta" : `Nova Conta ${activeTab === "pagar" ? "a Pagar" : "a Receber"}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição*</label>
              <Input
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva a conta"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={formData.categoria} onValueChange={(value) => handleSelectChange("categoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias[activeTab].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeTab === "pagar" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Fornecedor*</label>
                <Input
                  name="fornecedor"
                  value={formData.fornecedor}
                  onChange={handleChange}
                  placeholder="Nome do fornecedor"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Select value={formData.clienteId} onValueChange={(value) => handleSelectChange("clienteId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem cliente específico</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor (R$)*</label>
                <Input
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Vencimento*</label>
                <Input
                  name="dataVencimento"
                  value={formData.dataVencimento}
                  onChange={handleChange}
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Input
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Observações opcionais"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsContaDialogOpen(false)} type="button">
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={actionLoading === "salvar"}>
                {actionLoading === "salvar" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Quitar Conta */}
      <Dialog open={isQuitarDialogOpen} onOpenChange={setIsQuitarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quitar Conta</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Detalhes da Conta</h3>
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Descrição:</span>
                  <span className="font-medium">{contaParaQuitar?.descricao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{activeTab === "pagar" ? "Fornecedor:" : "Cliente:"}</span>
                  <span>
                    {activeTab === "pagar" ? contaParaQuitar?.fornecedor : getClienteNome(contaParaQuitar?.clienteId)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Vencimento:</span>
                  <span>{formatarData(contaParaQuitar?.dataVencimento)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Valor:</span>
                  <span className="font-bold">R$ {Number(contaParaQuitar?.valor).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-center">
              Confirma a quitação desta conta
              {contaParaQuitar?.status === "atrasado" ? " atrasada" : ""}?
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuitarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={quitarConta}
              className="bg-green-600 hover:bg-green-700"
              disabled={actionLoading === "quitar"}
            >
              {actionLoading === "quitar" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
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
    </div>
  )
}
