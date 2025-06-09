// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

interface Endereco {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
}

@Component({
  selector: 'app-enderecos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './endereco.component.html',
  styleUrls: ['./endereco.component.scss']
})
export class EnderecoComponent {
  
  constructor(public userService: UserService) {
  }
  
  // Método para obter os endereços do userProfile
  getEnderecos(): Endereco[] {
    const userProfile = this.userService.userProfile;
    if (!userProfile.enderecos) return [];
    
    if (Array.isArray(userProfile.enderecos)) {
      return userProfile.enderecos;
    }
    
    return [];
  }
  
  // Verifica se existem endereços para exibir
  hasEnderecos(): boolean {
    const enderecos = this.getEnderecos();
    return enderecos.length > 0;
  }
}