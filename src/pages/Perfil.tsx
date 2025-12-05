import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TreePine, Award, Landmark, ShoppingCart, FolderOpen, 
  Plus, MapPin, Phone, Mail, MessageCircle, Edit, Trash2,
  Building2, Calendar, Users
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import SubperfilCard from "@/components/perfil/SubperfilCard";
import SubperfilDialog from "@/components/perfil/SubperfilDialog";
import EditProfileDialog from "@/components/perfil/EditProfileDialog";

const agentTypeConfig: Record<string, { icon: typeof TreePine; label: string; color: string; subperfilLabel: string }> = {
  proprietario: { icon: TreePine, label: "Proprietário Rural", color: "emerald", subperfilLabel: "Áreas" },
  desenvolvedor: { icon: Building2, label: "Desenvolvedor de Projetos", color: "cyan", subperfilLabel: "Projetos" },
  certificadora: { icon: Award, label: "Certificadora", color: "amber", subperfilLabel: "Serviços" },
  auditor: { icon: Award, label: "Auditor / VVB", color: "orange", subperfilLabel: "Serviços" },
  investidor: { icon: Landmark, label: "Fundo / Banco", color: "blue", subperfilLabel: "Requisições" },
  financeira: { icon: Landmark, label: "Instituição Financeira", color: "indigo", subperfilLabel: "Produtos" },
  advogado: { icon: Users, label: "Advogado / Jurídico", color: "slate", subperfilLabel: "Serviços" },
  comprador: { icon: ShoppingCart, label: "Empresa Compradora", color: "red", subperfilLabel: "Demandas ESG" },
  projeto: { icon: FolderOpen, label: "Projeto", color: "purple", subperfilLabel: "Projetos" },
  engenheiro: { icon: Building2, label: "Engenheiro", color: "teal", subperfilLabel: "Serviços" },
  outro: { icon: Users, label: "Outro Agente", color: "gray", subperfilLabel: "Subperfis" },
};

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

export default function Perfil() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subperfis, setSubperfis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubperfilDialogOpen, setIsSubperfilDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editingSubperfil, setEditingSubperfil] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (profileData) {
        setProfile(profileData);
        await fetchSubperfis(profileData.id, profileData.agent_type);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubperfis = async (profileId: string, agentType: string) => {
    const tableMap: Record<string, string> = {
      proprietario: "proprietario_subperfis",
      desenvolvedor: "desenvolvedor_subperfis",
      certificadora: "certificadora_subperfis",
      auditor: "auditor_subperfis",
      investidor: "investidor_subperfis",
      financeira: "financeira_subperfis",
      advogado: "advogado_subperfis",
      comprador: "comprador_subperfis",
      projeto: "projeto_subperfis",
    };

    const tableName = tableMap[agentType];
    if (!tableName) {
      setSubperfis([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubperfis(data || []);
    } catch (error) {
      console.error("Error fetching subperfis:", error);
    }
  };

  const handleDeleteSubperfil = async (subperfilId: string) => {
    if (!profile) return;

    const tableMap: Record<string, string> = {
      proprietario: "proprietario_subperfis",
      desenvolvedor: "desenvolvedor_subperfis",
      certificadora: "certificadora_subperfis",
      auditor: "auditor_subperfis",
      investidor: "investidor_subperfis",
      financeira: "financeira_subperfis",
      advogado: "advogado_subperfis",
      comprador: "comprador_subperfis",
      projeto: "projeto_subperfis",
    };

    const tableName = tableMap[profile.agent_type];
    if (!tableName) return;

    try {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq("id", subperfilId);

      if (error) throw error;
      
      toast.success("Subperfil excluído com sucesso");
      await fetchSubperfis(profile.id, profile.agent_type);
    } catch (error) {
      console.error("Error deleting subperfil:", error);
      toast.error("Erro ao excluir subperfil");
    }
  };

  const handleSubperfilSaved = () => {
    if (profile) {
      fetchSubperfis(profile.id, profile.agent_type);
    }
    setIsSubperfilDialogOpen(false);
    setEditingSubperfil(null);
  };

  const handleProfileUpdated = () => {
    fetchProfile();
    setIsEditProfileOpen(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Perfil não encontrado</p>
      </div>
    );
  }

  const config = agentTypeConfig[profile.agent_type] || agentTypeConfig.outro;
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Cover & Avatar */}
        <div className="relative mb-20">
          <div 
            className="h-48 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5"
            style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: 'cover' } : {}}
          />
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-4 right-4"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        </div>

        {/* Profile Info */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.is_premium && (
                  <Badge variant="emerald">Premium</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="gap-1">
                  <IconComponent className="w-3 h-3" />
                  {config.label}
                </Badge>
              </div>
              {profile.bio && (
                <p className="text-muted-foreground max-w-2xl mb-4">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </span>
                )}
                {profile.whatsapp && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {profile.whatsapp}
                  </span>
                )}
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="subperfis" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subperfis">{config.subperfilLabel}</TabsTrigger>
            <TabsTrigger value="conexoes">Conexões</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="subperfis" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{config.subperfilLabel}</h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie seus {config.subperfilLabel.toLowerCase()} cadastrados
                </p>
              </div>
              <Button onClick={() => {
                setEditingSubperfil(null);
                setIsSubperfilDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Projeto
              </Button>
            </div>

            {subperfis.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <IconComponent className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    Você ainda não tem {config.subperfilLabel.toLowerCase()} cadastrados
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingSubperfil(null);
                      setIsSubperfilDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro projeto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {subperfis.map((subperfil) => (
                  <SubperfilCard
                    key={subperfil.id}
                    subperfil={subperfil}
                    agentType={profile.agent_type}
                    onEdit={() => {
                      setEditingSubperfil(subperfil);
                      setIsSubperfilDialogOpen(true);
                    }}
                    onDelete={() => handleDeleteSubperfil(subperfil.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="conexoes">
            <Card>
              <CardHeader>
                <CardTitle>Conexões</CardTitle>
                <CardDescription>Suas conexões na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Em breve...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feed">
            <Card>
              <CardHeader>
                <CardTitle>Feed Individual</CardTitle>
                <CardDescription>Suas publicações</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Em breve...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <SubperfilDialog
        key={editingSubperfil?.id || "new-subperfil"}
        open={isSubperfilDialogOpen}
        onOpenChange={(open) => {
          setIsSubperfilDialogOpen(open);
          if (!open) setEditingSubperfil(null);
        }}
        agentType={profile.agent_type}
        profileId={profile.id}
        editData={editingSubperfil}
        onSaved={handleSubperfilSaved}
      />

      <EditProfileDialog
        key={`edit-${profile.id}`}
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={profile}
        onSaved={handleProfileUpdated}
      />
    </div>
  );
}