import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  TreePine, 
  CheckCircle2, 
  XCircle, 
  FileCheck, 
  Phone,
  Eye,
  EyeOff,
  MapPin,
  Shield
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileTechnicalInfoProps {
  profile: {
    id: string;
    phone: string | null;
    location: string | null;
    agent_type: string;
  };
  onProfileUpdated?: () => void;
}

// Placeholder for additional profile fields that would need to be added to the database
interface TechnicalData {
  biome_type: string | null;
  biome_observations: string | null;
  biome_verified: boolean;
  has_land_documentation: boolean | null;
  show_phone: boolean;
}

export default function ProfileTechnicalInfo({ profile, onProfileUpdated }: ProfileTechnicalInfoProps) {
  // These would come from the profile in a real implementation
  // For now using local state as placeholder
  const [technicalData, setTechnicalData] = useState<TechnicalData>({
    biome_type: "Cerrado",
    biome_observations: null,
    biome_verified: false,
    has_land_documentation: null,
    show_phone: true,
  });

  const [showPhone, setShowPhone] = useState(true);

  const handlePhoneVisibilityChange = async (visible: boolean) => {
    setShowPhone(visible);
    toast.success(visible ? "Telefone visível no perfil" : "Telefone oculto do perfil");
  };

  const biomeOptions = [
    "Amazônia",
    "Cerrado",
    "Mata Atlântica",
    "Caatinga",
    "Pampa",
    "Pantanal",
    "Outro"
  ];

  return (
    <div className="space-y-6">
      {/* Status do Perfil */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Status do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge 
              variant={technicalData.biome_verified ? "default" : "secondary"}
              className={technicalData.biome_verified ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : ""}
            >
              {technicalData.biome_verified ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Perfil Verificado
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Perfil Básico
                </>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {technicalData.biome_verified 
                ? "Suas informações foram verificadas" 
                : "Complete seu perfil para aumentar sua visibilidade"
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TreePine className="w-5 h-5 text-emerald-500" />
            Informações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de Bioma */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Tipo de Bioma
            </Label>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm py-1 px-3">
                {technicalData.biome_type || "Não informado"}
              </Badge>
              {technicalData.biome_observations && (
                <span className="text-sm text-muted-foreground">
                  {technicalData.biome_observations}
                </span>
              )}
            </div>
          </div>

          {/* Verificação de Bioma */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              Verificação de Bioma
            </Label>
            <div className="flex items-center gap-2">
              {technicalData.biome_verified ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  Não Verificado
                </Badge>
              )}
            </div>
          </div>

          {/* Documentação Fundiária */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-muted-foreground" />
              Possui Documentação Fundiária?
            </Label>
            <div className="flex items-center gap-2">
              {technicalData.has_land_documentation === null ? (
                <Badge variant="outline">Não informado</Badge>
              ) : technicalData.has_land_documentation ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Sim
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  Não
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacidade de Contato */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-500" />
            Privacidade de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              {showPhone ? (
                <Eye className="w-5 h-5 text-muted-foreground" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Telefone de Contato</p>
                <p className="text-xs text-muted-foreground">
                  {profile.phone || "Não cadastrado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-phone" className="text-xs text-muted-foreground">
                {showPhone ? "Visível" : "Oculto"}
              </Label>
              <Switch
                id="show-phone"
                checked={showPhone}
                onCheckedChange={handlePhoneVisibilityChange}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Controle se seu telefone será visível para outros usuários da plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
