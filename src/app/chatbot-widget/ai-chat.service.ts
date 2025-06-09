import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { catchError, map, delay, switchMap, tap, take, filter } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../../environments/environment';
import { UserService } from '../shared/services/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { SubcolecaoService } from '../shared/services/subcolecao.service';
import { FirestoreService } from '../shared/services/firestore.service';


// Interface para Navegação
export interface NavigationContext {
  viewType?: string;
  collection?: string;
  id?: string;
  subcollection?: string;
  itemId?: string;
}

// Interface de Contexto
export interface PatientRecord {
  id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  nascimento?: string;
  genero?: string;  // Adicionar propriedade explícita
  [key: string]: any;  // Campos adicionais
}

export interface ClinicalRecord {
  id: string;
  tipo: string;  // Ex: 'tratamentos', 'diagnosticos'
  data?: string;
  procedimento?: string;
  dente?: string;
  observacoes?: string;
  [key: string]: any;  // Campos adicionais
}

export interface ChatContext {
  currentView?: {
    type: string;
    id?: string;
    name?: string;
  };
  activeCollection?: string;
  activeSubcollections?: string[];
  
  // Registro atual (compatibilidade)
  currentRecord?: {
    id: string;
    data: any;
  };
  
  // Registro da coleção principal (paciente)
  patientRecord?: PatientRecord;
  
  // Registro da subcoleção (ficha clínica)
  clinicalRecord?: ClinicalRecord;
  
  navigationHistory?: {
    lastCollection?: string;
    lastId?: string;
    lastSubcollection?: string;
    lastItemId?: string;
  };
  hierarchy?: {
    [collection: string]: {
      [id: string]: {
        data?: any;  // Dados do registro principal
        subcollections?: {
          [subcollection: string]: {
            [itemId: string]: any;  // Dados do registro da subcollection
          }
        }
      }
    }
  };
  pageData?: any; // Mantido por compatibilidade
}

// Interface para mensagem
export interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Interface para resposta da OpenAI
interface OpenAIResponse {
  choices: [{
    message: {
      content: string;
    }
  }];
}

// Adicionar após as importações existentes

/**
 * Atualiza o serviço para suportar histórico de mensagens
 */
