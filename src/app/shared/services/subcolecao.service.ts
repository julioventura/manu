import { Injectable } from '@angular/core';

export interface Subcolecao {
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubcolecaoService {
  private subcolecoes: Subcolecao[] = [
    { nome: 'exames' },
    { nome: 'documentos' },
    { nome: 'planos' },
    { nome: 'atendimentos' },
    { nome: 'consultas' },
    { nome: 'pagamentos' },
    { nome: 'dentes' },
    { nome: 'dentesendo' },
    { nome: 'dentesperio' },
    { nome: 'anamnese' },
    { nome: 'diagnosticos' },
    { nome: 'risco' },
  ];

  getSubcolecoesDisponiveis(): Subcolecao[] {
    return this.subcolecoes;
  }
}