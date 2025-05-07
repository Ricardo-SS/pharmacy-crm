"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Printer, Download, ArrowLeft, ShoppingCart, CheckCircle, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"

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
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const cupomRef = useRef(null)
  const { toast } = useToast()

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
    setIsPrinting(true)

    setTimeout(() => {
      const conteudo = document.getElementById("cupom-para-imprimir")
      const windowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=400"
      const printWindow = window.open("", "PRINT", windowFeatures)

      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom Fiscal Não Eletrônico</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                width: 80mm;
                margin: 0 auto;
                padding: 5mm;
              }
              .header, .footer {
                text-align: center;
                margin-bottom: 10px;
              }
              .divider {
                border-top: 1px dashed #000;
                margin: 10px 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
              }
              th, td {
                text-align: left;
                padding: 3px 0;
              }
              th {
                border-bottom: 1px solid #000;
              }
              .right {
                text-align: right;
              }
              .total {
                font-weight: bold;
                font-size: 14px;
                margin-top: 10px;
                border-top: 1px solid #000;
                padding-top: 5px;
              }
              .info {
                margin: 5px 0;
              }
              .center {
                text-align: center;
              }
              .item-row td {
                padding: 2px 0;
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
              }
              .payment-info {
                margin-top: 10px;
                border-top: 1px solid #000;
                padding-top: 5px;
              }
              .footer-text {
                text-align: center;
                margin-top: 15px;
                border-top: 1px dashed #000;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin: 0; font-size: 16px;">${farmacia.nome}</h2>
              <p style="margin: 2px 0;">CNPJ: ${farmacia.cnpj}</p>
              <p style="margin: 2px 0;">${farmacia.endereco}</p>
              <p style="margin: 2px 0;">${farmacia.cidade}</p>
              <p style="margin: 2px 0;">${farmacia.telefone}</p>
            </div>
            
            <div class="divider"></div>
            
            <div>
              <p style="margin: 2px 0;"><b>CUPOM NÃO FISCAL</b></p>
              <p style="margin: 2px 0;">COD: ${venda.id}</p>
              <p style="margin: 2px 0;">DATA: ${formatarData(venda.data)}</p>
              ${
                venda.cliente
                  ? `
                <p style="margin: 2px 0;"><b>CLIENTE:</b> ${venda.cliente.nome}</p>
                <p style="margin: 2px 0;">TEL: ${venda.cliente.telefone || "Não informado"}</p>
              `
                  : ""
              }
            </div>
            
            <div class="divider"></div>
            
            <table>
              <tr>
                <th style="text-align: left;">ITEM</th>
                <th style="text-align: right;">QTD</th>
                <th style="text-align: right;">VALOR UN</th>
                <th style="text-align: right;">TOTAL</th>
              </tr>
              ${venda.itens
                .map(
                  (item, index) => `
                <tr class="item-row">
                  <td style="text-align: left;">${index + 1}. ${item.nome}</td>
                  <td style="text-align: right;">${item.quantidade}</td>
                  <td style="text-align: right;">R$ ${item.preco.toFixed(2)}</td>
                  <td style="text-align: right;">R$ ${(item.quantidade * item.preco).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
            
            <div class="divider"></div>
            
            <div class="summary">
              <div class="summary-row">
                <span>SUBTOTAL:</span>
                <span>R$ ${venda.subTotal.toFixed(2)}</span>
              </div>
              
              ${
                venda.desconto > 0
                  ? `
                <div class="summary-row">
                  <span>DESCONTO (${venda.descontoPercentual ? venda.descontoPercentual.toFixed(1) + "%" : ""}):</span>
                  <span>R$ ${venda.desconto.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              
              ${
                venda.cupomCode
                  ? `
                <div class="summary-row">
                  <span>CUPOM APLICADO:</span>
                  <span>${venda.cupomCode}</span>
                </div>
              `
                  : ""
              }
              
              <div class="summary-row total">
                <span><b>TOTAL:</b></span>
                <span><b>R$ ${venda.valorTotal.toFixed(2)}</b></span>
              </div>
            </div>
            
            <div class="payment-info">
              <div class="summary-row">
                <span>FORMA DE PAGAMENTO:</span>
                <span>${
                  venda.metodoPagamento === "dinheiro"
                    ? "Dinheiro"
                    : venda.metodoPagamento === "credito"
                      ? "Cartão de Crédito"
                      : venda.metodoPagamento === "pix"
                        ? "PIX"
                        : venda.metodoPagamento === "fiado"
                          ? "Fiado"
                          : venda.metodoPagamento
                }</span>
              </div>
              
              ${
                venda.metodoPagamento === "dinheiro"
                  ? `
                <div class="summary-row">
                  <span>VALOR RECEBIDO:</span>
                  <span>R$ ${venda.valorRecebido.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>TROCO:</span>
                  <span>R$ ${venda.troco.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
            </div>
            
            ${
              venda.observacoes
                ? `
              <div style="margin-top: 10px;">
                <p style="margin: 2px 0;"><b>OBSERVAÇÕES:</b></p>
                <p style="margin: 2px 0;">${venda.observacoes}</p>
              </div>
            `
                : ""
            }
            
            <div class="footer-text">
              <p style="margin: 5px 0;">OBRIGADO PELA PREFERÊNCIA!</p>
              <p style="margin: 5px 0;">NÃO TEM VALOR FISCAL</p>
              <p style="margin: 5px 0;">VENDEDOR: ${venda.vendedor || "Não identificado"}</p>
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.focus()

      // Imprimir após carregar o conteúdo
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
        setIsPrinting(false)
      }
    }, 500)
  }

  const downloadPDF = async () => {
    if (!cupomRef.current) return

    setIsDownloading(true)

    try {
      const element = cupomRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")

      // Criar PDF no formato de papel térmico (80mm x altura variável)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, (canvas.height * 80) / canvas.width],
      })

      pdf.addImage(imgData, "PNG", 0, 0, 80, (canvas.height * 80) / canvas.width)

      // Nome do arquivo com data e hora
      const dataHora = new Date().toISOString().replace(/[:.]/g, "-")
      const nomeArquivo = `cupom_${venda.id}_${dataHora}.pdf`

      pdf.save(nomeArquivo)

      toast({
        description: "PDF gerado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast({
        variant: "destructive",
        description: "Erro ao gerar PDF. Tente novamente.",
      })
    } finally {
      setIsDownloading(false)
    }
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
          <Button variant="outline" onClick={imprimirCupom} disabled={isPrinting}>
            {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
            Imprimir
          </Button>
          <Button variant="outline" onClick={downloadPDF} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
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
          <div ref={cupomRef} id="cupom-para-imprimir" className="print:font-mono">
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
                    <p>{venda.cliente.telefone || "Não informado"}</p>
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
                    <span className="font-medium">
                      DESCONTO {venda.descontoPercentual ? `(${venda.descontoPercentual.toFixed(1)}%)` : ""}:
                    </span>
                    <span>R$ {venda.desconto.toFixed(2)}</span>
                  </div>
                )}
                {venda.cupomCode && (
                  <div className="flex justify-between">
                    <span className="font-medium">CUPOM APLICADO:</span>
                    <span>{venda.cupomCode}</span>
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
                <p className="mt-2">VENDEDOR: {venda.vendedor || "Não identificado"}</p>
                <p>************************************************************</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
