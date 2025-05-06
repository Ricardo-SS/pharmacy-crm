"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Banknote, CreditCard, QrCode, User, Check, X } from "lucide-react"

export default function PdvPagamento({ valorTotal, onFinalizarPagamento, onCancelar }) {
  const [formaPagamento, setFormaPagamento] = useState("dinheiro")
  const [valorRecebido, setValorRecebido] = useState(valorTotal)
  const [observacoes, setObservacoes] = useState("")

  const troco = Math.max(0, valorRecebido - valorTotal)

  const handleSubmit = () => {
    onFinalizarPagamento({
      metodoPagamento: formaPagamento,
      valorRecebido,
      troco,
      observacoes,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Forma de Pagamento</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={formaPagamento === "dinheiro" ? "default" : "outline"}
            onClick={() => setFormaPagamento("dinheiro")}
            className="justify-start"
          >
            <Banknote className="h-4 w-4 mr-2" />
            Dinheiro
          </Button>
          <Button
            variant={formaPagamento === "credito" ? "default" : "outline"}
            onClick={() => setFormaPagamento("credito")}
            className="justify-start"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Cartão
          </Button>
          <Button
            variant={formaPagamento === "pix" ? "default" : "outline"}
            onClick={() => setFormaPagamento("pix")}
            className="justify-start"
          >
            <QrCode className="h-4 w-4 mr-2" />
            PIX
          </Button>
          <Button
            variant={formaPagamento === "fiado" ? "default" : "outline"}
            onClick={() => setFormaPagamento("fiado")}
            className="justify-start"
          >
            <User className="h-4 w-4 mr-2" />
            Fiado
          </Button>
        </div>
      </div>

      {formaPagamento === "dinheiro" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Valor Recebido (R$)</label>
          <Input
            type="number"
            min={valorTotal}
            step="0.01"
            value={valorRecebido}
            onChange={(e) => setValorRecebido(Number.parseFloat(e.target.value) || 0)}
          />
          <div className="flex justify-between text-sm pt-1">
            <span>Troco:</span>
            <span className="font-medium">R$ {troco.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Observações</label>
        <Textarea
          placeholder="Observações da venda"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
        />
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between font-medium text-lg">
          <span>Total:</span>
          <span>R$ {valorTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancelar}>
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={formaPagamento === "dinheiro" && valorRecebido < valorTotal}
        >
          <Check className="mr-2 h-4 w-4" />
          Confirmar Pagamento
        </Button>
      </div>
    </div>
  )
}
