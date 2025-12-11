import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/layout/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  MapPin, 
  TreePine,
  HardHat,
  Briefcase,
  Award,
  Landmark,
  FolderOpen,
  Users,
  Ruler,
  Globe,
  Building2,
  Scale,
  Banknote,
  ClipboardCheck,
  Filter,
  SlidersHorizontal,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useOnlineProjects } from "@/hooks/useProjects";
import { useSubprofileConnections, useDiscoverSubprofiles, useMySubprofiles, UnifiedSubprofile } from "@/hooks/useSubprofileConnections";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STAGE_CONFIG, ProjectStageType } from "@/types/project";
import SubprofileCard from "@/components/conexoes/SubprofileCard";

const agentTypeIcons: Record<string, any> = {
  proprietario: TreePine,
  engenheiro: HardHat,
  desenvolvedor: Briefcase,
  certificadora: Award,
  investidor: Landmark,
  projeto: FolderOpen,
  comprador: Building2,
  auditor: ClipboardCheck,
  financeira: Banknote,
  advogado: Scale,
  outro: Users,
};

const agentTypeLabels: Record<string, string> = {
  proprietario: "Proprietário",
  engenheiro: "Engenheiro",
  desenvolvedor: "Desenvolvedor",
  certificadora: "Certificadora",
  investidor: "Investidor",
  projeto: "Projeto",
  comprador: "Comprador",
  auditor: "Auditor",
  financeira: "Financeira",
  advogado: "Advogado",
  outro: "Outro",
};

const filters = [
  { id: "todos", label: "Todos", icon: Users },
  { id: "proprietario", label: "Proprietários", icon: TreePine },
  { id: "desenvolvedor", label: "Desenvolvedores", icon: Briefcase },
  { id: "certificadora", label: "Certificadoras", icon: Award },
  { id: "auditor", label: "Auditores", icon: ClipboardCheck },
  { id: "investidor", label: "Investidores", icon: Landmark },
  { id: "comprador", label: "Compradores", icon: Building2 },
  { id: "financeira", label: "Financeiras", icon: Banknote },
  { id: "advogado", label: "Advogados", icon: Scale },
  { id: "projeto", label: "Projetos", icon: FolderOpen },
];

interface ProjectStageData {
  id: string;
  stage: string;
  status: string;
  is_visible: boolean;
  progress_percentage: number;
}

