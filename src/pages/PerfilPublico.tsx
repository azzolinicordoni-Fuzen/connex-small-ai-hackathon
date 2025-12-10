import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TreePine, Award, Landmark, ShoppingCart, FolderOpen, 
  MapPin, Phone, Mail, MessageCircle, UserPlus, UserCheck, Clock,
  Building2, Users, HardHat, Briefcase, Scale, Banknote, ClipboardCheck,
  CheckCircle, Loader2, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/layout/BackButton";
import { useConnections } from "@/hooks/useConnections";

const agentTypeConfig: Record<string, { icon: typeof TreePine; label: string; color: string }> = {
  proprietario: { icon: TreePine, label: "Proprietário Rural", color: "emerald" },
  desenvolvedor: { icon: Building2, label: "Desenvolvedor de Projetos", color: "cyan" },
  certificadora: { icon: Award, label: "Certificadora", color: "amber" },
  auditor: { icon: ClipboardCheck, label: "Auditor / VVB", color: "orange" },
  investidor: { icon: Landmark, label: "Fundo / Banco", color: "blue" },
  financeira: { icon: Banknote, label: "Instituição Financeira", color: "indigo" },
  advogado: { icon: Scale, label: "Advogado / Jurídico", color: "slate" },
  comprador: { icon: ShoppingCart, label: "Empresa Compradora", color: "red" },
  projeto: { icon: FolderOpen, label: "Projeto", color: "purple" },
  engenheiro: { icon: HardHat, label: "Engenheiro", color: "teal" },
  outro: { icon: Users, label: "Outro Agente", color: "gray" },
};

interface PublicProfile {
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

export default function PerfilPublico() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const { getConnectionStatus, sendConnectionRequest, acceptConnection, connections } = useConnections(currentProfileId || undefined);

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

  // Fetch the public profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, bio, location, phone, whatsapp, avatar_url, cover_url, agent_type, is_premium")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Perfil não encontrado");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton showLabel />
        </div>

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
        </div>

        {/* Profile Info */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.is_premium && (
                  <Badge variant="emerald" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
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
                {connectionStatus === 'accepted' && profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </span>
                )}
                {connectionStatus === 'accepted' && profile.whatsapp && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {profile.whatsapp}
                  </span>
                )}
              </div>
            </div>

            {/* Connection Actions */}
            <div className="flex-shrink-0">
              {renderConnectionButton()}
            </div>
          </div>
        </div>

        {/* Privacy Notice for non-connected users */}
        {connectionStatus !== 'accepted' && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Conecte-se para ver mais</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Conecte-se com {profile.name} para ver informações completas de contato, 
                subperfis e poder enviar mensagens.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
