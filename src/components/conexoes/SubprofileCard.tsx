import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, UserPlus, MessageSquare, CheckCircle, Clock, 
  TreePine, Briefcase, Landmark, FolderOpen, 
  Users, Building2, Scale, Banknote, ClipboardCheck,
  CheckCheck, UserCheck, Loader2, ExternalLink, Target,
  Building, Crown, Sparkles
} from "lucide-react";
import { UnifiedSubprofile } from "@/hooks/useSubprofileConnections";
import { cn } from "@/lib/utils";

interface SubprofileCardProps {
  subprofile: UnifiedSubprofile;
  connectionStatus?: 'none' | 'pending' | 'accepted' | 'sent';
  onConnect: () => void;
  onMessage?: () => void;
  isLoading?: boolean;
}

const AGENT_ICONS: Record<string, any> = {
  proprietario: TreePine,
  desenvolvedor: Briefcase,
  auditor: ClipboardCheck,
  investidor: Landmark,
  financeira: Banknote,
  advogado: Scale,
  projeto: FolderOpen,
  outro: Users,
};

const AGENT_LABELS: Record<string, string> = {
  proprietario: "Proprietário Rural",
  desenvolvedor: "Desenvolvedor de Projetos",
  auditor: "Auditor",
  investidor: "Investidor / Comprador",
  financeira: "Instituição Financeira",
  advogado: "Jurídico",
  projeto: "Projeto Existente",
  outro: "Outro",
};

const AGENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  proprietario: { 
    bg: "bg-emerald-50 dark:bg-emerald-950/40", 
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800"
  },
  desenvolvedor: { 
    bg: "bg-cyan-50 dark:bg-cyan-950/40", 
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800"
  },
  auditor: { 
    bg: "bg-orange-50 dark:bg-orange-950/40", 
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800"
  },
  investidor: { 
    bg: "bg-blue-50 dark:bg-blue-950/40", 
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800"
  },
  financeira: { 
    bg: "bg-indigo-50 dark:bg-indigo-950/40", 
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800"
  },
  advogado: { 
    bg: "bg-slate-50 dark:bg-slate-900/40", 
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700"
  },
  projeto: { 
    bg: "bg-purple-50 dark:bg-purple-950/40", 
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800"
  },
  outro: { 
    bg: "bg-gray-50 dark:bg-gray-900/40", 
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700"
  },
};

const CONNECTION_STATUS_CONFIG = {
  accepted: {
    label: "Conectado",
    icon: CheckCheck,
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
  },
  pending: {
    label: "Aguardando",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  sent: {
    label: "Enviado",
    icon: UserCheck,
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  },
  none: {
    label: "Conectar",
    icon: UserPlus,
    className: "",
  },
};

export default function SubprofileCard({ 
  subprofile, 
  connectionStatus = 'none', 
  onConnect, 
  onMessage,
  isLoading = false,
}: SubprofileCardProps) {
  const navigate = useNavigate();
  const TypeIcon = AGENT_ICONS[subprofile.subprofile_type] || Users;
  const typeLabel = AGENT_LABELS[subprofile.subprofile_type] || "Outro";
  const typeColors = AGENT_COLORS[subprofile.subprofile_type] || AGENT_COLORS.outro;
  const statusConfig = CONNECTION_STATUS_CONFIG[connectionStatus];
  const StatusIcon = statusConfig.icon;

  const handleProfileClick = () => {
    if (subprofile.profile_id) {
      // Navigate to central profile with subprofile highlighted
      navigate(`/perfil/${subprofile.profile_id}?subperfil=${subprofile.id}`);
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage();
    } else if (subprofile.profile_id) {
      navigate(`/mensagens?profile=${subprofile.profile_id}`);
    }
  };

  // Parse busca_plataforma for "what they're looking for"
  const lookingFor = subprofile.busca_plataforma?.slice(0, 3) || [];

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "hover:shadow-xl hover:-translate-y-1",
      "border-border/60 bg-card/95 backdrop-blur-sm"
    )}>
      {/* Premium Strip */}
      {subprofile.profile?.is_premium && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
      )}

      <CardContent className="p-0">
        {/* Header Section - Agent Type Bar */}
        <div className={cn(
          "px-4 py-2.5 border-b flex items-center gap-2",
          typeColors.bg, typeColors.border
        )}>
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            "bg-white/80 dark:bg-black/20 shadow-sm"
          )}>
            <TypeIcon className={cn("w-4 h-4", typeColors.text)} />
          </div>
          <span className={cn("text-sm font-semibold", typeColors.text)}>
            {typeLabel}
          </span>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Profile Info Section */}
          <div 
            className="flex items-start gap-3 cursor-pointer group/profile"
            onClick={handleProfileClick}
          >
            <div className="relative shrink-0">
              <Avatar className="w-14 h-14 ring-2 ring-background shadow-lg transition-transform group-hover/profile:scale-105">
                <AvatarImage 
                  src={subprofile.profile?.avatar_url || undefined} 
                  alt={subprofile.name} 
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                  {subprofile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              {subprofile.profile?.is_premium && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
              {/* Subprofile Name */}
              <h3 className="font-bold text-foreground text-base leading-tight truncate group-hover/profile:text-primary transition-colors">
                {subprofile.name}
              </h3>
              
              {/* Central Profile Name */}
              {subprofile.profile?.name && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{subprofile.profile.name}</span>
                </div>
              )}
              
              {/* Location */}
              {subprofile.profile?.location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{subprofile.profile.location}</span>
                </div>
              )}
            </div>
            
            <ExternalLink className="w-4 h-4 text-muted-foreground/50 shrink-0 opacity-0 group-hover/profile:opacity-100 transition-opacity" />
          </div>

          {/* Description */}
          {subprofile.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {subprofile.description}
            </p>
          )}

          {/* Details Section */}
          {(subprofile.detail_1 || subprofile.detail_2 || subprofile.detail_3) && (
            <div className="flex flex-wrap gap-1.5">
              {subprofile.detail_1 && (
                <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                  {subprofile.detail_1} {subprofile.subprofile_type === 'proprietario' && 'ha'}
                </Badge>
              )}
              {subprofile.detail_2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {subprofile.detail_2}
                </Badge>
              )}
              {subprofile.detail_3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 opacity-80">
                  {subprofile.detail_3}
                </Badge>
              )}
            </div>
          )}

          {/* What They're Looking For */}
          {lookingFor.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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

        {/* Actions Footer */}
        <div className="px-4 py-3 border-t bg-muted/30 flex gap-2">
          {isLoading ? (
            <Button disabled className="flex-1">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processando
            </Button>
          ) : connectionStatus === 'accepted' ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1 border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:bg-green-950/30"
                disabled
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Conectado
              </Button>
              <Button 
                variant="default"
                size="icon"
                onClick={handleMessageClick}
                title="Enviar mensagem"
                className="shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </>
          ) : connectionStatus === 'pending' ? (
            <Button 
              variant="outline" 
              className="flex-1 border-amber-200 text-amber-700 bg-amber-50/50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950/30"
              disabled
            >
              <Clock className="w-4 h-4 mr-2" />
              Aguardando Resposta
            </Button>
          ) : connectionStatus === 'sent' ? (
            <Button 
              variant="outline" 
              className="flex-1 border-blue-200 text-blue-700 bg-blue-50/50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/30"
              disabled
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Solicitação Enviada
            </Button>
          ) : (
            <Button 
              className="flex-1 font-medium"
              onClick={(e) => { e.stopPropagation(); onConnect(); }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Conectar Subperfil
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
