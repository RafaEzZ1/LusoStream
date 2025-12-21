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
  const [replyMap, setReplyMap] = useState({}); // id -> texto

  // ver se é admin
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
      if (!error && data?.role && ["admin", "mod"].includes(data.role)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    })();
  }, [user]);

  // carregar sugestões
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select(
          "id, user_id, email, title, body, category, status, admin_reply, created_at, replied_at"
        )
        .order("created_at", { ascending: false });
      if (!error) setList(data || []);
    })();
  }, [isAdmin]);

  async function handleReply(id) {
    const reply = replyMap[id]?.trim();
    if (!reply) {
      setMsg({ type: "error", text: "Escreve uma resposta primeiro." });
      return;
    }

    // atualiza no supabase
    const { error } = await supabase
      .from("suggestions")
      .update({
        admin_reply: reply,
        status: "answered",
        replied_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("erro a responder:", error);
      setMsg({ type: "error", text: `Erro a responder: ${error.message}` });
      return;
    }

    // atualiza no estado
    setList((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, admin_reply: reply, status: "answered", replied_at: new Date().toISOString() }
          : s
      )
    );

    setMsg({ type: "ok", text: "Resposta guardada ✅ (e-mail depende do backend)" });
  }

  if (authLoading || loading) {
    return <p className="text-gray-400">A validar permissões…</p>;
  }

  if (!isAdmin) {
    return <p className="text-red-300">Sem acesso.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Sugestões dos utilizadores</h1>

      {msg && (
        <div
          className={`rounded px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "bg-green-900/30 border border-green-700 text-green-200"
              : "bg-red-900/30 border border-red-700 text-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-gray-400">Ainda não há sugestões.</p>
      ) : (
        <div className="space-y-4">
          {list.map((sug) => (
            <div key={sug.id} className="bg-gray-900/40 border border-gray-800 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm text-gray-400">
                    {sug.email ? sug.email : sug.user_id}
                  </p>
                  <h2 className="text-lg font-semibold">{sug.title}</h2>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    sug.status === "answered"
                      ? "bg-green-900/40 text-green-200"
                      : "bg-yellow-900/40 text-yellow-200"
                  }`}
                >
                  {sug.status === "answered" ? "Respondido" : "Pendente"}
                </span>
              </div>

              <p className="text-sm text-gray-200 whitespace-pre-line mb-2">
                {sug.body}
              </p>

              <p className="text-xs text-gray-500 mb-3">
                {new Date(sug.created_at).toLocaleString()} • {sug.category}
              </p>

              <div className="space-y-2">
                <textarea
                  rows={3}
                  defaultValue={sug.admin_reply || ""}
                  onChange={(e) =>
                    setReplyMap((prev) => ({ ...prev, [sug.id]: e.target.value }))
                  }
                  className="w-full bg-black/30 border border-gray-700 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Resposta para o utilizador…"
                />
                <button
                  onClick={() => handleReply(sug.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold"
                >
                  Guardar resposta
                </button>
              </div>

              {sug.admin_reply ? (
                <p className="text-xs text-gray-400 mt-2">
                  Última resposta:{" "}
                  {sug.replied_at
                    ? new Date(sug.replied_at).toLocaleString()
                    : "agora"}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
