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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CarbonProject } from '@/types/project';

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
    });

    if (result) {
      setFormData({ name: '', description: '', location: '', area_hectares: '', project_type: '' });
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
