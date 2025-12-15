import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  FileText,
  Settings,
  Shield,
  Target,
  TreePine,
  Building2,
  Award,
  Landmark,
  ShoppingCart,
  FolderOpen,
  Scale,
  Banknote,
  ClipboardCheck,
  Info
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: string;
  profileId: string;
  editData?: any;
  onSaved: () => void;
}

const BUSCA_PLATAFORMA_OPTIONS = [
  "Parcerias",
  "Financiamento",
  "Desenvolver projeto",
  "Vender créditos",
  "Comprar créditos",
  "Consultoria",
  "Auditoria",
  "Outro"
];

const CONTATO_OPTIONS = ["E-mail", "WhatsApp", "Plataforma (chat interno)"];
const BIOMAS = ["Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pampa", "Pantanal"];

const agentTypeConfig: Record<string, { icon: typeof TreePine; label: string; subperfilLabel: string; singularLabel: string }> = {
  proprietario: { icon: TreePine, label: "Proprietário Rural", subperfilLabel: "Áreas", singularLabel: "Área" },
  desenvolvedor: { icon: Building2, label: "Desenvolvedor de Projetos", subperfilLabel: "Projetos", singularLabel: "Projeto" },
  certificadora: { icon: Award, label: "Certificadora", subperfilLabel: "Serviços", singularLabel: "Serviço" },
  auditor: { icon: ClipboardCheck, label: "Auditor", subperfilLabel: "Serviços", singularLabel: "Serviço" },
  investidor: { icon: Landmark, label: "Investidor / Comprador", subperfilLabel: "Requisições", singularLabel: "Requisição" },
  financeira: { icon: Banknote, label: "Instituição Financeira", subperfilLabel: "Produtos", singularLabel: "Produto" },
  juridico: { icon: Scale, label: "Jurídico", subperfilLabel: "Serviços", singularLabel: "Serviço" },
  advogado: { icon: Scale, label: "Jurídico", subperfilLabel: "Serviços", singularLabel: "Serviço" },
  comprador: { icon: ShoppingCart, label: "Empresa Compradora", subperfilLabel: "Demandas ESG", singularLabel: "Demanda" },
  projeto: { icon: FolderOpen, label: "Projeto", subperfilLabel: "Projetos", singularLabel: "Projeto" },
};

