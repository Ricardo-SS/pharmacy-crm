"use client"

import { useState, useEffect } from "react"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function TopBar() {
  const [notifications, setNotifications] = useState([])
  const [date, setDate] = useState("")

  useEffect(() => {
    // Formatar data atual
    const now = new Date()
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    setDate(now.toLocaleDateString("pt-BR", options))

    // Carregar notificações (simulado)
    const loadedNotifications = [
      { id: 1, texto: "5 produtos estão com estoque baixo", isNew: true },
      { id: 2, texto: "3 clientes fazem aniversário hoje", isNew: true },
      { id: 3, texto: "2 clientes estão com pagamentos atrasados", isNew: false },
    ]
    setNotifications(loadedNotifications)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Buscar no sistema..." className="pl-9 w-[250px] bg-gray-50" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium">Bem-vindo de volta!</p>
          <p className="text-xs text-gray-500 capitalize">{date}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.filter((n) => n.isNew).length > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
                  variant="destructive"
                >
                  {notifications.filter((n) => n.isNew).length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <div className="p-2 border-b border-gray-100">
              <h4 className="text-sm font-medium">Notificações</h4>
            </div>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <div
                      className={`h-2 w-2 rounded-full mt-1.5 ${notification.isNew ? "bg-blue-500" : "bg-gray-300"}`}
                    />
                    <span className="text-sm">{notification.texto}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">Nenhuma notificação</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
