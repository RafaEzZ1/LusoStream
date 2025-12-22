// src/app/HomeClient.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import HeroSection from "@/components/HeroSection";
import ContinueWatching from "@/components/ContinueWatching";
import MediaRow from "@/components/MediaRow";
import { listContinueWatching } from "@/lib/progress";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function HomeClient() {
  const [continueList, setContinueList] = useState([]);
  const [myList, setMyList] = useState([]); 
  
  // Variáveis de Diagnóstico (Para vermos o erro no ecrã)
  const [status, setStatus] = useState("A carregar...");
  const [userId, setUserId] = useState(null);
  const [dbCount, setDbCount] = useState(0);

  useEffect(() => {
    // 1. OUVIR O LOGIN EM TEMPO REAL (Para não falhar o timing)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (!session?.user) {
        setStatus("Utilizador NÃO detetado (Faz Login!)");
        return;
      }

      setUserId(session.user.id);
      setStatus("Utilizador detetado. A buscar lista...");

      // 2. Carregar Continuar a Ver
      const progressItems = await listContinueWatching(10);
      if (progressItems) setContinueList(progressItems);

      // 3. Carregar Minha Lista (DEBUG ATIVO)
      // Vamos buscar TUDO o que está na tabela watchlists para este user
      const { data: listRows, error } = await supabase
        .from("watchlists")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) {
        setStatus(`ERRO SQL: ${error.message}`);
        return;
      }

      setDbCount(listRows?.length || 0);

      if (listRows && listRows.length > 0) {
        setStatus(`Encontrei ${listRows.length} filmes na BD. A buscar imagens...`);
        
        const enrichedList = await Promise.all(listRows.map(async (row) => {
            try {
              // Converte o tipo para o que o TMDB entende
              // Se na BD estiver 'series' ou 'tv', usa 'tv'. Se for 'movie', usa 'movie'.
              const apiType = (row.item_type === 'movie') ? 'movie' : 'tv';
              
              const res = await fetch(`https://api.themoviedb.org/3/${apiType}/${row.item_id}?api_key=${API_KEY}&language=pt-BR`);
              const tmdb = await res.json();
              
              // Se a API der erro ou não encontrar
              if (!tmdb.id) return null;

              return { ...tmdb, item_type: apiType }; 
            } catch(e) { 
              console.error(e);
              return null; 
            }
        }));

        const final = enrichedList.filter(i => i !== null);
        setMyList(final);
        setStatus(`Sucesso! A mostrar ${final.length} itens.`);
      } else {
        setStatus("A lista na Base de Dados está vazia (0 linhas).");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="pb-24 overflow-x-hidden bg-black">
      
      {/* --- CAIXA DE DEBUG (APAGA ISTO DEPOIS DE FUNCIONAR) --- */}
      <div className="bg-gray-800 border-2 border-red-500 p-4 m-4 rounded text-white text-xs font-mono relative z-50">
        <p className="font-bold text-red-400 mb-1">🔧 MODO DIAGNÓSTICO:</p>
        <p>Estado: {status}</p>
        <p>User ID: {userId || "Nenhum"}</p>
        <p>Itens na BD: {dbCount}</p>
        <p>Itens no Ecrã: {myList.length}</p>
      </div>
      {/* ------------------------------------------------------- */}

      <HeroSection />

      <div className="relative z-20 -mt-10 space-y-2">
        
        {/* Continuar a ver */}
        {continueList.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <ContinueWatching items={continueList} />
          </div>
        )}

        {/* Minha Lista */}
        {myList.length > 0 && (
          <MediaRow title="📂 A Minha Lista" itemsProp={myList} />
        )}

        {/* Resto */}
        <MediaRow title="🔥 Filmes em Alta" endpoint="trending/movie/week?" type="movie" />
        <MediaRow title="📺 Séries do Momento" endpoint="trending/tv/week?" type="tv" />
        <MediaRow title="🎬 Ação & Aventura" endpoint="discover/movie?with_genres=28,12&sort_by=popularity.desc" type="movie" />
        <MediaRow title="😂 Comédia" endpoint="discover/movie?with_genres=35&sort_by=popularity.desc" type="movie" />
        <MediaRow title="🐉 Animação & Anime" endpoint="discover/tv?with_genres=16&sort_by=popularity.desc" type="tv" />
      </div>
    </main>
  );
}