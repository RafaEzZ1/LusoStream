"use client";
import { useState } from "react";
import { db } from "@/lib/firebase"; //
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; //
import { useAuth } from "@/components/AuthProvider"; //
import toast from "react-hot-toast";
import { FaLightbulb, FaPaperPlane, FaMagic } from "react-icons/fa";

export default function SuggestionsClient() {
  const { user } = useAuth(); //
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return toast.error("Escreve algo primeiro!");
    if (!user) return toast.error("Precisas de estar logado!");

    setLoading(true);
    try {
      await addDoc(collection(db, "suggestions"), {
        userId: user.uid,
        userEmail: user.email,
        text: suggestion,
        timestamp: serverTimestamp(),
      });
      toast.success("Sugestão enviada! Obrigado por ajudares o LusoStream.");
      setSuggestion("");
    } catch (error) {
      toast.error("Erro ao enviar. Tenta mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 flex flex-col items-center relative overflow-hidden">
      {/* Efeito de Brilho de Fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="max-w-2xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-purple-600/10 border border-purple-500/20 mb-4">
            <FaMagic className="text-purple-500 text-2xl animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            O Teu Filme, <span className="text-purple-500 font-extrabold italic">A Tua Regra.</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Falta algum conteúdo? Tens ideias para melhorar? Diz-nos o que queres ver.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl">
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Que filme ou série queres ver no LusoStream?"
            className="w-full bg-black/40 border border-zinc-800 rounded-2xl p-6 text-white min-h-[180px] focus:ring-2 focus:ring-purple-600 outline-none transition-all placeholder:text-zinc-600 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-3 shadow-lg shadow-purple-900/40"
          >
            {loading ? "A ENVIAR..." : <><FaPaperPlane /> ENVIAR AGORA</>}
          </button>
        </form>
      </div>
    </div>
  );
}