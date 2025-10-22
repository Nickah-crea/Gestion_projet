<template>
  <div class="app-wrapper-co-conn">
    
    <div class="connexion-container-conn">
      <!-- Arrière-plan avec quadrillage -->
      <div class="background-grid-conn"></div>
      
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

      <!-- Section formulaire BIEN AU MILIEU -->
      <div class="connexio-form-section-conn">
        <div class="connexion-card-conn">
          <!-- En-tête avec dégradé -->
          <div class="connex-header-conn">
            <div class="header-top-conn">
              <div class="user-avatar-conn">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div class="sub-title" >
              <h1>Connexion</h1>
              <p>Accédez à votre espace personnel</p>
            </div>
          </div>

          <form @submit.prevent="seConnecter" class="connexion-form-conn">
            <!-- Vos champs de formulaire existants -->
            <div class="form-group-connexion-conn">
              <div class="input-container-connexion-conn">
                <input 
                  type="email" 
                  id="email-connexion-conn"
                  v-model="email" 
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
                  v-model="password" 
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
            
            <div v-if="error" class="error-message-connexion-conn">
              <i class="fas fa-exclamation-circle error-icon-connexion-conn"></i>
              {{ error }}
            </div>
            
            <button type="submit" class="connexion-btn-conn" :disabled="loading">
              <span v-if="loading" class="btn-loading-connexion-conn">
                <span class="loading-dots-connexion-conn">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
              <span v-else class="btn-text-connexion-conn">
                <span>Se connecter   <i class="fas fa-arrow-right btn-icon-connexion-conn"></i> </span>
              </span>
            </button>
            
            <div class="signup-link-connexion-conn">
              Pas encore inscrit? <a href="#">Créer un compte</a>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- Icônes Lune et Soleil côte à côte avec border-radius 50px -->
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
import '../assets/css/connexion.css';

export default {
  name: 'ConnexionView',
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: ''
    };
  },
  methods: {
    async seConnecter() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await axios.post('/api/auth/login', {
          email: this.email,
          password: this.password
        });
        
        // Stocker les informations de l'utilisateur
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        // Rediriger en fonction du rôle
        let route = '/accueil';
        if (response.data.user.role === 'ADMIN') {
          route = '/admin';
        } else if (response.data.user.role === 'SCENARISTE' || response.data.user.role === 'REALISATEUR') {
          route = '/scenariste';
        }
        this.$router.push(route);
        
      } catch (error) {
        console.error('Erreur de connexion:', error);
        this.error = error.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>



