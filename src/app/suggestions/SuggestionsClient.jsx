"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SuggestionsClient() {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Filme");
  const [year, setYear] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    if (!title.trim()) return setMsg({ type: "error", text: "Por favor indica o título." });

    setLoading(true);

    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id,
      title,
      media_type: type,
      year: year || null,
      note: note || null,
      status: "pending"
    });

    setLoading(false);

    if (error) {
      setMsg({ type: "error", text: "Ocorreu um erro ao enviar. Tenta novamente." });
    } else {
      setMsg({ type: "success", text: "Pedido recebido! Vamos analisar." });
      setTitle(""); setYear(""); setNote("");
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24 px-6 pb-20 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-red-900/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Central de Pedidos</h1>
          <p className="text-gray-400 text-lg">Não encontras o que procuras? Pede aqui e nós adicionamos.</p>
        </div>

        {msg && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${msg.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            <span className="text-xl">{msg.type === "success" ? "✅" : "⚠️"}</span>
            <span className="font-medium">{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-bold text-gray-300">Título *</label>
              <input 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3.5 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder-gray-600" 
                placeholder="Ex: Oppenheimer" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-300">Tipo</label>
              <div className="relative">
                <select 
                  value={type} 
                  onChange={e=>setType(e.target.value)} 
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3.5 text-white focus:border-red-600 outline-none appearance-none cursor-pointer transition-all"
                >
                  <option>Filme</option>
                  <option>Série</option>
                  <option>Anime</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">▼</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300">Ano de Lançamento (Opcional)</label>
            <input 
              value={year} 
              onChange={e=>setYear(e.target.value)} 
              className="w-full bg-black/50 border border-gray-700 rounded-lg p-3.5 text-white focus:border-red-600 outline-none transition-all placeholder-gray-600" 
              placeholder="Ex: 2023" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300">Notas Adicionais (Opcional)</label>
            <textarea 
              value={note} 
              onChange={e=>setNote(e.target.value)} 
              className="w-full bg-black/50 border border-gray-700 rounded-lg p-3.5 text-white focus:border-red-600 outline-none h-32 resize-none transition-all placeholder-gray-600" 
              placeholder="Link do IMDB, Temporada específica, ou qualquer detalhe extra..." 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.01] shadow-lg shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"/> A enviar...
              </span>
            ) : "🚀 Enviar Pedido"}
          </button>
        </form>
      </div>
    </div>
  );
}