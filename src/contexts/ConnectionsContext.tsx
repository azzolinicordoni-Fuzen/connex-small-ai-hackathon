import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Types for profile connections (connections table)
interface Profile {
  id: string;
  name: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  agent_type: string;
  is_premium: boolean | null;
}

interface ProfileConnection {
  id: string;
  status: string;
  profile: Profile;
  isRequester: boolean;
  created_at: string;
}

// Types for subprofile connections (subprofile_connections table)
export interface UnifiedSubprofile {
  id: string;
  profile_id: string;
  subprofile_type: string;
  name: string;
  description: string | null;
  detail_1: string | null;
  detail_2: string | null;
  detail_3: string | null;
  busca_plataforma: string[] | null;
  contato_preferido: string | null;
  permitir_mensagens: boolean | null;
  mostrar_nome_publico: boolean | null;
  mostrar_telefone: boolean | null;
  mostrar_localizacao_precisa: boolean | null;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
    location: string | null;
    is_premium: boolean | null;
  };
}

export interface SubprofileConnection {
  id: string;
  status: string;
  created_at: string;
  requester_subprofile_id: string;
  requester_subprofile_type: string;
  requester_profile_id: string;
  addressee_subprofile_id: string;
  addressee_subprofile_type: string;
  addressee_profile_id: string;
  subprofile: UnifiedSubprofile;
  isRequester: boolean;
}

type ConnectionStatus = 'none' | 'pending' | 'accepted' | 'sent';

interface ConnectionsContextType {
  // Profile connections
  profileConnections: ProfileConnection[];
  profileConnectionsLoading: boolean;
  sendProfileConnectionRequest: (targetProfileId: string) => Promise<boolean>;
  acceptProfileConnection: (connectionId: string) => Promise<void>;
  rejectProfileConnection: (connectionId: string) => Promise<void>;
  removeProfileConnection: (connectionId: string) => Promise<void>;
  getProfileConnectionStatus: (targetProfileId: string) => ConnectionStatus;
  getProfileConnectionId: (targetProfileId: string) => string | null;
  
  // Subprofile connections
  subprofileConnections: SubprofileConnection[];
  subprofileConnectionsLoading: boolean;
  sendSubprofileConnectionRequest: (
    mySubprofileId: string,
    mySubprofileType: string,
    targetSubprofileId: string,
    targetSubprofileType: string,
    targetProfileId: string
  ) => Promise<boolean>;
  acceptSubprofileConnection: (connectionId: string) => Promise<void>;
  rejectSubprofileConnection: (connectionId: string) => Promise<void>;
  removeSubprofileConnection: (connectionId: string) => Promise<void>;
  getSubprofileConnectionStatus: (targetSubprofileId: string) => ConnectionStatus;
  
  // Stats
  acceptedProfileCount: number;
  pendingProfileCount: number;
  acceptedSubprofileCount: number;
  pendingSubprofileCount: number;
  
  // Refetch
  refetchAll: () => Promise<void>;
  
  // Current profile ID
  currentProfileId: string | null;
}

