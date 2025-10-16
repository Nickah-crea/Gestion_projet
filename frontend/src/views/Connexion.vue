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
      </div>

      <!-- Section formulaire BIEN AU MILIEU -->
      <div class="connexion-form-section-conn">
        <div class="connexion-card-conn">
          <!-- En-tête avec dégradé -->
          <div class="connex-header-conn">
            <div class="header-top-conn">
              <div class="user-avatar-conn">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <h1>Connexion</h1>
            <p>Accédez à votre espace personnel</p>
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
                Se souvenir de moi
                <input type="checkbox" v-model="rememberMe">
                <span class="checkmark-connexion-conn"></span>
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

<style scoped>
/* Section formulaire BIEN CENTRÉE */
.connexion-form-section-conn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  height: 100vh;
  position: relative;
  z-index: 20;
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(245, 245, 245, 0.4);
}

.connexion-card-conn {
  background: var(--surface-conn);
  backdrop-filter: var(--blur-conn);
  -webkit-backdrop-filter: var(--blur-conn);
  border-radius: var(--radius-lg-conn);
  border: 1px solid var(--border-conn);
  box-shadow: var(--shadow-lg-conn);
  padding: 0;
  width: 100%;
  max-width: 480px;
  position: relative;
  overflow: hidden;
  animation: slideInUp-conn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 25;
}

/* En-tête avec nouvelle palette */
.connex-header-conn {
  margin-top: 25px;
  padding: 1rem;
  text-align: center;
  position: relative;
  backdrop-filter: blur(50%);
}

.connex-header-conn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
}

.user-avatar-conn {
  background: #FFF27A;
  color: #FFDD00;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.5);
  margin: 0 auto 1rem auto;
}

.connex-header-conn h1 {
  font-size: 1.75rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.connex-header-conn p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Icônes ÉLOIGNÉES avec 150px de padding */
.cinema-icons-conn {
  position: absolute;
  width: calc(100% - 300px); /* 150px de chaque côté */
  height: calc(100% - 300px); /* 150px de chaque côté */
  top: 150px;
  left: 150px;
  z-index: 5;
  pointer-events: none;
}

.cinema-icon-conn {
  position: absolute;
  color: var(--primary-light-conn);
  opacity: 0.6;
  filter: drop-shadow(0 2px 6px rgba(255, 221, 0, 0.2));
  z-index: 5;
  animation: gentle-float-conn 12s ease-in-out infinite;
}

/* Positionnement ÉLOIGNÉ du formulaire */
.cinema-icon-1-conn {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
  font-size: 1.8rem;
}

.cinema-icon-2-conn {
  top: 15%;
  left: 85%;
  animation-delay: 1s;
  font-size: 2.2rem;
}

.cinema-icon-3-conn {
  top: 85%;
  left: 15%;
  animation-delay: 2s;
  font-size: 2.5rem;
}

.cinema-icon-4-conn {
  top: 80%;
  left: 80%;
  animation-delay: 3s;
  font-size: 1.5rem;
}

.cinema-icon-5-conn {
  top: 5%;
  left: 50%;
  animation-delay: 4s;
  font-size: 3rem;
}

.cinema-icon-6-conn {
  top: 95%;
  left: 50%;
  animation-delay: 5s;
  font-size: 2rem;
}

.cinema-icon-7-conn {
  top: 50%;
  left: 5%;
  animation-delay: 6s;
  font-size: 2.8rem;
}

.cinema-icon-8-conn {
  top: 50%;
  left: 95%;
  animation-delay: 7s;
  font-size: 1.8rem;
}

.cinema-icon-9-conn {
  top: 25%;
  left: 25%;
  animation-delay: 8s;
  font-size: 2.2rem;
}

.cinema-icon-10-conn {
  top: 25%;
  left: 75%;
  animation-delay: 9s;
  font-size: 3.2rem;
}

.cinema-icon-11-conn {
  top: 75%;
  left: 25%;
  animation-delay: 10s;
  font-size: 1.4rem;
}

.cinema-icon-12-conn {
  top: 75%;
  left: 75%;
  animation-delay: 11s;
  font-size: 2.6rem;
}

.cinema-icon-13-conn {
  top: 10%;
  left: 30%;
  animation-delay: 12s;
  font-size: 3.5rem;
}

.cinema-icon-14-conn {
  top: 10%;
  left: 70%;
  animation-delay: 13s;
  font-size: 1.6rem;
}

.cinema-icon-15-conn {
  top: 90%;
  left: 30%;
  animation-delay: 14s;
  font-size: 2.4rem;
}

/* Animation douce et discrète */
@keyframes gentle-float-conn {
  0%, 100% { 
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 0.4;
  }
  25% { 
    transform: translate(10px, -15px) rotate(5deg) scale(1.05);
    opacity: 0.6;
  }
  50% { 
    transform: translate(-8px, 12px) rotate(-3deg) scale(0.98);
    opacity: 0.5;
  }
  75% { 
    transform: translate(-12px, -8px) rotate(2deg) scale(1.02);
    opacity: 0.55;
  }
}

@keyframes slideInUp-conn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
