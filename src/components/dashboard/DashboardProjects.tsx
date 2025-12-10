import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen, 
  ChevronRight, 
  Plus,
  MapPin,
  Clock
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  location: string | null;
  project_type: string | null;
  is_online: boolean;
  stages?: {
    stage: string;
    status: string;
    progress_percentage: number | null;
    deadline: string | null;
  }[];
}

interface DashboardProjectsProps {
  projects: Project[];
  loading: boolean;
}

const stageLabels: Record<string, string> = {
  documentos: "Documentos",
  viabilidade: "Viabilidade",
  desenvolvimento: "Desenvolvimento",
  certificacao: "Certificação",
  auditoria: "Auditoria",
  venda: "Venda"
};

const statusColors: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground",
  em_andamento: "bg-amber-500/10 text-amber-600",
  concluida: "bg-emerald-500/10 text-emerald-600"
};

export function DashboardProjects({ projects, loading }: DashboardProjectsProps) {
  const getCurrentStage = (stages?: Project['stages']) => {
    if (!stages || stages.length === 0) return null;
    const inProgress = stages.find(s => s.status === 'em_andamento');
    if (inProgress) return inProgress;
    const pending = stages.find(s => s.status === 'pendente');
    return pending || stages[0];
  };

  const calculateOverallProgress = (stages?: Project['stages']) => {
    if (!stages || stages.length === 0) return 0;
    const completed = stages.filter(s => s.status === 'concluida').length;
    return Math.round((completed / stages.length) * 100);
  };

  const isDeadlineNear = (deadline: string | null) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Meus Projetos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Meus Projetos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/meus-projetos">
                <Plus className="w-4 h-4 mr-1" />
                Novo
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/meus-projetos">
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-3">Nenhum projeto ainda</p>
            <Button asChild>
              <Link to="/meus-projetos">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro projeto
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => {
              const currentStage = getCurrentStage(project.stages);
              const overallProgress = calculateOverallProgress(project.stages);
              const hasNearDeadline = currentStage && isDeadlineNear(currentStage.deadline);

              return (
                <Link
                  key={project.id}
                  to={`/meus-projetos?project=${project.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{project.name}</h4>
                          {project.is_online && (
                            <Badge variant="secondary" className="text-xs">Online</Badge>
                          )}
                          {hasNearDeadline && (
                            <Badge variant="destructive" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Prazo próximo
                            </Badge>
                          )}
                        </div>
                        {project.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {project.location}
                          </p>
                        )}
                      </div>
                      {currentStage && (
                        <Badge className={statusColors[currentStage.status] || statusColors.pendente}>
                          {stageLabels[currentStage.stage] || currentStage.stage}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progresso geral</span>
                        <span className="font-medium">{overallProgress}%</span>
                      </div>
                      <Progress value={overallProgress} className="h-1.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
