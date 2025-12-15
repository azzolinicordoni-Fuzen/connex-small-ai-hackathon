import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, Search, Hammer, Award, ClipboardCheck, DollarSign,
  Calendar, ChevronRight, User, Lock, CheckCircle2, Circle, ArrowRight
} from 'lucide-react';
import { ProjectStage, STAGE_CONFIG, STATUS_CONFIG, ProjectStageType } from '@/types/project';
import { cn } from '@/lib/utils';
import StageDetailDialog from './StageDetailDialog';
import { useProjectAllStageMembers } from '@/hooks/useProjects';

interface ProjectTimelineProps {
  stages: ProjectStage[];
  onStageUpdate: (stageId: string, updates: Partial<ProjectStage>) => void;
  projectId: string;
}

const STAGE_ICONS: Record<ProjectStageType, typeof FileText> = {
  documentos: FileText,
  viabilidade: Search,
  desenvolvimento: Hammer,
  certificacao: Award,
  auditoria: ClipboardCheck,
  venda: DollarSign,
};

const STAGE_ORDER: ProjectStageType[] = [
  'documentos',
  'viabilidade',
  'desenvolvimento',
  'certificacao',
  'auditoria',
  'venda',
];

const AGENT_TYPE_LABELS: Record<string, string> = {
  proprietario: 'Proprietário',
  engenheiro: 'Engenheiro',
  desenvolvedor: 'Desenvolvedor',
  certificadora: 'Certificadora',
  investidor: 'Investidor',
  projeto: 'Projeto',
  comprador: 'Comprador',
  auditor: 'Auditor',
  financeira: 'Financeira',
  advogado: 'Advogado',
  outro: 'Outro',
};

