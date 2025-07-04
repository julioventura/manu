import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Observable, of, from, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { FirestoreService } from './firestore.service';

// EXPORTAR: Interface para usuário
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
  // Adicionar campos que podem existir nos dados do Firestore
  username?: string;
  nome?: string;
  telefone?: string;
  especialidade?: string;
  endereco?: string;
  bio?: string;
  foto?: string;
  redes_sociais?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  horarios?: {
    segunda?: string;
    terca?: string;
    quarta?: string;
    quinta?: string;
    sexta?: string;
    sabado?: string;
    domingo?: string;
  };
  convenios?: string[];
  titulacoes?: string[];
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  subscription_type?: string;
  [key: string]: unknown;
}

// Interface para dados do usuário
interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  [key: string]: unknown;
}

// Interface para permissões
interface UserPermissions {
  isAdmin: boolean;
  permissions: string[];
}

// Interface para log de atividade
interface ActivityLog {
  uid: string;
  activity: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

// Interface mais flexível - já exportada
export interface NavigationContext {
  route?: string;
  component?: string;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
  currentRecord?: {
    id?: string;
    data?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // ADICIONAR: Observables faltando
  private chatbotExpandedSubject = new BehaviorSubject<boolean>(false);
  public chatbotExpanded$ = this.chatbotExpandedSubject.asObservable();

  private navigationContextSubject = new BehaviorSubject<NavigationContext | null>(null);
  public navigationContext$ = this.navigationContextSubject.asObservable();

  private homepageProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public homepageProfile$ = this.homepageProfileSubject.asObservable();

  // ADICIONAR: Propriedade context
  public context: {
    dentistId?: string;
    dentistName?: string;
    location?: string;
    patientName?: string;
  } = {};

  // Adicionar propriedades que estão sendo acessadas
  public userProfile: UserProfile | null = null;
  
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private firestoreService: FirestoreService<Record<string, unknown> & { id?: string }>
  ) {}

  // Método getCurrentUser
  getCurrentUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  getCurrentUserProfile(): Observable<UserProfile | null> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }
        
