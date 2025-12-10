import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Globe, 
  Clock,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

export function SettingsLanguage() {
  const [language, setLanguage] = useState("pt-BR");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [emailLanguage, setEmailLanguage] = useState("pt-BR");

  const handleSave = () => {
    toast.success("Configurações de idioma salvas!");
  };

  return (
    <div className="space-y-6">
      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Idioma
          </CardTitle>
          <CardDescription>
            Escolha o idioma da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Idioma da Interface</Label>
              <p className="text-xs text-muted-foreground">Idioma exibido na plataforma</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">
                  <div className="flex items-center gap-2">
                    🇧🇷 Português (Brasil)
                  </div>
                </SelectItem>
                <SelectItem value="en-US">
                  <div className="flex items-center gap-2">
                    🇺🇸 English (US)
                  </div>
                </SelectItem>
                <SelectItem value="es">
                  <div className="flex items-center gap-2">
                    🇪🇸 Español
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Idioma dos E-mails</Label>
              <p className="text-xs text-muted-foreground">Idioma das notificações por e-mail</p>
            </div>
            <Select value={emailLanguage} onValueChange={setEmailLanguage}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timezone and Date Format */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Fuso Horário e Formato
          </CardTitle>
          <CardDescription>
            Ajuste data, hora e fuso horário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Fuso Horário</Label>
              <p className="text-xs text-muted-foreground">Ajuste para sua região</p>
            </div>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">(GMT-3) São Paulo</SelectItem>
                <SelectItem value="America/Manaus">(GMT-4) Manaus</SelectItem>
                <SelectItem value="America/Rio_Branco">(GMT-5) Rio Branco</SelectItem>
                <SelectItem value="America/Noronha">(GMT-2) Fernando de Noronha</SelectItem>
                <SelectItem value="America/New_York">(GMT-5) New York</SelectItem>
                <SelectItem value="Europe/London">(GMT+0) London</SelectItem>
                <SelectItem value="Europe/Paris">(GMT+1) Paris</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Formato de Data
              </Label>
              <p className="text-xs text-muted-foreground">Como as datas são exibidas</p>
            </div>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/AAAA (31/12/2024)</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/AAAA (12/31/2024)</SelectItem>
                <SelectItem value="YYYY-MM-DD">AAAA-MM-DD (2024-12-31)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Formato de Hora</Label>
              <p className="text-xs text-muted-foreground">12 ou 24 horas</p>
            </div>
            <Select value={timeFormat} onValueChange={setTimeFormat}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 horas (14:30)</SelectItem>
                <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