export default function SubperfilFormDialog({ open, onOpenChange, agentType, profileId, editData, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  
  const config = agentTypeConfig[agentType] || agentTypeConfig.proprietario;

  const getInitialData = () => {
    const commonFields = {
      busca_plataforma: [],
      contato_preferido: "",
      mostrar_nome_publico: true,
      mostrar_telefone: true,
      mostrar_localizacao_precisa: false,
      permitir_mensagens: true,
    };

    switch (agentType) {
      case "proprietario":
        return { 
          nome_area: "", hectares: "", tipo_uso: "", tipo_projeto_desejado: [], 
          bioma: "", documentacao_fundiaria: false, interesse_projeto: [],
          descricao: "", ...commonFields 
        };
      case "investidor":
        return { 
          nome_requisicao: "", tipo_projeto: "", volume_desejado: "", certificacao_exigida: "", 
          localizacao_preferencial: [], modalidade: [], perfil_investidor: "",
          interesse_principal: [], tipo_credito_desejado: [],
          descricao: "", ...commonFields 
        };
      case "comprador":
        return { 
          nome_demanda: "", volume_creditos: "", tipos_preferidos: [], setor_projeto: "", 
          ano_alvo: "", certificacao_exigida: "", descricao: "", ...commonFields 
        };
      case "certificadora":
        return { 
          nome_servico: "", tipo_auditoria: "", metodologia: "", escopo: "",
          padroes_oferecidos: [], metodologias_suportadas: [], requisitos_especificos: "",
          paises_atuacao: [], descricao: "", ...commonFields 
        };
      case "projeto":
        return { 
          nome_projeto: "", estado: "", municipio: "", tipo_projeto: "", status: "", 
          emissoes_evitadas_ano: "", prazo_projeto: "", investimento_total: "",
          padrao_certificacao: "", ano_inicio: "", creditos_disponiveis: "", co_beneficios: [],
          descricao: "", ...commonFields 
        };
      case "desenvolvedor":
        return {
          nome_projeto: "", tipos_projeto: [], anos_experiencia: "", numero_projetos: "",
          certificadoras_parceiras: [], tamanho_area_ideal: "", descricao: "", ...commonFields
        };
      case "auditor":
        return {
          nome_servico: "", padroes_acreditados: [], tipos_projeto_aceitos: [],
          tempo_medio_verificacao: "", descricao: "", ...commonFields
        };
      case "financeira":
        return {
          nome_produto: "", tipos_financiamento: [], ticket_medio: "",
          exigencias_garantia: "", modalidades: [], descricao: "", ...commonFields
        };
      case "advogado":
        return {
          nome_servico: "", areas_atuacao: [], experiencia_carbono: false,
          clientes_atendidos: [], descricao: "", ...commonFields
        };
      default:
        return { ...commonFields };
    }
  };

  const [formData, setFormData] = useState<any>(() => {
    const initialData = getInitialData();
    if (editData) {
      return { ...initialData, ...editData };
    }
    return initialData;
  });

  useEffect(() => {
    if (open) {
      const initialData = getInitialData();
      if (editData) {
        setFormData({ ...initialData, ...editData });
      } else {
        setFormData(initialData);
      }
      setActiveTab("info");
    }
  }, [open, editData?.id]);

  const handleArrayToggle = (field: string, value: string) => {
    const current = formData[field] || [];
    setFormData({
      ...formData,
      [field]: current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tableMap: Record<string, string> = {
      proprietario: "proprietario_subperfis",
      certificadora: "certificadora_subperfis",
      investidor: "investidor_subperfis",
      comprador: "comprador_subperfis",
      projeto: "projeto_subperfis",
      desenvolvedor: "desenvolvedor_subperfis",
      auditor: "auditor_subperfis",
      financeira: "financeira_subperfis",
      advogado: "advogado_subperfis",
    };

    const tableName = tableMap[agentType];
    if (!tableName) {
      toast.error("Tipo de agente inválido");
      setLoading(false);
      return;
    }

    try {
      const dataToSave = { ...formData, profile_id: profileId };
      delete dataToSave.id;
      delete dataToSave.created_at;
      delete dataToSave.updated_at;

      if (editData?.id) {
        const { error } = await supabase
          .from(tableName as any)
          .update(dataToSave)
          .eq("id", editData.id);
        if (error) throw error;
        toast.success(`${config.singularLabel} atualizado com sucesso`);
      } else {
        const { error } = await supabase
          .from(tableName as any)
          .insert(dataToSave);
        if (error) throw error;
        toast.success(`${config.singularLabel} criado com sucesso`);
      }

      onSaved();
    } catch (error: any) {
      console.error("Error saving subperfil:", error);
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  // Form Section Components
  const FormSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );

  const CheckboxGrid = ({ field, options, cols = 2 }: { field: string; options: string[]; cols?: number }) => (
    <div className={`grid grid-cols-${cols} gap-2`}>
      {options.map((option) => (
        <label
          key={option}
          className={cn(
            "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer text-sm transition-colors",
            (formData[field] || []).includes(option) 
              ? "border-primary bg-primary/5" 
              : "hover:bg-secondary/50"
          )}
        >
          <Checkbox 
            checked={(formData[field] || []).includes(option)} 
            onCheckedChange={() => handleArrayToggle(field, option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );

  // Agent-specific info forms
  const renderBasicInfoTab = () => {
    switch (agentType) {
      case "proprietario":
        return (
          <>
            <FormSection title="Identificação da Área" description="Informações básicas sobre sua propriedade">
              <div className="space-y-2">
                <Label htmlFor="nome_area">Nome da Área *</Label>
                <Input
                  id="nome_area"
                  placeholder="Ex: Fazenda São João"
                  value={formData.nome_area || ""}
                  onChange={(e) => setFormData({ ...formData, nome_area: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva sua área..."
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Interesses" description="O que você busca na plataforma?">
              <CheckboxGrid 
                field="interesse_projeto" 
                options={["Desenvolver projeto", "Vender créditos existentes", "Procurar parceiros / investidores"]}
                cols={1}
              />
            </FormSection>
          </>
        );

      case "investidor":
        return (
          <>
            <FormSection title="Identificação da Requisição" description="Defina sua demanda de investimento">
              <div className="space-y-2">
                <Label htmlFor="nome_requisicao">Nome da Requisição *</Label>
                <Input
                  id="nome_requisicao"
                  placeholder="Ex: Compra 1.000 créditos REDD+"
                  value={formData.nome_requisicao || ""}
                  onChange={(e) => setFormData({ ...formData, nome_requisicao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Perfil do Investidor</Label>
                <RadioGroup
                  value={formData.perfil_investidor || ""}
                  onValueChange={(value) => setFormData({ ...formData, perfil_investidor: value })}
                  className="grid grid-cols-3 gap-2"
                >
                  {["Corporativo", "Fundo", "Broker"].map((perfil) => (
                    <div key={perfil} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/50">
                      <RadioGroupItem value={perfil} id={`perfil-${perfil}`} />
                      <Label htmlFor={`perfil-${perfil}`} className="cursor-pointer">{perfil}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Interesse Principal">
              <CheckboxGrid 
                field="interesse_principal" 
                options={["Compra de créditos", "Pré-financiamento", "Equity em projetos"]}
                cols={1}
              />
            </FormSection>
          </>
        );

      case "desenvolvedor":
        return (
          <>
            <FormSection title="Identificação" description="Informações do desenvolvedor">
              <div className="space-y-2">
                <Label htmlFor="nome_projeto">Nome do Projeto/Serviço *</Label>
                <Input
                  id="nome_projeto"
                  value={formData.nome_projeto || ""}
                  onChange={(e) => setFormData({ ...formData, nome_projeto: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Tipos de Projeto">
              <CheckboxGrid 
                field="tipos_projeto" 
                options={["REDD+", "ARR (reflorestamento)", "IFM", "Agricultura regenerativa", "Energia", "Resíduos", "Outros"]}
              />
            </FormSection>
          </>
        );

      case "certificadora":
      case "auditor":
        return (
          <>
            <FormSection title="Identificação do Serviço">
              <div className="space-y-2">
                <Label htmlFor="nome_servico">Nome do Serviço *</Label>
                <Input
                  id="nome_servico"
                  value={formData.nome_servico || ""}
                  onChange={(e) => setFormData({ ...formData, nome_servico: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title={agentType === "certificadora" ? "Padrões Oferecidos" : "Padrões Acreditados"}>
              <CheckboxGrid 
                field={agentType === "certificadora" ? "padroes_oferecidos" : "padroes_acreditados"} 
                options={["Verra (VCS)", "Gold Standard", "Plan Vivo", "Cercarbono", "ACR", "CDM", "Outros"]}
              />
            </FormSection>
          </>
        );

      case "financeira":
        return (
          <>
            <FormSection title="Identificação do Produto">
              <div className="space-y-2">
                <Label htmlFor="nome_produto">Nome do Produto *</Label>
                <Input
                  id="nome_produto"
                  value={formData.nome_produto || ""}
                  onChange={(e) => setFormData({ ...formData, nome_produto: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Tipos de Financiamento">
              <CheckboxGrid 
                field="tipos_financiamento" 
                options={["Crédito rural", "Project finance", "Antecipação de recebíveis", "Equity", "Outros"]}
              />
            </FormSection>
          </>
        );

      case "advogado":
        return (
          <>
            <FormSection title="Identificação do Serviço">
              <div className="space-y-2">
                <Label htmlFor="nome_servico">Nome do Serviço *</Label>
                <Input
                  id="nome_servico"
                  value={formData.nome_servico || ""}
                  onChange={(e) => setFormData({ ...formData, nome_servico: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Áreas de Atuação">
              <CheckboxGrid 
                field="areas_atuacao" 
                options={["Contratos", "Ambiental", "Societário", "Tributário", "Regulatório", "Due diligence"]}
              />
            </FormSection>
          </>
        );

      case "comprador":
        return (
          <>
            <FormSection title="Identificação da Demanda">
              <div className="space-y-2">
                <Label htmlFor="nome_demanda">Nome da Demanda *</Label>
                <Input
                  id="nome_demanda"
                  value={formData.nome_demanda || ""}
                  onChange={(e) => setFormData({ ...formData, nome_demanda: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Tipos Preferidos">
              <CheckboxGrid 
                field="tipos_preferidos" 
                options={["Florestal", "Solo", "Metano", "Energia"]}
              />
            </FormSection>
          </>
        );

      case "projeto":
        return (
          <>
            <FormSection title="Identificação do Projeto">
              <div className="space-y-2">
                <Label htmlFor="nome_projeto">Nome do Projeto *</Label>
                <Input
                  id="nome_projeto"
                  value={formData.nome_projeto || ""}
                  onChange={(e) => setFormData({ ...formData, nome_projeto: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado || ""}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipio">Município</Label>
                  <Input
                    id="municipio"
                    value={formData.municipio || ""}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Tipo de Projeto">
              <RadioGroup
                value={formData.tipo_projeto || ""}
                onValueChange={(value) => setFormData({ ...formData, tipo_projeto: value })}
                className="grid grid-cols-2 gap-2"
              >
                {["REDD+", "ARR", "AR", "Agricultura Regenerativa", "Energia", "Outros"].map((tipo) => (
                  <div key={tipo} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/50">
                    <RadioGroupItem value={tipo} id={`tipo-${tipo}`} />
                    <Label htmlFor={`tipo-${tipo}`} className="cursor-pointer">{tipo}</Label>
                  </div>
                ))}
              </RadioGroup>
            </FormSection>
          </>
        );

      default:
        return <p className="text-muted-foreground">Tipo não suportado</p>;
    }
  };

  const renderTechnicalInfoTab = () => {
    switch (agentType) {
      case "proprietario":
        return (
          <>
            <FormSection title="Dados da Propriedade" description="Informações técnicas da área">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hectares">Tamanho (hectares)</Label>
                  <Input
                    id="hectares"
                    type="number"
                    value={formData.hectares || ""}
                    onChange={(e) => setFormData({ ...formData, hectares: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_uso">Tipo de Uso Atual</Label>
                  <Input
                    id="tipo_uso"
                    placeholder="Ex: Pastagem, Agricultura"
                    value={formData.tipo_uso || ""}
                    onChange={(e) => setFormData({ ...formData, tipo_uso: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Bioma" description="Selecione o bioma da propriedade">
              <RadioGroup
                value={formData.bioma || ""}
                onValueChange={(value) => setFormData({ ...formData, bioma: value })}
                className="grid grid-cols-3 gap-2"
              >
                {BIOMAS.map((bioma) => (
                  <div key={bioma} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/50">
                    <RadioGroupItem value={bioma} id={`bioma-${bioma}`} />
                    <Label htmlFor={`bioma-${bioma}`} className="cursor-pointer text-sm">{bioma}</Label>
                  </div>
                ))}
              </RadioGroup>
            </FormSection>

            <FormSection title="Documentação">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="doc_fundiaria"
                  checked={formData.documentacao_fundiaria || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, documentacao_fundiaria: checked })}
                />
                <Label htmlFor="doc_fundiaria" className="cursor-pointer">
                  Possui documentação fundiária regularizada
                </Label>
              </div>
            </FormSection>
          </>
        );

      case "investidor":
        return (
          <>
            <FormSection title="Volume e Preferências" description="Defina os parâmetros do investimento">
              <div className="space-y-2">
                <Label htmlFor="volume_desejado">Volume Desejado (tCO₂/ano)</Label>
                <Input
                  id="volume_desejado"
                  type="number"
                  value={formData.volume_desejado || ""}
                  onChange={(e) => setFormData({ ...formData, volume_desejado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificacao_exigida">Certificação Exigida</Label>
                <Input
                  id="certificacao_exigida"
                  placeholder="Ex: Verra VCS"
                  value={formData.certificacao_exigida || ""}
                  onChange={(e) => setFormData({ ...formData, certificacao_exigida: e.target.value })}
                />
              </div>
            </FormSection>

            <FormSection title="Tipo de Crédito Desejado">
              <CheckboxGrid 
                field="tipo_credito_desejado" 
                options={["Removal", "Avoidance", "Natureza", "Energia"]}
              />
            </FormSection>
          </>
        );

      case "desenvolvedor":
        return (
          <>
            <FormSection title="Experiência" description="Dados sobre sua experiência">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anos_experiencia">Anos de Experiência</Label>
                  <Input
                    id="anos_experiencia"
                    type="number"
                    value={formData.anos_experiencia || ""}
                    onChange={(e) => setFormData({ ...formData, anos_experiencia: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_projetos">Nº Projetos Desenvolvidos</Label>
                  <Input
                    id="numero_projetos"
                    type="number"
                    value={formData.numero_projetos || ""}
                    onChange={(e) => setFormData({ ...formData, numero_projetos: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tamanho_area_ideal">Tamanho de Área Ideal</Label>
                <Input
                  id="tamanho_area_ideal"
                  placeholder="Ex: Acima de 1000 ha"
                  value={formData.tamanho_area_ideal || ""}
                  onChange={(e) => setFormData({ ...formData, tamanho_area_ideal: e.target.value })}
                />
              </div>
            </FormSection>
          </>
        );

      case "certificadora":
        return (
          <>
            <FormSection title="Metodologias" description="Detalhes técnicos do serviço">
              <div className="space-y-2">
                <Label htmlFor="metodologia">Metodologias Suportadas</Label>
                <Input
                  id="metodologia"
                  placeholder="Ex: VM0007, AR-AM0014"
                  value={formData.metodologia || ""}
                  onChange={(e) => setFormData({ ...formData, metodologia: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requisitos_especificos">Requisitos Específicos</Label>
                <Textarea
                  id="requisitos_especificos"
                  value={formData.requisitos_especificos || ""}
                  onChange={(e) => setFormData({ ...formData, requisitos_especificos: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>
          </>
        );

      case "auditor":
        return (
          <>
            <FormSection title="Especificações do Serviço">
              <div className="space-y-2">
                <Label htmlFor="tempo_medio">Tempo Médio de Verificação</Label>
                <Input
                  id="tempo_medio"
                  placeholder="Ex: 3-6 meses"
                  value={formData.tempo_medio_verificacao || ""}
                  onChange={(e) => setFormData({ ...formData, tempo_medio_verificacao: e.target.value })}
                />
              </div>
            </FormSection>

            <FormSection title="Tipos de Projeto Aceitos">
              <CheckboxGrid 
                field="tipos_projeto_aceitos" 
                options={["REDD+", "ARR", "IFM", "Energia", "Resíduos", "Agricultura"]}
              />
            </FormSection>
          </>
        );

      case "financeira":
        return (
          <>
            <FormSection title="Detalhes Financeiros">
              <div className="space-y-2">
                <Label htmlFor="ticket_medio">Ticket Médio (R$)</Label>
                <Input
                  id="ticket_medio"
                  type="number"
                  value={formData.ticket_medio || ""}
                  onChange={(e) => setFormData({ ...formData, ticket_medio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exigencias_garantia">Exigências de Garantia</Label>
                <Textarea
                  id="exigencias_garantia"
                  value={formData.exigencias_garantia || ""}
                  onChange={(e) => setFormData({ ...formData, exigencias_garantia: e.target.value })}
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Modalidades">
              <CheckboxGrid 
                field="modalidades" 
                options={["Dívida", "CPR verde", "Antecipação", "Outro"]}
              />
            </FormSection>
          </>
        );

      case "advogado":
        return (
          <>
            <FormSection title="Experiência">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="experiencia_carbono"
                  checked={formData.experiencia_carbono || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, experiencia_carbono: checked })}
                />
                <Label htmlFor="experiencia_carbono" className="cursor-pointer">
                  Experiência em contratos de carbono
                </Label>
              </div>
            </FormSection>

            <FormSection title="Clientes Atendidos">
              <CheckboxGrid 
                field="clientes_atendidos" 
                options={["Proprietários", "Desenvolvedores", "Investidores"]}
                cols={3}
              />
            </FormSection>
          </>
        );

      case "comprador":
        return (
          <>
            <FormSection title="Detalhes da Demanda">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume_creditos">Volume (tCO₂e/ano)</Label>
                  <Input
                    id="volume_creditos"
                    type="number"
                    value={formData.volume_creditos || ""}
                    onChange={(e) => setFormData({ ...formData, volume_creditos: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ano_alvo">Ano-Alvo</Label>
                  <Input
                    id="ano_alvo"
                    type="number"
                    placeholder="Ex: 2030"
                    value={formData.ano_alvo || ""}
                    onChange={(e) => setFormData({ ...formData, ano_alvo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setor_projeto">Setor</Label>
                  <Input
                    id="setor_projeto"
                    value={formData.setor_projeto || ""}
                    onChange={(e) => setFormData({ ...formData, setor_projeto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificacao_exigida">Certificação Exigida</Label>
                  <Input
                    id="certificacao_exigida"
                    value={formData.certificacao_exigida || ""}
                    onChange={(e) => setFormData({ ...formData, certificacao_exigida: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>
          </>
        );

      case "projeto":
        return (
          <>
            <FormSection title="Certificação e Cronograma">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="padrao_certificacao">Padrão de Certificação</Label>
                  <Input
                    id="padrao_certificacao"
                    placeholder="Ex: Verra VCS"
                    value={formData.padrao_certificacao || ""}
                    onChange={(e) => setFormData({ ...formData, padrao_certificacao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ano_inicio">Ano de Início</Label>
                  <Input
                    id="ano_inicio"
                    type="number"
                    value={formData.ano_inicio || ""}
                    onChange={(e) => setFormData({ ...formData, ano_inicio: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Informações de Mercado">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditos_disponiveis">Créditos Disponíveis</Label>
                  <Input
                    id="creditos_disponiveis"
                    type="number"
                    value={formData.creditos_disponiveis || ""}
                    onChange={(e) => setFormData({ ...formData, creditos_disponiveis: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emissoes_evitadas_ano">Emissões Evitadas/Ano</Label>
                  <Input
                    id="emissoes_evitadas_ano"
                    type="number"
                    value={formData.emissoes_evitadas_ano || ""}
                    onChange={(e) => setFormData({ ...formData, emissoes_evitadas_ano: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Co-benefícios (ODS)">
              <CheckboxGrid 
                field="co_beneficios" 
                options={["ODS 1", "ODS 2", "ODS 3", "ODS 13", "ODS 15", "Outros"]}
                cols={3}
              />
            </FormSection>
          </>
        );

      default:
        return null;
    }
  };

  const renderPreferencesTab = () => (
    <>
      <FormSection title="O que busca na plataforma?" description="Selecione seus interesses">
        <CheckboxGrid 
          field="busca_plataforma" 
          options={BUSCA_PLATAFORMA_OPTIONS}
        />
      </FormSection>

      <FormSection title="Forma de Contato Preferida">
        <RadioGroup
          value={formData.contato_preferido || ""}
          onValueChange={(value) => setFormData({ ...formData, contato_preferido: value })}
          className="grid grid-cols-1 gap-2"
        >
          {CONTATO_OPTIONS.map((option) => (
            <div key={option} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/50">
              <RadioGroupItem value={option} id={`contato-${option}`} />
              <Label htmlFor={`contato-${option}`} className="cursor-pointer">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </FormSection>
    </>
  );

  const renderPrivacyTab = () => (
    <FormSection title="Configurações de Privacidade" description="Controle o que é visível para outros usuários">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label htmlFor="mostrar_nome">Mostrar nome publicamente</Label>
            <p className="text-xs text-muted-foreground">Seu nome será visível para todos</p>
          </div>
          <Switch
            id="mostrar_nome"
            checked={formData.mostrar_nome_publico}
            onCheckedChange={(checked) => setFormData({ ...formData, mostrar_nome_publico: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label htmlFor="mostrar_telefone">Mostrar telefone</Label>
            <p className="text-xs text-muted-foreground">Seu telefone será visível no perfil</p>
          </div>
          <Switch
            id="mostrar_telefone"
            checked={formData.mostrar_telefone}
            onCheckedChange={(checked) => setFormData({ ...formData, mostrar_telefone: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label htmlFor="mostrar_local">Mostrar localização precisa</Label>
            <p className="text-xs text-muted-foreground">Exibir localização exata ou apenas região</p>
          </div>
          <Switch
            id="mostrar_local"
            checked={formData.mostrar_localizacao_precisa}
            onCheckedChange={(checked) => setFormData({ ...formData, mostrar_localizacao_precisa: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label htmlFor="permitir_msg">Permitir mensagens</Label>
            <p className="text-xs text-muted-foreground">Outros usuários podem enviar mensagens</p>
          </div>
          <Switch
            id="permitir_msg"
            checked={formData.permitir_mensagens}
            onCheckedChange={(checked) => setFormData({ ...formData, permitir_mensagens: checked })}
          />
        </div>
      </div>
    </FormSection>
  );

  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {editData ? "Editar" : "Adicionar"} {config.singularLabel}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {config.label} • {config.subperfilLabel}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info" className="gap-2">
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">Básico</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Técnico</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Preferências</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Privacidade</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[50vh] px-6 py-4">
              <TabsContent value="info" className="mt-0">
                {renderBasicInfoTab()}
              </TabsContent>
              <TabsContent value="technical" className="mt-0">
                {renderTechnicalInfoTab()}
              </TabsContent>
              <TabsContent value="preferences" className="mt-0">
                {renderPreferencesTab()}
              </TabsContent>
              <TabsContent value="privacy" className="mt-0">
                {renderPrivacyTab()}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-2 p-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
