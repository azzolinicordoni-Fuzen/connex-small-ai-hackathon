export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      advogado_subperfis: {
        Row: {
          areas_atuacao: string[] | null
          busca_plataforma: string[] | null
          clientes_atendidos: string[] | null
          contato_preferido: string | null
          created_at: string
          descricao: string | null
          experiencia_carbono: boolean | null
          id: string
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          nome_servico: string
          permitir_mensagens: boolean | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          areas_atuacao?: string[] | null
          busca_plataforma?: string[] | null
          clientes_atendidos?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          experiencia_carbono?: boolean | null
          id?: string
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_servico: string
          permitir_mensagens?: boolean | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          areas_atuacao?: string[] | null
          busca_plataforma?: string[] | null
          clientes_atendidos?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          experiencia_carbono?: boolean | null
          id?: string
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_servico?: string
          permitir_mensagens?: boolean | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advogado_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auditor_subperfis: {
        Row: {
          busca_plataforma: string[] | null
          contato_preferido: string | null
          created_at: string
          descricao: string | null
          id: string
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          nome_servico: string
          padroes_acreditados: string[] | null
          permitir_mensagens: boolean | null
          profile_id: string
          tempo_medio_verificacao: string | null
          tipos_projeto_aceitos: string[] | null
          updated_at: string
        }
        Insert: {
          busca_plataforma?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_servico: string
          padroes_acreditados?: string[] | null
          permitir_mensagens?: boolean | null
          profile_id: string
          tempo_medio_verificacao?: string | null
          tipos_projeto_aceitos?: string[] | null
          updated_at?: string
        }
        Update: {
          busca_plataforma?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_servico?: string
          padroes_acreditados?: string[] | null
          permitir_mensagens?: boolean | null
          profile_id?: string
          tempo_medio_verificacao?: string | null
          tipos_projeto_aceitos?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditor_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_projects: {
        Row: {
          area_hectares: number | null
          created_at: string
          description: string | null
          id: string
          is_online: boolean
          location: string | null
          name: string
          profile_id: string
          project_type: string | null
          updated_at: string
          visibility_mode: string
        }
        Insert: {
          area_hectares?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_online?: boolean
          location?: string | null
          name: string
          profile_id: string
          project_type?: string | null
          updated_at?: string
          visibility_mode?: string
        }
        Update: {
          area_hectares?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_online?: boolean
          location?: string | null
          name?: string
          profile_id?: string
          project_type?: string | null
          updated_at?: string
          visibility_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificadora_details: {
        Row: {
          areas_atuacao: string[] | null
          certificados_url: string[] | null
          cnpj: string | null
          created_at: string
          id: string
          metodologias_certificadas: string[] | null
          numero_auditores: number | null
          portfolio_url: string | null
          profile_id: string
          projetos_auditados_agricultura: number | null
          projetos_auditados_energia: number | null
          projetos_auditados_florestal: number | null
          projetos_auditados_outros: number | null
          selos_credenciamento: string[] | null
          servico_auditoria_inicial: boolean | null
          servico_auditoria_monitoramento: boolean | null
          servico_revisao_inventario: boolean | null
          servico_verificacao_baseline: boolean | null
          updated_at: string
        }
        Insert: {
          areas_atuacao?: string[] | null
          certificados_url?: string[] | null
          cnpj?: string | null
          created_at?: string
          id?: string
          metodologias_certificadas?: string[] | null
          numero_auditores?: number | null
          portfolio_url?: string | null
          profile_id: string
          projetos_auditados_agricultura?: number | null
          projetos_auditados_energia?: number | null
          projetos_auditados_florestal?: number | null
          projetos_auditados_outros?: number | null
          selos_credenciamento?: string[] | null
          servico_auditoria_inicial?: boolean | null
          servico_auditoria_monitoramento?: boolean | null
          servico_revisao_inventario?: boolean | null
          servico_verificacao_baseline?: boolean | null
          updated_at?: string
        }
        Update: {
          areas_atuacao?: string[] | null
          certificados_url?: string[] | null
          cnpj?: string | null
          created_at?: string
          id?: string
          metodologias_certificadas?: string[] | null
          numero_auditores?: number | null
          portfolio_url?: string | null
          profile_id?: string
          projetos_auditados_agricultura?: number | null
          projetos_auditados_energia?: number | null
          projetos_auditados_florestal?: number | null
          projetos_auditados_outros?: number | null
          selos_credenciamento?: string[] | null
          servico_auditoria_inicial?: boolean | null
          servico_auditoria_monitoramento?: boolean | null
          servico_revisao_inventario?: boolean | null
          servico_verificacao_baseline?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificadora_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificadora_subperfis: {
        Row: {
          busca_plataforma: string[] | null
          contato_preferido: string | null
          created_at: string
          descricao: string | null
          escopo: string | null
          id: string
          metodologia: string | null
          metodologias_suportadas: string[] | null
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          nome_servico: string
          padroes_oferecidos: string[] | null
          paises_atuacao: string[] | null
          permitir_mensagens: boolean | null
          portfolio_url: string | null
          profile_id: string
          requisitos_especificos: string | null
          tipo_auditoria: string | null
          updated_at: string
        }
        Insert: {
          busca_plataforma?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          escopo?: string | null
          id?: string
          metodologia?: string | null
          metodologias_suportadas?: string[] | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_servico: string
          padroes_oferecidos?: string[] | null
          paises_atuacao?: string[] | null
          permitir_mensagens?: boolean | null
          portfolio_url?: string | null
          profile_id: string
          requisitos_especificos?: string | null
          tipo_auditoria?: string | null
          updated_at?: string
        }
        Update: {
          busca_plataforma?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          escopo?: string | null
          id?: string
          metodologia?: string | null
          metodologias_suportadas?: string[] | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_servico?: string
          padroes_oferecidos?: string[] | null
          paises_atuacao?: string[] | null
          permitir_mensagens?: boolean | null
          portfolio_url?: string | null
          profile_id?: string
          requisitos_especificos?: string | null
          tipo_auditoria?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificadora_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comprador_details: {
        Row: {
          ano_net_zero: number | null
          cnpj: string | null
          compromissos_publicos: string | null
          created_at: string
          criterios_sociais: string | null
          exigencia_certificacao: string | null
          id: string
          numero_funcionarios: number | null
          preferencia_energia: boolean | null
          preferencia_florestal: boolean | null
          preferencia_metano: boolean | null
          preferencia_solo: boolean | null
          profile_id: string
          setor: string | null
          updated_at: string
          volume_anual_creditos: number | null
        }
        Insert: {
          ano_net_zero?: number | null
          cnpj?: string | null
          compromissos_publicos?: string | null
          created_at?: string
          criterios_sociais?: string | null
          exigencia_certificacao?: string | null
          id?: string
          numero_funcionarios?: number | null
          preferencia_energia?: boolean | null
          preferencia_florestal?: boolean | null
          preferencia_metano?: boolean | null
          preferencia_solo?: boolean | null
          profile_id: string
          setor?: string | null
          updated_at?: string
          volume_anual_creditos?: number | null
        }
        Update: {
          ano_net_zero?: number | null
          cnpj?: string | null
          compromissos_publicos?: string | null
          created_at?: string
          criterios_sociais?: string | null
          exigencia_certificacao?: string | null
          id?: string
          numero_funcionarios?: number | null
          preferencia_energia?: boolean | null
          preferencia_florestal?: boolean | null
          preferencia_metano?: boolean | null
          preferencia_solo?: boolean | null
          profile_id?: string
          setor?: string | null
          updated_at?: string
          volume_anual_creditos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comprador_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comprador_subperfis: {
        Row: {
          ano_alvo: number | null
          busca_plataforma: string[] | null
          certificacao_exigida: string | null
          contato_preferido: string | null
          created_at: string
          descricao: string | null
          id: string
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          nome_demanda: string
          permitir_mensagens: boolean | null
          profile_id: string
          setor_projeto: string | null
          tipos_preferidos: string[] | null
          updated_at: string
          volume_creditos: number | null
        }
        Insert: {
          ano_alvo?: number | null
          busca_plataforma?: string[] | null
          certificacao_exigida?: string | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_demanda: string
          permitir_mensagens?: boolean | null
          profile_id: string
          setor_projeto?: string | null
          tipos_preferidos?: string[] | null
          updated_at?: string
          volume_creditos?: number | null
        }
        Update: {
          ano_alvo?: number | null
          busca_plataforma?: string[] | null
          certificacao_exigida?: string | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_demanda?: string
          permitir_mensagens?: boolean | null
          profile_id?: string
          setor_projeto?: string | null
          tipos_preferidos?: string[] | null
          updated_at?: string
          volume_creditos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comprador_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_settings: {
        Row: {
          archived: boolean
          conversation_id: string
          created_at: string
          id: string
          muted: boolean
          profile_id: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          conversation_id: string
          created_at?: string
          id?: string
          muted?: boolean
          profile_id: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          conversation_id?: string
          created_at?: string
          id?: string
          muted?: boolean
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_settings_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          context_category: string
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          participant_1_id: string
          participant_2_id: string
          project_id: string | null
          updated_at: string
        }
        Insert: {
          context_category?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1_id: string
          participant_2_id: string
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          context_category?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1_id?: string
          participant_2_id?: string
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "carbon_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      desenvolvedor_subperfis: {
        Row: {
          anos_experiencia: number | null
          busca_plataforma: string[] | null
          certificadoras_parceiras: string[] | null
          contato_preferido: string | null
          created_at: string
          descricao: string | null
          id: string
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          nome_projeto: string
          numero_projetos: number | null
          permitir_mensagens: boolean | null
          profile_id: string
          tamanho_area_ideal: string | null
          tipos_projeto: string[] | null
          updated_at: string
        }
        Insert: {
          anos_experiencia?: number | null
          busca_plataforma?: string[] | null
          certificadoras_parceiras?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_projeto: string
          numero_projetos?: number | null
          permitir_mensagens?: boolean | null
          profile_id: string
          tamanho_area_ideal?: string | null
          tipos_projeto?: string[] | null
          updated_at?: string
        }
        Update: {
          anos_experiencia?: number | null
          busca_plataforma?: string[] | null
          certificadoras_parceiras?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_projeto?: string
          numero_projetos?: number | null
          permitir_mensagens?: boolean | null
          profile_id?: string
          tamanho_area_ideal?: string | null
          tipos_projeto?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "desenvolvedor_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financeira_subperfis: {
        Row: {
          busca_plataforma: string[] | null
          contato_preferido: string | null
          created_at: string
          descricao: string | null
          exigencias_garantia: string | null
          id: string
          modalidades: string[] | null
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          nome_produto: string
          permitir_mensagens: boolean | null
          profile_id: string
          ticket_medio: number | null
          tipos_financiamento: string[] | null
          updated_at: string
        }
        Insert: {
          busca_plataforma?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          exigencias_garantia?: string | null
          id?: string
          modalidades?: string[] | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_produto: string
          permitir_mensagens?: boolean | null
          profile_id: string
          ticket_medio?: number | null
          tipos_financiamento?: string[] | null
          updated_at?: string
        }
        Update: {
          busca_plataforma?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          exigencias_garantia?: string | null
          id?: string
          modalidades?: string[] | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_produto?: string
          permitir_mensagens?: boolean | null
          profile_id?: string
          ticket_medio?: number | null
          tipos_financiamento?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financeira_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investidor_details: {
        Row: {
          busca_agricultura_regenerativa: boolean | null
          busca_biodiversidade: boolean | null
          busca_energia_renovavel: boolean | null
          busca_floresta_nativa: boolean | null
          cnpj: string | null
          created_at: string
          exigencia_certificadora: string | null
          id: string
          interesse_financeiro: string[] | null
          localizacao_preferencial: string[] | null
          profile_id: string
          ticket_maximo: number | null
          ticket_minimo: number | null
          tipo_investidor: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          busca_agricultura_regenerativa?: boolean | null
          busca_biodiversidade?: boolean | null
          busca_energia_renovavel?: boolean | null
          busca_floresta_nativa?: boolean | null
          cnpj?: string | null
          created_at?: string
          exigencia_certificadora?: string | null
          id?: string
          interesse_financeiro?: string[] | null
          localizacao_preferencial?: string[] | null
          profile_id: string
          ticket_maximo?: number | null
          ticket_minimo?: number | null
          tipo_investidor?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          busca_agricultura_regenerativa?: boolean | null
          busca_biodiversidade?: boolean | null
          busca_energia_renovavel?: boolean | null
          busca_floresta_nativa?: boolean | null
          cnpj?: string | null
          created_at?: string
          exigencia_certificadora?: string | null
          id?: string
          interesse_financeiro?: string[] | null
          localizacao_preferencial?: string[] | null
          profile_id?: string
          ticket_maximo?: number | null
          ticket_minimo?: number | null
          tipo_investidor?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investidor_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investidor_subperfis: {
        Row: {
          busca_plataforma: string[] | null
          certificacao_exigida: string | null
          contato_preferido: string | null
          created_at: string
          descricao: string | null
          id: string
          interesse_principal: string[] | null
          localizacao_preferencial: string[] | null
          modalidade: string[] | null
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          nome_requisicao: string
          perfil_investidor: string | null
          permitir_mensagens: boolean | null
          profile_id: string
          tipo_credito_desejado: string[] | null
          tipo_projeto: string | null
          updated_at: string
          volume_desejado: number | null
        }
        Insert: {
          busca_plataforma?: string[] | null
          certificacao_exigida?: string | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          interesse_principal?: string[] | null
          localizacao_preferencial?: string[] | null
          modalidade?: string[] | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_requisicao: string
          perfil_investidor?: string | null
          permitir_mensagens?: boolean | null
          profile_id: string
          tipo_credito_desejado?: string[] | null
          tipo_projeto?: string | null
          updated_at?: string
          volume_desejado?: number | null
        }
        Update: {
          busca_plataforma?: string[] | null
          certificacao_exigida?: string | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          interesse_principal?: string[] | null
          localizacao_preferencial?: string[] | null
          modalidade?: string[] | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_requisicao?: string
          perfil_investidor?: string | null
          permitir_mensagens?: boolean | null
          profile_id?: string
          tipo_credito_desejado?: string[] | null
          tipo_projeto?: string | null
          updated_at?: string
          volume_desejado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investidor_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string
          created_at: string
          email: boolean
          event_type: string
          id: string
          in_app: boolean
          profile_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          email?: boolean
          event_type: string
          id?: string
          in_app?: boolean
          profile_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: boolean
          event_type?: string
          id?: string
          in_app?: boolean
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json | null
          profile_id: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          profile_id: string
          read?: boolean
          title: string
          type: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          profile_id?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          shares_count: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          shares_count?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          shares_count?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          areas_atuacao: string | null
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          cpf_cnpj: string | null
          created_at: string
          id: string
          is_premium: boolean | null
          location: string | null
          name: string
          nome_publico: string | null
          objetivo_plataforma: string | null
          phone: string | null
          tipo_perfil: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          areas_atuacao?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean | null
          location?: string | null
          name: string
          nome_publico?: string | null
          objetivo_plataforma?: string | null
          phone?: string | null
          tipo_perfil?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          areas_atuacao?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean | null
          location?: string | null
          name?: string
          nome_publico?: string | null
          objetivo_plataforma?: string | null
          phone?: string | null
          tipo_perfil?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      project_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_stage_comment: boolean | null
          project_id: string
          sender_id: string
          stage_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_stage_comment?: boolean | null
          project_id: string
          sender_id: string
          stage_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_stage_comment?: boolean | null
          project_id?: string
          sender_id?: string
          stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "carbon_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_messages_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          profile_id: string
          project_id: string
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          profile_id: string
          project_id: string
          read?: boolean | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          profile_id?: string
          project_id?: string
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "carbon_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stage_members: {
        Row: {
          added_at: string
          id: string
          member_profile_id: string
          role: string | null
          stage_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          member_profile_id: string
          role?: string | null
          stage_id: string
        }
        Update: {
          added_at?: string
          id?: string
          member_profile_id?: string
          role?: string | null
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stage_members_member_profile_id_fkey"
            columns: ["member_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stage_members_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stages: {
        Row: {
          completed_at: string | null
          created_at: string
          deadline: string | null
          id: string
          is_visible: boolean
          notes: string | null
          progress_percentage: number | null
          project_id: string
          stage: Database["public"]["Enums"]["project_stage"]
          started_at: string | null
          status: Database["public"]["Enums"]["stage_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          is_visible?: boolean
          notes?: string | null
          progress_percentage?: number | null
          project_id: string
          stage: Database["public"]["Enums"]["project_stage"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          is_visible?: boolean
          notes?: string | null
          progress_percentage?: number | null
          project_id?: string
          stage?: Database["public"]["Enums"]["project_stage"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "carbon_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_details: {
        Row: {
          car_url: string | null
          cnpj: string | null
          created_at: string
          emissoes_evitadas_ano: number | null
          estado: string | null
          geometria_url: string | null
          id: string
          investimento_total: number | null
          municipio: string | null
          nome_projeto: string | null
          pdd_url: string | null
          prazo_projeto: string | null
          profile_id: string
          responsavel: string | null
          status: string | null
          tipo_projeto: string | null
          updated_at: string
        }
        Insert: {
          car_url?: string | null
          cnpj?: string | null
          created_at?: string
          emissoes_evitadas_ano?: number | null
          estado?: string | null
          geometria_url?: string | null
          id?: string
          investimento_total?: number | null
          municipio?: string | null
          nome_projeto?: string | null
          pdd_url?: string | null
          prazo_projeto?: string | null
          profile_id: string
          responsavel?: string | null
          status?: string | null
          tipo_projeto?: string | null
          updated_at?: string
        }
        Update: {
          car_url?: string | null
          cnpj?: string | null
          created_at?: string
          emissoes_evitadas_ano?: number | null
          estado?: string | null
          geometria_url?: string | null
          id?: string
          investimento_total?: number | null
          municipio?: string | null
          nome_projeto?: string | null
          pdd_url?: string | null
          prazo_projeto?: string | null
          profile_id?: string
          responsavel?: string | null
          status?: string | null
          tipo_projeto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_subperfis: {
        Row: {
          ano_inicio: number | null
          busca_plataforma: string[] | null
          car_url: string | null
          co_beneficios: string[] | null
          contato_preferido: string | null
          created_at: string
          creditos_disponiveis: number | null
          descricao: string | null
          emissoes_evitadas_ano: number | null
          estado: string | null
          geometria_url: string | null
          id: string
          investimento_total: number | null
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          municipio: string | null
          nome_projeto: string
          padrao_certificacao: string | null
          pdd_url: string | null
          permitir_mensagens: boolean | null
          prazo_projeto: string | null
          profile_id: string
          status: string | null
          tipo_projeto: string | null
          updated_at: string
        }
        Insert: {
          ano_inicio?: number | null
          busca_plataforma?: string[] | null
          car_url?: string | null
          co_beneficios?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          creditos_disponiveis?: number | null
          descricao?: string | null
          emissoes_evitadas_ano?: number | null
          estado?: string | null
          geometria_url?: string | null
          id?: string
          investimento_total?: number | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          municipio?: string | null
          nome_projeto: string
          padrao_certificacao?: string | null
          pdd_url?: string | null
          permitir_mensagens?: boolean | null
          prazo_projeto?: string | null
          profile_id: string
          status?: string | null
          tipo_projeto?: string | null
          updated_at?: string
        }
        Update: {
          ano_inicio?: number | null
          busca_plataforma?: string[] | null
          car_url?: string | null
          co_beneficios?: string[] | null
          contato_preferido?: string | null
          created_at?: string
          creditos_disponiveis?: number | null
          descricao?: string | null
          emissoes_evitadas_ano?: number | null
          estado?: string | null
          geometria_url?: string | null
          id?: string
          investimento_total?: number | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          municipio?: string | null
          nome_projeto?: string
          padrao_certificacao?: string | null
          pdd_url?: string | null
          permitir_mensagens?: boolean | null
          prazo_projeto?: string | null
          profile_id?: string
          status?: string | null
          tipo_projeto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proprietario_details: {
        Row: {
          app_descricao: string | null
          area_disponivel_ha: number | null
          area_total_ha: number | null
          areas_degradadas_percentual: number | null
          car_documento_url: string | null
          car_numero: string | null
          cpf_cnpj: string | null
          created_at: string
          documento_fundiario_url: string | null
          estado: string | null
          id: string
          interesses_atrair: string[] | null
          municipio: string | null
          nome_fazenda: string | null
          phone: string | null
          possui_app: boolean | null
          possui_projeto_carbono: boolean | null
          possui_reserva_legal: boolean | null
          profile_id: string
          reserva_legal_descricao: string | null
          tipo_uso_atual: string | null
          tipos_projeto_desejado: string[] | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          app_descricao?: string | null
          area_disponivel_ha?: number | null
          area_total_ha?: number | null
          areas_degradadas_percentual?: number | null
          car_documento_url?: string | null
          car_numero?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          documento_fundiario_url?: string | null
          estado?: string | null
          id?: string
          interesses_atrair?: string[] | null
          municipio?: string | null
          nome_fazenda?: string | null
          phone?: string | null
          possui_app?: boolean | null
          possui_projeto_carbono?: boolean | null
          possui_reserva_legal?: boolean | null
          profile_id: string
          reserva_legal_descricao?: string | null
          tipo_uso_atual?: string | null
          tipos_projeto_desejado?: string[] | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          app_descricao?: string | null
          area_disponivel_ha?: number | null
          area_total_ha?: number | null
          areas_degradadas_percentual?: number | null
          car_documento_url?: string | null
          car_numero?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          documento_fundiario_url?: string | null
          estado?: string | null
          id?: string
          interesses_atrair?: string[] | null
          municipio?: string | null
          nome_fazenda?: string | null
          phone?: string | null
          possui_app?: boolean | null
          possui_projeto_carbono?: boolean | null
          possui_reserva_legal?: boolean | null
          profile_id?: string
          reserva_legal_descricao?: string | null
          tipo_uso_atual?: string | null
          tipos_projeto_desejado?: string[] | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proprietario_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proprietario_subperfis: {
        Row: {
          bioma: string | null
          busca_plataforma: string[] | null
          car_documento_url: string | null
          car_numero: string | null
          contato_preferido: string | null
          created_at: string
          descricao: string | null
          documentacao_fundiaria: boolean | null
          documento_fundiario_url: string | null
          hectares: number | null
          id: string
          interesse_projeto: string[] | null
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          nome_area: string
          permitir_mensagens: boolean | null
          profile_id: string
          tipo_projeto_desejado: string[] | null
          tipo_uso: string | null
          updated_at: string
        }
        Insert: {
          bioma?: string | null
          busca_plataforma?: string[] | null
          car_documento_url?: string | null
          car_numero?: string | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          documentacao_fundiaria?: boolean | null
          documento_fundiario_url?: string | null
          hectares?: number | null
          id?: string
          interesse_projeto?: string[] | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_area: string
          permitir_mensagens?: boolean | null
          profile_id: string
          tipo_projeto_desejado?: string[] | null
          tipo_uso?: string | null
          updated_at?: string
        }
        Update: {
          bioma?: string | null
          busca_plataforma?: string[] | null
          car_documento_url?: string | null
          car_numero?: string | null
          contato_preferido?: string | null
          created_at?: string
          descricao?: string | null
          documentacao_fundiaria?: boolean | null
          documento_fundiario_url?: string | null
          hectares?: number | null
          id?: string
          interesse_projeto?: string[] | null
          mostrar_localizacao_precisa?: boolean | null
          mostrar_nome_publico?: boolean | null
          mostrar_telefone?: boolean | null
          nome_area?: string
          permitir_mensagens?: boolean | null
          profile_id?: string
          tipo_projeto_desejado?: string[] | null
          tipo_uso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proprietario_subperfis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subprofile_connections: {
        Row: {
          addressee_profile_id: string
          addressee_subprofile_id: string
          addressee_subprofile_type: string
          created_at: string
          id: string
          requester_profile_id: string
          requester_subprofile_id: string
          requester_subprofile_type: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_profile_id: string
          addressee_subprofile_id: string
          addressee_subprofile_type: string
          created_at?: string
          id?: string
          requester_profile_id: string
          requester_subprofile_id: string
          requester_subprofile_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_profile_id?: string
          addressee_subprofile_id?: string
          addressee_subprofile_type?: string
          created_at?: string
          id?: string
          requester_profile_id?: string
          requester_subprofile_id?: string
          requester_subprofile_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subprofile_connections_addressee_profile_id_fkey"
            columns: ["addressee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subprofile_connections_requester_profile_id_fkey"
            columns: ["requester_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      unified_subprofiles: {
        Row: {
          busca_plataforma: string[] | null
          contato_preferido: string | null
          created_at: string | null
          description: string | null
          detail_1: string | null
          detail_2: string | null
          detail_3: string | null
          id: string | null
          mostrar_localizacao_precisa: boolean | null
          mostrar_nome_publico: boolean | null
          mostrar_telefone: boolean | null
          name: string | null
          permitir_mensagens: boolean | null
          profile_id: string | null
          subprofile_type: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      are_subprofiles_connected: {
        Args: { subprofile1_id: string; subprofile2_id: string }
        Returns: boolean
      }
      are_users_connected: {
        Args: { user1_profile_id: string; user2_profile_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { conv_id: string }
        Returns: boolean
      }
      is_project_member: { Args: { p_project_id: string }; Returns: boolean }
      is_project_owner: { Args: { p_project_id: string }; Returns: boolean }
      is_user_premium: { Args: never; Returns: boolean }
      user_owns_profile: { Args: { p_profile_id: string }; Returns: boolean }
    }
    Enums: {
      agent_type:
        | "proprietario"
        | "engenheiro"
        | "desenvolvedor"
        | "certificadora"
        | "investidor"
        | "projeto"
        | "outro"
        | "comprador"
        | "auditor"
        | "financeira"
        | "advogado"
      project_stage:
        | "documentos"
        | "viabilidade"
        | "desenvolvimento"
        | "certificacao"
        | "auditoria"
        | "venda"
      stage_status: "pendente" | "em_andamento" | "concluida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_type: [
        "proprietario",
        "engenheiro",
        "desenvolvedor",
        "certificadora",
        "investidor",
        "projeto",
        "outro",
        "comprador",
        "auditor",
        "financeira",
        "advogado",
      ],
      project_stage: [
        "documentos",
        "viabilidade",
        "desenvolvimento",
        "certificacao",
        "auditoria",
        "venda",
      ],
      stage_status: ["pendente", "em_andamento", "concluida"],
    },
  },
} as const
