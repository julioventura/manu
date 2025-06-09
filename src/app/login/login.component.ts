import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// FIX: import correto do AuthService
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavegacaoService } from '../shared/services/navegacao.service';
import firebase from 'firebase/compat/app';

// Interface para erro do Firebase
interface FirebaseError {
  code: string;
  message: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  hidePassword: boolean = true;

  constructor(
    private afAuth: AngularFireAuth, // FIX: remover @Inject - usar injeção normal
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private navegacao: NavegacaoService
  ) {}

  async signInWithGoogle(): Promise<void> {
    try {
      this.isLoading = true;
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this.afAuth.signInWithPopup(provider);
      
      if (result.user) {
        this.snackBar.open('Login realizado com sucesso!', 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
      this.snackBar.open('Erro ao fazer login com Google', 'OK', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithEmail(): Promise<void> {
    if (!this.email || !this.password) {
      this.snackBar.open('Por favor, preencha todos os campos', 'OK', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    try {
      this.isLoading = true;
      const result = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      
      if (result.user) {
        this.snackBar.open('Login realizado com sucesso!', 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      const firebaseError = error as FirebaseError;
      
      let errorMessage = 'Erro ao fazer login';
      if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      this.snackBar.open(errorMessage, 'OK', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  async resetPassword(): Promise<void> {
    if (!this.email) {
      this.snackBar.open('Por favor, digite seu email', 'OK', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    try {
      await this.afAuth.sendPasswordResetEmail(this.email);
      this.snackBar.open('Email de recuperação enviado!', 'OK', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch {
      this.snackBar.open('Erro ao enviar email de recuperação', 'OK', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  voltar(): void {
    this.navegacao.goBack();
  }
}
