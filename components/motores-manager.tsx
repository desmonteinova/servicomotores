"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Settings, Edit, Trash2, ArrowLeft, DollarSign } from "lucide-react"

interface Motor {
  id: string
  loteId: string
  modeloVeiculo: string
  numeroLoteMotor: string
  tipoServico: string
  valorServico: number
  dataCadastro: string
  observacoes?: string
}

interface Lote {
  id: string
  nome: string
  status: "ativo" | "fechado"
}

// Mock data
const mockLotes: Lote[] = [
  { id: "1", nome: "Lote Janeiro/2025", status: "ativo" },
  { id: "2", nome: "Lote Dezembro/2024", status: "fechado" },
  { id: "3", nome: "Lote Novembro/2024", status: "fechado" },
]

const mockMotores: Motor[] = [
  {
    id: "1",
    loteId: "1",
    modeloVeiculo: "Honda Civic 2018",
    numeroLoteMotor: "LOTE-0001",
    tipoServico: "Troca de bronzina",
    valorServico: 850.0,
    dataCadastro: "2025-01-15",
    observacoes: "Motor com desgaste normal",
  },
  {
    id: "2",
    loteId: "1",
    modeloVeiculo: "Toyota Corolla 2020",
    numeroLoteMotor: "LOTE-0002",
    tipoServico: "Retífica do cabeçote",
    valorServico: 1200.0,
    dataCadastro: "2025-01-16",
  },
  {
    id: "3",
    loteId: "2",
    modeloVeiculo: "Volkswagen Gol 2019",
    numeroLoteMotor: "LOTE-0003",
    tipoServico: "Troca de válvulas",
    valorServico: 650.0,
    dataCadastro: "2024-12-05",
  },
]

const tiposServico = [
  "Troca de bronzina",
  "Retífica do cabeçote",
  "Troca de válvulas",
  "Retífica do bloco",
  "Troca de pistões",
  "Revisão geral",
  "Troca de anéis",
  "Outro",
]

interface MotoresManagerProps {
  loteId?: string
  onBack?: () => void
}

