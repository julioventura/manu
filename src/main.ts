import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withNavigationErrorHandler, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DatePipe } from '@angular/common';

// Configurações de console para desenvolvimento
import './console-config';

import { environment } from './environments/environment';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { FirestoreService } from './app/shared/services/firestore.service';
import { LoggingService } from './app/shared/services/logging.service';

import { importProvidersFrom } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// Configurações para reduzir logs desnecessários do zone.js
if (!environment.production) {
  // Em desenvolvimento, reduzir logs verbosos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__Zone_disable_timers = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__Zone_disable_requestAnimationFrame = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__Zone_disable_on_property = true;
}

// Inicializa o módulo principal da aplicação
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule,
      AngularFirestoreModule
    ),
    provideRouter(routes, 
      withComponentInputBinding(), 
      withNavigationErrorHandler(error => {
        if (!environment.production) {
          console.error('Navigation error:', error);
        }
      }),
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(withInterceptorsFromDi()),
    FirestoreService,
    LoggingService,
    DatePipe,
    provideAnimations()
  ]
})
  .catch(err => {
    if (!environment.production) {
      console.error('Bootstrap error:', err);
    }
  });
