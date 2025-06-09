// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-titulacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './titulacoes.component.html', 
  styleUrls: ['./titulacoes.component.scss']
})
export class TitulacoesComponent {

  public userProfile: any;
  formacao: string = '';
  especialidades: string = '';

  constructor(
    public userService: UserService
  ) {
  }

  ngOnInit() {
  }

}