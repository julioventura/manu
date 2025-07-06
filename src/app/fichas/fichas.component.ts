// Alteração: remoção de logs de depuração (console.log)
/*
  FichasComponent
  Métodos:
  1. ngOnInit(): Inicializa o componente, obtendo o usuário logado, definindo a lista fixa de coleções e carregando os campos.
  2. carregarCampos(): Utiliza o CamposFichaService para carregar os campos fixos da coleção selecionada.
  3. voltar(): Retorna à rota anterior utilizando o NavegacaoService.
*/

import { Component, OnInit } from '@angular/core';
import { NavegacaoService } from '../shared/services/navegacao.service';
import { CamposFichaService } from '../shared/services/campos-ficha.service';
import { UserService } from '../shared/services/user.service';
import { UtilService } from '../shared/utils/util.service';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { Campo } from '../shared/models/campo.model';

@Component({
  selector: 'app-fichas',
  templateUrl: './fichas.component.html',
  styleUrls: ['./fichas.component.scss'],
  imports: [FormsModule, NgFor],
})
export class FichasComponent implements OnInit {
  // Seleciona "padrao" inicialmente para a coleção
  colecaoSelecionada: string = 'padrao';
  // Armazena os campos fixos da coleção selecionada
  campos: Campo[] = [];
  // Lista fixa de coleções disponíveis
  colecoes: string[] = [];
  // UID do usuário logado
  userId: string = '';

  constructor(
    private camposFichaService: CamposFichaService,
    private navegacaoService: NavegacaoService,
    private userService: UserService,
    public util: UtilService
  ) { }

  /**
   * ngOnInit()
   * @description Inicializa o componente:
   *  - Obtém o usuário logado por meio do UserService.
   *  - Define a lista fixa de coleções.
   *  - Chama o método carregarCampos() para carregar os campos fixos da coleção selecionada.
   */
  ngOnInit(): void {
    // Obtém o userId do usuário logado
    this.userService.getUser().subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;
        // Define as coleções fixas
        this.colecoes = [
          'exames',
          'planos',
          'pagamentos',
          'atendimentos',
          'dentes',
          'dentesendo',
          'dentesperio'
        ];
        // Chama o método que carrega os campos da coleção selecionada
        this.carregarCampos();
      } else {
        console.error("Usuário não está autenticado.");
      }
    });
  }

  /**
   * carregarCampos()
   * @description Utiliza o CamposFichaService para carregar os campos fixos da coleção selecionada.
   * 
   * @param - Não possui parâmetros de entrada; utiliza as variáveis de classe userId e colecaoSelecionada.
   * @returns - Atualiza a variável 'campos' com o resultado obtido do serviço.
   */
  carregarCampos() {
    this.camposFichaService.getCamposFichaRegistro(this.userId, this.colecaoSelecionada).subscribe(
      (campos) => {
        this.campos = campos;
      },
      (error) => {
        console.error('Erro ao carregar campos:', error);
        alert('Erro ao carregar campos. Tente novamente.');
      }
    );
  }

  /**
   * voltar()
   * @description Retorna à rota anterior utilizando o NavegacaoService.
   */
  voltar() {
    this.navegacaoService.goBack();
  }

}
