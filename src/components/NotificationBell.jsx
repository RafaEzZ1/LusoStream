"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, X, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // BUSCA DESBLOQUEADA: Traz tudo o que for teu ou global
      // Removemos o filtro de data para garantir que vês as mensagens de teste
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          notification_actions!left (is_dismissed)
        `)
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && isMounted) {
        // Filtra no JavaScript apenas as que tu já "limpaste"
        const active = data.filter(n => 
          !n.notification_actions || 
          n.notification_actions.length === 0 || 
          !n.notification_actions[0].is_dismissed
        );
        
        setNotifications(active);
        setUnreadCount(active.length);
      }
    };

    fetchNotifications();

    // Fechar ao clicar fora
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDismiss = async (notificationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Atualiza visualmente na hora (sem esperar pelo banco)
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // 2. Guarda a ação no banco de dados
    await supabase
      .from('notification_actions')
      .upsert({
        user_id: user.id,
        notification_id: notificationId,
        is_dismissed: true
      }, { onConflict: 'user_id, notification_id' });
  };

  const getIcon = (type) => {
    switch(type) {
      case 'report': return <CheckCircle size={16} className="text-green-500" />;
      case 'suggestion': return <MessageSquare size={16} className="text-blue-500" />;
      case 'announcement': return <AlertCircle size={16} className="text-red-500" />;
      default: return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-all"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#121212] border border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Notificações</span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase">
              {notifications.length} Novas
            </span>
          </div>
          
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors group flex gap-3">
                  {/* Imagem ou Ícone */}
                  {n.image_url ? (
                    <img 
                      src={n.image_url} 
                      alt="Capa" 
                      className="w-10 h-14 object-cover rounded shadow-sm bg-gray-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                      {getIcon(n.type)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        {n.title || 'Sistema'}
                      </span>
                      <button 
                        onClick={() => handleDismiss(n.id)}
                        className="text-gray-600 hover:text-white transition-opacity sm:opacity-0 group-hover:opacity-100 p-1"
                        title="Limpar"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-200 mt-1 leading-relaxed line-clamp-3">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-gray-600 mt-2 block italic">
                      {new Date(n.created_at).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-500 text-xs italic">
                Sem notificações pendentes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}