// Alteração: remoção de logs de depuração (console.log)
import { Injectable, runInInjectionContext, Injector } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, defer } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { UtilService } from '../../shared/utils/util.service';

@Injectable({
  providedIn: 'root'
})

export class FirestoreService<T extends { id?: string }> {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    public util: UtilService,
    private injector: Injector
  ) { }

  // Helper method to safely get collection reference
  private getCollectionRef(collectionPath: string) {
    return runInInjectionContext(this.injector, () => {
      return this.firestore.collection(collectionPath);
    });
  }

  // Helper method to safely get document reference  
  private getDocRef(collectionPath: string, id: string) {
    return runInInjectionContext(this.injector, () => {
      return this.firestore.collection(collectionPath).doc(id);
    });
  }

  private async getCurrentUserId(): Promise<string | null> {
    const user = await this.auth.currentUser;
    return user ? user.uid : null;
  }

  // CREATE: Adicionar um novo registro à subcoleção do usuário
  addRegistro(collectionPath: string, registro: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const id = registro.id ? registro.id : this.createId();
        const registroComId = { ...registro, id };
        const docRef = this.getDocRef(collectionPath, id);
        docRef.set(registroComId)
          .then(() => resolve())
          .catch((error) => {
            console.error('Error in addRegistro:', error);
            reject(error);
          });
      } catch (error) {
        console.error('Error creating document reference in addRegistro:', error);
        reject(error);
      }
    });
  }

  // Altere o método para aceitar uma função de consulta como argumento opcional
  getRegistros(path: string, queryFn?: QueryFn): Observable<T[]> {
    // Use runInInjectionContext to ensure proper injection context
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        try {
          return this.firestore.collection<T>(path, queryFn).valueChanges({ idField: 'id' }).pipe(
            catchError(error => {
              console.error('Error in getRegistros:', error);
              return of([]);
            })
          );
        } catch (error) {
          console.error('Error creating collection reference:', error);
          return of([]);
        }
      });
    });
  }

  // Método para obter uma coleção inteira
  getColecao(collectionPath: string): Observable<T[]> {
    // Use runInInjectionContext to ensure proper injection context
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        try {
          return this.firestore.collection<T>(collectionPath).valueChanges().pipe(
            catchError(error => {
              console.error('Error in getColecao:', error);
              return of([]);
            })
          );
        } catch (error) {
          console.error('Error creating collection reference:', error);
          return of([]);
        }
      });
    });
  }

  // READ: Buscar registro por ID (usado para perfis pessoais, baseado no UID)
  getRegistroById<U = T>(collectionPath: string, id: string): Observable<U | undefined> {
    // Use runInInjectionContext to ensure proper injection context
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        try {
          return this.firestore.collection<U>(collectionPath).doc(id).valueChanges().pipe(
            map(data => data as U | undefined),
            catchError(error => {
              console.error('Error in getRegistroById:', error);
              return of(undefined);
            })
          );
        } catch (error) {
          console.error('Error creating document reference:', error);
          return of(undefined);
        }
      });
    });
  }

  // Adicionar o tipo genérico ao método getRegistroByUsername

  // Método para buscar registro por username
  getRegistroByUsername<U>(collection: string, username: string): Observable<U[]> {
    // Use runInInjectionContext to ensure proper injection context
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        try {
          return this.firestore.collection<U>(collection, ref => 
            ref.where('username', '==', username)
          ).valueChanges({ idField: 'id' }).pipe(
            tap((results) => {
              if (results.length > 0) {
                console.log('Found user by username:', username);
              }
            }),
            catchError(error => {
              console.error('FirestoreService: Erro ao buscar por username:', error);
              return of([] as U[]);
            })
          );
        } catch (error) {
          console.error('Error creating collection reference:', error);
          return of([] as U[]);
        }
      });
    });
  }

  // UPDATE: Atualizar um registro existente
  updateRegistro(collectionPath: string, id: string, registro: Partial<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Capture the document reference inside injection context using helper method
        const docRef = this.getDocRef(collectionPath, id);
        
        // First check if document exists before updating
        docRef.get().toPromise().then(docSnapshot => {
          if (!docSnapshot || !docSnapshot.exists) {
            // Document doesn't exist, create it instead
            console.warn(`Document ${id} doesn't exist, creating it instead of updating`);
            return docRef.set(registro);
          } else {
            // Document exists, update it
            return docRef.update(registro);
          }
        }).then(() => {
          resolve();
        }).catch((error) => {
          console.error('Error in updateRegistro:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Error creating document reference in updateRegistro:', error);
        reject(error);
      }
    });
  }

  // UPSERT: Create or update a registro
  upsertRegistro(collectionPath: string, id: string, registro: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use helper method to get document reference
        const docRef = this.getDocRef(collectionPath, id);
        docRef.set(registro, { merge: true })
          .then(() => resolve())
          .catch((error) => {
            console.error('Error in upsertRegistro:', error);
            reject(error);
          });
      } catch (error) {
        console.error('Error creating document reference in upsertRegistro:', error);
        reject(error);
      }
    });
  }

  // DELETE: Deletar um registro
  deleteRegistro(collectionPath: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const docRef = this.getDocRef(collectionPath, id);
        docRef.delete()
          .then(() => resolve())
          .catch((error) => {
            console.error('Error in deleteRegistro:', error);
            reject(error);
          });
      } catch (error) {
        console.error('Error creating document reference in deleteRegistro:', error);
        reject(error);
      }
    });
  }

  // Método para gerar um ID único
  createId(): string {
    return this.firestore.createId();
  }

  // Método para criar um timestamp
  createTimestamp() {
    return new Date();
  }

  // Método para upload de arquivos
  uploadFile(file: File, path: string): Observable<string> {
    const filePath = `${path}/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    
    return task.snapshotChanges().pipe(
      switchMap(() => fileRef.getDownloadURL()),
      catchError(error => {
        console.error('Error uploading file:', error);
        return of('');
      })
    );
  }

  // Método para buscar documentos com paginação
  getDocumentsPaginated(collectionPath: string, limit: number, startAfter?: unknown): Observable<T[]> {
    // Use runInInjectionContext to ensure proper injection context
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        try {
          return this.firestore.collection<T>(collectionPath, ref => {
            let query = ref.orderBy('createdAt', 'desc').limit(limit);
            if (startAfter) {
              query = query.startAfter(startAfter);
            }
            return query;
          }).valueChanges({ idField: 'id' }).pipe(
            catchError(error => {
              console.error('Error in getDocumentsPaginated:', error);
              return of([]);
            })
          );
        } catch (error) {
          console.error('Error creating collection reference:', error);
          return of([]);
        }
      });
    });
  }

  // Método para buscar por campo específico
  getDocumentsByField(collectionPath: string, field: string, value: unknown): Observable<T[]> {
    // Use runInInjectionContext to ensure proper injection context
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        try {
          return this.firestore.collection<T>(collectionPath, ref => 
            ref.where(field, '==', value)
          ).valueChanges({ idField: 'id' }).pipe(
            catchError(error => {
              console.error('Error in getDocumentsByField:', error);
              return of([]);
            })
          );
        } catch (error) {
          console.error('Error creating collection reference:', error);
          return of([]);
        }
      });
    });
  }

  // Método para buscar documentos com query complexa
  getDocumentsWithQuery(collectionPath: string, queryFn: QueryFn): Observable<T[]> {
    // Use runInInjectionContext to ensure proper injection context
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        try {
          return this.firestore.collection<T>(collectionPath, queryFn).valueChanges({ idField: 'id' }).pipe(
            catchError(error => {
              console.error('Error in getDocumentsWithQuery:', error);
              return of([]);
            })
          );
        } catch (error) {
          console.error('Error creating collection reference:', error);
          return of([]);
        }
      });
    });
  }

  // Método para gerar próximo código (usando Promise para manter compatibilidade)
  gerarProximoCodigo(collection: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        // Capture the collection reference inside injection context using helper method
        const collectionRef = this.getCollectionRef(collection);
        
        collectionRef.get().toPromise().then((querySnapshot) => {
          let novoCodigo = '001';
          
          if (querySnapshot && querySnapshot.docs.length > 0) {
            const registros = querySnapshot.docs.map(doc => doc.data() as { codigo?: string });
            const codigos = registros.map((r: { codigo?: string }) => r.codigo ? r.codigo.split('-')[0] : '001');
            const ultimoCodigo = Math.max(...codigos.map(c => parseInt(c, 10)));
            const proximoCodigo = (ultimoCodigo + 1).toString().padStart(3, '0');
            novoCodigo = proximoCodigo;
          }

          const digitoVerificador = this.util.calcularDigitoVerificador(novoCodigo);
          resolve(`${novoCodigo}-${digitoVerificador}`);
        }).catch((error) => {
          console.error('Error generating next code:', error);
          reject('Erro ao gerar o próximo código.');
        });
      } catch (error) {
        console.error('Error creating collection reference:', error);
        reject(error);
      }
    });
  }

  // Método para deletar um arquivo do Firebase Storage
  deleteFile(fileUrl: string): Promise<void> {
    return this.storage.refFromURL(fileUrl).delete().toPromise();
  }

}
