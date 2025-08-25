// Alteração: remoção de logs de depuração (console.log)
/* 
  Métodos do componente HomepageComponent:
  1. ngOnInit() - Inicializa o componente, verificando se o usuário está logado e, caso haja um username na URL, carrega o perfil público.
  2. loadUserProfile(username: string): void - Busca e carrega o perfil público do usuário com base no username.
  3. openHomepage(): void - Abre a homepage pública do usuário em uma nova janela.
*/

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, UserProfile } from '../shared/services/user.service'; // ← IMPORTAR interface
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';

// Importações dos componentes
import { ChatbotHomepageComponent } from "./chatbot-homepage/chatbot-homepage.component";
import { EnderecoComponent } from "./endereco/endereco.component";
import { TitulacoesComponent } from "./titulacoes/titulacoes.component";
import { HorariosComponent } from "./horarios/horarios.component";
import { ConveniosComponent } from "./convenios/convenios.component";
import { RedesComponent } from "./redes/redes.component";
import { CapaComponent } from "./capa/capa.component";
import { RodapeHomepageComponent } from "./rodape-homepage/rodape-homepage.component";
import { ContatoComponent } from "./contato/contato.component";
import { CartaoComponent } from "./cartao/cartao.component";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ChatbotHomepageComponent,
    EnderecoComponent,
    TitulacoesComponent,
    HorariosComponent,
    ConveniosComponent,
    RedesComponent,
    CapaComponent,
    RodapeHomepageComponent,
    CartaoComponent,
    ContatoComponent,
  ]
})
export class HomepageComponent implements OnInit {
  username: string = '';
  userProfile: UserProfile | null = null; // ← Agora usando interface do UserService
  errorMessage: string = '';
  isLoading: boolean = true;
  isChatbotExpanded: boolean = false;
  showContato: boolean = false;
  showCartao: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Capturar parâmetros da URL
    this.route.params.subscribe(params => {
      const usernameParam = params['username'];
      
      if (usernameParam) {
        this.username = usernameParam;
        this.loadUserProfile(usernameParam);
      } else {
        console.warn('HomepageComponent: Nenhum username detectado na URL');
        this.errorMessage = 'Perfil não encontrado';
        this.isLoading = false;
      }
    });
  }

  loadUserProfile(username: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.loadUserProfileByUsername(username)
      .pipe(take(1))
      .subscribe({
        next: (userProfiles: UserProfile[]) => {
          if (userProfiles && userProfiles.length > 0) {
            this.userProfile = userProfiles[0];
            
            // Agora está garantidamente compatível
            this.userService.setHomepageProfile(this.userProfile);
          } else {
            console.error(`HomepageComponent: Nenhum perfil encontrado para username: ${username}`);
            this.errorMessage = `Não foi encontrado um perfil com o username: ${username}`;
          }
          this.isLoading = false;
        },
        error: (error: Error) => {
          console.error('HomepageComponent: Erro ao carregar perfil:', error);
          this.errorMessage = 'Erro ao carregar o perfil.';
          this.isLoading = false;
        }
      });
  }
  
  onChatbotExpansionChange(expanded: boolean): void {
    this.isChatbotExpanded = expanded;
  }

  formatWhatsApp(phone: string): string {
    if (!phone) return '';
    // Remove tudo que não for número
    return phone.replace(/\D/g, '');
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }
}