export default function ProjectTimeline({ stages, onStageUpdate, projectId }: ProjectTimelineProps) {
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null);
  const { membersByStage, refetch: refetchMembers } = useProjectAllStageMembers(projectId);

  const sortedStages = [...stages].sort((a, b) => 
    STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
  );

  // Find the next stage that can be unlocked
  const getNextUnlockableStage = () => {
    for (let i = 0; i < sortedStages.length; i++) {
      if (sortedStages[i].status === 'pendente') {
        // Check if previous stage is completed or in progress
        if (i === 0 || sortedStages[i - 1].status !== 'pendente') {
          return sortedStages[i].id;
        }
      }
    }
    return null;
  };

  const nextUnlockableId = getNextUnlockableStage();

  // Check if a stage is locked (cannot be edited because previous stages are pending)
  const isStageBlocked = (index: number) => {
    if (index === 0) return false;
    // A stage is blocked if ANY previous stage is still pending
    for (let i = 0; i < index; i++) {
      if (sortedStages[i].status === 'pendente') {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (!selectedStage) {
      refetchMembers();
    }
  }, [selectedStage, refetchMembers]);

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Atrasado', color: 'destructive' as const };
    if (diffDays <= 7) return { text: `${diffDays}d restantes`, color: 'secondary' as const };
    return { text: new Date(deadline).toLocaleDateString('pt-BR'), color: 'outline' as const };
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Timeline - Desktop */}
      <div className="hidden md:block">
        {/* Timeline connector line */}
        <div className="relative px-8">
          <div className="absolute top-8 left-8 right-8 h-1 bg-border rounded-full overflow-hidden">
            {/* Progress fill */}
            <div 
              className="absolute h-full bg-green-500 transition-all duration-500"
              style={{ 
                width: `${(sortedStages.filter(s => s.status === 'concluida').length / sortedStages.length) * 100}%` 
              }}
            />
          </div>
          
          {/* Stage nodes */}
          <div className="flex justify-between relative">
            {sortedStages.map((stage, index) => {
              const config = STAGE_CONFIG[stage.stage];
              const Icon = STAGE_ICONS[stage.stage];
              const stageMembers = membersByStage[stage.id] || [];
              const isBlocked = isStageBlocked(index);
              const isNextUnlockable = stage.id === nextUnlockableId;
              const deadlineStatus = getDeadlineStatus(stage.deadline);

              return (
                <div key={stage.id} className="flex flex-col items-center" style={{ width: `${100/6}%` }}>
                  {/* Status indicator node */}
                  <div 
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all z-10 bg-background",
                      stage.status === 'concluida' && "border-green-500 bg-green-50",
                      stage.status === 'em_andamento' && "border-yellow-500 bg-yellow-50",
                      stage.status === 'pendente' && !isBlocked && "border-gray-300 bg-gray-50",
                      stage.status === 'pendente' && isBlocked && "border-gray-200 bg-gray-100 opacity-60",
                      isNextUnlockable && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {stage.status === 'concluida' ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : stage.status === 'em_andamento' ? (
                      <Icon className="w-6 h-6 text-yellow-600" />
                    ) : isBlocked ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Stage label */}
                  <span className={cn(
                    "text-sm font-semibold mt-3 text-center",
                    stage.status === 'concluida' && "text-green-600",
                    stage.status === 'em_andamento' && "text-yellow-600",
                    stage.status === 'pendente' && "text-muted-foreground",
                    isBlocked && "opacity-60"
                  )}>
                    {config.label}
                  </span>

                  {/* Status badge */}
                  <Badge 
                    variant={
                      stage.status === 'concluida' ? 'emerald' : 
                      stage.status === 'em_andamento' ? 'secondary' : 
                      'outline'
                    }
                    className={cn("text-[10px] mt-1", isBlocked && "opacity-60")}
                  >
                    {STATUS_CONFIG[stage.status].label}
                  </Badge>

                  {/* Responsible members */}
                  {stageMembers.length > 0 && (
                    <div className="flex -space-x-2 mt-2">
                      {stageMembers.slice(0, 3).map((member) => (
                        <Avatar 
                          key={member.id} 
                          className="w-6 h-6 border-2 border-background"
                          title={member.profile?.name}
                        >
                          <AvatarImage src={member.profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {member.profile?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {stageMembers.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[8px] border-2 border-background">
                          +{stageMembers.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Deadline */}
                  {deadlineStatus && !isBlocked && (
                    <Badge variant={deadlineStatus.color} className="text-[9px] mt-1">
                      {deadlineStatus.text}
                    </Badge>
                  )}

                  {/* Next unlockable indicator */}
                  {isNextUnlockable && (
                    <Badge variant="default" className="text-[9px] mt-2 animate-pulse">
                      Próxima etapa
                    </Badge>
                  )}

                  {/* View details button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("text-xs mt-2", isBlocked && "opacity-60")}
                    onClick={() => !isBlocked && setSelectedStage(stage)}
                    disabled={isBlocked}
                  >
                    {isBlocked ? 'Bloqueada' : 'Detalhes'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Card Layout */}
      <div className="md:hidden space-y-3">
        {sortedStages.map((stage, index) => {
          const config = STAGE_CONFIG[stage.stage];
          const Icon = STAGE_ICONS[stage.stage];
          const stageMembers = membersByStage[stage.id] || [];
          const isBlocked = isStageBlocked(index);
          const isNextUnlockable = stage.id === nextUnlockableId;
          const deadlineStatus = getDeadlineStatus(stage.deadline);

          return (
            <div key={stage.id} className="relative">
              {/* Connector line */}
              {index > 0 && (
                <div className={cn(
                  "absolute -top-3 left-6 w-0.5 h-3",
                  sortedStages[index - 1].status === 'concluida' ? "bg-green-500" : "bg-border"
                )} />
              )}
              
              <Card 
                className={cn(
                  "transition-all",
                  stage.status === 'concluida' && "border-green-500/50 bg-green-50/30",
                  stage.status === 'em_andamento' && "border-yellow-500/50 bg-yellow-50/30",
                  stage.status === 'pendente' && !isBlocked && "border-border",
                  isBlocked && "opacity-60 bg-muted/50",
                  isNextUnlockable && "ring-2 ring-primary",
                  !isBlocked && "cursor-pointer hover:shadow-md"
                )}
                onClick={() => !isBlocked && setSelectedStage(stage)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      stage.status === 'concluida' && "bg-green-100 text-green-600",
                      stage.status === 'em_andamento' && "bg-yellow-100 text-yellow-600",
                      stage.status === 'pendente' && "bg-muted text-muted-foreground"
                    )}>
                      {isBlocked ? (
                        <Lock className="w-5 h-5" />
                      ) : stage.status === 'concluida' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-base">{config.label}</span>
                        <Badge 
                          variant={
                            stage.status === 'concluida' ? 'emerald' : 
                            stage.status === 'em_andamento' ? 'secondary' : 
                            'outline'
                          }
                          className="text-xs"
                        >
                          {STATUS_CONFIG[stage.status].label}
                        </Badge>
                      </div>

                      {/* Members */}
                      {stageMembers.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {stageMembers.map(m => m.profile?.name?.split(' ')[0]).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Deadline & Next indicator */}
                      <div className="flex items-center gap-2 mt-2">
                        {deadlineStatus && !isBlocked && (
                          <Badge variant={deadlineStatus.color} className="text-[10px]">
                            <Calendar className="w-3 h-3 mr-1" />
                            {deadlineStatus.text}
                          </Badge>
                        )}
                        {isNextUnlockable && (
                          <Badge variant="default" className="text-[10px] animate-pulse">
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Próxima
                          </Badge>
                        )}
                      </div>
                    </div>

                    {!isBlocked && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Stage Detail Dialog */}
      {selectedStage && (
        <StageDetailDialog
          stage={selectedStage}
          open={!!selectedStage}
          onOpenChange={(open) => !open && setSelectedStage(null)}
          onUpdate={(updates) => {
            onStageUpdate(selectedStage.id, updates);
            setSelectedStage(null);
          }}
          projectId={projectId}
        />
      )}
    </div>
  );
}
