<template>
  <div class="scenariste-accueil-container-Scenariste">
    <main class="main-content-scenariste-Scenariste">
      <!-- Header avec barre de recherche, filtres Statut Recherche et Date spécifique à gauche, bouton à droite -->
      <div class="header-section-Scenariste">
        <div class="search-and-filters-Scenariste">
           <div class="welcome-section-Scenariste">
              <h2>Bienvenue, {{ user?.nom }} !</h2>
              <p>Vous êtes connecté en tant que {{ user?.role }}</p>
            </div>
            
            <!-- Bouton Nouveau Projet à droite -->
        <div class="add-project-center-Scenariste">
          <button class="add-project-btn-main-Scenariste" @click="goToAddProject">
            <i class="fas fa-plus-circle icon-Scenariste"></i> 
            Nouveau Projet
          </button>
        </div>
        
          <!-- Barre de recherche -->
          <div class="search-container-Scenariste">
            <div class="search-input-wrapper-Scenariste">
              <i class="fas fa-search search-icon-Scenariste"></i>
              <input 
                type="text" 
                v-model="globalSearchQuery" 
                @input="performGlobalSearch" 
                placeholder="Rechercher projets, épisodes, séquences, scènes..." 
                class="search-input-Scenariste"
              />
              <button v-if="globalSearchQuery" @click="clearGlobalSearch" class="clear-search-btn-Scenariste">
                <i class="fas fa-times"></i>
              </button>
            </div>  
          </div>
          <!-- Filtres Statut Recherche et Date spécifique -->
          <div class="header-filters-Scenariste">
            <!-- <div class="filter-group-scenariste-Scenariste">
              <select v-model="searchStatut" @change="performGlobalSearch" class="filter-select-Scenariste">
                <option value="">Tous les statuts</option>
                <option v-for="statut in allStatuts" :key="statut" :value="statut">
                  {{ statut }}
                </option>
              </select>
            </div> -->
            <div class="filter-group-scenariste-Scenariste">
              <input 
                type="date" 
                v-model="searchSpecificDate" 
                @change="performGlobalSearch"
                class="date-input-Scenariste"
              />
            </div>
          </div>
        </div>
        
        
      </div>

      <!-- Filtres restants avec la phrase "Les projets existants" à gauche -->
      <div class="filters-section-Scenariste">
        <div class="filters-row-Scenariste">
          <h3 class="projects-label-Scenariste">Les projets existants</h3>
          <div class="filters-right-Scenariste">
            <div class="filter-group-scenariste">
              <!-- <label>Période:</label> -->
              <select v-model="filterTimePeriod" class="filter-select-Scenariste">
                <option value="all">Tous périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="this_week">Cette semaine</option>
                <option value="this_month">Ce mois-ci</option>
                <option value="this_year">Cette année</option>
                <option value="recent">Récent (7 jours)</option>
              </select>
            </div>
            <div class="filter-group-scenariste">
              <!-- <label>Genre:</label> -->
              <select v-model="filterGenre" class="filter-select-Scenariste">
                <option value="">Tous genre</option>
                <option v-for="genre in genres" :key="genre.idGenre" :value="genre.nomGenre">{{ genre.nomGenre }}</option>
              </select>
            </div>
            <div class="filter-group-scenariste">
              <!-- <label>Statut:</label> -->
              <select v-model="filterStatut" class="filter-select-Scenariste">
                <option value="">Tous statuts</option>
                <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.nomStatutsProjet">{{ statut.nomStatutsProjet }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Résultats de recherche globale -->
      <div v-if="showGlobalSearchResults" class="global-search-results-Scenariste">
        <div class="search-results-header-Scenariste">
          <h3>Résultats de recherche ({{ totalResults }})</h3>
          <button @click="clearGlobalSearch" class="close-results-btn-Scenariste">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Résultats des projets -->
        <div v-if="globalSearchResults.projets.length > 0" class="search-results-group-Scenariste">
          <h4>Projets ({{ globalSearchResults.projets.length }})</h4>
          <div v-for="projet in globalSearchResults.projets" :key="projet.id" class="search-result-item-Scenariste">
            <div class="result-header-Scenariste" @click="toggleProjectDetails(projet)">
              <div class="result-main-info-Scenariste">
                <i class="fas fa-film result-icon-Scenariste"></i>
                <span class="result-title-Scenariste">{{ projet.titre }}</span>
                <span class="result-statut-Scenariste" :class="getStatutClass(projet.statutNom)">
                  {{ projet.statutNom }}
                </span>
              </div>
              <div class="result-actions-Scenariste">
                <button @click.stop="navigateToEcranTravail(projet)" class="action-btn-Scenariste">
                  <i class="fas fa-external-link-alt"></i>
                </button>
                <i class="fas fa-chevron-down toggle-icon-Scenariste" :class="{ 'rotated': projet.showDetails }"></i>
              </div>
            </div>
            
            <!-- Contenu détaillé du projet -->
            <div v-if="projet.showDetails" class="project-details-Scenariste">
              <div v-if="projet.contenu">
                <!-- Épisodes -->
                <div v-if="projet.contenu.episodes.length > 0" class="content-section-Scenariste">
                  <h5>Épisodes</h5>
                  <div v-for="episode in projet.contenu.episodes" :key="episode.id" 
                       class="content-item-Scenariste" @click="navigateToEcranTravail(episode)">
                    <i class="fas fa-list-alt"></i>
                    <span>Épisode {{ episode.ordre }}: {{ episode.titre }}</span>
                  </div>
                </div>
                
                <!-- Séquences -->
                <div v-if="projet.contenu.sequences.length > 0" class="content-section-Scenariste">
                  <h5>Séquences</h5>
                  <div v-for="sequence in projet.contenu.sequences" :key="sequence.id" 
                       class="content-item-Scenariste" @click="navigateToEcranTravail(sequence)">
                    <i class="fas fa-layer-group"></i>
                    <span>Séquence {{ sequence.ordre }}: {{ sequence.titre }}</span>
                  </div>
                </div>
                
                <!-- Scènes -->
                <div v-if="projet.contenu.scenes.length > 0" class="content-section-Scenariste">
                  <h5>Scènes</h5>
                  <div v-for="scene in projet.contenu.scenes" :key="scene.id" 
                       class="content-item-Scenariste" @click="navigateToEcranTravail(scene)">
                    <i class="fas fa-clipboard"></i>
                    <span>Scène {{ scene.ordre }}: {{ scene.titre }}</span>
                  </div>
                </div>
              </div>
              
              <div v-else class="loading-content-Scenariste">
                Chargement du contenu...
              </div>
            </div>
          </div>
        </div>
        
        <!-- Autres résultats -->
        <div v-if="globalSearchResults.autres.length > 0" class="search-results-group-Scenariste">
          <h4>Autres éléments ({{ globalSearchResults.autres.length }})</h4>
          <div v-for="result in globalSearchResults.autres" :key="result.id" 
               class="search-result-item-Scenariste" @click="navigateToEcranTravail(result)">
            <div class="result-main-info-Scenariste">
              <i :class="getResultIcon(result.type)" class="result-icon-Scenariste"></i>
              <span class="result-title-Scenariste">{{ result.titre }}</span>
              <span class="result-type-Scenariste">{{ getTypeLabel(result.type) }}</span>
              <span class="result-statut-Scenariste" :class="getStatutClass(result.statutNom)">
                {{ result.statutNom }}
              </span>
            </div>
            <div class="result-actions-Scenariste">
              <button class="action-btn-Scenariste">
                <i class="fas fa-external-link-alt"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="totalResults === 0" class="no-results-Scenariste">
          Aucun résultat trouvé pour "{{ globalSearchQuery }}"
        </div>
      </div>

      <!-- Grille des projets -->
      <div class="projects-library-Scenariste">
        <div v-for="(project, index) in filteredProjects" :key="project.id" class="movie-card-Scenariste" :style="{'--index': index + 1}">
       <!-- Header de la carte avec statut à gauche et actions à droite -->
          <div class="movie-card-header-Scenariste">
            <div class="movie-statut-Scenariste">
              <span class="statut-badge-Scenariste" :class="getStatutClass(project.statutNom)">
                {{ project.statutNom }}
              </span>
            </div>
            <div class="movie-actions-Scenariste">
              <button class="action-btn-Scenariste edit-btn-Scenariste" @click.stop="startEdit(project)" title="Modifier">
                <i class="fas fa-pen"></i>
              </button>
              <button class="action-btn-Scenariste delete-btn-Scenariste" @click.stop="deleteProject(project.id)" title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <!-- Contenu de la carte -->
          <div class="movie-info-Scenariste">
            <h3 class="movie-title-Scenariste">{{ project.titre }}</h3>
            <p class="movie-genre-Scenariste">{{ project.genreNom }}</p>
            
            <div class="movie-meta-Scenariste">
              <div class="meta-item-Scenariste">
                <i class="fas fa-calendar-plus"></i>
                <span>{{ formatShortDate(project.creeLe) }}</span>
              </div>
              <!-- <div class="meta-item-Scenariste">
                <i class="fas fa-calendar-check"></i>
                <span>{{ formatShortDate(project.modifieLe) }}</span>
              </div> -->
            </div>
            
            <div class="movie-synopsis-Scenariste" v-if="project.synopsis">
              <p>{{ truncateText(project.synopsis, 120) }}</p>
            </div>
            
            <!-- Actions en bas de carte -->
            <div class="movie-actions-bottom-Scenariste">
              <div class="actions-top-Scenariste">
                <button class="action-btn-Scenariste primary-btn-Scenariste" @click="$router.push(`/projet/${project.id}`)" title="Détails">
                  <i class="fas fa-info-circle"></i>
                  <span>Détails</span>
                </button>
                <!-- <button class="action-btn-Scenariste secondary-btn-Scenariste" @click="goToAddEpisode(project.id)" title="Ajouter un épisode">
                  <i class="fas fa-plus-circle"></i>
                  <span>Épisode</span>
                </button> -->
                <button class="action-btn-Scenariste accent-btn-Scenariste" @click="$router.push(`/projet/${project.id}/ecran-travail`)" title="Écran de travail">
                  <i class="fas fa-desktop"></i>
                  <span>Écran</span>
                </button>
              </div>
              <!-- <div class="actions-bottom-Scenariste">
                <button class="action-btn-Scenariste accent-btn-Scenariste" @click="$router.push(`/projet/${project.id}/ecran-travail`)" title="Écran de travail">
                  <i class="fas fa-desktop"></i>
                  <span>Écran de Travail</span>
                </button>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Message si aucun projet -->
      <div v-if="filteredProjects.length === 0" class="no-projects-Scenariste">
        <div class="no-projects-icon-Scenariste">
          <i class="fas fa-film"></i>
        </div>
        <h3>Aucun projet trouvé</h3>
        <p>Commencez par créer votre premier projet !</p>
        <button class="add-project-btn-large-Scenariste" @click="goToAddProject">
          <i class="fas fa-plus-circle"></i>
          Créer un projet
        </button>
      </div>

      <!-- Modal d'édition -->
      <div v-if="editingProject" class="edit-project-modal-Scenariste">
        <div class="modal-content-Scenariste">
          <div class="modal-header-Scenariste">
            <h3>Modifier le projet</h3>
            <button @click="cancelEdit" class="close-modal-btn-Scenariste">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body-Scenariste">
            <div v-if="editError" class="error-message-Scenariste">
              {{ editError }}
            </div>
            
            <div class="form-group-Scenariste">
              <label>Titre:</label>
              <input v-model="editForm.titre" type="text" class="form-input-Scenariste">
            </div>
            
            <div class="form-group-Scenariste">
              <label>Synopsis:</label>
              <textarea v-model="editForm.synopsis" class="form-textarea-Scenariste" rows="4"></textarea>
            </div>
            
            <div class="form-group-Scenariste">
              <label>Genre:</label>
              <select v-model="editForm.genreId" class="form-select-Scenariste">
                <option value="">Sélectionnez un genre</option>
                <option v-for="genre in genres" :key="genre.idGenre" :value="genre.idGenre">
                  {{ genre.nomGenre }}
                </option>
              </select>
            </div>
            
            <div class="form-group-Scenariste">
              <label>Statut:</label>
              <select v-model="editForm.statutId" class="form-select-Scenariste">
                <option value="">Sélectionnez un statut</option>
                <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.idStatutProjet">
                  {{ statut.nomStatutsProjet }}
                </option>
              </select>
            </div>
            
            <div class="form-group-Scenariste">
              <label>Date de fin:</label>
              <input v-model="editForm.dateFin" type="date" class="form-input-Scenariste">
            </div>
          </div>
          
          <div class="modal-footer-Scenariste">
            <button @click="cancelEdit" class="cancel-btn-Scenariste">Annuler</button>
            <button @click="submitEdit" :disabled="editLoading" class="save-btn-Scenariste">
              {{ editLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/css/scenariste_acceuil.css';

export default {
  name: 'ScenaristeAccueilView',
  data() {
    return {
      showProfileMenu: false,
      user: null,
      projects: [],
      genres: [],
      statuts: [],
      filterTimePeriod: 'all',
      filterGenre: '',
      filterStatut: '',
      editingProject: null,
      editForm: {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateFin: ''
      },
      editLoading: false,
      editError: '',
      globalSearchQuery: '',
      searchStatut: '',
      searchDate: '',
      searchSpecificDate: '',
      globalSearchResults: {
        projets: [],
        autres: []
      },
      showGlobalSearchResults: false,
      globalSearchTimeout: null,
      allStatuts: [],
      expandedProjects: new Set()
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
    },
    totalResults() {
      return this.globalSearchResults.projets.length + this.globalSearchResults.autres.length;
    },
    filteredProjects() {
      let list = this.projects;
      if (this.filterGenre) {
        list = list.filter(p => p.genreNom === this.filterGenre);
      }
      if (this.filterStatut) {
        list = list.filter(p => p.statutNom === this.filterStatut);
      }
      if (this.filterTimePeriod !== 'all') {
        const now = new Date();
        let startDate;
        switch (this.filterTimePeriod) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'this_week':
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(now);
            startDate.setDate(now.getDate() - diffToMonday);
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'this_year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          case 'recent':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          default:
            startDate = null;
        }
        if (startDate) {
          list = list.filter(p => {
            const modifieLe = new Date(p.modifieLe);
            return modifieLe >= startDate;
          });
        }
      }
      return list;
    }
  },
  mounted() {
    this.loadUser();
    this.fetchGenres();
    this.fetchStatuts();
    this.fetchProjects();
    this.loadAllStatuts();
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('click', this.handleClickOutsideSearch);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('click', this.handleClickOutsideSearch);
  },
  methods: {
    loadUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
        if (this.user.role !== 'SCENARISTE' && this.user.role !== 'REALISATEUR') {
          this.$router.push('/accueil');
        }
      } else {
        this.$router.push('/');
      }
    },
    async performGlobalSearch() {
      if (this.globalSearchTimeout) {
        clearTimeout(this.globalSearchTimeout);
      }
      if (this.globalSearchQuery.trim().length < 2) {
        this.showGlobalSearchResults = false;
        this.globalSearchResults = { projets: [], autres: [] };
        return;
      }
      this.globalSearchTimeout = setTimeout(() => {
        this.executeGlobalSearch();
      }, 300);
    },
    async executeGlobalSearch() {
      try {
        const query = this.globalSearchQuery.trim();
        if (query.length < 2) return;
        const params = new URLSearchParams({
          q: query
        });
        if (this.searchStatut) {
          params.append('statut', this.searchStatut);
        }
        if (this.searchSpecificDate) {
          params.append('specificDate', this.searchSpecificDate);
        } else if (this.searchDate) {
          params.append('date', this.searchDate);
        }
        const response = await axios.get(`/api/recherche-globale?${params}`);
        const resultats = response.data;
        const projets = resultats.filter(r => r.type === 'projet');
        const autres = resultats.filter(r => r.type !== 'projet');
        const projetsAvecDetails = projets.map(projet => ({
          ...projet,
          showDetails: this.expandedProjects.has(projet.id),
          contenu: null
        }));
        this.globalSearchResults = {
          projets: projetsAvecDetails,
          autres: autres
        };
        this.showGlobalSearchResults = true;
      } catch (error) {
        console.error('Erreur lors de la recherche globale:', error);
        this.globalSearchResults = { projets: [], autres: [] };
        this.showGlobalSearchResults = true;
      }
    },
    clearGlobalSearch() {
      this.globalSearchQuery = '';
      this.searchStatut = '';
      this.searchDate = '';
      this.searchSpecificDate = '';
      this.globalSearchResults = { projets: [], autres: [] };
      this.showGlobalSearchResults = false;
      this.expandedProjects.clear();
    },
    async toggleProjectDetails(projet) {
      projet.showDetails = !projet.showDetails;
      if (projet.showDetails) {
        this.expandedProjects.add(projet.id);
        if (!projet.contenu) {
          await this.chargerContenuProjet(projet);
        }
      } else {
        this.expandedProjects.delete(projet.id);
      }
    },
    async chargerContenuProjet(projet) {
      try {
        const [episodesResponse, sequencesResponse, scenesResponse] = await Promise.all([
          axios.get(`/api/episodes/projet/${projet.id}`),
          axios.get(`/api/sequences/projet/${projet.id}`),
          axios.get(`/api/scenes/projet/${projet.id}`)
        ]);
        const episodesFormatted = (episodesResponse.data || []).map(episode => ({
          ...episode,
          type: 'episode',
          projetId: projet.id,
          id: episode.idEpisode || episode.id,
          titre: episode.titre,
          statutNom: episode.statutNom,
          modifieLe: episode.modifieLe,
          ordre: episode.ordre
        }));
        const sequencesFormatted = (sequencesResponse.data || []).map(sequence => ({
          ...sequence,
          type: 'sequence',
          projetId: projet.id,
          id: sequence.idSequence || sequence.id,
          episodeId: sequence.episodeId,
          titre: sequence.titre,
          statutNom: sequence.statutNom,
          modifieLe: sequence.modifieLe,
          ordre: sequence.ordre,
          ordreEpisode: sequence.episode?.ordre
        }));
        const scenesFormatted = (scenesResponse.data || []).map(scene => ({
          ...scene,
          type: 'scene',
          projetId: projet.id,
          id: scene.idScene || scene.id,
          sequenceId: scene.sequenceId,
          titre: scene.titre,
          statutNom: scene.statutNom,
          modifieLe: scene.modifieLe,
          ordre: scene.ordre,
          ordreSequence: scene.sequence?.ordre
        }));
        projet.contenu = {
          episodes: episodesFormatted,
          sequences: sequencesFormatted,
          scenes: scenesFormatted
        };
      } catch (error) {
        console.error('Erreur lors du chargement du contenu du projet:', error);
        projet.contenu = {
          episodes: [],
          sequences: [],
          scenes: []
        };
      }
    },
    getTypeLabel(type) {
      const labels = {
        'projet': 'Projet',
        'episode': 'Épisode',
        'sequence': 'Séquence',
        'scene': 'Scène'
      };
      return labels[type] || type;
    },
    getResultIcon(type) {
      const icons = {
        'projet': 'fas fa-film',
        'episode': 'fas fa-list-alt',
        'sequence': 'fas fa-layer-group',
        'scene': 'fas fa-clipboard'
      };
      return icons[type] || 'fas fa-file';
    },
    navigateToEcranTravail(result) {
      const queryParams = {};
      if (result.type === 'projet') {
        this.$router.push(`/projet/${result.projetId || result.id}/ecran-travail`);
      } else if (result.type === 'episode') {
        queryParams.episodeId = result.id;
        this.$router.push({
          path: `/projet/${result.projetId}/ecran-travail`,
          query: queryParams
        });
      } else if (result.type === 'sequence') {
        queryParams.episodeId = result.episodeId;
        queryParams.sequenceId = result.id;
        this.$router.push({
          path: `/projet/${result.projetId}/ecran-travail`,
          query: queryParams
        });
      } else if (result.type === 'scene') {
        queryParams.episodeId = result.episodeId;
        queryParams.sequenceId = result.sequenceId;
        queryParams.sceneId = result.id;
        this.$router.push({
          path: `/projet/${result.projetId}/ecran-travail`,
          query: queryParams
        });
      }
      this.clearGlobalSearch();
    },
    async loadAllStatuts() {
      try {
        const [projetStatuts, episodeStatuts, sequenceStatuts, sceneStatuts] = await Promise.all([
          axios.get('/api/statuts-projet'),
          axios.get('/api/statuts-episode'),
          axios.get('/api/statuts-sequence'),
          axios.get('/api/statuts-scene')
        ]);
        const allStatuts = new Set();
        projetStatuts.data.forEach(statut => allStatuts.add(statut.nomStatutsProjet));
        episodeStatuts.data.forEach(statut => allStatuts.add(statut.nomStatutsEpisode));
        sequenceStatuts.data.forEach(statut => allStatuts.add(statut.nomStatutsSequence));
        sceneStatuts.data.forEach(statut => allStatuts.add(statut.nomStatutsScene));
        this.allStatuts = Array.from(allStatuts).sort();
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
        this.allStatuts = [];
      }
    },
    handleClickOutsideSearch(event) {
      const searchContainer = event.target.closest('.search-and-filters-Scenariste');
      const resultsContainer = event.target.closest('.global-search-results-Scenariste');
      if (!searchContainer && !resultsContainer) {
        this.showGlobalSearchResults = false;
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
    async fetchProjects() {
      try {
        const response = await axios.get('/api/projets');
        this.projects = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      }
    },
    startEdit(project) {
      this.editingProject = project;
      this.editForm = {
        titre: project.titre,
        synopsis: project.synopsis || '',
        genreId: project.genreId,
        statutId: this.getCurrentStatutId(project.statutNom),
        dateFin: project.dateFin
      };
    },
    getCurrentStatutId(statutNom) {
      const statut = this.statuts.find(s => s.nomStatutsProjet === statutNom);
      return statut ? statut.idStatutProjet : '';
    },
    async submitEdit() {
      this.editLoading = true;
      this.editError = '';
      try {
        const response = await axios.put(`/api/projets/${this.editingProject.id}`, this.editForm);
        if (response.status === 200) {
          await this.fetchProjects();
          this.cancelEdit();
        }
      } catch (error) {
        console.error('Erreur lors de la modification du projet:', error);
        this.editError = error.response?.data?.message || 'Erreur lors de la modification du projet';
      } finally {
        this.editLoading = false;
      }
    },
    cancelEdit() {
      this.editingProject = null;
      this.editForm = {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateFin: ''
      };
      this.editError = '';
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
    formatDate(date) {
      return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatShortDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    getStatutClass(statutNom) {
      const statutClasses = {
        'En cours': 'statut-en-cours',
        'Terminé': 'statut-termine',
        'En attente': 'statut-attente',
        'Annulé': 'statut-annule',
        'Planifié': 'statut-planifie',
        'En préparation': 'statut-preparation',
        'En tournage': 'statut-tournage',
        'Tourné': 'statut-tourne',
        'Monté': 'statut-monte',
        'Validé': 'statut-valide'
      };
      return statutClasses[statutNom] || 'statut-default';
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
    },
    goToAddEpisode(projectId) {
      this.$router.push(`/projet/${projectId}/add-episode`);
    },
    goToAddProject() {
      this.$router.push('/add-project');
    }
  }
};
</script>
