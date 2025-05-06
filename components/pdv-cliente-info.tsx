"use client"

import { Phone, Badge, CreditCard, Calendar, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PdvClienteInfo({ cliente, onRemove }) {
  if (!cliente) return null

  const tempoCliente = () => {
    if (!cliente.dataCadastro) return "Cliente novo"

    const dataCadastro = new Date(cliente.dataCadastro)
    const hoje = new Date()
    const diffMeses =
      (hoje.getFullYear() - dataCadastro.getFullYear()) * 12 + (hoje.getMonth() - dataCadastro.getMonth())

    if (diffMeses < 1) return "Cliente novo"
    if (diffMeses < 12) return `${diffMeses} meses`
    const anos = Math.floor(diffMeses / 12)
    const meses = diffMeses % 12
    return `${anos} ${anos === 1 ? "ano" : "anos"}${meses > 0 ? ` e ${meses} ${meses === 1 ? "mês" : "meses"}` : ""}`
  }

  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{cliente.nome}</h3>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500" onClick={onRemove}>
          Remover
        </Button>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Phone className="h-3 w-3" />
          <span>{cliente.telefone}</span>
        </div>

        {cliente.tipoCliente && (
          <div className="flex items-center gap-1 text-gray-600">
            <Badge className="h-3 w-3" />
            <span className="capitalize">{cliente.tipoCliente}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>{tempoCliente()}</span>
        </div>

        {cliente.limiteCredito > 0 && (
          <div className="flex items-center gap-1 text-gray-600">
            <CreditCard className="h-3 w-3" />
            <span>Limite: R$ {cliente.limiteCredito.toFixed(2)}</span>
          </div>
        )}

        {cliente.valorDevendo > 0 && (
          <div className="flex items-center gap-1 text-amber-600 font-medium">
            <CreditCard className="h-3 w-3" />
            <span>Débito: R$ {cliente.valorDevendo.toFixed(2)}</span>
          </div>
        )}

        {cliente.alergias && (
          <div className="flex items-start gap-1 text-red-600 mt-2">
            <AlertTriangle className="h-3 w-3 mt-0.5" />
            <span className="flex-1 text-xs">Alergia: {cliente.alergias}</span>
          </div>
        )}
      </div>
    </div>
  )
}
