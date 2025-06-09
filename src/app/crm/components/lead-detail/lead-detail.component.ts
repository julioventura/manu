// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CrmService } from '../../services/crm.service';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ReminderFormComponent } from '../reminder-form/reminder-form.component';
import { MaterialModule } from '../../../shared/material.module';

@Component({
    selector: 'app-lead-detail',
    templateUrl: './lead-detail.component.html',
    styleUrls: ['./lead-detail.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule
    ]
})
export class LeadDetailComponent implements OnInit {
    collectionPath: string = '';
    leadId: string = '';
    lead$: Observable<any> = of(null);
    crmData$: Observable<any> = of(null);
    interactions: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private crmService: CrmService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.collectionPath = this.route.snapshot.params['collection'];
        this.leadId = this.route.snapshot.params['id'];


        // Para teste: usar dados de teste em vez de buscar do Firestore
        if (this.leadId.startsWith('test')) {
            // Criar dados de teste
            const testLead = this.getTestLeadById(this.leadId);
            this.crmData$ = of(testLead?.crmData || null);
        } else {
            // Buscar dados reais (quando implementado)
            this.crmData$ = this.crmService.getCrmData(this.collectionPath, this.leadId);
        }

        this.loadInteractions();
    }

    addInteraction() {
        // Implement your interaction adding logic here
    }

    // Helper para obter dados de teste
    private getTestLeadById(id: string): any {
        const testLeads: Record<string, any> = {
            'test1': {
                id: 'test1',
                nome: 'Maria Silva',
                email: 'maria.silva@example.com',
                telefone: '(11) 98765-4321',
                crmData: {
                    leadStatus: 'novo',
                    leadSource: 'Website',
                    valorPotencial: 2500,
                    dataCadastro: new Date(),
                    observacoes: 'Interessada em tratamento ortodôntico'
                }
            },
            'test2': {
                id: 'test2',
                nome: 'João Oliveira',
                email: 'joao.oliveira@example.com',
                telefone: '(11) 91234-5678',
                crmData: {
                    leadStatus: 'qualificado',
                    leadSource: 'Indicação',
                    valorPotencial: 5000,
                    dataCadastro: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    dataUltimoContato: new Date(),
                    observacoes: 'Necessita tratamento de canal e prótese'
                }
            }
            // Outros leads podem ser adicionados aqui
        };

        return testLeads[id];
    }

    addReminder(): void {
        const dialogRef = this.dialog.open(ReminderFormComponent, {
            width: '500px',
            data: {
                parentPath: this.collectionPath,
                parentId: this.leadId
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            // Reload data if needed
        });
    }

    updateLeadStatus(status: string): void {
        // Para teste, apenas simular a atualização
        this.crmData$.subscribe(crmData => {
            if (crmData) {
                const updatedData = {
                    ...crmData,
                    leadStatus: status
                };
                // Para teste, não precisa realmente salvar
                this.crmData$ = of(updatedData);
            }
        });
    }

    // Adicionar método para carregar interações
    loadInteractions(): void {
        // Simular interações para teste
        this.interactions = [
            {
                id: 'int1',
                type: 'email',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
                summary: 'Primeiro contato',
                description: 'Email enviado com informações sobre nossos serviços'
            },
            {
                id: 'int2',
                type: 'call',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
                summary: 'Ligação de qualificação',
                description: 'Cliente demonstrou interesse em tratamento ortodôntico'
            },
            {
                id: 'int3',
                type: 'meeting',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
                summary: 'Primeira consulta',
                description: 'Avaliação inicial realizada. Cliente vai pensar na proposta.'
            }
        ];
    }
}