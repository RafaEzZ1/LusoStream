"use client";
import { useEffect, useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from "firebase/firestore";
import toast from "react-hot-toast";
import { FaCheck, FaTrash, FaClock, FaUser } from "react-icons/fa";

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
        console.error("Erro ao carregar sugestões:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  const handleStatus = async (sug, newStatus) => {
    try {
      // 1. Atualiza o status da sugestão
      await updateDoc(doc(db, "suggestions", sug.id), { status: newStatus });
      
      // 2. Se for resolvida, envia notificação ao utilizador
      if (newStatus === 'completed') {
        await addDoc(collection(db, "notifications"), {
          userId: sug.userId,
          title: "Sugestão Aprovada! 🎉",
          message: `A tua sugestão/reporte ("${sug.text.substring(0, 30)}...") foi resolvida pela nossa equipa. Obrigado pelo feedback!`,
          type: "suggestion_resolved",
          createdAt: serverTimestamp(),
          read: false
        });
        toast.success("Sugestão resolvida e utilizador notificado!");
      }

      setSuggestions(suggestions.map(s => s.id === sug.id ? { ...s, status: newStatus } : s));
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Tens a certeza que queres apagar esta sugestão?")) return;
    try {
      await deleteDoc(doc(db, "suggestions", id));
      setSuggestions(suggestions.filter(s => s.id !== id));
      toast.success("Sugestão removida");
    } catch (error) {
      toast.error("Erro ao apagar");
    }
  };

  return (
    <AdminClient>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white tracking-tighter italic">GESTÃO DE FEEDBACK</h1>
          <p className="text-zinc-500 text-sm">Responde às sugestões e bugs reportados pelos utilizadores.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {suggestions.length === 0 && (
              <p className="text-zinc-600 italic text-center py-10">Ainda não há sugestões para mostrar.</p>
            )}
            {suggestions.map((sug) => (
              <div key={sug.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <FaUser className="text-purple-500" /> {sug.userEmail}
                    </div>
                    <p className="text-white text-sm leading-relaxed italic">"{sug.text}"</p>
                  </div>

                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    sug.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                    sug.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                    'bg-yellow-500/10 text-yellow-500 animate-pulse'
                  }`}>
                    {sug.status === 'pending' ? 'Pendente' : sug.status === 'completed' ? 'Resolvido' : 'Rejeitado'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => handleStatus(sug, "completed")} 
                    disabled={sug.status === 'completed'}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600/10 text-green-500 rounded-xl hover:bg-green-600/20 transition text-xs font-bold disabled:opacity-30"
                  >
                    <FaCheck /> MARCAR RESOLVIDO
                  </button>
                  <button 
                    onClick={() => handleDelete(sug.id)} 
                    className="flex items-center justify-center px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-red-600/20 hover:text-red-500 transition text-xs"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminClient>
  );
}