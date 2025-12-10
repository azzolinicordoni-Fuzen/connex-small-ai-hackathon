import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, MapPin, Phone, FileText, Briefcase, Upload } from "lucide-react";

interface CompleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    name: string;
    bio: string | null;
    location: string | null;
    phone: string | null;
    whatsapp: string | null;
    avatar_url: string | null;
    agent_type: string;
  };
  onProfileUpdated: () => void;
}

const PAISES = ["Brasil", "Argentina", "Paraguai", "Uruguai", "Chile", "Colômbia", "Peru", "Estados Unidos", "Portugal", "Outro"];
const ESTADOS_BRASIL = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function CompleteProfileDialog({ 
  open, 
  onOpenChange, 
  profile,
  onProfileUpdated 
}: CompleteProfileDialogProps) {
  const [activeTab, setActiveTab] = useState("dados");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic data
    name: profile.name || "",
    nomeFantasia: "",
    cpfCnpj: "",
    bio: profile.bio || "",
    descricaoCompleta: "",
    // Location
    pais: "Brasil",
    estado: "",
    cidade: "",
    enderecoCompleto: "",
    // Contact
    phone: profile.phone || "",
    whatsapp: profile.whatsapp || "",
    email: "",
    site: "",
    linkedin: "",
    instagram: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateProgress = () => {
    const fields = [
      formData.name,
      formData.bio,
      formData.pais,
      formData.estado || formData.cidade,
      formData.phone,
      formData.whatsapp,
    ];
    const filled = fields.filter(f => f && f.trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const location = formData.cidade && formData.estado 
        ? `${formData.cidade}, ${formData.estado}, ${formData.pais}`
        : formData.estado 
          ? `${formData.estado}, ${formData.pais}`
          : formData.pais;

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          bio: formData.bio,
          location: location,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      onProfileUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = calculateProgress();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Complete seu Perfil</DialogTitle>
              <DialogDescription>
                Preencha as informações para ter mais visibilidade na plataforma
              </DialogDescription>
            </div>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {progress}% completo
            </Badge>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="dados" className="gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
            <TabsTrigger value="localizacao" className="gap-1">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Local</span>
            </TabsTrigger>
            <TabsTrigger value="contato" className="gap-1">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Contato</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="gap-1">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Foto / Logo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome / Razão Social *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nome completo ou razão social"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  value={formData.nomeFantasia}
                  onChange={(e) => handleChange("nomeFantasia", e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>CPF / CNPJ</Label>
              <Input
                value={formData.cpfCnpj}
                onChange={(e) => handleChange("cpfCnpj", e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição Curta (para cards e listas)</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value.slice(0, 300))}
                placeholder="Breve descrição sobre você ou sua empresa (até 300 caracteres)"
                rows={2}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/300</p>
            </div>

            <div className="space-y-2">
              <Label>Descrição Completa</Label>
              <Textarea
                value={formData.descricaoCompleta}
                onChange={(e) => handleChange("descricaoCompleta", e.target.value)}
                placeholder="Quem é, o que faz, foco de atuação, diferenciais, experiência..."
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="localizacao" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>País *</Label>
              <Select value={formData.pais} onValueChange={(v) => handleChange("pais", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAISES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.pais === "Brasil" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={formData.estado} onValueChange={(v) => handleChange("estado", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASIL.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Input
                value={formData.enderecoCompleto}
                onChange={(e) => handleChange("enderecoCompleto", e.target.value)}
                placeholder="Rua, número, bairro (opcional)"
              />
            </div>
          </TabsContent>

          <TabsContent value="contato" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>E-mail de contato</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Site</Label>
              <Input
                value={formData.site}
                onChange={(e) => handleChange("site", e.target.value)}
                placeholder="https://www.seusite.com.br"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="URL do perfil"
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={formData.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  placeholder="@usuario"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">
                Área para upload de documentos e certificações
              </p>
              <p className="text-sm text-muted-foreground">
                Em breve você poderá adicionar documentos como CAR, certificados, portfólio, etc.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
