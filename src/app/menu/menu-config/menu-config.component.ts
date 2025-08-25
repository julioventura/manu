import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirestoreService } from '../../shared/services/firestore.service';
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
    'exames',
    'planos',
    'pagamentos',
    'atendimentos',
    'documentos ',
    'dentesendo',
    'dentesperio',
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
    private firestoreService: FirestoreService<Record<string, unknown> & { id?: string }>,
    public util: UtilService,
    private navegacaoService: NavegacaoService,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit(): void {
    console.log('MenuConfigComponent ngOnInit started');
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;
        console.log('User authenticated with ID:', this.userId);

        // Testa conectividade com Firestore
        this.testarFirestore();

        // Agora você pode carregar as configurações do menu
        this.carregarSubcolecoes();
        this.carregarConfiguracoes();
      }
      else {
        console.warn('Usuário não autenticado.');
      }

    });

  }

  // Método para debug dos checkboxes
  onSubcolecaoChange(subcolecao: Subcolecao) {
    console.log('Checkbox changed:', subcolecao.nome, 'selected:', subcolecao.selecionado);
  }

  carregarConfiguracoes() {
    console.log('carregarConfiguracoes() called with colecaoSelecionada:', this.colecaoSelecionada);
    if (this.colecaoSelecionada) {
      this.firestoreService.getDocumentByPath(`users/${this.userId}/configuracoesMenu/${this.colecaoSelecionada}`)
        .subscribe(doc => {
          console.log('Firestore doc.exists:', doc.exists);
          if (doc.exists) {
            const dados = doc.data() as { subcolecoes: string[] } | undefined;
            console.log('Dados carregados do Firestore:', dados);
            // Recria a lista utilizando todasSubcolecoes como base
            this.subcolecoesDisponiveis = this.todasSubcolecoes.map(nome => ({
              nome,
              selecionado: dados?.subcolecoes.includes(nome) || false
            }));
            console.log('subcolecoesDisponiveis after loading:', this.subcolecoesDisponiveis);
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
    console.log('salvarConfiguracoes() called');
    console.log('colecaoSelecionada:', this.colecaoSelecionada);
    console.log('userId:', this.userId);
    console.log('subcolecoesDisponiveis:', this.subcolecoesDisponiveis);

    if (!this.colecaoSelecionada) {
      alert('Por favor, selecione uma coleção antes de salvar.');
      return;
    }

    if (!this.userId) {
      alert('Usuário não autenticado.');
      return;
    }

    const subcolecoesSelecionadas = this.subcolecoesDisponiveis
      .filter(sub => sub.selecionado)
      .map(sub => sub.nome);

    console.log('subcolecoesSelecionadas:', subcolecoesSelecionadas);

    this.firestoreService.setDocumentByPath(`users/${this.userId}/configuracoesMenu/${this.colecaoSelecionada}`, {
      subcolecoes: subcolecoesSelecionadas
    }).then(() => {
      console.log('Configurações salvas com sucesso no Firestore');
      alert('Configurações salvas com sucesso!');
    }).catch(error => {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações: ' + error.message);
    });
  }

  // Método alternativo para salvar (fallback)
  salvarConfiguracoesAlternativo() {
    console.log('salvarConfiguracoesAlternativo() called');
    
    if (!this.colecaoSelecionada) {
      console.error('Nenhuma coleção selecionada');
      alert('Por favor, selecione uma coleção antes de salvar.');
      return;
    }

    if (!this.userId) {
      console.error('Usuário não autenticado');
      alert('Usuário não autenticado.');
      return;
    }

    const subcolecoesSelecionadas = this.subcolecoesDisponiveis
      .filter(sub => sub.selecionado)
      .map(sub => sub.nome);

    console.log('Dados a serem salvos:', {
      colecao: this.colecaoSelecionada,
      userId: this.userId,
      subcolecoes: subcolecoesSelecionadas
    });

    // Usando uma abordagem mais direta com o FirestoreService
    this.firestoreService.setDocumentByPath(`users/${this.userId}/configuracoesMenu/${this.colecaoSelecionada}`, {
      subcolecoes: subcolecoesSelecionadas
    })
      .then(() => {
        console.log('Configurações salvas com sucesso!');
        alert('Configurações salvas com sucesso!');
      })
      .catch(error => {
        console.error('Erro detalhado ao salvar:', error);
        alert('Erro ao salvar configurações: ' + JSON.stringify(error));
      });
  }

  selecionarColecao(colecao: string) {
    console.log('selecionarColecao() called with:', colecao);
    // Define a coleção selecionada e atualiza as subcoleções
    this.colecaoSelecionada = colecao;
    console.log('colecaoSelecionada set to:', this.colecaoSelecionada);
    this.carregarConfiguracoes();
  }

  carregarSubcolecoes() {
    if (this.collection) {
      this.firestoreService.getDocumentByPath(`users/${this.userId}/configuracoesMenu/${this.collection}`)
        .subscribe(doc => {
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
    this.firestoreService.setDocumentByPath(configPath, { 
      subcolecoes: this.subcolecoesDisponiveis.filter(sub => sub.selecionado).map(sub => sub.nome) 
    })
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

  // Método para testar conectividade com Firestore
  testarFirestore() {
    console.log('Testando conectividade com Firestore...');
    
    this.firestoreService.getDocumentByPath(`users/${this.userId}`)
      .subscribe(
        doc => {
          console.log('Teste de conectividade bem-sucedido. Documento existe:', doc.exists);
          console.log('Dados do documento:', doc.data());
        },
        error => {
          console.error('Erro de conectividade com Firestore:', error);
        }
      );
  }

  // Teste específico para a coleção configuracoesMenu
  testarEscritaConfiguracoesMenu() {
    console.log('Testando escrita na coleção configuracoesMenu...');
    
    const testData = {
      subcolecoes: ['teste'],
      timestamp: new Date().toISOString()
    };
    
    this.firestoreService.setDocumentByPath(`users/${this.userId}/configuracoesMenu/teste`, testData)
      .then(() => {
        console.log('Teste de escrita bem-sucedido!');
        // Limpa o documento de teste
        this.firestoreService.deleteRegistro(`users/${this.userId}/configuracoesMenu`, 'teste')
          .then(() => console.log('Documento de teste removido'))
          .catch(error => console.error('Erro ao remover documento de teste:', error));
      })
      .catch(error => {
        console.error('Erro no teste de escrita:', error);
        alert('Erro de permissão: ' + error.message);
      });
  }
}
