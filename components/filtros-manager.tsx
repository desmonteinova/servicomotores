"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Filter, X, Search, Calendar, DollarSign, Package, RefreshCw } from "lucide-react"

// Mock data expandido
const mockLotes = [
  { id: "1", nome: "Lote Janeiro/2025", status: "ativo", dataCriacao: "2025-01-15" },
  { id: "2", nome: "Lote Dezembro/2024", status: "fechado", dataCriacao: "2024-12-01" },
  { id: "3", nome: "Lote Novembro/2024", status: "fechado", dataCriacao: "2024-11-01" },
  { id: "4", nome: "Lote Outubro/2024", status: "fechado", dataCriacao: "2024-10-01" },
]

const mockMotores = [
  {
    id: "1",
    loteId: "1",
    modeloVeiculo: "Honda Civic 2018",
    numeroLoteMotor: "LOTE-0001",
    tipoServico: "Troca de bronzina",
    valorServico: 850.0,
    dataCadastro: "2025-01-15",
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
    loteId: "1",
    modeloVeiculo: "Nissan Sentra 2019",
    numeroLoteMotor: "LOTE-0003",
    tipoServico: "Troca de válvulas",
    valorServico: 650.0,
    dataCadastro: "2025-01-17",
  },
  {
    id: "4",
    loteId: "2",
    modeloVeiculo: "Volkswagen Gol 2019",
    numeroLoteMotor: "LOTE-0004",
    tipoServico: "Troca de bronzina",
    valorServico: 780.0,
    dataCadastro: "2024-12-05",
  },
  {
    id: "5",
    loteId: "2",
    modeloVeiculo: "Chevrolet Onix 2021",
    numeroLoteMotor: "LOTE-0005",
    tipoServico: "Retífica do bloco",
    valorServico: 1500.0,
    dataCadastro: "2024-12-06",
  },
  {
    id: "6",
    loteId: "3",
    modeloVeiculo: "Ford Ka 2018",
    numeroLoteMotor: "LOTE-0006",
    tipoServico: "Revisão geral",
    valorServico: 2200.0,
    dataCadastro: "2024-11-10",
  },
  {
    id: "7",
    loteId: "3",
    modeloVeiculo: "Hyundai HB20 2020",
    numeroLoteMotor: "LOTE-0007",
    tipoServico: "Troca de pistões",
    valorServico: 950.0,
    dataCadastro: "2024-11-12",
  },
  {
    id: "8",
    loteId: "4",
    modeloVeiculo: "Renault Sandero 2019",
    numeroLoteMotor: "LOTE-0008",
    tipoServico: "Troca de anéis",
    valorServico: 420.0,
    dataCadastro: "2024-10-15",
  },
  {
    id: "9",
    loteId: "1",
    modeloVeiculo: "Fiat Uno 2017",
    numeroLoteMotor: "LOTE-0009",
    tipoServico: "Troca de bronzina",
    valorServico: 720.0,
    dataCadastro: "2025-01-18",
  },
  {
    id: "10",
    loteId: "2",
    modeloVeiculo: "Peugeot 208 2020",
    numeroLoteMotor: "LOTE-0010",
    tipoServico: "Retífica do cabeçote",
    valorServico: 1100.0,
    dataCadastro: "2024-12-08",
  },
]

interface FiltrosState {
  loteId: string
  modeloVeiculo: string
  numeroLoteMotor: string
  tipoServico: string
  valorMin: string
  valorMax: string
  dataInicio: string
  dataFim: string
}

const tiposServico = [
  "Troca de bronzina",
  "Retífica do cabeçote",
  "Troca de válvulas",
  "Retífica do bloco",
  "Troca de pistões",
  "Revisão geral",
  "Troca de anéis",
]

