import { Injectable, inject } from '@angular/core';
import { Observable, of, from, combineLatest } from 'rxjs';
import { map, switchMap, catchError, take, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GroupService } from './group.service';
import { Group, SharingHistoryItem } from './group.model';
import firebase from 'firebase/compat/app';

// Interfaces para tipagem
interface DocumentRecord {
  id: string;
  [key: string]: unknown;
}

interface RecordSearchResult {
  found: boolean;
  record?: DocumentRecord;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupSharingService {
  // Usar inject() em vez de constructor injection
  private firestore = inject(AngularFirestore);
  private groupService = inject(GroupService);

  constructor() {}

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      switch (errorCode) {
      case 'permission-denied':
        return 'Permissão negada. Verifique suas credenciais.';
      case 'not-found':
        return 'Registro não encontrado.';
      case 'unavailable':
        return 'Serviço temporariamente indisponível. Tente novamente.';
      case 'invalid-argument':
        return 'Dados inválidos fornecidos.';
      case 'deadline-exceeded':
        return 'Tempo limite excedido. Tente novamente.';
      case 'already-exists':
        return 'Registro já existe.';
      case 'resource-exhausted':
        return 'Limite de recursos excedido.';
      case 'failed-precondition':
        return 'Condição prévia não atendida.';
      case 'aborted':
        return 'Operação foi abortada.';
      case 'out-of-range':
        return 'Valor fora do intervalo permitido.';
      case 'unimplemented':
        return 'Operação não implementada.';
      case 'internal':
        return 'Erro interno do servidor.';
      case 'data-loss':
        return 'Perda de dados detectada.';
      case 'unauthenticated':
        return 'Usuário não autenticado.';
      default:
        return `Erro do sistema: ${errorCode}`;
      }
    }
    
