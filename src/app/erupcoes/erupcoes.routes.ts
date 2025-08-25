import { Routes } from '@angular/router';

export const ERUPCOES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./erupcoes.component').then(m => m.ErupcoesComponent)
  }
];
