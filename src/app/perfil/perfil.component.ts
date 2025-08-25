// CORRIGIR: src/app/perfil/perfil.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService, UserProfile } from '../shared/services/user.service';
import { UtilService } from '../shared/utils/util.service';
import { FirestoreService } from '../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { getProfileFormConfig, getGroupedProfileFields, ProfileField } from './profile-fields.constants';
import { finalize } from 'rxjs/operators';
import { from } from 'rxjs';
import { CanComponentDeactivate } from '../shared/guards/can-deactivate.guard';
import { CommonModule } from '@angular/common';

// MANTER: Interfaces locais para estruturas específicas
interface Horario {
  dia: string;
  horario: string;
  endereco?: string; // Novo campo para associar ao endereço
}

interface Endereco {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
}

interface Convenio {
  nomeConvenio: string;
}

// ADICIONAR: Interface para evento de campo
interface FieldChangeEvent {
  field: string;
  value: unknown;
}

// CORRIGIDO: Interface estendida com compatibilidade correta
interface FirestoreUserProfile extends Omit<UserProfile, 'horarios' | 'enderecos' | 'convenios' | 'nome_capa' | 'titulo_profissional' | 'especialidade_principal' | 'foto' | 'fotoCapa'> {
  id?: string; // Para compatibilidade com Firestore
  username?: string; // Adicionado para corrigir erro de tipagem
  horarios?: Horario[] | string | UserProfile['horarios']; // CORRIGIDO: compatível com UserProfile
  enderecos?: Endereco[] | string;
  convenios?: Convenio[] | string | string[];
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class PerfilComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  profileForm: FormGroup;
  // CORRIGIDO: Inicializar com null em vez de objeto vazio
  userProfileData: FirestoreUserProfile | null = null;
  isLoading = true;
  errorMessage = '';
  userEmail: string | null = null;
  isEditing: boolean = false;
  isSaving = false;
  usernameError = '';
  originalUsername = '';

  // Add reference to grouped fields for the template
  groupedFields: { [key: string]: ProfileField[] };

  horarios: Horario[] = [];
  novoDia: string = '';
  novoHorario: string = '';
  novoEnderecoSelecionado: string = ''; // Novo campo para selecionar endereço
  nomeConvenio: string = '';

  // Arrays para gerenciar os endereços
  enderecos: Endereco[] = [];
  novoEndereco: Endereco = {
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: ''
  };

  convenios: Convenio[] = [];
  novoConvenio: Convenio = {
    nomeConvenio: ''
  };

