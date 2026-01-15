<template>
  <div class="app-wrapper-global">
  <div class="projects-list-container">
    <div class="projects-header">
      <h1>Bibliothèque de Projets</h1>
      <p>Gérez tous vos films et séries</p>
    </div>

    <!-- Barre d'outils -->
    <div class="toolbar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Rechercher un projet..." 
          class="search-input"
        />
      </div>
      
      <div class="filters">
        <select v-model="filterGenre" class="filter-select">
          <option value="">Tous les genres</option>
          <option v-for="genre in genres" :key="genre.idGenre" :value="genre.nomGenre">
            {{ genre.nomGenre }}
          </option>
        </select>

        <select v-model="filterStatut" class="filter-select">
          <option value="">Tous les statuts</option>
          <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.nomStatutsProjet">
            {{ statut.nomStatutsProjet }}
          </option>
        </select>
      </div>

      <button class="add-btn" @click="showAddModal = true">
        <i class="fas fa-plus"></i>
        Nouveau Projet
      </button>
    </div>

    <!-- Tableau des projets -->
    <div class="table-container">
      <table class="projects-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Genre</th>
            <th>Statut</th>
            <th>Date création</th>
            <th>Date modification</th>
            <th>Date fin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in filteredProjects" :key="project.id" class="project-row">
            <td class="project-title">
              <div class="title-wrapper">
                <i class="fas fa-film project-icon"></i>
                <div>
                  <strong>{{ project.titre }}</strong>
                  <p v-if="project.synopsis" class="synopsis-preview">
                    {{ truncateText(project.synopsis, 80) }}
                  </p>
                </div>
              </div>
            </td>
            <td>
              <span class="genre-tag">{{ project.genreNom }}</span>
            </td>
            <td>
              <span class="status-badge" :class="getStatutClass(project.statutNom)">
                {{ project.statutNom }}
              </span>
            </td>
            <td>{{ formatDate(project.creeLe) }}</td>
            <td>{{ formatDate(project.modifieLe) }}</td>
            <td>{{ formatDate(project.dateFin) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon edit-btn" @click="editProject(project)" title="Modifier">
                  <i class="fas fa-marker"></i>
                </button>
                <button class="btn-icon view-btn" @click="viewProject(project.id)" title="Voir détails">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon work-btn" @click="goToWorkScreen(project.id)" title="Écran de travail">
                  <i class="fas fa-desktop"></i>
                </button>
                <button class="btn-icon delete-btn" @click="deleteProject(project.id)" title="Supprimer">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredProjects.length === 0" class="no-projects">
        <i class="fas fa-film no-projects-icon"></i>
        <h3>Aucun projet trouvé</h3>
        <p>Créez votre premier projet pour commencer</p>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <div v-if="showAddModal || editingProject" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingProject ? 'Modifier le projet' : 'Nouveau Projet' }}</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-group">
            <label for="titre">Titre du projet *</label>
            <input 
              type="text" 
              id="titre"
              v-model="form.titre" 
              required 
              class="form-input"
              placeholder="Entrez le titre du projet"
            />
          </div>

          <div class="form-group">
            <label for="synopsis">Synopsis</label>
            <textarea 
              id="synopsis"
              v-model="form.synopsis" 
              rows="4"
              class="form-textarea"
              placeholder="Décrivez le synopsis de votre projet..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="genre">Genre *</label>
              <select 
                id="genre"
                v-model="form.genreId" 
                required
                class="form-select"
              >
                <option value="">Sélectionnez un genre</option>
                <option v-for="genre in genres" :key="genre.idGenre" :value="genre.idGenre">
                  {{ genre.nomGenre }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="statut">Statut *</label>
              <select 
                id="statut"
                v-model="form.statutId" 
                required
                class="form-select"
              >
                <option value="">Sélectionnez un statut</option>
                <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.idStatutProjet">
                  {{ statut.nomStatutsProjet }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="dateFin">Date de fin *</label>
            <input 
              type="date" 
              id="dateFin"
              v-model="form.dateFin" 
              required
              class="form-input"
            />
          </div>

          <div v-if="formError" class="error-message">
            {{ formError }}
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              <i class="fas fa-times"></i> Annuler
            </button>
            <button type="submit" class="submit-btn" :disabled="formLoading">
              <i class="fas fa-save"></i> 
              {{ formLoading ? 'Enregistrement...' : (editingProject ? 'Modifier' : 'Créer') }}
            </button>
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
  name: 'ListeProjects',
  data() {
    return {
      projects: [],
      genres: [],
      statuts: [],
      searchQuery: '',
      filterGenre: '',
      filterStatut: '',
      showAddModal: false,
      editingProject: null,
      form: {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateFin: ''
      },
      formLoading: false,
      formError: ''
    };
  },
  computed: {
    filteredProjects() {
      let filtered = this.projects;

      // Filtre par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(project => 
          project.titre.toLowerCase().includes(query) ||
          (project.synopsis && project.synopsis.toLowerCase().includes(query))
        );
      }

      // Filtre par genre
      if (this.filterGenre) {
        filtered = filtered.filter(project => project.genreNom === this.filterGenre);
      }

      // Filtre par statut
      if (this.filterStatut) {
        filtered = filtered.filter(project => project.statutNom === this.filterStatut);
      }

      return filtered;
    }
  },
  mounted() {
    this.fetchGenres();
    this.fetchStatuts();
    this.fetchProjects();
  },
  methods: {
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
    
    async fetchProjects() {
      try {
        const response = await axios.get('/api/projets');
        this.projects = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      }
    },

    editProject(project) {
      this.editingProject = project;
      this.form = {
        titre: project.titre,
        synopsis: project.synopsis || '',
        genreId: project.genreId,
        statutId: this.getCurrentStatutId(project.statutNom),
        dateFin: project.dateFin.split('T')[0] // Format YYYY-MM-DD pour input date
      };
    },

    getCurrentStatutId(statutNom) {
      const statut = this.statuts.find(s => s.nomStatutsProjet === statutNom);
      return statut ? statut.idStatutProjet : '';
    },

    async submitForm() {
      this.formLoading = true;
      this.formError = '';

      try {
        if (this.editingProject) {
          // Modification
          await axios.put(`/api/projets/${this.editingProject.id}`, this.form);
        } else {
          // Création
          await axios.post('/api/projets', this.form);
        }

        await this.fetchProjects();
        this.closeModal();
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du projet:', error);
        this.formError = error.response?.data?.message || 'Erreur lors de l\'enregistrement du projet';
      } finally {
        this.formLoading = false;
      }
    },

    async deleteProject(projectId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
        try {
          await axios.delete(`/api/projets/${projectId}`);
          await this.fetchProjects();
        } catch (error) {
          console.error('Erreur lors de la suppression du projet:', error);
          alert('Erreur lors de la suppression du projet');
        }
      }
    },

    viewProject(projectId) {
      this.$router.push(`/projet/${projectId}`);
    },

    goToWorkScreen(projectId) {
      this.$router.push(`/projet/${projectId}/ecran-travail`);
    },

    closeModal() {
      this.showAddModal = false;
      this.editingProject = null;
      this.form = {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateFin: ''
      };
      this.formError = '';
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },

    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    getStatutClass(statutNom) {
      const statutClasses = {
        'En cours': 'statut-en-cours',
        'Terminé': 'statut-termine',
        'En attente': 'statut-attente',
        'Annulé': 'statut-annule'
      };
      return statutClasses[statutNom] || 'statut-default';
    }
  }
};
</script>
