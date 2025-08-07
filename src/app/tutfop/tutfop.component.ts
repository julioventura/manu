// Alteração: remoção de logs de depuração (console.log)
/**
 * Componente TutFOP - Tutor Virtual de Casos Clínicos
 * 
 * Funcionalidade: Integra o chatbot TutFOP ao sistema Angular, usando autenticação 
 * existente e permitindo conversas com tutor virtual de casos clínicos.
 * 
 * Funções principais:
 * - ngOnInit(): Inicializa componente e subscreve dados do usuário
 * - ngOnDestroy(): Limpa subscriptions ao destruir componente
 * - initializeTutfop(): Inicializa scripts e configurações do TutFOP
 * - showChatInterface(): Exibe interface do chat e oculta tela de login
 * - updateUserInfo(): Atualiza informações do usuário na interface
 * - sendTutfopMessage(): Envia mensagem do usuário para o tutor virtual
 * - logoutTutfop(): Limpa chat
 * - setupEventListeners(): Configura listeners para eventos do DOM
 * 
 * Constantes:
 * - userNome: Nome do usuário autenticado
 * - userEmail: Email do usuário autenticado  
 * - userUid: UID único do usuário autenticado
 * - isUserAuthenticated: Status de autenticação do usuário
 * - webhookURL: URL do webhook para comunicação com TutFOP
 */

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../shared/services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilService } from '../shared/utils/util.service';

