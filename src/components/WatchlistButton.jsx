"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function WatchlistButton({ itemId, itemType }) {
  const [isInList, setIsInList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 1. Verificar se já está na lista ao carregar
  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("watchlist")
          .select("id")
          .eq("user_id", user.id)
          .eq("item_id", itemId)
          .eq("item_type", itemType)
          .maybeSingle();

        if (data) setIsInList(true);
      }
      setLoading(false);
    }
    checkStatus();
  }, [itemId, itemType]);

  // 2. Função de Adicionar/Remover
  async function toggleList() {
    if (!user) {
      alert("Precisas de ter conta para usar a Minha Lista!");
      return;
    }

    setLoading(true);

    if (isInList) {
      // Remover
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .eq("item_type", itemType);
      
      if (!error) setIsInList(false);
    } else {
      // Adicionar
      const { error } = await supabase
        .from("watchlist")
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_type: itemType
        });
      
      if (!error) setIsInList(true);
    }
    setLoading(false);
  }

  if (loading) return <div className="w-10 h-10 bg-gray-800 rounded animate-pulse" />;

  return (
    <button
      onClick={toggleList}
      className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors border ${
        isInList
          ? "bg-black border-green-500 text-green-500 hover:bg-green-900/20"
          : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
      }`}
    >
      {isInList ? (
        <>
          <span>✓</span>
          <span>Na Lista</span>
        </>
      ) : (
        <>
          <span>+</span>
          <span>Minha Lista</span>
        </>
      )}
    </button>
  );
}