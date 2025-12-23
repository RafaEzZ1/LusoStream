"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, X, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at, user_id')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(profile);
      if (profile) fetchNotifications(profile);
    };

    init();

    // Fechar ao clicar fora
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (profile) => {
    // Busca notificações globais (user_id is null) ou específicas do user
    // E filtra as que já foram "limpas" na tabela notification_actions
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        notification_actions!left (is_dismissed)
      `)
      .or(`user_id.eq.${profile.user_id},user_id.is.null`)
      .gt('created_at', profile.created_at)
      .order('created_at', { ascending: false });

    if (!error) {
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
    const { data: { user } } = await supabase.auth.getUser();
    
    // Isto sincroniza entre dispositivos: guarda no banco que ESTA notificação foi limpa por ESTE user
    const { error } = await supabase
      .from('notification_actions')
      .upsert({ 
        user_id: user.id, 
        notification_id: notificationId, 
        is_dismissed: true 
      }, { onConflict: 'user_id, notification_id' });

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'report': return <CheckCircle size={14} className="text-green-500" />;
      case 'suggestion': return <MessageSquare size={14} className="text-blue-500" />;
      default: return <AlertCircle size={14} className="text-red-500" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-400 hover:text-white transition-all">
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
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase">{notifications.length}</span>
          </div>
          
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors group flex gap-3">
                  {n.image_url ? (
                    <img src={n.image_url} alt="thumb" className="w-10 h-14 object-cover rounded bg-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                      {getIcon(n.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{n.title || 'Aviso'}</h4>
                      <button onClick={() => handleDismiss(n.id)} className="text-gray-600 hover:text-white transition-opacity sm:opacity-0 group-hover:opacity-100">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-200 mt-1 line-clamp-3 leading-relaxed">{n.message}</p>
                    <span className="text-[9px] text-gray-600 mt-2 block">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-500 text-xs italic">Não há novas notificações.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}