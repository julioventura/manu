import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BackupService } from '../shared/services/backup.service';
import { UtilService } from '../shared/utils/util.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent {
  backupService = inject(BackupService);
  util = inject(UtilService);

  backupInProgress = false;
  progress = 0;
  backupStatusMessage = '';
  backupStatus = false;

  constructor() { }

  voltar(): void {
    this.util.voltar();
  }

  backupDados(): void {
    this.runBackup();
  }

  backupConfiguracoes(): void {
    this.util.openSnackBar('Função não implementada.', 'Fechar');
  }

  restaurarBackup(): void {
    this.util.openSnackBar('Função não implementada.', 'Fechar');
  }

  backupCompleto(): void {
    this.runBackup();
  }

  runBackup(): void {
    this.backupInProgress = true;
    this.backupStatus = true;
    this.progress = 0;
    this.backupStatusMessage = 'Iniciando backup...';

    this.backupService.backupAllData().subscribe({
      next: (progress) => {
        this.progress = progress;
        this.backupStatusMessage = `Progresso do backup: ${progress}%`;
      },
      error: (err) => {
        this.backupInProgress = false;
        this.util.openSnackBar('Erro ao realizar o backup: ' + err.message, 'Fechar');
      },
      complete: () => {
        this.backupInProgress = false;
        this.progress = 100;
        this.backupStatusMessage = 'Backup concluído com sucesso!';
        this.util.openSnackBar('Backup concluído com sucesso!', 'Fechar');
      }
    });
  }
}