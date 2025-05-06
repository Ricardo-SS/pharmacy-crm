"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Mail } from "lucide-react"

export default function ClientesBirthday() {
  const [aniversariantes, setAniversariantes] = useState([])

  useEffect(() => {
    // Carregar clientes do localStorage
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]")

    // Filtrar aniversariantes do mês
    const mesAtual = new Date().getMonth() + 1
    const filtrados = clientes
      .filter((cliente) => {
        if (!cliente.dataNascimento) return false
        const nascimento = new Date(cliente.dataNascimento)
        return nascimento.getMonth() + 1 === mesAtual
      })
      .sort((a, b) => {
        const diaA = new Date(a.dataNascimento).getDate()
        const diaB = new Date(b.dataNascimento).getDate()
        return diaA - diaB
      })
      .slice(0, 5) // Limitar a 5 clientes

    setAniversariantes(filtrados)
  }, [])

  const formatarData = (dataIso) => {
    if (!dataIso) return ""
    const data = new Date(dataIso)
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  const enviarParabens = (cliente) => {
    // Em uma aplicação real, aqui você enviaria um e-mail ou SMS
    alert(`Parabéns enviado para ${cliente.nome}!`)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Aniversariantes do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        {aniversariantes.length > 0 ? (
          <div className="space-y-3">
            {aniversariantes.map((cliente) => (
              <div key={cliente.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <div className="font-medium">{cliente.nome}</div>
                  <div className="text-xs flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatarData(cliente.dataNascimento)}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-8" onClick={() => enviarParabens(cliente)}>
                  <Mail className="h-3 w-3 mr-1" />
                  Parabéns
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">Nenhum aniversariante este mês</div>
        )}
      </CardContent>
    </Card>
  )
}
