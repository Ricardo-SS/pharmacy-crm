"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Calendar, ArrowDown, ArrowUp, Check } from "lucide-react"

export default function CaixaPage() {
  const { toast } = useToast()
  const [vendas, setVendas] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [movimentacaoDialogOpen, setMovimentacaoDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dataSelecionada, setDataSelecionada] = useState("")
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
  })

  useEffect(() => {
    // Carregar dados
    const storedVendas = JSON.parse(localStorage.getItem("vendas") || "[]")
    const storedMovimentacoes = JSON.parse(localStorage.getItem("movimentacoes") || "[]")

    setVendas(storedVendas)
    setMovimentacoes(storedMovimentacoes)

    // Definir data atual como padrão
    const hoje = new Date().toISOString().split("T")[0]
    setDataSelecionada(hoje)

    setLoading(false)
  }, [])

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
    setFormMovimentacao({
      tipo,
      valor: "",
      descricao: "",
      formaPagamento: "dinheiro",
    })
    setMovimentacaoDialogOpen(true)
  }

  const handleDataChange = (e) => {
    setDataSelecionada(e.target.value)
  }

  const handleSalvarMovimentacao = () => {
    // Validar formulário
    if (!formMovimentacao.valor || Number.parseFloat(formMovimentacao.valor) <= 0) {
      toast({
        variant: "destructive",
        description: "Informe um valor válido para a movimentação.",
      })
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
    }

    // Adicionar ao array de movimentações
    const novasMovimentacoes = [...movimentacoes, novaMovimentacao]
    setMovimentacoes(novasMovimentacoes)

    // Salvar no localStorage
    localStorage.setItem("movimentacoes", JSON.stringify(novasMovimentacoes))

    // Feedback ao usuário
    toast({
      description: `Movimentação de ${formMovimentacao.tipo === "entrada" ? "entrada" : "saída"} registrada com sucesso.`,
    })

    // Fechar o diálogo
    setMovimentacaoDialogOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormMovimentacao({ ...formMovimentacao, [name]: value })
  }

  const handleSelectChange = (name, value) => {
    setFormMovimentacao({ ...formMovimentacao, [name]: value })
  }

  const fecharCaixa = () => {
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

    // Feedback ao usuário
    toast({
      description: "Caixa fechado com sucesso!",
    })
  }

  const formatarData = (dataIso) => {
    if (!dataIso) return ""
    const data = new Date(dataIso)
    return data.toLocaleDateString() + " " + data.toLocaleTimeString().substring(0, 5)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6">
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
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Entrada
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600"
            onClick={() => handleNovaMovimentacao("saida")}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Saída
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={fecharCaixa}>
            <Check className="mr-2 h-4 w-4" />
            Fechar Caixa
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
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
