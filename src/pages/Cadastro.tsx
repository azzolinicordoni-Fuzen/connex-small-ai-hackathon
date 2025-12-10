import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Leaf, 
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
  Eye,
  EyeOff,
  Banknote,
  ShoppingCart
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
  { id: "investidor", icon: Landmark, label: "Investidor", description: "Invisto em projetos de carbono" },
  { id: "comprador", icon: ShoppingCart, label: "Comprador de Créditos", description: "Compro créditos de carbono" },
  { id: "financeira", icon: Banknote, label: "Instituição Financeira", description: "Banco ou fundo de investimento" },
  { id: "advogado", icon: Scale, label: "Advogado / Escritório Jurídico", description: "Ofereço serviços jurídicos" },
  { id: "projeto", icon: FolderOpen, label: "Projeto Existente", description: "Tenho projeto já estruturado" },
  { id: "outro", icon: HelpCircle, label: "Outro", description: "Outro tipo de atuação" },
];

const PAISES = ["Brasil", "Argentina", "Paraguai", "Uruguai", "Chile", "Colômbia", "Peru", "Estados Unidos", "Portugal", "Outro"];
const ESTADOS_BRASIL = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

// Agent-specific options
const METODOLOGIAS = ["Verra (VCS)", "Gold Standard", "ACR", "CAR", "Plan Vivo", "Cercarbono", "Socialcarbon"];
const AREAS_AUDITORIA = ["Florestal", "Agricultura", "Energia Renovável", "Resíduos", "Transporte"];
const TIPOS_CREDITO = ["Remoção", "Redução", "REDD+", "ARR", "Agricultura Regenerativa", "Energia"];
const TIPOS_PROJETO = ["REDD+", "ARR (Reflorestamento)", "IFM", "Agricultura Regenerativa", "Energia Renovável", "Manejo de Resíduos"];

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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nomeCompleto: "",
    pais: "Brasil",
    estado: "",
    // Agent-specific fields
    metodologia: "",
    areaAuditoria: "",
    tipoCredito: "",
    tipoProjeto: "",
    outroTipo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getAgentSpecificField = () => {
    switch (selectedType) {
      case "certificadora":
        return (
          <div className="space-y-2">
            <Label>Metodologia Principal</Label>
            <Select value={formData.metodologia} onValueChange={(v) => handleChange("metodologia", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a metodologia" />
              </SelectTrigger>
              <SelectContent>
                {METODOLOGIAS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "auditor":
        return (
          <div className="space-y-2">
            <Label>Área de Auditoria Principal</Label>
            <Select value={formData.areaAuditoria} onValueChange={(v) => handleChange("areaAuditoria", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent>
                {AREAS_AUDITORIA.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "investidor":
      case "comprador":
        return (
          <div className="space-y-2">
            <Label>Tipo de Crédito de Interesse</Label>
            <Select value={formData.tipoCredito} onValueChange={(v) => handleChange("tipoCredito", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CREDITO.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "desenvolvedor":
      case "projeto":
        return (
          <div className="space-y-2">
            <Label>Tipo de Projeto</Label>
            <Select value={formData.tipoProjeto} onValueChange={(v) => handleChange("tipoProjeto", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PROJETO.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "outro":
        return (
          <div className="space-y-2">
            <Label>Especifique sua Atuação *</Label>
            <Input
              value={formData.outroTipo}
              onChange={(e) => handleChange("outroTipo", e.target.value)}
              placeholder="Descreva seu tipo de atuação"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (selectedType === "outro" && !formData.outroTipo) {
      toast.error("Especifique seu tipo de atuação");
      return;
    }

    setIsLoading(true);

    const enumTypes = ["proprietario", "engenheiro", "desenvolvedor", "certificadora", "investidor", "projeto", "outro", "comprador", "auditor", "financeira", "advogado"];
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

    // Update profile with location
    if (data?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      
      if (profile) {
        const location = formData.pais === "Brasil" && formData.estado 
          ? `${formData.estado}, ${formData.pais}` 
          : formData.pais;
          
        await supabase
          .from("profiles")
          .update({
            name: formData.nomeCompleto,
            location: location,
          })
          .eq("id", profile.id);
      }
    }

    toast.success("Cadastro realizado! Complete seu perfil para maior visibilidade.");
    navigate("/perfil");
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            Cadastro rápido e simples
          </h1>
          <p className="text-primary-foreground/70 text-lg mb-8">
            Em poucos passos você já estará conectado com a maior rede de 
            agronegócio sustentável do Brasil.
          </p>
          
          <div className="space-y-3">
            {[
              "Cadastro inicial em 2 minutos",
              "Complete seu perfil depois",
              "Perfis completos têm mais visibilidade",
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
      <div className="flex-1 flex items-center justify-center p-6 bg-background rounded-l-3xl lg:rounded-l-[3rem]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">AgroConnect</span>
          </Link>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>1</div>
                <div className={cn("w-12 h-1 rounded", step >= 2 ? "bg-primary" : "bg-muted")} />
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>2</div>
              </div>
              <CardTitle className="font-display text-2xl">
                {step === 1 ? "Qual é o seu perfil?" : "Dados básicos"}
              </CardTitle>
              <CardDescription className="text-sm">
                {step === 1 
                  ? "Selecione o tipo de agente que melhor descreve você" 
                  : "Preencha os dados essenciais para criar sua conta"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
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
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="emerald">
                      {agentTypes.find(t => t.id === selectedType)?.label}
                    </Badge>
                    <button type="button" onClick={() => setStep(1)} className="text-sm text-primary hover:underline">
                      Alterar
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeCompleto">Nome / Razão Social *</Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleChange("nomeCompleto", e.target.value)}
                      placeholder="Digite seu nome ou razão social"
                      className={errors.nomeCompleto ? "border-destructive" : ""}
                      required
                    />
                    {errors.nomeCompleto && (
                      <p className="text-xs text-destructive">{errors.nomeCompleto}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>País *</Label>
                      <Select value={formData.pais} onValueChange={(v) => handleChange("pais", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAISES.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.pais === "Brasil" && (
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select value={formData.estado} onValueChange={(v) => handleChange("estado", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS_BRASIL.map((e) => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Agent-specific field */}
                  {getAgentSpecificField()}

                  <div className="pt-2 border-t space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        className={errors.email ? "border-destructive" : ""}
                        required
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className={errors.password ? "border-destructive pr-10" : "pr-10"}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="Repita a senha"
                        className={errors.confirmPassword ? "border-destructive" : ""}
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? "Cadastrando..." : "Criar Conta"}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Já tem conta?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      Entrar
                    </Link>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
