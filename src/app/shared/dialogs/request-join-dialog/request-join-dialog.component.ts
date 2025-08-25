import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-join-dialog',
  template: `
    <h2 mat-dialog-title>Solicitar Entrada no Grupo</h2>
    <mat-dialog-content>
      <p>Envie uma mensagem para os administradores do grupo (opcional):</p>
      <mat-form-field appearance="outline" style="width:100%">
        <textarea matInput [(ngModel)]="message" rows="4" placeholder="Ex: Gostaria de participar para acompanhar..."></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()">Enviar Solicitação</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class RequestJoinDialog {
  message: string = '';
  dialogRef = inject(MatDialogRef<RequestJoinDialog>);
  data = inject(MAT_DIALOG_DATA) as {groupId: string};

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close({ message: this.message });
  }
}