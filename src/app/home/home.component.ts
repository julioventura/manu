// Alteração: remoção de logs de depuração (console.log)
/* 
  Métodos do componente HomeComponent:
  1. ngOnInit() - Inicializa o componente, autenticando o usuário, carregando dados do usuário (username) e configuração de ícones.
  2. loadIconConfig() - Carrega as configurações de ícones personalizadas do usuário a partir do Firestore.
  3. saveIconConfig() - Salva as configurações de ícones do usuário no Firestore.
  4. loadUserData(email: string): void - Carrega os dados do usuário (como o username) a partir do FirestoreService.
  5. mostrarAlerta(): void - Exibe um alerta informando que o acesso é reservado ao administrador.
  6. go(component: string, new_window: boolean) - Realiza a navegação para o componente informado, podendo abrir em nova janela se especificado.
*/

import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';  // Usando AngularFireAuth
import { Router } from '@angular/router';
import { FirestoreService } from '../shared/services/firestore.service'; // Import FirestoreService
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { ConfigService } from '../shared/services/config.service';
import { UtilService } from '../shared/utils/util.service';
import { AiChatService } from '../chatbot-widget/ai-chat.service';

// CORRIGIR: interface UserData para incluir id
interface UserData {
  id?: string; // ADICIONAR: propriedade id necessária para FirestoreService
  username?: string;
  email?: string;
  nome?: string;
  displayName?: string;
  uid?: string;
  [key: string]: unknown; // Para propriedades adicionais
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit {
  nome: string = '';  // Armazena o nome do usuário logado
  username: string | null = null;  // Armazena o username do usuário logado
  new_window: boolean = false;  // Controla se a navegação ocorrerá em nova janela
  url_agenda: string = 'https://dentistas.com.br/agenda/';
  // Lista de ícones visíveis inicial
  visibleIcons: { [key: string]: boolean } = {
    agenda: true,
    pacientes: true,
    alunos: true,
    professores: true,
    dentistas: true,
    equipe: true,
    proteticos: true,
    associados: false,
    indicador: false,
    dentais: false,
    empresas: false,
    fornecedores: false,
    perfil: true,
    homepage: true,
    crm: true
  };

  private userId: string | null = null;

  constructor(
    private auth: AngularFireAuth,  
    private router: Router,
    public configuracoes: ConfigService,
    public util: UtilService,
    private firestore: AngularFirestore, 
    private firestoreService: FirestoreService<UserData>, // CORRIGIDO: tipo específico
    private aiChatService: AiChatService
  ) { }

  /**
   * ngOnInit()
   * @description Inicializa o componente:
   *  - Subscreve no AngularFireAuth para obter o usuário logado.
   *  - Se o usuário estiver autenticado, capitaliza o nome e carrega seus dados (username) e configuração de ícones.
   *  - Configura a propriedade is_admin se o email corresponder ao do administrador.
   *  - Caso nenhum usuário esteja logado, redireciona para a página de login.
   */
  ngOnInit(): void {
    try {
      // Clear chat context
      this.aiChatService.resetContext();

      // Auth subscription
      this.auth.user.subscribe({
        next: (user) => {
          if (user && user.email) {
            // Define o nome do usuário utilizando a função capitalize para deixar a primeira letra de cada palavra em maiúsculo.
            this.nome = this.util.capitalizar(user.displayName || user.email || 'Usuário');
            this.userId = user.uid;
            // Carrega dados adicionais do usuário
            this.loadUserData(user.email);

            // Define o usuário como administrador, se o email corresponder
            if (user.email == 'julio@dentistas.com.br') {
              this.configuracoes.is_admin = true;
            }

            // Carrega as configurações de ícones a partir do Firestore
            this.loadIconConfig();

          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Error in auth subscription:', error);
        }
      });
    } catch (error) {
      console.error('Error in HomeComponent ngOnInit:', error);
    }
  }


  /**
   * loadIconConfig()
   * @description Carrega as configurações de ícones personalizadas do usuário a partir do Firestore.
   * Caso não haja uma configuração personalizada, mantém os valores padrão.
   */
  loadIconConfig(): void {
    if (!this.userId) return;

    // Solicita o documento de configurações do usuário no Firestore
    this.firestore.doc(`/users/${this.userId}/settings/HomeConfig`).get().subscribe(doc => {
      if (doc.exists) {
        this.visibleIcons = doc.data() as { [key: string]: boolean };
      } 
    });
  }

  /**
   * saveIconConfig()
   * @description Salva as configurações de ícones do usuário no Firestore.
   * Caso a operação seja bem-sucedida, exibe uma mensagem no console; se não, loga o erro.
   */
  saveIconConfig(): void {
    if (this.userId) {
      this.firestore.doc(`/users/${this.userId}/settings/HomeConfig`).set(this.visibleIcons)
        .catch(error => console.error("Erro ao salvar configurações:", error));
    }
  }

  /**
   * loadUserData(email: string): void
   * @param email - Email do usuário para buscar os dados.
   * @description Carrega os dados do usuário, como o username, utilizando o FirestoreService.
   */
  loadUserData(email: string): void {
    this.firestoreService.getRegistroById('usuarios/dentistascombr/users', email).subscribe(userData => {
      if (userData && userData.username) {
        this.username = userData.username;
      } 
    });
  }

  /**
   * mostrarAlerta(): void
   * @description Exibe um alerta informando que o acesso é reservado ao administrador.
   */
  mostrarAlerta(): void {
    alert('Acesso reservado ao administrador');
  }

  /**
   * go(component: string, new_window: boolean = false): void
   * @param component - O nome do componente para o qual deve navegar.
   * @param new_window - Se verdadeiro, indica que a navegação deve ocorrer em uma nova janela.
   * @description Navega para o componente especificado. Caso new_window seja true, navega para uma rota de introdução usando o template "/{component}/intro".
   */
  go(component: string, new_window: boolean = false): void {

    this.new_window = new_window;
    if (new_window) {
      const introUrl = `/${component}/intro`;
      this.router.navigate([introUrl]); // Navega para a introdução no próprio app
    } else {
      this.router.navigate(['/' + component]);
    }
  }

}

