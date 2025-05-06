"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Printer, Download, ArrowLeft, ShoppingCart, CheckCircle } from "lucide-react"

export default function CupomPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vendaId = searchParams.get("id")
  const [venda, setVenda] = useState(null)
  const [farmacia, setFarmacia] = useState({
    nome: "PharmaCRM",
    cnpj: "12.345.678/0001-90",
    endereco: "Rua das Farmácias, 123 - Centro",
    cidade: "São Paulo - SP",
    telefone: "(11) 3456-7890",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carregar venda do localStorage
    if (vendaId) {
      const vendas = JSON.parse(localStorage.getItem("vendas") || "[]")
      const vendaEncontrada = vendas.find((v) => v.id === vendaId)
      setVenda(vendaEncontrada)
    }

    // Carregar dados da farmácia
    const dadosFarmacia = JSON.parse(localStorage.getItem("dadosFarmacia") || "null")
    if (dadosFarmacia) {
      setFarmacia(dadosFarmacia)
    }

    setLoading(false)
  }, [vendaId])

  const formatarData = (dataIso) => {
    if (!dataIso) return ""
    const data = new Date(dataIso)
    return data.toLocaleDateString("pt-BR") + " " + data.toLocaleTimeString("pt-BR")
  }

  const imprimirCupom = () => {
    window.print()
  }

  const downloadPDF = () => {
    // Em uma implementação real, você usaria uma biblioteca como jsPDF
    // para gerar um PDF. Aqui estamos apenas simulando o download.
    alert("Funcionalidade de download PDF seria implementada aqui.")
  }

  const novaVenda = () => {
    router.push("/pdv")
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>
  }

  if (!venda) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center space-y-4">
          <div className="bg-amber-100 text-amber-800 p-4 rounded-md">
            Venda não encontrada. O cupom solicitado não existe ou foi removido.
          </div>
          <Button onClick={() => router.push("/pdv")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o PDV
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Venda Finalizada
          </h1>
          <p className="text-gray-500">Cupom Fiscal Não Eletrônico</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={imprimirCupom}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={downloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button onClick={novaVenda}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      <Card className="border rounded-md overflow-hidden print:shadow-none print:border-none">
        <CardContent className="p-0">
          <div className="p-6 border-b text-center">
            <h2 className="text-xl font-bold uppercase">{farmacia.nome}</h2>
            <p className="text-sm">CNPJ: {farmacia.cnpj}</p>
            <p className="text-sm">{farmacia.endereco}</p>
            <p className="text-sm">{farmacia.cidade}</p>
            <p className="text-sm">{farmacia.telefone}</p>
          </div>

          <div className="p-6 border-b">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">CUPOM NÃO FISCAL</p>
                <p>COD: {venda.id}</p>
                <p>DATA: {formatarData(venda.data)}</p>
              </div>
              {venda.cliente && (
                <div className="text-right">
                  <p className="font-medium">CLIENTE:</p>
                  <p>{venda.cliente.nome}</p>
                  <p>{venda.cliente.telefone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ITEM</TableHead>
                  <TableHead className="text-right">QTD</TableHead>
                  <TableHead className="text-right">VALOR UN</TableHead>
                  <TableHead className="text-right">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venda.itens.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {index + 1}. {item.nome}
                    </TableCell>
                    <TableCell className="text-right">{item.quantidade}</TableCell>
                    <TableCell className="text-right">R$ {item.preco.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {(item.quantidade * item.preco).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-6 border-t">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">SUBTOTAL:</span>
                <span>R$ {venda.subTotal.toFixed(2)}</span>
              </div>
              {venda.desconto > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">DESCONTO:</span>
                  <span>R$ {venda.desconto.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>TOTAL:</span>
                <span>R$ {venda.valorTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">FORMA DE PAGAMENTO:</span>
                <span>
                  {(() => {
                    switch (venda.metodoPagamento) {
                      case "dinheiro":
                        return "Dinheiro"
                      case "credito":
                        return "Cartão de Crédito"
                      case "pix":
                        return "PIX"
                      case "fiado":
                        return "Fiado"
                      default:
                        return venda.metodoPagamento
                    }
                  })()}
                </span>
              </div>
              {venda.metodoPagamento === "dinheiro" && (
                <>
                  <div className="flex justify-between">
                    <span>VALOR RECEBIDO:</span>
                    <span>R$ {venda.valorRecebido.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TROCO:</span>
                    <span>R$ {venda.troco.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {venda.observacoes && (
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium">OBSERVAÇÕES:</p>
                <p className="text-sm">{venda.observacoes}</p>
              </div>
            )}

            <div className="mt-6 text-center text-xs">
              <p>************************************************************</p>
              <p className="my-2">OBRIGADO PELA PREFERÊNCIA!</p>
              <p>NÃO TEM VALOR FISCAL</p>
              <p>************************************************************</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
