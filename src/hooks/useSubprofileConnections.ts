import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  // Joined profile data
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
  // The other party's subprofile
  subprofile: UnifiedSubprofile;
  isRequester: boolean;
}

export function useSubprofileConnections(currentProfileId: string | undefined) {
  const [connections, setConnections] = useState<SubprofileConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    if (!currentProfileId) return;
    
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

      setConnections(formattedConnections);
    } catch (error) {
      console.error('Error fetching subprofile connections:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const sendConnectionRequest = async (
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
      await fetchConnections();
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

  const acceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('subprofile_connections')
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
        .from('subprofile_connections')
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
        .from('subprofile_connections')
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

  const getConnectionStatus = (targetSubprofileId: string): 'none' | 'pending' | 'accepted' | 'sent' => {
    const conn = connections.find(c => 
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

export function useDiscoverSubprofiles(currentProfileId: string | undefined) {
  const [subprofiles, setSubprofiles] = useState<UnifiedSubprofile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubprofiles = useCallback(async () => {
    if (!currentProfileId) return;
    
    try {
      // First fetch the unified subprofiles
      const { data: subprofilesData, error: subprofilesError } = await supabase
        .from('unified_subprofiles' as any)
        .select('*')
        .neq('profile_id', currentProfileId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (subprofilesError) throw subprofilesError;

      // Get unique profile IDs
      const profileIds = [...new Set((subprofilesData || []).map((sp: any) => sp.profile_id))];
      
      // Fetch profile data
      let profilesMap: Record<string, any> = {};
      if (profileIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, location, is_premium')
          .in('id', profileIds);
        
        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Combine data
      const enrichedSubprofiles: UnifiedSubprofile[] = (subprofilesData || []).map((sp: any) => ({
        ...sp,
        profile: profilesMap[sp.profile_id] || null,
      }));

      setSubprofiles(enrichedSubprofiles);
    } catch (error) {
      console.error('Error fetching subprofiles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    fetchSubprofiles();
  }, [fetchSubprofiles]);

  return { subprofiles, loading, refetch: fetchSubprofiles };
}

export function useMySubprofiles(currentProfileId: string | undefined) {
  const [subprofiles, setSubprofiles] = useState<UnifiedSubprofile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMySubprofiles = useCallback(async () => {
    if (!currentProfileId) return;
    
    try {
      const { data, error } = await supabase
        .from('unified_subprofiles' as any)
        .select('*')
        .eq('profile_id', currentProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubprofiles((data as unknown as UnifiedSubprofile[]) || []);
    } catch (error) {
      console.error('Error fetching my subprofiles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    fetchMySubprofiles();
  }, [fetchMySubprofiles]);

  return { subprofiles, loading, refetch: fetchMySubprofiles };
}
