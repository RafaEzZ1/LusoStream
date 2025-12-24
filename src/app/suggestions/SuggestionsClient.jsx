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
    if (!user) return router.push("/auth");

    if (!title.trim()) return setMsg({ type: "error", text: "Precisamos pelo menos do título!" });

    setLoading(true);

    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id, title, media_type: type, year: year || null, note: note || null, status: "pending"
    });

    setLoading(false);

    if (error) {
      setMsg({ type: "error", text: "Ups! Algo correu mal. Tenta de novo." });
    } else {
      setMsg({ type: "success", text: "Pedido recebido com sucesso! Obrigado." });
      setTitle(""); setYear(""); setNote("");
    }
  }

  return (
    <div className="min-h-screen bg-black pt-28 px-4 pb-20 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-4 tracking-tight">
            Central de Pedidos
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            O LusoStream é feito para ti. Diz-nos o que falta e nós tratamos do resto.
          </p>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl mb-8 flex items-center gap-4 shadow-lg animate-in zoom-in duration-300 ${msg.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-200" : "bg-red-500/10 border border-red-500/20 text-red-200"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.type === "success" ? "bg-green-500/20" : "bg-red-500/20"}`}>
              {msg.type === "success" ? "✓" : "!"}
            </div>
            <div>
              <h4 className="font-bold">{msg.type === "success" ? "Sucesso!" : "Erro"}</h4>
              <p className="text-sm opacity-90">{msg.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900/40 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Título do Filme/Série</label>
              <input 
                value={title} onChange={e=>setTitle(e.target.value)} 
                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white text-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder-gray-700" 
                placeholder="Escreve o nome aqui..." 
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Tipo</label>
              <div className="relative">
                <select 
                  value={type} onChange={e=>setType(e.target.value)} 
                  className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white text-lg focus:border-red-600 outline-none appearance-none cursor-pointer"
                >
                  <option>Filme</option> <option>Série</option> <option>Anime</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">▼</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ano (Opcional)</label>
            <input 
              value={year} onChange={e=>setYear(e.target.value)} 
              className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-red-600 outline-none transition-all placeholder-gray-700" 
              placeholder="Ex: 2024" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Detalhes Extra (Opcional)</label>
            <textarea 
              value={note} onChange={e=>setNote(e.target.value)} 
              className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-red-600 outline-none h-32 resize-none transition-all placeholder-gray-700" 
              placeholder="Ex: Temporada 2, versão estendida, link do IMDB..." 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full group bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"/> A enviar...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-lg">
                Enviar Pedido <span className="group-hover:translate-x-1 transition-transform">🚀</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}