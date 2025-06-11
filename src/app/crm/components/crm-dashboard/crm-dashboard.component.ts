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

// Interfaces para tipagem
interface MetricData {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  valorPotencialTotal: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface LembreteData {
  id: string;
  titulo: string;
  descricao?: string;
  data: Date;
  concluido: boolean;
}

// ADICIONAR: Interface para tipos de data do Firestore
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

// ADICIONAR: Union type para os tipos de data possíveis
type DateLike = Date | FirestoreTimestamp | string | number | null | undefined;

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
  lembretesPendentes$: Observable<LembreteData[]>; // CORRIGIDO: tipo específico
  lembretesAtrasados$: Observable<LembreteData[]>; // CORRIGIDO: tipo específico
  
  // Métricas do dashboard
  metricas: MetricData = { // CORRIGIDO: tipo específico
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
      'Instagram': 11 }
    ,
    valorPotencialTotal: 72500
  };
  
  // Dados para os gráficos
  statusChartData: ChartData[] = []; // CORRIGIDO: tipo específico
  sourceChartData: ChartData[] = []; // CORRIGIDO: tipo específico
  
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
        // Dados existem
      } else {
        // Dados não existem
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
  
  marcarLembreteComoConcluido(lembrete: LembreteData): void { // CORRIGIDO: tipo específico
    // Implementação futura com Firestore
    console.log('Concluindo lembrete:', lembrete.id);
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }

  // CORRIGIDO: Método helper para converter Timestamp/Date com tipagem específica
  getDateFromTimestamp(data: DateLike): Date {
    if (!data) {
      return new Date();
    }
    
    // Se já é uma instância de Date
    if (data instanceof Date) {
      return data;
    }
    
    // Se é um Timestamp do Firestore com método toDate
    if (data && typeof data === 'object' && 'toDate' in data && typeof data.toDate === 'function') {
      try {
        return data.toDate();
      } catch (error) {
        console.error('Erro ao converter Timestamp:', error);
        return new Date();
      }
    }
    
    // Se é um objeto com seconds (Firestore Timestamp serializado)
    if (data && typeof data === 'object' && 'seconds' in data && typeof data.seconds === 'number') {
      try {
        return new Date(data.seconds * 1000);
      } catch (error) {
        console.error('Erro ao converter timestamp serializado:', error);
        return new Date();
      }
    }
    
    // Se é um objeto com nanoseconds (Firestore Timestamp completo)
    if (data && typeof data === 'object' && 'nanoseconds' in data && 'seconds' in data) {
      try {
        const timestamp = data as FirestoreTimestamp;
        return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      } catch (error) {
        console.error('Erro ao converter timestamp com nanoseconds:', error);
        return new Date();
      }
    }
    
    // Se é string ou number
    if (typeof data === 'string' || typeof data === 'number') {
      try {
        return new Date(data);
      } catch (error) {
        console.error('Erro ao converter data string/number:', error, data);
        return new Date();
      }
    }
    
    // Fallback: retornar data atual
    console.warn('Tipo de data não reconhecido:', typeof data, data);
    return new Date();
  }
}

