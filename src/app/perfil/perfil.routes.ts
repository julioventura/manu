import { Routes } from '@angular/router';
import { CanDeactivateGuard } from '../shared/guards/can-deactivate.guard';

export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./perfil.component').then(m => m.PerfilComponent),
    canDeactivate: [CanDeactivateGuard],
    data: { animation: '2' }
  }
];
