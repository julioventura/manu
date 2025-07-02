import { Component } from '@angular/core';
import { ThemeService, Theme } from '../theme.service';
import { UserService } from '../shared/services/user.service';
import { BehaviorSubject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class HeaderComponent {
  showThemeMenu = false;
  themes: { name: Theme, label: string }[];
  currentTheme$: BehaviorSubject<Theme>;

  constructor(
    private themeService: ThemeService,
    public userService: UserService
  ) {
    this.themes = this.themeService.getThemes();
    this.currentTheme$ = this.themeService.activeTheme$;
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
        console.log('Logout successful from header');
      },
      error: (err) => console.error('Logout error from header', err)
    });
  }
}