        // Tentar buscar primeiro na collection 'users' usando o UID
        return this.firestoreService.getRegistroById('users', user.uid).pipe(
          switchMap(profile => {
            if (profile) {
              return of(profile as UserProfile);
            }
            
            // Se não encontrar, tentar na collection específica usando email
            return this.firestoreService.getRegistroById('usuarios/dentistascombr/users', user.email || user.uid).pipe(
              map(specificProfile => {
                if (specificProfile) {
                  return specificProfile as UserProfile;
                }
                
                // Se ainda não encontrar, criar perfil básico com dados do Firebase Auth
                const basicProfile: UserProfile = {
                  uid: user.uid,
                  email: user.email || '',
                  displayName: user.displayName || '',
                  nome: user.displayName || '',
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                return basicProfile;
              })
            );
          }),
          catchError(error => {
            console.error('Error getting user profile:', error);
            // Retornar perfil básico em caso de erro
            const basicProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              nome: user.displayName || '',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            return of(basicProfile);
          })
        );
      }),
      catchError(error => {
        console.error('Error getting user profile:', error);
        return of(null);
      })
    );
  }

  createUserProfile(user: firebase.User): Observable<void> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return from(this.firestoreService.addRegistro('users', { ...userProfile, id: user.uid })).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error creating user profile:', error);
        throw error;
      })
    );
  }

  updateUserProfile(uid: string, data: Partial<UserProfile>): Observable<void> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    return from(this.firestoreService.updateRegistro('users', uid, updateData)).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error updating user profile:', error);
        throw error;
      })
    );
  }

  getUserData(uid: string): Observable<UserData | null> {
    return this.firestoreService.getRegistroById('users', uid).pipe(
      map(userData => userData as UserData || null),
      catchError(error => {
        console.error('Error getting user data:', error);
        return of(null);
      })
    );
  }

  searchUsersByEmail(email: string): Observable<UserData[]> {
    return this.firestoreService.getDocumentsByField('users', 'email', email).pipe(
      map(results => results as UserData[]),
      catchError(error => {
        console.error('Error searching users by email:', error);
        return of([]);
      })
    );
  }

  userExists(uid: string): Observable<boolean> {
    return this.firestoreService.getRegistroById('users', uid).pipe(
      map(userData => !!userData),
      catchError(() => of(false))
    );
  }

  deleteUserProfile(uid: string): Observable<void> {
    return from(this.firestoreService.deleteRegistro('users', uid)).pipe(
      catchError(error => {
        console.error('Error deleting user profile:', error);
        throw error;
      })
    );
  }

  getAllUsers(): Observable<UserData[]> {
    return this.firestoreService.getColecao('users').pipe(
      map(results => results as UserData[]),
      catchError(error => {
        console.error('Error getting all users:', error);
        return of([]);
      })
    );
  }

  checkUserPermissions(uid: string): Observable<UserPermissions> {
    return this.firestoreService.getRegistroById('users', uid).pipe(
      map(() => {
        // Implementar lógica de permissões conforme necessário
        return {
          isAdmin: false,
          permissions: []
        };
      }),
      catchError(() => of({ isAdmin: false, permissions: [] }))
    );
  }

  logUserActivity(uid: string, activity: string, details?: Record<string, unknown>): Observable<void> {
    const logData: ActivityLog = {
      uid,
      activity,
      details: details || {},
      timestamp: new Date()
    };

    return from(this.firestoreService.addRegistro('userLogs', { ...logData, id: this.firestoreService.createId() })).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error logging user activity:', error);
        return of(void 0);
      })
    );
  }

  getUserActivityLogs(uid: string): Observable<ActivityLog[]> {
    return this.firestoreService.getDocumentsWithQuery('userLogs', ref => 
      ref.where('uid', '==', uid).orderBy('timestamp', 'desc').limit(50)
    ).pipe(
      map(results => results as unknown as ActivityLog[]),
      catchError(error => {
        console.error('Error getting user activity logs:', error);
        return of([]);
      })
    );
  }

  updateLastAccess(uid: string): Observable<void> {
    return from(this.firestoreService.updateRegistro('users', uid, {
      lastAccess: new Date(),
      updatedAt: new Date()
    })).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error updating last access:', error);
        throw error;
      })
    );
  }

  emailExists(email: string): Observable<boolean> {
    return this.firestoreService.getDocumentsByField('users', 'email', email).pipe(
      map(results => results.length > 0),
      catchError(() => of(false))
    );
  }

  // Método searchUsers simplificado
  searchUsers(criteria: Partial<UserData>): Observable<UserData[]> {
    // Para cada critério, fazer uma query separada
    const firstCriteria = Object.entries(criteria)[0];
    
    if (!firstCriteria) {
      return this.getAllUsers();
    }

    const [key, value] = firstCriteria;
    
    if (value === undefined || value === null) {
      return this.getAllUsers();
    }

    return this.firestoreService.getDocumentsByField('users', key, value).pipe(
      map(results => results as unknown as UserData[]),
      catchError(error => {
        console.error('Error searching users:', error);
        return of([]);
      })
    );
  }

  getUserCount(): Observable<number> {
    return this.firestoreService.getColecao('users').pipe(
      map(results => results.length),
      catchError(() => of(0))
    );
  }

  getActiveUsers(daysAgo: number = 30): Observable<UserData[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return this.firestoreService.getDocumentsWithQuery('users', ref => 
      ref.where('lastAccess', '>=', cutoffDate)
    ).pipe(
      map(results => results as unknown as UserData[]),
      catchError(error => {
        console.error('Error getting active users:', error);
        return of([]);
      })
    );
  }

  private sanitizeUserData(data: Partial<UserProfile>): Partial<UserProfile> {
    const sanitized: Partial<UserProfile> = {};
    
    const allowedFields = ['displayName', 'email', 'updatedAt'];
    
    allowedFields.forEach(field => {
      if (field in data && data[field as keyof UserProfile] !== undefined) {
        sanitized[field as keyof UserProfile] = data[field as keyof UserProfile];
      }
    });

    return sanitized;
  }

  updateUserProfileSafe(uid: string, data: Partial<UserProfile>): Observable<void> {
    const sanitizedData = this.sanitizeUserData(data);
    return this.updateUserProfile(uid, sanitizedData);
  }

  // Método logout
  logout(): Observable<void> {
    return from(this.afAuth.signOut()).pipe(
      catchError(error => {
        console.error('Error during logout:', error);
        return of(void 0);
      })
    );
  }

  // ADICIONAR: método para deletar dados de coleção do usuário
  deleteUserData(collection: string, recordId: string): Observable<void> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        const recordPath = `users/${user.uid}/${collection}`;
        return from(this.firestoreService.deleteRegistro(recordPath, recordId)).pipe(
          map(() => void 0),
          catchError(error => {
            console.error('Error deleting user data:', error);
            throw error;
          })
        );
      }),
      catchError(error => {
        console.error('Error deleting user data:', error);
        throw error;
      })
    );
  }

  // Adicionar métodos que estão sendo chamados
  getUserProfileData(): Observable<UserProfile | null> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.email) {
          return this.firestoreService.getRegistroById('usuarios/dentistascombr/users', user.email).pipe(
            map(profile => profile as UserProfile || null),
            catchError(error => {
              console.error('Error getting user profile data:', error);
              return of(null);
            })
          );
        }
        return of(null);
      }),
      tap((profile: UserProfile | null) => {  // LINHA 295 - corrigir tipo aqui
        if (profile) {
          this.userProfile = profile;
        }
      }),
      catchError(error => {
        console.error('Error getting user profile data:', error);
        return of(null);
      })
    );
  }

  loadUserProfileByUsername(username: string): Observable<UserProfile[]> {
    return this.firestoreService.getRegistroByUsername<UserProfile>('usuarios/dentistascombr/users', username).pipe(
      map((profiles: UserProfile[]): UserProfile[] => 
        profiles.filter((profile): profile is UserProfile => profile !== undefined)
      ), // ADICIONAR esta linha para filtrar undefined
      tap((profiles: UserProfile[]) => {  // CORRIGIR tipo aqui
        if (profiles && profiles.length > 0) {
          this.userProfile = profiles[0];
        }
      }),
      catchError(error => {
        console.error('Error loading user profile by username:', error);
        return of([]);
      })
    );
  }

  setHomepageProfile(profile: UserProfile | null): void {
    this.homepageProfileSubject.next(profile);
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
  }

  getUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  isValidUsername(username: string): Observable<boolean> {
    return this.firestoreService.getRegistroByUsername<UserProfile>('usuarios/dentistascombr/users', username).pipe(
      map(results => results.length === 0), // Username is valid if no user is found with that username
      catchError(() => of(false))
    );
  }

  setChatbotExpanded(expanded: boolean): void {
    this.chatbotExpandedSubject.next(expanded);
  }

  setNavigationContext(context: NavigationContext | null): void {
    this.navigationContextSubject.next(context);
  }
}