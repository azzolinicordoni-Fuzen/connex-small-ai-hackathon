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
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          id: string
          is_premium: boolean | null
          location: string | null
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean | null
          location?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean | null
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
      ],
    },
  },
} as const
