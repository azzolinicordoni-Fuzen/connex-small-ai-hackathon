import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Archive, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conversation, CONTEXT_CATEGORIES } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.other_participant?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      conv.last_message_preview?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'archived') {
      return conv.settings?.archived && matchesSearch;
    }
    
    return !conv.settings?.archived && matchesSearch;
  });

  const getCategoryLabel = (value: string) => {
    return CONTEXT_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  return (
    <div className="flex flex-col h-full border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Mensagens</h2>
          <Button size="sm" variant="outline" onClick={onNewConversation}>
            <MessageSquarePlus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid grid-cols-2">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="archived" className="gap-1">
            <Archive className="w-3 h-3" />
            Arquivadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 overflow-auto m-0 p-0">
          <ConversationItems
            conversations={filteredConversations}
            selectedId={selectedId}
            onSelect={onSelect}
            getCategoryLabel={getCategoryLabel}
          />
        </TabsContent>

        <TabsContent value="archived" className="flex-1 overflow-auto m-0 p-0">
          <ConversationItems
            conversations={filteredConversations}
            selectedId={selectedId}
            onSelect={onSelect}
            getCategoryLabel={getCategoryLabel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ConversationItemsProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  getCategoryLabel: (value: string) => string;
}

function ConversationItems({
  conversations,
  selectedId,
  onSelect,
  getCategoryLabel,
}: ConversationItemsProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Nenhuma conversa encontrada</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            'w-full p-4 text-left hover:bg-secondary/50 transition-colors',
            selectedId === conv.id && 'bg-secondary',
            conv.unread_count && conv.unread_count > 0 && 'bg-primary/5'
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={conv.other_participant?.avatar_url || undefined} />
              <AvatarFallback>
                {conv.other_participant?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={cn(
                  'font-medium text-sm truncate',
                  conv.unread_count && conv.unread_count > 0 && 'font-semibold'
                )}>
                  {conv.other_participant?.name || 'Usuário'}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(conv.last_message_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-1">
                {agentTypeLabels[conv.other_participant?.agent_type || ''] || 'Usuário'}
              </p>
              
              <div className="flex items-center gap-2">
                <p className={cn(
                  'text-sm truncate flex-1',
                  conv.unread_count && conv.unread_count > 0 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground'
                )}>
                  {conv.last_message_preview || 'Nenhuma mensagem'}
                </p>
                
                {conv.unread_count && conv.unread_count > 0 && (
                  <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                    {conv.unread_count}
                  </Badge>
                )}
              </div>
              
              {/* Context badges */}
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {getCategoryLabel(conv.context_category)}
                </Badge>
                {conv.project && (
                  <Badge variant="outline" className="text-xs">
                    {conv.project.name}
                  </Badge>
                )}
                {conv.settings?.muted && (
                  <Badge variant="outline" className="text-xs">
                    Silenciada
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}