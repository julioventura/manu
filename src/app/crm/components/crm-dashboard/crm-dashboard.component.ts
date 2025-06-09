// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { CrmService } from '../../services/crm.service';
import { ReminderService } from '../../services/reminder.service';
import { MaterialModule } from '../../../shared/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LegendPosition, LegendPosition as NgxLegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-crm-dashboard',
  templateUrl: './crm-dashboard.component.html',
  styleUrls: ['./crm-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MaterialModule,
    CurrencyPipe,
    DatePipe,
    NgxChartsModule
  ]
})
export class CrmDashboardComponent implements OnInit {
  isGenerating = false;
  isLoading = false;
  lembretesPendentes$: Observable<any[]>;
  lembretesAtrasados$: Observable<any[]>;
  
  // Métricas do dashboard
  metricas: any = {
    total: 47,
    byStatus: {
      'novo': 5,
      'qualificado': 8,
      'em_atendimento': 12,
      'follow_up': 7,
      'fechado_ganho': 15,
      'fechado_perdido': 7
    },
    bySource: {
      'Website': 12,
      'Indicação': 9,
      'Google': 8,
      'Facebook': 7,
      'Instagram': 11
    },
    valorPotencialTotal: 72500
  };
  
  // Dados para os gráficos
  statusChartData: any[] = [];
  sourceChartData: any[] = [];
  
  // Coleções disponíveis
  colecoes = [
    { id: 'pacientes', label: 'Pacientes', icone: 'person' },
    { id: 'dentistas', label: 'Dentistas', icone: 'medical_services' },
    { id: 'fornecedores', label: 'Fornecedores', icone: 'inventory' },
    { id: 'proteticos', label: 'Protéticos', icone: 'engineering' }
  ];
  
  // Adicione esta propriedade para definir a posição da legenda
  legendPosition: LegendPosition = NgxLegendPosition.Below;

  constructor(
    private crmService: CrmService,
    private reminderService: ReminderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.lembretesPendentes$ = of([]);
    this.lembretesAtrasados$ = of([]);
  }

  ngOnInit(): void {
    this.carregarMetricas();
    this.prepareChartData();
    
    // Verificar se já existem dados no pipeline
    this.crmService.getPipelineConfig().subscribe(config => {
      if (config) {
      } else {
      }
    });
  }
  
  prepareChartData(): void {
    // Para testes, criar dados fictícios
    this.statusChartData = [
      { name: 'Novo', value: 5 },
      { name: 'Qualificado', value: 8 },
      { name: 'Em Atendimento', value: 12 },
      { name: 'Fechado (Ganho)', value: 15 },
      { name: 'Fechado (Perdido)', value: 7 }
    ];
    
    this.sourceChartData = [
      { name: 'Website', value: 12 },
      { name: 'Indicação', value: 9 },
      { name: 'Google', value: 8 },
      { name: 'Facebook', value: 7 },
      { name: 'Instagram', value: 11 }
    ];
  }
  
  carregarMetricas(): void {
    // Sem implementação - usando dados mockados
  }

  generateTestData(): void {
    this.isGenerating = true;
    this.crmService.createTestData()
      .then(() => {
        this.snackBar.open('Dados de teste gerados com sucesso!', 'OK', {
          duration: 3000
        });
        this.isGenerating = false;
      })
      .catch(error => {
        console.error('Erro ao gerar dados de teste:', error);
        this.snackBar.open('Erro ao gerar dados de teste', 'OK', {
          duration: 3000
        });
        this.isGenerating = false;
      });
  }
  
  // Métodos adicionais para corrigir erros no template
  abrirPipeline(): void {
    this.router.navigate(['/crm/pipeline']);
  }
  
  abrirLeadsPorStatus(status: string): void {
    this.router.navigate(['/crm/pipeline'], { queryParams: { status } });
  }
  
  irParaColecao(colecaoId: string): void {
    this.router.navigate(['/list', colecaoId]);
  }
  
  marcarLembreteComoConcluido(lembrete: any): void {
    // Implementação futura com Firestore
  }

  voltar(){
    this.router.navigate(['/home']);
  }
}

