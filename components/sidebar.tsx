"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, FileText, Filter, Download, Plus, Settings } from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Package, label: "Lotes Fechados", id: "lotes" },
  { icon: Settings, label: "Motores", id: "motores" },
  { icon: FileText, label: "Relatórios", id: "relatorios" },
  { icon: Filter, label: "Filtros", id: "filtros" },
  { icon: Download, label: "Exportar", id: "exportar" },
]

interface SidebarProps {
  onMenuSelect?: (menuId: string) => void
}

export function Sidebar({ onMenuSelect }: SidebarProps) {
  const [activeMenu, setActiveMenu] = useState("dashboard")

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId)
    onMenuSelect?.(menuId)
  }

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Inova Ecopeças</h1>
            <p className="text-xs text-muted-foreground">Sistema de Controle</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeMenu === item.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-10"
                onClick={() => handleMenuClick(item.id)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3 px-2">AÇÕES RÁPIDAS</p>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => handleMenuClick("lotes")}
            >
              <Plus className="w-4 h-4" />
              Novo Lote
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => handleMenuClick("motores")}
            >
              <Plus className="w-4 h-4" />
              Novo Motor
            </Button>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Settings className="w-4 h-4" />
          Configurações
        </Button>
      </div>
    </div>
  )
}
