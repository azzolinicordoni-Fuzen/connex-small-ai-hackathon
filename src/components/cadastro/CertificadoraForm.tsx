import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Upload, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificadoraFormData {
  // A. Informações da Instituição
  cnpj: string;
  selos_credenciamento: string[];
  numero_auditores: string;
  // B. Experiência
  metodologias_certificadas: string[];
  projetos_auditados_florestal: string;
  projetos_auditados_agricultura: string;
  projetos_auditados_energia: string;
  projetos_auditados_outros: string;
  areas_atuacao: string[];
  // C. Serviços Oferecidos
  servico_auditoria_inicial: boolean;
  servico_auditoria_monitoramento: boolean;
  servico_revisao_inventario: boolean;
  servico_verificacao_baseline: boolean;
}

interface Props {
  onSubmit: (data: CertificadoraFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function CertificadoraForm({ onSubmit, onBack, isLoading }: Props) {
  const [step, setStep] = useState(1);
  const [newSelo, setNewSelo] = useState("");
  const [newMetodologia, setNewMetodologia] = useState("");
  const [newArea, setNewArea] = useState("");
  const [formData, setFormData] = useState<CertificadoraFormData>({
    cnpj: "",
    selos_credenciamento: [],
    numero_auditores: "",
    metodologias_certificadas: [],
    projetos_auditados_florestal: "",
    projetos_auditados_agricultura: "",
    projetos_auditados_energia: "",
    projetos_auditados_outros: "",
    areas_atuacao: [],
    servico_auditoria_inicial: false,
    servico_auditoria_monitoramento: false,
    servico_revisao_inventario: false,
    servico_verificacao_baseline: false,
  });

  const addToArray = (field: "selos_credenciamento" | "metodologias_certificadas" | "areas_atuacao", value: string, setter: (v: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter("");
    }
  };

  const removeFromArray = (field: "selos_credenciamento" | "metodologias_certificadas" | "areas_atuacao", index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
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

  const selosSugeridos = ["Verra", "Gold Standard", "Plan Vivo", "American Carbon Registry", "Climate Action Reserve"];

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
            <CardTitle className="text-lg font-semibold text-foreground">A. Informações da Instituição</CardTitle>
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
              <Label>Selos de Credenciamento</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Verra, Gold Standard"
                  value={newSelo}
                  onChange={(e) => setNewSelo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("selos_credenciamento", newSelo, setNewSelo))}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => addToArray("selos_credenciamento", newSelo, setNewSelo)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selosSugeridos.filter(s => !formData.selos_credenciamento.includes(s)).map((selo) => (
                  <Button
                    key={selo}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, selos_credenciamento: [...prev.selos_credenciamento, selo] }))}
                  >
                    + {selo}
                  </Button>
                ))}
              </div>
              {formData.selos_credenciamento.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selos_credenciamento.map((selo, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {selo}
                      <button type="button" onClick={() => removeFromArray("selos_credenciamento", idx)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_auditores">Número Total de Auditores</Label>
              <Input
                id="numero_auditores"
                type="number"
                placeholder="0"
                value={formData.numero_auditores}
                onChange={(e) => setFormData({ ...formData, numero_auditores: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">B. Experiência</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label>Metodologias que Certificam</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: VM0007, AR-AM0014"
                  value={newMetodologia}
                  onChange={(e) => setNewMetodologia(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("metodologias_certificadas", newMetodologia, setNewMetodologia))}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => addToArray("metodologias_certificadas", newMetodologia, setNewMetodologia)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.metodologias_certificadas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.metodologias_certificadas.map((met, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {met}
                      <button type="button" onClick={() => removeFromArray("metodologias_certificadas", idx)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Número de Projetos Auditados (por categoria)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="florestal" className="text-sm text-muted-foreground">Florestal</Label>
                  <Input
                    id="florestal"
                    type="number"
                    placeholder="0"
                    value={formData.projetos_auditados_florestal}
                    onChange={(e) => setFormData({ ...formData, projetos_auditados_florestal: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="agricultura" className="text-sm text-muted-foreground">Agricultura</Label>
                  <Input
                    id="agricultura"
                    type="number"
                    placeholder="0"
                    value={formData.projetos_auditados_agricultura}
                    onChange={(e) => setFormData({ ...formData, projetos_auditados_agricultura: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="energia" className="text-sm text-muted-foreground">Energia</Label>
                  <Input
                    id="energia"
                    type="number"
                    placeholder="0"
                    value={formData.projetos_auditados_energia}
                    onChange={(e) => setFormData({ ...formData, projetos_auditados_energia: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="outros" className="text-sm text-muted-foreground">Outros</Label>
                  <Input
                    id="outros"
                    type="number"
                    placeholder="0"
                    value={formData.projetos_auditados_outros}
                    onChange={(e) => setFormData({ ...formData, projetos_auditados_outros: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Áreas de Atuação (Estados / Países)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: São Paulo, Brasil"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("areas_atuacao", newArea, setNewArea))}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => addToArray("areas_atuacao", newArea, setNewArea)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.areas_atuacao.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.areas_atuacao.map((area, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {area}
                      <button type="button" onClick={() => removeFromArray("areas_atuacao", idx)}>
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

      {step === 3 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">C. Serviços Oferecidos</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            {[
              { key: "servico_auditoria_inicial", label: "Auditoria inicial" },
              { key: "servico_auditoria_monitoramento", label: "Auditoria de monitoramento" },
              { key: "servico_revisao_inventario", label: "Revisão de inventário" },
              { key: "servico_verificacao_baseline", label: "Verificação de baseline" },
            ].map((servico) => (
              <div
                key={servico.key}
                onClick={() => setFormData(prev => ({ ...prev, [servico.key]: !prev[servico.key as keyof CertificadoraFormData] }))}
                className={cn(
                  "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                  formData[servico.key as keyof CertificadoraFormData]
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                )}
              >
                <Checkbox checked={formData[servico.key as keyof CertificadoraFormData] as boolean} />
                <Label className="cursor-pointer font-medium">{servico.label}</Label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">D. Uploads</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label>Portfólio</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload do portfólio</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Certificados Oficiais</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload dos certificados</p>
              </div>
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