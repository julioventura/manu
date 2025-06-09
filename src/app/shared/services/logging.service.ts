import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  constructor() {}

  /**
   * Registra uma mensagem de informação
   * @param source Componente ou serviço de origem
   * @param message Mensagem a ser registrada
   * @param data Dados adicionais (opcional)
   */
  log(source: string, message: string, data?: any): void {
    if (!environment.production) {
      console.log(`[INFO] [${source}] ${message}`, data || '');
    }
  }

  /**
   * Registra uma mensagem de erro
   * @param source Componente ou serviço de origem
   * @param message Mensagem de erro
   * @param error Objeto de erro
   */
  error(source: string, message: string, error: any): void {
    console.error(`[ERROR] [${source}] ${message}`, error);
  }

  /**
   * Registra uma mensagem de aviso
   * @param source Componente ou serviço de origem
   * @param message Mensagem de aviso
   * @param data Dados adicionais (opcional)
   */
  warn(source: string, message: string, data?: any): void {
    console.warn(`[WARN] [${source}] ${message}`, data || '');
  }
}