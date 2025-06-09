// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

// USAR a interface Endereco em vez de any
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
  
  // CORRIGIDO: usar interface Endereco em vez de any
  getEnderecos(): Endereco[] {
    const userProfile = this.userService.userProfile;
    if (!userProfile || !userProfile['enderecos']) return [];
    
    const enderecos = userProfile['enderecos'];
    
    // Verificar se é array e tem a estrutura correta
    if (Array.isArray(enderecos)) {
      return enderecos.filter(this.isValidEndereco);
    }
    
    return [];
  }
  
  // Verifica se existem endereços para exibir
  hasEnderecos(): boolean {
    const enderecos = this.getEnderecos();
    return enderecos.length > 0;
  }

  // ADICIONAR: método para validar estrutura do endereço
  private isValidEndereco(endereco: unknown): endereco is Endereco {
    if (!endereco || typeof endereco !== 'object') return false;
    
    const obj = endereco as Record<string, unknown>;
    return (
      typeof obj['rua'] === 'string' ||
      typeof obj['bairro'] === 'string' ||
      typeof obj['cidade'] === 'string' ||
      typeof obj['estado'] === 'string' ||
      typeof obj['cep'] === 'string' ||
      typeof obj['telefone'] === 'string'
    );
  }

  // ADICIONAR: método helper para acessar propriedades de forma segura
  getEnderecoProperty(endereco: unknown, property: keyof Endereco): string {
    if (!endereco || typeof endereco !== 'object') return '';
    
    const obj = endereco as Record<string, unknown>;
    const value = obj[property];
    
    return typeof value === 'string' ? value : '';
  }

  // ADICIONAR: método para formatar endereço completo
  formatEnderecoCompleto(endereco: Endereco): string {
    const partes = [
      endereco.rua,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
      endereco.cep
    ].filter(parte => parte && parte.trim().length > 0);
    
    return partes.join(', ');
  }
}