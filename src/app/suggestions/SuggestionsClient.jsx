"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SuggestionsClient() {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Filme"); // Valor inicial
  const [year, setYear] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth");

    if (!title.trim()) return setMsg({ type: "error", text: "Falta o título do que queres ver!" });

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
      setMsg({ type: "error", text: "Ops, erro de conexão. Tenta de novo." });
    } else {
      setMsg({ type: "success", text: "Recebido! Vamos tentar adicionar em breve." });
      setTitle(""); setYear(""); setNote("");
    }
  }

  // Componente de Botão de Seleção Personalizado
  const TypeButton = ({ value, label, icon }) => (
    <button
      type="button"
      onClick={() => setType(value)}
      className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
        type === value 
          ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50 scale-105" 
          : "bg-black/40 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-500"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black pt-28 px-4 pb-20 relative overflow-hidden font-sans selection:bg-red-900 selection:text-white">
      
      {/* Luzes de Fundo (Ambiente) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-6 duration-700">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Faz o teu Pedido
          </h1>
          <p className="text-gray-400 text-lg">
            Não encontras o teu conteúdo favorito? <span className="text-red-500 font-bold">Pede aqui!</span>
          </p>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl mb-8 flex items-center gap-4 shadow-xl animate-in zoom-in duration-300 border ${msg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-200" : "bg-red-500/10 border-red-500/20 text-red-200"}`}>
            <span className="text-2xl">{msg.type === "success" ? "🎉" : "⚠️"}</span>
            <div>
              <p className="font-bold">{msg.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          
          {/* Seletor de Tipo (Botões em vez de Dropdown) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">O que queres ver?</label>
            <div className="flex gap-4">
              <TypeButton value="Filme" label="Filme" icon="🎬" />
              <TypeButton value="Série" label="Série" icon="📺" />
              <TypeButton value="Anime" label="Anime" icon="⛩️" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-red-500 transition-colors">Nome da Obra *</label>
              <input 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white text-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder-gray-700" 
                placeholder="Ex: Oppenheimer" 
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-red-500 transition-colors">Ano (Opcional)</label>
              <input 
                value={year} 
                onChange={e=>setYear(e.target.value)} 
                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-red-600 outline-none transition-all placeholder-gray-700" 
                placeholder="Ex: 2023" 
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-red-500 transition-colors">Observações</label>
              <textarea 
                value={note} 
                onChange={e=>setNote(e.target.value)} 
                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-red-600 outline-none h-32 resize-none transition-all placeholder-gray-700" 
                placeholder="Ex: Temporada 2, Dublado, Versão 4K..." 
              />
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full relative overflow-hidden group bg-red-600 hover:bg-red-500 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-lg shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <span className="relative flex items-center justify-center gap-2 text-lg uppercase tracking-wide">
              {loading ? "A enviar..." : "🚀 Enviar Pedido"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}