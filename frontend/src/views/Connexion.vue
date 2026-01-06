<template>
  <div class="app-wrapper-co-conn">
    <div class="connexion-container-conn">
      <!-- Conteneur split-screen -->
      <div class="split-screen-container" :class="{ 'inscription-mode': !isLoginForm }">
        
        <!-- Vidéo au lieu de l'image -->
        <div class="image-side">
          <div class="image-wrapper">
            <!-- Vidéo de fond -->
            <video 
              autoplay 
              muted 
              loop 
              playsinline 
              class="scenariste-video"
            > 
              <source src="../assets/img/autor.mp4" type="video/mp4">
              <!-- Fallback si la vidéo ne charge pas -->
              <img src="../assets/img/autor.png" alt="Scénariste au travail" class="scenariste-image">
            </video>
            
            <!-- Overlay avec contenu -->
            <div class="image-overlay">
              <div class="overlay-content">
                <h2 class="overlay-title">
                  {{ isLoginForm ? 'VOTRE CINÉMA' : 'VOTRE PLATEAU' }}
                </h2>
                <p class="overlay-text">
                  {{ isLoginForm 
                    ? 'Accédez à votre espace créatif dédié à la production cinématographique.' 
                    : 'Rejoignez la communauté des créateurs et organisez vos projets.' 
                  }}
                </p>
                <div class="overlay-features">
                  <div class="feature">
                    <i class="fas fa-film"></i>
                    <span>{{ isLoginForm ? 'Production' : 'Collaboration' }}</span>
                  </div>
                  <div class="feature">
                    <i class="fas fa-clapperboard"></i>
                    <span>{{ isLoginForm ? 'Gestion' : 'Création' }}</span>
                  </div>
                  <div class="feature">
                    <i class="fas fa-star"></i>
                    <span>{{ isLoginForm ? 'Organisation' : 'Innovation' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <div class="form-side">
          <div class="connexion-card-conn">
            
            <!-- Logo avec animation -->
            <div class="cinema-logo" :class="{ 'slide-out-left': switchingToRegister, 'slide-in-left': switchingToLogin }">
              <i class="logo-icon fas" :class="isLoginForm ? 'fa-sign-in-alt' : 'fa-user-plus'"></i>
              <h1 class="logo-text">{{ isLoginForm ? 'CONNEXION' : 'INSCRIPTION' }}</h1>
              <div class="logo-subtitle">{{ isLoginForm ? 'Accédez à votre carnet de tournage' : 'Créez votre espace créatif' }}</div>
            </div>
            
            <!-- Formulaire avec animation -->
            <transition :name="animationDirection" mode="out-in">
              <!-- Formulaire de connexion -->
              <div v-if="isLoginForm" key="login" class="connexion-formulaire">
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
              
              <!-- Formulaire d'inscription -->
              <div v-else key="register" class="inscription-formulaire">
                <form @submit.prevent="sInscrire" class="cinema-form container-inscription">
                  <!-- Nom et Email côte à côte -->
                  <div class="form-row double">
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
                  <div class="form-row double">
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
                  <div class="form-row double">
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
            </transition>

            <!-- Lien de bascule avec animation -->
            <div class="signup-link-cinema-center" :class="{ 'slide-out-right': switchingToRegister, 'slide-in-right': switchingToLogin }">
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
      animationDirection: 'slide-left',
      switchingToRegister: false,
      switchingToLogin: false,
      
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
    
    // Démarrer la vidéo si nécessaire
    this.initVideo();
  },
  methods: {
    // Initialiser la vidéo
    initVideo() {
      const video = this.$el?.querySelector('.scenariste-video');
      if (video) {
        // S'assurer que la vidéo se joue
        video.play().catch(error => {
          console.log('La vidéo ne peut pas se jouer automatiquement:', error);
          // Fallback: afficher l'image si la vidéo ne peut pas se jouer
          const fallbackImg = video.querySelector('.scenariste-image');
          if (fallbackImg) {
            video.style.display = 'none';
            fallbackImg.style.display = 'block';
          }
        });
      }
    },
    
    // Navigation entre formulaires avec animations
    switchToLogin() {
      this.animationDirection = 'slide-right';
      this.switchingToLogin = true;
      this.switchingToRegister = false;
      
      setTimeout(() => {
        this.isLoginForm = true;
        this.loginError = '';
        this.registerError = '';
        this.switchingToLogin = false;
      }, 400);
    },
    
    switchToRegister() {
      this.animationDirection = 'slide-left';
      this.switchingToRegister = true;
      this.switchingToLogin = false;
      
      setTimeout(() => {
        this.isLoginForm = false;
        this.loginError = '';
        this.registerError = '';
        this.switchingToRegister = false;
      }, 400);
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

<style scoped>
/* Animations pour le slide */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Classes d'animation pour le logo et lien */
.slide-out-left {
  animation: slideToLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.slide-in-left {
  animation: slideFromLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.slide-out-right {
  animation: slideToRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.slide-in-right {
  animation: slideFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideToLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes slideFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideToRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes slideFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Styles spécifiques pour la vidéo */
.scenariste-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  background-color: #000; /* Fond noir si la vidéo ne charge pas */
}

/* Fallback pour l'image */
.scenariste-image {
  display: none; /* Caché par défaut, affiché seulement si la vidéo échoue */
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>

