// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { UtilService } from '../../shared/utils/util.service';

@Component({
  selector: 'app-redes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redes.component.html',
  styleUrls: ['./redes.component.scss']
})
export class RedesComponent implements OnInit {

  constructor(
    private util: UtilService,
    public userService: UserService) {
  }

  ngOnInit(): void {
    // Implementar se necessário
  }

  // CORRIGIR: método formatUrl para aceitar unknown
  formatUrl(url: unknown, platform: string): string {
    // Verificar se url é válida
    if (!url || (typeof url !== 'string' && typeof url !== 'number')) {
      return '#';
    }
    
    // Converter para string
    const urlString = String(url).trim();
    if (!urlString) return '#';
    
    // Se já começa com http/https, retorna como está
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      return urlString;
    }
    
    // Remover @ ou / do início se existir
    const cleanUrl = urlString.replace(/^[@/]+/, '');
    
    // Adicionar prefixos específicos por plataforma
    const platformPrefixes: Record<string, string> = {
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
      linkedin: 'https://linkedin.com/in/',
      youtube: 'https://youtube.com/@',
      twitter: 'https://twitter.com/',
      tiktok: 'https://tiktok.com/@',
      pinterest: 'https://pinterest.com/'
    };
    
    const prefix = platformPrefixes[platform] || 'https://';
    return prefix + cleanUrl;
  }

  // CORRIGIR: método hasRedesSociais
  hasRedesSociais(): boolean {
    const userProfile = this.userService.userProfile;
    if (!userProfile) return false;
    
    return !!(
      userProfile['instagram'] ||
      userProfile['facebook'] ||
      userProfile['linkedin'] ||
      userProfile['youtube'] ||
      userProfile['twitter'] ||
      userProfile['tiktok'] ||
      userProfile['pinterest']
    );
  }

  // ADICIONAR: método helper para conversão segura
  private safeString(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  }

  // ADICIONAR: getters para cada rede (alternativa mais robusta)
  get instagramUrl(): string | null {
    const url = this.userService.userProfile?.['instagram'];
    return url ? this.formatUrl(url, 'instagram') : null;
  }

  get facebookUrl(): string | null {
    const url = this.userService.userProfile?.['facebook'];
    return url ? this.formatUrl(url, 'facebook') : null;
  }

  get linkedinUrl(): string | null {
    const url = this.userService.userProfile?.['linkedin'];
    return url ? this.formatUrl(url, 'linkedin') : null;
  }

  get youtubeUrl(): string | null {
    const url = this.userService.userProfile?.['youtube'];
    return url ? this.formatUrl(url, 'youtube') : null;
  }

  get twitterUrl(): string | null {
    const url = this.userService.userProfile?.['twitter'];
    return url ? this.formatUrl(url, 'twitter') : null;
  }

  get tiktokUrl(): string | null {
    const url = this.userService.userProfile?.['tiktok'];
    return url ? this.formatUrl(url, 'tiktok') : null;
  }

  get pinterestUrl(): string | null {
    const url = this.userService.userProfile?.['pinterest'];
    return url ? this.formatUrl(url, 'pinterest') : null;
  }
}