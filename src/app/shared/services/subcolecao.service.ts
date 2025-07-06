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
    { nome: 'pagamentos' },
    { nome: 'dentes' },
    { nome: 'dentesendo' },
    { nome: 'dentesperio' },
  ];

  getSubcolecoesDisponiveis(): Subcolecao[] {
    return this.subcolecoes;
  }
}