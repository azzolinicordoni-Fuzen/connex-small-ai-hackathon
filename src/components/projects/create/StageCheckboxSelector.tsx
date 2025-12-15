import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Hammer, 
  Award, 
  ClipboardCheck, 
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectStageType } from '@/types/project';

const STAGE_CONFIG: Record<ProjectStageType, { 
  label: string; 
  icon: React.ElementType; 
  color: string;
  description: string;
}> = {
  documentos: { 
    label: 'Documentos', 
    icon: FileText, 
    color: 'text-blue-500',
    description: 'Documentação inicial e regularização'
  },
  viabilidade: { 
    label: 'Viabilidade', 
    icon: Search, 
    color: 'text-purple-500',
    description: 'Estudo de viabilidade técnica e econômica'
  },
  desenvolvimento: { 
    label: 'Desenvolvimento', 
    icon: Hammer, 
    color: 'text-orange-500',
    description: 'Desenvolvimento e implementação do projeto'
  },
  certificacao: { 
    label: 'Certificação', 
    icon: Award, 
    color: 'text-green-500',
    description: 'Processo de certificação do projeto'
  },
  auditoria: { 
    label: 'Auditoria', 
    icon: ClipboardCheck, 
    color: 'text-cyan-500',
    description: 'Auditoria e verificação externa'
  },
  venda: { 
    label: 'Venda', 
    icon: DollarSign, 
    color: 'text-emerald-500',
    description: 'Comercialização dos créditos de carbono'
  },
};

const STAGES_ORDER: ProjectStageType[] = [
  'documentos',
  'viabilidade', 
  'desenvolvimento',
  'certificacao',
  'auditoria',
  'venda'
];

export interface StageData {
  selected: boolean;
  notes: string;
  deadline: string;
  progress: number;
  responsavel: string;
  // Stage-specific fields stored as JSON
  metadata: Record<string, any>;
}

interface StageCheckboxSelectorProps {
  stagesData: Record<ProjectStageType, StageData>;
  onChange: (stage: ProjectStageType, data: Partial<StageData>) => void;
}

