import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  // ADICIONAR: propriedades faltando
  selectedTab: number = 0;
  
  // Login
  email: string = '';
  password: string = '';
  hidePassword: boolean = true;
  isSubmitting: boolean = false;
  isLoggingIn: boolean = false;  // ADICIONAR - Linha 84, 102, 116, 144
  
  // Signup
  signupEmail: string = '';
  signupPassword: string = '';
  signupName: string = '';
  hideSignupPassword: boolean = true;
  isCreatingAccount: boolean = false;
  
  // Reset
  resetEmail: string = '';
  isResetting: boolean = false;

  constructor(
    private afAuth: AngularFireAuth, // FIX: remover @Inject - usar injeção normal
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private navegacao: NavegacaoService
  ) {}

  ngOnInit(): void {
    // ADICIONAR: lógica para redirecionar usuários autenticados
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    try {
      this.isLoggingIn = true;
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
      this.isLoggingIn = false;
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
      this.isLoggingIn = true;
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
      this.isLoggingIn = false;
    }
  }

  async onSignup(): Promise<void> {
    if (!this.signupEmail || !this.signupPassword || !this.signupName) {
      this.snackBar.open('Por favor, preencha todos os campos', 'OK', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    try {
      this.isCreatingAccount = true;
      const result = await this.afAuth.createUserWithEmailAndPassword(this.signupEmail, this.signupPassword);
      
      if (result.user) {
        // ADICIONAR: atualização do perfil do usuário com o nome
        await result.user.updateProfile({
          displayName: this.signupName
        });
        
        this.snackBar.open('Conta criada com sucesso!', 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      const firebaseError = error as FirebaseError;
      
      let errorMessage = 'Erro ao criar conta';
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Email já está em uso';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      }
      
      this.snackBar.open(errorMessage, 'OK', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isCreatingAccount = false;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      this.snackBar.open('Email de recuperação enviado! Verifique sua caixa de entrada e, se não encontrar, a de SPAM.', 'OK', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    } catch {
      this.snackBar.open('Erro ao enviar email de recuperação', 'OK', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // ADICIONAR: método login faltando - Linha 219
  async login(email: string, password: string): Promise<void> {
    try {
      this.isLoggingIn = true;
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (result.user) {
        console.log('Login realizado com sucesso:', result.user.uid);
        // Redirecionar para dashboard ou home
        // this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      this.isLoggingIn = false;
    }
  }

  // CORRIGIR: método onLogin para usar o método login
  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      alert('Por favor, preencha email e senha.');
      return;
    }
    
    this.isSubmitting = true;
    try {
      // LINHA 219 - USAR o método login
      await this.login(this.email, this.password);
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // ADICIONAR: método para signup
  async signup(): Promise<void> {
    if (!this.signupEmail || !this.signupPassword || !this.signupName) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    this.isCreatingAccount = true;
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        this.signupEmail, 
        this.signupPassword
      );
      
      if (result.user) {
        // Atualizar profile com o nome
        await result.user.updateProfile({ displayName: this.signupName });
        console.log('Conta criada com sucesso:', result.user.uid);
        // Redirecionar
        // this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      alert('Erro ao criar conta. Tente novamente.');
    } finally {
      this.isCreatingAccount = false;
    }
  }

  // ADICIONAR: método onResetPassword
  async onResetPassword(): Promise<void> {
    if (!this.resetEmail) {
      alert('Por favor, digite seu email.');
      return;
    }
    
    this.isResetting = true;
    try {
      await this.resetPassword(this.resetEmail);
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      alert('Erro ao enviar email de reset.');
    } finally {
      this.isResetting = false;
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleSignupPasswordVisibility(): void {
    this.hideSignupPassword = !this.hideSignupPassword;
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  voltar(): void {
    this.navegacao.goBack();
  }
}
