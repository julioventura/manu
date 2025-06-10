import firebase from 'firebase/compat/app';

// Criar tipos específicos para Firestore Timestamp
type FirestoreTimestamp = {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
};

export interface Group {
  id?: string;
  name: string;
  description?: string;
  clinica?: string;
  adminIds: string[];
  memberIds: string[];
  createdAt?: firebase.firestore.Timestamp | Date;
  updatedAt?: firebase.firestore.Timestamp | Date;
  createdBy?: string;
}

// Interface para o campo de grupo que será adicionado aos registros
export interface GroupAccess {
  groupId: string;              // ID do grupo ao qual o registro pertence
  // Não precisamos adicionar createdBy pois já existe nos modelos como visto no crm.model.ts
}

// Adicione esta interface ao arquivo group.model.ts
export interface SharingMetadata {
  recordId: string;
  collection: string;
  groupId: string;
  sharedBy: string;
  sharedAt: firebase.firestore.Timestamp | Date | null;
  groupName?: string;
  canEdit?: boolean;
  canView?: boolean;
}

// Adicione isso ao arquivo group.model.ts existente
export interface GroupJoinRequest {
  id?: string;
  userId: string;
  userEmail?: string;
  groupId: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: firebase.firestore.Timestamp | Date;
  requestedAt?: firebase.firestore.Timestamp | Date;
  reviewedAt?: firebase.firestore.Timestamp | Date;
  reviewedBy?: string;
  responseMessage?: string;
}

// CORRIGIR: Remover any e usar tipos específicos
export interface FirestoreRecord {
  id?: string;
  createdAt?: firebase.firestore.Timestamp | Date;
  updatedAt?: firebase.firestore.Timestamp | Date;
  createdBy?: string;
  groupId?: string;
  [key: string]: unknown; // MUDANÇA: any -> unknown
}

// Interface para dados de usuário no contexto de grupos
export interface GroupUser {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date | FirestoreTimestamp;
  updatedAt: Date | FirestoreTimestamp;
  [key: string]: unknown; // MUDANÇA: any -> unknown
}

// Interface para estatísticas de grupos
export interface GroupStats {
  totalMembers: number;
  totalAdmins: number;
  sharedRecords: number;
  lastActivity: Date | FirestoreTimestamp;
  [key: string]: unknown; // MUDANÇA: any -> unknown
}

// Interface para registros de compartilhamento
export interface SharingHistoryItem {
  id?: string;
  action: 'shared' | 'unshared' | 'updated';
  groupId?: string | null;
  groupName?: string;
  userId: string;
  userEmail?: string;
  timestamp: firebase.firestore.Timestamp | Date;
  collection: string;
  recordId: string;
  recordName?: string;
  // ADICIONAR campos obrigatórios do SharingMetadata para compatibilidade
  sharedBy: string;
  sharedAt: firebase.firestore.Timestamp | Date | null;
  [key: string]: unknown; // MUDANÇA: any -> unknown
}

// CORRIGIR: Substituir 'any' por tipos específicos
export interface GroupMemberInfo {
  id: string;
  email?: string;
  displayName?: string;
  role: 'admin' | 'member';
  joinedAt?: firebase.firestore.Timestamp | Date;
  lastActive?: firebase.firestore.Timestamp | Date;
  permissions?: GroupPermissions;
}

export interface GroupActivity {
  id?: string;
  groupId: string;
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  timestamp: firebase.firestore.Timestamp | Date;
  metadata?: Record<string, unknown>;
}

// ADICIONAR: Interface para permissions
export interface GroupPermissions {
  canInvite?: boolean;
  canRemoveMembers?: boolean;
  canEditGroup?: boolean;
  canDeleteGroup?: boolean;
  canShareRecords?: boolean;
  canViewAllRecords?: boolean;
  canModifyRecords?: boolean;
}

// ADICIONAR: Interface para configurações do grupo
export interface GroupSettings {
  isPublic?: boolean;
  requireApproval?: boolean;
  allowMemberInvites?: boolean;
  maxMembers?: number;
  description?: string;
  rules?: string[];
}

// ADICIONAR: Interface estendida do Group com informações completas
export interface GroupWithDetails extends Group {
  memberCount?: number;
  adminCount?: number;
  isUserMember?: boolean;
  isUserAdmin?: boolean;
  pendingRequests?: number;
  settings?: GroupSettings;
  lastActivity?: firebase.firestore.Timestamp | Date;
}

// ADICIONAR: Interface para estatísticas do grupo
export interface GroupStatistics {
  totalMembers: number;
  totalAdmins: number;
  totalSharedRecords: number;
  activeMembers: number;
  recentActivity: number;
  createdThisMonth: number;
}

// ADICIONAR: Interface para resposta de operações
export interface GroupOperationResult {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

// ADICIONAR: Interface para filtros de busca
export interface GroupSearchFilters {
  name?: string;
  clinica?: string;
  isPublic?: boolean;
  hasAvailableSlots?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

// ADICIONAR: Tipos para status de convite
export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// ADICIONAR: Interface para convites
export interface GroupInvite {
  id?: string;
  groupId: string;
  groupName?: string;
  invitedBy: string;
  invitedByName?: string;
  invitedEmail: string;
  status: InviteStatus;
  message?: string;
  expiresAt?: firebase.firestore.Timestamp | Date;
  createdAt?: firebase.firestore.Timestamp | Date;
  respondedAt?: firebase.firestore.Timestamp | Date;
}