-- Criar tabela de lotes
CREATE TABLE IF NOT EXISTS lotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de motores
CREATE TABLE IF NOT EXISTS motores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id UUID REFERENCES lotes(id) ON DELETE CASCADE,
  numero_motor TEXT NOT NULL,
  modelo TEXT NOT NULL,
  operador TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  motor_id UUID REFERENCES motores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_motores_lote_id ON motores(lote_id);
CREATE INDEX IF NOT EXISTS idx_servicos_motor_id ON servicos(motor_id);
