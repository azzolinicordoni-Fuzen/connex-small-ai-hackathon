import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CarbonProject, ProjectStage, ProjectStageMember, ProjectMessage, VisibilityMode, StageStatus, ProjectStageType } from '@/types/project';
import { toast } from 'sonner';

export function useProjects(profileId: string | undefined) {
  const [projects, setProjects] = useState<CarbonProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('carbon_projects')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Cast visibility_mode to proper type
      const typedProjects = (data || []).map(p => ({
        ...p,
        visibility_mode: p.visibility_mode as VisibilityMode
      }));
      setProjects(typedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (projectData: Partial<CarbonProject> & { stagesData?: Record<ProjectStageType, { selected: boolean; notes: string; deadline: string; progress: number; responsavel: string; metadata: Record<string, any> }> }) => {
    if (!profileId) return null;
    
    try {
      const { stagesData, ...projectFields } = projectData;
      
      const { data, error } = await supabase
        .from('carbon_projects')
        .insert({ 
          name: projectFields.name || 'Novo Projeto',
          description: projectFields.description,
          location: projectFields.location,
          area_hectares: projectFields.area_hectares,
          project_type: projectFields.project_type,
          is_online: projectFields.is_online || false,
          visibility_mode: projectFields.visibility_mode || 'private',
          profile_id: profileId 
        })
        .select()
        .single();

      if (error) throw error;
      
      // If stagesData is provided, update the auto-created stages
      if (data && stagesData) {
        // Wait a moment for trigger to create stages
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch the created stages
        const { data: stages } = await supabase
          .from('project_stages')
          .select('id, stage')
          .eq('project_id', data.id);
        
        if (stages) {
          // Update each stage with the form data
          for (const stage of stages) {
            const stageKey = stage.stage as ProjectStageType;
            const stageFormData = stagesData[stageKey];
            
            if (stageFormData) {
              // Build notes with metadata
              let notes = stageFormData.notes || '';
              if (Object.keys(stageFormData.metadata).length > 0) {
                notes = `${notes}\n\n---\nMetadata: ${JSON.stringify(stageFormData.metadata)}`;
              }
              if (stageFormData.responsavel) {
                notes = `Responsável: ${stageFormData.responsavel}\n${notes}`;
              }

              await supabase
                .from('project_stages')
                .update({
                  status: stageFormData.selected ? 'pendente' : 'pendente',
                  is_visible: stageFormData.selected,
                  progress_percentage: stageFormData.progress,
                  deadline: stageFormData.deadline || null,
                  notes: notes.trim() || null,
                })
                .eq('id', stage.id);
            }
          }
        }
      }
      
      toast.success('Projeto criado com sucesso!');
      await fetchProjects();
      return data ? { ...data, visibility_mode: data.visibility_mode as VisibilityMode } : null;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Erro ao criar projeto');
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<CarbonProject>) => {
    try {
      const { error } = await supabase
        .from('carbon_projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
      
      toast.success('Projeto atualizado!');
      await fetchProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error('Erro ao atualizar projeto');
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('carbon_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      toast.success('Projeto excluído!');
      await fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}

export function useProjectStages(projectId: string | undefined) {
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStages = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('stage');

      if (error) throw error;
      // Cast types properly
      const typedStages = (data || []).map(s => ({
        ...s,
        status: s.status as StageStatus,
        stage: s.stage as ProjectStageType,
        is_visible: s.is_visible ?? false
      }));
      setStages(typedStages);
    } catch (error: any) {
      console.error('Error fetching stages:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const updateStage = async (stageId: string, updates: Partial<ProjectStage>) => {
    try {
      const { error } = await supabase
        .from('project_stages')
        .update(updates)
        .eq('id', stageId);

      if (error) throw error;
      
      await fetchStages();
      toast.success('Etapa atualizada!');
    } catch (error: any) {
      console.error('Error updating stage:', error);
      toast.error('Erro ao atualizar etapa');
    }
  };

  return { stages, loading, updateStage, refetch: fetchStages };
}

export function useStageMembers(stageId: string | undefined) {
  const [members, setMembers] = useState<ProjectStageMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!stageId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_stage_members')
        .select(`
          *,
          profile:profiles!project_stage_members_member_profile_id_fkey(id, name, avatar_url, agent_type)
        `)
        .eq('stage_id', stageId);

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, [stageId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (memberProfileId: string, role?: string) => {
    if (!stageId) return;
    
    try {
      const { error } = await supabase
        .from('project_stage_members')
        .insert({ stage_id: stageId, member_profile_id: memberProfileId, role });

      if (error) throw error;
      
      await fetchMembers();
      toast.success('Membro adicionado!');
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error('Erro ao adicionar membro');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_stage_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchMembers();
      toast.success('Membro removido!');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    }
  };

  return { members, loading, addMember, removeMember, refetch: fetchMembers };
}

export function useProjectMessages(projectId: string | undefined) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_messages')
        .select(`
          *,
          sender:profiles!project_messages_sender_id_fkey(id, name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates
    if (projectId) {
      const channel = supabase
        .channel(`project-messages-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'project_messages',
            filter: `project_id=eq.${projectId}`,
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId, fetchMessages]);

  const sendMessage = async (senderId: string, content: string, stageId?: string, isStageComment = false) => {
    if (!projectId) return;
    
    try {
      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          sender_id: senderId,
          content,
          stage_id: stageId || null,
          is_stage_comment: isStageComment,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}

// Hook for stage-specific comments (separate from project chat)
export function useStageComments(stageId: string | undefined, projectId: string | undefined) {
  const [comments, setComments] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!stageId || !projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_messages')
        .select(`
          *,
          sender:profiles!project_messages_sender_id_fkey(id, name, avatar_url, agent_type)
        `)
        .eq('project_id', projectId)
        .eq('stage_id', stageId)
        .eq('is_stage_comment', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching stage comments:', error);
    } finally {
      setLoading(false);
    }
  }, [stageId, projectId]);

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime updates for this stage's comments
    if (stageId && projectId) {
      const channel = supabase
        .channel(`stage-comments-${stageId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'project_messages',
            filter: `stage_id=eq.${stageId}`,
          },
          () => {
            fetchComments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [stageId, projectId, fetchComments]);

  const addComment = async (senderId: string, content: string) => {
    if (!stageId || !projectId) return;
    
    try {
      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          sender_id: senderId,
          content,
          stage_id: stageId,
          is_stage_comment: true,
        });

      if (error) throw error;
      toast.success('Comentário adicionado!');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  return { comments, loading, addComment, refetch: fetchComments };
}

// Hook for fetching all stage members for a project (for timeline display)
export function useProjectAllStageMembers(projectId: string | undefined) {
  const [membersByStage, setMembersByStage] = useState<Record<string, ProjectStageMember[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchAllMembers = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const { data: stages, error: stagesError } = await supabase
        .from('project_stages')
        .select('id')
        .eq('project_id', projectId);

      if (stagesError) throw stagesError;

      const stageIds = stages?.map(s => s.id) || [];
      
      if (stageIds.length === 0) {
        setMembersByStage({});
        return;
      }

      const { data: members, error: membersError } = await supabase
        .from('project_stage_members')
        .select(`
          *,
          profile:profiles!project_stage_members_member_profile_id_fkey(id, name, avatar_url, agent_type)
        `)
        .in('stage_id', stageIds);

      if (membersError) throw membersError;

      const grouped: Record<string, ProjectStageMember[]> = {};
      (members || []).forEach(member => {
        if (!grouped[member.stage_id]) grouped[member.stage_id] = [];
        grouped[member.stage_id].push(member);
      });
      
      setMembersByStage(grouped);
    } catch (error: any) {
      console.error('Error fetching all stage members:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAllMembers();
  }, [fetchAllMembers]);

  return { membersByStage, loading, refetch: fetchAllMembers };
}

// Hook for fetching online projects (for Conexoes page)
export function useOnlineProjects() {
  const [projects, setProjects] = useState<(CarbonProject & { owner: { id: string; name: string; avatar_url: string | null; agent_type: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnlineProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('carbon_projects')
        .select(`
          *,
          owner:profiles!carbon_projects_profile_id_fkey(id, name, avatar_url, agent_type)
        `)
        .eq('is_online', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const typedProjects = (data || []).map(p => ({
        ...p,
        visibility_mode: p.visibility_mode as VisibilityMode,
        owner: p.owner as { id: string; name: string; avatar_url: string | null; agent_type: string }
      }));
      setProjects(typedProjects);
    } catch (error: any) {
      console.error('Error fetching online projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnlineProjects();
  }, [fetchOnlineProjects]);

  return { projects, loading, refetch: fetchOnlineProjects };
}
