// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router'; // CORRIGIDO: removido Event as RouterEvent
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService } from './shared/services/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { filter, take, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { Subscription } from 'rxjs';
import { FooterComponent } from './footer/footer.component';
import { NgIf } from '@angular/common';
import { ChatbotWidgetComponent } from './chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('0.4s ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ],
  imports: [RouterOutlet, FooterComponent, NgIf, ChatbotWidgetComponent]
})
export class AppComponent implements OnInit, OnDestroy {

  showFooter = true;
  isChatbotExpanded = false;
  isHomepageRoute = false;
  isHomepagePage = false;
  isAuthorizedUser = false; // Nova propriedade para controlar usuários autorizados
  isUserLoggedIn = false; // Nova propriedade para controlar se o usuário está logado
  private routerSubscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    this.router.events.subscribe({
      next: () => {
        // CORRIGIDO: removido parâmetro 'event' não utilizado
        // Your navigation handling code
      },
      error: (err: unknown) => {
        console.error('Router event error:', err);
      }
    });
  }

  ngOnInit(): void {
    try {
      // Monitorar mudanças de autenticação continuamente
      this.afAuth.authState.subscribe(user => {
        if (user) {
          // Usuário está logado
          this.isUserLoggedIn = true;
          // Verificar se o usuário é autorizado para ver o chatbot
          this.isAuthorizedUser = this.checkAuthorizedUser(user.email);
        } else {
          // Usuário não logado
          this.isUserLoggedIn = false;
          this.isAuthorizedUser = false;
        }
      });

      // Aguardar a autenticação antes de inicializar os serviços
      this.afAuth.authState.pipe(
        take(1),
        switchMap(user => {
          if (user) {
            // Inicializar serviços apenas após autenticação
            this.userService.chatbotExpanded$.subscribe(expanded => {
              this.isChatbotExpanded = expanded;
              // Alteração: removido log de depuração
            });

            return this.router.events.pipe(
              filter(event => event instanceof NavigationEnd)
            );
          } else {
            return EMPTY;
          }
        })
      ).subscribe((event: NavigationEnd) => {
        if (event) {
          const url = event.urlAfterRedirects;
          
          // Verificar se é uma rota de username (não é uma rota do sistema)
          const systemRoutes = ['/home', '/login', '/config', '/perfil', '/backup'];
          const isSystemRoute = systemRoutes.some(route => url.startsWith(route));
          
          // Se temos uma rota não-sistema e não é a raiz
          this.isHomepageRoute = !isSystemRoute && url !== '/' && url.split('/').length === 2;
          
          // Alteração: removido log de depuração
          
          // Adicionar/remover classe ao body dependendo da rota
          if (this.isHomepageRoute) {
            document.body.classList.add('homepage-active');
          } else {
            document.body.classList.remove('homepage-active');
          }
        }
      });

      // Monitorar mudanças de rota independentemente da autenticação
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        
        // Verificar se é uma rota de username (não é uma rota do sistema)
        const systemRoutes = ['/home', '/login', '/config', '/perfil', '/backup'];
        const isSystemRoute = systemRoutes.some(route => url.startsWith(route));
        
        // Se temos uma rota não-sistema e não é a raiz
        this.isHomepageRoute = !isSystemRoute && url !== '/' && url.split('/').length === 2;
        
        // Alteração: removido log de depuração
        
        // Adicionar/remover classe ao body dependendo da rota
        if (this.isHomepageRoute) {
          document.body.classList.add('homepage-active');
        } else {
          document.body.classList.remove('homepage-active');
        }
      });

      // Escutar mudanças de rota
      this.routerSubscription = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // CORRIGIR: no app.component.ts, linha 122-123, substituir por:
          this.isHomepagePage = this.isUsernameRoute(event.url) || 
                               this.isUsernameRoute(event.urlAfterRedirects || '');
        });

      // Alteração: removido log de depuração
    } catch (error) {
      console.error('Error initializing AppComponent:', error);
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  // ADICIONAR: método auxiliar no app.component.ts
  private isUsernameRoute(url: string): boolean {
    // Rotas do tipo /clinica/<apelido>
    if (url.includes('/clinica/')) {
      return true;
    }
    
    // Rotas diretas /<apelido> (páginas personalizadas)
    const systemRoutes = [
      '/home', '/login', '/config', '/perfil', '/backup', 
      '/list', '/tutfop', '/homepage-intro', '/grupos'
    ];
    
    const pathSegments = url.split('/').filter(segment => segment);
    
    // URL com apenas um segmento que não é rota do sistema
    if (pathSegments.length === 1) {
      const route = '/' + pathSegments[0];
      return !systemRoutes.some(sysRoute => route.startsWith(sysRoute));
    }
    
    return false;
  }

  // Método para verificar se o usuário é autorizado a ver o chatbot
  private checkAuthorizedUser(email: string | null): boolean {
    const authorizedEmails = ['julio@dentistas.com.br', 'admin@dentistas.com.br'];
    return email ? authorizedEmails.includes(email) : false;
  }
}
