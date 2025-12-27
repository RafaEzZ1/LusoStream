"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, writeBatch } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { FaBell, FaTrash, FaTimes } from "react-icons/fa";
import Image from "next/image";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // QUERY SIMPLES E INFALÍVEL
    // Pede as últimas 50 notificações ordenadas por data.
    // Não usamos 'where' aqui para evitar erros de índice ou permissões bloqueadas.
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // FILTRAGEM INTELIGENTE (NO CLIENTE)
      const myNotifs = allNotifs.filter(n => {
        // 1. Verifica a quem se destina (Global ou Pessoal)
        // Aceita se userId for null (global) ou se for igual ao meu ID
        const isGlobal = !n.userId || n.userId === null;
        const isMine = n.userId === user.uid;
        
        if (!isGlobal && !isMine) return false; // Se for de outra pessoa, esconde.

        // 2. Verifica a Data (O teu requisito: Só receber avisos criados DEPOIS de criar conta)
        // Se fores admin ou não tiveres perfil carregado, mostra tudo por segurança
        if (!profile?.createdAt) return true;

        // Converte as datas do Firebase para objetos de Data normais para comparar
        const notifDate = n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000) : new Date();
        const userJoinDate = profile.createdAt?.seconds ? new Date(profile.createdAt.seconds * 1000) : new Date(0); // Data antiga se falhar

        // Se a notificação é global, só mostra se foi criada DEPOIS de eu me registar
        if (isGlobal) {
           return notifDate >= userJoinDate;
        }

        // Se é pessoal (isMine), mostra sempre
        return true;
      });
      
      setNotifications(myNotifs);
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

    // Apenas apaga as notificações PESSOAIS para não estragar a base de dados
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
                    <p className="text-xs font-bold text-white mb-1 leading-tight truncate flex items-center gap-2">
                       {n.userId === null && <span className="bg-purple-600/50 text-purple-200 text-[8px] px-1 rounded uppercase">Novo</span>}
                       {n.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-3">{n.message}</p>
                    <p className="text-[9px] text-zinc-600 mt-1">
                      {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleDateString() : 'Agora'}
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