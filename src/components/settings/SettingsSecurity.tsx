import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Lock, 
  Shield,
  Smartphone,
  Clock,
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

export function SettingsSecurity() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setIsChangingPassword(true);
    // Simulated - would integrate with Supabase auth
    setTimeout(() => {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    }, 1000);
  };

  const handleLogoutAll = () => {
    toast.success("Você foi desconectado de todos os dispositivos");
  };

  // Mock active sessions
  const activeSessions = [
    { device: "Chrome - Windows", location: "São Paulo, BR", lastActive: "Agora", current: true },
    { device: "Safari - iPhone", location: "São Paulo, BR", lastActive: "2 horas atrás", current: false },
  ];

  // Mock access history
  const accessHistory = [
    { action: "Login", device: "Chrome - Windows", date: "10/12/2024 14:30", location: "São Paulo, BR" },
    { action: "Login", device: "Safari - iPhone", date: "10/12/2024 10:15", location: "São Paulo, BR" },
    { action: "Alteração de senha", device: "Chrome - Windows", date: "05/12/2024 16:45", location: "São Paulo, BR" },
  ];

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Atualize sua senha regularmente para maior segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
            />
          </div>

          <Button 
            onClick={handleChangePassword} 
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {isChangingPassword ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Sessões Ativas
          </CardTitle>
          <CardDescription>
            Dispositivos conectados à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {session.device}
                    {session.current && <Badge variant="default" className="text-xs">Atual</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-1" />
                  Encerrar
                </Button>
              )}
            </div>
          ))}

          <Separator />

          <Button variant="destructive" onClick={handleLogoutAll} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Encerrar Todas as Sessões
          </Button>
        </CardContent>
      </Card>

      {/* Access History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Acessos
          </CardTitle>
          <CardDescription>
            Atividades recentes na sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessHistory.map((entry, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.device} • {entry.location}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
