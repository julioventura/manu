import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';

interface ChartData {
  name: string;
  value: number;
}

interface SeriesData {
  name: string;
  series: ChartData[];
}

@Component({
  selector: 'app-crm-reports',
  templateUrl: './crm-reports.component.html',
  styleUrls: ['./crm-reports.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, NgxChartsModule]
})
export class CrmReportsComponent implements OnInit {
  // Dados de tendência ao longo do tempo
  timeTrendData: SeriesData[] = [];
  
  // Previsão de vendas
  forecastData: SeriesData[] = [];
  
  // Opções de gráficos
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  
  // Configurações dos gráficos
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Mês';
  yAxisLabel = 'Quantidade';
  
  constructor() { }
  
  ngOnInit(): void {
    this.generateMockReportData();
  }
  
  generateMockReportData(): void {
    // Simular dados de tendência dos últimos 6 meses
    this.timeTrendData = [
      {
        name: 'Novos Leads',
        series: [
          { name: 'Jan', value: 12 },
          { name: 'Fev', value: 18 },
          { name: 'Mar', value: 14 },
          { name: 'Abr', value: 22 },
          { name: 'Mai', value: 25 },
          { name: 'Jun', value: 30 }
        ]
      },
      {
        name: 'Fechados (Ganhos)',
        series: [
          { name: 'Jan', value: 5 },
          { name: 'Fev', value: 8 },
          { name: 'Mar', value: 6 },
          { name: 'Abr', value: 10 },
          { name: 'Mai', value: 13 },
          { name: 'Jun', value: 15 }
        ]
      }
    ];
    
    // Previsão para próximos 3 meses
    this.forecastData = [
      {
        name: 'Projeção de Receita',
        series: [
          { name: 'Jul', value: 35000 },
          { name: 'Ago', value: 42000 },
          { name: 'Set', value: 48000 }
        ]
      }
    ];
  }
}