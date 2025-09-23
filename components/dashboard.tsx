"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, DollarSign, TrendingUp, Calendar, Plus, Filter, Download } from "lucide-react"
import { dataStore } from "@/lib/data-store"

interface DashboardProps {
  onNavigate?: (view: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [metrics, setMetrics] = useState(dataStore.getMetrics())
  const [recentLotes, setRecentLotes] = useState(dataStore.getLotes().slice(0, 3))

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setMetrics(dataStore.getMetrics())
      setRecentLotes(dataStore.getLotes().slice(0, 3))
    })

    return unsubscribe
  }, [])

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Controle de gastos com motores automotivos</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => onNavigate?.("filtros")}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate?.("exportar")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => onNavigate?.("lotes")}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Lote
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Lotes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metrics.totalLotes}</div>
              <p className="text-xs text-muted-foreground">Lotes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Motores</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metrics.totalMotores}</div>
              <p className="text-xs text-muted-foreground">Motores cadastrados</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Custo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {metrics.custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Valor total investido</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média por Lote</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {metrics.mediaGastoLote.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Custo médio por lote</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Lotes */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Lotes Recentes</CardTitle>
              <Button variant="outline" size="sm" onClick={() => onNavigate?.("lotes")}>
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLotes.map((lote) => (
                <div
                  key={lote.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{lote.nome}</h3>
                      <p className="text-sm text-muted-foreground">{lote.totalMotores} motores</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        R$ {lote.custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant={lote.status === "ativo" ? "default" : "secondary"}>
                        {lote.status === "ativo" ? "Ativo" : "Fechado"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
