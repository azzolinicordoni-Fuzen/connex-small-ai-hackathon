import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  MapPin, 
  UserPlus, 
  MessageSquare,
  TreePine,
  HardHat,
  Briefcase,
  Award,
  Landmark,
  FolderOpen,
  Users,
  Ruler,
  Eye,
  Globe,
  Lock,
  Building2,
  Scale,
  Banknote,
  ClipboardCheck
} from "lucide-react";
import { toast } from "sonner";
import { useOnlineProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { STAGE_CONFIG, ProjectStageType } from "@/types/project";

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
  { id: "todos", label: "Todos" },
  { id: "proprietario", label: "Proprietários" },
  { id: "engenheiro", label: "Engenheiros" },
  { id: "desenvolvedor", label: "Desenvolvedores" },
  { id: "certificadora", label: "Certificadoras" },
  { id: "investidor", label: "Investidores" },
];

const mockAgents = [
  {
    id: 1,
    name: "João Silva",
    type: "proprietario",
    location: "Mato Grosso",
    bio: "Proprietário de 5.000 hectares com interesse em projetos de carbono e reflorestamento.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    connections: 234,
    projects: 3,
  },
  {
    id: 2,
    name: "Maria Santos",
    type: "engenheiro",
    location: "São Paulo",
    bio: "Engenheira florestal com 15 anos de experiência em projetos de restauração.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    connections: 567,
    projects: 12,
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    type: "desenvolvedor",
    location: "Goiás",
    bio: "Desenvolvedor de projetos de crédito de carbono com mais de 50 projetos implementados.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    connections: 890,
    projects: 52,
  },
  {
    id: 4,
    name: "Ana Costa",
    type: "certificadora",
    location: "Paraná",
    bio: "Representante da Verra Brasil, especialista em certificação de projetos VCS.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    connections: 1234,
    projects: 89,
  },
  {
    id: 5,
    name: "Ricardo Lima",
    type: "investidor",
    location: "Rio de Janeiro",
    bio: "Gestor de fundo de investimento focado em agricultura sustentável e créditos de carbono.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    connections: 456,
    projects: 8,
  },
  {
    id: 6,
    name: "Fernanda Alves",
    type: "proprietario",
    location: "Tocantins",
    bio: "Proprietária de fazenda com área de reserva legal disponível para projetos ambientais.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    connections: 123,
    projects: 1,
  },
];

interface ProjectStageData {
  id: string;
  stage: string;
  status: string;
  is_visible: boolean;
  progress_percentage: number;
}

export default function Conexoes() {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("agentes");
  const [projectStages, setProjectStages] = useState<Record<string, ProjectStageData[]>>({});

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

      // Group stages by project
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

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesFilter = activeFilter === "todos" || agent.type === activeFilter;
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredProjects = onlineProjects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleConnect = (name: string) => {
    toast.success(`Solicitação de conexão enviada para ${name}`);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Descobrir Conexões
            </h1>
            <p className="text-muted-foreground text-lg">
              Encontre agentes relevantes para expandir sua rede e fazer negócios
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="agentes" className="gap-2">
                <Users className="w-4 h-4" />
                Agentes
              </TabsTrigger>
              <TabsTrigger value="projetos" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Projetos em Andamento
                {onlineProjects.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {onlineProjects.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mt-6 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "agentes" 
                    ? "Buscar por nome, localização ou área de atuação..."
                    : "Buscar projetos por nome, localização..."
                  }
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === "agentes" && (
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                  {filters.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={activeFilter === filter.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(filter.id)}
                      className="whitespace-nowrap"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Agents Tab */}
            <TabsContent value="agentes">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => {
                  const TypeIcon = agentTypeIcons[agent.type];
                  return (
                    <Card key={agent.id} className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={agent.avatar} alt={agent.name} />
                            <AvatarFallback>{agent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {agent.location}
                            </div>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            {agentTypeLabels[agent.type]}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {agent.bio}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span>{agent.connections} conexões</span>
                          <span>{agent.projects} projetos</span>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            size="sm"
                            onClick={() => handleConnect(agent.name)}
                          >
                            <UserPlus className="w-4 h-4" />
                            Conectar
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredAgents.length === 0 && (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhum agente encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar seus filtros ou termos de busca
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projetos">
              {projectsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                      <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          {/* Project Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground line-clamp-1">{project.name}</h3>
                                <Globe className="w-4 h-4 text-green-500 shrink-0" />
                              </div>
                              {project.project_type && (
                                <Badge variant="outline" className="mt-1">{project.project_type}</Badge>
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
                              <p className="text-sm font-medium truncate">{project.owner?.name || 'Anônimo'}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <TypeIcon className="w-3 h-3" />
                              {agentTypeLabels[project.owner?.agent_type || 'outro']}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-4">
                            <Button className="flex-1" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Projeto
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => project.owner?.name && handleConnect(project.owner.name)}
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
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
    </div>
  );
}
