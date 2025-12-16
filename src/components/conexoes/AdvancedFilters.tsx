import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  ChevronDown,
  X,
  MapPin,
  TreePine,
  Briefcase,
  Target,
  FileCheck,
  Layers,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedSubprofile } from "@/hooks/useSubprofileConnections";

// Filter option types
export interface FilterState {
  agentTypes: string[];
  locations: string[];
  biomas: string[];
  buscaPlataforma: string[];
  hasDocumentation: string | null; // 'yes' | 'no' | null (all)
  projectTypes: string[];
  connectionStatus: string[];
}

interface AdvancedFiltersProps {
  subprofiles: UnifiedSubprofile[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  connectionStatusGetter: (id: string) => 'none' | 'pending' | 'accepted' | 'sent';
}

// Agent type configuration
const AGENT_TYPES = [
  { id: "proprietario", label: "Proprietário Rural", icon: TreePine },
  { id: "desenvolvedor", label: "Desenvolvedor de Projetos", icon: Briefcase },
  { id: "auditor", label: "Auditor" },
  { id: "investidor", label: "Investidor / Comprador" },
  { id: "financeira", label: "Instituição Financeira" },
  { id: "advogado", label: "Jurídico" },
  { id: "projeto", label: "Projeto Existente" },
  { id: "certificadora", label: "Certificadora" },
  { id: "consultoria", label: "Consultoria" },
  { id: "outro", label: "Outro" },
];

// Common busca_plataforma options
const BUSCA_PLATAFORMA_OPTIONS = [
  "Desenvolver projeto",
  "Vender créditos",
  "Comprar créditos",
  "Investir em projetos",
  "Buscar parceiros",
  "Certificar projeto",
  "Auditar projeto",
  "Consultoria técnica",
  "Assessoria jurídica",
  "Financiamento",
];

// Brazilian biomes
const BIOMAS = [
  "Amazônia",
  "Cerrado",
  "Mata Atlântica",
  "Caatinga",
  "Pampa",
  "Pantanal",
];

// Connection status options
const CONNECTION_STATUS_OPTIONS = [
  { id: "none", label: "Não conectado" },
  { id: "sent", label: "Solicitação enviada" },
  { id: "pending", label: "Aguardando resposta" },
  { id: "accepted", label: "Conectado" },
];

// Carbon project types
const PROJECT_TYPES = [
  "REDD+",
  "ARR (Reflorestamento)",
  "IFM (Manejo Florestal)",
  "Agricultura Regenerativa",
  "Energia Renovável",
  "Metano",
  "Carbono Azul",
  "Eficiência Energética",
];

export default function AdvancedFilters({
  subprofiles,
  filters,
  onFiltersChange,
  connectionStatusGetter,
}: AdvancedFiltersProps) {
  const [openSections, setOpenSections] = useState<string[]>(["agentTypes", "locations"]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Extract unique locations from subprofiles
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    subprofiles.forEach((sp) => {
      if (sp.profile?.location) {
        // Try to extract state/city from location
        const loc = sp.profile.location;
        locations.add(loc);
        // Also try to extract state (e.g., "São Paulo, SP" -> "SP")
        const parts = loc.split(",").map((p) => p.trim());
        if (parts.length > 1) {
          locations.add(parts[parts.length - 1]); // Add last part (likely state)
        }
      }
    });
    return Array.from(locations).sort();
  }, [subprofiles]);

