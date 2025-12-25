"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr';

export default function DebugPage() {
  const [status, setStatus] = useState("A testar...");
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  useEffect(() => {
    async function runDiagnostics() {
      addLog("🚀 Iniciando diagnóstico...");

      // 1. Verificar Variáveis
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url) addLog("❌ URL está em falta (undefined)");
      else addLog(`✅ URL detetado: ${url.substring(0, 15)}...`);

      if (!key) addLog("❌ KEY está em falta (undefined)");
      else addLog(`✅ KEY detetada: ${key.substring(0, 10)}...`);

      if (!url || !key) {
        setStatus("FALHOU: Faltam variáveis");
        return;
      }

      // 2. Testar Conexão Direta
      addLog("🔄 Tentando conectar ao Supabase...");
      try {
        const supabase = createBrowserClient(url, key);
        
        const start = Date.now();
        const { data, error } = await supabase.from('movie_embeds').select('count').limit(1).single();
        const timeTaken = Date.now() - start;

        if (error) {
          addLog(`❌ Erro na conexão: ${error.message}`);
          addLog(`📝 Detalhes: ${JSON.stringify(error)}`);
          setStatus("ERRO DE CONEXÃO");
        } else {
          addLog(`✅ Sucesso! Resposta recebida em ${timeTaken}ms`);
          addLog(`📦 Dados recebidos (teste): ${JSON.stringify(data)}`);
          setStatus("SISTEMA OPERACIONAL");
        }
      } catch (err) {
        addLog(`❌ Erro Crítico: ${err.message}`);
        setStatus("ERRO CRÍTICO");
      }
    }

    runDiagnostics();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-10 font-mono">
      <h1 className="text-3xl font-bold mb-4 text-red-500">DIAGNÓSTICO LUSOSTREAM</h1>
      
      <div className={`p-4 rounded border-2 mb-6 ${status === "SISTEMA OPERACIONAL" ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20"}`}>
        <h2 className="text-2xl">{status}</h2>
      </div>

      <div className="bg-gray-900 p-4 rounded border border-gray-700 h-96 overflow-auto">
        {logs.map((log, i) => (
          <div key={i} className="mb-2 border-b border-gray-800 pb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}