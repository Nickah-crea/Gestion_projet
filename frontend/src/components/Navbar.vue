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

        <!-- LIENS + SELECT CENTRÉS -->
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

          <!-- [+ Ajouter ▼] -->
          <div class="quick-add-section">
            <select class="quick-add-select" @change="navigateTo($event.target.value)" v-model="selectedAddOption">
              <option value="" disabled selected>+ Ajouter</option>
              <option value="/creation-comedien">Comédien</option>
              <option value="/creation-personnage">Personnage</option>
              <option value="/creation-dialogue">Dialogue</option>
              <option value="/creation-lieu">Lieu</option>
              <option value="/creation-plateau">Plateau</option>
              <option value="/raccords">Raccord</option>
              <option value="/gestion-equipe" v-if="user?.role === 'ADMIN'">Équipe</option>
              <option value="/utilisateurs" v-if="user?.role === 'ADMIN'">Utilisateurs</option>
              <option value="/status-gestion" v-if="user?.role === 'ADMIN'">Tous Status</option>
              <option value="/type-raccord" v-if="user?.role === 'ADMIN'">Type Raccord</option>
            </select>
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

          <a href="#" @click="logout" class="logout-link">
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
      imageError: false
    };
  },
  computed: {
    getProfilePhotoUrl() {
      if (this.imageError || !this.user?.profilePhotoPath) {
        return this.defaultPhoto;
      }
      return `/api/profil/photo/${this.user.profilePhotoPath}`;
    }
  },
  mounted() {
    this.loadUser();
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    loadUser() {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
        this.imageError = false; // Réinitialiser l'erreur d'image
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
        this.selectedAddOption = '';
      }
    },
    toggleNavbar() {
      this.isCollapsed = !this.isCollapsed;
    },
    toggleNavbarIfMobile() {
      if (this.isMobile) {
        this.isCollapsed = true;
      }
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
    }
  }
};
</script>

