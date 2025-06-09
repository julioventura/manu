import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Observable, of, from } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';

// Interface para usuário
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Adicionar propriedades que estão sendo acessadas
  public userProfile: UserProfile | null = null;
  
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
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
        return this.firestore.doc<UserProfile>(`users/${user.uid}`).valueChanges();
      }),
      map(profile => profile || null),
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

    return from(this.firestore.doc(`users/${user.uid}`).set(userProfile));
  }

  updateUserProfile(uid: string, data: Partial<UserProfile>): Observable<void> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    return from(this.firestore.doc(`users/${uid}`).update(updateData));
  }

  getUserData(uid: string): Observable<UserData | null> {
    return this.firestore.doc<UserData>(`users/${uid}`).valueChanges().pipe(
      map(userData => userData || null),
      catchError(error => {
        console.error('Error getting user data:', error);
        return of(null);
      })
    );
  }

  searchUsersByEmail(email: string): Observable<UserData[]> {
    return this.firestore.collection<UserData>('users', ref => 
      ref.where('email', '==', email)
    ).valueChanges().pipe(
      catchError(error => {
        console.error('Error searching users by email:', error);
        return of([]);
      })
    );
  }

  userExists(uid: string): Observable<boolean> {
    return this.firestore.doc(`users/${uid}`).get().pipe(
      map(doc => doc.exists),
      catchError(() => of(false))
    );
  }

  deleteUserProfile(uid: string): Observable<void> {
    return from(this.firestore.doc(`users/${uid}`).delete());
  }

  getAllUsers(): Observable<UserData[]> {
    return this.firestore.collection<UserData>('users').valueChanges().pipe(
      catchError(error => {
        console.error('Error getting all users:', error);
        return of([]);
      })
    );
  }

  checkUserPermissions(uid: string): Observable<UserPermissions> {
    return this.firestore.doc(`users/${uid}`).valueChanges().pipe(
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

    return from(this.firestore.collection('userLogs').add(logData)).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error logging user activity:', error);
        return of(void 0);
      })
    );
  }

  getUserActivityLogs(uid: string): Observable<ActivityLog[]> {
    return this.firestore.collection<ActivityLog>('userLogs', ref => 
      ref.where('uid', '==', uid).orderBy('timestamp', 'desc').limit(50)
    ).valueChanges().pipe(
      catchError(error => {
        console.error('Error getting user activity logs:', error);
        return of([]);
      })
    );
  }

  updateLastAccess(uid: string): Observable<void> {
    return from(this.firestore.doc(`users/${uid}`).update({
      lastAccess: new Date(),
      updatedAt: new Date()
    }));
  }

  emailExists(email: string): Observable<boolean> {
    return this.firestore.collection('users', ref => 
      ref.where('email', '==', email).limit(1)
    ).get().pipe(
      map(snapshot => !snapshot.empty),
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

    return this.firestore.collection<UserData>('users', ref => 
      ref.where(key, '==', value)
    ).valueChanges().pipe(
      catchError(error => {
        console.error('Error searching users:', error);
        return of([]);
      })
    );
  }

  getUserCount(): Observable<number> {
    return this.firestore.collection('users').get().pipe(
      map(snapshot => snapshot.size),
      catchError(() => of(0))
    );
  }

  getActiveUsers(daysAgo: number = 30): Observable<UserData[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return this.firestore.collection<UserData>('users', ref => 
      ref.where('lastAccess', '>=', cutoffDate)
    ).valueChanges().pipe(
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
        
        const recordPath = `users/${user.uid}/${collection}/${recordId}`;
        return from(this.firestore.doc(recordPath).delete());
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
          return this.firestore.doc<UserProfile>(`usuarios/dentistascombr/users/${user.email}`).valueChanges();
        }
        return of(null);
      }),
      map((profile: UserProfile | null | undefined): UserProfile | null => profile ?? null),
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
    return this.firestore.collection<UserProfile>('usuarios/dentistascombr/users', ref => 
      ref.where('username', '==', username)
    ).valueChanges().pipe(
      map((profiles: (UserProfile | undefined)[]): UserProfile[] => 
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

  setHomepageProfile(profile: UserProfile): void {
    this.userProfile = profile;
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
  }

  getUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  isValidUsername(username: string): Observable<boolean> {
    return this.firestore.collection('usuarios/dentistascombr/users', ref => 
      ref.where('username', '==', username).limit(1)
    ).get().pipe(
      map(snapshot => !snapshot.empty),
      catchError(() => of(false))
    );
  }
}