  // Armazena a referência para o handler do beforeunload
  private boundBeforeUnloadHandler!: (event: BeforeUnloadEvent) => void;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public util: UtilService,
    private firestoreService: FirestoreService<FirestoreUserProfile>,
    private auth: AngularFireAuth,
    private router: Router
  ) {
    this.isEditing = false;
    this.profileForm = this.fb.group(getProfileFormConfig());
    this.profileForm.disable(); // Inicialmente desabilitado (modo visualização)
    
    // CORRIGIR: Inicializar groupedFields no constructor
    this.groupedFields = getGroupedProfileFields();
  }

  ngOnInit(): void {
    // Garantir que a página inicie no topo
    window.scrollTo(0, 0);
    
    // Verificar usuário autenticado com múltiplas estratégias
    this.loadUserWithStrategies();

    // Se desejar também prevenir o fechamento/reload da página com alterações não salvas:
    this.boundBeforeUnloadHandler = this.beforeUnloadHandler.bind(this);
    window.addEventListener('beforeunload', this.boundBeforeUnloadHandler);
  }

  private async loadUserWithStrategies(): Promise<void> {
    let userLoaded = false;
    
    // Estratégia 1: currentUser (mais rápida)
    try {
      const currentUser = await this.auth.currentUser;
      if (currentUser && currentUser.email && !userLoaded) {
        console.log('Strategy 1: currentUser success');
        this.userEmail = currentUser.email;
        this.loadUserProfile();
        userLoaded = true;
        return;
      }
    } catch (error) {
      console.warn('Strategy 1 failed:', error);
    }

    // Estratégia 2: authState observable com timeout
    if (!userLoaded) {
      const authStatePromise = new Promise<void>((resolve, reject) => {
        const subscription = this.auth.authState.subscribe({
          next: (user) => {
            if (user && user.email && !userLoaded) {
              console.log('Strategy 2: authState success');
              this.userEmail = user.email;
              this.loadUserProfile();
              userLoaded = true;
              subscription.unsubscribe();
              resolve();
            } else if (!user) {
              subscription.unsubscribe();
              reject(new Error('No user authenticated'));
            }
          },
          error: (error) => {
            subscription.unsubscribe();
            reject(error);
          }
        });

        // Timeout de 3 segundos para authState
        setTimeout(() => {
          if (!userLoaded) {
            subscription.unsubscribe();
            reject(new Error('AuthState timeout'));
          }
        }, 3000);
      });

      try {
        await authStatePromise;
        return;
      } catch (error) {
        console.warn('Strategy 2 failed:', error);
      }
    }

    // Estratégia 3: Última tentativa - aguardar mais tempo
    if (!userLoaded) {
      console.log('Strategy 3: extended wait');
      setTimeout(() => {
        this.auth.currentUser.then(user => {
          if (user && user.email) {
            this.userEmail = user.email;
            this.loadUserProfile();
          } else {
            this.errorMessage = 'Usuário não autenticado. Redirecionando...';
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/login']), 2000);
          }
        });
      }, 1000);
    }
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (!this.userEmail) {
      console.error('Cannot load profile: userEmail is not set');
      this.errorMessage = 'Email do usuário não encontrado';
      this.isLoading = false;
      return;
    }

    // Salvar email para uso futuro
    localStorage.setItem('userEmail', this.userEmail);
    
    console.log('Loading profile for:', this.userEmail);

    // Timeout reduzido para 5 segundos
    const loadTimeout = setTimeout(() => {
      console.warn('Profile loading timeout after 5 seconds');
      this.errorMessage = 'Tempo limite para carregar perfil. Verifique sua conexão.';
      this.isLoading = false;
    }, 5000);

    this.firestoreService.getRegistroById('usuarios/dentistascombr/users', this.userEmail).subscribe({
      next: (userData: FirestoreUserProfile | undefined) => {
        clearTimeout(loadTimeout);
        console.log('Profile data received:', userData);
        
        if (userData) {
          this.userProfileData = userData;
          this.originalUsername = userData.username || '';

          // Atualizar cache com timestamp
          const cacheData = {
            ...userData,
            _cached: true,
            _timestamp: Date.now()
          };
          localStorage.setItem('userData', JSON.stringify(cacheData));
          
          this.updateFormWithProfileData();
        } else {
          console.log('No existing profile found, creating new one');
          this.userProfileData = {
            id: this.userEmail || '',
            uid: this.userEmail || '',
            email: this.userEmail || '',
            createdAt: new Date(),
            updatedAt: new Date()
          } as FirestoreUserProfile;
          this.updateFormWithProfileData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        clearTimeout(loadTimeout);
        console.error('Error loading profile from Firestore:', error);
        this.errorMessage = 'Erro ao carregar perfil do servidor. Verifique sua conexão e tente novamente.';
        this.isLoading = false;
      }
    });
  }

  updateFormWithProfileData(): void {
    // CORRIGIDO: Verificação se userProfileData não é null
    if (!this.userProfileData) {
      console.warn('userProfileData is null, cannot update form');
      return;
    }

    // Resetar valores antes de preencher
    this.profileForm.reset();

    // CORRIGIDO: Preencher com os dados do perfil (linha 159 corrigida)
    const formValues = Object.keys(this.profileForm.controls)
      .reduce((acc, key) => {
        // CORRIGIDO: Verificação adicional de null safety
        if (!this.userProfileData) {
          acc[key] = key === 'email' ? (this.userEmail || '') : '';
          return acc;
        }

        const value = this.userProfileData[key as keyof FirestoreUserProfile];
        
        // CORRIGIDO: Garantir que sempre retorna string
        if (value !== undefined && value !== null) {
          if (typeof value === 'string') {
            acc[key] = value;
          } else if (typeof value === 'number') {
            acc[key] = String(value);
          } else if (value instanceof Date) {
            acc[key] = value.toISOString();
          } else if (typeof value === 'boolean') {
            acc[key] = String(value);
          } else {
            // Para objetos complexos, converter para string vazia
            acc[key] = '';
          }
        } else {
          // Valor é null ou undefined
          acc[key] = key === 'email' ? (this.userEmail || '') : '';
        }
        
        return acc;
      }, {} as Record<string, string>);

    this.profileForm.patchValue(formValues);

    // Carregar horários se existirem
    if (this.userProfileData.horarios && Array.isArray(this.userProfileData.horarios)) {
      this.horarios = [...this.userProfileData.horarios];
    } else if (typeof this.userProfileData.horarios === 'string') {
      try {
        this.horarios = JSON.parse(this.userProfileData.horarios);
      } catch (e) {
        console.error('Erro ao converter horários:', e);
        this.horarios = [];
      }
    } else {
      this.horarios = [];
    }

    // CORRIGIDO: Usar acesso com colchetes (linha 244-245)
    if (!this.userProfileData['email'] && this.userEmail) {
      this.userProfileData['email'] = this.userEmail;
    }

    // Carregar endereços se existirem
    if (this.userProfileData.enderecos && Array.isArray(this.userProfileData.enderecos)) {
      this.enderecos = [...this.userProfileData.enderecos];
    } 
    else if (typeof this.userProfileData.enderecos === 'string') {
      try {
        this.enderecos = JSON.parse(this.userProfileData.enderecos);
      } catch (e) {
        console.error('Erro ao converter endereços:', e);
        this.enderecos = [];
      }
    } else {
      this.enderecos = [];
    }

    // CORRIGIDO: Carregar convenios com tipagem correta
    if (this.userProfileData.convenios) {
      if (Array.isArray(this.userProfileData.convenios)) {
        // Se já é array de Convenio, usar diretamente
        if (this.userProfileData.convenios.length > 0) {
          const firstItem = this.userProfileData.convenios[0];
          if (typeof firstItem === 'object' && firstItem !== null && 'nomeConvenio' in firstItem) {
            // Array de objetos Convenio
            this.convenios = [...this.userProfileData.convenios as Convenio[]];
          } else if (typeof firstItem === 'string') {
            // CORRIGIDO: Array de strings, converter para Convenio[]
            this.convenios = (this.userProfileData.convenios as string[]).map((nome: string) => ({
              nomeConvenio: nome
            }));
          } else {
            this.convenios = [];
          }
        } else {
          this.convenios = [];
        }
      } else if (typeof this.userProfileData.convenios === 'string') {
        try {
          const parsed = JSON.parse(this.userProfileData.convenios);
          if (Array.isArray(parsed)) {
            if (parsed.length > 0 && typeof parsed[0] === 'string') {
              // Array de strings
              this.convenios = parsed.map((nome: string) => ({
                nomeConvenio: nome
              }));
            } else {
              // Array de objetos Convenio
              this.convenios = parsed;
            }
          } else {
            this.convenios = [];
          }
        } catch (e) {
          console.error('Erro ao converter convenios:', e);
          this.convenios = [];
        }
      } else {
        this.convenios = [];
      }
    } else {
      this.convenios = [];
    }
  }

  editar(): void {
    this.isEditing = true;
    this.profileForm.enable(); // Habilita todos os campos para edição

    // Aplicar validadores ao entrar em modo de edição
    this.profileForm.get('nome')?.setValidators([Validators.required]);
    this.profileForm.get('username')?.setValidators([
      Validators.pattern('^[a-zA-Z0-9_.]+$'),
      Validators.minLength(3)
    ]);
    this.profileForm.get('email')?.setValidators([Validators.required, Validators.email]);

    // Atualizar os validadores
    this.profileForm.get('nome')?.updateValueAndValidity();
    this.profileForm.get('username')?.updateValueAndValidity();
    this.profileForm.get('email')?.updateValueAndValidity();

    // Desabilitar o campo email para garantir que não seja alterado
    this.profileForm.get('email')?.disable();
  }

  cancelEdit(): void {
    if (confirm('Deseja cancelar as alterações?')) {
      this.isEditing = false;
      this.loadUserProfile(); // Recarrega os dados originais
      this.profileForm.disable(); // Desabilita os campos
      this.usernameError = '';
    }
  }

  checkUsername(): void {
    const username = this.profileForm.get('username')?.value;

    if (!username) {
      this.usernameError = '';
      return;
    }

    // Não validar se for o mesmo username original
    if (username === this.originalUsername) {
      this.usernameError = '';
      return;
    }

    // Verifica padrão antes de consultar o Firestore
    const usernamePattern = /^[a-zA-Z0-9_.]+$/;
    if (!usernamePattern.test(username)) {
      this.usernameError = 'Username pode conter apenas letras, números, underscore e ponto.';
      return;
    }

    if (username.length < 3) {
      this.usernameError = 'Username deve ter pelo menos 3 caracteres.';
      return;
    }

    this.userService.isValidUsername(username).subscribe((exists: boolean) => {
      this.usernameError = exists ? 'Este username já está em uso.' : '';
    });
  }

  onFieldChanged(event: FieldChangeEvent): void {
    // Handle the field change
    console.log('Field changed:', event.field, 'Value:', event.value);
  }

  salvar(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    // CORRIGIDO: Verificação se userProfileData não é null
    if (!this.userProfileData) {
      console.error('Cannot save: userProfileData is null');
      this.isSaving = false;
      return;
    }

    // Garantir que os endereços estão sincronizados com o formulário antes de salvar
    const formValues = this.profileForm.getRawValue();

    // CORRIGIDO: Criar objeto compatível com UserProfile para o UserService
    const dataToSaveFirestore: FirestoreUserProfile = {
      id: this.userProfileData.id || this.userEmail || '',
      // CORRIGIDO: Usar acesso com colchetes (linhas 398-400)
      uid: this.userProfileData['uid'] || this.userEmail || '',
      email: this.userProfileData['email'] || this.userEmail || '',
      createdAt: this.userProfileData['createdAt'] || new Date(),
      updatedAt: new Date(),
      ...formValues,
      horarios: this.horarios,
      enderecos: this.enderecos,
      convenios: this.convenios
    };

    // Para o UserService, criar objeto compatível com UserProfile
    // CORRIGIDO: Converter horários para formato do UserProfile
    const horariosUserProfile: UserProfile['horarios'] = this.horarios.reduce((acc, horario) => {
      const dia = horario.dia.toLowerCase();
      if (['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].includes(dia)) {
        acc[dia as keyof NonNullable<UserProfile['horarios']>] = horario.horario;
      }
      return acc;
    }, {} as NonNullable<UserProfile['horarios']>);

    const dataToSaveUserService: UserProfile = {
      // CORRIGIDO: Usar acesso com colchetes (linhas 419-421)
      uid: this.userProfileData['uid'] || this.userEmail || '',
      email: this.userProfileData['email'] || this.userEmail || '',
      createdAt: this.userProfileData['createdAt'] || new Date(),
      updatedAt: new Date(),
      ...formValues,
      horarios: horariosUserProfile
    };

    // CORRIGIDO: Prosseguir com o salvamento (linha 428)
    const userId = this.userProfileData.id || this.userProfileData['uid'] || this.userEmail;

    if (!userId) {
      console.error('Cannot save: no user ID');
      this.isSaving = false;
      return;
    }

    // CORRIGIDO: Garantir que userId é string
    const userIdString = String(userId);

    from(this.firestoreService.updateRegistro('usuarios/dentistascombr/users', userIdString, dataToSaveFirestore))
      .pipe(finalize(() => {
        this.isSaving = false;
      }))
      .subscribe(() => {
        this.isEditing = false;
        // Atualizar dados locais
        this.userProfileData = { ...this.userProfileData, ...dataToSaveFirestore };

        // CORRIGIDO: Usar dados compatíveis com UserProfile
        this.userService.setUserProfile(dataToSaveUserService);

        // Desativar formulário após salvar
        this.profileForm.disable();
      }, error => {
        console.error('Erro ao salvar perfil:', error);
        this.errorMessage = 'Erro ao salvar as alterações. Por favor, tente novamente.';
      });
  }

  voltar(): void {
    if (!this.hasUnsavedChanges() || confirm('Existem alterações não salvas. Deseja realmente sair?')) {
      if (this.isEditing) {
        this.isEditing = false;
        this.loadUserProfile();
        this.profileForm.disable();
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  // Helper method for setting classes based on edit mode
  setClass(baseClass: string): string {
    return `${baseClass} ${this.isEditing ? 'edit-mode' : 'view-mode'}`;
  }

  // Helper method for displaying field values properly
  displayValue(field: ProfileField): string {
    const value = this.profileForm.get(field.controlName)?.value;
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return value;
  }

  // Helper method to check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  // Helper method to get error message for a field
  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo é obrigatório';
    }
    if (control.errors['email']) {
      return 'Email inválido';
    }
    if (control.errors['pattern']) {
      return 'Formato inválido';
    }
    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  // Handle field blur event for validation
  onFieldBlur(fieldName: string): void {
    if (fieldName === 'username') {
      this.checkUsername();
    }
  }

  // Handle field change event
  onFieldChange(event: Event, fieldName: string): void {
    this.onFieldChanged({ field: fieldName, value: (event.target as HTMLInputElement).value });
  }

  addHorario(): void {
    if (this.novoDia && this.novoHorario) {
      this.horarios.push({
        dia: this.novoDia.trim(),
        horario: this.novoHorario.trim(),
        endereco: this.novoEnderecoSelecionado || '' // Inclui o endereço selecionado
      });

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        horarios: this.horarios
      });

      // Limpa os campos
      this.novoDia = '';
      this.novoHorario = '';
      this.novoEnderecoSelecionado = '';
    }
  }

  removeHorario(index: number): void {
    if (index >= 0 && index < this.horarios.length) {
      this.horarios.splice(index, 1);

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        horarios: this.horarios
      });
    }
  }

  addEndereco(): void {
    // Validação básica - precisa ter pelo menos rua e cidade
    if (this.novoEndereco.rua) {
      // Adiciona uma cópia do endereço (não a referência)
      this.enderecos.push({ ...this.novoEndereco });

      // Limpa o formulário para o próximo endereço
      this.novoEndereco = {
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: ''
      };

      // Atualiza o valor no formulário principal
      this.profileForm.patchValue({
        enderecos: this.enderecos
      });
    }
  }

  removeEndereco(index: number): void {
    if (index >= 0 && index < this.enderecos.length) {
      this.enderecos.splice(index, 1);

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        enderecos: this.enderecos
      });
    }
  }

  addConvenio(): void {
    if (this.nomeConvenio) {
      this.convenios.push({
        nomeConvenio: this.nomeConvenio.trim(),
      });

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        convenios: this.convenios
      });

      // Limpa os campos
      this.nomeConvenio = '';
    }
  }

  removeConvenio(index: number): void {
    if (index >= 0 && index < this.convenios.length) {
      this.convenios.splice(index, 1);

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        convenios: this.convenios
      });
    }
  }

  // Método para recarregar o perfil em caso de erro
  reloadProfile(): void {
    this.errorMessage = '';
    this.isLoading = true;
    
    // Verificar se ainda temos usuário autenticado
    this.auth.currentUser.then(user => {
      if (user && user.email) {
        this.userEmail = user.email;
        this.loadUserProfile();
      } else {
        this.errorMessage = 'Usuário não está mais autenticado. Redirecionando...';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      }
    }).catch(() => {
      this.errorMessage = 'Erro de autenticação. Redirecionando para login...';
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/login']), 2000);
    });
  }

  // Método de emergência para forçar carregamento
  forceLoad(): void {
    console.log('Force loading profile...');
    this.isLoading = true;
    this.errorMessage = '';
    
    // Se temos email, forçar carregamento direto
    if (this.userEmail) {
      this.loadUserProfile();
      return;
    }
    
    // Última tentativa de recuperar o usuário autenticado
    this.auth.currentUser.then(user => {
      if (user && user.email) {
        this.userEmail = user.email;
        this.loadUserProfile();
      } else {
        this.errorMessage = 'Usuário não autenticado. Redirecionando para login...';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      }
    }).catch((error) => {
      console.error('Force load failed:', error);
      this.errorMessage = 'Falha na autenticação. Redirecionando para login...';
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/login']), 2000);
    });
  }

  // Método para identificar alterações não salvas
  private hasUnsavedChanges(): boolean {
    return this.isEditing;
  }
  
  // Método chamado pelo CanDeactivateGuard
  canDeactivate(): boolean {
    if (this.hasUnsavedChanges()) {
      return confirm('Existem alterações não salvas. Deseja realmente sair?');
    }
    return true;
  }
  
  // Opcional: trata o evento de beforeunload
  beforeUnloadHandler(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = 'Existem alterações não salvas!';
    }
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.boundBeforeUnloadHandler);
  }

  /**
   * Obtém a descrição de um endereço pelo índice ou rua
   */
  getEnderecoDescricao(endereco: string): string {
    if (!endereco) return '';
    
    // Busca pelo índice primeiro
    const index = parseInt(endereco);
    if (!isNaN(index) && this.enderecos[index]) {
      const end = this.enderecos[index];
      return `${end.rua}, ${end.bairro ? end.bairro + ', ' : ''}${end.cidade}/${end.estado}`;
    }
    
    // Se não for índice, busca pela rua
    const enderecoEncontrado = this.enderecos.find(end => end.rua === endereco);
    if (enderecoEncontrado) {
      return `${enderecoEncontrado.rua}, ${enderecoEncontrado.bairro ? enderecoEncontrado.bairro + ', ' : ''}${enderecoEncontrado.cidade}/${enderecoEncontrado.estado}`;
    }
    
    return endereco; // Retorna o valor original se não encontrar
  }
}