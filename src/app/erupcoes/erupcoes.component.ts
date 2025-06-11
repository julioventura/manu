// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DateUtils } from '../shared/utils/date-utils';

import { ErupcoesPopupComponent } from './erupcoes-popup/erupcoes-popup.component';
import { UtilService } from '../shared/utils/util.service';
import { dentesTabela, Dente, dentesTabelaHTML } from './dentes-tabela'; // Importa a tabela e a interface
import { TabelaReferenciaDialogComponent } from './tabela-referencia-dialog.component';

@Component({
  selector: 'app-erupcoes',
  standalone: false,
  templateUrl: './erupcoes.component.html',
  styleUrls: ['./erupcoes.component.scss']
}) 

export class ErupcoesComponent implements OnInit {
  userId: string | null = null;
  pacientes: any[] = [];
  pacientesComErupcao: any[] = [];
  faixaDeMeses: number = 1;  // Define faixaDeMeses com um valor inicial
  public DateUtils = DateUtils;
  isLoading: boolean = false;


  // Usar a tabela de dentes importada
  private dentesTabela: Dente[] = dentesTabela;
  private dentesTabelaHTML: string = dentesTabelaHTML;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    public util: UtilService,
    public dialog: MatDialog 
  ) {}


  ngOnInit(): void {

    // Obtém o ID do usuário autenticado e carrega os dados dos pacientes
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;
        this.carregarPacientes();
      } else {
        console.error('Usuário não autenticado.');
      }
    });

  }


  // Getter para o texto formatado
  get faixaDeMesesTexto(): string {
    return `em ${this.faixaDeMeses} ${this.faixaDeMeses === 1 ? 'mês' : 'meses'}`;
  }


  
  abrirPopup(paciente: any): void {
    const dialogRef = this.dialog.open(ErupcoesPopupComponent);
    // Configura os dados manualmente usando `componentInstance`
    dialogRef.componentInstance.data = {
      nome: paciente.nome,
      nascimento: paciente.nascimento,
      telefone: paciente.telefone,
      idade: paciente.idade,
      dataChamadaInicial: '21/10/2024',
      dataUltimaChamada: '28/10/2024',
      dataResposta: '29/10/2024',
      dataComparecimento: '31/10/2024'
    };
  }
  
  

  carregarPacientes(): void {

    if (!this.userId) return;
    this.isLoading = true;

    this.firestore
      .collection(`/users/${this.userId}/pacientes`)
      .valueChanges()
      .subscribe((pacientes: any[]) => {
        this.pacientes = pacientes.map(paciente => {
          // Normaliza o formato da data para dd/mm/yyyy
          const nascimentoNormalizado = this.util.normalizarFormatoData(paciente.nascimento);
          
          // Calcular idade em meses atual baseada na data de nascimento
          const idadeEmMeses = this.util.calcularIdadeEmMeses(nascimentoNormalizado);
          
          return {
            nome: paciente.nome,
            nascimento: nascimentoNormalizado,
            telefone: paciente.telefone,
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
        this.isLoading = false;
      }, error => {
        console.error("Erro ao carregar pacientes:", error);
        this.isLoading = false;
      });
  }



  verificarErupcoes(): void {

    this.pacientesComErupcao = this.pacientes
      .map(paciente => {
        // Converte para número e arredonda para baixo
        const pacienteMeses = Math.floor(Number(paciente.meses));
        const faixaMaxima = pacienteMeses + this.faixaDeMeses;

        const dentesEmErupcao = this.dentesTabela
          .filter(dente => {
            const inicioErupcao = Math.floor(Number(dente.Erupcao));
            const denteJaErupcionado = paciente.dentesExaminados[dente.Dente] === "E";
            
            const denteDentroFaixa =
              inicioErupcao >= pacienteMeses &&
              inicioErupcao <= faixaMaxima &&
              !denteJaErupcionado;

            if (denteDentroFaixa) {
            }
            
            return denteDentroFaixa;
          })
          .map(dente => dente.Dente);

        return {
          nome: paciente.nome,
          nascimento: paciente.nascimento,
          telefone: paciente.telefone,
          meses: pacienteMeses,
          dentesEmErupcao: dentesEmErupcao || []
        };
      })
      .filter(paciente => paciente.dentesEmErupcao.length > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome));  // Ordena alfabeticamente pelo nome

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

}