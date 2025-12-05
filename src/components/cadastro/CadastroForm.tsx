import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CadastroFormData {
// CadastroFormData is exported above
  // Basic info
  nomeCompleto: string;
  nomeFantasia: string;
  cpfCnpj: string;
  descricaoCurta: string;
  descricaoCompleta: string;
  
  // Location
  pais: string;
  estado: string;
  cidade: string;
  enderecoCompleto: string;
  atuacaoNacional: boolean;
  atuacaoInternacional: boolean;
  
  // For landowners and projects
  areaTotal: string;
  tipoBioma: string;
  linkMapa: string;
  
  // Contact
  emailPrincipal: string;
  telefone: string;
  whatsapp: string;
  site: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  outrosCanais: string;
  contatoComercialNome: string;
  contatoComercialFuncao: string;
  
  // Other agent type
  outroTipoEspecificar: string;
}

interface Props {
  agentType: string;
  onSubmit: (data: CadastroFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

const BIOMAS = [
  "Amazônia",
  "Mata Atlântica",
  "Cerrado",
  "Caatinga",
  "Pampa",
  "Pantanal",
];

const PAISES = [
  "Brasil",
  "Argentina",
  "Paraguai",
  "Uruguai",
  "Chile",
  "Colômbia",
  "Peru",
  "Estados Unidos",
  "Portugal",
  "Outro",
];

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function CadastroForm({ agentType, onSubmit, onBack, isLoading }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CadastroFormData>({
    nomeCompleto: "",
    nomeFantasia: "",
    cpfCnpj: "",
    descricaoCurta: "",
    descricaoCompleta: "",
    pais: "Brasil",
    estado: "",
    cidade: "",
    enderecoCompleto: "",
    atuacaoNacional: false,
    atuacaoInternacional: false,
    areaTotal: "",
    tipoBioma: "",
    linkMapa: "",
    emailPrincipal: "",
    telefone: "",
    whatsapp: "",
    site: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    outrosCanais: "",
    contatoComercialNome: "",
    contatoComercialFuncao: "",
    outroTipoEspecificar: "",
  });

  const showLandOwnerFields = agentType === "proprietario" || agentType === "projeto";
  const showOutroField = agentType === "outro";

  const handleChange = (field: keyof CadastroFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {s}
          </div>
          {s < 4 && (
            <div
              className={cn(
                "w-8 h-1 rounded-full transition-colors mx-1",
                step > s ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Dados Básicos</h3>
      
      <div className="space-y-2">
        <Label htmlFor="nomeCompleto">Nome Completo / Razão Social *</Label>
        <Input
          id="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={(e) => handleChange("nomeCompleto", e.target.value)}
          placeholder="Digite o nome completo ou razão social"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nomeFantasia">Nome Fantasia (opcional)</Label>
        <Input
          id="nomeFantasia"
          value={formData.nomeFantasia}
          onChange={(e) => handleChange("nomeFantasia", e.target.value)}
          placeholder="Nome fantasia da empresa"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpfCnpj">CPF / CNPJ *</Label>
        <Input
          id="cpfCnpj"
          value={formData.cpfCnpj}
          onChange={(e) => handleChange("cpfCnpj", e.target.value)}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Foto / Logo (opcional)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricaoCurta">
          Descrição Curta * <span className="text-muted-foreground text-xs">(até 300 caracteres - aparece em listas e cards)</span>
        </Label>
        <Textarea
          id="descricaoCurta"
          value={formData.descricaoCurta}
          onChange={(e) => handleChange("descricaoCurta", e.target.value.slice(0, 300))}
          placeholder="Breve descrição sobre você ou sua empresa"
          rows={2}
          maxLength={300}
          required
        />
        <p className="text-xs text-muted-foreground text-right">{formData.descricaoCurta.length}/300</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricaoCompleta">Descrição Completa</Label>
        <Textarea
          id="descricaoCompleta"
          value={formData.descricaoCompleta}
          onChange={(e) => handleChange("descricaoCompleta", e.target.value)}
          placeholder="Quem é, o que faz, foco de atuação, diferenciais..."
          rows={4}
        />
      </div>

      {showOutroField && (
        <div className="space-y-2">
          <Label htmlFor="outroTipoEspecificar">Especifique seu tipo de atuação *</Label>
          <Input
            id="outroTipoEspecificar"
            value={formData.outroTipoEspecificar}
            onChange={(e) => handleChange("outroTipoEspecificar", e.target.value)}
            placeholder="Descreva seu tipo de atuação"
            required
          />
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Localização</h3>
      
      <div className="space-y-2">
        <Label htmlFor="pais">País *</Label>
        <Select value={formData.pais} onValueChange={(value) => handleChange("pais", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            {PAISES.map((pais) => (
              <SelectItem key={pais} value={pais}>{pais}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estado">Estado / Província *</Label>
          {formData.pais === "Brasil" ? (
            <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)}>
              <SelectTrigger>
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASIL.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="estado"
              value={formData.estado}
              onChange={(e) => handleChange("estado", e.target.value)}
              placeholder="Estado ou província"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => handleChange("cidade", e.target.value)}
            placeholder="Nome da cidade"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="enderecoCompleto">Endereço Completo (opcional)</Label>
        <Input
          id="enderecoCompleto"
          value={formData.enderecoCompleto}
          onChange={(e) => handleChange("enderecoCompleto", e.target.value)}
          placeholder="Rua, número, bairro, CEP"
        />
      </div>

      <div className="space-y-3">
        <Label>Área de Atuação</Label>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="atuacaoNacional"
              checked={formData.atuacaoNacional}
              onCheckedChange={(checked) => handleChange("atuacaoNacional", !!checked)}
            />
            <Label htmlFor="atuacaoNacional" className="font-normal cursor-pointer">
              Atuação Nacional
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="atuacaoInternacional"
              checked={formData.atuacaoInternacional}
              onCheckedChange={(checked) => handleChange("atuacaoInternacional", !!checked)}
            />
            <Label htmlFor="atuacaoInternacional" className="font-normal cursor-pointer">
              Atuação Internacional
            </Label>
          </div>
        </div>
      </div>

      {showLandOwnerFields && (
        <>
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-base mb-4">Informações da Propriedade / Projeto</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="areaTotal">Área Total (ha)</Label>
              <Input
                id="areaTotal"
                type="number"
                value={formData.areaTotal}
                onChange={(e) => handleChange("areaTotal", e.target.value)}
                placeholder="Área em hectares"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoBioma">Tipo de Bioma</Label>
              <Select value={formData.tipoBioma} onValueChange={(value) => handleChange("tipoBioma", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {BIOMAS.map((bioma) => (
                    <SelectItem key={bioma} value={bioma}>{bioma}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkMapa">Link para Mapa / KML / GeoJSON (opcional)</Label>
            <Input
              id="linkMapa"
              type="url"
              value={formData.linkMapa}
              onChange={(e) => handleChange("linkMapa", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Contato Principal</h3>
      
      <div className="space-y-2">
        <Label htmlFor="emailPrincipal">E-mail Principal *</Label>
        <Input
          id="emailPrincipal"
          type="email"
          value={formData.emailPrincipal}
          onChange={(e) => handleChange("emailPrincipal", e.target.value)}
          placeholder="email@exemplo.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            type="tel"
            value={formData.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            placeholder="(00) 0000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="site">Site</Label>
        <Input
          id="site"
          type="url"
          value={formData.site}
          onChange={(e) => handleChange("site", e.target.value)}
          placeholder="https://www.seusite.com.br"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          id="linkedin"
          type="url"
          value={formData.linkedin}
          onChange={(e) => handleChange("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/seu-perfil"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Redes Sociais e Contato Comercial</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
            placeholder="@seu_instagram"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <Input
            id="youtube"
            type="url"
            value={formData.youtube}
            onChange={(e) => handleChange("youtube", e.target.value)}
            placeholder="https://youtube.com/@canal"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outrosCanais">Outros Canais</Label>
        <Input
          id="outrosCanais"
          value={formData.outrosCanais}
          onChange={(e) => handleChange("outrosCanais", e.target.value)}
          placeholder="Twitter, TikTok, etc."
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium text-base mb-4">Contato Comercial (opcional)</h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contatoComercialNome">Nome</Label>
          <Input
            id="contatoComercialNome"
            value={formData.contatoComercialNome}
            onChange={(e) => handleChange("contatoComercialNome", e.target.value)}
            placeholder="Nome do contato"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contatoComercialFuncao">Função</Label>
          <Input
            id="contatoComercialFuncao"
            value={formData.contatoComercialFuncao}
            onChange={(e) => handleChange("contatoComercialFuncao", e.target.value)}
            placeholder="Cargo ou função"
          />
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {renderStepIndicator()}
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      <div className="flex gap-3 mt-8">
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
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Salvando..." : step < 4 ? "Continuar" : "Finalizar Cadastro"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}
