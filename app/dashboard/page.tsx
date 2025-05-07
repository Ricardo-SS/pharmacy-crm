"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ShoppingBag, Package, AlertCircle, TrendingUp, CreditCard, Keyboard } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { initializeData } from "@/lib/init-data"
import { useRouter } from "next/navigation"
import InfoCard from "@/components/info-card"
import ClientesBirthday from "@/components/clientes-birthday"
import LowStockAlert from "@/components/low-stock-alert"
import SalesChart from "@/components/sales-chart"

export default function Dashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalProdutos: 0,
    vendasHoje: 0,
    receitaHoje: 0,
    produtosBaixoEstoque: 0,
    clientesAniversario: 0,
  })

  useEffect(() => {
    // Inicializa dados de exemplo se não existirem
    initializeData()

    // Carregar estatísticas
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
    const vendas = JSON.parse(localStorage.getItem("vendas") || "[]")

    // Filtrar vendas de hoje
    const hoje = new Date().toISOString().split("T")[0]
    const vendasHoje = vendas.filter((v) => v.data.split("T")[0] === hoje)

    const receitaHoje = vendasHoje.reduce((acc, v) => acc + v.valorTotal, 0)

    const produtosBaixoEstoque = produtos.filter((p) => p.quantidadeDisponivel < 10).length

    // Filtrar aniversariantes do mês
    const mesAtual = new Date().getMonth() + 1
    const aniversariantes = clientes.filter((c) => {
      if (!c.dataNascimento) return false
      const mes = new Date(c.dataNascimento).getMonth() + 1
      return mes === mesAtual
    }).length

    setStats({
      totalClientes: clientes.length,
      totalProdutos: produtos.length,
      vendasHoje: vendasHoje.length,
      receitaHoje,
      produtosBaixoEstoque,
      clientesAniversario: aniversariantes,
    })

    setIsLoading(false)
  }, [])

  const navigateTo = (route) => {
    router.push(route)
  }

  const ShortcutHelpBar = () => {
    return (
      <div className="bg-gray-800 text-white p-2 text-xs flex justify-center space-x-4 rounded-md mb-4">
        <span className="flex items-center">
          <Keyboard className="h-3 w-3 mr-1" />
          Atalhos do Sistema:
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">Alt+C</kbd> Clientes
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">Alt+P</kbd> Produtos
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">Alt+V</kbd> PDV
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">Alt+X</kbd> Caixa
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-700 rounded">Alt+R</kbd> Relatórios
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Carregando sistema...</h2>
          <Progress value={33} className="w-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo ao Sistema de Gestão para Farmácias</p>
      </div>

      <ShortcutHelpBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigateTo("/clientes")} className="cursor-pointer transition-transform hover:scale-[1.02]">
          <InfoCard
            title="Total de Clientes"
            value={stats.totalClientes}
            description="Clientes cadastrados"
            icon={<Users className="h-5 w-5 text-red-600" />}
            trend="+5% em 30 dias"
          />
        </div>
        <div onClick={() => navigateTo("/produtos")} className="cursor-pointer transition-transform hover:scale-[1.02]">
          <InfoCard
            title="Produtos"
            value={stats.totalProdutos}
            description="Produtos no catálogo"
            icon={<Package className="h-5 w-5 text-green-600" />}
            trend="+12 produtos novos"
          />
        </div>
        <div onClick={() => navigateTo("/caixa")} className="cursor-pointer transition-transform hover:scale-[1.02]">
          <InfoCard
            title="Vendas de Hoje"
            value={stats.vendasHoje}
            description={`R$ ${stats.receitaHoje.toFixed(2)}`}
            icon={<ShoppingBag className="h-5 w-5 text-purple-600" />}
            trend="+2% que ontem"
          />
        </div>
        <div className="cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => navigateTo("/produtos")}>
          <InfoCard
            title="Alertas"
            value={stats.produtosBaixoEstoque}
            description="Produtos com estoque baixo"
            icon={<AlertCircle className="h-5 w-5 text-red-600" />}
            trend="Ação necessária"
          />
        </div>
      </div>

      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>
        <TabsContent value="vendas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Desempenho de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Métodos de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Cartão de Crédito</span>
                      <span className="text-sm font-medium">55%</span>
                    </div>
                    <Progress value={55} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Dinheiro</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Pix</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Fiado</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LowStockAlert />
            <ClientesBirthday />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
