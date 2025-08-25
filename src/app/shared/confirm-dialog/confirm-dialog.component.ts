import { Component, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

interface DialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ dialogData.title }}</h2>
    <mat-dialog-content>{{ dialogData.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ dialogData.cancelText }}</button>
      <button mat-button [mat-dialog-close]="true" color="primary">{{ dialogData.confirmText }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-actions { 
      margin-bottom: 10px; 
      justify-content: flex-end;
    }
  `]
})
export class ConfirmDialogComponent {
  dialogData: DialogData;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private injector: Injector
  ) {
    try {
      // Obter os dados via Injector em vez de usar @Inject
      const data = this.injector.get(MAT_DIALOG_DATA, null);
      this.dialogData = data || {
        title: 'Confirmação',
        message: 'Tem certeza?',
        confirmText: 'Sim',
        cancelText: 'Não'
      };
    } catch (e) {
      console.error('Erro ao obter dados do diálogo:', e);
      // Valores padrão como fallback
      this.dialogData = {
        title: 'Confirmação',
        message: 'Tem certeza?',
        confirmText: 'Sim',
        cancelText: 'Não'
      };
    }
  }
}