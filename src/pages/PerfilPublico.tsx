import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TreePine, Award, Landmark, ShoppingCart, FolderOpen, 
  MapPin, Phone, Mail, MessageCircle, UserPlus, UserCheck, Clock,
  Building2, Users, HardHat, Briefcase, Scale, Banknote, ClipboardCheck,
  CheckCircle, Loader2, ArrowLeft, FileText, Target, Layers
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/layout/BackButton";
import { useConnections } from "@/hooks/useConnections";
import SubperfilPublicCard from "@/components/perfil/SubperfilPublicCard";
import { cn } from "@/lib/utils";

const agentTypeConfig: Record<string, { icon: typeof TreePine; label: string; color: string; subperfilLabel: string }> = {
  proprietario: { icon: TreePine, label: "Proprietário Rural", color: "emerald", subperfilLabel: "Áreas" },
  desenvolvedor: { icon: Building2, label: "Desenvolvedor de Projetos", color: "cyan", subperfilLabel: "Projetos" },
  certificadora: { icon: Award, label: "Certificadora", color: "amber", subperfilLabel: "Serviços" },
  auditor: { icon: ClipboardCheck, label: "Auditor / VVB", color: "orange", subperfilLabel: "Serviços" },
  investidor: { icon: Landmark, label: "Investidor / Comprador", color: "blue", subperfilLabel: "Requisições" },
  financeira: { icon: Banknote, label: "Instituição Financeira", color: "indigo", subperfilLabel: "Produtos" },
  advogado: { icon: Scale, label: "Advogado / Jurídico", color: "slate", subperfilLabel: "Serviços" },
  comprador: { icon: ShoppingCart, label: "Empresa Compradora", color: "rose", subperfilLabel: "Demandas" },
  projeto: { icon: FolderOpen, label: "Projeto", color: "purple", subperfilLabel: "Projetos" },
  engenheiro: { icon: HardHat, label: "Engenheiro", color: "teal", subperfilLabel: "Serviços" },
  outro: { icon: Users, label: "Outro Agente", color: "gray", subperfilLabel: "Subperfis" },
};

interface PublicProfile {
  id: string;
  name: string;
  nome_publico?: string | null;
  tipo_perfil?: string | null;
  bio: string | null;
  areas_atuacao?: string | null;
  objetivo_plataforma?: string | null;
  location: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  agent_type: string;
  is_premium: boolean | null;
}

