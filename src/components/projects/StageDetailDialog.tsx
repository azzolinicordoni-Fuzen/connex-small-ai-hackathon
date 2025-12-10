import { useState, useEffect } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Calendar, Users, MessageSquare, Settings, Trash2, X
} from 'lucide-react';
import { ProjectStage, STAGE_CONFIG, STATUS_CONFIG, StageStatus } from '@/types/project';
import { useStageMembers } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StageDetailDialogProps {
  stage: ProjectStage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<ProjectStage>) => void;
  projectId: string;
}

export default function StageDetailDialog({ 
  stage, 
  open, 
  onOpenChange, 
  onUpdate,
  projectId 
}: StageDetailDialogProps) {
  const [status, setStatus] = useState<StageStatus>(stage.status);
  const [progress, setProgress] = useState(stage.progress_percentage);
  const [deadline, setDeadline] = useState(stage.deadline?.split('T')[0] || '');
  const [notes, setNotes] = useState(stage.notes || '');
  const [availableConnections, setAvailableConnections] = useState<any[]>([]);
  
  const { members, addMember, removeMember } = useStageMembers(stage.id);
  const config = STAGE_CONFIG[stage.stage];

  useEffect(() => {
    fetchAvailableConnections();
  }, []);

  const fetchAvailableConnections = async () => {
    try {
      // Get all accepted connections for the project owner
      const { data: projectData } = await supabase
        .from('carbon_projects')
        .select('profile_id')
        .eq('id', projectId)
        .single();

      if (!projectData) return;

      const { data: connections } = await supabase
        .from('connections')
        .select(`
          id,
          requester:profiles!connections_requester_id_fkey(id, name, avatar_url, agent_type),
          addressee:profiles!connections_addressee_id_fkey(id, name, avatar_url, agent_type)
        `)
        .or(`requester_id.eq.${projectData.profile_id},addressee_id.eq.${projectData.profile_id}`)
        .eq('status', 'accepted');

      if (connections) {
        const profiles = connections.map(conn => {
          const isRequester = conn.requester?.id === projectData.profile_id;
          return isRequester ? conn.addressee : conn.requester;
        }).filter(Boolean);
        
        setAvailableConnections(profiles);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSave = () => {
    onUpdate({
      status,
      progress_percentage: progress,
      deadline: deadline ? `${deadline}T00:00:00Z` : null,
      notes,
      started_at: status === 'em_andamento' && !stage.started_at ? new Date().toISOString() : stage.started_at,
      completed_at: status === 'concluida' ? new Date().toISOString() : null,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-primary');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-primary');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-primary');
    const profileId = e.dataTransfer.getData('profileId');
    if (profileId) {
      addMember(profileId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{config.label}</span>
            <Badge variant={status === 'concluida' ? 'emerald' : 'secondary'}>
              {STATUS_CONFIG[status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="gap-1">
              <Settings className="w-4 h-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1">
              <Users className="w-4 h-4" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1">
              <MessageSquare className="w-4 h-4" />
              Comentários
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                  value={status}
                  onValueChange={(val) => setStatus(val as StageStatus)}
                  className="flex gap-2"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${
                        status === key ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <RadioGroupItem value={key} />
                      <span className="text-sm">{cfg.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Progresso</Label>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Slider
                  value={[progress]}
                  onValueChange={(val) => setProgress(val[0])}
                  max={100}
                  step={5}
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Prazo
                </Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione notas sobre esta etapa..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4 mt-4">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
              >
                <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arraste conexões aqui para adicionar membros
                </p>
              </div>

              {/* Current Members */}
              <div className="space-y-2">
                <Label>Membros da Etapa</Label>
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum membro adicionado</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.profile?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.profile?.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role || 'Membro'}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember(member.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Connections */}
              <div className="space-y-2">
                <Label>Conexões Disponíveis</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableConnections.map((profile) => (
                    <div
                      key={profile.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('profileId', profile.id);
                      }}
                      className="flex items-center gap-2 p-2 border rounded-lg cursor-grab hover:bg-muted/50 active:cursor-grabbing"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback>{profile.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">{profile.name}</span>
                    </div>
                  ))}
                </div>
                {availableConnections.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma conexão disponível. Adicione conexões na página de Conexões.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                Comentários desta etapa aparecerão aqui.
                Use o chat do projeto para comentários gerais.
              </p>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
