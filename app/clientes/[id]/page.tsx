"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  User2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  Package,
  ShoppingBag,
  Clock,
} from "lucide-react"

export default function ClienteDetalhes() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [compras, setCompras] = useState([])
  const [produtosComprados, setProdutosComprados] = useState([])

  useEffect(() => {
    // Buscar dados do cliente
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    const clienteEncontrado = clientes.find((c) => c.id === id)

    if (!clienteEncontrado) {
      router.push("/clientes")
      return
    }

    setCliente(clienteEncontrado)

    // Buscar histórico de compras
    const vendas = JSON.parse(localStorage.getItem("vendas") || "[]")
    const comprasDoCliente = vendas
      .filter((v) => v.cliente && v.cliente.id === id)
      .sort((a, b) => new Date(b.data) - new Date(a.data))

    setCompras(comprasDoCliente)

    // Calcular produtos mais comprados
    const produtosMap = {}
    comprasDoCliente.forEach((compra) => {
      compra.itens.forEach((item) => {
        if (!produtosMap[item.id]) {
          produtosMap[item.id] = {
            id: item.id,
            nome: item.nome,
            quantidade: 0,
            totalGasto: 0,
          }
        }
        produtosMap[item.id].quantidade += item.quantidade
        produtosMap[item.id].totalGasto += item.preco * item.quantidade
      })
    })

    const produtosArray = Object.values(produtosMap)
    setProdutosComprados(produtosArray.sort((a, b) => b.quantidade - a.quantidade))

    setLoading(false)
  }, [id, router])

  const formatarData = (dataIso) => {
    if (!dataIso) return "Não informada"
    const data = new Date(dataIso)
    return data.toLocaleDateString("pt-BR")
  }

  const diasDesdeCompra = (dataIso) => {
    if (!dataIso) return "-"
    const data = new Date(dataIso)
    const hoje = new Date()
    const diff = Math.floor((hoje - data) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getTipoFiado = (venda) => {
    if (venda.metodoPagamento !== "fiado") return null

    const dias = diasDesdeCompra(venda.data)
    if (dias <= 7) return <Badge className="bg-green-500">7 dias</Badge>
    if (dias <= 15) return <Badge className="bg-yellow-500">15 dias</Badge>
    if (dias <= 30) return <Badge className="bg-orange-500">30 dias</Badge>
    return <Badge className="bg-red-500">+30 dias</Badge>
  }

  const calcularTotalCompras = () => {
    return compras.reduce((total, compra) => total + compra.valorTotal, 0)
  }

  const calcularLimiteUtilizado = () => {
    if (!cliente || cliente.limiteCredito === 0) return 0
    return (cliente.valorDevendo / cliente.limiteCredito) * 100
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" className="mb-2" onClick={() => router.push("/clientes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User2 className="h-6 w-6" />
            {cliente.nome}
          </h1>
          <p className="text-gray-500">Cadastrado em {formatarData(cliente.dataCadastro)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User2 className="h-5 w-5 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">{cliente.nome}</span>
                  <span className="text-xs text-gray-500">
                    {cliente.tipoCliente === "vip"
                      ? "Cliente VIP"
                      : cliente.tipoCliente === "novo"
                        ? "Cliente Novo"
                        : "Cliente Regular"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">{cliente.cpf || "Não informado"}</span>
                  <span className="text-xs text-gray-500">CPF</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">{cliente.telefone}</span>
                  <span className="text-xs text-gray-500">Telefone</span>
                </div>
              </div>

              {cliente.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">{cliente.email}</span>
                    <span className="text-xs text-gray-500">E-mail</span>
                  </div>
                </div>
              )}

              {cliente.endereco && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-medium">{cliente.endereco}</span>
                    <span className="text-xs text-gray-500">Endereço</span>
                  </div>
                </div>
              )}

              {cliente.dataNascimento && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">{formatarData(cliente.dataNascimento)}</span>
                    <span className="text-xs text-gray-500">Data de Nascimento</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crédito e Finanças</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Limite de Crédito</span>
                <span className="font-medium">R$ {cliente.limiteCredito.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Valor em Débito</span>
                <span className="font-medium text-red-600">R$ {cliente.valorDevendo.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Limite Disponível</span>
                <span className="font-medium text-green-600">
                  R$ {(cliente.limiteCredito - cliente.valorDevendo).toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Utilização do Limite</span>
                  <span className="text-xs">{calcularLimiteUtilizado().toFixed(1)}%</span>
                </div>
                <Progress value={calcularLimiteUtilizado()} className="h-2" />
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm">Total de Compras</span>
                <span className="font-medium">R$ {calcularTotalCompras().toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Média por Compra</span>
                <span className="font-medium">
                  R$ {compras.length ? (calcularTotalCompras() / compras.length).toFixed(2) : "0.00"}
                </span>
              </div>
            </CardContent>
          </Card>

          {cliente.alergias && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Alergias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{cliente.alergias}</p>
              </CardContent>
            </Card>
          )}

          {cliente.medicamentosRecorrentes && cliente.medicamentosRecorrentes.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  Medicamentos Recorrentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cliente.medicamentosRecorrentes.map((med, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{med}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          diasDesdeCompra(cliente.ultimaCompraRecorrente?.[med]) > 25
                            ? "border-red-500 text-red-500"
                            : "border-green-500 text-green-500"
                        }`}
                      >
                        {cliente.ultimaCompraRecorrente?.[med]
                          ? `Última compra: ${formatarData(cliente.ultimaCompraRecorrente[med])}`
                          : "Não comprado ainda"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="historico" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="historico">Histórico de Compras</TabsTrigger>
              <TabsTrigger value="produtos">Produtos Comprados</TabsTrigger>
            </TabsList>

            <TabsContent value="historico" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Últimas Compras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {compras.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Forma de Pagamento</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead>Dias</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {compras.map((compra) => (
                            <TableRow key={compra.id}>
                              <TableCell>{formatarData(compra.data)}</TableCell>
                              <TableCell>{compra.itens.length}</TableCell>
                              <TableCell className="flex items-center gap-1">
                                {compra.metodoPagamento === "dinheiro"
                                  ? "Dinheiro"
                                  : compra.metodoPagamento === "credito"
                                    ? "Cartão"
                                    : compra.metodoPagamento === "pix"
                                      ? "PIX"
                                      : "Fiado"}
                                {getTipoFiado(compra)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                R$ {compra.valorTotal.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {diasDesdeCompra(compra.data)}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium">Nenhuma compra registrada</h3>
                      <p className="text-gray-500 text-sm">Este cliente ainda não realizou nenhuma compra</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="produtos" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Produtos Mais Comprados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {produtosComprados.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-center">Quantidade</TableHead>
                            <TableHead className="text-right">Total Gasto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {produtosComprados.map((produto) => (
                            <TableRow key={produto.id}>
                              <TableCell>{produto.nome}</TableCell>
                              <TableCell className="text-center">{produto.quantidade}</TableCell>
                              <TableCell className="text-right font-medium">
                                R$ {produto.totalGasto.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium">Nenhum produto comprado</h3>
                      <p className="text-gray-500 text-sm">Este cliente ainda não comprou nenhum produto</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
