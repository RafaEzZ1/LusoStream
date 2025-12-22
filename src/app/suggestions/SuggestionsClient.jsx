// src/app/suggestions/SuggestionsClient.jsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
// 👇 Importar Modal
import { useAuthModal } from "@/context/AuthModalContext";

export default function SuggestionsClient() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [mySuggestions, setMySuggestions] = useState([]);
  
  // 👇 Usar o Hook
  const { openModal } = useAuthModal();

  useEffect(() => {
    fetchMySuggestions();
  }, []);

  async function fetchMySuggestions() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from("suggestions").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    if (data) setMySuggestions(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    // 👇 SE NÃO TIVER LOGIN, ABRE O POP-UP
    if (!session) {
      setLoading(false);
      openModal();
      return;
    }

    const { data, error } = await supabase
      .from("suggestions")
      .insert({ title, user_id: session.user.id })
      .select()
      .single();

    if (!error && data) {
      setMySuggestions([data, ...mySuggestions]);
      setTitle("");
      // Opcional: Enviar notificação para o Discord/Admin aqui
      try { await fetch("/api/notify-suggestion", { method: "POST", body: JSON.stringify({ title }) }); } catch {}
    } else {
      alert("Erro ao enviar. Tenta mais tarde.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-10">
        <h2 className="text-xl font-bold mb-4">Qual é o filme/série que falta?</h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-red-600 transition"
            placeholder="Ex: Oppenheimer, One Piece..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "..." : "Pedir"}
          </button>
        </form>
      </div>

      <h3 className="text-lg font-bold mb-4 border-l-4 border-gray-700 pl-3">Os teus pedidos</h3>
      {mySuggestions.length === 0 ? (
        <p className="text-gray-500 italic">Ainda não fizeste nenhum pedido.</p>
      ) : (
        <div className="space-y-3">
          {mySuggestions.map((s) => (
            <div key={s.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center border border-gray-800">
              <span className="font-medium text-gray-200">{s.title}</span>
              <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                s.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500' :
                s.status === 'added' ? 'bg-green-900/30 text-green-500' : 'bg-gray-800 text-gray-500'
              }`}>
                {s.status === 'pending' ? 'Pendente' : s.status === 'added' ? 'Adicionado' : s.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}