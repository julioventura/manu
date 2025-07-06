import { Routes } from '@angular/router';

export const BACKUP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./backup.component').then(m => m.BackupComponent)
  }
];
