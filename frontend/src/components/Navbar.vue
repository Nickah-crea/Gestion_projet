<template>
  <nav class="sidebar" :class="{ 'collapsed': isCollapsed }">
        
    <div class="menu-toggle-section">
      <button @click="toggleSidebar" class="menu-toggle">
        <i class="fas" :class="isCollapsed ? 'fa-arrow-right' : 'fa-arrow-left'"></i>
      </button>
    </div>
    
    <!-- HEADER -->
    <div class="sidebar-header">
      <div class="user-profile-section">
        <div class="user-profile-header">
          <div class="user-avatar icon">
            <i class="fas fa-user-circle"></i>
          </div>
          <div v-if="!isCollapsed" class="user-profile-info">
            <span class="user-name">{{ user?.nom || 'Utilisateur' }}</span>
            <span class="user-role">Rôle: {{ user?.role || 'Utilisateur' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTENU SCROLLABLE + FOOTER FIXE -->
    <div class="sidebar-content-wrapper">
      <!-- MENU DES LIENS SCROLLABLE -->
      <div class="sidebar-links-scrollable">
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
          <span v-if="!isCollapsed" class="link-text"> Comédiens</span>
        </router-link>

        <router-link to="/utilisateurs" class="sidebar-link" v-if="user?.role === 'ADMIN'"  @click="toggleSidebarIfMobile">
          <i class="fas fa-users icon"></i>
          <span v-if="!isCollapsed" class="link-text">Utilisateurs</span>
        </router-link>

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
          <span v-if="!isCollapsed" class="link-text">Personnages</span>
        </router-link>

        <router-link to="/creation-dialogue" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-comment-dots icon"></i>
          <span v-if="!isCollapsed" class="link-text">Dialogues</span>
        </router-link>

        <router-link to="/creation-lieu" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-map-marker-alt icon"></i>
          <span v-if="!isCollapsed" class="link-text">Lieux</span>
        </router-link>

        <router-link to="/creation-plateau" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-camera icon"></i>
          <span v-if="!isCollapsed" class="link-text">Plateaux</span>
        </router-link>

        <router-link to="/gestion-equipe" class="sidebar-link" v-if="user?.role === 'ADMIN'"  @click="toggleSidebarIfMobile">
          <i class="fas fa-users-cog icon"></i>
          <span v-if="!isCollapsed" class="link-text">Équipe</span>
        </router-link>

        <router-link to="/raccords" class="sidebar-link"  @click="toggleSidebarIfMobile">
          <i class="fas fa-link icon"></i>
          <span v-if="!isCollapsed" class="link-text">Raccords</span>
        </router-link>
      </div>
      
      <!-- FOOTER FIXE EN BAS -->
      <div class="sidebar-footer fixed-footer">
        <div class="theme-toggle-footer">
          <div class="theme-toggle-footer-2">
            <button class="theme-btn moon-btn" :class="{ 'active': !isDarkMode }" @click="toggleTheme('light')">
              <i class="fas fa-sun"></i>
            </button>
            <button class="theme-btn sun-btn" :class="{ 'active': isDarkMode }" @click="toggleTheme('dark')">
              <i class="fas fa-moon"></i>
            </button>
          </div>
        </div>

        <a href="#" @click="logout" class="sidebar-link logout-link">
          <i class="fas fa-sign-out-alt icon"></i>
          <span v-if="!isCollapsed" class="link-text">Déconnexion</span>
        </a>
      </div>
    </div>
  </nav>
</template>


<script>

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
      if (this.isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
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

