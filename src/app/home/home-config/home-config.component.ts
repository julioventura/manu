import { Component, OnInit } from '@angular/core';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
 
import { UtilService } from '../../shared/utils/util.service';
  
@Component({
  selector: 'app-home-config',
  templateUrl: './home-config.component.html',
  styleUrls: ['./home-config.component.scss'],
  standalone: false
})
export class HomeConfigComponent implements OnInit {
  colecoesAtivas = ['Associados', 'Pacientes', 'Alunos', 'Professores', 'Dentistas', 'Equipe', 'Protéticos']; // Exemplo de coleções ativas
  colecaoSelecionada: string | null = null;

  // Ícones disponíveis e sua visibilidade
  icons = [
    { key: 'agenda', label: 'Agenda' },
    { key: 'pacientes', label: 'Pacientes' },
    { key: 'alunos', label: 'Alunos' },
    { key: 'professores', label: 'Professores' },
    { key: 'dentistas', label: 'Dentistas' },
    { key: 'equipe', label: 'Equipe' },
    { key: 'proteticos', label: 'Protéticos' },
    { key: 'associados', label: 'Associados' },
    { key: 'indicador', label: 'Indicador' },
    { key: 'dentais', label: 'Dentais' },
    { key: 'empresas', label: 'Empresas' },
    { key: 'fornecedores', label: 'Fornecedores' },];
  visibleIcons: { [key: string]: boolean } = {};

  private userId: string | null = null;


  constructor(
    public util: UtilService,
    private navegacaoService: NavegacaoService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }


  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;
        this.loadIconConfig(); // Carrega as configurações do Firestore para o usuário
      }
    });
  }


  loadIconConfig() {
    if (!this.userId) return;

    // Novo caminho: `/users/[userId]/settings/HomeConfig`
    this.firestore.doc(`/users/${this.userId}/settings/HomeConfig`).get().subscribe(doc => {
      if (doc.exists) {
        this.visibleIcons = doc.data() as { [key: string]: boolean };
      } else {
        this.icons.forEach(icon => {
          this.visibleIcons[icon.key] = true;
        });
      }
    });
  }

  selecionarColecao(colecao: string) {
    this.colecaoSelecionada = colecao;
  }

  salvarConfiguracoes() {
    if (!this.userId) return;

    // Salva as configurações no caminho `/users/[userId]/settings/HomeConfig`
    this.firestore.doc(`/users/${this.userId}/settings/HomeConfig`).set(this.visibleIcons)
      .then(() => alert('Configurações salvas com sucesso!'))
      .catch(error => console.error('Erro ao salvar configurações:', error));
  }


  voltar() {
    this.navegacaoService.goBack();
  }
}
