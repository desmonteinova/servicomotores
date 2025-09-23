"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileSpreadsheet, FileText, Package, Settings } from "lucide-react"
import {
  exportToCSV,
  exportLotesToCSV,
  exportSummaryToCSV,
  generateFilename,
  type ExportData,
  type LoteExportData,
} from "@/lib/excel-export"

// Mock data (mesmo dos outros componentes)
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

export function ExportManager() {
  const [selectedLote, setSelectedLote] = useState<string>("todos")
  const [exportOptions, setExportOptions] = useState({
    incluirObservacoes: true,
    incluirResumo: true,
    agruparPorLote: false,
  })

  const handleExportMotores = () => {
    const filteredMotores =
      selectedLote === "todos" ? mockMotores : mockMotores.filter((motor) => motor.loteId === selectedLote)

    const exportData: ExportData[] = filteredMotores.map((motor) => {
      const lote = mockLotes.find((l) => l.id === motor.loteId)
      return {
        loteNome: lote?.nome || "Lote não encontrado",
        numeroLoteMotor: motor.numeroLoteMotor,
        modeloVeiculo: motor.modeloVeiculo,
        tipoServico: motor.tipoServico,
        valorServico: motor.valorServico,
        dataCadastro: motor.dataCadastro,
        observacoes: exportOptions.incluirObservacoes ? motor.observacoes : undefined,
      }
    })

    const filename = generateFilename(
      selectedLote === "todos" ? "relatorio-motores-completo" : `relatorio-motores-${selectedLote}`,
    )

    exportToCSV(exportData, filename)
  }

  const handleExportLotes = () => {
    const loteData: LoteExportData[] = mockLotes.map((lote) => {
      const motoresDoLote = mockMotores.filter((motor) => motor.loteId === lote.id)
      const custoTotal = motoresDoLote.reduce((sum, motor) => sum + motor.valorServico, 0)

      return {
        nome: lote.nome,
        dataCriacao: lote.dataCriacao,
        status: lote.status === "ativo" ? "Ativo" : "Fechado",
        totalMotores: motoresDoLote.length,
        custoTotal,
      }
    })

    const filename = generateFilename("relatorio-lotes")
    exportLotesToCSV(loteData, filename)
  }

  const handleExportResumo = () => {
    const totalLotes = mockLotes.length
    const totalMotores = mockMotores.length
    const custoTotal = mockMotores.reduce((sum, motor) => sum + motor.valorServico, 0)
    const custoMedio = totalMotores > 0 ? custoTotal / totalMotores : 0

    const filename = generateFilename("resumo-geral")
    exportSummaryToCSV(totalLotes, totalMotores, custoTotal, custoMedio, filename)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Calcular estatísticas para preview
  const filteredMotores =
    selectedLote === "todos" ? mockMotores : mockMotores.filter((motor) => motor.loteId === selectedLote)

  const previewStats = {
    totalMotores: filteredMotores.length,
    custoTotal: filteredMotores.reduce((sum, motor) => sum + motor.valorServico, 0),
    lotesSelecionados: selectedLote === "todos" ? mockLotes.length : 1,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Exportar Relatórios</h2>
          <p className="text-muted-foreground">Exporte dados para Excel/CSV para análise externa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações de Exportação */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção de Lote */}
              <div className="space-y-2">
                <Label>Filtrar por Lote</Label>
                <Select value={selectedLote} onValueChange={setSelectedLote}>
                  <SelectTrigger>
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
              </div>

              {/* Opções de Exportação */}
              <div className="space-y-3">
                <Label>Opções de Exportação</Label>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="observacoes"
                    checked={exportOptions.incluirObservacoes}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, incluirObservacoes: checked as boolean }))
                    }
                  />
                  <Label htmlFor="observacoes" className="text-sm">
                    Incluir observações
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resumo"
                    checked={exportOptions.incluirResumo}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, incluirResumo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="resumo" className="text-sm">
                    Incluir resumo estatístico
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agrupar"
                    checked={exportOptions.agruparPorLote}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, agruparPorLote: checked as boolean }))
                    }
                  />
                  <Label htmlFor="agrupar" className="text-sm">
                    Agrupar por lote
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview dos Dados */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Preview da Exportação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Motores:</span>
                <Badge variant="outline">{previewStats.totalMotores}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lotes:</span>
                <Badge variant="outline">{previewStats.lotesSelecionados}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Valor Total:</span>
                <Badge variant="outline">{formatCurrency(previewStats.custoTotal)}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opções de Exportação */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exportar Motores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Relatório de Motores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exporta dados detalhados de todos os motores cadastrados, incluindo modelo do veículo, tipo de
                  serviço, valores e datas.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Registros a exportar:</span>
                    <Badge>{previewStats.totalMotores}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Valor total:</span>
                    <Badge variant="outline">{formatCurrency(previewStats.custoTotal)}</Badge>
                  </div>
                </div>

                <Button onClick={handleExportMotores} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Motores
                </Button>
              </CardContent>
            </Card>

            {/* Exportar Lotes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Relatório de Lotes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exporta resumo dos lotes fechados com totais de motores, custos e status de cada lote.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Lotes a exportar:</span>
                    <Badge>{mockLotes.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total de motores:</span>
                    <Badge variant="outline">{mockMotores.length}</Badge>
                  </div>
                </div>

                <Button onClick={handleExportLotes} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Lotes
                </Button>
              </CardContent>
            </Card>

            {/* Exportar Resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Resumo Executivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exporta resumo executivo com métricas principais: totais, médias e indicadores de performance.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Métricas incluídas:</span>
                    <Badge>4</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Período:</span>
                    <Badge variant="outline">Completo</Badge>
                  </div>
                </div>

                <Button onClick={handleExportResumo} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Resumo
                </Button>
              </CardContent>
            </Card>

            {/* Exportação Personalizada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  Exportação Completa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exporta todos os dados em um único arquivo: motores, lotes e resumo executivo.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Planilhas:</span>
                    <Badge>3</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total de registros:</span>
                    <Badge variant="outline">{mockMotores.length + mockLotes.length}</Badge>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    handleExportMotores()
                    setTimeout(() => handleExportLotes(), 500)
                    setTimeout(() => handleExportResumo(), 1000)
                  }}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Tudo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Informações sobre Formato */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Informações sobre Exportação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Formato dos Arquivos</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Formato: CSV (compatível com Excel)</li>
                    <li>• Codificação: UTF-8 com BOM</li>
                    <li>• Separador: Vírgula (,)</li>
                    <li>• Decimais: Vírgula (padrão brasileiro)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Nomenclatura dos Arquivos</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Inclui data e hora da exportação</li>
                    <li>• Formato: relatorio_AAAAMMDD_HHMMSS</li>
                    <li>• Exemplo: relatorio-motores_20250123_143022.csv</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
