import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PROJECT_TYPES = [
  'REDD+',
  'ARR (Reflorestamento)',
  'IFM',
  'Agricultura Regenerativa',
  'Energia Renovável',
  'Gestão de Resíduos',
  'Conservação de Solo',
  'Outro',
];

const BIOMAS = [
  'Amazônia',
  'Cerrado',
  'Mata Atlântica',
  'Caatinga',
  'Pampa',
  'Pantanal',
  'Outro',
];

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
  'SP', 'SE', 'TO'
];

interface ProjectBasicInfoFormProps {
  formData: {
    name: string;
    description: string;
    objetivo: string;
    project_type: string;
    country: string;
    state: string;
    municipality: string;
    bioma: string;
    status: string;
  };
  onChange: (data: Partial<ProjectBasicInfoFormProps['formData']>) => void;
}

export default function ProjectBasicInfoForm({ formData, onChange }: ProjectBasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground border-b pb-2">Informações Básicas</h3>
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Projeto *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ex: Projeto REDD+ Amazônia"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Projeto *</Label>
          <Select
            value={formData.project_type}
            onValueChange={(value) => onChange({ project_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Bioma *</Label>
          <Select
            value={formData.bioma}
            onValueChange={(value) => onChange({ bioma: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o bioma" />
            </SelectTrigger>
            <SelectContent>
              {BIOMAS.map((bioma) => (
                <SelectItem key={bioma} value={bioma}>
                  {bioma}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>País</Label>
          <Input
            value={formData.country}
            onChange={(e) => onChange({ country: e.target.value })}
            placeholder="Brasil"
            defaultValue="Brasil"
          />
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={formData.state}
            onValueChange={(value) => onChange({ state: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_BRASIL.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Município</Label>
          <Input
            value={formData.municipality}
            onChange={(e) => onChange({ municipality: e.target.value })}
            placeholder="Cidade"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status do Projeto</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => onChange({ status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="objetivo">Objetivo do Projeto *</Label>
        <Textarea
          id="objetivo"
          value={formData.objetivo}
          onChange={(e) => onChange({ objetivo: e.target.value })}
          placeholder="Qual o objetivo principal deste projeto de créditos de carbono?"
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição Resumida *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Descreva brevemente o projeto, suas características e diferenciais..."
          rows={3}
          required
        />
      </div>
    </div>
  );
}
