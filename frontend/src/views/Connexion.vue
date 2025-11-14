<template>
  <div class="app-wrapper-co-conn">
    
    <!-- Animation de fond minimaliste -->
    <div class="background-animation-connexion">
      <div class="animated-bg-connexion">
        <div class="bg-shape-connexion shape-1-connexion"></div>
        <div class="bg-shape-connexion shape-2-connexion"></div>
        <div class="bg-shape-connexion shape-3-connexion"></div>
      </div>
    </div>
    
    <div class="connexion-container-conn">
      <!-- Icônes cinéma améliorées -->
      <div class="cinema-icons-conn">
        <i class="fas fa-film cinema-icon-conn cinema-icon-1-conn"></i>
        <i class="fas fa-video cinema-icon-conn cinema-icon-2-conn"></i>
        <i class="fas fa-clapperboard cinema-icon-conn cinema-icon-3-conn"></i>
        <i class="fas fa-ticket-alt cinema-icon-conn cinema-icon-4-conn"></i>
        <i class="fas fa-camera cinema-icon-conn cinema-icon-5-conn"></i>
        <i class="fas fa-popcorn cinema-icon-conn cinema-icon-6-conn"></i>
        <i class="fas fa-theater-masks cinema-icon-conn cinema-icon-7-conn"></i>
        <i class="fas fa-microphone cinema-icon-conn cinema-icon-8-conn"></i>
        <i class="fas fa-music cinema-icon-conn cinema-icon-9-conn"></i>
        <i class="fas fa-star cinema-icon-conn cinema-icon-10-conn"></i>
        <i class="fas fa-play cinema-icon-conn cinema-icon-11-conn"></i>
        <i class="fas fa-headphones cinema-icon-conn cinema-icon-12-conn"></i>
        <i class="fas fa-video-slash cinema-icon-conn cinema-icon-13-conn"></i>
        <i class="fas fa-film-alt cinema-icon-conn cinema-icon-14-conn"></i>
        <i class="fas fa-project-diagram cinema-icon-conn cinema-icon-15-conn"></i>
        <i class="fas fa-film cinema-icon-conn cinema-icon-16-conn"></i>
        <i class="fas fa-video cinema-icon-conn cinema-icon-17-conn"></i>
        <i class="fas fa-clapperboard cinema-icon-conn cinema-icon-18-conn"></i>
        <i class="fas fa-ticket-alt cinema-icon-conn cinema-icon-19-conn"></i>
        <i class="fas fa-camera cinema-icon-conn cinema-icon-20-conn"></i>
        <i class="fas fa-popcorn cinema-icon-conn cinema-icon-21-conn"></i>
        <i class="fas fa-theater-masks cinema-icon-conn cinema-icon-22-conn"></i>
        <i class="fas fa-microphone cinema-icon-conn cinema-icon-23-conn"></i>
        <i class="fas fa-music cinema-icon-conn cinema-icon-24-conn"></i>
        <i class="fas fa-star cinema-icon-conn cinema-icon-25-conn"></i>
        <i class="fas fa-play cinema-icon-conn cinema-icon-26-conn"></i>
        <i class="fas fa-headphones cinema-icon-conn cinema-icon-27-conn"></i>
        <i class="fas fa-video-slash cinema-icon-conn cinema-icon-28-conn"></i>
        <i class="fas fa-film-alt cinema-icon-conn cinema-icon-29-conn"></i>
        <i class="fas fa-project-diagram cinema-icon-conn cinema-icon-30-conn"></i>
      </div>
  
      <!-- Section formulaire avec toggle Connexion/Inscription -->
      <div class="connexio-form-section-conn">
        <div class="connexion-card-conn">
          <!-- Toggle entre Connexion et Inscription -->
          <div class="form-toggle-conn">
            <button 
              class="toggle-btn-conn" 
              :class="{ 'active': isLoginForm }"
              @click="switchToLogin"
            >
              Connexion
            </button>
            <button 
              class="toggle-btn-conn" 
              :class="{ 'active': !isLoginForm }"
              @click="switchToRegister"
            >
              Inscription
            </button>
          </div>

          <!-- En-tête avec dégradé -->
          <div class="connex-header-conn">
            <div class="header-top-conn">
              <div class="user-avatar-conn">
                <i :class="isLoginForm ? 'fas fa-user' : 'fas fa-user-plus'"></i>
              </div>
            </div>
            <div class="sub-title">
              <h1>{{ isLoginForm ? 'Connexion' : 'Inscription' }}</h1>
              <p>{{ isLoginForm ? 'Accédez à votre espace personnel' : 'Créez votre compte personnel' }}</p>
            </div>
          </div>

          <!-- FORMULAIRE DE CONNEXION -->
          <form v-if="isLoginForm" @submit.prevent="seConnecter" class="connexion-form-conn">
            <div class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <input 
                  type="email" 
                  id="email-connexion-conn"
                  v-model="loginEmail" 
                  required 
                  placeholder="Email"
                  class="form-input-connexion-conn"
                />
              </div>
            </div>
            
            <div class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <input 
                  type="password" 
                  id="password-connexion-conn"
                  v-model="loginPassword" 
                  required 
                  placeholder="Mot de passe"
                  class="form-input-connexion-conn"
                />
              </div>
            </div>
            
            <div class="form-options-connexion-conn">
              <label class="checkbox-container-connexion-conn">
                <!-- Se souvenir de moi
                <input type="checkbox" v-model="rememberMe">
                <span class="checkmark-connexion-conn"></span> -->
              </label>
              <a href="#" class="forgot-link-connexion-conn">Mot de passe oublié?</a>
            </div>
            
            <div v-if="loginError" class="error-message-connexion-conn">
              <i class="fas fa-exclamation-circle error-icon-connexion-conn"></i>
              {{ loginError }}
            </div>
            
            <button type="submit" class="connexion-btn-conn" :disabled="loginLoading">
              <span v-if="loginLoading" class="btn-loading-connexion-conn">
                <span class="loading-dots-connexion-conn">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
              <span v-else class="btn-text-connexion-conn">
                <span>Se connecter <i class="fas fa-arrow-right btn-icon-connexion-conn"></i></span>
              </span>
            </button>
          </form>

          <!-- FORMULAIRE D'INSCRIPTION -->
          <form v-else @submit.prevent="sInscrire" class="connexion-form-conn">
            <!-- Nom -->
            <div class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <input 
                  type="text" 
                  v-model="registerNom" 
                  required 
                  placeholder="Nom complet"
                  class="form-input-connexion-conn"
                />
              </div>
            </div>
            
            <!-- Email -->
            <div class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <input 
                  type="email" 
                  v-model="registerEmail" 
                  required 
                  placeholder="Email"
                  class="form-input-connexion-conn"
                  @blur="verifierEmail"
                />
                <div v-if="emailVerifie" class="email-status-conn">
                  <i class="fas fa-check" v-if="!emailExiste"></i>
                  <i class="fas fa-times" v-else></i>
                  <span v-if="emailExiste" class="email-error-conn">Cet email est déjà utilisé</span>
                </div>
              </div>
            </div>
            
            <!-- Mot de passe -->
            <div class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <input 
                  type="password" 
                  v-model="registerPassword" 
                  required 
                  placeholder="Mot de passe"
                  class="form-input-connexion-conn"
                  :class="{ 'error': registerPassword.length > 0 && registerPassword.length < 6 }"
                />
                <div v-if="registerPassword.length > 0 && registerPassword.length < 6" class="password-hint-conn">
                  Le mot de passe doit contenir au moins 6 caractères
                </div>
              </div>
            </div>

            <!-- Confirmation mot de passe -->
            <div class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <input 
                  type="password" 
                  v-model="registerConfirmPassword" 
                  required 
                  placeholder="Confirmer le mot de passe"
                  class="form-input-connexion-conn"
                  :class="{ 'error': registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword }"
                />
                <div v-if="registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword" class="password-hint-conn">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>
            
            <!-- Rôle (optionnel) -->
            <div class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <select 
                  v-model="registerRole" 
                  class="form-input-connexion-conn"
                >
                  <option value="">Choisir un rôle (optionnel)</option>
                  <option value="SCENARISTE">Scénariste</option>
                  <option value="REALISATEUR">Réalisateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>

            <!-- Champs conditionnels pour scénariste/réalisateur -->
            <div v-if="registerRole === 'SCENARISTE' || registerRole === 'REALISATEUR'" class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <input 
                  type="text" 
                  v-model="registerSpecialite" 
                  placeholder="Spécialité"
                  class="form-input-connexion-conn"
                />
              </div>
            </div>

            <div v-if="registerRole === 'SCENARISTE' || registerRole === 'REALISATEUR'" class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <textarea 
                  v-model="registerBiographie" 
                  placeholder="Biographie"
                  class="form-input-connexion-conn textarea-conn"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div v-if="registerError" class="error-message-connexion-conn">
              <i class="fas fa-exclamation-circle error-icon-connexion-conn"></i>
              {{ registerError }}
            </div>
            
            <button 
              type="submit" 
              class="connexion-btn-conn" 
              :disabled="registerLoading || emailExiste || registerPassword.length < 6 || registerPassword !== registerConfirmPassword"
            >
              <span v-if="registerLoading" class="btn-loading-connexion-conn">
                <span class="loading-dots-connexion-conn">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
              <span v-else class="btn-text-connexion-conn">
                <span>S'inscrire <i class="fas fa-user-plus btn-icon-connexion-conn"></i></span>
              </span>
            </button>
          </form>

          <!-- Lien de bascule -->
          <div class="signup-link-connexion-conn">
            {{ isLoginForm ? "Pas encore inscrit?" : "Déjà inscrit?" }}
            <a href="#" @click.prevent="isLoginForm ? switchToRegister() : switchToLogin()">
              {{ isLoginForm ? "Créer un compte" : "Se connecter" }}
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Icônes Lune et Soleil -->
    <div class="theme-toggle">
      <button class="theme-btn moon-btn" :class="{ 'active': !isDarkMode }" @click="toggleTheme('light')">
        <i class="fas fa-sun"></i>
      </button>
      <button class="theme-btn sun-btn" :class="{ 'active': isDarkMode }" @click="toggleTheme('dark')">
        <i class="fas fa-moon"></i>
      </button>
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

    // Animation des icônes en tourbillon
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
        
        // Animation de rotation
        icon.style.animation = `vortex 20s linear infinite, float 6s ease-in-out infinite`;
        icon.style.animationDelay = `${index * 0.5}s, ${index * 0.3}s`;
      });
    }
  }
};
</script>

