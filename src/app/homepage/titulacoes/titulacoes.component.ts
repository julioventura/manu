// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

// ADICIONAR: Interface para UserProfile
interface UserProfile {
  titulacoes?: string;
  formacao?: string;
  especialidades?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-titulacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './titulacoes.component.html', 
  styleUrls: ['./titulacoes.component.scss']
})
export class TitulacoesComponent implements OnInit {

  // CORRIGIDO: usar interface específica em vez de any
  public userProfile: UserProfile | null = null;
  formacao: string = '';
  especialidades: string = '';

  constructor(
    public userService: UserService
  ) {
  }

  ngOnInit(): void {
    // Implementar se necessário
  }

  // ADICIONAR: método helper para conversão segura
  safeString(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return value.join(', ');
    try {
      return String(value);
    } catch {
      return '';
    }
  }
}