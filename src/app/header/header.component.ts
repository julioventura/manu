import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../shared/services/user.service';
import { ConfigService } from '../shared/services/config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule
  ]
})
export class HeaderComponent {
  userName$: Observable<string>;

  constructor(
    public userService: UserService,
    public config: ConfigService
  ) {
    // Inicializar o Observable do nome do usuário
    this.userName$ = this.userService.getCurrentUserProfile().pipe(
      map(user => {
        if (user) {
          return user.nome || user.displayName || user.username || user.email?.split('@')[0] || 'Usuário';
        }
        return 'Usuário';
      })
    );
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        console.log('Logout successful from header');
      },
      error: (err) => console.error('Logout error from header', err)
    });
  }
}