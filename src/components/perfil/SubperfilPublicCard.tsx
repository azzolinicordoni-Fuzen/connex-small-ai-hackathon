import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, TreePine, FileText, 
  DollarSign, Target, Clock, Briefcase,
  CheckCircle2, XCircle, Eye, EyeOff, MessageCircle,
  Phone, Building2, Award, Landmark, ShoppingCart,
  FolderOpen, Scale, Banknote, ClipboardCheck, ChevronDown, ChevronUp,
  Link2, Users, Sparkles
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  subperfil: any;
  agentType: string;
  isHighlighted?: boolean;
  highlightRef?: React.RefObject<HTMLDivElement>;
}

const agentTypeConfig: Record<string, { icon: typeof TreePine; label: string; singularLabel: string; color: string }> = {
  proprietario: { icon: TreePine, label: "Proprietário Rural", singularLabel: "Área", color: "emerald" },
  desenvolvedor: { icon: Building2, label: "Desenvolvedor", singularLabel: "Projeto", color: "cyan" },
  certificadora: { icon: Award, label: "Certificadora", singularLabel: "Serviço", color: "amber" },
  auditor: { icon: ClipboardCheck, label: "Auditor", singularLabel: "Serviço", color: "orange" },
  investidor: { icon: Landmark, label: "Investidor", singularLabel: "Requisição", color: "blue" },
  financeira: { icon: Banknote, label: "Financeira", singularLabel: "Produto", color: "indigo" },
  advogado: { icon: Scale, label: "Jurídico", singularLabel: "Serviço", color: "slate" },
  comprador: { icon: ShoppingCart, label: "Comprador", singularLabel: "Demanda", color: "rose" },
  projeto: { icon: FolderOpen, label: "Projeto", singularLabel: "Projeto", color: "purple" },
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
};

export default function SubperfilPublicCard({ subperfil, agentType, isHighlighted, highlightRef }: Props) {
  const [isOpen, setIsOpen] = useState(isHighlighted || false);
  const config = agentTypeConfig[agentType] || agentTypeConfig.proprietario;
  const Icon = config.icon;
  const iconColor = AGENT_COLORS[agentType] || AGENT_COLORS.proprietario;

  const getName = () => {
    switch (agentType) {
      case "proprietario": return subperfil.nome_area || subperfil.name;
      case "desenvolvedor": return subperfil.nome_projeto || subperfil.name;
      case "certificadora":
      case "auditor":
      case "advogado": return subperfil.nome_servico || subperfil.name;
      case "investidor": return subperfil.nome_requisicao || subperfil.name;
      case "financeira": return subperfil.nome_produto || subperfil.name;
      case "comprador": return subperfil.nome_demanda || subperfil.name;
      case "projeto": return subperfil.nome_projeto || subperfil.name;
      default: return subperfil.name || "Subperfil";
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
              <InfoItem icon={MapPin} label="Tamanho" value={subperfil.hectares ? `${subperfil.hectares} ha` : (subperfil.detail_1 ? `${subperfil.detail_1} ha` : null)} />
              <InfoItem icon={TreePine} label="Bioma" value={subperfil.bioma || subperfil.detail_2} />
              <InfoItem icon={FileText} label="Uso atual" value={subperfil.tipo_uso || subperfil.detail_3} />
              {subperfil.documentacao_fundiaria !== undefined && (
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
              )}
            </div>
            {(subperfil.interesse_projeto?.length > 0 || subperfil.tipo_projeto_desejado?.length > 0) && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Interesses:</p>
                <TagList items={subperfil.interesse_projeto || subperfil.tipo_projeto_desejado} />
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
              <InfoItem icon={FolderOpen} label="Tipo projeto" value={subperfil.tipo_projeto} />
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
            {subperfil.modalidade?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Modalidades:</p>
                <TagList items={subperfil.modalidade} variant="outline" />
              </div>
            )}
            {subperfil.localizacao_preferencial?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Localização preferencial:</p>
                <TagList items={subperfil.localizacao_preferencial} variant="outline" />
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
            {subperfil.certificadoras_parceiras?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Certificadoras parceiras:</p>
                <TagList items={subperfil.certificadoras_parceiras} variant="outline" />
              </div>
            )}
          </div>
        );

      case "certificadora":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={FileText} label="Metodologia" value={subperfil.metodologia} />
              <InfoItem icon={Target} label="Escopo" value={subperfil.escopo} />
              <InfoItem icon={Briefcase} label="Tipo auditoria" value={subperfil.tipo_auditoria} />
            </div>
            {subperfil.padroes_oferecidos?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Padrões oferecidos:</p>
                <TagList items={subperfil.padroes_oferecidos} />
              </div>
            )}
            {subperfil.metodologias_suportadas?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Metodologias suportadas:</p>
                <TagList items={subperfil.metodologias_suportadas} variant="outline" />
              </div>
            )}
            {subperfil.paises_atuacao?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Países de atuação:</p>
                <TagList items={subperfil.paises_atuacao} variant="outline" />
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
            {subperfil.exigencias_garantia && (
              <p className="text-sm text-muted-foreground"><span className="font-medium">Exigências:</span> {subperfil.exigencias_garantia}</p>
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
              <InfoItem icon={DollarSign} label="Investimento" value={subperfil.investimento_total ? `R$ ${Number(subperfil.investimento_total).toLocaleString()}` : null} />
              <InfoItem icon={Target} label="Emissões evitadas" value={subperfil.emissoes_evitadas_ano ? `${Number(subperfil.emissoes_evitadas_ano).toLocaleString()} tCO₂e/ano` : null} />
            </div>
            {subperfil.tipo_projeto && (
              <Badge variant="outline">{subperfil.tipo_projeto}</Badge>
            )}
            {subperfil.status && (
              <Badge variant="secondary">{subperfil.status}</Badge>
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

  const description = subperfil.descricao || subperfil.description;
  const lookingFor = subperfil.busca_plataforma;

  return (
    <Card 
      ref={highlightRef}
      className={cn(
        "overflow-hidden transition-all duration-300",
        isHighlighted 
          ? "ring-2 ring-primary shadow-lg border-primary/50" 
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

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn("p-2.5 rounded-xl", iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-lg",
              isHighlighted && "text-primary"
            )}>
              {getName()}
            </h3>
            <p className="text-sm text-muted-foreground">{config.singularLabel} • {config.label}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}

        {lookingFor?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Busca na plataforma:
            </p>
            <TagList items={lookingFor} variant="outline" />
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
              <p className="text-xs text-muted-foreground mb-2">Configurações de privacidade:</p>
              {renderPrivacyInfo()}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
