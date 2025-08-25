// Alteração: remoção de logs de depuração (console.log)
/**
 * HomepageIntroComponent
 * 
 * This component displays the introduction to a user's homepage and allows them to preview and manage their public profile.
 * 
 * Methods:
 * - ngOnInit(): Initializes the component, loads the authenticated user and their profile data with username.
 * - loadUserProfile(username: string): Loads detailed user profile information by username.
 * - openHomepage(): Opens the user's public homepage in a new browser tab.
 * - editProfile(): Navigates to the profile edit page.
 * - voltar(): Navigates back to the previous page.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { UserService } from '../../shared/services/user.service';
import { FirestoreService } from '../../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
// CORRIGIR: usar firebase.User em vez de User do @firebase/auth
import firebase from 'firebase/compat/app';

// CORRIGIR: interface para tipagem
interface UserProfile {
  nome?: string;
  displayName?: string;
  username?: string;
  role?: string;
  email?: string;
  [key: string]: unknown;
}

// CORRIGIR: interface para FirestoreService
interface FirestoreRecord {
  id?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-homepage-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homepage-intro.component.html',
  styleUrls: ['./homepage-intro.component.scss']
})
export class HomepageIntroComponent implements OnInit {
  public username: string | null = null;
  public userProfile: UserProfile | null = null; 
  public errorMessage: string = '';
  public loggedInUser: firebase.User | null = null; // CORRIGIR: usar firebase.User
  public isLoading: boolean = true;
  public isCurrentUserProfile: boolean = false;
  public userRole: string = '';
  
  // CORRIGIR: tipagem específica em vez de any
  contextData: Record<string, unknown> = {};

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private navegacaoService: NavegacaoService,
    private userService: UserService,
    private firestoreService: FirestoreService<FirestoreRecord>,
    private auth: AngularFireAuth,
  ) { }

  /**
   * Initializes the component by retrieving the authenticated user and their profile data.
   * 
   * First checks if a user is logged in via AngularFireAuth, then retrieves their profile
   * data to find the username. If a username is found, it calls loadUserProfile to fetch
   * detailed profile information. Sets appropriate error messages if the user is not
   * authenticated or no username is found in their profile.
   * 
   * @returns void
   */
  ngOnInit(): void {
    this.isLoading = true;
    
    // First, get the authenticated user
    this.auth.authState.subscribe(user => {
      if (user) {
        this.loggedInUser = user; // CORRIGIR: agora compatível com firebase.User
        
        // Then get the user profile data that contains the username
        this.userService.getUserProfileData().subscribe(
          profileData => {
            
            if (profileData && profileData['username']) {
              const username = profileData['username'];
              this.username = typeof username === 'string' ? username : '';
              
              // Now load the profile for display
              if (this.username) {
                this.loadUserProfile(this.username);
              }
            } else {
              this.errorMessage = "Você ainda não definiu um nome de usuário. Por favor, atualize seu perfil.";
              this.isLoading = false;
            }
          },
          () => { // CORRIGIR: remover parâmetro 'error' não usado
            this.errorMessage = "Erro ao carregar os dados do perfil.";
            this.isLoading = false;
          }
        );
      } else {
        this.errorMessage = "Por favor, faça login para acessar sua página.";
        this.isLoading = false;
      }
    }, () => { // CORRIGIR: remover parâmetro 'error' não usado
      this.errorMessage = "Erro de autenticação.";
      this.isLoading = false;
    });
  }

  /**
   * Loads detailed user profile information for a given username.
   * 
   * Fetches complete profile data from Firestore using the FirestoreService's
   * getRegistroByUsername method. If a profile is found, it updates the component's
   * userProfile property and determines whether this is the current user's profile.
   * The profile data is also stored in localStorage for easy access across the app.
   * 
   * @param username - The username to load profile data for
   * @returns void
   */
  loadUserProfile(username: string): void {
    
    // Let's make sure we have a valid username
    if (!username) {
      this.errorMessage = "Nome de usuário não encontrado.";
      this.isLoading = false;
      return;
    }
    
    this.firestoreService.getRegistroByUsername('usuarios/dentistascombr/users', username).subscribe(
      (userProfiles) => {
        if (userProfiles && userProfiles.length > 0) {
          this.userProfile = userProfiles[0] as UserProfile;
          this.errorMessage = '';
          
          // Check if this is the current user's profile
          if (this.loggedInUser && this.loggedInUser.email && 
              this.userProfile.email === this.loggedInUser.email) {
            this.isCurrentUserProfile = true;
          }
          
          // Store in localStorage for easier access
          localStorage.setItem('userData', JSON.stringify(this.userProfile));
        } else {
          this.errorMessage = 'Perfil não encontrado.';
        }
        this.isLoading = false;
      },
      () => { // CORRIGIR: remover parâmetro 'error' não usado
        this.errorMessage = 'Erro ao carregar perfil.';
        this.isLoading = false;
      }
    );
  }

  /**
   * Opens the user's public homepage in a new browser tab.
   * 
   * Constructs a URL using the current origin and the user's username,
   * then opens this URL in a new browser tab with secure parameters.
   * If no username is available, displays an error message.
   * 
   * @returns void
   */
  openHomepage(): void {
    
    if (this.username) {
      // Use the current origin to build the URL
      const homepageUrl = `${window.location.origin}/${this.username}`;
      window.open(homepageUrl, '_blank', 'noopener,noreferrer');
    } else {
      this.errorMessage = "Nome de usuário não definido. Por favor, atualize seu perfil.";
    }
  }

  /**
   * Navigates to the profile edit page.
   * 
   * Redirects the user to the profile editing page to allow them to update their
   * profile information, including their username and other public details.
   * 
   * @returns void
   */
  editProfile(): void {
    this.router.navigate(['/perfil']);
  }

  /**
   * Navigates back to the previous page.
   * 
   * Uses the NavigationService to return to the previous page in the navigation history.
   * 
   * @returns void
   */
  voltar(): void {
    this.navegacaoService.goBack();
  }

  // ADICIONAR: métodos auxiliares
  getUserDisplayName(): string {
    if (this.username) {
      return this.username;
    }
    
    if (this.userProfile) {
      const nome = this.userProfile['nome'] || this.userProfile['displayName'];
      return typeof nome === 'string' ? nome : 'Usuário';
    }
    
    return 'Usuário';
  }

  getUserRole(): string {
    return this.userRole || 'dentista';
  }

  isUserLoggedIn(): boolean {
    return this.userProfile !== null;
  }

  // ADICIONAR: método para formatar saudação
  getGreeting(): string {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
      greeting = 'Bom dia';
    } else if (hour < 18) {
      greeting = 'Boa tarde';
    } else {
      greeting = 'Boa noite';
    }
    
    const displayName = this.getUserDisplayName();
    return `${greeting}, ${displayName}!`;
  }

  // CORRIGIR: método para role formatada com verificação null
  getFormattedRole(): string {
    // CORRIGIR: verificação de null
    if (!this.userProfile) {
      return 'Profissional';
    }
    
    const role = this.userProfile['role'] || this.userRole || 'dentista';
    const roleStr = typeof role === 'string' ? role : 'dentista';
    
    // CORRIGIR: indentação
    switch (roleStr.toLowerCase()) {
    case 'dentista':
      return 'Dr(a).';
    case 'secretaria':
      return 'Secretária';
    case 'assistente':
      return 'Assistente';
    case 'admin':
      return 'Administrador';
    default:
      return 'Profissional';
    }
  }

  // ADICIONAR: método para verificar se tem permissão de edição
  canEditProfile(): boolean {
    return this.isCurrentUserProfile && this.loggedInUser !== null;
  }

  // ADICIONAR: método para obter email do usuário
  getUserEmail(): string {
    if (this.userProfile && this.userProfile.email) {
      return this.userProfile.email;
    }
    
    if (this.loggedInUser && this.loggedInUser.email) {
      return this.loggedInUser.email;
    }
    
    return '';
  }

  // ADICIONAR: método para verificar se dados estão carregados
  isDataLoaded(): boolean {
    return !this.isLoading && this.userProfile !== null;
  }

  // ADICIONAR: método para tratamento de erros
  handleError(errorMsg: string): void {
    this.errorMessage = errorMsg;
    this.isLoading = false;
    console.error('Homepage Intro Error:', errorMsg);
  }

  // ADICIONAR: método para limpar erro
  clearError(): void {
    this.errorMessage = '';
  }

  // ADICIONAR: método para recarregar dados
  retryLoad(): void {
    this.clearError();
    this.ngOnInit();
  }
}