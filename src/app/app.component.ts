// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService } from './shared/services/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { filter, take, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('0.4s ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {

  showFooter = true;
  isChatbotExpanded = false;
  isHomepageRoute = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private afAuth: AngularFireAuth // Adicionar AngularFireAuth
  ) {
    this.router.events.subscribe({
      next: (event: RouterEvent) => {
        // Alteração: tipagem explícita do parâmetro event
        // Your navigation handling code
      },
      error: (err) => {
        console.error('Router event error:', err);
      }
    });
  }

  ngOnInit(): void {
    try {
      // Aguardar a autenticação antes de inicializar os serviços
      this.afAuth.authState.pipe(
        take(1),
        switchMap(user => {
          if (user) {
            // Alteração: removido log de depuração
            
            // Inicializar serviços apenas após autenticação
            this.userService.chatbotExpanded$.subscribe(expanded => {
              this.isChatbotExpanded = expanded;
              // Alteração: removido log de depuração
            });

            return this.router.events.pipe(
              filter(event => event instanceof NavigationEnd)
            );
          } else {
            // Alteração: removido log de depuração
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

      // Alteração: removido log de depuração
    } catch (error) {
      console.error('Error initializing AppComponent:', error);
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
