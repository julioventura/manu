import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Altere para AngularFireAuth
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
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
