import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CONTEXT_CATEGORIES } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';

const agentTypeLabels: Record<string, string> = {
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

interface Connection {
  id: string;
  name: string;
  avatar_url: string | null;
  agent_type: string;
}

interface Project {
  id: string;
  name: string;
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string | null;
  onCreateConversation: (
    otherProfileId: string,
    contextCategory: string,
    projectId?: string
  ) => Promise<string | null>;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  profileId,
  onCreateConversation,
}: NewConversationDialogProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [contextCategory, setContextCategory] = useState('geral');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !profileId) return;

    async function fetchConnections() {
      setLoading(true);
      
      // Fetch accepted connections
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`);

      if (connectionsData) {
        const connectionIds = connectionsData.map(c => 
          c.requester_id === profileId ? c.addressee_id : c.requester_id
        );

        if (connectionIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, agent_type')
            .in('id', connectionIds);

          setConnections(profiles || []);
        }
      }

      // Fetch user's projects
      const { data: projectsData } = await supabase
        .from('carbon_projects')
        .select('id, name')
        .eq('profile_id', profileId);

      setProjects(projectsData || []);
      setLoading(false);
    }

    fetchConnections();
  }, [open, profileId]);

  const filteredConnections = connections.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!selectedConnection) return;
    
    setCreating(true);
    const conversationId = await onCreateConversation(
      selectedConnection.id,
      contextCategory,
      selectedProject || undefined
    );
    
    setCreating(false);
    
    if (conversationId) {
      onOpenChange(false);
      setSelectedConnection(null);
      setContextCategory('geral');
      setSelectedProject('');
      setSearchTerm('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
          <DialogDescription>
            Selecione uma conexão para iniciar uma conversa profissional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conexões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Connections list */}
          <div className="space-y-2">
            <Label>Selecione uma conexão</Label>
            <ScrollArea className="h-48 border rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : filteredConnections.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {connections.length === 0 
                    ? 'Você ainda não tem conexões. Conecte-se com outros usuários primeiro.'
                    : 'Nenhuma conexão encontrada.'}
                </div>
              ) : (
                <div className="p-1">
                  {filteredConnections.map((connection) => (
                    <button
                      key={connection.id}
                      onClick={() => setSelectedConnection(connection)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors',
                        selectedConnection?.id === connection.id && 'bg-secondary'
                      )}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={connection.avatar_url || undefined} />
                        <AvatarFallback>
                          {connection.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">{connection.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {agentTypeLabels[connection.agent_type] || 'Usuário'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Context category */}
          <div className="space-y-2">
            <Label>Contexto da conversa</Label>
            <Select value={contextCategory} onValueChange={setContextCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTEXT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project (optional) */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <Label>Vincular a projeto (opcional)</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!selectedConnection || creating}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Iniciar Conversa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}