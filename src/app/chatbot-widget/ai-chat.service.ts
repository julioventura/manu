import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { map, catchError, switchMap, filter, tap, delay } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { UserService, NavigationContext } from '../shared/services/user.service';
import { FirestoreService } from '../shared/services/firestore.service';
import { SubcolecaoService } from '../shared/services/subcolecao.service';
import { environment } from '../../environments/environment';


const API_CONFIG = {
  openaiApiKey: environment.openaiApiKey,
  apiUrl: environment.openaiApiUrl || 'https://api.openai.com/v1/chat/completions'
};

// CORRIGIR interfaces - substituir any por tipos específicos:
export interface PatientRecord {
  id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  nascimento?: string;
  genero?: string;
  [key: string]: unknown;
}

export interface ClinicalRecord {
  id: string;
  tipo: string;
  data?: string;
  procedimento?: string;
  dente?: string;
  observacoes?: string;
  [key: string]: unknown;
}

export interface ChatContext {
  currentView?: {
    type: string;
    id?: string;
    name?: string;
    component?: string;
  };
  activeCollection?: string;
  activeSubcollections?: string[];
  
  currentRecord?: {
    id: string;
    data: unknown;
  };
  
  patientRecord?: PatientRecord;
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
        data?: unknown;
        subcollections?: {
          [subcollection: string]: {
            [itemId: string]: unknown;
          }
        }
      }
    }
  };
  pageData?: unknown;
}

export interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface OpenAIResponse {
  choices: [{
    message: {
      content: string;
    }
  }];
}

// CORRIGIR: Interface para FirestoreService
interface FirestoreRecord {
  id?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private openaiApiUrl = API_CONFIG.apiUrl;
  private openaiModel = environment.openaiModel;
  private currentContext: ChatContext = {};
  
  private userId: string | null = null;
  
  private contextSubject = new BehaviorSubject<ChatContext>({});
  private clearConversationSubject = new Subject<void>();
  private messageHistorySubject = new BehaviorSubject<Message[]>([]);
  private messageHistory: Message[] = [];
  
  private readonly MAX_HISTORY_SIZE = 100;
  
  private fallbackResponses = [
    "Desculpe, estou tendo dificuldades para processar sua solicitação no momento.",
    "Parece que estou com problemas de conexão. Pode tentar novamente?",
    "Ops! Algo deu errado. Poderia reformular sua pergunta?",
    "Não consegui processar isso agora. Tente novamente em alguns instantes.",
    "Estou com dificuldades técnicas. Seria possível tentar novamente?"
  ];
  
  public context$ = this.contextSubject.asObservable();
  public clearConversation$ = this.clearConversationSubject.asObservable();
  public messageHistory$ = this.messageHistorySubject.asObservable();
  
  private mainRecordData: unknown = null;
  private contextData: Record<string, unknown> = {};
  
