// src/components/Navbar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hardLogout } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";
const NAV_HEIGHT = 56; // mesma altura da navbar

export default function Navbar() {
  const { user, authLoading } = useAuth();
  const [role, setRole] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef(null);

  // carrega role quando há user
  useEffect(() => {
    let cancelled = false;
    async function loadRole() {
      if (!user) {
        if (!cancelled) setRole(null);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setRole(error ? null : data?.role || "user");
      }
    }
    loadRole();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = role === "admin" || role === "mod";

  async function handleLogout() {
    await hardLogout();
    setMobileOpen(false);
  }

  // pesquisa com debounce
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
          `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(
            query
          )}`
        ),
        fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(
            query
          )}`
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

  // fechar dropdown ao clicar fora / tecla ESC
  useEffect(() => {
    function onClickOutside(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setShowDropdown(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") {
        setShowDropdown(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const displayName = user?.user_metadata?.username || user?.email || "";

  // helper para mobile
  const goMobile = (href) => {
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md z-50 px-4 sm:px-6 h-14 flex items-center justify-between border-b border-gray-800">
        {/* ESQUERDA */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="text-2xl font-bold text-red-600">
            LusoStream
          </Link>
          {/* links desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/movies" className="hover:text-red-500 transition">
              Filmes
            </Link>
            <Link href="/series" className="hover:text-red-500 transition">
              Séries
            </Link>
            <Link href="/animes" className="hover:text-red-500 transition">
              Animes
            </Link>
            <Link href="/suggestions" className="hover:text-red-500 transition">
              Pedidos &amp; Sugestões
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="text-yellow-400 hover:text-yellow-300 transition"
                >
                  Admin
                </Link>
                <Link
                  href="/admin/suggestions"
                  className="text-yellow-400/80 hover:text-yellow-200 transition"
                >
                  Admin Sugestões
                </Link>
              </>
            )}
          </div>
        </div>

        {/* DIREITA DESKTOP */}
        <div className="hidden md:flex items-center gap-4">
          {/* Pesquisa */}
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
              <div className="absolute right-0 mt-2 w-[320px] max-h-72 overflow-auto bg-gray-900 rounded shadow-lg z-50">
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
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 cursor-pointer"
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
                      <div className="font-semibold">{item.title || item.name}</div>
                      <div className="text-xs text-gray-400">
                        {item.type === "movie" ? "Filme" : "Série"}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-2">
                  <button
                    onClick={() => handleSearchSubmit()}
                    className="w-full bg-red-600 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Ver todos os resultados
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <span className="text-sm text-gray-400">…</span>
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
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
              >
                Entrar / Criar Conta
              </Link>
            )}
          </div>
        </div>

        {/* BOTÃO MOBILE */}
        <button
          type="button"
          className="md:hidden w-10 h-10 flex items-center justify-center rounded bg-gray-900/70 border border-gray-700"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* MENU MOBILE */}
      {mobileOpen && (
        <div
          className="md:hidden fixed left-0 right-0 bottom-0 bg-black/95"
          style={{
            top: NAV_HEIGHT, // começa logo por baixo da navbar
            zIndex: 9999, // GARANTE que fica por cima de tudo
          }}
        >
          {/* pesquisa mobile */}
          <form onSubmit={handleSearchSubmit} className="flex px-4 pt-4 gap-2">
            <input
              className="flex-1 p-2 rounded bg-gray-800 placeholder-gray-400 outline-none text-sm text-white"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="bg-red-600 px-3 rounded hover:bg-red-700 text-sm"
            >
              🔍
            </button>
          </form>

          <div className="flex flex-col mt-4">
            <button
              onClick={() => goMobile("/movies")}
              className="text-left py-2 px-4 border-b border-gray-800"
            >
              Filmes
            </button>
            <button
              onClick={() => goMobile("/series")}
              className="text-left py-2 px-4 border-b border-gray-800"
            >
              Séries
            </button>
            <button
              onClick={() => goMobile("/animes")}
              className="text-left py-2 px-4 border-b border-gray-800"
            >
              Animes
            </button>
            <button
              onClick={() => goMobile("/suggestions")}
              className="text-left py-2 px-4 border-b border-gray-800"
            >
              Pedidos &amp; Sugestões
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => goMobile("/admin")}
                  className="text-left py-2 px-4 border-b border-gray-800 text-yellow-300"
                >
                  Admin
                </button>
                <button
                  onClick={() => goMobile("/admin/suggestions")}
                  className="text-left py-2 px-4 border-b border-gray-800 text-yellow-200"
                >
                  Admin Sugestões
                </button>
              </>
            )}
          </div>

          {/* auth mobile */}
          <div className="pt-3 pb-6 px-4 border-t border-gray-800 mt-2">
            {authLoading ? (
              <span className="text-sm text-gray-400">A carregar…</span>
            ) : user ? (
              <>
                <p className="text-sm text-gray-300 mb-2">Olá, {displayName}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => goMobile("/account")}
                    className="flex-1 bg-gray-700 py-2 rounded text-center"
                  >
                    Conta
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 py-2 rounded text-center"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => goMobile("/auth")}
                className="w-full bg-red-600 py-2 rounded text-center"
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
