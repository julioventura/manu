import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-homepage.component.html',
  styleUrls: ['./menu-homepage.component.scss']
})
export class MenuHomepageComponent {
  @Input() userProfile: any;
  
  isScrolled = false;
  isMobileMenuOpen = false;
  
  menuItems = [
    { label: 'Home', route: '/' },
    { label: 'Sobre', route: '/sobre' },
    { label: 'Serviços', route: '/servicos' },
    { label: 'Blog', route: '/blog' },
    { label: 'Contato', route: '/contato' }
  ];
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 60;
  }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}