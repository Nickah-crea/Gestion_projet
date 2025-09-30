<template>
  <div class="accueil-container">
    <!-- Contenu principal -->
    <main class="main-content">
      <div class="welcome-section">
        <h2>Bienvenue, {{ user?.nom }} !</h2>
        <p>Vous êtes connecté en tant que {{ user?.role }}</p>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>Projets</h3>
          <p>Gérez vos projets de films</p>
          <router-link to="/projets" class="card-link">Voir les projets</router-link>
        </div>
        
        <div class="dashboard-card">
          <h3>Utilisateurs</h3>
          <p>Gérez les utilisateurs</p>
          <router-link to="/utilisateurs" class="card-link">Voir les utilisateurs</router-link>
        </div>
        
        <div class="dashboard-card">
          <h3>Statistiques</h3>
          <p>Consultez les statistiques</p>
          <router-link to="/statistiques" class="card-link">Voir les stats</router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import '../assets/css/acceuil.css';

export default {
  name: 'AccueilView',
  data() {
    return {
      showProfileMenu: false,
      user: null
    };
  },
  computed: {
    userInitials() {
      if (!this.user?.nom) return '?';
      return this.user.nom
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
  },
  mounted() {
    this.loadUser();
    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    loadUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
      } else {
        // Rediriger vers la connexion si pas d'utilisateur
        this.$router.push('/');
      }
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    handleClickOutside(event) {
      if (!event.target.closest('.profile-section')) {
        this.showProfileMenu = false;
      }
    },
    seDeconnecter() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>

</style> 