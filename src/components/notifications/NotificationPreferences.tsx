import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail,
  Users,
  MessageSquare,
  FolderOpen,
  User,
  Loader2
} from "lucide-react";
import { useNotificationPreferences, NOTIFICATION_CATEGORIES } from "@/hooks/useNotifications";

const categoryIcons: Record<string, React.ElementType> = {
  conexoes: Users,
  feed: MessageSquare,
  projetos: FolderOpen,
  perfil: User,
};

export function NotificationPreferences() {
  const { preferences, loading, getPreference, updatePreference } = useNotificationPreferences();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Preferências de Notificações</h2>
        <p className="text-muted-foreground">
          Configure como você deseja receber notificações para cada tipo de evento.
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(NOTIFICATION_CATEGORIES).map(([categoryKey, category]) => {
          const Icon = categoryIcons[categoryKey] || Bell;
          
          return (
            <Card key={categoryKey}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.label}</CardTitle>
                    <CardDescription>
                      {category.events.length} tipos de notificação
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_100px_100px] gap-4 text-sm font-medium text-muted-foreground">
                    <span>Evento</span>
                    <span className="text-center flex items-center justify-center gap-1.5">
                      <Bell className="w-4 h-4" />
                      Plataforma
                    </span>
                    <span className="text-center flex items-center justify-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </span>
                  </div>
                  
                  <Separator />
                  
                  {/* Events */}
                  {category.events.map((event) => {
                    const pref = getPreference(categoryKey, event.type);
                    
                    return (
                      <div 
                        key={event.type} 
                        className="grid grid-cols-[1fr_100px_100px] gap-4 items-center py-2"
                      >
                        <Label htmlFor={`${categoryKey}-${event.type}`} className="text-sm cursor-pointer">
                          {event.label}
                        </Label>
                        <div className="flex justify-center">
                          <Switch
                            id={`${categoryKey}-${event.type}-inapp`}
                            checked={pref.in_app}
                            onCheckedChange={(checked) => 
                              updatePreference(categoryKey, event.type, checked, pref.email)
                            }
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch
                            id={`${categoryKey}-${event.type}-email`}
                            checked={pref.email}
                            onCheckedChange={(checked) => 
                              updatePreference(categoryKey, event.type, pref.in_app, checked)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Sobre notificações por e-mail</h4>
              <p className="text-sm text-muted-foreground">
                As notificações por e-mail são enviadas apenas para eventos importantes. 
                Você pode desativar completamente a qualquer momento. 
                Não enviamos spam ou e-mails promocionais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
