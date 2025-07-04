/**
 * ViewComponent
 * 
 * Métodos:
 * 1. ngOnInit: Inicializa o componente; subscreve o estado de autenticação, obtém os parâmetros de rota e carrega os dados do registro.
 * 2. updateCustomLabelWidth: Atualiza a variável que define a largura do label para custom styling.
 * 3. fixedFields (getter): Retorna os campos fixos (por exemplo, 'nome', 'data', 'nuvem', 'obs') que serão exibidos no container 1.
 * 4. adjustableFields (getter): Retorna os campos que não são fixos, para exibição no container 2.
 * 5. editar: Redireciona para a rota de edição, diferenciando edição de registro principal e ficha interna (subcollection).
 * 6. excluir: Exclui o registro ou ficha interna após confirmação do usuário e, em seguida, navega para a lista.
 * 7. voltar: Navega para a rota de listagem de registros ou fichas, dependendo do contexto.
 * 8. getDynamicFields: Retorna os nomes dos campos dinâmicos que não fazem parte dos campos pré-definidos no FormGroup.
 * 9. openUrl: Abre uma URL em uma nova janela, caso o campo corresponda a um link.
 */

import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UtilService } from '../shared/utils/util.service';
import { FormService } from '../shared/services/form.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Definir a animação fadeAnimation
const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

@Component({
    selector: 'app-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    animations: [fadeAnimation],
    imports: [NgIf, MenuComponent, FormsModule, ReactiveFormsModule, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault]
})
export class ViewComponent implements OnInit {
  userId: string | null = null;           // ID do usuário autenticado
  collection!: string;                    // Nome da coleção
  subcollection!: string;                 // Nome da subcollection, se houver
  registro: Record<string, unknown> | null = null; // Dados carregados do registro
  id!: string;                            // ID do registro principal
  view_only: boolean = true;              // Modo visualização: true (readonly)
  fichaId: string = '';                   // ID da ficha interna, se aplicável
  titulo_da_pagina: string = '';          // Título da página
  subtitulo_da_pagina: string = '';       // Subtítulo da página
  isLoading = true;                       // Flag de carregamento, true enquanto dados não são carregados
  registroPath: string = '';              // Caminho para operações com o registro (utilizado no delete)
  routePath: string = '';                 // Caminho de rota para redirecionamentos pós operações
  show_menu: boolean = false;             // Controla exibição de menus adicionais
  menu_exame: boolean = false;            // Flag específica para exame (caso necessário)
  
  // Propriedade utilizada no binding CSS para definir a largura dos labels
  customLabelWidthValue: number = 200;
  customLabelWidth: string = `${this.customLabelWidthValue}px`;

