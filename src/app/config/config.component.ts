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
// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
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
  constructor(
    private router: Router,
    public util: UtilService,
    public configuracoes: ConfigService,
    private navegacaoService: NavegacaoService,
    private firestore: AngularFirestore,
    private subcolecaoService: SubcolecaoService,
    public fb: FormBuilder
  ) { }
  chatbotForm!: FormGroup;
  loading = false;
  chatbotConfig = {
    anexos: [] as { nome: string; url: string }[],
    anexosSelecionados: [] as File[],
  };

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files: FileList | null = input.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.chatbotConfig.anexosSelecionados.push(files[i]);
      }
    }
  }

  uploadAnexos() {
    // Simulação de upload: adiciona os arquivos selecionados à lista de anexos
    for (const file of this.chatbotConfig.anexosSelecionados) {
      const fakeUrl = URL.createObjectURL(file);
      this.chatbotConfig.anexos.push({ nome: file.name, url: fakeUrl });
    }
    this.chatbotConfig.anexosSelecionados = [];
  }

  removerAnexo(anexo: { nome: string; url: string }) {
    this.chatbotConfig.anexos = this.chatbotConfig.anexos.filter(a => a !== anexo);
  }

  ngOnInit(): void {
    this.ambiente = this.configuracoes.ambiente;
    this.carregarSubcolecoesDisponiveis();
    this.initChatbotForm();
    this.carregarChatbotConfig();
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
    this.firestore.collection('configuracoes').doc('chatbot').get().subscribe({
      next: doc => {
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
      error: () => {
        this.loading = false;
      }
    });
  }

  salvarChatbotConfig() {
    if (this.chatbotForm.invalid) return;
    this.loading = true;
    const formValue = this.chatbotForm.value;
    const configToSave = {
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
      anexos: this.chatbotConfig.anexos
    };
    this.firestore.collection('configuracoes').doc('chatbot').set(configToSave).then(() => {
      this.loading = false;
      alert('Configurações do chatbot salvas!');
    }).catch(() => {
      this.loading = false;
      alert('Erro ao salvar configurações!');
    });
  }
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

  selectedTab: 'chatbot' | 'homepage' | 'preferencias' = 'chatbot';


  // ngOnInit antigo removido (duplicado)

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
