// src/app/admin/suggestions/page.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("a verificar..."); // Para veres o teu cargo
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function load() {
      // 1. Verificar quem é o user
      const { data: { user } } = await supabase.auth.getSession();
      
      if (!user) {
        setUserRole("Sem Login");
        setLoading(false);
        return;
      }
      setUserId(user.id);

      // 2. Verificar o cargo na tabela profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const role = profile?.role || "user (padrão)";
      setUserRole(role);

      // 3. Buscar pedidos (mesmo que não sejas admin, para testar se a tabela funciona)
      const { data, error } = await supabase
        .from("suggestions")
        .select("*") 
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro SQL:", error);
        alert("Erro SQL: " + error.message);
      } else {
        setSuggestions(data || []);
      }
      
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id, newStatus) {
    const { error } = await supabase.from("suggestions").update({ status: newStatus }).eq("id", id);
    if (!error) setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: newStatus } : s));
  }

  async function deleteSuggestion(id) {
    if (!confirm("Apagar?")) return;
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (!error) setSuggestions(suggestions.filter(s => s.id !== id));
  }

  if (loading) return <div className="bg-black min-h-screen text-white p-10">A carregar...</div>;

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <Navbar />
      
      <main className="pt-24 px-4 max-w-7xl mx-auto pb-20">
        {/* CAIXA DE DEBUG: Mostra quem tu és */}
        <div className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
           <h2 className="text-xl font-bold mb-2">Estado do Admin:</h2>
           <p>O teu ID: <span className="font-mono text-yellow-400">{userId}</span></p>
           <p>O teu Cargo (Role): <span className={`font-bold ${userRole === 'admin' ? 'text-green-400' : 'text-red-500'}`}>{userRole}</span></p>
           
           {userRole !== 'admin' && (
             <p className="mt-2 text-red-400 text-sm">
               ⚠️ O sistema não te reconhece como 'admin'. Por isso é que eras expulso.
               <br/>Corre o SQL abaixo no Supabase para corrigir.
             </p>
           )}
        </div>

        <h1 className="text-3xl font-bold mb-8 text-yellow-500">Painel de Pedidos</h1>

        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800 text-gray-400 text-sm">
              <tr>
                <th className="p-4">Pedido</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {suggestions.map((s) => (
                <tr key={s.id}>
                  <td className="p-4 font-bold">{s.title}</td>
                  <td className="p-4">{s.status}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => updateStatus(s.id, 'added')} className="bg-green-600 p-2 rounded">✅</button>
                    <button onClick={() => updateStatus(s.id, 'rejected')} className="bg-red-600 p-2 rounded">❌</button>
                    <button onClick={() => deleteSuggestion(s.id)} className="bg-gray-700 p-2 rounded">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}