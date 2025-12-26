"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { FaBell, FaTrash } from "react-icons/fa";
import Image from "next/image";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    const q = query(
      collection(db, "notifications"),
      where("createdAt", ">=", profile.createdAt), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data.filter(n => !n.userId || n.userId === user.uid));
    });

    return () => unsubscribe();
  }, [user, profile]);

  const clearAllNotifications = async () => {
    if (!user || notifications.length === 0) return;
    if (!confirm("Queres apagar todas as notificações?")) return;

    try {
      const deletePromises = notifications.map(n => deleteDoc(doc(db, "notifications", n.id)));
      await Promise.all(deletePromises);
      setOpen(false);
      toast.success("Notificações limpas!");
    } catch (error) {
      toast.error("Erro ao apagar notificações.");
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-zinc-400 hover:text-white transition focus:outline-none">
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[10px] font-bold flex items-center justify-center rounded-full text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-white/5 font-bold text-xs uppercase tracking-widest text-zinc-500">Notificações</div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                {notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 flex gap-4 items-start transition">
                    {n.movieImage && (
                      <div className="relative w-10 h-14 flex-shrink-0">
                        <Image 
                          src={`https://image.tmdb.org/t/p/w200${n.movieImage}`} 
                          fill 
                          className="object-cover rounded shadow-lg" 
                          alt="poster" 
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white mb-1">{n.title}</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={clearAllNotifications}
                  className="w-full py-4 text-[10px] text-zinc-500 font-black hover:text-red-500 hover:bg-red-500/5 transition-all border-t border-white/5 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <FaTrash size={10} /> Limpar Notificações
                </button>
              </>
            ) : (
              <div className="p-10 text-center text-zinc-600 text-xs italic">Sem notificações novas.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}