import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Check, 
  CheckCheck,
  Trash2,
  Users,
  MessageSquare,
  FolderOpen,
  User,
  Settings,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, Notification, NOTIFICATION_CATEGORIES } from "@/hooks/useNotifications";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categoryIcons: Record<string, React.ElementType> = {
  conexoes: Users,
  feed: MessageSquare,
  projetos: FolderOpen,
  perfil: User,
};

const categoryColors: Record<string, string> = {
  conexoes: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  feed: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  projetos: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  perfil: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
};

function NotificationCard({ 
  notification, 
  onMarkAsRead,
  onDelete
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = categoryIcons[notification.category] || Bell;
  const colorClass = categoryColors[notification.category] || "bg-muted text-muted-foreground";
  
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ptBR,
  });
  
  const fullDate = format(new Date(notification.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <Card className={cn(
      "transition-all",
      !notification.read && "border-primary/30 bg-primary/5"
    )}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center shrink-0", colorClass)}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "text-sm",
                    !notification.read && "font-semibold"
                  )}>
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <Badge variant="default" className="text-[10px] h-4 px-1.5">
                      Novo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{fullDate}</span>
                  <span className="text-muted-foreground/50">({timeAgo})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onMarkAsRead(notification.id)}
                    title="Marcar como lida"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(notification.id)}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {notification.link && (
              <Button variant="link" size="sm" className="h-auto p-0 mt-2" asChild>
                <Link to={notification.link}>
                  Ver detalhes →
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationList() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearOldNotifications 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState("all");

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : activeTab === "unread"
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.category === activeTab);

  const categories = Object.keys(NOTIFICATION_CATEGORIES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}` : 'Todas lidas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => clearOldNotifications(30)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar antigas
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/configuracoes/notificacoes" className="gap-2">
              <Settings className="w-4 h-4" />
              Preferências
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border">
          <TabsTrigger value="all" className="gap-2">
            <Bell className="w-4 h-4" />
            Todas
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            Não lidas
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          {categories.map(cat => {
            const Icon = categoryIcons[cat] || Bell;
            const catNotifs = notifications.filter(n => n.category === cat);
            const catUnread = catNotifs.filter(n => !n.read).length;
            return (
              <TabsTrigger key={cat} value={cat} className="gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {NOTIFICATION_CATEGORIES[cat as keyof typeof NOTIFICATION_CATEGORIES]?.label}
                </span>
                {catUnread > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                    {catUnread}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando notificações...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-1">Nenhuma notificação</h3>
                <p className="text-muted-foreground">
                  {activeTab === "unread" 
                    ? "Você está em dia! Todas as notificações foram lidas."
                    : "Não há notificações nesta categoria."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
