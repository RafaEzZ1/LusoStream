"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getUserAndRole, isModOrAdmin } from "@/lib/roles";

export default function AdminSuggestionsClient() {
  const [allowed, setAllowed] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { role } = await getUserAndRole();
      if (!cancel) setAllowed(isModOrAdmin(role));
    })();
    return () => { cancel = true; };
  }, []);

  useEffect(() => {
    if (allowed !== true) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("suggestions")
        .select("id,created_at,category,subject,body,status,email,user_id")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) setMsg({ type: "error", text: error.message });
      setItems(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [allowed]);

  async function updateStatus(id, status) {
    setMsg(null);
    const { error } = await supabase.from("suggestions").update({ status }).eq("id", id);
    if (error) setMsg({ type: "error", text: error.message });
    else setItems((prev) => prev.map((it) => it.id === id ? { ...it, status } : it));
  }

  if (allowed === null) return <p>A validar permissões…</p>;
  if (!allowed) return <p>403 — Sem acesso.</p>;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
      {msg && (
        <div className={`mb-4 text-sm rounded p-3 ${
          msg.type === "error" ? "bg-red-900/50 text-red-200 border border-red-800"
                               : "bg-green-900/40 text-green-200 border border-green-800"
        }`}>{msg.text}</div>
      )}

      {loading ? (
        <p className="text-gray-400">A carregar…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400">Sem sugestões.</p>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">{new Date(s.created_at).toLocaleString()}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs rounded bg-gray-800 border border-gray-700">{s.category}</span>
                <span className={`px-2 py-0.5 text-xs rounded border ${
                  s.status === "open" ? "bg-yellow-900/40 border-yellow-700"
                  : "bg-green-900/40 border-green-700"
                }`}>{s.status}</span>
                <span className="text-xs text-gray-400">por {s.email || s.user_id}</span>
              </div>
              <div className="mt-2 font-semibold">{s.subject}</div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap mt-1">{s.body}</div>

              <div className="mt-3 flex gap-2">
                {s.status !== "closed" && (
                  <button onClick={() => updateStatus(s.id, "closed")} className="bg-gray-800 hover:bg-gray-700 rounded px-3 py-1 text-sm">
                    Fechar
                  </button>
                )}
                {s.status !== "open" && (
                  <button onClick={() => updateStatus(s.id, "open")} className="bg-gray-800 hover:bg-gray-700 rounded px-3 py-1 text-sm">
                    Reabrir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
