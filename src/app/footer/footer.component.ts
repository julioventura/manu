import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../shared/services/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class FooterComponent {
  userName$: Observable<string>;

  constructor(private userService: UserService) {
    // Inicializar o Observable do nome do usuário
    this.userName$ = this.userService.getCurrentUserProfile().pipe(
      map(user => {
        if (user) {
          const isAdmin = this.userService.isAdmin(user.email || null);
          const rawName = user.nome || user.displayName || user.username || user.email?.split('@')[0] || 'Usuário';
          return isAdmin ? `ADMIN ${rawName}` : rawName;
        }
        return 'Usuário';
      })
    );
  }
}
