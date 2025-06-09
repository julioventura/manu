export interface CRMConfig {
  // Configurações de pipeline
  pipeline: {
    stages: {
      id: string;
      nome: string;
      ordem: number;
      corHex: string;
    }[];
    defaultStage: string;
  };
  
  // Configurações de notificação
  notifications: {
    enableReminders: boolean;
    reminderLeadTime: number; // horas antes de notificar
    notifyByEmail: boolean;
    notifyInApp: boolean;
  };
  
  // Configurações de fontes de leads
  leadSources: string[];
  
  // Configurações de segmentos
  segments: string[];
  
  // Configurações de tags predefinidas
  predefinedTags: string[];
}