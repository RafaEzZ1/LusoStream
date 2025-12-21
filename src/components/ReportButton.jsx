// src/components/ReportButton.jsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReportButton({ itemId, itemType, season = null, episode = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [description, setDescription] = useState("");

  async function handleReport() {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Precisas de estar logado para reportar.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      item_id: itemId,
      item_type: itemType,
      season: season,
      episode: episode,
      description: description || "Link não funciona"
    });

    if (error) {
      alert("Erro ao enviar report.");
      console.error(error);
    } else {
      setSent(true);
      setTimeout(() => {
        setIsOpen(false);
        setSent(false);
        setDescription("");
      }, 2000);
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-white text-xs underline decoration-dotted mt-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        ⚠ Reportar erro
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Reportar Problema</h3>
            
            {sent ? (
              <div className="text-green-400 text-center py-4">
                <p className="text-2xl mb-2">✅</p>
                <p>Obrigado! Vamos verificar.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  O vídeo não carrega, está sem som ou com má qualidade?
                </p>
                
                <textarea
                  className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm mb-4 focus:outline-none focus:border-red-600 resize-none"
                  rows="3"
                  placeholder="Descreve o problema (opcional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleReport}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-50 transition-colors"
                  >
                    {loading ? "A enviar..." : "Enviar Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}