export function FiltrosManager() {
  const [filtros, setFiltros] = useState<FiltrosState>({
    loteId: "",
    modeloVeiculo: "",
    numeroLoteMotor: "",
    tipoServico: "",
    valorMin: "",
    valorMax: "",
    dataInicio: "",
    dataFim: "",
  })

  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>([])

  // Aplicar filtros aos dados
  const dadosFiltrados = useMemo(() => {
    return mockMotores.filter((motor) => {
      // Filtro por lote
      if (filtros.loteId && motor.loteId !== filtros.loteId) return false

      // Filtro por modelo do veículo
      if (filtros.modeloVeiculo && !motor.modeloVeiculo.toLowerCase().includes(filtros.modeloVeiculo.toLowerCase()))
        return false

      // Filtro por número do lote do motor
      if (
        filtros.numeroLoteMotor &&
        !motor.numeroLoteMotor.toLowerCase().includes(filtros.numeroLoteMotor.toLowerCase())
      )
        return false

      // Filtro por tipo de serviço
      if (filtros.tipoServico && motor.tipoServico !== filtros.tipoServico) return false

      // Filtro por valor mínimo
      if (filtros.valorMin && motor.valorServico < Number.parseFloat(filtros.valorMin)) return false

      // Filtro por valor máximo
      if (filtros.valorMax && motor.valorServico > Number.parseFloat(filtros.valorMax)) return false

      // Filtro por data início
      if (filtros.dataInicio && motor.dataCadastro < filtros.dataInicio) return false

      // Filtro por data fim
      if (filtros.dataFim && motor.dataCadastro > filtros.dataFim) return false

      return true
    })
  }, [filtros])

  // Calcular estatísticas dos dados filtrados
  const estatisticas = useMemo(() => {
    const total = dadosFiltrados.length
    const custoTotal = dadosFiltrados.reduce((sum, motor) => sum + motor.valorServico, 0)
    const custoMedio = total > 0 ? custoTotal / total : 0
    const lotesMaisFrequentes = dadosFiltrados.reduce(
      (acc, motor) => {
        const lote = mockLotes.find((l) => l.id === motor.loteId)
        if (lote) {
          acc[lote.nome] = (acc[lote.nome] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total,
      custoTotal,
      custoMedio,
      lotesMaisFrequentes,
    }
  }, [dadosFiltrados])

  const handleFiltroChange = (campo: keyof FiltrosState, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))

    // Atualizar filtros ativos
    if (valor) {
      if (!filtrosAtivos.includes(campo)) {
        setFiltrosAtivos((prev) => [...prev, campo])
      }
    } else {
      setFiltrosAtivos((prev) => prev.filter((f) => f !== campo))
    }
  }

  const limparFiltros = () => {
    setFiltros({
      loteId: "",
      modeloVeiculo: "",
      numeroLoteMotor: "",
      tipoServico: "",
      valorMin: "",
      valorMax: "",
      dataInicio: "",
      dataFim: "",
    })
    setFiltrosAtivos([])
  }

  const removerFiltro = (campo: keyof FiltrosState) => {
    handleFiltroChange(campo, "")
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

  const getNomeFiltro = (campo: string) => {
    const nomes: Record<string, string> = {
      loteId: "Lote",
      modeloVeiculo: "Modelo",
      numeroLoteMotor: "Número Motor",
      tipoServico: "Tipo Serviço",
      valorMin: "Valor Mín.",
      valorMax: "Valor Máx.",
      dataInicio: "Data Início",
      dataFim: "Data Fim",
    }
    return nomes[campo] || campo
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Filtros Inteligentes</h2>
          <p className="text-muted-foreground">Filtre e analise os dados de motores e lotes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={limparFiltros} disabled={filtrosAtivos.length === 0}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Filtros Ativos */}
      {filtrosAtivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtros Ativos ({filtrosAtivos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filtrosAtivos.map((campo) => (
                <Badge key={campo} variant="secondary" className="flex items-center gap-2">
                  {getNomeFiltro(campo)}: {filtros[campo as keyof FiltrosState]}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removerFiltro(campo as keyof FiltrosState)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel de Filtros */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtro por Lote */}
              <div className="space-y-2">
                <Label>Lote Fechado</Label>
                <Select value={filtros.loteId} onValueChange={(value) => handleFiltroChange("loteId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os lotes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os lotes</SelectItem>
                    {mockLotes.map((lote) => (
                      <SelectItem key={lote.id} value={lote.id}>
                        {lote.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Modelo */}
              <div className="space-y-2">
                <Label>Modelo do Veículo</Label>
                <Input
                  placeholder="Ex: Honda Civic"
                  value={filtros.modeloVeiculo}
                  onChange={(e) => handleFiltroChange("modeloVeiculo", e.target.value)}
                />
              </div>

              {/* Filtro por Número do Motor */}
              <div className="space-y-2">
                <Label>Número do Lote do Motor</Label>
                <Input
                  placeholder="Ex: LOTE-0001"
                  value={filtros.numeroLoteMotor}
                  onChange={(e) => handleFiltroChange("numeroLoteMotor", e.target.value)}
                />
              </div>

              {/* Filtro por Tipo de Serviço */}
              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <Select value={filtros.tipoServico} onValueChange={(value) => handleFiltroChange("tipoServico", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os serviços" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os serviços</SelectItem>
                    {tiposServico.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros de Valor */}
              <div className="space-y-2">
                <Label>Faixa de Valor</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Mín."
                    value={filtros.valorMin}
                    onChange={(e) => handleFiltroChange("valorMin", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Máx."
                    value={filtros.valorMax}
                    onChange={(e) => handleFiltroChange("valorMax", e.target.value)}
                  />
                </div>
              </div>

              {/* Filtros de Data */}
              <div className="space-y-2">
                <Label>Período</Label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
                  />
                  <Input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-3 space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{estatisticas.total}</p>
                    <p className="text-sm text-muted-foreground">Motores encontrados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(estatisticas.custoTotal)}</p>
                    <p className="text-sm text-muted-foreground">Custo total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(estatisticas.custoMedio)}</p>
                    <p className="text-sm text-muted-foreground">Custo médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Resultados da Busca ({dadosFiltrados.length} itens)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dadosFiltrados.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote</TableHead>
                      <TableHead>Número Motor</TableHead>
                      <TableHead>Modelo Veículo</TableHead>
                      <TableHead>Tipo de Serviço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosFiltrados.map((motor) => {
                      const lote = mockLotes.find((l) => l.id === motor.loteId)
                      return (
                        <TableRow key={motor.id}>
                          <TableCell>
                            <Badge variant="outline">{lote?.nome}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{motor.numeroLoteMotor}</TableCell>
                          <TableCell>{motor.modeloVeiculo}</TableCell>
                          <TableCell>{motor.tipoServico}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(motor.valorServico)}</TableCell>
                          <TableCell>{formatDate(motor.dataCadastro)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-muted-foreground">Tente ajustar os filtros para encontrar mais resultados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
