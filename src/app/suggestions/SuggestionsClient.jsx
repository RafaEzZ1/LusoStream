"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";
import { FaMagic, FaPaperPlane, FaBug, FaFilm, FaTools } from "react-icons/fa";

export default function SuggestionsClient() {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return toast.error("Escreve a tua ideia primeiro!");
    if (!user) return toast.error("Faz login para enviar!");

    setLoading(true);
    try {
      await addDoc(collection(db, "suggestions"), {
        userId: user.uid,
        userEmail: user.email,
        text: suggestion,
        status: "pending", // Estado inicial para o Admin ver
        createdAt: serverTimestamp(),
      });
      toast.success("Mensagem enviada! Obrigado por ajudares o LusoStream.");
      setSuggestion("");
    } catch (error) {
      toast.error("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-0 w-full h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-2xl w-full z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-4">Central de <span className="text-purple-500">Feedback</span></h1>
          <div className="flex justify-center gap-6 text-zinc-500 text-sm mb-6">
            <span className="flex items-center gap-2"><FaFilm/> Pedir Filmes</span>
            <span className="flex items-center gap-2"><FaBug/> Reportar Bug</span>
            <span className="flex items-center gap-2"><FaTools/> Sugerir Funções</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem]">
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Diz-nos o que tens em mente... (ex: 'O player X está lento' ou 'Adicionem a série Y')"
            className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-6 text-white min-h-[200px] focus:ring-2 focus:ring-purple-600 outline-none transition-all resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            {loading ? "A enviar..." : <><FaPaperPlane /> Enviar para a Equipa</>}
          </button>
        </form>
      </div>
    </div>
  );
}