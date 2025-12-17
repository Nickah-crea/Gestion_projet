<template>
  <nav class="navbar" :class="{ 'collapsed': isCollapsed }">
    <div class="navbar-main">
      <!-- TOUT SUR LA MÊME LIGNE -->
      <div class="navbar-content">
        <!-- [Prénom NOM + rôle] -->
        <!-- <div class="user-info"> -->
          <!-- <span class="logo"><img src="../assets/img/logo.png" alt="Logo"></span> -->
          <!-- <span class="user-name"><p>{{ user?.nom || 'Utilisateur' }}</p></span> -->
          <!-- <span class="user-role">{{ user?.role || 'Utilisateur' }}</span> -->
        <!-- </div> -->

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

           <router-link to="/profile" class="nav-link" @click="toggleNavbarIfMobile">
            <span class="link-text">Profile</span>
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
          <!-- Lien vers Profile avec icône -->
          <router-link to="/profile" class="profile-link">
            <i class="fas fa-user-circle"></i>
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
export default {
  name: 'Navbar',
  data() {
    return {
      user: null,
      isCollapsed: false,
      isMobile: false,
      selectedAddOption: ''
    };
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
    }
  }
};
</script>

