import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import TopBar from "@/components/top-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "PharmaCRM - Sistema de Gestão para Farmácias",
  description: "CRM e PDV completo para farmácias",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar se está na página de login
  const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/login"

  // Se não estiver na página de login, verificar se o usuário está logado
  if (!isLoginPage && typeof window !== "undefined") {
    const usuarioLogado = localStorage.getItem("usuarioLogado")
    if (!usuarioLogado) {
      // Redirecionar para a página de login
      window.location.href = "/login"
      return null
    }
  }

  // Se estiver na página de login, não mostrar o layout completo
  if (isLoginPage) {
    return (
      <html lang="pt-BR">
        <body className={`${inter.className} bg-gray-50`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    )
  }

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto p-4 bg-gray-50">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
