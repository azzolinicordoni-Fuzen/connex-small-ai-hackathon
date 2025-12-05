import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjetoFormData {
  // A. Identificação
  nome_projeto: string;
  estado: string;
  municipio: string;
  responsavel: string;
  cnpj: string;
  // B. Tipo de Projeto
  tipo_projeto: string;
  // C. Status
  status: string;
  // E. Estimativas
  emissoes_evitadas_ano: string;
  prazo_projeto: string;
  investimento_total: string;
}

interface Props {
  onSubmit: (data: ProjetoFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function ProjetoForm({ onSubmit, onBack, isLoading }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProjetoFormData>({
    nome_projeto: "",
    estado: "",
    municipio: "",
    responsavel: "",
    cnpj: "",
    tipo_projeto: "",
    status: "",
    emissoes_evitadas_ano: "",
    prazo_projeto: "",
    investimento_total: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const tiposProjeto = [
    { value: "redd", label: "REDD+" },
    { value: "arr", label: "ARR (Aflorestamento/Reflorestamento)" },
    { value: "ar", label: "AR (Aflorestamento)" },
    { value: "agricultura_regenerativa", label: "Agricultura regenerativa" },
    { value: "outros", label: "Outros" },
  ];

  const statusOptions = [
    { value: "ideacao", label: "Ideação" },
    { value: "validacao", label: "Validação" },
    { value: "em_certificacao", label: "Em certificação" },
    { value: "certificado", label: "Certificado" },
    { value: "creditos_emitidos", label: "Créditos emitidos" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {s}
            </div>
            {s < 5 && (
              <div className={cn(
                "w-6 h-1 rounded-full transition-colors",
                step > s ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">A. Identificação</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_projeto">Nome do Projeto</Label>
              <Input
                id="nome_projeto"
                placeholder="Ex: Projeto Amazônia Verde"
                value={formData.nome_projeto}
                onChange={(e) => setFormData({ ...formData, nome_projeto: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  placeholder="Ex: Amazonas"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipio">Município</Label>
                <Input
                  id="municipio"
                  placeholder="Ex: Manaus"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                placeholder="Nome do responsável"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">B. Tipo de Projeto</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <RadioGroup
              value={formData.tipo_projeto}
              onValueChange={(value) => setFormData({ ...formData, tipo_projeto: value })}
              className="space-y-2"
            >
              {tiposProjeto.map((tipo) => (
                <div
                  key={tipo.value}
                  className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                    formData.tipo_projeto === tipo.value
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={tipo.value} id={tipo.value} />
                  <Label htmlFor={tipo.value} className="cursor-pointer font-medium flex-1">{tipo.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">C. Status</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <RadioGroup
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              className="space-y-2"
            >
              {statusOptions.map((status) => (
                <div
                  key={status.value}
                  className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                    formData.status === status.value
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={status.value} id={status.value} />
                  <Label htmlFor={status.value} className="cursor-pointer font-medium flex-1">{status.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">D. Documentação</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label>PDD (Project Design Document)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload do PDD</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>CAR (Cadastro Ambiental Rural)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload do CAR</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Geometria (Shapefile / KML)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload da geometria</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">E. Estimativas</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emissoes_evitadas">Emissões Evitadas (tCO₂e/ano)</Label>
              <Input
                id="emissoes_evitadas"
                type="number"
                placeholder="0"
                value={formData.emissoes_evitadas_ano}
                onChange={(e) => setFormData({ ...formData, emissoes_evitadas_ano: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prazo_projeto">Prazo do Projeto</Label>
              <Input
                id="prazo_projeto"
                placeholder="Ex: 30 anos"
                value={formData.prazo_projeto}
                onChange={(e) => setFormData({ ...formData, prazo_projeto: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investimento_total">Investimento Total Estimado (R$)</Label>
              <Input
                id="investimento_total"
                type="number"
                placeholder="0"
                value={formData.investimento_total}
                onChange={(e) => setFormData({ ...formData, investimento_total: e.target.value })}
              />
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
          {isLoading ? "Salvando..." : step === 5 ? "Finalizar Cadastro" : "Continuar"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}