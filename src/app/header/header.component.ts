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
          const rawName = user.nome || user.displayName || user.username || user.email?.split('@')[0] || 'Usuário';
          return this.limitName(rawName, 12);
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

  /**
   * limitName
   * Limita a exibição a até `maxLen` caracteres SOMENTE adicionando palavras inteiras.
   * - Não trunca no meio de uma palavra (exceto se a primeira palavra sozinha ultrapassar o limite; nesse caso ela é cortada).
   */
  private limitName(name: string, maxLen: number): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    let result = '';
    for (const w of words) {
      if (!result) {
        if (w.length > maxLen) {
          // Primeira palavra maior que o limite: corta (único caso de truncamento controlado)
          return w.slice(0, maxLen);
        }
        result = w;
      } else {
        if ((result + ' ' + w).length <= maxLen) {
          result += ' ' + w;
        } else {
          break;
        }
      }
    }
    return result;
  }
}