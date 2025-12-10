import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Users, 
  FolderOpen,
  Lock,
  Globe,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

export function SettingsPrivacy() {
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [feedVisibility, setFeedVisibility] = useState("connections");
  const [connectionsVisibility, setConnectionsVisibility] = useState("public");
  const [defaultProjectVisibility, setDefaultProjectVisibility] = useState("private");
  const [allowProjectRequests, setAllowProjectRequests] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(true);

  const handleSave = () => {
    toast.success("Configurações de privacidade salvas!");
  };

  const visibilityOptions = [
    { value: "public", label: "Público", icon: Globe, description: "Visível para todos" },
    { value: "connections", label: "Apenas Conexões", icon: UserCheck, description: "Apenas suas conexões" },
    { value: "private", label: "Privado", icon: Lock, description: "Apenas você" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Visibilidade do Perfil
          </CardTitle>
          <CardDescription>
            Controle quem pode ver suas informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Perfil</Label>
                <p className="text-xs text-muted-foreground">Quem pode ver seu perfil completo</p>
              </div>
              <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Feed e Publicações</Label>
                <p className="text-xs text-muted-foreground">Quem pode ver suas publicações</p>
              </div>
              <Select value={feedVisibility} onValueChange={setFeedVisibility}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Lista de Conexões</Label>
                <p className="text-xs text-muted-foreground">Quem pode ver suas conexões</p>
              </div>
              <Select value={connectionsVisibility} onValueChange={setConnectionsVisibility}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Informações de Contato
          </CardTitle>
          <CardDescription>
            Escolha quais informações exibir no seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Exibir Localização</Label>
              <p className="text-xs text-muted-foreground">Mostrar sua cidade/estado</p>
            </div>
            <Switch checked={showLocation} onCheckedChange={setShowLocation} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Exibir Telefone</Label>
              <p className="text-xs text-muted-foreground">Mostrar número de telefone</p>
            </div>
            <Switch checked={showPhone} onCheckedChange={setShowPhone} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Exibir E-mail</Label>
              <p className="text-xs text-muted-foreground">Mostrar endereço de e-mail</p>
            </div>
            <Switch checked={showEmail} onCheckedChange={setShowEmail} />
          </div>
        </CardContent>
      </Card>

      {/* Project Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Projetos
            <Badge variant="secondary" className="ml-2">Recomendado</Badge>
          </CardTitle>
          <CardDescription>
            Configurações padrão para novos projetos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Visibilidade Padrão</Label>
              <p className="text-xs text-muted-foreground">Para novos projetos criados</p>
            </div>
            <Select value={defaultProjectVisibility} onValueChange={setDefaultProjectVisibility}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Privado
                  </div>
                </SelectItem>
                <SelectItem value="connections">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Conexões
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Público
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Permitir Solicitações de Acesso</Label>
              <p className="text-xs text-muted-foreground">Outros usuários podem solicitar acesso aos seus projetos</p>
            </div>
            <Switch checked={allowProjectRequests} onCheckedChange={setAllowProjectRequests} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
