import { Routes } from '@angular/router';

// Componentes principais que permanecem eager loading (críticos)
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { HomepageIntroComponent } from './homepage/homepage-intro/homepage-intro.component';
import { ImportarCadastroComponent } from './shared/utils/importar-cadastro/importar-cadastro.component';
import { CamposRegistroComponent } from './camposRegistro/camposRegistro.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { EditComponent } from './edit/edit.component';
import { GroupManagerComponent } from './shared/components/group/group-manager.component';
import { TutfopComponent } from './tutfop/tutfop.component';

// Guards
import { CanDeactivateGuard } from './shared/guards/can-deactivate.guard';
import { UsernameGuard } from './shared/guards/username.guard';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
  // Lazy Loaded Modules - Otimização de Bundle
  { path: 'config', loadChildren: () => import('./config/config.routes').then(m => m.CONFIG_ROUTES) },
  { path: 'perfil', loadChildren: () => import('./perfil/perfil.routes').then(m => m.PERFIL_ROUTES) },
  { path: 'erupcoes', loadChildren: () => import('./erupcoes/erupcoes.routes').then(m => m.ERUPCOES_ROUTES) },
  { path: 'backup', loadChildren: () => import('./backup/backup.routes').then(m => m.BACKUP_ROUTES) },
  { path: 'fichas', loadChildren: () => import('./fichas/fichas.routes').then(m => m.FICHAS_ROUTES) },
  
  // Componentes principais que permanecem eager
  { path: 'homepage-intro', component: HomepageIntroComponent, data: { animation: '3' } },
  { path: 'importar-cadastro', component: ImportarCadastroComponent },
  { path: 'camposRegistro', component: CamposRegistroComponent },
  { path: 'groups', component: GroupManagerComponent, canActivate: [AuthGuard] },
  { path: 'tutfop', component: TutfopComponent },

  { path: 'list/:collection', component: ListComponent, data: { animation: '4' } },
  { path: 'view/:collection/:id', component: ViewComponent, data: { animation: '5' } },
  { path: 'edit/:collection/:id', component: EditComponent, canDeactivate: [CanDeactivateGuard], data: { animation: '6' } },
  
  { path: 'list-fichas/:collection/:id/fichas/:subcollection', component: ListComponent, data: { animation: '7' } },
  { path: 'view-ficha/:collection/:id/fichas/:subcollection/itens/:fichaId', component: ViewComponent, data: { animation: '8' } },
  { path: 'edit-ficha/:collection/:id/fichas/:subcollection/itens/:fichaId', component: EditComponent, canDeactivate: [CanDeactivateGuard], data: { animation: '9' } },
  { path: 'add-ficha/:collection/:id/fichas/:subcollection', component: EditComponent, canDeactivate: [CanDeactivateGuard], data: { animation: '10' } },
  
  // IMPORTANTE: Esta rota username deve vir depois de todas as rotas específicas
  { path: ':username', loadChildren: () => import('./homepage/homepage.routes').then(m => m.HOMEPAGE_ROUTES), canActivate: [UsernameGuard] },
  
  { path: '**', component: HomeComponent, data: { animation: '11' } }
];
