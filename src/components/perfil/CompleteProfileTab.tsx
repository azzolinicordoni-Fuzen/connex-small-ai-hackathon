import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  User, MapPin, Phone, FileText, Globe, Building2,
  CheckCircle2, AlertCircle, Save, Edit, Mail, Linkedin,
  Instagram, Facebook, Twitter
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
  userEmail?: string;
}

export default function CompleteProfileTab({ profile, onProfileUpdated, userEmail }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identificacao");
  const [showPhone, setShowPhone] = useState(true);
  
  const [formData, setFormData] = useState({
    // Identificação
    name: profile.name || "",
    nome_publico: "",
    tipo_perfil: "pessoa_fisica",
    cpf_cnpj: "",
    avatar_url: profile.avatar_url || "",
    cover_url: profile.cover_url || "",
    // Contato
    email: userEmail || "",
    phone: profile.phone || "",
    whatsapp: profile.whatsapp || "",
    website: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    twitter: "",
    outras_redes: "",
    // Localização
    pais: "Brasil",
    estado: "",
    cidade: "",
    endereco: "",
    // Descrição
    bio: profile.bio || "",
    areas_atuacao: "",
    objetivo_plataforma: "",
  });

  useEffect(() => {
    // Parse location into parts if possible
    const locationParts = profile.location?.split(", ") || [];
    
    setFormData(prev => ({
      ...prev,
      name: profile.name || "",
      bio: profile.bio || "",
      phone: profile.phone || "",
      whatsapp: profile.whatsapp || "",
      avatar_url: profile.avatar_url || "",
      cover_url: profile.cover_url || "",
      cidade: locationParts[0] || "",
      estado: locationParts[1] || "",
      email: userEmail || prev.email,
    }));
  }, [profile, userEmail]);


  const handleSave = async () => {
    setLoading(true);

    try {
      // Combine location fields
      const location = [formData.cidade, formData.estado, formData.pais]
        .filter(Boolean)
        .join(", ");

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          bio: formData.bio || null,
          location: location || null,
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
      case "identificacao":
        return formData.name && formData.tipo_perfil && formData.cpf_cnpj ? "complete" : "incomplete";
      case "contato":
        return formData.phone || formData.whatsapp ? "complete" : "incomplete";
      case "localizacao":
        return formData.estado && formData.cidade ? "complete" : "incomplete";
      case "descricao":
        return formData.bio ? "complete" : "incomplete";
      default:
        return "incomplete";
    }
  };

  const StatusIcon = ({ section }: { section: string }) => {
    const status = getSectionStatus(section);
    return status === "complete" ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-amber-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Edit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>
              Perfil Central (Conta Principal)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="identificacao" className="flex items-center gap-1 text-xs sm:text-sm">
              <StatusIcon section="identificacao" />
              <User className="w-3 h-3 sm:hidden" />
              <span className="hidden sm:inline">Identificação</span>
            </TabsTrigger>
            <TabsTrigger value="contato" className="flex items-center gap-1 text-xs sm:text-sm">
              <StatusIcon section="contato" />
              <Phone className="w-3 h-3 sm:hidden" />
              <span className="hidden sm:inline">Contato</span>
            </TabsTrigger>
            <TabsTrigger value="localizacao" className="flex items-center gap-1 text-xs sm:text-sm">
              <StatusIcon section="localizacao" />
              <MapPin className="w-3 h-3 sm:hidden" />
              <span className="hidden sm:inline">Localização</span>
            </TabsTrigger>
            <TabsTrigger value="descricao" className="flex items-center gap-1 text-xs sm:text-sm">
              <StatusIcon section="descricao" />
              <FileText className="w-3 h-3 sm:hidden" />
              <span className="hidden sm:inline">Descrição</span>
            </TabsTrigger>
          </TabsList>

          {/* IDENTIFICAÇÃO */}
          <TabsContent value="identificacao" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo / Razão Social *</Label>
                <Input
                  id="name"
                  placeholder="Seu nome ou nome da empresa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_publico">Nome Público do Perfil</Label>
                <Input
                  id="nome_publico"
                  placeholder="Como deseja ser chamado na plataforma"
                  value={formData.nome_publico}
                  onChange={(e) => setFormData({ ...formData, nome_publico: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tipo de Perfil Central</Label>
              <RadioGroup
                value={formData.tipo_perfil}
                onValueChange={(value) => setFormData({ ...formData, tipo_perfil: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/50 flex-1">
                  <RadioGroupItem value="pessoa_fisica" id="pf" />
                  <Label htmlFor="pf" className="cursor-pointer flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Pessoa Física
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/50 flex-1">
                  <RadioGroupItem value="pessoa_juridica" id="pj" />
                  <Label htmlFor="pj" className="cursor-pointer flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Pessoa Jurídica
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">
                {formData.tipo_perfil === "pessoa_fisica" ? "CPF" : "CNPJ"}
              </Label>
              <Input
                id="cpf_cnpj"
                placeholder={formData.tipo_perfil === "pessoa_fisica" ? "000.000.000-00" : "00.000.000/0000-00"}
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL da Foto de Perfil</Label>
                <Input
                  id="avatar_url"
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Logo ou foto institucional
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_url">URL da Foto de Capa</Label>
                <Input
                  id="cover_url"
                  placeholder="https://exemplo.com/sua-capa.jpg"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Banner do perfil
                </p>
              </div>
            </div>
          </TabsContent>

          {/* CONTATO */}
          <TabsContent value="contato" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Principal (validado)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Este é o e-mail da sua conta. Para alterá-lo, acesse as configurações.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Mostrar</span>
                    <Switch
                      checked={showPhone}
                      onCheckedChange={setShowPhone}
                    />
                  </div>
                </div>
                <Input
                  id="phone"
                  placeholder="(00) 0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  placeholder="https://seusite.com.br"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/seuperfil"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    placeholder="@usuario"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="facebook"
                    placeholder="facebook.com/pagina"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">X (Twitter)</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="twitter"
                    placeholder="@usuario"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outras_redes">Outras Redes Profissionais (opcional)</Label>
              <Textarea
                id="outras_redes"
                placeholder="Outros links de redes sociais ou portfólios..."
                value={formData.outras_redes}
                onChange={(e) => setFormData({ ...formData, outras_redes: e.target.value })}
                rows={2}
              />
            </div>
          </TabsContent>

          {/* LOCALIZAÇÃO */}
          <TabsContent value="localizacao" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  placeholder="Ex: São Paulo"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  placeholder="Ex: São Paulo"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço (opcional)</Label>
              <Input
                id="endereco"
                placeholder="Rua, número, bairro..."
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Este campo é opcional e pode ser mantido privado
              </p>
            </div>
          </TabsContent>

          {/* DESCRIÇÃO INSTITUCIONAL */}
          <TabsContent value="descricao" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Sobre o Perfil (Bio Institucional) *</Label>
              <Textarea
                id="bio"
                placeholder="Conte sobre você, sua empresa ou suas atividades no mercado de carbono..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="areas_atuacao">Áreas de Atuação</Label>
              <Textarea
                id="areas_atuacao"
                placeholder="Ex: Projetos de carbono florestal, consultoria ambiental, certificação..."
                value={formData.areas_atuacao}
                onChange={(e) => setFormData({ ...formData, areas_atuacao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivo_plataforma">Objetivo dentro da Plataforma</Label>
              <Textarea
                id="objetivo_plataforma"
                placeholder="O que você busca na plataforma? Ex: Conectar com investidores, desenvolver projetos..."
                value={formData.objetivo_plataforma}
                onChange={(e) => setFormData({ ...formData, objetivo_plataforma: e.target.value })}
                rows={3}
              />
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
