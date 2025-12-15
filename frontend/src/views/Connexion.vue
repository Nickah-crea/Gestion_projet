<template>
  <div class="app-wrapper-co-conn">
    
    <!-- Icônes flottantes film & carnet -->
    <div class="film-icons-background">
      <i class="film-icon icon-1 fas fa-film icon-accent"></i>
      <i class="film-icon icon-2 fas fa-video icon-light"></i>
      <i class="film-icon icon-3 fas fa-camera icon-dark"></i>
      <i class="film-icon icon-4 fas fa-clapperboard icon-accent"></i>
      <i class="film-icon icon-5 fas fa-book icon-light"></i>
      <i class="film-icon icon-6 fas fa-scroll icon-dark"></i>
      <i class="film-icon icon-7 fas fa-theater-masks icon-accent"></i>
      <i class="film-icon icon-8 fas fa-star icon-light"></i>
      <i class="film-icon icon-9 fas fa-ticket-alt icon-dark"></i>
      <i class="film-icon icon-10 fas fa-notebook icon-accent"></i>
      <i class="film-icon icon-11 fas fa-pen-fancy icon-light"></i>
      <i class="film-icon icon-12 fas fa-masks-theater icon-dark"></i>
    </div>

    <!-- Contenu principal -->
    <div class="connexion-container-conn">
      <!-- RETIRER la classe inscription-mode conditionnelle -->
      <div class="connexion-form-section-conn">
        
        <!-- Carte style carnet de tournage -->
        <!-- RETIRER la classe inscription-mode conditionnelle -->
        <div class="connexion-card-conn">
          
          <!-- Logo avec icône -->
          <div class="cinema-logo">
            <i class="logo-icon fas fa-scroll"></i>
            <h1 class="logo-text">{{ isLoginForm ? 'CONNEXION' : 'INSCRIPTION' }}</h1>
            <div class="logo-subtitle">{{ isLoginForm ? 'Accédez à votre carnet de tournage' : 'Créez votre espace créatif' }}</div>
          </div>
          
          <!-- Formulaire de connexion -->
          <div v-if="isLoginForm" class="connexion-formulaire">
            <form @submit.prevent="seConnecter" class="cinema-form">
              <div class="form-group-cinema">
                <div class="input-wrapper">
                  <i class="input-icon fas fa-envelope"></i>
                  <input 
                    type="email" 
                    id="email-connexion-conn"
                    v-model="loginEmail" 
                    required 
                    placeholder="Votre email professionnel"
                    class="cinema-input"
                  />
                </div>
              </div>
              
              <div class="form-group-cinema">
                <div class="input-wrapper">
                  <i class="input-icon fas fa-lock"></i>
                  <input 
                    type="password" 
                    id="password-connexion-conn"
                    v-model="loginPassword" 
                    required 
                    placeholder="Votre mot de passe"
                    class="cinema-input"
                  />
                </div>
              </div>
              
              <div class="form-options-cinema">
                <a href="#" class="forgot-link-cinema">Mot de passe oublié?</a>
              </div>
              
              <div v-if="loginError" class="error-message-cinema">
                <i class="fas fa-exclamation-circle"></i>
                {{ loginError }}
              </div>
              
              <button type="submit" class="premier-btn" :disabled="loginLoading">
                <span class="btn-content">
                  <span v-if="loginLoading" class="loading-film">
                    <span class="film-frame"></span>
                    <span class="film-frame"></span>
                    <span class="film-frame"></span>
                  </span>
                  <span v-else>
                     SE CONNECTER <i class="fas fa-play-circle"></i>
                  </span>
                </span>
              </button>
            </form>
          </div>
          
          <!-- Formulaire d'inscription avec champs côte à côte -->
          <div v-else class="inscription-formulaire">
            <form @submit.prevent="sInscrire" class="cinema-form container-inscription">
              <!-- Nom et Email côte à côte -->
              <div class="form-row">
                <!-- Nom -->
                <div class="form-group-cinema">
                  <div class="input-wrapper">
                    <i class="input-icon fas fa-user"></i>
                    <input 
                      type="text" 
                      v-model="registerNom" 
                      required 
                      placeholder="Nom complet"
                      class="cinema-input"
                    />
                  </div>
                </div>
                
                <!-- Email -->
                <div class="form-group-cinema">
                  <div class="input-wrapper">
                    <i class="input-icon fas fa-at"></i>
                    <input 
                      type="email" 
                      v-model="registerEmail" 
                      required 
                      placeholder="Email professionnel"
                      class="cinema-input"
                      @blur="verifierEmail"
                      :class="{ 'error': emailVerifie && emailExiste }"
                    />
                    <div v-if="emailVerifie" class="email-status-cinema">
                      <i class="fas fa-check" v-if="!emailExiste"></i>
                      <i class="fas fa-times" v-else></i>
                      <span v-if="emailExiste" class="email-error-cinema">Email déjà utilisé</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mot de passe et Confirmation côte à côte -->
              <div class="form-row">
                <!-- Mot de passe -->
                <div class="form-group-cinema">
                  <div class="input-wrapper">
                    <i class="input-icon fas fa-key"></i>
                    <input 
                      type="password" 
                      v-model="registerPassword" 
                      required 
                      placeholder="Mot de passe"
                      class="cinema-input"
                      :class="{ 'error': registerPassword.length > 0 && registerPassword.length < 6 }"
                    />
                  </div>
                  <div v-if="registerPassword.length > 0 && registerPassword.length < 6" class="password-hint-cinema">
                    Min. 6 caractères
                  </div>
                </div>

                <!-- Confirmation mot de passe -->
                <div class="form-group-cinema">
                  <div class="input-wrapper">
                    <i class="input-icon fas fa-shield-alt"></i>
                    <input 
                      type="password" 
                      v-model="registerConfirmPassword" 
                      required 
                      placeholder="Confirmer mot de passe"
                      class="cinema-input"
                      :class="{ 'error': registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword }"
                    />
                  </div>
                  <div v-if="registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword" class="password-hint-cinema">
                    Mots de passe différents
                  </div>
                </div>
              </div>
              
              <!-- Rôle et Spécialité côte à côte -->
              <div class="form-row">
                <!-- Rôle (optionnel) -->
                <div class="form-group-cinema">
                  <div class="input-wrapper">
                    <i class="input-icon fas fa-theater-masks"></i>
                    <select 
                      v-model="registerRole" 
                      class="cinema-input cinema-select"
                    >
                      <option value="">Rôle (optionnel)</option>
                      <option value="SCENARISTE">Scénariste</option>
                      <option value="REALISATEUR">Réalisateur</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                </div>

                <!-- Champs conditionnels pour scénariste/réalisateur -->
                <div v-if="registerRole === 'SCENARISTE' || registerRole === 'REALISATEUR'" class="form-group-cinema">
                  <div class="input-wrapper">
                    <i class="input-icon fas fa-star"></i>
                    <input 
                      type="text" 
                      v-model="registerSpecialite" 
                      placeholder="Spécialité"
                      class="cinema-input"
                    />
                  </div>
                </div>
              </div>

              <!-- Biographie (pleine largeur) -->
              <div v-if="registerRole === 'SCENARISTE' || registerRole === 'REALISATEUR'" class="form-group-cinema">
                <div class="input-wrapper">
                  <i class="input-icon fas fa-book"></i>
                  <textarea 
                    v-model="registerBiographie" 
                    placeholder="Biographie professionnelle..."
                    class="cinema-input textarea-cinema"
                    rows="2"
                  ></textarea>
                </div>
              </div>
              
              <!-- Message d'erreur général -->
              <div v-if="registerError" class="error-message-cinema">
                <i class="fas fa-exclamation-circle"></i>
                {{ registerError }}
              </div>
              
              <!-- Bouton d'inscription -->
              <button 
                type="submit" 
                class="premier-btn" 
                :disabled="registerLoading || emailExiste || registerPassword.length < 6 || registerPassword !== registerConfirmPassword"
              >
                <span class="btn-content">
                  <span v-if="registerLoading" class="loading-film">
                    <span class="film-frame"></span>
                    <span class="film-frame"></span>
                    <span class="film-frame"></span>
                  </span>
                  <span v-else>
                    <i class="fas fa-feather-alt"></i> CRÉER MON COMPTE
                  </span>
                </span>
              </button>
            </form>
          </div>

          <!-- Lien de bascule -->
          <div class="signup-link-cinema-center">
            <div class="link-content">
              {{ isLoginForm ? "Nouveau sur la plateforme ?" : "Déjà membre ?" }}
              <a href="#" @click.prevent="isLoginForm ? switchToRegister() : switchToLogin()" class="switch-link">
                {{ isLoginForm ? "S'inscrire" : "Se connecter" }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AuthView',
  data() {
    return {
      // État du formulaire
      isLoginForm: true,
      
      // Données de connexion
      loginEmail: '',
      loginPassword: '',
      rememberMe: false,
      loginLoading: false,
      loginError: '',
      
      // Données d'inscription
      registerNom: '',
      registerEmail: '',
      registerPassword: '',
      registerConfirmPassword: '',
      registerRole: '',
      registerSpecialite: '',
      registerBiographie: '',
      registerLoading: false,
      registerError: '',
      emailVerifie: false,
      emailExiste: false
    };
  },
  mounted() {
    // Nettoyer les anciennes classes de thème
    document.body.classList.remove('dark-theme');
  },
  methods: {
    // Navigation entre formulaires
    switchToLogin() {
      this.isLoginForm = true;
      this.loginError = '';
      this.registerError = '';
    },
    
    switchToRegister() {
      this.isLoginForm = false;
      this.loginError = '';
      this.registerError = '';
    },

    // CONNEXION
    async seConnecter() {
      this.loginLoading = true;
      this.loginError = '';
      
      try {
        const response = await axios.post('/api/auth/login', {
          email: this.loginEmail,
          password: this.loginPassword
        });
        
        // Stocker les informations de l'utilisateur
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        // Rediriger en fonction du rôle
        this.redirectByRole(response.data.user.role);
        
      } catch (error) {
        console.error('Erreur de connexion:', error);
        this.loginError = error.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      } finally {
        this.loginLoading = false;
      }
    },

    // INSCRIPTION
    async verifierEmail() {
      if (!this.registerEmail) return;
      
      try {
        const response = await axios.get(`/api/auth/verifier-email?email=${this.registerEmail}`);
        this.emailExiste = response.data.existe;
        this.emailVerifie = true;
      } catch (error) {
        console.error('Erreur vérification email:', error);
      }
    },
    
    async sInscrire() {
      // Validation
      if (this.registerPassword !== this.registerConfirmPassword) {
        this.registerError = "Les mots de passe ne correspondent pas";
        return;
      }
      
      if (this.registerPassword.length < 6) {
        this.registerError = "Le mot de passe doit contenir au moins 6 caractères";
        return;
      }
      
      if (this.emailExiste) {
        this.registerError = "Cet email est déjà utilisé";
        return;
      }

      this.registerLoading = true;
      this.registerError = '';
      
      try {
        const response = await axios.post('/api/auth/register', {
          nom: this.registerNom,
          email: this.registerEmail,
          motDePasse: this.registerPassword,
          role: this.registerRole || 'UTILISATEUR',
          specialite: this.registerSpecialite,
          biographie: this.registerBiographie
        });
        
        // Connexion automatique après inscription réussie
        await this.autoLoginAfterRegister();
        
      } catch (error) {
        console.error('Erreur inscription:', error);
        this.registerError = error.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        this.registerLoading = false;
      }
    },

    async autoLoginAfterRegister() {
      try {
        // Connexion automatique avec les mêmes identifiants
        const loginResponse = await axios.post('/api/auth/login', {
          email: this.registerEmail,
          password: this.registerPassword
        });
        
        // Stocker les informations de l'utilisateur
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
        localStorage.setItem('token', loginResponse.data.token);
        
        // Rediriger directement vers le dashboard selon le rôle
        this.redirectByRole(loginResponse.data.user.role);
        
      } catch (loginError) {
        console.error('Erreur connexion automatique:', loginError);
        // Si la connexion auto échoue, rediriger vers la page de connexion
        this.$router.push('/connexion?message=Inscription réussie! Veuillez vous connecter.');
      }
    },

    // Redirection par rôle
    redirectByRole(role) {
      let route = '/accueil';
      
      switch (role) {
        case 'ADMIN':
          route = '/admin';
          break;
        case 'SCENARISTE':
        case 'REALISATEUR':
          route = '/scenariste';
          break;
        case 'UTILISATEUR':
        default:
          route = '/accueil';
      }
      
      this.$router.push(route);
    }
  }
};
</script>

