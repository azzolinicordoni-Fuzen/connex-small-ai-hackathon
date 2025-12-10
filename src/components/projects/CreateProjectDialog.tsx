import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Lock, Info } from 'lucide-react';
import { CarbonProject, VisibilityMode } from '@/types/project';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: Partial<CarbonProject>) => Promise<CarbonProject | null>;
}

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

export default function CreateProjectDialog({ open, onOpenChange, onCreate }: CreateProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    area_hectares: '',
    project_type: '',
    is_online: false,
    visibility_mode: 'private' as VisibilityMode,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    const result = await onCreate({
      name: formData.name,
      description: formData.description || null,
      location: formData.location || null,
      area_hectares: formData.area_hectares ? Number(formData.area_hectares) : null,
      project_type: formData.project_type || null,
      is_online: formData.is_online,
      visibility_mode: formData.visibility_mode,
    });

    if (result) {
      setFormData({ 
        name: '', 
        description: '', 
        location: '', 
        area_hectares: '', 
        project_type: '',
        is_online: false,
        visibility_mode: 'private',
      });
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Projeto de Carbono</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Projeto REDD+ Amazônia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva brevemente o projeto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Pará, Brasil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área (hectares)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area_hectares}
                onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                placeholder="Ex: 5000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Projeto</Label>
            <Select
              value={formData.project_type}
              onValueChange={(value) => setFormData({ ...formData, project_type: value })}
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

          <Separator />

          {/* Visibility Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Visibilidade do Projeto</Label>
            
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <Checkbox
                id="is_online"
                checked={formData.is_online}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  is_online: checked as boolean,
                  visibility_mode: checked ? 'public' : 'private',
                })}
              />
              <div className="flex-1">
                <Label htmlFor="is_online" className="flex items-center gap-2 cursor-pointer font-medium">
                  {formData.is_online ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  Disponibilizar projeto online
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.is_online 
                    ? 'O projeto aparecerá na aba "Conexões → Projetos em andamento"'
                    : 'O projeto será privado e não aparecerá para conexões'
                  }
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Você pode alterar a visibilidade e selecionar quais etapas ficam visíveis depois de criar o projeto, clicando em "Editar Processo".
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
