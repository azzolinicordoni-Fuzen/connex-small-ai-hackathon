import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TreePine, Award, Landmark, ShoppingCart, FolderOpen, 
  MapPin, Phone, Mail, MessageCircle, UserPlus, UserCheck, Clock,
  Building2, Users, HardHat, Briefcase, Scale, Banknote, ClipboardCheck,
  CheckCircle, Loader2, ArrowLeft, Link2, Target, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/layout/BackButton";
import { useConnections } from "@/hooks/useConnections";
import { UnifiedSubprofile } from "@/hooks/useSubprofileConnections";
import { cn } from "@/lib/utils";

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

const AGENT_COLORS: Record<string, string> = {
  proprietario: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  desenvolvedor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  certificadora: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  auditor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  investidor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  financeira: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  advogado: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
  comprador: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  projeto: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  engenheiro: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  outro: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
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
  const [searchParams] = useSearchParams();
  const highlightedSubprofileId = searchParams.get('subperfil');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [subprofiles, setSubprofiles] = useState<UnifiedSubprofile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const highlightedRef = useRef<HTMLDivElement>(null);

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

  // Fetch the public profile and its subprofiles
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, bio, location, phone, whatsapp, avatar_url, cover_url, agent_type, is_premium")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch subprofiles from the unified view
        const { data: subprofilesData, error: subprofilesError } = await supabase
          .from('unified_subprofiles' as any)
          .select('*')
          .eq('profile_id', id)
          .order('created_at', { ascending: false });

        if (!subprofilesError && subprofilesData) {
          setSubprofiles(subprofilesData as unknown as UnifiedSubprofile[]);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Perfil não encontrado");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Scroll to highlighted subprofile
  useEffect(() => {
    if (!loading && highlightedSubprofileId && highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loading, highlightedSubprofileId]);

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
                <Badge variant="secondary">
                  {subprofiles.length} subperfil{subprofiles.length !== 1 ? 's' : ''}
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

        {/* Subprofiles Section */}
        {subprofiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Subperfis de {profile.name}
              <Badge variant="secondary">{subprofiles.length}</Badge>
            </h2>
            
            {/* Sort to show highlighted subprofile first */}
            <div className="grid gap-4 md:grid-cols-2">
              {[...subprofiles]
                .sort((a, b) => {
                  if (a.id === highlightedSubprofileId) return -1;
                  if (b.id === highlightedSubprofileId) return 1;
                  return 0;
                })
                .map((sp) => {
                  const TypeIcon = agentTypeConfig[sp.subprofile_type]?.icon || Users;
                  const typeLabel = agentTypeConfig[sp.subprofile_type]?.label || sp.subprofile_type;
                  const typeColor = AGENT_COLORS[sp.subprofile_type] || AGENT_COLORS.outro;
                  const isHighlighted = sp.id === highlightedSubprofileId;
                  const lookingFor = sp.busca_plataforma?.slice(0, 3) || [];

                  return (
                    <Card 
                      key={sp.id} 
                      ref={isHighlighted ? highlightedRef : undefined}
                      className={cn(
                        "transition-all duration-300",
                        isHighlighted 
                          ? "ring-2 ring-primary shadow-lg border-primary/50 bg-primary/5" 
                          : "hover:shadow-md"
                      )}
                    >
                      {/* Highlighted indicator */}
                      {isHighlighted && (
                        <div className="px-4 py-2 border-b bg-primary/10 flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            Conexão através deste subperfil
                          </span>
                        </div>
                      )}
                      
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeColor}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={cn(
                              "font-medium truncate",
                              isHighlighted && "text-primary"
                            )}>
                              {sp.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{typeLabel}</p>
                            {sp.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {sp.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {sp.detail_1 && (
                                <Badge variant="secondary" className="text-xs">
                                  {sp.detail_1}
                                </Badge>
                              )}
                              {sp.detail_2 && (
                                <Badge variant="outline" className="text-xs">
                                  {sp.detail_2}
                                </Badge>
                              )}
                            </div>
                            
                            {/* What they're looking for */}
                            {lookingFor.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Target className="w-3 h-3" />
                                  <span className="font-medium">Busca na plataforma:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {lookingFor.map((item, idx) => (
                                    <span 
                                      key={idx}
                                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/5 text-primary/80 border border-primary/10"
                                    >
                                      <Sparkles className="w-2.5 h-2.5" />
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty state for no subprofiles */}
        {subprofiles.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum subperfil cadastrado</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Este perfil ainda não possui subperfis cadastrados.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
