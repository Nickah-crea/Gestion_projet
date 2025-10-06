<template>
  <div class="connexion-container">
    <!-- Animation de fond minimaliste -->
    <div class="background-animation-connexion">
      <div class="animated-bg-connexion">
        <div class="bg-shape-connexion shape-1-connexion"></div>
        <div class="bg-shape-connexion shape-2-connexion"></div>
        <div class="bg-shape-connexion shape-3-connexion"></div>
      </div>
    </div>

    <!-- Carte de connexion -->
    <div class="connexion-card">
      <div class="connexion-header">
        <div class="logo-container-connexion">
          <i class="fas fa-user-circle logo-icon-connexion"></i>
        </div>
        <h1>Connexion</h1>
        <p>Accédez à votre espace personnel</p>
      </div>
      
      <form @submit.prevent="seConnecter" class="connexion-form">
        <div class="form-group-connexion">
          <div class="input-container-connexion">
            <input 
              type="email" 
              id="email-connexion"
              v-model="email" 
              required 
              placeholder=" "
              class="form-input-connexion"
            />
            <label for="email-connexion" class="input-label-connexion">Email</label>
          </div>
        </div>
        
        <div class="form-group-connexion">
          <div class="input-container-connexion">
            <input 
              type="password" 
              id="password-connexion"
              v-model="password" 
              required 
              placeholder=" "
              class="form-input-connexion"
            />
            <label for="password-connexion" class="input-label-connexion">Mot de passe</label>
          </div>
        </div>
        
        <div class="form-options-connexion">
          <label class="checkbox-container-connexion">
            Se souvenir de moi
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark-connexion"></span>
          </label>
          <a href="#" class="forgot-link-connexion">Mot de passe oublié?</a>
        </div>
        
        <div v-if="error" class="error-message-connexion">
          <i class="fas fa-exclamation-circle error-icon-connexion"></i>
          {{ error }}
        </div>
        
        <button type="submit" class="connexion-btn" :disabled="loading">
          <span v-if="loading" class="btn-loading-connexion">
            <span class="loading-dots-connexion">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </span>
          <span v-else class="btn-text-connexion">
            <span>Se connecter</span>
            <i class="fas fa-arrow-right btn-icon-connexion"></i>
          </span>
        </button>
        
        <div class="signup-link-connexion">
          Pas encore inscrit? <a href="#">Créer un compte</a>
        </div>
      </form>
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

