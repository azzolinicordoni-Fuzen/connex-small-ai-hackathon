import { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { PROJECT_CATEGORIES, ProjectCategory } from '@/constants/projectTypes';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProjectTypeSelectorProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
  maxHeight?: string;
}

export function ProjectTypeSelector({ 
  selectedTypes, 
  onChange,
  maxHeight = '400px'
}: ProjectTypeSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleType = (typeId: string) => {
    onChange(
      selectedTypes.includes(typeId)
        ? selectedTypes.filter(id => id !== typeId)
        : [...selectedTypes, typeId]
    );
  };

  const isTypeSelected = (typeId: string) => selectedTypes.includes(typeId);

  const getCategorySelectedCount = (category: ProjectCategory) => {
    return category.subtypes.filter(s => selectedTypes.includes(s.id)).length;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          {selectedTypes.length} tipo(s) selecionado(s)
        </span>
        {selectedTypes.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-primary hover:underline"
          >
            Limpar seleção
          </button>
        )}
      </div>

      <div 
        className="border rounded-lg overflow-y-auto" 
        style={{ maxHeight }}
      >
        <div className="p-2 space-y-1">
          {PROJECT_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const selectedCount = getCategorySelectedCount(category);

            return (
              <div key={category.id} className="rounded-md overflow-hidden">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 text-left transition-colors",
                    "hover:bg-accent/50 rounded-md",
                    isExpanded && "bg-accent/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{category.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedCount}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Subtypes */}
                {isExpanded && (
                  <div className="pl-10 pr-3 pb-2 space-y-1">
                    {category.subtypes.map((subtype) => {
                      const isSelected = isTypeSelected(subtype.id);
                      return (
                        <button
                          key={subtype.id}
                          type="button"
                          onClick={() => toggleType(subtype.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-2 text-left text-sm rounded-md transition-colors",
                            "hover:bg-accent/50",
                            isSelected && "bg-primary/10 text-primary"
                          )}
                        >
                          <span>{subtype.label}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Types Preview */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2">
          {selectedTypes.slice(0, 5).map((typeId) => {
            const category = PROJECT_CATEGORIES.find(c => 
              c.subtypes.some(s => s.id === typeId)
            );
            const subtype = category?.subtypes.find(s => s.id === typeId);
            return (
              <Badge
                key={typeId}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-destructive/10"
                onClick={() => toggleType(typeId)}
              >
                {category?.icon} {subtype?.label}
                <span className="ml-1 text-muted-foreground">×</span>
              </Badge>
            );
          })}
          {selectedTypes.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedTypes.length - 5} mais
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
