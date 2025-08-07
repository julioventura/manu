# DOC-ATUALIZACOES.md - Sistema CRUD Firestore para Angular 20+

## 📋 Resumo Executivo

Este documento descreve as práticas essenciais para implementação correta de operações CRUD (Create, Read, Update, Delete) com Firebase/Firestore em aplicações Angular 20+, baseado nas correções realizadas no sistema Dentistas.com.br/clinica em agosto de 2025.

---

## 🔥 Problema Principal Identificado

### Erro Crítico: NG0203 - Injection Token Issues

**Sintoma:** Erro `"Error creating document reference in addRegistro"` ao tentar criar documentos em subcoleções.

**Causa Raiz:** No Angular 20+, todos os acessos ao AngularFirestore devem ser executados dentro do contexto de injeção de dependências adequado.

**Solução:** Uso obrigatório de `runInInjectionContext(this.injector, () => ...)` para todas as operações Firestore.

---

## 🛠️ Arquitetura de Serviços Firestore

### 1. FirestoreService - Serviço Base

**Localização:** `src/app/shared/services/firestore.service.ts`

**Responsabilidades:**

- CRUD básico em coleções Firestore
- Geração de IDs únicos
- Upload de arquivos
- Operações batch
- Consultas parametrizadas

**Estrutura do Serviço:**

```typescript
@Injectable({
  providedIn: 'root'
})
export class FirestoreService<T = any> {
  
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private injector: Injector,
    private util: UtilService
  ) {}

  // Métodos CRUD implementados com runInInjectionContext
}
```

### 2. FirestoreOptimizedService - Cache e Performance

**Localização:** `src/app/shared/services/firestore-optimized.service.ts`

**Responsabilidades:**

- Cache inteligente de dados
- Otimização de queries repetidas
- Lazy loading de coleções
- Paginação eficiente

### 3. FirestoreOptimizedSimpleService - Operações Leves

**Localização:** `src/app/shared/services/firestore-optimized-simple.service.ts`

**Responsabilidades:**

- Operações simples otimizadas
- Menor overhead de memória
- Ideal para componentes leves

---

## ✅ Implementação Correta dos Métodos CRUD

### CREATE - Adicionar Registros

```typescript
addRegistro(collectionPath: string, registro: T): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const id = registro.id ? registro.id : this.createId();
      const registroComId = { ...registro, id };
      
      runInInjectionContext(this.injector, () => {
        const docRef = this.firestore.collection(collectionPath).doc(id);
        docRef.set(registroComId)
          .then(() => resolve())
          .catch((error) => {
            console.error('Error in addRegistro:', error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error creating document reference in addRegistro:', error);
      reject(error);
    }
  });
}
```

### READ - Buscar Registros

```typescript
getRegistros(path: string, queryFn?: QueryFn): Observable<T[]> {
  return runInInjectionContext(this.injector, () => 
    this.firestore.collection<T>(path, queryFn).valueChanges({ idField: 'id' })
  );
}

getRegistroById<U = T>(collectionPath: string, id: string): Observable<U | undefined> {
  return runInInjectionContext(this.injector, () => 
    this.firestore.collection<U>(collectionPath).doc(id).valueChanges()
  );
}
```

### UPDATE - Atualizar Registros