export default function Conexoes() {
  const { user } = useAuth();
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("subperfis");
  const [projectStages, setProjectStages] = useState<Record<string, ProjectStageData[]>>({});
  const [loadingConnection, setLoadingConnection] = useState<string | null>(null);
  const [showSelectSubprofileDialog, setShowSelectSubprofileDialog] = useState(false);
  const [targetSubprofile, setTargetSubprofile] = useState<UnifiedSubprofile | null>(null);

  // Get current user's profile id
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) setCurrentProfileId(data.id);
    };
    fetchProfileId();
  }, [user]);

  const { subprofiles, loading: subprofilesLoading } = useDiscoverSubprofiles(currentProfileId || undefined);
  const { subprofiles: mySubprofiles, loading: mySubprofilesLoading } = useMySubprofiles(currentProfileId || undefined);
  const { getConnectionStatus, sendConnectionRequest } = useSubprofileConnections(currentProfileId || undefined);
  const { projects: onlineProjects, loading: projectsLoading } = useOnlineProjects();

  // Fetch stages for online projects
  useEffect(() => {
    const fetchProjectStages = async () => {
      if (onlineProjects.length === 0) return;

      const projectIds = onlineProjects.map(p => p.id);
      
      const { data, error } = await supabase
        .from('project_stages')
        .select('id, project_id, stage, status, is_visible, progress_percentage')
        .in('project_id', projectIds);

      if (error) {
        console.error('Error fetching project stages:', error);
        return;
      }

      const stagesByProject: Record<string, ProjectStageData[]> = {};
      (data || []).forEach((stage: any) => {
        if (!stagesByProject[stage.project_id]) {
          stagesByProject[stage.project_id] = [];
        }
        stagesByProject[stage.project_id].push(stage);
      });

      setProjectStages(stagesByProject);
    };

    fetchProjectStages();
  }, [onlineProjects]);

  const filteredSubprofiles = subprofiles.filter((sp) => {
    const matchesFilter = activeFilter === "todos" || sp.subprofile_type === activeFilter;
    const matchesSearch = 
      sp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sp.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sp.profile?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sp.profile?.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredProjects = onlineProjects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleConnect = (targetSp: UnifiedSubprofile) => {
    if (mySubprofiles.length === 0) {
      // No subprofiles to connect with
      setTargetSubprofile(null);
      setShowSelectSubprofileDialog(true);
      return;
    }
    
    if (mySubprofiles.length === 1) {
      // Auto-select the only subprofile
      handleSendConnection(mySubprofiles[0], targetSp);
    } else {
      // Show dialog to select which subprofile to connect with
      setTargetSubprofile(targetSp);
      setShowSelectSubprofileDialog(true);
    }
  };

  const handleSendConnection = async (mySp: UnifiedSubprofile, targetSp: UnifiedSubprofile) => {
    setLoadingConnection(targetSp.id);
    await sendConnectionRequest(
      mySp.id,
      mySp.subprofile_type,
      targetSp.id,
      targetSp.subprofile_type,
      targetSp.profile_id
    );
    setLoadingConnection(null);
    setShowSelectSubprofileDialog(false);
    setTargetSubprofile(null);
  };

  const getVisibleStages = (projectId: string) => {
    const stages = projectStages[projectId] || [];
    return stages.filter(s => s.is_visible);
  };

  const getProjectProgress = (projectId: string) => {
    const stages = projectStages[projectId] || [];
    if (stages.length === 0) return 0;
    return Math.round(stages.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / stages.length);
  };

  // Count subprofiles by type for filter badges
  const subprofileCounts = subprofiles.reduce((acc, sp) => {
    acc[sp.subprofile_type] = (acc[sp.subprofile_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BackButton />
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  Rede de Conexões
                </h1>
                <p className="text-muted-foreground text-lg">
                  Conecte seus subperfis com outros agentes do mercado de carbono
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="subperfis" className="gap-2 data-[state=active]:bg-background">
                <Users className="w-4 h-4" />
                Subperfis
                <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">
                  {subprofiles.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="projetos" className="gap-2 data-[state=active]:bg-background">
                <FolderOpen className="w-4 h-4" />
                Projetos em Andamento
                {onlineProjects.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">
                    {onlineProjects.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 mt-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "subperfis" 
                      ? "Buscar por nome do subperfil, perfil ou localização..."
                      : "Buscar projetos por nome, localização..."
                    }
                    className="pl-10 h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Type Filters - Horizontal Scroll */}
              {activeTab === "subperfis" && (
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-2">
                    {filters.map((filter) => {
                      const count = filter.id === 'todos' 
                        ? subprofiles.length 
                        : (subprofileCounts[filter.id] || 0);
                      const FilterIcon = filter.icon;
                      
                      return (
                        <Button
                          key={filter.id}
                          variant={activeFilter === filter.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveFilter(filter.id)}
                          className="shrink-0 gap-2"
                        >
                          <FilterIcon className="w-4 h-4" />
                          {filter.label}
                          <Badge 
                            variant={activeFilter === filter.id ? "secondary" : "outline"}
                            className="ml-0.5 text-xs"
                          >
                            {count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </div>

            {/* Subprofiles Tab */}
            <TabsContent value="subperfis">
              {subprofilesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredSubprofiles.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhum subperfil encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar seus filtros ou termos de busca
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubprofiles.map((sp) => (
                    <SubprofileCard
                      key={sp.id}
                      subprofile={sp}
                      connectionStatus={getConnectionStatus(sp.id)}
                      onConnect={() => handleConnect(sp)}
                      isLoading={loadingConnection === sp.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projetos">
              {projectsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhum projeto disponível</h3>
                  <p className="text-muted-foreground">
                    Não há projetos compartilhados publicamente no momento
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => {
                    const visibleStages = getVisibleStages(project.id);
                    const progress = getProjectProgress(project.id);
                    const TypeIcon = agentTypeIcons[project.owner?.agent_type || 'outro'];

                    return (
                      <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-5">
                          {/* Project Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground line-clamp-1">{project.name}</h3>
                                <Globe className="w-4 h-4 text-green-500 shrink-0" />
                              </div>
                              {project.project_type && (
                                <Badge variant="outline" className="mt-1.5 text-xs">{project.project_type}</Badge>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {project.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          {/* Project Info */}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                            {project.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {project.location}
                              </span>
                            )}
                            {project.area_hectares && (
                              <span className="flex items-center gap-1">
                                <Ruler className="w-3 h-3" />
                                {project.area_hectares} ha
                              </span>
                            )}
                          </div>

                          {/* Progress */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {/* Visible Stages */}
                          <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Etapas visíveis:</p>
                            <div className="flex flex-wrap gap-1">
                              {visibleStages.length === 0 ? (
                                <span className="text-xs text-muted-foreground italic">Nenhuma etapa visível</span>
                              ) : (
                                visibleStages.map((stage) => {
                                  const config = STAGE_CONFIG[stage.stage as ProjectStageType];
                                  return (
                                    <Badge key={stage.id} variant="secondary" className="text-xs">
                                      {config?.label || stage.stage}
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Owner */}
                          <div className="flex items-center gap-2 pt-3 border-t">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={project.owner?.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {project.owner?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{project.owner?.name}</p>
                            </div>
                            <Badge variant="outline" className="text-xs gap-1">
                              <TypeIcon className="w-3 h-3" />
                              {agentTypeLabels[project.owner?.agent_type || 'outro']}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Select Subprofile Dialog */}
      <Dialog open={showSelectSubprofileDialog} onOpenChange={setShowSelectSubprofileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mySubprofiles.length === 0 
                ? "Crie um Subperfil" 
                : "Selecione um Subperfil"}
            </DialogTitle>
            <DialogDescription>
              {mySubprofiles.length === 0 
                ? "Você precisa criar pelo menos um subperfil antes de se conectar com outros agentes. Acesse seu perfil para criar um."
                : `Selecione qual dos seus subperfis você quer conectar com "${targetSubprofile?.name}"`}
            </DialogDescription>
          </DialogHeader>
          
          {mySubprofiles.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <Button onClick={() => window.location.href = '/perfil'}>
                Ir para Meu Perfil
              </Button>
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {mySubprofiles.map((mySp) => {
                const TypeIcon = agentTypeIcons[mySp.subprofile_type] || Users;
                return (
                  <Button
                    key={mySp.id}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={() => targetSubprofile && handleSendConnection(mySp, targetSubprofile)}
                  >
                    <TypeIcon className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{mySp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {agentTypeLabels[mySp.subprofile_type] || mySp.subprofile_type}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
