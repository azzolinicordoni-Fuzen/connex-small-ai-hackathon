import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, UserPlus, MessageSquare, CheckCircle, Clock, 
  TreePine, HardHat, Briefcase, Award, Landmark, FolderOpen, 
  Users, Building2, Scale, Banknote, ClipboardCheck,
  CheckCheck, UserCheck, Loader2
} from "lucide-react";
import { UnifiedSubprofile } from "@/hooks/useSubprofileConnections";

interface SubprofileCardProps {
  subprofile: UnifiedSubprofile;
  connectionStatus?: 'none' | 'pending' | 'accepted' | 'sent';
  onConnect: () => void;
  onMessage?: () => void;
  isLoading?: boolean;
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

const AGENT_COLORS: Record<string, string> = {
  proprietario: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  engenheiro: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  desenvolvedor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  certificadora: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  investidor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  projeto: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  comprador: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  auditor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  financeira: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  advogado: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
  outro: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
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
  const typeColor = AGENT_COLORS[subprofile.subprofile_type] || AGENT_COLORS.outro;

  const handleProfileClick = () => {
    if (subprofile.profile_id) {
      navigate(`/perfil/${subprofile.profile_id}`);
    }
  };

  const getConnectionButton = () => {
    if (isLoading) {
      return (
        <Button disabled className="flex-1">
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      );
    }

    switch (connectionStatus) {
      case 'accepted':
        return (
          <Button variant="outline" className="flex-1 text-green-600 border-green-200" disabled>
            <CheckCheck className="w-4 h-4 mr-1" />
            Conectado
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" className="flex-1 text-amber-600 border-amber-200" disabled>
            <Clock className="w-4 h-4 mr-1" />
            Pendente
          </Button>
        );
      case 'sent':
        return (
          <Button variant="outline" className="flex-1 text-blue-600 border-blue-200" disabled>
            <UserCheck className="w-4 h-4 mr-1" />
            Enviado
          </Button>
        );
      default:
        return (
          <Button className="flex-1" onClick={(e) => { e.stopPropagation(); onConnect(); }}>
            <UserPlus className="w-4 h-4 mr-1" />
            Conectar
          </Button>
        );
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Premium indicator strip */}
      {subprofile.profile?.is_premium && (
        <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />
      )}
      
      <CardContent className="p-5">
        {/* Header: Avatar + Subprofile Name + Type - Clickable */}
        <div 
          className="flex items-start gap-4 mb-4 cursor-pointer"
          onClick={handleProfileClick}
        >
          <div className="relative">
            <Avatar className="w-14 h-14 ring-2 ring-background shadow-md transition-transform hover:scale-105">
              <AvatarImage src={subprofile.profile?.avatar_url || undefined} alt={subprofile.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {subprofile.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"}
              </AvatarFallback>
            </Avatar>
            {subprofile.profile?.is_premium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Subprofile Name */}
            <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
              {subprofile.name}
            </h3>
            
            {/* Agent Type Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1.5 ${typeColor}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeLabel}
            </div>

            {/* Central Profile Name */}
            {subprofile.profile?.name && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                por {subprofile.profile.name}
              </p>
            )}
          </div>
        </div>

        {/* Location from central profile */}
        {subprofile.profile?.location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground/70" />
            <span>{subprofile.profile.location}</span>
          </div>
        )}

        {/* Description */}
        {subprofile.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {subprofile.description}
          </p>
        )}

        {/* Details */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {subprofile.detail_1 && (
            <Badge variant="secondary" className="text-xs">
              {subprofile.detail_1}
            </Badge>
          )}
          {subprofile.detail_2 && (
            <Badge variant="secondary" className="text-xs">
              {subprofile.detail_2}
            </Badge>
          )}
          {subprofile.detail_3 && (
            <Badge variant="outline" className="text-xs">
              {subprofile.detail_3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {getConnectionButton()}
          {connectionStatus === 'accepted' && onMessage && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => { e.stopPropagation(); onMessage(); }}
              title="Enviar mensagem"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
