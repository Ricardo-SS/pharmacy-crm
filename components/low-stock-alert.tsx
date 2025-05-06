"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LowStockAlert() {
  const router = useRouter()
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([])

  useEffect(() => {
    // Carregar produtos do localStorage
    const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")

    // Filtrar produtos com estoque baixo
    const filtrados = produtos
      .filter((produto) => produto.quantidadeDisponivel <= produto.quantidadeMinima)
      .sort((a, b) => a.quantidadeDisponivel - b.quantidadeDisponivel)
      .slice(0, 5) // Limitar a 5 produtos

    setProdutosBaixoEstoque(filtrados)
  }, [])

  const irParaProdutos = () => {
    router.push("/produtos")
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Produtos com Estoque Baixo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {produtosBaixoEstoque.length > 0 ? (
          <div className="space-y-3">
            {produtosBaixoEstoque.map((produto) => (
              <div key={produto.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <div className="font-medium">{produto.nome}</div>
                  <div className="text-xs flex items-center gap-1 mt-1 text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    Restam apenas {produto.quantidadeDisponivel} unidades
                  </div>
                </div>
                <Badge variant="destructive" className="text-xs">
                  Repor
                </Badge>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={irParaProdutos}>
              Ver todos os produtos
            </Button>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">Nenhum produto com estoque baixo</div>
        )}
      </CardContent>
    </Card>
  )
}
