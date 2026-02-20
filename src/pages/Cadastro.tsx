import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowRight, 
  ArrowLeft,
  TreePine,
  Briefcase,
  Landmark,
  FolderOpen,
  Check,
  Scale,
  Banknote,
  ClipboardCheck,
  HelpCircle,
  Eye,
  EyeOff,
  Users,
  Mail,
  MapPin,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";

// Updated agent types per requirements
const agentTypes = [
  { id: "proprietario", icon: TreePine, label: "Proprietário Rural", description: "Possuo áreas rurais com potencial para projetos" },
  { id: "desenvolvedor", icon: Briefcase, label: "Desenvolvedor de Projetos", description: "Desenvolvo projetos de carbono" },
  { id: "auditor", icon: ClipboardCheck, label: "Auditor", description: "Realizo auditorias de projetos" },
  { id: "investidor", icon: Landmark, label: "Investidor / Comprador", description: "Invisto ou compro créditos de carbono" },
  { id: "financeira", icon: Banknote, label: "Instituição Financeira", description: "Banco ou fundo de investimento" },
  { id: "advogado", icon: Scale, label: "Jurídico", description: "Ofereço serviços jurídicos especializados" },
  { id: "projeto", icon: FolderOpen, label: "Projeto Existente", description: "Tenho projeto já estruturado" },
  { id: "consultoria", icon: Users, label: "Consultoria", description: "Presto consultoria em carbono e sustentabilidade" },
  { id: "outro", icon: HelpCircle, label: "Outro", description: "Outro tipo de atuação no mercado" },
];

const PAISES = ["Brasil", "Argentina", "Paraguai", "Uruguai", "Chile", "Colômbia", "Peru", "Estados Unidos", "Portugal", "Outro"];
const ESTADOS_BRASIL = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

const STATUS_PROJETO = [
  { value: "em_andamento", label: "Projeto em andamento" },
  { value: "concluido", label: "Projeto concluído" },
  { value: "nao_aplicavel", label: "Não se aplica" },
];

// CPF/CNPJ validation and formatting
const formatCpfCnpj = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    // CPF format: 000.000.000-00
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    // CNPJ format: 00.000.000/0000-00
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
};

const validateCpfCnpj = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 11 || numbers.length === 14) {
    return true;
  }
  return false;
};

const signUpSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  cpfCnpj: z.string().refine((val) => validateCpfCnpj(val), "CPF ou CNPJ inválido"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
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
    cpfCnpj: "",
    pais: "Brasil",
    estado: "",
    cidade: "",
    statusProjeto: "nao_aplicavel",
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
      toast.error("Selecione um tipo de perfil");
      return;
    }
    setStep(2);
  };

  const handleChange = (field: string, value: string) => {
    if (field === "cpfCnpj") {
      value = formatCpfCnpj(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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

    // Map to database enum - consultoria maps to "outro" in DB
    const enumTypes = ["proprietario", "engenheiro", "desenvolvedor", "certificadora", "investidor", "projeto", "outro", "comprador", "auditor", "financeira", "advogado"];
    let dbAgentType = selectedType;
    if (selectedType === "consultoria") {
      dbAgentType = "outro";
    } else if (!enumTypes.includes(selectedType)) {
      dbAgentType = "outro";
    }

    const { error, data } = await signUp(formData.email, formData.password, {
      name: formData.nomeCompleto,
      agent_type: dbAgentType,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este e-mail já está cadastrado. Faça login ou recupere sua senha.");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    // Update profile with location and additional data
    if (data?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      
      if (profile) {
        const location = formData.pais === "Brasil" && formData.estado 
          ? `${formData.cidade}, ${formData.estado}, ${formData.pais}` 
          : `${formData.cidade}, ${formData.pais}`;
          
        await supabase
          .from("profiles")
          .update({
            name: formData.nomeCompleto,
            location: location,
          })
          .eq("id", profile.id);
      }
    }

    toast.success("Cadastro realizado! Verifique seu e-mail para confirmar sua conta.", {
      description: "Após confirmar, complete seu perfil para maior visibilidade.",
      duration: 6000,
    });
    navigate("/login");
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* Background effects */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5ZWZmMWYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        
        <Link to="/" className="relative z-10">
          <Logo size="md" />
        </Link>

        <div className="max-w-md relative z-10">
          <h1 className="font-display text-4xl font-bold mb-4 text-foreground">
            Cadastro rápido e simples
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Em poucos passos você já estará conectado com a maior rede de 
            créditos de carbono e sustentabilidade.
          </p>
          
          <div className="space-y-3">
            {[
              "Cadastro inicial em 2 minutos",
              "Complete seu perfil depois",
              "Perfis completos têm mais visibilidade",
              "Validação por e-mail obrigatória",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground/80">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground relative z-10">
          © {new Date().getFullYear()} CONNEX. Todos os direitos reservados.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center mb-8">
            <Logo size="md" />
          </Link>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>1</div>
                <div className={cn("w-12 h-1 rounded transition-all", step >= 2 ? "bg-primary" : "bg-muted")} />
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>2</div>
              </div>
              <CardTitle className="font-display text-2xl">
                {step === 1 ? "Qual é o seu perfil?" : "Dados básicos"}
              </CardTitle>
              <CardDescription className="text-sm">
                {step === 1 
                  ? "Selecione o tipo que melhor descreve sua atuação" 
                  : "Preencha os dados essenciais para criar sua conta"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-2 scrollbar-thin">
                  {agentTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                        selectedType === type.id
                          ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(158,255,31,0.1)]"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                        selectedType === type.id ? "bg-primary/20" : "bg-secondary"
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
                    <Badge variant="emerald" className="font-medium">
                      {agentTypes.find(t => t.id === selectedType)?.label}
                    </Badge>
                    <button type="button" onClick={() => setStep(1)} className="text-sm text-primary hover:underline">
                      Alterar
                    </button>
                  </div>

                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nomeCompleto">Nome / Razão Social *</Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleChange("nomeCompleto", e.target.value)}
                      placeholder="Digite seu nome ou razão social"
                      className={cn(errors.nomeCompleto && "border-destructive")}
                      required
                    />
                    {errors.nomeCompleto && (
                      <p className="text-xs text-destructive">{errors.nomeCompleto}</p>
                    )}
                  </div>

                  {/* CPF/CNPJ */}
                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
                    <Input
                      id="cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={(e) => handleChange("cpfCnpj", e.target.value)}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      maxLength={18}
                      className={cn(errors.cpfCnpj && "border-destructive")}
                      required
                    />
                    {errors.cpfCnpj && (
                      <p className="text-xs text-destructive">{errors.cpfCnpj}</p>
                    )}
                  </div>

                  {/* Location */}
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
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS_BRASIL.map((uf) => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Cidade - Obrigatório */}
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleChange("cidade", e.target.value)}
                        placeholder="Digite sua cidade"
                        className={cn("pl-10", errors.cidade && "border-destructive")}
                        required
                      />
                    </div>
                    {errors.cidade && (
                      <p className="text-xs text-destructive">{errors.cidade}</p>
                    )}
                  </div>

                  {/* Status do Projeto - para tipos relevantes */}
                  {(selectedType === "projeto" || selectedType === "desenvolvedor" || selectedType === "proprietario") && (
                    <div className="space-y-2">
                      <Label>Status do Projeto</Label>
                      <Select value={formData.statusProjeto} onValueChange={(v) => handleChange("statusProjeto", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_PROJETO.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Outro tipo */}
                  {selectedType === "outro" && (
                    <div className="space-y-2">
                      <Label htmlFor="outroTipo">Especifique sua atuação *</Label>
                      <Input
                        id="outroTipo"
                        value={formData.outroTipo}
                        onChange={(e) => handleChange("outroTipo", e.target.value)}
                        placeholder="Descreva seu tipo de atuação"
                        required
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        className={cn("pl-10", errors.email && "border-destructive")}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className={cn("pr-10", errors.password && "border-destructive")}
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
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      placeholder="Repita a senha"
                      className={cn(errors.confirmPassword && "border-destructive")}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Info about email validation */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Importante:</strong> Você receberá um e-mail de confirmação. 
                      O acesso à plataforma só será liberado após a validação do seu e-mail.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                          Criando...
                        </span>
                      ) : (
                        <>Criar Conta <ArrowRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  </div>

                  {/* Additional info */}
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Informações adicionais podem ser completadas no seu perfil após o cadastro.
                  </p>
                </form>
              )}

              {/* Login link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Já possui uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
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
