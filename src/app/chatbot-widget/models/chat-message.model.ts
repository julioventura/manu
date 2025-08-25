export interface ChatMessage {
  id?: string;           // ID do documento no Firestore
  content: string;       // Conteúdo da mensagem 
  role: 'user' | 'bot';  // Quem enviou a mensagem
  timestamp: number;     // Timestamp para ordenação
  createdAt?: Date;      // Data de criação (para filtragem)
}