    return 'Erro desconhecido';
  }

  loadSharingHistory(collection: string, recordId: string): Observable<SharingHistoryItem[]> {
    if (!collection || !recordId) {
      return of([]);
    }

    return this.groupService.getSharingHistory(collection, recordId).pipe(
      catchError((error: unknown) => {
        console.error('[GroupSharingService] Error loading sharing history:', error);
        return of([]);
      })
    );
  }

  loadGroupDetails(groupIds: string[]): Observable<{ [key: string]: Group }> {
    if (!groupIds || groupIds.length === 0) {
      return of({});
    }

    const groupObservables = groupIds.map(groupId =>
      this.groupService.getGroup(groupId).pipe(
        map(group => ({ groupId, group })),
        catchError(() => of({ groupId, group: null }))
      )
    );

    return combineLatest(groupObservables).pipe(
      map(results => {
        const groupDetails: { [key: string]: Group } = {};
        results.forEach(({ groupId, group }) => {
          if (group) {
            groupDetails[groupId] = group;
          }
        });
        return groupDetails;
      })
    );
  }

  handleRecordSharing(
    collection: string,
    recordId: string,
    groupId: string | null,
    currentGroupId: string | null
  ): Observable<void> {
    if (!collection || !recordId) {
      return new Observable(observer => {
        observer.error('Parâmetros inválidos');
      });
    }

    if (groupId === currentGroupId) {
      return new Observable(observer => {
        observer.error('O registro já está compartilhado com este grupo');
      });
    }

    if (groupId) {
      return this.shareWithGroupInternal(collection, recordId, groupId);
    } else {
      return this.removeSharing(collection, recordId);
    }
  }

  private shareWithGroupInternal(collection: string, recordId: string, groupId: string): Observable<void> {
    return this.verifyGroupExists(groupId).pipe(
      switchMap(exists => {
        if (!exists) {
          throw new Error('Grupo não encontrado');
        }
        
        return this.findRecordInUserCollections(collection, recordId);
      }),
      switchMap((searchResult: RecordSearchResult) => {
        if (!searchResult.found || !searchResult.record) {
          throw new Error('Registro não encontrado');
        }

        return this.updateRecordSharing(collection, recordId, groupId, searchResult.record);
      }),
      catchError((error: unknown) => {
        console.error('[GroupSharingService] Error sharing record:', error);
        throw error;
      })
    );
  }

  private removeSharing(collection: string, recordId: string): Observable<void> {
    return this.findRecordInUserCollections(collection, recordId).pipe(
      switchMap((searchResult: RecordSearchResult) => {
        if (!searchResult.found || !searchResult.record) {
          throw new Error('Registro não encontrado');
        }

        return this.updateRecordSharing(collection, recordId, null, searchResult.record);
      }),
      catchError((error: unknown) => {
        console.error('[GroupSharingService] Error removing sharing:', error);
        throw error;
      })
    );
  }

  private verifyGroupExists(groupId: string): Observable<boolean> {
    return this.groupService.getGroup(groupId).pipe(
      map(group => !!group),
      catchError(() => of(false))
    );
  }

  private findRecordInUserCollections(collection: string, recordId: string): Observable<RecordSearchResult> {
    return this.groupService.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (!user?.uid) {
          throw new Error('Usuário não autenticado');
        }

        const userId = user.uid;
        const recordPath = `users/${userId}/${collection}/${recordId}`;
        
        return this.firestore.doc(recordPath).valueChanges({ idField: 'id' });
      }),
      map((record: unknown): RecordSearchResult => {
        if (!record || typeof record !== 'object') {
          return { found: false };
        }

        const documentRecord = record as DocumentRecord;
        if (!documentRecord.id) {
          return { found: false };
        }

        return {
          found: true,
          record: documentRecord
        };
      }),
      catchError((error: unknown) => {
        console.error('[GroupSharingService] Error finding record:', error);
        return of({
          found: false,
          error: this.getErrorMessage(error)
        });
      })
    );
  }

  private updateRecordSharing(
    collection: string,
    recordId: string,
    groupId: string | null,
    record: DocumentRecord
  ): Observable<void> {
    return this.groupService.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (!user?.uid) {
          throw new Error('Usuário não autenticado');
        }

        const userId = user.uid;
        const recordPath = `users/${userId}/${collection}/${recordId}`;
        
        const updateData: Record<string, unknown> = {
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
        };

        if (groupId) {
          // CORRIGIDO: usar notação de colchetes para index signature
          updateData['groupId'] = groupId;
          updateData['sharedAt'] = firebase.firestore.Timestamp.fromDate(new Date());
          updateData['sharedBy'] = userId;
        } else {
          updateData['groupId'] = firebase.firestore.FieldValue.delete();
          updateData['sharedAt'] = firebase.firestore.FieldValue.delete();
          updateData['sharedBy'] = firebase.firestore.FieldValue.delete();
        }

        // Use record to validate the operation if needed
        console.log(`[GroupSharingService] Updating record ${record.id} sharing to group: ${groupId}`);

        return from(this.firestore.doc(recordPath).update(updateData));
      }),
      tap(() => {
        console.log('[GroupSharingService] Record sharing updated successfully');
      }),
      catchError((error: unknown) => {
        console.error('[GroupSharingService] Error updating record sharing:', error);
        throw error;
      })
    );
  }

  shareWithGroup(collection: string, recordId: string, groupId: string | null): Observable<void> {
    return this.groupService.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }

        const userId = user.uid;
        const recordPath = `users/${userId}/${collection}/${recordId}`;
        
        if (groupId) {
          // Share with group
          const updateData = {
            groupId: groupId,
            sharedAt: firebase.firestore.Timestamp.fromDate(new Date()),
            sharedBy: userId,
            updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
          };
          
          return from(this.firestore.doc(recordPath).update(updateData));
        } else {
          // Remove sharing
          const updateData = {
            groupId: firebase.firestore.FieldValue.delete(),
            sharedAt: firebase.firestore.FieldValue.delete(), 
            sharedBy: firebase.firestore.FieldValue.delete(),
            updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
          };
          
          return from(this.firestore.doc(recordPath).update(updateData));
        }
      })
    );
  }
}