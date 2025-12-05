import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProprietarioFormData {
  // A. Informações Pessoais
  cpf_cnpj: string;
  phone: string;
  whatsapp: string;
  estado: string;
  municipio: string;
  // B. Propriedade
  nome_fazenda: string;
  area_total_ha: string;
  area_disponivel_ha: string;
  tipo_uso_atual: string;
  car_numero: string;
  // C. Histórico Ambiental
  possui_projeto_carbono: boolean;
  areas_degradadas_percentual: string;
  possui_app: boolean;
  app_descricao: string;
  possui_reserva_legal: boolean;
  reserva_legal_descricao: string;
  // D. Interesses
  interesses_atrair: string[];
  tipos_projeto_desejado: string[];
}

interface Props {
  onSubmit: (data: ProprietarioFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function ProprietarioForm({ onSubmit, onBack, isLoading }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProprietarioFormData>({
    cpf_cnpj: "",
    phone: "",
    whatsapp: "",
    estado: "",
    municipio: "",
    nome_fazenda: "",
    area_total_ha: "",
    area_disponivel_ha: "",
    tipo_uso_atual: "",
    car_numero: "",
    possui_projeto_carbono: false,
    areas_degradadas_percentual: "",
    possui_app: false,
    app_descricao: "",
    possui_reserva_legal: false,
    reserva_legal_descricao: "",
    interesses_atrair: [],
    tipos_projeto_desejado: [],
  });

  const handleArrayToggle = (field: "interesses_atrair" | "tipos_projeto_desejado", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
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

  const tiposUso = [
    { value: "pecuaria", label: "Pecuária" },
    { value: "agricultura", label: "Agricultura" },
    { value: "floresta", label: "Floresta" },
    { value: "mista", label: "Mista" },
  ];

  const interessesOptions = [
    { value: "desenvolvedores", label: "Desenvolvedores" },
    { value: "consultorias", label: "Consultorias" },
    { value: "certificadoras", label: "Certificadoras" },
    { value: "investidores", label: "Investidores" },
  ];

  const tiposProjetoOptions = [
    { value: "redd", label: "Floresta nativa (REDD+)" },
    { value: "arr", label: "Aflorestamento / Reflorestamento" },
    { value: "agricultura_regenerativa", label: "Agricultura regenerativa (ARR)" },
    { value: "pecuaria_sustentavel", label: "Pecuária sustentável" },
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
            <CardTitle className="text-lg font-semibold text-foreground">A. Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
              <Input
                id="cpf_cnpj"
                placeholder="000.000.000-00"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  placeholder="Ex: São Paulo"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipio">Município</Label>
                <Input
                  id="municipio"
                  placeholder="Ex: Ribeirão Preto"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">B. Propriedade</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_fazenda">Nome da Fazenda</Label>
              <Input
                id="nome_fazenda"
                placeholder="Ex: Fazenda Santa Maria"
                value={formData.nome_fazenda}
                onChange={(e) => setFormData({ ...formData, nome_fazenda: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_total_ha">Área Total (ha)</Label>
                <Input
                  id="area_total_ha"
                  type="number"
                  placeholder="0"
                  value={formData.area_total_ha}
                  onChange={(e) => setFormData({ ...formData, area_total_ha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_disponivel_ha">Área Disponível (ha)</Label>
                <Input
                  id="area_disponivel_ha"
                  type="number"
                  placeholder="0"
                  value={formData.area_disponivel_ha}
                  onChange={(e) => setFormData({ ...formData, area_disponivel_ha: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Uso Atual</Label>
              <RadioGroup
                value={formData.tipo_uso_atual}
                onValueChange={(value) => setFormData({ ...formData, tipo_uso_atual: value })}
                className="grid grid-cols-2 gap-2"
              >
                {tiposUso.map((tipo) => (
                  <div key={tipo.value} className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value={tipo.value} id={tipo.value} />
                    <Label htmlFor={tipo.value} className="cursor-pointer">{tipo.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="car_numero">Número do CAR</Label>
              <Input
                id="car_numero"
                placeholder="Ex: SP-1234567-..."
                value={formData.car_numero}
                onChange={(e) => setFormData({ ...formData, car_numero: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Documento do CAR (Upload)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Documento Fundiário (Upload)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">C. Histórico Ambiental</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="possui_projeto_carbono"
                checked={formData.possui_projeto_carbono}
                onCheckedChange={(checked) => setFormData({ ...formData, possui_projeto_carbono: !!checked })}
              />
              <Label htmlFor="possui_projeto_carbono" className="cursor-pointer">
                Já possui projeto de carbono?
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="areas_degradadas">Áreas Degradadas (% aproximado)</Label>
              <Input
                id="areas_degradadas"
                type="number"
                placeholder="0"
                min="0"
                max="100"
                value={formData.areas_degradadas_percentual}
                onChange={(e) => setFormData({ ...formData, areas_degradadas_percentual: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="possui_app"
                  checked={formData.possui_app}
                  onCheckedChange={(checked) => setFormData({ ...formData, possui_app: !!checked })}
                />
                <Label htmlFor="possui_app" className="cursor-pointer">
                  Presença de APP (Área de Preservação Permanente)
                </Label>
              </div>
              {formData.possui_app && (
                <Textarea
                  placeholder="Descreva a APP..."
                  value={formData.app_descricao}
                  onChange={(e) => setFormData({ ...formData, app_descricao: e.target.value })}
                />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="possui_reserva_legal"
                  checked={formData.possui_reserva_legal}
                  onCheckedChange={(checked) => setFormData({ ...formData, possui_reserva_legal: !!checked })}
                />
                <Label htmlFor="possui_reserva_legal" className="cursor-pointer">
                  Presença de Reserva Legal
                </Label>
              </div>
              {formData.possui_reserva_legal && (
                <Textarea
                  placeholder="Descreva a Reserva Legal..."
                  value={formData.reserva_legal_descricao}
                  onChange={(e) => setFormData({ ...formData, reserva_legal_descricao: e.target.value })}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold text-foreground">D. Interesses</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label>Quero atrair:</Label>
              <div className="grid grid-cols-2 gap-2">
                {interessesOptions.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => handleArrayToggle("interesses_atrair", item.value)}
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors",
                      formData.interesses_atrair.includes(item.value)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                  >
                    <Checkbox checked={formData.interesses_atrair.includes(item.value)} />
                    <Label className="cursor-pointer">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de projeto desejado:</Label>
              <div className="space-y-2">
                {tiposProjetoOptions.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => handleArrayToggle("tipos_projeto_desejado", item.value)}
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors",
                      formData.tipos_projeto_desejado.includes(item.value)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                  >
                    <Checkbox checked={formData.tipos_projeto_desejado.includes(item.value)} />
                    <Label className="cursor-pointer">{item.label}</Label>
                  </div>
                ))}
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