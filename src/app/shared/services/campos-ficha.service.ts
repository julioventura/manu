/* 
  Métodos do serviço CamposFichaService:
  1. getCamposFichaRegistro(userId: string, subcollection: string): Observable<any[]>
     - Retorna os campos de configuração para uma subcollection (ex.: exames).
       Se a subcollection for "padrao", retorna os campos padrão para fichas;
       caso contrário, busca a configuração no Firestore e, se não existir, utiliza os padrões.
  2. setCamposFichaRegistro(userId: string, collection: string, campos: any[]): Promise<void>
     - Atualiza os campos de configuração de uma subcollection para o usuário.
       Para "padrao", atualiza o array de campos padrão localmente; para outros, grava a configuração no Firestore.
  3. getColecoes(userId: string): Observable<any[]>
     - Recupera as subcollections configuradas para fichas do usuário a partir do Firestore, retornando os IDs dos documentos.
*/

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Campo } from '../models/campo.model';
import { FirestoreService } from './firestore.service';
import {
  DEFAULT_CAMPOS_PADRAO,
  DEFAULT_CAMPOS_PADRAO_FICHAS,
  CAMPOS_FICHAS_EXAMES,
  CAMPOS_FICHAS_DOCUMENTOS,
  CAMPOS_FICHAS_PLANOS,
  CAMPOS_FICHAS_ATENDIMENTOS,
  CAMPOS_FICHAS_PAGAMENTOS,
  CAMPOS_FICHAS_DENTES,
  CAMPOS_FICHAS_DENTES_ENDO,
  CAMPOS_FICHAS_DENTES_PERIO,
  CAMPOS_FICHAS_ANAMNESE,
  CAMPOS_FICHAS_DIAGNOSTICOS,
  CAMPOS_FICHAS_RISCO
} from '../constants/campos-ficha.constants';

@Injectable({
  providedIn: 'root'
})
export class CamposFichaService {

  constructor(private firestoreService: FirestoreService<Record<string, unknown> & { id?: string }>) { }

  // Retorna os campos fixos conforme a coleção (subcollection) selecionada
  getCamposFichaRegistro(userId: string, subcollection: string): Observable<Campo[]> {
    switch (subcollection) {
    case 'padrao':
      return of([...DEFAULT_CAMPOS_PADRAO]);
    case 'exames':
      return of([...CAMPOS_FICHAS_EXAMES]);
    case 'documentos':
      return of([...CAMPOS_FICHAS_DOCUMENTOS]);    
    case 'planos':
      return of([...CAMPOS_FICHAS_PLANOS]);        
    case 'atendimentos':
      return of([...CAMPOS_FICHAS_ATENDIMENTOS]);
    case 'pagamentos':
      return of([...CAMPOS_FICHAS_PAGAMENTOS]);
    case 'dentes':
      return of([...CAMPOS_FICHAS_DENTES]);
    case 'dentesendo':
      return of([...CAMPOS_FICHAS_DENTES_ENDO]);
    case 'dentesperio':
      return of([...CAMPOS_FICHAS_DENTES_PERIO]);
    case 'anamnese':
      return of([...CAMPOS_FICHAS_ANAMNESE]);
    case 'diagnosticos':
      return of([...CAMPOS_FICHAS_DIAGNOSTICOS]);
    case 'risco':
      return of([...CAMPOS_FICHAS_RISCO]);
    default:
      return of([...DEFAULT_CAMPOS_PADRAO_FICHAS]);
    }
  }

  // A função de setCamposFichaRegistro pode ser mantida para uso futuro ou removida, se não houver necessidade
  setCamposFichaRegistro(userId: string, collection: string, campos: Campo[]): Promise<void> {
    const path = `users/${userId}/configuracoesFichas/${collection}`;
    return this.firestoreService.setDocumentByPath(path, { campos });
  }

}
