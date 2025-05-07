"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  PlusCircle,
  Search,
  Users,
  AlertTriangle,
  CreditCard,
  PencilLine,
  Trash2,
  Phone,
  Mail,
  Loader2,
} from "lucide-react"

export default function ClientesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState([])
  const [filteredClientes, setFilteredClientes] = useState([])
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [usuarioLogado, setUsuarioLogado] = useState(null)

  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    endereco: "",
    dataNascimento: "",
    sexo: "",
    limiteCredito: 0,
    valorDevendo: 0,
    tipoCliente: "normal",
    dataCadastro: "",
    alergias: "",
    medicamentosRecorrentes: [],
  })

  useEffect(() => {
    // Verificar usuário logado
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null")
    setUsuarioLogado(usuario)

    // Carregar clientes do localStorage
    const storedClientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    setClientes(storedClientes)
    setFilteredClientes(storedClientes)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = [...clientes]

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.cpf && cliente.cpf.includes(searchTerm)) ||
          cliente.id.toString() === searchTerm,
      )
    }

    // Filtrar por tipo
    if (activeTab !== "todos") {
      filtered = filtered.filter((cliente) => cliente.tipoCliente === activeTab)
    }

    setFilteredClientes(filtered)
  }, [searchTerm, clientes, activeTab])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      endereco: "",
      dataNascimento: "",
      sexo: "",
      limiteCredito: 0,
      valorDevendo: 0,
      tipoCliente: "normal",
      dataCadastro: "",
      alergias: "",
      medicamentosRecorrentes: [],
    })
  }

  const handleEditCliente = (cliente) => {
    setFormData({
      ...cliente,
      dataNascimento: cliente.dataNascimento ? new Date(cliente.dataNascimento).toISOString().split("T")[0] : "",
      limiteCredito: cliente.limiteCredito || 0,
      valorDevendo: cliente.valorDevendo || 0,
    })
    setFormDialogOpen(true)
  }

  const handleDeleteConfirm = (cliente) => {
    setClienteToDelete(cliente)
    setConfirmDeleteOpen(true)
  }

  const executeDelete = () => {
    if (!clienteToDelete) return

    // Verificar se o usuário é administrador
    if (!usuarioLogado || usuarioLogado.cargo.toLowerCase() !== "admin") {
      toast({
        variant: "destructive",
        description: "Apenas administradores podem excluir clientes.",
      })
      setConfirmDeleteOpen(false)
      return
    }

    setActionLoading("delete")

    // Simular tempo de processamento
    setTimeout(() => {
      const updatedClientes = clientes.filter((c) => c.id !== clienteToDelete.id)
      setClientes(updatedClientes)
      localStorage.setItem("clientes", JSON.stringify(updatedClientes))

      toast({
        description: `Cliente ${clienteToDelete.nome} excluído com sucesso.`,
      })

      setConfirmDeleteOpen(false)
      setClienteToDelete(null)
      setActionLoading("")
    }, 1000)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setActionLoading("save")

    // Simular tempo de processamento
    setTimeout(() => {
      // Preparar data para salvar
      const dataToSave = {
        ...formData,
        // Adicionar ID se for um novo cliente
        id: formData.id || Date.now().toString(),
        dataCadastro: formData.dataCadastro || new Date().toISOString(),
      }

      // Verificar se é edição ou novo cadastro
      if (formData.id) {
        // Edição - atualizar cliente existente
        const updatedClientes = clientes.map((c) => (c.id === formData.id ? dataToSave : c))
        setClientes(updatedClientes)
        localStorage.setItem("clientes", JSON.stringify(updatedClientes))
        toast({
          description: `Cliente ${dataToSave.nome} atualizado com sucesso.`,
        })
      } else {
        // Novo cliente
        const newClientes = [...clientes, dataToSave]
        setClientes(newClientes)
        localStorage.setItem("clientes", JSON.stringify(newClientes))
        toast({
          description: `Cliente ${dataToSave.nome} cadastrado com sucesso.`,
        })
      }

      setFormDialogOpen(false)
      resetForm()
      setActionLoading("")
    }, 1000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "limiteCredito" || name === "valorDevendo" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getTipoClienteBadge = (tipo) => {
    switch (tipo) {
      case "vip":
        return <Badge className="bg-yellow-500">VIP</Badge>
      case "novo":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Novo
          </Badge>
        )
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  const viewClientDetails = (cliente) => {
    router.push(`/clientes/${cliente.id}`)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Clientes
          </h1>
          <p className="text-gray-500">Gerenciamento de clientes</p>
        </div>
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-red-600 hover:bg-red-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Editar Cliente" : "Cadastrar Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo*</label>
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">CPF*</label>
                  <Input
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone*</label>
                  <Input
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(XX) XXXXX-XXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Nascimento</label>
                  <Input name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} type="date" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sexo</label>
                  <Select value={formData.sexo} onValueChange={(value) => handleSelectChange("sexo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Cliente</label>
                  <Select
                    value={formData.tipoCliente}
                    onValueChange={(value) => handleSelectChange("tipoCliente", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Limite de Crédito (R$)</label>
                  <Input
                    name="limiteCredito"
                    value={formData.limiteCredito}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor em Débito (R$)</label>
                  <Input
                    name="valorDevendo"
                    value={formData.valorDevendo}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alergias</label>
                <Textarea
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleChange}
                  placeholder="Lista de alergias a medicamentos"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Medicamentos Recorrentes</label>
                <Textarea
                  name="medicamentosRecorrentes"
                  value={
                    Array.isArray(formData.medicamentosRecorrentes) ? formData.medicamentosRecorrentes.join(", ") : ""
                  }
                  onChange={(e) => {
                    const meds = e.target.value
                      .split(",")
                      .map((med) => med.trim())
                      .filter(Boolean)
                    setFormData((prev) => ({ ...prev, medicamentosRecorrentes: meds }))
                  }}
                  placeholder="Lista de medicamentos usados periodicamente (separados por vírgula)"
                  rows={3}
                />
                <p className="text-xs text-gray-500">Ex: Losartana 50mg, Atenolol 25mg</p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={actionLoading === "save"}>
                  {actionLoading === "save" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {formData.id ? "Atualizando..." : "Cadastrando..."}
                    </>
                  ) : formData.id ? (
                    "Atualizar"
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome, CPF ou código..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
            <TabsTrigger value="novo">Novos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredClientes.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{cliente.nome}</span>
                      <span className="text-xs text-gray-500 md:hidden">{cliente.telefone}</span>
                    </div>
                  </TableCell>
                  <TableCell>{cliente.cpf || "Não informado"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col space-y-1">
                      <span className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" /> {cliente.telefone}
                      </span>
                      {cliente.email && (
                        <span className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" /> {cliente.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{getTipoClienteBadge(cliente.tipoCliente)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col">
                      {cliente.valorDevendo > 0 && (
                        <span className="text-xs flex items-center text-amber-600">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Débito: R$ {cliente.valorDevendo.toFixed(2)}
                        </span>
                      )}
                      {cliente.alergias && (
                        <span className="text-xs flex items-center text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Possui alergias
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => viewClientDetails(cliente)}
                      >
                        <span className="sr-only">Ver detalhes</span>
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditCliente(cliente)}
                      >
                        <span className="sr-only">Editar</span>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDeleteConfirm(cliente)}
                      >
                        <span className="sr-only">Excluir</span>
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
        <div className="text-center p-8 border rounded-lg">
          <Users className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm
              ? "Tente outro termo de busca ou cadastre um novo cliente."
              : "Cadastre seu primeiro cliente clicando no botão acima."}
          </p>
        </div>
      )}

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o cliente <strong>{clienteToDelete?.nome}</strong>?
            </p>
            <p className="text-sm text-red-500 mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={executeDelete} disabled={actionLoading === "delete"}>
              {actionLoading === "delete" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
