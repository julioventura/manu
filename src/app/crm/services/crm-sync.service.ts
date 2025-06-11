import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CrmService } from './crm.service';

@Injectable({
  providedIn: 'root'
})
export class CrmSyncService {
  constructor(
    private firestore: AngularFirestore,
    private crmService: CrmService
  ) { }
  
  // Inicializar dados de CRM para registros sem dados CRM
  initializeMissingCrmData(collectionPath: string): Observable<number> {
    return this.firestore.collection(collectionPath)
      .valueChanges({ idField: 'id' })
      .pipe(
        map(registros => registros.filter((registro: any) => !registro.crmData)),
        switchMap(registrosSemCRM => {
          const promises = registrosSemCRM.map((registro: any) => {
            return this.crmService.initializeCrmData(collectionPath, registro.id);
          });
          
          if (promises.length === 0) {
            return from(Promise.resolve(0));
          }
          
          return from(Promise.all(promises).then(() => registrosSemCRM.length));
        })
      );
  }
  
  // Contar registros com e sem dados de CRM
  countCrmStatus(collectionPath: string): Observable<{ withCrm: number, withoutCrm: number }> {
    return this.firestore.collection(collectionPath)
      .valueChanges()
      .pipe(
        map(registros => {
          const withCrm = registros.filter((registro: any) => registro.crmData).length;
          const withoutCrm = registros.length - withCrm;
          
          return { withCrm, withoutCrm };
        })
      );
  }
  
  // Verificar integridade dos dados de CRM (campos ausentes, etc)
  checkCrmDataIntegrity(collectionPath: string): Observable<any[]> {
    return this.firestore.collection(collectionPath, ref => 
      ref.where('crmData', '!=', null)
    ).valueChanges({ idField: 'id' })
      .pipe(
        map(registros => {
          return registros.filter((registro: any) => {
            const crmData = registro.crmData;
            // Verificar campos obrigatórios
            return !crmData.leadStatus; // Adicionar mais verificações conforme necessário
          });
        })
      );
  }
}