function StageExpandedFields({ 
  stage, 
  data, 
  onChange 
}: { 
  stage: ProjectStageType; 
  data: StageData; 
  onChange: (updates: Partial<StageData>) => void;
}) {
  const updateMetadata = (key: string, value: any) => {
    onChange({ 
      metadata: { ...data.metadata, [key]: value } 
    });
  };

  const renderStageSpecificFields = () => {
    switch (stage) {
      case 'documentos':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Tipo de Documentação</Label>
              <Select
                value={data.metadata.tipoDocumentacao || ''}
                onValueChange={(v) => updateMetadata('tipoDocumentacao', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">CAR</SelectItem>
                  <SelectItem value="pdd">PDD</SelectItem>
                  <SelectItem value="fundiaria">Documentação Fundiária</SelectItem>
                  <SelectItem value="licenciamento">Licenciamento Ambiental</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Status dos Documentos</Label>
              <Select
                value={data.metadata.statusDocumentos || ''}
                onValueChange={(v) => updateMetadata('statusDocumentos', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'viabilidade':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Estudo de Viabilidade Realizado?</Label>
              <Select
                value={data.metadata.estudoRealizado || ''}
                onValueChange={(v) => updateMetadata('estudoRealizado', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Indicadores Técnicos</Label>
              <Input
                className="h-8 text-xs"
                value={data.metadata.indicadores || ''}
                onChange={(e) => updateMetadata('indicadores', e.target.value)}
                placeholder="Ex: Potencial de sequestro, área elegível..."
              />
            </div>
          </>
        );

      case 'desenvolvimento':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Status do Desenvolvimento</Label>
              <Select
                value={data.metadata.statusDesenvolvimento || ''}
                onValueChange={(v) => updateMetadata('statusDesenvolvimento', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="execucao">Em Execução</SelectItem>
                  <SelectItem value="revisao">Em Revisão</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Prazo Estimado</Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={data.metadata.prazoEstimado || ''}
                onChange={(e) => updateMetadata('prazoEstimado', e.target.value)}
              />
            </div>
          </>
        );

      case 'certificacao':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Padrão de Certificação</Label>
              <Select
                value={data.metadata.padraoCertificacao || ''}
                onValueChange={(v) => updateMetadata('padraoCertificacao', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verra">Verra (VCS)</SelectItem>
                  <SelectItem value="gold_standard">Gold Standard</SelectItem>
                  <SelectItem value="cercarbono">Cercarbono</SelectItem>
                  <SelectItem value="socialcarbon">Social Carbon</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Entidade Certificadora</Label>
              <Input
                className="h-8 text-xs"
                value={data.metadata.entidadeCertificadora || ''}
                onChange={(e) => updateMetadata('entidadeCertificadora', e.target.value)}
                placeholder="Nome da certificadora"
              />
            </div>
          </>
        );

      case 'auditoria':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Auditor Responsável</Label>
              <Input
                className="h-8 text-xs"
                value={data.metadata.auditorResponsavel || ''}
                onChange={(e) => updateMetadata('auditorResponsavel', e.target.value)}
                placeholder="Nome do auditor ou empresa"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Status da Auditoria</Label>
              <Select
                value={data.metadata.statusAuditoria || ''}
                onValueChange={(v) => updateMetadata('statusAuditoria', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_iniciada">Não Iniciada</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Data da Auditoria</Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={data.metadata.dataAuditoria || ''}
                onChange={(e) => updateMetadata('dataAuditoria', e.target.value)}
              />
            </div>
          </>
        );

      case 'venda':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Status da Venda</Label>
              <Select
                value={data.metadata.statusVenda || ''}
                onValueChange={(v) => updateMetadata('statusVenda', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_iniciada">Não Iniciada</SelectItem>
                  <SelectItem value="prospeccao">Prospecção</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="fechada">Fechada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Volume Estimado de Créditos</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={data.metadata.volumeCreditos || ''}
                onChange={(e) => updateMetadata('volumeCreditos', e.target.value)}
                placeholder="tCO2e"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Compradores/Interessados</Label>
              <Input
                className="h-8 text-xs"
                value={data.metadata.compradores || ''}
                onChange={(e) => updateMetadata('compradores', e.target.value)}
                placeholder="Lista de interessados"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pl-8 pr-2 pb-4 space-y-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        {renderStageSpecificFields()}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label className="text-xs">Prazo</Label>
        <Input
          type="date"
          className="h-8 text-xs"
          value={data.deadline}
          onChange={(e) => onChange({ deadline: e.target.value })}
        />
      </div>
    </div>

      <div className="space-y-2">
        <Label className="text-xs">Responsável</Label>
        <Input
          className="h-8 text-xs"
          value={data.responsavel}
          onChange={(e) => onChange({ responsavel: e.target.value })}
          placeholder="Nome do responsável"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Observações/Comentários</Label>
        <Textarea
          className="text-xs min-h-[60px]"
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Adicione observações sobre esta etapa..."
          rows={2}
        />
      </div>
    </div>
  );
}

export default function StageCheckboxSelector({ stagesData, onChange }: StageCheckboxSelectorProps) {
  const [expandedStages, setExpandedStages] = useState<Set<ProjectStageType>>(new Set());

  const toggleExpanded = (stage: ProjectStageType) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
  };

  const handleCheckboxChange = (stage: ProjectStageType, checked: boolean) => {
    onChange(stage, { selected: checked });
    if (checked && !expandedStages.has(stage)) {
      setExpandedStages(prev => new Set([...prev, stage]));
    } else if (!checked) {
      setExpandedStages(prev => {
        const next = new Set(prev);
        next.delete(stage);
        return next;
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-semibold text-foreground">Etapas do Projeto</h3>
        <span className="text-xs text-muted-foreground">
          {Object.values(stagesData).filter(s => s.selected).length} selecionada(s)
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Selecione as etapas que deseja configurar agora. Etapas não selecionadas podem ser adicionadas posteriormente.
      </p>

      <div className="space-y-2">
        {STAGES_ORDER.map((stage) => {
          const config = STAGE_CONFIG[stage];
          const Icon = config.icon;
          const data = stagesData[stage];
          const isExpanded = expandedStages.has(stage) && data.selected;

          return (
            <div 
              key={stage} 
              className={cn(
                "border rounded-lg transition-all duration-200",
                data.selected ? "border-primary/50 bg-primary/5" : "border-border"
              )}
            >
              <div 
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => data.selected && toggleExpanded(stage)}
              >
                <Checkbox
                  id={`stage-${stage}`}
                  checked={data.selected}
                  onCheckedChange={(checked) => handleCheckboxChange(stage, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Icon className={cn("w-4 h-4", config.color)} />
                <div className="flex-1 min-w-0">
                  <Label 
                    htmlFor={`stage-${stage}`}
                    className="text-sm font-medium cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {config.label}
                  </Label>
                  <p className="text-xs text-muted-foreground truncate">
                    {config.description}
                  </p>
                </div>
                {data.selected && (
                  <button
                    type="button"
                    className="p-1 hover:bg-accent rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(stage);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
              
              {isExpanded && (
                <StageExpandedFields
                  stage={stage}
                  data={data}
                  onChange={(updates) => onChange(stage, updates)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
