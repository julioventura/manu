import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary" class="footer-toolbar">
      <span class="footer-content">
        <span class="footer-text">
          © 2024 Clínica Dentária - Todos os direitos reservados
        </span>
        <span class="footer-actions">
          <button mat-button (click)="goHome()">
            <mat-icon>home</mat-icon>
            Início
          </button>
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            Sair
          </button>
        </span>
      </span>
    </mat-toolbar>
  `,
  styles: [`
    .footer-toolbar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      min-height: 48px;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .footer-text {
      font-size: 14px;
    }
    
    .footer-actions {
      display: flex;
      gap: 8px;
    }
    
    .footer-actions button {
      font-size: 12px;
    }
    
    .footer-actions mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 8px;
        padding: 8px 0;
      }
      
      .footer-text {
        font-size: 12px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    // CORRIGIDO: Usar subscribe() em vez de then()
    const logoutSubscription = this.userService.logout().subscribe({
      next: () => {
        console.log('Logout realizado com sucesso');
        this.router.navigate(['/login']);
      },
      error: (error: unknown) => {
        console.error('Erro durante logout:', error);
        // Mesmo com erro, redirecionar para login
        this.router.navigate(['/login']);
      }
    });
    
    this.subscriptions.push(logoutSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
