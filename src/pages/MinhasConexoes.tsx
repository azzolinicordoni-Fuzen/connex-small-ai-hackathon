import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, UserCheck, Clock, Users, 
  TreePine, Briefcase, Award, Landmark, Building2,
  ClipboardCheck, Scale, Banknote, FolderOpen, Loader2,
  SlidersHorizontal, X, RotateCcw, ChevronDown, MapPin,
  Target, Layers, Filter as FilterIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConnectionsContext } from "@/contexts/ConnectionsContext";
import { Header } from "@/components/layout/Header";
import { BackButton } from "@/components/layout/BackButton";
import ConnectionCardEnhanced from "@/components/conexoes/ConnectionCardEnhanced";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Filter state
interface FilterState {
  agentTypes: string[];
  locations: string[];
  biomas: string[];
  buscaPlataforma: string[];
}

const initialFilterState: FilterState = {
  agentTypes: [],
  locations: [],
  biomas: [],
  buscaPlataforma: [],
};

// Agent types
const AGENT_TYPES = [
  { id: "proprietario", label: "Proprietário Rural", icon: TreePine },
  { id: "desenvolvedor", label: "Desenvolvedor", icon: Briefcase },
  { id: "certificadora", label: "Certificadora", icon: Award },
  { id: "auditor", label: "Auditor", icon: ClipboardCheck },
  { id: "investidor", label: "Investidor", icon: Landmark },
  { id: "comprador", label: "Comprador", icon: Building2 },
  { id: "financeira", label: "Financeira", icon: Banknote },
  { id: "advogado", label: "Jurídico", icon: Scale },
  { id: "projeto", label: "Projeto", icon: FolderOpen },
  { id: "outro", label: "Outro", icon: Users },
];

// Biomas
const BIOMAS = [
  "Amazônia",
  "Cerrado",
  "Mata Atlântica",
  "Caatinga",
  "Pampa",
  "Pantanal",
];

// Busca plataforma options
const BUSCA_PLATAFORMA = [
  "Desenvolver projeto",
  "Vender créditos",
  "Comprar créditos",
  "Investir em projetos",
  "Buscar parceiros",
  "Certificar projeto",
  "Auditar projeto",
];

