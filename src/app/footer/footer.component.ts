import { Component } from '@angular/core';
import { ThemeService, Theme } from '../theme.service';
import { UserService } from '../shared/services/user.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common'; // NgIf, NgFor, AsyncPipe are provided by CommonModule

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule, // This provides *ngIf, *ngFor, async pipe, etc. to the template
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class FooterComponent {
  showThemeMenu = false;
  themes: { name: Theme, label: string }[];
  currentTheme$: BehaviorSubject<Theme>;
  userName$: Observable<string>;

  constructor(
    private themeService: ThemeService,
    public userService: UserService
  ) {
    this.themes = this.themeService.getThemes();
    this.currentTheme$ = this.themeService.activeTheme$;
    
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

  toggleThemeMenu(): void {
    this.showThemeMenu = !this.showThemeMenu;
  }

  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.showThemeMenu = false;
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
