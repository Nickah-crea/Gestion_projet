<template>
  <nav class="navbar" :class="{ 'collapsed': isCollapsed }">
    <div class="navbar-main">
      <!-- TOUT SUR LA MÊME LIGNE -->
      <div class="navbar-content">
        <div class="navbar-left">
          <router-link to="/" class="logo-link">
            <img src="../assets/img/logo.png" alt="Logo" class="logo-img">
          </router-link>
        </div>

        <!-- LIENS + BOUTON AJOUTER CENTRÉS -->
        <div class="nav-center" v-if="!isCollapsed">
          <router-link to="/accueil" class="nav-link" v-if="user?.role !== 'ADMIN' && user?.role !== 'SCENARISTE'" @click="toggleNavbarIfMobile">
            <span class="link-text">Accueil</span>
          </router-link>

          <router-link to="/admin" class="nav-link" v-if="user?.role === 'ADMIN'" @click="toggleNavbarIfMobile">
            <span class="link-text">Admin</span>
          </router-link>

          <router-link to="/scenariste" class="nav-link" v-if="user?.role === 'SCENARISTE'" @click="toggleNavbarIfMobile">
            <span class="link-text">Scénariste</span>
          </router-link>

          <router-link to="/statistiques" class="nav-link" v-if="user?.role === 'ADMIN'" @click="toggleNavbarIfMobile">
            <span class="link-text">Statistiques</span>
          </router-link>

          <router-link to="/calendrier-tournage" class="nav-link" @click="toggleNavbarIfMobile">
            <span class="link-text">Calendrier</span>
          </router-link>

          <router-link to="/recherche" class="nav-link" @click="toggleNavbarIfMobile">
            <span class="link-text">Recherche</span>
          </router-link>

          <!-- BOUTON + AJOUTER AVEC POP-UP STYLISÉ -->
          <div class="quick-add-section">
            <button 
              class="quick-add-btn" 
              @click="toggleAddPopup"
              :aria-expanded="showAddPopup"
              aria-haspopup="true"
            >
              <span>+ Ajouter</span>
              <i class="fas fa-chevron-down" :class="{ 'rotate-180': showAddPopup }"></i>
            </button>
            
            <!-- POP-UP SOUS LA NAVBAR : GRILLE DE BOUTONS (4 par ligne max) -->
            <div v-if="showAddPopup" class="add-popup" @click.stop>
              <div class="popup-content">
                <div class="popup-grid">
                  <!-- Ligne 1 : 4 boutons -->
                  <div class="popup-row">
                    <button class="popup-btn" @click="navigateTo('/creation-comedien')">
                      Comédien
                    </button>
                    <button class="popup-btn" @click="navigateTo('/creation-personnage')">
                      Personnage
                    </button>
                    <button class="popup-btn" @click="navigateTo('/creation-dialogue')">
                      Dialogue
                    </button>
                    <button class="popup-btn" @click="navigateTo('/creation-lieu')">
                      Lieu
                    </button>
                  </div>
                  
                  <!-- Ligne 2 : jusqu'à 4 boutons -->
                  <div class="popup-row">
                    <button class="popup-btn" @click="navigateTo('/creation-plateau')">
                      Plateau
                    </button>
                    <button class="popup-btn" @click="navigateTo('/raccords')">
                      Raccord
                    </button>
                    <button class="popup-btn" v-if="user?.role === 'ADMIN'" @click="navigateTo('/gestion-equipe')">
                      Équipe
                    </button>
                    <button class="popup-btn" v-if="user?.role === 'ADMIN'" @click="navigateTo('/utilisateurs')">
                      Utilisateurs
                    </button>
                  </div>
                  
                  <!-- Ligne 3 : centrée si moins de 4 -->
                  <div class="popup-row">
                    <button class="popup-btn" v-if="user?.role === 'ADMIN'" @click="navigateTo('/status-gestion')">
                      Tous Status
                    </button>
                    <button class="popup-btn" v-if="user?.role === 'ADMIN'" @click="navigateTo('/type-raccord')">
                      Type Raccord
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- [Déconnexion + burger] -->
        <div class="nav-actions">
          <!-- Lien vers Profile avec photo -->
          <router-link to="/profile" class="profile-link">
            <div class="profile-avatar-container">
              <img 
                v-if="user?.profilePhotoPath" 
                :src="getProfilePhotoUrl" 
                :alt="user?.nom || 'Utilisateur'"
                class="profile-avatar"
                @error="handleImageError"
              />
              <div v-else class="profile-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <span class="profile-text" v-if="!isCollapsed">{{ user?.nom || 'Utilisateur' }}</span>
          </router-link>

          <a href="#" @click.prevent="logout" class="logout-link">
            <i class="fas fa-sign-out-alt"></i>
            <span class="logout-text" v-if="!isCollapsed"></span>
          </a>

          <button @click="toggleNavbar" class="burger-menu" v-if="isMobile || isCollapsed">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>


