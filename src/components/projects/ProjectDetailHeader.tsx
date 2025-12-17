import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, Leaf, Calendar, Globe, Lock, Target, 
  FileText, Layers, TreePine, Share2
} from 'lucide-react';
import { CarbonProject, ProjectStage, STAGE_CONFIG } from '@/types/project';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCategoryBySubtypeId, getSubtypeLabel } from '@/constants/projectTypes';

export interface ProjectDetailHeaderProps {
  project: CarbonProject;
  stages: ProjectStage[];
  isShared?: boolean;
  owner?: {
    id: string;
    name: string;
    avatar_url: string | null;
    agent_type: string;
  };
}

interface ParsedDescription {
  objetivo?: string;
  descricao?: string;
  bioma?: string;
  status?: string;
  project_types?: string[];
  area_hectares?: number;
}

function parseProjectDescription(description: string | null): ParsedDescription {
  if (!description) return {};
  try {
    return JSON.parse(description);
  } catch {
    return { descricao: description };
  }
}

export default function ProjectDetailHeader({ project, stages, isShared, owner }: ProjectDetailHeaderProps) {
  const parsed = parseProjectDescription(project.description);
  
  // Get current stage (first non-completed or first pending)
  const currentStage = stages.find(s => s.status === 'em_andamento') 
    || stages.find(s => s.status === 'pendente');
  
  // Count completed stages
  const completedStages = stages.filter(s => s.status === 'concluida').length;
  const inProgressStages = stages.filter(s => s.status === 'em_andamento').length;
  
  // Get project types
  const projectTypes = parsed.project_types && parsed.project_types.length > 0 
    ? parsed.project_types 
    : project.project_type 
      ? [project.project_type] 
      : [];

  return (
    <Card className={`mb-6 bg-gradient-to-br from-card to-muted/30 ${isShared ? 'border-primary/30' : 'border-primary/20'}`}>
      <CardContent className="pt-6">
        {/* Shared Project Banner */}
        {isShared && owner && (
          <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-primary/10 border border-primary/20">
            <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/30">
              <Share2 className="w-3 h-3" />
              Projeto Compartilhado
            </Badge>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={owner.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {owner.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                <span className="text-muted-foreground">Criado por </span>
                <span className="font-medium">{owner.name}</span>
              </span>
            </div>
          </div>
        )}

        {/* Top Row: Name + Status */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.is_online ? (
                <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600">
                  <Globe className="w-3 h-3" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  Privado
                </Badge>
              )}
            </div>
            
            {/* Objetivo */}
            {parsed.objetivo && (
              <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{parsed.objetivo}</p>
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="text-right">
            <Badge 
              variant={parsed.status === 'concluido' ? 'emerald' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {parsed.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(project.created_at), "dd MMM yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Location */}
          {project.location && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Localização</p>
                <p className="text-sm font-medium truncate">{project.location}</p>
              </div>
            </div>
          )}
          
          {/* Bioma */}
          {parsed.bioma && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <Leaf className="w-4 h-4 text-green-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Bioma</p>
                <p className="text-sm font-medium truncate">{parsed.bioma}</p>
              </div>
            </div>
          )}
          
          {/* Area */}
          {(project.area_hectares || parsed.area_hectares) && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <TreePine className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Área</p>
                <p className="text-sm font-medium">{project.area_hectares || parsed.area_hectares} ha</p>
              </div>
            </div>
          )}
          
          {/* Current Phase */}
          {currentStage && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <Layers className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Fase Atual</p>
                <p className="text-sm font-medium truncate">{STAGE_CONFIG[currentStage.stage].label}</p>
              </div>
            </div>
          )}
        </div>

        {/* Project Types */}
        {projectTypes.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] uppercase text-muted-foreground font-medium mb-2">Tipos de Projeto</p>
            <div className="flex flex-wrap gap-1.5">
              {projectTypes.map((typeId) => {
                const category = getCategoryBySubtypeId(typeId);
                const label = getSubtypeLabel(typeId);
                const isNewFormat = category !== undefined;
                return (
                  <Badge 
                    key={typeId} 
                    variant="outline" 
                    className="text-xs gap-1"
                  >
                    {isNewFormat && <span>{category?.icon}</span>}
                    <span className="max-w-[150px] truncate">
                      {isNewFormat ? label : typeId}
                    </span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Stages Summary */}
        <div className="flex items-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm">
              <span className="font-semibold">{completedStages}</span>
              <span className="text-muted-foreground"> concluída{completedStages !== 1 ? 's' : ''}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm">
              <span className="font-semibold">{inProgressStages}</span>
              <span className="text-muted-foreground"> em andamento</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm">
              <span className="font-semibold">{stages.length - completedStages - inProgressStages}</span>
              <span className="text-muted-foreground"> pendente{(stages.length - completedStages - inProgressStages) !== 1 ? 's' : ''}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
