import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'  // O serviço estará disponível em todo o aplicativo
})
export class NavegacaoService {

  constructor(
    private location: Location
  ) { }

  // Método para voltar à página anterior no histórico do navegador
  goBack() {
    this.location.back(); // Volta uma página no histórico
  }
}
