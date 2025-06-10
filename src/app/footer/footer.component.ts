import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
export class FooterComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  userName = 'Carregando...';

  constructor(
    private router: Router,
    private userService: UserService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.loadUserName();
  }

  private loadUserName(): void {
    // MÉTODO 1: Tentar pegar do userProfile primeiro
    if (this.userService.userProfile) {
      this.setUserNameFromProfile(this.userService.userProfile);
      return;
    }

    // MÉTODO 2: Escutar mudanças de autenticação
    const authSubscription = this.afAuth.authState.subscribe(user => {
      if (user) {
        // Usar dados diretos do Firebase Auth
        this.userName = user.displayName || 
                       user.email?.split('@')[0] || 
                       'Usuário';
        
        // Tentar buscar perfil mais detalhado
        this.tryLoadUserProfile();
      } else {
        this.userName = 'Dentistas.com.br';
      }
    });

    this.subscriptions.push(authSubscription);
  }

  private tryLoadUserProfile(): void {
    // MÉTODO 3: Buscar perfil do UserService
    const profileSubscription = this.userService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.setUserNameFromProfile(profile);
        }
      },
      error: (error) => {
        console.log('Erro ao carregar perfil:', error);
        // Manter o nome do Firebase Auth
      }
    });

    this.subscriptions.push(profileSubscription);
  }

  private setUserNameFromProfile(profile: unknown): void {
    const profileData = profile as { 
      displayName?: string; 
      nome?: string; 
      name?: string; 
      email?: string;
    };
    
    this.userName = profileData.displayName || 
                   profileData.nome || 
                   profileData.name || 
                   profileData.email?.split('@')[0] || 
                   'Usuário';
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    const logoutSubscription = this.userService.logout().subscribe({
      next: () => {
        console.log('Logout realizado com sucesso');
        this.router.navigate(['/login']);
      },
      error: (error: unknown) => {
        console.error('Erro durante logout:', error);
        this.router.navigate(['/login']);
      }
    });
    
    this.subscriptions.push(logoutSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
