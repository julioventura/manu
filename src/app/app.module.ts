import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from '../environments/environment';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DatePipe } from '@angular/common';

// Importações do Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components (apenas componentes NÃO standalone)
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { PerfilComponent } from './perfil/perfil.component';
import { MenuConfigComponent } from './menu/menu-config/menu-config.component';
import { HomeConfigComponent } from './home/home-config/home-config.component';
import { ImportarCadastroComponent } from './shared/utils/importar-cadastro/importar-cadastro.component';
import { ErupcoesComponent } from './erupcoes/erupcoes.component';
import { CamposRegistroComponent } from './camposRegistro/camposRegistro.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { FichasComponent } from './fichas/fichas.component';
import { ViewComponent } from './view/view.component'; // ADICIONAR

// Componentes standalone que queremos usar globalmente
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component'; // ADICIONADO

// Module imports
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './shared/material.module';

// Services
import { FirestoreService } from './shared/services/firestore.service';
import { LoggingService } from './shared/services/logging.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MenuComponent,
    PerfilComponent,
    MenuConfigComponent,
    HomeConfigComponent,
    ImportarCadastroComponent,
    ErupcoesComponent,
    CamposRegistroComponent,
    ListComponent,
    EditComponent,
    FichasComponent,
    ViewComponent // ADICIONAR
    // REMOVIDOS: HomepageComponent, TutfopComponent, FooterComponent (são standalone)
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    MaterialModule,

    // Módulos do Angular Material adicionados:
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

    // Componente standalone para uso global
    FooterComponent,
    HeaderComponent // ADICIONADO
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    FirestoreService,
    LoggingService,
    DatePipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }