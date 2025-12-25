"use client";
import { useEffect, useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from "firebase/firestore";

export default function AdminSuggestionsClient() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const q = query(collection(db, "suggestions"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setSuggestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  const handleStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "suggestions", id), { status: newStatus });
      setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      alert("Erro ao atualizar");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Apagar pedido?")) return;
    try {
      await deleteDoc(doc(db, "suggestions", id));
      setSuggestions(suggestions.filter(s => s.id !== id));
    } catch (error) {
      alert("Erro ao apagar");
    }
  };

  return (
    <AdminClient>
      <h1 className="text-3xl font-bold text-white mb-8">Pedidos dos Utilizadores</h1>
      
      {loading ? <p className="text-white">A carregar...</p> : (
        <div className="grid gap-4">
          {suggestions.map((sug) => (
            <div key={sug.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{sug.title}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{sug.type}</span>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    sug.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                    sug.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {sug.status === 'pending' ? 'Pendente' : sug.status === 'completed' ? 'Adicionado' : 'Rejeitado'}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-2">Pedido por: {sug.userEmail}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleStatus(sug.id, "completed")} className="p-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600/40">✓</button>
                <button onClick={() => handleStatus(sug.id, "rejected")} className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40">✕</button>
                <button onClick={() => handleDelete(sug.id)} className="p-2 bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/40">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminClient>
  );
}