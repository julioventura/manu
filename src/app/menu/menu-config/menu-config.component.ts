// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { UtilService } from '../../shared/utils/util.service';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Subcolecao {
  nome: string;
  selecionado: boolean;
}

@Component({
    selector: 'app-menu-config',
    templateUrl: './menu-config.component.html',
    styleUrls: ['./menu-config.component.scss'],
    imports: [NgFor, FormsModule]
})
export class MenuConfigComponent implements OnInit {
  colecoesDisponiveis = [
    'associados',
    'pacientes',
    'alunos',
    'professores',
    'dentistas',
    'equipe',
    'proteticos',
    'dentais',
    'empresas',
    'fornecedores',
  ];

  todasSubcolecoes = [
    'padrao',
    'exames',
    'planos',
    'pagamentos',
    'atendimentos',
    'consultas',
    'documentos ',
    'dentes',
    'dentesendo',
    'dentesperio',
    'erupcoes',
    'anamnese',
    'diagnosticos',
    'risco',
    'retornos'
  ];

  subcolecoesDisponiveis: Subcolecao[] = this.todasSubcolecoes.map(nome => ({
    nome,
    selecionado: false
  }));

  colecaoSelecionada: string = ''; // Inicializa como uma string vazia
  collection: string = '';  // Coleção selecionada
  id: string = ''; // Identificador do item da coleção, se necessário
  subcolecoes: Subcolecao[] = []; // Lista de subcoleções com estado de seleção
  userId: string = '';

  constructor(
    private firestore: AngularFirestore,
    public util: UtilService,
    private navegacaoService: NavegacaoService,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;

        // Agora você pode carregar as configurações do menu
        this.carregarSubcolecoes();
        this.carregarConfiguracoes();
      }
      else {
        console.warn('Usuário não autenticado.');
      }

    });

  }

  carregarConfiguracoes() {
    if (this.colecaoSelecionada) {
      this.firestore.collection('users').doc(this.userId)
        .collection('configuracoesMenu').doc(this.colecaoSelecionada).get()
        .subscribe(doc => {
          if (doc.exists) {
            const dados = doc.data() as { subcolecoes: string[] } | undefined;
            // Recria a lista utilizando todasSubcolecoes como base
            this.subcolecoesDisponiveis = this.todasSubcolecoes.map(nome => ({
              nome,
              selecionado: dados?.subcolecoes.includes(nome) || false
            }));
          } else {
            // Se não houver configuração, define como todas não selecionadas
            this.subcolecoesDisponiveis = this.todasSubcolecoes.map(nome => ({
              nome,
              selecionado: false
            }));
          }
        });
    } else {
      // Se nenhuma coleção estiver selecionada, reinicia a lista padrão
      this.subcolecoesDisponiveis = this.todasSubcolecoes.map(nome => ({
        nome,
        selecionado: false
      }));
    }
  }

  salvarConfiguracoes() {
    const subcolecoesSelecionadas = this.subcolecoesDisponiveis
      .filter(sub => sub.selecionado)
      .map(sub => sub.nome);

    this.firestore.collection('users').doc(this.userId).collection('configuracoesMenu').doc(this.colecaoSelecionada).set({
      subcolecoes: subcolecoesSelecionadas
    }).then(() => {
      alert('Configurações salvas com sucesso!');
    }).catch(error => {
      console.error('Erro ao salvar configurações:', error);
    });
  }

  selecionarColecao(colecao: string) {
    // Define a coleção selecionada e atualiza as subcoleções
    this.colecaoSelecionada = colecao;
    this.carregarConfiguracoes();
  }


  carregarSubcolecoes() {
    if (this.collection) {
      this.firestore.collection('users').doc(this.userId).collection('configuracoesMenu').doc(this.collection).get().subscribe(doc => {
        if (doc.exists) {
          const dados = doc.data() as { subcolecoes: string[] } | undefined;
          if (dados && dados.subcolecoes) {
            this.subcolecoes = dados.subcolecoes.map(nome => ({
              nome,
              selecionado: true
            }));
          } else {
            console.warn(`A coleção "${this.collection}" não possui subcoleções configuradas.`);
          }
        } else {
          console.warn(`Documento "configuracoesMenu/${this.collection}" não encontrado.`);
        }
      }, error => {
        console.error('Erro ao carregar subcoleções:', error);
      });
    } 
  }

  salvar() {
    const configPath = `menu-config/${this.colecaoSelecionada}`;
    this.firestore
      .doc(configPath)
      .set({ subcolecoes: this.subcolecoesDisponiveis.filter(sub => sub.selecionado).map(sub => sub.nome) })
      .then(() => {
        alert('Configuração salva com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao salvar configuração:', error);
        alert('Erro ao salvar configuração.');
      });
  }

  voltar() {
    this.navegacaoService.goBack();
  }

}
