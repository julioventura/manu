import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { GroupService } from './group.service';
import { GroupSharingService } from './group-sharing.service';
import { Group, SharingHistoryItem } from './group.model';
import { Subscription } from 'rxjs';

// Criar interfaces para tipagem
interface DialogData {
  collection: string;
  recordId: string;
  recordName?: string;
  currentGroupId?: string | null;
}

interface GroupOption {
  id: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-group-sharing-modal',
  templateUrl: './group-sharing-modal.component.html',
  styleUrls: ['./group-sharing-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatIconModule
  ]
})
export class GroupSharingModalComponent implements OnInit, OnDestroy {
  sharingForm: FormGroup;
  availableGroups: GroupOption[] = [];
  groups: GroupOption[] = []; // Para o template
  isLoading = false;
  isSaving = false;
  isProcessing = false; // Para o template
  loadingHistory = false; // Para o template

  sharingHistory: SharingHistoryItem[] = [];
  groupDetails: { [key: string]: Group } = {};

  private subscriptions: Subscription[] = [];

  // CORRIGIDO: Usar inject() sem decorators
  private groupService = inject(GroupService);
  private sharingService = inject(GroupSharingService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<GroupSharingModalComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as DialogData;
    this.data = data;
    this.sharingForm = this.fb.group({
      selectedGroupId: [this.data.currentGroupId || null]
    });
  }

  public data: DialogData;

  ngOnInit(): void {
    this.loadAvailableGroups();
    this.loadSharingHistory();
  }

  private loadAvailableGroups(): void {
    this.isLoading = true;

    const groupsSubscription = this.groupService.getAllUserGroups().subscribe({
      next: (groups: Group[]) => {
        this.availableGroups = groups.map(group => ({
          id: group.id!,
          name: group.name,
          description: group.description
        }));
        this.groups = this.availableGroups; // Sincronizar
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.snackBar.open('Erro ao carregar grupos', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });

    this.subscriptions.push(groupsSubscription);
  }

  private loadSharingHistory(): void {
    this.loadingHistory = true;

    const historySubscription = this.sharingService.loadSharingHistory(this.data.collection, this.data.recordId)
      .subscribe({
        next: (history: SharingHistoryItem[]) => {
          this.sharingHistory = history;

          const groupIds = history
            .map(item => item.groupId)
            .filter((id): id is string => typeof id === 'string' && id.length > 0);

          if (groupIds.length > 0) {
            this.loadGroupDetails(groupIds);
          }
          this.loadingHistory = false;
        },
        error: (error) => {
          console.error('Error loading sharing history:', error);
          this.loadingHistory = false;
        }
      });

    this.subscriptions.push(historySubscription);
  }

  private loadGroupDetails(groupIds: string[]): void {
    const detailsSubscription = this.sharingService.loadGroupDetails(groupIds).subscribe({
      next: (details) => {
        this.groupDetails = details;
      },
      error: (error) => {
        console.error('Error loading group details:', error);
      }
    });

    this.subscriptions.push(detailsSubscription);
  }

  // Métodos para o template
  onShare(): void {
    this.onSave();
  }

  onRemoveSharing(): void {
    this.sharingForm.patchValue({ selectedGroupId: null });
    this.onSave();
  }

  getGroupDisplayName(group: GroupOption): string {
    return group.description ? `${group.name} - ${group.description}` : group.name;
  }

  getFormattedDate(timestamp: unknown): string {
    return this.formatDate(timestamp);
  }

  onSave(): void {
    if (this.sharingForm.invalid) {
      return;
    }

    const selectedGroupId = this.sharingForm.value.selectedGroupId;

    this.isSaving = true;
    this.isProcessing = true;

    const saveSubscription = this.sharingService.handleRecordSharing(
      this.data.collection,
      this.data.recordId,
      selectedGroupId,
      this.data.currentGroupId || null
    ).subscribe({
      next: () => {
        this.snackBar.open('Compartilhamento atualizado com sucesso!', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error updating sharing:', error);
        this.snackBar.open('Erro ao atualizar compartilhamento', 'OK', { duration: 3000 });
        this.isSaving = false;
        this.isProcessing = false;
      }
    });

    this.subscriptions.push(saveSubscription);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getGroupName(groupId: string | null | undefined): string {
    if (!groupId) return 'Nenhum grupo';

    const group = this.groupDetails[groupId];
    return group?.name || 'Grupo não encontrado';
  }

  formatDate(timestamp: unknown): string {
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
      
      // CORRIGIDO: Indentação correta com 4 espaços para return e 6 para objeto
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
    case 'shared':
      return 'Compartilhado';
    case 'unshared':
      return 'Compartilhamento removido';
    case 'updated':
      return 'Atualizado';
    default:
      return action;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}