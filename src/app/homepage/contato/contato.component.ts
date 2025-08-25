// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contato.component.html', 
  styleUrls: ['./contato.component.scss']
})
export class ContatoComponent {

  constructor(public userService: UserService) { 
  }

}