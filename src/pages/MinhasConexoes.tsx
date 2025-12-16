import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, UserCheck, Clock, Users, 
  TreePine, Briefcase, Award, Landmark, Building2,
  ClipboardCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConnectionsContext } from "@/contexts/ConnectionsContext";
import { Header } from "@/components/layout/Header";
import { BackButton } from "@/components/layout/BackButton";
import ConnectionCard from "@/components/conexoes/ConnectionCard";

const AGENT_FILTERS = [
  { id: "todos", label: "Todos", icon: Users },
  { id: "proprietario", label: "Proprietários", icon: TreePine },
  { id: "desenvolvedor", label: "Desenvolvedores", icon: Briefcase },
  { id: "certificadora", label: "Certificadoras", icon: Award },
  { id: "auditor", label: "Auditores", icon: ClipboardCheck },
  { id: "investidor", label: "Investidores", icon: Landmark },
  { id: "comprador", label: "Compradores", icon: Building2 },
];

export default function MinhasConexoes() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [connectionFilter, setConnectionFilter] = useState("todos");
  const [connectionSearch, setConnectionSearch] = useState("");
  const [connectionTab, setConnectionTab] = useState<"all" | "pending">("all");

  const { 
    profileConnections: connections, 
    profileConnectionsLoading: connectionsLoading, 
    acceptProfileConnection: acceptConnection, 
    rejectProfileConnection: rejectConnection, 
    removeProfileConnection: removeConnection,
    acceptedProfileCount,
    pendingProfileCount,
  } = useConnectionsContext();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Filter connections
  const filteredConnections = connections.filter(conn => {
    if (connectionTab === "pending" && conn.status !== "pending") return false;
    if (connectionTab === "all" && conn.status !== "accepted") return false;
    if (connectionFilter !== "todos" && conn.profile.agent_type !== connectionFilter) return false;
    
    if (connectionSearch) {
      const search = connectionSearch.toLowerCase();
      return (
        conn.profile.name.toLowerCase().includes(search) ||
        (conn.profile.location || '').toLowerCase().includes(search) ||
        (conn.profile.bio || '').toLowerCase().includes(search)
      );
    }
    return true;
  });

  // For pending tab, only show requests received (not sent)
  const pendingToShow = connectionTab === "pending" 
    ? filteredConnections.filter(c => !c.isRequester)
    : filteredConnections;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <h1 className="text-3xl font-bold">Minhas Conexões</h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Gerencie sua rede de contatos na plataforma
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedProfileCount}</p>
                <p className="text-sm text-muted-foreground">Conectados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingProfileCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={connectionTab === "all" ? "default" : "outline"}
            onClick={() => setConnectionTab("all")}
            className="gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Conectados
            <Badge variant="secondary">{acceptedProfileCount}</Badge>
          </Button>
          <Button
            variant={connectionTab === "pending" ? "default" : "outline"}
            onClick={() => setConnectionTab("pending")}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Pendentes
            {pendingProfileCount > 0 && (
              <Badge variant="destructive">{pendingProfileCount}</Badge>
            )}
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou especialidade..."
              className="pl-9"
              value={connectionSearch}
              onChange={(e) => setConnectionSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {AGENT_FILTERS.slice(0, 5).map((filter) => {
              const FilterIcon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={connectionFilter === filter.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setConnectionFilter(filter.id)}
                  className="shrink-0 gap-1"
                >
                  <FilterIcon className="w-3 h-3" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Connections List */}
        {connectionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pendingToShow.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-2">
                {connectionTab === "pending" 
                  ? "Nenhuma solicitação pendente" 
                  : connectionSearch || connectionFilter !== "todos"
                    ? "Nenhuma conexão encontrada com esses filtros"
                    : "Você ainda não tem conexões"
                }
              </p>
              {connectionTab === "all" && !connectionSearch && connectionFilter === "todos" && (
                <Button variant="outline" onClick={() => navigate("/conexoes")}>
                  Buscar Conexões
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingToShow.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onAccept={acceptConnection}
                onReject={rejectConnection}
                onRemove={removeConnection}
                onMessage={(profileId) => navigate(`/mensagens?profile=${profileId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
