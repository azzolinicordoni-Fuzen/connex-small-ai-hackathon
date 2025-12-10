import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  LayoutDashboard,
  Newspaper,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export function SettingsPreferences() {
  const [density, setDensity] = useState("comfortable");
  const [feedPriority, setFeedPriority] = useState("recent");
  const [showTips, setShowTips] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [confirmActions, setConfirmActions] = useState(true);
  const [animations, setAnimations] = useState(true);

  const handleSave = () => {
    toast.success("Preferências salvas!");
  };

  return (
    <div className="space-y-6">
      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Densidade de Informação</Label>
              <p className="text-xs text-muted-foreground">Espaçamento entre elementos</p>
            </div>
            <Select value={density} onValueChange={setDensity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="comfortable">Confortável</SelectItem>
                <SelectItem value="spacious">Espaçoso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Animações</Label>
              <p className="text-xs text-muted-foreground">Efeitos visuais e transições</p>
            </div>
            <Switch checked={animations} onCheckedChange={setAnimations} />
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Feed
          </CardTitle>
          <CardDescription>
            Configure como o conteúdo é exibido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Ordenação do Feed</Label>
              <p className="text-xs text-muted-foreground">Prioridade de exibição dos posts</p>
            </div>
            <Select value={feedPriority} onValueChange={setFeedPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="relevant">Mais Relevantes</SelectItem>
                <SelectItem value="connections">Conexões Primeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </CardTitle>
          <CardDescription>
            Personalize sua visão geral
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Exibir Dicas</Label>
              <p className="text-xs text-muted-foreground">Mostrar sugestões e dicas na plataforma</p>
            </div>
            <Switch checked={showTips} onCheckedChange={setShowTips} />
          </div>
        </CardContent>
      </Card>

      {/* Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Comportamento
            <Badge variant="secondary" className="ml-2">Avançado</Badge>
          </CardTitle>
          <CardDescription>
            Configure o comportamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Salvamento Automático</Label>
              <p className="text-xs text-muted-foreground">Salvar alterações automaticamente</p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Confirmar Ações</Label>
              <p className="text-xs text-muted-foreground">Pedir confirmação para ações importantes</p>
            </div>
            <Switch checked={confirmActions} onCheckedChange={setConfirmActions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
