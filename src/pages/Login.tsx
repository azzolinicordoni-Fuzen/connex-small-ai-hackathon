import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, Eye, EyeOff, User, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";

// CPF/CNPJ validation and formatting
const formatCpfCnpj = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 11) {
    // CPF: 000.000.000-00
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    // CNPJ: 00.000.000/0000-00
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  }
};

const validateCpf = (cpf: string) => {
  const numbers = cpf.replace(/\D/g, "");
  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;
  
  return true;
};

const validateCnpj = (cnpj: string) => {
  const numbers = cnpj.replace(/\D/g, "");
  if (numbers.length !== 14) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(numbers[12])) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(numbers[13])) return false;
  
  return true;
};

const validateCpfCnpj = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 11) return validateCpf(value);
  if (numbers.length === 14) return validateCnpj(value);
  return false;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "cpfcnpj">("email");
  const [email, setEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cpfCnpjError, setCpfCnpjError] = useState("");
  
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  // Connex Field (Phase 4): safe same-origin return path, allowlisted to /field only.
  const redirectTo = new URLSearchParams(window.location.search).get("redirect") === "/field" ? "/field" : "/dashboard";

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value);
    setCpfCnpj(formatted);
    setCpfCnpjError("");
    
    const numbers = formatted.replace(/\D/g, "");
    if (numbers.length === 11 || numbers.length === 14) {
      if (!validateCpfCnpj(formatted)) {
        setCpfCnpjError(numbers.length === 11 ? "CPF inválido" : "CNPJ inválido");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const loginIdentifier = loginMethod === "email" ? email : cpfCnpj;
    
    if (!loginIdentifier || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (loginMethod === "cpfcnpj") {
      if (!validateCpfCnpj(cpfCnpj)) {
        toast.error("CPF ou CNPJ inválido");
        return;
      }
    }

    setIsLoading(true);
    
    // For CPF/CNPJ login, we need to look up the email first
    // For now, we'll use email-based authentication
    const emailToUse = loginMethod === "email" ? email : `${cpfCnpj.replace(/\D/g, "")}@cpfcnpj.placeholder`;
    
    const { error } = await signIn(emailToUse, password);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Credenciais incorretas. Verifique seus dados.");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }
    
    toast.success("Login realizado com sucesso!");
    navigate(redirectTo);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background with gradient and effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), 
                               linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link to="/">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-display text-4xl xl:text-5xl font-bold mb-6 text-foreground leading-tight">
            Conecte-se ao futuro do{" "}
            <span className="text-primary">mercado de carbono</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Acesse sua conta e continue conectando-se com proprietários rurais, 
            desenvolvedores de projetos, certificadoras e investidores.
          </p>
          
          {/* Features list */}
          <div className="mt-8 space-y-4">
            {[
              "Rede profissional do agronegócio sustentável",
              "Conexões inteligentes entre agentes do ecossistema",
              "Gestão completa de projetos de carbono"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CONNEX. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center mb-8">
            <Logo size="md" />
          </Link>

          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="font-display text-3xl text-foreground">Entrar</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Acesse sua conta para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "email" | "cpfcnpj")} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    E-mail
                  </TabsTrigger>
                  <TabsTrigger value="cpfcnpj" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <User className="w-4 h-4 mr-2" />
                    CPF/CNPJ
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-5">
                {loginMethod === "email" ? (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="cpfcnpj" className="text-foreground">CPF ou CNPJ</Label>
                    <div className="relative">
                      {cpfCnpj.replace(/\D/g, "").length <= 11 ? (
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      )}
                      <Input
                        id="cpfcnpj"
                        type="text"
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        className={`pl-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary ${
                          cpfCnpjError ? "border-destructive focus:border-destructive" : ""
                        }`}
                        value={cpfCnpj}
                        onChange={handleCpfCnpjChange}
                        maxLength={18}
                        required
                      />
                    </div>
                    {cpfCnpjError && (
                      <p className="text-sm text-destructive">{cpfCnpjError}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-foreground">Senha</Label>
                    <Link 
                      to="/recuperar-senha" 
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold" 
                  size="lg" 
                  disabled={isLoading || (loginMethod === "cpfcnpj" && !!cpfCnpjError)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Link to="/cadastro" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    Cadastre-se grátis
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Security badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Conexão segura</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Dados criptografados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
