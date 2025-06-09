// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';
import { of, from } from 'rxjs'; // ADICIONAR from para converter Promise em Observable
import { map, catchError, finalize } from 'rxjs/operators';

import { Group, GroupJoinRequest } from './group.model';
import { GroupService } from './group.service';

// Interfaces para tipagem
interface PatientRecord {
  id: string;
  nome?: string;
  email?: string;
  groupId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: string;
  [key: string]: unknown;
}

interface UserInfo {
  nomeUsuario: string;
  grupoSelecionado: string;
  quantidadeMembros: number;
  quantidadeAdmins: number;
  quantidadePacientes: number;
  isAdmin: boolean;
  isAdminDoGrupo: boolean;
  totalGrupos: number;
}

@Component({
  selector: 'app-group-manager',
  templateUrl: './group-manager.component.html',
  styleUrls: ['./group-manager.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatListModule,
    RouterModule,
    MatCardModule,
    MatSelectModule,
    MatTooltipModule
  ],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class GroupManagerComponent implements OnInit {
  // Propriedades principais
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  groupForm: FormGroup;
  isCreatingNewGroup: boolean = false;
  sharedPatients: PatientRecord[] = [];
  isLoadingPatients = false;
  
  // Propriedades da interface
  titulo_da_pagina = 'Grupos e Compartilhamentos';
  isLoading = false;
  joinRequests: GroupJoinRequest[] = [];
  showNewAdminField = false;
  showNewMemberField = false;
  adminInput = '';
  memberInput = '';
  
  // Propriedades do usuário
  userId: string | null = null;
  userEmail: string | null = null;
  isAdmin: boolean = false;
  isAdminOfSelectedGroup: boolean = false;
  selectedMembers: string[] = [];
  selectedAdmins: string[] = [];

  // Form controls
  adminInputControl = new FormControl('');
  memberInputControl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.groupForm = this.fb.group({
      name: [''],
      description: [''],
      clinica: [''],
      adminIds: [[]],
      memberIds: [[]]
    });
  }

  ngOnInit(): void {
    this.groupService.testFirestoreConnection().subscribe();
    this.loadGroups();
    this.loadJoinRequests();
    this.loadCurrentUser();
    this.createTestGroupIfNeeded();
  }

  // MÉTODO TEMPORÁRIO PARA DEBUG - REMOVER DEPOIS
  createTestGroupIfNeeded(): void {
    setTimeout(() => {
      if (this.groups.length === 0 && this.userId && this.userEmail) {
        console.log('GroupManager: Creating test group...');
        
        const testGroup = {
          name: 'Grupo de Teste',
          description: 'Grupo criado automaticamente para teste',
          clinica: 'Clínica Teste',
          adminIds: [this.userId, this.userEmail],
          memberIds: [this.userId, this.userEmail],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: this.userId
        };

        // CORRIGIDO: usar subscribe() em vez de then()
        this.groupService.createGroup(testGroup)
          .subscribe({
            next: () => {
              console.log('GroupManager: Test group created successfully');
              this.loadGroups(); // Recarregar grupos
            },
            error: (error) => {
              console.error('GroupManager: Error creating test group:', error);
            }
          });
      }
    }, 2000); // Aguardar 2 segundos para garantir que a autenticação foi completada
  }

  // ADD missing loadGroups method
  loadGroups(): void {
    this.isLoading = true;
    this.groupService.getAllUserGroups()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: groups => {
          this.groups = groups;
          if (this.groups.length === 0) {
            console.warn('[GroupManager] No groups were loaded for the current user.');
          }
        },
        error: error => {
          console.error('[GroupManager] Error loading groups:', error);
          this.groups = []; // Ensure groups is an empty array on error
        }
      });
  }

  // ADICIONAR métodos faltantes
  voltar(): void {
    this.router.navigate(['/']);
  }

  recarregar(): void {
    this.loadGroups();
    this.loadJoinRequests();
  }

  // CORRIGIR método loadCurrentUser para tratar Observable corretamente
  loadCurrentUser(): void {
    // Se getCurrentUser não existir no service, usar afAuth diretamente
    this.groupService.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.userEmail = user.email;
        this.isAdmin = false;
      } else {
        this.userId = null;
        this.userEmail = null;
        this.isAdmin = false;
      }
    });
  }

  loadJoinRequests(): void {
    this.groupService.getPendingJoinRequests().subscribe(requests => {
      this.joinRequests = requests;
    });
  }

  getGroupName(groupId: string): string {
    const group = this.groups.find(g => g.id === groupId);
    return group?.name || 'Grupo não encontrado';
  }

  // CORRIGIR métodos de aprovação/rejeição
  approveJoinRequest(request: GroupJoinRequest): void {
    if (!request.id) {
      this.snackBar.open('ID da solicitação não encontrado', 'OK', { duration: 3000 });
      return;
    }

    // CORRIGIDO: usar from() para converter Promise em Observable ou usar .then()
    from(this.groupService.approveJoinRequest(request.id))
      .subscribe({
        next: () => {
          this.snackBar.open('Solicitação aprovada com sucesso', 'OK', { duration: 3000 });
          this.loadJoinRequests();
          this.loadGroups();
        },
        error: (error) => {
          this.snackBar.open('Erro ao aprovar solicitação', 'OK', { duration: 3000 });
          console.error('Erro ao aprovar:', error);
        }
      });
  }

  rejectJoinRequest(request: GroupJoinRequest): void {
    if (!request.id) {
      this.snackBar.open('ID da solicitação não encontrado', 'OK', { duration: 3000 });
      return;
    }

    // CORRIGIDO: usar from() para converter Promise em Observable
    from(this.groupService.rejectJoinRequest(request.id))
      .subscribe({
        next: () => {
          this.snackBar.open('Solicitação rejeitada', 'OK', { duration: 3000 });
          this.loadJoinRequests();
        },
        error: (error) => {
          this.snackBar.open('Erro ao rejeitar solicitação', 'OK', { duration: 3000 });
          console.error('Erro ao rejeitar:', error);
        }
      });
  }

  createOrUpdateGroup(): void {
    if (this.groupForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'OK', { duration: 3000 });
      return;
    }

    const formData = this.groupForm.value;
    
    if (this.selectedGroup && this.selectedGroup.id) {
      // Atualizar grupo existente
      // CORRIGIDO: usar from() para converter Promise em Observable
      from(this.groupService.updateGroup(this.selectedGroup.id, formData))
        .subscribe({
          next: () => {
            this.snackBar.open('Grupo atualizado com sucesso', 'OK', { duration: 3000 });
            this.loadGroups();
          },
          error: (error) => {
            this.snackBar.open('Erro ao atualizar grupo', 'OK', { duration: 3000 });
            console.error('Erro ao atualizar:', error);
          }
        });
    } else {
      // Criar novo grupo - ESTE JÁ ESTÁ CORRETO se retorna Observable
      this.groupService.createGroup(formData)
        .subscribe({
          next: () => {
            this.snackBar.open('Grupo criado com sucesso', 'OK', { duration: 3000 });
            this.loadGroups();
            this.cancelNewGroup();
          },
          error: (error) => {
            this.snackBar.open('Erro ao criar grupo', 'OK', { duration: 3000 });
            console.error('Erro ao criar:', error);
          }
        });
    }
  }

  deleteSelectedGroup(): void {
    if (!this.selectedGroup) {
      this.snackBar.open('Nenhum grupo selecionado', 'OK', { duration: 3000 });
      return;
    }
    
    if (!this.selectedGroup.id) {
      this.snackBar.open('ID do grupo não encontrado', 'OK', { duration: 3000 });
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o grupo "${this.selectedGroup.name}"?`)) {
      // CORRIGIDO: usar from() para converter Promise em Observable
      from(this.groupService.deleteGroup(this.selectedGroup.id))
        .subscribe({
          next: () => {
            this.snackBar.open('Grupo excluído com sucesso', 'OK', { duration: 3000 });
            this.loadGroups();
            this.selectedGroup = null;
            this.sharedPatients = [];
          },
          error: (error) => {
            this.snackBar.open('Erro ao excluir grupo', 'OK', { duration: 3000 });
            console.error('Erro ao excluir:', error);
          }
        });
    }
  }

  requestToJoinGroup(group: Group | null): void {
    if (!group?.id) {
      this.snackBar.open('Grupo não selecionado ou inválido', 'OK', { duration: 3000 });
      return;
    }

    // FIX: Handle memberIds being possibly undefined
    if (this.userEmail && group.memberIds && group.memberIds.includes(this.userEmail)) {
      // Crie uma cópia do grupo sem o email na lista
      const updatedGroup = {...group};
      updatedGroup.memberIds = updatedGroup.memberIds ? updatedGroup.memberIds.filter(id => id !== this.userEmail) : [];
      
      // CORRIGIDO: usar from() para converter Promise em Observable
      from(this.groupService.updateGroup(group.id, updatedGroup))
        .subscribe({
          next: () => {
            this.snackBar.open('Você saiu do grupo com sucesso', 'OK', { duration: 3000 });
            this.selectedGroup = null;
            this.loadGroups();
          },
          error: (error) => {
            console.error('Erro ao sair do grupo:', error);
            this.snackBar.open('Erro ao sair do grupo', 'OK', { duration: 3000 });
          }
        });
    } else {
      // Request to join group
      const message = prompt('Digite uma mensagem para solicitar entrada no grupo (opcional):') || '';
      // CORRIGIDO: usar from() para converter Promise em Observable
      from(this.groupService.requestJoinGroup(group.id, message))
        .subscribe({
          next: () => {
            this.snackBar.open('Solicitação enviada com sucesso', 'OK', { duration: 3000 });
          },
          error: (error) => {
            console.error('Erro ao solicitar entrada:', error);
            this.snackBar.open('Erro ao solicitar entrada no grupo', 'OK', { duration: 3000 });
          }
        });
    }
  }

  // FIX: Method to load shared patients for selected group
  loadSharedPatients(): void {
    if (!this.selectedGroup?.id) {
      this.sharedPatients = [];
      return;
    }

    const selectedGroupId = this.selectedGroup.id;
    this.isLoadingPatients = true;
    
    this.groupService.getSharedRecords('pacientes')
      .pipe(
        map((patientsFromService: Record<string, unknown>[]) => {
          console.log('[GroupManager] All patients from service:', patientsFromService);
          
          // CORRIGIDO: Mover o .filter para dentro do parenteses da type assertion
          const filteredPatients = patientsFromService
            .filter((patient): patient is PatientRecord => 
              patient && 
              typeof patient === 'object' && 
              // CORRIGIDO: usar notação de colchetes para index signature
              typeof patient['id'] === 'string')
            .filter(patient => {
              const match = patient?.groupId === selectedGroupId;
              console.log(`[GroupManager] Patient ${patient?.nome || patient?.id}: groupId=${patient?.groupId}, selected=${selectedGroupId}, match=${match}`);
              return match;
            });
          
          console.log(`[GroupManager] Patients for selected group '${selectedGroupId}':`, filteredPatients);
          return filteredPatients;
        }),
        catchError(error => {
          console.error('[GroupManager] Error loading shared patients:', error);
          this.snackBar.open('Erro ao carregar pacientes do grupo', 'OK', { duration: 3000 });
          return of([]);
        }),
        finalize(() => {
          this.isLoadingPatients = false;
          console.log('[GroupManager] loadSharedPatients COMPLETE');
        })
      )
      .subscribe(finalPatients => {
        console.log('[GroupManager] Final patients for display:', finalPatients);
        this.sharedPatients = finalPatients || [];
      });
  }

  // Método para selecionar a grupo e carregar seus pacientes - REMOVE DUPLICATE
  selectGroup(group: Group): void {
    this.selectedGroup = group;
    this.isAdminOfSelectedGroup = this.isGroupAdmin(group);
    this.loadSharedPatients();
    
    // Popular o formulário com os dados do grupo selecionado para edição
    if (group) {
      this.groupForm.patchValue({
        name: group.name || '',
        description: group.description || '',
        clinica: group.clinica || '',
        adminIds: group.adminIds || [],
        memberIds: group.memberIds || []
      });
      
      this.selectedAdmins = group.adminIds || [];
      this.selectedMembers = group.memberIds || [];
    }
  }

  /**
   * Start adding a new admin
   */
  startAddingAdmin(): void {
    this.showNewAdminField = true;
    this.adminInput = '';
    this.adminInputControl.setValue('');
  }

  /**
   * Cancel adding a new admin
   */
  cancelAddAdmin(): void {
    this.showNewAdminField = false;
    this.adminInput = '';
    this.adminInputControl.setValue('');
  }

  /**
   * Confirm adding a new admin
   */
  confirmAddAdmin(): void {
    const adminEmail = this.adminInputControl.value || this.adminInput;
    
    if (!adminEmail || !adminEmail.trim()) {
      this.snackBar.open('Por favor, digite um email válido', 'OK', { duration: 3000 });
      return;
    }

    const trimmedEmail = adminEmail.trim();
    
    // Check if admin already exists
    if (this.selectedAdmins.includes(trimmedEmail)) {
      this.snackBar.open('Este administrador já foi adicionado', 'OK', { duration: 3000 });
      return;
    }

    // Add to the local arrays
    this.selectedAdmins.push(trimmedEmail);
    
    // Update form control
    this.groupForm.patchValue({
      adminIds: [...this.selectedAdmins]
    });

    // Reset input
    this.cancelAddAdmin();
    
    this.snackBar.open('Administrador adicionado', 'OK', { duration: 2000 });
  }

  /**
   * Remove an admin
   */
  removeAdmin(adminId: string): void {
    if (!adminId) return;
    
    // Remove from local array
    this.selectedAdmins = this.selectedAdmins.filter(id => id !== adminId);
    
    // Update form control
    this.groupForm.patchValue({
      adminIds: [...this.selectedAdmins]
    });
    
    this.snackBar.open('Administrador removido', 'OK', { duration: 2000 });
  }

  /**
   * Start adding a new member
   */
  startAddingMember(): void {
    this.showNewMemberField = true;
    this.memberInput = '';
    this.memberInputControl.setValue('');
  }

  /**
   * Cancel adding a new member
   */
  cancelAddMember(): void {
    this.showNewMemberField = false;
    this.memberInput = '';
    this.memberInputControl.setValue('');
  }

  /**
   * Confirm adding a new member
   */
  confirmAddMember(): void {
    const memberEmail = this.memberInputControl.value || this.memberInput;
    
    if (!memberEmail || !memberEmail.trim()) {
      this.snackBar.open('Por favor, digite um email válido', 'OK', { duration: 3000 });
      return;
    }

    const trimmedEmail = memberEmail.trim();
    
    // Check if member already exists
    if (this.selectedMembers.includes(trimmedEmail)) {
      this.snackBar.open('Este membro já foi adicionado', 'OK', { duration: 3000 });
      return;
    }

    // Add to the local arrays
    this.selectedMembers.push(trimmedEmail);
    
    // Update form control
    this.groupForm.patchValue({
      memberIds: [...this.selectedMembers]
    });

    // Reset input
    this.cancelAddMember();
    
    this.snackBar.open('Membro adicionado', 'OK', { duration: 2000 });
  }

  /**
   * Remove a member
   */
  removeMember(memberId: string): void {
    if (!memberId) return;
    
    // Remove from local array
    this.selectedMembers = this.selectedMembers.filter(id => id !== memberId);
    
    // Update form control
    this.groupForm.patchValue({
      memberIds: [...this.selectedMembers]
    });
    
    this.snackBar.open('Membro removido', 'OK', { duration: 2000 });
  }

  // Métodos auxiliares existentes...
  getUserName(userId?: string): string {
    if (!userId) return 'Usuário desconhecido';
    
    if (userId.includes('@')) {
      return userId;
    }
    
    return userId.length > 20 ? `${userId.substring(0, 20)}...` : userId;
  }

  getPatientName(patient: unknown): string {
    if (!patient || typeof patient !== 'object') {
      return 'Nome não disponível';
    }
    
    const patientObj = patient as PatientRecord;
    if (patientObj.nome && typeof patientObj.nome === 'string') {
      return patientObj.nome;
    }
    
    return 'Nome não disponível';
  }

  getPatientEmail(patient: unknown): string {
    if (!patient || typeof patient !== 'object') {
      return 'Email não disponível';
    }
    
    const patientObj = patient as PatientRecord;
    if (patientObj.email && typeof patientObj.email === 'string') {
      return patientObj.email;
    }
    
    return 'Email não disponível';
  }

  getPatientId(patient: unknown): string {
    if (!patient || typeof patient !== 'object') {
      return '';
    }
    
    const patientObj = patient as PatientRecord;
    return patientObj.id || '';
  }

  viewPatient(patient: unknown): void {
    if (!patient || typeof patient !== 'object') {
      return;
    }
    
    const patientObj = patient as PatientRecord;
    if (patientObj.id) {
      // Implementar navegação para visualizar paciente
      console.log('Visualizar paciente:', patientObj.id);
      this.router.navigate(['/view', 'pacientes', patientObj.id]);
    }
  }

  getFormattedDate(timestamp: unknown): string {
    if (!timestamp) return 'N/A';
    
    try {
      let date: Date;
      
      if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
        date = (timestamp as { toDate: () => Date }).toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'N/A';
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  }

  trackByPatientId(index: number, patient: PatientRecord): string | number {
    return patient?.id || index;
  }

  getDashboardInfo(): UserInfo {
    return {
      nomeUsuario: this.userEmail || 'Não autenticado',
      grupoSelecionado: this.selectedGroup?.name || 'Nenhum grupo selecionado',
      quantidadeMembros: this.selectedGroup?.memberIds?.length || 0,
      quantidadeAdmins: this.selectedGroup?.adminIds?.length || 0,
      quantidadePacientes: this.sharedPatients?.length || 0,
      isAdmin: this.isAdmin,
      isAdminDoGrupo: this.isAdminOfSelectedGroup,
      totalGrupos: this.groups?.length || 0
    };
  }

  // ADICIONAR método helper para resolver o cast do patient.createdBy
  getPatientCreatedBy(patient: unknown): string | undefined {
    if (!patient || typeof patient !== 'object') {
      return undefined;
    }
    
    const patientObj = patient as PatientRecord;
    return typeof patientObj.createdBy === 'string' ? patientObj.createdBy : undefined;
  }

  // Verificar se o método showNewGroupForm existe - SE NÃO EXISTIR, adicionar:
  showNewGroupForm(): void {
    this.isCreatingNewGroup = true;
    this.selectedGroup = null;
    this.resetForm();
  }

  // Verificar se o método resetForm existe - SE NÃO EXISTIR, adicionar:
  resetForm(): void {
    this.groupForm.reset();
    this.selectedMembers = [];
    this.selectedAdmins = [];
    this.groupForm.patchValue({
      name: '',
      description: '',
      clinica: '',
      adminIds: [],
      memberIds: []
    });
    this.isCreatingNewGroup = false;
    this.showNewAdminField = false;
    this.showNewMemberField = false;
    this.adminInput = '';
    this.memberInput = '';
    this.adminInputControl.setValue('');
    this.memberInputControl.setValue('');
  }

  cancelNewGroup(): void {
    this.isCreatingNewGroup = false;
    this.resetForm();
  }

  // ADICIONAR métodos faltantes para o template

  /**
   * Verificar se o usuário atual é admin do grupo especificado
   */
  isGroupAdmin(group: Group | null): boolean {
    if (!group || !this.userId || !this.userEmail) {
      return false;
    }
    
    const adminIds = group.adminIds || [];
    return adminIds.includes(this.userId) || adminIds.includes(this.userEmail);
  }

  /**
   * Verificar se o usuário atual é membro do grupo especificado
   */
  isMember(group: Group | null): boolean {
    if (!group || !this.userId || !this.userEmail) {
      return false;
    }
    
    const memberIds = group.memberIds || [];
    return memberIds.includes(this.userId) || memberIds.includes(this.userEmail);
  }

  /**
   * Verificar se o usuário pode editar o grupo (é admin do grupo)
   */
  canEditGroup(group: Group | null): boolean {
    return this.isGroupAdmin(group);
  }

  /**
   * Verificar se o usuário pode deletar o grupo (é admin do grupo)
   */
  canDeleteGroup(group: Group | null): boolean {
    return this.isGroupAdmin(group);
  }

  /**
   * Verificar se o usuário pode gerenciar membros do grupo (é admin do grupo)
   */
  canManageMembers(group: Group | null): boolean {
    return this.isGroupAdmin(group);
  }

  /**
   * Obter o status do usuário em relação ao grupo
   */
  getUserGroupStatus(group: Group | null): 'admin' | 'member' | 'none' {
    if (!group) return 'none';
    
    if (this.isGroupAdmin(group)) {
      return 'admin';
    } else if (this.isMember(group)) {
      return 'member';
    } else {
      return 'none';
    }
  }

  /**
   * Verificar se o usuário pode solicitar entrada no grupo
   */
  canRequestJoin(group: Group | null): boolean {
    if (!group || !this.userId || !this.userEmail) {
      return false;
    }
    
    // Não pode solicitar se já é membro ou admin
    return !this.isMember(group) && !this.isGroupAdmin(group);
  }

  /**
   * Verificar se o usuário pode sair do grupo
   */
  canLeaveGroup(group: Group | null): boolean {
    if (!group || !this.userId || !this.userEmail) {
      return false;
    }
    
    // Pode sair se é membro (incluindo admin)
    return this.isMember(group) || this.isGroupAdmin(group);
  }
}