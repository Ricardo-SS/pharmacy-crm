"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Building,
  Save,
  User,
  Lock,
  Loader2,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Trash2,
  Plus,
  Users,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("farmacia")

  // Dados da farmácia
  const [dadosFarmacia, setDadosFarmacia] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    cidade: "",
    telefone: "",
    email: "",
    responsavel: "",
  })

  // Dados do usuário
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  // Dados de cupons
  const [cupons, setCupons] = useState([])
  const [cupomDialogOpen, setCupomDialogOpen] = useState(false)
  const [cupomClienteDialogOpen, setCupomClienteDialogOpen] = useState(false)
  const [novoCupom, setNovoCupom] = useState({
    id: "",
    codigo: "",
    descricao: "",
    tipo: "percentual",
    valor: 0,
    quantidade: 1,
    validade: "",
  })
  const [clientes, setClientes] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState("")
  const [cupomSelecionado, setCupomSelecionado] = useState("")
  const [editandoCupom, setEditandoCupom] = useState(false)

  useEffect(() => {
    // Carregar dados da farmácia
    const storedDadosFarmacia = JSON.parse(localStorage.getItem("dadosFarmacia") || "null")
    if (storedDadosFarmacia) {
      setDadosFarmacia(storedDadosFarmacia)
    }

    // Carregar usuário logado
    const loggedUser = JSON.parse(localStorage.getItem("usuarioLogado") || "null")
    setUsuarioLogado(loggedUser)

    // Carregar cupons
    const storedCupons = JSON.parse(localStorage.getItem("cupons") || "[]")
    setCupons(storedCupons)

    // Carregar clientes
    const storedClientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    setClientes(storedClientes)
  }, [])

  const handleFarmaciaChange = (e) => {
    const { name, value } = e.target
    setDadosFarmacia((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const salvarDadosFarmacia = () => {
    setLoading(true)

    // Simular tempo de processamento
    setTimeout(() => {
      localStorage.setItem("dadosFarmacia", JSON.stringify(dadosFarmacia))

      toast({
        description: "Dados da farmácia salvos com sucesso!",
      })

      setLoading(false)
    }, 1000)
  }

  const alterarSenha = () => {
    setLoading(true)

    // Simular tempo de processamento
    setTimeout(() => {
      // Verificar se a senha atual está correta
      if (senhaAtual !== usuarioLogado.senha) {
        toast({
          variant: "destructive",
          description: "Senha atual incorreta.",
        })
        setLoading(false)
        return
      }

      // Verificar se as senhas novas coincidem
      if (novaSenha !== confirmarSenha) {
        toast({
          variant: "destructive",
          description: "As senhas não coincidem.",
        })
        setLoading(false)
        return
      }

      // Atualizar senha do usuário
      const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]")
      const usuarioIndex = usuarios.findIndex((u) => u.id === usuarioLogado.id)

      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex] = {
          ...usuarios[usuarioIndex],
          senha: novaSenha,
        }

        localStorage.setItem("usuarios", JSON.stringify(usuarios))

        // Atualizar usuário logado
        const updatedUser = {
          ...usuarioLogado,
          senha: novaSenha,
        }

        localStorage.setItem("usuarioLogado", JSON.stringify(updatedUser))
        setUsuarioLogado(updatedUser)

        // Limpar campos
        setSenhaAtual("")
        setNovaSenha("")
        setConfirmarSenha("")

        toast({
          description: "Senha alterada com sucesso!",
        })
      }

      setLoading(false)
    }, 1000)
  }

  const handleNovoCupomChange = (e) => {
    const { name, value } = e.target
    setNovoCupom((prev) => ({
      ...prev,
      [name]: name === "valor" || name === "quantidade" ? Number(value) : value,
    }))
  }

  const handleTipoCupomChange = (value) => {
    setNovoCupom((prev) => ({
      ...prev,
      tipo: value,
    }))
  }

  const abrirDialogCupom = (cupom = null) => {
    if (cupom) {
      setNovoCupom({
        ...cupom,
        validade: cupom.validade ? cupom.validade.split("T")[0] : "",
      })
      setEditandoCupom(true)
    } else {
      setNovoCupom({
        id: Date.now().toString(),
        codigo: "",
        descricao: "",
        tipo: "percentual",
        valor: 0,
        quantidade: 1,
        validade: "",
      })
      setEditandoCupom(false)
    }
    setCupomDialogOpen(true)
  }

  const salvarCupom = () => {
    setLoading(true)

    // Validar dados do cupom
    if (!novoCupom.codigo || novoCupom.valor <= 0) {
      toast({
        variant: "destructive",
        description: "Preencha todos os campos obrigatórios.",
      })
      setLoading(false)
      return
    }

    // Simular tempo de processamento
    setTimeout(() => {
      let novosCupons = []

      if (editandoCupom) {
        // Atualizar cupom existente
        novosCupons = cupons.map((c) => (c.id === novoCupom.id ? novoCupom : c))
      } else {
        // Adicionar novo cupom
        novosCupons = [...cupons, novoCupom]
      }

      setCupons(novosCupons)
      localStorage.setItem("cupons", JSON.stringify(novosCupons))

      setCupomDialogOpen(false)
      setLoading(false)

      toast({
        description: `Cupom ${editandoCupom ? "atualizado" : "adicionado"} com sucesso!`,
      })
    }, 800)
  }

  const excluirCupom = (id) => {
    setLoading(true)

    // Simular tempo de processamento
    setTimeout(() => {
      const novosCupons = cupons.filter((c) => c.id !== id)
      setCupons(novosCupons)
      localStorage.setItem("cupons", JSON.stringify(novosCupons))

      setLoading(false)

      toast({
        description: "Cupom excluído com sucesso!",
      })
    }, 500)
  }

  const abrirDialogCupomCliente = () => {
    setCupomClienteDialogOpen(true)
    setClienteSelecionado("")
    setCupomSelecionado("")
  }

  const atribuirCupomAoCliente = () => {
    setLoading(true)

    // Validar seleções
    if (!clienteSelecionado || !cupomSelecionado) {
      toast({
        variant: "destructive",
        description: "Selecione um cliente e um cupom.",
      })
      setLoading(false)
      return
    }

    // Simular tempo de processamento
    setTimeout(() => {
      // Encontrar cliente e cupom
      const cliente = clientes.find((c) => c.id === clienteSelecionado)
      const cupom = cupons.find((c) => c.id === cupomSelecionado)

      if (!cliente || !cupom) {
        toast({
          variant: "destructive",
          description: "Cliente ou cupom não encontrado.",
        })
        setLoading(false)
        return
      }

      // Atualizar cliente com o novo cupom
      const clientesAtualizados = clientes.map((c) => {
        if (c.id === clienteSelecionado) {
          // Criar array de cupons se não existir
          const cuponsCliente = c.cupons || []

          // Verificar se o cliente já tem este cupom
          const cupomExistente = cuponsCliente.find((cup) => cup.codigo === cupom.codigo)

          if (cupomExistente) {
            toast({
              variant: "destructive",
              description: "Este cliente já possui este cupom.",
            })
            return c
          }

          // Adicionar cupom ao cliente
          return {
            ...c,
            cupons: [
              ...cuponsCliente,
              {
                id: Date.now().toString(),
                codigo: cupom.codigo,
                descricao: cupom.descricao,
                tipo: cupom.tipo,
                valor: cupom.valor,
                validade: cupom.validade,
              },
            ],
          }
        }
        return c
      })

      // Salvar clientes atualizados
      setClientes(clientesAtualizados)
      localStorage.setItem("clientes", JSON.stringify(clientesAtualizados))

      setCupomClienteDialogOpen(false)
      setLoading(false)

      toast({
        description: `Cupom atribuído ao cliente com sucesso!`,
      })
    }, 800)
  }

  const formatarData = (dataIso) => {
    if (!dataIso) return "Sem validade"
    const data = new Date(dataIso)
    return data.toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-500">Gerencie as configurações do sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="farmacia">Farmácia</TabsTrigger>
          <TabsTrigger value="conta">Sua Conta</TabsTrigger>
          <TabsTrigger value="cupons">Cupons</TabsTrigger>
        </TabsList>

        <TabsContent value="farmacia" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Farmácia
              </CardTitle>
              <CardDescription>Informações que aparecerão nos cupons e relatórios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Farmácia</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={dadosFarmacia.nome}
                    onChange={handleFarmaciaChange}
                    placeholder="Nome da Farmácia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={dadosFarmacia.cnpj}
                    onChange={handleFarmaciaChange}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={dadosFarmacia.endereco}
                    onChange={handleFarmaciaChange}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade/UF</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={dadosFarmacia.cidade}
                    onChange={handleFarmaciaChange}
                    placeholder="Cidade - UF"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={dadosFarmacia.telefone}
                    onChange={handleFarmaciaChange}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={dadosFarmacia.email}
                    onChange={handleFarmaciaChange}
                    placeholder="email@farmacia.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Farmacêutico Responsável</Label>
                  <Input
                    id="responsavel"
                    name="responsavel"
                    value={dadosFarmacia.responsavel}
                    onChange={handleFarmaciaChange}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>

              <Button onClick={salvarDadosFarmacia} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conta" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Sua Conta
              </CardTitle>
              <CardDescription>Gerencie suas informações pessoais e senha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome de Usuário</Label>
                <Input value={usuarioLogado?.nome || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input value={usuarioLogado?.cargo || ""} disabled />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5" />
                  Alterar Senha
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual">Senha Atual</Label>
                    <Input
                      id="senhaAtual"
                      type="password"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="novaSenha">Nova Senha</Label>
                    <Input
                      id="novaSenha"
                      type="password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={alterarSenha}
                    disabled={loading || !senhaAtual || !novaSenha || !confirmarSenha}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Alterar Senha
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cupons" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Gerenciamento de Cupons
              </CardTitle>
              <CardDescription>Crie e gerencie cupons de desconto para seus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Button onClick={() => abrirDialogCupom()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cupom
                </Button>
                <Button variant="outline" onClick={abrirDialogCupomCliente}>
                  <Users className="mr-2 h-4 w-4" />
                  Atribuir Cupom a Cliente
                </Button>
              </div>

              {cupons.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cupons.map((cupom) => (
                        <TableRow key={cupom.id}>
                          <TableCell className="font-medium">{cupom.codigo}</TableCell>
                          <TableCell>{cupom.descricao || "-"}</TableCell>
                          <TableCell>
                            {cupom.tipo === "percentual" ? `${cupom.valor}%` : `R$ ${cupom.valor.toFixed(2)}`}
                          </TableCell>
                          <TableCell>{cupom.quantidade}</TableCell>
                          <TableCell>{formatarData(cupom.validade)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => abrirDialogCupom(cupom)}
                                className="h-8 w-8"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => excluirCupom(cupom.id)}
                                className="h-8 w-8 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <Tag className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium">Nenhum cupom cadastrado</h3>
                  <p className="text-gray-500 mt-1">Clique em "Novo Cupom" para começar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar/editar cupom */}
      <Dialog open={cupomDialogOpen} onOpenChange={setCupomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editandoCupom ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
            <DialogDescription>
              {editandoCupom
                ? "Edite as informações do cupom de desconto."
                : "Crie um novo cupom de desconto para seus clientes."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Cupom*</Label>
              <Input
                id="codigo"
                name="codigo"
                value={novoCupom.codigo}
                onChange={handleNovoCupomChange}
                placeholder="Ex: FARMACIA10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={novoCupom.descricao}
                onChange={handleNovoCupomChange}
                placeholder="Descrição do cupom"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Desconto*</Label>
                <Select value={novoCupom.tipo} onValueChange={handleTipoCupomChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 mr-2" />
                        Percentual
                      </div>
                    </SelectItem>
                    <SelectItem value="valor">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Valor Fixo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">{novoCupom.tipo === "percentual" ? "Percentual (%)*" : "Valor (R$)*"}</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  min="0"
                  step={novoCupom.tipo === "percentual" ? "1" : "0.01"}
                  value={novoCupom.valor}
                  onChange={handleNovoCupomChange}
                  placeholder={novoCupom.tipo === "percentual" ? "10" : "10.00"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade Disponível*</Label>
                <Input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  min="1"
                  value={novoCupom.quantidade}
                  onChange={handleNovoCupomChange}
                  placeholder="Quantidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validade">Data de Validade</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Input
                    id="validade"
                    name="validade"
                    type="date"
                    value={novoCupom.validade}
                    onChange={handleNovoCupomChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCupomDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={salvarCupom}
              disabled={loading || !novoCupom.codigo || novoCupom.valor <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editandoCupom ? "Atualizar" : "Criar"} Cupom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para atribuir cupom a cliente */}
      <Dialog open={cupomClienteDialogOpen} onOpenChange={setCupomClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Cupom a Cliente</DialogTitle>
            <DialogDescription>Selecione um cliente e um cupom para atribuir diretamente.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente*</Label>
              <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cupom">Cupom*</Label>
              <Select value={cupomSelecionado} onValueChange={setCupomSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cupom" />
                </SelectTrigger>
                <SelectContent>
                  {cupons.map((cupom) => (
                    <SelectItem key={cupom.id} value={cupom.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{cupom.codigo}</span>
                        <Badge variant="outline">
                          {cupom.tipo === "percentual" ? `${cupom.valor}%` : `R$ ${cupom.valor.toFixed(2)}`}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCupomClienteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={atribuirCupomAoCliente}
              disabled={loading || !clienteSelecionado || !cupomSelecionado}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tag className="mr-2 h-4 w-4" />}
              Atribuir Cupom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
