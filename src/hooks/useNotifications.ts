import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  profile_id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  metadata: Record<string, any>;
}

export interface NotificationPreference {
  id: string;
  profile_id: string;
  category: string;
  event_type: string;
  in_app: boolean;
  email: boolean;
}

export const NOTIFICATION_CATEGORIES = {
  conexoes: {
    label: 'Conexões',
    events: [
      { type: 'connection_request', label: 'Novo pedido de conexão' },
      { type: 'connection_accepted', label: 'Conexão aceita' },
      { type: 'connection_rejected', label: 'Conexão recusada' },
      { type: 'connection_removed', label: 'Conexão removida' },
    ],
  },
  feed: {
    label: 'Feed / Publicações',
    events: [
      { type: 'new_post', label: 'Nova publicação de conexão' },
      { type: 'post_like', label: 'Curtida em publicação' },
      { type: 'post_comment', label: 'Comentário em publicação' },
      { type: 'post_mention', label: 'Menção ao usuário' },
    ],
  },
  projetos: {
    label: 'Projetos',
    events: [
      { type: 'project_created', label: 'Projeto criado' },
      { type: 'project_shared', label: 'Projeto compartilhado' },
      { type: 'stage_update', label: 'Atualização de etapa' },
      { type: 'stage_completed', label: 'Conclusão de etapa' },
      { type: 'stage_comment', label: 'Comentário em etapa' },
      { type: 'deadline_approaching', label: 'Prazo próximo' },
      { type: 'deadline_passed', label: 'Prazo ultrapassado' },
    ],
  },
  perfil: {
    label: 'Perfil',
    events: [
      { type: 'permission_change', label: 'Alteração de permissões' },
      { type: 'profile_update', label: 'Atualização de perfil' },
      { type: 'access_request', label: 'Solicitação de acesso' },
    ],
  },
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfileId();
    }
  }, [user]);

  useEffect(() => {
    if (profileId) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [profileId]);

  const fetchProfileId = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setProfileId(data.id);
    }
  };

  const fetchNotifications = async () => {
    if (!profileId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifs = (data || []) as Notification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!profileId) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notifications
          toast(newNotification.title, {
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!profileId) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('profile_id', profileId)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearOldNotifications = async (daysOld: number = 30) => {
    if (!profileId) return;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('profile_id', profileId)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      await fetchNotifications();
      toast.success(`Notificações antigas removidas`);
    } catch (error) {
      console.error('Error clearing old notifications:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    profileId,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications,
    refetch: fetchNotifications,
  };
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfileId();
    }
  }, [user]);

  useEffect(() => {
    if (profileId) {
      fetchPreferences();
    }
  }, [profileId]);

  const fetchProfileId = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setProfileId(data.id);
    }
  };

  const fetchPreferences = async () => {
    if (!profileId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      setPreferences((data || []) as NotificationPreference[]);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPreference = (category: string, eventType: string) => {
    return preferences.find(
      p => p.category === category && p.event_type === eventType
    ) || { in_app: true, email: false };
  };

  const updatePreference = async (
    category: string,
    eventType: string,
    inApp: boolean,
    email: boolean
  ) => {
    if (!profileId) return;

    try {
      const existing = preferences.find(
        p => p.category === category && p.event_type === eventType
      );

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences')
          .update({ in_app: inApp, email, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({
            profile_id: profileId,
            category,
            event_type: eventType,
            in_app: inApp,
            email,
          });

        if (error) throw error;
      }

      await fetchPreferences();
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Erro ao atualizar preferência');
    }
  };

  return {
    preferences,
    loading,
    getPreference,
    updatePreference,
    refetch: fetchPreferences,
  };
}

// Helper to create notifications
export async function createNotification(
  profileId: string,
  category: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  metadata?: Record<string, any>
) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        profile_id: profileId,
        category,
        type,
        title,
        message,
        link,
        metadata: metadata || {},
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
