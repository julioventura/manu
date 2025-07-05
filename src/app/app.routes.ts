import { Routes } from '@angular/router';

// Componentes da aplicação
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ConfigComponent } from './config/config.component';
import { PerfilComponent } from './perfil/perfil.component';
import { HomepageIntroComponent } from './homepage/homepage-intro/homepage-intro.component';
import { ImportarCadastroComponent } from './shared/utils/importar-cadastro/importar-cadastro.component';
import { ErupcoesComponent } from './erupcoes/erupcoes.component';
import { CamposRegistroComponent } from './camposRegistro/camposRegistro.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { EditComponent } from './edit/edit.component';
import { FichasComponent } from './fichas/fichas.component';
import { BackupComponent } from './backup/backup.component';
import { HomepageComponent } from './homepage/homepage.component';
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
  { path: 'config', component: ConfigComponent },
  { path: 'perfil', component: PerfilComponent, canDeactivate: [CanDeactivateGuard], data: { animation: '2' } },
  { path: 'homepage-intro', component: HomepageIntroComponent, data: { animation: '3' } },
  { path: 'importar-cadastro', component: ImportarCadastroComponent },
  { path: 'erupcoes', component: ErupcoesComponent },
  { path: 'backup', component: BackupComponent },
  { path: 'camposRegistro', component: CamposRegistroComponent },
  { path: 'fichas', component: FichasComponent },
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
  { path: ':username', component: HomepageComponent, canActivate: [UsernameGuard] },
  // e ANTES de qualquer wildcard ou lazy loading

  { path: '**', component: HomeComponent, data: { animation: '11' } }
];
