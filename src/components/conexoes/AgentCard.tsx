import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, UserPlus, MessageSquare, CheckCircle, Clock, 
  TreePine, HardHat, Briefcase, Award, Landmark, FolderOpen, 
  Users, Building2, Scale, Banknote, ClipboardCheck,
  FileText, Search, Hammer, DollarSign, Leaf, Factory,
  Globe2, CheckCheck, UserCheck, Loader2
} from "lucide-react";

interface AgentCardProps {
  profile: {
    id: string;
    name: string;
    bio: string | null;
    location: string | null;
    avatar_url: string | null;
    agent_type: string;
    is_premium: boolean | null;
  };
  connectionStatus?: 'none' | 'pending' | 'accepted' | 'sent';
  onConnect: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
  isLoading?: boolean;
  specialties?: string[];
  projectStages?: string[];
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

// Map agent types to typical project stages they work on
const AGENT_STAGES: Record<string, string[]> = {
  proprietario: ["Documentos", "Viabilidade"],
  engenheiro: ["Viabilidade", "Desenvolvimento"],
  desenvolvedor: ["Viabilidade", "Desenvolvimento", "Certificação"],
  certificadora: ["Certificação"],
  auditor: ["Auditoria"],
  investidor: ["Desenvolvimento", "Venda"],
  comprador: ["Venda"],
  financeira: ["Desenvolvimento"],
  advogado: ["Documentos", "Certificação", "Venda"],
  projeto: ["Documentos", "Viabilidade", "Desenvolvimento", "Certificação", "Auditoria", "Venda"],
  outro: [],
};

const STAGE_ICONS: Record<string, any> = {
  Documentos: FileText,
  Viabilidade: Search,
  Desenvolvimento: Hammer,
  Certificação: Award,
  Auditoria: ClipboardCheck,
  Venda: DollarSign,
};

export default function AgentCard({ 
  profile, 
  connectionStatus = 'none', 
  onConnect, 
  onMessage,
  isLoading = false,
  specialties = [],
  projectStages = []
}: AgentCardProps) {
  const navigate = useNavigate();
  const TypeIcon = AGENT_ICONS[profile.agent_type] || Users;
  const typeLabel = AGENT_LABELS[profile.agent_type] || "Outro";
  const typeColor = AGENT_COLORS[profile.agent_type] || AGENT_COLORS.outro;
  const stages = projectStages.length > 0 ? projectStages : AGENT_STAGES[profile.agent_type] || [];

  // Calculate profile completeness
  const completenessFields = [profile.name, profile.bio, profile.location, profile.avatar_url];
  const filledFields = completenessFields.filter(f => f && f.trim && f.trim() !== "").length;
  const isProfileComplete = filledFields >= 3;
  const isProfileBasic = filledFields < 2;

  const handleProfileClick = () => {
    navigate(`/perfil/${profile.id}`);
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
          <Button className="flex-1" onClick={(e) => { e.stopPropagation(); onConnect(profile.id); }}>
            <UserPlus className="w-4 h-4 mr-1" />
            Conectar
          </Button>
        );
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Premium/Complete indicator strip */}
      {profile.is_premium ? (
        <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />
      ) : isProfileComplete ? (
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400" />
      ) : null}
      
      <CardContent className="p-5">
        {/* Header: Avatar + Name + Type - Clickable */}
        <div 
          className="flex items-start gap-4 mb-4 cursor-pointer"
          onClick={handleProfileClick}
        >
          <div className="relative">
            <Avatar className="w-14 h-14 ring-2 ring-background shadow-md transition-transform hover:scale-105">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {profile.is_premium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                {profile.name}
              </h3>
              {profile.is_premium && (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
                  Premium
                </Badge>
              )}
              {!profile.is_premium && isProfileComplete && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                  Verificado
                </Badge>
              )}
              {isProfileBasic && (
                <Badge variant="outline" className="text-xs opacity-60">
                  Básico
                </Badge>
              )}
            </div>
            
            {/* Agent Type Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1.5 ${typeColor}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeLabel}
            </div>
          </div>
        </div>

        {/* Location */}
        {profile.location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground/70" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Project Stages */}
        {stages.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Atua nas etapas:</p>
            <div className="flex flex-wrap gap-1.5">
              {stages.map((stage) => {
                const StageIcon = STAGE_ICONS[stage] || FileText;
                return (
                  <Badge 
                    key={stage} 
                    variant="secondary" 
                    className="text-xs gap-1 py-0.5 px-2 bg-muted/50"
                  >
                    <StageIcon className="w-3 h-3" />
                    {stage}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Specialties / Tags */}
        {specialties.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Especialidades:</p>
            <div className="flex flex-wrap gap-1.5">
              {specialties.slice(0, 3).map((spec, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {specialties.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{specialties.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {getConnectionButton()}
          {connectionStatus === 'accepted' && onMessage && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => { e.stopPropagation(); onMessage(profile.id); }}
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
