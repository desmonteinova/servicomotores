export interface Motor {
  id: string
  loteId: string
  numeroMotor: string
  modeloVeiculo: string
  tipoServico: string
  valor: number
  observacoes?: string
  dataCadastro: string
}

export interface Lote {
  id: string
  nome: string
  dataCriacao: string
  status: "ativo" | "fechado"
  totalMotores: number
  custoTotal: number
}

// Dados iniciais sincronizados
const initialLotes: Lote[] = [
  {
    id: "1",
    nome: "Lote Janeiro/2025",
    dataCriacao: "2025-01-15",
    status: "ativo",
    totalMotores: 15,
    custoTotal: 4250.0,
  },
  {
    id: "2",
    nome: "Lote Dezembro/2024",
    dataCriacao: "2024-12-01",
    status: "fechado",
    totalMotores: 12,
    custoTotal: 3890.5,
  },
  {
    id: "3",
    nome: "Lote Novembro/2024",
    dataCriacao: "2024-11-01",
    status: "fechado",
    totalMotores: 18,
    custoTotal: 5120.75,
  },
]

const initialMotores: Motor[] = [
  // Motores do Lote Janeiro/2025 (15 motores)
  {
    id: "m1",
    loteId: "1",
    numeroMotor: "001",
    modeloVeiculo: "Honda Civic",
    tipoServico: "Retífica Completa",
    valor: 280.0,
    dataCadastro: "2025-01-15",
  },
  {
    id: "m2",
    loteId: "1",
    numeroMotor: "002",
    modeloVeiculo: "Toyota Corolla",
    tipoServico: "Troca de Anéis",
    valor: 150.0,
    dataCadastro: "2025-01-15",
  },
  {
    id: "m3",
    loteId: "1",
    numeroMotor: "003",
    modeloVeiculo: "VW Golf",
    tipoServico: "Retífica Completa",
    valor: 320.0,
    dataCadastro: "2025-01-16",
  },
  {
    id: "m4",
    loteId: "1",
    numeroMotor: "004",
    modeloVeiculo: "Ford Focus",
    tipoServico: "Brunimento",
    valor: 180.0,
    dataCadastro: "2025-01-16",
  },
  {
    id: "m5",
    loteId: "1",
    numeroMotor: "005",
    modeloVeiculo: "Chevrolet Onix",
    tipoServico: "Troca de Anéis",
    valor: 140.0,
    dataCadastro: "2025-01-17",
  },
  {
    id: "m6",
    loteId: "1",
    numeroMotor: "006",
    modeloVeiculo: "Hyundai HB20",
    tipoServico: "Retífica Completa",
    valor: 290.0,
    dataCadastro: "2025-01-17",
  },
  {
    id: "m7",
    loteId: "1",
    numeroMotor: "007",
    modeloVeiculo: "Nissan Versa",
    tipoServico: "Brunimento",
    valor: 200.0,
    dataCadastro: "2025-01-18",
  },
  {
    id: "m8",
    loteId: "1",
    numeroMotor: "008",
    modeloVeiculo: "Renault Sandero",
    tipoServico: "Troca de Anéis",
    valor: 160.0,
    dataCadastro: "2025-01-18",
  },
  {
    id: "m9",
    loteId: "1",
    numeroMotor: "009",
    modeloVeiculo: "Fiat Argo",
    tipoServico: "Retífica Completa",
    valor: 300.0,
    dataCadastro: "2025-01-19",
  },
  {
    id: "m10",
    loteId: "1",
    numeroMotor: "010",
    modeloVeiculo: "Peugeot 208",
    tipoServico: "Brunimento",
    valor: 190.0,
    dataCadastro: "2025-01-19",
  },
  {
    id: "m11",
    loteId: "1",
    numeroMotor: "011",
    modeloVeiculo: "Honda City",
    tipoServico: "Troca de Anéis",
    valor: 170.0,
    dataCadastro: "2025-01-20",
  },
  {
    id: "m12",
    loteId: "1",
    numeroMotor: "012",
    modeloVeiculo: "Toyota Yaris",
    tipoServico: "Retífica Completa",
    valor: 310.0,
    dataCadastro: "2025-01-20",
  },
  {
    id: "m13",
    loteId: "1",
    numeroMotor: "013",
    modeloVeiculo: "VW Polo",
    tipoServico: "Brunimento",
    valor: 210.0,
    dataCadastro: "2025-01-21",
  },
  {
    id: "m14",
    loteId: "1",
    numeroMotor: "014",
    modeloVeiculo: "Ford Ka",
    tipoServico: "Troca de Anéis",
    valor: 130.0,
    dataCadastro: "2025-01-21",
  },
  {
    id: "m15",
    loteId: "1",
    numeroMotor: "015",
    modeloVeiculo: "Chevrolet Prisma",
    tipoServico: "Retífica Completa",
    valor: 280.0,
    dataCadastro: "2025-01-22",
  },

  // Motores do Lote Dezembro/2024 (12 motores)
  {
    id: "m16",
    loteId: "2",
    numeroMotor: "001",
    modeloVeiculo: "Honda Fit",
    tipoServico: "Retífica Completa",
    valor: 290.0,
    dataCadastro: "2024-12-01",
  },
  {
    id: "m17",
    loteId: "2",
    numeroMotor: "002",
    modeloVeiculo: "Toyota Etios",
    tipoServico: "Troca de Anéis",
    valor: 155.0,
    dataCadastro: "2024-12-02",
  },
  {
    id: "m18",
    loteId: "2",
    numeroMotor: "003",
    modeloVeiculo: "VW Gol",
    tipoServico: "Brunimento",
    valor: 185.0,
    dataCadastro: "2024-12-03",
  },
  {
    id: "m19",
    loteId: "2",
    numeroMotor: "004",
    modeloVeiculo: "Ford Fiesta",
    tipoServico: "Retífica Completa",
    valor: 305.0,
    dataCadastro: "2024-12-04",
  },
  {
    id: "m20",
    loteId: "2",
    numeroMotor: "005",
    modeloVeiculo: "Chevrolet Celta",
    tipoServico: "Troca de Anéis",
    valor: 145.0,
    dataCadastro: "2024-12-05",
  },
  {
    id: "m21",
    loteId: "2",
    numeroMotor: "006",
    modeloVeiculo: "Hyundai i30",
    tipoServico: "Brunimento",
    valor: 220.0,
    dataCadastro: "2024-12-06",
  },
  {
    id: "m22",
    loteId: "2",
    numeroMotor: "007",
    modeloVeiculo: "Nissan March",
    tipoServico: "Retífica Completa",
    valor: 275.0,
    dataCadastro: "2024-12-07",
  },
  {
    id: "m23",
    loteId: "2",
    numeroMotor: "008",
    modeloVeiculo: "Renault Logan",
    tipoServico: "Troca de Anéis",
    valor: 165.0,
    dataCadastro: "2024-12-08",
  },
  {
    id: "m24",
    loteId: "2",
    numeroMotor: "009",
    modeloVeiculo: "Fiat Palio",
    tipoServico: "Brunimento",
    valor: 195.0,
    dataCadastro: "2024-12-09",
  },
  {
    id: "m25",
    loteId: "2",
    numeroMotor: "010",
    modeloVeiculo: "Peugeot 207",
    tipoServico: "Retífica Completa",
    valor: 285.0,
    dataCadastro: "2024-12-10",
  },
  {
    id: "m26",
    loteId: "2",
    numeroMotor: "011",
    modeloVeiculo: "Honda Civic",
    tipoServico: "Troca de Anéis",
    valor: 175.0,
    dataCadastro: "2024-12-11",
  },
  {
    id: "m27",
    loteId: "2",
    numeroMotor: "012",
    modeloVeiculo: "Toyota Corolla",
    tipoServico: "Brunimento",
    valor: 205.0,
    dataCadastro: "2024-12-12",
  },

  // Motores do Lote Novembro/2024 (18 motores)
  {
    id: "m28",
    loteId: "3",
    numeroMotor: "001",
    modeloVeiculo: "VW Jetta",
    tipoServico: "Retífica Completa",
    valor: 350.0,
    dataCadastro: "2024-11-01",
  },
  {
    id: "m29",
    loteId: "3",
    numeroMotor: "002",
    modeloVeiculo: "Ford Fusion",
    tipoServico: "Brunimento",
    valor: 250.0,
    dataCadastro: "2024-11-02",
  },
  {
    id: "m30",
    loteId: "3",
    numeroMotor: "003",
    modeloVeiculo: "Chevrolet Cruze",
    tipoServico: "Troca de Anéis",
    valor: 180.0,
    dataCadastro: "2024-11-03",
  },
  {
    id: "m31",
    loteId: "3",
    numeroMotor: "004",
    modeloVeiculo: "Hyundai Elantra",
    tipoServico: "Retífica Completa",
    valor: 330.0,
    dataCadastro: "2024-11-04",
  },
  {
    id: "m32",
    loteId: "3",
    numeroMotor: "005",
    modeloVeiculo: "Nissan Sentra",
    tipoServico: "Brunimento",
    valor: 240.0,
    dataCadastro: "2024-11-05",
  },
  {
    id: "m33",
    loteId: "3",
    numeroMotor: "006",
    modeloVeiculo: "Renault Fluence",
    tipoServico: "Troca de Anéis",
    valor: 190.0,
    dataCadastro: "2024-11-06",
  },
  {
    id: "m34",
    loteId: "3",
    numeroMotor: "007",
    modeloVeiculo: "Fiat Linea",
    tipoServico: "Retífica Completa",
    valor: 320.0,
    dataCadastro: "2024-11-07",
  },
  {
    id: "m35",
    loteId: "3",
    numeroMotor: "008",
    modeloVeiculo: "Peugeot 408",
    tipoServico: "Brunimento",
    valor: 260.0,
    dataCadastro: "2024-11-08",
  },
  {
    id: "m36",
    loteId: "3",
    numeroMotor: "009",
    modeloVeiculo: "Honda Accord",
    tipoServico: "Troca de Anéis",
    valor: 200.0,
    dataCadastro: "2024-11-09",
  },
  {
    id: "m37",
    loteId: "3",
    numeroMotor: "010",
    modeloVeiculo: "Toyota Camry",
    tipoServico: "Retífica Completa",
    valor: 380.0,
    dataCadastro: "2024-11-10",
  },
  {
    id: "m38",
    loteId: "3",
    numeroMotor: "011",
    modeloVeiculo: "VW Passat",
    tipoServico: "Brunimento",
    valor: 270.0,
    dataCadastro: "2024-11-11",
  },
  {
    id: "m39",
    loteId: "3",
    numeroMotor: "012",
    modeloVeiculo: "Ford Mondeo",
    tipoServico: "Troca de Anéis",
    valor: 210.0,
    dataCadastro: "2024-11-12",
  },
  {
    id: "m40",
    loteId: "3",
    numeroMotor: "013",
    modeloVeiculo: "Chevrolet Malibu",
    tipoServico: "Retífica Completa",
    valor: 360.0,
    dataCadastro: "2024-11-13",
  },
  {
    id: "m41",
    loteId: "3",
    numeroMotor: "014",
    modeloVeiculo: "Hyundai Sonata",
    tipoServico: "Brunimento",
    valor: 280.0,
    dataCadastro: "2024-11-14",
  },
  {
    id: "m42",
    loteId: "3",
    numeroMotor: "015",
    modeloVeiculo: "Nissan Altima",
    tipoServico: "Troca de Anéis",
    valor: 220.0,
    dataCadastro: "2024-11-15",
  },
  {
    id: "m43",
    loteId: "3",
    numeroMotor: "016",
    modeloVeiculo: "Renault Laguna",
    tipoServico: "Retífica Completa",
    valor: 340.0,
    dataCadastro: "2024-11-16",
  },
  {
    id: "m44",
    loteId: "3",
    numeroMotor: "017",
    modeloVeiculo: "Fiat Bravo",
    tipoServico: "Brunimento",
    valor: 230.0,
    dataCadastro: "2024-11-17",
  },
  {
    id: "m45",
    loteId: "3",
    numeroMotor: "018",
    modeloVeiculo: "Peugeot 508",
    tipoServico: "Troca de Anéis",
    valor: 250.75,
    dataCadastro: "2024-11-18",
  },
]

