import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  agent_type: string;
  is_premium: boolean | null;
}

interface Connection {
  id: string;
  status: string;
  profile: Profile;
  isRequester: boolean;
  created_at: string;
}

export function useConnections(currentProfileId: string | undefined) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    if (!currentProfileId) return;
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          created_at,
          requester_id,
          addressee_id,
          requester:profiles!connections_requester_id_fkey(id, name, bio, location, avatar_url, agent_type, is_premium),
          addressee:profiles!connections_addressee_id_fkey(id, name, bio, location, avatar_url, agent_type, is_premium)
        `)
        .or(`requester_id.eq.${currentProfileId},addressee_id.eq.${currentProfileId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedConnections = (data || []).map(conn => {
        const isRequester = conn.requester_id === currentProfileId;
        const otherProfile = isRequester ? conn.addressee : conn.requester;
        return {
          id: conn.id,
          status: conn.status,
          created_at: conn.created_at,
          profile: otherProfile as Profile,
          isRequester,
        };
      });

      setConnections(formattedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const sendConnectionRequest = async (targetProfileId: string) => {
    if (!currentProfileId) return false;
    
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentProfileId,
          addressee_id: targetProfileId,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Solicitação de conexão enviada!');
      await fetchConnections();
      return true;
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast.error('Erro ao enviar solicitação');
      return false;
    }
  };

  const acceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão aceita!');
      await fetchConnections();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Erro ao aceitar conexão');
    }
  };

  const rejectConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão recusada');
      await fetchConnections();
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast.error('Erro ao recusar conexão');
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão removida');
      await fetchConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Erro ao remover conexão');
    }
  };

  const getConnectionStatus = (targetProfileId: string): 'none' | 'pending' | 'accepted' | 'sent' => {
    const conn = connections.find(c => c.profile.id === targetProfileId);
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'accepted';
    if (conn.status === 'pending') {
      return conn.isRequester ? 'sent' : 'pending';
    }
    return 'none';
  };

  return {
    connections,
    loading,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    removeConnection,
    getConnectionStatus,
    refetch: fetchConnections,
  };
}

export function useDiscoverProfiles(currentProfileId: string | undefined) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    if (!currentProfileId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, bio, location, avatar_url, agent_type, is_premium')
        .neq('id', currentProfileId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, refetch: fetchProfiles };
}
