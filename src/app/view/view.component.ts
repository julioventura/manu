import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { UserService } from '../shared/services/user.service';
import { ConfigService } from '../shared/services/config.service';
import { GroupService } from '../shared/components/group/group.service';
import { GroupSharingModalComponent } from '../shared/components/group/group-sharing-modal.component';
import { UtilService } from '../shared/utils/util.service';

// ADICIONAR: interface para Firebase Timestamp
interface FirebaseTimestamp {
  toDate(): Date;
}

// ADICIONAR: Interface para KeyValuePair
interface KeyValuePair {
  key: string;
  value: unknown;
}

// ADICIONAR: Interface para Campo
interface Campo {
  id: string;  // MUDANÇA: era unknown, agora é string
  nome: string;
  label?: string;
  tipo?: string;
  grupo?: string;  // ADICIONAR
  subgrupo?: string;  // ADICIONAR
  obrigatorio?: boolean;  // ADICIONAR
  [key: string]: unknown;
}

interface SharingHistoryEntry {
  groupId: string;
  groupName: string;
  previousGroupId?: string;
  sharedAt: FirebaseTimestamp | Date | string;
  timestamp?: FirebaseTimestamp | Date | string;
  sharedBy: string;
  userName?: string;
  userId?: string;
  action: string;
}

interface FormControls {
  [key: string]: unknown[];  // CORRIGIDO: era string[], agora é unknown[]
}

type ViewData = Record<string, unknown> | unknown[] | string | number | boolean | null;

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // ADICIONADO: para permitir elementos customizados
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
  ]
})
export class ViewComponent implements OnInit {
  id: string = '';
  collection: string = '';
  subcollection: string = '';
  registro: ViewData = null;
  isLoading: boolean = true;
  recordTitle: string = '';
  currentGroupId: string | null = null;
  
  titulo_da_pagina: string = 'Visualizar Registro';
  subtitulo_da_pagina: string = '';
  editar: () => void = () => this.editRecord();
  excluir: () => void = () => this.deleteRecord();
  show_menu: boolean = true;
  customLabelWidth: string = '150px';
  customLabelWidthValue: number = 150;
  groupChanged: boolean = false;
  
