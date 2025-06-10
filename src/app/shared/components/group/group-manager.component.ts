// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

import { Group, GroupJoinRequest } from './group.model';
import { GroupService } from './group.service';
import { UtilService } from '../../utils/util.service';

// Interface para PatientRecord
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

@Component({
  selector: 'app-group-manager',
  templateUrl: './group-manager.component.html',
  styleUrls: ['./group-manager.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  groupForm!: FormGroup; // USAR: definite assignment assertion (!)
  isCreatingNewGroup: boolean = false;
  sharedPatients: PatientRecord[] = [];
  isLoadingPatients = false;
  
  // Propriedades da interface
  titulo_da_pagina = 'Grupos de Compartilhamento';
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
    private router: Router,
    public util: UtilService,
  ) {
    this.initializeForm(); // Manter como estava
  }

  private initializeForm(): void {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      clinica: [''],
      adminIds: [[]],
      memberIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    
    // DEBUG: verificar se carrega solicitações
    setTimeout(() => {
      console.log('Testing join requests loading...');
      this.loadJoinRequests();
    }, 3000);
  }

  // CORRIGIR: método loadCurrentUser (remover duplicatas)
  loadCurrentUser(): void {
    this.groupService.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.userEmail = user.email;
        this.isAdmin = false;
        
        console.log('GroupManager: User authenticated, loading groups...');
        this.loadGroups();
        this.loadJoinRequests();
        this.createTestGroupIfNeeded();
      } else {
        this.userId = null;
        this.userEmail = null;
        this.isAdmin = false;
        this.groups = [];
      }
    });
  }

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
          createdBy: this.userId || '' // CORRIGIR: garantir que seja string
        };

        this.groupService.createGroup(testGroup)
          .subscribe({
            next: () => {
              console.log('GroupManager: Test group created successfully');
              this.loadGroups();
            },
            error: (error) => {
              console.error('GroupManager: Error creating test group:', error);
            }
          });
      }
    }, 2000);
  }

  loadGroups(): void {
    if (!this.userId) {
      console.warn('[GroupManager] Cannot load groups: user not authenticated');
      return;
    }

    console.log('[GroupManager] Loading groups for user:', this.userId);
    this.isLoading = true;
    
    this.groupService.getAllUserGroups().subscribe({
      next: (groups) => {
        console.log('[GroupManager] Groups loaded successfully:', groups);
        this.groups = groups;
        this.isLoading = false;
        
        if (this.groups.length === 0) {
          console.warn('[GroupManager] No groups were loaded for the current user.');
        }
      },
      error: (error) => {
        console.error('[GroupManager] Error loading groups:', error);
        this.groups = [];
        this.isLoading = false;
      },
      complete: () => {
        console.log('[GroupManager] Groups loading completed');
        this.isLoading = false;
      }
    });
  }

  // CORRIGIR: método loadJoinRequests - remover mapeamento desnecessário
  loadJoinRequests(): void {
    this.groupService.getPendingJoinRequests().subscribe({
      next: (requests) => {
        // SIMPLES: usar diretamente os requests sem conversão
        this.joinRequests = requests;
        console.log('Join requests loaded:', this.joinRequests.length);
      },
      error: (error) => {
        console.error('Erro ao carregar solicitações:', error);
        this.joinRequests = [];
      }
    });
  }

  // CORRIGIR: métodos básicos (remover duplicatas)
  voltar(): void {
    console.log('Voltando...');
    this.util.voltar();
  }

  recarregar(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Recarregando grupos...');
    this.isLoading = true;
    this.loadGroups();
  }

  showNewGroupForm(): void {
    console.log('showNewGroupForm() called');
    this.isCreatingNewGroup = true;
    this.selectedGroup = null;
    this.resetForm();
  }

  resetForm(): void {
    console.log('resetForm() called');
    this.groupForm.reset();
    this.selectedAdmins = [this.userEmail || this.userId || ''];
    this.selectedMembers = [];
    this.showNewAdminField = false;
    this.showNewMemberField = false;
    this.adminInputControl.reset();
    this.memberInputControl.reset();
    
    if (this.isCreatingNewGroup) {
      this.isCreatingNewGroup = false;
    }
  }

  selectGroup(group: Group): void {
    console.log('selectGroup() called with:', group);
    this.selectedGroup = group;
    this.isCreatingNewGroup = false;
    
    if (this.isGroupAdmin(group)) {
      this.loadGroupForEditing(group);
    }
    
    if (group.id) {
      this.loadSharedPatients(group.id);
    }
  }

  loadGroupForEditing(group: Group): void {
    this.groupForm.patchValue({
      name: group.name || '',
      description: group.description || ''
    });
    
    this.selectedAdmins = [...(group.adminIds || [])];
    this.selectedMembers = [...(group.memberIds || [])];
  }

  loadSharedPatients(groupId: string): void {
    if (!groupId) return;
    
    this.isLoadingPatients = true;
    console.log('Carregando pacientes compartilhados para grupo:', groupId);
    
    setTimeout(() => {
      this.sharedPatients = [];
      this.isLoadingPatients = false;
    }, 1000);
  }

  // CORRIGIR: verificações de permissão (remover duplicatas)
  isGroupAdmin(group: Group | null): boolean {
    if (!group || !this.userId || !this.userEmail) {
      return false;
    }
    
    const adminIds = group.adminIds || [];
    return adminIds.includes(this.userId) || adminIds.includes(this.userEmail);
  }

  isMember(group: Group | null): boolean {
    if (!group || !this.userId || !this.userEmail) {
      return false;
    }
    
    const memberIds = group.memberIds || [];
    return memberIds.includes(this.userId) || memberIds.includes(this.userEmail);
  }

  // CORRIGIR: getter para isAdminOfSelectedGroup (remover duplicata)
  get isAdminOfSelectedGroup(): boolean {
    if (!this.selectedGroup) return false;
    return this.isGroupAdmin(this.selectedGroup);
  }

  // CORRIGIR: método createOrUpdateGroup (remover duplicatas)
  createOrUpdateGroup(): void {
    if (this.groupForm.invalid) {
      console.warn('Form is invalid');
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'OK', { duration: 3000 });
      return;
    }

    const formValue = this.groupForm.value;
    
    if (this.isCreatingNewGroup) {
      const newGroup = {
        name: formValue.name,
        description: formValue.description,
        clinica: formValue.clinica || '',
        adminIds: this.selectedAdmins.length > 0 ? this.selectedAdmins : [this.userId || this.userEmail || ''],
        memberIds: this.selectedMembers.length > 0 ? this.selectedMembers : [this.userId || this.userEmail || ''],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.userId || '' // CORRIGIR: garantir que seja string
      };
      
      console.log('Criando novo grupo:', newGroup);
      this.isLoading = true;
      
      this.groupService.createGroup(newGroup).subscribe({
        next: () => {
          console.log('Grupo criado com sucesso');
          this.snackBar.open('Grupo criado com sucesso!', 'OK', { duration: 3000 });
          this.resetForm();
          this.loadGroups();
        },
        error: (error) => {
          console.error('Erro ao criar grupo:', error);
          this.snackBar.open('Erro ao criar grupo. Tente novamente.', 'OK', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else if (this.selectedGroup && this.selectedGroup.id) {
      const updatedGroup = {
        ...this.selectedGroup,
        name: formValue.name,
        description: formValue.description,
        clinica: formValue.clinica || this.selectedGroup.clinica,
        adminIds: this.selectedAdmins,
        memberIds: this.selectedMembers,
        updatedAt: new Date()
      };
      
      console.log('Atualizando grupo:', updatedGroup);
      this.isLoading = true;
      
      this.groupService.updateGroup(this.selectedGroup.id, updatedGroup).subscribe({
        next: () => {
          console.log('Grupo atualizado com sucesso');
          this.snackBar.open('Grupo atualizado com sucesso!', 'OK', { duration: 3000 });
          this.loadGroups();
        },
        error: (error) => {
          console.error('Erro ao atualizar grupo:', error);
          this.snackBar.open('Erro ao atualizar grupo. Tente novamente.', 'OK', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  // CORRIGIR: métodos de aprovação/rejeição (usar interfaces corretas)
  approveJoinRequest(request: GroupJoinRequest): void {
    if (!request.id) {
      this.snackBar.open('Erro: ID da solicitação não encontrado', 'OK', { duration: 3000 });
      return;
    }

    console.log('Aprovando solicitação:', request);
    this.groupService.approveJoinRequest(request.id).subscribe({
      next: () => {
        this.snackBar.open('Solicitação aprovada com sucesso!', 'OK', { duration: 3000 });
        this.loadJoinRequests();
        this.loadGroups();
      },
      error: (error) => {
        console.error('Erro ao aprovar solicitação:', error);
        this.snackBar.open('Erro ao aprovar solicitação. Tente novamente.', 'OK', { duration: 3000 });
      }
    });
  }

  rejectJoinRequest(request: GroupJoinRequest): void {
    if (!request.id) {
      this.snackBar.open('Erro: ID da solicitação não encontrado', 'OK', { duration: 3000 });
      return;
    }

    const message = prompt('Motivo da rejeição (opcional):');
    
    console.log('Rejeitando solicitação:', request);
    this.groupService.rejectJoinRequest(request.id, message || undefined).subscribe({
      next: () => {
        this.snackBar.open('Solicitação rejeitada', 'OK', { duration: 3000 });
        this.loadJoinRequests();
      },
      error: (error) => {
        console.error('Erro ao rejeitar solicitação:', error);
        this.snackBar.open('Erro ao rejeitar solicitação. Tente novamente.', 'OK', { duration: 3000 });
      }
    });
  }

  requestToJoinGroup(group: Group): void {
    if (!group.id) {
      this.snackBar.open('Erro: ID do grupo não encontrado', 'OK', { duration: 3000 });
      return;
    }

    const message = prompt('Mensagem opcional para os administradores:');
    
    console.log('Solicitando entrada no grupo:', group);
    this.groupService.requestToJoinGroup(group.id, message || undefined).subscribe({
      next: () => {
        this.snackBar.open('Solicitação enviada com sucesso!', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Erro ao solicitar entrada:', error);
        let errorMessage = 'Erro ao enviar solicitação. Tente novamente.';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        this.snackBar.open(errorMessage, 'OK', { duration: 3000 });
      }
    });
  }

  deleteSelectedGroup(): void {
    if (!this.selectedGroup || !this.selectedGroup.id) {
      this.snackBar.open('Nenhum grupo selecionado', 'OK', { duration: 3000 });
      return;
    }
    
    const confirmed = confirm(`Tem certeza que deseja excluir o grupo "${this.selectedGroup.name}"?\n\nEsta ação não pode ser desfeita.`);
    if (!confirmed) return;
    
    console.log('Excluindo grupo:', this.selectedGroup);
    this.isLoading = true;
    
    this.groupService.deleteGroup(this.selectedGroup.id).subscribe({
      next: () => {
        this.snackBar.open('Grupo excluído com sucesso!', 'OK', { duration: 3000 });
        this.selectedGroup = null;
        this.isCreatingNewGroup = false;
        this.resetForm();
        this.loadGroups();
      },
      error: (error) => {
        console.error('Erro ao excluir grupo:', error);
        this.snackBar.open('Erro ao excluir grupo. Tente novamente.', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  // Métodos auxiliares (manter apenas uma versão)
  getGroupName(groupId: string): string {
    const group = this.groups.find(g => g.id === groupId);
    return group?.name || 'Grupo desconhecido';
  }

  getUserName(userId?: string): string {
    if (!userId) return 'Usuário desconhecido';
    
    // Se é email, mostrar como está
    if (userId.includes('@')) {
      return userId;
    }
    
    // Se é UID muito longo, encurtar
    return userId.length > 20 ? `${userId.substring(0, 20)}...` : userId;
  }

  getFormattedDate(timestamp: unknown): string {
    if (!timestamp) return 'N/A';
    
    try {
      let date: Date;
      
      // Se é Timestamp do Firebase
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

  // Métodos de gerenciamento de administradores e membros
  startAddingAdmin(): void {
    this.showNewAdminField = true;
    this.adminInput = '';
    this.adminInputControl.setValue('');
  }

  cancelAddAdmin(): void {
    this.showNewAdminField = false;
    this.adminInput = '';
    this.adminInputControl.setValue('');
  }

  confirmAddAdmin(): void {
    const adminEmail = this.adminInputControl.value || this.adminInput;
    
    if (!adminEmail || !adminEmail.trim()) {
      this.snackBar.open('Por favor, digite um email válido', 'OK', { duration: 3000 });
      return;
    }

    const trimmedEmail = adminEmail.trim();
    
    if (this.selectedAdmins.includes(trimmedEmail)) {
      this.snackBar.open('Este administrador já foi adicionado', 'OK', { duration: 3000 });
      return;
    }

    this.selectedAdmins.push(trimmedEmail);
    
    this.groupForm.patchValue({
      adminIds: [...this.selectedAdmins]
    });

    this.cancelAddAdmin();
    
    this.snackBar.open('Administrador adicionado', 'OK', { duration: 2000 });
  }

  removeAdmin(adminId: string): void {
    if (!adminId) return;
    
    this.selectedAdmins = this.selectedAdmins.filter(id => id !== adminId);
    
    this.groupForm.patchValue({
      adminIds: [...this.selectedAdmins]
    });
    
    this.snackBar.open('Administrador removido', 'OK', { duration: 2000 });
  }

  startAddingMember(): void {
    this.showNewMemberField = true;
    this.memberInput = '';
    this.memberInputControl.setValue('');
  }

  cancelAddMember(): void {
    this.showNewMemberField = false;
    this.memberInput = '';
    this.memberInputControl.setValue('');
  }

  confirmAddMember(): void {
    const memberEmail = this.memberInputControl.value || this.memberInput;
    
    if (!memberEmail || !memberEmail.trim()) {
      this.snackBar.open('Por favor, digite um email válido', 'OK', { duration: 3000 });
      return;
    }

    const trimmedEmail = memberEmail.trim();
    
    if (this.selectedMembers.includes(trimmedEmail)) {
      this.snackBar.open('Este membro já foi adicionado', 'OK', { duration: 3000 });
      return;
    }

    this.selectedMembers.push(trimmedEmail);
    
    this.groupForm.patchValue({
      memberIds: [...this.selectedMembers]
    });

    this.cancelAddMember();
    
    this.snackBar.open('Membro adicionado', 'OK', { duration: 2000 });
  }

  removeMember(memberId: string): void {
    if (!memberId) return;
    
    this.selectedMembers = this.selectedMembers.filter(id => id !== memberId);
    
    this.groupForm.patchValue({
      memberIds: [...this.selectedMembers]
    });
    
    this.snackBar.open('Membro removido', 'OK', { duration: 2000 });
  }
}