import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rodape-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rodape-homepage.component.html',
  styleUrls: ['./rodape-homepage.component.scss']
})
export class RodapeHomepageComponent {
  currentYear: number = new Date().getFullYear();
  
  // Links do rodapé
  politicaLinks = [
    { text: 'Termos de Uso', route: '/termos' },
    { text: 'Política de Privacidade', route: '/privacidade' },
  ];
  
  redesSociais = [
    { nome: 'Facebook', url: 'https://facebook.com', icon: 'fa-facebook-f' },
    { nome: 'Instagram', url: 'https://instagram.com', icon: 'fa-instagram' },
    { nome: 'LinkedIn', url: 'https://linkedin.com', icon: 'fa-linkedin-in' }
  ];
}