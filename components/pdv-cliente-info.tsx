"use client"

import { Phone, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function PdvClienteInfo({ cliente, onRemove, loading = false }) {
  if (!cliente) return null

  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{cliente.nome}</h3>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500" onClick={onRemove} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Remover"}
        </Button>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Phone className="h-3 w-3" />
          <span>{cliente.telefone}</span>
        </div>

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
