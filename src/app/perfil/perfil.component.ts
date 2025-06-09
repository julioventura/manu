// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { UtilService } from '../shared/utils/util.service';
import { FirestoreService } from '../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { getProfileFormConfig, getGroupedProfileFields, ProfileField } from './profile-fields.constants';
import { finalize } from 'rxjs/operators';
import { from } from 'rxjs';
import { CanComponentDeactivate } from '../shared/guards/can-deactivate.guard';

interface Horario {
  dia: string;
  horario: string;
}

// Em perfil.component.ts
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


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: false
})
export class PerfilComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  profileForm: FormGroup;
  userProfileData: any = {};
  isLoading = true;
  errorMessage = '';
  userEmail: string | null = null;
  isEditing: boolean = false;
  isSaving = false;
  usernameError = '';
  originalUsername = '';

  // Configuração de layout
  customLabelWidthValue: number = 100;
  customLabelWidth: string = `${this.customLabelWidthValue}px`;

  // Add reference to grouped fields for the template
  groupedFields: { [key: string]: ProfileField[] };

  horarios: Horario[] = [];
  novoDia: string = '';
  novoHorario: string = '';
  nomeConvenio: string = '';

  // Em perfil.component.ts - dentro da classe PerfilComponent
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

  // (Opcional) Armazena a referência para o handler do beforeunload
  private boundBeforeUnloadHandler!: (event: BeforeUnloadEvent) => void;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public util: UtilService,
    private firestoreService: FirestoreService<any>,
    private auth: AngularFireAuth,
    private router: Router
  ) {
    this.isEditing = false;
    this.profileForm = this.fb.group(getProfileFormConfig());
    this.profileForm.disable(); // Inicialmente desabilitado (modo visualização)
    this.groupedFields = getGroupedProfileFields();
  }

  ngOnInit() {
    this.auth.authState.subscribe(user => {
      if (user && user.email) {
        this.userEmail = user.email;
        this.loadUserProfile();
      } else {
        console.error('No authenticated user found');
        this.errorMessage = 'Usuário não autenticado';
        this.isLoading = false;
      }
    }, error => {
      console.error('Error getting auth state:', error);
      this.errorMessage = 'Erro ao verificar autenticação';
      this.isLoading = false;
    });

    // Inicializa horarios a partir do userProfileData
    if (this.userProfileData && this.userProfileData.horarios) {
      try {
        // Tenta converter se estiver em formato de string
        if (typeof this.userProfileData.horarios === 'string') {
          this.horarios = JSON.parse(this.userProfileData.horarios);
        } else {
          this.horarios = this.userProfileData.horarios || [];
        }
      } catch (e) {
        console.error('Erro ao converter horários:', e);
        this.horarios = [];
      }
    }

    // Se desejar também prevenir o fechamento/reload da página com alterações não salvas:
    this.boundBeforeUnloadHandler = this.beforeUnloadHandler.bind(this);
    window.addEventListener('beforeunload', this.boundBeforeUnloadHandler);
  }

  loadUserProfile() {
    this.isLoading = true;

    if (!this.userEmail) {
      console.error('Cannot load profile: userEmail is not set');
      this.errorMessage = 'Email do usuário não encontrado';
      this.isLoading = false;
      return;
    }


    this.firestoreService.getRegistroById('usuarios/dentistascombr/users', this.userEmail).subscribe(
      (userData: any) => {
        if (userData) {
          this.userProfileData = userData;
          this.originalUsername = userData.username || '';

          localStorage.setItem('userData', JSON.stringify(userData));
          this.updateFormWithProfileData();
        } else {
          this.userProfileData = { email: this.userEmail };
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error loading profile from Firestore:', error);
        this.errorMessage = 'Erro ao carregar perfil';
        this.isLoading = false;
      }
    );
  }

  updateFormWithProfileData() {
    if (this.userProfileData) {
      // Resetar valores antes de preencher
      this.profileForm.reset();

      // Preencher com os dados do perfil
      const formValues = Object.keys(this.profileForm.controls)
        .reduce((acc, key) => {
          acc[key] = this.userProfileData[key] ||
            (key === 'email' ? this.userEmail : '');
          return acc;
        }, {} as Record<string, any>);

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

      if (!this.userProfileData.email && this.userEmail) {
        this.userProfileData.email = this.userEmail;
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

      // Carregar convenios se existirem
      if (this.userProfileData.convenios && Array.isArray(this.userProfileData.convenios)) {
        this.convenios = [...this.userProfileData.convenios];
      }
      else if (typeof this.userProfileData.convenios === 'string') {
        try {
          this.convenios = JSON.parse(this.userProfileData.convenios);
        } catch (e) {
          console.error('Erro ao converter convenios:', e);
          this.convenios = [];
        }
      } else {
        this.convenios = [];
      }




    }
  }

  updateCustomLabelWidth() {
    this.customLabelWidth = `${this.customLabelWidthValue}px`;
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

  onFieldChanged(event: { field: string; value: any }) {
    // Handle the field change
    // Your implementation...
  }

  salvar() {
    if (this.isSaving) return;
    this.isSaving = true;

    // Garantir que os endereços estão sincronizados com o formulário antes de salvar
    const formValues = this.profileForm.getRawValue();

    // Usar spread operator para criar um novo objeto e evitar modificar o original
    const dataToSave = {
      ...formValues,
      horarios: this.horarios,
      enderecos: this.enderecos,
      convenios: this.convenios
    };


    // Prosseguir com o salvamento...
    const userId = this.userProfileData.id || this.userEmail;

    from(this.firestoreService.updateRegistro('usuarios/dentistascombr/users', userId, dataToSave))
      .pipe(finalize(() => {
        this.isSaving = false;
      }))
      .subscribe(() => {
        this.isEditing = false;
        // Atualizar dados locais
        this.userProfileData = { ...this.userProfileData, ...dataToSave };

        // IMPORTANTE: Atualizar no UserService para refletir em toda a aplicação
        this.userService.setUserProfile(this.userProfileData);

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

  addHorario() {
    if (this.novoDia && this.novoHorario) {
      this.horarios.push({
        dia: this.novoDia.trim(),
        horario: this.novoHorario.trim()
      });

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        horarios: this.horarios
      });

      // Limpa os campos
      this.novoDia = '';
      this.novoHorario = '';
    }
  }


  removeHorario(index: number) {
    if (index >= 0 && index < this.horarios.length) {
      this.horarios.splice(index, 1);

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        horarios: this.horarios
      });
    }
  }

  // Em perfil.component.ts - dentro da classe PerfilComponent
  addEndereco() {
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

  removeEndereco(index: number) {
    if (index >= 0 && index < this.enderecos.length) {
      this.enderecos.splice(index, 1);

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        enderecos: this.enderecos
      });
    }
  }


  addConvenio() {
    if (this.nomeConvenio && this.novoConvenio) {
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


  removeConvenio(index: number) {
    if (index >= 0 && index < this.convenios.length) {
      this.convenios.splice(index, 1);

      // Atualiza o valor no formulário
      this.profileForm.patchValue({
        convenios: this.convenios
      });
    }
  }

  // Método para identificar alterações não salvas
  private hasUnsavedChanges(): boolean {
    // Exemplo: se estiver em modo de edição e houver alterações, retorne true.
    return this.isEditing; // Ajuste essa condição conforme sua lógica
  }
  
  // Método chamado pelo CanDeactivateGuard
  canDeactivate(): boolean {
    if (this.hasUnsavedChanges()) {
      return confirm('Existem alterações não salvas. Deseja realmente sair?');
    }
    return true;
  }
  
  // Opicional: trata o evento de beforeunload
  beforeUnloadHandler(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = 'Existem alterações não salvas!';
    }
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.boundBeforeUnloadHandler);
    // Outros códigos de destruição...
  }

}