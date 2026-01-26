<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Administration</h2>
        <p class="sidebar-subtitle">Gestion complète</p>
      </div>

      
      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-film"></i> Navigation
        </h3>
        <div class="sidebar-actions">
          <button 
            class="sidebar-btn" 
            :class="{ active: activeTab === 'liste' }"
            @click="activeTab = 'liste'"
          >
            <i class="fas fa-list"></i>
            Liste des Projets
          </button>
          <button 
            class="sidebar-btn" 
            :class="{ active: activeTab === 'ajout' }"
            @click="activeTab = 'ajout'"
          >
            <i class="fas fa-plus"></i>
            Ajouter un Projet
          </button>
        </div>
      </div>

      <div class="sidebar-section" v-if="activeTab === 'liste'">
        <h3 class="section-title">
          <i class="fas fa-filter"></i> Filtres
        </h3>
        <div class="filter-group">
          <div class="filter-item">
            <label>Genre</label>
            <select v-model="filterGenre" class="filter-select">
              <option value="">Tous les genres</option>
              <option v-for="genre in genres" :key="genre.idGenre" :value="genre.nomGenre">
                {{ genre.nomGenre }}
              </option>
            </select>
          </div>
          <div class="filter-item">
            <label>Statut</label>
            <select v-model="filterStatut" class="filter-select">
              <option value="">Tous les statuts</option>
              <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.nomStatutsProjet">
                {{ statut.nomStatutsProjet }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-chart-bar"></i> Statistiques
        </h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">{{ projects.length }}</span>
            <span class="stat-label">Projets totaux</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ enCoursCount }}</span>
            <span class="stat-label">En cours</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ terminesCount }}</span>
            <span class="stat-label">Terminés</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Contenu principal à droite -->
    <div class="admin-body">
      <main class="admin-main-content">
        <!-- Système d'onglets comme dans AddEpisode -->
        <div class="tabs-container">
          <div class="tabs-header">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'liste' }"
              @click="activeTab = 'liste'"
            >
              <i class="fas fa-list"></i>
              Liste des Projets
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'ajout' }"
              @click="activeTab = 'ajout'"
            >
              <i class="fas fa-plus"></i>
              Ajouter un Projet
            </button>
            <div class="tab-indicator" :style="tabIndicatorStyle"></div>
          </div>

          <div class="tabs-content">
            <!-- Onglet 1: Liste des projets -->
            <div v-if="activeTab === 'liste'" class="tab-pane">
              <div class="content-header">
                <div>
                  <h3>
                    <i class="fas fa-film"></i>
                    Bibliothèque de Projets
                  </h3>
                  <p>Gérez tous vos films et séries</p>
                </div>
                
                <div class="search-section">
                  <div class="search-group">
                    <label>Recherche rapide</label>
                    <div class="search-input-container">
                      <i class="fas fa-search search-icon"></i>
                      <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Rechercher un projet..." 
                        class="search-input-large"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tableau des projets -->
              <div class="table-container">
                <div class="episodes-table-container">
                  <table class="episodes-table">
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
                      <tr v-for="project in filteredProjects" :key="project.id">
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
                          <span class="episode-status" :class="getStatutClass(project.statutNom)">
                            {{ project.statutNom }}
                          </span>
                        </td>
                        <td>{{ formatDate(project.creeLe) }}</td>
                        <td>{{ formatDate(project.modifieLe) }}</td>
                        <td>{{ formatDate(project.dateFin) }}</td>
                        <td>
                          <div class="table-actions">
                            <button class="btn-edit" @click="editProject(project)" title="Modifier">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-view" @click="viewProject(project.id)" title="Voir détails">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-view" @click="goToWorkScreen(project.id)" title="Écran de travail">
                              <i class="fas fa-desktop"></i>
                            </button>
                            <button class="btn-edit delete-btn" @click="deleteProject(project.id)" title="Supprimer">
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div v-if="filteredProjects.length === 0" class="empty-state">
                    <i class="fas fa-film"></i>
                    <h3>Aucun projet trouvé</h3>
                    <p>Créez votre premier projet pour commencer</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet 2: Formulaire d'ajout -->
            <div v-if="activeTab === 'ajout'" class="tab-pane">
              <div class="form-header">
                <h3>
                  <i class="fas" :class="editingProject ? 'fa-edit' : 'fa-plus'"></i>
                  {{ editingProject ? 'Modifier le projet' : 'Ajouter un nouveau projet' }}
                </h3>
                <button @click="goToList" class="back-btn">
                  <i class="fas fa-arrow-left"></i>
                  Retour à la liste
                </button>
              </div>

              <form @submit.prevent="submitForm" class="project-form">
                <div class="form-group">
                  <label for="titre">Titre du projet </label>
                  <input 
                    type="text" 
                    id="titre"
                    v-model="form.titre" 
                    required 
                    placeholder="Entrez le titre du projet"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label for="synopsis">Synopsis</label>
                  <textarea 
                    id="synopsis"
                    v-model="form.synopsis" 
                    placeholder="Décrivez le synopsis du projet"
                    rows="4"
                    class="form-textarea"
                  ></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="genre">Genre </label>
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
                    <label for="statut">Statut </label>
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

                <div class="form-row">
                  <div class="form-group">
                    <label for="dateDebut">Date de début estimée </label>
                    <input 
                      type="date" 
                      id="dateDebut"
                      v-model="form.dateDebut" 
                      required
                      class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label for="dateFin">Date de fin estimée </label>
                    <input 
                      type="date" 
                      id="dateFin"
                      v-model="form.dateFin" 
                      required
                      class="form-input"
                    />
                  </div>
                </div>

                <div v-if="formError" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ formError }}
                </div>

                <div class="form-actions">
                  <button type="button" @click="resetForm" class="cancel-btn">
                    <i class="fas fa-times"></i>
                    Annuler
                  </button>
                  <button type="submit" class="submit-btn" :disabled="formLoading">
                    <i class="fas" :class="formLoading ? 'fa-spinner fa-spin' : (editingProject ? 'fa-save' : 'fa-check')"></i>
                    {{ formLoading ? 'Enregistrement...' : (editingProject ? 'Modifier le projet' : 'Créer le projet') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminHome',
  data() {
    return {
      activeTab: 'liste',
      projects: [],
      genres: [],
      statuts: [],
      searchQuery: '',
      filterGenre: '',
      filterStatut: '',
      editingProject: null,
      form: {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateDebut: '',
        dateFin: ''
      },
      formLoading: false,
      formError: ''
    };
  },
  computed: {
    filteredProjects() {
      let filtered = this.projects;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(project => 
          project.titre.toLowerCase().includes(query) ||
          (project.synopsis && project.synopsis.toLowerCase().includes(query))
        );
      }

      if (this.filterGenre) {
        filtered = filtered.filter(project => project.genreNom === this.filterGenre);
      }

      if (this.filterStatut) {
        filtered = filtered.filter(project => project.statutNom === this.filterStatut);
      }

      return filtered;
    },
    enCoursCount() {
      return this.projects.filter(p => p.statutNom === 'En cours').length;
    },
    terminesCount() {
      return this.projects.filter(p => p.statutNom === 'Terminé').length;
    },
    tabIndicatorStyle() {
      const tabs = ['liste', 'ajout'];
      const index = tabs.indexOf(this.activeTab);
      return {
        width: `${100 / tabs.length}%`,
        transform: `translateX(${index * 100}%)`
      };
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
      this.activeTab = 'ajout';
      this.editingProject = project;
      this.form = {
        titre: project.titre,
        synopsis: project.synopsis || '',
        genreId: project.genreId,
        statutId: this.getCurrentStatutId(project.statutNom),
        dateDebut: project.dateDebut ? project.dateDebut.split('T')[0] : '',
        dateFin: project.dateFin.split('T')[0]
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
          await axios.put(`/api/projets/${this.editingProject.id}`, this.form);
        } else {
          await axios.post('/api/projets', this.form);
        }

        await this.fetchProjects();
        this.resetForm();
        this.activeTab = 'liste';
        this.$nextTick(() => {
          alert(this.editingProject ? 'Projet modifié avec succès!' : 'Projet créé avec succès!');
        });
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

    goToList() {
      this.activeTab = 'liste';
      this.resetForm();
    },

    resetForm() {
      this.editingProject = null;
      this.form = {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateDebut: '',
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
        'En cours': 'status-en-cours',
        'Terminé': 'status-termine',
        'En attente': 'status-planifie',
        'Annulé': 'status-annule'
      };
      return statutClasses[statutNom] || 'status-planifie';
    }
  }
};
</script>

<style scoped>
</style>

