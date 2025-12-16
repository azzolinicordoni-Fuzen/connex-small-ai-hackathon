import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, MessageSquare, UserMinus, MoreHorizontal, Check, X,
  TreePine, HardHat, Briefcase, Award, Landmark, FolderOpen, 
  Users, Building2, Scale, Banknote, ClipboardCheck, Clock, 
  CheckCircle, Target, Leaf, ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ConnectionProfile {
  id: string;
  name: string;
  nome_publico?: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  agent_type: string;
  is_premium: boolean | null;
  areas_atuacao?: string | null;
  objetivo_plataforma?: string | null;
}

interface SubprofileInfo {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  bioma?: string | null;
  busca_plataforma?: string[] | null;
}

interface ConnectionCardEnhancedProps {
  connection: {
    id: string;
    status: string;
    profile: ConnectionProfile;
    isRequester: boolean;
    subprofile?: SubprofileInfo | null;
  };
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
  onRemove?: (connectionId: string) => void;
  onMessage?: (profileId: string, subprofileId?: string) => void;
  onViewProfile?: (profileId: string, subprofileId?: string) => void;
}

const AGENT_ICONS: Record<string, any> = {
  proprietario: TreePine,
  engenheiro: HardHat,
  desenvolvedor: Briefcase,
  certificadora: Award,
  investidor: Landmark,
  projeto: FolderOpen,
  comprador: Building2,
  auditor: ClipboardCheck,
  financeira: Banknote,
  advogado: Scale,
  outro: Users,
};

const AGENT_LABELS: Record<string, string> = {
  proprietario: "Proprietário Rural",
  engenheiro: "Engenheiro",
  desenvolvedor: "Desenvolvedor",
  certificadora: "Certificadora",
  investidor: "Investidor",
  projeto: "Projeto",
  comprador: "Comprador",
  auditor: "Auditor",
  financeira: "Financeira",
  advogado: "Advogado",
  outro: "Outro",
};

const SUBPROFILE_LABELS: Record<string, string> = {
  proprietario: "Área",
  desenvolvedor: "Projeto",
  certificadora: "Serviço",
  auditor: "Serviço",
  investidor: "Requisição",
  financeira: "Produto",
  advogado: "Serviço",
  comprador: "Demanda",
  projeto: "Projeto",
  outro: "Subperfil",
};

export default function ConnectionCardEnhanced({ 
  connection, 
  onAccept, 
  onReject, 
  onRemove,
  onMessage,
  onViewProfile 
}: ConnectionCardEnhancedProps) {
  const navigate = useNavigate();
  const { profile, status, isRequester, subprofile } = connection;
  const TypeIcon = AGENT_ICONS[profile.agent_type] || Users;
  const typeLabel = AGENT_LABELS[profile.agent_type] || "Outro";
  const subprofileLabel = SUBPROFILE_LABELS[subprofile?.type || profile.agent_type] || "Subperfil";

  const isPending = status === 'pending';
  const canAccept = isPending && !isRequester;

  const handleProfileClick = () => {
    if (onViewProfile) {
      onViewProfile(profile.id, subprofile?.id);
    } else {
      const url = subprofile?.id 
        ? `/perfil/${profile.id}?subperfil=${subprofile.id}` 
        : `/perfil/${profile.id}`;
      navigate(url);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(profile.id, subprofile?.id);
    } else {
      navigate(`/mensagens?profile=${profile.id}`);
    }
  };

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden",
      isPending && "border-amber-200 bg-amber-50/30 dark:bg-amber-900/10"
    )}>
      <CardContent className="p-0">
        {/* Header with status indicator */}
        {isPending && (
          <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              {isRequester ? "Aguardando resposta" : "Solicitação recebida"}
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Profile Header */}
          <div className="flex items-start gap-3 mb-4">
            <div 
              className="relative shrink-0 cursor-pointer"
              onClick={handleProfileClick}
            >
              <Avatar className="w-14 h-14 transition-transform group-hover:scale-105 border-2 border-background shadow-sm">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {profile.is_premium && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 
                  className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={handleProfileClick}
                >
                  {profile.nome_publico || profile.name}
                </h4>
              </div>
              
              <Badge 
                variant="secondary" 
                className="mt-1 gap-1 text-xs bg-primary/10 text-primary border-0"
              >
                <TypeIcon className="w-3 h-3" />
                {typeLabel}
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              {canAccept ? (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                    onClick={() => onAccept?.(connection.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => onReject?.(connection.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : status === 'accepted' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleProfileClick}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver perfil completo
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => onRemove?.(connection.id)}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Remover conexão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Subprofile Info (if available) */}
          {subprofile && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-normal">
                  {subprofileLabel}
                </Badge>
                <span className="font-medium text-sm text-foreground">{subprofile.name}</span>
              </div>
              {subprofile.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {subprofile.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {subprofile.bioma && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Leaf className="w-3 h-3 text-emerald-500" />
                    {subprofile.bioma}
                  </span>
                )}
                {subprofile.busca_plataforma && subprofile.busca_plataforma.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="w-3 h-3 text-blue-500" />
                    {subprofile.busca_plataforma[0]}
                    {subprofile.busca_plataforma.length > 1 && (
                      <span className="text-muted-foreground">+{subprofile.busca_plataforma.length - 1}</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Location and Objective */}
          <div className="space-y-2 mb-4">
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
            {profile.objetivo_plataforma && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{profile.objetivo_plataforma}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {status === 'accepted' && (
            <div className="flex gap-2 pt-3 border-t border-border/50">
              <Button
                variant="default"
                size="sm"
                className="flex-1 gap-2"
                onClick={handleMessage}
              >
                <MessageSquare className="w-4 h-4" />
                Enviar Mensagem
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={handleProfileClick}
              >
                <ExternalLink className="w-4 h-4" />
                Ver Perfil
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
