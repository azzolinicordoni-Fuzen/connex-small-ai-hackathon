import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Globe, Lock, Info } from 'lucide-react';
import { CarbonProject, VisibilityMode, ProjectStageType } from '@/types/project';
import ProjectBasicInfoForm from './create/ProjectBasicInfoForm';
import StageCheckboxSelector, { StageData } from './create/StageCheckboxSelector';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: Partial<CarbonProject> & { stagesData?: Record<ProjectStageType, StageData> }) => Promise<CarbonProject | null>;
}

const INITIAL_STAGE_DATA: StageData = {
  selected: false,
  notes: '',
  deadline: '',
  progress: 0,
  responsavel: '',
  metadata: {},
};

const STAGES_ORDER: ProjectStageType[] = [
  'documentos',
  'viabilidade', 
  'desenvolvimento',
  'certificacao',
  'auditoria',
  'venda'
];

export default function CreateProjectDialog({ open, onOpenChange, onCreate }: CreateProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    description: '',
    objetivo: '',
    project_types: [] as string[],
    country: 'Brasil',
    state: '',
    municipality: '',
    bioma: '',
    status: 'em_andamento',
  });

  const [stagesData, setStagesData] = useState<Record<ProjectStageType, StageData>>(
    STAGES_ORDER.reduce((acc, stage) => ({
      ...acc,
      [stage]: { ...INITIAL_STAGE_DATA },
    }), {} as Record<ProjectStageType, StageData>)
  );

  const [isOnline, setIsOnline] = useState(false);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('private');

  const handleBasicInfoChange = (updates: Partial<typeof basicInfo>) => {
    setBasicInfo(prev => ({ ...prev, ...updates }));
  };

  const handleStageChange = (stage: ProjectStageType, updates: Partial<StageData>) => {
    setStagesData(prev => ({
      ...prev,
      [stage]: { ...prev[stage], ...updates },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicInfo.name.trim() || !basicInfo.objetivo.trim() || !basicInfo.description.trim()) return;

    setLoading(true);
    
    // Build location string
    const locationParts = [basicInfo.municipality, basicInfo.state, basicInfo.country].filter(Boolean);
    const location = locationParts.join(', ');

    // Build structured description with objetivo, bioma and project_types
    const structuredDescription = JSON.stringify({
      objetivo: basicInfo.objetivo,
      descricao: basicInfo.description,
      bioma: basicInfo.bioma,
      status: basicInfo.status,
      project_types: basicInfo.project_types,
    });

    // For backwards compatibility, store primary type in project_type field
    const primaryType = basicInfo.project_types.length > 0 ? basicInfo.project_types[0] : null;

    const result = await onCreate({
      name: basicInfo.name,
      description: structuredDescription,
      location: location || null,
      project_type: primaryType,
      is_online: isOnline,
      visibility_mode: visibilityMode,
      stagesData,
    });

    if (result) {
      // Reset form
      setBasicInfo({
        name: '',
        description: '',
        objetivo: '',
        project_types: [],
        country: 'Brasil',
        state: '',
        municipality: '',
        bioma: '',
        status: 'em_andamento',
      });
      setStagesData(
        STAGES_ORDER.reduce((acc, stage) => ({
          ...acc,
          [stage]: { ...INITIAL_STAGE_DATA },
        }), {} as Record<ProjectStageType, StageData>)
      );
      setIsOnline(false);
      setVisibilityMode('private');
      onOpenChange(false);
    }
    setLoading(false);
  };

  const selectedStagesCount = Object.values(stagesData).filter(s => s.selected).length;
  const isFormValid = basicInfo.name.trim() && basicInfo.objetivo.trim() && basicInfo.description.trim() && basicInfo.project_types.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle>Novo Projeto de Créditos de Carbono</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Preencha as informações básicas e selecione as etapas que deseja configurar
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Basic Information */}
            <ProjectBasicInfoForm 
              formData={basicInfo}
              onChange={handleBasicInfoChange}
            />

            <Separator />

            {/* Stage Selection */}
            <StageCheckboxSelector
              stagesData={stagesData}
              onChange={handleStageChange}
            />

            <Separator />

            {/* Visibility Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">Visibilidade</h3>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="is_online"
                  checked={isOnline}
                  onCheckedChange={(checked) => {
                    setIsOnline(checked as boolean);
                    setVisibilityMode(checked ? 'public' : 'private');
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor="is_online" className="flex items-center gap-2 cursor-pointer font-medium">
                    {isOnline ? (
                      <Globe className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    Disponibilizar projeto online
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isOnline 
                      ? 'O projeto aparecerá na aba "Conexões → Projetos em andamento"'
                      : 'O projeto será privado e não aparecerá para conexões'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Você pode alterar a visibilidade e configurar quais etapas ficam visíveis depois de criar o projeto, clicando em "Editar Processo".
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-t bg-muted/30">
            <div className="text-xs text-muted-foreground">
              {selectedStagesCount > 0 
                ? `${selectedStagesCount} etapa(s) selecionada(s)`
                : 'Nenhuma etapa selecionada'
              }
              {basicInfo.project_types.length > 0 && (
                <span className="ml-2">• {basicInfo.project_types.length} tipo(s)</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            <Button 
              type="submit" 
              disabled={loading || !isFormValid}
            >
                {loading ? 'Criando...' : 'Criar Projeto'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
