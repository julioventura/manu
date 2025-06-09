// Alteração: remoção de logs de depuração (console.log)
import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UtilService } from '../../shared/utils/util.service';

@Injectable({
  providedIn: 'root'
})

export class FirestoreService<T extends { id?: string }> {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private auth: AngularFireAuth, // Certifique-se de que está injetado
    public util: UtilService
  ) { }

  private async getCurrentUserId(): Promise<string | null> {
    const user = await this.auth.currentUser;
    return user ? user.uid : null;
  }

  // CREATE: Adicionar um novo registro à subcoleção do usuário
  addRegistro(collectionPath: string, registro: T): Promise<void> {
    const id = registro.id ? registro.id : this.createId(); // Garante que o campo id seja preenchido
    const registroComId = { ...registro, id }; // Insere o campo id
    return this.firestore.collection(collectionPath).doc(id).set(registroComId);
  }


  // Altere o método para aceitar uma função de consulta como argumento opcional
  getRegistros(path: string, queryFn?: QueryFn) {
    return this.afs.collection<T>(path, queryFn).valueChanges({ idField: 'id' });
  }

  // Método para obter uma coleção inteira
  getColecao(collectionPath: string): Observable<T[]> {
    return this.firestore.collection<T>(collectionPath).valueChanges();
  }

  // READ: Buscar registro por ID (usado para perfis pessoais, baseado no UID)
  getRegistroById(collectionPath: string, id: string): Observable<any | undefined> {
    return this.firestore.collection<any>(collectionPath).doc(id).valueChanges();
  }

  // Adicionar o tipo genérico ao método getRegistroByUsername

  // Método para buscar registro por username
  getRegistroByUsername<T = any>(collection: string, username: string): Observable<T[]> {
    
    return this.firestore.collection<T>(collection, ref => 
      ref.where('username', '==', username)
    ).valueChanges({ idField: 'id' }).pipe(
      tap(results => {
        if (results.length > 0) {
        }
      }),
      catchError(error => {
        console.error('FirestoreService: Erro ao buscar por username:', error);
        return of([] as T[]);
      })
    );
  }


  // UPDATE: Atualizar um registro existente (usado para salvar os dados do perfil do usuário)
  updateRegistro(collectionPath: string, id: string, registro: Partial<T>): Promise<void> {
    if (!id) {
      console.error('Erro: ID do registro é indefinido. Não é possível atualizar.');
      return Promise.reject(new Error('ID do registro é indefinido.'));
    }


    return this.firestore.collection(collectionPath).doc(id).update(registro)
      .then(() => {
      })
      .catch((error) => {
        console.error('Erro ao atualizar o registro:', error);
        throw new Error('Erro ao atualizar o registro: ' + error.message);
      });
  }



  // DELETE: Deletar um registro pelo ID na subcoleção do usuário
  async deleteRegistro(collection: string, id: string): Promise<void> {
    if (!collection || !id) {
      throw new Error('Collection e ID são obrigatórios para exclusão');
    }

    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const docPath = `users/${userId}/${collection}`;

      // Verificar se o documento existe antes de tentar deletar
      const docRef = this.firestore.collection(docPath).doc(id);
      const docSnapshot = await docRef.get().toPromise();

      if (!docSnapshot?.exists) {
        console.warn('FirestoreService: Documento já foi deletado ou não existe');
        return; // Não é um erro se já foi deletado
      }

      // Deletar o documento
      await docRef.delete();

    } catch (error) {
      console.error('FirestoreService: Erro ao deletar registro:', error);
      throw error;
    }
  }

  // Método para criar um ID único (caso seja necessário)
  createId(): string {
    return this.firestore.createId();
  }

  // Método para gerar o próximo código sequencial com dígito verificador na subcoleção do usuário
  gerarProximoCodigo(collectionPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getRegistros(collectionPath).subscribe(registros => {
        let novoCodigo = '001'; // Começa com '001' se for o primeiro

        if (registros && registros.length > 0) {
          const codigos = registros.map((r: any) => r.codigo ? r.codigo.split('-')[0] : '001');
          const ultimoCodigo = Math.max(...codigos.map(c => parseInt(c, 10)));
          const proximoCodigo = (ultimoCodigo + 1).toString().padStart(3, '0');
          novoCodigo = proximoCodigo;
        }

        const digitoVerificador = this.util.calcularDigitoVerificador(novoCodigo);
        resolve(`${novoCodigo}-${digitoVerificador}`);
      }, error => {
        reject('Erro ao gerar o próximo código.');
      });
    });
  }



  // Método para deletar um arquivo do Firebase Storage
  deleteFile(fileUrl: string): Promise<void> {
    return this.storage.refFromURL(fileUrl).delete().toPromise();
  }

}
