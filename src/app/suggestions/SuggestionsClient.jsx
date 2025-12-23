// src/app/suggestions/SuggestionsClient.jsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthModal } from "@/context/AuthModalContext";

// Configuração dos Tipos de Pedido
const REQUEST_TYPES = [
  { id: 'conteudo', label: 'Pedir Filme/Série', icon: '🎬', color: 'bg-blue-600', placeholder: 'Ex: Oppenheimer, One Piece...' },
  { id: 'bug', label: 'Reportar Erro', icon: '⚠️', color: 'bg-red-600', placeholder: 'Ex: Episódio 2 da T1 não abre...' },
  { id: 'feature', label: 'Sugestão / Outro', icon: '💡', color: 'bg-purple-600', placeholder: 'Ex: Podiam adicionar modo escuro...' },
];

export default function SuggestionsClient() {
  const [activeType, setActiveType] = useState('conteudo');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // Novo campo opcional
  const [loading, setLoading] = useState(false);
  const [mySuggestions, setMySuggestions] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null); // Feedback visual
  
  const { openModal } = useAuthModal();

  useEffect(() => {
    fetchMySuggestions();
  }, []);

  async function fetchMySuggestions() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { data } = await supabase
      .from("suggestions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
      
    if (data) setMySuggestions(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setSuccessMsg(null);
    
    // 1. Verificar Sessão
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      openModal();
      return;
    }

    // 2. Enviar para o Supabase
    const { data, error } = await supabase
      .from("suggestions")
      .insert([
        { 
          title: title,
          description: description, // Novo
          type: activeType,         // Novo
          user_id: session.user.id 
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro:", error);
      alert("Ocorreu um erro. Tenta novamente.");
    } else {
      setMySuggestions([data, ...mySuggestions]);
      setTitle("");
      setDescription("");
      setSuccessMsg("Recebido! Obrigado pela tua contribuição. 🚀");
      
      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    setLoading(false);
  }

  // Encontrar configuração do tipo atual
  const currentConfig = REQUEST_TYPES.find(t => t.id === activeType);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* COLUNA DA ESQUERDA: FORMULÁRIO */}
      <div className="lg:col-span-2">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          
          {/* Barra de Seleção de Tipo */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {REQUEST_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap
                  ${activeType === type.id 
                    ? `${type.color} text-white shadow-lg` 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                  }
                `}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Principal (Título) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Assunto / Título *</label>
              <input
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-white transition placeholder-gray-600"
                placeholder={currentConfig.placeholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Input Secundário (Descrição) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Detalhes (Opcional)</label>
              <textarea
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-white transition placeholder-gray-600 min-h-[100px] resize-none"
                placeholder="Explica melhor o teu pedido ou descreve o erro..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Botão Submit */}
            <div className="flex items-center justify-between mt-2">
              {successMsg && (
                <span className="text-green-500 text-sm font-bold animate-pulse flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {successMsg}
                </span>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className={`ml-auto ${currentConfig.color} hover:brightness-110 text-white font-bold px-8 py-3 rounded-xl transition transform active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg`}
              >
                {loading ? "A enviar..." : "Enviar Pedido"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* COLUNA DA DIREITA: HISTÓRICO */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Histórico
        </h3>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {mySuggestions.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
              <p>Ainda não tens pedidos.</p>
              <p className="text-sm mt-1">Faz o teu primeiro agora!</p>
            </div>
          ) : (
            mySuggestions.map((s) => {
              // Mapear ícone baseado no tipo guardado
              const typeConfig = REQUEST_TYPES.find(t => t.id === s.type) || REQUEST_TYPES[0];
              
              return (
                <div key={s.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition group animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl" title={typeConfig.label}>{typeConfig.icon}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      s.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      s.status === 'completed' || s.status === 'added' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {s.status === 'pending' ? 'Pendente' : s.status === 'added' ? 'Resolvido' : s.status}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-gray-200 text-sm mb-1">{s.title}</h4>
                  {s.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{s.description}</p>
                  )}
                  
                  <div className="text-[10px] text-gray-600 flex justify-between mt-2 pt-2 border-t border-gray-800">
                    <span>{new Date(s.created_at).toLocaleDateString('pt-PT')}</span>
                    {/* Se quiseres mostrar resposta do admin futuramente, seria aqui */}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}