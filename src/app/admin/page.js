// src/app/admin/page.js
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminClient from "./AdminClient"; // Se usares o componente separado

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pending: 0, reports: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    // Conta users
    const { count: userCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
    
    // Conta sugestões pendentes
    const { count: suggestionsCount } = await supabase
      .from("suggestions")
      .select("*", { count: 'exact', head: true })
      .eq("status", "pending");

    // Conta reportes pendentes (se tiveres a tabela reports)
    const { count: reportsCount } = await supabase
      .from("reports")
      .select("*", { count: 'exact', head: true })
      .eq("status", "pending");

    setStats({ 
      users: userCount || 0, 
      pending: suggestionsCount || 0,
      reports: reportsCount || 0
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Cabeçalho do Dashboard */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Visão Geral</h2>
        <p className="text-gray-400">Bem-vindo de volta, Chefe. Aqui está o estado do LusoStream.</p>
      </div>

      {/* Cartões de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cartão Users */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Utilizadores Totais</h3>
            <span className="p-2 bg-blue-900/30 rounded-lg text-blue-500">👥</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.users}</p>
        </div>

        {/* Cartão Sugestões */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Pedidos Pendentes</h3>
            <span className="p-2 bg-yellow-900/30 rounded-lg text-yellow-500">💡</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.pending}</p>
        </div>

        {/* Cartão Reportes */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Reportes de Erro</h3>
            <span className="p-2 bg-red-900/30 rounded-lg text-red-500">⚠️</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.reports}</p>
        </div>

      </div>

      {/* Se quiseres manter a lista aqui ou só os gráficos, podes adicionar aqui */}
      {/* <AdminClient /> */} 
      
    </div>
  );
}