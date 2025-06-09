import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupService } from './group.service';
import { LoggingService } from '../../services/logging.service';
// Utilizar interface completa de grupo para consistência
import { Group } from './group.model';

@Component({
  selector: 'app-group-sharing',
  templateUrl: './group-sharing.component.html',
  styleUrls: ['./group-sharing.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class GroupSharingComponent implements OnInit, OnDestroy {
  @Input() recordGroupId: string | null = null;
  @Input() collection: string = '';
  @Input() recordId: string = '';
  @Output() groupIdChange = new EventEmitter<string | null>();

  groups: Group[] = [];
  isLoading = false;
  selectedGroupId: string | null = null;
  private destroy$ = new Subject<void>();
  
  // Use injection pattern for services
  private groupService = inject(GroupService);
  private snackBar = inject(MatSnackBar);
  private logger = inject(LoggingService);

  ngOnInit(): void {
    this.logger.log('GroupSharingComponent', 'Inicializando', { 
      collection: this.collection,
      recordId: this.recordId,
      initialGroupId: this.recordGroupId
    });

    this.selectedGroupId = this.recordGroupId;
    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGroups(): void {
    this.isLoading = true;
    this.groupService.getAllUserGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (groups) => {
          this.groups = groups;
          this.isLoading = false;
          this.logger.log('GroupSharingComponent', `${groups.length} grupos carregados`);
        },
        error: (error) => {
          this.isLoading = false;
          this.logger.error('GroupSharingComponent', 'Erro ao carregar grupos', error);
          this.snackBar.open('Erro ao carregar grupos disponíveis', 'OK', { duration: 3000 });
        }
      });
  }

  onGroupChange(groupId: string | null): void {
    this.logger.log('GroupSharingComponent', 'Grupo alterado', { 
      previous: this.recordGroupId,
      new: groupId 
    });
    this.groupIdChange.emit(groupId);
  }
}