<script>
import axios from 'axios';
import defaultProfileImage from '../assets/img/default-profile.jpg';

export default {
  name: 'Navbar',
  data() {
    return {
      user: null,
      isCollapsed: false,
      isMobile: false,
      selectedAddOption: '',
      defaultPhoto: defaultProfileImage,
      imageError: false,
      loadingProfilePhoto: false,
      showAddPopup: false
    };
  },
  computed: {
    getProfilePhotoUrl() {
      if (this.imageError) {
        return this.defaultPhoto;
      }
      
      if (this.user?.profilePhotoPath) {
        return `/api/profil/photo/${this.user.profilePhotoPath}`;
      }
      
      return this.defaultPhoto;
    }
  },
  mounted() {
    this.loadUser();
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    
    // Fermer le pop-up quand on clique en dehors
    document.addEventListener('click', this.closeAddPopup);
    
    // Écouter les changements de route pour rafraîchir les données utilisateur
    this.$watch(
      () => this.$route,
      () => {
        this.refreshUserData();
        this.closeAddPopup();
      }
    );
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    document.removeEventListener('click', this.closeAddPopup);
  },
  methods: {
    async loadUser() {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.user = user;
          
          // Si l'utilisateur a un ID mais pas de profilePhotoPath, on charge les données complètes
          if (user.id && !user.profilePhotoPath) {
            await this.loadUserProfile(user.id);
          }
          
          this.imageError = false;
        } catch (error) {
          console.error('Erreur lors du parsing des données utilisateur:', error);
          this.user = { nom: 'Utilisateur' };
        }
      }
    },
    
    async loadUserProfile(userId) {
      if (this.loadingProfilePhoto) return;
      
      this.loadingProfilePhoto = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(`/api/profil/${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data) {
          // Mettre à jour l'utilisateur avec les nouvelles données
          this.user = response.data;
          
          // Mettre à jour le localStorage
          const updatedUser = { 
            ...JSON.parse(localStorage.getItem('user') || '{}'),
            profilePhotoPath: response.data.profilePhotoPath,
            nom: response.data.nom,
            email: response.data.email
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          this.imageError = false;
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
        // Ne pas afficher d'erreur pour ne pas perturber l'utilisateur
      } finally {
        this.loadingProfilePhoto = false;
      }
    },
    
    async refreshUserData() {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.id) {
            // Recharger les données utilisateur à chaque changement de route
            await this.loadUserProfile(user.id);
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
        }
      }
    },
    
    logout() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push('/');
    },
    
    navigateTo(path) {
      if (path) {
        this.$router.push(path);
        this.closeAddPopup();
      }
    },
    
    toggleNavbar() {
      this.isCollapsed = !this.isCollapsed;
      this.closeAddPopup();
    },
    
    toggleNavbarIfMobile() {
      if (this.isMobile) {
        this.isCollapsed = true;
      }
      this.closeAddPopup();
    },
    
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) {
        this.isCollapsed = true;
      }
    },
    
    handleImageError(event) {
      console.log('Erreur de chargement de la photo de profil, utilisation de l\'image par défaut');
      this.imageError = true;
      
      // Forcer l'utilisation de l'image par défaut
      if (event.target) {
        event.target.src = this.defaultPhoto;
      }
      
      // Empêcher les nouvelles tentatives
      if (event.target) {
        event.target.onerror = null;
      }
    },
    
    toggleAddPopup(event) {
      event.stopPropagation();
      this.showAddPopup = !this.showAddPopup;
    },
    
    closeAddPopup() {
      this.showAddPopup = false;
    }
  }
};
</script>

