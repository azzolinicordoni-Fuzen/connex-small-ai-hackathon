import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, MapPin, Phone, FileText, Globe, 
  CheckCircle2, AlertCircle, Save, Upload
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string;
  bio: string | null;
  location: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  agent_type: string;
  is_premium: boolean | null;
}

interface Props {
  profile: Profile;
  onProfileUpdated: () => void;
}

export default function CompleteProfileTab({ profile, onProfileUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basico");
  const [formData, setFormData] = useState({
    name: profile.name || "",
    bio: profile.bio || "",
    location: profile.location || "",
    phone: profile.phone || "",
    whatsapp: profile.whatsapp || "",
    avatar_url: profile.avatar_url || "",
    cover_url: profile.cover_url || "",
  });

  useEffect(() => {
    setFormData({
      name: profile.name || "",
      bio: profile.bio || "",
      location: profile.location || "",
      phone: profile.phone || "",
      whatsapp: profile.whatsapp || "",
      avatar_url: profile.avatar_url || "",
      cover_url: profile.cover_url || "",
    });
  }, [profile]);

  const calculateCompletion = () => {
    const fields = [
      formData.name,
      formData.bio,
      formData.location,
      formData.phone,
      formData.whatsapp,
      formData.avatar_url,
    ];
    const filled = fields.filter(f => f && f.trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const completion = calculateCompletion();

  const handleSave = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          bio: formData.bio || null,
          location: formData.location || null,
          phone: formData.phone || null,
          whatsapp: formData.whatsapp || null,
          avatar_url: formData.avatar_url || null,
          cover_url: formData.cover_url || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso");
      onProfileUpdated();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const getSectionStatus = (section: string) => {
    switch (section) {
      case "basico":
        return formData.name ? "complete" : "incomplete";
      case "sobre":
        return formData.bio ? "complete" : "incomplete";
      case "localizacao":
        return formData.location ? "complete" : "incomplete";
      case "contato":
        return formData.phone || formData.whatsapp ? "complete" : "incomplete";
      case "midia":
        return formData.avatar_url ? "complete" : "incomplete";
      default:
        return "incomplete";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Completar Perfil
            </CardTitle>
            <CardDescription>
              Preencha suas informações para aparecer melhor nas conexões
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <Badge variant={completion === 100 ? "emerald" : "secondary"}>
                {completion}%
              </Badge>
            </div>
            <Progress value={completion} className="w-32 h-2" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="basico" className="flex items-center gap-1 text-xs sm:text-sm">
              {getSectionStatus("basico") === "complete" ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
              <span className="hidden sm:inline">Básico</span>
              <User className="w-3 h-3 sm:hidden" />
            </TabsTrigger>
            <TabsTrigger value="sobre" className="flex items-center gap-1 text-xs sm:text-sm">
              {getSectionStatus("sobre") === "complete" ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
              <span className="hidden sm:inline">Sobre</span>
              <FileText className="w-3 h-3 sm:hidden" />
            </TabsTrigger>
            <TabsTrigger value="localizacao" className="flex items-center gap-1 text-xs sm:text-sm">
              {getSectionStatus("localizacao") === "complete" ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
              <span className="hidden sm:inline">Local</span>
              <MapPin className="w-3 h-3 sm:hidden" />
            </TabsTrigger>
            <TabsTrigger value="contato" className="flex items-center gap-1 text-xs sm:text-sm">
              {getSectionStatus("contato") === "complete" ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
              <span className="hidden sm:inline">Contato</span>
              <Phone className="w-3 h-3 sm:hidden" />
            </TabsTrigger>
            <TabsTrigger value="midia" className="flex items-center gap-1 text-xs sm:text-sm">
              {getSectionStatus("midia") === "complete" ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
              <span className="hidden sm:inline">Mídia</span>
              <Globe className="w-3 h-3 sm:hidden" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basico" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Razão Social *</Label>
              <Input
                id="name"
                placeholder="Seu nome ou nome da empresa"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Este nome será exibido publicamente no seu perfil
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sobre" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia / Descrição</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você, sua empresa ou suas atividades no mercado de carbono..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </TabsContent>

          <TabsContent value="localizacao" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Ex: São Paulo, SP - Brasil"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Informe sua cidade, estado ou região de atuação
              </p>
            </div>
          </TabsContent>

          <TabsContent value="contato" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Seus contatos podem ser configurados como públicos ou privados nas configurações de privacidade
            </p>
          </TabsContent>

          <TabsContent value="midia" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL da Foto de Perfil</Label>
                <Input
                  id="avatar_url"
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Cole o link de uma imagem para usar como avatar
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_url">URL da Imagem de Capa</Label>
                <Input
                  id="cover_url"
                  placeholder="https://exemplo.com/sua-capa.jpg"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Cole o link de uma imagem para usar como capa do perfil
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
