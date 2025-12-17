import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, Calendar, MoreVertical, Trash2, Eye, Settings, Globe, Lock, Target, FileText, Leaf, Users, Share2
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
import { getCategoryBySubtypeId, getSubtypeLabel } from '@/constants/projectTypes';
import { ExtendedProject } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: CarbonProject | ExtendedProject;
  stages: ProjectStage[];
  onSelect: () => void;
  onDelete?: () => void;
  onEditVisibility?: () => void;
  isShared?: boolean;
  owner?: {
    id: string;
    name: string;
    avatar_url: string | null;
    agent_type: string;
  };
  memberStageIds?: string[];
}

interface ParsedDescription {
  objetivo?: string;
  descricao?: string;
  bioma?: string;
  status?: string;
  project_types?: string[];
}

function parseProjectDescription(description: string | null): ParsedDescription {
  if (!description) return {};
  
  try {
    return JSON.parse(description);
  } catch {
    // Legacy format - just return description as descricao
    return { descricao: description };
  }
}

export default function ProjectCard({ project, stages, onSelect, onDelete, onEditVisibility, isShared, owner, memberStageIds }: ProjectCardProps) {
  const completedStages = stages.filter(s => s.status === 'concluida').length;
  const currentStage = stages.find(s => s.status === 'em_andamento') 
    || stages.find(s => s.status === 'pendente');
  const visibleStagesCount = stages.filter(s => s.is_visible).length;

  const parsed = parseProjectDescription(project.description);

  // Get project types - prefer parsed array, fallback to single type
  const projectTypes = parsed.project_types && parsed.project_types.length > 0 
    ? parsed.project_types 
    : project.project_type 
      ? [project.project_type] 
      : [];

  // Count member stages
  const memberStagesCount = memberStageIds?.length || 0;
  const totalStages = stages.length;
  const hasFullAccess = !isShared || memberStagesCount === totalStages;

  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer group ${isShared ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={onSelect}>
            {/* Shared Badge */}
            {isShared && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="gap-1 text-xs bg-primary/10 text-primary border-primary/30">
                  <Share2 className="w-3 h-3" />
                  Projeto Compartilhado
                </Badge>
                {!hasFullAccess && (
                  <Badge variant="secondary" className="text-xs">
                    {memberStagesCount}/{totalStages} etapas
                  </Badge>
                )}
              </div>
            )}

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

            {/* Owner Info for Shared Projects */}
            {isShared && owner && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted/50">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={owner.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {owner.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{owner.name}</span>
                  <span className="text-[10px] text-muted-foreground">Criador do projeto</span>
                </div>
              </div>
            )}
            
            {/* Project Types Badges */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {projectTypes.slice(0, 3).map((typeId) => {
                const category = getCategoryBySubtypeId(typeId);
                const label = getSubtypeLabel(typeId);
                // If it's an old format string, show as-is
                const isNewFormat = category !== undefined;
                return (
                  <Badge 
                    key={typeId} 
                    variant="outline" 
                    className="text-xs gap-1"
                    title={isNewFormat ? `${category?.label}: ${label}` : typeId}
                  >
                    {isNewFormat && <span>{category?.icon}</span>}
                    <span className="max-w-[120px] truncate">
                      {isNewFormat ? label : typeId}
                    </span>
                  </Badge>
                );
              })}
              {projectTypes.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{projectTypes.length - 3}
                </Badge>
              )}
            </div>

            {/* Bioma & Status */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {parsed.bioma && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Leaf className="w-3 h-3" />
                  {parsed.bioma}
                </Badge>
              )}
              {parsed.status && (
                <Badge 
                  variant={parsed.status === 'concluido' ? 'default' : 'outline'}
                  className={`text-xs ${parsed.status === 'concluido' ? 'bg-green-500/10 text-green-600 border-green-500/30' : ''}`}
                >
                  {parsed.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
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
              {!isShared && onEditVisibility && (
                <DropdownMenuItem onClick={onEditVisibility}>
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Processo
                </DropdownMenuItem>
              )}
              {!isShared && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent onClick={onSelect} className="space-y-3">
        {/* Objetivo */}
        {parsed.objetivo && (
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary mb-0.5">Objetivo</p>
                <p className="text-sm text-foreground line-clamp-2">{parsed.objetivo}</p>
              </div>
            </div>
          </div>
        )}

        {/* Descrição */}
        {parsed.descricao && (
          <div className="p-2.5 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Descrição</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{parsed.descricao}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Row */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {project.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(project.created_at), "dd MMM yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* Stage Indicators */}
        <div className="pt-2 border-t">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Etapas do Projeto</span>
            <span className="text-xs text-muted-foreground">{completedStages}/{stages.length} concluídas</span>
          </div>
          <div className="flex justify-between gap-1">
            {stages.map((stage) => {
              const config = STAGE_CONFIG[stage.stage];
              return (
                <div
                  key={stage.id}
                  className="flex flex-col items-center gap-1 flex-1"
                  title={`${config.label} - ${stage.status === 'concluida' ? 'Concluída' : stage.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}`}
                >
                  <div
                    className={`w-full h-1.5 rounded-full ${
                      stage.status === 'concluida' ? 'bg-green-500' :
                      stage.status === 'em_andamento' ? 'bg-yellow-500' :
                      'bg-muted'
                    }`}
                  />
                  <span className="text-[9px] text-muted-foreground hidden sm:block truncate">
                    {config.label.slice(0, 4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage Badge */}
        {currentStage && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">Etapa Atual:</span>
            <Badge variant="secondary" className="text-xs">
              {STAGE_CONFIG[currentStage.stage].label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