  // Extract unique busca_plataforma from subprofiles
  const uniqueBuscaPlataforma = useMemo(() => {
    const options = new Set<string>();
    subprofiles.forEach((sp) => {
      sp.busca_plataforma?.forEach((b) => options.add(b));
    });
    // Combine with predefined options
    BUSCA_PLATAFORMA_OPTIONS.forEach((o) => options.add(o));
    return Array.from(options).sort();
  }, [subprofiles]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.agentTypes.length > 0) count += filters.agentTypes.length;
    if (filters.locations.length > 0) count += filters.locations.length;
    if (filters.biomas.length > 0) count += filters.biomas.length;
    if (filters.buscaPlataforma.length > 0) count += filters.buscaPlataforma.length;
    if (filters.hasDocumentation !== null) count += 1;
    if (filters.projectTypes.length > 0) count += filters.projectTypes.length;
    if (filters.connectionStatus.length > 0) count += filters.connectionStatus.length;
    return count;
  }, [filters]);

  // Toggle section open/close
  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Update a specific filter
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Toggle item in array filter
  const toggleArrayFilter = (key: keyof FilterState, item: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateFilter(key, updated as any);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      agentTypes: [],
      locations: [],
      biomas: [],
      buscaPlataforma: [],
      hasDocumentation: null,
      projectTypes: [],
      connectionStatus: [],
    });
  };

  // Remove single filter tag
  const removeFilter = (type: keyof FilterState, value: string) => {
    if (type === "hasDocumentation") {
      updateFilter("hasDocumentation", null);
    } else {
      const current = filters[type] as string[];
      updateFilter(type, current.filter((v) => v !== value) as any);
    }
  };

  // Get filter label for display
  const getFilterLabel = (type: keyof FilterState, value: string): string => {
    switch (type) {
      case "agentTypes":
        return AGENT_TYPES.find((a) => a.id === value)?.label || value;
      case "hasDocumentation":
        return value === "yes" ? "Com documentação" : "Sem documentação";
      case "connectionStatus":
        return CONNECTION_STATUS_OPTIONS.find((c) => c.id === value)?.label || value;
      default:
        return value;
    }
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

  // Checkbox filter item
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
      {count !== undefined && (
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      )}
    </div>
  );

  // Count subprofiles by filter value
  const getCount = (type: keyof FilterState, value: string): number => {
    switch (type) {
      case "agentTypes":
        return subprofiles.filter((sp) => sp.subprofile_type === value).length;
      case "locations":
        return subprofiles.filter((sp) => sp.profile?.location?.includes(value)).length;
      case "biomas":
        return subprofiles.filter((sp) => sp.detail_2?.includes(value)).length;
      case "buscaPlataforma":
        return subprofiles.filter((sp) => sp.busca_plataforma?.includes(value)).length;
      case "connectionStatus":
        return subprofiles.filter((sp) => connectionStatusGetter(sp.id) === value).length;
      default:
        return 0;
    }
  };

  // Filter content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-1">
      {/* Agent Types */}
      <FilterSection id="agentTypes" title="Tipo de Agente" icon={Briefcase}>
        <ScrollArea className="max-h-48">
          {AGENT_TYPES.map((agent) => (
            <CheckboxItem
              key={agent.id}
              id={`agent-${agent.id}`}
              label={agent.label}
              checked={filters.agentTypes.includes(agent.id)}
              onChange={() => toggleArrayFilter("agentTypes", agent.id)}
              count={getCount("agentTypes", agent.id)}
            />
          ))}
        </ScrollArea>
      </FilterSection>

      <Separator />

      {/* Locations */}
      <FilterSection id="locations" title="Localização" icon={MapPin}>
        <ScrollArea className="max-h-48">
          {uniqueLocations.length > 0 ? (
            uniqueLocations.slice(0, 20).map((loc) => (
              <CheckboxItem
                key={loc}
                id={`loc-${loc}`}
                label={loc}
                checked={filters.locations.includes(loc)}
                onChange={() => toggleArrayFilter("locations", loc)}
                count={getCount("locations", loc)}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">Nenhuma localização disponível</p>
          )}
        </ScrollArea>
      </FilterSection>

      <Separator />

      {/* Biomas */}
      <FilterSection id="biomas" title="Bioma" icon={TreePine}>
        {BIOMAS.map((bioma) => (
          <CheckboxItem
            key={bioma}
            id={`bioma-${bioma}`}
            label={bioma}
            checked={filters.biomas.includes(bioma)}
            onChange={() => toggleArrayFilter("biomas", bioma)}
            count={getCount("biomas", bioma)}
          />
        ))}
      </FilterSection>

      <Separator />

      {/* What they're looking for */}
      <FilterSection id="buscaPlataforma" title="O que busca" icon={Target}>
        <ScrollArea className="max-h-48">
          {uniqueBuscaPlataforma.map((busca) => (
            <CheckboxItem
              key={busca}
              id={`busca-${busca}`}
              label={busca}
              checked={filters.buscaPlataforma.includes(busca)}
              onChange={() => toggleArrayFilter("buscaPlataforma", busca)}
              count={getCount("buscaPlataforma", busca)}
            />
          ))}
        </ScrollArea>
      </FilterSection>

      <Separator />

      {/* Project Types */}
      <FilterSection id="projectTypes" title="Tipo de Projeto" icon={Layers}>
        <ScrollArea className="max-h-48">
          {PROJECT_TYPES.map((type) => (
            <CheckboxItem
              key={type}
              id={`proj-${type}`}
              label={type}
              checked={filters.projectTypes.includes(type)}
              onChange={() => toggleArrayFilter("projectTypes", type)}
            />
          ))}
        </ScrollArea>
      </FilterSection>

      <Separator />

      {/* Documentation */}
      <FilterSection id="documentation" title="Documentação" icon={FileCheck}>
        <Select
          value={filters.hasDocumentation || "all"}
          onValueChange={(v) => updateFilter("hasDocumentation", v === "all" ? null : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="yes">Com documentação</SelectItem>
            <SelectItem value="no">Sem documentação</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <Separator />

      {/* Connection Status */}
      <FilterSection id="connectionStatus" title="Status de Conexão" icon={Filter}>
        {CONNECTION_STATUS_OPTIONS.map((status) => (
          <CheckboxItem
            key={status.id}
            id={`status-${status.id}`}
            label={status.label}
            checked={filters.connectionStatus.includes(status.id)}
            onChange={() => toggleArrayFilter("connectionStatus", status.id)}
            count={getCount("connectionStatus", status.id)}
          />
        ))}
      </FilterSection>
    </div>
  );

  // Active filter tags
  const ActiveFilterTags = () => {
    const allFilters: { type: keyof FilterState; value: string }[] = [];

    filters.agentTypes.forEach((v) => allFilters.push({ type: "agentTypes", value: v }));
    filters.locations.forEach((v) => allFilters.push({ type: "locations", value: v }));
    filters.biomas.forEach((v) => allFilters.push({ type: "biomas", value: v }));
    filters.buscaPlataforma.forEach((v) => allFilters.push({ type: "buscaPlataforma", value: v }));
    filters.projectTypes.forEach((v) => allFilters.push({ type: "projectTypes", value: v }));
    filters.connectionStatus.forEach((v) => allFilters.push({ type: "connectionStatus", value: v }));
    if (filters.hasDocumentation) {
      allFilters.push({ type: "hasDocumentation", value: filters.hasDocumentation });
    }

    if (allFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {allFilters.map(({ type, value }) => (
          <Badge
            key={`${type}-${value}`}
            variant="secondary"
            className="gap-1.5 pr-1 bg-primary/10 text-primary hover:bg-primary/20"
          >
            {getFilterLabel(type, value)}
            <button
              onClick={() => removeFilter(type, value)}
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

  return (
    <div className="space-y-4">
      {/* Desktop: Sidebar filters */}
      <div className="hidden lg:block">
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Filtros Avançados</span>
            </div>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <FilterContent />
          </ScrollArea>
          {activeFilterCount > 0 && (
            <div className="p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Sheet filter */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  Filtros Avançados
                </SheetTitle>
                <SheetDescription>
                  Filtre subperfis por múltiplos critérios
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-180px)]">
                <FilterContent />
              </ScrollArea>
              {activeFilterCount > 0 && (
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filter tags (shown on all screen sizes) */}
      <ActiveFilterTags />
    </div>
  );
}

// Export initial filter state
export const initialFilterState: FilterState = {
  agentTypes: [],
  locations: [],
  biomas: [],
  buscaPlataforma: [],
  hasDocumentation: null,
  projectTypes: [],
  connectionStatus: [],
};

// Filter function to apply filters to subprofiles
export function applyFilters(
  subprofiles: UnifiedSubprofile[],
  filters: FilterState,
  connectionStatusGetter: (id: string) => 'none' | 'pending' | 'accepted' | 'sent'
): UnifiedSubprofile[] {
  return subprofiles.filter((sp) => {
    // Agent type filter
    if (filters.agentTypes.length > 0 && !filters.agentTypes.includes(sp.subprofile_type)) {
      return false;
    }

    // Location filter
    if (filters.locations.length > 0) {
      const hasMatchingLocation = filters.locations.some((loc) =>
        sp.profile?.location?.toLowerCase().includes(loc.toLowerCase())
      );
      if (!hasMatchingLocation) return false;
    }

    // Bioma filter (typically in detail_2 for proprietario)
    if (filters.biomas.length > 0) {
      const hasMatchingBioma = filters.biomas.some(
        (bioma) =>
          sp.detail_2?.toLowerCase().includes(bioma.toLowerCase()) ||
          sp.description?.toLowerCase().includes(bioma.toLowerCase())
      );
      if (!hasMatchingBioma) return false;
    }

    // Busca plataforma filter
    if (filters.buscaPlataforma.length > 0) {
      const hasMatchingBusca = filters.buscaPlataforma.some((busca) =>
        sp.busca_plataforma?.some((b) => b.toLowerCase().includes(busca.toLowerCase()))
      );
      if (!hasMatchingBusca) return false;
    }

    // Project type filter (check in detail_3, description, or name)
    if (filters.projectTypes.length > 0) {
      const hasMatchingProjectType = filters.projectTypes.some(
        (type) =>
          sp.detail_3?.toLowerCase().includes(type.toLowerCase()) ||
          sp.description?.toLowerCase().includes(type.toLowerCase()) ||
          sp.name?.toLowerCase().includes(type.toLowerCase())
      );
      if (!hasMatchingProjectType) return false;
    }

    // Documentation filter (check for documentacao_fundiaria in proprietario types)
    if (filters.hasDocumentation !== null) {
      // This would require more specific data from subprofile tables
      // For now, we check if detail_1 or detail_2 mentions documentation
      const hasDoc =
        sp.detail_1?.toLowerCase().includes("doc") ||
        sp.detail_2?.toLowerCase().includes("doc") ||
        sp.description?.toLowerCase().includes("documentação");
      if (filters.hasDocumentation === "yes" && !hasDoc) return false;
      if (filters.hasDocumentation === "no" && hasDoc) return false;
    }

    // Connection status filter
    if (filters.connectionStatus.length > 0) {
      const status = connectionStatusGetter(sp.id);
      if (!filters.connectionStatus.includes(status)) return false;
    }

    return true;
  });
}
