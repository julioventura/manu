import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withNavigationErrorHandler } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { environment } from './environments/environment';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { FirestoreService } from './app/shared/services/firestore.service';
import { LoggingService } from './app/shared/services/logging.service';

// Se o ambiente estiver em produção, ativa o modo de produção do Angular
// para desabilitar verificações extras e melhorar a performance.
if (environment.production) {
  enableProdMode();
}

// Inicializa o módulo principal da aplicação
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule,
      AngularFireAuthModule,
      AngularFireStorageModule
    ),
    provideRouter(routes, 
      withComponentInputBinding(), 
      withNavigationErrorHandler(error => console.error(error))
    ),
    provideHttpClient(withInterceptorsFromDi()),
    FirestoreService,
    LoggingService,
    DatePipe,
    provideAnimations()
  ]
})
.catch(err => console.error(err));
