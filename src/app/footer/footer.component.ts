import { Component } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class FooterComponent {
  userName$: Observable<string>;

  constructor(
    public userService: UserService
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
        console.log('Logout successful from footer');
      },
      error: (err) => console.error('Logout error from footer', err)
    });
  }
}
