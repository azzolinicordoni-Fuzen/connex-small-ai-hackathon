import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, BarChart3, MessageSquare, Settings, ArrowLeft, Edit } from 'lucide-react';
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
import { useProjects, useProjectStages, useProjectMessages } from '@/hooks/useProjects';
import { VisibilityMode } from '@/types/project';
import { toast } from 'sonner';

export default function MeusProjetos() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const { projects, loading, createProject, updateProject, deleteProject, refetch: refetchProjects } = useProjects(profile?.id);
  const { stages, updateStage, refetch: refetchStages } = useProjectStages(selectedProjectId || editingProjectId || undefined);
  const { messages, sendMessage } = useProjectMessages(selectedProjectId || undefined);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const editingProject = projects.find(p => p.id === editingProjectId);

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
          <div className="flex items-center justify-between mb-8">
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
        )}

        {/* Header Actions for Selected Project */}
        {selectedProjectId && selectedProject && (
          <div className="flex items-center justify-end gap-2 mb-4">
            <Button 
              variant="outline" 
              onClick={() => handleEditVisibility(selectedProjectId)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar Projeto
            </Button>
          </div>
        )}

        {/* Project List or Detail View */}
        {!selectedProjectId ? (
          // Projects Grid
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.length === 0 ? (
              <Card className="col-span-full border-dashed py-12">
                <CardContent className="flex flex-col items-center">
                  <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não tem projetos cadastrados
                  </p>
                  <Button onClick={handleCreateProject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  stages={[]}
                  onSelect={() => setSelectedProjectId(project.id)}
                  onDelete={() => deleteProject(project.id)}
                  onEditVisibility={() => handleEditVisibility(project.id)}
                />
              ))
            )}
          </div>
        ) : (
          // Project Detail View
          <>
            {/* Project Header with all key info */}
            <ProjectDetailHeader project={selectedProject!} stages={stages} />
            
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
                  onStageUpdate={updateStage}
                  projectId={selectedProjectId}
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
