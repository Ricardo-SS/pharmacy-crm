"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowDown,
  ArrowUp,
  Loader2,
  Lock,
  Unlock,
  Search,
  User,
  X,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function CaixaPage() {
  const { toast } = useToast()
  const [vendas, setVendas] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [movimentacaoDialogOpen, setMovimentacaoDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [dataSelecionada, setDataSelecionada] = useState("")
  const [caixaAberto, setCaixaAberto] = useState(false)
  const [resumoCaixa, setResumoCaixa] = useState({
    saldoInicial: 0,
    entradas: 0,
    saidas: 0,
    saldoFinal: 0,
  })

  const [formMovimentacao, setFormMovimentacao] = useState({
    tipo: "entrada",
    valor: "",
    descricao: "",
    formaPagamento: "dinheiro",
    abaterDivida: false,
  })

  // Adicionar estado para cliente selecionado
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [clientesBuscados, setClientesBuscados] = useState([])
  const [termoBuscaCliente, setTermoBuscaCliente] = useState("")
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false)
  const [clientes, setClientes] = useState([])

  // Adicionar useEffect para carregar clientes
  useEffect(() => {
    // Carregar dados
    const storedVendas = JSON.parse(localStorage.getItem("vendas") || "[]")
    const storedMovimentacoes = JSON.parse(localStorage.getItem("movimentacoes") || "[]")
    const storedClientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    const statusCaixa = localStorage.getItem("caixaAberto") === "true"

    setVendas(storedVendas)
    setMovimentacoes(storedMovimentacoes)
    setClientes(storedClientes)
    setCaixaAberto(statusCaixa)

    // Definir data atual como padrão
    const hoje = new Date().toISOString().split("T")[0]
    setDataSelecionada(hoje)

    setLoading(false)

    // Configurar manipulador de teclas
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleKeyDown = useCallback(
    (e) => {
      // Não processar atalhos se um campo de texto estiver em foco
      const activeElement = document.activeElement
      const isInputActive =
        activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable

      if (isInputActive) return

      // Manipular atalhos de teclado
      switch (e.key) {
        case "F1":
          e.preventDefault()
          toast({
            description: "Atalhos do Caixa: F1 = Ajuda, F2 = Nova Entrada, F3 = Nova Saída, F4 = Abrir/Fechar Caixa",
          })
          break
        case "F2":
          e.preventDefault()
          if (caixaAberto) {
            handleNovaMovimentacao("entrada")
          } else {
            toast({
              variant: "destructive",
              description: "O caixa precisa estar aberto para registrar entradas.",
            })
          }
          break
        case "F3":
          e.preventDefault()
          if (caixaAberto) {
            handleNovaMovimentacao("saida")
          } else {
            toast({
              variant: "destructive",
              description: "O caixa precisa estar aberto para registrar saídas.",
            })
          }
          break
        case "F4":
          e.preventDefault()
          toggleCaixa()
          break
      }
    },
    [caixaAberto, toast],
  )

  useEffect(() => {
    calcularResumoCaixa()
  }, [dataSelecionada, vendas, movimentacoes])

  const calcularResumoCaixa = () => {
    // Filtrar movimentações do dia selecionado
    const movimentacoesDoDia = movimentacoes.filter((mov) => {
      return mov.data.split("T")[0] === dataSelecionada
    })

    // Filtrar vendas do dia selecionado
    const vendasDoDia = vendas.filter((venda) => {
      return venda.data.split("T")[0] === dataSelecionada
    })

    // Calcular entradas (vendas em dinheiro + entradas manuais)
    const entradasVendas = vendasDoDia
      .filter((v) => v.metodoPagamento === "dinheiro")
      .reduce((total, venda) => total + venda.valorTotal, 0)

    const entradasManuais = movimentacoesDoDia
      .filter((mov) => mov.tipo === "entrada")
      .reduce((total, mov) => total + mov.valor, 0)

    const totalEntradas = entradasVendas + entradasManuais

    // Calcular saídas
    const totalSaidas = movimentacoesDoDia
      .filter((mov) => mov.tipo === "saida")
      .reduce((total, mov) => total + mov.valor, 0)

    // Encontrar saldo inicial (última movimentação do tipo "saldo_inicial" antes da data)
    const dataAnterior = new Date(dataSelecionada)
    dataAnterior.setDate(dataAnterior.getDate() - 1)

    const ultimoSaldoInicial =
      movimentacoes
        .filter((mov) => {
          return mov.tipo === "saldo_inicial" && new Date(mov.data) <= dataAnterior
        })
        .sort((a, b) => new Date(b.data) - new Date(a.data))[0]?.valor || 0

    // Calcular saldo final
    const saldoFinal = ultimoSaldoInicial + totalEntradas - totalSaidas

    setResumoCaixa({
      saldoInicial: ultimoSaldoInicial,
      entradas: totalEntradas,
      saidas: totalSaidas,
      saldoFinal,
    })
  }

  const handleNovaMovimentacao = (tipo) => {
    if (!caixaAberto) {
      toast({
        variant: "destructive",
        description: "O caixa precisa estar aberto para registrar movimentações.",
      })
      return
    }

    setFormMovimentacao({
      tipo,
      valor: "",
      descricao: "",
      formaPagamento: "dinheiro",
      abaterDivida: false,
    })
    setMovimentacaoDialogOpen(true)
  }

  const handleDataChange = (e) => {
    setDataSelecionada(e.target.value)
  }

  // Modificar a função handleSalvarMovimentacao para processar cliente e dívida
  const handleSalvarMovimentacao = () => {
    setActionLoading("salvarMovimentacao")

    // Simular tempo de processamento
    setTimeout(() => {
      // Validar formulário
      if (!formMovimentacao.valor || Number.parseFloat(formMovimentacao.valor) <= 0) {
        toast({
          variant: "destructive",
          description: "Informe um valor válido para a movimentação.",
        })
        setActionLoading("")
        return
      }

      // Criar nova movimentação
      const novaMovimentacao = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        tipo: formMovimentacao.tipo,
        valor: Number.parseFloat(formMovimentacao.valor),
        descricao: formMovimentacao.descricao,
        formaPagamento: formMovimentacao.formaPagamento,
        clienteId: clienteSelecionado?.id || null,
        abateuDivida: formMovimentacao.abaterDivida && clienteSelecionado?.valorDevendo > 0,
      }

      // Adicionar ao array de movimentações
      const novasMovimentacoes = [...movimentacoes, novaMovimentacao]
      setMovimentacoes(novasMovimentacoes)

      // Salvar no localStorage
      localStorage.setItem("movimentacoes", JSON.stringify(novasMovimentacoes))

      // Se for para abater dívida do cliente
      if (clienteSelecionado && formMovimentacao.abaterDivida && clienteSelecionado.valorDevendo > 0) {
        const clientesAtualizados = clientes.map((cliente) => {
          if (cliente.id === clienteSelecionado.id) {
            const novoValorDevendo = Math.max(0, cliente.valorDevendo - Number.parseFloat(formMovimentacao.valor))
            return {
              ...cliente,
              valorDevendo: novoValorDevendo,
            }
          }
          return cliente
        })

        // Atualizar clientes no localStorage
        localStorage.setItem("clientes", JSON.stringify(clientesAtualizados))
        setClientes(clientesAtualizados)

        toast({
          description: `Dívida do cliente ${clienteSelecionado.nome} abatida com sucesso.`,
        })
      }

      // Feedback ao usuário
      toast({
        description: `Movimentação de ${formMovimentacao.tipo === "entrada" ? "entrada" : "saída"} registrada com sucesso.`,
      })

      // Fechar o diálogo e resetar
      setMovimentacaoDialogOpen(false)
      setClienteSelecionado(null)
      setFormMovimentacao({
        tipo: "entrada",
        valor: "",
        descricao: "",
        formaPagamento: "dinheiro",
        abaterDivida: false,
      })
      setActionLoading("")
    }, 1000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormMovimentacao({ ...formMovimentacao, [name]: value })
  }

  const handleSelectChange = (name, value) => {
    setFormMovimentacao({ ...formMovimentacao, [name]: value })
  }

  const toggleCaixa = () => {
    setActionLoading(caixaAberto ? "fecharCaixa" : "abrirCaixa")

    // Simular tempo de processamento
    setTimeout(() => {
      if (caixaAberto) {
        // Fechar caixa
        // Criar movimentação de fechamento
        const movimentacaoFechamento = {
          id: Date.now().toString(),
          data: new Date().toISOString(),
          tipo: "saldo_inicial", // Será o saldo inicial do próximo dia
          valor: resumoCaixa.saldoFinal,
          descricao: `Fechamento de caixa - ${new Date().toLocaleDateString()}`,
          formaPagamento: "dinheiro",
        }

        // Adicionar ao array de movimentações
        const novasMovimentacoes = [...movimentacoes, movimentacaoFechamento]
        setMovimentacoes(novasMovimentacoes)

        // Salvar no localStorage
        localStorage.setItem("movimentacoes", JSON.stringify(novasMovimentacoes))
        localStorage.setItem("caixaAberto", "false")

        // Feedback ao usuário
        toast({
          description: "Caixa fechado com sucesso!",
        })
        setCaixaAberto(false)
      } else {
        // Abrir caixa
        const movimentacaoAbertura = {
          id: Date.now().toString(),
          data: new Date().toISOString(),
          tipo: "saldo_inicial",
          valor: resumoCaixa.saldoFinal || 0,
          descricao: `Abertura de caixa - ${new Date().toLocaleDateString()}`,
          formaPagamento: "dinheiro",
        }

        // Adicionar ao array de movimentações
        const novasMovimentacoes = [...movimentacoes, movimentacaoAbertura]
        setMovimentacoes(novasMovimentacoes)

        // Salvar no localStorage
        localStorage.setItem("movimentacoes", JSON.stringify(novasMovimentacoes))
        localStorage.setItem("caixaAberto", "true")

        // Feedback ao usuário
        toast({
          description: "Caixa aberto com sucesso!",
        })
        setCaixaAberto(true)
      }
      setActionLoading("")
    }, 1000)
  }

  const formatarData = (dataIso) => {
    if (!dataIso) return ""
    const data = new Date(dataIso)
    return data.toLocaleDateString() + " " + data.toLocaleTimeString().substring(0, 5)
  }

  // Adicionar função para buscar clientes
  const buscarClientes = (termo) => {
    if (!termo) {
      setClientesBuscados([])
      return
    }

    const resultados = clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo.toLowerCase()) || (cliente.cpf && cliente.cpf.includes(termo)),
    )

    setClientesBuscados(resultados)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Controle de Caixa
          </h1>
          <p className="text-gray-500">Gerenciamento financeiro</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input type="date" value={dataSelecionada} onChange={handleDataChange} className="w-40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Saldo Inicial</p>
                <h3 className="text-2xl font-bold mt-1">R$ {resumoCaixa.saldoInicial.toFixed(2)}</h3>
              </div>
              <div className="bg-blue-50 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Entradas</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">R$ {resumoCaixa.entradas.toFixed(2)}</h3>
              </div>
              <div className="bg-green-50 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Saídas</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">R$ {resumoCaixa.saidas.toFixed(2)}</h3>
              </div>
              <div className="bg-red-50 p-2 rounded-full">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Saldo Final</p>
                <h3 className="text-2xl font-bold mt-1">R$ {resumoCaixa.saldoFinal.toFixed(2)}</h3>
              </div>
              <div className="bg-blue-50 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Movimentações do dia</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-green-600 border-green-600"
            onClick={() => handleNovaMovimentacao("entrada")}
            disabled={!caixaAberto}
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Entrada (F2)
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600"
            onClick={() => handleNovaMovimentacao("saida")}
            disabled={!caixaAberto}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Saída (F3)
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={toggleCaixa}
            disabled={actionLoading === "fecharCaixa" || actionLoading === "abrirCaixa"}
          >
            {actionLoading === "fecharCaixa" || actionLoading === "abrirCaixa" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : caixaAberto ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Fechar Caixa (F4)
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Abrir Caixa (F4)
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Mostrar vendas em dinheiro do dia selecionado */}
              {vendas
                .filter((venda) => venda.data.split("T")[0] === dataSelecionada && venda.metodoPagamento === "dinheiro")
                .map((venda) => (
                  <TableRow key={`venda-${venda.id}`}>
                    <TableCell>{formatarData(venda.data)}</TableCell>
                    <TableCell>
                      Venda #{venda.id} - {venda.cliente ? venda.cliente.nome : "Cliente não identificado"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 font-medium">Entrada</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">R$ {venda.valorTotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}

              {/* Mostrar movimentações do dia selecionado */}
              {movimentacoes
                .filter((mov) => mov.data.split("T")[0] === dataSelecionada && mov.tipo !== "saldo_inicial")
                .map((mov) => (
                  <TableRow key={`mov-${mov.id}`}>
                    <TableCell>{formatarData(mov.data)}</TableCell>
                    <TableCell>
                      {mov.descricao || (mov.tipo === "entrada" ? "Entrada manual" : "Saída manual")}
                    </TableCell>
                    <TableCell className="text-right">
                      {mov.tipo === "entrada" ? (
                        <span className="text-green-600 font-medium">Entrada</span>
                      ) : (
                        <span className="text-red-600 font-medium">Saída</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">R$ {mov.valor.toFixed(2)}</TableCell>
                  </TableRow>
                ))}

              {vendas.filter(
                (venda) => venda.data.split("T")[0] === dataSelecionada && venda.metodoPagamento === "dinheiro",
              ).length === 0 &&
                movimentacoes.filter(
                  (mov) => mov.data.split("T")[0] === dataSelecionada && mov.tipo !== "saldo_inicial",
                ).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Nenhuma movimentação registrada para esta data
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={movimentacaoDialogOpen} onOpenChange={setMovimentacaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMovimentacao.tipo === "entrada" ? "Nova Entrada" : "Nova Saída"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)*</label>
              <Input
                name="valor"
                value={formMovimentacao.valor}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                name="descricao"
                value={formMovimentacao.descricao}
                onChange={handleInputChange}
                placeholder="Descreva a movimentação"
              />
            </div>

            {formMovimentacao.tipo === "entrada" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Forma de Recebimento</label>
                <Select
                  value={formMovimentacao.formaPagamento}
                  onValueChange={(value) => handleSelectChange("formaPagamento", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formMovimentacao.tipo === "entrada" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente (opcional)</label>
                <div className="flex gap-2">
                  {clienteSelecionado ? (
                    <div className="flex-1 border rounded-md p-2 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{clienteSelecionado.nome}</p>
                        <p className="text-xs text-gray-500">
                          {clienteSelecionado.valorDevendo > 0
                            ? `Valor devendo: R$ ${clienteSelecionado.valorDevendo.toFixed(2)}`
                            : "Sem débitos pendentes"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setClienteSelecionado(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                      onClick={() => setIsClienteDialogOpen(true)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Selecionar cliente
                    </Button>
                  )}
                </div>
                {clienteSelecionado && clienteSelecionado.valorDevendo > 0 && (
                  <div className="flex items-center mt-2">
                    <Checkbox
                      id="abaterDivida"
                      checked={formMovimentacao.abaterDivida}
                      onCheckedChange={(checked) => setFormMovimentacao({ ...formMovimentacao, abaterDivida: checked })}
                    />
                    <label htmlFor="abaterDivida" className="ml-2 text-sm">
                      Abater valor da dívida do cliente
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMovimentacaoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarMovimentacao}
              className={
                formMovimentacao.tipo === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
              disabled={actionLoading === "salvarMovimentacao"}
            >
              {actionLoading === "salvarMovimentacao" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barra de atalhos */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t p-2 text-xs text-gray-600 flex justify-center space-x-4">
        <span>
          <kbd className="px-1 py-0.5 bg-gray-200 rounded">F1</kbd> Ajuda
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-200 rounded">F2</kbd> Nova entrada
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-200 rounded">F3</kbd> Nova saída
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-200 rounded">F4</kbd> {caixaAberto ? "Fechar" : "Abrir"} caixa
        </span>
      </div>

      {/* Adicionar diálogo de seleção de cliente */}
      <Dialog open={isClienteDialogOpen} onOpenChange={setIsClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar cliente por nome ou CPF"
                value={termoBuscaCliente}
                onChange={(e) => {
                  setTermoBuscaCliente(e.target.value)
                  buscarClientes(e.target.value)
                }}
                className="pl-10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {clientesBuscados.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Débito</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientesBuscados.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell className="font-medium">{cliente.nome}</TableCell>
                          <TableCell>
                            {cliente.valorDevendo > 0 ? (
                              <span className="text-red-600">R$ {cliente.valorDevendo.toFixed(2)}</span>
                            ) : (
                              <span className="text-green-600">Sem débitos</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setClienteSelecionado(cliente)
                                setIsClienteDialogOpen(false)
                                setTermoBuscaCliente("")
                                setClientesBuscados([])

                                // Se o cliente tem dívida, marcar para abater automaticamente
                                if (cliente.valorDevendo > 0) {
                                  setFormMovimentacao((prev) => ({
                                    ...prev,
                                    abaterDivida: true,
                                  }))
                                }
                              }}
                            >
                              Selecionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : termoBuscaCliente ? (
                <div className="text-center py-6">
                  <User className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
                  <p className="text-gray-500 mt-1">Tente outra busca.</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Search className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">Digite para buscar clientes</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsClienteDialogOpen(false)
                setTermoBuscaCliente("")
                setClientesBuscados([])
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