@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private openaiApiUrl = environment.openaiApiUrl;
  private openaiModel = environment.openaiModel;
  private currentContext: ChatContext = {};
  
  // Propriedade para armazenar o ID do usuário atual
  private userId: string | null = null;
  
  // BehaviorSubject para emitir atualizações de contexto
  private contextSubject = new BehaviorSubject<ChatContext>({});
  
  // Subject para emitir eventos de limpeza da conversa
  private clearConversationSubject = new Subject<void>();
  
  // NOVA PROPRIEDADE: Armazenar o histórico de mensagens
  private messageHistorySubject = new BehaviorSubject<Message[]>([]);
  private messageHistory: Message[] = [];
  
  // NOVA CONSTANTE: Limite de mensagens no histórico
  private readonly MAX_HISTORY_SIZE = 100;
  
  // Fallback responses para quando a API falha
  private fallbackResponses = [
    "Desculpe, estou tendo dificuldades para processar sua solicitação no momento.",
    "Parece que estou com problemas de conexão. Pode tentar novamente?",
    "Ops! Algo deu errado. Poderia reformular sua pergunta?",
    "Não consegui processar isso agora. Tente novamente em alguns instantes.",
    "Estou com dificuldades técnicas. Seria possível tentar novamente?"
  ];
  
  // Expor observables para os componentes se inscreverem
  public context$ = this.contextSubject.asObservable();
  public clearConversation$ = this.clearConversationSubject.asObservable();
  // NOVO OBSERVABLE: Expor as mensagens do histórico
  public messageHistory$ = this.messageHistorySubject.asObservable();
  
  // Propriedade para armazenar dados de registros
  private mainRecordData: any = null;
  
  // Propriedade para armazenar dados contextuais
  private contextData: any = {};
  
  // BehaviorSubject para emitir dados clínicos processados
  private clinicalContextSubject = new BehaviorSubject<any>({});
  public clinicalContext$ = this.clinicalContextSubject.asObservable();

  // MÉTODOS NOVOS PARA GERENCIAR HISTÓRICO DE MENSAGENS
  
  /**
   * Adiciona uma mensagem ao histórico
   */
  public addMessageToHistory(message: Message): void {
    // Adicionar ao array para manter ordem cronológica
    this.messageHistory.push(message);
    
    // Se exceder o tamanho máximo, remover as mensagens mais antigas
    if (this.messageHistory.length > this.MAX_HISTORY_SIZE) {
      this.messageHistory = this.messageHistory.slice(-this.MAX_HISTORY_SIZE);
    }
    
    // Salvar o histórico no localStorage se possível
    this.saveHistoryToLocalStorage();
    
    // Emitir o histórico atualizado APENAS UMA VEZ
    this.messageHistorySubject.next([...this.messageHistory]);
  }
  
  /**
   * Obtém o histórico de mensagens atual
   */
  public getMessageHistory(): Message[] {
    return [...this.messageHistory];
  }
  
  /**
   * Limpa o histórico de mensagens
   */
  private clearMessageHistory(): void {
    this.messageHistory = [];
    this.messageHistorySubject.next([]);
    this.clearHistoryFromLocalStorage();
  }
  
  /**
   * Salva o histórico no localStorage
   */
  private saveHistoryToLocalStorage(): void {
    try {
      // Usar o UID ou dentistId como parte da chave
      const storageKey = `chat_history_${this.userId || 'anonymous'}`;
      localStorage.setItem(storageKey, JSON.stringify(this.messageHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico no localStorage:', error);
    }
  }
  
  /**
 * Carrega o histórico do localStorage
 */
  public loadHistoryFromLocalStorage(): void {
    try {
      // Usar o UID ou dentistId como parte da chave
      const storageKey = `chat_history_${this.userId || 'anonymous'}`;
      const storedHistory = localStorage.getItem(storageKey);

      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory) as Message[];

        // Converter timestamps de string para Date
        const history = parsedHistory.map(msg => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }));

        // Se o histórico está vazio, não substituir o atual
        if (history.length > 0) {
          this.messageHistory = history;
          this.messageHistorySubject.next([...this.messageHistory]);
        } else {
          // Se carregamos um histórico vazio, não fazer nada - startNewChat será chamado depois
        }
      } else {
        // Não iniciar nova conversa aqui - isso será feito pelo restoreOrStartChat
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
      // Não iniciar nova conversa aqui - isso será feito pelo restoreOrStartChat
    }
  }
  
  /**
   * Remove o histórico do localStorage
   */
  private clearHistoryFromLocalStorage(): void {
    try {
      const storageKey = `chat_history_${this.userId || 'anonymous'}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Erro ao limpar histórico do localStorage:', error);
    }
  }

  // ATUALIZAR MÉTODOS EXISTENTES
  
  /**
   * Limpa completamente o contexto e a conversa do chatbot
   */
  public resetContext(): void {
    
    // Limpar contexto
    this.currentContext = {
      currentView: {
        type: 'Home'
      }
    };
    
    // Limpar histórico de conversa
    this.clearConversationSubject.next();
    this.clearMessageHistory(); // ADICIONADO: limpar histórico
    
    // Limpar dados armazenados
    this.mainRecordData = null;
    this.contextSubject.next({...this.currentContext});
    
  }




  // Este é o método sendMessage correto a ser mantido
  sendMessage(message: string, sessionId: string, dentistId: string, context?: any): Observable<Message> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiApiKey}`
    });

    // Obter configuração do chatbot
    return this.getDentistChatbotConfig(dentistId).pipe(
      switchMap((config: any) => {
        // Adicionar o histórico recente ao contexto
        const recentHistory = this.messageHistory.slice(-5).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

        // Mesclando contexto existente com novo contexto da página atual
        const enhancedContext = {
          ...context,
          dentistName: this.userService.context?.dentistName,
          location: this.userService.context?.location,
          patientName: this.userService.context?.patientName,
          userRole: this.userService.userProfile?.role || 'dentista',
          currentView: this.currentContext.currentView?.type,
          viewName: this.currentContext.currentView?.name,
          collection: this.currentContext.activeCollection,
          subcollections: this.currentContext.activeSubcollections,
          pageData: this.currentContext.pageData,
          conversationHistory: recentHistory // Adicionar histórico recente
        };

        // Constrói um prompt de sistema contextualizado
        const systemPrompt = config.systemPrompt || this.buildContextualSystemPrompt(enhancedContext);

        // Preparar mensagens incluindo histórico recente
        const messages = [
          { role: 'system', content: systemPrompt }
        ];

        // Adicionar histórico recente (limitado a 5 mensagens)
        if (recentHistory.length > 0) {
          messages.push(...recentHistory);
        }

        // Adicionar a mensagem atual do usuário
        messages.push({ role: 'user', content: message });

        const payload = {
          model: this.openaiModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        };


        return this.http.post<OpenAIResponse>(this.openaiApiUrl, payload, { headers }).pipe(
          map(response => {
    
            // Verificar se a resposta tem a estrutura esperada
            if (!response.choices || !response.choices[0] || !response.choices[0].message) {
              console.error('Estrutura de resposta inválida da OpenAI:', response);
              throw new Error('Formato de resposta inválido');
            }
            
            const botMessage: Message = {
              content: response.choices[0].message.content.trim(),
              sender: 'bot',
              timestamp: new Date()
            };
            
            // Adicionar a resposta ao histórico
            this.addMessageToHistory(botMessage);
            
            return botMessage;
          }),
          catchError(error => {
            console.error('Erro ao chamar API:', error);
            return this.createFallbackResponse();
          })
        );
      }),
      catchError(error => {
        console.error('Erro ao preparar requisição OpenAI:', error);
        return this.createFallbackResponse();
      })
    );
  }


  /**
   * Método para salvar mensagem no histórico
   */
  saveMessageToHistory(_sessionId: string, _dentistId: string, message: Message): Observable<boolean> {
    // Como este método é chamado tanto diretamente quanto via sendMessage,
    // vamos verificar se esta mensagem já existe no histórico antes de adicionar novamente
    const messageExists = this.messageHistory.some(msg =>
      msg.content === message.content &&
      msg.sender === message.sender &&
      Math.abs((msg.timestamp as Date).getTime() - (message.timestamp as Date).getTime()) < 1000
    );

    if (!messageExists) {
      this.addMessageToHistory(message);
    }

    // Retornar sucesso
    return of(true);
  }


  // Atualizar o construtor para carregar histórico ao inicializar
  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private firestoreService: FirestoreService<any>, // Adicionar FirestoreService
    private userService: UserService,
    private router: Router,
    private subcolecaoService: SubcolecaoService
  ) {
    // Obter o ID do usuário do UserService
    this.userService.getUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;  // Usar SOMENTE o UID
        
        // Carregar histórico depois de definir o userId
        this.loadHistoryFromLocalStorage();
      } else {
        this.userId = null;
        console.warn('⚠️ Usuário não autenticado');
      }
    });
    
    // Monitorar o contexto de navegação do UserService
    this.userService.navigationContext$.subscribe(navContext => {
      this.updateContextFromNavigation(navContext);
      
      // Se o contexto tem um registro, atualizar explicitamente o currentRecord
      if (navContext.currentRecord) {
        this.currentContext.currentRecord = {
          id: navContext.currentRecord.id,
          data: navContext.currentRecord.data
        };
        
        // Se o contexto tem uma visualização mas não tem nome, tentar pegar do registro
        if (this.currentContext.currentView && !this.currentContext.currentView.name && navContext.currentRecord.data) {
          const recordData = navContext.currentRecord.data;
          
          // Tentar diferentes campos possíveis para o nome
          const possibleNameFields = ['nome', 'name', 'title', 'titulo', 'descricao'];
          for (const field of possibleNameFields) {
            if (recordData[field]) {
              this.currentContext.currentView.name = recordData[field];
              break;
            }
          }
        }
        
        // Emitir atualização após adicionar o registro
        this.contextSubject.next({...this.currentContext});
        
      }
    });
    
    // Continuar monitorando eventos de navegação para casos especiais
    // this.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd),
    //   tap((event: NavigationEnd) => {
    //     // Apenas para logging e casos especiais não capturados pelo UserService
    //   })
    // ).subscribe();

    // Use the updateContextFromUrl method with router events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap((event: NavigationEnd) => {
        // Call updateContextFromUrl when navigation happens
        this.updateContextFromUrl(event.url);
      })
    ).subscribe();
  }

  // Novo método para atualizar o contexto a partir do navegation context
  private updateContextFromNavigation(navContext: NavigationContext): void {
    // Não resetar completamente o contexto, apenas atualizá-lo
    // this.currentContext = {}; <- Remover este reset

    if (!this.currentContext) {
      this.currentContext = {};
    }

    if (navContext.viewType) {
      // Preservar collection e registro quando acessa list-fichas
      const isListFichas = navContext.viewType.toLowerCase() === 'list-fichas';
      
      // Atualizar tipo de visualização sempre
      this.currentContext.currentView = {
        ...this.currentContext.currentView,
        type: navContext.viewType
      };
      
      // Adicionar collection como activeCollection (se não for list-fichas ou não tivermos uma collection)
      if (navContext.collection && (!isListFichas || !this.currentContext.activeCollection)) {
        this.currentContext.activeCollection = navContext.collection;
        
        // Se temos um ID e não estamos em list-fichas ou não temos dados do registro
        if (navContext.id && (!isListFichas || !this.mainRecordData)) {
          this.currentContext.currentView.id = navContext.id;
          
          // Carregar detalhes apenas se ainda não tivermos
          if (!this.mainRecordData || this.mainRecordData._id !== navContext.id) {
            this.loadEntityDetails(navContext.collection, navContext.id);
          }
        } else {
          // Se não temos ID, chamamos loadContextDataForView para pelo menos configurar informações básicas
          this.loadContextDataForView(navContext.collection, undefined);
        }
        
        // Se temos uma subcollection, adicionamos à lista de subcollections
        if (navContext.subcollection) {
          this.currentContext.activeSubcollections = [navContext.subcollection];
          
          // Se estamos em list-fichas, mantemos os dados do registro principal
          if (isListFichas && this.mainRecordData) {
            
            // Garantir que o registro principal está no contexto atual
            if (!this.currentContext.currentRecord || this.currentContext.currentRecord.id !== navContext.id) {
              this.currentContext.currentRecord = {
                id: navContext.id!,
                data: this.mainRecordData
              };
            }
          }
          
          // Se temos um item específico da subcollection
          if (navContext.itemId) {
            this.loadFichaDetails(
              navContext.collection, 
              navContext.id!, 
              navContext.subcollection, 
              navContext.itemId
            );
          }
        } else if (navContext.id) {
          // Se temos um ID mas não uma subcollection, verificamos subcoleções disponíveis
          this.checkAvailableSubcollections(navContext.collection, navContext.id);
        }
      }
    }
    
    // Log de contexto para debugging
    this.logContextUpdate();
    
    // Emitir a atualização do contexto para componentes inscritos
    this.contextSubject.next({...this.currentContext});
  }

  // Método melhorado para carregar dados específicos para o contexto
  private loadContextDataForView(viewType: string, id?: string): void {
    // Defina conjuntos conhecidos de coleções principais
    const knownCollections = ['pacientes', 'dentistas', 'fornecedores', 'produtos', 'agenda'];
    
    // Se o viewType corresponder a uma coleção conhecida, defina como activeCollection
    if (knownCollections.includes(viewType.toLowerCase())) {
      this.currentContext.activeCollection = viewType.toLowerCase();
      
      // Se temos um ID, carregamos os detalhes da entidade
      if (id) {
        this.loadEntityDetails(viewType, id);
      }
    } else {
      // Para outros casos, tentar inferir o que é esta rota
      switch(viewType.toLowerCase()) {
        case 'dashboard':
        case 'home':
          this.currentContext.currentView!.name = 'Dashboard';
          break;
          
        case 'config':
        case 'configuracoes':
          this.currentContext.currentView!.name = 'Configurações';
          break;
          
        case 'list':
          if (id) {
            this.currentContext.activeCollection = id;
            this.currentContext.currentView!.name = `Lista de ${id}`;
          }
          break;
          
        default:
          // Se não conseguirmos identificar, usar o próprio viewType
          if (!this.currentContext.activeCollection) {
            this.currentContext.activeCollection = viewType;
          }
      }
    }
  }
  
  /**
   * Armazena o registro principal para exibição mesmo durante visualização de subcollection
   */
  
  // Método para carregar detalhes de uma entidade específica
  private loadEntityDetails(collectionType: string, id: string): void {
    if (!this.userId) {
      console.error('Erro: ID de usuário não disponível. Verifique se o usuário está autenticado.');
      return;
    }

    let registroPath = `users/${this.userId}/${collectionType}`;

    // CORREÇÃO: Verificar se o caminho está usando email em vez de UID
    registroPath = this.verificarECorrigirCaminho(registroPath);


    this.firestoreService.getRegistroById(registroPath, id)
      .pipe(take(1))
      .subscribe({
        next: (entityData) => {
          if (entityData) {

            // Armazenar para uso em outros componentes e visualizações
            this.mainRecordData = entityData;

            // Atualizar contexto atual
            if (this.currentContext.currentView) {
              this.currentContext.currentView.name = this.extractDisplayName(entityData);
            }

            // Compatibilidade com código existente
            this.currentContext.currentRecord = {
              id: id,
              data: entityData
            };

            // Novo: Preencher patientRecord com dados limpos
            this.currentContext.patientRecord = this.sanitizePatientData({
              id: id,
              ...entityData
            });

            // Limpar o registro clínico quando carregamos um novo paciente
            this.currentContext.clinicalRecord = undefined;

            // Atualizar a hierarquia
            this.updateHierarchyMainRecord(collectionType, id, entityData);

            // Processar dados do paciente para o chatbot
            this.processPatientContext(id, entityData);

            // Emitir contexto atualizado
            this.emitUpdatedContext();
          } else {
            console.warn(`⚠️ Documento não encontrado: ${registroPath}/${id}`);

            // Criar um registro vazio para evitar erros de UI
            this.currentContext.patientRecord = {
              id: id,
              nome: '[Erro ao carregar]'
            };

            // Emitir mesmo com erro
            this.contextSubject.next({ ...this.currentContext });
          }
        },
        error: (err) => {
          console.error(`❌ Erro ao carregar ${collectionType}/${id}:`, err);
        }
      });
  }
  
  /**
   * Método público para acessar dados do registro principal
   */
  getMainRecordData(): any {
    return this.mainRecordData;
  }
  
  // Método para processar dados do paciente// Método para carregar detalhes de uma ficha específica
  private loadFichaDetails(collectionType: string, entityId: string, subcollection: string, fichaId: string): void {
    if (!this.userId) {
      console.error('Erro: ID de usuário não disponível. Verifique se o usuário está autenticado.');
      return;
    }

    let fichaPath = `users/${this.userId}/${collectionType}/${entityId}/fichas/${subcollection}/itens`;

    // CORREÇÃO: Verificar se o caminho está usando email em vez de UID
    fichaPath = this.verificarECorrigirCaminho(fichaPath);


    this.firestoreService.getRegistroById(fichaPath, fichaId)
      .pipe(take(1))
      .subscribe({
        next: (fichaData) => {
          if (fichaData) {

            // Atualizar o nome na visualização atual
            if (this.currentContext.currentView && this.currentContext.currentView.type !== 'list-fichas') {
              this.currentContext.currentView.name = this.extractDisplayName(fichaData, subcollection);
            }

            // Manter compatibilidade
            this.currentContext.currentRecord = {
              id: fichaId,
              data: fichaData
            };

            // Novo: Preencher clinicalRecord
            this.currentContext.clinicalRecord = {
              id: fichaId,
              tipo: subcollection,
              ...fichaData
            };

            // Atualizar hierarquia
            this.updateHierarchySubcollectionRecord(
              collectionType, entityId, subcollection, fichaId, fichaData
            );

            // Processar o contexto clínico
            this.processClinicalContext(entityId, fichaData, subcollection);

            // Emitir contexto atualizado
            this.emitUpdatedContext();
          } else {
            console.warn(`⚠️ Ficha não encontrada: ${fichaPath}/${fichaId}`);

            // Criar um registro vazio para evitar erros de UI
            this.currentContext.clinicalRecord = {
              id: fichaId,
              tipo: subcollection
            };

            // Emitir mesmo com erro
            this.contextSubject.next({ ...this.currentContext });
          }
        },
        error: (err) => {
          console.error(`❌ Erro ao carregar ficha ${subcollection}/${fichaId}:`, err);
        }
      });
  }
  
  // Método para verificar subcoleções disponíveis para uma entidade
  private checkAvailableSubcollections(collectionType: string, id: string): void {
    // Resetar subcoleções existentes
    this.currentContext.activeSubcollections = [];

    // Obter todas as subcoleções possíveis do SubcolecaoService
    const possibleSubcollections = this.subcolecaoService.getSubcolecoesDisponiveis().map(sc => sc.nome);

    // CORREÇÃO: Usar this.userId em vez de misturar fontes
    if (!this.userId) {
      console.error('Erro: ID de usuário não disponível em checkAvailableSubcollections');
      return;
    }

    // Contador para controlar quando todas as verificações foram concluídas
    let pendingChecks = possibleSubcollections.length;

    // Verificar cada subcoleção possível
    possibleSubcollections.forEach(subcollection => {
      // CORREÇÃO: Usar this.userId diretamente
      const subcollectionPath = `users/${this.userId}/${collectionType}/${id}/fichas/${subcollection}/itens`;

      this.firestore.collection(subcollectionPath).get().subscribe(snapshot => {
        if (!snapshot.empty) {
          // Se a subcoleção não estiver vazia, adicioná-la à lista
          if (!this.currentContext.activeSubcollections) {
            this.currentContext.activeSubcollections = [];
          }
          if (!this.currentContext.activeSubcollections.includes(subcollection)) {
            this.currentContext.activeSubcollections.push(subcollection);
          }
        }

        // Decrementar o contador de verificações pendentes
        pendingChecks--;

        // Se todas as verificações foram concluídas, emitir atualização
        if (pendingChecks === 0) {
          // Emitir a atualização do contexto
          this.contextSubject.next({ ...this.currentContext });
        }
      });
    });
  }

  // Método para atualizar registro principal na hierarquia
  private updateHierarchyMainRecord(collection: string, id: string, data: any): void {
    if (!this.currentContext.hierarchy) {
      this.currentContext.hierarchy = {};
    }
    
    if (!this.currentContext.hierarchy[collection]) {
      this.currentContext.hierarchy[collection] = {};
    }
    
    if (!this.currentContext.hierarchy[collection][id]) {
      this.currentContext.hierarchy[collection][id] = {};
    }
    
    this.currentContext.hierarchy[collection][id].data = data;
    
    // Atualizar o histórico de navegação
    if (!this.currentContext.navigationHistory) {
      this.currentContext.navigationHistory = {};
    }
    
    this.currentContext.navigationHistory.lastCollection = collection;
    this.currentContext.navigationHistory.lastId = id;
    
  }

  // Método para atualizar registro de subcollection na hierarquia
  private updateHierarchySubcollectionRecord(
    collection: string, 
    id: string, 
    subcollection: string, 
    itemId: string, 
    data: any
  ): void {
    // Garantir que a estrutura existe
    if (!this.currentContext.hierarchy) {
      this.currentContext.hierarchy = {};
    }
    
    if (!this.currentContext.hierarchy[collection]) {
      this.currentContext.hierarchy[collection] = {};
    }
    
    if (!this.currentContext.hierarchy[collection][id]) {
      this.currentContext.hierarchy[collection][id] = {};
    }
    
    if (!this.currentContext.hierarchy[collection][id].subcollections) {
      this.currentContext.hierarchy[collection][id].subcollections = {};
    }
    
    if (!this.currentContext.hierarchy[collection][id].subcollections![subcollection]) {
      this.currentContext.hierarchy[collection][id].subcollections![subcollection] = {};
    }
    
    // Atualizar os dados
    this.currentContext.hierarchy[collection][id].subcollections![subcollection][itemId] = data;
    
    // Atualizar o histórico de navegação
    if (!this.currentContext.navigationHistory) {
      this.currentContext.navigationHistory = {};
    }
    
    this.currentContext.navigationHistory.lastCollection = collection;
    this.currentContext.navigationHistory.lastId = id;
    this.currentContext.navigationHistory.lastSubcollection = subcollection;
    this.currentContext.navigationHistory.lastItemId = itemId;
    
  }


  // Log visual do contexto atual
  private logContextUpdate(): void {
    
    if (this.currentContext.activeSubcollections?.length) {
    }
    
    if (this.currentContext.pageData) {
    }
  }
  // Adicionar após o logContextUpdate()

  /**
   * Log completo e detalhado do contexto atual
   */
  private logDetailedContext(): void {
    console.group('%c CONTEXTO DETALHADO DO CHATBOT ', 'background: #4b0082; color: white; padding: 4px; font-weight: bold;');
    
    console.group('📊 Visão Geral:');
    console.groupEnd();
    
    console.group('🧑 Registro Principal (Collection):');
    if (this.currentContext.patientRecord) {
    } else {
    }
    console.groupEnd();
    
    console.group('📋 Registro de Ficha (Subcollection):');
    if (this.currentContext.clinicalRecord) {
    } else {
    }
    console.groupEnd();
    
    console.group('🧠 Estado Completo do Contexto:');
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * Log detalhado dos dados dos registros da collection e subcollection
   */
  private logRecordsData(): void {
    console.group('%c DADOS DOS REGISTROS ATUAL ', 'background: #008080; color: white; padding: 4px; font-weight: bold;');
    
    // Collection (Paciente)
    console.group('🧑 DADOS DA COLLECTION:');
    if (this.currentContext.patientRecord) {
    } else {
    }
    console.groupEnd();
    
    // Subcollection (Ficha)
    console.group('📋 DADOS DA SUBCOLLECTION:');
    if (this.currentContext.clinicalRecord) {
    } else {
    }
    console.groupEnd();
    
    console.groupEnd();
  }


  /**
   * Verifica e corrige caminhos do Firestore que possam estar usando email em vez de UID
   */
  private verificarECorrigirCaminho(caminho: string): string {
    // Se o caminho contém um email em vez de UID
    if (caminho.includes('@')) {
      console.warn(`⚠️ Caminho com email detectado: ${caminho}`);

      // Se temos um userId válido, substituir
      if (this.userId) {
        const caminhoCorrigido = caminho.replace(/users\/[^\/]+\//, `users/${this.userId}/`);
        return caminhoCorrigido;
      } else {
        console.error('❌ Não foi possível corrigir o caminho: userId não disponível');
      }
    }

    return caminho;
  }


  // Método para construir um prompt de sistema contextualizado
  private buildContextualSystemPrompt(context: any): string {
    let prompt = `Você é um assistente virtual odontológico para o consultório do Dr(a). ${context.dentistName || 'Fulano'}.\n`;
    prompt += `Forneça informações sobre Odontologia, de forma cordial e profissional.\n`;
    
    // Adiciona informações profissionais do dentista
    if (context.dentistSpecialty) {
      prompt += `O dentista é especializado em ${context.dentistSpecialty}.\n`;
    }
    
    // Informações sobre a localização
    if (context.location) {
      prompt += `O consultório está localizado em ${context.location}.\n`;
    }
    
    // Adiciona o contexto da página atual
    if (context.currentView) {
      prompt += `\nCONTEXTO ATUAL: O usuário está na seção "${context.currentView}"`;
      
      if (context.viewName) {
        prompt += ` visualizando "${context.viewName}".\n`;
      } else {
        prompt += ".\n";
      }
    }
    
    // Se estiver visualizando uma coleção específica
    if (context.collection) {
      prompt += `\nColeção atual: ${context.collection}\n`;
      
      // Se houver um registro específico
      if (context.currentRecord?.id) {
        prompt += `Registro ID: ${context.currentRecord.id}\n`;
        
        // Se houver dados do registro
        if (context.currentRecord.data) {
          const data = context.currentRecord.data;
          prompt += "Informações do registro atual:\n";
          
          // Mostrar os campos principais do registro
          Object.keys(data).forEach(key => {
            // Filtrar apenas campos simples (strings, números, datas)
            if (typeof data[key] !== 'object' && data[key] !== null) {
              prompt += `- ${key}: ${data[key]}\n`;
            }
          });
        }
      }
      
      // Se houver subcoleções disponíveis
      if (context.subcollections && context.subcollections.length > 0) {
        prompt += "\nFichas disponíveis:\n";
        context.subcollections.forEach((subcol: string) => {
          prompt += `- ${subcol}\n`;
        });
        prompt += "\nVocê pode fornecer sugestões ou análises baseadas nestas fichas.\n";
      }
    }
    
    // Instruções finais
    prompt += "\nResponda de forma concisa, profissional e útil. Evite respostas vagas. Forneça sugestões práticas quando apropriado.\n";
    
    return prompt;
  }

  // Método para obter configuração do chatbot para um dentista
  getDentistChatbotConfig(_dentistId: string): Observable<any> {
    // Aqui você pode buscar configurações personalizadas do chatbot para este dentista
    return of({
      systemPrompt: '',  // Se vazio, usará o prompt contextual padrão
      temperature: 0.7,
      maxTokens: 1000
    });
  }

  // Método para criar resposta de fallback
  createFallbackResponse(): Observable<Message> {
    const randomIndex = Math.floor(Math.random() * this.fallbackResponses.length);
    return of({
      content: this.fallbackResponses[randomIndex],
      sender: 'bot' as 'bot', // Explicitly cast to the literal type 'bot'
      timestamp: new Date()
    }).pipe(delay(500));
  }

  // Add comment to explain why sessionId is returned but not used directly
  // Adicione um comentário explicando o uso da variável sessionId
  createNewSession(dentistId: string): Observable<string> {
    // sessionId é retornado para ser usado pelo componente chamador
    const sessionId = 'session_' + dentistId + '_' + Math.random().toString(36).substring(2, 15);
    return of(sessionId);
  }



  // Método para obter o contexto atual
  getCurrentContext(): ChatContext {
    return this.currentContext;
  }

  // Método para obter um campo específico do registro atual
  getRecordField(fieldName: string): any {
    if (!this.currentContext.currentRecord?.data) return null;
    return this.currentContext.currentRecord.data[fieldName];
  }

  // Método para verificar se um registro está carregado
  hasRecord(): boolean {
    return !!this.currentContext.currentRecord?.id;
  }

  // Método para obter o ID do registro atual
  getCurrentRecordId(): string | null {
    return this.currentContext.currentRecord?.id || null;
  }

  // Método para obter todos os dados do registro atual
  getCurrentRecordData(): any {
    // Se estamos visualizando uma subcoleção, retornar seus dados
    if (this.currentContext.clinicalRecord) {
      return this.currentContext.clinicalRecord;
    } 
    // Caso contrário, retornar dados da coleção principal
    return this.currentContext.patientRecord;
  }

  // Métodos públicos para acessar dados da hierarquia
  getCollectionRecord(collection: string, id: string): any {
    try {
      return this.currentContext.hierarchy?.[collection]?.[id]?.data || null;
    } catch (error) {
      console.error('Erro ao acessar registro da collection:', error);
      return null;
    }
  }

  getSubcollectionRecord(collection: string, id: string, subcollection: string, itemId: string): any {
    try {
      return this.currentContext.hierarchy?.[collection]?.[id]?.subcollections?.[subcollection]?.[itemId] || null;
    } catch (error) {
      console.error('Erro ao acessar registro de subcollection:', error);
      return null; // Adicionar retorno explícito
    }
  } // Adicionar chave de fechamento que estava faltando

  getLastSubcollectionRecord(): any {
    const nav = this.currentContext.navigationHistory;
    if (!nav || !nav.lastCollection || !nav.lastId || !nav.lastSubcollection || !nav.lastItemId) return null;
    
    return this.getSubcollectionRecord(
      nav.lastCollection,
      nav.lastId,
      nav.lastSubcollection,
      nav.lastItemId
    );
  }

  /**
   * Detecta navegação para Home e limpa o contexto
   */
  private updateContextFromUrl(url: string): void {
    // Verifica se estamos na Home (página raiz ou rota específica da home)
    if (url === '/' || url === '/home' || url.startsWith('/?') || url.startsWith('/home?')) {
      this.resetContext();
      return;
    }

    // Continuar com a lógica existente para outras rotas
    const urlPattern = /\/([^\/]+)\/([^\/]+)(?:\/fichas\/([^\/]+)\/itens\/([^\/]+))?/;
    // Usar a variável matches ou comentar a linha se não for usada
    // const matches = url.match(urlPattern);
    
    // Ou usar o resultado imediatamente:
    if (url.match(urlPattern)) {
      // Processar a URL que não seja da página inicial
    }
    
    // Resto do seu código para outras rotas...
  }



  /**
 * Alias para resetContext() - Para compatibilidade com chamadas existentes
 */
  public clearContext(): void {
    // Simplesmente chama o método resetContext
    this.resetContext();
  }

  /**
   * Limpa apenas a conversa atual
   */
  public clearConversation(): void {
    // Emite evento de limpeza para todos os componentes inscritos
    this.clearConversationSubject.next();
  }

  /**
   * Limpa completamente a hierarquia de registros no contexto
   * Mantem apenas informações básicas de navegação
   */
  public resetHierarchyData(): void {
    // Armazena temporariamente informações básicas que queremos preservar
    const currentView = this.currentContext.currentView;
    const activeCollection = this.currentContext.activeCollection;
    
    // Limpa estrutura de hierarquia e registros
    this.currentContext.hierarchy = {};
    this.currentContext.currentRecord = undefined; // Changed from null to undefined to match type
    this.currentContext.navigationHistory = {};
    this.currentContext.pageData = null;
    this.mainRecordData = null;
    
    // Restaura informações básicas
    this.currentContext.currentView = currentView;
    this.currentContext.activeCollection = activeCollection;
    
    // Emite o contexto limpo
    this.contextSubject.next({...this.currentContext});
  }

  /**
   * Remove dados sensíveis e formata os dados do paciente
   */
  private sanitizePatientData(patientData: any): PatientRecord {
    const sanitized: PatientRecord = {
      id: patientData.id,
      nome: patientData.nome || patientData.name || 'Nome não disponível'
    };
    
    // Copiar campos relevantes e seguros
    const safeFields = ['telefone', 'email', 'nascimento', 'genero', 'cidade', 'estado'];
    safeFields.forEach(field => {
      if (patientData[field]) sanitized[field] = patientData[field];
    });
    
    return sanitized;
  }

  /**
   * Processa dados clínicos para uso no chatbot
   */
  private processClinicalContext(patientId: string, clinicalData: any, clinicalType: string): void {
    
    if (!this.currentContext.patientRecord) {
      // Usar patientId para carregar dados do paciente
      this.loadPatientData(patientId).then(patient => {
        if (patient) {
          this.currentContext.patientRecord = patient;
          this.buildClinicalContext();
        }
      });
    } else {
      this.buildClinicalContext();
    }
  }

  /**
   * Constrói e emite o contexto clínico completo
   */
  private buildClinicalContext(): void {
    // Só prosseguir se tivermos tanto dados do paciente quanto da ficha
    if (!this.currentContext.patientRecord || !this.currentContext.clinicalRecord) {
      return;
    }
    
    // Estrutura que será enviada ao chatbot
    const clinicalContext = {
      patient: {
        ...this.currentContext.patientRecord,
        // Remover ID e outros dados técnicos
        id: undefined,
        firestoreId: undefined
      },
      clinicalRecord: {
        ...this.currentContext.clinicalRecord,
        // Remover ID e outros dados técnicos
        id: undefined
      },
      metadata: {
        view: this.currentContext.currentView?.type || '',
        collection: this.currentContext.activeCollection || '',
        subcollection: this.currentContext.clinicalRecord?.tipo || ''
      }
    };
    
    // Adicionar interpretações dos dados clínicos
    this.augmentWithClinicalInsights(clinicalContext);
    
    // Emitir contexto processado
    this.clinicalContextSubject.next(clinicalContext);
  }

  /**
   * Aumenta o contexto com informações clínicas processadas
   */
  private augmentWithClinicalInsights(context: any): void {
    const clinicalType = context.clinicalRecord.tipo;
    
    // Adicionar insights específicos baseados no tipo de ficha
    switch (clinicalType) {
      case 'tratamentos':
        // Ex: Adicionar informação sobre o último tratamento para o mesmo dente
        this.addPreviousTreatmentsInsight(context);
        break;
      case 'diagnosticos':
        // Ex: Classificar severidade do diagnóstico
        this.addDiagnosticSeverityInsight(context);
        break;
      // Outros tipos de fichas
    }
  }

  /**
   * Obter contexto formatado para o chatbot
   */
  public getChatbotContextData(): any {
    // Verifica se temos dados disponíveis
    if (!this.currentContext.patientRecord) {
      return { 
        status: 'no-patient-data',
        view: this.currentContext.currentView?.type || 'unknown',
        collection: this.currentContext.activeCollection || 'unknown'
      };
    }
    
    // Contexto básico
    const context: any = {
      navigation: {
        view: this.currentContext.currentView?.type || '',
        collection: this.currentContext.activeCollection || '',
        subcollection: this.currentContext.clinicalRecord?.tipo || null
      },
      patient: {
        nome: this.currentContext.patientRecord.nome,
        idade: this.calculateAge(this.currentContext.patientRecord.nascimento),
        genero: this.currentContext.patientRecord['genero']  // Usar notação de colchetes
      }
    };
    
    // Adicionar dados da ficha clínica se disponível
    if (this.currentContext.clinicalRecord) {
      context.clinicalRecord = {
        tipo: this.currentContext.clinicalRecord.tipo,
        data: this.currentContext.clinicalRecord.data,
        procedimento: this.currentContext.clinicalRecord.procedimento,
        dente: this.currentContext.clinicalRecord.dente,
        // Resumir observações longas
        observacoes: this.summarizeText(this.currentContext.clinicalRecord.observacoes)
      };
    }
    
    // Adicionar histórico e outros dados contextuais
    context.history = {
      lastViewed: this.currentContext.navigationHistory || {}
    };
    
    // Antes de retornar o contexto:
    
    return context;
  }

  /**
   * Extrai o nome para exibição de um objeto de dados
   */
  private extractDisplayName(data: any, type?: string): string {
    if (!data) return '';
    
    // Tentar encontrar um campo de nome adequado
    for (const field of ['nome', 'name', 'title', 'titulo', 'descricao', 'procedimento']) {
      if (data[field]) {
        return String(data[field]).trim();
      }
    }
    
    // Se for um tipo conhecido, usar um formato específico
    if (type) {
      switch (type.toLowerCase()) {
        case 'tratamentos':
          return `Tratamento: ${data.procedimento || data.dente || 'Sem descrição'}`;
        case 'diagnosticos':
          return `Diagnóstico: ${data.diagnostico || data.dente || 'Sem descrição'}`;
        case 'orcamentos':
          return `Orçamento: ${data.valor ? `R$ ${data.valor}` : 'Sem valor'}`;
        default:
          return `${type}: ${data.id || 'Sem identificação'}`;
      }
    }
    
    return 'Sem nome';
  }

  /**
   * Emite o contexto atualizado para os componentes inscritos
   */
  private emitUpdatedContext(): void {
    this.contextSubject.next({...this.currentContext});
    
    // Log detalhado ao emitir atualizações
    this.logDetailedContext();
    this.logRecordsData();
  }

  /**
   * Processa dados do paciente para enriquecer o contexto
   */
  private processPatientContext(patientId: string, patientData: any): void {
    
    // Usar o ID do paciente em alguma operação
    this.contextData = {
      ...this.contextData,
      patientId: patientId,  // Adicionando o ID ao contexto
      patient: {
        nome: patientData.nome || 'Paciente',
        idade: this.calculateAge(patientData.nascimento),
        genero: patientData['genero'] || 'N/A',
        // outros dados relevantes
      }
    };
    
    // Emitir o contexto atualizado para o chatbot
    this.clinicalContextSubject.next(this.contextData);
  }

  /**
   * Carrega dados completos do paciente
   */
  private async loadPatientData(patientId: string): Promise<PatientRecord | null> {
    if (!this.userId) return null;
    
    try {
      const registroPath = `users/${this.userId}/pacientes`;
      
      // Usar firstValueFrom em vez de toPromise (depreciado)
      const patientData = await firstValueFrom(
        this.firestoreService.getRegistroById(registroPath, patientId).pipe(take(1))
      );
      
      if (patientData) {
        return this.sanitizePatientData({
          id: patientId,
          ...patientData
        });
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error);
      return null;
    }
  }

  /**
   * Adiciona insights sobre tratamentos anteriores
   */
  private addPreviousTreatmentsInsight(context: any): void {
    // Implementação para analisar tratamentos anteriores
    // Por exemplo, verificar se o mesmo dente já foi tratado antes
    context.insights = context.insights || {};
    context.insights.previousTreatments = {
      hasPrevious: false,
      count: 0
    };
  }

  /**
   * Adiciona insights sobre a severidade do diagnóstico
   */
  private addDiagnosticSeverityInsight(context: any): void {
    // Implementação para analisar a severidade do diagnóstico
    context.insights = context.insights || {};
    context.insights.diagnosticSeverity = {
      level: 'normal',
      requiresAttention: false
    };
  }

  /**
   * Calcula a idade com base na data de nascimento
   * Agora público para uso em componentes externos
   */
  public calculateAge(birthDateStr?: string): number | null {
    if (!birthDateStr) return null;
    
    try {
      // Converter string para data
      let birthDate: Date;
      if (birthDateStr.includes('/')) {
        // Formato DD/MM/YYYY
        const [day, month, year] = birthDateStr.split('/').map(Number);
        birthDate = new Date(year, month - 1, day);
      } else {
        // Formato ISO ou timestamp
        birthDate = new Date(birthDateStr);
      }
      
      // Verificar se a data é válida
      if (isNaN(birthDate.getTime())) return null;
      
      // Calcular a diferença de anos
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Ajustar se ainda não fez aniversário este ano
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Erro ao calcular idade:', error);
      return null;
    }
  }

  /**
   * Resume um texto longo para uso no contexto
   */
  private summarizeText(text?: string, maxLength: number = 100): string {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Obter todos os dados do registro da coleção principal atual
   */
  public getCurrentCollectionRecord(): PatientRecord | undefined {
    return this.currentContext.patientRecord;
  }

  /**
   * Obter o ID do registro da coleção principal atual
   */
  public getCurrentCollectionRecordId(): string | null {
    return this.currentContext.patientRecord?.id || null;
  }

  /**
   * Obter todos os dados do registro da subcoleção atual
   */
  public getCurrentSubcollectionRecord(): ClinicalRecord | undefined {
    return this.currentContext.clinicalRecord;
  }

  /**
   * Obter o ID do registro da subcoleção atual
   */
  public getCurrentSubcollectionRecordId(): string | null {
    return this.currentContext.clinicalRecord?.id || null;
  }

  /**
   * Verificar se estamos visualizando uma subcoleção
   */
  public isViewingSubcollection(): boolean {
    return !!this.currentContext.clinicalRecord;
  }

  /**
   * Obter ambos registros para contexto completo
   */
  public getFullContext(): {collection: PatientRecord | undefined, subcollection: ClinicalRecord | undefined} {
    return {
      collection: this.getCurrentCollectionRecord(),
      subcollection: this.getCurrentSubcollectionRecord()
    };
  }

  // Adicionar esta propriedade no início da classe, logo após as outras propriedades privadas

  // Adicionar os seguintes métodos

  /**
   * Inicia uma nova sessão de chat
   */
  public startNewChat(): void {
    // Limpar o histórico atual
    this.clearMessageHistory();
    
    // Adicionar mensagem de boas-vindas ao histórico
    const welcomeMessage: Message = {
      content: "Olá! Como posso ajudar?",
      sender: 'bot',
      timestamp: new Date()
    };
    
    this.addMessageToHistory(welcomeMessage);
    
    // Log para debug
  }

  /**
   * Restaura uma sessão de chat existente ou inicia uma nova
   */
  public restoreOrStartChat(): void {
    // Tentar carregar histórico do localStorage
    this.loadHistoryFromLocalStorage();
    
    // Se não tiver histórico, iniciar uma nova sessão
    if (this.messageHistory.length === 0) {
      this.startNewChat();
    } else {
    }
  }
}