import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Globe, Lock, Eye, EyeOff, Info } from 'lucide-react';
import { CarbonProject, ProjectStage, STAGE_CONFIG, VisibilityMode, ProjectStageType } from '@/types/project';
import { toast } from 'sonner';

interface EditVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CarbonProject;
  stages: ProjectStage[];
  onSave: (
    visibilityMode: VisibilityMode,
    isOnline: boolean,
    stageVisibility: Record<string, boolean>
  ) => Promise<void>;
}

export default function EditVisibilityDialog({
  open,
  onOpenChange,
  project,
  stages,
  onSave,
}: EditVisibilityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>(project.visibility_mode || 'private');
  const [stageVisibility, setStageVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize stage visibility from stages
    const visibility: Record<string, boolean> = {};
    stages.forEach((stage) => {
      visibility[stage.id] = stage.is_visible || false;
    });
    setStageVisibility(visibility);
    setVisibilityMode(project.visibility_mode || 'private');
  }, [stages, project]);

  const handleVisibilityModeChange = (mode: VisibilityMode) => {
    setVisibilityMode(mode);
    
    // Auto-update stage visibility based on mode
    const newVisibility: Record<string, boolean> = {};
    stages.forEach((stage) => {
      if (mode === 'public') {
        newVisibility[stage.id] = true;
      } else if (mode === 'private') {
        newVisibility[stage.id] = false;
      } else {
        // Keep existing for partial
        newVisibility[stage.id] = stageVisibility[stage.id] || false;
      }
    });
    setStageVisibility(newVisibility);
  };

  const handleStageVisibilityChange = (stageId: string, visible: boolean) => {
    setStageVisibility((prev) => ({
      ...prev,
      [stageId]: visible,
    }));
    
    // Auto-adjust visibility mode based on selections
    const newVisibility = { ...stageVisibility, [stageId]: visible };
    const allVisible = stages.every((s) => newVisibility[s.id]);
    const noneVisible = stages.every((s) => !newVisibility[s.id]);
    
    if (allVisible) {
      setVisibilityMode('public');
    } else if (noneVisible) {
      setVisibilityMode('private');
    } else {
      setVisibilityMode('partial');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const isOnline = visibilityMode !== 'private';
      await onSave(visibilityMode, isOnline, stageVisibility);
      toast.success('Configurações de visibilidade atualizadas');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const getVisibleCount = () => {
    return Object.values(stageVisibility).filter(Boolean).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Editar Processo - Visibilidade
          </DialogTitle>
          <DialogDescription>
            Configure quais informações do projeto ficam disponíveis para conexões
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visibility Mode Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Modo de Visibilidade</Label>
            <RadioGroup
              value={visibilityMode}
              onValueChange={(value) => handleVisibilityModeChange(value as VisibilityMode)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="private" id="private" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer font-medium">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Não disponibilizar online
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    O projeto não aparecerá na aba Conexões
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="partial" id="partial" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="partial" className="flex items-center gap-2 cursor-pointer font-medium">
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                    Disponibilizar parcialmente
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecione quais etapas ficam visíveis
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="public" id="public" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer font-medium">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Disponibilizar completamente
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Todas as etapas ficam visíveis para conexões
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Stage Visibility Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Visibilidade por Etapa</Label>
              <Badge variant={visibilityMode === 'private' ? 'secondary' : 'default'}>
                {getVisibleCount()} de {stages.length} visíveis
              </Badge>
            </div>

            <div className="space-y-2">
              {stages.map((stage) => {
                const config = STAGE_CONFIG[stage.stage as ProjectStageType];
                const isVisible = stageVisibility[stage.id] || false;
                
                return (
                  <div
                    key={stage.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isVisible ? 'bg-primary/5 border-primary/20' : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={stage.id}
                        checked={isVisible}
                        onCheckedChange={(checked) =>
                          handleStageVisibilityChange(stage.id, checked as boolean)
                        }
                        disabled={visibilityMode === 'private'}
                      />
                      <Label
                        htmlFor={stage.id}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <span className={`w-2 h-2 rounded-full bg-${config.color}-500`} />
                        {config.label}
                      </Label>
                    </div>
                    {isVisible ? (
                      <Eye className="w-4 h-4 text-primary" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Como funciona?</p>
              <p>
                Quando disponibilizado online, seu projeto aparecerá na aba "Conexões → Projetos em andamento".
                Conexões poderão ver apenas as etapas que você autorizar.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
