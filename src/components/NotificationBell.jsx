"use client";
import { useState, useEffect, useRef } from "react";
import { db, dismissNotification } from "@/lib/firebase"; // Importa a nova função
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc, writeBatch } from "firebase/firestore";
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
    if (!user) return;

    // Pedimos as últimas 50 notificações (Globais e Pessoais misturadas)
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // FILTRAGEM INTELIGENTE
      const myNotifs = allNotifs.filter(n => {
        // 1. O utilizador já "apagou" esta notificação global?
        if (profile?.dismissedNotifications?.includes(n.id)) {
          return false; // Esconde
        }

        // 2. É global ou é minha?
        const isGlobal = !n.userId || n.userId === null;
        const isMine = n.userId === user.uid;
        
        if (!isGlobal && !isMine) return false;

        // 3. Verificação de Data (Só mostra avisos criados DEPOIS do registo)
        if (!profile?.createdAt) return true;
        
        const notifDate = n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000) : new Date();
        const userJoinDate = profile.createdAt?.seconds ? new Date(profile.createdAt.seconds * 1000) : new Date(0);

        // Se é global, tem de ser mais recente que o meu registo
        if (isGlobal) {
           return notifDate >= userJoinDate;
        }

        return true;
      });
      
      setNotifications(myNotifs);
    });

    return () => unsubscribe();
  }, [user, profile]); // Atualiza quando o perfil muda (ex: quando apagas uma notificação)

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

  // Lógica de "Apagar" Individual
  const handleDeleteOne = async (n) => {
    try {
      if (n.userId === user.uid) {
        // Se é PESSOAL, apaga mesmo da base de dados
        await deleteDoc(doc(db, "notifications", n.id));
        toast.success("Notificação removida.");
      } else {
        // Se é GLOBAL, apenas "esconde" para este user
        await dismissNotification(user.uid, n.id);
        toast.success("Aviso arquivado.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover.");
    }
  };

  // Limpar Tudo (Apaga as pessoais, esconde as globais)
  const clearAllVisible = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const batch = writeBatch(db);
      const globalsToDismiss = [];

      notifications.forEach(n => {
        if (n.userId === user.uid) {
          // Pessoais: Apagar
          batch.delete(doc(db, "notifications", n.id));
        } else {
          // Globais: Adicionar à lista para esconder
          globalsToDismiss.push(n.id);
        }
      });

      // Executa o apagar das pessoais
      await batch.commit();

      // Executa o esconder das globais (uma a uma ou poderíamos otimizar no futuro)
      if (globalsToDismiss.length > 0) {
        // Nota: O ideal seria fazer um update único, mas aqui fazemos loop por simplicidade
        for (const nid of globalsToDismiss) {
          await dismissNotification(user.uid, nid);
        }
      }

      toast.success("Caixa de entrada limpa!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao limpar.");
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
                onClick={clearAllVisible}
                className="text-[10px] text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
               >
                 <FaTrash size={10} /> Limpar Tudo
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
                  
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-bold text-white mb-1 leading-tight truncate flex items-center gap-2">
                       {n.userId === null && <span className="bg-purple-600/50 text-purple-200 text-[8px] px-1 rounded uppercase">Aviso</span>}
                       {n.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-3">{n.message}</p>
                    <p className="text-[9px] text-zinc-600 mt-1">
                      {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleDateString() : 'Agora'}
                    </p>
                  </div>

                  {/* Botão X para apagar/esconder individualmente */}
                  <button 
                    onClick={() => handleDeleteOne(n)}
                    className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                    title="Remover"
                  >
                    <FaTrash size={10} />
                  </button>
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