"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { initializeData } from "@/lib/init-data"
import { Pill, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Login() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar se já está logado
    const usuarioLogado = localStorage.getItem("usuarioLogado")
    if (usuarioLogado) {
      const usuario = JSON.parse(usuarioLogado)
      if (usuario.cargo && usuario.cargo.toLowerCase() === "vendedor") {
        router.push("/pdv")
      } else {
        router.push("/")
      }
    }

    // Inicializar dados de exemplo
    initializeData()
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setErro("")

    // Simulação de validação de login
    setTimeout(() => {
      const { email, senha } = formData

      // Buscar usuários do localStorage
      const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]")
      const usuario = usuarios.find((u) => (u.email === email || u.usuario === email) && u.senha === senha)

      if (usuario) {
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            id: usuario.id,
            nome: usuario.nome,
            cargo: usuario.cargo,
            email: usuario.email,
          }),
        )

        toast({
          description: `Bem-vindo(a), ${usuario.nome}!`,
        })

        // Se for vendedor, redirecionar para o PDV
        if (usuario.cargo.toLowerCase() === "vendedor") {
          router.push("/pdv")
        } else {
          router.push("/")
        }
      } else {
        // Verificar credenciais padrão
        if (email === "admin" && senha === "admin") {
          localStorage.setItem(
            "usuarioLogado",
            JSON.stringify({
              id: 1,
              nome: "Administrador",
              cargo: "Admin",
              email: "admin@pharmacrm.com",
            }),
          )
          toast({
            description: "Bem-vindo(a), Administrador!",
          })
          router.push("/")
        } else if (email === "gerente" && senha === "gerente") {
          localStorage.setItem(
            "usuarioLogado",
            JSON.stringify({
              id: 2,
              nome: "Gerente",
              cargo: "Gerente",
              email: "gerente@pharmacrm.com",
            }),
          )
          toast({
            description: "Bem-vindo(a), Gerente!",
          })
          router.push("/")
        } else if (email === "vendedor" && senha === "vendedor") {
          localStorage.setItem(
            "usuarioLogado",
            JSON.stringify({
              id: 3,
              nome: "Vendedor",
              cargo: "Vendedor",
              email: "vendedor@pharmacrm.com",
            }),
          )
          toast({
            description: "Bem-vindo(a), Vendedor!",
          })
          router.push("/pdv")
        } else {
          setErro("Email/usuário ou senha inválidos")
        }
      }

      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Pill className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">PharmaCRM</CardTitle>
          <p className="text-sm text-gray-500">Sistema de CRM e PDV para Farmácias</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{erro}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email ou Usuário</label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email ou usuário"
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

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
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
