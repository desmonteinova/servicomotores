"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { FileText, DollarSign, Package, TrendingUp, Calendar, Download, Eye } from "lucide-react"

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
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function RelatoriosManager() {
  const [selectedLote, setSelectedLote] = useState<string>("todos")
  const [viewMode, setViewMode] = useState<"resumo" | "detalhado" | "graficos">("resumo")

  // Filtrar dados baseado no lote selecionado
  const filteredMotores =
    selectedLote === "todos" ? mockMotores : mockMotores.filter((motor) => motor.loteId === selectedLote)

  const filteredLotes = selectedLote === "todos" ? mockLotes : mockLotes.filter((lote) => lote.id === selectedLote)

  // Calcular métricas
  const totalMotores = filteredMotores.length
  const custoTotal = filteredMotores.reduce((sum, motor) => sum + motor.valorServico, 0)
  const custoMedio = totalMotores > 0 ? custoTotal / totalMotores : 0
  const totalLotes = filteredLotes.length

  // Dados para gráficos
  const custoPorLote = mockLotes.map((lote) => {
    const motoresDoLote = mockMotores.filter((motor) => motor.loteId === lote.id)
    const custo = motoresDoLote.reduce((sum, motor) => sum + motor.valorServico, 0)
    return {
      nome: lote.nome.replace("Lote ", ""),
      custo: custo,
      motores: motoresDoLote.length,
    }
  })

  const servicosPorTipo = mockMotores.reduce(
    (acc, motor) => {
      const tipo = motor.tipoServico
      if (!acc[tipo]) {
        acc[tipo] = { nome: tipo, quantidade: 0, valor: 0 }
      }
      acc[tipo].quantidade += 1
      acc[tipo].valor += motor.valorServico
      return acc
    },
    {} as Record<string, { nome: string; quantidade: number; valor: number }>,
  )

  const dadosServicos = Object.values(servicosPorTipo)

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const renderResumo = () => (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Lotes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalLotes}</div>
            <p className="text-xs text-muted-foreground">
              {selectedLote === "todos" ? "Todos os lotes" : "Lote selecionado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Motores</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalMotores}</div>
            <p className="text-xs text-muted-foreground">Motores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(custoTotal)}</div>
            <p className="text-xs text-muted-foreground">Soma de todos os serviços</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custo Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(custoMedio)}</div>
            <p className="text-xs text-muted-foreground">Por motor</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Lote */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Lote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {custoPorLote.map((lote, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Lote {lote.nome}</h3>
                    <p className="text-sm text-muted-foreground">{lote.motores} motores</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatCurrency(lote.custo)}</p>
                  <p className="text-sm text-muted-foreground">
                    Média: {formatCurrency(lote.motores > 0 ? lote.custo / lote.motores : 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDetalhado = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatório Detalhado de Motores</CardTitle>
        </CardHeader>
        <CardContent>
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
              {filteredMotores.map((motor) => {
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
        </CardContent>
      </Card>
    </div>
  )

  const renderGraficos = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Custos por Lote */}
        <Card>
          <CardHeader>
            <CardTitle>Custos por Lote</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={custoPorLote}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="custo" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Serviços por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosServicos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, quantidade }) => `${nome}: ${quantidade}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {dadosServicos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Tipo de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Serviço</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Valor Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosServicos.map((servico, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{servico.nome}</TableCell>
                  <TableCell>{servico.quantidade}</TableCell>
                  <TableCell>{formatCurrency(servico.valor)}</TableCell>
                  <TableCell>{formatCurrency(servico.valor / servico.quantidade)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Relatórios e Métricas</h2>
          <p className="text-muted-foreground">Análise detalhada dos custos e operações</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLote} onValueChange={setSelectedLote}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Lotes</SelectItem>
              {mockLotes.map((lote) => (
                <SelectItem key={lote.id} value={lote.id}>
                  {lote.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center gap-2">
        <Button variant={viewMode === "resumo" ? "default" : "outline"} size="sm" onClick={() => setViewMode("resumo")}>
          <FileText className="w-4 h-4 mr-2" />
          Resumo
        </Button>
        <Button
          variant={viewMode === "detalhado" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("detalhado")}
        >
          <Eye className="w-4 h-4 mr-2" />
          Detalhado
        </Button>
        <Button
          variant={viewMode === "graficos" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("graficos")}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Gráficos
        </Button>
      </div>

      {/* Content */}
      {viewMode === "resumo" && renderResumo()}
      {viewMode === "detalhado" && renderDetalhado()}
      {viewMode === "graficos" && renderGraficos()}
    </div>
  )
}
