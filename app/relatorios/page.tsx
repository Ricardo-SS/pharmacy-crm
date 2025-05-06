"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart2, Download, Calendar, TrendingUp, Package, Users, DollarSign, ShoppingCart } from "lucide-react"

export default function RelatoriosPage() {
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
  }, [dataInicio, dataFim, tipoRelatorio, vendas, produtos, clientes])

  const gerarRelatorio = () => {
    // Filtrar vendas pelo período
    const vendasPeriodo = vendas.filter((venda) => {
      const dataVenda = new Date(venda.data)
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)
      fim.setHours(23, 59, 59) // Incluir o dia final completo

      return dataVenda >= inicio && dataVenda <= fim
    })

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
    // Função para exportar os dados do relatório em CSV
    let csv = ""

    // Cabeçalhos
    if (tipoRelatorio === "vendas") {
      csv = "ID,Data,Cliente,Itens,Valor Total,Método de Pagamento\n"
      dadosRelatorio.forEach((venda) => {
        csv += `${venda.id},${venda.data},"${venda.cliente}",${venda.itens},${venda.valorTotal},${venda.metodoPagamento}\n`
      })
    } else if (tipoRelatorio === "produtos") {
      csv = "Produto,Quantidade,Valor Total,Valor Médio\n"
      dadosRelatorio.forEach((produto) => {
        csv += `"${produto.nome}",${produto.quantidade},${produto.valor.toFixed(2)},${produto.media.toFixed(2)}\n`
      })
    } else if (tipoRelatorio === "clientes") {
      csv = "Cliente,Compras,Valor Total,Valor Médio\n"
      dadosRelatorio.forEach((cliente) => {
        csv += `"${cliente.nome}",${cliente.compras},${cliente.valor.toFixed(2)},${cliente.media.toFixed(2)}\n`
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

            <div className="flex items-end">
              <Button variant="outline" className="gap-2" onClick={exportarCSV}>
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
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
            {tipoRelatorio === "vendas" && "Relatório de Vendas"}
            {tipoRelatorio === "produtos" && "Relatório de Produtos"}
            {tipoRelatorio === "clientes" && "Relatório de Clientes"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dadosRelatorio.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {tipoRelatorio === "vendas" && (
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Itens</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  )}
                  {tipoRelatorio === "produtos" && (
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Valor Médio</TableHead>
                    </TableRow>
                  )}
                  {tipoRelatorio === "clientes" && (
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Compras</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Valor Médio</TableHead>
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {tipoRelatorio === "vendas" &&
                    dadosRelatorio.map((venda) => (
                      <TableRow key={venda.id}>
                        <TableCell>{venda.data}</TableCell>
                        <TableCell>{venda.cliente}</TableCell>
                        <TableCell className="text-center">{venda.itens}</TableCell>
                        <TableCell>{venda.metodoPagamento}</TableCell>
                        <TableCell className="text-right font-medium">R$ {venda.valorTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  {tipoRelatorio === "produtos" &&
                    dadosRelatorio.map((produto, index) => (
                      <TableRow key={index}>
                        <TableCell>{produto.nome}</TableCell>
                        <TableCell className="text-center">{produto.quantidade}</TableCell>
                        <TableCell className="text-right">R$ {produto.valor.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {produto.media.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  {tipoRelatorio === "clientes" &&
                    dadosRelatorio.map((cliente, index) => (
                      <TableRow key={index}>
                        <TableCell>{cliente.nome}</TableCell>
                        <TableCell className="text-center">{cliente.compras}</TableCell>
                        <TableCell className="text-right">R$ {cliente.valor.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {cliente.media.toFixed(2)}</TableCell>
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
