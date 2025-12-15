import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, Trash2, MapPin, TreePine, FileText, 
  DollarSign, Target, Users, Clock, Briefcase,
  CheckCircle2, XCircle, Eye, EyeOff, MessageCircle,
  Phone, Building2, Award, Landmark, ShoppingCart,
  FolderOpen, Scale, Banknote, ClipboardCheck, ChevronDown, ChevronUp
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface Props {
  subperfil: any;
  agentType: string;
  onEdit: () => void;
  onDelete: () => void;
}

const agentTypeConfig: Record<string, { icon: typeof TreePine; label: string; singularLabel: string }> = {
  proprietario: { icon: TreePine, label: "Proprietário Rural", singularLabel: "Área" },
  desenvolvedor: { icon: Building2, label: "Desenvolvedor", singularLabel: "Projeto" },
  certificadora: { icon: Award, label: "Certificadora", singularLabel: "Serviço" },
  auditor: { icon: ClipboardCheck, label: "Auditor", singularLabel: "Serviço" },
  investidor: { icon: Landmark, label: "Investidor", singularLabel: "Requisição" },
  financeira: { icon: Banknote, label: "Financeira", singularLabel: "Produto" },
  advogado: { icon: Scale, label: "Jurídico", singularLabel: "Serviço" },
  comprador: { icon: ShoppingCart, label: "Comprador", singularLabel: "Demanda" },
  projeto: { icon: FolderOpen, label: "Projeto", singularLabel: "Projeto" },
};

