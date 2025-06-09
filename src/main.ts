import { enableProdMode } from '@angular/core'; // Alteração: linha descomentada para habilitar o modo de produção
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'; // Alteração: linha descomentada
import { AppModule } from './app/app.module'; // Alteração: linha descomentada
import { environment } from './environments/environment'; // Alteração: linha descomentada

// Se o ambiente estiver em produção, ativa o modo de produção do Angular
// para desabilitar verificações extras e melhorar a performance.
if (environment.production) {
  enableProdMode(); // Alteração: linha descomentada para chamar enableProdMode quando em produção
}

// Inicializa o módulo principal da aplicação
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
