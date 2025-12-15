import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Leaf, TreePine, Factory, Zap, ArrowRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const projectTypes = [
  { value: "redd", label: "REDD+ (Florestal)", icon: TreePine, factor: 15.5, unit: "tCO₂/ha/ano" },
  { value: "arr", label: "ARR (Reflorestamento)", icon: TreePine, factor: 12.3, unit: "tCO₂/ha/ano" },
  { value: "agri", label: "Agricultura Regenerativa", icon: Leaf, factor: 3.2, unit: "tCO₂/ha/ano" },
  { value: "energy", label: "Energia Renovável", icon: Zap, factor: 0.85, unit: "tCO₂/MWh" },
  { value: "industrial", label: "Eficiência Industrial", icon: Factory, factor: 0.45, unit: "tCO₂/ton" },
];

export function DashboardCalculator() {
  const [projectType, setProjectType] = useState("");
  const [area, setArea] = useState("");
  const [result, setResult] = useState<{ credits: number; value: number } | null>(null);

  const calculateCredits = () => {
    const selectedType = projectTypes.find(p => p.value === projectType);
    if (!selectedType || !area) return;

    const areaNum = parseFloat(area);
    const credits = areaNum * selectedType.factor;
    const avgPrice = 12.5; // Average price per credit in USD
    const value = credits * avgPrice;

    setResult({ credits, value });
  };

  const selectedProjectType = projectTypes.find(p => p.value === projectType);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-display">Calculadora de Créditos</CardTitle>
            <p className="text-sm text-muted-foreground">Estime o potencial do seu projeto</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              Tipo de Projeto
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Selecione o tipo de projeto para calcular o potencial de geração de créditos de carbono.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4 text-primary" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {selectedProjectType?.value === "energy" ? "Capacidade (MWh/ano)" : 
               selectedProjectType?.value === "industrial" ? "Produção (ton/ano)" : 
               "Área (hectares)"}
            </Label>
            <Input
              type="number"
              placeholder="Ex: 1000"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="bg-secondary/50"
            />
          </div>

          <Button 
            onClick={calculateCredits} 
            disabled={!projectType || !area}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calcular Potencial
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent border border-primary/20">
            <div className="text-center space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Estimativa Anual</p>
              <div className="space-y-1">
                <p className="text-3xl font-display font-bold text-primary">
                  {result.credits.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-muted-foreground">créditos de carbono (tCO₂e)</p>
              </div>
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Valor estimado de mercado</p>
                <p className="text-xl font-semibold text-emerald-500">
                  ${result.value.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full border-primary/30 text-primary hover:bg-primary/10">
                Criar Projeto
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {selectedProjectType && !result && (
          <div className="text-xs text-muted-foreground text-center p-3 rounded-lg bg-secondary/30">
            <span className="font-medium text-foreground">{selectedProjectType.label}:</span>{" "}
            Fator médio de {selectedProjectType.factor} {selectedProjectType.unit}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
