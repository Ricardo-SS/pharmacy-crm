"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart2,
  Download,
  Calendar,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  FileText,
  Loader2,
  Filter,
} from "lucide-react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Adicionar uma nova função para gerar dados de tendência
const gerarDadosTendencia = (vendas) => {
  // Agrupar vendas por mês
  const vendasPorMes = {}

  vendas.forEach((venda) => {
    const data = new Date(venda.data)
    const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`

    if (!vendasPorMes[mesAno]) {
      vendasPorMes[mesAno] = {
        mes: mesAno,
        quantidade: 0,
        valor: 0,
      }
    }

    vendasPorMes[mesAno].quantidade += 1
    vendasPorMes[mesAno].valor += venda.valorTotal
  })

  // Converter para array e ordenar por data
  return Object.values(vendasPorMes).sort((a, b) => {
    const [mesA, anoA] = a.mes.split("/")
    const [mesB, anoB] = b.mes.split("/")

    if (anoA !== anoB) return anoA - anoB
    return mesA - mesB
  })
}

// Adicionar componente de gráfico de tendência
const TendenciaChart = ({ vendas }) => {
  const dados = gerarDadosTendencia(vendas)

  if (dados.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-500">Sem dados suficientes</h3>
        <p className="text-gray-500 text-sm mt-1">Não há dados suficientes para gerar o gráfico de tendência</p>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dados}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="quantidade"
            stroke="#8884d8"
            name="Quantidade de Vendas"
            activeDot={{ r: 8 }}
          />
          <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#82ca9d" name="Valor Total (R$)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Adicionar componente de gráfico de produtos mais vendidos
const ProdutosChart = ({ produtos }) => {
  // Pegar os 5 produtos mais vendidos
  const dadosProdutos = produtos.slice(0, 5)

  if (dadosProdutos.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-500">Sem dados suficientes</h3>
        <p className="text-gray-500 text-sm mt-1">Não há dados suficientes para gerar o gráfico</p>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dadosProdutos}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade Vendida" />
          <Bar dataKey="valor" fill="#82ca9d" name="Valor Total (R$)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Adicionar componente de gráfico de clientes
const ClientesChart = ({ clientes }) => {
  // Pegar os 5 melhores clientes
  const dadosClientes = clientes.slice(0, 5)

  if (dadosClientes.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-500">Sem dados suficientes</h3>
        <p className="text-gray-500 text-sm mt-1">Não há dados suficientes para gerar o gráfico</p>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dadosClientes}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="compras" fill="#8884d8" name="Número de Compras" />
          <Bar dataKey="valor" fill="#82ca9d" name="Valor Total (R$)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function RelatoriosPage() {
  const { toast } = useToast()
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [tipoRelatorio, setTipoRelatorio] = useState("vendas")
  const [vendas, setVendas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [dadosRelatorio, setDadosRelatorio] = useState([])
  const [resumo, setResumo] = useState({
    totalVendas: 0,
    valorTotal: 0,
    mediaVendas: 0,
    produtoMaisVendido: { nome: "", quantidade: 0 },
    clienteMaisComprou: { nome: "", valor: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [camposSelecionados, setCamposSelecionados] = useState({
    vendas: ["data", "cliente", "itens", "valorTotal", "metodoPagamento"],
    produtos: ["nome", "quantidade", "valor", "media"],
    clientes: ["nome", "compras", "valor", "media"],
  })
  const [filtros, setFiltros] = useState({
    metodoPagamento: "todos",
    valorMinimo: "",
    valorMaximo: "",
  })

  const tableRef = useRef(null)

  useEffect(() => {
    // Carregar dados
    const storedVendas = JSON.parse(localStorage.getItem("vendas") || "[]")
    const storedProdutos = JSON.parse(localStorage.getItem("produtos") || "[]")
    const storedClientes = JSON.parse(localStorage.getItem("clientes") || "[]")

    setVendas(storedVendas)
    setProdutos(storedProdutos)
    setClientes(storedClientes)

    // Definir período padrão (último mês)
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    setDataInicio(inicioMes.toISOString().split("T")[0])
    setDataFim(fimMes.toISOString().split("T")[0])

    setLoading(false)
  }, [])

  useEffect(() => {
    if (dataInicio && dataFim) {
      gerarRelatorio()
    }
  }, [dataInicio, dataFim, tipoRelatorio, vendas, produtos, clientes, filtros])

  const gerarRelatorio = () => {
    // Filtrar vendas pelo período
    let vendasPeriodo = vendas.filter((venda) => {
      const dataVenda = new Date(venda.data)
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)
      fim.setHours(23, 59, 59) // Incluir o dia final completo

      return dataVenda >= inicio && dataVenda <= fim
    })

    // Aplicar filtros adicionais
    if (filtros.metodoPagamento !== "todos") {
      vendasPeriodo = vendasPeriodo.filter((venda) => venda.metodoPagamento === filtros.metodoPagamento)
    }

    if (filtros.valorMinimo) {
      const valorMinimo = Number.parseFloat(filtros.valorMinimo)
      vendasPeriodo = vendasPeriodo.filter((venda) => venda.valorTotal >= valorMinimo)
    }

    if (filtros.valorMaximo) {
      const valorMaximo = Number.parseFloat(filtros.valorMaximo)
      vendasPeriodo = vendasPeriodo.filter((venda) => venda.valorTotal <= valorMaximo)
    }

    // Calcular resumo
    const totalVendas = vendasPeriodo.length
    const valorTotal = vendasPeriodo.reduce((total, venda) => total + venda.valorTotal, 0)
    const mediaVendas = totalVendas > 0 ? valorTotal / totalVendas : 0

    // Encontrar produto mais vendido
    const produtosVendidos = {}
    vendasPeriodo.forEach((venda) => {
      venda.itens.forEach((item) => {
        if (!produtosVendidos[item.id]) {
          produtosVendidos[item.id] = {
            nome: item.nome,
            quantidade: 0,
            valor: 0,
          }
        }
        produtosVendidos[item.id].quantidade += item.quantidade
        produtosVendidos[item.id].valor += item.quantidade * item.preco
      })
    })

    const produtosMaisVendidos = Object.values(produtosVendidos).sort((a, b) => b.quantidade - a.quantidade)
    const produtoMaisVendido =
      produtosMaisVendidos.length > 0 ? produtosMaisVendidos[0] : { nome: "Nenhum", quantidade: 0 }

    // Encontrar cliente que mais comprou
    const comprasPorCliente = {}
    vendasPeriodo.forEach((venda) => {
      if (venda.cliente) {
        const clienteId = venda.cliente.id
        if (!comprasPorCliente[clienteId]) {
          comprasPorCliente[clienteId] = {
            nome: venda.cliente.nome,
            valor: 0,
            quantidade: 0,
          }
        }
        comprasPorCliente[clienteId].valor += venda.valorTotal
        comprasPorCliente[clienteId].quantidade += 1
      }
    })

    const clientesOrdenados = Object.values(comprasPorCliente).sort((a, b) => b.valor - a.valor)
    const clienteMaisComprou = clientesOrdenados.length > 0 ? clientesOrdenados[0] : { nome: "Nenhum", valor: 0 }

    setResumo({
      totalVendas,
      valorTotal,
      mediaVendas,
      produtoMaisVendido,
      clienteMaisComprou,
    })

    // Gerar dados específicos do relatório
    switch (tipoRelatorio) {
      case "vendas":
        setDadosRelatorio(
          vendasPeriodo.map((venda) => ({
            id: venda.id,
            data: formatarData(venda.data),
            cliente: venda.cliente ? venda.cliente.nome : "Cliente não identificado",
            itens: venda.itens.length,
            valorTotal: venda.valorTotal,
            metodoPagamento: formatarMetodoPagamento(venda.metodoPagamento),
            vendedor: venda.vendedor || "Não identificado",
          })),
        )
        break

      case "produtos":
        setDadosRelatorio(
          produtosMaisVendidos.map((produto) => ({
            nome: produto.nome,
            quantidade: produto.quantidade,
            valor: produto.valor,
            media: produto.valor / produto.quantidade,
          })),
        )
        break

      case "clientes":
        setDadosRelatorio(
          clientesOrdenados.map((cliente) => ({
            nome: cliente.nome,
            compras: cliente.quantidade,
            valor: cliente.valor,
            media: cliente.valor / cliente.quantidade,
          })),
        )
        break

      default:
        setDadosRelatorio([])
    }
  }

  const formatarData = (dataIso) => {
    if (!dataIso) return ""
    const data = new Date(dataIso)
    return data.toLocaleDateString()
  }

  const formatarMetodoPagamento = (metodo) => {
    switch (metodo) {
      case "dinheiro":
        return "Dinheiro"
      case "credito":
        return "Cartão de Crédito"
      case "pix":
        return "PIX"
      case "fiado":
        return "Fiado"
      default:
        return metodo
    }
  }

  const exportarCSV = () => {
    setActionLoading("exportarCSV")

    // Simular tempo de processamento
    setTimeout(() => {
      // Função para exportar os dados do relatório em CSV
      let csv = ""

      // Cabeçalhos
      if (tipoRelatorio === "vendas") {
        const campos = camposSelecionados.vendas
        csv = campos.join(",") + "\n"

        dadosRelatorio.forEach((venda) => {
          const linha = campos
            .map((campo) => {
              // Tratar strings com vírgulas
              if (typeof venda[campo] === "string" && venda[campo].includes(",")) {
                return `"${venda[campo]}"`
              }
              return venda[campo]
            })
            .join(",")
          csv += linha + "\n"
        })
      } else if (tipoRelatorio === "produtos") {
        const campos = camposSelecionados.produtos
        csv = campos.join(",") + "\n"

        dadosRelatorio.forEach((produto) => {
          const linha = campos
            .map((campo) => {
              if (campo === "valor" || campo === "media") {
                return produto[campo].toFixed(2)
              }
              // Tratar strings com vírgulas
              if (typeof produto[campo] === "string" && produto[campo].includes(",")) {
                return `"${produto[campo]}"`
              }
              return produto[campo]
            })
            .join(",")
          csv += linha + "\n"
        })
      } else if (tipoRelatorio === "clientes") {
        const campos = camposSelecionados.clientes
        csv = campos.join(",") + "\n"

        dadosRelatorio.forEach((cliente) => {
          const linha = campos
            .map((campo) => {
              if (campo === "valor" || campo === "media") {
                return cliente[campo].toFixed(2)
              }
              // Tratar strings com vírgulas
              if (typeof cliente[campo] === "string" && cliente[campo].includes(",")) {
                return `"${cliente[campo]}"`
              }
              return cliente[campo]
            })
            .join(",")
          csv += linha + "\n"
        })
      }

      // Criar blob e link para download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `relatorio_${tipoRelatorio}_${dataInicio}_${dataFim}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        description: "Relatório CSV exportado com sucesso!",
      })

      setActionLoading("")
    }, 1000)
  }

  const exportarPDF = () => {
    setActionLoading("exportarPDF")

    // Simular tempo de processamento
    setTimeout(() => {
      try {
        const doc = new jsPDF()

        // Título
        doc.setFontSize(18)
        doc.text("PharmaCRM - Relatório", 14, 22)

        // Subtítulo
        doc.setFontSize(12)
        doc.text(
          `Relatório de ${tipoRelatorio === "vendas" ? "Vendas" : tipoRelatorio === "produtos" ? "Produtos" : "Clientes"}`,
          14,
          30,
        )
        doc.text(`Período: ${formatarData(dataInicio)} a ${formatarData(dataFim)}`, 14, 36)

        // Resumo
        doc.setFontSize(14)
        doc.text("Resumo", 14, 46)

        doc.setFontSize(10)
        doc.text(`Total de Vendas: ${resumo.totalVendas}`, 14, 54)
        doc.text(`Valor Total: R$ ${resumo.valorTotal.toFixed(2)}`, 14, 60)
        doc.text(
          `Produto Mais Vendido: ${resumo.produtoMaisVendido.nome} (${resumo.produtoMaisVendido.quantidade} unid.)`,
          14,
          66,
        )
        doc.text(
          `Melhor Cliente: ${resumo.clienteMaisComprou.nome} (R$ ${resumo.clienteMaisComprou.valor.toFixed(2)})`,
          14,
          72,
        )

        // Tabela de dados
        doc.setFontSize(14)
        doc.text("Dados Detalhados", 14, 82)

        // Configurar colunas e dados para a tabela
        let columns = []
        let data = []

        if (tipoRelatorio === "vendas") {
          const campos = camposSelecionados.vendas
          columns = campos.map((campo) => {
            switch (campo) {
              case "data":
                return { header: "Data", dataKey: "data" }
              case "cliente":
                return { header: "Cliente", dataKey: "cliente" }
              case "itens":
                return { header: "Itens", dataKey: "itens" }
              case "valorTotal":
                return { header: "Valor Total", dataKey: "valorTotal" }
              case "metodoPagamento":
                return { header: "Pagamento", dataKey: "metodoPagamento" }
              case "vendedor":
                return { header: "Vendedor", dataKey: "vendedor" }
              default:
                return { header: campo, dataKey: campo }
            }
          })

          data = dadosRelatorio.map((venda) => {
            const row = {}
            campos.forEach((campo) => {
              if (campo === "valorTotal") {
                row[campo] = `R$ ${venda[campo].toFixed(2)}`
              } else {
                row[campo] = venda[campo]
              }
            })
            return row
          })
        } else if (tipoRelatorio === "produtos") {
          const campos = camposSelecionados.produtos
          columns = campos.map((campo) => {
            switch (campo) {
              case "nome":
                return { header: "Produto", dataKey: "nome" }
              case "quantidade":
                return { header: "Quantidade", dataKey: "quantidade" }
              case "valor":
                return { header: "Valor Total", dataKey: "valor" }
              case "media":
                return { header: "Valor Médio", dataKey: "media" }
              default:
                return { header: campo, dataKey: campo }
            }
          })

          data = dadosRelatorio.map((produto) => {
            const row = {}
            campos.forEach((campo) => {
              if (campo === "valor" || campo === "media") {
                row[campo] = `R$ ${produto[campo].toFixed(2)}`
              } else {
                row[campo] = produto[campo]
              }
            })
            return row
          })
        } else if (tipoRelatorio === "clientes") {
          const campos = camposSelecionados.clientes
          columns = campos.map((campo) => {
            switch (campo) {
              case "nome":
                return { header: "Cliente", dataKey: "nome" }
              case "compras":
                return { header: "Compras", dataKey: "compras" }
              case "valor":
                return { header: "Valor Total", dataKey: "valor" }
              case "media":
                return { header: "Valor Médio", dataKey: "media" }
              default:
                return { header: campo, dataKey: campo }
            }
          })

          data = dadosRelatorio.map((cliente) => {
            const row = {}
            campos.forEach((campo) => {
              if (campo === "valor" || campo === "media") {
                row[campo] = `R$ ${cliente[campo].toFixed(2)}`
              } else {
                row[campo] = cliente[campo]
              }
            })
            return row
          })
        }

        // Adicionar a tabela ao PDF
        doc.autoTable({
          startY: 90,
          head: [columns.map((col) => col.header)],
          body: data.map((row) => columns.map((col) => row[col.dataKey])),
          theme: "grid",
          headStyles: { fillColor: [66, 139, 202] },
        })

        // Rodapé
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(8)
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.text(
            `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString()}`,
            14,
            doc.internal.pageSize.height - 10,
          )
        }

        // Salvar o PDF
        doc.save(`relatorio_${tipoRelatorio}_${dataInicio}_${dataFim}.pdf`)

        toast({
          description: "Relatório PDF exportado com sucesso!",
        })
      } catch (error) {
        console.error("Erro ao gerar PDF:", error)
        toast({
          variant: "destructive",
          description: "Erro ao gerar o PDF. Tente novamente.",
        })
      }

      setActionLoading("")
    }, 1500)
  }

  const handleCampoChange = (tipo, campo, checked) => {
    setCamposSelecionados((prev) => {
      const novosCampos = checked ? [...prev[tipo], campo] : prev[tipo].filter((c) => c !== campo)

      return {
        ...prev,
        [tipo]: novosCampos,
      }
    })
  }

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          Relatórios
        </h1>
        <p className="text-gray-500">Análise de dados e desempenho</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div className="grid grid-cols-2 gap-2 flex-1">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Data Inicial</label>
                  <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Data Final</label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="w-full md:w-64">
              <label className="text-xs text-gray-500 mb-1 block">Tipo de Relatório</label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={exportarCSV}
                disabled={actionLoading === "exportarCSV"}
              >
                {actionLoading === "exportarCSV" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                CSV
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={exportarPDF}
                disabled={actionLoading === "exportarPDF"}
              >
                {actionLoading === "exportarPDF" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                PDF
              </Button>
            </div>
          </div>

          {/* Filtros adicionais para vendas */}
          {tipoRelatorio === "vendas" && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64">
                  <label className="text-xs text-gray-500 mb-1 block">Método de Pagamento</label>
                  <Select
                    value={filtros.metodoPagamento}
                    onValueChange={(value) => handleFiltroChange("metodoPagamento", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="fiado">Fiado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-64">
                  <label className="text-xs text-gray-500 mb-1 block">Valor Mínimo (R$)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filtros.valorMinimo}
                    onChange={(e) => handleFiltroChange("valorMinimo", e.target.value)}
                    placeholder="Valor mínimo"
                  />
                </div>

                <div className="w-full md:w-64">
                  <label className="text-xs text-gray-500 mb-1 block">Valor Máximo (R$)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filtros.valorMaximo}
                    onChange={(e) => handleFiltroChange("valorMaximo", e.target.value)}
                    placeholder="Valor máximo"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seleção de campos */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4" />
              <h3 className="text-sm font-medium">Campos a exibir no relatório</h3>
            </div>

            <div className="flex flex-wrap gap-4">
              {tipoRelatorio === "vendas" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-data"
                      checked={camposSelecionados.vendas.includes("data")}
                      onCheckedChange={(checked) => handleCampoChange("vendas", "data", checked)}
                    />
                    <label htmlFor="campo-data" className="text-sm">
                      Data
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-cliente"
                      checked={camposSelecionados.vendas.includes("cliente")}
                      onCheckedChange={(checked) => handleCampoChange("vendas", "cliente", checked)}
                    />
                    <label htmlFor="campo-cliente" className="text-sm">
                      Cliente
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-itens"
                      checked={camposSelecionados.vendas.includes("itens")}
                      onCheckedChange={(checked) => handleCampoChange("vendas", "itens", checked)}
                    />
                    <label htmlFor="campo-itens" className="text-sm">
                      Itens
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-valorTotal"
                      checked={camposSelecionados.vendas.includes("valorTotal")}
                      onCheckedChange={(checked) => handleCampoChange("vendas", "valorTotal", checked)}
                    />
                    <label htmlFor="campo-valorTotal" className="text-sm">
                      Valor Total
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-metodoPagamento"
                      checked={camposSelecionados.vendas.includes("metodoPagamento")}
                      onCheckedChange={(checked) => handleCampoChange("vendas", "metodoPagamento", checked)}
                    />
                    <label htmlFor="campo-metodoPagamento" className="text-sm">
                      Método de Pagamento
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-vendedor"
                      checked={camposSelecionados.vendas.includes("vendedor")}
                      onCheckedChange={(checked) => handleCampoChange("vendas", "vendedor", checked)}
                    />
                    <label htmlFor="campo-vendedor" className="text-sm">
                      Vendedor
                    </label>
                  </div>
                </>
              )}

              {tipoRelatorio === "produtos" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-nome-produto"
                      checked={camposSelecionados.produtos.includes("nome")}
                      onCheckedChange={(checked) => handleCampoChange("produtos", "nome", checked)}
                    />
                    <label htmlFor="campo-nome-produto" className="text-sm">
                      Nome
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-quantidade"
                      checked={camposSelecionados.produtos.includes("quantidade")}
                      onCheckedChange={(checked) => handleCampoChange("produtos", "quantidade", checked)}
                    />
                    <label htmlFor="campo-quantidade" className="text-sm">
                      Quantidade
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-valor-produto"
                      checked={camposSelecionados.produtos.includes("valor")}
                      onCheckedChange={(checked) => handleCampoChange("produtos", "valor", checked)}
                    />
                    <label htmlFor="campo-valor-produto" className="text-sm">
                      Valor Total
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-media-produto"
                      checked={camposSelecionados.produtos.includes("media")}
                      onCheckedChange={(checked) => handleCampoChange("produtos", "media", checked)}
                    />
                    <label htmlFor="campo-media-produto" className="text-sm">
                      Valor Médio
                    </label>
                  </div>
                </>
              )}

              {tipoRelatorio === "clientes" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-nome-cliente"
                      checked={camposSelecionados.clientes.includes("nome")}
                      onCheckedChange={(checked) => handleCampoChange("clientes", "nome", checked)}
                    />
                    <label htmlFor="campo-nome-cliente" className="text-sm">
                      Nome
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-compras"
                      checked={camposSelecionados.clientes.includes("compras")}
                      onCheckedChange={(checked) => handleCampoChange("clientes", "compras", checked)}
                    />
                    <label htmlFor="campo-compras" className="text-sm">
                      Compras
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-valor-cliente"
                      checked={camposSelecionados.clientes.includes("valor")}
                      onCheckedChange={(checked) => handleCampoChange("clientes", "valor", checked)}
                    />
                    <label htmlFor="campo-valor-cliente" className="text-sm">
                      Valor Total
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="campo-media-cliente"
                      checked={camposSelecionados.clientes.includes("media")}
                      onCheckedChange={(checked) => handleCampoChange("clientes", "media", checked)}
                    />
                    <label htmlFor="campo-media-cliente" className="text-sm">
                      Valor Médio
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Vendas</p>
                <h3 className="text-2xl font-bold mt-1">{resumo.totalVendas}</h3>
                <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Valor Total</p>
                <h3 className="text-2xl font-bold mt-1">R$ {resumo.valorTotal.toFixed(2)}</h3>
                <p className="text-xs text-gray-500 mt-1">Receita no período</p>
              </div>
              <div className="bg-green-50 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Produto Mais Vendido</p>
                <h3 className="text-lg font-bold mt-1 truncate max-w-[150px]">{resumo.produtoMaisVendido.nome}</h3>
                <p className="text-xs text-gray-500 mt-1">{resumo.produtoMaisVendido.quantidade} unidades</p>
              </div>
              <div className="bg-purple-50 p-2 rounded-full">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Melhor Cliente</p>
                <h3 className="text-lg font-bold mt-1 truncate max-w-[150px]">{resumo.clienteMaisComprou.nome}</h3>
                <p className="text-xs text-gray-500 mt-1">R$ {resumo.clienteMaisComprou.valor.toFixed(2)}</p>
              </div>
              <div className="bg-amber-50 p-2 rounded-full">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendência de{" "}
            {tipoRelatorio === "vendas" ? "Vendas" : tipoRelatorio === "produtos" ? "Produtos" : "Clientes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tipoRelatorio === "vendas" && (
            <TendenciaChart
              vendas={vendas.filter(
                (v) => new Date(v.data) >= new Date(dataInicio) && new Date(v.data) <= new Date(dataFim),
              )}
            />
          )}
          {tipoRelatorio === "produtos" && <ProdutosChart produtos={dadosRelatorio} />}
          {tipoRelatorio === "clientes" && <ClientesChart clientes={dadosRelatorio} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {tipoRelatorio === "vendas" && "Relatório de Vendas"}
            {tipoRelatorio === "produtos" && "Relatório de Produtos"}
            {tipoRelatorio === "clientes" && "Relatório de Clientes"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dadosRelatorio.length > 0 ? (
            <div className="overflow-x-auto" ref={tableRef}>
              <Table>
                <TableHeader>
                  {tipoRelatorio === "vendas" && (
                    <TableRow>
                      {camposSelecionados.vendas.includes("data") && <TableHead>Data</TableHead>}
                      {camposSelecionados.vendas.includes("cliente") && <TableHead>Cliente</TableHead>}
                      {camposSelecionados.vendas.includes("itens") && (
                        <TableHead className="text-center">Itens</TableHead>
                      )}
                      {camposSelecionados.vendas.includes("metodoPagamento") && <TableHead>Pagamento</TableHead>}
                      {camposSelecionados.vendas.includes("valorTotal") && (
                        <TableHead className="text-right">Valor</TableHead>
                      )}
                      {camposSelecionados.vendas.includes("vendedor") && <TableHead>Vendedor</TableHead>}
                    </TableRow>
                  )}
                  {tipoRelatorio === "produtos" && (
                    <TableRow>
                      {camposSelecionados.produtos.includes("nome") && <TableHead>Produto</TableHead>}
                      {camposSelecionados.produtos.includes("quantidade") && (
                        <TableHead className="text-center">Quantidade</TableHead>
                      )}
                      {camposSelecionados.produtos.includes("valor") && (
                        <TableHead className="text-right">Valor Total</TableHead>
                      )}
                      {camposSelecionados.produtos.includes("media") && (
                        <TableHead className="text-right">Valor Médio</TableHead>
                      )}
                    </TableRow>
                  )}
                  {tipoRelatorio === "clientes" && (
                    <TableRow>
                      {camposSelecionados.clientes.includes("nome") && <TableHead>Cliente</TableHead>}
                      {camposSelecionados.clientes.includes("compras") && (
                        <TableHead className="text-center">Compras</TableHead>
                      )}
                      {camposSelecionados.clientes.includes("valor") && (
                        <TableHead className="text-right">Valor Total</TableHead>
                      )}
                      {camposSelecionados.clientes.includes("media") && (
                        <TableHead className="text-right">Valor Médio</TableHead>
                      )}
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {tipoRelatorio === "vendas" &&
                    dadosRelatorio.map((venda) => (
                      <TableRow key={venda.id}>
                        {camposSelecionados.vendas.includes("data") && <TableCell>{venda.data}</TableCell>}
                        {camposSelecionados.vendas.includes("cliente") && <TableCell>{venda.cliente}</TableCell>}
                        {camposSelecionados.vendas.includes("itens") && (
                          <TableCell className="text-center">{venda.itens}</TableCell>
                        )}
                        {camposSelecionados.vendas.includes("metodoPagamento") && (
                          <TableCell>{venda.metodoPagamento}</TableCell>
                        )}
                        {camposSelecionados.vendas.includes("valorTotal") && (
                          <TableCell className="text-right font-medium">R$ {venda.valorTotal.toFixed(2)}</TableCell>
                        )}
                        {camposSelecionados.vendas.includes("vendedor") && <TableCell>{venda.vendedor}</TableCell>}
                      </TableRow>
                    ))}
                  {tipoRelatorio === "produtos" &&
                    dadosRelatorio.map((produto, index) => (
                      <TableRow key={index}>
                        {camposSelecionados.produtos.includes("nome") && <TableCell>{produto.nome}</TableCell>}
                        {camposSelecionados.produtos.includes("quantidade") && (
                          <TableCell className="text-center">{produto.quantidade}</TableCell>
                        )}
                        {camposSelecionados.produtos.includes("valor") && (
                          <TableCell className="text-right">R$ {produto.valor.toFixed(2)}</TableCell>
                        )}
                        {camposSelecionados.produtos.includes("media") && (
                          <TableCell className="text-right">R$ {produto.media.toFixed(2)}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  {tipoRelatorio === "clientes" &&
                    dadosRelatorio.map((cliente, index) => (
                      <TableRow key={index}>
                        {camposSelecionados.clientes.includes("nome") && <TableCell>{cliente.nome}</TableCell>}
                        {camposSelecionados.clientes.includes("compras") && (
                          <TableCell className="text-center">{cliente.compras}</TableCell>
                        )}
                        {camposSelecionados.clientes.includes("valor") && (
                          <TableCell className="text-right">R$ {cliente.valor.toFixed(2)}</TableCell>
                        )}
                        {camposSelecionados.clientes.includes("media") && (
                          <TableCell className="text-right">R$ {cliente.media.toFixed(2)}</TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BarChart2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-500">Nenhum dado encontrado</h3>
              <p className="text-gray-500 text-sm mt-1">Tente ajustar os filtros ou selecionar outro período</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