```typescript
updateRegistro(collectionPath: string, id: string, registro: Partial<T>): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      runInInjectionContext(this.injector, () => {
        const docRef = this.firestore.collection(collectionPath).doc(id);
        
        docRef.get().toPromise().then(docSnapshot => {
          if (!docSnapshot || !docSnapshot.exists) {
            console.warn(`Document ${id} doesn't exist, creating it instead of updating`);
            return docRef.set(registro);
          } else {
            return docRef.update(registro);
          }
        }).then(() => {
          resolve();
        }).catch((error) => {
          console.error('Error in updateRegistro:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error creating document reference in updateRegistro:', error);
      reject(error);
    }
  });
}
```

### UPSERT - Criar ou Atualizar

```typescript
upsertRegistro(collectionPath: string, id: string, registro: T): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      runInInjectionContext(this.injector, () => {
        const docRef = this.firestore.collection(collectionPath).doc(id);
        docRef.set(registro, { merge: true })
          .then(() => resolve())
          .catch((error) => {
            console.error('Error in upsertRegistro:', error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error creating document reference in upsertRegistro:', error);
      reject(error);
    }
  });
}
```

### DELETE - Remover Registros

```typescript
deleteRegistro(collectionPath: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      runInInjectionContext(this.injector, () => {
        const docRef = this.firestore.collection(collectionPath).doc(id);
        docRef.delete()
          .then(() => resolve())
          .catch((error) => {
            console.error('Error in deleteRegistro:', error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error creating document reference in deleteRegistro:', error);
      reject(error);
    }
  });
}
```

---

## 🔧 Métodos Utilitários Essenciais

### Geração de IDs Únicos

```typescript
createId(): string {
  return runInInjectionContext(this.injector, () => 
    this.firestore.createId()
  );
}
```

### Operações em Batch

```typescript
async batchAddRegistros(collectionPath: string, registros: T[]): Promise<void> {
  return runInInjectionContext(this.injector, () => {
    const batch = this.firestore.firestore.batch();
    const collectionRef = this.firestore.collection(collectionPath).ref;

    registros.forEach(registro => {
      const docRef = collectionRef.doc();
      const registroComId = { ...registro, id: docRef.id };
      batch.set(docRef, registroComId);
    });

    return batch.commit();
  });
}
```

### Consultas Complexas

```typescript
getDocumentsWithQuery(collectionPath: string, queryFn: QueryFn): Observable<T[]> {
  return defer(() => {
    try {
      return runInInjectionContext(this.injector, () => 
        this.firestore.collection<T>(collectionPath, queryFn).valueChanges({ idField: 'id' })
      ).pipe(
        catchError(error => {
          console.error('Error in getDocumentsWithQuery:', error);
          return of([]);
        })
      );
    } catch (error) {
      console.error('Error creating collection reference in getDocumentsWithQuery:', error);
      return of([]);
    }
  });
}
```

---

## ⚠️ Regras Críticas para Angular 20+

### 1. **SEMPRE** Use runInInjectionContext

```typescript
// ❌ ERRADO - Pode causar NG0203
const docRef = this.firestore.collection(path).doc(id);

// ✅ CORRETO - Contexto de injeção seguro
runInInjectionContext(this.injector, () => {
  const docRef = this.firestore.collection(path).doc(id);
  // ... resto da operação
});
```

### 2. **NUNCA** Acesse AngularFirestore Diretamente em Componentes

```typescript
// ❌ ERRADO - Componente acessando Firestore diretamente
constructor(private firestore: AngularFirestore) {}

// ✅ CORRETO - Use o serviço abstrato
constructor(private firestoreService: FirestoreService) {}
```

### 3. **SEMPRE** Injete o Injector no Serviço

```typescript
constructor(
  private firestore: AngularFirestore,
  private injector: Injector // ← OBRIGATÓRIO
) {}
```

### 4. **SEMPRE** Trate Erros Adequadamente

```typescript
// ✅ CORRETO - Tratamento completo de erros
try {
  runInInjectionContext(this.injector, () => {
    // operação firestore
  });
} catch (error) {
  console.error('Error creating document reference:', error);
  reject(error);
}
```

---

## 🎯 Boas Práticas de Performance

### 1. Cache Inteligente

- Use `FirestoreOptimizedService` para dados frequentemente acessados
- Implemente cache local com TTL (Time To Live)
- Evite queries desnecessárias

### 2. Lazy Loading

- Carregue apenas dados visíveis na tela
- Use paginação para listas grandes
- Implemente scroll infinito quando apropriado

### 3. Otimização de Queries

```typescript
// ✅ Query otimizada com índices
getDocumentsPaginated(collectionPath: string, limit: number, startAfter?: unknown): Observable<T[]> {
  return defer(() => {
    try {
      return runInInjectionContext(this.injector, () => 
        this.firestore.collection<T>(collectionPath, ref => {
          let query = ref.orderBy('createdAt', 'desc').limit(limit);
          if (startAfter) {
            query = query.startAfter(startAfter);
          }
          return query;
        }).valueChanges({ idField: 'id' })
      );
    } catch (error) {
      console.error('Error in getDocumentsPaginated:', error);
      return of([]);
    }
  });
}
```

---

## 🔍 Padrões de Debugging

### 1. Logs Estruturados

```typescript
console.error('Error in addRegistro:', {
  error,
  collectionPath,
  registroId: registro.id,
  timestamp: new Date().toISOString()
});
```

### 2. Monitoramento de Performance

```typescript
const startTime = performance.now();
// ... operação firestore
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```

### 3. Validação de Dados

```typescript
if (!collectionPath || !registro) {
  throw new Error('Invalid parameters for addRegistro');
}
```

---

## 🚀 Checklist para Novos Projetos

### Setup Inicial

- [ ] Instalar AngularFire compatível com a versão do Angular
- [ ] Configurar Firebase SDK e environment
- [ ] Criar serviços base (FirestoreService, FirestoreOptimizedService)
- [ ] Implementar Injector em todos os serviços Firestore

### Implementação CRUD

- [ ] Todos os métodos CRUD usam `runInInjectionContext`
- [ ] Tratamento de erros implementado
- [ ] Logs estruturados configurados
- [ ] Validação de parâmetros

### Otimização

- [ ] Cache implementado para dados frequentes
- [ ] Lazy loading configurado
- [ ] Paginação implementada
- [ ] Índices Firestore criados

### Testes

- [ ] Testes unitários para todos os métodos CRUD
- [ ] Testes de integração com Firebase
- [ ] Testes de performance
- [ ] Testes de erro e recuperação

---

## 📚 Referências e Dependências

### Versões Testadas e Compatíveis

- **Angular:** 20.0.6
- **AngularFire:** 20.0.1  
- **Firebase:** 10.14.1
- **TypeScript:** 5.8.3
- **Node.js:** 22.17.0 LTS

### Imports Necessários

```typescript
import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, of, defer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
```

---

## 🎯 Conclusão

Este documento serve como guia definitivo para implementação de operações CRUD com Firestore em Angular 20+. As práticas aqui descritas são resultado de correções reais aplicadas no sistema Dentistas.com.br/clinica e devem ser seguidas rigorosamente para evitar erros de injeção de dependências e garantir performance otimizada.

**Regra de Ouro:** Todo acesso ao AngularFirestore deve ser envolvido com `runInInjectionContext(this.injector, () => ...)` no Angular 20+.

---

*Documento criado em: 07 de Agosto de 2025*  
*Versão: 1.0*  
*Autor: Sistema de Correções Angular 20+ Firestore*
