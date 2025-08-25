import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  is_admin: boolean = false;
  ambiente: string = '';

  constructor(
    private firestoreService: FirestoreService<Record<string, unknown> & { id?: string }>
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
    return this.firestoreService.getRegistroById(collectionPath, documentId).pipe(
      map(data => data || null),
      catchError(error => {
        console.error('Error getting document:', error);
        throw error; // Re-throw para o componente tratar
      })
    );
  }
}
