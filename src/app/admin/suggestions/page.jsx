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
      // 1. Verificar se é Admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/"); // Manda para casa se não tiver login
        return;
      }

      // Verifica na tabela profiles se é admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profile?.role !== "admin" && profile?.role !== "mod") {
        router.push("/"); // Expulsa se não for admin
        return;
      }

      // 2. Buscar TODOS os pedidos (ordenados pelos mais recentes)
      const { data, error } = await supabase
        .from("suggestions")
        .select("*, profiles(username, email)") // Tenta buscar o nome de quem pediu
        .order("created_at", { ascending: false });

      if (data) setSuggestions(data);
      setLoading(false);
    }
    load();
  }, [router]);

  // Função para mudar o estado (Aprovar/Rejeitar)
  async function updateStatus(id, newStatus) {
    // Atualiza na base de dados
    const { error } = await supabase
      .from("suggestions")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // Atualiza a lista visualmente sem recarregar
      setSuggestions(suggestions.map(s => 
        s.id === id ? { ...s, status: newStatus } : s
      ));
    } else {
      alert("Erro ao atualizar status");
    }
  }

  // Função para Apagar
  async function deleteSuggestion(id) {
    if (!confirm("Tens a certeza que queres apagar este pedido?")) return;
    
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (!error) {
      setSuggestions(suggestions.filter(s => s.id !== id));
    }
  }

  if (loading) return <div className="bg-black min-h-screen text-white p-10">A carregar painel...</div>;

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <Navbar />
      
      <main className="pt-24 px-6 max-w-6xl mx-auto pb-20">
        <h1 className="text-3xl font-bold mb-8 border-l-4 border-yellow-500 pl-4 text-yellow-500">
          Painel de Pedidos 🚧
        </h1>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 border-b border-gray-700">Pedido</th>
                <th className="p-4 border-b border-gray-700">Utilizador</th>
                <th className="p-4 border-b border-gray-700">Data</th>
                <th className="p-4 border-b border-gray-700">Estado</th>
                <th className="p-4 border-b border-gray-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {suggestions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-800/50 transition">
                  {/* Título */}
                  <td className="p-4 font-bold text-lg">{s.title}</td>
                  
                  {/* Quem pediu */}
                  <td className="p-4 text-gray-400 text-sm">
                    {s.profiles?.username || s.user_id.slice(0, 8) + "..."}
                  </td>

                  {/* Data */}
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(s.created_at).toLocaleDateString('pt-PT')}
                  </td>

                  {/* Estado (Badge Colorida) */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      s.status === 'added' ? 'bg-green-900 text-green-400' :
                      s.status === 'rejected' ? 'bg-red-900 text-red-400' :
                      'bg-yellow-900 text-yellow-400'
                    }`}>
                      {s.status === 'added' ? 'Adicionado' : s.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </td>

                  {/* Botões de Ação */}
                  <td className="p-4 flex justify-end gap-2">
                    {s.status !== 'added' && (
                      <button 
                        onClick={() => updateStatus(s.id, 'added')}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition"
                        title="Marcar como Adicionado"
                      >
                        ✅
                      </button>
                    )}
                    
                    {s.status !== 'rejected' && (
                      <button 
                        onClick={() => updateStatus(s.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
                        title="Rejeitar Pedido"
                      >
                        ❌
                      </button>
                    )}

                    <button 
                      onClick={() => deleteSuggestion(s.id)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition"
                      title="Apagar da Lista"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {suggestions.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              Não há pedidos pendentes. Bom trabalho! 🎉
            </div>
          )}
        </div>
      </main>
    </div>
  );
}