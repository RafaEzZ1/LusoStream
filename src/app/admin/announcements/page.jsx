"use client";
import { useState, useEffect } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";

export default function AnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);

  // Fetch Anúncios
  useEffect(() => {
    async function load() {
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  // Criar Anúncio
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "announcements"), {
        title,
        message,
        createdAt: serverTimestamp()
      });
      // Atualiza lista localmente
      setList([{ id: docRef.id, title, message }, ...list]);
      setTitle("");
      setMessage("");
      alert("Anúncio publicado!");
    } catch (error) {
      alert("Erro ao publicar");
    }
  };

  // Apagar
  const handleDelete = async (id) => {
    if(!confirm("Apagar este anúncio?")) return;
    await deleteDoc(doc(db, "announcements", id));
    setList(list.filter(item => item.id !== id));
  };

  return (
    <AdminClient>
      <h1 className="text-3xl font-bold text-white mb-8">Gerir Avisos (Sininho)</h1>
      
      {/* Formulário */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
        <form onSubmit={handleCreate} className="space-y-4">
          <input 
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" 
            placeholder="Título (ex: Novos Filmes!)" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
          <textarea 
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white h-24" 
            placeholder="Mensagem..." 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            required 
          />
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold">
            Publicar
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {list.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
            <div>
              <h4 className="text-white font-bold">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.message}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400">Apagar</button>
          </div>
        ))}
      </div>
    </AdminClient>
  );
}