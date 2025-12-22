// src/components/WatchlistButton.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
// 👇 1. Importar o Hook do Modal
import { useAuthModal } from "@/context/AuthModalContext";

export default function WatchlistButton({ itemId, itemType }) {
  const [isInList, setIsInList] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 👇 2. Usar o Hook
  const { openModal } = useAuthModal();

  useEffect(() => {
    checkStatus();
  }, [itemId, itemType]);

  async function checkStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("watchlists")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("item_type", itemType)
      .eq("item_id", itemId)
      .maybeSingle();
    
    setIsInList(!!data);
    setLoading(false);
  }

  async function toggleList() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    // 👇 3. AQUI ESTÁ A MUDANÇA!
    // Em vez de alert(...), usamos openModal()
    if (!session) {
      setLoading(false);
      openModal(); 
      return;
    }

    const userId = session.user.id;

    if (isInList) {
      // Remover
      await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("item_id", itemId);
      setIsInList(false);
    } else {
      // Adicionar
      await supabase
        .from("watchlists")
        .insert({ user_id: userId, item_type: itemType, item_id: itemId });
      setIsInList(true);
    }
    setLoading(false);
  }

  // Ícones SVG
  const IconPlus = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
  const IconCheck = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

  return (
    <button
      onClick={toggleList}
      disabled={loading}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded font-bold transition transform hover:scale-105
        ${isInList 
          ? "bg-gray-800 text-green-400 border border-green-500/30 hover:bg-gray-700" 
          : "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-500"}
      `}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : isInList ? (
        <>
          <IconCheck />
          <span>Na Lista</span>
        </>
      ) : (
        <>
          <IconPlus />
          <span>Minha Lista</span>
        </>
      )}
    </button>
  );
}