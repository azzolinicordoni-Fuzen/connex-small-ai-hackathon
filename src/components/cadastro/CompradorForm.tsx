import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompradorFormData {
  // A. Dados Corporativos
  cnpj: string;
  setor: string;
  numero_funcionarios: string;
  // B. Metas ESG
  compromissos_publicos: string;
  ano_net_zero: string;
  // C. Necessidades
  volume_anual_creditos: string;
  preferencia_florestal: boolean;
  preferencia_solo: boolean;
  preferencia_metano: boolean;
  preferencia_energia: boolean;
  // D. Políticas
  exigencia_certificacao: string;
  criterios_sociais: string;
}

interface Props {
  onSubmit: (data: CompradorFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function CompradorForm({ onSubmit, onBack, isLoading }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CompradorFormData>({
    cnpj: "",
    setor: "",
    numero_funcionarios: "",
    compromissos_publicos: "",
    ano_net_zero: "",
    volume_anual_creditos: "",
    preferencia_florestal: false,
    preferencia_solo: false,
    preferencia_metano: false,
    preferencia_energia: false,
    exigencia_certificacao: "",
    criterios_sociais: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const preferencias = [
    { key: "preferencia_florestal", label: "Florestal" },
    { key: "preferencia_solo", label: "Solo" },
    { key: "preferencia_metano", label: "Metano" },
    { key: "preferencia_energia", label: "Energia" },
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
            <CardTitle className="text-lg font-semibold text-foreground">A. Dados Corporativos</CardTitle>
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
              <Label htmlFor="setor">Setor</Label>
              <Input
                id="setor"
                placeholder="Ex: Energia, Varejo, Tecnologia"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_funcionarios">Número de Funcionários</Label>
              <Input
                id="numero_funcionarios"
                type="number"
                placeholder="0"
                value={formData.numero_funcionarios}
                onChange={(e) => setFormData({ ...formData, numero_funcionarios: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">B. Metas ESG</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="compromissos_publicos">Compromissos Públicos</Label>
              <Textarea
                id="compromissos_publicos"
                placeholder="Descreva os compromissos ESG da empresa..."
                rows={4}
                value={formData.compromissos_publicos}
                onChange={(e) => setFormData({ ...formData, compromissos_publicos: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano_net_zero">Ano-Alvo de Net Zero</Label>
              <Input
                id="ano_net_zero"
                type="number"
                placeholder="Ex: 2030"
                min="2024"
                max="2100"
                value={formData.ano_net_zero}
                onChange={(e) => setFormData({ ...formData, ano_net_zero: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">C. Necessidades</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="volume_anual">Volume Anual de Créditos Necessário (tCO₂e)</Label>
              <Input
                id="volume_anual"
                type="number"
                placeholder="0"
                value={formData.volume_anual_creditos}
                onChange={(e) => setFormData({ ...formData, volume_anual_creditos: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferências de Tipo de Crédito</Label>
              <div className="grid grid-cols-2 gap-2">
                {preferencias.map((pref) => (
                  <div
                    key={pref.key}
                    onClick={() => setFormData(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof CompradorFormData] }))}
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors",
                      formData[pref.key as keyof CompradorFormData]
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                  >
                    <Checkbox checked={formData[pref.key as keyof CompradorFormData] as boolean} />
                    <Label className="cursor-pointer">{pref.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">D. Políticas</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exigencia_certificacao">Exigência de Certificação</Label>
              <Input
                id="exigencia_certificacao"
                placeholder="Ex: Verra, Gold Standard"
                value={formData.exigencia_certificacao}
                onChange={(e) => setFormData({ ...formData, exigencia_certificacao: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterios_sociais">Critérios Sociais</Label>
              <Textarea
                id="criterios_sociais"
                placeholder="Descreva os critérios sociais (comunidades, etc.)..."
                rows={4}
                value={formData.criterios_sociais}
                onChange={(e) => setFormData({ ...formData, criterios_sociais: e.target.value })}
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
          {isLoading ? "Salvando..." : step === 4 ? "Finalizar Cadastro" : "Continuar"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}