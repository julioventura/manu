// Serviço FireStore Otimizado - Versão Simplificada
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreOptimizedService {
  private cache = new Map<string, Observable<unknown>>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  constructor(private firestore: AngularFirestore) {}

  /**
   * Busca otimizada com limite e ordenação
   */
  getOptimizedCollection<T>(
    collectionPath: string,
    limit: number = 50,
    orderBy: string = 'nome',
    orderDirection: 'asc' | 'desc' = 'asc'
  ): Observable<T[]> {
    const cacheKey = `${collectionPath}_${limit}_${orderBy}_${orderDirection}`;
    
    console.log('🔥 FirestoreOptimized: Loading collection', { collectionPath, limit, orderBy, orderDirection });
    
    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      console.log('📦 FirestoreOptimized: Using cached data for', cacheKey);
      return this.cache.get(cacheKey)! as Observable<T[]>;
    }

    console.log('🌐 FirestoreOptimized: Querying Firestore for', cacheKey);
    const query$ = this.firestore.collection<T>(collectionPath, ref => 
      ref.orderBy(orderBy, orderDirection).limit(limit)
    )
      .valueChanges({ idField: 'id' })
      .pipe(
        map(data => {
          console.log('✅ FirestoreOptimized: Data received', { path: collectionPath, count: data.length });
          return data;
        }),
        catchError(error => {
          console.error('❌ FirestoreOptimized error:', error);
          return of([]);
        }),
        shareReplay(1)
      );

    // Armazenar no cache
    this.cache.set(cacheKey, query$);
    
    // Limpar cache depois de 5 minutos
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, this.cacheTimeout);

    return query$;
  }

  /**
   * Busca com paginação simples
   */
  getPaginatedCollection<T>(
    collectionPath: string,
    pageSize: number = 10,
    orderBy: string = 'nome'
  ): Observable<T[]> {
    return this.getOptimizedCollection<T>(collectionPath, pageSize, orderBy);
  }

  /**
   * Busca com filtro local (para coleções pequenas)
   */
  getFilteredCollection<T extends Record<string, unknown>>(
    collectionPath: string,
    searchField: string,
    searchTerm: string,
    limit: number = 50
  ): Observable<T[]> {
    return this.getOptimizedCollection<T>(collectionPath, limit).pipe(
      map(items => {
        if (!searchTerm.trim()) return items;
        
        return items.filter(item => {
          const fieldValue = String(item[searchField] || '').toLowerCase();
          return fieldValue.includes(searchTerm.toLowerCase());
        });
      })
    );
  }

  /**
   * Busca documento único por ID
   */
  getDocumentById<T>(collectionPath: string, docId: string): Observable<T | null> {
    const cacheKey = `${collectionPath}_doc_${docId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)! as Observable<T | null>;
    }

    const doc$ = this.firestore.doc<T>(`${collectionPath}/${docId}`)
      .valueChanges({ idField: 'id' })
      .pipe(
        map(doc => doc || null),
        catchError(error => {
          console.error('Error fetching document:', error);
          return of(null);
        }),
        shareReplay(1)
      );

    this.cache.set(cacheKey, doc$);
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, this.cacheTimeout);

    return doc$;
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalida cache de uma coleção específica
   */
  invalidateCollectionCache(collectionPath: string): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.startsWith(collectionPath));
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
