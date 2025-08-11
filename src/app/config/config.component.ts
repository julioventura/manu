
// ------------------- IMPORTS -------------------
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { NavegacaoService } from '../shared/services/navegacao.service';
import { ConfigService } from '../shared/services/config.service';
import { UtilService } from '../shared/utils/util.service';
import { SubcolecaoService } from '../shared/services/subcolecao.service';
import { UserService, UserProfile } from '../shared/services/user.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { map, finalize } from 'rxjs/operators';

// ------------------- INTERFACES -------------------
interface HomepageConfigData {
  nomeProfissional?: string;
  tituloProfissional?: string;
  especialidadePrincipal?: string;
  fotoPessoal?: string;
  imagemCapa?: string;
  whatsapp?: string;
  telefones?: string;
  email?: string;
  site?: string;
}
interface SubcolecaoItem {
  nome: string;
  selecionado: boolean;
}
interface ConfigMenuData {
  subcolecoes?: string[];
}
interface ChatbotConfigData {
  webhookProd?: string;
  webhookTest?: string;
  nome?: string;
  saudacaoNovo?: string;
  saudacaoRetorno?: string;
  instrucoesGerais?: string;
  temaPrincipal?: string;
  temasPermitidos?: string;
  acaoNaoSabe?: string;
  prazoRetorno?: string;
  estiloLista?: string;
  maxItensLista?: number;
  rodape?: string;
  anexos?: { nome: string; url: string }[];
}

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatIconModule
  ]
})
export class ConfigComponent implements OnInit {

  // --------- HOMEPAGE ---------
  homepageForm!: FormGroup;
  homepageLoading = false;

  // --------- CHATBOT ---------
  chatbotForm!: FormGroup;
  loading = false;
  chatbotConfig = {
    anexos: [] as { nome: string; url: string }[],
    anexosSelecionados: [] as File[],
  };

  // --------- OUTROS ---------
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
  subcolecoesDisponiveis: SubcolecaoItem[] = [];
  selectedTab: 'chatbot' | 'homepage' | 'preferencias' | 'backup' = 'chatbot';
  backupStatus: string = '';
  isAdmin$: import('rxjs').Observable<boolean>;

  constructor(
    private router: Router,
    public util: UtilService,
    public configuracoes: ConfigService,
    private navegacaoService: NavegacaoService,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private subcolecaoService: SubcolecaoService,
    public fb: FormBuilder,
    public userService: UserService
  ) {
    // Observable que indica se o usuário é admin
    this.isAdmin$ = this.userService.getCurrentUserProfile().pipe(
      map((user: UserProfile | null) => this.userService.isAdmin(user && user.email ? user.email : null))
    );
  }

  ngOnInit(): void {
    this.ambiente = this.configuracoes.ambiente;
    this.carregarSubcolecoesDisponiveis();
    this.initChatbotForm();
    this.initHomepageForm();
    
    // Aguardar um momento para o Firestore estar completamente inicializado
    setTimeout(() => {
      this.carregarChatbotConfig();
      this.carregarHomepageConfig();
    }, 100);
  }

