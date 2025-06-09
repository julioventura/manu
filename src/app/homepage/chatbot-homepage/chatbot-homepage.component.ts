// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewChecked, Output, EventEmitter } from '@angular/core';
import { AiHomepageService, Message } from './ai-homepage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot-homepage',
  templateUrl: './chatbot-homepage.component.html',
  styleUrls: ['./chatbot-homepage.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatbotHomepageComponent implements OnInit, AfterViewChecked {
  @Input() username: string = '';
  @Input() profileData: any;
  @Output() expansionChange = new EventEmitter<boolean>();
  
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  conversation: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  isMinimized: boolean = true;
  isMaximized: boolean = false;
  sessionId: string = '';
  shouldScrollToBottom: boolean = false;
  
  constructor(
    private aiHomepageService: AiHomepageService
  ) { }

  ngOnInit(): void {
    
    // Definir os dados do perfil no serviço
    if (this.profileData) {
      this.aiHomepageService.setProfileData(this.profileData);
    }
    
    // Inicializa a sessão do chat
    this.aiHomepageService.createNewSession(this.username).subscribe(
      sessionId => {
        this.sessionId = sessionId;
        // Mensagem de boas-vindas
        this.addBotMessage(`Olá! Sou o assistente virtual do Dr(a). ${this.profileData?.nome || this.username}. Como posso ajudar?`);
      }
    );
  }
  
  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }
  
  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Erro ao rolar para o final:', err);
    }
  }
  
  // Método para adicionar mensagem do bot à conversa
  addBotMessage(content: string): void {
    const botMessage: Message = {
      content: content,
      sender: 'bot',
      timestamp: new Date()
    };
    
    this.conversation.push(botMessage);
    this.shouldScrollToBottom = true;
    
    // Salvar mensagem no histórico
    if (this.sessionId) {
      this.aiHomepageService.saveMessageToHistory(this.sessionId, this.username, botMessage)
        .subscribe();
    }
  }
  
  // Método para enviar mensagem do usuário
  sendMessage(): void {
    if (!this.userInput.trim()) return;
    
    const userMessage: Message = {
      content: this.userInput,
      sender: 'user',
      timestamp: new Date()
    };
    
    // Adiciona mensagem do usuário à conversa
    this.conversation.push(userMessage);
    this.shouldScrollToBottom = true;
    
    // Salva a mensagem do usuário no histórico
    if (this.sessionId) {
      this.aiHomepageService.saveMessageToHistory(this.sessionId, this.username, userMessage)
        .subscribe();
    }
    
    const messageText = this.userInput;
    this.userInput = ''; // Limpa o input
    
    // Mostra indicador de carregamento
    this.isLoading = true;
    
    // Chama o serviço de IA com contexto do perfil
    this.aiHomepageService.sendMessage(
      messageText, 
      this.sessionId, 
      this.username, 
      this.profileData || this.aiHomepageService.getProfileData()
    ).subscribe({
      next: (response) => {
        // Adiciona resposta do bot à conversa
        this.conversation.push(response);
        this.shouldScrollToBottom = true;
        
        // Salva a resposta no histórico
        if (this.sessionId) {
          this.aiHomepageService.saveMessageToHistory(this.sessionId, this.username, response)
            .subscribe();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao obter resposta da IA', err);
        this.addBotMessage('Tive um problema para responder. Tente novamente mais tarde.');
        this.isLoading = false;
      }
    });
  }
  
  // Alterna o estado do chat (minimizado/expandido)
  toggleChat(): void {
    this.isMinimized = !this.isMinimized;
    this.expansionChange.emit(!this.isMinimized);
    if (!this.isMinimized) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }
  
  // Alterna entre tamanho normal e maximizado
  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
    setTimeout(() => this.scrollToBottom(), 0);
  }
}