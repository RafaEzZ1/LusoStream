"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; // <--- NOVO
import { useRouter } from "next/navigation";

export default function SuggestionsClient() {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Filme");
  const [year, setYear] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    if (!title.trim()) return setMsg({ type: "error", text: "O título é obrigatório." });

    setLoading(true);

    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id,
      title,
      media_type: type,
      year: year || null,
      note: note || null,
      status: "pending"
    });

    setLoading(false);

    if (error) {
      setMsg({ type: "error", text: "Erro ao enviar. Tenta novamente." });
    } else {
      setMsg({ type: "success", text: "Pedido enviado com sucesso!" });
      setTitle(""); setYear(""); setNote("");
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24 px-6 pb-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Pedir Filmes ou Séries</h1>
        <p className="text-gray-400 mb-8">Não encontras o que procuras? Pede aqui e nós adicionamos.</p>

        {msg && (
          <div className={`p-4 rounded mb-6 ${msg.type === "success" ? "bg-green-900/50 text-green-200" : "bg-red-900/50 text-red-200"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-400 mb-2">Título *</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-red-600 outline-none" placeholder="Ex: Matrix" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Tipo</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-red-600 outline-none">
                <option>Filme</option>
                <option>Série</option>
                <option>Anime</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Ano (Opcional)</label>
            <input value={year} onChange={e=>setYear(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-red-600 outline-none" placeholder="Ex: 1999" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Notas Adicionais</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-red-600 outline-none h-24" placeholder="Link IMDB, Temporada específica, etc..." />
          </div>

          <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition">
            {loading ? "A enviar..." : "Enviar Pedido"}
          </button>
        </form>
      </div>
    </div>
  );
}