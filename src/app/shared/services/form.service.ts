// Alteração: remoção de logs de depuração (console.log)
/**
 * FormService
 * 
 * Métodos:
 * 1. carregarCamposFichas: Carrega os campos personalizados para uma ficha (subcollection) por meio do CamposFichaService e invoca createForm().
 * 2. carregarCamposRegistro: Carrega os campos personalizados para o registro principal de uma coleção usando o CamposService e invoca createForm().
 * 3. createForm: Cria ou atualiza o FormGroup (fichaForm) com base na definição dos campos carregados.
 * 4. loadRegistro: Carrega do Firestore os dados do registro principal, formata campos de data, adiciona controles dinâmicos e preenche o FormGroup.
 * 5. loadFicha: Carrega os dados de uma ficha interna (subcollection) do Firestore, aplica formatação em campos de data, adiciona campos faltantes e preenche o FormGroup.
 * 6. onFieldChange: Processa a mudança de valor em um campo do formulário, aplicando transformações (como capitalização) e atualizando o controle.
 * 7. salvarCollection: Salva alterações no registro principal do Firestore, validando o formulário e atualizando os dados.
 * 8. salvarSubcollection: Salva as alterações de uma ficha interna (subcollection) no Firestore após validação do formulário.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CamposService } from '../services/campos.service';
import { CamposFichaService } from '../services/campos-ficha.service';
import { UtilService } from '../utils/util.service';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FormService {

    fichaForm!: FormGroup; // FormGroup que armazena os controles do formulário dinâmico
    campos: any[] = []; // Vetor que contém a definição dos campos a serem exibidos no formulário
    isLoading: boolean = true; // Flag indicando o estado de carregamento dos dados
    public registro: any = null; // Registro carregado do Firestore
    public nome_in_collection: string = ''; // Nome extraído do registro, usado na interface
    public collection: string = '';
    public subcollection: string = '';
    camposNaoAgrupados: any[] = [];
    gruposCampos: { [key: string]: any[] } = {};

    // Adicionar um Observable para notificar quando o formulário está pronto
    private formReadySubject = new BehaviorSubject<boolean>(false);
    public formReady$ = this.formReadySubject.asObservable();

    // Para monitorar mudanças em tempo real
    private formDataSubscription: any;
    private destroy$ = new BehaviorSubject<void>(undefined);

    constructor(
        private firestoreService: FirestoreService<any>,
        private fb: FormBuilder,
        private camposService: CamposService,
        private camposFichaService: CamposFichaService,
        private router: Router,
        public util: UtilService
    ) { }

    /**
     * carregarCamposFichas(userId: string, subcollection: string)
     * 
     * Parâmetros:
     * - userId: string - ID do usuário autenticado.
     * - subcollection: string - Nome da subcollection.
     * Funcionalidade:
     * - Carrega os campos personalizados para uma ficha (subcollection) por meio do CamposFichaService.
     * - Invoca createForm() para criar ou atualizar o FormGroup.
     * Retorna: Observable<any[]>.
     */
    carregarCamposFichas(userId: string, subcollection: string) {
        return this.camposFichaService.getCamposFichaRegistro(userId, subcollection).pipe(
            tap((campos: any[]) => {
                this.campos = campos || [];
                this.createForm();
            })
        );
    }

    /**
     * carregarCamposRegistro(userId: string, collection: string)
     * 
     * Parâmetros:
     * - userId: string - ID do usuário autenticado.
     * - collection: string - Nome da coleção.
     * Funcionalidade:
     * - Carrega os campos personalizados para o registro principal de uma coleção usando o CamposService.
     * - Invoca createForm() para criar ou atualizar o FormGroup.
     * Retorna: Observable<any[]>.
     */
    carregarCamposRegistro(userId: string, collection: string) {
        return this.camposService.getCamposRegistro(userId, collection).pipe(
            tap((campos: any[]) => {
                this.campos = campos || [];
                this.createForm();
            })
        );
    }

    /**
     * createForm()
     * 
     * Parâmetros: N/A.
     * Funcionalidade:
     * - Cria ou atualiza o FormGroup (fichaForm) com base na definição dos campos carregados.
     * - Adiciona controles dinâmicos para os campos ausentes.
     * Retorna: void.
     */
    createForm() {
        if (!this.fichaForm) {
            const formControls = this.campos.reduce((acc, campo) => {
                let defaultValue;
                if (campo.tipo === 'checkbox' || campo.tipo === 'boolean') {
                    defaultValue = (this.registro && this.registro[campo.nome] !== undefined) ? this.registro[campo.nome] : false;
                } else {
                    defaultValue = (this.registro && this.registro[campo.nome]) ? this.registro[campo.nome] : '';
                }
                acc[campo.nome] = new FormControl(defaultValue);
                return acc;
            }, {} as { [key: string]: any });
            if (Object.keys(formControls).length > 0) {
                this.fichaForm = this.fb.group(formControls);
            } else {
                console.error('Nenhum campo foi adicionado ao FormGroup.');
            }
        } else {
            this.campos.forEach(campo => {
                if (!this.fichaForm.contains(campo.nome)) {
                    let defaultValue;
                    if (campo.tipo === 'checkbox' || campo.tipo === 'boolean') {
                        defaultValue = (this.registro && this.registro[campo.nome] !== undefined) ? this.registro[campo.nome] : false;
                    } else {
                        defaultValue = (this.registro && this.registro[campo.nome]) ? this.registro[campo.nome] : '';
                    }
                    this.fichaForm.addControl(campo.nome, new FormControl(defaultValue));
                }
            });
        }
    }

    /**
     * loadRegistro(userId: string, collection: string, id: string, view_only: boolean): Promise<void>
     * 
     * Parâmetros:
     * - userId: string - ID do usuário autenticado.
     * - collection: string - Nome da coleção.
     * - id: string - ID do registro.
     * - view_only: boolean - Indica se o formulário deve ser apenas visualizado (readonly).
     * Funcionalidade:
     * - Carrega do Firestore os dados do registro principal.
     * - Formata campos de data, adiciona controles dinâmicos e preenche o FormGroup.
     * Retorna: Promise<void>.
     */
    loadRegistro(userId: string, collection: string, id: string, view_only: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            
            // Verificar se o usuário está autenticado antes de prosseguir
            if (!userId) {
                console.error('UserId não fornecido ou usuário não autenticado');
                this.isLoading = false;
                reject('Usuário não autenticado');
                return;
            }
            
            this.collection = collection;
            this.isLoading = true;

            if (userId && collection && id) {
                const fichaPath = `users/${userId}/${collection}`;
                this.carregarCamposRegistro(userId, collection).pipe(
                    switchMap(() => this.firestoreService.getRegistroById(fichaPath, id))
                ).subscribe(ficha => {
                    // Verificar se o componente ainda está ativo antes de processar
                    if (this.destroy$.closed) {
                        return;
                    }
                    
                    if (ficha) {
                        this.registro = ficha;
                        this.nome_in_collection = this.registro.nome;

                        const formattedData = { ...ficha };
                        for (const key in formattedData) {
                            if (formattedData.hasOwnProperty(key) && this.isDateField(key)) {
                                const formattedDate = this.formatToDateInput(formattedData[key]);
                                formattedData[key] = formattedDate ? formattedDate : formattedData[key];
                            }
                        }

                        this.addDynamicFields(formattedData);
                        this.fichaForm.patchValue(formattedData);

                        if (view_only) {
                            this.fichaForm.disable();
                        } else {
                            this.fichaForm.enable();
                        }

                        // Separar campos por grupo
                        this.camposNaoAgrupados = this.campos.filter(campo => !campo.grupo || campo.grupo === '');

                        // Agrupar campos por grupo
                        this.gruposCampos = {};
                        this.campos
                            .filter(campo => campo.grupo && campo.grupo !== '')
                            .forEach(campo => {
                                if (!this.gruposCampos[campo.grupo]) {
                                    this.gruposCampos[campo.grupo] = [];
                                }
                                this.gruposCampos[campo.grupo].push(campo);
                            });

                        // Depois de configurar o formulário, notificar que está pronto
                        if (this.fichaForm) {
                            this.formReadySubject.next(true);
                        }
                        
                        this.isLoading = false;
                        resolve();
                    } else {
                        // ESTA É A LINHA QUE CAUSA O ERRO - linha 226 aproximadamente
                        // Remover ou substituir este console.error:
                        this.isLoading = false;
                        reject('Ficha não encontrada');
                    }
                }, error => {
                    console.error('Erro ao carregar ficha para edição:', error);
                    this.isLoading = false;
                    reject(error);
                });
            } else {
                console.error('Identificador id não definido corretamente.');
                this.isLoading = false;
                reject('Identificador id não definido corretamente');
            }
        });
    }

    /**
     * addDynamicFields(data: any)
     * 
     * Parâmetros:
     * - data: any - Dados do registro carregado.
     * Funcionalidade:
     * - Adiciona controles dinâmicos ao formulário para quaisquer campos que não estejam previamente definidos.
     * Retorna: void.
     */
    private addDynamicFields(data: any) {
        for (const key in data) {
            if (data.hasOwnProperty(key) && !this.fichaForm.contains(key)) {
                this.fichaForm.addControl(key, new FormControl(''));
            }
        }
    }

    /**
     * isDateField(fieldName: string): boolean
     * 
     * Parâmetros:
     * - fieldName: string - Nome do campo.
     * Funcionalidade:
     * - Verifica se o nome do campo corresponde a um campo de data (ex.: 'nascimento').
     * Retorna: boolean.
     */
    private isDateField(fieldName: string): boolean {
        return fieldName === 'nascimento';
    }

    /**
     * formatToDateInput(dateString: string): string | null
     * 
     * Parâmetros:
     * - dateString: string - Data no formato dd/MM/yyyy.
     * Funcionalidade:
     * - Converte uma data do formato dd/MM/yyyy para yyyy-MM-dd, para uso em inputs de data.
     * Retorna: string | null.
     */
    private formatToDateInput(dateString: string): string | null {
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(dateRegex);
        if (match) {
            const day = match[1];
            const month = match[2];
            const year = match[3];
            return `${year}-${month}-${day}`;
        }
        return null;
    }

    /**
     * loadFicha(userId: string, collection: string, id: string, subcollection: string, fichaId: string, view_only: boolean): Promise<void>
     * 
     * Parâmetros:
     * - userId: string - ID do usuário autenticado.
     * - collection: string - Nome da coleção.
     * - id: string - ID do registro principal.
     * - subcollection: string - Nome da subcollection.
     * - fichaId: string - ID da ficha interna.
     * - view_only: boolean - Indica se o formulário deve ser apenas visualizado (readonly).
     * Funcionalidade:
     * - Carrega os dados de uma ficha interna (subcollection) do Firestore.
     * - Aplica formatação em campos de data, adiciona campos faltantes e preenche o FormGroup.
     * Retorna: Promise<void>.
     */
    loadFicha(userId: string, collection: string, id: string, subcollection: string, fichaId: string, view_only: boolean): Promise<void> {
        return new Promise((resolve, reject) => {

            // Verificar se o usuário está autenticado antes de prosseguir
            if (!userId) {
                console.error('UserId não fornecido ou usuário não autenticado');
                this.isLoading = false;
                reject('Usuário não autenticado');
                return;
            }

            if (subcollection && fichaId) {
                this.subcollection = subcollection;
                const fichaPath = `users/${userId}/${collection}/${id}/fichas/${subcollection}/itens`;
                this.isLoading = true;
                this.carregarCamposFichas(userId, subcollection).subscribe(() => {
                    this.firestoreService.getRegistroById(fichaPath, fichaId).subscribe(ficha => {
                        if (ficha) {
                            this.registro = ficha;
                            const formattedData = { ...ficha };
                            for (const key in formattedData) {
                                if (formattedData.hasOwnProperty(key) && this.isDateField(key)) {
                                    const formattedDate = this.formatToDateInput(formattedData[key]);
                                    formattedData[key] = formattedDate ? formattedDate : formattedData[key];
                                }
                            }
                            this.addDynamicFields(formattedData);
                            this.fichaForm.patchValue(formattedData);

                            if (view_only) {
                                this.fichaForm.disable();
                            } else {
                                this.fichaForm.enable();
                            }

                            // Depois de configurar o formulário, notificar que está pronto
                            if (this.fichaForm) {
                                this.formReadySubject.next(true);
                            }
                            
                            this.isLoading = false;
                            resolve();
                        } else {
                            this.isLoading = false;
                            reject('Ficha não encontrada');
                        }
                    }, error => {
                        console.error('Erro ao carregar ficha para edição:', error);
                        this.isLoading = false;
                        reject(error);
                    });
                }, error => {
                    console.error('Erro ao carregar campos da ficha:', error);
                    this.isLoading = false;
                    reject(error);
                });
            } else {
                console.error('subcollection ou fichaId não definidos corretamente.');
                this.isLoading = false;
                reject('subcollection ou fichaId não definidos corretamente');
            }
        });
    }

    /**
     * onFieldChange(event: Event, campoNome: string): void // Alteração: tipagem explícita do parâmetro event
     * 
     * Parâmetros:
     * - event: Event - Evento de mudança de valor no campo. // Alteração: atualizado tipo na documentação
     * - campoNome: string - Nome do campo.
     * Funcionalidade:
     * - Processa a mudança de valor em um campo do formulário.
     * - Aplica transformações (como capitalização) e atualiza o controle.
     * Retorna: void.
     */
    onFieldChange(event: Event, campoNome: string): void {
        // Alteração: tipagem explícita do parâmetro event
        const target = event.target as HTMLInputElement | null; // Cast para acessar propriedades de input
        if (target && target.type === 'checkbox') {
            this.fichaForm.get(campoNome)?.setValue(target.checked);
            return;
        }
        if (this.fichaForm && this.fichaForm.get(campoNome) && target) {
            const valorAtual = target.value;

            // Não aplicar capitalização para o campo email
            if (campoNome === 'email') {
                this.fichaForm.get(campoNome)?.setValue(valorAtual);
            } else if (campoNome === 'estado') {
                const valorMaiusculo = valorAtual.toUpperCase();
                this.fichaForm.get(campoNome)?.setValue(valorMaiusculo);
            } else {
                const valorCapitalizado = this.util.capitalizar(valorAtual);
                this.fichaForm.get(campoNome)?.setValue(valorCapitalizado);
            }
        } else {
            console.error(`O campo ${campoNome} não foi encontrado no FormGroup ou o FormGroup não está pronto.`);
        }
    }

    /**
     * salvarCollection(userId: string, collection: string, id: string)
     * 
     * Parâmetros:
     * - userId: string - ID do usuário autenticado.
     * - collection: string - Nome da coleção.
     * - id: string - ID do registro.
     * Funcionalidade:
     * - Salva alterações no registro principal do Firestore, validando o formulário e atualizando os dados.
     * Retorna: void.
     */
    salvarCollection(userId: string, collection: string, id: string) {
        if (this.fichaForm.valid) {
            const fichaAtualizada = this.fichaForm.value;
            const fichaPath = `users/${userId}/${collection}`;
            const fichaRoute = `/view/${collection}`;
            if (id) {
                this.firestoreService.updateRegistro(fichaPath, id, fichaAtualizada).then(() => {
                    this.router.navigate([`fichaRoute/${id}`]);
                }).catch(error => {
                    console.error('Erro ao atualizar a ficha:', error);
                });
            }
        }
    }

    /**
     * salvarSubcollection(userId: string, collection: string, id: string, subcollection: string, fichaId: string)
     * 
     * Parâmetros:
     * - userId: string - ID do usuário autenticado.
     * - collection: string - Nome da coleção.
     * - id: string - ID do registro principal.
     * - subcollection: string - Nome da subcollection.
     * - fichaId: string - ID da ficha interna.
     * Funcionalidade:
     * - Salva as alterações de uma ficha interna (subcollection) no Firestore após validação do formulário.
     * Retorna: void.
     */
    salvarSubcollection(userId: string, collection: string, id: string, subcollection: string, fichaId: string) {
        if (this.fichaForm.valid) {
            const fichaAtualizada = this.fichaForm.value;
            const fichaPath = `users/${userId}/${collection}/${id}/fichas/${subcollection}/itens`;
            const fichaRoute = `/view-ficha/${collection}/${id}/fichas/${subcollection}/itens`;
            if (fichaId) {
                this.firestoreService.updateRegistro(fichaPath, fichaId, fichaAtualizada).then(() => {
                    this.router.navigate([`${fichaRoute}/${fichaId}`]);
                }).catch(error => {
                    console.error('Erro ao atualizar a ficha:', error);
                });
            }
        } else {
            console.error('Formulário inválido. Verifique os campos obrigatórios.');
        }
    }

    // Método para resetar o estado quando começar um novo carregamento
    private resetFormReadyState(): void {
        this.formReadySubject.next(false);
    }

    /**
     * Método para limpeza de dados quando necessário
     */
    clearFormData(): void {
        
        // Parar todas as subscriptions ativas
        if (this.destroy$) {
            this.destroy$.next();
        }
        
        // Resetar estado do formulário
        this.formReadySubject.next(false);
        
        // Limpar variáveis
        this.isLoading = false;
        this.registro = null;
        this.nome_in_collection = '';
        this.collection = '';
        this.subcollection = '';
    }

    /**
     * Método para manipular exclusão de documentos
     */
    handleDocumentDeletion(): void {
      this.clearFormData();
    }

}