@Component({
  selector: 'app-tutfop',
  templateUrl: './tutfop.component.html',
  styleUrls: ['./tutfop.component.scss'],
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None // Para permitir que os estilos do TutFOP funcionem
})
export class TutfopComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  private readonly webhookURLprod = 'https://marte.cirurgia.com.br/webhook/TutFOP3';
  private webhookURL = this.webhookURLprod;
  
  userNome: string = '';
  userEmail: string = '';
  userUid: string = '';
  isUserAuthenticated: boolean = false;
  

  constructor(
    private userService: UserService,
    public util: UtilService,
  ) {
  }

  // ngOnInit(): Inicializa componente e subscreve dados do usuário
  ngOnInit(): void {
    // Subscrever aos dados do usuário
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userUid = user.uid;
          this.userEmail = user.email || '';
          // CORRIGIDO: garantir que o retorno seja string
          this.userNome = user.displayName || 
                         (this.userService.userProfile?.['nome'] as string) || 
                         '';
          this.isUserAuthenticated = true;
          
          // Inicializar o TutFOP após obter os dados do usuário
          this.initializeTutfop();
        } else {
          this.isUserAuthenticated = false;
        }
      });
  }

  // ngOnDestroy(): Limpa subscriptions ao destruir componente
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // initializeTutfop(): Inicializa scripts e configurações do TutFOP
  private initializeTutfop(): void {
    // Alteração: removidos logs de depuração e objeto inválido
    // Aguardar o DOM estar pronto e então inicializar
    setTimeout(() => {
      this.showChatInterface();
      this.updateUserInfo();
      this.setupEventListeners();
    }, 100);
  }


  // showChatInterface(): Exibe interface do chat e oculta tela de login
  private showChatInterface(): void {
    const loginContainer = document.getElementById("tutfop-login-container");
    const chatContainer = document.getElementById("tutfop-chat-container");
    
    if (loginContainer) loginContainer.style.display = "none";
    if (chatContainer) chatContainer.style.display = "block";
  }

  // updateUserInfo(): Atualiza informações do usuário na interface
  private updateUserInfo(): void {
    const userInfo = document.getElementById("tutfop-user-info");
    if (userInfo) {
      userInfo.innerText = `Usuário: ${this.userNome} - ${this.userEmail}`;
    }
  }

  // sendTutfopMessage(): Envia mensagem do usuário para o tutor virtual
  async sendTutfopMessage(): Promise<void> {
    const userInput = document.getElementById("tutfop-user-input") as HTMLTextAreaElement;
    const chatLog = document.getElementById("tutfop-chat-log") as HTMLElement;
    const sendButton = document.getElementById("tutfop-send-button") as HTMLButtonElement;

    if (!userInput || !chatLog) {
      console.error('[TutFOP] Elementos do chat não encontrados');
      return;
    }

    const message = userInput.value.trim();
    if (!message) {
      alert('Por favor, insira uma mensagem.');
      return;
    }

    // Adicionar mensagem do usuário
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<strong>Você:</strong> ${message}`;
    chatLog.appendChild(userMessage);
    
    // Limpar campo de entrada
    userInput.value = '';
    
    // Scroll para o final
    chatLog.scrollTop = chatLog.scrollHeight;

    // Desabilitar botão durante envio
    if (sendButton) {
      sendButton.disabled = true;
      sendButton.textContent = 'Enviando...';
      sendButton.style.backgroundColor = "#bbb";
    }

    // Adicionar indicador de carregamento
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'bot-message loading-message';
    loadingMessage.innerHTML = '<strong>Tutor Virtual:</strong> <em>Digitando...</em>';
    chatLog.appendChild(loadingMessage);
    chatLog.scrollTop = chatLog.scrollHeight;

    // Dados a serem enviados ao webhook
    const data = {
      tipo: 'mensagem',
      mensagem: message,
      nome: this.userNome,
      email: this.userEmail,
      chatbot_name: 'TutFOP',
      chatbot_user: 'd07a0db3-68a8-4326-9a1d-c6d8f1da4656',
      uid: this.userUid
    };

    console.log('[TutFOP] Enviando dados:', data);

    try {
      const response = await fetch(this.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Remover mensagem de carregamento
      if (loadingMessage.parentNode) {
        loadingMessage.parentNode.removeChild(loadingMessage);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let responseData: { response?: string } | null = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();

      if (contentType && contentType.includes('application/json') && responseText) {
        try {
          responseData = JSON.parse(responseText) as { response?: string };
        } catch (e) {
          console.error('[TutFOP][Webhook][ERRO] Falha ao fazer parse do JSON:', e, responseText);
          throw new Error('Resposta inválida do servidor');
        }
      } else {
        console.warn('[TutFOP][Webhook][AVISO] Resposta não é JSON ou está vazia.', { contentType, responseText });
        throw new Error('Resposta vazia do servidor');
      }

      if (responseData && responseData.response) {
        // Formatar resposta
        let formattedResponse = responseData.response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        formattedResponse = formattedResponse.replace(/\n/g, '<br>');
        
        // Adicionar resposta do bot
        const botMessage = document.createElement('div');
        botMessage.className = 'bot-message';
        botMessage.innerHTML = `<strong>Tutor Virtual:</strong> ${formattedResponse}`;
        chatLog.appendChild(botMessage);
        
        // Scroll para o final
        chatLog.scrollTop = chatLog.scrollHeight;
      } else {
        throw new Error('Resposta vazia do tutor virtual');
      }
    } catch (error) {
      console.error('[TutFOP][Webhook][ERRO] Falha na comunicação:', error);
      
      // Remover mensagem de carregamento se ainda estiver lá
      if (loadingMessage.parentNode) {
        loadingMessage.parentNode.removeChild(loadingMessage);
      }
      
      // Adicionar mensagem de erro
      const errorMessage = document.createElement('div');
      errorMessage.className = 'bot-message error-message';
      errorMessage.innerHTML = '<strong>Tutor Virtual:</strong> <em>Desculpe, houve um problema na comunicação. Tente novamente.</em>';
      chatLog.appendChild(errorMessage);
      chatLog.scrollTop = chatLog.scrollHeight;
      
    } finally {
      // Reabilitar botão
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = 'Enviar';
        sendButton.style.backgroundColor = "#4CAF50";
      }
    }
  }

  // logoutTutfop(): Limpa chat
  logoutTutfop(): void {
    const confirmation = confirm("Confirma limpar a conversa?");
    if (confirmation) {
      const chatLog = document.getElementById("tutfop-chat-log") as HTMLElement;
      if (chatLog) {
        // Limpar todas as mensagens exceto a mensagem inicial
        const initialMessage = chatLog.querySelector('.bot-message:first-child');
        chatLog.innerHTML = '';
        if (initialMessage) {
          chatLog.appendChild(initialMessage);
        } else {
          // Recriar mensagem inicial se não existir
          const botMessage = document.createElement('div');
          botMessage.className = 'bot-message';
          botMessage.innerHTML = `
            <strong>Tutor Virtual:</strong> 
            Olá! Eu sou o <b>TutFOP</b>, seu tutor virtual da <i>Clínica Integral 3</i>.<br />&nbsp;<br />
            A equipe de professores da <i>CI3</i> me chamou para te ajudar na construção de um plano de urgência seguro, ético e baseado em evidências para a paciente gestante que procurou nossa clínica-escola por meio da Teleodontologia.<br />
            Estou aqui para apoiar você, esclarecendo dúvidas, explorando condutas e estimulando seu raciocínio clínico.<br />&nbsp;<br />
            Vamos juntos nessa missão?
          `;
          chatLog.appendChild(botMessage);
        }
      }
    }
  }

  // goHome(): Navega para a página inicial
  goHome(): void {
    this.util.goHome();
  }

  // setupEventListeners(): Configura listeners para eventos do DOM
  private setupEventListeners(): void {
    const userInput = document.getElementById("tutfop-user-input") as HTMLTextAreaElement;
    if (userInput) {
      userInput.addEventListener("keypress", (event: KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          this.sendTutfopMessage();
        }
      });

      // Adicionar também listener para input para auto-resize
      userInput.addEventListener("input", () => {
        userInput.style.height = "auto";
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
      });
    }

    // Garantir que o chat log tenha foco inicial
    const chatLog = document.getElementById("tutfop-chat-log");
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }
}