  fichaForm: FormGroup;
  campos: Campo[] = [];
  fixedFields: Campo[] = [];
  adjustableFields: Campo[] = [];
  sharingHistory: SharingHistoryEntry[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private userService: UserService,
    private configService: ConfigService,
    private groupService: GroupService,
    public util: UtilService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {
    this.fichaForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.collection = params['collection'];
      this.subcollection = this.collection;
      if (this.id && this.collection) {
        this.loadRecord();
      }
    });
  }

  loadRecord(): void {
    this.isLoading = true;
    
    this.userService.getUserData(this.collection).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          const record = data.find((item: unknown) => {
            if (item && typeof item === 'object') {
              const obj = item as Record<string, unknown>;
              return obj['id'] === this.id;
            }
            return false;
          });
          this.registro = record || null;
        } else {
          this.registro = data;
        }
        
        this.recordTitle = this.getRecordTitle(this.registro);
        this.currentGroupId = this.getRecordGroupId();
        this.titulo_da_pagina = `Visualizar ${this.collection}`;
        this.subtitulo_da_pagina = this.recordTitle;
        this.isLoading = false;
        
        this.loadFields();
        
        console.log('Record loaded:', this.registro);
      },
      error: (error) => {
        console.error('Error loading record:', error);
        this.snackBar.open('Erro ao carregar registro', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadFields(): void {
    this.createDefaultFields();
  }

  private createDefaultFields(): void {
    if (!this.registro) {
      setTimeout(() => {
        if (this.registro) {
          this.createDefaultFields();
        }
      }, 100);
      return;
    }

    if (this.registro && typeof this.registro === 'object') {
      const record = this.registro as Record<string, unknown>;
      this.campos = Object.keys(record)
        .filter(key => key !== 'id')
        .map(key => ({
          id: key,  // CORRIGIDO: key é string
          nome: key,  // CORRIGIDO: usar key diretamente
          label: this.formatFieldName(key),
          tipo: this.inferFieldType(record[key]),
          obrigatorio: key === 'nome' || key === 'name'
        }));
    } else {
      this.campos = [
        { 
          id: 'nome', 
          nome: 'nome',  // CORRIGIDO
          label: 'Nome',
          tipo: 'text', 
          obrigatorio: true 
        },
        { 
          id: 'id', 
          nome: 'id',  // CORRIGIDO
          label: 'ID',
          tipo: 'text', 
          obrigatorio: false 
        }
      ];
    }
    
    this.fixedFields = this.campos.filter(campo => !campo.grupo);
    this.adjustableFields = this.campos.filter(campo => campo.grupo);
    this.buildForm();
  }

  private formatFieldName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  private inferFieldType(value: unknown): string {
    if (typeof value === 'string') {
      if (value.includes('@')) return 'email';
      if (value.startsWith('http')) return 'url';
      if (value.length > 100) return 'textarea';
      return 'text';
    }
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'checkbox';
    if (value instanceof Date || (value && typeof value === 'object' && 'toDate' in value)) return 'date';
    return 'text';
  }

  buildForm(): void {
    const formControls: FormControls = {};
    this.campos.forEach(campo => {
      formControls[campo.id] = [''];  // CORRIGIDO: campo.id agora é string
    });
    this.fichaForm = this.formBuilder.group(formControls);
    
    if (this.registro && typeof this.registro === 'object') {
      this.fichaForm.patchValue(this.registro as Record<string, unknown>);
    }
  }

  private getRecordTitle(data: ViewData): string {
    if (typeof data === 'object' && data !== null) {
      const record = data as Record<string, unknown>;
      return String(record['nome'] || record['title'] || record['name'] || `ID: ${this.id}`);
    }
    return `ID: ${this.id}`;
  }

  private getRecordGroupId(): string | null {
    if (this.registro && typeof this.registro === 'object') {
      const record = this.registro as Record<string, unknown>;
      const groupId = record['groupId'];
      return groupId ? String(groupId) : null;
    }
    return null;
  }

  canShareRecord(): boolean {
    return this.currentGroupId !== null;
  }

  openSharingModal(): void {
    this.openGroupSharing();
  }

  openGroupSharing(): void {
    const dialogRef = this.dialog.open(GroupSharingModalComponent, {
      width: '600px',
      data: {
        collection: this.collection,
        recordId: this.id,
        currentGroupId: this.currentGroupId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRecord();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  editRecord(): void {
    this.router.navigate(['/edit', this.collection, this.id]);
  }

  deleteRecord(): void {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      this.userService.deleteUserData(this.collection, this.id).subscribe({
        next: () => {
          this.snackBar.open('Registro excluído com sucesso', 'OK', { duration: 3000 });
          this.goBack();
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.snackBar.open('Erro ao excluir registro', 'OK', { duration: 3000 });
        }
      });
    }
  }

  // CORRIGIDO: aceitar tanto Event quanto chamada direta
  updateCustomLabelWidth(eventOrValue?: Event | number): void {
    if (typeof eventOrValue === 'number') {
      this.customLabelWidthValue = eventOrValue;
    } else if (eventOrValue && eventOrValue instanceof Event) {
      const target = eventOrValue.target as HTMLInputElement;
      this.customLabelWidthValue = parseInt(target.value) || 150;
    }
    this.customLabelWidth = `${this.customLabelWidthValue}px`;
  }

  hasRegistroProperty(campo: Campo): boolean {
    if (!this.registro || typeof this.registro !== 'object') return false;
    const record = this.registro as Record<string, unknown>;
    return campo.nome in record;  // CORRIGIDO: usar campo.nome em vez de campo.id
  }

  getRegistroProperty(campo: Campo): unknown {
    if (!this.registro || typeof this.registro !== 'object') return null;
    const record = this.registro as Record<string, unknown>;
    return record[campo.nome];  // CORRIGIDO: usar campo.nome
  }

  getRegistroString(campo: Campo): string {
    const value = this.getRegistroProperty(campo);
    return this.safeString(value);
  }

  // ADICIONADO: métodos sobrecarregados para aceitar string ou Campo
  hasRegistroPropertyByKey(key: string): boolean {
    if (!this.registro || typeof this.registro !== 'object') return false;
    const record = this.registro as Record<string, unknown>;
    return key in record;
  }

  getRegistroPropertyByKey(key: string): unknown {
    if (!this.registro || typeof this.registro !== 'object') return null;
    const record = this.registro as Record<string, unknown>;
    return record[key];
  }

  getRegistroStringByKey(key: string): string {
    const value = this.getRegistroPropertyByKey(key);
    return this.safeString(value);
  }

  // ADICIONADO: métodos helper para template que aceitem tanto Campo quanto string
  isNotEmptyField(fieldOrKey: Campo | string): boolean {
    const value = typeof fieldOrKey === 'string' 
      ? this.getRegistroPropertyByKey(fieldOrKey) 
      : this.getRegistroProperty(fieldOrKey);
    return this.isNotEmpty(value);
  }

  getFieldValue(fieldOrKey: Campo | string): unknown {
    return typeof fieldOrKey === 'string' 
      ? this.getRegistroPropertyByKey(fieldOrKey) 
      : this.getRegistroProperty(fieldOrKey);
  }

  getFieldString(fieldOrKey: Campo | string): string {
    return typeof fieldOrKey === 'string' 
      ? this.getRegistroStringByKey(fieldOrKey) 
      : this.getRegistroString(fieldOrKey);
  }

  isNotEmpty(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  openUrl(url: string): void {
    if (url && url.trim()) {
      window.open(url, '_blank');
    }
  }

  trackByCampo(index: number, campo: Campo): string {
    return campo.id;  // CORRIGIDO: campo.id agora é string garantido
  }

  groupByGrupo(campos: Campo[]): { [key: string]: Campo[] } {
    const groups: { [key: string]: Campo[] } = {};
    campos.forEach(campo => {
      const grupo = campo.grupo || 'Geral';
      if (!groups[grupo]) {
        groups[grupo] = [];
      }
      groups[grupo].push(campo);
    });
    return groups;
  }

  groupBySubgrupo(campos: Campo[]): { [key: string]: Campo[] } {
    const groups: { [key: string]: Campo[] } = {};
    campos.forEach(campo => {
      const subgrupo = campo.subgrupo || 'Geral';
      if (!groups[subgrupo]) {
        groups[subgrupo] = [];
      }
      groups[subgrupo].push(campo);
    });
    return groups;
  }

  safeCastArray(value: unknown): Campo[] {
    return Array.isArray(value) ? value : [];
  }

  hasNonEmptyField(campos: Campo[]): boolean {
    return campos.some(campo => {
      const value = this.getRegistroProperty(campo);
      return this.isNotEmpty(value);
    });
  }

  makeIterable(obj: unknown): KeyValuePair[] {
    if (!obj || typeof obj !== 'object') return [];
    const record = obj as Record<string, unknown>;
    return Object.keys(record).map(key => ({ 
      key, 
      value: record[key] 
    }));
  }

  safeString(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    try {
      return String(value);
    } catch {
      return '';
    }
  }

  keyValueSortFn = (a: KeyValuePair, b: KeyValuePair): number => {
    return a.key.localeCompare(b.key);
  };

  trackByKeyValue(index: number, item: KeyValuePair): string {
    return item.key;
  }

  safeGetGroupId(): string {
    return this.currentGroupId || '';
  }

  // CORRIGIDO: aceitar parâmetro obrigatório com valor padrão
  onGroupIdChanged(newGroupId: string = ''): void {
    this.currentGroupId = newGroupId;
    this.groupChanged = true;
  }

  saveGroupChange(): void {
    if (this.groupChanged && this.currentGroupId) {
      this.groupChanged = false;
    }
  }

  getGroupName(groupId: string): string {
    return `Grupo ${groupId}`;
  }

  formatDate(date: unknown): string {
    if (!date) return '';
    if (date && typeof date === 'object' && 'toDate' in date && typeof (date as FirebaseTimestamp).toDate === 'function') {
      return (date as FirebaseTimestamp).toDate().toLocaleString('pt-BR');
    }
    if (date instanceof Date) {
      return date.toLocaleString('pt-BR');
    }
    return String(date);
  }

  // Métodos existentes mantidos
  isObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  isArray(value: unknown): boolean {
    return Array.isArray(value);
  }

  isPrimitive(value: unknown): boolean {
    return typeof value !== 'object' || value === null;
  }

  getObjectKeys(obj: unknown): string[] {
    if (this.isObject(obj)) {
      return Object.keys(obj as Record<string, unknown>);
    }
    return [];
  }

  getObjectValue(obj: unknown, key: string): unknown {
    if (this.isObject(obj)) {
      const record = obj as Record<string, unknown>;
      return record[key];
    }
    return null;
  }

  trackByUnknown(index: number, item: unknown): unknown {
    return item || index;
  }

  trackByKey(index: number, key: string): string {
    return key;
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    
    if (typeof value === 'object' && value !== null) {
      if ('toDate' in value && typeof (value as FirebaseTimestamp).toDate === 'function') {
        return (value as FirebaseTimestamp).toDate().toLocaleString('pt-BR');
      }
      
      if (value instanceof Date) {
        return value.toLocaleString('pt-BR');
      }
      
      if (Array.isArray(value)) {
        return `[${value.length} items]`;
      }
      
      return '[Objeto]';
    }
    
    return String(value);
  }

  // ADICIONAR: método para KeyValuePair
  getKeyValueString(item: KeyValuePair): string {
    if (item.value && typeof item.value === 'object') {
      const obj = item.value as Record<string, unknown>;
      if ('nome' in obj && obj['nome']) {
        return this.safeString(obj['nome']);
      }
      if ('label' in obj && obj['label']) {
        return this.safeString(obj['label']);
      }
    }
    return this.safeString(item.value);
  }

  // ADICIONAR: função para verificar tipo
  isObjectWithNome(campo: unknown): campo is Record<string, unknown> & { nome: string } {
    return campo !== null && 
           campo !== undefined && 
           typeof campo === 'object' && 
           'nome' in campo && 
           typeof (campo as Record<string, unknown>)['nome'] === 'string' &&
           !!(campo as Record<string, unknown>)['nome'];  // CORRIGIDO: garantir boolean
  }

  // ADICIONAR: função para obter valor seguro de KeyValuePair
  getFieldValueFromKeyValue(item: unknown, key: string): string {
    if (!item || typeof item !== 'object') return '';
    
    const obj = item as Record<string, unknown>;
    
    // CORRIGIDO: usar notação de índice
    if ('value' in obj && obj['value'] && typeof obj['value'] === 'object') {
      const valueObj = obj['value'] as Record<string, unknown>;
      return this.safeString(valueObj[key]);
    }
    
    // Se é objeto direto
    return this.safeString(obj[key]);
  }

  // ADICIONAR método para verificar se campo tem propriedade específica
  hasFieldProperty(campo: Campo, property: string): boolean {
    return property in campo && campo[property] !== undefined && campo[property] !== null;
  }
}