// Store global para gerenciar estado
class DataStore {
  private lotes: Lote[] = [...initialLotes]
  private motores: Motor[] = [...initialMotores]
  private listeners: (() => void)[] = []

  // Métodos para lotes
  getLotes(): Lote[] {
    return [...this.lotes]
  }

  addLote(lote: Omit<Lote, "id" | "totalMotores" | "custoTotal">): Lote {
    const newLote: Lote = {
      ...lote,
      id: Date.now().toString(),
      totalMotores: 0,
      custoTotal: 0,
    }
    this.lotes = [newLote, ...this.lotes]
    this.notifyListeners()
    return newLote
  }

  updateLote(id: string, updates: Partial<Lote>): void {
    this.lotes = this.lotes.map((lote) => (lote.id === id ? { ...lote, ...updates } : lote))
    this.notifyListeners()
  }

  deleteLote(id: string): void {
    this.lotes = this.lotes.filter((lote) => lote.id !== id)
    this.motores = this.motores.filter((motor) => motor.loteId !== id)
    this.notifyListeners()
  }

  // Métodos para motores
  getMotores(): Motor[] {
    return [...this.motores]
  }

  getMotoresByLote(loteId: string): Motor[] {
    return this.motores.filter((motor) => motor.loteId === loteId)
  }

