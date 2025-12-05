import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Leaf, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  TreePine,
  Briefcase,
  Award,
  Landmark,
  FolderOpen,
  Check,
  Scale,
  Building2,
  Heart,
  Cpu,
  ClipboardCheck,
  HelpCircle,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const agentTypes = [
  { id: "proprietario", icon: TreePine, label: "Proprietário Rural", description: "Possuo áreas rurais com potencial" },
  { id: "desenvolvedor", icon: Briefcase, label: "Desenvolvedor de Projetos", description: "Desenvolvo projetos de carbono" },
  { id: "certificadora", icon: Award, label: "Certificadora / Padrão", description: "Certifico padrões de qualidade" },
  { id: "auditor", icon: ClipboardCheck, label: "Auditor / Verificador", description: "Realizo auditorias e verificações" },
  { id: "investidor", icon: Landmark, label: "Investidor / Comprador", description: "Invisto ou compro créditos de carbono" },
  { id: "instituicao_financeira", icon: Building2, label: "Instituição Financeira", description: "Banco ou fundo de investimento" },
  { id: "advogado", icon: Scale, label: "Advogado / Escritório Jurídico", description: "Ofereço serviços jurídicos" },
  { id: "plataforma_mrv", icon: Cpu, label: "Plataforma de Tecnologia / MRV", description: "Soluções de MRV e tecnologia" },
  { id: "ong", icon: Heart, label: "ONG / Entidade", description: "Organização sem fins lucrativos" },
  { id: "projeto", icon: FolderOpen, label: "Projeto Existente", description: "Tenho projeto já estruturado" },
  { id: "outro", icon: HelpCircle, label: "Outro", description: "Outro tipo de atuação" },
];

const BIOMAS = ["Amazônia", "Mata Atlântica", "Cerrado", "Caatinga", "Pampa", "Pantanal"];
const PAISES = ["Brasil", "Argentina", "Paraguai", "Uruguai", "Chile", "Colômbia", "Peru", "Estados Unidos", "Portugal", "Outro"];
const ESTADOS_BRASIL = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

const signUpSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Cadastro() {
  const [step, setStep] = useState(1);
  const [formStep, setFormStep] = useState(1); // Sub-step within step 2
  const [showPassword, setShowPassword] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    // Account
    email: "",
    password: "",
    confirmPassword: "",
    // Basic info
    nomeCompleto: "",
    nomeFantasia: "",
    cpfCnpj: "",
    descricaoCurta: "",
    descricaoCompleta: "",
    // Location
    pais: "Brasil",
    estado: "",
    cidade: "",
    enderecoCompleto: "",
    atuacaoNacional: false,
    atuacaoInternacional: false,
    // For landowners and projects
    areaTotal: "",
    tipoBioma: "",
    linkMapa: "",
    // Contact
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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  const showLandOwnerFields = selectedType === "proprietario" || selectedType === "projeto";
  const showOutroField = selectedType === "outro";

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleTypeSelect = () => {
    if (!selectedType) {
      toast.error("Selecione um tipo de agente");
      return;
    }
    setStep(2);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormStepNext = () => {
    if (formStep < 4) {
      setFormStep(formStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFormStepBack = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    } else {
      setStep(1);
    }
  };

  const handleFinalSubmit = async () => {
    setErrors({});

    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0]);
      return;
    }

    setIsLoading(true);

    const enumTypes = ["proprietario", "engenheiro", "desenvolvedor", "certificadora", "investidor", "projeto", "outro"];
    const dbAgentType = enumTypes.includes(selectedType) ? selectedType : "outro";

    const { error, data } = await signUp(formData.email, formData.password, {
      name: formData.nomeCompleto,
      agent_type: dbAgentType,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este e-mail já está cadastrado");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    // Get profile ID and update with additional data
    if (data?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      
      if (profile) {
        await supabase
          .from("profiles")
          .update({
            name: formData.nomeCompleto,
            bio: formData.descricaoCurta,
            location: `${formData.cidade}, ${formData.estado}, ${formData.pais}`,
            phone: formData.telefone,
            whatsapp: formData.whatsapp,
          })
          .eq("id", profile.id);
      }
    }

    toast.success("Cadastro finalizado com sucesso!");
    navigate("/dashboard");
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStepTitle = () => {
    if (step === 1) return "Qual é o seu perfil?";
    return "Crie sua conta";
  };

  const getStepDescription = () => {
    if (step === 1) return "Selecione o tipo de agente que melhor descreve você";
    if (formStep === 1) return "Dados básicos e de acesso";
    if (formStep === 2) return "Localização e área de atuação";
    if (formStep === 3) return "Contato principal";
    return "Redes sociais e contato comercial";
  };

  const renderFormStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="emerald">
          {agentTypes.find(t => t.id === selectedType)?.label}
        </Badge>
        <button type="button" onClick={() => setStep(1)} className="text-sm text-primary hover:underline">
          Alterar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="nomeCompleto">Nome Completo / Razão Social *</Label>
          <Input
            id="nomeCompleto"
            value={formData.nomeCompleto}
            onChange={(e) => handleChange("nomeCompleto", e.target.value)}
            placeholder="Digite o nome completo ou razão social"
            required
          />
        </div>

        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
          <Input
            id="nomeFantasia"
            value={formData.nomeFantasia}
            onChange={(e) => handleChange("nomeFantasia", e.target.value)}
            placeholder="Nome fantasia (opcional)"
          />
        </div>

        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="cpfCnpj">CPF / CNPJ *</Label>
          <Input
            id="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={(e) => handleChange("cpfCnpj", e.target.value)}
            placeholder="000.000.000-00"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Foto / Logo</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Clique para upload</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricaoCurta">
          Descrição Curta * <span className="text-muted-foreground text-xs">(até 300 caracteres)</span>
        </Label>
        <Textarea
          id="descricaoCurta"
          value={formData.descricaoCurta}
          onChange={(e) => handleChange("descricaoCurta", e.target.value.slice(0, 300))}
          placeholder="Breve descrição para listas e cards"
          rows={2}
          maxLength={300}
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
          rows={3}
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
          />
        </div>
      )}

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium text-sm mb-3">Dados de Acesso</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className={cn("pl-9", errors.email && "border-destructive")}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  className={cn("pl-9 pr-9", errors.password && "border-destructive")}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  className={cn("pl-9", errors.confirmPassword && "border-destructive")}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="pais">País *</Label>
          <Select value={formData.pais} onValueChange={(value) => handleChange("pais", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {PAISES.map((pais) => (
                <SelectItem key={pais} value={pais}>{pais}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="estado">Estado *</Label>
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
              value={formData.estado}
              onChange={(e) => handleChange("estado", e.target.value)}
              placeholder="Estado ou província"
            />
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            value={formData.cidade}
            onChange={(e) => handleChange("cidade", e.target.value)}
            placeholder="Nome da cidade"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="enderecoCompleto">Endereço Completo</Label>
          <Input
            value={formData.enderecoCompleto}
            onChange={(e) => handleChange("enderecoCompleto", e.target.value)}
            placeholder="Rua, número, bairro, CEP (opcional)"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Área de Atuação</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="atuacaoNacional"
              checked={formData.atuacaoNacional}
              onCheckedChange={(checked) => handleChange("atuacaoNacional", !!checked)}
            />
            <Label htmlFor="atuacaoNacional" className="font-normal cursor-pointer text-sm">
              Atuação Nacional
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="atuacaoInternacional"
              checked={formData.atuacaoInternacional}
              onCheckedChange={(checked) => handleChange("atuacaoInternacional", !!checked)}
            />
            <Label htmlFor="atuacaoInternacional" className="font-normal cursor-pointer text-sm">
              Atuação Internacional
            </Label>
          </div>
        </div>
      </div>

      {showLandOwnerFields && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-sm mb-3">Informações da Propriedade / Projeto</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="areaTotal">Área Total (ha)</Label>
              <Input
                type="number"
                value={formData.areaTotal}
                onChange={(e) => handleChange("areaTotal", e.target.value)}
                placeholder="Hectares"
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

            <div className="space-y-2 col-span-2">
              <Label htmlFor="linkMapa">Link Mapa / KML / GeoJSON</Label>
              <Input
                type="url"
                value={formData.linkMapa}
                onChange={(e) => handleChange("linkMapa", e.target.value)}
                placeholder="https://... (opcional)"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFormStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emailPrincipal">E-mail Principal *</Label>
        <Input
          type="email"
          value={formData.emailPrincipal || formData.email}
          onChange={(e) => handleChange("emailPrincipal", e.target.value)}
          placeholder="email@exemplo.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            type="tel"
            value={formData.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            placeholder="(00) 0000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
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
          type="url"
          value={formData.site}
          onChange={(e) => handleChange("site", e.target.value)}
          placeholder="https://www.seusite.com.br"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          type="url"
          value={formData.linkedin}
          onChange={(e) => handleChange("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/seu-perfil"
        />
      </div>
    </div>
  );

  const renderFormStep4 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            value={formData.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
            placeholder="@seu_instagram"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <Input
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
          value={formData.outrosCanais}
          onChange={(e) => handleChange("outrosCanais", e.target.value)}
          placeholder="Twitter, TikTok, etc."
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium text-sm mb-3">Contato Comercial (opcional)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contatoComercialNome">Nome</Label>
            <Input
              value={formData.contatoComercialNome}
              onChange={(e) => handleChange("contatoComercialNome", e.target.value)}
              placeholder="Nome do contato"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contatoComercialFuncao">Função</Label>
            <Input
              value={formData.contatoComercialFuncao}
              onChange={(e) => handleChange("contatoComercialFuncao", e.target.value)}
              placeholder="Cargo ou função"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-hero)" }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-primary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl">AgroConnect</span>
        </Link>

        <div className="max-w-md">
          <h1 className="font-display text-4xl font-bold mb-4">
            Junte-se à maior rede de agronegócio sustentável do Brasil
          </h1>
          <p className="text-primary-foreground/70 text-lg mb-8">
            Conecte-se com proprietários, desenvolvedores, investidores e certificadoras 
            para fazer seus projetos acontecerem.
          </p>
          
          <div className="space-y-3">
            {[
              "Acesso a milhares de agentes do setor",
              "Encontre projetos e oportunidades",
              "Chat e conexões como no LinkedIn",
              "Comece gratuitamente",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-primary-foreground/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} AgroConnect. Todos os direitos reservados.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background rounded-l-3xl lg:rounded-l-[3rem] overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">AgroConnect</span>
          </Link>

          {/* Progress */}
          {step === 2 && (
            <div className="flex items-center justify-center gap-1 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                      formStep >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={cn("w-6 h-1 rounded-full transition-colors mx-0.5", formStep > s ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
              ))}
            </div>
          )}

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle className="font-display text-2xl">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-sm">
                {getStepDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-2">
                  {agentTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                        selectedType === type.id ? "bg-primary/10" : "bg-secondary"
                      )}>
                        <type.icon className={cn(
                          "w-5 h-5",
                          selectedType === type.id ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">{type.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{type.description}</div>
                      </div>
                      {selectedType === type.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                  <Button onClick={handleTypeSelect} size="lg" className="w-full mt-4">
                    Continuar <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="max-h-[55vh] overflow-y-auto pr-2">
                  {formStep === 1 && renderFormStep1()}
                  {formStep === 2 && renderFormStep2()}
                  {formStep === 3 && renderFormStep3()}
                  {formStep === 4 && renderFormStep4()}

                  <div className="flex gap-3 mt-6 sticky bottom-0 bg-background pt-2">
                    <Button type="button" variant="outline" size="lg" onClick={handleFormStepBack} className="flex-1">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                    <Button type="button" size="lg" disabled={isLoading} onClick={handleFormStepNext} className="flex-1">
                      {isLoading ? "Salvando..." : formStep < 4 ? "Continuar" : "Finalizar"}
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-4">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Fazer login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
