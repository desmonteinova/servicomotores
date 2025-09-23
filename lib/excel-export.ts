// Utility functions for Excel export
export interface ExportData {
  loteNome: string
  numeroLoteMotor: string
  modeloVeiculo: string
  tipoServico: string
  valorServico: number
  dataCadastro: string
  observacoes?: string
}

export interface LoteExportData {
  nome: string
  dataCriacao: string
  status: string
  totalMotores: number
  custoTotal: number
}

export function exportToCSV(data: ExportData[], filename = "relatorio-motores") {
  const headers = [
    "Lote",
    "Número do Motor",
    "Modelo do Veículo",
    "Tipo de Serviço",
    "Valor do Serviço (R$)",
    "Data de Cadastro",
    "Observações",
  ]

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        `"${row.loteNome}"`,
        `"${row.numeroLoteMotor}"`,
        `"${row.modeloVeiculo}"`,
        `"${row.tipoServico}"`,
        row.valorServico.toFixed(2).replace(".", ","),
        `"${new Date(row.dataCadastro).toLocaleDateString("pt-BR")}"`,
        `"${row.observacoes || ""}"`,
      ].join(","),
    ),
  ].join("\n")

  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;")
}

export function exportLotesToCSV(data: LoteExportData[], filename = "relatorio-lotes") {
  const headers = ["Nome do Lote", "Data de Criação", "Status", "Total de Motores", "Custo Total (R$)"]

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        `"${row.nome}"`,
        `"${new Date(row.dataCriacao).toLocaleDateString("pt-BR")}"`,
        `"${row.status}"`,
        row.totalMotores.toString(),
        row.custoTotal.toFixed(2).replace(".", ","),
      ].join(","),
    ),
  ].join("\n")

  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;")
}

export function exportSummaryToCSV(
  totalLotes: number,
  totalMotores: number,
  custoTotal: number,
  custoMedio: number,
  filename = "resumo-geral",
) {
  const summaryData = [
    ["Métrica", "Valor"],
    ["Total de Lotes", totalLotes.toString()],
    ["Total de Motores", totalMotores.toString()],
    ["Custo Total (R$)", custoTotal.toFixed(2).replace(".", ",")],
    ["Custo Médio por Motor (R$)", custoMedio.toFixed(2).replace(".", ",")],
  ]

  const csvContent = summaryData.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Generate filename with current date
export function generateFilename(prefix: string): string {
  const now = new Date()
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "")
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "")
  return `${prefix}_${dateStr}_${timeStr}`
}
