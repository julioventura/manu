export interface CRMData {
  // Campos de qualificação do lead
  leadStatus: 'novo' | 'qualificado' | 'em_atendimento' | 'follow_up' | 'concluido' | 'perdido';
  leadSource?: 'indicacao' | 'site' | 'redes_sociais' | 'google' | 'convenio' | 'outro';
  leadSourceDetail?: string; // Detalhes sobre a origem (ex: nome de quem indicou)
  
  // Campos de negócio
  valorPotencial?: number;
  probabilidade?: number; // 0-100%
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
  
  // Campos de contato
  dataUltimoContato?: Date;
  proximoContato?: Date;
  
  // Campos adicionais
  observacoesCRM?: string;
  segmento?: string;
  tags?: string[];
  
  // Metadados
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Interaction {
  id?: string;
  tipo: 'email' | 'telefone' | 'whatsapp' | 'presencial' | 'video' | 'outro';
  data: Date;
  assunto?: string;
  descricao: string;
  resultado?: string;
  followUpNecessario?: boolean;
  
  // Metadados
  createdBy: string; // ID do usuário que registrou
  createdAt: Date;
  updatedAt?: Date;
}

export interface Reminder {
  id?: string;
  titulo: string;
  descricao?: string;
  data: Date;
  concluido: boolean;
  notificar: boolean;
  notificacaoEnviada: boolean;
  associadoA?: {
    type: 'interaction' | 'appointment';
    id: string;
  };
  
  // Metadados
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PipelineStage {
  id: string;
  nome: string;
  ordem: number;
  corHex: string;
}

export interface PipelineConfig {
  stages: PipelineStage[];
  isActive: boolean;
}