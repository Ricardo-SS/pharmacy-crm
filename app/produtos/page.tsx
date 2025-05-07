"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlusCircle,
  Search,
  Package,
  AlertTriangle,
  Barcode,
  CalendarClock,
  FileText,
  PencilLine,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ProdutosPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [produtos, setProdutos] = useState([])
  const [filteredProdutos, setFilteredProdutos] = useState([])
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [produtoToDelete, setProdutoToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [filtroGrupo, setFiltroGrupo] = useState("todos")
  const [grupos, setGrupos] = useState([])
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  // Adicionar estado para filtros de alerta
  const [filtroAlerta, setFiltroAlerta] = useState("todos")
  // Adicionar estado para fornecedores
  const [fornecedores, setFornecedores] = useState([])

  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    codigoBarras: "",
    dataValidade: "",
    necessitaReceita: false,
    tipoReceita: "",
    tipo: "",
    grupo: "",
    descricao: "",
    preco: 0,
    quantidadeDisponivel: 0,
    quantidadeMinima: 5,
    quantidadeVendida: 0,
    fornecedor: "",
  })

  // Modificar o useEffect inicial para carregar fornecedores
  useEffect(() => {
    // Verificar usuário logado
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null")
    setUsuarioLogado(usuario)

    // Carregar produtos do localStorage
    const storedProdutos = JSON.parse(localStorage.getItem("produtos") || "[]")
    setProdutos(storedProdutos)
    setFilteredProdutos(storedProdutos)

    // Extrair grupos únicos para o filtro
    const gruposUnicos = [...new Set(storedProdutos.map((p) => p.grupo))].filter(Boolean)
    setGrupos(gruposUnicos)

    // Carregar fornecedores
    const storedFornecedores = JSON.parse(localStorage.getItem("fornecedores") || "[]")
    setFornecedores(storedFornecedores)

    setLoading(false)
  }, [])

  // Modificar o useEffect de filtragem para incluir filtro de alerta
  useEffect(() => {
    let filtered = [...produtos]

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (produto.codigoBarras && produto.codigoBarras.includes(searchTerm)),
      )
    }

    // Filtrar por grupo
    if (filtroGrupo !== "todos") {
      filtered = filtered.filter((produto) => produto.grupo === filtroGrupo)
    }

    // Filtrar por alerta
    if (filtroAlerta === "estoque-baixo") {
      filtered = filtered.filter((produto) => produto.quantidadeDisponivel <= produto.quantidadeMinima)
    } else if (filtroAlerta === "vencimento-proximo") {
      const hoje = new Date()
      const trintaDiasDepois = new Date()
      trintaDiasDepois.setDate(hoje.getDate() + 30)

      filtered = filtered.filter((produto) => {
        if (!produto.dataValidade) return false
        const dataValidade = new Date(produto.dataValidade)
        return dataValidade <= trintaDiasDepois && dataValidade >= hoje
      })
    } else if (filtroAlerta === "vencidos") {
      const hoje = new Date()
      filtered = filtered.filter((produto) => {
        if (!produto.dataValidade) return false
        return new Date(produto.dataValidade) < hoje
      })
    } else if (filtroAlerta === "receita") {
      filtered = filtered.filter((produto) => produto.necessitaReceita)
    }

    setFilteredProdutos(filtered)
  }, [searchTerm, produtos, filtroGrupo, filtroAlerta])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSetFiltroGrupo = (grupo) => {
    setFiltroGrupo(grupo)
  }

  // Adicionar função para manipular filtro de alerta
  const handleSetFiltroAlerta = (alerta) => {
    setFiltroAlerta(alerta)
  }

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      codigoBarras: "",
      dataValidade: "",
      necessitaReceita: false,
      tipoReceita: "",
      tipo: "",
      grupo: "",
      descricao: "",
      preco: 0,
      quantidadeDisponivel: 0,
      quantidadeMinima: 5,
      quantidadeVendida: 0,
      fornecedor: "",
    })
  }

  const handleEditProduto = (produto) => {
    setFormData({
      ...produto,
      dataValidade: produto.dataValidade ? new Date(produto.dataValidade).toISOString().split("T")[0] : "",
      preco: produto.preco || 0,
      quantidadeDisponivel: produto.quantidadeDisponivel || 0,
      quantidadeMinima: produto.quantidadeMinima || 5,
    })
    setFormDialogOpen(true)
  }

  const handleDeleteConfirm = (produto) => {
    setProdutoToDelete(produto)
    setConfirmDeleteOpen(true)
  }

  const executeDelete = () => {
    if (!produtoToDelete) return

    // Verificar se o usuário é administrador
    if (!usuarioLogado || usuarioLogado.cargo.toLowerCase() !== "admin") {
      toast({
        variant: "destructive",
        description: "Apenas administradores podem excluir produtos.",
      })
      setConfirmDeleteOpen(false)
      return
    }

    setActionLoading("delete")

    // Simular tempo de processamento
    setTimeout(() => {
      const updatedProdutos = produtos.filter((p) => p.id !== produtoToDelete.id)
      setProdutos(updatedProdutos)
      localStorage.setItem("produtos", JSON.stringify(updatedProdutos))

      toast({
        description: `Produto ${produtoToDelete.nome} excluído com sucesso.`,
      })

      setConfirmDeleteOpen(false)
      setProdutoToDelete(null)
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
        // Adicionar ID se for um novo produto
        id: formData.id || Date.now().toString(),
        preco: Number.parseFloat(formData.preco) || 0,
        quantidadeDisponivel: Number.parseInt(formData.quantidadeDisponivel) || 0,
        quantidadeMinima: Number.parseInt(formData.quantidadeMinima) || 5,
        quantidadeVendida: Number.parseInt(formData.quantidadeVendida) || 0,
      }

      // Verificar se é edição ou novo cadastro
      if (formData.id) {
        // Edição - atualizar produto existente
        const updatedProdutos = produtos.map((p) => (p.id === formData.id ? dataToSave : p))
        setProdutos(updatedProdutos)
        localStorage.setItem("produtos", JSON.stringify(updatedProdutos))
        toast({
          description: `Produto ${dataToSave.nome} atualizado com sucesso.`,
        })
      } else {
        // Novo produto
        const newProdutos = [...produtos, dataToSave]
        setProdutos(newProdutos)
        localStorage.setItem("produtos", JSON.stringify(newProdutos))
        toast({
          description: `Produto ${dataToSave.nome} cadastrado com sucesso.`,
        })

        // Atualizar lista de grupos se necessário
        if (dataToSave.grupo && !grupos.includes(dataToSave.grupo)) {
          setGrupos([...grupos, dataToSave.grupo])
        }
      }

      setFormDialogOpen(false)
      resetForm()
      setActionLoading("")
    }, 1000)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Produtos
          </h1>
          <p className="text-gray-500">Gerenciamento de estoque e produtos</p>
        </div>
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-red-600 hover:bg-red-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Editar Produto" : "Cadastrar Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Produto*</label>
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome do produto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código de Barras</label>
                  <Input
                    name="codigoBarras"
                    value={formData.codigoBarras}
                    onChange={handleChange}
                    placeholder="Código de barras"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Input name="tipo" value={formData.tipo} onChange={handleChange} placeholder="Tipo do produto" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grupo</label>
                  <Input
                    name="grupo"
                    value={formData.grupo}
                    onChange={handleChange}
                    placeholder="Ex: Antibióticos, Vitaminas"
                    list="grupos-list"
                  />
                  <datalist id="grupos-list">
                    {grupos.map((grupo) => (
                      <option key={grupo} value={grupo} />
                    ))}
                  </datalist>
                </div>
                // Dentro do formulário de produto, após o campo de grupo:
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fornecedor</label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.fornecedor || ""}
                      onValueChange={(value) => handleSelectChange("fornecedor", value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem fornecedor</SelectItem>
                        {fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>
                            {fornecedor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Abrir modal de cadastro de fornecedor
                        // Implementação será feita em outro arquivo
                      }}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Validade</label>
                  <Input name="dataValidade" value={formData.dataValidade} onChange={handleChange} type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preço (R$)*</label>
                  <Input
                    name="preco"
                    value={formData.preco}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade Disponível*</label>
                  <Input
                    name="quantidadeDisponivel"
                    value={formData.quantidadeDisponivel}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade Mínima</label>
                  <Input
                    name="quantidadeMinima"
                    value={formData.quantidadeMinima}
                    onChange={handleChange}
                    type="number"
                    min="1"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="necessitaReceita"
                    name="necessitaReceita"
                    checked={formData.necessitaReceita}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="necessitaReceita" className="text-sm font-medium">
                    Este produto requer receita médica
                  </label>
                </div>
                {formData.necessitaReceita && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Receita</label>
                    <Select
                      value={formData.tipoReceita}
                      onValueChange={(value) => handleSelectChange("tipoReceita", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de receita" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comum">Receita Comum</SelectItem>
                        <SelectItem value="branca">Receita Branca</SelectItem>
                        <SelectItem value="azul">Receita Azul (B)</SelectItem>
                        <SelectItem value="amarela">Receita Amarela (A)</SelectItem>
                        <SelectItem value="especial">Receita Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Detalhes do produto"
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
          <Input
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar por Grupo
              {filtroGrupo !== "todos" && (
                <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100">{filtroGrupo}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuCheckboxItem
              checked={filtroGrupo === "todos"}
              onCheckedChange={() => handleSetFiltroGrupo("todos")}
            >
              Todos os Grupos
            </DropdownMenuCheckboxItem>
            {grupos.map((grupo) => (
              <DropdownMenuCheckboxItem
                key={grupo}
                checked={filtroGrupo === grupo}
                onCheckedChange={() => handleSetFiltroGrupo(grupo)}
              >
                {grupo}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      // Adicionar abas de filtro após a barra de pesquisa // Após a div que contém a barra de pesquisa e o dropdown de
      filtro por grupo:
      <div className="flex overflow-x-auto space-x-2 pb-2 mt-2">
        <Button
          variant={filtroAlerta === "todos" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSetFiltroAlerta("todos")}
          className="whitespace-nowrap"
        >
          Todos
        </Button>
        <Button
          variant={filtroAlerta === "estoque-baixo" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSetFiltroAlerta("estoque-baixo")}
          className="whitespace-nowrap text-amber-600 border-amber-600"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Estoque Baixo
        </Button>
        <Button
          variant={filtroAlerta === "vencimento-proximo" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSetFiltroAlerta("vencimento-proximo")}
          className="whitespace-nowrap text-orange-600 border-orange-600"
        >
          <CalendarClock className="h-4 w-4 mr-1" />
          Vencimento Próximo
        </Button>
        <Button
          variant={filtroAlerta === "vencidos" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSetFiltroAlerta("vencidos")}
          className="whitespace-nowrap text-red-600 border-red-600"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Vencidos
        </Button>
        <Button
          variant={filtroAlerta === "receita" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSetFiltroAlerta("receita")}
          className="whitespace-nowrap text-purple-600 border-purple-600"
        >
          <FileText className="h-4 w-4 mr-1" />
          Requer Receita
        </Button>
      </div>
      {filteredProdutos.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Detalhes</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden md:table-cell">Estoque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{produto.nome}</span>
                      {produto.grupo && <span className="text-xs text-gray-500">{produto.grupo}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col space-y-1">
                      {produto.codigoBarras && (
                        <span className="text-xs flex items-center">
                          <Barcode className="h-3 w-3 mr-1" /> {produto.codigoBarras}
                        </span>
                      )}
                      {produto.dataValidade && (
                        <span className="text-xs flex items-center">
                          <CalendarClock className="h-3 w-3 mr-1" />
                          Validade: {new Date(produto.dataValidade).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-xs flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {produto.necessitaReceita ? (
                          <Badge variant="destructive" className="text-xs h-5">
                            {produto.tipoReceita ? `Receita ${produto.tipoReceita}` : "Requer Receita"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs h-5">
                            Venda Livre
                          </Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">R$ {produto.preco?.toFixed(2) || "0.00"}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col">
                      <span
                        className={`text-sm ${produto.quantidadeDisponivel <= produto.quantidadeMinima ? "text-red-600 font-medium" : ""}`}
                      >
                        {produto.quantidadeDisponivel} unid.
                      </span>
                      {produto.quantidadeDisponivel <= produto.quantidadeMinima && (
                        <span className="text-xs flex items-center text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Estoque baixo
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
                        onClick={() => handleEditProduto(produto)}
                      >
                        <span className="sr-only">Editar</span>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDeleteConfirm(produto)}
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
          <Package className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm || filtroGrupo !== "todos"
              ? "Tente outros termos de busca ou filtros."
              : "Cadastre seu primeiro produto clicando no botão acima."}
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
              Tem certeza que deseja excluir o produto <strong>{produtoToDelete?.nome}</strong>?
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
