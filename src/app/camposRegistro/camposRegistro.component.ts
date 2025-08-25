// Alteração: remoção de logs de depuração (console.log)
import { Component, HostListener, OnInit } from '@angular/core';
import { NavegacaoService } from '../shared/services/navegacao.service';
import { CamposService } from '../shared/services/campos.service';
import { UserService } from '../shared/services/user.service'; //
import { UtilService } from '../shared/utils/util.service';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';


@Component({
    selector: 'app-camposRegistro',
    templateUrl: './camposRegistro.component.html',
    styleUrls: ['../fichas/fichas.component.scss'],
    imports: [FormsModule, NgFor]
})
export class CamposRegistroComponent implements OnInit {
  colecaoSelecionada: string = 'padrao'; // Seleciona "padrao" inicialmente
  campos: any[] = []; // Armazena os campos da coleção selecionada
  colecoes: any[] = []; // Lista de coleções disponíveis
  camposIniciais: any[] = []; // Armazena os campos ao carregar a página
  userId: string = ''; // Armazena o userId do usuário logado
  alteracoesPendentes: boolean = false; // Flag para saber se há alterações pendentes

  constructor(
    private camposService: CamposService,
    private navegacaoService: NavegacaoService,
    private userService: UserService,
    public util: UtilService,
  ) { }

  ngOnInit(): void {
    // Obtém o userId do usuário logado
    this.userService.getUser().subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid; // Armazena o uid do usuário logado
        // Alteração: log de depuração removido

        // Após recuperar o userId, carregar coleções e campos
        this.carregarColecoes();
        this.carregarCampos();
      } else {
        console.error("Usuário não está autenticado.");
      }
    });
  }

  carregarColecoes() {
    this.camposService.getColecoes(this.userId).subscribe((colecoes) => {
      this.colecoes = ['padrao', ...colecoes]; // 'padrao' aparece primeiro na lista de coleções
    });
  }

  carregarCampos() {
    // Carrega os campos da coleção selecionada
    this.camposService.getCamposRegistro(this.userId, this.colecaoSelecionada).subscribe((campos) => {
      this.campos = campos;
      this.camposIniciais = JSON.parse(JSON.stringify(campos)); // Faz uma cópia dos campos iniciais
    });
  }

  salvar() {
    // Salva as configurações da coleção atual
    this.camposService.setCamposRegistro(this.userId, this.colecaoSelecionada, this.campos).then(() => {
      alert('Configurações salvas com sucesso!');
      this.camposIniciais = JSON.parse(JSON.stringify(this.campos)); // Atualiza os campos iniciais após salvar
      this.alteracoesPendentes = false; // Nenhuma alteração pendente após salvar
    });
  }

  adicionarCampo() {
    // Adiciona um novo campo com nome e tipo padrão
    this.campos.push({ nome: '', tipo: 'text', label: '' });
    this.alteracoesPendentes = true; // Marca alterações pendentes
  }

  removerCampo(index: number) {
    // Adiciona um alerta de confirmação antes de remover o campo
    const confirmacao = confirm('Você tem certeza que deseja remover este campo?');
    if (confirmacao) {
      // Se o usuário confirmar, o campo é removido
      this.campos.splice(index, 1);
      this.alteracoesPendentes = true; // Marca alterações pendentes
    }
  }

  adicionarColecao() {
    const novaColecao = prompt('Digite o nome da nova coleção:');
    if (novaColecao) {
      // Cria a nova coleção com base nos campos padrão
      this.camposService.setCamposRegistro(this.userId, novaColecao, [...this.camposService.camposPadrao]).then(() => {
        this.colecaoSelecionada = novaColecao;
        this.carregarColecoes();
        this.carregarCampos();
        this.alteracoesPendentes = true; // Marca alterações pendentes
      });
    }
  }

  // Função para mover campo para cima
  moverCampoParaCima(index: number) {
    if (index > 0) {
      [this.campos[index - 1], this.campos[index]] = [this.campos[index], this.campos[index - 1]];
      this.alteracoesPendentes = true; // Marca alterações pendentes
    }
  }

  // Função para mover campo para baixo
  moverCampoParaBaixo(index: number) {
    if (index < this.campos.length - 1) {
      [this.campos[index + 1], this.campos[index]] = [this.campos[index], this.campos[index + 1]];
      this.alteracoesPendentes = true; // Marca alterações pendentes
    }
  }

  voltar() {
    this.navegacaoService.goBack();
  }

  // HostListener para interceptar o evento de saída da página
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.alteracoesPendentes) {
      $event.returnValue = true; // Mostra o alerta de confirmação de saída
    }
  }


}
