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
