// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

// ADICIONAR: Interface para Convenio
interface Convenio {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  [key: string]: unknown;
}

@Component({
  selector: 'app-convenios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './convenios.component.html',
  styleUrls: ['./convenios.component.scss']
})
export class ConveniosComponent {
  
  // ADICIONAR: convenios padrão tipados
  private conveniosDefault: Convenio[] = [
    { nome: 'Particular', ativo: true },
    { nome: 'Unimed', ativo: true },
    { nome: 'Bradesco Saúde', ativo: true }
  ];

  constructor(public userService: UserService) {}

  // CORRIGIDO: método com nome correto e tipagem
  temConvenios(): boolean {
    const convenios = this.getConvenios();
    return convenios.length > 0;
  }

  // ALIAS para compatibilidade (se necessário)
  hasConvenios(): boolean {
    return this.temConvenios();
  }

  // CORRIGIDO: tipagem específica em vez de any
  getConvenios(): Convenio[] {
    const convenios = this.userService.userProfile?.['convenios'];
    
    if (Array.isArray(convenios)) {
      return convenios.map(this.normalizeConvenio);
    }
    
    return this.conveniosDefault;
  }

  // CORRIGIDO: remover parâmetro não usado
  trackByIndex(index: number): number {
    return index;
  }

  // ADICIONAR: normalizar convenio
  private normalizeConvenio(convenio: unknown): Convenio {
    if (!convenio || typeof convenio !== 'object') {
      return { nome: 'Convenio não especificado' };
    }
    
    const obj = convenio as Record<string, unknown>;
    
    return {
      nome: typeof obj['nome'] === 'string' ? obj['nome'] : 'Nome não informado',
      descricao: typeof obj['descricao'] === 'string' ? obj['descricao'] : undefined,
      ativo: typeof obj['ativo'] === 'boolean' ? obj['ativo'] : true
    };
  }

  // ADICIONAR: método para formatar convenio
  formatConvenio(convenio: Convenio): string {
    if (convenio.descricao) {
      return `${convenio.nome} - ${convenio.descricao}`;
    }
    return convenio.nome;
  }
}