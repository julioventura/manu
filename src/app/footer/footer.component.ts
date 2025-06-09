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
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
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
