// src/components/NotificationBell.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    async function fetchNotifs() {
      try {
        // 1. ANÚNCIOS GLOBAIS
        // Nota: Selecionamos explicitamente 'image_url' para garantir que vem
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: announcements } = await supabase
          .from("announcements")
          .select("id, title, link, created_at, image_url") 
          .gte("created_at", sevenDaysAgo.toISOString());

        // Ver quais já li
        const { data: reads } = await supabase
          .from("announcement_reads")
          .select("announcement_id")
          .eq("user_id", user.id);
        
        const readIds = new Set((reads || []).map(r => r.announcement_id));
        const unreadAnnouncements = (announcements || []).filter(a => !readIds.has(a.id));

        // 2. REPORTS RESOLVIDOS
        const { data: reports } = await supabase
          .from("reports")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "fixed")
          .eq("user_viewed", false);

        // Formatar ANÚNCIOS
        const formattedAnnouncements = unreadAnnouncements.map(a => ({
          type: "announcement",
          id: a.id,
          date: new Date(a.created_at),
          text: a.title,
          image: a.image_url, // AQUI: Usa a imagem da base de dados
          link: a.link || "/"
        }));

        // Formatar REPORTS (buscar imagem ao TMDB)
        const formattedReports = await Promise.all((reports || []).map(async (r) => {
           let poster = null;
           try {
             const url = r.item_type === 'movie' 
               ? `https://api.themoviedb.org/3/movie/${r.item_id}?api_key=${API_KEY}&language=pt-BR` 
               : `https://api.themoviedb.org/3/tv/${r.item_id}?api_key=${API_KEY}&language=pt-BR`;
             const res = await fetch(url);
             const d = await res.json();
             if(d.poster_path) poster = `https://image.tmdb.org/t/p/w92${d.poster_path}`;
           } catch(e){}

           return {
             type: "report", 
             id: r.id, 
             date: new Date(r.updated_at),
             text: "Erro resolvido! ✅",
             image: poster,
             link: r.item_type === 'movie' ? `/watch/movie/${r.item_id}` : `/watch/series/${r.item_id}/season/${r.season}/episode/${r.episode}`
           };
        }));

        // Juntar tudo
        const all = [...formattedAnnouncements, ...formattedReports].sort((a, b) => b.date - a.date);
        setNotifications(all);

      } catch (e) { console.error("Erro NotificationBell:", e); }
    }

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function out(e) { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }
    document.addEventListener("mousedown", out); return () => document.removeEventListener("mousedown", out);
  }, []);

  async function handleClick(notif) {
    if (notif.type === "report") await supabase.from("reports").update({ user_viewed: true }).eq("id", notif.id);
    else if (notif.type === "announcement") await supabase.from("announcement_reads").insert({ user_id: user.id, announcement_id: notif.id });
    
    setNotifications(p => p.filter(n => n.id !== notif.id));
    setIsOpen(false);
    if (notif.link) router.push(notif.link);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-300 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {notifications.length > 0 && <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black animate-pulse">{notifications.length}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-3 border-b border-zinc-800 font-semibold text-sm text-white flex justify-between">
            <span>Notificações</span> {notifications.length > 0 && <span className="text-xs text-gray-400">{notifications.length} novas</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? <p className="p-6 text-center text-sm text-gray-500">Sem notificações. 💤</p> : notifications.map((notif) => (
              <button key={notif.type + notif.id} onClick={() => handleClick(notif)} className="w-full text-left p-3 hover:bg-zinc-800 border-b border-zinc-800 last:border-0 transition flex gap-3 items-start group">
                {/* LÓGICA DE IMAGEM */}
                <div className="w-10 h-14 shrink-0 rounded overflow-hidden bg-gray-800 border border-gray-700">
                  {notif.image ? (
                    <img src={notif.image} className="w-full h-full object-cover" alt="poster" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">📢</div>
                  )}
                </div>
                <div>
                   <p className="text-sm text-gray-200 font-medium group-hover:text-white line-clamp-2">{notif.text}</p>
                   <p className="text-xs text-gray-500 mt-1">{notif.date.toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}