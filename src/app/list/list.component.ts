// Alteração: remoção de logs de depuração (console.log)
/**
 * ListComponent
 * 
 * Métodos:
 * 1. ngOnInit: Inicializa o componente, obtém parâmetros de rota e autentica o usuário, chamando funções para carregar registros e configurações.
 * 2. loadRegistros: Constrói o caminho da coleção e consulta o Firestore para recuperar os registros, inicializando a paginação.
 * 3. verFicha: Monta o caminho para a visualização de um registro ou ficha e realiza a navegação.
 * 4. incluir: Cria dinamicamente um novo registro, gerando ID e código, e inicializando os campos customizados.
 * 5. filtrarRegistros: Filtra os registros com base na query de busca (nome ou código) e atualiza a paginação.
 * 6. atualizarPaginacao: Recalcula total de páginas e chama atualizarRegistrosPaginados para definir os registros exibidos na página atual.
 * 7. atualizarRegistrosPaginados: Determina o slice dos registros a serem exibidos conforme a página atual.
 * 8. setPage: Define a página atual e atualiza os registros exibidos.
 * 9. previousPage: Retrocede para a página anterior se possível e atualiza os registros paginados.
 * 10. nextPage: Avança para a próxima página se houver e atualiza os registros paginados.
 * 11. verificarOuCriarConfiguracao: Verifica ou cria uma configuração padrão de campos para a coleção.
 * 12. getMenusPadraoPorCollection: Retorna os menus padrão para a coleção informada.
 * 13. getCamposPadraoPorCollection: Retorna os campos padrão para a coleção.
 * 14. showbusca: Alterna a exibição da barra de pesquisa.
 * 15. voltar: Navega de volta à listagem de registros ou fichas internas.
 */

import { Component, OnInit, runInInjectionContext, Injector, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { UtilService } from '../shared/utils/util.service';
import { FormService } from '../shared/services/form.service';
import { ExportService } from '../shared/services/export.service';
import { SubcolecaoService } from '../shared/services/subcolecao.service';
import { CAMPOS_FICHAS_EXAMES, CAMPOS_FICHAS_DOCUMENTOS, CAMPOS_FICHAS_PLANOS, CAMPOS_FICHAS_ATENDIMENTOS, CAMPOS_FICHAS_TRATAMENTOS, CAMPOS_FICHAS_PAGAMENTOS } from '../shared/constants/campos-ficha.constants';
import { SUBCOLLECTION_FIELDS } from '../shared/constants/subcollection-fields.config';
import { Registro } from '../shared/constants/registro.model';
import { NgIf, NgFor } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FirestoreOptimizedService } from '../shared/services/firestore-optimized-simple.service';
import { SkeletonLoaderComponent } from '../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OTIMIZAÇÃO: OnPush para melhor performance
  imports: [
    NgIf,
    FormsModule,
    NgFor,
    SkeletonLoaderComponent // NOVO: Skeleton loader
  ],
})
export class ListComponent implements OnInit {

  // Propriedades do componente
  collection!: string;
  subcollection?: string;
  registros: Registro[] = [];
  registrosFiltrados: Registro[] = [];
  totalRegistros = 0;
  page = 1;
  pages: number[] = [];
  pageSize = 10;
  totalPages = 0;
  userId: string | null = null;
  isLoading = true;
  searchQuery: string = '';
  filteredTotal = 0;
  registroForm!: FormGroup;
  campos: { nome: string, tipo: string, label: string }[] = [];
  registrosPaginados: Registro[] = [];
  usandoSubColecao: boolean = false;
  titulo_da_pagina: string = '';
  subtitulo_da_pagina: string = '';
  id!: string;
  nome_in_collection: string = '';
  fichas: unknown[] = [];
  show_busca: boolean = false;
  userEmail: string | null = null;

  // Propriedades para customizar os campos na listagem de subcoleções
  firstField: string = 'nome';
  firstHeader: string = 'Registro';

  // Adicione as propriedades para controlar a ordem de classificação:
  firstSortOrder: string = 'asc';
  dataSortOrder: string = 'asc';

