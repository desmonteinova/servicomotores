"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, ExternalLink } from "lucide-react"

export default function SetupGuide() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- Remover tabelas existentes (se existirem)
DROP TABLE IF EXISTS motores;
DROP TABLE IF EXISTS lotes;

-- Criar tabela de lotes
CREATE TABLE lotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_fechamento DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de motores
CREATE TABLE motores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  modelo TEXT NOT NULL,
  operador TEXT,
  observacoes TEXT,
  lote_id UUID REFERENCES lotes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE motores ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Allow all operations on lotes" ON lotes FOR ALL USING (true);
CREATE POLICY "Allow all operations on motores" ON motores FOR ALL USING (true);`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Configuração para Múltiplos Dispositivos
        </CardTitle>
        <CardDescription>Para usar o sistema em outros dispositivos, siga estes passos:</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h3 className="font-medium">Acesse o Supabase Dashboard</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vá para{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  supabase.com/dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>{" "}
                e selecione seu projeto
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h3 className="font-medium">Abra o SQL Editor</h3>
              <p className="text-sm text-muted-foreground mt-1">No menu lateral, clique em "SQL Editor"</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Execute o Script SQL</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Copie e cole o script abaixo no SQL Editor e clique em "Run"
              </p>

              <div className="relative">
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto border max-h-64 overflow-y-auto">
                  <code>{sqlScript}</code>
                </pre>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-transparent"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div>
              <h3 className="font-medium">Acesse de Qualquer Dispositivo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Após executar o script, você pode acessar o sistema de qualquer dispositivo. Os dados serão
                sincronizados automaticamente entre todos os dispositivos.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">✅ Verificação</h4>
          <p className="text-sm text-blue-800">
            Após executar o script, recarregue esta página. Se tudo estiver configurado corretamente, este guia
            desaparecerá e você verá a interface normal do sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export { SetupGuide }
