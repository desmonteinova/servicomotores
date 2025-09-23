"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Package, Calendar, Edit, Trash2 } from "lucide-react"
import { MotoresManager } from "./motores-manager"
import { dataStore, type Lote } from "@/lib/data-store"

export function LotesManager() {
  const [lotes, setLotes] = useState<Lote[]>(dataStore.getLotes())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLote, setEditingLote] = useState<Lote | null>(null)
  const [selectedLoteId, setSelectedLoteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    dataCriacao: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setLotes(dataStore.getLotes())
    })

    return unsubscribe
  }, [])

  if (selectedLoteId) {
    return <MotoresManager loteId={selectedLoteId} onBack={() => setSelectedLoteId(null)} />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingLote) {
      // Editar lote existente
      dataStore.updateLote(editingLote.id, {
        nome: formData.nome,
        dataCriacao: formData.dataCriacao,
      })
    } else {
      // Criar novo lote
      dataStore.addLote({
        nome: formData.nome,
        dataCriacao: formData.dataCriacao,
        status: "ativo",
      })
    }

    // Reset form
    setFormData({ nome: "", dataCriacao: new Date().toISOString().split("T")[0] })
    setEditingLote(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (lote: Lote) => {
    setEditingLote(lote)
    setFormData({
      nome: lote.nome,
      dataCriacao: lote.dataCriacao,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lote?")) {
      dataStore.deleteLote(id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Lotes Fechados</h2>
          <p className="text-muted-foreground">Gerencie os lotes de motores da empresa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingLote(null)
                setFormData({ nome: "", dataCriacao: new Date().toISOString().split("T")[0] })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingLote ? "Editar Lote" : "Criar Novo Lote"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Lote</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Lote Janeiro/2025"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data de Criação</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.dataCriacao}
                  onChange={(e) => setFormData({ ...formData, dataCriacao: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingLote ? "Salvar Alterações" : "Criar Lote"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotes.map((lote) => (
          <Card key={lote.id} className="animate-fade-in hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{lote.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(lote.dataCriacao)}
                    </p>
                  </div>
                </div>
                <Badge variant={lote.status === "ativo" ? "default" : "secondary"}>
                  {lote.status === "ativo" ? "Ativo" : "Fechado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{lote.totalMotores}</p>
                  <p className="text-xs text-muted-foreground">Motores</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{formatCurrency(lote.custoTotal)}</p>
                  <p className="text-xs text-muted-foreground">Custo Total</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleEdit(lote)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleDelete(lote.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
              <Button className="w-full" size="sm" onClick={() => setSelectedLoteId(lote.id)}>
                <Plus className="w-4 h-4 mr-2" />
                Gerenciar Motores
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {lotes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum lote encontrado</h3>
            <p className="text-muted-foreground mb-4">Crie seu primeiro lote para começar a gerenciar os motores.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Lote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
