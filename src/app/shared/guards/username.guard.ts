// Alteração: remoção de logs de depuração (console.log)
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, catchError, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UsernameGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const username = route.paramMap.get('username');
    
    
    // Don't treat empty paths as usernames
    if (!username || username === '') {
      this.router.navigate(['/home']);
      return of(false);
    }
    
    // Don't treat system routes as usernames
    const systemRoutes = ['home', 'login', 'config', 'perfil', 'homepage', 'backup', 'list', 'edit', 'view'];
    if (systemRoutes.includes(username.toLowerCase())) {
      this.router.navigate([`/${username}`]);
      return of(true);
    }
    
    
    // Usar o método do UserService em vez de usar o FirestoreService diretamente
    return this.userService.loadUserProfileByUsername(username).pipe(
      take(1),
      map(userProfiles => {
        if (userProfiles && userProfiles.length > 0) {
          return true;  // Username válido, permitir navegação
        } else {
          console.warn(`UsernameGuard: Username "${username}" não encontrado, redirecionando para home`);
          this.router.navigate(['/home']);  
          return false;
        }
      }),
      catchError(error => {
        console.error('UsernameGuard: Erro ao validar username:', error);
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}
