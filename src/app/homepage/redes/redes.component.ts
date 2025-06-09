// Alteração: remoção de logs de depuração (console.log)
import { Component } from '@angular/core';
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
export class RedesComponent {
  // Removemos ngOnChanges e eventos de lifecycle
  
  constructor(
    private util: UtilService,
    public userService: UserService) {
  }

  // Verificar se o usuário tem pelo menos uma rede social configurada
  hasRedesSociais(): boolean {
    const userProfile = this.userService.userProfile;
    if (!userProfile) return false;
    
    return !!(
      userProfile.instagram ||
      userProfile.facebook ||
      userProfile.linkedin ||
      userProfile.youtube ||
      userProfile.twitter ||
      userProfile.tiktok ||
      userProfile.pinterest
    );
  }
  
  // Formatar URLs para redes sociais
  formatUrl(url: string, type: string = '' ): string {
    if (!url) return '';
    
    url = url.trim();
    if (url.startsWith('http')) return url;
    
    return this.util.formatUrl(url, type);

  }
}