import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  email: string = '';

  constructor(private afAuth: AngularFireAuth, private router: Router) { }

  onSubmit() {
    if (!this.email) {
      alert('Por favor, insira um email válido.');
      return;
    }

    this.afAuth.sendPasswordResetEmail(this.email)
      .then(() => {
        alert('Um email para redefinição de senha foi enviado.');
        this.router.navigate(['/login']);
      })
      .catch(error => {
        console.error('Erro ao enviar email de redefinição de senha:', error);
        alert('Ocorreu um erro ao tentar enviar o email.');
      });
  }
}
