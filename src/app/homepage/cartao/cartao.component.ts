// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-cartao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cartao.component.html', 
  styleUrls: ['./cartao.component.scss']
})
export class CartaoComponent {

  public qrCodeUrl: string = 'https://dentistas.com.br/assets/qrcode_dentistascombr.png';

  constructor(public userService: UserService) {
  }
  

}