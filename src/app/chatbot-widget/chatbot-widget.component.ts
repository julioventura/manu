import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked, AfterViewInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate, sequence } from '@angular/animations';
import { UserService } from '../shared/services/user.service';
import { AiChatService, Message, ChatContext } from './ai-chat.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';


import { ConfigService } from '../shared/services/config.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.scss'],
  animations: [
    trigger('expandAnimation', [
      state('minimized', style({
        height: '50px',
        opacity: 0.8
      })),
      state('expanded', style({
        height: '*',
        opacity: 1
      })),
      transition('minimized => expanded', [
        sequence([
          animate('200ms ease-out', style({ height: '*' })),
          animate('150ms ease-out', style({ opacity: 1 }))
        ])
      ]),
      transition('expanded => minimized', [
        sequence([
          animate('150ms ease-in', style({ opacity: 0.8 })),
          animate('200ms ease-in', style({ height: '50px' }))
        ])
      ])
    ])
  ]
})
/**
 * Atualizar o componente para evitar duplicação de mensagens
 */
export class ChatbotWidgetComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  // Adicionar subject para unsubscribe ao destruir o componente
  private destroy$ = new Subject<void>();

  // Adicionar variável para controlar se o componente foi inicializado
  // Isso pode ser útil para evitar chamadas desnecessárias ao serviço
  private isInitialized = false;

  // Propriedades básicas do chatbot
  isMinimized = true;
  isMaximized = false;
  // Manter propriedades existentes, mas mudar a lógica de conversation
  // Agora o conversation será exclusivamente alimentado pelo messageHistory$ do service
  conversation: Message[] = [];
  userInput = '';
  isLoading = false;
  sessionId = '';
  dentistId = '';
  waitingForName = true;
  shouldScrollToBottom = false;
  isScrolledToBottom = true;

  // Propriedades do contexto
  dentistName = '';
  dentistLocation = '';
  patientName = '';
  currentContext: ChatContext | null = null;
  showContextIndicator = false;  // ALTERADO PARA FALSE

  // Adicionar estas propriedades à classe
  // Controles para o popup de detalhes
  showDetailsPopup: boolean = false;
  isDetailsMaximized: boolean = false;
  detailsType: 'collection' | 'subcollection' = 'collection';
  detailsData: any = null;
  detailsTitle: string = 'Detalhes';

  // Adicionar estas propriedades à classe
  public isDragging: boolean = false;
  private dragStartX: number = 0;  // Posição inicial do mouse
  private dragStartY: number = 0;  // Posição inicial do mouse
  private initialRight: number = 0; // Posição inicial do chatbot
  private initialBottom: number = 0; // Posição inicial do chatbot
  public chatPosition = { right: 20, bottom: 20 }; // Posição padrão

  // Adicionar uma propriedade para evitar múltiplos cliques consecutivos
  private isTransitioning = false;

  constructor(
    private userService: UserService,
    public aiChatService: AiChatService, // Change to public
    private cdr: ChangeDetectorRef, // Injetar ChangeDetectorRef
    public configuracoes: ConfigService,
    private router: Router
  ) { }

  // Atualizar o método ngOnInit para usar o histórico de mensagens

  ngOnInit(): void {
    // Configuração inicial
    this.dentistId = this.userService.context?.dentistId || '';
    this.dentistName = this.userService.context?.dentistName || '';
    this.dentistLocation = this.userService.context?.location || '';
    this.patientName = this.userService.context?.patientName || '';

    // Seta o estado para o UserService
    this.userService.setChatbotExpanded(!this.isMinimized);

    // Inscrever-se nas atualizações de contexto
    this.aiChatService.context$
      .pipe(takeUntil(this.destroy$))
      .subscribe(context => {
        this.currentContext = context;
        this.cdr.detectChanges(); // Forçar detecção de mudanças
      });

    // IMPORTANTE: Inscrever-se APENAS no histórico de mensagens
    this.aiChatService.messageHistory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        // Log de diagnóstico integrado na única inscrição
        if (messages.length > 0) {
        }
        
        // Substituir completamente o array local pelo histórico do serviço
        this.conversation = [...messages];
        this.shouldScrollToBottom = true;
        this.cdr.detectChanges();
      });

    // Verificar se já existe uma conversa ou se é a primeira inicialização
    if (!this.isInitialized) {
      // Inicializa a sessão do chat apenas na primeira vez
      this.aiChatService.createNewSession(this.dentistId).subscribe(
        sessionId => {
          this.sessionId = sessionId;
          
          // Restaurar ou iniciar chat
          this.aiChatService.restoreOrStartChat();
          
          // Verificar se a restauração adicionou mensagens (em um timeout para garantir que a operação assíncrona terminou)
          setTimeout(() => {
            if (this.conversation.length === 0) {
              this.addFirstMessage();
            }
          }, 100);
          
          this.waitingForName = false;
          this.isInitialized = true;
        }
      );
    }

    // Inscrever-se no evento de limpeza de conversa
    this.aiChatService.clearConversation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Não precisamos limpar manualmente - o service já vai fazer isso
        // e emitir via messageHistory$
        this.userInput = '';
        this.isInitialized = false;

        // Após limpar, verificar se precisa adicionar a mensagem inicial novamente
        setTimeout(() => {
          if (this.conversation.length === 0) {
            this.addFirstMessage();
          }
        }, 100);
      });

    // Carregar posição salva
    this.loadChatPosition();
  }

  /**
   * Método dedicado para adicionar a primeira mensagem
   */
  private addFirstMessage(): void {
    // Verificar se já existe alguma mensagem para evitar duplicação
    if (this.conversation.length === 0) {
      const welcomeMessage: Message = {
        content: "Olá! Como posso ajudar?",
        sender: 'bot',
        timestamp: new Date()
      };
      
      // Adicionar via serviço para garantir consistência
      this.aiChatService.addMessageToHistory(welcomeMessage);
    }
  }
  
  ngAfterViewInit(): void {
    // Rolagem inicial
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      this.scrollToBottom();
    }
    
    // Garantir posicionamento correto do chatbot maximizado
    setTimeout(() => {
      if (this.isMaximized) {
        const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
        if (chatElement) {
          // Forçar centralização se estiver no modo maximizado
          chatElement.style.removeProperty('right');
          chatElement.style.left = '50%';
          chatElement.style.transform = 'translateX(-50%)';
        }
      }
      
      // Código existente para mensagem de boas-vindas...
      if (this.conversation.length === 0 && this.isInitialized) {
        this.addFirstMessage();
      }
    }, 500);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesContainer && this.messagesContainer.nativeElement) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // Importante: implementar OnDestroy para evitar memory leaks
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Atualizar sendMessage para não adicionar mensagens diretamente ao array conversation
  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage: Message = {
      content: this.userInput,
      sender: 'user',
      timestamp: new Date()
    };

    // Adicionar a mensagem do usuário ao histórico
    this.aiChatService.addMessageToHistory(userMessage);

    const messageText = this.userInput;
    this.userInput = ''; // Limpa o input

    // Mostra indicador de carregamento
    this.isLoading = true;

    // Atualiza o contexto antes de enviar
    this.currentContext = this.aiChatService.getCurrentContext();

    // Chama o serviço de IA com contexto ampliado
    const context = {
      dentistName: this.dentistName,
      location: this.dentistLocation,
      patientName: this.patientName,
      currentContext: this.currentContext
    };

    this.aiChatService.sendMessage(messageText, this.sessionId, this.dentistId, context)
      .subscribe({
        next: (response) => {
          // O serviço já adiciona a resposta ao histórico via addMessageToHistory
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao obter resposta da IA', err);
          this.isLoading = false;
          
          // Adicionar mensagem de erro amigável
          this.aiChatService.addMessageToHistory({
            content: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.',
            sender: 'bot',
            timestamp: new Date()
          });
        }
      });
  }

  // Helper para adicionar mensagem do bot
  addBotMessage(content: string): void {
    const botMessage: Message = {
      content,
      sender: 'bot',
      timestamp: new Date()
    };
    // Apenas adicionar ao histórico via serviço
    this.aiChatService.addMessageToHistory(botMessage);
  }

  // Métodos para controlar a exibição do chatbot
  // Corrigir o método toggleChat para garantir posição correta ao minimizar do modo maximizado
  toggleChat(): void {
    // Se estiver em transição, ignorar clique
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    // Se estiver maximizado e vamos minimizar, tratar como caso especial
    if (this.isMaximized && !this.isMinimized) {
      // Obter referência para o elemento
      const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
      
      // IMPORTANTE: Primeiro remover o estado maximizado
      this.isMaximized = false;
      
      // Remover todos os estilos de posicionamento central ANTES de minimizar
      chatElement.classList.remove('maximized');
      chatElement.classList.remove('manually-positioned');
      chatElement.style.removeProperty('left');
      chatElement.style.removeProperty('top');
      chatElement.style.removeProperty('transform');
      
      // Definir os valores padrão de posição para quando não está maximizado
      this.chatPosition.right = 20;
      this.chatPosition.bottom = 20;
      
      // Aplicar a posição padrão imediatamente
      chatElement.style.right = '20px';
      chatElement.style.bottom = '20px';
      
      // Minimizar após desmaximizar com um pequeno delay para permitir que os estilos sejam aplicados
      setTimeout(() => {
        this.isMinimized = true;
        this.userService.setChatbotExpanded(false);
        this.isTransitioning = false;
      }, 100);
    } else {
      // Comportamento normal para alternar entre minimizado e expandido
      const wasMinimized = this.isMinimized;
      this.isMinimized = !this.isMinimized;
      this.userService.setChatbotExpanded(!this.isMinimized);
      
      if (this.isMinimized) {
        // Ao minimizar, redefinir posição padrão
        const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
        if (chatElement) {
          chatElement.style.right = '20px';
          chatElement.style.bottom = '20px';
        }
        this.isTransitioning = false;
      } else if (wasMinimized) {
        // Se estava minimizado e agora está expandindo
        setTimeout(() => {
          const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
          if (chatElement) {
            chatElement.style.right = `${this.chatPosition.right}px`;
            chatElement.style.bottom = `${this.chatPosition.bottom}px`;
          }
          this.scrollToBottom();
          this.isTransitioning = false;
        }, 100);
      }
    }

    // Rolar para o final des mensagens se expandir
    if (!this.isMinimized) {
      setTimeout(() => {
        if (!this.isMaximized) {
          const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
          if (chatElement) {
            chatElement.style.right = `${this.chatPosition.right}px`;
            chatElement.style.bottom = `${this.chatPosition.bottom}px`;
          }
        }
        this.scrollToBottom();
      }, 100);
    }
  }

  // Corrigir o método toggleMaximize para garantir centralização no modo maximizado
  toggleMaximize(): void {
    // Se estiver em transição, ignorar clique
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    this.isMaximized = !this.isMaximized;
    
    // Obter elemento do chatbot
    const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
    if (!chatElement) {
      this.isTransitioning = false;
      return;
    }
    
    // Se estiver maximizando (indo para o estado maximizado)
    if (this.isMaximized) {
      // Remover qualquer posicionamento manual anterior
      chatElement.classList.remove('manually-positioned');
      
      // Limpar estilos inline que podem interferir na centralização
      chatElement.style.removeProperty('right');
      chatElement.style.removeProperty('top');
      
      // Aplicar centralização
      chatElement.style.left = '50%';
      chatElement.style.top = '50%';
      chatElement.style.transform = 'translate(-50%, -50%)';
      
      // Aguardar renderização e garantir rolagem para o final
      setTimeout(() => {
        this.scrollToBottom();
        this.isTransitioning = false;
      }, 300);
    } 
    // Se estiver voltando do maximizado para expandido
    else {
      // Restaurar posicionamento anterior
      setTimeout(() => {
        // Limpar estilos de centralização
        chatElement.style.removeProperty('left');
        chatElement.style.removeProperty('top');
        chatElement.style.transform = 'none';
        
        // Aplicar posição salva
        chatElement.style.right = `${this.chatPosition.right}px`;
        chatElement.style.bottom = `${this.chatPosition.bottom}px`;
        
        this.scrollToBottom();
        this.isTransitioning = false;
      }, 300);
    }
  }

  // Toggle para mostrar/ocultar indicador de contexto
  toggleContextIndicator(): void {
    this.showContextIndicator = !this.showContextIndicator;
  }

  // Controle de rolagem
  scrollToBottom(): void {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Erro ao rolar para o final:', err);
      }
    }
  }

  onMessagesScroll(): void {
    if (!this.messagesContainer || !this.messagesContainer.nativeElement) return;

    const element = this.messagesContainer.nativeElement;
    const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 50;
    this.isScrolledToBottom = atBottom;
  }

  /**
   * Formata o nome da coleção para exibição
   */
  formatCollectionName(collection?: string): string {
    if (!collection) return '';
    // Mapeamento de nomes de coleção para versões mais amigáveis
    const collectionNameMap: { [key: string]: string } = {
      'pacientes': 'Pacientes',
      'dentistas': 'Dentistas',
      'fornecedores': 'Fornecedores',
      'produtos': 'Produtos',
      'estoque': 'Estoque',
      'financeiro': 'Financeiro',
      'consultas': 'Consultas',
      'agendamentos': 'Agendamentos'
    };

    // Retorna o nome formatado ou capitaliza o original se não estiver no mapa
    return collectionNameMap[collection.toLowerCase()] ||
      this.capitalizeFirstLetter(collection);
  }

  /**
   * Formata o nome da subcoleção para exibição
   */
  formatSubcollectionName(subcollection?: string): string {
    if (!subcollection) return '';
    // Mapeamento de nomes de subcoleção para versões mais amigáveis
    const subcollectionNameMap: { [key: string]: string } = {
      'anamnese': 'Anamnese',
      'exames': 'Exames',
      'consultas': 'Consultas',
      'pagamentos': 'Pagamentos',
      'prontuario': 'Prontuário',
      'orcamentos': 'Orçamentos'
    };

    // Retorna o nome formatado ou capitaliza o original se não estiver no mapa
    return subcollectionNameMap[subcollection.toLowerCase()] ||
      this.capitalizeFirstLetter(subcollection);
  }

  /**
   * Formata o nome do registro para exibição
   */
  formatRecordName(name?: string): string {
    if (!name) return '';

    const maxLength = 25;
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  }

  /**
   * Formata o ID para exibição
   */
  formatId(id?: string): string {
    if (!id) return '';

    const maxLength = 8;
    return id.length > maxLength ? `${id.substring(0, 6)}...` : id;
  }

  /**
   * Capitaliza a primeira letra de uma string
   */
  private capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Verifica se estamos em uma view de subcollection
   */
  isSubcollectionView(): boolean {
    return this.currentContext?.currentView?.type === 'view-ficha' ||
      this.currentContext?.currentView?.type === 'edit-ficha';
  }

  /**
   * Verifica se a subcollection passada é a que estamos visualizando atualmente
   */
  isCurrentSubcollection(subcollection: string): boolean {
    if (!this.currentContext || !this.router.url) return false;

    // Verifica se a URL contém o nome desta subcollection
    return this.router.url.includes(`/fichas/${subcollection}/`);
  }

  /**
   * Obtém o nome do registro da subcollection quando disponível
   */
  getSubcollectionRecordName(): string | null {
    if (!this.isSubcollectionView() || !this.currentContext?.currentRecord?.data) {
      return null;
    }

    const data = this.currentContext.currentRecord.data;
    // Tentar vários possíveis nomes de campo
    return data.nome || data.title || data.titulo || null;
  }

  /**
   * Obtém o nome do registro principal, independente da visualização atual
   */
  getMainRecordName(): string {
    // Se estivermos em uma subcollection, buscar o nome do mainRecord de uma variável separada
    if (this.isSubcollectionView()) {
      // Essa informação deve vir de um campo que armazena o registro principal
      // Podemos usar o NavigationContext ou nossa hierarquia implementada
      const mainRecordData = this.aiChatService.getMainRecordData();
      if (mainRecordData?.nome) {
        return this.formatRecordName(mainRecordData.nome);
      }
    }

    // Caso contrário, usamos o registro atual normalmente
    return this.currentContext?.currentRecord?.data?.nome ?
      this.formatRecordName(this.currentContext.currentRecord.data.nome) : '';
  }

  /**
   * Verifica se estamos na visualização de list-fichas
   */
  isListFichasView(): boolean {
    return this.currentContext?.currentView?.type?.toLowerCase() === 'list-fichas';
  }

  // Método para mostrar/esconder o popup de detalhes da collection
  toggleCollectionDetails(): void {

    // Se já estiver mostrando detalhes da subcollection, feche
    if (this.showDetailsPopup && this.detailsType === 'subcollection') {
      this.showDetailsPopup = false;
      setTimeout(() => {
        this.showDetailsPopup = true;
        this.detailsType = 'collection';
        this.detailsData = this.aiChatService.getCurrentRecordData();
        this.detailsTitle = 'Detalhes: ' + this.currentContext?.currentRecord?.data?.nome;
      }, 300);
    } else {
      // Alternar visibilidade
      this.showDetailsPopup = !this.showDetailsPopup;

      if (this.showDetailsPopup) {
        this.detailsType = 'collection';
        this.detailsData = this.aiChatService.getCurrentRecordData();
        this.detailsTitle = 'Detalhes: ' + this.currentContext?.currentRecord?.data?.nome;
      }
    }
  }

  // Método para mostrar/esconder o popup de detalhes da subcollection
  toggleSubcollectionDetails(subcollection: string): void {
    // Se já estiver mostrando detalhes da collection, feche
    if (this.showDetailsPopup && this.detailsType === 'collection') {
      this.showDetailsPopup = false;
      setTimeout(() => {
        this.showDetailsPopup = true;
        this.detailsType = 'subcollection';
        this.detailsData = this.aiChatService.getLastSubcollectionRecord();
        this.detailsTitle = 'Ficha: ' + this.formatSubcollectionName(subcollection);
      }, 300);
    } else {
      // Alternar visibilidade
      this.showDetailsPopup = !this.showDetailsPopup;

      if (this.showDetailsPopup) {
        this.detailsType = 'subcollection';
        this.detailsData = this.aiChatService.getLastSubcollectionRecord();
        this.detailsTitle = 'Ficha: ' + this.formatSubcollectionName(subcollection);
      }
    }
  }

  // Método para maximizar/minimizar o popup de detalhes
  toggleDetailsMaximize(): void {
    this.isDetailsMaximized = !this.isDetailsMaximized;
  }

  // Método para formatar os dados de registro para exibição
  formatRecordDetailsForDisplay(data: any): { key: string, value: any }[] {
    return Object.entries(data)
      .filter(([key, value]) => {
        // Usar a variável key para filtrar campos que não devem ser exibidos
        if (['id', '_id', 'userId', 'password'].includes(key)) {
          return false;
        }
        // Verificar se o valor não é objeto ou array complexo
        return typeof value !== 'object' || value === null;
      })
      .map(([key, value]) => {
        // Formatar o nome do campo para exibição
        let formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

        // Formatar o valor para exibição
        let formattedValue = value;
        if (typeof value === 'boolean') {
          formattedValue = value ? 'Sim' : 'Não';
        } else if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
          formattedValue = new Date(value).toLocaleDateString();
        }

        return { key: formattedKey, value: formattedValue };
      })
      .sort((a, b) => a.key.localeCompare(b.key)); // Ordenar alfabeticamente
  }

  // Adicionar métodos para exibir detalhes
  showPatientDetails(): void {
    const patient = this.aiChatService.getCurrentCollectionRecord();
    if (patient) {
      console.table(patient);

      // Agora que calculateAge é público, isso funcionará
      let infoStr = `DETALHES DO PACIENTE:\n\n`;
      infoStr += `Nome: ${patient.nome || 'N/A'}\n`;
      infoStr += `Email: ${patient.email || 'N/A'}\n`;
      infoStr += `Telefone: ${patient.telefone || 'N/A'}\n`;
      infoStr += `Idade: ${this.aiChatService.calculateAge(patient.nascimento) || 'N/A'} anos\n`;
      infoStr += `Gênero: ${patient.genero || 'N/A'}\n\n`;  // Usar a propriedade genero diretamente

      alert(infoStr + 'Consulte o console para informações completas.');
    }
  }

  showClinicalDetails(): void {
    const clinical = this.aiChatService.getCurrentSubcollectionRecord();
    if (clinical) {
      console.table(clinical);

      // Construir uma string mais informativa para o alerta
      let infoStr = `DETALHES DA FICHA CLÍNICA:\n\n`;
      infoStr += `Tipo: ${clinical.tipo || 'N/A'}\n`;
      infoStr += `Data: ${clinical.data || 'N/A'}\n`;
      infoStr += `Procedimento: ${clinical.procedimento || 'N/A'}\n`;
      infoStr += `Dente: ${clinical.dente || 'N/A'}\n`;
      if (clinical.observacoes) {
        infoStr += `\nObservações: ${clinical.observacoes.substring(0, 100)}${clinical.observacoes.length > 100 ? '...' : ''}\n`;
      }

      alert(infoStr + '\nConsulte o console para informações completas.');
    }
  }

  trackByKey(_index: number, item: any): any {
    return item.id; // ou outra propriedade única
  }

  // Método melhorado para iniciar o arrasto
  // Atualizar o método startDrag para impedir arrasto no modo maximizado
  startDrag(event: MouseEvent): void {
    // Verificar se o clique foi em um botão
    const target = event.target as HTMLElement;
    if (target.closest('.maximize-button') || target.closest('.minimize-button')) {
      return;
    }
    
    // Não permitir arrasto quando minimizado OU maximizado
    if (this.isMinimized || this.isMaximized) return;
    
    // Evitar eventos padrão
    event.preventDefault();
    event.stopPropagation();
    
    // Marcar como em arrasto
    this.isDragging = true;
    
    // Registrar posição inicial do mouse
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    
    // Armazenar a posição inicial do chatbot
    this.initialRight = this.chatPosition.right;
    this.initialBottom = this.chatPosition.bottom;
    
    // Adicionar classes visuais
    document.body.classList.add('dragging-chatbot');
  }

  // Método melhorado para processar o arrasto
  // Atualizar o método onMouseMove para permitir apenas movimento horizontal
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    // Obter elemento do chatbot
    const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
    if (!chatElement) return;
    
    // Calcular o movimento com base na posição do mouse - APENAS HORIZONTAL
    const deltaX = this.dragStartX - event.clientX;
    // Ignorar movimento vertical
    
    // Calcular a nova posição baseada na posição inicial - APENAS HORIZONTAL
    let newRight = this.initialRight + deltaX;
    // Manter a posição vertical fixa
    let newBottom = this.initialBottom;
    
    // Obter as dimensões corretas do viewport
    const viewportWidth = document.documentElement.clientWidth;
    
    // Obter dimensões do chatbot
    const rect = chatElement.getBoundingClientRect();
    const chatWidth = rect.width;
    
    // Limites horizontais rigorosos - NUNCA ultrapassar as bordas da tela
    // Lado direito - não ultrapassar a borda direita da tela
    const minRight = 0;
    
    // Lado esquerdo - garantir que o chatbot não ultrapasse a borda esquerda
    const maxRight = viewportWidth - chatWidth;
    
    // Aplicar limites rigorosos
    newRight = Math.min(Math.max(minRight, newRight), maxRight);
    
    // Atualizar posição no objeto
    this.chatPosition.right = newRight;
    
    // Aplicar apenas a posição horizontal
    chatElement.style.right = `${newRight}px`;
  }

  // O método onMouseUp permanece praticamente o mesmo
  // Modificar o método onMouseUp para lidar com a finalização do arrasto no modo maximizado
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    document.body.classList.remove('dragging-chatbot');
    
    // Obter elemento do chatbot
    const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
    if (chatElement) {
      chatElement.classList.remove('dragging');
      
      // Validar posição final para garantir que o chatbot não tenha ultrapassado os limites
      const rect = chatElement.getBoundingClientRect();
      const viewportHeight = document.documentElement.clientHeight;
      
      // Se o chatbot ultrapassou o topo, reposicioná-lo
      if (rect.top < 0) {
        this.chatPosition.bottom = 0;
        chatElement.style.bottom = '0px';
      }
      
      // Se estiver no modo maximizado, manter o posicionamento manual
      if (this.isMaximized) {
        chatElement.classList.add('manually-positioned');
      }
      
      // Salvar a posição
      this.saveChatPosition();
    }
  }

  // Método para auxiliar o desenvolvimento - remover na produção
  private logChatPosition(message: string): void {
    const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
    if (!chatElement) return;
    
    const rect = chatElement.getBoundingClientRect();
  }

  // Método para salvar a posição
  private saveChatPosition(): void {
    try {
      localStorage.setItem('chatbot_right', this.chatPosition.right.toString());
      localStorage.setItem('chatbot_bottom', this.chatPosition.bottom.toString());
    } catch (error) {
      console.error('Erro ao salvar posição do chatbot:', error);
    }
  }

  // Método para carregar a posição salva
  private loadChatPosition(): void {
    try {
      // Se o chatbot estiver minimizado inicialmente, não precisamos carregar a posição
      if (this.isMinimized) return;

      const savedRight = localStorage.getItem('chatbot_right');
      const savedBottom = localStorage.getItem('chatbot_bottom');
      
      // Apenas carregar posição se existirem valores salvos
      if (savedRight) this.chatPosition.right = parseFloat(savedRight);
      if (savedBottom) this.chatPosition.bottom = parseFloat(savedBottom);
      
      // Aplicar posição carregada
      setTimeout(() => {
        if (!this.isMinimized && !this.isMaximized) {
          const chatElement = document.querySelector('.chatbot-container') as HTMLElement;
          if (chatElement) {
            chatElement.style.right = `${this.chatPosition.right}px`;
            chatElement.style.bottom = `${this.chatPosition.bottom}px`;
          }
        }
      }, 0);
    } catch (error) {
      console.error('Erro ao carregar posição do chatbot:', error);
    }
  }
}
