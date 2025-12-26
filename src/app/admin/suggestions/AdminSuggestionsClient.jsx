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
        // Mudamos para buscar todas sem erro de campo inexistente
        const q = query(collection(db, "suggestions")); 
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Ordenação manual se o createdAt falhar
        setSuggestions(data.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Erro Admin:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await updateDoc(doc(db, "suggestions", id), { status });
      setSuggestions(suggestions.map(s => s.id === id ? { ...s, status } : s));
    } catch (e) { alert("Erro ao atualizar"); }
  };

  return (
    <AdminClient>
      <h1 className="text-3xl font-bold mb-8">Feedback dos Users</h1>
      <div className="grid gap-4">
        {suggestions.length === 0 && <p className="text-zinc-500">Nenhuma sugestão encontrada.</p>}
        {suggestions.map((sug) => (
          <div key={sug.id} className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-500">{sug.userEmail}</span>
                <p className="text-white mt-2 leading-relaxed">{sug.text}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                sug.status === 'done' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {sug.status === 'done' ? 'Resolvido' : 'Pendente'}
              </span>
            </div>
            <div className="flex gap-2 border-t border-white/5 pt-4">
              <button onClick={() => handleAction(sug.id, 'done')} className="text-xs bg-green-600/20 text-green-500 px-4 py-2 rounded-lg hover:bg-green-600/30">Marcar como Visto</button>
              <button onClick={async () => {
                if(confirm("Apagar?")) {
                  await deleteDoc(doc(db, "suggestions", sug.id));
                  setSuggestions(suggestions.filter(x => x.id !== sug.id));
                }
              }} className="text-xs bg-red-600/20 text-red-500 px-4 py-2 rounded-lg hover:bg-red-600/30">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </AdminClient>
  );
}