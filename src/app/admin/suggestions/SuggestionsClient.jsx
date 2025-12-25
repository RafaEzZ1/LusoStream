// src/app/suggestions/SuggestionsClient.jsx
"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/context/AuthModalContext";

export default function SuggestionsClient() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Filme");
  const [message, setMessage] = useState(""); 
  const { user } = useAuth();
  const { openModal } = useAuthModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openModal();
      return;
    }

    try {
      await addDoc(collection(db, "suggestions"), {
        title,
        type,
        userId: user.uid,
        userEmail: user.email,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setMessage("✅ Sugestão enviada! Vamos analisar.");
      setTitle("");
    } catch (error) {
      console.error(error);
      setMessage("❌ Erro ao enviar. Tenta novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 px-4">
      <div className="max-w-2xl mx-auto bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Pedir Conteúdo</h1>
        <p className="text-gray-400 mb-8">Não encontras o filme ou série que queres? Diz-nos!</p>

        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold text-center ${message.includes("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition"
              placeholder="Ex: Dexter, Homem de Ferro..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition"
            >
              <option>Filme</option>
              <option>Série</option>
              <option>Anime</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-purple-900/20"
          >
            Enviar Pedido
          </button>
        </form>
      </div>
    </div>
  );
}