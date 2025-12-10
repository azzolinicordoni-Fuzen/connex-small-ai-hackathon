import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Ruler, Calendar, MoreVertical, Trash2, Eye, Settings, Globe, Lock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CarbonProject, ProjectStage, STAGE_CONFIG } from '@/types/project';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectCardProps {
  project: CarbonProject;
  stages: ProjectStage[];
  onSelect: () => void;
  onDelete: () => void;
  onEditVisibility?: () => void;
}

export default function ProjectCard({ project, stages, onSelect, onDelete, onEditVisibility }: ProjectCardProps) {
  const completedStages = stages.filter(s => s.status === 'concluida').length;
  const overallProgress = stages.length > 0
    ? Math.round(stages.reduce((sum, s) => sum + s.progress_percentage, 0) / stages.length)
    : 0;

  const currentStage = stages.find(s => s.status === 'em_andamento') 
    || stages.find(s => s.status === 'pendente');

  const visibleStagesCount = stages.filter(s => s.is_visible).length;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={onSelect}>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
              {project.is_online ? (
                <span title="Projeto online">
                  <Globe className="w-4 h-4 text-green-500" />
                </span>
              ) : (
                <span title="Projeto privado">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {project.project_type && (
                <Badge variant="outline">{project.project_type}</Badge>
              )}
              {project.is_online && (
                <Badge variant="secondary" className="text-xs">
                  {project.visibility_mode === 'public' ? 'Completo' : `${visibleStagesCount} etapas`}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              {onEditVisibility && (
                <DropdownMenuItem onClick={onEditVisibility}>
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Processo
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent onClick={onSelect}>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Info Row */}
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
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(project.created_at), "dd MMM yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between mt-4">
          {stages.map((stage) => {
            const config = STAGE_CONFIG[stage.stage];
            return (
              <div
                key={stage.id}
                className="flex flex-col items-center gap-1"
                title={config.label}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    stage.status === 'concluida' ? 'bg-green-500' :
                    stage.status === 'em_andamento' ? 'bg-yellow-500' :
                    'bg-gray-300'
                  }`}
                />
                <span className="text-[10px] text-muted-foreground hidden sm:block">
                  {config.label.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Stage Badge */}
        {currentStage && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Etapa Atual:</span>
              <Badge variant="secondary">
                {STAGE_CONFIG[currentStage.stage].label}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
