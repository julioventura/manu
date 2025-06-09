import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Interaction } from '../models/crm.model';
import { CrmService } from './crm.service';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  constructor(
    private firestore: AngularFirestore,
    private crmService: CrmService
  ) { }
  
  // Adicionar uma nova interação
  addInteraction(collectionPath: string, docId: string, interaction: Interaction): Promise<any> {
    const interactionWithDates = {
      ...interaction,
      createdAt: new Date()
    };
    
    return this.firestore
      .collection(`${collectionPath}/${docId}/interactions`)
      .add(interactionWithDates)
      .then(ref => {
        // Após adicionar a interação, atualizar o último contato no CRM data
        return this.crmService.getCrmData(collectionPath, docId)
          .pipe(
            map(crmData => {
              if (crmData) {
                return {
                  ...crmData,
                  dataUltimoContato: new Date()
                };
              }
              return null;
            })
          )
          .toPromise()
          .then(updatedCrmData => {
            if (updatedCrmData) {
              return this.crmService.updateCrmData(collectionPath, docId, updatedCrmData);
            }
          });
      });
  }
  
  // Obter todas as interações de um registro
  getInteractions(collectionPath: string, docId: string): Observable<Interaction[]> {
    return this.firestore
      .collection<Interaction>(`${collectionPath}/${docId}/interactions`, ref => 
        ref.orderBy('data', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }
  
  // Obter uma interação específica
  getInteraction(collectionPath: string, docId: string, interactionId: string): Observable<Interaction> {
    return this.firestore
      .doc<Interaction>(`${collectionPath}/${docId}/interactions/${interactionId}`)
      .valueChanges()
      .pipe(
        map(interaction => {
          if (!interaction) {
            throw new Error(`Interaction with ID ${interactionId} not found`);
          }
          return interaction;
        })
      );
  }
  
  // Atualizar uma interação
  updateInteraction(collectionPath: string, docId: string, interactionId: string, changes: Partial<Interaction>): Promise<void> {
    const updatedData = {
      ...changes,
      updatedAt: new Date()
    };
    
    return this.firestore
      .doc(`${collectionPath}/${docId}/interactions/${interactionId}`)
      .update(updatedData);
  }
  
  // Excluir uma interação
  deleteInteraction(collectionPath: string, docId: string, interactionId: string): Promise<void> {
    return this.firestore
      .doc(`${collectionPath}/${docId}/interactions/${interactionId}`)
      .delete();
  }
  
  // Obter interações recentes (para dashboard)
  getRecentInteractions(collectionPath: string, limit: number = 10): Observable<any[]> {
    return this.firestore
      .collectionGroup('interactions', ref => 
        ref.orderBy('data', 'desc')
         .limit(limit)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map(interactions => {
          // Mapear interações para incluir informações do registro pai
          return interactions;
        })
      );
  }
}