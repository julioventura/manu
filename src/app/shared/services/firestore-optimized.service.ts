// Serviço FireStore Otimizado para Performance
import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

export interface QueryOptions {
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: { field: string; operator: string; value: unknown }[];
  startAfter?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreOptimizedService {
  private cache = new Map<string, Observable<unknown>>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  constructor(
    private firestore: AngularFirestore,
    private injector: Injector
  ) {}

  /**
   * Busca otimizada com cache, paginação e filtros
   */
  getOptimizedCollection<T>(
    collectionPath: string, 
    options: QueryOptions = {}
  ): Observable<T[]> {
    const cacheKey = this.generateCacheKey(collectionPath, options);
    
    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)! as Observable<T[]>;
    }

    // Use Query type from AngularFirestore for type safety
    const query$ = runInInjectionContext(this.injector, () => 
      this.firestore.collection<T>(collectionPath, ref => {
        let query = ref as firebase.default.firestore.Query<firebase.default.firestore.DocumentData>;
        if (options.orderBy) {
          query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }
        if (options.startAfter) {
          query = query.startAfter(options.startAfter);
        }
        return query;
      }).valueChanges({ idField: 'id' })
    ).pipe(
      map(data => {
        console.debug('[FirestoreOptimizedService] valueChanges result:', data, 'for collection:', collectionPath, 'options:', options);
        return data;
      }),
      catchError(error => {
        console.error('FirestoreOptimized error:', error, 'for collection:', collectionPath, 'options:', options);
        return of([]);
      }),
      shareReplay(1)
    );

    // Armazenar no cache com expiração
    this.cache.set(cacheKey, query$);
    timer(this.cacheTimeout).subscribe(() => {
      this.cache.delete(cacheKey);
    });

    return query$;
  }

  /**
   * Busca documento por ID
   */
  getDocumentById<T>(collectionPath: string, docId: string): Observable<T | null> {
    const cacheKey = `${collectionPath}_doc_${docId}`;
    
    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)! as Observable<T | null>;
    }

    const doc$ = runInInjectionContext(this.injector, () => 
      this.firestore.collection<T>(collectionPath).doc(docId)
        .valueChanges({ idField: 'id' })
    ).pipe(
      map(doc => doc || null),
      catchError(error => {
        console.error('FirestoreOptimized getDocumentById error:', error);
        return of(null);
      }),
      shareReplay(1)
    );

    // Armazenar no cache com expiração
    this.cache.set(cacheKey, doc$);
    timer(this.cacheTimeout).subscribe(() => {
      this.cache.delete(cacheKey);
    });

    return doc$;
  }

  /**
   * Busca com search em tempo real otimizada
   */
  getSearchableCollection<T extends Record<string, unknown>>(
    collectionPath: string,
    searchField: string,
    searchTerm: string,
    options: QueryOptions = {}
  ): Observable<T[]> {
    return this.getOptimizedCollection<T>(collectionPath, options).pipe(
      map(items => items.filter((item: T) => 
        String(item[searchField] || '').toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  /**
   * Busca paginada otimizada
   */
  getPaginatedCollection<T>(
    collectionPath: string,
    pageSize: number = 10,
    lastDoc?: unknown
  ): Observable<{ items: T[]; hasMore: boolean; lastDoc: unknown }> {
    const options: QueryOptions = {
      limit: pageSize + 1, // +1 para verificar se tem mais
      orderBy: 'nome',
      orderDirection: 'asc'
    };

    if (lastDoc) {
      options.startAfter = lastDoc;
    }

    return this.getOptimizedCollection<T>(collectionPath, options).pipe(
      map(items => {
        const hasMore = items.length > pageSize;
        const resultItems = hasMore ? items.slice(0, pageSize) : items;
        const newLastDoc = resultItems.length > 0 ? resultItems[resultItems.length - 1] : null;

        return {
          items: resultItems,
          hasMore,
          lastDoc: newLastDoc
        };
      })
    );
  }

  /**
   * Gera chave única para cache
   */
  private generateCacheKey(collectionPath: string, options: QueryOptions): string {
    return `${collectionPath}_${JSON.stringify(options)}`;
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Remove item específico do cache
   */
  invalidateCache(collectionPath: string): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.startsWith(collectionPath));
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
