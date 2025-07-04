// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit, TemplateRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { CrmService } from '../../services/crm.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import firebase from 'firebase/compat/app';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  crmData?: {
    leadStatus: string;
    leadSource?: string;
    valorPotencial?: number;
    dataCadastro?: Date | firebase.firestore.Timestamp; // Can be a Date or a Firestore Timestamp
    observacoes?: string;
    tags?: string[];
  };
}

@Component({
  selector: 'app-pipeline-view',
  templateUrl: './pipeline-view.component.html',
  styleUrls: ['./pipeline-view.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    DragDropModule, 
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ]
})
export class PipelineViewComponent implements OnInit {
  @ViewChild('leadDetailsDialog') leadDetailsDialog!: TemplateRef<Lead>;
  
  stageIds: string[] = [];
  stageLabels: {[key: string]: string} = {};
  pipeline: {[key: string]: Lead[]} = {};
  isLoading = true;
  selectedCollection = 'pacientes';
  collections = [
    { id: 'pacientes', label: 'Pacientes' },
    { id: 'dentistas', label: 'Dentistas' },
    { id: 'fornecedores', label: 'Fornecedores' },
    { id: 'proteticos', label: 'Protéticos' }
  ];

  constructor(
    private crmService: CrmService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadPipelineData();
  }

  loadPipeline(): void {
    this.loadPipelineData();
  }

  loadPipelineData(): void {
    
    // Usar dados de teste direto, sem depender do Firestore
    const testStages: Record<string, {label: string, order: number, color: string}> = {
      'novo': { label: 'Novo', order: 0, color: '#e3f2fd' },
      'qualificado': { label: 'Qualificado', order: 1, color: '#e8f5e9' },
      'em_atendimento': { label: 'Em Atendimento', order: 2, color: '#fff8e1' },
      'fechado_ganho': { label: 'Fechado (Ganho)', order: 3, color: '#e8eaf6' },
      'fechado_perdido': { label: 'Fechado (Perdido)', order: 4, color: '#ffebee' }
    };
    
    // Configurar estágios
    this.stageIds = Object.keys(testStages);
    this.stageLabels = {};
    this.pipeline = {};
    
    // Inicializar pipeline
    this.stageIds.forEach(stageId => {
      this.pipeline[stageId] = [];
      this.stageLabels[stageId] = testStages[stageId].label;
    });
    
    // Gerar dados de teste para o pipeline
    const testLeads: Lead[] = [
      {
        id: 'test1',
        nome: 'Maria Silva',
        email: 'maria.silva@example.com',
        telefone: '(11) 98765-4321',
        crmData: {
          leadStatus: 'novo',
          leadSource: 'Website',
          valorPotencial: 2500
        }
      },
      {
        id: 'test2',
        nome: 'João Oliveira',
        email: 'joao.oliveira@example.com',
        telefone: '(11) 91234-5678',
        crmData: {
          leadStatus: 'qualificado',
          leadSource: 'Indicação',
          valorPotencial: 5000
        }
      },
      {
        id: 'test3',
        nome: 'Ana Souza',
        email: 'ana.souza@example.com',
        telefone: '(11) 99876-5432',
        crmData: {
          leadStatus: 'em_atendimento',
          leadSource: 'Google',
          valorPotencial: 3200
        }
      },
      {
        id: 'test4',
        nome: 'Carlos Mendes',
        email: 'carlos.mendes@example.com',
        telefone: '(11) 97654-3210',
        crmData: {
          leadStatus: 'fechado_ganho',
          leadSource: 'Facebook',
          valorPotencial: 4800
        }
      },
      {
        id: 'test5',
        nome: 'Patrícia Lima',
        email: 'patricia.lima@example.com',
        telefone: '(11) 98877-6655',
        crmData: {
          leadStatus: 'fechado_perdido',
          leadSource: 'Instagram',
          valorPotencial: 1800
        }
      }
    ];

    // Simular a distribuição de leads nas fases do pipeline
    testLeads.forEach(lead => {
      if (lead.crmData && this.pipeline[lead.crmData.leadStatus]) {
        this.pipeline[lead.crmData.leadStatus].push(lead);
      }
    });

    this.isLoading = false;
  }

  onCollectionChange(): void {
    this.loadPipelineData();
  }

  drop(event: CdkDragDrop<Lead[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const lead = event.previousContainer.data[event.previousIndex];
      const newStage = event.container.id;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.crmService.updateLeadStatus(this.selectedCollection, lead.id, newStage)
        .then(() => {
          this.snackBar.open('Status do lead atualizado com sucesso!', 'Fechar', { duration: 3000 });
        })
        .catch(err => {
          console.error('Erro ao atualizar status do lead:', err);
          this.snackBar.open('Erro ao atualizar status do lead.', 'Fechar', { duration: 3000 });
          // Reverter a alteração em caso de erro
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        });
    }
  }

  viewRegistro(collection: string, id: string): void {
    this.router.navigate(['/view', collection, id]);
  }

  getBackgroundStyle(stageId: string): { [key: string]: string } {
    const stageColors: {[key: string]: string} = {
      'novo': '#e3f2fd',
      'qualificado': '#e8f5e9',
      'em_atendimento': '#fff8e1',
      'fechado_ganho': '#e8eaf6',
      'fechado_perdido': '#ffebee'
    };
    return { 'background-color': stageColors[stageId] || '#fafafa' };
  }

  viewLeadDetails(lead: Lead): void {
    this.dialog.open(this.leadDetailsDialog, {
      width: '500px',
      data: lead
    });
  }
}