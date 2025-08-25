import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

interface Horario {
  dia: string;
  horario: string;
  local: string;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss']
}) 
export class HorariosComponent {
 
  constructor(public userService: UserService) {}  
  
  getHorarios(): Horario[] {
    if (!this.userService.userProfile?.['horarios']) return [];

    // Se for string (formato antigo), tenta converter
    if (typeof this.userService.userProfile?.['horarios'] === 'string') {
      try {
        return JSON.parse(this.userService.userProfile?.['horarios']);
      } catch (e) {
        console.error('Erro ao converter horários', e);
        return [];
      }
    }

    // Se já for array
    if (Array.isArray(this.userService.userProfile?.['horarios'])) {
      return this.userService.userProfile?.['horarios'];
    }

    return [];
  }


  // Verifica se existem endereços para exibir
  hasHorarios(): boolean {
    const horarios = this.getHorarios();
    return horarios.length > 0;
  }
}