export default function SubperfilDetailCard({ subperfil, agentType, onEdit, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const config = agentTypeConfig[agentType] || agentTypeConfig.proprietario;
  const Icon = config.icon;

  const getName = () => {
    switch (agentType) {
      case "proprietario": return subperfil.nome_area;
      case "desenvolvedor": return subperfil.nome_projeto;
      case "certificadora":
      case "auditor":
      case "advogado": return subperfil.nome_servico;
      case "investidor": return subperfil.nome_requisicao;
      case "financeira": return subperfil.nome_produto;
      case "comprador": return subperfil.nome_demanda;
      case "projeto": return subperfil.nome_projeto;
      default: return "Subperfil";
    }
  };

  const InfoItem = ({ icon: ItemIcon, label, value }: { icon: typeof MapPin; label: string; value: string | number | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-2 text-sm">
        <ItemIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{value}</span>
      </div>
    );
  };

  const TagList = ({ items, variant = "secondary" }: { items: string[] | null | undefined; variant?: "secondary" | "outline" }) => {
    if (!items?.length) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item: string) => (
          <Badge key={item} variant={variant} className="text-xs">{item}</Badge>
        ))}
      </div>
    );
  };

  const renderTechnicalInfo = () => {
    switch (agentType) {
      case "proprietario":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={MapPin} label="Tamanho" value={subperfil.hectares ? `${subperfil.hectares} ha` : null} />
              <InfoItem icon={TreePine} label="Bioma" value={subperfil.bioma} />
              <InfoItem icon={FileText} label="Uso atual" value={subperfil.tipo_uso} />
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Documentação:</span>
                {subperfil.documentacao_fundiaria ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Regularizada
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <XCircle className="w-3 h-3 mr-1" />
                    Pendente
                  </Badge>
                )}
              </div>
            </div>
            {subperfil.interesse_projeto?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Interesses:</p>
                <TagList items={subperfil.interesse_projeto} />
              </div>
            )}
          </div>
        );

      case "investidor":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={Target} label="Volume" value={subperfil.volume_desejado ? `${Number(subperfil.volume_desejado).toLocaleString()} tCO₂e` : null} />
              <InfoItem icon={Award} label="Certificação" value={subperfil.certificacao_exigida} />
            </div>
            {subperfil.perfil_investidor && (
              <Badge variant="outline">{subperfil.perfil_investidor}</Badge>
            )}
            {subperfil.interesse_principal?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Interesse principal:</p>
                <TagList items={subperfil.interesse_principal} />
              </div>
            )}
            {subperfil.tipo_credito_desejado?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tipos de crédito:</p>
                <TagList items={subperfil.tipo_credito_desejado} variant="outline" />
              </div>
            )}
          </div>
        );

      case "desenvolvedor":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={Clock} label="Experiência" value={subperfil.anos_experiencia ? `${subperfil.anos_experiencia} anos` : null} />
              <InfoItem icon={Briefcase} label="Projetos" value={subperfil.numero_projetos} />
              <InfoItem icon={MapPin} label="Área ideal" value={subperfil.tamanho_area_ideal} />
            </div>
            {subperfil.tipos_projeto?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tipos de projeto:</p>
                <TagList items={subperfil.tipos_projeto} />
              </div>
            )}
          </div>
        );

      case "certificadora":
        return (
          <div className="space-y-4">
            <InfoItem icon={FileText} label="Metodologia" value={subperfil.metodologia} />
            {subperfil.padroes_oferecidos?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Padrões oferecidos:</p>
                <TagList items={subperfil.padroes_oferecidos} />
              </div>
            )}
            {subperfil.requisitos_especificos && (
              <p className="text-sm text-muted-foreground">{subperfil.requisitos_especificos}</p>
            )}
          </div>
        );

      case "auditor":
        return (
          <div className="space-y-4">
            <InfoItem icon={Clock} label="Tempo médio" value={subperfil.tempo_medio_verificacao} />
            {subperfil.padroes_acreditados?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Padrões acreditados:</p>
                <TagList items={subperfil.padroes_acreditados} />
              </div>
            )}
            {subperfil.tipos_projeto_aceitos?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tipos aceitos:</p>
                <TagList items={subperfil.tipos_projeto_aceitos} variant="outline" />
              </div>
            )}
          </div>
        );

      case "financeira":
        return (
          <div className="space-y-4">
            <InfoItem icon={DollarSign} label="Ticket médio" value={subperfil.ticket_medio ? `R$ ${Number(subperfil.ticket_medio).toLocaleString()}` : null} />
            {subperfil.tipos_financiamento?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tipos de financiamento:</p>
                <TagList items={subperfil.tipos_financiamento} />
              </div>
            )}
            {subperfil.modalidades?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Modalidades:</p>
                <TagList items={subperfil.modalidades} variant="outline" />
              </div>
            )}
          </div>
        );

      case "advogado":
        return (
          <div className="space-y-4">
            {subperfil.experiencia_carbono && (
              <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Experiência em Carbono
              </Badge>
            )}
            {subperfil.areas_atuacao?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Áreas de atuação:</p>
                <TagList items={subperfil.areas_atuacao} />
              </div>
            )}
            {subperfil.clientes_atendidos?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Clientes atendidos:</p>
                <TagList items={subperfil.clientes_atendidos} variant="outline" />
              </div>
            )}
          </div>
        );

      case "comprador":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={Target} label="Volume" value={subperfil.volume_creditos ? `${Number(subperfil.volume_creditos).toLocaleString()} tCO₂e/ano` : null} />
              <InfoItem icon={Clock} label="Ano-alvo" value={subperfil.ano_alvo} />
              <InfoItem icon={Building2} label="Setor" value={subperfil.setor_projeto} />
              <InfoItem icon={Award} label="Certificação" value={subperfil.certificacao_exigida} />
            </div>
            {subperfil.tipos_preferidos?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tipos preferidos:</p>
                <TagList items={subperfil.tipos_preferidos} />
              </div>
            )}
          </div>
        );

      case "projeto":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={MapPin} label="Local" value={[subperfil.municipio, subperfil.estado].filter(Boolean).join(", ") || null} />
              <InfoItem icon={Award} label="Certificação" value={subperfil.padrao_certificacao} />
              <InfoItem icon={Target} label="Créditos" value={subperfil.creditos_disponiveis ? `${Number(subperfil.creditos_disponiveis).toLocaleString()}` : null} />
              <InfoItem icon={Clock} label="Início" value={subperfil.ano_inicio} />
            </div>
            {subperfil.tipo_projeto && (
              <Badge variant="outline">{subperfil.tipo_projeto}</Badge>
            )}
            {subperfil.co_beneficios?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Co-benefícios (ODS):</p>
                <TagList items={subperfil.co_beneficios} variant="outline" />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderPrivacyInfo = () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant={subperfil.mostrar_nome_publico ? "default" : "secondary"} className="text-xs gap-1">
        {subperfil.mostrar_nome_publico ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        Nome {subperfil.mostrar_nome_publico ? "público" : "oculto"}
      </Badge>
      <Badge variant={subperfil.mostrar_telefone ? "default" : "secondary"} className="text-xs gap-1">
        <Phone className="w-3 h-3" />
        Telefone {subperfil.mostrar_telefone ? "visível" : "oculto"}
      </Badge>
      <Badge variant={subperfil.permitir_mensagens ? "default" : "secondary"} className="text-xs gap-1">
        <MessageCircle className="w-3 h-3" />
        Mensagens {subperfil.permitir_mensagens ? "permitidas" : "bloqueadas"}
      </Badge>
    </div>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{getName()}</h3>
              <p className="text-sm text-muted-foreground">{config.singularLabel}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir {config.singularLabel}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {subperfil.descricao && (
          <p className="text-sm text-muted-foreground">{subperfil.descricao}</p>
        )}

        {subperfil.busca_plataforma?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Busca na plataforma:</p>
            <TagList items={subperfil.busca_plataforma} variant="outline" />
          </div>
        )}

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-sm">Informações Técnicas</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <Separator />
            {renderTechnicalInfo()}
            
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Privacidade:</p>
              {renderPrivacyInfo()}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
