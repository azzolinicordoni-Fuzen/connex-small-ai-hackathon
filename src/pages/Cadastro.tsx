import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  TreePine,
  HardHat,
  Briefcase,
  Award,
  Landmark,
  FolderOpen,
  Users,
  Check,
  ShoppingCart
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import ProprietarioForm from "@/components/cadastro/ProprietarioForm";
import CertificadoraForm from "@/components/cadastro/CertificadoraForm";
import InvestidorForm from "@/components/cadastro/InvestidorForm";
import CompradorForm from "@/components/cadastro/CompradorForm";
import ProjetoForm from "@/components/cadastro/ProjetoForm";

const agentTypes = [
  { id: "proprietario", icon: TreePine, label: "Proprietário Rural", description: "Possuo áreas rurais com potencial" },
  { id: "certificadora", icon: Award, label: "Certificadora", description: "Ofereço serviços de auditoria" },
  { id: "investidor", icon: Landmark, label: "Fundo ou Banco", description: "Invisto em projetos de carbono" },
  { id: "comprador", icon: ShoppingCart, label: "Empresa Compradora", description: "Compro créditos de carbono" },
  { id: "projeto", icon: FolderOpen, label: "Projeto", description: "Tenho projeto para apresentar" },
  { id: "engenheiro", icon: HardHat, label: "Engenheiro", description: "Atuo em projetos técnicos" },
  { id: "desenvolvedor", icon: Briefcase, label: "Desenvolvedor", description: "Desenvolvo projetos sustentáveis" },
  { id: "outro", icon: Users, label: "Outro Agente", description: "Outro tipo de atuação" },
];

const signUpSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Cadastro() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileId, setProfileId] = useState<string | null>(null);
  
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

  const handleAccountSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);

    // Map comprador to outro for database (since comprador might not be in enum yet)
    const dbAgentType = selectedType === "comprador" ? "outro" : selectedType;

    const { error, data } = await signUp(formData.email, formData.password, {
      name: formData.name,
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

    // Get profile ID for the specific form
    if (data?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      
      if (profile) {
        setProfileId(profile.id);
      }
    }

    // Check if this type has a specific form
    const typesWithForms = ["proprietario", "certificadora", "investidor", "comprador", "projeto"];
    if (typesWithForms.includes(selectedType)) {
      setStep(3);
      setIsLoading(false);
    } else {
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    }
  };

  const handleSpecificFormSubmit = async (data: unknown) => {
    if (!profileId) {
      toast.error("Erro ao salvar dados. Tente novamente.");
      return;
    }

    setIsLoading(true);

    try {
      const tableMap: Record<string, string> = {
        proprietario: "proprietario_details",
        certificadora: "certificadora_details",
        investidor: "investidor_details",
        comprador: "comprador_details",
        projeto: "projeto_details",
      };

      const tableName = tableMap[selectedType];
      if (!tableName) {
        throw new Error("Tipo de agente inválido");
      }

      // Insert data into the specific table
      const insertData = {
        profile_id: profileId,
        ...(data as Record<string, unknown>),
      };

      const { error } = await supabase
        .from(tableName as "proprietario_details" | "certificadora_details" | "investidor_details" | "comprador_details" | "projeto_details")
        .insert(insertData as never);

      if (error) throw error;

      toast.success("Cadastro finalizado com sucesso!");
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("Error saving details:", error);
      toast.error("Erro ao salvar dados. Você pode completar depois no seu perfil.");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderSpecificForm = () => {
    const commonProps = {
      onBack: () => setStep(2),
      isLoading,
    };

    switch (selectedType) {
      case "proprietario":
        return <ProprietarioForm {...commonProps} onSubmit={handleSpecificFormSubmit} />;
      case "certificadora":
        return <CertificadoraForm {...commonProps} onSubmit={handleSpecificFormSubmit} />;
      case "investidor":
        return <InvestidorForm {...commonProps} onSubmit={handleSpecificFormSubmit} />;
      case "comprador":
        return <CompradorForm {...commonProps} onSubmit={handleSpecificFormSubmit} />;
      case "projeto":
        return <ProjetoForm {...commonProps} onSubmit={handleSpecificFormSubmit} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    if (step === 1) return "Qual é o seu perfil?";
    if (step === 2) return "Crie sua conta";
    return `Complete seu cadastro`;
  };

  const getStepDescription = () => {
    if (step === 1) return "Selecione o tipo de agente que melhor descreve você";
    if (step === 2) return "Preencha seus dados para criar sua conta";
    return `Informações específicas para ${agentTypes.find(t => t.id === selectedType)?.label}`;
  };

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
            Conecte-se com proprietários, engenheiros, investidores e desenvolvedores 
            para fazer seus projetos acontecerem.
          </p>
          
          {/* Benefits */}
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

          {/* Progress - Only show for first 2 steps */}
          {step <= 2 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                1
              </div>
              <div className={cn(
                "w-16 h-1 rounded-full transition-colors",
                step >= 2 ? "bg-primary" : "bg-muted"
              )} />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                2
              </div>
              {["proprietario", "certificadora", "investidor", "comprador", "projeto"].includes(selectedType) && (
                <>
                  <div className={cn(
                    "w-16 h-1 rounded-full transition-colors",
                    step >= 3 ? "bg-primary" : "bg-muted"
                  )} />
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    3
                  </div>
                </>
              )}
            </div>
          )}

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="font-display text-3xl">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-base">
                {getStepDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-3">
                  {agentTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                        selectedType === type.id ? "bg-primary/10" : "bg-secondary"
                      )}>
                        <type.icon className={cn(
                          "w-6 h-6",
                          selectedType === type.id ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                      {selectedType === type.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                  <Button 
                    onClick={handleTypeSelect}
                    size="lg" 
                    className="w-full mt-6"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleAccountSubmit}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Badge variant="emerald">
                        {agentTypes.find(t => t.id === selectedType)?.label}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm text-primary hover:underline"
                      >
                        Alterar
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome"
                          className={cn("pl-10", errors.name && "border-destructive")}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          className={cn("pl-10", errors.email && "border-destructive")}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={cn("pl-10", errors.confirmPassword && "border-destructive")}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      onClick={() => setStep(1)}
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
                      {isLoading ? "Criando..." : "Criar Conta"}
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && renderSpecificForm()}

              <p className="text-center text-sm text-muted-foreground mt-6">
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