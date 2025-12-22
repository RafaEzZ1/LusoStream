// src/app/admin/suggestions/page.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getSession();
      if (!user) {
        router.push("/"); 
        return;
      }

      // 1. Buscar TODOS os pedidos (Sem tentar buscar o nome do perfil para não dar erro)
      const { data, error } = await supabase
        .from("suggestions")
        .select("*") 
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar admin:", error);
        alert("Erro ao carregar lista: " + error.message);
      } else {
        setSuggestions(data || []);
      }
      
      setLoading(false);
    }
    load();
  }, [router]);

  // Função para mudar o estado (Aprovar/Rejeitar)
  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from("suggestions")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setSuggestions(suggestions.map(s => 
        s.id === id ? { ...s, status: newStatus } : s
      ));
    } else {
      alert("Erro ao atualizar status");
    }
  }

  // Função para Apagar
  async function deleteSuggestion(id) {
    if (!confirm("Apagar este pedido?")) return;
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (!error) {
      setSuggestions(suggestions.filter(s => s.id !== id));
    }
  }

  if (loading) return <div className="bg-black min-h-screen text-white p-10 font-bold">A verificar permissões...</div>;

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <Navbar />
      
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-2xl md:text-3xl font-bold border-l-4 border-yellow-500 pl-4 text-yellow-500">
             Painel de Pedidos ({suggestions.length})
           </h1>
           <button onClick={() => window.location.reload()} className="bg-gray-800 p-2 rounded hover:bg-gray-700">🔄 Atualizar</button>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-xs md:text-sm uppercase tracking-wider">
                <th className="p-4">Filme / Série</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {suggestions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-800/50 transition">
                  <td className="p-4 font-bold text-base md:text-lg">{s.title}</td>
                  <td className="p-4 text-gray-500 text-xs font-mono">{s.user_id}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      s.status === 'added' ? 'bg-green-900 text-green-400' :
                      s.status === 'rejected' ? 'bg-red-900 text-red-400' :
                      'bg-yellow-900 text-yellow-400'
                    }`}>
                      {s.status === 'added' ? 'Adicionado' : s.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {s.status !== 'added' && (
                      <button onClick={() => updateStatus(s.id, 'added')} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded" title="Aprovar">✅</button>
                    )}
                    {s.status !== 'rejected' && (
                      <button onClick={() => updateStatus(s.id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded" title="Rejeitar">❌</button>
                    )}
                    <button onClick={() => deleteSuggestion(s.id)} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded" title="Apagar">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {suggestions.length === 0 && (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center gap-2">
              <span className="text-3xl">📭</span>
              <p>A lista está vazia.</p>
              <p className="text-xs">Vai à página de pedidos e adiciona um para testar!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}