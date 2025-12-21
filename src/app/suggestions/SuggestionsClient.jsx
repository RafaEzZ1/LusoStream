"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";

const CATEGORIES = [
  { value: "pedidos", label: "Pedido de filme/série" },
  { value: "bug", label: "Erro / bug" },
  { value: "melhoria", label: "Sugestão de melhoria" },
  { value: "outro", label: "Outro" },
];

export default function SuggestionsClient() {
  const { user, authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("pedidos");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [mySuggestions, setMySuggestions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // buscar as minhas
  useEffect(() => {
    if (!user) {
      setMySuggestions([]);
      setLoadingList(false);
      return;
    }
    (async () => {
      setLoadingList(true);
      const { data, error } = await supabase
        .from("suggestions")
        .select(
          "id, title, body, category, status, admin_reply, created_at, replied_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setMySuggestions(data || []);
      setLoadingList(false);
    })();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!user) {
      setMsg({ type: "error", text: "Tens de entrar primeiro." });
      return;
    }
    if (!title.trim() || !body.trim()) {
      setMsg({ type: "error", text: "Preenche título e descrição." });
      return;
    }

    setSending(true);

    const { data, error } = await supabase
      .from("suggestions")
      .insert({
        user_id: user.id,
        email: user.email ?? user.user_metadata?.email ?? null,
        title: title.trim(),
        body: body.trim(),
        category,
        status: "pending",
      })
      .select()
      .maybeSingle();

    setSending(false);

    if (error) {
      console.error("erro a inserir sugestão:", error);
      setMsg({
        type: "error",
        text: `Não foi possível enviar a sugestão: ${error.message}`,
      });
      return;
    }

    setMsg({ type: "ok", text: "Sugestão enviada ✅" });
    setTitle("");
    setBody("");
    // mete no topo
    setMySuggestions((prev) => [data, ...prev]);
  }

  if (authLoading) {
    return <p className="text-gray-400">A carregar utilizador…</p>;
  }

  if (!user) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-center">
        <p className="mb-3">Precisas de estar logado para mandar pedidos.</p>
        <a
          href="/auth"
          className="inline-block bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
        >
          Entrar / Criar conta
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Pedidos &amp; Sugestões
        </h1>
        <p className="text-gray-400 text-sm">
          Podes pedir filmes/séries que não estão, ou reportar bugs.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 space-y-4"
      >
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

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-200">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ex: Adicionar 'Breaking Bad'"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-200">Tipo</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-200">Descrição</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="bg-gray-950 border border-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600 resize-y"
            placeholder="Diz o nome completo, ano, temporada, episódio…"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 px-4 py-2 rounded font-semibold"
        >
          {sending ? "A enviar…" : "Enviar sugestão"}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-3">As minhas sugestões</h2>
        {loadingList ? (
          <p className="text-gray-400 text-sm">A carregar…</p>
        ) : mySuggestions.length === 0 ? (
          <p className="text-gray-500 text-sm">Ainda não enviaste nada.</p>
        ) : (
          <div className="space-y-3">
            {mySuggestions.map((sug) => (
              <div
                key={sug.id}
                className="bg-gray-900/30 border border-gray-800 rounded-lg p-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{sug.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      sug.status === "answered"
                        ? "bg-green-900/40 text-green-100"
                        : "bg-yellow-900/40 text-yellow-100"
                    }`}
                  >
                    {sug.status === "answered" ? "Respondido" : "Pendente"}
                  </span>
                </div>
                <p className="text-sm text-gray-200 mt-2 whitespace-pre-line">
                  {sug.body}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(sug.created_at).toLocaleString()}
                  {sug.category ? ` • ${sug.category}` : ""}
                </p>
                {sug.admin_reply ? (
                  <div className="mt-3 bg-black/30 rounded p-2 border border-green-900/30">
                    <p className="text-xs text-gray-400 uppercase mb-1">
                      Resposta do admin
                    </p>
                    <p className="text-sm text-green-100 whitespace-pre-line">
                      {sug.admin_reply}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
