import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Digite seu e-mail");
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    
    if (error) {
      toast.error("Erro ao enviar e-mail. Tente novamente.");
      setIsLoading(false);
      return;
    }
    
    setEmailSent(true);
    setIsLoading(false);
  };

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
            Recupere o acesso à sua{" "}
            <span className="text-primary">conta</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Enviaremos um link seguro para o seu e-mail. O link tem validade 
            temporária para garantir sua segurança.
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
              {emailSent ? (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="font-display text-2xl text-foreground">E-mail enviado!</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="font-display text-3xl text-foreground">Recuperar senha</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Digite seu e-mail para receber o link de recuperação
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Importante:</strong> O link de recuperação 
                      expira em 24 horas. Caso não encontre o e-mail, verifique sua pasta de spam.
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                  >
                    Enviar novamente
                  </Button>
                  
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar para o login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
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

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold" 
                    size="lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </Button>

                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full h-12 text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar para o login
                    </Button>
                  </Link>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
