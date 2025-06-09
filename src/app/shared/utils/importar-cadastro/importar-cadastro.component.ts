// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as Papa from 'papaparse';

import { UtilService } from '../util.service';

@Component({
  selector: 'app-importar-cadastro',
  templateUrl: './importar-cadastro.component.html',
  styleUrls: ['./importar-cadastro.component.scss'],
  standalone: false
})
export class ImportarCadastroComponent {
  userId: string | null = null;
  csvData: any[] = [];
  importStatus: string = '';
  selectedCollection: string = 'pacientes'; // Coleção padrão selecionada

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    public util: UtilService,
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }

  async onFileSelect(event: any) {
    const Papa = (await import('papaparse')).default;
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result: { data: any[] }) => {
          this.importData(result.data);
        },
        error: (error: any) => {
          console.error('Erro ao processar o arquivo:', error);
        }
      });
    }
  }
  

    // Novo método importData para processar e armazenar dados CSV no Firestore
    async importData(data: any[]) {
      if (!this.userId || data.length === 0) {
        this.importStatus = 'Por favor, selecione um arquivo CSV válido.';
        return;
      }
  
      this.importStatus = 'Importando dados...';
  
      const batch = this.firestore.firestore.batch();
      const collectionPath = `/users/${this.userId}/${this.selectedCollection}`;
      const collectionRef = this.firestore.collection(collectionPath).ref;
  
      data.forEach(record => {
        const docRef = collectionRef.doc(); // Cria um novo documento com ID automático
        const recordWithId = { ...record, id: docRef.id }; // Adiciona o campo `id` ao registro
        batch.set(docRef, recordWithId); // Adiciona o registro ao batch
      });
  
      try {
        await batch.commit();
        this.importStatus = 'Importação concluída com sucesso!';
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        this.importStatus = 'Erro ao importar os dados.';
      }
    }



  async importarDados() {
    if (!this.userId || this.csvData.length === 0) {
      this.importStatus = 'Por favor, selecione um arquivo CSV válido.';
      return;
    }

    this.importStatus = 'Importando dados...';

    const batch = this.firestore.firestore.batch();
    const collectionPath = `/users/${this.userId}/${this.selectedCollection}`;
    const selectedCollectionRef = this.firestore.collection(collectionPath).ref;

    for (const registro of this.csvData) {
      const docRef = selectedCollectionRef.doc(); // Gera um novo documento com um ID automático
      const registroComId = { ...registro, id: docRef.id }; // Adiciona o campo `id` ao registro
      batch.set(docRef, registroComId); // Adiciona o registro ao batch com o ID incluído
    }

    batch.commit().then(() => {
      this.importStatus = `Importação concluída com sucesso para o cadastro: ${this.selectedCollection}!`;
    }).catch((error) => {
      console.error('Erro ao importar dados:', error);
      this.importStatus = 'Erro ao importar os dados.';
    });
  }

}