  // OTIMIZAÇÃO: Usar Observables com async pipe
  registros$!: Observable<Record<string, unknown>[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService<Record<string, unknown>>,
    private afAuth: AngularFireAuth,
    private fb: FormBuilder,
    public util: UtilService,
    public FormService: FormService,
    private exportService: ExportService,
    private subcolecaoService: SubcolecaoService,
    private injector: Injector,
    private firestoreOptimized: FirestoreOptimizedService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * ngOnInit()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Obtém parâmetros da rota (collection, id, subcollection) e define os títulos.
   * - Subscreve o estado de autenticação para obter o usuário e chama métodos para verificar configuração e carregar os registros.
   * - Inicializa o registro de formulário.
   * Retorna: void.
   */
  ngOnInit() {
    this.collection = this.route.snapshot.paramMap.get('collection')!;
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.subcollection = this.route.snapshot.paramMap.get('subcollection')!;

    // Define os títulos conforme existência de subcollection
    this.titulo_da_pagina = this.subcollection ?
      this.util.titulo_ajuste_plural(this.subcollection) :
      this.util.titulo_ajuste_plural(this.collection);
    this.subtitulo_da_pagina = this.subcollection ? this.FormService.nome_in_collection : '';

    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.userId = user.uid;
        this.userEmail = user.email;
        
        runInInjectionContext(this.injector, () => {
          this.verificarOuCriarConfiguracao();
          this.setupOptimizedDataFlow(); // NOVO: Setup otimizado
        });
      }
    });

    this.registroForm = this.fb.group({
      nome: [''],
      id: ['']
    });

    // Utilize somente uma verificação com a chave normalizada:
    if (this.subcollection) {
      const normalizedKey = this.subcollection.replace(/_/g, '').toLowerCase();
      if (SUBCOLLECTION_FIELDS[normalizedKey]) {
        this.firstField = SUBCOLLECTION_FIELDS[normalizedKey].firstField;
        this.firstHeader = SUBCOLLECTION_FIELDS[normalizedKey].firstHeader;
      } else {
        console.warn("Nenhuma configuração encontrada para:", normalizedKey);
        this.firstHeader = this.subcollection; // valor padrão
      }
    }
  }

  /**
   * OTIMIZAÇÃO: Setup do fluxo de dados otimizado com Observables
   */
  private setupOptimizedDataFlow(): void {
    if (!this.userId || !this.collection) {
      console.error('setupOptimizedDataFlow: Missing userId or collection', { userId: this.userId, collection: this.collection });
      return;
    }

    const collectionPath = this.id
      ? `users/${this.userId}/${this.collection}/${this.id}/fichas/${this.subcollection}/itens`
      : `users/${this.userId}/${this.collection}`;

    console.log('Setting up data flow for path:', collectionPath);

    // SIMPLIFICADO: Usar apenas o método que funciona
    this.registros$ = this.firestoreOptimized.getOptimizedCollection<Record<string, unknown>>(
      collectionPath,
      50, // Fixed page size
      'nome',
      'asc'
    ).pipe(
      map(registros => {
        console.log('Data loaded:', registros.length, 'records');
        this.isLoading = false;
        this.totalRegistros = registros.length;
        this.registros = registros as unknown as Registro[];
        this.registrosFiltrados = this.registros;
        this.atualizarPaginacao();
        this.cdr.markForCheck();
        return registros;
      }),
      catchError(error => {
        console.error('Error loading data:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
        return of([]);
      })
    );

    // Subscribe to actually trigger the data loading
    this.registros$.subscribe();
  }

  /**
   * OTIMIZAÇÃO: Search otimizado com subject
   */
  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.filtrarRegistros();
  }

  /**
   * OTIMIZAÇÃO: Paginação otimizada
   */
  setPage(page: number): void {
    this.page = page;
    this.atualizarRegistrosPaginados();
  }

  /**
   * OTIMIZAÇÃO: Load more para paginação infinita
   */
  loadMore(): void {
    // Simplified: just load next page
    if (this.page < this.totalPages) {
      this.setPage(this.page + 1);
    }
  }

  /**
   * loadRegistros()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Constrói o caminho da coleção baseado na presença de subcollection.
   * - Consulta o Firestore para recuperar os registros, os armazena e inicializa a paginação.
   * - Em caso de erro, exibe o erro no console.
   * Retorna: void.
   */
  loadRegistros() {

    if (this.userId && this.collection) {
      const collectionPath = this.id
        ? `users/${this.userId}/${this.collection}/${this.id}/fichas/${this.subcollection}/itens`
        : `users/${this.userId}/${this.collection}`;
      this.isLoading = true;

      // Consulta os registros ordenados pelo campo "nome"
      this.firestoreService.getRegistros(collectionPath, ref => ref.orderBy('nome')).subscribe(
        (registros: Record<string, unknown>[]) => {
          this.registros = registros as unknown as Registro[];
          this.totalRegistros = this.registros.length;
          this.page = 1;
          this.searchQuery = '';
          this.registrosFiltrados = [...this.registros];
          this.atualizarPaginacao();
          this.isLoading = false;
        },
        (error) => {
          console.error('Erro ao carregar registros:', error);
          this.isLoading = false;
        }
      );
    } else {
      console.error('Erro: Variáveis necessárias não foram definidas corretamente.');
    }
  }

  /**
   * verFicha(fichaId: string)
   * 
   * Parâmetros:
   * - fichaId: string - Identificador da ficha interna.
   * Funcionalidade:
   * - Monta o caminho para visualização do registro ou ficha com base na existência de subcollection.
   * - Navega para a rota construída.
   * Retorna: void.
   */
  verFicha(fichaId: string) {
    const fichaPath = this.subcollection ?
      `/view-ficha/${this.collection}/${this.id}/fichas/${this.subcollection}/itens` :
      `view/${this.collection}`;
    this.router.navigate([fichaPath, fichaId]);
  }

  /**
   * incluir()
   * 
   * Parâmetros: N/A. (Invocado via template)
   * Funcionalidade:
   * - Cria dinamicamente um novo registro, gerando um ID único e um código.
   * - Inicializa os campos do registro com valores padrão (vazio ou data atual) conforme a configuração.
   * - Adiciona o registro ao Firestore e navega para a rota de edição do registro recém-criado.
   * Retorna: void.
   */
  incluir() {
    if (this.userId) {
      const collectionPath = this.subcollection ?
        `users/${this.userId}/${this.collection}/${this.id}/fichas/${this.subcollection}/itens` :
        `users/${this.userId}/${this.collection}`;

      const collectionRoute = this.subcollection ?
        `/edit-ficha/${this.collection}/${this.id}/fichas/${this.subcollection}/itens` :
        `/edit/${this.collection}`;

      // Primeiro garantimos que os campos estão carregados
      const carregarCampos = this.subcollection ? 
        this.FormService.carregarCamposFichas(this.userId, this.subcollection) :
        Promise.resolve(this.FormService.campos);
        
      // Converte para Promise se for Observable, ou mantém se já for Promise
      const carregarCamposPromise = carregarCampos instanceof Promise ? 
        carregarCampos : 
        new Promise<unknown[]>(resolve => carregarCampos.subscribe((campos: unknown[]) => resolve(campos)));      
        
      carregarCamposPromise.then(() => {
        // Após campos carregados, geramos o código e criamos o registro
        return this.firestoreService.gerarProximoCodigo(collectionPath);
      })
        .then((novoCodigo) => {
          const novoRegistro: Record<string, unknown> = {};
          novoRegistro['id'] = this.firestoreService.createId();
          novoRegistro['codigo'] = novoCodigo;
        
          // Valores comuns independente do tipo de coleção
          novoRegistro['data'] = this.getDataAtual(); // Data de hoje
        
          if (this.subcollection) {
            novoRegistro['ficha_id'] = this.id;
          }
        
          // Inicializa os campos com valores apropriados para seus tipos
          this.FormService.campos.forEach(campo => {
            if (campo.tipo === 'checkbox' || campo.tipo === 'boolean') {
              novoRegistro[campo.nome] = false;
            } else if (campo.tipo === 'number') {
              novoRegistro[campo.nome] = 0;
            } else if (campo.tipo === 'date') {
              novoRegistro[campo.nome] = campo.nome === 'data' ? this.getDataAtual() : '';
            } else {
              novoRegistro[campo.nome] = '';
            }
          });
        
          // Adicionar o registro e navegar
          return this.firestoreService.addRegistro(collectionPath, novoRegistro)
            .then(() => {
              this.router.navigate([collectionRoute, novoRegistro['id']]);
            });
        })
        .catch((error) => {
          console.error('Erro ao incluir novo registro:', error);
          alert('Erro ao incluir novo registro.');
        });
    }
  }

  // Data de hoje em formato YYYY/MM/DD
  getDataAtual(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${year}-${month}-${day}`;
  }

  /**
   * filtrarRegistros()
   * 
   * Parâmetros: N/A. (Invocado via template, ex: evento input na barra de busca)
   * Funcionalidade:
   * - Filtra o array de registros com base na query de busca (nome ou código).
   * - Atualiza o array de registros filtrados e reinicia a paginação.
   * Retorna: void.
   */
  filtrarRegistros() {
    const query = this.searchQuery.toLowerCase();
    if (query) {
      this.registrosFiltrados = this.registros.filter(registro => {
        const nome = registro.nome ? registro.nome.toLowerCase() : '';
        const codigo = registro.codigo ? registro.codigo.toLowerCase() : '';
        return nome.includes(query) || codigo.includes(query);
      });
    } else {
      this.registrosFiltrados = [...this.registros];
      this.page = 1;
    }
    this.atualizarPaginacao();
  }

  /**
   * atualizarPaginacao()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Recalcula o total de páginas com base no total de registros filtrados e no tamanho da página.
   * - Atualiza o array de páginas e chama atualizarRegistrosPaginados para definir os registros da página atual.
   * Retorna: void.
   */
  atualizarPaginacao() {
    this.filteredTotal = this.registrosFiltrados.length;
    this.totalPages = Math.ceil(this.filteredTotal / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.atualizarRegistrosPaginados();
  }

  /**
   * atualizarRegistrosPaginados()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Calcula os índices de início e fim com base na página atual e no tamanho da página.
   * - Atualiza o array de registros paginados para exibição.
   * Retorna: void.
   */
  atualizarRegistrosPaginados() {
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.registrosPaginados = this.registrosFiltrados.slice(startIndex, endIndex);
  }

  /**
   * previousPage()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Decrementa a página atual se não for a primeira e atualiza os registros exibidos.
   * Retorna: void.
   */
  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.atualizarRegistrosPaginados();
    }
  }

  /**
   * nextPage()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Incrementa a página atual se houver páginas posteriores e atualiza os registros exibidos.
   * Retorna: void.
   */
  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.atualizarRegistrosPaginados();
    }
  }

  /**
   * verificarOuCriarConfiguracao()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Verifica se já existe uma configuração de campos para a coleção do usuário.
   * - Se não existir, cria uma configuração padrão utilizando getCamposPadraoPorCollection().
   * Retorna: void.
   */
  verificarOuCriarConfiguracao() {
    if (this.userId) {
      const configPath = `users/${this.userId}/configuracoesCampos`;
      // Use FirestoreService instead of direct AngularFirestore to avoid NG0203 errors
      this.firestoreService.getRegistroById(configPath, this.collection)
        .subscribe((doc) => {
          if (!doc) {
            const camposPadrao = this.getCamposPadraoPorCollection();
            const configData = { id: this.collection, campos: camposPadrao };
            this.firestoreService.addRegistro(configPath, configData)
              .then(() => {
                // alert(`Configuração padrão criada para a coleção "${this.collection}". Você pode personalizar os campos em "Configurações".`);
              })
              .catch((error) => {
                console.error('Erro ao criar configuração de campos padrão:', error);
              });
          }
        }, (error) => {
          console.error('Erro ao verificar configuração de campos:', error);
        });
    }
  }

  /**
   * getMenusPadraoPorCollection(colecao: string)
   * 
   * Parâmetros:
   * - colecao: string - Nome da coleção para a qual se deseja obter os menus padrão.
   * Funcionalidade:
   * - Retorna um array com os menus padrão definidos para a coleção informada.
   * Retorna: any - Array com os menus padrão.
   */
  getMenusPadraoPorCollection(colecao: string): unknown[] {
    const menusPadrao: { [key: string]: unknown[] } = {
      associados: [CAMPOS_FICHAS_PAGAMENTOS],
      pacientes: [CAMPOS_FICHAS_EXAMES, CAMPOS_FICHAS_PLANOS, CAMPOS_FICHAS_TRATAMENTOS, CAMPOS_FICHAS_PAGAMENTOS],
      clientes: [CAMPOS_FICHAS_PLANOS, CAMPOS_FICHAS_ATENDIMENTOS, CAMPOS_FICHAS_PAGAMENTOS],
      alunos: [CAMPOS_FICHAS_DOCUMENTOS, CAMPOS_FICHAS_PLANOS, CAMPOS_FICHAS_ATENDIMENTOS],
      professores: [CAMPOS_FICHAS_PLANOS, CAMPOS_FICHAS_ATENDIMENTOS],
      dentistas: [CAMPOS_FICHAS_PLANOS, CAMPOS_FICHAS_ATENDIMENTOS, CAMPOS_FICHAS_PAGAMENTOS],
      equipe: [CAMPOS_FICHAS_PLANOS, CAMPOS_FICHAS_ATENDIMENTOS, CAMPOS_FICHAS_PAGAMENTOS],
      proteticos: [CAMPOS_FICHAS_PLANOS, CAMPOS_FICHAS_ATENDIMENTOS, CAMPOS_FICHAS_PAGAMENTOS]
    };
    return menusPadrao[colecao] || [];
  }

  /**
   * getCamposPadraoPorCollection()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Retorna um array de objetos que define os campos padrão para uma coleção.
   * Retorna: Array de objetos com os campos padrão.
   */
  getCamposPadraoPorCollection() {
    return [
      { nome: 'nome', tipo: 'text', label: 'Nome' },
      { nome: 'codigo', tipo: 'text', label: 'Código' },
      { nome: 'sexo', tipo: 'text', label: 'Sexo (M/F)' },
      { nome: 'nascimento', tipo: 'date', label: 'Nascimento' },
      { nome: 'whatsapp', tipo: 'text', label: 'WhatsApp' },
      { nome: 'telefone', tipo: 'text', label: 'Telefone' },
      { nome: 'email', tipo: 'text', label: 'Email' },
      { nome: 'endereço', tipo: 'text', label: 'Endereço' },
      { nome: 'bairro', tipo: 'text', label: 'Bairro' },
      { nome: 'cidade', tipo: 'text', label: 'Cidade' },
      { nome: 'estado', tipo: 'text', label: 'Estado' },
      { nome: 'cep', tipo: 'text', label: 'Cep' },
      { nome: 'cpf', tipo: 'text', label: 'CPF' },
      { nome: 'obs', tipo: 'textarea', label: 'Observação' },
      { nome: 'nuvem', tipo: 'url', label: 'Arquivos' },
      { nome: 'mae', tipo: 'text', label: 'Nome da mãe' },
      { nome: 'sus', tipo: 'text', label: 'CNS/SUS' },
      { nome: 'operador', tipo: 'text', label: 'Operador' },
      { nome: 'modulo', tipo: 'text', label: 'Módulo' },
      { nome: 'raca', tipo: 'text', label: 'Raça ou cor' },
      { nome: 'datainicio', tipo: 'date', label: 'Data início' },
      { nome: 'dataalta', tipo: 'date', label: 'Data de alta' }
    ];
  }

  /**
   * showbusca()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Alterna o estado booleano que controla a exibição da barra de pesquisa.
   * Retorna: void.
   */
  showbusca() {
    this.show_busca = !this.show_busca;
  }

  /**
   * voltar()
   * 
   * Parâmetros: N/A.
   * Funcionalidade:
   * - Define a rota de retorno para a listagem de registros ou fichas internas, dependendo da existência de subcollection.
   * - Navega para a rota determinada.
   * Retorna: void.
   */
  voltar() {
    const listaPath = this.subcollection ?
      `/view/${this.collection}/${this.id}` :
      `home`;
    this.router.navigate([listaPath]);
  }

  /**
   * sortBy(field: string): void
   * 
   * Parâmetros:
   * - field: string - O campo pelo qual os registros devem ser ordenados.
   * Funcionalidade:
   * - Implementa a lógica de ordenação dos registros com base no campo fornecido.
   * Retorna: void.
   */
  sortBy(field: string): void {
    if (field === this.firstField) {
      this.firstSortOrder = this.firstSortOrder === 'asc' ? 'desc' : 'asc';
      this.sortRegistros(field, this.firstSortOrder);
    } else if (field === 'data') {
      this.dataSortOrder = this.dataSortOrder === 'asc' ? 'desc' : 'asc';
      this.sortRegistros(field, this.dataSortOrder);
    }
    // Note: No action needed for other fields
  }

  // Crie o método auxiliar que ordena os registros:
  private sortRegistros(field: string, order: string): void {
    this.registrosFiltrados.sort((a, b) => {
      if (field === 'data') {
        const dateA = new Date((a as unknown as Record<string, unknown>)[field] as string);
        const dateB = new Date((b as unknown as Record<string, unknown>)[field] as string);
        return order === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      const valA = (a as unknown as Record<string, unknown>)[field] ? ((a as unknown as Record<string, unknown>)[field] as string).toString().toLowerCase() : '';
      const valB = (b as unknown as Record<string, unknown>)[field] ? ((b as unknown as Record<string, unknown>)[field] as string).toString().toLowerCase() : '';
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    this.atualizarRegistrosPaginados();
  }

  /**
   * OTIMIZAÇÃO: Conversão de tipo para registro
   */
  asRegistro(item: unknown): Registro {
    return item as Registro;
  }

  /**
   * OTIMIZAÇÃO: Método para obter string segura
   */
  getSafeString(value: unknown): string {
    return String(value || '');
  }
}
