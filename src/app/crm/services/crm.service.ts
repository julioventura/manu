// Alteração: remoção de logs de depuração (console.log)
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { CRMData, PipelineConfig, PipelineStage } from '../models/crm.model';
import { CRMConfig } from '../models/crm-config.model';

// Define an interface for the metrics response
interface CrmMetrics {
  total: number;
  byStatus: { [key: string]: number };
  bySource: { [key: string]: number };
  valorPotencialTotal: number;
}

// Create a local interface that matches how we're using the data
interface LocalPipelineConfig {
  isActive: boolean;
  stages: {
    [key: string]: {
      label: string;
      order: number;
      color: string;
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  // Use the local interface for our default config
  defaultPipelineConfig: LocalPipelineConfig = {
    isActive: true,
    stages: {
      'novo': {
        label: 'Novo',
        order: 0,
        color: '#e3f2fd'
      },
      'qualificado': {
        label: 'Qualificado',
        order: 1,
        color: '#e8f5e9'
      },
      'em_atendimento': {
        label: 'Em Atendimento',
        order: 2,
        color: '#fff8e1'
      },
      'fechado_ganho': {
        label: 'Fechado (Ganho)',
        order: 3,
        color: '#e8eaf6'
      },
      'fechado_perdido': {
        label: 'Fechado (Perdido)',
        order: 4,
        color: '#ffebee'
      }
    }
  };

  constructor(private firestore: AngularFirestore) { }

  // Obter dados de CRM para um registro específico
  getCrmData(collectionPath: string, docId: string): Observable<CRMData | null> {
    return this.firestore.doc(`${collectionPath}/${docId}`)
      .valueChanges()
      .pipe(
        map((doc: any) => doc?.crmData || null),
        catchError(error => {
          console.error('Erro ao obter dados CRM:', error);
          return of(null);
        })
      );
  }
  
  // Atualizar ou criar dados de CRM para um registro
  updateCrmData(collectionPath: string, docId: string, crmData: CRMData): Promise<void> {
    const updatedData = {
      ...crmData,
      updatedAt: new Date()
    };
    
    return this.firestore.doc(`${collectionPath}/${docId}`)
      .update({ crmData: updatedData })
      .catch(error => {
        console.error('Erro ao atualizar dados CRM:', error);
        throw error;
      });
  }
  
  // Inicializar dados de CRM para um novo registro
  initializeCrmData(collectionPath: string, docId: string): Promise<void> {
    // Obter configuração padrão para determinar estágio inicial
    return this.getCrmConfig().pipe(
      map(config => {
        const defaultStage = config?.pipeline?.defaultStage || 'novo';
        
        const crmData: CRMData = {
          leadStatus: defaultStage as any,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return crmData;
      }),
      catchError(() => {
        // Configuração padrão caso não exista configuração no banco
        const crmData: CRMData = {
          leadStatus: 'novo',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return of(crmData);
      })
    ).toPromise()
    .then(crmData => {
      return this.firestore.doc(`${collectionPath}/${docId}`)
        .update({ crmData });
    });
  }
  
  // Obter registros por status para o pipeline
  getRegistrosByStatus(collection: string, status?: string): Observable<any[]> {
    if (status) {
      // Se status for fornecido, filtra por ele
      return this.firestore.collection(collection, ref => 
        ref.where('crmData.leadStatus', '==', status)
      ).valueChanges({ idField: 'id' });
    } else {
      // Se não, retorna todos os registros da coleção
      return this.firestore.collection(collection).valueChanges({ idField: 'id' });
    }
  }
  
  // Obter todos os registros com dados de CRM
  getAllCrmRegistros(collectionPath: string): Observable<any[]> {
    return this.firestore.collection(collectionPath, ref => 
      ref.where('crmData', '!=', null)
    ).valueChanges({ idField: 'id' });
  }
  
  // Obter configuração do CRM
  getCrmConfig(): Observable<CRMConfig | null> {
    return this.firestore.doc('configuracoes/crm')
      .valueChanges()
      .pipe(
        map((config: any) => config as CRMConfig),
        catchError(error => {
          console.error('Erro ao obter configuração CRM:', error);
          return of(null);
        })
      );
  }
  
  // Ajustar o método getPipelineConfig
  getPipelineConfig(): Observable<any> {
    return this.firestore.doc<LocalPipelineConfig>('config/pipeline')
      .valueChanges()
      .pipe(
        map(config => {
          if (!config) {
            return this.defaultPipelineConfig;
          }
          
          return config;
        }),
        catchError(error => {
          console.error('Error getting pipeline config:', error);
          return of(this.defaultPipelineConfig);
        })
      );
  }
  
  // Atualizar configuração do CRM
  updateCrmConfig(config: CRMConfig): Promise<void> {
    return this.firestore.doc('configuracoes/crm')
      .set(config, { merge: true })
      .catch(error => {
        console.error('Erro ao atualizar configuração CRM:', error);
        throw error;
      });
  }
  
  // Obter métricas básicas do CRM
  getCrmMetrics(collectionPath: string): Observable<CrmMetrics> {
    return this.getAllCrmRegistros(collectionPath).pipe(
      map(registros => {
        const metrics: CrmMetrics = {
          total: registros.length,
          byStatus: {},
          bySource: {},
          valorPotencialTotal: 0
        };
        
        registros.forEach(registro => {
          if (registro.crmData) {
            // Contagem por status
            const status = registro.crmData.leadStatus as string;
            if (status) {
              metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;
            }
            
            // Contagem por origem
            if (registro.crmData.leadSource) {
              const source = registro.crmData.leadSource as string;
              metrics.bySource[source] = (metrics.bySource[source] || 0) + 1;
            }
            
            // Somar valor potencial
            if (registro.crmData.valorPotencial) {
              metrics.valorPotencialTotal += registro.crmData.valorPotencial;
            }
          }
        });
        
        return metrics;
      })
    );
  }

  // Add this method to create test data
  async createTestData(): Promise<void> {
    try {
      
      // Definir o pipeline config
      const pipelineConfig = {
        isActive: true,
        stages: {
          'novo': {
            label: 'Novo',
            order: 0,
            color: '#e3f2fd'
          },
          'qualificado': {
            label: 'Qualificado',
            order: 1,
            color: '#e8f5e9'
          },
          'em_atendimento': {
            label: 'Em Atendimento',
            order: 2,
            color: '#fff8e1'
          },
          'fechado_ganho': {
            label: 'Fechado (Ganho)',
            order: 3,
            color: '#e8eaf6'
          },
          'fechado_perdido': {
            label: 'Fechado (Perdido)',
            order: 4,
            color: '#ffebee'
          }
        }
      };
      
      // First, ensure pipeline config exists
      await this.firestore.doc('config/pipeline').set(pipelineConfig);
      
      // Create test pacientes with CRM data
      const testLeads = [
        {
          nome: 'Maria Silva',
          email: 'maria.silva@example.com',
          telefone: '(11) 98765-4321',
          crmData: {
            leadStatus: 'novo',
            leadSource: 'Website',
            valorPotencial: 2500,
            dataCadastro: firebase.firestore.Timestamp.fromDate(new Date()),
            observacoes: 'Interessada em tratamento ortodôntico'
          }
        },
        {
          nome: 'João Oliveira',
          email: 'joao.oliveira@example.com',
          telefone: '(11) 91234-5678',
          crmData: {
            leadStatus: 'qualificado',
            leadSource: 'Indicação',
            valorPotencial: 5000,
            dataCadastro: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            dataUltimoContato: firebase.firestore.Timestamp.fromDate(new Date()),
            observacoes: 'Necessita tratamento de canal e prótese'
          }
        },
        {
          nome: 'Ana Souza',
          email: 'ana.souza@example.com',
          telefone: '(11) 99876-5432',
          crmData: {
            leadStatus: 'em_atendimento',
            leadSource: 'Google',
            valorPotencial: 3200,
            dataCadastro: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
            dataUltimoContato: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
            observacoes: 'Realizou primeira consulta, aguardando orçamento'
          }
        },
        {
          nome: 'Carlos Mendes',
          email: 'carlos.mendes@example.com',
          telefone: '(11) 97654-3210',
          crmData: {
            leadStatus: 'fechado_ganho',
            leadSource: 'Facebook',
            valorPotencial: 4800,
            dataCadastro: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            dataUltimoContato: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
            observacoes: 'Iniciou tratamento completo'
          }
        },
        {
          nome: 'Patrícia Lima',
          email: 'patricia.lima@example.com',
          telefone: '(11) 98877-6655',
          crmData: {
            leadStatus: 'fechado_perdido',
            leadSource: 'Instagram',
            valorPotencial: 1800,
            dataCadastro: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
            dataUltimoContato: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            observacoes: 'Escolheu outra clínica por questão de localização'
          }
        }
      ];
      
      // Add test leads to Firestore using individual writes instead of batch
      for (const lead of testLeads) {
        await this.firestore.collection('pacientes').add(lead);
      }
      
      // Also add a few test dentists with CRM data
      const testDentists = [
        {
          nome: 'Dr. Roberto Azevedo',
          email: 'dr.roberto@example.com',
          telefone: '(11) 99123-4567',
          especialidade: 'Implantodontia',
          crmData: {
            leadStatus: 'novo',
            leadSource: 'Evento Odontológico',
            valorPotencial: 0,
            dataCadastro: firebase.firestore.Timestamp.fromDate(new Date()),
            observacoes: 'Interessado em parceria para casos de implante'
          }
        },
        {
          nome: 'Dra. Carla Santos',
          email: 'dra.carla@example.com',
          telefone: '(11) 98765-1234',
          especialidade: 'Ortodontia',
          crmData: {
            leadStatus: 'qualificado',
            leadSource: 'Indicação',
            valorPotencial: 0,
            dataCadastro: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            dataUltimoContato: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
            observacoes: 'Busca protético para confecção de aparelhos'
          }
        }
      ];
      
      for (const dentist of testDentists) {
        await this.firestore.collection('dentistas').add(dentist);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating test data:', error);
      return Promise.reject(error);
    }
  }
}