// src/app/admin/content/page.jsx
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // <--- NOVO IMPORT
import Link from "next/link";

export default function ContentManager() {
  const supabase = createClient(); // Instância
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      // Exemplo: Buscar embeds recentes (filmes e séries)
      const { data: movies } = await supabase.from("movie_embeds").select("*").limit(20);
      const { data: episodes } = await supabase.from("episode_embeds").select("*").limit(20);
      
      // Combinar apenas para mostrar na lista
      const combined = [
        ...(movies || []).map(m => ({ ...m, type: 'Filme', name: `ID: ${m.movie_id}` })),
        ...(episodes || []).map(e => ({ ...e, type: 'Episódio', name: `ID: ${e.tmdb_id} (S${e.season}E${e.episode})` }))
      ];
      setItems(combined);
      setLoading(false);
    }
    fetchContent();
  }, []);

  return (
    <div className="text-white">
       <h1 className="text-3xl font-bold mb-6 text-red-600">Gestor de Conteúdo</h1>
       <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="mb-4 text-gray-400">Aqui podes ver os últimos embeds adicionados.</p>
          
          {loading ? <p>A carregar...</p> : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between bg-black p-3 rounded border border-gray-800">
                  <span>{item.name}</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{item.type}</span>
                </div>
              ))}
              {items.length === 0 && <p>Sem conteúdo recente.</p>}
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-800">
             <Link href="/admin" className="text-blue-400 hover:text-white">← Voltar ao Dashboard</Link>
          </div>
       </div>
    </div>
  );
}