// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit, TemplateRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { CrmService } from '../../services/crm.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { MatChipsModule } from '@angular/material/chips';
import { PipelineConfig, PipelineStage } from '../../models/crm.model';

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
    MaterialModule,
    MatChipsModule
  ]
})
export class PipelineViewComponent implements OnInit {
  @ViewChild('leadDetailsDialog') leadDetailsDialog!: TemplateRef<any>;
  
  stageIds: string[] = [];
  stageLabels: {[key: string]: string} = {};
  pipeline: {[key: string]: any[]} = {};
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
    const testLeads = [
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
    
    // Distribuir leads pelos estágios
    testLeads.forEach(lead => {
      const status = lead.crmData.leadStatus;
      if (this.pipeline[status]) {
        this.pipeline[status].push(lead);
      }
    });
    
    this.isLoading = false;
  }

  drop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      // Update lead status
      const lead = event.container.data[event.currentIndex];
      const newStatus = event.container.id;
      
      this.crmService.updateCrmData(this.selectedCollection, lead.id, {
        ...lead.crmData,
        leadStatus: newStatus
      }).then(() => {
        this.snackBar.open('Status atualizado com sucesso', 'OK', {
          duration: 3000
        });
      }).catch(err => {
        this.snackBar.open('Erro ao atualizar status', 'OK', {
          duration: 3000
        });
      });
    }
  }

  onCollectionChange(): void {
    this.loadPipelineData();
  }

  viewRegistro(collection: string, id: string): void {
    this.router.navigate(['/crm/lead', collection, id]);
  }

  getBackgroundStyle(stageId: string): any {
    // Define colors com as mesmas chaves que testStages
    const colors: {[key: string]: string} = {
      'novo': '#e3f2fd',
      'qualificado': '#e8f5e9',
      'em_atendimento': '#fff8e1', 
      'fechado_ganho': '#e8eaf6',
      'fechado_perdido': '#ffebee'
    };
    
    return {
      'background-color': colors[stageId] || '#f5f5f5'
    };
  }

  // Novo método para abrir o popup de detalhes
  viewLeadDetails(lead: any): void {
    this.dialog.open(this.leadDetailsDialog, {
      data: lead,
      width: '500px',
      panelClass: 'lead-details-dialog'
    });
  }
}