  private clinicalContextSubject = new BehaviorSubject<Record<string, unknown>>({});
  public clinicalContext$ = this.clinicalContextSubject.asObservable();

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private firestoreService: FirestoreService<FirestoreRecord>, // CORRIGIR: tipo específico
    private userService: UserService,
    private router: Router,
    private subcolecaoService: SubcolecaoService
  ) {
    this.userService.getUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadHistoryFromLocalStorage();
      } else {
        this.userId = null;
        console.warn('⚠️ Usuário não autenticado');
      }
    });
    
    // CORRIGIR: subscription context
    this.userService.navigationContext$.subscribe((value: NavigationContext | null) => {
      if (value) {
        this.updateContextFromNavigation(value);
        
        const currentRecord = value['currentRecord'];
        if (currentRecord && typeof currentRecord === 'object') {
          this.currentContext.currentRecord = {
            // CORRIGIR: usar ['id'] para acesso de índice (linha 166)
            id: String((currentRecord as Record<string, unknown>)['id'] || ''),
            // CORRIGIR: usar ['data'] para acesso de índice (linha 167)
            data: (currentRecord as Record<string, unknown>)['data'] || {}
          };
          
          if (this.currentContext.currentView && 
              !this.currentContext.currentView.name && 
              currentRecord) {
            // CORRIGIR: usar ['data'] para acesso de índice (linha 173)
            const recordData = (currentRecord as Record<string, unknown>)['data'] || {};
            
            const possibleNameFields = ['nome', 'name', 'title', 'titulo', 'descricao'];
            for (const field of possibleNameFields) {
              const fieldValue = (recordData as Record<string, unknown>)[field];
              if (fieldValue && typeof fieldValue === 'string') {
                this.currentContext.currentView.name = fieldValue;
                break;
              }
            }
          }
        }
        
        this.contextSubject.next({...this.currentContext});
      }
    });

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      tap((event: NavigationEnd) => {
        this.updateContextFromUrl(event.url);
      })
    ).subscribe();
  }

  // CORRIGIR método addMessageToHistory
  public addMessageToHistory(message: Message): void {
    this.messageHistory.push(message);
    
    if (this.messageHistory.length > this.MAX_HISTORY_SIZE) {
      this.messageHistory = this.messageHistory.slice(-this.MAX_HISTORY_SIZE);
    }
    
    this.saveHistoryToLocalStorage();
    this.messageHistorySubject.next([...this.messageHistory]);
  }

  // CORRIGIR outros métodos principais
  public getMessageHistory(): Message[] {
    return [...this.messageHistory];
  }

  private clearMessageHistory(): void {
    this.messageHistory = [];
    this.messageHistorySubject.next([]);
    this.clearHistoryFromLocalStorage();
  }

  private saveHistoryToLocalStorage(): void {
    try {
      const storageKey = `chat_history_${this.userId || 'anonymous'}`;
      localStorage.setItem(storageKey, JSON.stringify(this.messageHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico no localStorage:', error);
    }
  }

  public loadHistoryFromLocalStorage(): void {
    try {
      const storageKey = `chat_history_${this.userId || 'anonymous'}`;
      const storedHistory = localStorage.getItem(storageKey);

      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory) as Message[];

        const history = parsedHistory.map(msg => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }));

        if (history.length > 0) {
          this.messageHistory = history;
          this.messageHistorySubject.next([...this.messageHistory]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
    }
  }

  private clearHistoryFromLocalStorage(): void {
    try {
      const storageKey = `chat_history_${this.userId || 'anonymous'}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Erro ao limpar histórico do localStorage:', error);
    }
  }

  public resetContext(): void {
    this.currentContext = {
      currentView: {
        type: 'Home'
      }
    };
    
    this.clearConversationSubject.next();
    this.clearMessageHistory();
    
    this.mainRecordData = null;
    this.contextSubject.next({...this.currentContext});
  }

  sendMessage(message: string, sessionId: string, dentistId: string, context?: Record<string, unknown>): Observable<Message> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiApiKey}`
    });

    return this.getDentistChatbotConfig().pipe(
      switchMap((config: Record<string, unknown>) => {
        const recentHistory = this.messageHistory.slice(-5).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

        const enhancedContext = {
          ...context,
          dentistName: this.userService.context?.dentistName,
          location: this.userService.context?.location,
          patientName: this.userService.context?.patientName,
          userRole: this.userService.userProfile?.['role'] || 'dentista',
          currentView: this.currentContext.currentView?.type,
          viewName: this.currentContext.currentView?.name,
          collection: this.currentContext.activeCollection,
          subcollections: this.currentContext.activeSubcollections,
          pageData: this.currentContext.pageData,
          conversationHistory: recentHistory
        };

        // CORRIGIR: usar ['systemPrompt'] para acesso de índice (linha 304)
        const systemPrompt = (config['systemPrompt'] as string) || this.buildContextualSystemPrompt(enhancedContext);

        const messages = [
          { role: 'system', content: systemPrompt }
        ];

        if (recentHistory.length > 0) {
          messages.push(...recentHistory);
        }

        messages.push({ role: 'user', content: message });

        const payload = {
          model: this.openaiModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        };

        return this.http.post<OpenAIResponse>(this.openaiApiUrl, payload, { headers }).pipe(
          map(response => {
            if (!response.choices || !response.choices[0] || !response.choices[0].message) {
              console.error('Estrutura de resposta inválida da OpenAI:', response);
              throw new Error('Formato de resposta inválido');
            }
            
            const botMessage: Message = {
              content: response.choices[0].message.content.trim(),
              sender: 'bot',
              timestamp: new Date()
            };
            
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

  // CORRIGIR outros métodos essenciais
  private buildContextualSystemPrompt(context: Record<string, unknown>): string {
    // CORRIGIR: usar ['dentistName'] para acesso de índice (linha 354)
    let prompt = `Você é um assistente virtual odontológico para o consultório do Dr(a). ${context['dentistName'] || 'Fulano'}.\n`;
    prompt += `Forneça informações sobre Odontologia, de forma cordial e profissional.\n`;
    
    // CORRIGIR: usar ['location'] para acesso de índice (linha 357, 358)
    if (context['location']) {
      prompt += `O consultório está localizado em ${context['location']}.\n`;
    }
    
    // CORRIGIR: usar ['currentView'] para acesso de índice (linha 361, 362)
    if (context['currentView']) {
      prompt += `\nCONTEXTO ATUAL: O usuário está na seção "${context['currentView']}"`;
      
      // CORRIGIR: usar ['viewName'] para acesso de índice (linha 364, 365)
      if (context['viewName']) {
        prompt += ` visualizando "${context['viewName']}".\n`;
      } else {
        prompt += ".\n";
      }
    }
    
    prompt += "\nResponda de forma concisa, profissional e útil. Evite respostas vagas. Forneça sugestões práticas quando apropriado.\n";
    
    return prompt;
  }

  // CORRIGIR: remover parâmetro não usado (linha 277)
  getDentistChatbotConfig(): Observable<Record<string, unknown>> {
    return of({
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 1000
    });
  }

  createFallbackResponse(): Observable<Message> {
    const randomIndex = Math.floor(Math.random() * this.fallbackResponses.length);
    return of({
      content: this.fallbackResponses[randomIndex],
      sender: 'bot' as const,
      timestamp: new Date()
    }).pipe(delay(500));
  }

  createNewSession(dentistId: string): Observable<string> {
    const sessionId = 'session_' + dentistId + '_' + Math.random().toString(36).substring(2, 15);
    return of(sessionId);
  }

  saveMessageToHistory(): Observable<boolean> {
    return of(true);
  }

  // CORRIGIR método updateContextFromNavigation - REMOVER duplicado
  private updateContextFromNavigation(navContext: NavigationContext): void {
    if (!this.currentContext) {
      this.currentContext = {};
    }

    if (navContext.route) {
      this.currentContext.currentView = {
        type: navContext.route,
        name: navContext.route,
        component: navContext.component || ''
      };
    }
  }

  private updateContextFromUrl(url: string): void {
    if (url === '/' || url === '/home' || url.startsWith('/?') || url.startsWith('/home?')) {
      this.resetContext();
      return;
    }
  }

  // ADICIONAR métodos vazios para compilar
  private extractUserInfo(): void {
    // Implementação futura
  }

  private loadInitialContext(): void {
    // Implementação futura
  }

  private handleError(): void {
    // Implementação futura
  }

  private handleSuccess(): void {
    // Implementação futura
  }

  private sanitizeInput(): string {
    return '';
  }

  private validateUrl(): boolean {
    return true;
  }

  public getCurrentContext(): ChatContext {
    return this.currentContext;
  }

  public startNewChat(): void {
    this.clearMessageHistory();
    
    const welcomeMessage: Message = {
      content: "Olá! Como posso ajudar?",
      sender: 'bot',
      timestamp: new Date()
    };
    
    this.addMessageToHistory(welcomeMessage);
  }

  public restoreOrStartChat(): void {
    this.loadHistoryFromLocalStorage();
    
    if (this.messageHistory.length === 0) {
      this.startNewChat();
    }
  }

  public calculateAge(birthDateStr?: string): number | null {
    if (!birthDateStr) return null;
    
    try {
      let birthDate: Date;
      if (birthDateStr.includes('/')) {
        const [day, month, year] = birthDateStr.split('/').map(Number);
        birthDate = new Date(year, month - 1, day);
      } else {
        birthDate = new Date(birthDateStr);
      }
      
      if (isNaN(birthDate.getTime())) return null;
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Erro ao calcular idade:', error);
      return null;
    }
  }

  getMainRecordData(): any {
    return this.mainRecordData;
  }

  getCurrentRecordData(): any {
    return this.currentContext.currentRecord?.data;
  }

  getLastSubcollectionRecord(): any {
    // Mock implementation
    return null;
  }

  getCurrentCollectionRecord(): any {
    if (this.currentContext.activeCollection && this.currentContext.currentRecord) {
      return {
        id: this.currentContext.currentRecord.id,
        ...(this.currentContext.currentRecord.data as object)
      };
    }
    return null;
  }

  getCurrentSubcollectionRecord(): any {
    // Mock implementation
    return null;
  }
}