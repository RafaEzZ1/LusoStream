"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, X, Check } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const loadUserAndNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar a data de criação do perfil do utilizador
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, created_at')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(profile);
      if (profile) {
        fetchNotifications(profile);
      }
    };

    loadUserAndNotifications();

    // Fechar menu ao clicar fora
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (profile) => {
    if (!profile) return;

    // Busca notificações:
    // 1. Criadas após o utilizador se registar
    // 2. Que não foram marcadas como 'dismissed' (através de um LEFT JOIN)
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        notification_actions!left (
          is_dismissed
        )
      `)
      .gt('created_at', profile.created_at)
      .order('created_at', { ascending: false });

    if (!error) {
      // Filtrar no lado do cliente apenas as que não têm is_dismissed = true
      const filtered = data.filter(n => 
        !n.notification_actions || n.notification_actions.length === 0 || !n.notification_actions[0].is_dismissed
      );
      setNotifications(filtered);
      setUnreadCount(filtered.filter(n => !n.is_read).length);
    }
  };

  const handleDismiss = async (notificationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Inserir ou atualizar na tabela de ações para esconder a notificação
    const { error } = await supabase
      .from('notification_actions')
      .upsert({
        user_id: user.id,
        notification_id: notificationId,
        is_dismissed: true
      }, { onConflict: 'user_id, notification_id' });

    if (!error) {
      // Remover da lista local imediatamente
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    // Aqui podes manter a tua lógica de mark as read ou usar a nova tabela de ações
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => { setIsOpen(!isOpen); markAllAsRead(); }}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#141414] border border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white">Notificações</h3>
            <span className="text-xs text-gray-500">{notifications.length} mensagens</span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors group relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                      {n.type || 'Aviso'}
                    </span>
                    <button 
                      onClick={() => handleDismiss(n.id)}
                      className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-200 leading-snug pr-4">{n.message}</p>
                  <span className="text-[10px] text-gray-500 mt-2 block">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">Não tens novas notificações.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}