  addMotor(motor: Omit<Motor, "id">): Motor {
    const newMotor: Motor = {
      ...motor,
      id: Date.now().toString(),
    }
    this.motores = [...this.motores, newMotor]
    this.updateLoteStats(motor.loteId)
    this.notifyListeners()
    return newMotor
  }

  updateMotor(id: string, updates: Partial<Motor>): void {
    const oldMotor = this.motores.find((m) => m.id === id)
    this.motores = this.motores.map((motor) => (motor.id === id ? { ...motor, ...updates } : motor))
    if (oldMotor) {
      this.updateLoteStats(oldMotor.loteId)
      if (updates.loteId && updates.loteId !== oldMotor.loteId) {
        this.updateLoteStats(updates.loteId)
      }
    }
    this.notifyListeners()
  }

  deleteMotor(id: string): void {
    const motor = this.motores.find((m) => m.id === id)
    this.motores = this.motores.filter((motor) => motor.id !== id)
    if (motor) {
      this.updateLoteStats(motor.loteId)
    }
    this.notifyListeners()
  }

  // Atualizar estatísticas do lote
  private updateLoteStats(loteId: string): void {
    const motoresDoLote = this.motores.filter((motor) => motor.loteId === loteId)
    const totalMotores = motoresDoLote.length
    const custoTotal = motoresDoLote.reduce((sum, motor) => sum + motor.valor, 0)

    this.lotes = this.lotes.map((lote) => (lote.id === loteId ? { ...lote, totalMotores, custoTotal } : lote))
  }

  // Métricas gerais
  getMetrics() {
    const totalLotes = this.lotes.length
    const totalMotores = this.motores.length
    const custoTotal = this.motores.reduce((sum, motor) => sum + motor.valor, 0)
    const mediaGastoLote = totalLotes > 0 ? custoTotal / totalLotes : 0

    return {
      totalLotes,
      totalMotores,
      custoTotal,
      mediaGastoLote,
      loteAtivo: this.lotes.find((l) => l.status === "ativo")?.nome || "Nenhum lote ativo",
    }
  }

  // Sistema de listeners para reatividade
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }
}

export const dataStore = new DataStore()
