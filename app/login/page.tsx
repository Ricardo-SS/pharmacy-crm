"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { initializeData } from "@/lib/init-data"
import { Pill } from "lucide-react"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    usuario: "",
    senha: "",
    cargo: "vendedor",
  })
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar se já está logado
    const usuarioLogado = localStorage.getItem("usuarioLogado")
    if (usuarioLogado) {
      router.push("/")
    }

    // Inicializar dados de exemplo
    initializeData()
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, cargo: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setErro("")

    // Simulação de validação de login
    setTimeout(() => {
      const { usuario, senha, cargo } = formData
      // Em um sistema real, você validaria com o banco de dados
      if (usuario === "admin" && senha === "admin" && cargo === "admin") {
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            id: 1,
            nome: "Administrador",
            cargo: "Admin",
          }),
        )
        router.push("/")
      } else if (usuario === "gerente" && senha === "gerente" && cargo === "gerente") {
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            id: 2,
            nome: "Gerente",
            cargo: "Gerente",
          }),
        )
        router.push("/")
      } else if (usuario === "vendedor" && senha === "vendedor" && cargo === "vendedor") {
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            id: 3,
            nome: "Vendedor",
            cargo: "Vendedor",
          }),
        )
        router.push("/")
      } else {
        setErro("Usuário, senha ou cargo inválidos")
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-600">PharmaCRM</CardTitle>
          <p className="text-sm text-gray-500">Sistema de CRM e PDV para Farmácias</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{erro}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário</label>
              <Input
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                placeholder="Digite seu usuário"
                required
              />
              <p className="text-xs text-gray-500">Dica: admin, gerente ou vendedor</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Digite sua senha"
                required
              />
              <p className="text-xs text-gray-500">Dica: mesma que o usuário</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo</label>
              <Select value={formData.cargo} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-xs text-gray-500 pt-4">
              <p>© {new Date().getFullYear()} PharmaCRM</p>
              <p>Sistema de Gestão para Farmácias</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
