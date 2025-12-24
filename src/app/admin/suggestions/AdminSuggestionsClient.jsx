// src/app/admin/suggestions/AdminSuggestionsClient.jsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // <--- NOVO IMPORT

export default function AdminSuggestionsClient() {
  const supabase = createClient();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    const { data } = await supabase.from("suggestions").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  async function updateStatus(id, st) {
    await supabase.from("suggestions").update({ status: st }).eq("id", id);
    fetchItems();
  }

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6 text-yellow-500">Pedidos & Sugestões</h1>
      {loading ? <p>A carregar...</p> : (
        <div className="space-y-4">
           {items.map(item => (
             <div key={item.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-lg">{item.title}</h3>
                   <p className="text-sm text-gray-400">{item.media_type} • {item.year}</p>
                   {item.note && <p className="text-sm text-gray-500 mt-1 italic">"{item.note}"</p>}
                </div>
                <div className="flex gap-2">
                   {item.status === 'pending' && (
                     <>
                       <button onClick={()=>updateStatus(item.id, 'approved')} className="bg-green-600 px-3 py-1 rounded text-xs">Aprovar</button>
                       <button onClick={()=>updateStatus(item.id, 'rejected')} className="bg-red-600 px-3 py-1 rounded text-xs">Rejeitar</button>
                     </>
                   )}
                   {item.status !== 'pending' && <span className="uppercase text-xs font-bold">{item.status}</span>}
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}