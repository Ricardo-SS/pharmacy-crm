"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Settings, Building, User, Save, Pill } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dadosFarmacia, setDadosFarmacia] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    cidade: "",
    telefone: "",
    email: "",
    responsavelTecnico: "",
    crf: "",
  })

  useEffect(() => {
    // Carregar dados da farmácia
    const storedDados = JSON.parse(localStorage.getItem("dadosFarmacia") || "null")
    if (storedDados) {
      setDadosFarmacia(storedDados)
    }

    setLoading(false)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setDadosFarmacia((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const salvarDadosFarmacia = () => {
    // Validar campos obrigatórios
    if (!dadosFarmacia.nome || !dadosFarmacia.cnpj) {
      toast({
        variant: "destructive",
        description: "Nome e CNPJ são campos obrigatórios.",
      })
      return
    }

    // Salvar no localStorage
    localStorage.setItem("dadosFarmacia", JSON.stringify(dadosFarmacia))

    toast({
      description: "Dados da farmácia salvos com sucesso!",
    })
  }

  const limparDados = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados do sistema? Esta ação não pode ser desfeita.")) {
      localStorage.clear()
      toast({
        description: "Todos os dados foram removidos. A página será recarregada.",
      })
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configurações
        </h1>
        <p className="text-gray-500">Configurações do sistema</p>
      </div>

      <Tabs defaultValue="farmacia">
        <TabsList>
          <TabsTrigger value="farmacia">Dados da Farmácia</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="farmacia" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-4 w-4" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Farmácia*</label>
                  <Input
                    name="nome"
                    value={dadosFarmacia.nome}
                    onChange={handleChange}
                    placeholder="Nome da farmácia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">CNPJ*</label>
                  <Input
                    name="cnpj"
                    value={dadosFarmacia.cnpj}
                    onChange={handleChange}
                    placeholder="XX.XXX.XXX/0001-XX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    name="telefone"
                    value={dadosFarmacia.telefone}
                    onChange={handleChange}
                    placeholder="(XX) XXXX-XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    name="email"
                    value={dadosFarmacia.email}
                    onChange={handleChange}
                    placeholder="contato@farmacia.com"
                    type="email"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Endereço</label>
                  <Input
                    name="endereco"
                    value={dadosFarmacia.endereco}
                    onChange={handleChange}
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cidade/Estado</label>
                  <Input name="cidade" value={dadosFarmacia.cidade} onChange={handleChange} placeholder="Cidade - UF" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsável Técnico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Responsável</label>
                  <Input
                    name="responsavelTecnico"
                    value={dadosFarmacia.responsavelTecnico}
                    onChange={handleChange}
                    placeholder="Nome do farmacêutico responsável"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">CRF</label>
                  <Input name="crf" value={dadosFarmacia.crf} onChange={handleChange} placeholder="CRF-XX XXXXX" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={salvarDadosFarmacia} className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Gerenciamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Backup e Restauração</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Faça backup dos seus dados para evitar perdas ou restaure a partir de um backup anterior.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar Backup</Button>
                  <Button variant="outline">Importar Backup</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2 text-red-600">Zona de Perigo</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Estas ações são irreversíveis e podem causar perda de dados.
                </p>
                <Button variant="destructive" onClick={limparDados}>
                  Limpar Todos os Dados
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sobre o Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-lg">PharmaCRM</h3>
                </div>
                <p className="text-sm text-gray-500">Sistema de CRM e PDV para Farmácias</p>
                <p className="text-sm text-gray-500">Versão 1.0.0</p>
                <p className="text-sm text-gray-500 pt-2">
                  © {new Date().getFullYear()} PharmaCRM. Todos os direitos reservados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
