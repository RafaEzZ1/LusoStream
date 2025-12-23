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
    const initNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Busca o perfil para saber a data de criação da conta
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

    initNotifications();

    // Fecha o menu ao clicar fora dele
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (profile) => {
    // Busca notificações que:
    // 1. São globais (user_id IS NULL) OU são específicas deste utilizador
    // 2. Foram criadas depois do utilizador se registar
    // 3. NÃO foram marcadas como "dismissed" (limpas) na tabela de ações
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        notification_actions!left (
          is_dismissed
        )
      `)
      .or(`user_id.eq.${profile.user_id},user_id.is.null`)
      .gt('created_at', profile.created_at)
      .order('created_at', { ascending: false });

    if (!error) {
      // Filtrar apenas as que não foram limpas (is_dismissed diferente de true)
      const activeNotifications = data.filter(n => 
        !n.notification_actions || 
        n.notification_actions.length === 0 || 
        !n.notification_actions[0].is_dismissed
      );
      setNotifications(activeNotifications);
      setUnreadCount(activeNotifications.length);
    }
  };

  const handleDismiss = async (notificationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Sincronização entre dispositivos: Regista na DB que esta notificação foi limpa
    const { error } = await supabase
      .from('notification_actions')
      .upsert({
        user_id: user.id,
        notification_id: notificationId,
        is_dismissed: true
      }, { onConflict: 'user_id, notification_id' });

    if (!error) {
      // Remove da lista local imediatamente
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'report':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'suggestion':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'announcement':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#121212] border border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Notificações</h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase">
              {notifications.length} Mensagens
            </span>
          </div>
          
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors group flex gap-3">
                  {/* Imagem da Notificação (Capa do Filme) */}
                  {n.image_url ? (
                    <img 
                      src={n.image_url} 
                      alt="capa" 
                      className="w-10 h-14 object-cover rounded shadow-lg bg-gray-800"
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
                        className="text-gray-600 hover:text-white transition-opacity sm:opacity-0 group-hover:opacity-100"
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
              <div className="p-10 text-center text-gray-500 text-xs">
                Não tens notificações pendentes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}