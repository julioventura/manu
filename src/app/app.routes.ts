import { Routes } from '@angular/router';

// Componentes principais críticos (eager loading)
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

// Guards
import { CanDeactivateGuard } from './shared/guards/can-deactivate.guard';
import { UsernameGuard } from './shared/guards/username.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  
  // Lazy Loaded Modules - Bundle Optimization
  { path: 'menu', loadComponent: () => import('./menu/menu.component').then(m => m.MenuComponent) },
  { path: 'reset-password', loadComponent: () => import('./login/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'config', loadChildren: () => import('./config/config.routes').then(m => m.CONFIG_ROUTES) },
  { path: 'perfil', loadChildren: () => import('./perfil/perfil.routes').then(m => m.PERFIL_ROUTES) },
  { path: 'erupcoes', loadChildren: () => import('./erupcoes/erupcoes.routes').then(m => m.ERUPCOES_ROUTES) },
  { path: 'backup', loadChildren: () => import('./backup/backup.routes').then(m => m.BACKUP_ROUTES) },
  { path: 'fichas', loadChildren: () => import('./fichas/fichas.routes').then(m => m.FICHAS_ROUTES) },
  
  // Componentes principais que permanecem eager  
  // Lazy loaded components for better performance
  { path: 'homepage-intro', loadComponent: () => import('./homepage/homepage-intro/homepage-intro.component').then(m => m.HomepageIntroComponent), data: { animation: '3' } },
  { path: 'importar-cadastro', loadComponent: () => import('./shared/utils/importar-cadastro/importar-cadastro.component').then(m => m.ImportarCadastroComponent) },
  { path: 'camposRegistro', loadComponent: () => import('./camposRegistro/camposRegistro.component').then(m => m.CamposRegistroComponent) },
  { path: 'tutfop', loadComponent: () => import('./tutfop/tutfop.component').then(m => m.TutfopComponent) },
  
  { path: 'list/:collection', loadComponent: () => import('./list/list.component').then(m => m.ListComponent), data: { animation: '4' } },
  { path: 'view/:collection/:id', loadComponent: () => import('./view/view.component').then(m => m.ViewComponent), data: { animation: '5' } },
  { path: 'edit/:collection/:id', loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent), canDeactivate: [CanDeactivateGuard], data: { animation: '6' } },
  
  { path: 'list-fichas/:collection/:id/fichas/:subcollection', loadComponent: () => import('./list/list.component').then(m => m.ListComponent), data: { animation: '7' } },
  { path: 'view-ficha/:collection/:id/fichas/:subcollection/itens/:fichaId', loadComponent: () => import('./view/view.component').then(m => m.ViewComponent), data: { animation: '8' } },
  { path: 'edit-ficha/:collection/:id/fichas/:subcollection/itens/:fichaId', loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent), canDeactivate: [CanDeactivateGuard], data: { animation: '9' } },
  { path: 'add-ficha/:collection/:id/fichas/:subcollection', loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent), canDeactivate: [CanDeactivateGuard], data: { animation: '10' } },
  
  // IMPORTANTE: Esta rota username deve vir depois de todas as rotas específicas
  { path: ':username', loadChildren: () => import('./homepage/homepage.routes').then(m => m.HOMEPAGE_ROUTES), canActivate: [UsernameGuard] },
  
  { path: '**', component: HomeComponent, data: { animation: '11' } }
];
