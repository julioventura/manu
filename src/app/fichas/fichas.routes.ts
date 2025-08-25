import { Routes } from '@angular/router';

export const FICHAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./fichas.component').then(m => m.FichasComponent)
  }
];
