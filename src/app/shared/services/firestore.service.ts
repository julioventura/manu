import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, defer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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

  // CREATE: Adicionar um novo registro à subcoleção do usuário
  addRegistro(collectionPath: string, registro: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const id = registro.id ? registro.id : this.createId();
        const registroComId = { ...registro, id };
        
        runInInjectionContext(this.injector, () => {
          const docRef = this.firestore.collection(collectionPath).doc(id);
          docRef.set(registroComId)
            .then(() => resolve())
            .catch((error) => {
              console.error('Error in addRegistro:', error);
              reject(error);
            });
        });
      } catch (error) {
        console.error('Error creating document reference in addRegistro:', error);
        reject(error);
      }
    });
  }

  getRegistros(path: string, queryFn?: QueryFn): Observable<T[]> {
    return runInInjectionContext(this.injector, () => 
      this.firestore.collection<T>(path, queryFn).valueChanges({ idField: 'id' })
    );
  }

  // Método para obter uma coleção inteira
  getColecao(collectionPath: string): Observable<T[]> {
    return runInInjectionContext(this.injector, () => 
      this.firestore.collection<T>(collectionPath).valueChanges()
    );
  }

  // READ: Buscar registro por ID usando AngularFirestore (padrão Angular 20+)
  getRegistroById<U = T>(collectionPath: string, id: string): Observable<U | undefined> {
    return runInInjectionContext(this.injector, () => 
      this.firestore.collection<U>(collectionPath).doc(id).valueChanges()
    );
  }

  // Adicionar o tipo genérico ao método getRegistroByUsername

  // Método para buscar registro por username
  getRegistroByUsername<U>(collection: string, username: string): Observable<U[]> {
    return runInInjectionContext(this.injector, () => 
      this.firestore.collection<U>(collection, ref => ref.where('username', '==', username)).valueChanges({ idField: 'id' })
    );
  }

  // UPDATE: Atualizar um registro existente
  updateRegistro(collectionPath: string, id: string, registro: Partial<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        runInInjectionContext(this.injector, () => {
          const docRef = this.firestore.collection(collectionPath).doc(id);
          
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
        runInInjectionContext(this.injector, () => {
          const docRef = this.firestore.collection(collectionPath).doc(id);
          docRef.set(registro, { merge: true })
            .then(() => resolve())
            .catch((error) => {
              console.error('Error in upsertRegistro:', error);
              reject(error);
            });
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
        runInInjectionContext(this.injector, () => {
          const docRef = this.firestore.collection(collectionPath).doc(id);
          docRef.delete()
            .then(() => resolve())
            .catch((error) => {
              console.error('Error in deleteRegistro:', error);
              reject(error);
            });
        });
      } catch (error) {
        console.error('Error creating document reference in deleteRegistro:', error);
        reject(error);
      }
    });
  }

  // Método para gerar um ID único
  createId(): string {
    return runInInjectionContext(this.injector, () => 
      this.firestore.createId()
    );
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

  getDocumentsPaginated(collectionPath: string, limit: number, startAfter?: unknown): Observable<T[]> {
    return defer(() => {
      try {
        return runInInjectionContext(this.injector, () => 
          this.firestore.collection<T>(collectionPath, ref => {
            let query = ref.orderBy('createdAt', 'desc').limit(limit);
            if (startAfter) {
              query = query.startAfter(startAfter);
            }
            return query;
          }).valueChanges({ idField: 'id' })
        ).pipe(
          catchError(error => {
            console.error('Error in getDocumentsPaginated:', error);
            return of([]);
          })
        );
      } catch (error) {
        console.error('Error creating collection reference in getDocumentsPaginated:', error);
        return of([]);
      }
    });
  }

  // Método para buscar por campo específico
  getDocumentsByField(collectionPath: string, field: string, value: unknown): Observable<T[]> {
    return defer(() => {
      try {
        return runInInjectionContext(this.injector, () => 
          this.firestore.collection<T>(collectionPath, ref => 
            ref.where(field, '==', value)
          ).valueChanges({ idField: 'id' })
        ).pipe(
          catchError(error => {
            console.error('Error in getDocumentsByField:', error);
            return of([]);
          })
        );
      } catch (error) {
        console.error('Error creating collection reference in getDocumentsByField:', error);
        return of([]);
      }
    });
  }

  // Método para buscar documentos com query complexa
  getDocumentsWithQuery(collectionPath: string, queryFn: QueryFn): Observable<T[]> {
    return defer(() => {
      try {
        return runInInjectionContext(this.injector, () => 
          this.firestore.collection<T>(collectionPath, queryFn).valueChanges({ idField: 'id' })
        ).pipe(
          catchError(error => {
            console.error('Error in getDocumentsWithQuery:', error);
            return of([]);
          })
        );
      } catch (error) {
        console.error('Error creating collection reference in getDocumentsWithQuery:', error);
        return of([]);
      }
    });
  }

  // Método para gerar próximo código (usando Promise para manter compatibilidade)
  gerarProximoCodigo(collection: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const collectionRef = runInInjectionContext(this.injector, () => 
          this.firestore.collection(collection)
        );
        
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

  // Get document by full path (including subdocuments)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDocumentByPath<U = T>(path: string): Observable<any> {
    return runInInjectionContext(this.injector, () => 
      this.firestore.doc<U>(path).get()
    );
  }

  // Set document by full path (including subdocuments)
  setDocumentByPath(path: string, data: Record<string, unknown>): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      this.firestore.doc(path).set(data)
    );
  }

  // Batch add multiple records
  async batchAddRegistros(collectionPath: string, registros: T[]): Promise<void> {
    return runInInjectionContext(this.injector, () => {
      const batch = this.firestore.firestore.batch();
      const collectionRef = this.firestore.collection(collectionPath).ref;

      registros.forEach(registro => {
        const docRef = collectionRef.doc();
        const registroComId = { ...registro, id: docRef.id };
        batch.set(docRef, registroComId);
      });

      return batch.commit();
    });
  }
}
