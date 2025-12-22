// src/app/admin/reports/AdminReportsClient.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserAndRole, isModOrAdmin } from "@/lib/roles";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function AdminReportsClient() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // 🔒 SEGURANÇA
  useEffect(() => {
    let active = true;
    (async () => {
      const { user, role } = await getUserAndRole();
      if (!active) return;
      if (!user || !isModOrAdmin(role)) {
        router.replace("/");
        return;
      }
      setAuthorized(true);
      fetchReports(); // Só carrega reports se for admin
    })();
    return () => { active = false; };
  }, [router]);

  async function fetchReports() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { setLoading(false); return; }

    const enriched = await Promise.all(
      data.map(async (rep) => {
        let title = `ID: ${rep.item_id}`;
        let poster = null;
        try {
          // Buscar imagem para mostrar no Admin também
          const url = rep.item_type === "movie" 
            ? `https://api.themoviedb.org/3/movie/${rep.item_id}?api_key=${API_KEY}&language=pt-BR`
            : `https://api.themoviedb.org/3/tv/${rep.item_id}?api_key=${API_KEY}&language=pt-BR`;
          const r = await fetch(url);
          const d = await r.json();
          if (d.title || d.name) title = d.title || d.name;
          if (d.poster_path) poster = `https://image.tmdb.org/t/p/w92${d.poster_path}`;
        } catch (e) {}
        return { ...rep, contentTitle: title, poster };
      })
    );
    setReports(enriched);
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase.from("reports").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  }
  async function deleteReport(id) {
    if (!confirm("Apagar?")) return;
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (!error) setReports((prev) => prev.filter((r) => r.id !== id));
  }
  function getLink(rep) { return rep.item_type === "movie" ? `/watch/movie/${rep.item_id}` : `/watch/series/${rep.item_id}/season/${rep.season}/episode/${rep.episode}`; }

  if (!authorized) return null; // Não mostra nada a intrusos

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="bg-gray-800 p-2 rounded">← Voltar</Link>
        <h1 className="text-3xl font-bold border-l-4 border-red-600 pl-4">Reports</h1>
      </div>
      {loading ? <p className="animate-pulse">A carregar...</p> : reports.length === 0 ? <p>Nenhum erro reportado.</p> : (
        <div className="grid gap-4">
          {reports.map((rep) => (
            <div key={rep.id} className={`p-4 rounded border flex gap-4 ${rep.status === "fixed" ? "opacity-50 bg-green-900/10 border-green-900" : "bg-gray-900 border-gray-800"}`}>
              {rep.poster && <img src={rep.poster} className="w-12 h-18 object-cover rounded" />}
              <div className="flex-1">
                 <h3 className="font-bold">{rep.contentTitle}</h3>
                 <p className="text-gray-400 text-sm">{rep.description}</p>
                 <p className="text-xs text-gray-500 mt-2">{new Date(rep.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                 <a href={getLink(rep)} target="_blank" className="bg-gray-800 px-3 py-1 rounded text-sm text-center">Testar</a>
                 {rep.status === "pending" ? <button onClick={() => updateStatus(rep.id, "fixed")} className="bg-green-600 px-3 py-1 rounded text-sm">Resolvido</button> : <button onClick={() => updateStatus(rep.id, "pending")} className="bg-yellow-900/40 text-yellow-500 px-3 py-1 rounded text-sm">Reabrir</button>}
                 <button onClick={() => deleteReport(rep.id)} className="text-red-500 text-xs hover:underline">Apagar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}