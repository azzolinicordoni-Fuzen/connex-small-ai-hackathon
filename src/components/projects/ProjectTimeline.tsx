import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, Search, Hammer, Award, ClipboardCheck, DollarSign,
  Calendar, Users, ChevronRight, Plus
} from 'lucide-react';
import { ProjectStage, STAGE_CONFIG, STATUS_CONFIG, ProjectStageType } from '@/types/project';
import { cn } from '@/lib/utils';
import StageDetailDialog from './StageDetailDialog';

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

export default function ProjectTimeline({ stages, onStageUpdate, projectId }: ProjectTimelineProps) {
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null);

  const sortedStages = [...stages].sort((a, b) => 
    STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
  );

  const overallProgress = stages.length > 0
    ? Math.round(stages.reduce((sum, s) => sum + s.progress_percentage, 0) / stages.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500';
      case 'em_andamento': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

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
      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Horizontal Timeline Line */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-border hidden md:block" />
        
        {/* Mobile: Vertical Layout, Desktop: Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {sortedStages.map((stage, index) => {
            const config = STAGE_CONFIG[stage.stage];
            const Icon = STAGE_ICONS[stage.stage];
            const statusConfig = STATUS_CONFIG[stage.status];
            const deadlineStatus = getDeadlineStatus(stage.deadline);

            return (
              <div key={stage.id} className="relative">
                {/* Desktop: Connection dot */}
                <div className={cn(
                  "hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background z-10",
                  getStatusColor(stage.status)
                )} />

                {/* Mobile: Left connection line */}
                {index > 0 && (
                  <div className="md:hidden absolute -top-4 left-6 w-0.5 h-4 bg-border" />
                )}

                <Card 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
                    stage.status === 'concluida' && "border-green-500/50",
                    stage.status === 'em_andamento' && "border-yellow-500/50"
                  )}
                  onClick={() => setSelectedStage(stage)}
                >
                  <CardContent className="p-4">
                    {/* Stage Icon & Name */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        stage.status === 'concluida' ? 'bg-green-100 text-green-600' :
                        stage.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-muted text-muted-foreground'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{config.label}</span>
                    </div>

                    {/* Status Badge */}
                    <Badge 
                      variant={stage.status === 'concluida' ? 'emerald' : 'secondary'}
                      className="mb-2"
                    >
                      {statusConfig.label}
                    </Badge>

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progresso</span>
                        <span>{stage.progress_percentage}%</span>
                      </div>
                      <Progress value={stage.progress_percentage} className="h-1.5" />
                    </div>

                    {/* Deadline */}
                    {deadlineStatus && (
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3" />
                        <Badge variant={deadlineStatus.color} className="text-xs">
                          {deadlineStatus.text}
                        </Badge>
                      </div>
                    )}

                    {/* View Details */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2 text-xs"
                    >
                      Detalhes <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
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
