// src/app/account/AccountClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Lista de Avatares Pré-definidos (Emojis com fundo colorido)
const AVATARS = [
  { id: "ghost", icon: "👻", color: "bg-purple-600" },
  { id: "alien", icon: "👽", color: "bg-green-600" },
  { id: "robot", icon: "🤖", color: "bg-blue-600" },
  { id: "demon", icon: "😈", color: "bg-red-600" },
  { id: "ninja", icon: "🥷", color: "bg-gray-700" },
  { id: "cat", icon: "😼", color: "bg-yellow-600" },
  { id: "cool", icon: "😎", color: "bg-orange-600" },
  { id: "king", icon: "👑", color: "bg-amber-500" },
];

export default function AccountClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  
  // O Avatar agora guarda apenas o ID do avatar escolhido (ex: "ghost")
  const [selectedAvatar, setSelectedAvatar] = useState("ghost");
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      // Carregar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setUsername(profile.username || "");
        // Se o avatar guardado estiver na nossa lista, seleciona-o. Senão, usa o default.
        if (profile.avatar_url && AVATARS.find(a => a.id === profile.avatar_url)) {
          setSelectedAvatar(profile.avatar_url);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [router]);

  async function handleUpdate() {
    setMsg(null);
    if (!username.trim()) return;

    const updates = {
      user_id: user.id,
      username,
      avatar_url: selectedAvatar, // Guardamos o ID (ex: "robot")
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);
    if (error) setMsg({ type: "error", text: "Erro ao atualizar." });
    else {
      setMsg({ type: "ok", text: "Perfil atualizado! 🎉" });
      router.refresh(); // Atualiza a página para refletir mudanças
    }
  }

  if (loading) return <div className="text-white p-10">A carregar...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 text-white border-l-4 border-red-600 pl-4">A Minha Conta</h2>

      {msg && (
        <div className={`mb-6 p-3 rounded ${msg.type === "error" ? "bg-red-900/50 text-red-200" : "bg-green-900/50 text-green-200"}`}>
          {msg.text}
        </div>
      )}

      {/* 1. Escolher Avatar */}
      <div className="mb-8">
        <label className="block text-gray-400 text-sm font-bold mb-3">Escolhe o teu Avatar</label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {AVATARS.map((av) => (
            <button
              key={av.id}
              onClick={() => setSelectedAvatar(av.id)}
              className={`
                aspect-square rounded-full flex items-center justify-center text-2xl transition transform hover:scale-110
                ${av.color}
                ${selectedAvatar === av.id ? "ring-4 ring-white scale-110 shadow-lg shadow-white/20" : "opacity-70 hover:opacity-100"}
              `}
            >
              {av.icon}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Nome de Utilizador */}
      <div className="mb-8">
        <label className="block text-gray-400 text-sm font-bold mb-2">Nome de Utilizador</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-red-600 outline-none transition"
        />
      </div>

      {/* 3. Email (Apenas leitura) */}
      <div className="mb-8 opacity-50">
        <label className="block text-gray-500 text-sm font-bold mb-2">Email</label>
        <div className="w-full bg-black/50 border border-gray-800 rounded-xl p-3 text-gray-400 cursor-not-allowed">
          {user.email}
        </div>
      </div>

      <button
        onClick={handleUpdate}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-900/20"
      >
        Guardar Alterações
      </button>
    </div>
  );
}