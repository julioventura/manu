// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-convenios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './convenios.component.html', 
  styleUrls: ['./convenios.component.scss']
})
export class ConveniosComponent {
  // Array padrão de convênios caso não haja dados
  conveniosDefault = [];
  
  constructor(public userService: UserService) {
  }
  

  // Verifica se existem convênios para exibir
  temConvenios(): boolean {
    return this.getConvenios().length > 0;
  }

  getConvenios() {
    return this.userService.userProfile?.convenios || this.conveniosDefault;
  }
  
}