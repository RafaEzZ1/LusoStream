"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    // Escuta a coleção 'announcements' em TEMPO REAL
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(5));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Converte o Timestamp do Firebase para Date JS
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      setNotifications(data);
      
      // Se houver notificações recentes (menos de 24h), marca o sininho
      if (data.length > 0) {
        const lastNotif = data[0].createdAt;
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (lastNotif > oneDayAgo) setHasNew(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); setHasNew(false); }}
        className="relative p-2 text-gray-300 hover:text-white transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {hasNew && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-white/10 bg-white/5">
            <h3 className="font-bold text-white text-sm">Novidades LusoStream</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Sem novidades.</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition">
                  <p className="text-white text-sm font-medium">{notif.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                  <span className="text-[10px] text-gray-600 mt-2 block">
                    {notif.createdAt.toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}