export function MotoresManager({ loteId, onBack }: MotoresManagerProps) {
  const [motores, setMotores] = useState<Motor[]>(mockMotores)
  const [lotes] = useState<Lote[]>(mockLotes)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMotor, setEditingMotor] = useState<Motor | null>(null)
  const [selectedLoteId, setSelectedLoteId] = useState(loteId || "")
  const [formData, setFormData] = useState({
    modeloVeiculo: "",
    numeroLoteMotor: "",
    tipoServico: "",
    valorServico: "",
    observacoes: "",
  })

  // Filtrar motores por lote se especificado
  const filteredMotores = loteId ? motores.filter((motor) => motor.loteId === loteId) : motores

  const selectedLote = lotes.find((lote) => lote.id === (loteId || selectedLoteId))

  const generateNextLoteNumber = (loteId: string) => {
    const motoresDoLote = motores.filter((motor) => motor.loteId === loteId)
    const nextNumber = motoresDoLote.length + 1
    return `LOTE-${nextNumber.toString().padStart(4, "0")}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const targetLoteId = loteId || selectedLoteId
    if (!targetLoteId) return

    if (editingMotor) {
      // Editar motor existente
      setMotores(
        motores.map((motor) =>
          motor.id === editingMotor.id
            ? {
                ...motor,
                modeloVeiculo: formData.modeloVeiculo,
                tipoServico: formData.tipoServico,
                valorServico: Number.parseFloat(formData.valorServico),
                observacoes: formData.observacoes,
              }
            : motor,
        ),
      )
    } else {
      // Criar novo motor
      const novoMotor: Motor = {
        id: Date.now().toString(),
        loteId: targetLoteId,
        modeloVeiculo: formData.modeloVeiculo,
        numeroLoteMotor: formData.numeroLoteMotor || generateNextLoteNumber(targetLoteId),
        tipoServico: formData.tipoServico,
        valorServico: Number.parseFloat(formData.valorServico),
        dataCadastro: new Date().toISOString().split("T")[0],
        observacoes: formData.observacoes,
      }
      setMotores([novoMotor, ...motores])
    }

    // Reset form
    setFormData({
      modeloVeiculo: "",
      numeroLoteMotor: "",
      tipoServico: "",
      valorServico: "",
      observacoes: "",
    })
    setEditingMotor(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (motor: Motor) => {
    setEditingMotor(motor)
    setFormData({
      modeloVeiculo: motor.modeloVeiculo,
      numeroLoteMotor: motor.numeroLoteMotor,
      tipoServico: motor.tipoServico,
      valorServico: motor.valorServico.toString(),
      observacoes: motor.observacoes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este motor?")) {
      setMotores(motores.filter((motor) => motor.id !== id))
    }
  }

  const handleNewMotor = () => {
    const targetLoteId = loteId || selectedLoteId
    if (!targetLoteId) {
      alert("Selecione um lote primeiro")
      return
    }

    setEditingMotor(null)
    setFormData({
      modeloVeiculo: "",
      numeroLoteMotor: generateNextLoteNumber(targetLoteId),
      tipoServico: "",
      valorServico: "",
      observacoes: "",
    })
    setIsDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const totalCusto = filteredMotores.reduce((sum, motor) => sum + motor.valorServico, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {loteId ? `Motores - ${selectedLote?.nome}` : "Gerenciar Motores"}
            </h2>
            <p className="text-muted-foreground">
              {loteId ? `${filteredMotores.length} motores cadastrados` : "Cadastre e gerencie motores por lote"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!loteId && (
            <Select value={selectedLoteId} onValueChange={setSelectedLoteId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar lote" />
              </SelectTrigger>
              <SelectContent>
                {lotes.map((lote) => (
                  <SelectItem key={lote.id} value={lote.id}>
                    {lote.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewMotor}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Motor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingMotor ? "Editar Motor" : "Cadastrar Novo Motor"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo do Veículo</Label>
                    <Input
                      id="modelo"
                      placeholder="Ex: Honda Civic 2018"
                      value={formData.modeloVeiculo}
                      onChange={(e) => setFormData({ ...formData, modeloVeiculo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroLote">Número do Lote do Motor</Label>
                    <Input
                      id="numeroLote"
                      placeholder="Ex: LOTE-0001"
                      value={formData.numeroLoteMotor}
                      onChange={(e) => setFormData({ ...formData, numeroLoteMotor: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                    <Select
                      value={formData.tipoServico}
                      onValueChange={(value) => setFormData({ ...formData, tipoServico: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposServico.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor do Serviço (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.valorServico}
                      onChange={(e) => setFormData({ ...formData, valorServico: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações sobre o motor ou serviço..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingMotor ? "Salvar Alterações" : "Cadastrar Motor"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Card */}
      {(loteId || selectedLoteId) && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{filteredMotores.length}</p>
                <p className="text-sm text-muted-foreground">Total de Motores</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCusto)}</p>
                <p className="text-sm text-muted-foreground">Custo Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {filteredMotores.length > 0 ? formatCurrency(totalCusto / filteredMotores.length) : "R$ 0,00"}
                </p>
                <p className="text-sm text-muted-foreground">Custo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motores List */}
      <div className="space-y-4">
        {filteredMotores.map((motor) => (
          <Card key={motor.id} className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{motor.modeloVeiculo}</h3>
                      <p className="text-sm text-muted-foreground">{motor.numeroLoteMotor}</p>
                    </div>
                    <Badge variant="outline">{motor.tipoServico}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor do Serviço</p>
                      <p className="font-medium text-foreground flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(motor.valorServico)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data de Cadastro</p>
                      <p className="font-medium text-foreground">{formatDate(motor.dataCadastro)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lote</p>
                      <p className="font-medium text-foreground">{lotes.find((l) => l.id === motor.loteId)?.nome}</p>
                    </div>
                  </div>

                  {motor.observacoes && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground text-sm">Observações:</p>
                      <p className="text-sm text-foreground">{motor.observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(motor)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(motor.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMotores.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {!selectedLoteId && !loteId ? "Selecione um lote" : "Nenhum motor encontrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {!selectedLoteId && !loteId
                ? "Selecione um lote para visualizar ou cadastrar motores."
                : "Cadastre o primeiro motor para este lote."}
            </p>
            {(selectedLoteId || loteId) && (
              <Button onClick={handleNewMotor}>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Motor
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
