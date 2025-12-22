// src/app/admin/reports/AdminReportsClient.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function AdminReportsClient() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    // Buscar reports ordenados
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Enriquecer com nomes do TMDB
    const enriched = await Promise.all(
      data.map(async (rep) => {
        let title = `ID: ${rep.item_id}`;
        try {
          if (rep.item_type === "movie") {
            const r = await fetch(
              `https://api.themoviedb.org/3/movie/${rep.item_id}?api_key=${API_KEY}&language=pt-BR`
            );
            const d = await r.json();
            if (d.title) title = d.title;
          } else {
            const r = await fetch(
              `https://api.themoviedb.org/3/tv/${rep.item_id}?api_key=${API_KEY}&language=pt-BR`
            );
            const d = await r.json();
            if (d.name) title = d.name;
          }
        } catch (e) {
          console.error("Erro TMDB", e);
        }
        return { ...rep, contentTitle: title };
      })
    );

    setReports(enriched);
    setLoading(false);
  }

  // Marcar como resolvido ou reabrir
  async function updateStatus(id, newStatus) {
    // 👇 AQUI ESTÁ A CORREÇÃO: Atualizamos o 'updated_at' para AGORA
    const { error } = await supabase
      .from("reports")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (!error) {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } else {
      alert("Erro ao atualizar: " + error.message);
    }
  }

  // Apagar report
  async function deleteReport(id) {
    if (!confirm("Tens a certeza que queres apagar este report?")) return;
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (!error) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  }

  function getLink(rep) {
    if (rep.item_type === "movie") {
      return `/watch/movie/${rep.item_id}`;
    } else {
      return `/watch/series/${rep.item_id}/season/${rep.season}/episode/${rep.episode}`;
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="bg-gray-800 hover:bg-gray-700 p-2 rounded transition">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold border-l-4 border-red-600 pl-4">
          Reports de Erros 🚩
        </h1>
      </div>

      {loading ? (
        <p className="text-gray-400 animate-pulse">A carregar reports...</p>
      ) : reports.length === 0 ? (
        <div className="bg-gray-900/50 p-12 rounded-xl text-center border border-gray-800">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-xl font-semibold text-gray-200">Tudo limpo!</p>
          <p className="text-gray-400">Nenhum erro reportado.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className={`p-5 rounded-xl border transition-all ${
                rep.status === "fixed"
                  ? "bg-green-900/10 border-green-900/30 opacity-60 hover:opacity-100"
                  : "bg-gray-900 border-gray-800 hover:border-gray-700 shadow-lg"
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        rep.item_type === "movie"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {rep.item_type === "movie" ? "Filme" : "Série"}
                    </span>
                    <h3 className="font-bold text-lg text-white">
                      {rep.contentTitle}
                    </h3>
                  </div>

                  {rep.item_type === "series" && (
                    <p className="text-sm text-gray-400 mb-3 ml-1">
                      Temporada <span className="text-white font-bold">{rep.season}</span> • 
                      Episódio <span className="text-white font-bold">{rep.episode}</span>
                    </p>
                  )}

                  <div className="bg-black/40 p-3 rounded-lg text-sm text-gray-300 border-l-2 border-red-500/50">
                    "{rep.description || "Sem descrição"}"
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <p className="text-xs text-gray-500">
                      Reportado a: {new Date(rep.created_at).toLocaleString()}
                    </p>
                    {rep.status === "fixed" && (
                      <span className="text-xs text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded">
                        RESOLVIDO
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[160px]">
                  <a
                    href={getLink(rep)}
                    target="_blank"
                    className="flex items-center justify-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded w-full font-medium transition"
                  >
                    🔗 Testar Link
                  </a>

                  {rep.status === "pending" ? (
                    <button
                      onClick={() => updateStatus(rep.id, "fixed")}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full font-bold shadow-lg shadow-green-900/20 transition"
                    >
                      ✔ Resolvido
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(rep.id, "pending")}
                      className="text-sm bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 px-4 py-2 rounded w-full transition"
                    >
                      ↺ Reabrir
                    </button>
                  )}

                  <button
                    onClick={() => deleteReport(rep.id)}
                    className="text-xs text-red-500 hover:text-red-400 mt-2 hover:underline p-1"
                  >
                    Apagar Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}