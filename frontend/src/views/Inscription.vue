<template>
  <div class="app-wrapper-inscription">
    
    <!-- Animation de fond -->
    <div class="background-animation-inscription">
      <div class="animated-bg-inscription">
        <div class="bg-shape-inscription shape-1-inscription"></div>
        <div class="bg-shape-inscription shape-2-inscription"></div>
        <div class="bg-shape-inscription shape-3-inscription"></div>
      </div>
    </div>
    
    <div class="inscription-container">
      <!-- Arrière-plan avec quadrillage -->
      <div class="background-grid-inscription"></div>
      
      <!-- Icônes cinéma -->
      <div class="cinema-icons-inscription">
        <i class="fas fa-film cinema-icon-inscription"></i>
        <i class="fas fa-video cinema-icon-inscription"></i>
        <i class="fas fa-clapperboard cinema-icon-inscription"></i>
        <i class="fas fa-ticket-alt cinema-icon-inscription"></i>
        <i class="fas fa-camera cinema-icon-inscription"></i>
      </div>
  
      <!-- Section formulaire -->
      <div class="inscription-form-section">
        <div class="inscription-card">
          <!-- En-tête -->
          <div class="inscription-header">
            <div class="header-top-inscription">
              <div class="user-avatar-inscription">
                <i class="fas fa-user-plus"></i>
              </div>
            </div>
            <div class="sub-title-inscription">
              <h1>Inscription</h1>
              <p>Créez votre compte personnel</p>
            </div>
          </div>

          <form @submit.prevent="sInscrire" class="inscription-form">
            <!-- Nom -->
            <div class="form-group-inscription">
              <div class="input-container-inscription">
                <input 
                  type="text" 
                  id="nom-inscription"
                  v-model="nom" 
                  required 
                  placeholder="Nom complet"
                  class="form-input-inscription"
                />
              </div>
            </div>
            
            <!-- Email -->
            <div class="form-group-inscription">
              <div class="input-container-inscription">
                <input 
                  type="email" 
                  id="email-inscription"
                  v-model="email" 
                  required 
                  placeholder="Email"
                  class="form-input-inscription"
                  @blur="verifierEmail"
                />
                <div v-if="emailVerifie" class="email-status">
                  <i class="fas fa-check" v-if="!emailExiste"></i>
                  <i class="fas fa-times" v-else></i>
                  <span v-if="emailExiste" class="email-error">Cet email est déjà utilisé</span>
                </div>
              </div>
            </div>
            
            <!-- Mot de passe -->
            <div class="form-group-inscription">
              <div class="input-container-inscription">
                <input 
                  type="password" 
                  id="password-inscription"
                  v-model="password" 
                  required 
                  placeholder="Mot de passe"
                  class="form-input-inscription"
                  :class="{ 'error': password.length > 0 && password.length < 6 }"
                />
                <div v-if="password.length > 0 && password.length < 6" class="password-hint">
                  Le mot de passe doit contenir au moins 6 caractères
                </div>
              </div>
            </div>

            <!-- Confirmation mot de passe -->
            <div class="form-group-inscription">
              <div class="input-container-inscription">
                <input 
                  type="password" 
                  id="confirm-password-inscription"
                  v-model="confirmPassword" 
                  required 
                  placeholder="Confirmer le mot de passe"
                  class="form-input-inscription"
                  :class="{ 'error': confirmPassword.length > 0 && password !== confirmPassword }"
                />
                <div v-if="confirmPassword.length > 0 && password !== confirmPassword" class="password-hint">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>
            
            <!-- Rôle -->
            <div class="form-group-inscription">
              <div class="input-container-inscription">
                <select 
                  id="role-inscription"
                  v-model="role" 
                  required 
                  class="form-input-inscription"
                >
                  <option value="" disabled>Sélectionnez un rôle</option>
                  <option value="SCENARISTE">Scénariste</option>
                  <option value="REALISATEUR">Réalisateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>

            <!-- Champs conditionnels pour scénariste/réalisateur -->
            <div v-if="role === 'SCENARISTE' || role === 'REALISATEUR'" class="form-group-inscription">
              <div class="input-container-inscription">
                <input 
                  type="text" 
                  v-model="specialite" 
                  placeholder="Spécialité"
                  class="form-input-inscription"
                />
              </div>
            </div>

            <div v-if="role === 'SCENARISTE' || role === 'REALISATEUR'" class="form-group-inscription">
              <div class="input-container-inscription">
                <textarea 
                  v-model="biographie" 
                  placeholder="Biographie"
                  class="form-input-inscription textarea-inscription"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div v-if="error" class="error-message-inscription">
              <i class="fas fa-exclamation-circle error-icon-inscription"></i>
              {{ error }}
            </div>
            
            <button 
              type="submit" 
              class="inscription-btn" 
              :disabled="loading || emailExiste || password.length < 6 || password !== confirmPassword"
            >
              <span v-if="loading" class="btn-loading-inscription">
                <span class="loading-dots-inscription">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
              <span v-else class="btn-text-inscription">
                <span>S'inscrire <i class="fas fa-user-plus btn-icon-inscription"></i></span>
              </span>
            </button>
            
            <div class="login-link-inscription">
              Déjà inscrit? <a href="/connexion">Se connecter</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'InscriptionView',
  data() {
    return {
      nom: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      specialite: '',
      biographie: '',
      loading: false,
      error: '',
      emailVerifie: false,
      emailExiste: false
    };
  },
  methods: {
    async verifierEmail() {
      if (!this.email) return;
      
      try {
        const response = await axios.get(`/api/auth/verifier-email?email=${this.email}`);
        this.emailExiste = response.data.existe;
        this.emailVerifie = true;
      } catch (error) {
        console.error('Erreur vérification email:', error);
      }
    },
    
    async sInscrire() {
      if (this.password !== this.confirmPassword) {
        this.error = "Les mots de passe ne correspondent pas";
        return;
      }
      
      if (this.password.length < 6) {
        this.error = "Le mot de passe doit contenir au moins 6 caractères";
        return;
      }
      
      if (this.emailExiste) {
        this.error = "Cet email est déjà utilisé";
        return;
      }

      this.loading = true;
      this.error = '';
      
      try {
        const response = await axios.post('/api/auth/register', {
          nom: this.nom,
          email: this.email,
          motDePasse: this.password,
          role: this.role,
          specialite: this.specialite,
          biographie: this.biographie
        });
        
        // Connexion automatique après inscription réussie
        await this.autoLoginAfterRegister();
        
      } catch (error) {
        console.error('Erreur inscription:', error);
        this.error = error.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        this.loading = false;
      }
    },

    async autoLoginAfterRegister() {
      try {
        // Connexion automatique avec les mêmes identifiants
        const loginResponse = await axios.post('/api/auth/login', {
          email: this.email,
          password: this.password
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
        default:
          route = '/accueil';
      }
      
      this.$router.push(route);
    }
  }
};
</script>

<style scoped>
/* Reset pour éviter tout style de sidebar */
.app-wrapper-inscription {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.inscription-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.inscription-form-section {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 450px;
}

.inscription-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.inscription-header {
  text-align: center;
  margin-bottom: 30px;
}

.user-avatar-inscription {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 30px;
}

.sub-title-inscription h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.sub-title-inscription p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.form-group-inscription {
  margin-bottom: 20px;
}

.input-container-inscription {
  position: relative;
}

.form-input-inscription {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input-inscription:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input-inscription.error {
  border-color: #e74c3c;
}

.textarea-inscription {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.email-status {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.email-status .fa-check {
  color: #27ae60;
}

.email-status .fa-times {
  color: #e74c3c;
}

.email-error {
  color: #e74c3c;
  font-size: 12px;
}

.password-hint {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 5px;
}

.error-message-inscription {
  background: #fee;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.inscription-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.inscription-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.inscription-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-link-inscription {
  text-align: center;
  color: #666;
}

.login-link-inscription a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link-inscription a:hover {
  text-decoration: underline;
}

/* Animations de fond */
.background-animation-inscription {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.animated-bg-inscription {
  position: relative;
  width: 100%;
  height: 100%;
}

.bg-shape-inscription {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1-inscription {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2-inscription {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3-inscription {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.background-grid-inscription {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;
}

.cinema-icons-inscription {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.cinema-icon-inscription {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  font-size: 24px;
  animation: float 6s ease-in-out infinite;
}

.cinema-icons-inscription i:nth-child(1) { top: 15%; left: 5%; animation-delay: 0s; }
.cinema-icons-inscription i:nth-child(2) { top: 25%; right: 10%; animation-delay: 1s; }
.cinema-icons-inscription i:nth-child(3) { top: 70%; left: 15%; animation-delay: 2s; }
.cinema-icons-inscription i:nth-child(4) { bottom: 20%; right: 20%; animation-delay: 3s; }
.cinema-icons-inscription i:nth-child(5) { top: 40%; left: 80%; animation-delay: 4s; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* Styles pour les indicateurs de chargement */
.btn-loading-inscription {
  display: inline-block;
}

.loading-dots-inscription {
  display: inline-flex;
  gap: 4px;
}

.loading-dots-inscription span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dots-inscription span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots-inscription span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots-inscription span:nth-child(3) { animation-delay: 0s; }

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .inscription-card {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .inscription-form-section {
    max-width: 100%;
  }
}
</style>

