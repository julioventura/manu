import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  is_admin: boolean = false;
  ambiente: string = '';

  constructor() {
    // Implementar lógica de configuração se necessário
  }

  setAdminStatus(isAdmin: boolean): void {
    this.is_admin = isAdmin;
  }

  getAdminStatus(): boolean {
    return this.is_admin;
  }
}
