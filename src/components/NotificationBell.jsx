"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, X, CheckCircle, MessageSquare, AlertCircle, BellOff } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const setupNotifications = async () => {
      // 1. Obter User ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (mounted) setUserId(user.id);

      // 2. Carregar Notificações Iniciais
      await fetchNotifications(user.id);

      // 3. Ativar REALTIME
      const channel = supabase
        .channel('realtime-notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const newNotif = payload.new;
            // Só adiciona se for Global (user_id null) OU para este utilizador
            if (newNotif.user_id === null || newNotif.user_id === user.id) {
              setNotifications(prev => [newNotif, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupNotifications();

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      mounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async (uid) => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`*, notification_actions!left(is_dismissed)`)
      .or(`user_id.eq.${uid},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const active = data.filter(n => 
        !n.notification_actions || 
        n.notification_actions.length === 0 || 
        !n.notification_actions[0].is_dismissed
      );
      setNotifications(active);
      setUnreadCount(active.length);
    }
  };

  const handleDismiss = async (notificationId) => {
    // Atualiza visualmente logo
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (userId) {
      await supabase
        .from('notification_actions')
        .upsert({ user_id: userId, notification_id: notificationId, is_dismissed: true }, { onConflict: 'user_id, notification_id' });
    }
  };

  // NOVA FUNÇÃO: Limpar Tudo
  const handleClearAll = async () => {
    // 1. Limpa visualmente instantaneamente
    const notificationsToClear = [...notifications]; // Cópia para usar no loop
    setNotifications([]);
    setUnreadCount(0);

    if (!userId) return;

    // 2. Envia tudo para o Supabase
    const updates = notificationsToClear.map(n => ({
      user_id: userId,
      notification_id: n.id,
      is_dismissed: true
    }));

    if (updates.length > 0) {
      await supabase
        .from('notification_actions')
        .upsert(updates, { onConflict: 'user_id, notification_id' });
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'report': return <CheckCircle size={14} className="text-green-500" />;
      case 'suggestion': return <MessageSquare size={14} className="text-blue-500" />;
      case 'announcement': return <AlertCircle size={14} className="text-red-500" />;
      default: return <AlertCircle size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-400 hover:text-white transition-all">
        <Bell size={22} />
        
        {/* MELHORIA 1: Animação Ping quando há notificações */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 items-center justify-center text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#121212] border border-white/10 shadow-2xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
          {/* Cabeçalho */}
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Notificações</span>
            
            {/* MELHORIA 2: Botão Limpar Tudo */}
            {notifications.length > 0 ? (
              <button 
                onClick={handleClearAll}
                className="text-[10px] text-gray-400 hover:text-red-400 hover:underline transition-colors font-medium"
              >
                Limpar Tudo
              </button>
            ) : (
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase">0</span>
            )}
          </div>
          
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors group flex gap-3 relative">
                   {n.image_url ? (
                    <img src={n.image_url} alt="Capa" className="w-10 h-14 object-cover rounded bg-white/10 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                      {getIcon(n.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{n.title || 'Aviso'}</h4>
                    </div>
                    <p className="text-xs text-gray-200 mt-1 line-clamp-3 leading-relaxed">{n.message}</p>
                    <span className="text-[9px] text-gray-600 mt-2 block italic">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  {/* Botão X para limpar individualmente */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDismiss(n.id); }} 
                    className="absolute top-3 right-3 text-gray-600 hover:text-white transition-opacity sm:opacity-0 group-hover:opacity-100 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            ) : (
              // MELHORIA 3: Estado Vazio Bonito
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="bg-white/5 p-4 rounded-full mb-3 ring-1 ring-white/10">
                  <BellOff size={24} className="text-gray-500" />
                </div>
                <p className="text-sm text-gray-200 font-medium">Tudo limpo!</p>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                  Vais receber avisos aqui quando houver novidades sobre os teus filmes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}