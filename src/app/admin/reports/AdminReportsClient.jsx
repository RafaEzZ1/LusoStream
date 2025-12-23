// src/app/admin/reports/AdminReportsClient.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserAndRole, isModOrAdmin } from "@/lib/roles";
import AccessDenied from "@/components/AccessDenied";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function AdminReportsClient() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { user, role } = await getUserAndRole();
      if (!active) return;
      if (user && isModOrAdmin(role)) {
        setAuthorized(true);
        fetchReports();
      }
      setChecking(false);
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
          const url = rep.item_type === "movie" 
            ? `https://api.themoviedb.org/3/movie/${rep.item_id}?api_key=${API_KEY}&language=pt-PT` // Mudei para pt-PT para bater certo
            : `https://api.themoviedb.org/3/tv/${rep.item_id}?api_key=${API_KEY}&language=pt-PT`;
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
    // Atualiza no Supabase
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    // Se correr bem, atualiza a lista localmente
    if (!error) {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    }
  }

  async function deleteReport(id) {
    if (!confirm("Tem a certeza que quer apagar este reporte?")) return;
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (!error) setReports((prev) => prev.filter((r) => r.id !== id));
  }

  function getLink(rep) { 
    return rep.item_type === "movie" 
      ? `/watch/movie/${rep.item_id}` 
      : `/watch/series/${rep.item_id}/season/${rep.season}/episode/${rep.episode}`; 
  }

  if (checking) return <div className="p-6 text-white text-center">A verificar permissões...</div>;
  if (!authorized) return <AccessDenied />;

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 transition">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold border-l-4 border-red-600 pl-4">Gestão de Reports</h1>
      </div>

      {loading ? (
        <p className="animate-pulse text-gray-400">A carregar lista de erros...</p>
      ) : reports.length === 0 ? (
        <div className="text-center p-10 bg-gray-900 rounded border border-gray-800">
          <p className="text-xl">Nenhum erro pendente. 🎉</p>
          <p className="text-sm text-gray-500">Bom trabalho!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((rep) => {
            // Verifica se está resolvido (agora procuramos por 'resolved')
            const isResolved = rep.status === "resolved" || rep.status === "fixed"; 

            return (
              <div 
                key={rep.id} 
                className={`p-4 rounded border flex flex-col sm:flex-row gap-4 transition-all ${
                  isResolved 
                    ? "opacity-60 bg-green-900/10 border-green-900/50" 
                    : "bg-gray-900 border-gray-800 hover:border-gray-700"
                }`}
              >
                {rep.poster && (
                  <img src={rep.poster} alt="poster" className="w-16 h-24 object-cover rounded shadow-lg bg-black shrink-0" />
                )}
                
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <h3 className="font-bold text-lg text-white">{rep.contentTitle}</h3>
                     <span className="text-[10px] text-gray-500 uppercase tracking-wider border border-gray-800 px-1 rounded">
                        {rep.item_type}
                     </span>
                   </div>
                   
                   <p className="text-gray-300 text-sm mt-1 bg-black/30 p-2 rounded border border-white/5">
                    "{rep.description}"
                   </p>
                   
                   <div className="flex flex-wrap gap-2 mt-3">
                      <a href={getLink(rep)} target="_blank" className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded text-xs hover:bg-blue-600/30 transition flex items-center gap-1">
                        🔍 Testar Link
                      </a>
                      <button onClick={() => deleteReport(rep.id)} className="text-red-500 bg-red-500/10 px-3 py-1 rounded text-xs hover:bg-red-500/20 transition">
                        🗑️ Apagar
                      </button>
                      <span className="text-xs text-gray-600 flex items-center ml-auto">
                        Reportado por: {rep.user_id?.slice(0,6)}...
                      </span>
                   </div>
                </div>

                <div className="flex flex-col justify-center sm:items-end min-w-[120px]">
                   {/* 👇 AQUI ESTAVA O PROBLEMA: Agora envia "resolved" */}
                   {!isResolved ? (
                     <button 
                       onClick={() => updateStatus(rep.id, "resolved")} 
                       className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded text-sm shadow-lg transition transform hover:scale-105"
                     >
                       ✅ Resolver
                     </button>
                   ) : (
                     <button 
                       onClick={() => updateStatus(rep.id, "pending")} 
                       className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 px-4 py-2 rounded text-sm border border-yellow-600/30 transition"
                     >
                       ↩️ Reabrir
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}