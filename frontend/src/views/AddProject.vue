<template>
  <div class="app-wrapper-global">
    <div class="add-project-container-add-projet">
      <!-- Contenu principal -->
      <main class="main-content-add-projet">
        <div class="form-header-add-projet">
          <h2>Ajouter un nouveau projet</h2>
          <button @click="goBack" class="back-btn-add-projet">← Retour</button>
        </div>

        <form @submit.prevent="submitProject" class="project-form-add-projet">
          <div class="form-group-add-projet">
            <label for="titre">Titre du projet *</label>
            <input 
              type="text" 
              id="titre"
              v-model="project.titre" 
              required 
              placeholder="Entrez le titre du projet"
              class="form-input-add-projet"
            />
          </div>

          <div class="form-group-add-projet">
            <label for="synopsis">Synopsis</label>
            <textarea 
              id="synopsis"
              v-model="project.synopsis" 
              placeholder="Décrivez le synopsis du projet"
              rows="4"
              class="form-textarea-add-projet"
            ></textarea>
          </div>

          <div class="form-row-add-projet">
            <div class="form-group-add-projet">
              <label for="genre">Genre *</label>
              <select 
                id="genre"
                v-model="project.genreId" 
                required
                class="form-select-add-projet"
              >
                <option value="">Sélectionnez un genre</option>
                <option v-for="genre in genres" :key="genre.idGenre" :value="genre.idGenre">
                  {{ genre.nomGenre }}
                </option>
              </select>
            </div>

            <div class="form-group-add-projet">
              <label for="statut">Statut *</label>
              <select 
                id="statut"
                v-model="project.statutId" 
                required
                class="form-select-add-projet"
              >
                <option value="">Sélectionnez un statut</option>
                <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.idStatutProjet">
                  {{ statut.nomStatutsProjet }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row-add-projet">
            <div class="form-group-add-projet">
              <label for="dateDebut">Date de début estimée *</label>
              <input 
                type="date" 
                id="dateDebut"
                v-model="project.dateDebut" 
                required
                class="form-input-add-projet"
              />
            </div>

            <div class="form-group-add-projet">
              <label for="dateFin">Date de fin estimée *</label>
              <input 
                type="date" 
                id="dateFin"
                v-model="project.dateFin" 
                required
                class="form-input-add-projet"
              />
            </div>
          </div>

          <div v-if="error" class="error-message-add-projet">
            {{ error }}
          </div>

          <div class="form-actions-add-projet">
            <button type="button" @click="goBack" class="cancel-btn-add-projet">Annuler</button>
            <button type="submit" class="submit-btn-add-projet" :disabled="loading">
              {{ loading ? 'Création en cours...' : 'Créer le projet' }}
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddProjectView',
  data() {
    return {
      showProfileMenu: false,
      user: null,
      project: {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateDebut: '',
        dateFin: ''
      },
      genres: [],
      statuts: [],
      loading: false,
      error: ''
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
    this.fetchGenres();
    this.fetchStatuts();
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
        this.$router.push('/');
      }
    },
    async fetchGenres() {
      try {
        const response = await axios.get('/api/genres');
        this.genres = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
      }
    },
    async fetchStatuts() {
      try {
        const response = await axios.get('/api/statuts-projet');
        this.statuts = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      }
    },
    async submitProject() {
      this.loading = true;
      this.error = '';

      try {
        const response = await axios.post('/api/projets', this.project);
        
        if (response.status === 201) {
          this.$router.push('/scenariste');
        }
      } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        this.error = error.response?.data?.message || 'Erreur lors de la création du projet';
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push('/scenariste');
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

