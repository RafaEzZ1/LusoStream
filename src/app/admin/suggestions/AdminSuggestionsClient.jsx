// src/app/admin/suggestions/AdminSuggestionsClient.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";

export default function AdminSuggestionsClient() {
  const { user, authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [replyMap, setReplyMap] = useState({});

  // 1. Verificar se o utilizador é Admin
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      
      // Ajustado para aceitar apenas 'admin' conforme as novas regras
      if (!error && data?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    })();
  }, [user]);

  // 2. Carregar a lista de sugestões
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select("id, user_id, email, title, body, category, status, admin_reply, created_at, replied_at")
        .order("created_at", { ascending: false });
      if (!error) setList(data || []);
    })();
  }, [isAdmin]);

  // 3. Função para Responder e Notificar o Utilizador
  async function handleReply(id, sug) {
    const reply = replyMap[id]?.trim();
    if (!reply) {
      setMsg({ type: "error", text: "Escreve uma resposta primeiro." });
      return;
    }

    // A. Atualizar a Sugestão na tabela 'suggestions'
    const { error: updateError } = await supabase
      .from("suggestions")
      .update({
        admin_reply: reply,
        status: "answered",
        replied_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setMsg({ type: "error", text: `Erro a responder: ${updateError.message}` });
      return;
    }

    // B. Criar Notificação Direta para o Utilizador na nova tabela
    await supabase.from("notifications").insert([
      {
        user_id: sug.user_id,
        title: "Resposta ao teu Pedido! 🎬",
        message: `O teu pedido "${sug.title}" foi respondido pelo Admin: ${reply}`,
        link: "/suggestions"
      },
    ]);

    // C. Atualizar o estado local para refletir a mudança no ecrã
    setList((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, admin_reply: reply, status: "answered", replied_at: new Date().toISOString() }
          : s
      )
    );

    setMsg({ type: "ok", text: "Resposta guardada e utilizador notificado! ✅" });
  }

  if (authLoading || loading) return <p className="p-10 text-gray-400">A validar permissões…</p>;
  if (!isAdmin) return <p className="p-10 text-red-300">Acesso negado.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-red-600">Gestão de Sugestões</h1>

      {msg && (
        <div className={`rounded px-4 py-3 text-sm animate-in fade-in ${
          msg.type === "ok" ? "bg-green-900/30 border border-green-700 text-green-200" : "bg-red-900/30 border border-red-700 text-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      <div className="space-y-4">
        {list.map((sug) => (
          <div key={sug.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 transition hover:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">{sug.category}</p>
                <h2 className="text-lg font-bold text-white">{sug.title}</h2>
                <p className="text-sm text-gray-400">{sug.email}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                sug.status === "answered" ? "bg-green-600/20 text-green-500" : "bg-yellow-600/20 text-yellow-500"
              }`}>
                {sug.status === "answered" ? "Respondido" : "Pendente"}
              </span>
            </div>

            <p className="text-gray-300 bg-black/40 p-3 rounded-lg text-sm mb-4 border border-gray-800 italic">
              "{sug.body}"
            </p>

            <div className="space-y-3">
              <textarea
                rows={3}
                defaultValue={sug.admin_reply || ""}
                onChange={(e) => setReplyMap((prev) => ({ ...prev, [sug.id]: e.target.value }))}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white outline-none focus:ring-2 focus:ring-red-600 transition"
                placeholder="Escreve aqui a resposta que o utilizador vai receber..."
              />
              <button
                onClick={() => handleReply(sug.id, sug)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-red-900/20"
              >
                Guardar Resposta e Notificar
              </button>
            </div>
            
            {sug.replied_at && (
              <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest text-right">
                Respondido em {new Date(sug.replied_at).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}