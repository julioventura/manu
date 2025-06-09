import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Reminder } from '../models/crm.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  constructor(
    private firestore: AngularFirestore
  ) { }
  
  // Adicionar um novo lembrete
  addReminder(collectionPath: string, docId: string, reminder: Reminder): Promise<any> {
    const reminderWithDates = {
      ...reminder,
      createdAt: new Date()
    };
    
    return this.firestore
      .collection(`${collectionPath}/${docId}/reminders`)
      .add(reminderWithDates);
  }
  
  // Obter todos os lembretes de um registro
  getReminders(collectionPath: string, docId: string): Observable<Reminder[]> {
    return this.firestore
      .collection<Reminder>(`${collectionPath}/${docId}/reminders`, ref => 
        ref.orderBy('data', 'asc')
      )
      .valueChanges({ idField: 'id' });
  }
  
  // Obter um lembrete específico
  getReminder(collectionPath: string, docId: string, reminderId: string): Observable<Reminder> {
    return this.firestore
      .doc<Reminder>(`${collectionPath}/${docId}/reminders/${reminderId}`)
      .valueChanges()
      .pipe(
        map(reminder => {
          if (!reminder) {
            throw new Error(`Reminder with ID ${reminderId} not found`);
          }
          return reminder;
        })
      );
  }
  
  // Atualizar um lembrete
  updateReminder(collectionPath: string, docId: string, reminderId: string, changes: Partial<Reminder>): Promise<void> {
    const updatedData = {
      ...changes,
      updatedAt: new Date()
    };
    
    return this.firestore
      .doc(`${collectionPath}/${docId}/reminders/${reminderId}`)
      .update(updatedData);
  }
  
  // Marcar lembrete como concluído
  markReminderAsCompleted(collectionPath: string, docId: string, reminderId: string): Promise<void> {
    return this.updateReminder(collectionPath, docId, reminderId, { 
      concluido: true,
      updatedAt: new Date()
    });
  }
  
  // Excluir um lembrete
  deleteReminder(collectionPath: string, docId: string, reminderId: string): Promise<void> {
    return this.firestore
      .doc(`${collectionPath}/${docId}/reminders/${reminderId}`)
      .delete();
  }
  
  // Obter lembretes pendentes para todos os registros (para dashboard)
  getPendingReminders(limit: number = 10): Observable<any[]> {
    const today = new Date();
    
    return this.firestore
      .collectionGroup('reminders', ref => 
        ref.where('concluido', '==', false)
           .where('data', '>=', today)
           .orderBy('data', 'asc')
           .limit(limit)
      )
      .valueChanges({ idField: 'id' });
  }
  
  // Obter lembretes atrasados (que já passaram da data)
  getOverdueReminders(): Observable<any[]> {
    const today = new Date();
    
    return this.firestore
      .collectionGroup('reminders', ref => 
        ref.where('concluido', '==', false)
           .where('data', '<', today)
           .orderBy('data', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }
  
  // Marcar notificação como enviada
  markNotificationSent(collectionPath: string, docId: string, reminderId: string): Promise<void> {
    return this.updateReminder(collectionPath, docId, reminderId, { 
      notificacaoEnviada: true
    });
  }
}