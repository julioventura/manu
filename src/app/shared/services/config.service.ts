import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  is_admin: boolean = false;
  ambiente: string = '';

  constructor(
    private firestore: AngularFirestore
  ) {
    // Implementar lógica de configuração se necessário
  }

  setAdminStatus(isAdmin: boolean): void {
    this.is_admin = isAdmin;
  }

  getAdminStatus(): boolean {
    return this.is_admin;
  }

  // ADICIONAR: método para buscar documento específico
  getDocumento(collectionPath: string, documentId: string): Observable<unknown> {
    return this.firestore.doc(`${collectionPath}/${documentId}`).valueChanges().pipe(
      map(data => data || null),
      catchError(error => {
        console.error('Error getting document:', error);
        throw error; // Re-throw para o componente tratar
      })
    );
  }
}