  // ADICIONAR: propriedades para editar e excluir como funções
  editar: () => void = () => this.editarRegistro();
  excluir: () => void = () => this.excluirRegistro();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService<Record<string, unknown>>,
    private afAuth: AngularFireAuth,
    public util: UtilService,
    public FormService: FormService
  ) { }

  /**
   * ngOnInit()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Subscreve o estado de autenticação para obter o usuário autenticado.
   * - Obtém os parâmetros da rota (id, collection, subcollection, fichaId).
   * - Define o título da página baseado na existência de subcollection.
   * - Carrega os dados do registro utilizando FormService.loadFicha() para subcollections ou loadRegistro() para registro principal.
   * - Define o subtítulo da página com o nome do registro e configura a exibição do menu.
   * - Ajusta a largura dos labels via customLabelWidthValue e updateCustomLabelWidth().
   * Retorna: void.
   */
  ngOnInit() {
    console.log('ngOnInit()');
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;
        const id = this.route.snapshot.paramMap.get('id');
        if (id) { this.id = id; }
        this.collection = this.route.snapshot.paramMap.get('collection')!;
        this.subcollection = this.route.snapshot.paramMap.get('subcollection')!;
        this.fichaId = this.route.snapshot.paramMap.get('fichaId')!;

        if (!this.collection || !this.id) {
          console.warn('Collection ou ID não foram passados corretamente.');
          return;
        }

        // Define o título da página conforme subcollection ou coleção principal
        this.titulo_da_pagina = this.subcollection
          ? this.util.titulo_ajuste_singular(this.subcollection)
          : this.util.titulo_ajuste_singular(this.collection);
        
        console.log('userId:', this.userId);
        console.log('collection:', this.collection);
        console.log('id:', this.id);
        console.log('titulo_da_pagina:', this.titulo_da_pagina);
        console.log('subcollection:', this.subcollection);
        console.log('fichaId:', this.fichaId);

        if (!this.id) {
          console.error('Registro não identificado.');
          this.voltar();
        } else {
          if (this.subcollection) {
            console.log('Carregando ficha interna...');
            console.log('loadFicha()');
            console.log('Collection :', this.collection);
            console.log('Subcollection :', this.subcollection);
            this.FormService.loadFicha(this.userId, this.collection, this.id, this.subcollection, this.fichaId, this.view_only)
              .then(() => {
                this.registro = this.FormService.registro;
                this.isLoading = false;
              })
              .catch(error => {
                console.error('Erro ao carregar ficha:', error);
                this.isLoading = false;
              });
          } else {
            console.log('Collection :', this.collection);
            console.log('loadRegistro()');
            this.FormService.loadRegistro(this.userId, this.collection, this.id, this.view_only)
              .then(() => {
                this.registro = this.FormService.registro;
                this.isLoading = false;
              })
              .catch(error => {
                console.error('Erro ao carregar registro:', error);
                this.isLoading = false;
              });
          }

          // Define o subtítulo com base no nome do registro (obtido via FormService)
          this.subtitulo_da_pagina = this.FormService.nome_in_collection;
          console.log('subtitulo_da_pagina:', this.subtitulo_da_pagina);

          // Exibe o menu se estiver na visualização do registro principal
          this.show_menu = !!(this.collection && this.id && !this.subcollection);
        }

        // Ajuste da largura dos labels baseado em critério (ex.: coleção "dentesendo")
        if (this.subcollection === 'dentesendo') {
          this.customLabelWidthValue = 400;
        } else {
          this.customLabelWidthValue = 250;
        }
        this.updateCustomLabelWidth();

      } else {
        console.error('Usuário não autenticado.');
        this.util.goHome();
      }
    });
    console.log('ViewComponent inicializado.');
  }

  /**
   * updateCustomLabelWidth()
   * 
   * Funcionalidade:
   * - Atualiza a variável customLabelWidth (string) com base no valor de customLabelWidthValue.
   * Retorna: void.
   */
  updateCustomLabelWidth() {
    this.customLabelWidth = `${this.customLabelWidthValue}px`;
  }

  // Tipagem dos getters usando a interface do FormService
  /**
   * fixedFields (getter)
   * 
   * Funcionalidade:
   * - Retorna os campos fixos, definidos como ['nome', 'data', 'nuvem', 'obs'], para exibição no container 1.
   * Retorna: Array de objetos representando os campos fixos.
   */
  get fixedFields(): Array<{ nome: string; label: string; tipo: string; [key: string]: unknown }> {
    const fixed = ['nome', 'data', 'nuvem', 'obs'];
    return this.FormService.campos.filter(campo => {
      if (fixed.includes(campo.nome)) {
        if (campo.nome === 'nome') {
          return true; // Exibe sempre o campo "nome"
        }
        const valor = this.FormService.registro[campo.nome];
        return valor != null && String(valor).trim().length > 0;
      }
      return false;
    });
  }

  /**
   * adjustableFields (getter)
   * 
   * Funcionalidade:
   * - Retorna os campos não fixos (ou seja, os campos que não estão em ['nome', 'data', 'nuvem', 'obs']),
   *   que serão exibidos no container 2.
   * Retorna: Array de objetos representando os campos ajustáveis.
   */
  get adjustableFields(): Array<{ nome: string; label: string; tipo: string; [key: string]: unknown }> {
    const fixed = ['nome', 'data', 'nuvem', 'obs'];
    return this.FormService.campos.filter(campo => {
      if (!fixed.includes(campo.nome)) {
        const valor = this.FormService.registro[campo.nome];
        return valor != null && String(valor).trim().length > 0;
      }
      return false;
    });
  }

  /**
   * editarRegistro()
   * 
   * Parâmetros: N/A. (Invocado via template)
   * Funcionalidade:
   * - Redireciona para a rota de edição.
   * - Se for subcollection, constrói a rota usando fichaId; caso contrário, usa o id do registro principal.
   * Retorna: void.
   */
  editarRegistro() {
    console.log('editar()');
    if (this.subcollection) {
      const editPath = `/edit-ficha/${this.collection}/${this.id}/fichas/${this.subcollection}/itens`;
      console.log("editPath =", editPath);
      console.log("fichaId =", this.fichaId);
      this.router.navigate([editPath, this.fichaId]);
    } else {
      const editPath = `/edit/${this.collection}`;
      console.log("editPath =", editPath);
      console.log("id =", this.id);
      this.router.navigate([editPath, this.id]);
    }
  }

  /**
   * excluirRegistro()
   * 
   * Parâmetros: N/A. (Invocado via template)
   * Funcionalidade:
   * - Solicita confirmação do usuário para excluir o registro.
   * - Determina o caminho de registro e rota de redirecionamento com base em se é subcollection ou registro principal.
   * - Chama firestoreService.deleteRegistro() e navega para a rota apropriada em caso de sucesso.
   * Retorna: void.
   */
  excluirRegistro() {
    console.log("excluir()");
    if (confirm('Você tem certeza que deseja excluir este registro?')) {
      let registro_id = '';
      if (this.subcollection) {
        this.registroPath = `users/${this.userId}/${this.collection}/${this.id}/fichas/${this.subcollection}/itens`;
        this.routePath = `/list-fichas/${this.collection}/${this.id}/fichas/${this.subcollection}`;
        registro_id = this.fichaId;
      } else {
        this.registroPath = `users/${this.userId}/${this.collection}`;
        this.routePath = `list/${this.collection}`;
        registro_id = this.id;
      }
      this.firestoreService.deleteRegistro(this.registroPath, registro_id)
        .then(() => {
          this.router.navigate([this.routePath]);
        })
        .catch(error => {
          console.error('Erro ao excluir o registro:', error);
        });
    }
  }

  /**
   * voltar()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Define a rota de retorno para a listagem, diferenciando entre registros principais e subcollections.
   * - Navega para a rota definida.
   * Retorna: void.
   */
  voltar() {
    console.log("voltar()");
    const listaPath = this.subcollection ?
      `/list-fichas/${this.collection}/${this.id}/fichas/${this.subcollection}` :
      `list/${this.collection}`;
    this.router.navigate([listaPath]);
  }

  /**
   * getDynamicFields()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Retorna os nomes dos campos dinâmicos não pré-definidos que estão presentes no FormGroup.
   * - Compara as chaves do FormGroup com os nomes dos campos pré-definidos em FormService.campos.
   * Retorna: Array de strings contendo os nomes dos campos dinâmicos.
   */
  getDynamicFields(): string[] {
    const predefinedFields = this.FormService.campos.map(campo => campo.nome);
    return Object.keys(this.FormService.fichaForm.controls).filter(
      campoNome => !predefinedFields.includes(campoNome)
    );
  }

  /**
   * openUrl(url: string)
   * 
   * Parâmetros:
   * - url: string - A URL que deve ser aberta (quando o usuário clica sobre um campo do tipo 'url').
   * Funcionalidade:
   * - Verifica se a URL é válida (não vazia) e, em caso afirmativo, abre a URL em uma nova aba.
   * Retorna: void.
   */
  openUrl(url: string): void {
    console.log("openUrl()");
    if (url && url.trim().length > 0) {
      window.open(url, '_blank');
    }
  }
}
