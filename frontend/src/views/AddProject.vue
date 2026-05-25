<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-add-project">
      <div class="sidebar-header-add-project">
        <h2 class="sidebar-title-add-project">Gestion des Projets</h2>
        <p class="sidebar-subtitle-add-project">Créez et gérez vos projets</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-add-project">
        <h3 class="section-title-add-project"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-add-project">
          <button 
            @click="goToForm" 
            class="sidebar-btn-add-project nouvelle-projet-btn" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouveau projet
          </button>
          <button @click="goBack" class="sidebar-btn-add-project retour-btn">
            <i class="fas fa-arrow-left"></i>
            Retourner à l'accueil
          </button>
        </div>
      </div>

      <!-- Section Informations -->
      <div class="sidebar-section-add-project">
        <h3 class="section-title-add-project"><i class="fas fa-info-circle"></i> Informations</h3>
        <div class="filter-group-add-project">
          <div class="filter-item-add-project">
            <label>Utilisateur connecté</label>
            <div class="user-info-add-project">
              <i class="fas fa-user"></i>
              <span>{{ user?.nom || 'Non connecté' }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-add-project">
      <div class="creation-main-content-add-project">
        
        <!-- Système d'onglets -->
        <div class="tabs-container-add-project">
          <div class="tabs-header-add-project">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-add-project', { active: activeTab === 'form' }]"
            >
              <i class="fas fa-plus"></i>
              Créer un projet
            </button>
            <button 
              v-if="isEditing"
              @click="activeTab = 'form'"
              :class="['tab-btn-add-project', { active: activeTab === 'form' }]"
            >
              <i class="fas fa-edit"></i>
              Modifier le projet
            </button>
          </div>
          
          <div class="tabs-content-add-project">
            <div class="tab-indicator-add-project" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-add-project">
              <div class="form-header-add-project">
                <h3>
                  <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
                  {{ isEditing ? 'Modifier le projet' : 'Créer un nouveau projet' }}
                </h3>
              </div>

              <form @submit.prevent="submitProject" class="project-form-add-project">
                <div class="form-row-add-project">
                  <div class="form-group-add-project">
                    <label for="titre">Titre du projet *</label>
                    <input 
                      type="text" 
                      id="titre"
                      v-model="project.titre" 
                      required 
                      placeholder="Entrez le titre du projet"
                      class="form-input-add-project"
                    />
                  </div>

                  <div class="form-group-add-project">
                    <label for="genre">Genre *</label>
                    <select 
                      id="genre"
                      v-model="project.genreId" 
                      required
                      class="form-select-add-project"
                    >
                      <option value="">Sélectionnez un genre</option>
                      <option v-for="genre in genres" :key="genre.idGenre" :value="genre.idGenre">
                        {{ genre.nomGenre }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-row-add-project">
                  <div class="form-group-add-project">
                    <label for="statut">Statut *</label>
                    <select 
                      id="statut"
                      v-model="project.statutId" 
                      required
                      class="form-select-add-project"
                    >
                      <option value="">Sélectionnez un statut</option>
                      <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.idStatutProjet">
                        {{ statut.nomStatutsProjet }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group-add-project">
                    <label for="dateDebut">Date de début estimée *</label>
                    <input 
                      type="date" 
                      id="dateDebut"
                      v-model="project.dateDebut" 
                      required
                      class="form-input-add-project"
                    />
                  </div>
                </div>

                <div class="form-row-add-project">
                  <div class="form-group-add-project">
                    <label for="dateFin">Date de fin estimée *</label>
                    <input 
                      type="date" 
                      id="dateFin"
                      v-model="project.dateFin" 
                      required
                      class="form-input-add-project"
                    />
                  </div>

                  <div class="form-group-add-project">
                    <label for="realisateurId">Réalisateur (optionnel)</label>
                    <select 
                      id="realisateurId"
                      v-model="project.realisateurId" 
                      class="form-select-add-project"
                    >
                      <option value="">Sélectionnez un réalisateur</option>
                      <option v-for="realisateur in realisateurs" :key="realisateur.id" :value="realisateur.id">
                        {{ realisateur.nom }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-group-add-project">
                  <label for="synopsis">Synopsis</label>
                  <textarea 
                    id="synopsis"
                    v-model="project.synopsis" 
                    placeholder="Décrivez le synopsis du projet"
                    rows="6"
                    class="form-textarea-add-project"
                  ></textarea>
                </div>

                <div v-if="error" class="error-message-add-project">
                  <i class="fas fa-exclamation-triangle"></i> {{ error }}
                </div>

                <div class="form-actions-add-project">
                  <button type="button" @click="cancelEdit" class="cancel-btn-add-project">
                    <i class="fas fa-times"></i>
                    Annuler
                  </button>
                  <button type="submit" class="submit-btn-add-project" :disabled="loading">
                    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                    <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer le projet') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddProjectView',
  data() {
    return {
      activeTab: 'form',
      user: null,
      project: {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateDebut: '',
        dateFin: '',
        realisateurId: ''
      },
      genres: [],
      statuts: [],
      realisateurs: [],
      loading: false,
      error: '',
      
      // Statistiques
      projectsCount: 0,
      projectsInProgress: 0,
      projectsCompleted: 0,
      
      // Édition
      isEditing: false,
      editingId: null
    };
  },
  computed: {
    getTabIndicatorStyle() {
      const tabWidth = 50;
      const activeIndex = 0;
      return {
        transform: `translateX(${activeIndex * tabWidth}%)`,
        width: `${tabWidth}%`
      };
    }
  },
  mounted() {
    this.loadUser();
    this.fetchGenres();
    this.fetchStatuts();
    this.fetchRealisateurs();
    this.loadProjectStatistics();
    
    // Vérifier si on est en mode édition
    const projectId = this.$route.params.id;
    if (projectId) {
      this.loadProjectForEdit(projectId);
    }
  },
  methods: {
    goToForm() {
      this.activeTab = 'form';
      this.isEditing = false;
      this.editingId = null;
      this.resetForm();
    },

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

    async fetchRealisateurs() {
      try {
        const response = await axios.get('/api/utilisateurs/role/REALISATEUR');
        this.realisateurs = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des réalisateurs:', error);
      }
    },

    async loadProjectForEdit(projectId) {
      try {
        const response = await axios.get(`/api/projets/${projectId}`, {
          headers: {
            'X-User-Id': this.user.id
          }
        });
        
        const projectData = response.data;
        this.project = {
          titre: projectData.titre,
          synopsis: projectData.synopsis || '',
          genreId: projectData.genreId,
          statutId: projectData.statutId,
          dateDebut: projectData.dateDebut.split('T')[0],
          dateFin: projectData.dateFin.split('T')[0],
          realisateurId: projectData.realisateurId || ''
        };
        
        this.isEditing = true;
        this.editingId = projectId;
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        this.error = 'Erreur lors du chargement du projet';
      }
    },

    async loadProjectStatistics() {
      try {
        if (!this.user?.id) return;
        
        const response = await axios.get(`/api/projets/utilisateur/${this.user.id}`);
        const projects = response.data;
        
        this.projectsCount = projects.length;
        this.projectsInProgress = projects.filter(p => p.statut?.nomStatutsProjet === 'En cours' || p.statut?.nomStatutsProjet === 'en_cours').length;
        this.projectsCompleted = projects.filter(p => p.statut?.nomStatutsProjet === 'Terminé' || p.statut?.nomStatutsProjet === 'termine').length;
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    },

    async submitProject() {
      this.loading = true;
      this.error = '';

      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          this.error = 'Utilisateur non connecté';
          return;
        }

        let response;
        
        if (this.isEditing) {
          // MODIFICATION
          response = await axios.put(`/api/projets/${this.editingId}`, this.project, {
            headers: {
              'X-User-Id': user.id
            }
          });
        } else {
          // CRÉATION
          response = await axios.post('/api/projets', this.project, {
            headers: {
              'X-User-Id': user.id
            }
          });
        }
        
        if (response.status === 201 || response.status === 200) {
          await this.loadProjectStatistics();
          
          if (this.isEditing) {
            this.$router.push('/scenariste');
          } else {
            this.$router.push('/scenariste');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création/modification du projet:', error);
        
        if (error.response?.status === 400) {
          this.error = error.response.data.message || 'Erreur de validation';
        } else if (error.response?.status === 403) {
          this.error = 'Vous n\'avez pas les permissions nécessaires';
        } else if (error.response?.status === 401) {
          this.error = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          this.error = error.response?.data?.message || 'Erreur lors de l\'opération';
        }
      } finally {
        this.loading = false;
      }
    },

    cancelEdit() {
      if (this.isEditing) {
        this.resetForm();
        this.$router.push('/scenariste');
      } else {
        this.goBack();
      }
    },

    resetForm() {
      this.project = {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateDebut: '',
        dateFin: '',
        realisateurId: ''
      };
      this.isEditing = false;
      this.editingId = null;
      this.error = '';
    },

    goBack() {
      this.$router.push('/scenariste');
    }
  }
};
</script>

<style scoped>
/* Le style est dans le fichier _add_projet.scss */
</style>


