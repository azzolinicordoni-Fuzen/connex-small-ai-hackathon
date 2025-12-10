export type ProjectStageType = 
  | 'documentos'
  | 'viabilidade'
  | 'desenvolvimento'
  | 'certificacao'
  | 'auditoria'
  | 'venda';

export type StageStatus = 'pendente' | 'em_andamento' | 'concluida';

export type VisibilityMode = 'private' | 'partial' | 'public';

export interface CarbonProject {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  location: string | null;
  area_hectares: number | null;
  project_type: string | null;
  visibility_mode: VisibilityMode;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectStage {
  id: string;
  project_id: string;
  stage: ProjectStageType;
  status: StageStatus;
  deadline: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  progress_percentage: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectStageMember {
  id: string;
  stage_id: string;
  member_profile_id: string;
  role: string | null;
  added_at: string;
  profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
    agent_type: string;
  };
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  stage_id: string | null;
  sender_id: string;
  content: string;
  is_stage_comment: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface ProjectNotification {
  id: string;
  profile_id: string;
  project_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const STAGE_CONFIG: Record<ProjectStageType, { label: string; icon: string; color: string }> = {
  documentos: { label: 'Documentos', icon: 'FileText', color: 'blue' },
  viabilidade: { label: 'Viabilidade', icon: 'Search', color: 'purple' },
  desenvolvimento: { label: 'Desenvolvimento', icon: 'Hammer', color: 'orange' },
  certificacao: { label: 'Certificação', icon: 'Award', color: 'green' },
  auditoria: { label: 'Auditoria', icon: 'ClipboardCheck', color: 'cyan' },
  venda: { label: 'Venda', icon: 'DollarSign', color: 'emerald' },
};

export const STATUS_CONFIG: Record<StageStatus, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'gray' },
  em_andamento: { label: 'Em Andamento', color: 'yellow' },
  concluida: { label: 'Concluída', color: 'green' },
};