export default function MinhasConexoes() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [connectionTab, setConnectionTab] = useState<"all" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [openSections, setOpenSections] = useState<string[]>(["agentTypes"]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  // Extract unique locations
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    connections.forEach((conn) => {
      if (conn.profile.location) {
        locations.add(conn.profile.location);
        // Extract state
        const parts = conn.profile.location.split(",").map(p => p.trim());
        if (parts.length > 1) {
          locations.add(parts[parts.length - 1]);
        }
      }
    });
    return Array.from(locations).sort();
  }, [connections]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.agentTypes.length;
    count += filters.locations.length;
    count += filters.biomas.length;
    count += filters.buscaPlataforma.length;
    return count;
  }, [filters]);

  // Filter connections
  const filteredConnections = useMemo(() => {
    return connections.filter(conn => {
      // Tab filter
      if (connectionTab === "pending" && conn.status !== "pending") return false;
      if (connectionTab === "all" && conn.status !== "accepted") return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          conn.profile.name.toLowerCase().includes(query) ||
          (conn.profile.location || '').toLowerCase().includes(query) ||
          (conn.profile.bio || '').toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Agent type filter
      if (filters.agentTypes.length > 0 && !filters.agentTypes.includes(conn.profile.agent_type)) {
        return false;
      }
      
      // Location filter
      if (filters.locations.length > 0) {
        const matchesLocation = filters.locations.some(loc => 
          conn.profile.location?.includes(loc)
        );
        if (!matchesLocation) return false;
      }
      
      return true;
    });
  }, [connections, connectionTab, searchQuery, filters]);

  // For pending tab, only show requests received
  const displayConnections = connectionTab === "pending" 
    ? filteredConnections.filter(c => !c.isRequester)
    : filteredConnections;

  // Toggle filter section
  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Toggle array filter
  const toggleArrayFilter = (key: keyof FilterState, item: string) => {
    const current = filters[key];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    setFilters({ ...filters, [key]: updated });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters(initialFilterState);
  };

  // Get count for agent type
  const getAgentCount = (agentType: string) => {
    return connections.filter(c => 
      c.profile.agent_type === agentType && 
      (connectionTab === "all" ? c.status === "accepted" : c.status === "pending")
    ).length;
  };

  // Handle message
  const handleMessage = (profileId: string) => {
    navigate(`/mensagens?profile=${profileId}`);
  };

  // Handle view profile
  const handleViewProfile = (profileId: string, subprofileId?: string) => {
    const url = subprofileId 
      ? `/perfil/${profileId}?subperfil=${subprofileId}` 
      : `/perfil/${profileId}`;
    navigate(url);
  };

  // Filter section component
  const FilterSection = ({
    id,
    title,
    icon: Icon,
    children,
  }: {
    id: string;
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <Collapsible open={openSections.includes(id)} onOpenChange={() => toggleSection(id)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto hover:bg-muted/50"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Icon className="w-4 h-4 text-muted-foreground" />
            {title}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              openSections.includes(id) && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  );

  // Checkbox item component
  const CheckboxItem = ({
    id,
    label,
    checked,
    onChange,
    count,
  }: {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
    count?: number;
  }) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
        <Label htmlFor={id} className="text-sm cursor-pointer">
          {label}
        </Label>
      </div>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      )}
    </div>
  );

  // Filter content
  const FilterContent = () => (
    <div className="space-y-1">
      <FilterSection id="agentTypes" title="Tipo de Agente" icon={Briefcase}>
        <ScrollArea className="max-h-48">
          {AGENT_TYPES.map((agent) => (
            <CheckboxItem
              key={agent.id}
              id={`agent-${agent.id}`}
              label={agent.label}
              checked={filters.agentTypes.includes(agent.id)}
              onChange={() => toggleArrayFilter("agentTypes", agent.id)}
              count={getAgentCount(agent.id)}
            />
          ))}
        </ScrollArea>
      </FilterSection>

      <Separator />

      <FilterSection id="locations" title="Localização" icon={MapPin}>
        <ScrollArea className="max-h-48">
          {uniqueLocations.length > 0 ? (
            uniqueLocations.slice(0, 15).map((loc) => (
              <CheckboxItem
                key={loc}
                id={`loc-${loc}`}
                label={loc}
                checked={filters.locations.includes(loc)}
                onChange={() => toggleArrayFilter("locations", loc)}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">Nenhuma localização disponível</p>
          )}
        </ScrollArea>
      </FilterSection>

      <Separator />

      <FilterSection id="biomas" title="Bioma" icon={TreePine}>
        {BIOMAS.map((bioma) => (
          <CheckboxItem
            key={bioma}
            id={`bioma-${bioma}`}
            label={bioma}
            checked={filters.biomas.includes(bioma)}
            onChange={() => toggleArrayFilter("biomas", bioma)}
          />
        ))}
      </FilterSection>

      <Separator />

      <FilterSection id="buscaPlataforma" title="Objetivo na Plataforma" icon={Target}>
        <ScrollArea className="max-h-48">
          {BUSCA_PLATAFORMA.map((busca) => (
            <CheckboxItem
              key={busca}
              id={`busca-${busca}`}
              label={busca}
              checked={filters.buscaPlataforma.includes(busca)}
              onChange={() => toggleArrayFilter("buscaPlataforma", busca)}
            />
          ))}
        </ScrollArea>
      </FilterSection>
    </div>
  );

  // Active filter tags
  const ActiveFilterTags = () => {
    const allFilters: { type: keyof FilterState; value: string }[] = [];
    filters.agentTypes.forEach(v => allFilters.push({ type: "agentTypes", value: v }));
    filters.locations.forEach(v => allFilters.push({ type: "locations", value: v }));
    filters.biomas.forEach(v => allFilters.push({ type: "biomas", value: v }));
    filters.buscaPlataforma.forEach(v => allFilters.push({ type: "buscaPlataforma", value: v }));

    if (allFilters.length === 0) return null;

    const getLabel = (type: keyof FilterState, value: string) => {
      if (type === "agentTypes") {
        return AGENT_TYPES.find(a => a.id === value)?.label || value;
      }
      return value;
    };

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {allFilters.map(({ type, value }) => (
          <Badge
            key={`${type}-${value}`}
            variant="secondary"
            className="gap-1.5 pr-1 bg-primary/10 text-primary hover:bg-primary/20"
          >
            {getLabel(type, value)}
            <button
              onClick={() => toggleArrayFilter(type, value)}
              className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="h-6 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Limpar todos
        </Button>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">Minhas Conexões</h1>
              <p className="text-muted-foreground">
                Gerencie sua rede de contatos na plataforma
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{acceptedProfileCount}</p>
                <p className="text-sm text-muted-foreground">Conectados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{pendingProfileCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={connectionTab} onValueChange={(v) => setConnectionTab(v as "all" | "pending")} className="mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-background">
              <UserCheck className="w-4 h-4" />
              Conectados
              <Badge variant="secondary" className="ml-1">{acceptedProfileCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-background">
              <Clock className="w-4 h-4" />
              Pendentes
              {pendingProfileCount > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingProfileCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, localização..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Mobile Filter Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="text-xs">{activeFilterCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtros Avançados
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        <ActiveFilterTags />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-card border rounded-lg overflow-hidden sticky top-24">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Filtros Avançados</span>
                </div>
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="text-xs">{activeFilterCount}</Badge>
                )}
              </div>
              <ScrollArea className="max-h-[calc(100vh-200px)]">
                <div className="p-2">
                  <FilterContent />
                </div>
              </ScrollArea>
              {activeFilterCount > 0 && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="w-full gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Connections Grid */}
          <div className="flex-1">
            {connectionsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : displayConnections.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {connectionTab === "pending" 
                      ? "Nenhuma solicitação pendente" 
                      : "Nenhuma conexão encontrada"
                    }
                  </h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-sm">
                    {connectionTab === "pending"
                      ? "Você não tem solicitações de conexão aguardando aprovação."
                      : searchQuery || activeFilterCount > 0
                        ? "Tente ajustar seus filtros ou termos de busca."
                        : "Comece a expandir sua rede de contatos."
                    }
                  </p>
                  {connectionTab === "all" && !searchQuery && activeFilterCount === 0 && (
                    <Button onClick={() => navigate("/conexoes")}>
                      Buscar Conexões
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayConnections.map((connection) => (
                  <ConnectionCardEnhanced
                    key={connection.id}
                    connection={connection}
                    onAccept={acceptConnection}
                    onReject={rejectConnection}
                    onRemove={removeConnection}
                    onMessage={handleMessage}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
