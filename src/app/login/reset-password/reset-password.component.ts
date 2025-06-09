import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Altere para AngularFireAuth
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: false
})
export class ResetPasswordComponent {
  email: string = '';

  constructor(private afAuth: AngularFireAuth, private router: Router) { } // Usando AngularFireAuth aqui

  onSubmit() {
    this.afAuth.sendPasswordResetEmail(this.email) // Altere para afAuth.sendPasswordResetEmail
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