const ConnectionsContext = createContext<ConnectionsContextType | null>(null);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  
  // Profile connections state
  const [profileConnections, setProfileConnections] = useState<ProfileConnection[]>([]);
  const [profileConnectionsLoading, setProfileConnectionsLoading] = useState(true);
  
  // Subprofile connections state
  const [subprofileConnections, setSubprofileConnections] = useState<SubprofileConnection[]>([]);
  const [subprofileConnectionsLoading, setSubprofileConnectionsLoading] = useState(true);

  // Fetch current profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        setCurrentProfileId(null);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setCurrentProfileId(data.id);
      }
    };
    
    fetchProfileId();
  }, [user]);

  // Fetch profile connections
  const fetchProfileConnections = useCallback(async () => {
    if (!currentProfileId) {
      setProfileConnections([]);
      setProfileConnectionsLoading(false);
      return;
    }
    
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

      setProfileConnections(formattedConnections);
    } catch (error) {
      console.error('Error fetching profile connections:', error);
    } finally {
      setProfileConnectionsLoading(false);
    }
  }, [currentProfileId]);

  // Fetch subprofile connections
  const fetchSubprofileConnections = useCallback(async () => {
    if (!currentProfileId) {
      setSubprofileConnections([]);
      setSubprofileConnectionsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('subprofile_connections')
        .select(`
          id,
          status,
          created_at,
          requester_subprofile_id,
          requester_subprofile_type,
          requester_profile_id,
          addressee_subprofile_id,
          addressee_subprofile_type,
          addressee_profile_id,
          requester:profiles!subprofile_connections_requester_profile_id_fkey(id, name, avatar_url, location, is_premium),
          addressee:profiles!subprofile_connections_addressee_profile_id_fkey(id, name, avatar_url, location, is_premium)
        `)
        .or(`requester_profile_id.eq.${currentProfileId},addressee_profile_id.eq.${currentProfileId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch subprofile details from the view
      const subprofileIds = (data || []).flatMap(conn => {
        const isRequester = conn.requester_profile_id === currentProfileId;
        return isRequester ? [conn.addressee_subprofile_id] : [conn.requester_subprofile_id];
      });

      let subprofilesMap: Record<string, any> = {};
      if (subprofileIds.length > 0) {
        const { data: subprofiles } = await supabase
          .from('unified_subprofiles' as any)
          .select('*')
          .in('id', subprofileIds);
        
        if (subprofiles) {
          subprofilesMap = subprofiles.reduce((acc: any, sp: any) => {
            acc[sp.id] = sp;
            return acc;
          }, {});
        }
      }

      const formattedConnections: SubprofileConnection[] = (data || []).map(conn => {
        const isRequester = conn.requester_profile_id === currentProfileId;
        const otherSubprofileId = isRequester ? conn.addressee_subprofile_id : conn.requester_subprofile_id;
        const otherProfile = isRequester ? conn.addressee : conn.requester;
        const subprofileData = subprofilesMap[otherSubprofileId] || {};

        return {
          id: conn.id,
          status: conn.status,
          created_at: conn.created_at,
          requester_subprofile_id: conn.requester_subprofile_id,
          requester_subprofile_type: conn.requester_subprofile_type,
          requester_profile_id: conn.requester_profile_id,
          addressee_subprofile_id: conn.addressee_subprofile_id,
          addressee_subprofile_type: conn.addressee_subprofile_type,
          addressee_profile_id: conn.addressee_profile_id,
          isRequester,
          subprofile: {
            ...subprofileData,
            profile: otherProfile as any,
          },
        };
      });

      setSubprofileConnections(formattedConnections);
    } catch (error) {
      console.error('Error fetching subprofile connections:', error);
    } finally {
      setSubprofileConnectionsLoading(false);
    }
  }, [currentProfileId]);

  // Initial fetch when profile ID changes
  useEffect(() => {
    if (currentProfileId) {
      fetchProfileConnections();
      fetchSubprofileConnections();
    }
  }, [currentProfileId, fetchProfileConnections, fetchSubprofileConnections]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!currentProfileId) return;

    // Subscribe to profile connections changes
    const profileChannel = supabase
      .channel('profile-connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `requester_id=eq.${currentProfileId}`,
        },
        () => {
          fetchProfileConnections();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `addressee_id=eq.${currentProfileId}`,
        },
        () => {
          fetchProfileConnections();
        }
      )
      .subscribe();

    // Subscribe to subprofile connections changes
    const subprofileChannel = supabase
      .channel('subprofile-connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subprofile_connections',
          filter: `requester_profile_id=eq.${currentProfileId}`,
        },
        () => {
          fetchSubprofileConnections();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subprofile_connections',
          filter: `addressee_profile_id=eq.${currentProfileId}`,
        },
        () => {
          fetchSubprofileConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(subprofileChannel);
    };
  }, [currentProfileId, fetchProfileConnections, fetchSubprofileConnections]);

  // Profile connection actions
  const sendProfileConnectionRequest = async (targetProfileId: string) => {
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
      await fetchProfileConnections();
      return true;
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast.error('Erro ao enviar solicitação');
      return false;
    }
  };

  const acceptProfileConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão aceita!');
      await fetchProfileConnections();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Erro ao aceitar conexão');
    }
  };

  const rejectProfileConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão recusada');
      await fetchProfileConnections();
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast.error('Erro ao recusar conexão');
    }
  };

  const removeProfileConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão removida');
      await fetchProfileConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Erro ao remover conexão');
    }
  };

  const getProfileConnectionStatus = (targetProfileId: string): ConnectionStatus => {
    const conn = profileConnections.find(c => c.profile.id === targetProfileId);
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'accepted';
    if (conn.status === 'pending') {
      return conn.isRequester ? 'sent' : 'pending';
    }
    return 'none';
  };

  const getProfileConnectionId = (targetProfileId: string): string | null => {
    const conn = profileConnections.find(c => c.profile.id === targetProfileId);
    return conn?.id || null;
  };

  // Subprofile connection actions
  const sendSubprofileConnectionRequest = async (
    mySubprofileId: string,
    mySubprofileType: string,
    targetSubprofileId: string,
    targetSubprofileType: string,
    targetProfileId: string
  ) => {
    if (!currentProfileId) return false;
    
    try {
      const { error } = await supabase
        .from('subprofile_connections')
        .insert({
          requester_subprofile_id: mySubprofileId,
          requester_subprofile_type: mySubprofileType,
          requester_profile_id: currentProfileId,
          addressee_subprofile_id: targetSubprofileId,
          addressee_subprofile_type: targetSubprofileType,
          addressee_profile_id: targetProfileId,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Solicitação de conexão enviada!');
      await fetchSubprofileConnections();
      return true;
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      if (error.code === '23505') {
        toast.error('Já existe uma conexão ou solicitação com este subperfil');
      } else {
        toast.error('Erro ao enviar solicitação');
      }
      return false;
    }
  };

  const acceptSubprofileConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('subprofile_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão aceita!');
      await fetchSubprofileConnections();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Erro ao aceitar conexão');
    }
  };

  const rejectSubprofileConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('subprofile_connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão recusada');
      await fetchSubprofileConnections();
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast.error('Erro ao recusar conexão');
    }
  };

  const removeSubprofileConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('subprofile_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Conexão removida');
      await fetchSubprofileConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Erro ao remover conexão');
    }
  };

  const getSubprofileConnectionStatus = (targetSubprofileId: string): ConnectionStatus => {
    const conn = subprofileConnections.find(c => 
      c.subprofile.id === targetSubprofileId || 
      c.requester_subprofile_id === targetSubprofileId ||
      c.addressee_subprofile_id === targetSubprofileId
    );
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'accepted';
    if (conn.status === 'pending') {
      return conn.isRequester ? 'sent' : 'pending';
    }
    return 'none';
  };

  // Stats
  const acceptedProfileCount = profileConnections.filter(c => c.status === 'accepted').length;
  const pendingProfileCount = profileConnections.filter(c => c.status === 'pending' && !c.isRequester).length;
  const acceptedSubprofileCount = subprofileConnections.filter(c => c.status === 'accepted').length;
  const pendingSubprofileCount = subprofileConnections.filter(c => c.status === 'pending' && !c.isRequester).length;

  const refetchAll = async () => {
    await Promise.all([
      fetchProfileConnections(),
      fetchSubprofileConnections(),
    ]);
  };

  return (
    <ConnectionsContext.Provider
      value={{
        profileConnections,
        profileConnectionsLoading,
        sendProfileConnectionRequest,
        acceptProfileConnection,
        rejectProfileConnection,
        removeProfileConnection,
        getProfileConnectionStatus,
        getProfileConnectionId,
        subprofileConnections,
        subprofileConnectionsLoading,
        sendSubprofileConnectionRequest,
        acceptSubprofileConnection,
        rejectSubprofileConnection,
        removeSubprofileConnection,
        getSubprofileConnectionStatus,
        acceptedProfileCount,
        pendingProfileCount,
        acceptedSubprofileCount,
        pendingSubprofileCount,
        refetchAll,
        currentProfileId,
      }}
    >
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnectionsContext() {
  const context = useContext(ConnectionsContext);
  if (!context) {
    throw new Error('useConnectionsContext must be used within a ConnectionsProvider');
  }
  return context;
}
