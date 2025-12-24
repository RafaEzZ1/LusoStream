"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SuggestionsClient() {
  const router = useRouter();
  const supabase = createClient();
  
  // Tabs: 'content' (Filmes/Séries) ou 'feedback' (Site/Bugs)
  const [activeTab, setActiveTab] = useState("content");

  // Dados do Formulário
  const [title, setTitle] = useState(""); // Serve para Título do Filme OU Assunto do Feedback
  const [type, setType] = useState("Filme"); // Filme, Série, Anime, Bug, Melhoria
  const [year, setYear] = useState("");
  const [note, setNote] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth");

    if (!title.trim()) {
      return setMsg({ type: "error", text: activeTab === "content" ? "Indica o nome do filme/série." : "Indica o assunto." });
    }

    setLoading(true);

    // Ajusta os dados consoante a aba
    const finalMediaType = activeTab === "content" ? type : `Site: ${type}`; // Ex: "Site: Bug"

    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id,
      title: title, // Título da obra OU Assunto do report
      media_type: finalMediaType,
      year: activeTab === "content" ? year : null,
      note: note, // Detalhes ou descrição do erro
      status: "pending"
    });

    setLoading(false);

    if (error) {
      setMsg({ type: "error", text: "Erro ao enviar. Tenta novamente." });
    } else {
      setMsg({ type: "success", text: activeTab === "content" ? "Pedido registado! Vamos procurar." : "Obrigado pelo teu feedback!" });
      setTitle(""); setYear(""); setNote("");
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-28 px-4 pb-20 relative overflow-hidden font-sans selection:bg-red-900 selection:text-white">
      
      {/* Background Lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-800/20 blur-[150px] rounded-full pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none opacity-60" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
            Central de Apoio
          </h1>
          <p className="text-gray-400 text-lg">
            Estamos aqui para construir o LusoStream contigo.
          </p>
        </div>

        {/* Tab Switcher (O Segredo do Design) */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex relative shadow-2xl">
            <button
              onClick={() => { setActiveTab("content"); setMsg(null); }}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === "content" ? "text-white text-shadow-sm" : "text-gray-400 hover:text-white"}`}
            >
              🎬 Pedir Conteúdo
            </button>
            <button
              onClick={() => { setActiveTab("feedback"); setMsg(null); }}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === "feedback" ? "text-white text-shadow-sm" : "text-gray-400 hover:text-white"}`}
            >
              🛠️ Reportar & Melhorar
            </button>
            
            {/* Pill Animation Background */}
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-lg shadow-red-900/50 transition-transform duration-300 ease-spring ${activeTab === "content" ? "translate-x-0" : "translate-x-full left-1.5"}`} />
          </div>
        </div>

        {msg && (
          <div className={`mx-auto max-w-lg mb-8 p-4 rounded-xl flex items-center gap-4 border animate-in zoom-in duration-300 shadow-xl ${msg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-200" : "bg-red-500/10 border-red-500/20 text-red-200"}`}>
            <span className="text-xl">{msg.type === "success" ? "✅" : "🚨"}</span>
            <p className="font-medium text-sm">{msg.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#0f0f0f]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {activeTab === "content" ? (
            /* --- FORMULÁRIO DE PEDIR CONTEÚDO --- */
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-3 gap-3">
                {["Filme", "Série", "Anime"].map((t) => (
                  <button
                    key={t} type="button" onClick={() => setType(t)}
                    className={`py-4 rounded-xl font-bold text-sm transition-all border ${type === t ? "bg-white text-black border-white shadow-lg scale-[1.02]" : "bg-black/40 text-gray-400 border-white/10 hover:bg-white/5"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="space-y-5">
                <InputGroup label="Nome do Título" value={title} setValue={setTitle} placeholder="Ex: Deadpool & Wolverine" />
                <InputGroup label="Ano (Opcional)" value={year} setValue={setYear} placeholder="Ex: 2024" />
                <TextAreaGroup label="Observações" value={note} setValue={setNote} placeholder="Dublado? Versão Estendida?" />
              </div>
            </div>
          ) : (
            /* --- FORMULÁRIO DE FEEDBACK/BUGS --- */
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-3">
                {["Bug / Erro", "Ideia / Melhoria"].map((t) => (
                  <button
                    key={t} type="button" onClick={() => setType(t)}
                    className={`py-4 rounded-xl font-bold text-sm transition-all border ${type === t ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/30" : "bg-black/40 text-gray-400 border-white/10 hover:bg-white/5"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="space-y-5">
                <InputGroup label="Assunto" value={title} setValue={setTitle} placeholder="Ex: O player não abre no iPhone" />
                <TextAreaGroup label="Descreve o que aconteceu" value={note} setValue={setNote} placeholder="Explica com detalhes para podermos corrigir..." />
              </div>
            </div>
          )}

          <button 
            disabled={loading} 
            className="w-full bg-white text-black hover:bg-gray-200 font-black py-5 rounded-xl text-lg transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {loading ? "A enviar..." : "Enviar ➔"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Componentes Reutilizáveis para Inputs Bonitos
function InputGroup({ label, value, setValue, placeholder }) {
  return (
    <div className="group relative">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest absolute top-3 left-4 transition-all">{label}</label>
      <input 
        value={value} onChange={e=>setValue(e.target.value)} 
        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 pt-7 pb-3 text-white focus:border-white/30 outline-none transition-all placeholder-gray-700 font-medium" 
        placeholder={placeholder} 
      />
    </div>
  )
}

function TextAreaGroup({ label, value, setValue, placeholder }) {
  return (
    <div className="group relative">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest absolute top-3 left-4 transition-all">{label}</label>
      <textarea 
        value={value} onChange={e=>setValue(e.target.value)} 
        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 pt-7 pb-3 text-white focus:border-white/30 outline-none h-32 resize-none transition-all placeholder-gray-700 font-medium" 
        placeholder={placeholder} 
      />
    </div>
  )
}