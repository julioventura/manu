// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DateUtils } from '../shared/utils/date-utils';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ErupcoesPopupComponent } from './erupcoes-popup/erupcoes-popup.component';
import { UtilService } from '../shared/utils/util.service';
import { dentesTabela, Dente, dentesTabelaHTML } from './dentes-tabela'; // Importa a tabela e a interface
import { TabelaReferenciaDialogComponent } from './tabela-referencia-dialog.component';
import { NgIf, NgFor } from '@angular/common';
import { FirestoreOptimizedService } from '../shared/services/firestore-optimized.service';

@Component({
  selector: 'app-erupcoes',
  templateUrl: './erupcoes.component.html',
  styleUrls: ['./erupcoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor]
}) 

export class ErupcoesComponent implements OnInit {
  userId: string | null = null;
  pacientes: Record<string, unknown>[] = [];
  pacientesComErupcao: Record<string, unknown>[] = [];
  faixaDeMeses: number = 1;  // Define faixaDeMeses com um valor inicial
  public DateUtils = DateUtils;
  isLoading: boolean = false;

  // OTIMIZAÇÃO: Usar Observable
  pacientes$!: Observable<Record<string, unknown>[]>;

  // Usar a tabela de dentes importada
  private dentesTabela: Dente[] = dentesTabela;
  private dentesTabelaHTML: string = dentesTabelaHTML;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public util: UtilService,
    public dialog: MatDialog,
    private firestoreOptimized: FirestoreOptimizedService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    // Obtém o ID do usuário autenticado e carrega os dados dos pacientes
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;
        this.setupOptimizedDataFlow();
      } else {
        console.error('Usuário não autenticado.');
      }
    });
  }

  /**
   * OTIMIZAÇÃO: Setup do fluxo de dados otimizado com Observables
   */
  private setupOptimizedDataFlow(): void {
    if (!this.userId) {
      console.error('setupOptimizedDataFlow: Missing userId', { userId: this.userId });
      return;
    }

    const collectionPath = `users/${this.userId}/pacientes`;

    this.pacientes$ = this.firestoreOptimized.getOptimizedCollection<Record<string, unknown>>(
      collectionPath,
      {
        limit: 100,
        orderBy: 'nome',
        orderDirection: 'asc'
      }
    ).pipe(
      map(pacientes => {
        this.isLoading = false;
        this.pacientes = pacientes.map(paciente => {
          // Normaliza o formato da data para dd/mm/yyyy
          const nascimentoNormalizado = this.util.normalizarFormatoData(paciente['nascimento'] as string);
          
          // Calcular idade em meses atual baseada na data de nascimento
          const idadeEmMeses = this.util.calcularIdadeEmMeses(nascimentoNormalizado);
          
          return {
            nome: paciente['nome'],
            nascimento: nascimentoNormalizado,
            telefone: paciente['telefone'],
            meses: idadeEmMeses, // Usa o valor calculado em vez do armazenado
            dentesExaminados: {
              "11": paciente["11"], "12": paciente["12"], "13": paciente["13"], "14": paciente["14"],
              "15": paciente["15"], "16": paciente["16"], "17": paciente["17"], "18": paciente["18"],
              "21": paciente["21"], "22": paciente["22"], "23": paciente["23"], "24": paciente["24"],
              "25": paciente["25"], "26": paciente["26"], "27": paciente["27"], "28": paciente["28"],
              "31": paciente["31"], "32": paciente["32"], "33": paciente["33"], "34": paciente["34"],
              "35": paciente["35"], "36": paciente["36"], "37": paciente["37"], "38": paciente["38"],
              "41": paciente["41"], "42": paciente["42"], "43": paciente["43"], "44": paciente["44"],
              "45": paciente["45"], "46": paciente["46"], "47": paciente["47"], "48": paciente["48"],
              "51": paciente["51"], "52": paciente["52"], "53": paciente["53"], "54": paciente["54"],
              "55": paciente["55"], "61": paciente["61"], "62": paciente["62"], "63": paciente["63"],
              "64": paciente["64"], "65": paciente["65"], "71": paciente["71"], "72": paciente["72"],
              "73": paciente["73"], "74": paciente["74"], "75": paciente["75"], "81": paciente["81"],
              "82": paciente["82"], "83": paciente["83"], "84": paciente["84"], "85": paciente["85"]
            }
          };
        });
        this.verificarErupcoes();
        this.cdr.markForCheck();
        return pacientes;
      }),
      catchError(error => {
        console.error('Error loading pacientes:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
        return of([]);
      })
    );

    // Subscribe to actually trigger the data loading
    this.pacientes$.subscribe();
  }


  // Getter para o texto formatado
  get faixaDeMesesTexto(): string {
    return `em ${this.faixaDeMeses} ${this.faixaDeMeses === 1 ? 'mês' : 'meses'}`;
  }


  
  abrirPopup(paciente: Record<string, unknown>): void {
    const dialogRef = this.dialog.open(ErupcoesPopupComponent);
    // Configura os dados manualmente usando `componentInstance`
    dialogRef.componentInstance.data = {
      nome: String(paciente['nome'] || ''),
      nascimento: String(paciente['nascimento'] || ''),
      telefone: String(paciente['telefone'] || ''),
      idade: String(paciente['idade'] || ''),
      dataChamadaInicial: '21/10/2024',
      dataUltimaChamada: '28/10/2024',
      dataResposta: '29/10/2024',
      dataComparecimento: '31/10/2024'
    };
  }
  
  verificarErupcoes(): void {

    this.pacientesComErupcao = this.pacientes
      .map(paciente => {
        // Converte para número e arredonda para baixo
        const pacienteMeses = Math.floor(Number(paciente['meses']));
        const faixaMaxima = pacienteMeses + this.faixaDeMeses;

        const dentesEmErupcao = this.dentesTabela
          .filter(dente => {
            const inicioErupcao = Math.floor(Number(dente.Erupcao));
            const dentesExaminados = paciente['dentesExaminados'] as Record<string, unknown>;
            const denteJaErupcionado = dentesExaminados && dentesExaminados[dente.Dente] === "E";
            
            const denteDentroFaixa =
              inicioErupcao >= pacienteMeses &&
              inicioErupcao <= faixaMaxima &&
              !denteJaErupcionado;
            
            return denteDentroFaixa;
          })
          .map(dente => dente.Dente);

        return {
          nome: String(paciente['nome'] || ''),
          nascimento: String(paciente['nascimento'] || ''),
          telefone: String(paciente['telefone'] || ''),
          meses: pacienteMeses,
          dentesEmErupcao: dentesEmErupcao || []
        };
      })
      .filter(paciente => paciente.dentesEmErupcao.length > 0)
      .sort((a, b) => String(a.nome).localeCompare(String(b.nome)));  // Ordena alfabeticamente pelo nome

    this.isLoading = false;
  }


  enviar_whatsapp(nome: string, telefone: string) {

    if (!telefone || !nome) {
      console.error("Telefone ou nome do paciente não fornecido.");
      return;
    }

    // Formatação da mensagem, substituindo <nome> pelo nome real do paciente
    const mensagem = encodeURIComponent(`
        Ao responsável por *${nome}*

        Olá!

        Informamos que em breve vão nascer dentes importantes. 
        Este é o período de maior risco de cárie para esses dentes.

        Traga ${nome} para atendimento odontológico na *UBS Candeia São Sebastião* para os exames e orientação necessários para garantir a saúde dos novos dentes.


        Atenciosamente,
        
        *Equipe de Saúde Bucal UBS Candeia São Sebastião*
    `);

    // remove do telefone tudo que não for dígitos
    telefone = telefone.replace(/\D/g, '');
    // Formatação da URL do WhatsApp com telefone e mensagem
    const whatsappUrl = `https://wa.me/${telefone}?text=${mensagem}`;

    // Abre a URL em uma nova aba
    window.open(whatsappUrl, '_blank');
  }


  aumentarFaixaMeses() {
    if (this.faixaDeMeses < 360) { // Limite máximo de 360 meses (30 anos)
      this.faixaDeMeses++;
      this.verificarErupcoes(); // Chama o método para verificar as erupções quando o valor muda
    }
  }

  diminuirFaixaMeses() {
    if (this.faixaDeMeses > 1) { // Limite mínimo de 1
      this.faixaDeMeses--;
      this.verificarErupcoes(); // Chama o método para verificar as erupções quando o valor muda
    }
  }


  voltar() {
    const listaPath = `list/pacientes`;
    this.router.navigate([listaPath]);
  }

  mostrarTabelaReferencia(): void {
    const dialogRef = this.dialog.open(TabelaReferenciaDialogComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh'
    });
    
    // Configurar a tabela HTML
    dialogRef.componentInstance.tabelaHTML = this.dentesTabelaHTML;
  }

  /**
   * OTIMIZAÇÃO: Métodos auxiliares para conversão de tipos
   */
  getSafeString(value: unknown): string {
    return String(value || '');
  }

  getSafeArray(value: unknown): string[] {
    return Array.isArray(value) ? value : [];
  }

}