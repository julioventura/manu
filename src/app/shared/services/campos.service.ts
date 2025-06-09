// Alteração: remoção de logs de depuração (console.log)
/* 
  Métodos do serviço CamposService:
  1. getCamposRegistro(userId: string, colecao: string): Observable<any[]>
     - Retorna os campos de configuração para uma coleção específica a partir do Firestore. 
       Se a coleção for "padrao", retorna os campos padrão definidos no serviço; caso contrário,
       tenta buscar a configuração salva para a coleção e, se não houver, reverte para os padrões.
  2. setCamposRegistro(userId: string, colecao: string, campos: any[]): Promise<void>
     - Salva ou atualiza a configuração de campos de uma coleção no Firestore. 
       Para a coleção "padrao", atualiza os padrões localmente; para outras, grava no Firestore.
  3. getColecoes(userId: string): Observable<any[]>
     - Retorna uma lista de IDs (nomes das coleções) das configurações de campos salvas para o usuário.
*/

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CamposService {

  // Configuração padrão dos campos para todas as coleções
  public camposPadrao: any[] = [
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
    { nome: 'mae', tipo: 'text', label: 'Nome da mãe' },
    { nome: 'sus', tipo: 'text', label: 'CNS/SUS' },
    { nome: 'operador', tipo: 'text', label: 'Operador' },
    { nome: 'modulo', tipo: 'text', label: 'Módulo' },
    { nome: 'raca', tipo: 'text', label: 'Raça ou cor' },
    { nome: 'datainicio', tipo: 'date', label: 'Data início' },
    { nome: 'dataalta', tipo: 'date', label: 'Data de alta' },
    { nome: 'obs', tipo: 'textarea', label: 'Observação' },
    { nome: 'nuvem', tipo: 'url', label: 'Arquivos' },
    { nome: 'id', tipo: 'text', label: 'ID' },
  ];

  // Caminho de configuração no Firestore (base para as configurações de campos)
  private configPath: string = '';

  constructor(private firestore: AngularFirestore) { }

  // Retorna os campos de configuração para uma coleção específica.
  // Se "colecao" é "padrao", retorna uma cópia dos camposPadrao;
  // para outros casos, tenta buscar a configuração salva no Firestore e, se não existir, reverte para os padrões.
  getCamposRegistro(userId: string, colecao: string): Observable<any[]> {
    this.configPath = 'users/' + userId + '/configuracoesCampos';

    if (colecao === 'padrao') {
      return of([...this.camposPadrao]);
    } else {
      return this.firestore
        .collection(this.configPath)
        .doc(colecao)
        .valueChanges()
        .pipe(
          switchMap((configuracaoFirestore: any) => {
            if (configuracaoFirestore && configuracaoFirestore.campos) {
              // Se uma configuração personalizada existe no Firestore, retorna-a.
              return of(configuracaoFirestore.campos);
            } else {
              // Se não houver configuração, utiliza os campos padrão.
              return of([...this.camposPadrao]);
            }
          })
        );
    }
  }

  // Salva ou atualiza a configuração de campos para uma coleção.
  // Para "padrao" atualiza os campos padrão localmente; para outros, salva no Firestore.
  setCamposRegistro(userId: string, colecao: string, campos: any[]): Promise<void> {
    this.configPath = 'users/' + userId + '/configuracoesCampos';

    if (colecao === 'padrao') {
      this.camposPadrao = campos;
      return Promise.resolve();
    } else {
      return this.firestore.collection(this.configPath).doc(colecao).set({ campos });
    }
  }

  // Retorna uma lista de todas as coleções (IDs dos documentos) que possuem uma configuração de campos.
  // Utiliza snapshotChanges para capturar as mudanças e extrair os IDs dos documentos.
  getColecoes(userId: string): Observable<any[]> {
    this.configPath = 'users/' + userId + '/configuracoesCampos';

    return this.firestore.collection(this.configPath).snapshotChanges().pipe(
      switchMap(actions => {
        const colecoes = actions.map(action => action.payload.doc.id);
        return of(colecoes);
      })
    );
  }
}
