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
  ChevronRight,
  X,
  MapPin,
  TreePine,
  Briefcase,
  Target,
  FileCheck,
  Layers,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Leaf,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedSubprofile } from "@/hooks/useSubprofileConnections";
import { PROJECT_CATEGORIES, ProjectCategory } from "@/constants/projectTypes";

// Filter option types
export interface FilterState {
  agentTypes: string[];
  locations: string[];
  biomas: string[];
  buscaPlataforma: string[];
  hasDocumentation: string | null;
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

// Property size ranges
const PROPERTY_SIZES = [
  { id: "small", label: "Até 100 ha", min: 0, max: 100 },
  { id: "medium", label: "100 - 500 ha", min: 100, max: 500 },
  { id: "large", label: "500 - 1.000 ha", min: 500, max: 1000 },
  { id: "xlarge", label: "1.000 - 5.000 ha", min: 1000, max: 5000 },
  { id: "xxlarge", label: "Acima de 5.000 ha", min: 5000, max: Infinity },
];

export default function AdvancedFilters({
  subprofiles,
  filters,
  onFiltersChange,
  connectionStatusGetter,
}: AdvancedFiltersProps) {
  const [openSections, setOpenSections] = useState<string[]>(["agentTypes"]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Extract unique locations from subprofiles
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    subprofiles.forEach((sp) => {
      if (sp.profile?.location) {
        const loc = sp.profile.location;
        locations.add(loc);
        const parts = loc.split(",").map((p) => p.trim());
        if (parts.length > 1) {
          locations.add(parts[parts.length - 1]);
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

  // Toggle category expansion for project types
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
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
      case "projectTypes":
        // Find label from PROJECT_CATEGORIES
        for (const cat of PROJECT_CATEGORIES) {
          const subtype = cat.subtypes.find(s => s.id === value);
          if (subtype) return subtype.label;
        }
        return value;
      default:
        return value;
    }
  };

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

  // Count selected subtypes in a category
  const getSelectedCountInCategory = (category: ProjectCategory): number => {
    return category.subtypes.filter(s => filters.projectTypes.includes(s.id)).length;
  };

  // Filter section component with improved styling
  const FilterSection = ({
    id,
    title,
    icon: Icon,
    children,
    badge,
  }: {
    id: string;
    title: string;
    icon: any;
    children: React.ReactNode;
    badge?: number;
  }) => (
    <Collapsible open={openSections.includes(id)} onOpenChange={() => toggleSection(id)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-3 h-auto hover:bg-primary/5 group"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            {title}
            {badge !== undefined && badge > 0 && (
              <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px]">
                {badge}
              </Badge>
            )}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              openSections.includes(id) && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-4">
        <div className="ml-2 pl-4 border-l-2 border-primary/20">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  // Checkbox filter item with improved styling
  const CheckboxItem = ({
    id,
    label,
    checked,
    onChange,
    count,
    indented = false,
  }: {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
    count?: number;
    indented?: boolean;
  }) => (
    <div className={cn(
      "flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group",
      checked && "bg-primary/5",
      indented && "ml-4"
    )}
    onClick={onChange}
    >
      <div className="flex items-center gap-2.5">
        <Checkbox 
          id={id} 
          checked={checked} 
          onCheckedChange={onChange}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label htmlFor={id} className={cn(
          "text-sm cursor-pointer transition-colors",
          checked ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {label}
        </Label>
      </div>
      {count !== undefined && count > 0 && (
        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted/50">
          {count}
        </Badge>
      )}
    </div>
  );

  // Project type category with expandable subtypes
  const ProjectTypeCategory = ({ category }: { category: ProjectCategory }) => {
    const isExpanded = expandedCategories.includes(category.id);
    const selectedCount = getSelectedCountInCategory(category);

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleCategory(category.id)}
          className={cn(
            "w-full flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors text-left",
            selectedCount > 0 && "bg-primary/5"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{category.icon}</span>
            <span className={cn(
              "text-sm",
              selectedCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
            )}>
              {category.label}
            </span>
            {selectedCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                {selectedCount}
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-6 space-y-0.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
            {category.subtypes.map((subtype) => (
              <CheckboxItem
                key={subtype.id}
                id={`proj-${subtype.id}`}
                label={subtype.label}
                checked={filters.projectTypes.includes(subtype.id)}
                onChange={() => toggleArrayFilter("projectTypes", subtype.id)}
                indented
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Filter content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-1">
      {/* Agent Types */}
      <FilterSection 
        id="agentTypes" 
        title="Tipo de Agente" 
        icon={Briefcase}
        badge={filters.agentTypes.length}
      >
        <div className="max-h-52 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin">
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
        </div>
      </FilterSection>

      <Separator className="my-2" />

      {/* Locations */}
      <FilterSection 
        id="locations" 
        title="Localização" 
        icon={MapPin}
        badge={filters.locations.length}
      >
        <div className="max-h-52 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin">
          {uniqueLocations.length > 0 ? (
            uniqueLocations.slice(0, 30).map((loc) => (
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
            <p className="text-sm text-muted-foreground py-2 px-2">
              Nenhuma localização disponível
            </p>
          )}
        </div>
      </FilterSection>

      <Separator className="my-2" />

      {/* Biomas */}
      <FilterSection 
        id="biomas" 
        title="Bioma" 
        icon={Leaf}
        badge={filters.biomas.length}
      >
        <div className="max-h-52 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin">
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
        </div>
      </FilterSection>

      <Separator className="my-2" />

      {/* Project Types - Dynamic from PROJECT_CATEGORIES */}
      <FilterSection 
        id="projectTypes" 
        title="Tipo de Projeto" 
        icon={Layers}
        badge={filters.projectTypes.length}
      >
        <div className="max-h-72 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
          {PROJECT_CATEGORIES.map((category) => (
            <ProjectTypeCategory key={category.id} category={category} />
          ))}
        </div>
      </FilterSection>

      <Separator className="my-2" />

      {/* What they're looking for */}
      <FilterSection 
        id="buscaPlataforma" 
        title="Objetivo na Plataforma" 
        icon={Target}
        badge={filters.buscaPlataforma.length}
      >
        <div className="max-h-52 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin">
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
        </div>
      </FilterSection>

      <Separator className="my-2" />

      {/* Documentation */}
      <FilterSection 
        id="documentation" 
        title="Documentação" 
        icon={FileCheck}
        badge={filters.hasDocumentation ? 1 : 0}
      >
        <div className="space-y-2">
          <Select
            value={filters.hasDocumentation || "all"}
            onValueChange={(v) => updateFilter("hasDocumentation", v === "all" ? null : v)}
          >
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="yes">Com documentação</SelectItem>
              <SelectItem value="no">Sem documentação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterSection>

      <Separator className="my-2" />

      {/* Connection Status */}
      <FilterSection 
        id="connectionStatus" 
        title="Status de Conexão" 
        icon={Filter}
        badge={filters.connectionStatus.length}
      >
        <div className="max-h-52 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin">
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
        </div>
      </FilterSection>
    </div>
  );

  // Active filter tags with improved styling
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
      <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {allFilters.length} filtro{allFilters.length > 1 ? 's' : ''} ativo{allFilters.length > 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs text-muted-foreground hover:text-destructive px-2"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Limpar todos
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allFilters.slice(0, 10).map(({ type, value }) => (
            <Badge
              key={`${type}-${value}`}
              variant="secondary"
              className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-xs"
            >
              <span className="max-w-32 truncate">{getFilterLabel(type, value)}</span>
              <button
                onClick={() => removeFilter(type, value)}
                className="ml-0.5 hover:bg-primary/30 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {allFilters.length > 10 && (
            <Badge variant="outline" className="text-xs">
              +{allFilters.length - 10} mais
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Desktop: Sidebar filters */}
      <div className="hidden lg:block">
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="font-semibold text-sm block">Filtros Avançados</span>
                <span className="text-xs text-muted-foreground">Refine sua busca</span>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="h-6 px-2.5">
                {activeFilterCount}
              </Badge>
            )}
          </div>

          {/* Filter content with scroll */}
          <ScrollArea className="h-[calc(100vh-340px)] min-h-[400px]">
            <div className="p-2">
              <FilterContent />
            </div>
          </ScrollArea>

          {/* Footer with clear button */}
          {activeFilterCount > 0 && (
            <div className="p-3 border-t bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar todos os filtros
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
              <Button variant="outline" className="gap-2 h-10 px-4 rounded-xl">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1 h-5 px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[340px] p-0">
              <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="block">Filtros Avançados</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Refine sua busca
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-2">
                  <FilterContent />
                </div>
              </ScrollArea>
              {activeFilterCount > 0 && (
                <div className="p-4 border-t bg-muted/20">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Limpar todos os filtros
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

    // Project type filter - check against PROJECT_CATEGORIES subtypes
    if (filters.projectTypes.length > 0) {
      const hasMatchingProjectType = filters.projectTypes.some((typeId) => {
        // Find the label for this type
        let typeLabel = typeId;
        for (const cat of PROJECT_CATEGORIES) {
          const subtype = cat.subtypes.find(s => s.id === typeId);
          if (subtype) {
            typeLabel = subtype.label;
            break;
          }
        }
        return (
          sp.detail_3?.toLowerCase().includes(typeLabel.toLowerCase()) ||
          sp.detail_3?.toLowerCase().includes(typeId.toLowerCase()) ||
          sp.description?.toLowerCase().includes(typeLabel.toLowerCase()) ||
          sp.name?.toLowerCase().includes(typeLabel.toLowerCase())
        );
      });
      if (!hasMatchingProjectType) return false;
    }

    // Documentation filter
    if (filters.hasDocumentation !== null) {
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
