import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabela-referencia-dialog',
  standalone: true, // Tornando-o um componente standalone
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <mat-dialog-content>
      <div [innerHTML]="tabelaHTML"></div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`

    .mat-dialog-content {
      max-height: 80vh;
      overflow-y: auto;
    }

    :host ::ng-deep h3 {
        color: #2A7AC3;
        font-size: 24px;
        font-weight: 500;
    }

    :host ::ng-deep table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    
    :host ::ng-deep th, :host ::ng-deep td {
      border: 1px solid  #2A7AC3;
      padding: 8px;
      text-align: left;
      background-color: #eee;
    }
    
    :host ::ng-deep th {
      background-color: #2A7AC3;
      color: white;
      font-weight: 500;
    }
    
    :host ::ng-deep tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  `]
})
export class TabelaReferenciaDialogComponent {
  tabelaHTML: string = '';
}