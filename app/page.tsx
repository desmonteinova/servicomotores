"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured, testSupabaseConnection } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, X, Wifi, WifiOff, Database, TrendingUp, FileText } from "lucide-react"
import SetupGuide from "@/components/setup-guide"

interface Motor {
  id: string
  modelo: string
  numeroMotor: string
  operador: string
  observacoes: string
  servicos: Array<{
    tipo: string
    valor: number
  }>
  lote: string
  data: string
}

interface Lote {
  id: string
  nome: string
  data: string
}

const converterDataBrasileiraParaBanco = (dataBrasileira: string): string => {
  if (!dataBrasileira || dataBrasileira.length !== 10) return ""

  const [dia, mes, ano] = dataBrasileira.split("/")
  if (!dia || !mes || !ano) return ""

  // Validar se é uma data válida
  const diaNum = Number.parseInt(dia, 10)
  const mesNum = Number.parseInt(mes, 10)
  const anoNum = Number.parseInt(ano, 10)

  if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12 || anoNum < 1900) {
    return ""
  }

  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`
}

const converterDataBancoParaBrasileira = (dataBanco: string): string => {
  if (!dataBanco) return ""

  // Se já está no formato brasileiro, retornar como está
  if (dataBanco.includes("/")) return dataBanco

  // Se está no formato do banco YYYY-MM-DD
  if (dataBanco.includes("-")) {
    const [ano, mes, dia] = dataBanco.split("-")
    if (ano && mes && dia) {
      return `${dia}/${mes}/${ano}`
    }
  }

  return dataBanco
}

const aplicarMascaraData = (valor: string): string => {
  // Remove tudo que não é número
  const apenasNumeros = valor.replace(/\D/g, "")

  // Aplica a máscara DD/MM/YYYY
  if (apenasNumeros.length <= 2) {
    return apenasNumeros
  } else if (apenasNumeros.length <= 4) {
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`
  } else {
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`
  }
}

export default function Home() {
  const [isOnlineMode, setIsOnlineMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "online" | "offline" | "setup_needed">(
    "checking",
  )
  const [showConnectionDetails, setShowConnectionDetails] = useState(false)

  const [lotes, setLotes] = useState<Lote[]>([])
  const [motores, setMotores] = useState<Motor[]>([])

  const [novoLote, setNovoLote] = useState({ nome: "", data: "" })

  const [loteEditando, setLoteEditando] = useState<Lote | null>(null)
  const [loteEditandoDados, setLoteEditandoDados] = useState({ nome: "", data: "" })

  const [novoMotor, setNovoMotor] = useState({
    modelo: "",
    numeroMotor: "",
    operador: "",
    observacoes: "",
    servicosSelecionados: [] as string[],
    valoresServicos: {} as Record<string, string>,
    lote: "",
  })

  const [motorEditando, setMotorEditando] = useState<Motor | null>(null)
  const [motorEditandoServicos, setMotorEditandoServicos] = useState<string[]>([])
  const [motorEditandoValores, setMotorEditandoValores] = useState<Record<string, string>>({})
  const [motorEditandoOperador, setMotorEditandoOperador] = useState("")
  const [motorEditandoObservacoes, setMotorEditandoObservacoes] = useState("")

  const [filtroNumeroMotor, setFiltroNumeroMotor] = useState("")
  const [filtroModeloVeiculo, setFiltroModeloVeiculo] = useState("")

  const [loteMotoresVisivel, setLoteMotoresVisivel] = useState<string | null>(null)

  const [paginaAtual, setPaginaAtual] = useState(1)
  const motoresPorPagina = 10

  const [modalNovoLoteAberto, setModalNovoLoteAberto] = useState(false)
  const [modalNovoMotorAberto, setModalNovoMotorAberto] = useState(false)
  const [modalEditarLoteAberto, setModalEditarLoteAberto] = useState(false)

  const [modalExclusao, setModalExclusao] = useState<{
    aberto: boolean
    tipo: "lote" | "motor"
    id: string
    nome: string
  }>({
    aberto: false,
    tipo: "lote",
    id: "",
    nome: "",
  })
  const [senhaExclusao, setSenhaExclusao] = useState("")
  const [erroSenhaExclusao, setErroSenhaExclusao] = useState("")

  const tiposServicos = [
    "Revisão simples",
    "Troca de virabrequim",
    "Retifica de virabrequim",
    "Troca junta de cabeçote",
    "Retifica de cabeçote",
    "Troca de anéis",
    "Troca de pistão",
    "Serviços mão de obra",
    "Desmontagem do motor", // Adicionado serviço de desmontagem do motor
    "Troca de bronzina de mancal",
    "Troca de bronzina de biela",
    "Troca de biela",
    "Troca de mancal",
  ]

  const exportData = () => {
    return {
      lotes,
      motores,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }
  }

  const importData = (data: any) => {
    if (data.lotes && data.motores) {
      setLotes(data.lotes)
      setMotores(data.motores)

      // Salvar no localStorage
      localStorage.setItem("inova-lotes", JSON.stringify(data.lotes))
      localStorage.setItem("inova-motores", JSON.stringify(data.motores))

      // Recarregar página para aplicar mudanças
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  const carregarDadosSupabase = async () => {
    if (!supabase) {
      console.log("[v0] Cliente Supabase não disponível")
      return
    }

    console.log("[v0] Tentando carregar dados do Supabase...")

    try {
      const { data: lotesData, error: lotesError } = await supabase.from("lotes").select("*").limit(1)

      if (lotesError) {
        // Se erro indica que a tabela não existe, mostrar guia de setup
        if (lotesError.code === "PGRST116" || lotesError.message.includes("does not exist")) {
          console.log("[v0] Tabelas não encontradas - setup necessário")
          setConnectionStatus("setup_needed")
          return
        }
        throw lotesError
      }

      // Carregar lotes completos
      const { data: todosLotes, error: todosLotesError } = await supabase
        .from("lotes")
        .select("*")
        .order("created_at", { ascending: false })

      if (todosLotesError) throw todosLotesError

      console.log("[v0] Lotes carregados:", todosLotes?.length || 0)

      const lotesFormatados =
        todosLotes?.map((lote) => ({
          id: lote.id,
          nome: lote.nome,
          data: converterDataBancoParaBrasileira(lote.data_fechamento),
        })) || []

      // Carregar motores
      const { data: motoresData, error: motoresError } = await supabase
        .from("motores")
        .select("*")
        .order("created_at", { ascending: false })

      if (motoresError) throw motoresError

      console.log("[v0] Motores carregados:", motoresData?.length || 0)

      const motoresFormatados =
        motoresData?.map((motor) => ({
          id: motor.id,
          modelo: motor.modelo,
          numeroMotor: motor.codigo, // Usar campo codigo em vez de numero_motor
          operador: motor.operador || "",
          observacoes: motor.observacoes || "",
          servicos: [], // Array vazio por enquanto
          lote: motor.lote_id,
          data: motor.created_at.split("T")[0],
        })) || []

      setLotes(lotesFormatados)
      setMotores(motoresFormatados)
      setConnectionStatus("online")
      console.log("[v0] Dados carregados com sucesso - status: online")
    } catch (error) {
      console.error("[v0] Erro ao carregar dados do Supabase:", error)
      setConnectionStatus("offline")
      carregarDadosLocal()
    }
  }

  const carregarDadosLocal = () => {
    const lotesLocal = localStorage.getItem("inova-lotes")
    const motoresLocal = localStorage.getItem("inova-motores")

    if (lotesLocal) {
      setLotes(JSON.parse(lotesLocal))
    } else {
      setLotes([])
    }

    if (motoresLocal) {
      setMotores(JSON.parse(motoresLocal))
    } else {
      setMotores([])
    }
    setConnectionStatus("offline")
  }

  const salvarDadosLocal = (novosLotes: Lote[], novosMotores: Motor[]) => {
    localStorage.setItem("inova-lotes", JSON.stringify(novosLotes))
    localStorage.setItem("inova-motores", JSON.stringify(novosMotores))
  }

  useEffect(() => {
    const inicializar = async () => {
      setIsLoading(true)
      setConnectionStatus("checking")

      if (isSupabaseConfigured()) {
        setIsOnlineMode(true)

        const connectionTest = await testSupabaseConnection()
        if (connectionTest) {
          await carregarDadosSupabase()
        } else {
          setConnectionStatus("offline")
          carregarDadosLocal()
        }
      } else {
        setIsOnlineMode(false)
        carregarDadosLocal()
      }

      setIsLoading(false)
    }

    inicializar()
  }, [])

  useEffect(() => {
    if (!isLoading && connectionStatus === "offline") {
      salvarDadosLocal(lotes, motores)
    }
  }, [lotes, motores, isLoading, connectionStatus])

  const totalMotores = motores.length
  const totalGasto = motores.reduce(
    (sum, motor) => sum + motor.servicos.reduce((servicoSum, servico) => servicoSum + servico.valor, 0),
    0,
  )
  const gastoMedio = totalMotores > 0 ? totalGasto / totalMotores : 0

  const adicionarLote = async () => {
    if (!novoLote.nome || !novoLote.data) return

    console.log("[v0] Tentando adicionar lote:", novoLote)

    if (isOnlineMode && supabase && connectionStatus === "online") {
      try {
        const dataFormatadaBanco = converterDataBrasileiraParaBanco(novoLote.data)

        if (!dataFormatadaBanco) {
          console.error("[v0] Data inválida:", novoLote.data)
          return
        }

        console.log("[v0] Inserindo lote no Supabase com dados:", {
          nome: novoLote.nome,
          data_fechamento: dataFormatadaBanco,
        })

        const { data: insertedData, error } = await supabase
          .from("lotes")
          .insert([
            {
              nome: novoLote.nome,
              data_fechamento: dataFormatadaBanco, // Enviar no formato YYYY-MM-DD
            },
          ])
          .select()

        if (error) {
          console.error("[v0] Erro detalhado do Supabase:", error)
          throw error
        }

        console.log("[v0] Lote inserido com sucesso no Supabase:", insertedData)

        // Usar o lote retornado do Supabase com ID correto
        if (insertedData && insertedData[0]) {
          const loteInserido: Lote = {
            id: insertedData[0].id,
            nome: insertedData[0].nome,
            data: novoLote.data, // Manter formato brasileiro DD/MM/YYYY
          }

          setLotes([...lotes, loteInserido])
          setNovoLote({ nome: "", data: "" })
          setModalNovoLoteAberto(false)
          console.log("[v0] Lote adicionado ao estado local:", loteInserido)
          return
        }
      } catch (error) {
        console.error("[v0] Erro ao salvar lote no Supabase:", error)
        setConnectionStatus("offline")
        // Continuar com salvamento local em caso de erro
      }
    }

    // Fallback para modo offline ou erro
    const lote: Lote = {
      id: Date.now().toString(),
      nome: novoLote.nome,
      data: novoLote.data, // Manter formato brasileiro
    }

    setLotes([...lotes, lote])
    setNovoLote({ nome: "", data: "" })
    setModalNovoLoteAberto(false)
    console.log("[v0] Lote adicionado ao estado local (offline):", lote)
  }

  const adicionarMotor = async () => {
    if (
      !novoMotor.modelo ||
      !novoMotor.numeroMotor ||
      !novoMotor.operador ||
      novoMotor.servicosSelecionados.length === 0 ||
      !novoMotor.lote
    )
      return

    const servicos = novoMotor.servicosSelecionados.map((tipo) => ({
      tipo,
      valor: Number.parseFloat(novoMotor.valoresServicos[tipo] || "0"),
    }))

    const motor: Motor = {
      id: Date.now().toString(),
      modelo: novoMotor.modelo,
      numeroMotor: novoMotor.numeroMotor,
      operador: novoMotor.operador, // Incluído operador na criação do motor
      observacoes: novoMotor.observacoes, // Incluído observações na criação do motor
      servicos,
      lote: novoMotor.lote,
      data: new Date().toISOString().split("T")[0],
    }

    if (isOnlineMode && supabase && connectionStatus === "online") {
      try {
        const { error: motorError } = await supabase.from("motores").insert([
          {
            codigo: motor.numeroMotor, // Usar campo 'codigo' conforme schema
            modelo: motor.modelo,
            operador: motor.operador,
            observacoes: motor.observacoes,
            lote_id: motor.lote,
          },
        ])

        if (motorError) throw motorError

        // Os serviços serão mantidos apenas no localStorage por enquanto
      } catch (error) {
        console.error("Erro ao salvar motor no Supabase:", error)
        setConnectionStatus("offline")
      }
    }

    setMotores([...motores, motor])
    setNovoMotor({
      modelo: "",
      numeroMotor: "",
      operador: "", // Reset do campo operador
      observacoes: "", // Reset do campo observações
      servicosSelecionados: [],
      valoresServicos: {},
      lote: "",
    })
    setModalNovoMotorAberto(false)
  }

  const iniciarEdicaoLote = (lote: Lote) => {
    setLoteEditando(lote)
    setLoteEditandoDados({ nome: lote.nome, data: lote.data })
  }

  const salvarEdicaoLote = async () => {
    if (!loteEditando || !loteEditandoDados.nome || !loteEditandoDados.data) return

    console.log("[v0] Tentando editar lote:", loteEditando.id, loteEditandoDados)

    const loteAtualizado = {
      ...loteEditando,
      nome: loteEditandoDados.nome,
      data: loteEditandoDados.data, // Manter formato brasileiro
    }

    if (isOnlineMode && supabase && connectionStatus === "online") {
      try {
        const dataFormatadaBanco = converterDataBrasileiraParaBanco(loteEditandoDados.data)

        if (!dataFormatadaBanco) {
          console.error("[v0] Data inválida:", loteEditandoDados.data)
          return
        }

        console.log("[v0] Atualizando lote no Supabase:", {
          nome: loteAtualizado.nome,
          data_fechamento: dataFormatadaBanco,
        })

        const { error } = await supabase
          .from("lotes")
          .update({
            nome: loteAtualizado.nome,
            data_fechamento: dataFormatadaBanco, // Enviar no formato YYYY-MM-DD
          })
          .eq("id", loteEditando.id)

        if (error) {
          console.error("[v0] Erro detalhado ao editar lote:", error)
          throw error
        }

        console.log("[v0] Lote editado com sucesso no Supabase")
      } catch (error) {
        console.error("[v0] Erro ao atualizar lote no Supabase:", error)
        setConnectionStatus("offline")
        // Continuar com atualização local em caso de erro
      }
    }

    setLotes(lotes.map((l) => (l.id === loteEditando.id ? loteAtualizado : l)))
    setLoteEditando(null)
    setLoteEditandoDados({ nome: "", data: "" })
    setModalEditarLoteAberto(false)
  }

  const cancelarEdicaoLote = () => {
    setLoteEditando(null)
    setLoteEditandoDados({ nome: "", data: "" })
  }

  const iniciarEdicaoMotor = (motor: Motor) => {
    setMotorEditando(motor)
    setMotorEditandoServicos(motor.servicos.map((s) => s.tipo))
    setMotorEditandoOperador(motor.operador) // Inicializar estado de edição do operador
    setMotorEditandoObservacoes(motor.observacoes) // Inicializar estado de edição das observações
    const valores: Record<string, string> = {}
    motor.servicos.forEach((servico) => {
      valores[servico.tipo] = servico.valor.toString()
    })
    setMotorEditandoValores(valores)
  }

  const salvarEdicaoMotor = async () => {
    if (!motorEditando) return

    const servicosAtualizados = motorEditandoServicos.map((tipo) => ({
      tipo,
      valor: Number.parseFloat(motorEditandoValores[tipo] || "0"),
    }))

    const motorAtualizado = {
      ...motorEditando,
      operador: motorEditandoOperador, // Salvar operador editado
      observacoes: motorEditandoObservacoes, // Salvar observações editadas
      servicos: servicosAtualizados,
    }

    if (isOnlineMode && supabase && connectionStatus === "online") {
      try {
        const { error: motorError } = await supabase
          .from("motores")
          .update({
            operador: motorAtualizado.operador,
            observacoes: motorAtualizado.observacoes,
          })
          .eq("id", motorEditando.id)

        if (motorError) throw motorError
      } catch (error) {
        console.error("Erro ao atualizar motor no Supabase:", error)
        setConnectionStatus("offline")
      }
    }

    setMotores(motores.map((m) => (m.id === motorEditando.id ? motorAtualizado : m)))
    setMotorEditando(null)
    setMotorEditandoServicos([])
    setMotorEditandoValores({})
    setMotorEditandoOperador("") // Reset do estado de edição do operador
    setMotorEditandoObservacoes("") // Reset do estado de edição das observações
  }

  const cancelarEdicaoMotor = () => {
    setMotorEditando(null)
  }

  const removerLote = async (id: string) => {
    if (isOnlineMode && supabase && connectionStatus === "online") {
      try {
        const { error } = await supabase.from("lotes").delete().eq("id", id)

        if (error) throw error
      } catch (error) {
        console.error("Erro ao remover lote do Supabase:", error)
        setConnectionStatus("offline")
      }
    }

    setLotes(lotes.filter((lote) => lote.id !== id))
    setMotores(motores.filter((motor) => motor.lote !== id))

    // Fechar modal e limpar estados
    setModalExclusao({ aberto: false, tipo: "lote", id: "", nome: "" })
    setSenhaExclusao("")
    setErroSenhaExclusao("")
  }

  const removerMotor = async (id: string) => {
    if (isOnlineMode && supabase && connectionStatus === "online") {
      try {
        const { error } = await supabase.from("motores").delete().eq("id", id)

        if (error) throw error
      } catch (error) {
        console.error("Erro ao remover motor do Supabase:", error)
        setConnectionStatus("offline")
      }
    }

    setMotores(motores.filter((motor) => motor.id !== id))

    // Fechar modal e limpar estados
    setModalExclusao({ aberto: false, tipo: "lote", id: "", nome: "" })
    setSenhaExclusao("")
    setErroSenhaExclusao("")
  }

  const abrirModalExclusao = (tipo: "lote" | "motor", id: string, nome: string) => {
    setModalExclusao({ aberto: true, tipo, id, nome })
    setSenhaExclusao("")
    setErroSenhaExclusao("")
  }

  const confirmarExclusao = () => {
    const senhaCorreta = "admin123" // Senha fixa para exclusão

    if (senhaExclusao !== senhaCorreta) {
      setErroSenhaExclusao("Senha incorreta!")
      return
    }

    if (modalExclusao.tipo === "lote") {
      removerLote(modalExclusao.id)
    } else {
      removerMotor(modalExclusao.id)
    }
  }

  const cancelarExclusao = () => {
    setModalExclusao({ aberto: false, tipo: "lote", id: "", nome: "" })
    setSenhaExclusao("")
    setErroSenhaExclusao("")
  }

  const getLoteNome = (loteId: string) => {
    const lote = lotes.find((l) => l.id === loteId)
    return lote ? lote.nome : "Lote não encontrado"
  }

  const getGastosPorLote = () => {
    return lotes.map((lote) => {
      const motoresDoLote = motores.filter((m) => m.lote === lote.id)
      const gastoTotal = motoresDoLote.reduce(
        (sum, m) => sum + m.servicos.reduce((servicoSum, servico) => servicoSum + servico.valor, 0),
        0,
      )
      return {
        ...lote,
        totalMotores: motoresDoLote.length,
        gastoTotal,
      }
    })
  }

  const motoresFiltrados = motores.filter((motor) => {
    const matchNumeroMotor =
      filtroNumeroMotor === "" || motor.numeroMotor.toLowerCase().includes(filtroNumeroMotor.toLowerCase())
    const matchModeloVeiculo =
      filtroModeloVeiculo === "" || motor.modelo.toLowerCase().includes(filtroModeloVeiculo.toLowerCase())
    return matchNumeroMotor && matchModeloVeiculo
  })

  const totalPaginas = Math.ceil(motoresFiltrados.length / motoresPorPagina)
  const indiceInicial = (paginaAtual - 1) * motoresPorPagina
  const indiceFinal = indiceInicial + motoresPorPagina
  const motoresPaginados = motoresFiltrados.slice(indiceInicial, indiceFinal)

  const limparFiltros = () => {
    setFiltroNumeroMotor("")
    setFiltroModeloVeiculo("")
    setPaginaAtual(1) // Reset página ao limpar filtros
  }

  const temFiltrosAtivos = filtroNumeroMotor !== "" || filtroModeloVeiculo !== ""

  const toggleServicoNovoMotor = (servico: string, checked: boolean) => {
    if (checked) {
      setNovoMotor({
        ...novoMotor,
        servicosSelecionados: [...novoMotor.servicosSelecionados, servico],
      })
    } else {
      setNovoMotor({
        ...novoMotor,
        servicosSelecionados: novoMotor.servicosSelecionados.filter((s) => s !== servico),
        valoresServicos: {
          ...novoMotor.valoresServicos,
          [servico]: "",
        },
      })
    }
  }

  const toggleServicoEdicao = (servico: string, checked: boolean) => {
    if (checked) {
      setMotorEditandoServicos([...motorEditandoServicos, servico])
    } else {
      setMotorEditandoServicos(motorEditandoServicos.filter((s) => s !== servico))
      const novosValores = { ...motorEditandoValores }
      delete novosValores[servico]
      setMotorEditandoValores(novosValores)
    }
  }

  const imprimirRelatorioLote = (loteId: string) => {
    const lote = lotes.find((l) => l.id === loteId)
    if (!lote) return

    const motoresDoLote = motores.filter((m) => m.lote === loteId)
    const gastoTotalLote = motoresDoLote.reduce(
      (sum, m) => sum + m.servicos.reduce((servicoSum, servico) => servicoSum + servico.valor, 0),
      0,
    )

    const conteudoImpressao = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório - ${lote.nome}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .no-print { display: none !important; }
            }
            body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .report-title { font-size: 18px; color: #666; }
            .lote-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .lote-info h2 { margin: 0 0 10px 0; font-size: 20px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { display: flex; justify-content: space-between; }
            .info-label { font-weight: bold; }
            .motores-section { margin-top: 30px; }
            .motor-card { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; border-radius: 5px; }
            .motor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .motor-modelo { font-size: 16px; font-weight: bold; }
            .motor-numero { color: #666; font-size: 14px; }
            .motor-operador { color: #2563eb; font-size: 14px; font-weight: 500; margin-top: 5px; }
            .motor-observacoes { color: #555; font-size: 13px; font-style: italic; margin: 8px 0; padding: 8px; background: #f9f9f9; border-radius: 4px; }
            .servicos-list { margin: 10px 0; }
            .servico-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ccc; }
            .servico-nome { color: #555; }
            .servico-valor { font-weight: bold; }
            .motor-total { text-align: right; font-size: 16px; font-weight: bold; color: #2563eb; margin-top: 10px; }
            .resumo-final { background: #e3f2fd; padding: 20px; margin-top: 30px; border-radius: 5px; text-align: center; }
            .resumo-final h3 { margin: 0 0 15px 0; font-size: 18px; }
            .total-final { font-size: 24px; font-weight: bold; color: #1976d2; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Inova Ecopeças</div>
            <div class="report-title">Relatório de Gastos por Lote Fechado</div>
          </div>

          <div class="lote-info">
            <h2>${lote.nome}</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Data do Lote:</span>
                <span>${lote.data}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total de Motores:</span>
                <span>${motoresDoLote.length}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Gasto Total:</span>
                <span>R$ ${gastoTotalLote.toLocaleString("pt-BR")}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Média por Motor:</span>
                <span>R$ ${motoresDoLote.length > 0 ? (gastoTotalLote / motoresDoLote.length).toLocaleString("pt-BR") : "0"}</span>
              </div>
            </div>
          </div>

          <div class="motores-section">
            <h3>Detalhamento por Motor</h3>
            ${motoresDoLote
              .map((motor) => {
                const valorTotalMotor = motor.servicos.reduce((sum, servico) => sum + servico.valor, 0)
                return `
                <div class="motor-card">
                  <div class="motor-header">
                    <div>
                      <div class="motor-modelo">${motor.modelo}</div>
                      <div class="motor-numero">Motor Nº ${motor.numeroMotor}</div>
                      <div class="motor-operador">Operador: ${motor.operador}</div>
                    </div>
                  </div>
                  ${motor.observacoes ? `<div class="motor-observacoes">Observações: ${motor.observacoes}</div>` : ""}
                  <div class="servicos-list">
                    ${motor.servicos
                      .map(
                        (servico) => `
                      <div class="servico-item">
                        <span class="servico-nome">${servico.tipo}</span>
                        <span class="servico-valor">R$ ${servico.valor.toLocaleString("pt-BR")}</span>
                      </div>
                    `,
                      )
                      .join("")}
                  </div>
                  <div class="motor-total">
                    Total do Motor: R$ ${valorTotalMotor.toLocaleString("pt-BR")}
                  </div>
                </div>
              `
              })
              .join("")}
          </div>

          <div class="resumo-final">
            <h3>Resumo Final</h3>
            <div class="total-final">
              Total Geral: R$ ${gastoTotalLote.toLocaleString("pt-BR")}
            </div>
          </div>

          <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
            <p>Inova Ecopeças - Sistema de Controle de Gastos com Motores</p>
          </div>
        </body>
      </html>
    `

    // Abrir nova janela para impressão
    const janelaImpressao = window.open("", "_blank")
    if (janelaImpressao) {
      janelaImpressao.document.write(conteudoImpressao)
      janelaImpressao.document.close()
      janelaImpressao.focus()

      // Aguardar carregamento e imprimir
      setTimeout(() => {
        janelaImpressao.print()
      }, 500)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Database className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  if (connectionStatus === "setup_needed") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Inova Ecopeças</h1>
            <p className="text-muted-foreground">Sistema de Controle de Gastos com Motores</p>
          </div>
          <SetupGuide />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Inova Ecopeças</h1>
          <p className="text-muted-foreground">Sistema de Controle de Gastos com Motores</p>

          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {connectionStatus === "online" ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Online - Dados sincronizados</span>
                </>
              ) : connectionStatus === "offline" ? (
                <>
                  <WifiOff className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600">Offline - Dados locais</span>
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-blue-600">Verificando conexão...</span>
                </>
              )}
            </div>

            <div className="flex gap-2"></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filtro-numero">Número do Motor</Label>
                <Input
                  id="filtro-numero"
                  value={filtroNumeroMotor}
                  onChange={(e) => {
                    setFiltroNumeroMotor(e.target.value)
                    setPaginaAtual(1) // Reset página ao filtrar
                  }}
                  placeholder="Ex: 001, 002..."
                />
              </div>
              <div>
                <Label htmlFor="filtro-modelo">Modelo do Veículo</Label>
                <Input
                  id="filtro-modelo"
                  value={filtroModeloVeiculo}
                  onChange={(e) => {
                    setFiltroModeloVeiculo(e.target.value)
                    setPaginaAtual(1) // Reset página ao filtrar
                  }}
                  placeholder="Ex: Honda, Toyota..."
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={limparFiltros}
                  disabled={!temFiltrosAtivos}
                  className="w-full bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
            {temFiltrosAtivos && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Filtros ativos:</span>
                  {filtroNumeroMotor && <Badge variant="secondary">Número: {filtroNumeroMotor}</Badge>}
                  {filtroModeloVeiculo && <Badge variant="secondary">Modelo: {filtroModeloVeiculo}</Badge>}
                  <span className="text-muted-foreground">• {motoresFiltrados.length} resultado(s) encontrado(s)</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {temFiltrosAtivos && motoresFiltrados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Resultados da Busca
                <Badge variant="outline">{motoresFiltrados.length} motor(es) encontrado(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {motoresFiltrados.map((motor) => {
                  const valorTotal = motor.servicos.reduce((sum, servico) => sum + servico.valor, 0)

                  return (
                    <div key={motor.id} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{motor.modelo}</div>
                          <div className="text-sm text-muted-foreground mb-1">Motor {motor.numeroMotor}</div>
                          <div className="text-sm text-blue-600 font-medium mb-2">Operador: {motor.operador}</div>

                          {motor.observacoes && (
                            <div className="text-sm text-muted-foreground italic mb-2 p-2 bg-background rounded">
                              {motor.observacoes}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{getLoteNome(motor.lote)}</Badge>
                            <span className="text-sm font-bold text-primary">
                              Total: R$ {valorTotal.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {(lotes.length > 0 || motores.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Métricas por Lote Fechado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getGastosPorLote().map((lote) => (
                  <div key={lote.id} className="p-4 border rounded-lg bg-card">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{lote.nome}</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Motores:</span>
                          <span className="font-medium">{lote.totalMotores}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Gasto Total:</span>
                          <span className="font-bold text-primary">R$ {lote.gastoTotal.toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Média por Motor:</span>
                          <span className="font-medium">
                            R${" "}
                            {lote.totalMotores > 0
                              ? (lote.gastoTotal / lote.totalMotores).toLocaleString("pt-BR")
                              : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Data:</span>
                          <span className="text-muted-foreground">{lote.data}</span>
                        </div>
                      </div>

                      {lote.totalMotores > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLoteMotoresVisivel(loteMotoresVisivel === lote.id ? null : lote.id)}
                          className="w-full mt-2"
                        >
                          {loteMotoresVisivel === lote.id ? "Ocultar Motores" : "Ver Todos os Motores"}
                        </Button>
                      )}

                      {loteMotoresVisivel === lote.id && (
                        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                          {motores
                            .filter((m) => m.lote === lote.id)
                            .map((motor) => {
                              const valorTotal = motor.servicos.reduce((sum, servico) => sum + servico.valor, 0)
                              return (
                                <div key={motor.id} className="p-2 bg-muted rounded text-sm">
                                  <div className="font-medium">
                                    {motor.modelo} - Motor {motor.numeroMotor}
                                  </div>
                                  <div className="text-muted-foreground">Operador: {motor.operador}</div>
                                  <div className="font-bold text-primary">R$ {valorTotal.toLocaleString("pt-BR")}</div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Lotes Fechados
                <Dialog open={modalNovoLoteAberto} onOpenChange={setModalNovoLoteAberto}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Lote
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Lote</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome-lote">Nome do Lote</Label>
                        <Input
                          id="nome-lote"
                          value={novoLote.nome}
                          onChange={(e) => setNovoLote({ ...novoLote, nome: e.target.value })}
                          placeholder="Ex: Lote Janeiro 2024"
                        />
                      </div>
                      <div>
                        <Label htmlFor="data-lote">Data (DD/MM/AAAA)</Label>
                        <Input
                          id="data-lote"
                          type="text"
                          value={novoLote.data}
                          onChange={(e) => setNovoLote({ ...novoLote, data: aplicarMascaraData(e.target.value) })}
                          placeholder="24/09/2025"
                          maxLength={10}
                        />
                      </div>
                      <Button onClick={adicionarLote} className="w-full">
                        Adicionar Lote
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lotes.map((lote) => {
                  const motoresDoLote = motores.filter((m) => m.lote === lote.id)
                  const gastoLote = motoresDoLote.reduce(
                    (sum, m) => sum + m.servicos.reduce((servicoSum, servico) => servicoSum + servico.valor, 0),
                    0,
                  )

                  return (
                    <div key={lote.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{lote.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {motoresDoLote.length} motores • R$ {gastoLote.toLocaleString("pt-BR")} • {lote.data}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => imprimirRelatorioLote(lote.id)}
                          title="Imprimir Relatório do Lote"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Dialog open={modalEditarLoteAberto} onOpenChange={setModalEditarLoteAberto}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                iniciarEdicaoLote(lote)
                                setModalEditarLoteAberto(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Lote</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-nome-lote">Nome do Lote</Label>
                                <Input
                                  id="edit-nome-lote"
                                  value={loteEditandoDados.nome}
                                  onChange={(e) => setLoteEditandoDados({ ...loteEditandoDados, nome: e.target.value })}
                                  placeholder="Ex: Lote Janeiro 2024"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-data-lote">Data (DD/MM/AAAA)</Label>
                                <Input
                                  id="edit-data-lote"
                                  type="text"
                                  value={loteEditandoDados.data}
                                  onChange={(e) =>
                                    setLoteEditandoDados({
                                      ...loteEditandoDados,
                                      data: aplicarMascaraData(e.target.value),
                                    })
                                  }
                                  placeholder="24/09/2025"
                                  maxLength={10}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={salvarEdicaoLote} className="flex-1">
                                  Salvar Alterações
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    cancelarEdicaoLote()
                                    setModalEditarLoteAberto(false)
                                  }}
                                  className="flex-1 bg-transparent"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirModalExclusao("lote", lote.id, lote.nome)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Motores
                <div className="flex items-center gap-2">
                  {temFiltrosAtivos && (
                    <Badge variant="outline">
                      {motoresFiltrados.length} de {motores.length}
                    </Badge>
                  )}
                  <Dialog open={modalNovoMotorAberto} onOpenChange={setModalNovoMotorAberto}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Motor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Motor</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="modelo">Modelo do Veículo</Label>
                            <Input
                              id="modelo"
                              value={novoMotor.modelo}
                              onChange={(e) => setNovoMotor({ ...novoMotor, modelo: e.target.value })}
                              placeholder="Ex: Honda Civic"
                            />
                          </div>
                          <div>
                            <Label htmlFor="numero">Número do Motor</Label>
                            <Input
                              id="numero"
                              value={novoMotor.numeroMotor}
                              onChange={(e) => setNovoMotor({ ...novoMotor, numeroMotor: e.target.value })}
                              placeholder="Ex: 001"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="operador">Operador Responsável</Label>
                          <Input
                            id="operador"
                            value={novoMotor.operador}
                            onChange={(e) => setNovoMotor({ ...novoMotor, operador: e.target.value })}
                            placeholder="Ex: João Silva"
                          />
                        </div>

                        <div>
                          <Label htmlFor="observacoes">Observações</Label>
                          <Textarea
                            id="observacoes"
                            value={novoMotor.observacoes}
                            onChange={(e) => setNovoMotor({ ...novoMotor, observacoes: e.target.value })}
                            placeholder="Informações complementares sobre o motor..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Serviços</Label>
                          <div className="grid grid-cols-1 gap-3 mt-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                            {tiposServicos.map((servico) => (
                              <div key={servico} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`servico-${servico}`}
                                    checked={novoMotor.servicosSelecionados.includes(servico)}
                                    onCheckedChange={(checked) => toggleServicoNovoMotor(servico, checked as boolean)}
                                  />
                                  <Label htmlFor={`servico-${servico}`} className="text-sm">
                                    {servico}
                                  </Label>
                                </div>
                                {novoMotor.servicosSelecionados.includes(servico) && (
                                  <Input
                                    type="number"
                                    placeholder="Valor (R$)"
                                    value={novoMotor.valoresServicos[servico] || ""}
                                    onChange={(e) =>
                                      setNovoMotor({
                                        ...novoMotor,
                                        valoresServicos: {
                                          ...novoMotor.valoresServicos,
                                          [servico]: e.target.value,
                                        },
                                      })
                                    }
                                    className="ml-6 w-32"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="lote-select">Lote</Label>
                          <Select
                            value={novoMotor.lote}
                            onValueChange={(value) => setNovoMotor({ ...novoMotor, lote: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o lote" />
                            </SelectTrigger>
                            <SelectContent>
                              {lotes.map((lote) => (
                                <SelectItem key={lote.id} value={lote.id}>
                                  {lote.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={adicionarMotor} className="w-full">
                          Adicionar Motor
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {motoresFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {temFiltrosAtivos ? "Nenhum motor encontrado com os filtros aplicados" : "Nenhum motor cadastrado"}
                  </div>
                ) : (
                  <>
                    {motoresFiltrados.length > motoresPorPagina && (
                      <div className="text-sm text-muted-foreground text-center py-2 border-b">
                        Página {paginaAtual} de {totalPaginas} • {motoresFiltrados.length} motores total
                      </div>
                    )}

                    {motoresPaginados.map((motor) => {
                      const valorTotal = motor.servicos.reduce((sum, servico) => sum + servico.valor, 0)

                      return (
                        <div key={motor.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{motor.modelo}</div>
                              <div className="text-sm text-muted-foreground mb-1">Motor {motor.numeroMotor}</div>
                              <div className="text-sm text-blue-600 font-medium mb-2">Operador: {motor.operador}</div>

                              {motor.observacoes && (
                                <div className="text-sm text-muted-foreground italic mb-2 p-2 bg-muted rounded">
                                  {motor.observacoes}
                                </div>
                              )}

                              <div className="space-y-1 mb-2">
                                {motor.servicos.map((servico, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{servico.tipo}</span>
                                    <span className="font-medium">R$ {servico.valor.toLocaleString("pt-BR")}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">{getLoteNome(motor.lote)}</Badge>
                                <span className="text-sm font-bold text-primary">
                                  Total: R$ {valorTotal.toLocaleString("pt-BR")}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => iniciarEdicaoMotor(motor)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Editar Motor - {motor.modelo}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Modelo</Label>
                                        <Input value={motor.modelo} disabled />
                                      </div>
                                      <div>
                                        <Label>Número</Label>
                                        <Input value={motor.numeroMotor} disabled />
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="edit-operador">Operador Responsável</Label>
                                      <Input
                                        id="edit-operador"
                                        value={motorEditandoOperador}
                                        onChange={(e) => setMotorEditandoOperador(e.target.value)}
                                        placeholder="Ex: João Silva"
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor="edit-observacoes">Observações</Label>
                                      <Textarea
                                        id="edit-observacoes"
                                        value={motorEditandoObservacoes}
                                        onChange={(e) => setMotorEditandoObservacoes(e.target.value)}
                                        placeholder="Informações complementares sobre o motor..."
                                        rows={3}
                                      />
                                    </div>

                                    <div>
                                      <Label>Serviços</Label>
                                      <div className="grid grid-cols-1 gap-3 mt-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                                        {tiposServicos.map((servico) => (
                                          <div key={servico} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`edit-servico-${servico}`}
                                                checked={motorEditandoServicos.includes(servico)}
                                                onCheckedChange={(checked) =>
                                                  toggleServicoEdicao(servico, checked as boolean)
                                                }
                                              />
                                              <Label htmlFor={`edit-servico-${servico}`} className="text-sm">
                                                {servico}
                                              </Label>
                                            </div>
                                            {motorEditandoServicos.includes(servico) && (
                                              <Input
                                                type="number"
                                                placeholder="Valor (R$)"
                                                value={motorEditandoValores[servico] || ""}
                                                onChange={(e) =>
                                                  setMotorEditandoValores({
                                                    ...motorEditandoValores,
                                                    [servico]: e.target.value,
                                                  })
                                                }
                                                className="ml-6 w-32"
                                              />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button onClick={salvarEdicaoMotor} className="flex-1">
                                        Salvar Alterações
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={cancelarEdicaoMotor}
                                        className="flex-1 bg-transparent"
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => abrirModalExclusao("motor", motor.id, motor.numeroMotor)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {totalPaginas > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                          disabled={paginaAtual === 1}
                        >
                          Anterior
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                            const pageNum = i + 1
                            return (
                              <Button
                                key={pageNum}
                                variant={paginaAtual === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPaginaAtual(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                          {totalPaginas > 5 && (
                            <>
                              <span className="text-muted-foreground">...</span>
                              <Button
                                variant={paginaAtual === totalPaginas ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPaginaAtual(totalPaginas)}
                                className="w-8 h-8 p-0"
                              >
                                {totalPaginas}
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                          disabled={paginaAtual === totalPaginas}
                        >
                          Próxima
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={modalExclusao.aberto} onOpenChange={cancelarExclusao}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja excluir {modalExclusao.tipo === "lote" ? "o lote" : "o motor"}{" "}
                <span className="font-semibold">{modalExclusao.nome}</span>?
              </p>

              {modalExclusao.tipo === "lote" && (
                <p className="text-xs text-destructive">⚠️ Todos os motores deste lote também serão excluídos!</p>
              )}

              <div className="space-y-2">
                <label htmlFor="senha-exclusao" className="text-sm font-medium">
                  Digite a senha para confirmar:
                </label>
                <Input
                  id="senha-exclusao"
                  type="password"
                  value={senhaExclusao}
                  onChange={(e) => {
                    setSenhaExclusao(e.target.value)
                    setErroSenhaExclusao("")
                  }}
                  placeholder="Senha de exclusão"
                  className={erroSenhaExclusao ? "border-destructive" : ""}
                />
                {erroSenhaExclusao && <p className="text-xs text-destructive">{erroSenhaExclusao}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={cancelarExclusao}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmarExclusao} disabled={!senhaExclusao.trim()}>
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
