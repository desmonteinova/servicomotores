"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured, testSupabaseConnection } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, FileText, Search, Wifi, WifiOff, Database, X, TrendingUp, Eye } from "lucide-react"
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
    nomePeca?: string // Adicionado campo opcional para nome da peça
  }>
  lote: string
  data: string // Data de entrada do motor
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
    nomesPecas: {} as Record<string, string>, // Adicionado estado para nomes das peças
    lote: "",
  })

  const [motorEditando, setMotorEditando] = useState<Motor | null>(null)
  const [motorEditandoServicos, setMotorEditandoServicos] = useState<string[]>([])
  const [motorEditandoValores, setMotorEditandoValores] = useState<Record<string, string>>({})
  const [motorEditandoOperador, setMotorEditandoOperador] = useState("")
  const [motorEditandoObservacoes, setMotorEditandoObservacoes] = useState("")
  const [motorEditandoNomesPecas, setMotorEditandoNomesPecas] = useState<Record<string, string>>({}) // Adicionado estado para edição de nomes das peças

  const [motorDetalhes, setMotorDetalhes] = useState<Motor | null>(null)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)

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
    "Serviços mão de obra",
    "Desmontagem do motor",
    "Troca da junta tampa de valvulas",
    "Troca comando de valvulas",
    "Retífica comando de valvulas",
    "Troca de junta do cabeçote",
    "Retífica de cabeçote",
    "Troca de virabrequim",
    "Retífica de virabrequim",
    "Troca da junta do carter",
    "Troca do retentor dianteiro",
    "Troca do retentor traseiro",
    "Troca de anéis",
    "Troca de pistão",
    "Troca de bronzina de mancal",
    "Troca de bronzina de biela",
    "Troca de mancal",
    "Troca de biela",
    "Peças adicionais", // Adicionado novo serviço
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
        motoresData?.map((motor) => {
          let dataEntrada = motor.data_entrada
          if (!dataEntrada) {
            dataEntrada = new Date().toISOString().split("T")[0]
            console.log(`[v0] Motor ${motor.codigo} sem data - usando data atual: ${dataEntrada}`)
          }

          const dataEntradaConvertida = converterDataBancoParaBrasileira(dataEntrada)

          // Processar serviços do JSONB
          let servicos = []
          try {
            if (motor.servicos) {
              if (typeof motor.servicos === "string") {
                servicos = JSON.parse(motor.servicos)
              } else {
                servicos = motor.servicos
              }
            }
          } catch (error) {
            console.error(`[v0] Erro ao processar serviços do motor ${motor.codigo}:`, error)
            servicos = []
          }

          return {
            id: motor.id,
            modelo: motor.modelo,
            numeroMotor: motor.codigo,
            operador: motor.operador || "",
            observacoes: motor.observacoes || "",
            servicos: servicos,
            lote: motor.lote_id,
            data: dataEntradaConvertida,
          }
        }) || []

      console.log("[v0] Motores formatados:", motoresFormatados)

      setLotes(lotesFormatados)
      setMotores(motoresFormatados)
      setConnectionStatus("online")
      console.log("[v0] Dados carregados com sucesso - status: online")

      salvarDadosLocal(lotesFormatados, motoresFormatados)
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

    const lote: Lote = {
      id: Date.now().toString(),
      nome: novoLote.nome,
      data: novoLote.data, // Manter formato brasileiro
    }

    try {
      // Salvar no Supabase se disponível
      if (supabase && connectionStatus === "online") {
        const dataFormatada = converterDataBrasileiraParaBanco(novoLote.data)
        const { data: supabaseData, error } = await supabase
          .from("lotes")
          .insert({
            nome: novoLote.nome,
            data_fechamento: dataFormatada,
          })
          .select()
          .single()

        if (error) {
          console.error("[v0] Erro ao salvar lote no Supabase:", error)
          throw error
        }

        // Usar ID do Supabase
        lote.id = supabaseData.id
        console.log("[v0] Lote salvo no Supabase com sucesso:", supabaseData)
      }

      setLotes([...lotes, lote])
      setNovoLote({ nome: "", data: "" })
      setModalNovoLoteAberto(false)
      console.log("[v0] Lote adicionado ao estado local:", lote)
    } catch (error) {
      console.error("[v0] Erro ao adicionar lote:", error)
      alert("Erro ao salvar lote. Verifique sua conexão.")
    }
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

    console.log("[v0] Iniciando adição de novo motor...")

    try {
      const servicos = novoMotor.servicosSelecionados.map((tipo) => {
        const valor = Number.parseFloat(novoMotor.valoresServicos[tipo] || "0")
        const servicoObj: any = {
          tipo,
          valor: isNaN(valor) ? 0 : valor,
        }

        // Incluir nome da peça apenas se for "Peças adicionais" e tiver valor
        if (tipo === "Peças adicionais" && novoMotor.nomesPecas[tipo]) {
          servicoObj.nomePeca = novoMotor.nomesPecas[tipo]
        }

        return servicoObj
      })

      const dataEntrada = new Date().toLocaleDateString("pt-BR")
      console.log("[v0] Data de entrada gerada:", dataEntrada)

      const motor: Motor = {
        id: Date.now().toString(),
        modelo: novoMotor.modelo,
        numeroMotor: novoMotor.numeroMotor,
        operador: novoMotor.operador,
        observacoes: novoMotor.observacoes,
        servicos,
        lote: novoMotor.lote,
        data: dataEntrada,
      }

      console.log("[v0] Motor criado:", motor)

      try {
        // Salvar no Supabase se disponível
        if (supabase && connectionStatus === "online") {
          const dataFormatada = converterDataBrasileiraParaBanco(dataEntrada)
          const { data: supabaseData, error } = await supabase
            .from("motores")
            .insert({
              codigo: novoMotor.numeroMotor,
              modelo: novoMotor.modelo,
              operador: novoMotor.operador,
              observacoes: novoMotor.observacoes,
              lote_id: novoMotor.lote,
              data_entrada: dataFormatada, // Campo correto conforme tabela
              servicos: JSON.stringify(servicos),
            })
            .select()
            .single()

          if (error) {
            console.error("[v0] Erro ao salvar motor no Supabase:", error)
            throw error
          }

          // Usar ID do Supabase
          motor.id = supabaseData.id
          console.log("[v0] Motor salvo no Supabase com sucesso:", supabaseData)
        }

        console.log("[v0] Atualizando estado local...")
        const novosMotores = [...motores, motor]
        setMotores(novosMotores)

        try {
          salvarDadosLocal(lotes, novosMotores)
          console.log("[v0] Motor salvo no localStorage com sucesso")
        } catch (localStorageError) {
          console.error("[v0] Erro ao salvar no localStorage:", localStorageError)
        }

        setTimeout(() => {
          setNovoMotor({
            modelo: "",
            numeroMotor: "",
            operador: "",
            observacoes: "",
            servicosSelecionados: [],
            valoresServicos: {},
            nomesPecas: {},
            lote: "",
          })
          setModalNovoMotorAberto(false)
          console.log("[v0] Formulário resetado e modal fechado")
        }, 100)
      } catch (supabaseError) {
        console.error("[v0] Erro ao salvar no Supabase:", supabaseError)

        // Mesmo com erro no Supabase, salvar localmente
        console.log("[v0] Salvando apenas localmente devido ao erro no Supabase")
        const novosMotores = [...motores, motor]
        setMotores(novosMotores)
        salvarDadosLocal(lotes, novosMotores)

        setTimeout(() => {
          setNovoMotor({
            modelo: "",
            numeroMotor: "",
            operador: "",
            observacoes: "",
            servicosSelecionados: [],
            valoresServicos: {},
            nomesPecas: {},
            lote: "",
          })
          setModalNovoMotorAberto(false)
        }, 100)

        alert("Motor salvo localmente. Erro na sincronização com a nuvem.")
      }
    } catch (error) {
      console.error("[v0] Erro crítico ao adicionar motor:", error)

      setTimeout(() => {
        setModalNovoMotorAberto(false)
        console.log("[v0] Modal fechado após erro")
      }, 100)

      alert("Erro ao salvar motor. Verifique o console para mais detalhes.")
    }
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

    try {
      // Atualizar no Supabase se disponível
      if (supabase && connectionStatus === "online") {
        const dataFormatada = converterDataBrasileiraParaBanco(loteEditandoDados.data)
        const { error } = await supabase
          .from("lotes")
          .update({
            nome: loteEditandoDados.nome,
            data_fechamento: dataFormatada,
            updated_at: new Date().toISOString(),
          })
          .eq("id", loteEditando.id)

        if (error) {
          console.error("[v0] Erro ao atualizar lote no Supabase:", error)
          throw error
        }

        console.log("[v0] Lote atualizado no Supabase com sucesso")
      }

      setLotes(lotes.map((l) => (l.id === loteEditando.id ? loteAtualizado : l)))
      setLoteEditando(null)
      setLoteEditandoDados({ nome: "", data: "" })
      setModalEditarLoteAberto(false)
      console.log("[v0] Lote editado no estado local:", loteAtualizado)
    } catch (error) {
      console.error("[v0] Erro ao editar lote:", error)
      alert("Erro ao salvar alterações do lote.")
    }
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
    const nomesPecas: Record<string, string> = {} // Inicializar nomes das peças para edição
    motor.servicos.forEach((servico) => {
      valores[servico.tipo] = servico.valor.toString()
      if (servico.nomePeca) {
        nomesPecas[servico.tipo] = servico.nomePeca // Carregar nome da peça se existir
      }
    })
    setMotorEditandoValores(valores)
    setMotorEditandoNomesPecas(nomesPecas) // Definir estado dos nomes das peças
  }

  const salvarEdicaoMotor = async () => {
    if (!motorEditando) return

    console.log("[v0] Iniciando salvamento da edição do motor...")

    try {
      const servicosAtualizados = motorEditandoServicos.map((tipo) => {
        const valor = Number.parseFloat(motorEditandoValores[tipo] || "0")
        const servicoObj: any = {
          tipo,
          valor: isNaN(valor) ? 0 : valor,
        }

        // Incluir nome da peça apenas se for "Peças adicionais" e tiver valor
        if (tipo === "Peças adicionais" && motorEditandoNomesPecas[tipo]) {
          servicoObj.nomePeca = motorEditandoNomesPecas[tipo]
        }

        return servicoObj
      })

      console.log("[v0] Serviços processados:", servicosAtualizados)

      const motorAtualizado = {
        ...motorEditando,
        operador: motorEditandoOperador || "",
        observacoes: motorEditandoObservacoes || "",
        servicos: servicosAtualizados,
      }

      console.log("[v0] Motor atualizado:", motorAtualizado)

      try {
        // Atualizar no Supabase se disponível
        if (supabase && connectionStatus === "online") {
          const { error } = await supabase
            .from("motores")
            .update({
              operador: motorEditandoOperador || "",
              observacoes: motorEditandoObservacoes || "",
              servicos: JSON.stringify(servicosAtualizados),
              updated_at: new Date().toISOString(),
            })
            .eq("id", motorEditando.id)

          if (error) {
            console.error("[v0] Erro ao atualizar motor no Supabase:", error)
            throw error
          }

          console.log("[v0] Motor atualizado no Supabase com sucesso")
        }

        console.log("[v0] Atualizando estado local...")
        const motoresAtualizados = motores.map((m) => (m.id === motorEditando.id ? motorAtualizado : m))
        setMotores(motoresAtualizados)

        try {
          console.log("[v0] Salvando no localStorage...")
          salvarDadosLocal(lotes, motoresAtualizados)
          console.log("[v0] Motor editado salvo no localStorage com sucesso")
        } catch (localStorageError) {
          console.error("[v0] Erro ao salvar no localStorage:", localStorageError)
        }

        console.log("[v0] Limpando estados de edição...")
        setTimeout(() => {
          setMotorEditando(null)
          setMotorEditandoServicos([])
          setMotorEditandoValores({})
          setMotorEditandoOperador("")
          setMotorEditandoObservacoes("")
          setMotorEditandoNomesPecas({})
          console.log("[v0] Estados de edição limpos - modal fechado")
        }, 100)
      } catch (supabaseError) {
        console.error("[v0] Erro ao salvar no Supabase:", supabaseError)

        // Mesmo com erro no Supabase, salvar localmente
        console.log("[v0] Salvando apenas localmente devido ao erro no Supabase")
        const motoresAtualizados = motores.map((m) => (m.id === motorEditando.id ? motorAtualizado : m))
        setMotores(motoresAtualizados)
        salvarDadosLocal(lotes, motoresAtualizados)

        setTimeout(() => {
          setMotorEditando(null)
          setMotorEditandoServicos([])
          setMotorEditandoValores({})
          setMotorEditandoOperador("")
          setMotorEditandoObservacoes("")
          setMotorEditandoNomesPecas({})
        }, 100)

        alert("Motor editado localmente. Erro na sincronização com a nuvem.")
      }
    } catch (error) {
      console.error("[v0] Erro crítico durante salvamento:", error)

      setTimeout(() => {
        setMotorEditando(null)
        setMotorEditandoServicos([])
        setMotorEditandoValores({})
        setMotorEditandoOperador("")
        setMotorEditandoObservacoes("")
        setMotorEditandoNomesPecas({})
        console.log("[v0] Estados limpos após erro - modal fechado forçadamente")
      }, 100)

      alert("Erro ao salvar motor. Verifique o console para mais detalhes.")
    }
  }

  const cancelarEdicaoMotor = () => {
    setMotorEditando(null)
    setMotorEditandoServicos([])
    setMotorEditandoValores({})
    setMotorEditandoOperador("")
    setMotorEditandoObservacoes("")
    setMotorEditandoNomesPecas({}) // Limpar estado dos nomes das peças ao cancelar
  }

  const abrirDetalhesMotor = (motor: Motor) => {
    setMotorDetalhes(motor)
    setModalDetalhesAberto(true)
  }

  const fecharDetalhesMotor = () => {
    setMotorDetalhes(null)
    setModalDetalhesAberto(false)
  }

  const removerLote = async (id: string) => {
    try {
      // Remover do Supabase se disponível
      if (supabase && connectionStatus === "online") {
        const { error } = await supabase.from("lotes").delete().eq("id", id)

        if (error) {
          console.error("[v0] Erro ao remover lote do Supabase:", error)
          throw error
        }

        console.log("[v0] Lote removido do Supabase com sucesso")
      }

      setLotes(lotes.filter((lote) => lote.id !== id))
      setMotores(motores.filter((motor) => motor.lote !== id))

      // Fechar modal e limpar estados
      setModalExclusao({ aberto: false, tipo: "lote", id: "", nome: "" })
      setSenhaExclusao("")
      setErroSenhaExclusao("")
      console.log("[v0] Lote removido do estado local")
    } catch (error) {
      console.error("[v0] Erro ao remover lote:", error)
      alert("Erro ao remover lote. Verifique sua conexão.")
    }
  }

  const removerMotor = async (id: string) => {
    try {
      // Remover do Supabase se disponível
      if (supabase && connectionStatus === "online") {
        const { error } = await supabase.from("motores").delete().eq("id", id)

        if (error) {
          console.error("[v0] Erro ao remover motor do Supabase:", error)
          throw error
        }

        console.log("[v0] Motor removido do Supabase com sucesso")
      }

      setMotores(motores.filter((motor) => motor.id !== id))

      // Fechar modal e limpar estados
      setModalExclusao({ aberto: false, tipo: "lote", id: "", nome: "" })
      setSenhaExclusao("")
      setErroSenhaExclusao("")
      console.log("[v0] Motor removido do estado local")
    } catch (error) {
      console.error("[v0] Erro ao remover motor:", error)
      alert("Erro ao remover motor. Verifique sua conexão.")
    }
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
        nomesPecas: {
          // Limpar nome da peça ao desmarcar serviço
          ...novoMotor.nomesPecas,
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
      const novosNomesPecas = { ...motorEditandoNomesPecas } // Limpar nome da peça ao desmarcar na edição
      delete novosValores[servico]
      delete novosNomesPecas[servico] // Remover nome da peça
      setMotorEditandoValores(novosValores)
      setMotorEditandoNomesPecas(novosNomesPecas) // Atualizar estado dos nomes das peças
    }
  }

  const imprimirRelatorioLote = (loteId: string) => {
    alert("Função de impressão será implementada em breve")
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
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: #64748b;
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
      `}</style>

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
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {motoresFiltrados.map((motor) => {
                  const valorTotal = motor.servicos.reduce((sum, servico) => sum + servico.valor, 0)

                  return (
                    <div key={motor.id} className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{motor.modelo}</div>
                          <div className="text-sm text-muted-foreground mb-1">Motor {motor.numeroMotor}</div>
                          <div className="text-sm text-blue-600 font-medium mb-2">Operador: {motor.operador}</div>
                          <div className="text-sm text-green-600 font-medium mb-2">Data de Entrada: {motor.data}</div>

                          {motor.observacoes && (
                            <div className="text-sm text-muted-foreground italic mb-3 p-2 bg-background rounded">
                              <strong>Observações:</strong> {motor.observacoes}
                            </div>
                          )}

                          <div className="mb-3">
                            <div className="text-sm font-semibold text-foreground mb-2">Serviços Realizados:</div>
                            <div className="space-y-1 bg-background rounded-lg p-3 border">
                              {motor.servicos.length > 0 ? (
                                motor.servicos.map((servico, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center py-1 border-b border-muted last:border-b-0"
                                  >
                                    <div className="flex-1">
                                      <span className="text-sm text-muted-foreground">{servico.tipo}</span>
                                      {servico.nomePeca && ( // Mostrar nome da peça se existir
                                        <div className="text-xs text-blue-600 italic">Peça: {servico.nomePeca}</div>
                                      )}
                                    </div>
                                    <span className="text-sm font-medium text-primary">
                                      R$ {servico.valor.toLocaleString("pt-BR")}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-muted-foreground italic">Nenhum serviço cadastrado</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-3">
                            <Badge variant="secondary">{getLoteNome(motor.lote)}</Badge>
                            <span className="text-base font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
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
                    <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Motor</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
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
                            <div className="grid grid-cols-1 gap-3 mt-2 max-h-80 overflow-y-auto custom-scrollbar border rounded-lg p-3">
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
                                    <div className="ml-6 space-y-2">
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
                                        className="w-32"
                                      />
                                      {servico === "Peças adicionais" && ( // Campo adicional para nome da peça
                                        <Input
                                          type="text"
                                          placeholder="Nome da peça"
                                          value={novoMotor.nomesPecas[servico] || ""}
                                          onChange={(e) =>
                                            setNovoMotor({
                                              ...novoMotor,
                                              nomesPecas: {
                                                ...novoMotor.nomesPecas,
                                                [servico]: e.target.value,
                                              },
                                            })
                                          }
                                          className="w-48"
                                        />
                                      )}
                                    </div>
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
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2 pr-2">
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
                        <div
                          key={motor.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                            <div>
                              <div className="text-sm text-muted-foreground">Número</div>
                              <div className="font-medium">{motor.numeroMotor}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Marca</div>
                              <div className="font-medium">{motor.modelo}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Operador</div>
                              <div className="font-medium">{motor.operador}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Custo</div>
                              <div className="font-bold text-primary">R$ {valorTotal.toLocaleString("pt-BR")}</div>
                            </div>
                          </div>

                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirDetalhesMotor(motor)}
                              title="Ver detalhes dos serviços"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => iniciarEdicaoMotor(motor)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
                                <DialogHeader>
                                  <DialogTitle>Editar Motor - {motor.modelo}</DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
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
                                      <div className="grid grid-cols-1 gap-3 mt-2 max-h-80 overflow-y-auto custom-scrollbar border rounded-lg p-3">
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
                                              <div className="ml-6 space-y-2">
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
                                                  className="w-32"
                                                />
                                                {servico === "Peças adicionais" && ( // Campo adicional para nome da peça na edição
                                                  <Input
                                                    type="text"
                                                    placeholder="Nome da peça"
                                                    value={motorEditandoNomesPecas[servico] || ""}
                                                    onChange={(e) =>
                                                      setMotorEditandoNomesPecas({
                                                        ...motorEditandoNomesPecas,
                                                        [servico]: e.target.value,
                                                      })
                                                    }
                                                    className="w-48"
                                                  />
                                                )}
                                              </div>
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

        <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
          <DialogContent className="max-w-3xl max-h-[90vh] w-[90vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detalhes do Motor - {motorDetalhes?.modelo}
              </DialogTitle>
            </DialogHeader>

            {motorDetalhes && (
              <div className="max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-6">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Número do Motor</div>
                      <div className="font-semibold text-lg">{motorDetalhes.numeroMotor}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Modelo/Marca</div>
                      <div className="font-semibold text-lg">{motorDetalhes.modelo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Operador</div>
                      <div className="font-semibold text-lg text-blue-600">{motorDetalhes.operador}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Data de Entrada</div>
                      <div className="font-semibold text-lg text-green-600">{motorDetalhes.data}</div>
                    </div>
                  </div>

                  {/* Observações */}
                  {motorDetalhes.observacoes && (
                    <div className="p-4 bg-background border rounded-lg">
                      <div className="text-sm font-semibold text-muted-foreground mb-2">Observações</div>
                      <div className="text-sm italic">{motorDetalhes.observacoes}</div>
                    </div>
                  )}

                  {/* Lote */}
                  <div className="p-4 bg-background border rounded-lg">
                    <div className="text-sm font-semibold text-muted-foreground mb-2">Lote</div>
                    <Badge variant="secondary" className="text-sm">
                      {getLoteNome(motorDetalhes.lote)}
                    </Badge>
                  </div>

                  {/* Serviços detalhados */}
                  <div className="space-y-3">
                    <div className="text-lg font-semibold text-foreground">Serviços Realizados</div>

                    {motorDetalhes.servicos.length > 0 ? (
                      <div className="space-y-2">
                        {motorDetalhes.servicos.map((servico, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-background border rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{servico.tipo}</div>
                              {servico.nomePeca && ( // Mostrar nome da peça nos detalhes se existir
                                <div className="text-sm text-blue-600 italic mt-1">Peça: {servico.nomePeca}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                R$ {servico.valor.toLocaleString("pt-BR")}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Total geral */}
                        <div className="flex justify-between items-center p-4 bg-primary/10 border-2 border-primary/20 rounded-lg mt-4">
                          <div className="text-lg font-bold text-foreground">Total Geral</div>
                          <div className="text-xl font-bold text-primary">
                            R${" "}
                            {motorDetalhes.servicos
                              .reduce((sum, servico) => sum + servico.valor, 0)
                              .toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground italic">
                        Nenhum serviço cadastrado para este motor
                      </div>
                    )}
                  </div>

                  {/* Botão de fechar */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={fecharDetalhesMotor} variant="outline">
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
