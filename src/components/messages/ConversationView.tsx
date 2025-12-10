import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Send, 
  MoreVertical, 
  Archive, 
  ArchiveRestore,
  BellOff, 
  Bell,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conversation, Message, CONTEXT_CATEGORIES } from '@/hooks/useMessages';
import { format } from 'date-fns';
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

interface ConversationViewProps {
  conversation: Conversation;
  messages: Message[];
  loading: boolean;
  profileId: string;
  onSendMessage: (content: string) => Promise<boolean>;
  onUpdateSettings: (settings: { archived?: boolean; muted?: boolean }) => void;
  onBack?: () => void;
}

export function ConversationView({
  conversation,
  messages,
  loading,
  profileId,
  onSendMessage,
  onUpdateSettings,
  onBack,
}: ConversationViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    const success = await onSendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getCategoryLabel = (value: string) => {
    return CONTEXT_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const isArchived = conversation.settings?.archived;
  const isMuted = conversation.settings?.muted;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.other_participant?.avatar_url || undefined} />
          <AvatarFallback>
            {conversation.other_participant?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">
            {conversation.other_participant?.name || 'Usuário'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {agentTypeLabels[conversation.other_participant?.agent_type || ''] || 'Usuário'}
          </p>
        </div>

        {/* Context info */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="secondary">
            {getCategoryLabel(conversation.context_category)}
          </Badge>
          {conversation.project && (
            <Badge variant="outline" className="gap-1">
              <FolderOpen className="w-3 h-3" />
              {conversation.project.name}
            </Badge>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onUpdateSettings({ muted: !isMuted })}
            >
              {isMuted ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Ativar notificações
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  Silenciar conversa
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onUpdateSettings({ archived: !isArchived })}
            >
              {isArchived ? (
                <>
                  <ArchiveRestore className="w-4 h-4 mr-2" />
                  Desarquivar
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 mr-2" />
                  Arquivar conversa
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile context badges */}
      <div className="sm:hidden p-2 border-b border-border flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {getCategoryLabel(conversation.context_category)}
        </Badge>
        {conversation.project && (
          <Badge variant="outline" className="text-xs gap-1">
            <FolderOpen className="w-3 h-3" />
            {conversation.project.name}
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === profileId;
              const showDate = index === 0 || 
                format(new Date(message.created_at), 'yyyy-MM-dd') !== 
                format(new Date(messages[index - 1].created_at), 'yyyy-MM-dd');
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                        {format(new Date(message.created_at), "d 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  <div className={cn(
                    'flex gap-3',
                    isOwn && 'flex-row-reverse'
                  )}>
                    {!isOwn && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={message.sender?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {message.sender?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      'max-w-[75%] space-y-1',
                      isOwn && 'items-end'
                    )}>
                      <div className={cn(
                        'px-4 py-2 rounded-2xl',
                        isOwn 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-secondary rounded-bl-md'
                      )}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      
                      <p className={cn(
                        'text-xs text-muted-foreground px-1',
                        isOwn && 'text-right'
                      )}>
                        {format(new Date(message.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}