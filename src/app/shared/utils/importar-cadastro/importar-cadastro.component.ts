// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { UtilService } from '../util.service';
import { FirestoreService } from '../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-importar-cadastro',
  templateUrl: './importar-cadastro.component.html',
  styleUrls: ['./importar-cadastro.component.scss'],
  imports: [FormsModule, NgIf]
})
export class ImportarCadastroComponent {
  userId: string | null = null;
  csvData: Record<string, unknown>[] = [];
  importStatus: string = '';
  selectedCollection: string = 'pacientes'; // Coleção padrão selecionada

  constructor(
    private firestoreService: FirestoreService<Record<string, unknown> & { id?: string }>,
    private afAuth: AngularFireAuth,
    public util: UtilService,
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }

  async onFileSelect(event: Event) {
    const Papa = (await import('papaparse')).default;
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result: { data: Record<string, unknown>[] }) => {
          this.importData(result.data);
        },
        error: (error: unknown) => {
          console.error('Erro ao processar o arquivo:', error);
        }
      });
    }
  }
  

  // Novo método importData para processar e armazenar dados CSV no Firestore
  async importData(data: Record<string, unknown>[]) {
    if (!this.userId || data.length === 0) {
      this.importStatus = 'Por favor, selecione um arquivo CSV válido.';
      return;
    }
  
    this.importStatus = 'Importando dados...';
    const collectionPath = `users/${this.userId}/${this.selectedCollection}`;
  
    try {
      await this.firestoreService.batchAddRegistros(collectionPath, data);
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
    const collectionPath = `users/${this.userId}/${this.selectedCollection}`;

    try {
      await this.firestoreService.batchAddRegistros(collectionPath, this.csvData);
      this.importStatus = `Importação concluída com sucesso para o cadastro: ${this.selectedCollection}!`;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      this.importStatus = 'Erro ao importar os dados.';
    }
  }

}
