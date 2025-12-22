// src/app/admin/suggestions/page.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("A aguardar autenticação...");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. OUVIR MUDANÇAS DE AUTENTICAÇÃO EM TEMPO REAL
    // Isto resolve o problema de "Sem Login" porque espera que o navegador carregue a sessão
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (!session?.user) {
        setDebugInfo("Utilizador NÃO detetado (Faz Login novamente!)");
        setLoading(false);
        return;
      }

      const user = session.user;
      setDebugInfo(`Utilizador detetado: ${user.email}`);

      // 2. Verificar se é Admin (agora que sabemos quem é)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const role = profile?.role || "user";
      
      if (role !== "admin") {
        setDebugInfo(`Utilizador: ${user.email} | Cargo: ${role} (NÃO É ADMIN)`);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setDebugInfo(`Bem-vindo Chefe! (${user.email})`);

      // 3. Carregar os dados
      fetchSuggestions();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchSuggestions() {
    const { data, error } = await supabase
      .from("suggestions")
      .select("*") 
      .order("created_at", { ascending: false });

    if (error) alert("Erro ao carregar lista: " + error.message);
    else setSuggestions(data || []);
    
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase.from("suggestions").update({ status: newStatus }).eq("id", id);
    if (!error) setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  }

  async function deleteSuggestion(id) {
    if (!confirm("Apagar?")) return;
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (!error) setSuggestions(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <Navbar />
      
      <main className="pt-24 px-4 max-w-7xl mx-auto pb-20">
        
        {/* CAIXA DE DEBUG (Para saberes o que se passa) */}
        <div className={`mb-8 p-4 border rounded-lg ${isAdmin ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'}`}>
           <h2 className="text-lg font-bold mb-1">Estado do Sistema:</h2>
           <p className="font-mono text-sm">{debugInfo}</p>
           {!isAdmin && !loading && (
             <button onClick={() => router.push("/auth")} className="mt-2 bg-white text-black px-4 py-2 rounded font-bold text-sm">
               Ir Fazer Login
             </button>
           )}
        </div>

        {isAdmin && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-yellow-500">Painel de Pedidos</h1>
              <button onClick={fetchSuggestions} className="bg-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-700">🔄 Atualizar Lista</button>
            </div>

            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl overflow-x-auto border border-gray-800">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-800 text-gray-400 text-sm">
                  <tr>
                    <th className="p-4">Pedido</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {suggestions.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-gray-500">Nenhum pedido encontrado.</td>
                    </tr>
                  ) : (
                    suggestions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-800/50">
                        <td className="p-4 font-bold">{s.title}</td>
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
                          <button onClick={() => updateStatus(s.id, 'added')} className="bg-green-600 p-2 rounded hover:bg-green-500 transition" title="Aprovar">✅</button>
                          <button onClick={() => updateStatus(s.id, 'rejected')} className="bg-red-600 p-2 rounded hover:bg-red-500 transition" title="Rejeitar">❌</button>
                          <button onClick={() => deleteSuggestion(s.id)} className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition" title="Apagar">🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}