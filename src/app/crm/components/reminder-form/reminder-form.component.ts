import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReminderService } from '../../services/reminder.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Define an interface for the reminder object
export interface Reminder {
  id?: string;
  titulo: string;
  data: Date; // Should be a Date object
  descricao: string;
  concluido: boolean;
}

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ editMode ? 'Editar Lembrete' : 'Novo Lembrete' }}</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Título</mat-label>
          <input matInput formControlName="titulo" placeholder="Título do lembrete">
        </mat-form-field>
        
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Data</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="data">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="descricao" rows="3"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          {{ editMode ? 'Atualizar' : 'Adicionar' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class ReminderFormComponent implements OnInit {
  @Input() parentPath: string = '';
  @Input() parentId: string = '';
  @Input() editMode: boolean = false;
  @Input() reminder: Reminder | null = null;
  
  form: FormGroup;
  dialogRef = inject(MatDialogRef<ReminderFormComponent>);
  dialogData = inject(MAT_DIALOG_DATA, {optional: true});
  
  constructor(
    private fb: FormBuilder,
    private reminderService: ReminderService
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      data: [new Date(), Validators.required],
      descricao: [''],
      concluido: [false]
    });
  }
  
  ngOnInit(): void {
    // Get data from dialog if provided
    if (this.dialogData) {
      this.parentPath = this.dialogData.parentPath || this.parentPath;
      this.parentId = this.dialogData.parentId || this.parentId;
      this.editMode = this.dialogData.editMode || this.editMode;
      this.reminder = this.dialogData.reminder || this.reminder;
    }

    if (this.editMode && this.reminder) {
      this.form.patchValue({
        titulo: this.reminder.titulo,
        data: this.reminder.data, // No longer need to call toDate()
        descricao: this.reminder.descricao,
        concluido: this.reminder.concluido || false
      });
    }
  }
  
  onSubmit(): void {
    if (this.form.valid) {
      const reminderData = {
        ...this.form.value,
        parentPath: this.parentPath + '/' + this.parentId
      };
      
      if (this.editMode && this.reminder && this.reminder.id) { // Check for reminder.id
        this.reminderService.updateReminder(this.parentPath, this.parentId, this.reminder.id, reminderData)
          .then(() => this.dialogRef.close(true));
      } else {
        this.reminderService.addReminder(this.parentPath, this.parentId, reminderData)
          .then(() => this.dialogRef.close(true));
      }
    }
  }
}