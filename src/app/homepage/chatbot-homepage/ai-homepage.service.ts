// Alteração: remoção de logs de depuração (console.log)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Removido BehaviorSubject não utilizado
import { map, catchError } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../../../environments/environment';

// Corrigir a interface Message com tipos estritos
export interface Message {
  content: string;
  sender: 'user' | 'bot'; // Tipo estrito para evitar problemas de atribuição
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  created: Date;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiHomepageService {
  // Corrigir a propriedade apiUrl
  private apiUrl = environment.aiChatApiUrl; // Use aiChatApiUrl em vez de apiUrl
  private profileData: any = null;

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore
  ) {
  }

  /**
   * Cria uma nova sessão de chat para o perfil profissional
   */
  createNewSession(username: string): Observable<string> {
    
    // Gerar ID de sessão único
    const sessionId = this.firestore.createId();
    // Não precisamos armazenar a session não utilizada
    
    // Opcional: armazenar no Firestore para histórico
    return of(sessionId);
  }

  /**
   * Envia uma mensagem para a API e retorna a resposta
   */
  sendMessage(message: string, sessionId: string, username: string, profileData: any): Observable<Message> {
    
    const endpoint = `${this.apiUrl}/chat`;
    const payload = {
      message,
      sessionId,
      context: {
        type: 'public_profile',
        username: username,
        profile: profileData
      }
    };

    return this.http.post<any>(endpoint, payload).pipe(
      map(response => {
        // Garantir que o retorno corresponde ao tipo Message
        return {
          content: response.message || 'Desculpe, não consegui processar sua mensagem.',
          sender: 'bot' as const, // Cast explícito para o tipo literal
          timestamp: new Date()
        };
      }),
      catchError(error => {
        console.error('Erro ao enviar mensagem:', error);
        return of({
          content: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente mais tarde.',
          sender: 'bot' as const, // Cast explícito para o tipo literal
          timestamp: new Date()
        });
      })
    );
  }

  /**
   * Salva uma mensagem no histórico
   */
  saveMessageToHistory(sessionId: string, username: string, message: Message): Observable<void> {
    const path = `public_chats/${username}/sessions/${sessionId}/messages`;
    const messageData = {
      content: message.content,
      sender: message.sender,
      timestamp: new Date()
    };
    
    return of(this.firestore.collection(path).add(messageData))
      .pipe(
        map(() => void 0),
        catchError(error => {
          console.error('Erro ao salvar mensagem no histórico:', error);
          return of(void 0);
        })
      );
  }

  /**
   * Define os dados do perfil para contexto
   */
  setProfileData(data: any): void {
    this.profileData = data;
  }

  /**
   * Obtém os dados do perfil
   */
  getProfileData(): any {
    return this.profileData;
  }
}