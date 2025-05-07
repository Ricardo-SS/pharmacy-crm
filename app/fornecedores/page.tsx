"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Search, Building, Phone, Mail, MapPin, PencilLine, Trash2, Loader2 } from "lucide-react"

export default function FornecedoresPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [fornecedores, setFornecedores] = useState([])
  const [filteredFornecedores, setFilteredFornecedores] = useState([])
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [fornecedorToDelete, setFornecedorToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [usuarioLogado, setUsuarioLogado] = useState(null)

  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    contato: "",
    observacoes: "",
  })

  useEffect(() => {
    // Verificar usuário logado
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null")
    setUsuarioLogado(usuario)

    // Carregar fornecedores do localStorage
    const storedFornecedores = JSON.parse(localStorage.getItem("fornecedores") || "[]")
    setFornecedores(storedFornecedores)
    setFilteredFornecedores(storedFornecedores)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Filtrar fornecedores por termo de busca
    if (searchTerm) {
      const filtered = fornecedores.filter(
        (fornecedor) =>
          fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (fornecedor.cnpj && fornecedor.cnpj.includes(searchTerm)) ||
          (fornecedor.contato && fornecedor.contato.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredFornecedores(filtered)
    } else {
      setFilteredFornecedores(fornecedores)
    }
  }, [searchTerm, fornecedores])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      cnpj: "",
      telefone: "",
      email: "",
      endereco: "",
      contato: "",
      observacoes: "",
    })
  }

  const handleEditFornecedor = (fornecedor) => {
    setFormData({
      ...fornecedor,
    })
    setFormDialogOpen(true)
  }

  const handleDeleteConfirm = (fornecedor) => {
    setFornecedorToDelete(fornecedor)
    setConfirmDeleteOpen(true)
  }

  const executeDelete = () => {
    if (!fornecedorToDelete) return

    // Verificar se o usuário é administrador
    if (!usuarioLogado || usuarioLogado.cargo.toLowerCase() !== "admin") {
      toast({
        variant: "destructive",
        description: "Apenas administradores podem excluir fornecedores.",
      })
      setConfirmDeleteOpen(false)
      return
    }

    setActionLoading("delete")

    // Simular tempo de processamento
    setTimeout(() => {
      const updatedFornecedores = fornecedores.filter((f) => f.id !== fornecedorToDelete.id)
      setFornecedores(updatedFornecedores)
      localStorage.setItem("fornecedores", JSON.stringify(updatedFornecedores))

      toast({
        description: `Fornecedor ${fornecedorToDelete.nome} excluído com sucesso.`,
      })

      setConfirmDeleteOpen(false)
      setFornecedorToDelete(null)
      setActionLoading("")
    }, 1000)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setActionLoading("save")

    // Simular tempo de processamento
    setTimeout(() => {
      // Validar valores
      if (!formData.nome) {
        toast({
          variant: "destructive",
          description: "O nome do fornecedor é obrigatório.",
        })
        setActionLoading("")
        return
      }

      // Preparar os dados para salvar
      const dataToSave = {
        ...formData,
        // Adicionar ID se for um novo fornecedor
        id: formData.id || Date.now().toString(),
      }

      // Verificar se é edição ou novo cadastro
      if (formData.id) {
        // Edição - atualizar fornecedor existente
        const updatedFornecedores = fornecedores.map((f) => (f.id === formData.id ? dataToSave : f))
        setFornecedores(updatedFornecedores)
        localStorage.setItem("fornecedores", JSON.stringify(updatedFornecedores))
        toast({
          description: `Fornecedor ${dataToSave.nome} atualizado com sucesso.`,
        })
      } else {
        // Novo fornecedor
        const newFornecedores = [...fornecedores, dataToSave]
        setFornecedores(newFornecedores)
        localStorage.setItem("fornecedores", JSON.stringify(newFornecedores))
        toast({
          description: `Fornecedor ${dataToSave.nome} cadastrado com sucesso.`,
        })
      }

      setFormDialogOpen(false)
      resetForm()
      setActionLoading("")
    }, 1000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-6 w-6" />
            Fornecedores
          </h1>
          <p className="text-gray-500">Gerenciamento de fornecedores</p>
        </div>
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-red-600 hover:bg-red-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Editar Fornecedor" : "Cadastrar Novo Fornecedor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Fornecedor*</label>
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome do fornecedor"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">CNPJ</label>
                  <Input name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="CNPJ do fornecedor" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="Telefone para contato"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-mail para contato"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pessoa de Contato</label>
                  <Input
                    name="contato"
                    value={formData.contato}
                    onChange={handleChange}
                    placeholder="Nome da pessoa de contato"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Endereço</label>
                  <Input
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Endereço completo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Observações adicionais"
                  rows={3}
                />
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
          <Input placeholder="Buscar fornecedor..." value={searchTerm} onChange={handleSearch} className="pl-10" />
        </div>
      </div>

      {filteredFornecedores.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden md:table-cell">CNPJ</TableHead>
                <TableHead className="hidden md:table-cell">Endereço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{fornecedor.nome}</span>
                      {fornecedor.contato && <span className="text-xs text-gray-500">{fornecedor.contato}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col space-y-1">
                      {fornecedor.telefone && (
                        <span className="text-xs flex items-center">
                          <Phone className="h-3 w-3 mr-1" /> {fornecedor.telefone}
                        </span>
                      )}
                      {fornecedor.email && (
                        <span className="text-xs flex items-center">
                          <Mail className="h-3 w-3 mr-1" /> {fornecedor.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{fornecedor.cnpj || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {fornecedor.endereco ? (
                      <span className="text-xs flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> {fornecedor.endereco}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditFornecedor(fornecedor)}
                      >
                        <span className="sr-only">Editar</span>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDeleteConfirm(fornecedor)}
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
          <Building className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">Nenhum fornecedor encontrado</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm ? "Tente outros termos de busca." : "Cadastre seu primeiro fornecedor clicando no botão acima."}
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
              Tem certeza que deseja excluir o fornecedor <strong>{fornecedorToDelete?.nome}</strong>?
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
