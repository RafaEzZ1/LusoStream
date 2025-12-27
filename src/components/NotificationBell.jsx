"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { FaBell, FaTrash } from "react-icons/fa";
import Image from "next/image";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Só carregamos se tivermos perfil (para saber a data de criação)
    if (!user || !profile?.createdAt) return;

    // A QUERY MÁGICA:
    // 1. createdAt >= profile.createdAt: Só mostra notificações criadas DEPOIS de o user se registar.
    const q = query(
      collection(db, "notifications"),
      where("createdAt", ">=", profile.createdAt), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filtra localmente para garantir que é para mim (userId == meu ID) ou Global (userId == null)
      const myNotifications = data.filter(n => 
        n.userId === user.uid || n.userId === null
      );
      
      setNotifications(myNotifications);
    });

    return () => unsubscribe();
  }, [user, profile]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearMyNotifications = async () => {
    if (!user || notifications.length === 0) return;

    // SEGURANÇA: Só apagar as notificações PESSOAIS.
    // As globais não podem ser apagadas pelo user (para não sumir para os outros).
    const personalNotifs = notifications.filter(n => n.userId === user.uid);

    if (personalNotifs.length === 0) {
      toast("Avisos globais não podem ser apagados aqui.");
      return;
    }

    try {
      const batch = writeBatch(db);
      personalNotifs.forEach(n => {
        batch.delete(doc(db, "notifications", n.id));
      });
      await batch.commit();
      toast.success("Notificações pessoais limpas!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao apagar.");
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-zinc-400 hover:text-white transition focus:outline-none active:scale-95">
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[10px] font-bold flex items-center justify-center rounded-full text-white animate-pulse border border-black">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
            <span className="font-bold text-xs uppercase tracking-widest text-zinc-500">Notificações</span>
            {unreadCount > 0 && (
               <button 
                onClick={clearMyNotifications}
                className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Limpar apenas notificações pessoais"
               >
                 <FaTrash size={10} /> Limpar
               </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 flex gap-4 items-start transition relative group">
                  {n.movieImage ? (
                    <div className="relative w-10 h-14 flex-shrink-0">
                      <Image src={`https://image.tmdb.org/t/p/w200${n.movieImage}`} width={40} height={56} className="object-cover rounded shadow-lg" alt="poster" />
                    </div>
                  ) : (
                    <div className="w-10 h-14 flex-shrink-0 bg-white/10 rounded flex items-center justify-center text-lg">📢</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white mb-1 leading-tight truncate">{n.title}</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-3">{n.message}</p>
                    <p className="text-[9px] text-zinc-600 mt-1">
                      {n.userId === null ? "Global" : "Pessoal"} • {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleDateString() : 'Agora'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-zinc-600 text-xs italic">Sem notificações novas.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}