  /**
   * Realiza o backup completo de todas as coleções principais do Firestore e faz download do JSON
   * Disponível apenas para administradores
   */
  async backupTotal() {
    this.backupStatus = 'Preparando backup total...';
    try {
      const firestore = this.firestore.firestore;
      const resultado: Record<string, unknown> = {};

      // Coleções a serem incluídas no backup total (top-level)
      const colecoesTopLevel = [
        'config',
        'configuracoesCampos',
        'configuracoesFichas',
        'menuConfiguracoes',
        'public_chats',
        'usuarios'
      ];

      for (const col of colecoesTopLevel) {
        const snap = await firestore.collection(col).get();
        resultado[col] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      // Processar a coleção 'users' e suas subcoleções
      const usersSnap = await firestore.collection('users').get();
      const usersData: Record<string, unknown>[] = [];
      const userSubCollections = [
        'config', 'configuracoesCampos', 'settings', 'pacientes', 'alunos',
        'equipe', 'associados', 'fornecedores', 'empresas', 'proteticos', 'homepage'
      ];

      for (const userDoc of usersSnap.docs) {
        const userData: Record<string, unknown> = { id: userDoc.id, ...userDoc.data() };

        for (const subCol of userSubCollections) {
          const subColPath = `users/${userDoc.id}/${subCol}`;
          const subColSnap = await firestore.collection(subColPath).get();

          if (!subColSnap.empty) {
            if (subCol === 'pacientes') {
              const pacientesData: Record<string, unknown>[] = [];
              const pacienteSubCollections = ['fichas', 'exames', 'documentos', 'financeiro', 'orcamentos', 'pagamentos', 'recebimentos', 'sessoes'];

              for (const pacienteDoc of subColSnap.docs) {
                const pacienteData: Record<string, unknown> = { id: pacienteDoc.id, ...pacienteDoc.data() };
                for (const pacienteSubCol of pacienteSubCollections) {
                  const pacienteSubColPath = `${subColPath}/${pacienteDoc.id}/${pacienteSubCol}`;
                  const pacienteSubColSnap = await firestore.collection(pacienteSubColPath).get();
                  if (!pacienteSubColSnap.empty) {
                    pacienteData[pacienteSubCol] = pacienteSubColSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                  }
                }
                pacientesData.push(pacienteData);
              }
              userData[subCol] = pacientesData;
            } else {
              userData[subCol] = subColSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            }
          }
        }
        usersData.push(userData);
      }
      resultado['users'] = usersData;

      // Download do arquivo
      const jsonStr = JSON.stringify(resultado, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_total_firestore_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.backupStatus = 'Backup total realizado com sucesso!';
    } catch (err: unknown) {
      const msg = (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message : String(err);
      this.backupStatus = 'Erro ao gerar backup total: ' + msg;
    }
  }

  /**
   * Realiza o backup completo dos dados do usuário logado e faz download do JSON
   */
  async backupUsuario() {
    this.backupStatus = 'Preparando backup...';
    try {
      // 1. Obter usuário logado
      const user = await this.userService.afAuth.currentUser;
      if (!user) {
        this.backupStatus = 'Usuário não autenticado!';
        return;
      }
      const uid = user.uid;
      const email = user.email || 'sem-email';

      // 2. Buscar dados principais
      const firestore = this.firestore.firestore;
      // Helper para buscar coleção
      const getCollection = async (path: string) => {
        const snap = await firestore.collection(path).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      };
      // Helper para buscar documento
      const getDoc = async (path: string) => {
        const doc = await firestore.doc(path).get();
        return doc && doc.exists ? { id: doc.id, ...doc.data() } : null;
      };

      // users/{uid}
      const userProfile = await getDoc(`users/${uid}`);
      // usuarios/dentistascombr/users/{email}
      const usuarioEmail = await getDoc(`usuarios/dentistascombr/users/${email}`);
      // users/{uid}/configuracoesCampos
      const configuracoesCampos = await getCollection(`users/${uid}/configuracoesCampos`);
      // users/{uid}/settings
      const settings = await getCollection(`users/${uid}/settings`);
      // users/{uid}/pacientes
      const pacientes = await getCollection(`users/${uid}/pacientes`);
      // users/{uid}/alunos
      const alunos = await getCollection(`users/${uid}/alunos`);
      // users/{uid}/equipe
      const equipe = await getCollection(`users/${uid}/equipe`);
      // users/{uid}/associados
      const associados = await getCollection(`users/${uid}/associados`);
      // users/{uid}/fornecedores
      const fornecedores = await getCollection(`users/${uid}/fornecedores`);
      // users/{uid}/empresas
      const empresas = await getCollection(`users/${uid}/empresas`);
      // users/{uid}/proteticos
      const proteticos = await getCollection(`users/${uid}/proteticos`);
      // users/{uid}/homepage
      const homepage = await getCollection(`users/${uid}/homepage`);
      // users/{uid}/config
      const config = await getCollection(`users/${uid}/config`);

      // 3. Montar objeto JSON
      const backup = {
        uid,
        email,
        userProfile,
        usuarioEmail,
        configuracoesCampos,
        settings,
        pacientes,
        alunos,
        equipe,
        associados,
        fornecedores,
        empresas,
        proteticos,
        homepage,
        config
      };

      // 4. Download do arquivo
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${uid}===${email}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.backupStatus = 'Backup realizado com sucesso!';
    } catch (err: unknown) {
      const msg = (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message : String(err);
      this.backupStatus = 'Erro ao gerar backup: ' + msg;
    }
  }

  // --------- HOMEPAGE ---------
  initHomepageForm() {
    this.homepageForm = this.fb.group({
      nomeProfissional: [''],
      tituloProfissional: [''],
      especialidadePrincipal: [''],
      fotoPessoal: [''],
      imagemCapa: [''],
      whatsapp: [''],
      telefones: [''],
      email: [''],
      site: ['']
    });
  }

  carregarHomepageConfig() {
    this.homepageLoading = true;
    
    try {
      this.firestore.collection('homepage').doc('config').get().subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (doc: any) => {
          const data = doc.data() as HomepageConfigData;
          if (data) {
            this.homepageForm.patchValue({
              nomeProfissional: data.nomeProfissional || '',
              tituloProfissional: data.tituloProfissional || '',
              especialidadePrincipal: data.especialidadePrincipal || '',
              fotoPessoal: data.fotoPessoal || '',
              imagemCapa: data.imagemCapa || '',
              whatsapp: data.whatsapp || '',
              telefones: data.telefones || '',
              email: data.email || '',
              site: data.site || ''
            });
          }
          this.homepageLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar configurações da homepage:', error);
          this.homepageLoading = false;
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar carregamento da homepage:', error);
      this.homepageLoading = false;
    }
  }

  salvarHomepageConfig() {
    if (this.homepageForm.invalid) return;
    this.homepageLoading = true;
    const formValue = this.homepageForm.value;
    this.firestore.collection('homepage').doc('config').set(formValue).then(() => {
      this.homepageLoading = false;
      alert('Configurações da homepage salvas!');
    }).catch(() => {
      this.homepageLoading = false;
      alert('Erro ao salvar configurações da homepage!');
    });
  }

  // --------- CHATBOT ---------
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files: FileList | null = input.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.chatbotConfig.anexosSelecionados.push(files[i]);
      }
    }
  }

  removerAnexo(anexo: { nome: string; url: string }) {
    this.loading = true;
    this.storage.refFromURL(anexo.url).delete().subscribe({
      next: () => {
        this.chatbotConfig.anexos = this.chatbotConfig.anexos.filter(a => a.url !== anexo.url);
        this.loading = false;
        alert('Anexo removido. Clique em "Salvar" para persistir a alteração.');
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao remover anexo:', error);
        alert('Erro ao remover anexo. Se o erro persistir, salve as configurações para remover o anexo da lista.');
        if (error.code === 'storage/object-not-found') {
          this.chatbotConfig.anexos = this.chatbotConfig.anexos.filter(a => a.url !== anexo.url);
        }
      }
    });
  }

  initChatbotForm() {
    this.chatbotForm = this.fb.group({
      webhookProd: ['', [Validators.required, Validators.pattern('https?://.+')]],
      webhookTest: ['', [Validators.required, Validators.pattern('https?://.+')]],
      nome: ['', Validators.required],
      saudacaoNovo: ['', Validators.required],
      saudacaoRetorno: ['', Validators.required],
      instrucoesGerais: [''],
      temaPrincipal: [''],
      temasPermitidos: [''],
      acaoNaoSabeGroup: this.fb.group({
        acaoNaoSabe: ['humano', Validators.required]
      }),
      prazoRetorno: [''],
      estiloListaGroup: this.fb.group({
        estiloLista: ['numerada', Validators.required]
      }),
      maxItensLista: [10, [Validators.min(1), Validators.max(50)]],
      rodape: ['']
    });
  }

  carregarChatbotConfig() {
    this.loading = true;
    
    try {
      this.firestore.collection('configuracoes').doc('chatbot').get().subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (doc: any) => {
          const data = doc.data() as ChatbotConfigData;
          if (data) {
            this.chatbotForm.patchValue({
              webhookProd: data['webhookProd'] || '',
              webhookTest: data['webhookTest'] || '',
              nome: data['nome'] || '',
              saudacaoNovo: data['saudacaoNovo'] || '',
              saudacaoRetorno: data['saudacaoRetorno'] || '',
              instrucoesGerais: data['instrucoesGerais'] || '',
              temaPrincipal: data['temaPrincipal'] || '',
              temasPermitidos: data['temasPermitidos'] || '',
              acaoNaoSabeGroup: { acaoNaoSabe: data['acaoNaoSabe'] || 'humano' },
              prazoRetorno: data['prazoRetorno'] || '',
              estiloListaGroup: { estiloLista: data['estiloLista'] || 'numerada' },
              maxItensLista: data['maxItensLista'] || 10,
              rodape: data['rodape'] || ''
            });
            this.chatbotConfig.anexos = data['anexos'] || [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar configurações do chatbot:', error);
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar carregamento do chatbot:', error);
      this.loading = false;
    }
  }

  async salvarChatbotConfig() {
    if (this.chatbotForm.invalid) {
      alert('Por favor, preencha todos os campos obrigatórios do formulário.');
      return;
    }
    this.loading = true;

    try {
      // 1. Fazer upload de novos anexos, se houver
      if (this.chatbotConfig.anexosSelecionados.length > 0) {
        const uploadPromises = this.chatbotConfig.anexosSelecionados.map(file => {
          const path = `chatbot-anexos/${new Date().getTime()}_${file.name}`;
          const ref = this.storage.ref(path);
          const task = this.storage.upload(path, file);

          return new Promise<void>((resolve, reject) => {
            task.snapshotChanges().pipe(
              finalize(() => {
                ref.getDownloadURL().subscribe(url => {
                  if (!this.chatbotConfig.anexos) {
                    this.chatbotConfig.anexos = [];
                  }
                  this.chatbotConfig.anexos.push({ nome: file.name, url: url });
                  resolve();
                }, error => reject(error));
              })
            ).subscribe();
          });
        });
        await Promise.all(uploadPromises);
        this.chatbotConfig.anexosSelecionados = []; // Limpar após o upload
      }

      // 2. Preparar os dados para salvar
      const formValue = this.chatbotForm.value;
      const configToSave: ChatbotConfigData = {
        webhookProd: formValue.webhookProd,
        webhookTest: formValue.webhookTest,
        nome: formValue.nome,
        saudacaoNovo: formValue.saudacaoNovo,
        saudacaoRetorno: formValue.saudacaoRetorno,
        instrucoesGerais: formValue.instrucoesGerais,
        temaPrincipal: formValue.temaPrincipal,
        temasPermitidos: formValue.temasPermitidos,
        acaoNaoSabe: formValue.acaoNaoSabeGroup.acaoNaoSabe,
        prazoRetorno: formValue.prazoRetorno,
        estiloLista: formValue.estiloListaGroup.estiloLista,
        maxItensLista: formValue.maxItensLista,
        rodape: formValue.rodape,
        anexos: this.chatbotConfig.anexos || []
      };

      // 3. Salvar no Firestore
      await this.firestore.collection('configuracoes').doc('chatbot').set(configToSave);

      this.loading = false;
      alert('Configurações do chatbot salvas com sucesso!');

    } catch (error) {
      this.loading = false;
      console.error('Erro ao salvar configurações do chatbot:', error);
      const msg = (typeof error === 'object' && error && 'message' in error) ? (error as { message: string }).message : String(error);
      alert('Erro ao salvar configurações: ' + msg);
    }
  }

  // --------- OUTROS MÉTODOS ---------
  carregarSubcolecoesDisponiveis(): void {
    this.subcolecoesDisponiveis = this.subcolecaoService.getSubcolecoesDisponiveis().map(sub => ({
      nome: sub.nome,
      selecionado: sub.nome === 'exames' ? true : false
    }));
  }

  selecionarColecao(colecao: string): void {
    this.colecaoSelecionada = this.colecaoSelecionada === colecao ? '' : colecao;
    this.carregarConfiguracoes();
  }

  go(route: string): void {
    this.router.navigate(['/' + route]);
  }

  carregarConfiguracoes(): void {
    if (this.colecaoSelecionada) {
      try {
        this.firestore.collection('configuracoesMenu').doc(this.colecaoSelecionada).get().subscribe({
          next: (doc) => {
            const dados = doc.data() as ConfigMenuData;
            if (dados?.subcolecoes) {
              this.subcolecoesDisponiveis = this.subcolecoesDisponiveis.map(sub => ({
                ...sub,
                selecionado: dados.subcolecoes?.includes(sub.nome) || false
              }));
            }
          },
          error: (error) => {
            console.error('Erro ao carregar configurações do menu:', error);
          }
        });
      } catch (error) {
        console.error('Erro ao inicializar carregamento das configurações:', error);
      }
    }
  }

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