export default function PerfilPublico() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const highlightedSubprofileId = searchParams.get('subperfil');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [subprofiles, setSubprofiles] = useState<any[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const highlightedRef = useRef<HTMLDivElement>(null);

  const { getConnectionStatus, sendConnectionRequest, acceptConnection, connections } = useConnections(currentProfileId || undefined);
  const acceptedCount = connections.filter(c => c.status === 'accepted').length;

  // Fetch current user's profile id
  useEffect(() => {
    const fetchCurrentProfileId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setCurrentProfileId(data.id);
        if (data.id === id) {
          setIsOwnProfile(true);
        }
      }
    };
    fetchCurrentProfileId();
  }, [user, id]);

  // Fetch the public profile and its subprofiles
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        // Fetch full profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch subprofiles from the specific table based on agent type
        await fetchSubprofiles(id, profileData.agent_type);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Perfil não encontrado");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const fetchSubprofiles = async (profileId: string, agentType: string) => {
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
      setSubprofiles([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubprofiles(data || []);
    } catch (error) {
      console.error("Error fetching subprofiles:", error);
      setSubprofiles([]);
    }
  };

  // Scroll to highlighted subprofile
  useEffect(() => {
    if (!loading && highlightedSubprofileId && highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loading, highlightedSubprofileId, subprofiles]);

  const handleConnect = async () => {
    if (!id) return;
    setLoadingConnection(true);
    await sendConnectionRequest(id);
    setLoadingConnection(false);
  };

  const handleMessage = () => {
    navigate(`/mensagens?to=${id}`);
  };

  const connectionStatus = id ? getConnectionStatus(id) : 'none';
  
  // Check if there's a pending connection to accept
  const pendingConnection = connections.find(
    c => c.profile.id === id && c.status === 'pending' && !c.isRequester
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Perfil não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Este perfil pode ter sido removido ou não está disponível.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect to own profile page
  if (isOwnProfile) {
    navigate('/perfil');
    return null;
  }

  const config = agentTypeConfig[profile.agent_type] || agentTypeConfig.outro;
  const IconComponent = config.icon;

  const renderConnectionButton = () => {
    if (!user) {
      return (
        <Button onClick={() => navigate('/login')}>
          <UserPlus className="w-4 h-4 mr-2" />
          Entrar para conectar
        </Button>
      );
    }

    if (loadingConnection) {
      return (
        <Button disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processando...
        </Button>
      );
    }

    if (pendingConnection) {
      return (
        <Button 
          onClick={async () => {
            setLoadingConnection(true);
            await acceptConnection(pendingConnection.id);
            setLoadingConnection(false);
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Aceitar Conexão
        </Button>
      );
    }

    switch (connectionStatus) {
      case 'accepted':
        return (
          <div className="flex gap-2">
            <Button variant="outline" disabled className="text-green-600 border-green-200">
              <UserCheck className="w-4 h-4 mr-2" />
              Conectado
            </Button>
            <Button onClick={handleMessage}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </Button>
          </div>
        );
      case 'pending':
        return (
          <Button variant="outline" disabled className="text-amber-600 border-amber-200">
            <Clock className="w-4 h-4 mr-2" />
            Solicitação Pendente
          </Button>
        );
      case 'sent':
        return (
          <Button variant="outline" disabled className="text-blue-600 border-blue-200">
            <UserCheck className="w-4 h-4 mr-2" />
            Solicitação Enviada
          </Button>
        );
      default:
        return (
          <Button onClick={handleConnect}>
            <UserPlus className="w-4 h-4 mr-2" />
            Conectar
          </Button>
        );
    }
  };

  // Sort subprofiles to show highlighted first
  const sortedSubprofiles = [...subprofiles].sort((a, b) => {
    if (a.id === highlightedSubprofileId) return -1;
    if (b.id === highlightedSubprofileId) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton showLabel />
        </div>

        {/* Cover & Avatar */}
        <div className="relative mb-20">
          <div 
            className="h-48 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5"
            style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          />
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-8 space-y-6">
          {/* Header: Name, Badges, Connection Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.is_premium && (
                  <Badge variant="emerald" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <IconComponent className="w-3 h-3" />
                  {config.label}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <UserCheck className="w-3 h-3" />
                  {acceptedCount} conexões
                </Badge>
                <Badge variant="secondary">
                  {subprofiles.length} {config.subperfilLabel.toLowerCase()}
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0">
              {renderConnectionButton()}
            </div>
          </div>

          {/* Contact Info Row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground border-y border-border/50 py-4">
            {profile.location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary/70" />
                {profile.location}
              </span>
            )}
            {connectionStatus === 'accepted' && profile.phone && (
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary/70" />
                {profile.phone}
              </span>
            )}
            {connectionStatus === 'accepted' && profile.whatsapp && (
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary/70" />
                {profile.whatsapp}
              </span>
            )}
          </div>

          {/* Description Cards */}
          {(profile.bio || profile.areas_atuacao || profile.objetivo_plataforma) && (
            <div className="space-y-3">
              {profile.bio && (
                <Card className="p-4 border-l-4 border-l-primary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Sobre o Perfil</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                </Card>
              )}
              {profile.areas_atuacao && (
                <Card className="p-4 border-l-4 border-l-emerald-500/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-sm font-semibold">Áreas de Atuação</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.areas_atuacao}</p>
                </Card>
              )}
              {profile.objetivo_plataforma && (
                <Card className="p-4 border-l-4 border-l-blue-500/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <h4 className="text-sm font-semibold">Objetivo na Plataforma</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.objetivo_plataforma}</p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Subprofiles Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{config.subperfilLabel} de {profile.name}</h2>
            <Badge variant="secondary">{subprofiles.length}</Badge>
          </div>

          {subprofiles.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <IconComponent className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum subperfil cadastrado</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Este perfil ainda não possui {config.subperfilLabel.toLowerCase()} cadastrados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedSubprofiles.map((subperfil) => (
                <SubperfilPublicCard
                  key={subperfil.id}
                  subperfil={subperfil}
                  agentType={profile.agent_type}
                  isHighlighted={subperfil.id === highlightedSubprofileId}
                  highlightRef={subperfil.id === highlightedSubprofileId ? highlightedRef : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
