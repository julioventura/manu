import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { UtilService } from '../shared/utils/util.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
// CORRIGIDO: Import correto do DocumentData
import { DocumentData } from '@angular/fire/compat/firestore';

// ADICIONADO: Interface para dados de backup
interface BackupDocumentData {
  id: string;
  data: DocumentData;
}

interface BackupData {
  [collectionName: string]: BackupDocumentData[];
}

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss'],
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule],
})
export class BackupComponent implements OnInit {

  message: string = '';
  loading: boolean = false;
  util: UtilService;

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth, util: UtilService) {
    this.util = util;
  }

  ngOnInit(): void {
    // Initialization logic here
  }

  async gerarBackup(tipo: string) {
    // Adiciona confirmação antes de iniciar o backup
    if (!window.confirm('Confirma iniciar o backup?')) {
      return;
    }
    this.loading = true;
    try {
      const currentUser = await this.afAuth.currentUser;
      if (!currentUser) {
        this.message = 'Usuário não autenticado';
        this.loading = false;
        return;
      }
      const userId = currentUser.uid;

      // CORRIGIDO: Usar interface tipada em vez de any
      const backupData: BackupData = {};

      // Atualize essa lista com as coleções existentes em /users/{userId}
      const collections = [
        "pacientes",
        "alunos",
        "associados",
        "professores",
        "dentistas",
        "equipe",
        "proteticos",
        "configuracoesCampos",
        "configuracoesFichas",
        "settings",
      ];

      for (const collName of collections) {
        const ref = this.firestore.firestore.collection(`/users/${userId}/${collName}`);
        const snapshot = await ref.get();
        // Salva somente se houver documentos
        if (!snapshot.empty) {
          backupData[collName] = snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }));
        }
      }

      if (tipo == 'json') {
        const json = JSON.stringify(backupData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup_dentistas_com_br.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const wb = XLSX.utils.book_new();
        for (const collName in backupData) {
          // CORRIGIDO: Usar interface tipada
          const ws = XLSX.utils.json_to_sheet(backupData[collName].map((doc: BackupDocumentData) => doc.data));
          XLSX.utils.book_append_sheet(wb, ws, collName);
        }
        XLSX.writeFile(wb, 'backup_dentistas_com_br.xlsx');
      }
    } catch (error) {
      this.message = 'Erro ao gerar backup';
      console.error(error);
    }
    this.loading = false;
  }
}