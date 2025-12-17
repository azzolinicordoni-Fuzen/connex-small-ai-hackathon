import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, BarChart3, MessageSquare, Settings, ArrowLeft, Edit, Users, FolderOpen, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectTimeline from '@/components/projects/ProjectTimeline';
import ProjectCharts from '@/components/projects/ProjectCharts';
import ProjectChat from '@/components/projects/ProjectChat';
import ProjectDetailHeader from '@/components/projects/ProjectDetailHeader';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';
import EditVisibilityDialog from '@/components/projects/EditVisibilityDialog';
import { useProjects, useProjectStages, useProjectMessages, useSharedProjects, useProjectRole, ExtendedProject } from '@/hooks/useProjects';
import { VisibilityMode, CarbonProject } from '@/types/project';
import { toast } from 'sonner';

type ViewMode = 'owned' | 'shared' | 'all';

export default function MeusProjetos() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const { projects: ownedProjects, loading: loadingOwned, createProject, updateProject, deleteProject, refetch: refetchProjects } = useProjects(profile?.id);
  const { projects: sharedProjects, loading: loadingShared, refetch: refetchShared } = useSharedProjects(profile?.id);
  const { stages, updateStage, refetch: refetchStages } = useProjectStages(selectedProjectId || editingProjectId || undefined);
  const { messages, sendMessage } = useProjectMessages(selectedProjectId || undefined);

  // Determine if selected project is shared or owned
  const selectedOwnedProject = ownedProjects.find(p => p.id === selectedProjectId);
  const selectedSharedProject = sharedProjects.find(p => p.id === selectedProjectId);
  const selectedProject = selectedOwnedProject || selectedSharedProject;
  const isSelectedProjectShared = !!selectedSharedProject;
  
  const editingProject = ownedProjects.find(p => p.id === editingProjectId);

  // Project role for selected project
  const { isOwner, memberStageIds } = useProjectRole(selectedProjectId || undefined, profile?.id);

  // Combined and filtered projects
  const allProjects = useMemo(() => {
    const owned: ExtendedProject[] = ownedProjects.map(p => ({ ...p, isShared: false }));
    const shared: ExtendedProject[] = sharedProjects;
    
    switch (viewMode) {
      case 'owned':
        return owned;
      case 'shared':
        return shared;
      case 'all':
      default:
        return [...owned, ...shared];
    }
  }, [ownedProjects, sharedProjects, viewMode]);

  const loading = loadingOwned || loadingShared;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setProfile(data);
  };

  const handleCreateProject = async () => {
    if (!profile?.id) {
      toast.error('Aguarde o carregamento do perfil');
      return;
    }
    setShowCreateDialog(true);
  };

  const handleEditVisibility = (projectId: string) => {
    setEditingProjectId(projectId);
    setShowVisibilityDialog(true);
  };

  const handleSaveVisibility = async (
    visibilityMode: VisibilityMode,
    isOnline: boolean,
    stageVisibility: Record<string, boolean>
  ) => {
    if (!editingProjectId) return;

    try {
      // Update project visibility
      await updateProject(editingProjectId, {
        visibility_mode: visibilityMode,
        is_online: isOnline,
      });

      // Update each stage visibility
      for (const [stageId, isVisible] of Object.entries(stageVisibility)) {
        await supabase
          .from('project_stages')
          .update({ is_visible: isVisible })
          .eq('id', stageId);
      }

      await refetchStages();
      await refetchProjects();
    } catch (error) {
      console.error('Error saving visibility:', error);
      throw error;
    }
  };

  // Get stages for a project card (fetched separately for grid view)
  const [projectStagesMap, setProjectStagesMap] = useState<Record<string, any[]>>({});
  
  useEffect(() => {
    const fetchAllProjectStages = async () => {
      const projectIds = allProjects.map(p => p.id);
      if (projectIds.length === 0) return;

      const { data } = await supabase
        .from('project_stages')
        .select('*')
        .in('project_id', projectIds);

      if (data) {
        const grouped: Record<string, any[]> = {};
        data.forEach(stage => {
          if (!grouped[stage.project_id]) grouped[stage.project_id] = [];
          grouped[stage.project_id].push(stage);
        });
        setProjectStagesMap(grouped);
      }
    };

    if (!loading) {
      fetchAllProjectStages();
    }
  }, [allProjects, loading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button 
          variant={selectedProjectId ? "outline" : "ghost"}
          size="sm" 
          onClick={() => selectedProjectId ? setSelectedProjectId(null) : navigate('/dashboard')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {selectedProjectId ? 'Voltar para Projetos' : 'Voltar'}
        </Button>

        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={
            selectedProject 
              ? [
                  { label: 'Meus Projetos', href: '/meus-projetos' },
                  { label: selectedProject.name }
                ]
              : [{ label: 'Meus Projetos' }]
          } 
        />

        {/* Header */}
        {!selectedProjectId && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Meus Projetos</h1>
                <p className="text-muted-foreground">
                  Gerencie seus projetos de crédito de carbono
                </p>
              </div>
              <Button onClick={handleCreateProject} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Projeto
              </Button>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-4">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all" className="gap-1.5">
                    <LayoutGrid className="w-4 h-4" />
                    Todos
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {ownedProjects.length + sharedProjects.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="owned" className="gap-1.5">
                    <FolderOpen className="w-4 h-4" />
                    Próprios
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {ownedProjects.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="shared" className="gap-1.5">
                    <Share2 className="w-4 h-4" />
                    Compartilhados
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {sharedProjects.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        )}

        {/* Header Actions for Selected Project */}
        {selectedProjectId && selectedProject && (
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Show shared indicator */}
            {isSelectedProjectShared && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/30">
                  <Share2 className="w-3 h-3" />
                  Projeto Compartilhado
                </Badge>
                {selectedSharedProject?.owner && (
                  <span className="text-sm text-muted-foreground">
                    por {selectedSharedProject.owner.name}
                  </span>
                )}
                {memberStageIds.length > 0 && memberStageIds.length < stages.length && (
                  <Badge variant="secondary" className="text-xs">
                    Acesso a {memberStageIds.length}/{stages.length} etapas
                  </Badge>
                )}
              </div>
            )}
            
            {/* Edit button only for owned projects */}
            {!isSelectedProjectShared && (
              <Button 
                variant="outline" 
                onClick={() => handleEditVisibility(selectedProjectId)}
                className="gap-2 ml-auto"
              >
                <Edit className="w-4 h-4" />
                Editar Projeto
              </Button>
            )}
          </div>
        )}

        {/* Project List or Detail View */}
        {!selectedProjectId ? (
          // Projects Grid
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allProjects.length === 0 ? (
              <Card className="col-span-full border-dashed py-12">
                <CardContent className="flex flex-col items-center">
                  <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {viewMode === 'shared' 
                      ? 'Você ainda não foi adicionado a nenhum projeto'
                      : viewMode === 'owned'
                        ? 'Você ainda não tem projetos próprios'
                        : 'Você ainda não tem projetos cadastrados'
                    }
                  </p>
                  {viewMode !== 'shared' && (
                    <Button onClick={handleCreateProject}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Projeto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              allProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  stages={projectStagesMap[project.id] || []}
                  onSelect={() => setSelectedProjectId(project.id)}
                  onDelete={!project.isShared ? () => deleteProject(project.id) : undefined}
                  onEditVisibility={!project.isShared ? () => handleEditVisibility(project.id) : undefined}
                  isShared={project.isShared}
                  owner={project.owner}
                  memberStageIds={project.memberStageIds}
                />
              ))
            )}
          </div>
        ) : (
          // Project Detail View
          <>
            {/* Project Header with all key info */}
            <ProjectDetailHeader 
              project={selectedProject as CarbonProject} 
              stages={stages}
              isShared={isSelectedProjectShared}
              owner={selectedSharedProject?.owner}
            />
            
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList>
                <TabsTrigger value="timeline" className="gap-1">
                  <LayoutGrid className="w-4 h-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="charts" className="gap-1">
                  <BarChart3 className="w-4 h-4" />
                  Indicadores
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-1">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <ProjectTimeline
                  stages={stages}
                  onStageUpdate={isSelectedProjectShared ? undefined : updateStage}
                  projectId={selectedProjectId}
                  memberStageIds={isSelectedProjectShared ? memberStageIds : undefined}
                  isReadOnly={isSelectedProjectShared && memberStageIds.length === 0}
                />
              </TabsContent>

              <TabsContent value="charts">
                <ProjectCharts stages={stages} />
              </TabsContent>

              <TabsContent value="chat">
                <ProjectChat
                  messages={messages}
                  onSendMessage={(content) => profile && sendMessage(profile.id, content)}
                  currentUserId={profile?.id || ''}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={createProject}
      />

      {/* Edit Visibility Dialog */}
      {editingProject && (
        <EditVisibilityDialog
          open={showVisibilityDialog}
          onOpenChange={(open) => {
            setShowVisibilityDialog(open);
            if (!open) setEditingProjectId(null);
          }}
          project={editingProject}
          stages={stages}
          onSave={handleSaveVisibility}
        />
      )}
    </div>
  );
}
