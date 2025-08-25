// Alteração: remoção de logs de depuração (console.log)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-capa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './capa.component.html', 
  styleUrls: ['./capa.component.scss']
})
export class CapaComponent implements OnInit, OnDestroy {
  userProfile: any;
  private unsubscribe$ = new Subject<void>();

  // 1. Mudar o userService para público para permitir acesso no template
  constructor(public userService: UserService) { }

  ngOnInit() {
    // Receber o perfil da homepage
    this.userService.homepageProfile$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(profile => {
        if (profile) {
          this.userProfile = profile;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public qrCodeUrl: string = 'https://dentistas.com.br/assets/qrcode_dentistascombr.png';

  // 2. Adicionar métodos de acesso que usem o userProfile local
  getEnderecoCompleto(): string {
    if (this.userProfile) {
      return `${this.userProfile.endereco}, ${this.userProfile.cidade} - ${this.userProfile.estado}`;
    }
    return '';
  }
  
  getCidadeEstadoCep(): string {
    if (this.userProfile) {
      return `${this.userProfile.cidade} - ${this.userProfile.estado}, CEP ${this.userProfile.cep}`;
    }
    return '';
  }

  getBackgroundImage(): string {
    // Se o usuário tiver uma foto de capa, use-a. Caso contrário, use uma imagem padrão
    const backgroundImage = this.userProfile?.fotoCapa || 'assets/images/dental-office-background.jpg';
    return `url('${backgroundImage}')`;
  }

  // Método para formatar especialidades
  formatEspecialidades(): string {
    if (!this.userProfile?.especialidades || this.userProfile.especialidades.length === 0) {
      return '';
    }
    
    return this.userProfile.especialidades.join(' • ');
  }

  getWhatsapp(): string {
    if (!this.userProfile?.whatsapp) return '5511999999999'; // Número padrão
    
    // Remove caracteres não numéricos
    return this.userProfile.whatsapp.replace(/\D/g, '');
  }

  getWhatsappFormatado(): string {
    if (!this.userProfile?.whatsapp) return '5511999999999';
    return this.userProfile.whatsapp.replace(/\D/g, '');
  }

  // Dados principais e foto
  getNome() {
    return this.userProfile?.nome || 'Dentista';
  }

  getEspecialidades() {
    const especialidades = this.userProfile?.especialidades || '';
    return typeof especialidades === 'string' ? especialidades.split(',').map((e: string) => e.trim()) : [];
  }

  getProfileImage() {
    return this.userProfile?.foto || 'https://dentistas.com.br/assets/default-profile.png';
  }

  getTituloProfissional() {
    return this.userProfile?.titulo_profissional || 'Cirurgião-Dentista';
  }

}