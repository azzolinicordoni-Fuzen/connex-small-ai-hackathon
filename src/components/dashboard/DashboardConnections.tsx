import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ChevronRight, 
  UserPlus,
  Check,
  X
} from "lucide-react";

interface Connection {
  id: string;
  status: string;
  profile: {
    id: string;
    name: string;
    avatar_url: string | null;
    agent_type: string;
    location: string | null;
  };
  isRequester: boolean;
}

interface DashboardConnectionsProps {
  connections: Connection[];
  pendingCount: number;
  loading: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const agentTypeLabels: Record<string, string> = {
  proprietario: "Proprietário",
  engenheiro: "Engenheiro",
  desenvolvedor: "Desenvolvedor",
  certificadora: "Certificadora",
  investidor: "Investidor",
  projeto: "Projeto",
  comprador: "Comprador",
  auditor: "Auditor",
  financeira: "Financeira",
  advogado: "Advogado",
  outro: "Outro",
};

export function DashboardConnections({ 
  connections, 
  pendingCount, 
  loading,
  onAccept,
  onReject 
}: DashboardConnectionsProps) {
  const pendingRequests = connections.filter(c => c.status === 'pending' && !c.isRequester);
  const activeConnections = connections.filter(c => c.status === 'accepted');

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5" />
            Conexões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5" />
            Conexões
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingCount}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/minhas-conexoes">
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Solicitações Pendentes
            </p>
            {pendingRequests.slice(0, 3).map((conn) => (
              <div key={conn.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conn.profile.avatar_url || undefined} />
                  <AvatarFallback>{conn.profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{conn.profile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {agentTypeLabels[conn.profile.agent_type] || conn.profile.agent_type}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                    onClick={(e) => {
                      e.preventDefault();
                      onAccept?.(conn.id);
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.preventDefault();
                      onReject?.(conn.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Connections */}
        {activeConnections.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Conexões Recentes
            </p>
            <div className="flex flex-wrap gap-2">
              {activeConnections.slice(0, 6).map((conn) => (
                <Link 
                  key={conn.id} 
                  to={`/perfil/${conn.profile.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={conn.profile.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{conn.profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{conn.profile.name.split(' ')[0]}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-6">
            <UserPlus className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Nenhuma conexão ainda</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/conexoes">
                Buscar conexões
              </Link>
            </Button>
          </div>
        ) : null}

        {/* Suggestions CTA */}
        <Button variant="outline" className="w-full" asChild>
          <Link to="/conexoes">
            <UserPlus className="w-4 h-4 mr-2" />
            Descobrir novos agentes
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
