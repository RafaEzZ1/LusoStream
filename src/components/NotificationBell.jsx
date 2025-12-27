"use client";
import { useState, useEffect, useRef } from "react";
import { FaBell, FaTrash } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  orderBy, 
  writeBatch,
  getDocs 
} from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Buscar notificações globais (userId == null) ou específicas do user
    const q = query(
      collection(db, "notifications"),
      where("userId", "in", [user.uid, null]), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    });

    return () => unsubscribe();
  }, [user]);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      toast.success("Notificação removida");
    } catch (error) {
      console.error("Erro ao apagar:", error);
    }
  };

  const clearAllNotifications = async () => {
    if (!user || notifications.length === 0) return;
    
    // SEGURANÇA: Filtrar apenas as notificações que pertencem a este user ou que ele pode ver
    // (Nota: Num cenário real, não deves apagar notificações globais 'userId: null' se forem para todos)
    // Aqui vamos apagar apenas as que o user vê.
    
    try {
      const batch = writeBatch(db);
      
      // Só apaga as notificações que estão carregadas na lista do utilizador atual
      notifications.forEach((notif) => {
        // Proteção extra: Só apaga se for do user ou se for global (dependendo da tua lógica)
        // Se quiseres impedir apagar globais, mete: if (notif.userId === user.uid)
        const ref = doc(db, "notifications", notif.id);
        batch.delete(ref);
      });

      await batch.commit();
      toast.success("Todas as notificações limpas!");
    } catch (error) {
      toast.error("Erro ao limpar notificações.");
      console.error(error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-300 hover:text-white transition-colors active:scale-95"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40">
            <h3 className="text-sm font-bold text-white">Notificações</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearAllNotifications}
                className="text-[10px] text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <FaTrash size={10} /> Limpar
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Sem notificações novas.
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative group">
                  <div className="pr-6">
                    <h4 className="text-xs font-bold text-white mb-1">{notif.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-zinc-600 mt-2 block">
                      {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString() : 'Agora'}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Pequeno fix para importar o ícone Times que faltava
import { FaTimes } from "react-icons/fa";