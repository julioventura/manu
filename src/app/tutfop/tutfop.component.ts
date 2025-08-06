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
    const chatLog = document.getElementById("tutfop-chat-log");
    const sendButton = document.getElementById("tutfop-send-button") as HTMLButtonElement;

    if (!userInput || !chatLog) return;

    const message = userInput.value.trim();
    if (!message) {
      alert('Por favor, insira uma mensagem.');
      return;
    }

    // Adicionar mensagem do usuário
    const userMessage = `<div class="user-message"><strong>Você:</strong> ${message}</div>`;
    chatLog.innerHTML += userMessage;
    userInput.value = '';
    chatLog.scrollTop = chatLog.scrollHeight;

    // Desabilitar botão durante envio
    if (sendButton) {
      sendButton.disabled = true;
      sendButton.style.backgroundColor = "#bbb";
    }

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

    console.log('const data = ', data);

    try {
      const response = await fetch(this.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // CORRIGIR LINHA 171 - tipo any
      let responseData: { response?: string } | null = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();

      if (contentType && contentType.includes('application/json') && responseText) {
        try {
          responseData = JSON.parse(responseText) as { response?: string };
        } catch (e) {
          console.error('[TutFOP][Webhook][FASE 3][ERRO] Falha ao fazer parse do JSON:', e, responseText);
        }
      } else {
        console.warn('[TutFOP][Webhook][FASE 3][AVISO] Resposta não é JSON ou está vazia.', { contentType, responseText });
      }

      if (responseData && responseData.response) {
        let formattedResponse = responseData.response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        formattedResponse = formattedResponse.replace(/\n/g, '<br>');
        const botResponse = `<div class="bot-message"><strong>Tutor Virtual:</strong> ${formattedResponse}</div>`;
        chatLog.innerHTML += botResponse;
        chatLog.scrollTop = chatLog.scrollHeight;
      } else {
        alert('Erro ao processar mensagem. Tente novamente.');
        console.error('[TutFOP][Webhook][FASE 4][ERRO] Campo "response" não recebido do webhook.', responseData);
      }
    } catch (error) {
      console.error('[TutFOP][Webhook][FASE 5][ERRO] Falha na conexão ou processamento do webhook:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      // Reabilitar botão
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.style.backgroundColor = "#4CAF50";
      }
    }
  }

  // logoutTutfop(): Limpa chat
  logoutTutfop(): void {
    const confirmation = confirm("Confirma limpar a conversa?");
    if (confirmation) {
      const chatLog = document.getElementById("tutfop-chat-log");
      if (chatLog) chatLog.innerHTML = "";
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
        // Alteração: tipagem explícita do parâmetro event
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          this.sendTutfopMessage();
        }
      });
    }
  }
}