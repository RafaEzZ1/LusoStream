"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, X } from 'lucide-react';

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, created_at')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(profile);
      if (profile) fetchNotifications(profile);
    };

    loadUserAndNotifications();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (profile) => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`*, notification_actions!left (is_dismissed)`)
      .gt('created_at', profile.created_at)
      .order('created_at', { ascending: false });

    if (!error) {
      const filtered = data.filter(n => 
        !n.notification_actions || n.notification_actions.length === 0 || !n.notification_actions[0].is_dismissed
      );
      setNotifications(filtered);
      setUnreadCount(filtered.length);
    }
  };

  const handleDismiss = async (notificationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('notification_actions')
      .upsert({ user_id: user.id, notification_id: notificationId, is_dismissed: true });

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-300 hover:text-white transition-colors">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#141414] border border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">Notificações</h3>
            <span className="text-[10px] text-gray-500 uppercase font-bold">{notifications.length} Total</span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors group flex gap-3">
                  {n.image_url && (
                    <img src={n.image_url} alt="thumb" className="w-10 h-14 object-cover rounded shadow-md" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">Novo Conteúdo</span>
                      <button onClick={() => handleDismiss(n.id)} className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-200 line-clamp-2 leading-snug mt-1">{n.message}</p>
                    <span className="text-[9px] text-gray-600 mt-2 block italic">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-xs">Tudo limpo por aqui!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}