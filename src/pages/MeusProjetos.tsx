import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowLeft, LayoutGrid, BarChart3, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectTimeline from '@/components/projects/ProjectTimeline';
import ProjectCharts from '@/components/projects/ProjectCharts';
import ProjectChat from '@/components/projects/ProjectChat';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';
import { useProjects, useProjectStages, useProjectMessages } from '@/hooks/useProjects';
import { toast } from 'sonner';

export default function MeusProjetos() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { projects, loading, createProject, deleteProject } = useProjects(profile?.id);
  const { stages, updateStage } = useProjectStages(selectedProjectId || undefined);
  const { messages, sendMessage } = useProjectMessages(selectedProjectId || undefined);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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
    setShowCreateDialog(true);
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {selectedProjectId && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedProjectId(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {selectedProject ? selectedProject.name : 'Meus Projetos'}
              </h1>
              <p className="text-muted-foreground">
                {selectedProject 
                  ? 'Gerencie as etapas e membros do projeto'
                  : 'Gerencie seus projetos de crédito de carbono'
                }
              </p>
            </div>
          </div>
          {!selectedProjectId && (
            <Button onClick={handleCreateProject} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          )}
        </div>

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
                />
              ))
            )}
          </div>
        ) : (
          // Project Detail View
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
        )}
      </main>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={createProject}
      />
    </div>
  );
}
