<template>
  <nav class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-brand">
      <div class="user-profile-header">
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div v-if="!isCollapsed" class="user-profile-info">
          <span class="user-name">{{ user?.nom || 'Utilisateur' }}</span>
          <span class="user-storage">Rôle: {{ user?.role || 'Utilisateur' }}</span>
        </div>
      </div>
      <button @click="toggleSidebar" class="menu-toggle">
        <span v-if="!isCollapsed" class="menu-icon"><i class="fas fa-bars"></i></span>
        <span v-else class="menu-icon"><i class="fas fa-arrow-left"></i></span>
      </button>
    </div>

    
    <div class="sidebar-menu">
      <div class="sidebar-links">
        <!-- Accueil : visible pour tous SAUF ADMIN et SCENARISTE -->
        <router-link to="/accueil" class="sidebar-link" v-if="user?.role !== 'ADMIN' && user?.role !== 'SCENARISTE'"  @click="toggleSidebarIfMobile">
          <i class="fas fa-home icon"></i>
          <span v-if="!isCollapsed" class="link-text">Accueil</span>
        </router-link>

        <router-link to="/admin" class="sidebar-link" v-if="user?.role === 'ADMIN'"  @click="toggleSidebarIfMobile">
          <i class="fas fa-user-shield icon"></i>
          <span v-if="!isCollapsed" class="link-text">Admin</span>
        </router-link>

        <router-link to="/scenariste" class="sidebar-link" v-if="user?.role === 'SCENARISTE'"  @click="toggleSidebarIfMobile">
          <i class="fas fa-pen-fancy icon"></i>
          <span v-if="!isCollapsed" class="link-text">Scénariste</span>
        </router-link>

        <router-link to="/creation-comedien" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-users icon"></i>
          <span v-if="!isCollapsed" class="link-text">Gestion Comédiens</span>
        </router-link>

        <router-link to="/utilisateurs" class="sidebar-link" v-if="user?.role === 'ADMIN'"  @click="toggleSidebarIfMobile">
          <i class="fas fa-users icon"></i>
          <span v-if="!isCollapsed" class="link-text">Utilisateurs</span>
        </router-link>

        <!-- Statistiques : visible seulement pour ADMIN et SCENARISTE -->
        <router-link to="/statistiques" class="sidebar-link" v-if="user?.role === 'ADMIN' || user?.role === 'SCENARISTE'"  @click="toggleSidebarIfMobile">
          <i class="fas fa-chart-bar icon"></i>
          <span v-if="!isCollapsed" class="link-text">Statistiques</span>
        </router-link>

        <router-link to="/calendrier-tournage" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-calendar-alt icon"></i>
          <span v-if="!isCollapsed" class="link-text">Calendrier</span>
        </router-link>

        <router-link to="/recherche" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-search icon"></i>
          <span v-if="!isCollapsed" class="link-text">Recherche</span>
        </router-link>

        <router-link to="/creation-personnage" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-user-astronaut icon"></i>
          <span v-if="!isCollapsed" class="link-text">Gestion Personnages</span>
        </router-link>

        <router-link to="/creation-dialogue" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-comment-dots icon"></i>
          <span v-if="!isCollapsed" class="link-text">Gestion Dialogues</span>
        </router-link>

        <router-link to="/creation-lieu" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-map-marker-alt icon"></i>
          <span v-if="!isCollapsed" class="link-text">Gestion Lieux</span>
        </router-link>

        <router-link to="/creation-plateau" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-camera icon"></i>
          <span v-if="!isCollapsed" class="link-text">Gestion Plateaux</span>
        </router-link>

        <router-link to="/gestion-equipe" class="sidebar-link" v-if="user?.role === 'ADMIN'"  @click="toggleSidebarIfMobile">
          <i class="fas fa-users-cog icon"></i>
          <span v-if="!isCollapsed" class="link-text">Gestion Équipe</span>
        </router-link>

      </div>
      
      <div class="sidebar-footer">
        <!-- Déconnexion comme un lien normal -->
        <a href="#" @click="logout" class="sidebar-link logout-link">
          <i class="fas fa-sign-out-alt icon"></i>
          <span v-if="!isCollapsed" class="link-text">Déconnexion</span>
        </a>
        
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
    </div>
  </nav>
</template>

<script>
import '../assets/css/sidebar.css';
export default {
  name: 'Sidebar',
  data() {
    return {
      user: null,
      isCollapsed: false,
      isMobile: false,
      isDarkMode: false
    };
  },
  mounted() {
    this.loadUser();
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme(savedTheme);
    }
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
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
    toggleSidebarIfMobile() {
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
    toggleTheme(theme) {
      this.isDarkMode = theme === 'dark';
      this.applyTheme(theme);
      localStorage.setItem('theme', theme);
    },
    applyTheme(theme) {
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }
};
</script>
