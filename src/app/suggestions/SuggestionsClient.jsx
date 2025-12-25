"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/context/AuthModalContext";

export default function SuggestionsClient() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Filme");
  const [message, setMessage] = useState(""); // Mensagem de sucesso/erro
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
      setMessage("✅ Sugestão enviada! Vamos tentar adicionar em breve.");
      setTitle("");
    } catch (error) {
      setMessage("❌ Erro ao enviar. Tenta novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 px-4">
      <div className="max-w-2xl mx-auto bg-[#121212] border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pedir Filmes & Séries</h1>
        <p className="text-gray-400 mb-8">Não encontras o que procuras? Pede aqui.</p>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Filme ou Série</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500"
              placeholder="Ex: Joker 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500"
            >
              <option>Filme</option>
              <option>Série</option>
              <option>Anime</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
          >
            Enviar Pedido
          </button>
        </form>
      </div>
    </div>
  );
}