// src/components/NotificationBell.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Buscar notificações
  useEffect(() => {
    if (!user) return;

    async function fetchNotifs() {
      // 1. Reports Resolvidos e não vistos
      const { data: reports } = await supabase
        .from("reports")
        .select("id, item_id, item_type, season, episode, updated_at")
        .eq("user_id", user.id)
        .eq("status", "fixed")
        .eq("user_viewed", false);

      // 2. Sugestões Respondidas e não vistas
      const { data: suggestions } = await supabase
        .from("suggestions")
        .select("id, title, admin_reply, updated_at")
        .eq("user_id", user.id)
        .neq("admin_reply", null) // tem resposta
        .eq("user_viewed", false);

      // Formatar tudo numa lista única
      const formattedReports = (reports || []).map(r => ({
        type: "report",
        id: r.id,
        date: new Date(r.updated_at),
        text: "O erro que reportaste foi resolvido! ✅",
        link: r.item_type === 'movie' 
          ? `/watch/movie/${r.item_id}` 
          : `/watch/series/${r.item_id}/season/${r.season}/episode/${r.episode}`
      }));

      const formattedSuggestions = (suggestions || []).map(s => ({
        type: "suggestion",
        id: s.id,
        date: new Date(s.updated_at),
        text: `Nova resposta à sugestão: "${s.title}" 💬`,
        link: "/suggestions"
      }));

      // Juntar e ordenar por data
      const all = [...formattedReports, ...formattedSuggestions].sort((a, b) => b.date - a.date);
      setNotifications(all);
    }

    fetchNotifs();
    // Verificar a cada 60 segundos
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Fechar ao clicar fora
  useEffect(() => {
    function out(e) { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }
    document.addEventListener("mousedown", out); return () => document.removeEventListener("mousedown", out);
  }, []);

  // Marcar como lida e ir para o link
  async function handleClick(notif) {
    // Atualizar na base de dados
    if (notif.type === "report") {
      await supabase.from("reports").update({ user_viewed: true }).eq("id", notif.id);
    } else {
      await supabase.from("suggestions").update({ user_viewed: true }).eq("id", notif.id);
    }

    // Atualizar localmente (remover da lista)
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    setIsOpen(false);
    
    // Ir para a página
    router.push(notif.link);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-zinc-800 font-semibold text-sm text-white">
            Notificações
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">
                Sem notificações novas. 💤
              </p>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.type + notif.id}
                  onClick={() => handleClick(notif)}
                  className="w-full text-left p-3 hover:bg-zinc-800 border-b border-zinc-800 last:border-0 transition flex flex-col gap-1"
                >
                  <p className="text-sm text-gray-200 font-medium">
                    {notif.text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notif.date.toLocaleDateString()} às {notif.date.getHours()}:{String(notif.date.getMinutes()).padStart(2, '0')}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}