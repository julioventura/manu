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
import { ActivatedRoute, Router } from '@angular/router';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { UserService } from '../../shared/services/user.service';
import { FirestoreService } from '../../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-homepage-intro',
  templateUrl: './homepage-intro.component.html',
  styleUrls: ['./homepage-intro.component.scss'],
  standalone: false
})
export class HomepageIntroComponent implements OnInit {
  public username: string | null = null;
  public userProfile: any = {}; 
  public errorMessage: string = '';
  public loggedInUser: any;
  public isLoading: boolean = true;
  public isCurrentUserProfile: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private navegacaoService: NavegacaoService,
    private userService: UserService,
    private firestoreService: FirestoreService<any>,
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
        this.loggedInUser = user;
        
        // Then get the user profile data that contains the username
        this.userService.getUserProfileData().subscribe(
          profileData => {
            
            if (profileData && profileData.username) {
              this.userProfile = profileData;
              this.username = profileData.username;
              
              // Now load the profile for display
              if (this.username) {
                this.loadUserProfile(this.username);
              }
            } else {
              console.warn("No username found in profile data");
              this.errorMessage = "Você ainda não definiu um nome de usuário. Por favor, atualize seu perfil.";
              this.isLoading = false;
            }
          },
          error => {
            console.error("Error getting profile data:", error);
            this.errorMessage = "Erro ao carregar os dados do perfil.";
            this.isLoading = false;
          }
        );
      } else {
        console.error("No authenticated user");
        this.errorMessage = "Por favor, faça login para acessar sua página.";
        this.isLoading = false;
      }
    }, error => {
      console.error("Auth state error:", error);
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
          this.userProfile = userProfiles[0];
          this.errorMessage = '';
          
          // Check if this is the current user's profile
          if (this.loggedInUser && this.loggedInUser.email && 
              this.userProfile.email === this.loggedInUser.email) {
            this.isCurrentUserProfile = true;
          }
          
          // Store in localStorage for easier access
          localStorage.setItem('userData', JSON.stringify(this.userProfile));
        } else {
          console.error('Profile not found for username:', username);
          this.errorMessage = 'Perfil não encontrado.';
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading profile:', error);
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
      console.error("Cannot open homepage: No username defined");
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
}
