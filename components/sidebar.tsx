"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Home,
  LogOut,
  DollarSign,
  Menu,
  X,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: ShoppingCart, label: "PDV", href: "/pdv" },
  { icon: DollarSign, label: "Caixa", href: "/caixa" },
  { icon: CreditCard, label: "Contas", href: "/contas" },
  { icon: BarChart2, label: "Relatórios", href: "/relatorios" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState({ nome: "", cargo: "" })

  useEffect(() => {
    // Recuperar dados do usuário logado
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}")
    setUserData({
      nome: usuario.nome || "Usuário",
      cargo: usuario.cargo || "Admin",
    })
  }, [])

  // Agora, vamos filtrar os itens do menu com base no cargo
  const filteredMenuItems = () => {
    if (userData.cargo.toLowerCase() === "vendedor") {
      return menuItems.filter((item) => item.href === "/pdv" || item.href === "/caixa")
    }
    return menuItems
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado")
    window.location.href = "/login"
  }

  return (
    <>
      {isMobile && (
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50" onClick={toggleSidebar}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}

      <aside
        className={cn(
          "bg-white border-r border-gray-200 w-64 transition-all duration-300 ease-in-out",
          isMobile
            ? isOpen
              ? "translate-x-0 fixed inset-y-0 left-0 z-40"
              : "-translate-x-full fixed inset-y-0 left-0 z-40"
            : "relative",
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 text-center">
            <h2 className="text-xl font-bold text-red-600">PharmaCRM</h2>
            <p className="text-xs text-gray-500 mt-1">Sistema de Gestão</p>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-semibold">{userData.nome.charAt(0)}</span>
              </div>
              <p className="font-medium text-sm">{userData.nome}</p>
              <p className="text-xs text-gray-500">{userData.cargo}</p>
            </div>
          </div>

          <nav className="flex-1 p-2 overflow-y-auto">
            <ul className="space-y-1">
              {filteredMenuItems().map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                      pathname === item.href ? "bg-red-50 text-red-600 font-medium" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start gap-2 text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
