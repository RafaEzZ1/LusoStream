// src/components/ReportButton.jsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
// 👇 1. Importar o Modal
import { useAuthModal } from "@/context/AuthModalContext";

export default function ReportButton({ itemId, itemType, season, episode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [sending, setSending] = useState(false);
  
  // 👇 2. Usar o Hook
  const { openModal } = useAuthModal();

  async function handleOpen() {
    const { data: { session } } = await supabase.auth.getSession();
    
    // 👇 3. Se não tiver sessão, abre o Pop-up bonito
    if (!session) {
      openModal();
      return;
    }
    
    setIsOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        setSending(false);
        return;
    }

    const { error } = await supabase.from("reports").insert({
      user_id: session.user.id,
      item_id: Number(itemId),
      item_type: itemType,
      season: season || null,
      episode: episode || null,
      description: desc,
      status: "pending"
    });

    setSending(false);
    if (error) alert("Erro ao enviar report.");
    else {
      alert("Recebido! Vamos verificar.");
      setIsOpen(false);
      setDesc("");
    }
  }

  return (
    <>
      <button 
        onClick={handleOpen}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition mt-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M5 11l7-7 7 7M5 11v8M19 11v8" /></svg>
        <span>Reportar Erro</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-white">Reportar Problema</h3>
            <p className="text-sm text-gray-400 mb-4">O que se passa com este vídeo?</p>
            
            <form onSubmit={handleSubmit}>
              <textarea 
                className="w-full bg-black border border-gray-700 rounded p-3 text-sm text-white mb-4 outline-none focus:border-red-600"
                rows={3}
                placeholder="Ex: O áudio está desfasado / O link não funciona..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                required
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-gray-400 hover:text-white px-3 py-2">Cancelar</button>
                <button type="submit" disabled={sending} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold">
                  {sending ? "A enviar..." : "Enviar Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}