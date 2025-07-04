import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, switchMap, take, filter, tap, catchError } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

import { Group, GroupJoinRequest, SharingHistoryItem } from './group.model';

// ADICIONAR: interfaces necessárias

interface JoinRequestData {
  groupId: string;
  userId: string;
  userEmail: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: firebase.firestore.Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  userId: string | null = null;
  userEmail: string | null = null; // ADICIONAR: propriedade necessária
  private debug: boolean = false;

  constructor(
    private firestore: AngularFirestore,
    public afAuth: AngularFireAuth
  ) {
    this.afAuth.authState.subscribe(user => {
      this.userId = user ? user.uid : null;
      this.userEmail = user ? user.email : null; // CORRIGIR: atualizar userEmail
      console.log('GroupService: Auth state changed, userId:', this.userId ? 'authenticated' : 'not authenticated');
      if (user) {
        console.log('GroupService: User details:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      }
    });
  }

  // ADICIONAR: método para controlar debug
  setDebugMode(enabled: boolean): void {
    this.debug = enabled;
  }

  /**
   * Retorna todos os grupos disponíveis
   */
  getAllGroups(): Observable<Group[]> {
    return this.firestore.collection<Group>('groups').valueChanges({ idField: 'id' });
  }

  /**
   * Retorna grupos onde o usuário atual é membro ou admin
   */
  getAllUserGroups(): Observable<Group[]> {
    console.log('GroupService.getAllUserGroups: Starting, userId:', this.userId);
    
    // CORRIGIR: aguardar userId estar disponível em vez de retornar vazio
    return this.afAuth.authState.pipe(
      filter((user): user is firebase.User => !!user && !!user.uid),
      take(1),
      tap(user => {
        console.log('GroupService.getAllUserGroups: User from afAuth:', {
          uid: user.uid,
          email: user.email
        });
        // ADICIONAR: atualizar userId se não estiver definido
        if (!this.userId) {
          this.userId = user.uid;
        }
      }),
      switchMap(user => {
        const userEmail = user.email;
        const uid = user.uid;

        if (!userEmail || !uid) {
          console.warn('GroupService: User email or UID not available');
          return of([]);
        }

        console.log('GroupService: Searching groups for:', { uid, userEmail });
        
        return this.firestore
          .collection<Group>('groups')
          .valueChanges({ idField: 'id' })
          .pipe(
            tap(allGroups => {
              console.log('GroupService: All groups in database:', allGroups);
              console.log('GroupService: Total groups found:', allGroups.length);
              
              allGroups.forEach((group, index) => {
                console.log(`Group ${index + 1}:`, {
                  id: group.id,
                  name: group.name,
                  adminIds: group.adminIds,
                  memberIds: group.memberIds,
                  userIsAdmin: group.adminIds?.includes(uid) || group.adminIds?.includes(userEmail),
                  userIsMember: group.memberIds?.includes(uid) || group.memberIds?.includes(userEmail)
                });
              });
            }),
            map((allGroups: Group[]) => {
              const userGroups = allGroups.filter(group => {
                const isAdmin = group.adminIds?.includes(uid) || group.adminIds?.includes(userEmail);
                const isMember = group.memberIds?.includes(uid) || group.memberIds?.includes(userEmail);
                const isUserGroup = isAdmin || isMember;
                
                if (isUserGroup) {
                  console.log(`GroupService: User belongs to group "${group.name}":`, {
                    isAdmin,
                    isMember,
                    adminIds: group.adminIds,
                    memberIds: group.memberIds
                  });
                }
                
                return isUserGroup;
              });
              
              console.log('GroupService: Filtered user groups:', userGroups);
              return userGroups;
            })
          );
      }),
      catchError(error => {
        console.error('[GroupService] Error in getAllUserGroups:', error);
        return of([]);
      })
    );
  }

  getSharedRecords(collectionName: string): Observable<Record<string, unknown>[]> {
    return this.getAllUserGroups().pipe(
      switchMap(userGroups => {
        if (!userGroups || userGroups.length === 0) {
          console.log('[GroupService] No user groups found');
          return of([]);
        }

        const groupIds = userGroups
          .map(group => group.id)
          .filter((id): id is string => id !== undefined && id !== null);
          
        if (groupIds.length === 0) {
          console.log('[GroupService] No valid group IDs found');
          return of([]);
        }
        
        const userCollectionPath = `users/${this.userId}/${collectionName}`;
        
        return this.firestore.collection(userCollectionPath).valueChanges({ idField: 'id' }).pipe(
          map((records: unknown[]) => {
            console.log(`[GroupService] Found ${records.length} records in ${userCollectionPath}`);
            
            const sharedRecords = records.filter((record): record is Record<string, unknown> => {
              if (!record || typeof record !== 'object') return false;
              
              const recordObj = record as Record<string, unknown>;
              const hasGroupId = recordObj && recordObj['groupId'];
              const isInUserGroup = hasGroupId && groupIds.includes(recordObj['groupId'] as string);
              
              if (this.debug) {
                console.log(`[GroupService] Record ${recordObj['id']}: groupId=${recordObj['groupId']}, inUserGroup=${isInUserGroup}`);
              }
              
              return !!isInUserGroup;
            });
            
            console.log(`[GroupService] Filtered to ${sharedRecords.length} shared records`);
            return sharedRecords;
          }),
          catchError(error => {
            console.error(`[GroupService] Error loading records from ${userCollectionPath}:`, error);
            return of([]);
          })
        );
      }),
      catchError(error => {
        console.error('[GroupService] Error in getSharedRecords:', error);
        return of([]);
      })
    );
  }

  /**
   * Cria um novo grupo
   */
  createGroup(groupData: Omit<Group, 'id'>): Observable<void> {
    return this.getCurrentUserId().pipe(
      switchMap(userId => {
        const group: Group = {
          ...groupData,
          adminIds: groupData.adminIds || [userId],
          memberIds: groupData.memberIds || [userId],
          createdAt: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
          createdBy: userId
        };

        return from(this.firestore.collection('groups').add(group)).pipe(
          map(() => void 0) // Converter para Observable<void>
        );
      })
    );
  }

  /**
   * Atualiza um grupo existente
   */
  updateGroup(groupId: string, groupData: Partial<Group>): Observable<void> {
    return from(
      this.firestore.collection('groups').doc(groupId).update({
        ...groupData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: this.userId
      })
    );
  }

  /**
   * Atualiza um grupo existente (método original, para compatibilidade)
   */
  updateGroupPromise(groupId: string, groupData: Partial<Group>): Promise<void> {
    return this.firestore.collection('groups').doc(groupId).update({
      ...groupData,
      updatedAt: new Date(),
      updatedBy: this.userId
    });
  }

  /**
   * Adiciona um membro ao grupo
   */
  addGroupMember(groupId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const field = isAdmin ? 'adminIds' : 'memberIds';
    return this.firestore.collection('groups').doc(groupId).update({
      [field]: firebase.firestore.FieldValue.arrayUnion(userId)
    });
  }

  /**
   * Remove um membro do grupo
   */
  removeGroupMember(groupId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const field = isAdmin ? 'adminIds' : 'memberIds';
    return this.firestore.collection('groups').doc(groupId).update({
      [field]: firebase.firestore.FieldValue.arrayRemove(userId)
    });
  }

  /**
   * Exclui um grupo
   */
  deleteGroup(groupId: string): Observable<void> {
    return from(this.firestore.collection('groups').doc(groupId).delete());
  }

  /**
   * Exclui um grupo (método original, para compatibilidade)
   */
  deleteGroupPromise(groupId: string): Promise<void> {
    return this.firestore.collection('groups').doc(groupId).delete();
  }

  getGroup(groupId: string): Observable<Group | null> {
    return this.firestore.doc<Group>(`groups/${groupId}`).valueChanges()
      .pipe(map(group => group || null));
  }

  getUserGroups(): Observable<Group[]> {
    if (!this.userId) return of([]);

    return this.firestore.collection<Group>('groups', ref =>
      ref.where('memberIds', 'array-contains', this.userId)
    ).valueChanges();
  }

  getAdminGroups(): Observable<Group[]> {
    if (!this.userId) return of([]);

    return this.firestore.collection<Group>('groups', ref =>
      ref.where('adminIds', 'array-contains', this.userId)
    ).valueChanges();
  }

  isGroupAdmin(groupId: string): Observable<boolean> {
    if (!this.userId) return of(false);

    return this.firestore.doc(`groups/${groupId}`).valueChanges().pipe(
      map((group: unknown) => {
        if (!group || typeof group !== 'object') return false;
        const groupObj = group as Record<string, unknown>;
        // CORRIGIDO: usar notação de colchetes para index signature
        return !!(groupObj['adminIds'] && Array.isArray(groupObj['adminIds']) && groupObj['adminIds'].includes(this.userId));
      })
    );
  }

  shareRecordWithGroup(collection: string, recordId: string, groupId: string): Promise<void> {
    if (!this.userId) {
      console.error('GroupService: Tentativa de compartilhamento sem usuário autenticado');
      return Promise.reject('Usuário não autenticado');
    }

    if (!collection || !recordId || !groupId) {
      console.error('GroupService: Parâmetros inválidos para compartilhamento', {
        collection, recordId, groupId
      });
      return Promise.reject('Parâmetros inválidos');
    }

    const now = new Date();
    const nowTs = firebase.firestore.Timestamp.fromDate(now);

    return new Promise<void>((resolve, reject) => {
      this.firestore.doc(`groups/${groupId}`).get().pipe(
        take(1)
      ).subscribe({
        next: (groupDoc) => {
          if (!groupDoc.exists) {
            console.error('GroupService: Grupo não encontrado', groupId);
            reject('Grupo não encontrado');
            return;
          }

          const recordPath = `users/${this.userId}/${collection}/${recordId}`;
          
          this.firestore.doc(recordPath).update({
            groupId: groupId,
            sharedAt: nowTs,
            sharedBy: this.userId,
            updatedAt: nowTs
          }).then(() => {
            console.log('GroupService: Registro compartilhado com sucesso');
            resolve();
          }).catch((error: unknown) => {
            console.error('GroupService: Erro ao compartilhar registro', error);
            reject(error);
          });
        },
        error: (error: unknown) => {
          console.error('GroupService: Erro ao verificar grupo', error);
          reject(error);
        }
      });
    });
  }

  removeRecordSharing(collection: string, recordId: string): Promise<void> {
    if (!this.userId) {
      console.error('GroupService: Tentativa de remoção de compartilhamento sem usuário autenticado');
      return Promise.reject('Usuário não autenticado');
    }

    return new Promise<void>((resolve, reject) => {
      const recordPath = `users/${this.userId}/${collection}/${recordId}`;
      
      this.firestore.doc(recordPath).update({
        groupId: firebase.firestore.FieldValue.delete(),
        sharedAt: firebase.firestore.FieldValue.delete(),
        sharedBy: firebase.firestore.FieldValue.delete(),
        updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
      }).then(() => {
        console.log('GroupService: Compartilhamento removido com sucesso');
        resolve();
      }).catch((error: unknown) => {
        console.error('GroupService: Erro ao remover compartilhamento', error);
        reject(error);
      });
    });
  }

  // CORRIGIR: método getSharingHistory com interface definida
  getSharingHistory(collection: string, id: string): Observable<SharingHistoryItem[]> {
    if (!collection || !id) {
      return of([]);
    }

    return this.firestore
      .collection(`${collection}/${id}/sharing_history`)
      .valueChanges({ idField: 'id' })
      .pipe(
        map(history => {
          const typedHistory = history as SharingHistoryItem[];
          return typedHistory.sort((a, b) => {
            const aTime = this.safeGetDate(a.timestamp);
            const bTime = this.safeGetDate(b.timestamp);
            return bTime.getTime() - aTime.getTime();
          });
        }),
        catchError(error => {
          console.error('[GroupService] Error loading sharing history:', error);
          return of([]);
        })
      );
  }

  requestJoinGroup(groupId: string, message?: string): Promise<void> {
    if (!this.userId) {
      return Promise.reject('Usuário não autenticado');
    }

    return this.getGroup(groupId).pipe(
      take(1)
    ).toPromise().then(group => {
      if (!group) {
        throw new Error('Grupo não encontrado');
      }

      if (group.memberIds?.includes(this.userId!) || group.adminIds?.includes(this.userId!)) {
        throw new Error('Você já é membro deste grupo');
      }

      return this.afAuth.currentUser;
    })
      .then(snapshot => {
        if (!snapshot) {
          throw new Error('Usuário não autenticado');
        }
        return snapshot;
      })
      .then(user => {
        const requestData: JoinRequestData = {
          groupId: groupId,
          userId: this.userId!,
          userEmail: user.email || '',
          message: message || '',
          status: 'pending' as const,
          requestedAt: firebase.firestore.Timestamp.fromDate(new Date())
        };

        return this.firestore.collection('groupJoinRequests').add(requestData);
      })
      .then(() => {
        console.log('GroupService: Solicitação de entrada criada com sucesso');
      })
      .catch(error => {
        console.error('GroupService: Erro ao criar solicitação de entrada', error);
        throw error;
      });
  }

  // ADICIONAR: método requestToJoinGroup que retorna Observable
  requestToJoinGroup(groupId: string, message?: string): Observable<void> {
    if (!this.userId) {
      return of().pipe(
        switchMap(() => {
          throw new Error('Usuário não autenticado');
        })
      );
    }

    return this.getGroup(groupId).pipe(
      take(1),
      switchMap(group => {
        if (!group) {
          throw new Error('Grupo não encontrado');
        }

        if (group.memberIds?.includes(this.userId!) || group.adminIds?.includes(this.userId!)) {
          throw new Error('Você já é membro deste grupo');
        }

        return this.afAuth.user.pipe(take(1));
      }),
      switchMap(user => {
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        const requestData: JoinRequestData = {
          groupId: groupId,
          userId: this.userId!,
          userEmail: user.email || '',
          message: message || '',
          status: 'pending' as const,
          requestedAt: firebase.firestore.Timestamp.fromDate(new Date())
        };

        return from(this.firestore.collection('groupJoinRequests').add(requestData));
      }),
      map(() => void 0),
      tap(() => {
        console.log('GroupService: Solicitação de entrada criada com sucesso');
      }),
      catchError(error => {
        console.error('GroupService: Erro ao criar solicitação de entrada', error);
        throw error;
      })
    );
  }

  getPendingJoinRequests(): Observable<GroupJoinRequest[]> {
    if (!this.userId) {
      console.warn('GroupService: User not authenticated, cannot load join requests');
      return of([]);
    }

    return this.getAllUserGroups().pipe(
      switchMap(userGroups => {
        // Filtrar apenas grupos onde o usuário é admin
        const adminGroups = userGroups.filter(group => 
          group.adminIds?.includes(this.userId!) || 
          group.adminIds?.includes(this.userEmail || '')
        );
        
        if (adminGroups.length === 0) {
          return of([]);
        }

        // Buscar solicitações pendentes para esses grupos
        const groupIds = adminGroups.map(group => group.id!);
        
        return this.firestore.collection<GroupJoinRequest>('groupJoinRequests', ref => 
          ref.where('groupId', 'in', groupIds)
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
        ).valueChanges({ idField: 'id' });
      }),
      catchError(error => {
        console.error('GroupService: Error loading join requests:', error);
        return of([]);
      })
    );
  }

  // CORRIGIR: approveJoinRequest deve retornar Observable
  approveJoinRequest(requestId: string): Observable<void> {
    console.log(`GroupService: Aprovando solicitação ${requestId}`);

    if (!this.userId) {
      return of().pipe(
        switchMap(() => {
          throw new Error('Usuário não autenticado');
        })
      );
    }

    return this.firestore.doc(`groupJoinRequests/${requestId}`).get().pipe(
      take(1),
      switchMap(doc => {
        if (!doc?.exists) {
          throw new Error('Solicitação não encontrada');
        }

        const requestData = doc.data() as GroupJoinRequest;
        
        return from(this.firestore.doc(`groups/${requestData.groupId}`).update({
          memberIds: firebase.firestore.FieldValue.arrayUnion(requestData.userId)
        })).pipe(
          switchMap(() => {
            return from(this.firestore.doc(`groupJoinRequests/${requestId}`).update({
              status: 'approved',
              reviewedAt: firebase.firestore.Timestamp.fromDate(new Date()),
              reviewedBy: this.userId
            }));
          })
        );
      }),
      tap(() => {
        console.log('GroupService: Solicitação aprovada com sucesso');
      }),
      catchError(error => {
        console.error('GroupService: Erro ao aprovar solicitação', error);
        throw error;
      })
    );
  }

  // CORRIGIR: rejectJoinRequest deve retornar Observable
  rejectJoinRequest(requestId: string, responseMessage?: string): Observable<void> {
    console.log(`GroupService: Rejeitando solicitação ${requestId}`);

    if (!this.userId) {
      return of().pipe(
        switchMap(() => {
          throw new Error('Usuário não autenticado');
        })
      );
    }

    return this.firestore.doc(`groupJoinRequests/${requestId}`).get().pipe(
      take(1),
      switchMap(doc => {
        if (!doc?.exists) {
          throw new Error('Solicitação não encontrada');
        }

        return from(this.firestore.doc(`groupJoinRequests/${requestId}`).update({
          status: 'rejected',
          reviewedAt: firebase.firestore.Timestamp.fromDate(new Date()),
          reviewedBy: this.userId,
          responseMessage: responseMessage || ''
        }));
      }),
      tap(() => {
        console.log('GroupService: Solicitação rejeitada com sucesso');
      }),
      catchError(error => {
        console.error('GroupService: Erro ao rejeitar solicitação', error);
        throw error;
      })
    );
  }

  getRegistroById(collection: string, id: string): Observable<Record<string, unknown> | null> {
    if (!collection || !id) {
      return of(null);
    }

    return this.firestore.collection(collection).doc(id).valueChanges().pipe(
      map(data => {
        return data ? { id, ...data as Record<string, unknown> } : null;
      }),
      catchError(error => {
        console.error(`[GroupService] Error loading record ${id} from ${collection}:`, error);
        return of(null);
      })
    );
  }

  testFirestoreConnection(): Observable<boolean> {
    console.log('Testing Firestore connection...');
    return this.firestore.collection('groups').doc('test').get().pipe(
      map(() => {
        console.log('Firestore connection successful');
        return true;
      }),
      catchError(error => {
        console.error('Firestore connection failed:', error);
        return of(false);
      })
    );
  }

  // Métodos privados helper
  private isValidUser(user: firebase.User | null): user is firebase.User {
    return user !== null && !!user.uid;
  }

  private getCurrentUserId(): Observable<string> {
    return this.afAuth.authState.pipe(
      map(user => {
        if (!this.isValidUser(user)) {
          throw new Error('Usuário não autenticado');
        }
        return user.uid;
      })
    );
  }

  private safeGetDate(timestamp: unknown): Date {
    if (!timestamp) return new Date(0);
    
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as firebase.firestore.Timestamp).toDate();
    }
    
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    return new Date(0);
  }

  private isAuthenticatedUser(user: firebase.User | null): user is firebase.User {
    return user !== null;
  }

  private validateUserAccess(): Observable<string> {
    return this.afAuth.authState.pipe(
      map(user => {
        if (!this.isAuthenticatedUser(user)) {
          throw new Error('Acesso negado');
        }
        return user.uid;
      })
    );
  }
}