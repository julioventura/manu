import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.userService.getUser().pipe(
      take(1),
      map(user => {
        if (user) {
          return true; // Usuário autenticado
        } else {
          this.router.navigate(['/login']); // Redireciona para o login se não autenticado
          return false;
        }
      })
    );
  }
}
