<template>
  <div class="app-wrapper-hollywood">
    
    <!-- Rideau de théâtre gauche -->
    <div class="theater-curtain left-curtain"></div>
    
    <!-- Rideau de théâtre droit -->
    <div class="theater-curtain right-curtain"></div>
    
    <!-- Projecteur principal -->
    <div class="main-spotlight"></div>
    
    <!-- Poussière dans les faisceaux lumineux -->
    <div class="dust-particles">
      <div class="dust-particle" v-for="n in 30" :key="n" :style="getDustStyle(n)"></div>
    </div>
    
    <!-- Bobines de film déroulées en vagues -->
    <div class="film-strips-background">
      <div class="film-strip strip-1"></div>
      <div class="film-strip strip-2"></div>
      <div class="film-strip strip-3"></div>
      <div class="film-strip strip-4"></div>
      <div class="film-strip strip-5"></div>
    </div>

    <!-- Scène centrale -->
    <div class="theater-stage">
      
      <!-- Logo cinéma élégant - TITRE DYNAMIQUE -->
      <div class="cinema-logo">
        <div class="logo-icon"><i class="fas fa-film"></i></div>
        <h1 class="logo-text">{{ isLoginForm ? 'CONNEXION' : 'INSCRIPTION' }}</h1>
        <div class="logo-subtitle">{{ isLoginForm ? 'Accédez à votre espace personnel' : 'Créez votre compte personnel' }}</div>
      </div>
      
      <!-- Carte de connexion style écran de cinéma -->
      <div class="cinema-screen-card">
        
        <!-- En-tête écran de cinéma -->
        <div class="screen-header">
          <div class="screen-perforations">
            <div class="perforation" v-for="n in 20" :key="n"></div>
          </div>
          <div class="screen-title">{{ isLoginForm ? 'ACCÈS STUDIO' : 'INSCRIPTION STUDIO' }}</div>
        </div>
        
        <!-- Contenu du formulaire -->
        <div class="screen-content">
          
          <!-- FORMULAIRE DE CONNEXION -->
          <form v-if="isLoginForm" @submit.prevent="seConnecter" class="cinema-form">
            <div class="form-group-cinema">
              <div class="input-wrapper">
                <i class="input-icon fas fa-envelope"></i>
                <input 
                  type="email" 
                  id="email-connexion-conn"
                  v-model="loginEmail" 
                  required 
                  placeholder="Email professionnel"
                  class="cinema-input"
                />
                <div class="input-glow"></div>
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
                  placeholder="Mot de passe"
                  class="cinema-input"
                />
                <div class="input-glow"></div>
              </div>
            </div>
            
            <div class="form-options-cinema">
              <a href="#" class="forgot-link-cinema">Mot de passe oublié?</a>
            </div>
            
            <div v-if="loginError" class="error-message-cinema">
              <i class="fas fa-exclamation-circle error-icon-cinema"></i>
              {{ loginError }}
            </div>
            
            <button type="submit" class="premier-btn" :disabled="loginLoading">
              <span class="btn-sparkle"></span>
              <span class="btn-content">
                <span v-if="loginLoading" class="loading-film">
                  <span class="film-frame"></span>
                  <span class="film-frame"></span>
                  <span class="film-frame"></span>
                </span>
                <span v-else>
                  SE CONNECTER <i class="fas fa-arrow-right"></i>
                </span>
              </span>
            </button>
          </form>

          <!-- FORMULAIRE D'INSCRIPTION -->
          <form v-else @submit.prevent="sInscrire" class="cinema-form">
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
                <div class="input-glow"></div>
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
                <div class="input-glow"></div>
                <div v-if="emailVerifie" class="email-status-cinema">
                  <i class="fas fa-check" v-if="!emailExiste"></i>
                  <i class="fas fa-times" v-else></i>
                  <span v-if="emailExiste" class="email-error-cinema">Cet email est déjà utilisé</span>
                </div>
              </div>
            </div>
            
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
                <div class="input-glow"></div>
                <div v-if="registerPassword.length > 0 && registerPassword.length < 6" class="password-hint-cinema">
                  Le mot de passe doit contenir au moins 6 caractères
                </div>
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
                  placeholder="Confirmer le mot de passe"
                  class="cinema-input"
                  :class="{ 'error': registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword }"
                />
                <div class="input-glow"></div>
                <div v-if="registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword" class="password-hint-cinema">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>
            
            <!-- Rôle (optionnel) -->
            <div class="form-group-cinema">
              <div class="input-wrapper">
                <i class="input-icon fas fa-theater-masks"></i>
                <select 
                  v-model="registerRole" 
                  class="cinema-input cinema-select"
                >
                  <option value="">Choisir un rôle (optionnel)</option>
                  <option value="SCENARISTE">Scénariste</option>
                  <option value="REALISATEUR">Réalisateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
                <div class="input-glow"></div>
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
                <div class="input-glow"></div>
              </div>
            </div>

            <div v-if="registerRole === 'SCENARISTE' || registerRole === 'REALISATEUR'" class="form-group-cinema">
              <div class="input-wrapper">
                <i class="input-icon fas fa-book"></i>
                <textarea 
                  v-model="registerBiographie" 
                  placeholder="Biographie professionnelle"
                  class="cinema-input textarea-cinema"
                  rows="3"
                ></textarea>
                <div class="input-glow"></div>
              </div>
            </div>
            
            <div v-if="registerError" class="error-message-cinema">
              <i class="fas fa-exclamation-circle error-icon-cinema"></i>
              {{ registerError }}
            </div>
            
            <button 
              type="submit" 
              class="premier-btn" 
              :disabled="registerLoading || emailExiste || registerPassword.length < 6 || registerPassword !== registerConfirmPassword"
            >
              <span class="btn-sparkle"></span>
              <span class="btn-content">
                <span v-if="registerLoading" class="loading-film">
                  <span class="film-frame"></span>
                  <span class="film-frame"></span>
                  <span class="film-frame"></span>
                </span>
                <span v-else>
                  S'INSCRIRE <i class="fas fa-star"></i>
                </span>
              </span>
            </button>
          </form>

          <!-- LIEN DE BASSULE BIEN VISIBLE AU CENTRE -->
          <div class="signup-link-cinema-center">
            <div class="link-content">
              {{ isLoginForm ? "Pas encore inscrit ?" : "Déjà inscrit ?" }}
              <a href="#" @click.prevent="isLoginForm ? switchToRegister() : switchToLogin()" class="switch-link">
                {{ isLoginForm ? "Créer un compte" : "Se connecter" }}
              </a>
            </div>
          </div>
        </div>
        
        <!-- Pied de l'écran -->
        <div class="screen-footer">
          <div class="film-reel">
            <div class="reel-hole"></div>
            <div class="reel-spokes">
              <div class="spoke" v-for="n in 6" :key="n"></div>
            </div>
          </div>
        </div>
        
      </div>
      
    </div>
    
    <!-- Étoiles scintillantes -->
    <div class="twinkling-stars">
      <div class="star" v-for="n in 15" :key="n" :style="getStarStyle(n)"></div>
    </div>
    
    <!-- Icônes Lune et Soleil -->
    <!-- <div class="theme-toggle-cinema">
      <button class="theme-btn-cinema sun-btn-cinema" :class="{ 'active': !isDarkMode }" @click="toggleTheme('light')">
        <i class="fas fa-sun"></i>
      </button>
      <button class="theme-btn-cinema moon-btn-cinema" :class="{ 'active': isDarkMode }" @click="toggleTheme('dark')">
        <i class="fas fa-moon"></i>
      </button>
    </div> -->
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
      emailExiste: false,
      
      // Thème
      isDarkMode: false
    };
  },
  mounted() {
    // Vérifier le thème au chargement
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      document.body.classList.toggle('dark-theme', this.isDarkMode);
    } else {
      // Détecter la préférence système
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-theme', this.isDarkMode);
    }

    // Démarrer l'animation des icônes
    this.startIconVortex();
  },
  methods: {
    // Navigation entre formulaires avec animation
    switchToLogin() {
      this.isLoginForm = true;
      this.loginError = '';
      this.registerError = '';
      this.animateIconsOnSwitch();
    },
    
    switchToRegister() {
      this.isLoginForm = false;
      this.loginError = '';
      this.registerError = '';
      this.animateIconsOnSwitch();
    },

    // Gestion du thème
    toggleTheme(theme) {
      this.isDarkMode = theme === 'dark';
      document.body.classList.toggle('dark-theme', this.isDarkMode);
      localStorage.setItem('theme', theme);
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
        role: this.registerRole || 'UTILISATEUR', // Rôle par défaut si non spécifié
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
    },

    // Animation des icônes en tourbillon CINÉMA
    startIconVortex() {
      const icons = document.querySelectorAll('.cinema-icon-conn');
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
      
      icons.forEach((icon, index) => {
        const angle = (index / icons.length) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        icon.style.left = x + 'px';
        icon.style.top = y + 'px';
        
        // Animations variées pour un effet plus cinématographique
        const vortexDuration = 18 + (index % 8);
        const floatDuration = 7 + (index % 4);
        const twinkleDuration = 2 + (index % 3);
        
        if (index % 7 === 0) {
          // Animation spéciale rouleau de film
          icon.style.animation = `vortex-cinema ${vortexDuration}s linear infinite, film-roll 4s ease-in-out infinite, twinkle ${twinkleDuration}s ease-in-out infinite`;
        } else if (index % 5 === 0) {
          // Animation spéciale spot lumineux
          icon.style.animation = `vortex-cinema ${vortexDuration}s linear infinite, spotlight 6s ease-in-out infinite, twinkle ${twinkleDuration}s ease-in-out infinite`;
        } else {
          // Animation normale
          icon.style.animation = `vortex-cinema ${vortexDuration}s linear infinite, float-cinema ${floatDuration}s ease-in-out infinite, twinkle ${twinkleDuration}s ease-in-out infinite`;
        }
        
        icon.style.animationDelay = `${index * 0.15}s, ${index * 0.1}s, ${index * 0.05}s`;
      });
    },

    // Animation de changement de formule - EFFET FLIP CINÉMA
    animateIconsOnSwitch() {
      const icons = document.querySelectorAll('.cinema-icon-conn');
      
      icons.forEach((icon, index) => {
        // Sauvegarder l'animation actuelle
        const currentAnimation = icon.style.animation;
        
        // Réinitialiser l'animation
        icon.style.animation = 'none';
        
        // Forcer le reflow
        void icon.offsetWidth;
        
        // Appliquer l'animation FLIP CINÉMA spectaculaire
        icon.style.animation = `film-flip 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
        icon.style.animationDelay = `${index * 0.02}s`;
        
        // Effets visuels accentués
        icon.style.opacity = '1';
        icon.style.filter = 'drop-shadow(0 0 25px currentColor) brightness(1.3)';
        icon.style.zIndex = '10';
        
        // Après l'animation, revenir aux animations normales
        setTimeout(() => {
          icon.style.opacity = '0.8';
          icon.style.filter = 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))';
          icon.style.zIndex = '2';
          
          const vortexDuration = 18 + (index % 8);
          const floatDuration = 7 + (index % 4);
          const twinkleDuration = 2 + (index % 3);
          
          if (index % 7 === 0) {
            icon.style.animation = `vortex-cinema ${vortexDuration}s linear infinite, film-roll 4s ease-in-out infinite, twinkle ${twinkleDuration}s ease-in-out infinite`;
          } else if (index % 5 === 0) {
            icon.style.animation = `vortex-cinema ${vortexDuration}s linear infinite, spotlight 6s ease-in-out infinite, twinkle ${twinkleDuration}s ease-in-out infinite`;
          } else {
            icon.style.animation = `vortex-cinema ${vortexDuration}s linear infinite, float-cinema ${floatDuration}s ease-in-out infinite, twinkle ${twinkleDuration}s ease-in-out infinite`;
          }
          
          icon.style.animationDelay = `${index * 0.15}s, ${index * 0.1}s, ${index * 0.05}s`;
        }, 2000 + (index * 20));
      });
    },

    
// Méthodes pour le style des particules
getDustStyle(n) {
  const size = Math.random() * 4 + 1;
  const left = Math.random() * 100;
  const delay = Math.random() * 8;
  const duration = 6 + Math.random() * 6;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: '120%',
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
},

getStarStyle(n) {
  const size = Math.random() * 3 + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 4;
  const duration = 3 + Math.random() * 3;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
}

  }
};
</script>

