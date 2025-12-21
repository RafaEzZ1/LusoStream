// src/components/Navbar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hardLogout } from "@/lib/supabaseClient";
// Agora importa do ficheiro que acabámos de corrigir
import { useAuthRole } from "@/hooks/useAuthRole";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";
const NAV_HEIGHT = 56;

export default function Navbar() {
  // Usa o hook novo que traz user e role de uma vez
  const { user, role, loading: authLoading } = useAuthRole();
  const isAdmin = role === "admin" || role === "mod";

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const router = useRouter();
  const dropdownRef = useRef(null);

  // --- LÓGICA DE NOTIFICAÇÃO ADMIN ---
  useEffect(() => {
    async function checkPending() {
      if (!isAdmin) return;
      
      const { count: reportsCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: suggestionsCount } = await supabase
        .from("suggestions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setPendingCount((reportsCount || 0) + (suggestionsCount || 0));
    }

    if (user && isAdmin) {
      checkPending();
      const interval = setInterval(checkPending, 60000); // Verifica a cada minuto
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  // --- LÓGICA DE PESQUISA ---
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchTerm.trim()) fetchResults(searchTerm);
      else setResults([]);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  async function fetchResults(query) {
    try {
      const [movieRes, tvRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
        ),
        fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
        ),
      ]);

      const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);
      const combined = [
        ...(movieData.results || []).map((m) => ({ ...m, type: "movie" })),
        ...(tvData.results || []).map((t) => ({ ...t, type: "tv" })),
      ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      setResults(combined);
      setShowDropdown(true);
    } catch (err) {
      console.error("Erro na pesquisa:", err);
    }
  }

  function handleSearchSubmit(e) {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    setShowDropdown(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await hardLogout();
    setMobileOpen(false);
  }

  const displayName = user?.user_metadata?.username || user?.email || "";
  const goMobile = (href) => {
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md z-50 px-4 sm:px-6 h-14 flex items-center justify-between border-b border-gray-800">
        {/* ESQUERDA */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="text-2xl font-bold text-red-600 tracking-tighter">
            LusoStream
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/movies" className="hover:text-red-500 transition">Filmes</Link>
            <Link href="/series" className="hover:text-red-500 transition">Séries</Link>
            <Link href="/animes" className="hover:text-red-500 transition">Animes</Link>
            <Link href="/suggestions" className="hover:text-red-500 transition">Pedidos</Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="relative px-3 py-1 rounded text-sm font-bold text-yellow-100 bg-yellow-900/20 border border-yellow-700/50 hover:bg-yellow-900/40 flex items-center gap-2 transition"
              >
                Admin
                {pendingCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-black animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* DIREITA */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                className="w-40 sm:w-56 md:w-72 p-2 rounded-l bg-gray-800 placeholder-gray-400 outline-none text-sm text-white focus:ring-2 focus:ring-red-600"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowDropdown(true)}
              />
              <button type="submit" className="bg-red-600 px-3 rounded-r hover:bg-red-700">
                🔍
              </button>
            </form>

            {showDropdown && results.length > 0 && (
              <div className="absolute right-0 mt-2 w-[320px] max-h-72 overflow-auto bg-gray-900 rounded shadow-lg z-50 border border-gray-700">
                {results.slice(0, 8).map((item) => (
                  <div
                    key={item.id + item.type}
                    onClick={() => {
                      router.push(
                        item.type === "movie"
                          ? `/movies/${item.id}`
                          : `/series/${item.id}`
                      );
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800/50"
                  >
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                          : "/no-image.jpg"
                      }
                      alt={item.title || item.name}
                      className="w-10 h-14 object-cover rounded"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-100">{item.title || item.name}</div>
                      <div className="text-xs text-gray-400">
                        {item.type === "movie" ? "Filme" : "Série"}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-2 sticky bottom-0 bg-gray-900 border-t border-gray-700">
                  <button
                    onClick={() => handleSearchSubmit()}
                    className="w-full bg-red-600 py-2 rounded text-sm hover:bg-red-700 text-white font-semibold"
                  >
                    Ver todos os resultados
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <Link
                  href="/account"
                  className="text-sm text-gray-300 hover:text-white underline-offset-2 hover:underline max-w-[160px] truncate"
                  title={displayName}
                >
                  {displayName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded hover:bg-zinc-700 text-sm transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-red-600 px-4 py-1.5 rounded hover:bg-red-700 text-sm font-semibold transition"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>

        {/* MOBILE */}
        <button
          type="button"
          className="md:hidden w-10 h-10 flex items-center justify-center rounded bg-gray-900/70 border border-gray-700"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {mobileOpen && (
        <div
          className="md:hidden fixed left-0 right-0 bottom-0 bg-black/95 backdrop-blur-xl"
          style={{ top: NAV_HEIGHT, zIndex: 9999 }}
        >
          <form onSubmit={handleSearchSubmit} className="flex px-4 pt-4 gap-2">
            <input
              className="flex-1 p-3 rounded bg-gray-800 placeholder-gray-400 outline-none text-sm text-white border border-gray-700 focus:border-red-600"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="bg-red-600 px-4 rounded hover:bg-red-700 text-sm font-bold"
            >
              🔍
            </button>
          </form>

          <div className="flex flex-col mt-6 space-y-1">
            <button onClick={() => goMobile("/movies")} className="text-left py-3 px-6 border-b border-gray-800 text-lg">Filmes</button>
            <button onClick={() => goMobile("/series")} className="text-left py-3 px-6 border-b border-gray-800 text-lg">Séries</button>
            <button onClick={() => goMobile("/animes")} className="text-left py-3 px-6 border-b border-gray-800 text-lg">Animes</button>
            <button onClick={() => goMobile("/suggestions")} className="text-left py-3 px-6 border-b border-gray-800 text-lg">Pedidos</button>

            {isAdmin && (
              <button
                onClick={() => goMobile("/admin")}
                className="text-left py-3 px-6 border-b border-gray-800 text-yellow-300 font-bold flex justify-between items-center"
              >
                Painel Admin
                {pendingCount > 0 && (
                   <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                     {pendingCount} novos
                   </span>
                )}
              </button>
            )}
          </div>

          <div className="absolute bottom-10 left-4 right-4">
            {authLoading ? (
              <p className="text-center text-gray-500">A carregar...</p>
            ) : user ? (
              <div className="flex gap-3">
                <button
                  onClick={() => goMobile("/account")}
                  className="flex-1 bg-gray-800 py-3 rounded text-center font-semibold border border-gray-700"
                >
                  Minha Conta
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 py-3 rounded text-center font-semibold text-white"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => goMobile("/auth")}
                className="w-full bg-red-600 py-3 rounded text-center font-bold text-white shadow-lg shadow-red-900/30"
              >
                Entrar / Criar Conta
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}