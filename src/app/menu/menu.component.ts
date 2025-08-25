import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UtilService } from '../shared/utils/util.service';
import { FirestoreService } from '../shared/services/firestore.service';
import { NgFor } from '@angular/common';

interface Subcolecao {
  nome: string;
  rota: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [NgFor]
})
export class MenuComponent implements OnInit {
  // Recebe a coleção e ID para uso no carregamento de subcoleções e navegação
  @Input() collection: string = '';
  @Input() id: string = '';
  subcolecoes: Subcolecao[] = [];
  userId: string = '';

  constructor(
    private router: Router,
    private firestoreService: FirestoreService<Record<string, unknown> & { id?: string }>,
    private afAuth: AngularFireAuth,
    public util: UtilService
  ) { }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;
        
        if (!this.collection || !this.id) {
          return;
        }

        this.carregarSubcolecoes();
      }
    });
  }

  carregarSubcolecoes() {
    // Carrega todas as subcoleções disponíveis
    const todasSubcolecoes = this.getMenusPadraoPorCollection();
    this.subcolecoes = todasSubcolecoes.map(nome => ({
      nome,
      rota: `/list-fichas/${this.collection}/${this.id}/fichas/${nome.toLowerCase()}`
    }));
  }

  carregarSubcolecoesPadrao() {
    const subcolecoesPadrao = this.getMenusPadraoPorCollection();

    if (subcolecoesPadrao.length > 0) {
      // Cria o documento no Firestore para futuras configurações
      const configPath = `users/${this.userId}/configuracoesMenu/${this.collection}`;
      this.firestoreService.setDocumentByPath(configPath, { subcolecoes: subcolecoesPadrao })
        .then(() => {
          // Configuração padrão criada
        })
        .catch(() => {
          // Erro ao criar configuração
        });

      // Mapeia as subcoleções para o formato correto
      this.subcolecoes = subcolecoesPadrao.map(nome => ({
        nome,
        rota: `/list-fichas/${this.collection}/${this.id}/fichas/${nome.toLowerCase()}`
      }));
    } else {
      this.subcolecoes = [];
    }
  }



  getMenusPadraoPorCollection(): string[] {
    // Lista completa de subcoleções disponíveis
    const subcolecoesPadrao = [
      'exames',
      'planos', 
      'pagamentos',
      'atendimentos',
      'documentos',
      'dentesendo',
      'dentesperio',
    ];

    // Retorna todas as subcoleções para qualquer coleção
    return subcolecoesPadrao;
  }


  // Função para navegar para a rota da subcoleção selecionada
  navegarPara(subcolecao: Subcolecao) {

    // Navega para a rota da subcoleção configurada
    this.router.navigate([subcolecao.rota]);
  }

  ajustar(str: string): string {
    return this.util.titulo_ajuste_plural(str);
  }

}
