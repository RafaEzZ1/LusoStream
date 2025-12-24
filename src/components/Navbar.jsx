"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import NotificationBell from "@/components/NotificationBell";
import Logo from "@/components/Logo";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

const AVATARS_MAP = {
  ghost: { icon: "👻", color: "bg-purple-600" },
  alien: { icon: "👽", color: "bg-green-600" },
  robot: { icon: "🤖", color: "bg-blue-600" },
  demon: { icon: "😈", color: "bg-red-600" },
  ninja: { icon: "🥷", color: "bg-gray-700" },
  cat:   { icon: "😼", color: "bg-yellow-600" },
  cool:  { icon: "😎", color: "bg-orange-600" },
  king:  { icon: "👑", color: "bg-amber-500" },
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [avatarId, setAvatarId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);
  
  const isAdmin = role === "admin" || role === "mod";
  
  // Obter o nome para mostrar no avatar default
  const displayName = user?.user_metadata?.username || user?.email || "U";

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("avatar_url").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => { if (data) setAvatarId(data.avatar_url); });
    } else {
      setAvatarId(null);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!isAdmin) return;
    async function checkPending() {
      const { count: c1 } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");
      const { count: c2 } = await supabase.from("suggestions").select("*", { count: "exact", head: true }).eq("status", "pending");
      setPendingCount((c1 || 0) + (c2 || 0));
    }
    checkPending();
    const interval = setInterval(checkPending, 60000); 
    return () => clearInterval(interval);
  }, [isAdmin, supabase]);

  useEffect(() => {
    const t = setTimeout(() => { if (searchTerm.trim()) fetchResults(searchTerm); else setResults([]); }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  async function fetchResults(query) {
    try {
      const [m, t] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`).then(r=>r.json()),
        fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`).then(r=>r.json()),
      ]);
      const combined = [
        ...(m.results || []).map((x) => ({ ...x, type: "movie" })),
        ...(t.results || []).map((x) => ({ ...x, type: "tv" })),
      ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      setResults(combined);
      setShowDropdown(true);
    } catch (e) { }
  }

  function handleSearchSubmit(e) {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    setShowDropdown(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    function out(e) { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); }
    document.addEventListener("mousedown", out); return () => document.removeEventListener("mousedown", out);
  }, []);

  const goMobile = (href) => { setMobileOpen(false); router.push(href); };
  
  // Condição para esconder Navbar (apenas Auth e Admin Dashboard completo)
  if (pathname && (pathname.startsWith('/admin') || pathname === '/auth')) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-md z-50 px-4 sm:px-6 h-16 flex items-center justify-between border-b border-gray-800 shadow-lg shadow-black/50">
        <div className="flex items-center gap-6 md:gap-8">
          <Logo />
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-300">
            <Link href="/movies" className="hover:text-white transition">Filmes</Link>
            <Link href="/series" className="hover:text-white transition">Séries</Link>
            <Link href="/suggestions" className="hover:text-white transition">Pedidos</Link>
            {isAdmin && (
              <Link href="/admin" className="relative px-3 py-1 rounded-full text-xs font-bold text-yellow-100 bg-yellow-900/30 border border-yellow-600/30 hover:bg-yellow-900/50 flex items-center gap-2 transition">
                ADMIN {pendingCount > 0 && <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{pendingCount}</span>}
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <div className="relative" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input className="w-32 sm:w-48 lg:w-64 py-2 pl-4 pr-10 rounded-full bg-gray-900 border border-gray-700 text-sm text-white focus:ring-2 focus:ring-red-600 transition-all group-hover:bg-gray-800" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setShowDropdown(true)} />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
            </form>
            {showDropdown && results.length > 0 && (
              <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-auto bg-gray-900 rounded-xl shadow-2xl z-50 border border-gray-700">
                {results.slice(0, 8).map((item) => (
                  <div key={item.id + item.type} onClick={() => { router.push(item.type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`); setShowDropdown(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition">
                    <img src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "/no-image.jpg"} alt={item.title} className="w-10 h-14 object-cover rounded bg-black" />
                    <div className="text-sm overflow-hidden">
                      <div className="font-semibold text-gray-100 truncate">{item.title || item.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{item.type === "movie" ? "Filme" : "Série"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 border-l border-gray-800 pl-4">
            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse"></div>
            ) : user ? (
              <>
                <NotificationBell user={user} />
                <Link href="/account" className="flex items-center gap-2 group relative">
                   {avatarId && AVATARS_MAP[avatarId] ? (
                      <div className={`w-9 h-9 rounded-full ${AVATARS_MAP[avatarId].color} flex items-center justify-center text-lg shadow-lg ring-2 ring-transparent group-hover:ring-white transition transform group-hover:scale-105`}>
                         {AVATARS_MAP[avatarId].icon}
                      </div>
                   ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow ring-2 ring-transparent group-hover:ring-red-500 transition">
                         {displayName.charAt(0).toUpperCase()}
                      </div>
                   )}
                </Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-xs text-gray-400 hover:text-white transition font-medium uppercase tracking-wide">Sair</button>
              </>
            ) : (
              <Link href="/auth" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition shadow-lg shadow-white/10">Entrar</Link>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-4">
          {!authLoading && user && <NotificationBell user={user} />}
          <button type="button" className="p-2 text-gray-300" onClick={() => setMobileOpen((s) => !s)}>
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-20 px-6 animate-in fade-in slide-in-from-top-5 overflow-y-auto">
          <div className="space-y-4 text-lg font-medium text-gray-300 mt-10">
            <button onClick={() => goMobile("/movies")} className="block w-full text-left py-2 border-b border-gray-800">Filmes</button>
            <button onClick={() => goMobile("/series")} className="block w-full text-left py-2 border-b border-gray-800">Séries</button>
            <button onClick={() => goMobile("/suggestions")} className="block w-full text-left py-2 border-b border-gray-800">Pedidos</button>
            {isAdmin && <button onClick={() => goMobile("/admin")} className="block w-full text-left py-2 border-b border-gray-800 text-yellow-400">Painel Admin</button>}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 pb-10">
            {user ? (
              <div className="flex flex-col gap-3">
                 <button onClick={() => goMobile("/account")} className="bg-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2">Minha Conta</button>
                 <button onClick={() => { signOut(); setMobileOpen(false); }} className="bg-red-600 py-3 rounded-xl font-bold text-white">Terminar Sessão</button>
              </div>
            ) : (
              <button onClick={() => goMobile("/auth")} className="w-full bg-white text-black py-4 rounded-xl font-bold">Entrar</button>
            )}
          </div>
        </div>
      )}
    </>
  );
}