import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";

export default function RedefinirSenha() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    
    checkSession();

    // Listen for auth state changes (password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsValidSession(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = () => {
    if (password.length < 8) {
      return "A senha deve ter pelo menos 8 caracteres";
    }
    if (password !== confirmPassword) {
      return "As senhas não coincidem";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePassword();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
    if (error) {
      toast.error("Erro ao redefinir senha. Tente novamente.");
      setIsLoading(false);
      return;
    }
    
    setSuccess(true);
    setIsLoading(false);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            Crie uma nova{" "}
            <span className="text-primary">senha segura</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Escolha uma senha forte com pelo menos 8 caracteres, incluindo 
            letras e números para maior segurança.
          </p>
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
              {success ? (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="font-display text-2xl text-foreground">Senha redefinida!</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Sua senha foi alterada com sucesso. Você será redirecionado para o login.
                  </CardDescription>
                </>
              ) : !isValidSession ? (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <CardTitle className="font-display text-2xl text-foreground">Link inválido</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Este link de recuperação é inválido ou expirou. Solicite um novo link.
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="font-display text-3xl text-foreground">Nova senha</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Digite sua nova senha abaixo
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Redirecionando...</span>
                  </div>
                </div>
              ) : !isValidSession ? (
                <Link to="/recuperar-senha">
                  <Button className="w-full h-12 text-base font-semibold">
                    Solicitar novo link
                  </Button>
                </Link>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Nova senha</Label>
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
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirmar nova senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold" 
                    size="lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Redefinir senha"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
