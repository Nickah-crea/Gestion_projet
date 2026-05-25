<template>
  <div class="app-wrapper-co-conn">
    <div class="connexion-container-conn">
      <!-- Conteneur split-screen -->
      <div class="split-screen-container" :class="{ 'inscription-mode': !isLoginForm }">
        
        <!-- Diaporama d'images -->
        <div class="image-side">
          <div class="image-wrapper">
            <div class="slideshow-container">
              <!-- Images du diaporama -->
              <div 
                v-for="(image, index) in slideshowImages" 
                :key="index"
                class="slide"
                :class="{ 'active': currentSlide === index }"
              >
                <img 
                  :src="image.src" 
                  :alt="image.alt"
                  class="slideshow-image"
                />
              </div>
              
              <!-- Overlay avec contenu -->
              <div class="image-overlay">
                <div class="overlay-content">
                  <h2 class="overlay-title">
                    {{ isLoginForm ? 'VDFI' : 'VOTRE PLATEAU' }}
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
              
              <!-- Indicateurs du diaporama -->
              <div class="slideshow-dots">
                <span 
                  v-for="(image, index) in slideshowImages" 
                  :key="index"
                  class="dot"
                  :class="{ 'active': currentSlide === index }"
                  @click="currentSlide = index"
                ></span>
              </div>
              
              <!-- Boutons de navigation -->
              <button class="slideshow-nav prev" @click="prevSlide">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="slideshow-nav next" @click="nextSlide">
                <i class="fas fa-chevron-right"></i>
              </button>
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
                        :type="showLoginPassword ? 'text' : 'password'"
                        id="password-connexion-conn"
                        v-model="loginPassword" 
                        required 
                        placeholder="Votre mot de passe"
                        class="cinema-input"
                      />
                      <i 
                        class="password-toggle-icon fas" 
                        :class="showLoginPassword ? 'fa-eye-slash' : 'fa-eye'"
                        @click="toggleLoginPassword"
                      ></i>
                    </div>
                  </div>
                  
                  <div class="form-options-cinema">
                    <router-link to="/forgot-password" class="forgot-password-link">
                      Mot de passe oublié ?
                    </router-link>
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
                  <div class="form-row double">
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

                  <div class="form-row double">
                    <div class="form-group-cinema">
                      <div class="input-wrapper">
                        <i class="input-icon fas fa-key"></i>
                        <input 
                          :type="showRegisterPassword ? 'text' : 'password'"
                          v-model="registerPassword" 
                          required 
                          placeholder="Mot de passe"
                          class="cinema-input"
                          :class="{ 'error': registerPassword.length > 0 && registerPassword.length < 6 }"
                        />
                        <i 
                          class="password-toggle-icon fas" 
                          :class="showRegisterPassword ? 'fa-eye-slash' : 'fa-eye'"
                          @click="toggleRegisterPassword"
                        ></i>
                      </div>
                      <div v-if="registerPassword.length > 0 && registerPassword.length < 6" class="password-hint-cinema">
                        Min. 6 caractères
                      </div>
                    </div>

                    <div class="form-group-cinema">
                      <div class="input-wrapper">
                        <i class="input-icon fas fa-shield-alt"></i>
                        <input 
                          :type="showRegisterConfirmPassword ? 'text' : 'password'"
                          v-model="registerConfirmPassword" 
                          required 
                          placeholder="Confirmer mot de passe"
                          class="cinema-input"
                          :class="{ 'error': registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword }"
                        />
                        <i 
                          class="password-toggle-icon fas" 
                          :class="showRegisterConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
                          @click="toggleRegisterConfirmPassword"
                        ></i>
                      </div>
                      <div v-if="registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword" class="password-hint-cinema">
                        Mots de passe différents
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-row double">
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
                  
                  <div v-if="registerError" class="error-message-cinema">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ registerError }}
                  </div>
                  
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
// IMPORTANT: Importer les images directement
import image1 from '../assets/img/connex-01.jpg';
import image2 from '../assets/img/connex-02.jpg';

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
      emailExiste: false,

      // États pour afficher/masquer les mots de passe
      showLoginPassword: false,
      showRegisterPassword: false,
      showRegisterConfirmPassword: false,

      // Diaporama - Utiliser les imports
      slideshowImages: [
        {
          src: image1,
          alt: 'Scénariste au travail 1'
        },
        {
          src: image2,
          alt: 'Scénariste au travail 2'
        }
      ],
      currentSlide: 0,
      slideshowInterval: null
    };
  },
  mounted() {
    document.body.classList.remove('dark-theme');
    this.startSlideshow();
  },
  beforeDestroy() {
    this.stopSlideshow();
  },
  methods: {
    startSlideshow() {
      this.slideshowInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    },
    
    stopSlideshow() {
      if (this.slideshowInterval) {
        clearInterval(this.slideshowInterval);
      }
    },
    
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.slideshowImages.length;
    },
    
    prevSlide() {
      this.currentSlide = (this.currentSlide - 1 + this.slideshowImages.length) % this.slideshowImages.length;
    },
    
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
    
    toggleLoginPassword() {
      this.showLoginPassword = !this.showLoginPassword;
    },
    
    toggleRegisterPassword() {
      this.showRegisterPassword = !this.showRegisterPassword;
    },
    
    toggleRegisterConfirmPassword() {
      this.showRegisterConfirmPassword = !this.showRegisterConfirmPassword;
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

    async seConnecter() {
      this.loginLoading = true;
      this.loginError = '';
      
      try {
        const response = await axios.post('/api/auth/login', {
          email: this.loginEmail,
          password: this.loginPassword
        });
        
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        this.redirectByRole(response.data.user.role);
        
      } catch (error) {
        console.error('Erreur de connexion:', error);
        this.loginError = error.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      } finally {
        this.loginLoading = false;
      }
    },

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
        
        await this.autoLoginAfterRegister();
        
      } catch (error) {
        console.error('Erreur inscription:', error);
        this.registerError = error.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        this.registerLoading = false;
      }
    },

    async autoLoginAfterRegister() {
      try {
        const loginResponse = await axios.post('/api/auth/login', {
          email: this.registerEmail,
          password: this.registerPassword
        });
        
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
        localStorage.setItem('token', loginResponse.data.token);
        
        this.redirectByRole(loginResponse.data.user.role);
        
      } catch (loginError) {
        console.error('Erreur connexion automatique:', loginError);
        this.$router.push('/connexion?message=Inscription réussie! Veuillez vous connecter.');
      }
    },

    redirectByRole(role) {
      let route = '/accueil';
      
      switch (role) {
        case 'ADMIN':
          route = '/admin';
          break;
        case 'SCENARISTE':
        case 'REALISATEUR':
        case 'UTILISATEUR':
          route = '/scenariste';
          break;
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

/* Styles du diaporama */
.slideshow-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  z-index: 1;
}

.slide.active {
  opacity: 1;
  z-index: 2;
}

.slideshow-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.image-overlay {
  z-index: 3;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0) 100%
  );
}

.slideshow-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 4;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.dot.active {
  width: 24px;
  border-radius: 10px;
  background: #8A9B78;
  box-shadow: 0 0 8px rgba(138, 155, 120, 0.6);
}

.slideshow-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 4;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slideshow-nav:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.slideshow-nav.prev {
  left: 20px;
}

.slideshow-nav.next {
  right: 20px;
}

.slideshow-nav i {
  font-size: 18px;
}
</style>

