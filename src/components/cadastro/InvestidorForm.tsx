import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestidorFormData {
  // A. Instituição
  cnpj: string;
  website: string;
  tipo_investidor: string;
  // B. Tese de Investimento
  ticket_minimo: string;
  ticket_maximo: string;
  interesse_financeiro: string[];
  // C. Tipos de Projetos Buscados
  busca_floresta_nativa: boolean;
  busca_agricultura_regenerativa: boolean;
  busca_biodiversidade: boolean;
  busca_energia_renovavel: boolean;
  // D. Restrições
  exigencia_certificadora: string;
  localizacao_preferencial: string[];
}

interface Props {
  onSubmit: (data: InvestidorFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function InvestidorForm({ onSubmit, onBack, isLoading }: Props) {
  const [step, setStep] = useState(1);
  const [newLocalizacao, setNewLocalizacao] = useState("");
  const [formData, setFormData] = useState<InvestidorFormData>({
    cnpj: "",
    website: "",
    tipo_investidor: "",
    ticket_minimo: "",
    ticket_maximo: "",
    interesse_financeiro: [],
    busca_floresta_nativa: false,
    busca_agricultura_regenerativa: false,
    busca_biodiversidade: false,
    busca_energia_renovavel: false,
    exigencia_certificadora: "",
    localizacao_preferencial: [],
  });

  const handleArrayToggle = (field: "interesse_financeiro", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const addLocalizacao = () => {
    if (newLocalizacao.trim()) {
      setFormData(prev => ({
        ...prev,
        localizacao_preferencial: [...prev.localizacao_preferencial, newLocalizacao.trim()]
      }));
      setNewLocalizacao("");
    }
  };

  const removeLocalizacao = (index: number) => {
    setFormData(prev => ({
      ...prev,
      localizacao_preferencial: prev.localizacao_preferencial.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const tiposInvestidor = [
    { value: "fundo_esg", label: "Fundo ESG" },
    { value: "banco", label: "Banco" },
    { value: "venture_capital", label: "Venture Capital" },
    { value: "family_office", label: "Family Office" },
  ];

  const interessesFinanceiros = [
    { value: "equity", label: "Equity" },
    { value: "revenue_share", label: "Revenue Share" },
    { value: "forward", label: "Compra antecipada de créditos (Forward)" },
  ];

  const tiposProjeto = [
    { key: "busca_floresta_nativa", label: "Floresta nativa" },
    { key: "busca_agricultura_regenerativa", label: "Agricultura regenerativa" },
    { key: "busca_biodiversidade", label: "Biodiversidade" },
    { key: "busca_energia_renovavel", label: "Energia renovável" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {s}
            </div>
            {s < 4 && (
              <div className={cn(
                "w-8 h-1 rounded-full transition-colors",
                step > s ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">A. Instituição</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://www.exemplo.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Investidor</Label>
              <RadioGroup
                value={formData.tipo_investidor}
                onValueChange={(value) => setFormData({ ...formData, tipo_investidor: value })}
                className="grid grid-cols-2 gap-2"
              >
                {tiposInvestidor.map((tipo) => (
                  <div key={tipo.value} className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value={tipo.value} id={tipo.value} />
                    <Label htmlFor={tipo.value} className="cursor-pointer">{tipo.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">B. Tese de Investimento</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket_minimo">Ticket Mínimo (R$)</Label>
                <Input
                  id="ticket_minimo"
                  type="number"
                  placeholder="0"
                  value={formData.ticket_minimo}
                  onChange={(e) => setFormData({ ...formData, ticket_minimo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket_maximo">Ticket Máximo (R$)</Label>
                <Input
                  id="ticket_maximo"
                  type="number"
                  placeholder="0"
                  value={formData.ticket_maximo}
                  onChange={(e) => setFormData({ ...formData, ticket_maximo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Interesse Financeiro</Label>
              <div className="space-y-2">
                {interessesFinanceiros.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => handleArrayToggle("interesse_financeiro", item.value)}
                    className={cn(
                      "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                      formData.interesse_financeiro.includes(item.value)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                  >
                    <Checkbox checked={formData.interesse_financeiro.includes(item.value)} />
                    <Label className="cursor-pointer font-medium">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">C. Tipos de Projetos Buscados</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            {tiposProjeto.map((projeto) => (
              <div
                key={projeto.key}
                onClick={() => setFormData(prev => ({ ...prev, [projeto.key]: !prev[projeto.key as keyof InvestidorFormData] }))}
                className={cn(
                  "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                  formData[projeto.key as keyof InvestidorFormData]
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                )}
              >
                <Checkbox checked={formData[projeto.key as keyof InvestidorFormData] as boolean} />
                <Label className="cursor-pointer font-medium">{projeto.label}</Label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">D. Restrições</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exigencia_certificadora">Exigência de Certificadora Específica</Label>
              <Input
                id="exigencia_certificadora"
                placeholder="Ex: Verra, Gold Standard, ou nenhuma"
                value={formData.exigencia_certificadora}
                onChange={(e) => setFormData({ ...formData, exigencia_certificadora: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Localização Preferencial</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Amazônia, Cerrado, Mata Atlântica"
                  value={newLocalizacao}
                  onChange={(e) => setNewLocalizacao(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocalizacao())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addLocalizacao}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.localizacao_preferencial.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.localizacao_preferencial.map((loc, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {loc}
                      <button type="button" onClick={() => removeLocalizacao(idx)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button type="submit" size="lg" disabled={isLoading} className="flex-1">
          {isLoading ? "Salvando..." : step === 4 ? "Finalizar Cadastro" : "Continuar"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}