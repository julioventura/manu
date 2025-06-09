// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';

import { NavegacaoService } from '../shared/services/navegacao.service';
import { ConfigService } from '../shared/services/config.service';
import { UtilService } from '../shared/utils/util.service';
import { SubcolecaoService } from '../shared/services/subcolecao.service';

// ADICIONAR interfaces para tipagem
interface SubcolecaoItem {
  nome: string;
  selecionado: boolean;
}

interface ConfigMenuData {
  subcolecoes?: string[];
}

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
    // MatIconModule,
    // MatButtonModule
  ]
})
export class ConfigComponent implements OnInit {
  ambiente: string = '';
  new_window: boolean = false;
  colecaoSelecionada: string = '';

  colecoesDisponiveis = [
    'Campos das coleções',
    'Campos das fichas sub-coleções',
    'Menu das fichas',
    'Seu perfil',
    'Sua homepage',
  ];

  // FIX: corrigir indentação (2 spaces)
  // A array agora será carregada dinamicamente pelo serviço
  subcolecoesDisponiveis: SubcolecaoItem[] = [];

  constructor(
    private router: Router,
    public util: UtilService,
    public configuracoes: ConfigService,
    private navegacaoService: NavegacaoService,
    private firestore: AngularFirestore,
    private subcolecaoService: SubcolecaoService
  ) { }

  ngOnInit(): void {
    // Alteração: log de depuração removido
    // Pegando as configurações do ConfigService

    this.ambiente = this.configuracoes.ambiente;

    // Carregar a lista de subcoleções dinamicamente a partir do SubcolecaoService
    this.carregarSubcolecoesDisponiveis();
  }

  carregarSubcolecoesDisponiveis(): void {
    // Obter as subcoleções definidas no serviço e mapear para incluir o campo "selecionado"
    this.subcolecoesDisponiveis = this.subcolecaoService.getSubcolecoesDisponiveis().map(sub => ({
      nome: sub.nome,
      // Definir true para 'exames' ou como padrão false
      selecionado: sub.nome === 'exames' ? true : false
    }));
  }

  selecionarColecao(colecao: string): void {
    // Toggle entre a coleção e uma string vazia para "desselecionar"
    this.colecaoSelecionada = this.colecaoSelecionada === colecao ? '' : colecao;
    this.carregarConfiguracoes();
  }

  // Método para navegação dinâmica
  go(route: string): void {
    this.router.navigate(['/' + route]);
  }

  carregarConfiguracoes(): void {
    if (this.colecaoSelecionada) {
      this.firestore.collection('configuracoesMenu').doc(this.colecaoSelecionada).get().subscribe(doc => {
        const dados = doc.data() as ConfigMenuData;
        if (dados?.subcolecoes) {
          this.subcolecoesDisponiveis = this.subcolecoesDisponiveis.map(sub => ({
            ...sub,
            selecionado: dados.subcolecoes?.includes(sub.nome) || false
          }));
        }
      });
    }
  }

  // salvar() {
  // }

  salvarConfiguracoes(): void {
    const subcolecoesSelecionadas = this.subcolecoesDisponiveis
      .filter(sub => sub.selecionado)
      .map(sub => sub.nome);

    this.firestore.collection('configuracoesMenu').doc(this.colecaoSelecionada).set({
      subcolecoes: subcolecoesSelecionadas
    }).then(() => {
      alert('Configurações salvas com sucesso!');
    }).catch(error => {
      console.error('Erro ao salvar configurações:', error);
    });
  }

  voltar(): void {
    this.navegacaoService.goBack(); 
  }
}
