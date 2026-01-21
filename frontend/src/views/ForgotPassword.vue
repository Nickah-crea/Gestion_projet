<template>
  <div class="forgot-password-container">
    <!-- Vidéo de fond (même que connexion) -->
    <div class="background-video">
      <video autoplay muted loop playsinline class="scenariste-video">
        <source src="../assets/img/autor.mp4" type="video/mp4">
        <img src="../assets/img/autor.png" alt="Scénariste au travail" class="scenariste-image">
      </video>
      
      <div class="video-overlay">
        <div class="overlay-content">
          <h2 class="overlay-title">RÉINITIALISATION</h2>
          <p class="overlay-text">
            Retrouvez l'accès à votre espace créatif en toute sécurité.
          </p>
        </div>
      </div>
    </div>

    <!-- Formulaire principal -->
    <div class="forgot-password-card">
      <!-- Logo/Header -->
      <div class="password-reset-header">
        <i class="logo-icon fas fa-key"></i>
        <h1 class="logo-text">MOT DE PASSE OUBLIÉ</h1>
        <div class="logo-subtitle">Réinitialisez votre mot de passe en 3 étapes</div>
      </div>

      <!-- Indicateur d'étapes -->
      <div class="step-indicator">
        <div class="step" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
          <span class="step-number">1</span>
          <span class="step-label">Email</span>
        </div>
        <div class="step-line" :class="{ 'completed': currentStep > 1 }"></div>
        
        <div class="step" :class="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
          <span class="step-number">2</span>
          <span class="step-label">Vérification</span>
        </div>
        <div class="step-line" :class="{ 'completed': currentStep > 2 }"></div>
        
        <div class="step" :class="{ 'active': currentStep === 3, 'completed': currentStep > 3 }">
          <span class="step-number">3</span>
          <span class="step-label">Nouveau mot de passe</span>
        </div>
      </div>

      <!-- Étape 1: Demande d'email -->
      <div v-if="currentStep === 1" class="step-content" key="step1">
        <div class="step-description">
          <i class="fas fa-envelope step-icon"></i>
          <p>Entrez votre adresse email professionnelle. Nous vous enverrons un code de vérification.</p>
        </div>

        <form @submit.prevent="sendVerificationCode" class="cinema-form">
          <div class="form-group-cinema">
            <div class="input-wrapper">
              <i class="input-icon fas fa-envelope"></i>
              <input 
                type="email" 
                v-model="email" 
                required
                placeholder="Votre email professionnel"
                class="cinema-input"
                :disabled="loading"
              />
            </div>
          </div>

          <div v-if="step1Error" class="error-message-cinema">
            <i class="fas fa-exclamation-circle"></i>
            {{ step1Error }}
          </div>

          <div v-if="step1Success" class="success-message-cinema">
            <i class="fas fa-check-circle"></i>
            {{ step1Success }}
          </div>

          <button type="submit" class="premier-btn" :disabled="loading || !email">
            <span class="btn-content">
              <span v-if="loading" class="loading-film">
                <span class="film-frame"></span>
                <span class="film-frame"></span>
                <span class="film-frame"></span>
              </span>
              <span v-else>
                ENVOYER LE CODE <i class="fas fa-paper-plane"></i>
              </span>
            </span>
          </button>

          <div class="back-to-login">
            <router-link to="/" class="back-link">
              <i class="fas fa-arrow-left"></i> Retour à la connexion
            </router-link>
          </div>
        </form>
      </div>

      <!-- Étape 2: Vérification du code -->
      <div v-else-if="currentStep === 2" class="step-content" key="step2">
        <div class="step-description">
          <i class="fas fa-shield-alt step-icon"></i>
          <p>Entrez le code à 6 chiffres envoyé à <strong>{{ email }}</strong>.</p>
          <p class="code-expiry">Le code expire dans 15 minutes.</p>
        </div>

        <form @submit.prevent="verifyCode" class="cinema-form">
          <div class="form-group-cinema">
            <div class="code-input-container">
              <input 
                v-for="i in 6" 
                :key="i"
                type="text" 
                maxlength="1"
                v-model="code[i-1]"
                @input="onCodeInput($event, i-1)"
                @keydown.delete="onCodeDelete($event, i-1)"
                @paste="onCodePaste($event)"
                ref="codeInputs"
                class="code-input"
                :disabled="loading"
              />
            </div>
            <div class="code-hint">
              Code à 6 chiffres
            </div>
          </div>

          <div class="resend-code-section">
            <p>Vous n'avez pas reçu le code ?</p>
            <button 
              type="button" 
              @click="resendCode" 
              class="resend-btn"
              :disabled="resendCooldown > 0"
            >
              <span v-if="resendCooldown > 0">
                Renvoyer dans {{ resendCooldown }}s
              </span>
              <span v-else>
                <i class="fas fa-redo"></i> Renvoyer le code
              </span>
            </button>
          </div>

          <div v-if="step2Error" class="error-message-cinema">
            <i class="fas fa-exclamation-circle"></i>
            {{ step2Error }}
          </div>

          <div v-if="step2Success" class="success-message-cinema">
            <i class="fas fa-check-circle"></i>
            {{ step2Success }}
          </div>

          <div class="step-buttons">
            <button 
              type="button" 
              @click="goToStep(1)" 
              class="secondary-btn"
              :disabled="loading"
            >
              <i class="fas fa-arrow-left"></i> Retour
            </button>
            <button 
              type="submit" 
              class="premier-btn"
              :disabled="loading || !isCodeComplete"
            >
              <span class="btn-content">
                <span v-if="loading" class="loading-film">
                  <span class="film-frame"></span>
                  <span class="film-frame"></span>
                  <span class="film-frame"></span>
                </span>
                <span v-else>
                  VÉRIFIER LE CODE <i class="fas fa-check"></i>
                </span>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Étape 3: Nouveau mot de passe -->
      <div v-else-if="currentStep === 3" class="step-content" key="step3">
        <div class="step-description">
          <i class="fas fa-lock step-icon"></i>
          <p>Créez votre nouveau mot de passe sécurisé.</p>
        </div>

        <form @submit.prevent="resetPassword" class="cinema-form">
          <div class="form-group-cinema">
            <div class="input-wrapper">
              <i class="input-icon fas fa-key"></i>
              <input 
                type="password" 
                v-model="newPassword" 
                required
                placeholder="Nouveau mot de passe"
                class="cinema-input"
                :class="{ 'error': newPassword.length > 0 && newPassword.length < 6 }"
                :disabled="loading"
              />
            </div>
            <div v-if="newPassword.length > 0 && newPassword.length < 6" 
                 class="password-hint-cinema">
              Min. 6 caractères
            </div>
          </div>

          <div class="form-group-cinema">
            <div class="input-wrapper">
              <i class="input-icon fas fa-shield-alt"></i>
              <input 
                type="password" 
                v-model="confirmPassword" 
                required
                placeholder="Confirmer le mot de passe"
                class="cinema-input"
                :class="{ 'error': confirmPassword.length > 0 && newPassword !== confirmPassword }"
                :disabled="loading"
              />
            </div>
            <div v-if="confirmPassword.length > 0 && newPassword !== confirmPassword" 
                 class="password-hint-cinema">
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <div class="password-strength" v-if="newPassword">
            <div class="strength-bar" :class="passwordStrengthClass"></div>
            <div class="strength-label">
              Force du mot de passe: {{ passwordStrengthText }}
            </div>
          </div>

          <div v-if="step3Error" class="error-message-cinema">
            <i class="fas fa-exclamation-circle"></i>
            {{ step3Error }}
          </div>

          <div v-if="step3Success" class="success-message-cinema">
            <i class="fas fa-check-circle"></i>
            {{ step3Success }}
          </div>

          <div class="step-buttons">
            <button 
              type="button" 
              @click="goToStep(2)" 
              class="secondary-btn"
              :disabled="loading"
            >
              <i class="fas fa-arrow-left"></i> Retour
            </button>
            <button 
              type="submit" 
              class="premier-btn"
              :disabled="loading || !isPasswordValid"
            >
              <span class="btn-content">
                <span v-if="loading" class="loading-film">
                  <span class="film-frame"></span>
                  <span class="film-frame"></span>
                  <span class="film-frame"></span>
                </span>
                <span v-else>
                  RÉINITIALISER <i class="fas fa-sync-alt"></i>
                </span>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Étape 4: Succès -->
      <div v-else-if="currentStep === 4" class="step-content success-step" key="step4">
        <div class="success-animation">
          <i class="fas fa-check-circle"></i>
        </div>
        
        <h2 class="success-title">Mot de passe réinitialisé !</h2>
        
        <p class="success-message">
          Votre mot de passe a été modifié avec succès.<br>
          Vous allez être redirigé vers votre espace personnel.
        </p>

        <div class="user-info" v-if="userRole">
          <i class="fas fa-user-tag"></i>
          <span>Rôle: {{ getRoleLabel(userRole) }}</span>
        </div>

        <div class="redirect-countdown">
          Redirection dans <span class="countdown-number">{{ countdown }}</span> secondes...
        </div>

        <div class="success-actions">
          <button @click="redirectNow" class="premier-btn">
            <i class="fas fa-rocket"></i> ALLER MAINTENANT
          </button>
          <router-link to="/connexion" class="secondary-btn">
            <i class="fas fa-sign-in-alt"></i> SE CONNECTER
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ForgotPassword',
  data() {
    return {
      // État général
      currentStep: 1,
      loading: false,
      email: '',
      
      // Étape 1
      step1Error: '',
      step1Success: '',
      
      // Étape 2
      code: ['', '', '', '', '', ''],
      step2Error: '',
      step2Success: '',
      resendCooldown: 0,
      
      // Étape 3
      newPassword: '',
      confirmPassword: '',
      step3Error: '',
      step3Success: '',
      
      // Étape 4
      countdown: 5,
      userRole: null
    };
  },
  computed: {
    isCodeComplete() {
      return this.code.every(digit => digit !== '');
    },
    
    isPasswordValid() {
      return this.newPassword.length >= 6 && 
             this.newPassword === this.confirmPassword;
    },
    
    passwordStrength() {
      if (this.newPassword.length < 6) return 0;
      
      let strength = 0;
      if (this.newPassword.length >= 8) strength += 1;
      if (/[A-Z]/.test(this.newPassword)) strength += 1;
      if (/[0-9]/.test(this.newPassword)) strength += 1;
      if (/[^A-Za-z0-9]/.test(this.newPassword)) strength += 1;
      
      return strength;
    },
    
    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength <= 1) return 'weak';
      if (strength <= 2) return 'medium';
      return 'strong';
    },
    
    passwordStrengthText() {
      const strength = this.passwordStrength;
      if (strength <= 1) return 'Faible';
      if (strength <= 2) return 'Moyen';
      return 'Fort';
    }
  },
  mounted() {
    // Initialiser la vidéo
    this.initVideo();
    
    // Récupérer l'email depuis l'URL si présent
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      this.email = emailParam;
    }
  },
  methods: {
    initVideo() {
      const video = this.$el?.querySelector('.scenariste-video');
      if (video) {
        video.play().catch(error => {
          console.log('La vidéo ne peut pas se jouer automatiquement:', error);
          const fallbackImg = video.querySelector('.scenariste-image');
          if (fallbackImg) {
            video.style.display = 'none';
            fallbackImg.style.display = 'block';
          }
        });
      }
    },
    
    // Navigation entre étapes
    goToStep(step) {
      this.currentStep = step;
      
      // Réinitialiser les erreurs
      this.step1Error = '';
      this.step2Error = '';
      this.step3Error = '';
    },
    
    // Étape 1: Envoyer le code de vérification
    async sendVerificationCode() {
      this.loading = true;
      this.step1Error = '';
      this.step1Success = '';
      
      try {
        const response = await axios.post('/api/auth/forgot-password', {
          email: this.email
        });
        
        if (response.data.success) {
          this.step1Success = response.data.message;
          setTimeout(() => {
            this.goToStep(2);
            this.startResendCooldown();
            // Focus sur le premier champ de code
            if (this.$refs.codeInputs && this.$refs.codeInputs[0]) {
              this.$refs.codeInputs[0].focus();
            }
          }, 1500);
        } else {
          this.step1Error = response.data.message;
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du code:', error);
        this.step1Error = error.response?.data?.message || 
                         'Erreur lors de l\'envoi du code. Veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },
    
    // Gestion de l'entrée du code
    onCodeInput(event, index) {
      const value = event.target.value;
      
      // N'accepter que les chiffres
      if (!/^\d$/.test(value)) {
        this.code[index] = '';
        return;
      }
      
      this.code[index] = value;
      
      // Passer au champ suivant
      if (index < 5 && value) {
        const nextInput = this.$refs.codeInputs[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    },
    
    onCodeDelete(event, index) {
      // Si le champ est vide, aller au champ précédent
      if (!this.code[index] && index > 0) {
        const prevInput = this.$refs.codeInputs[index - 1];
        if (prevInput) {
          prevInput.focus();
          this.code[index - 1] = '';
        }
      }
    },
    
    onCodePaste(event) {
      event.preventDefault();
      const pasteData = event.clipboardData.getData('text');
      const numbers = pasteData.replace(/\D/g, '').split('').slice(0, 6);
      
      numbers.forEach((num, index) => {
        this.code[index] = num;
      });
      
      // Focus sur le prochain champ vide ou le dernier
      const nextEmptyIndex = this.code.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1 && this.$refs.codeInputs[nextEmptyIndex]) {
        this.$refs.codeInputs[nextEmptyIndex].focus();
      } else if (this.$refs.codeInputs[5]) {
        this.$refs.codeInputs[5].focus();
      }
    },
    
    // Cooldown pour renvoyer le code
    startResendCooldown() {
      this.resendCooldown = 60; // 60 secondes
      
      const timer = setInterval(() => {
        this.resendCooldown--;
        if (this.resendCooldown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    },
    
    // Renvoyer le code
    async resendCode() {
      if (this.resendCooldown > 0) return;
      
      this.loading = true;
      this.step2Error = '';
      
      try {
        const response = await axios.post('/api/auth/forgot-password', {
          email: this.email
        });
        
        if (response.data.success) {
          this.step2Success = 'Un nouveau code a été envoyé à votre adresse email.';
          this.startResendCooldown();
          
          // Effacer le code actuel
          this.code = ['', '', '', '', '', ''];
          
          // Focus sur le premier champ
          if (this.$refs.codeInputs && this.$refs.codeInputs[0]) {
            this.$refs.codeInputs[0].focus();
          }
          
          // Effacer le message après 5 secondes
          setTimeout(() => {
            this.step2Success = '';
          }, 5000);
        } else {
          this.step2Error = response.data.message;
        }
      } catch (error) {
        console.error('Erreur lors du renvoi du code:', error);
        this.step2Error = 'Erreur lors du renvoi du code. Veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },
    
    // Étape 2: Vérifier le code
    async verifyCode() {
      if (!this.isCodeComplete) {
        this.step2Error = 'Veuillez entrer le code complet à 6 chiffres.';
        return;
      }
      
      this.loading = true;
      this.step2Error = '';
      
      try {
        const fullCode = this.code.join('');
        
        const response = await axios.post('/api/auth/verify-reset-code', {
          email: this.email,
          code: fullCode
        });
        
        if (response.data.success) {
          this.step2Success = response.data.message;
          setTimeout(() => {
            this.goToStep(3);
          }, 1000);
        } else {
          this.step2Error = response.data.message;
          
          // Effacer le code en cas d'erreur
          this.code = ['', '', '', '', '', ''];
          if (this.$refs.codeInputs && this.$refs.codeInputs[0]) {
            this.$refs.codeInputs[0].focus();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du code:', error);
        this.step2Error = error.response?.data?.message || 
                         'Erreur lors de la vérification du code. Veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },
    
    // Étape 3: Réinitialiser le mot de passe
    async resetPassword() {
      if (!this.isPasswordValid) {
        this.step3Error = 'Veuillez vérifier votre mot de passe.';
        return;
      }
      
      this.loading = true;
      this.step3Error = '';
      
      try {
        const fullCode = this.code.join('');
        
        const response = await axios.post('/api/auth/reset-password', {
          email: this.email,
          code: fullCode,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword
        });
        
        if (response.data.success) {
          this.step3Success = response.data.message;
          
          // Récupérer le rôle de l'utilisateur
          await this.fetchUserRole();
          
          // Passer à l'étape de succès
          setTimeout(() => {
            this.goToStep(4);
            this.startCountdown();
          }, 1000);
        } else {
          this.step3Error = response.data.message;
        }
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        this.step3Error = error.response?.data?.message || 
                         'Erreur lors de la réinitialisation. Veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer le rôle de l'utilisateur
    async fetchUserRole() {
      try {
        // Dans un système réel, on aurait un endpoint pour récupérer l'utilisateur
        // Pour l'instant, on va simuler avec le login
        const loginResponse = await axios.post('/api/auth/login', {
          email: this.email,
          password: this.newPassword
        });
        
        if (loginResponse.data.success) {
          this.userRole = loginResponse.data.user.role;
        }
      } catch (error) {
        console.log('Impossible de récupérer le rôle, redirection par défaut');
        this.userRole = 'UTILISATEUR';
      }
    },
    
    // Compte à rebours pour la redirection
    startCountdown() {
      this.countdown = 5;
      
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
          this.redirectToDashboard();
        }
      }, 1000);
    },
    
    // Redirection immédiate
    redirectNow() {
      this.redirectToDashboard();
    },
    
    // Redirection selon le rôle
    redirectToDashboard() {
      let route = '/accueil';
      
      switch (this.userRole) {
        case 'ADMIN':
          route = '/admin';
          break;
        case 'SCENARISTE':
          route = '/scenariste';
          break;
        case 'REALISATEUR':
          route = '/realisateur';
          break;
        case 'UTILISATEUR':
        default:
          route = '/accueil';
      }
      
      this.$router.push(route);
    },
    
    getRoleLabel(role) {
      const labels = {
        'ADMIN': 'Administrateur',
        'SCENARISTE': 'Scénariste',
        'REALISATEUR': 'Réalisateur',
        'UTILISATEUR': 'Utilisateur'
      };
      return labels[role] || role;
    }
  }
};
</script>



