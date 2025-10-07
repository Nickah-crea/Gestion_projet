<template>
  <div class="app-wrapper-sc">
    <div class="accueil-container">
      <main class="main-content-scenariste">
        <div class="welcome-section">
          <h2>Bienvenue, {{ user?.nom }} !</h2>
          <p>Vous êtes connecté en tant que {{ user?.role }}</p>
        </div><br>

        <!-- Barre de recherche globale -->
        <div class="global-search-section">
          <div class="search-filters">
            <div class="filter-group">
              <label>Statut:</label>
              <select v-model="searchStatut" @change="performGlobalSearch">
                <option value="">Tous les statuts</option>
                <option v-for="statut in allStatuts" :key="statut" :value="statut">
                  {{ statut }}
                </option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Période:</label>
              <select v-model="searchDate" @change="performGlobalSearch">
                <option value="">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="this_week">Cette semaine</option>
                <option value="this_month">Ce mois</option>
                <option value="this_year">Cette année</option>
                <option value="recent">7 derniers jours</option>
              </select>
            </div>
          </div>

          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="globalSearchQuery" 
              @input="performGlobalSearch" 
              placeholder="Rechercher projets, épisodes, séquences, scènes..." 
              class="search-input"
            />
            <button v-if="globalSearchQuery" @click="clearGlobalSearch" class="clear-search-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Résultats de recherche globale -->
          <div v-if="showGlobalSearchResults" class="global-search-results">
            <div class="search-results-header">
              <h3>Résultats de recherche ({{ totalResults }})</h3>
              <button @click="clearGlobalSearch" class="close-results-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="results-list">
              <!-- Projets -->
              <div v-if="globalSearchResults.projets.length > 0" class="results-category">
                <h4 class="category-title">Projets ({{ globalSearchResults.projets.length }})</h4>
                <div 
                  v-for="result in globalSearchResults.projets" 
                  :key="'projet-' + result.id" 
                  class="search-result-item"
                  @click="toggleProjectDetails(result)"
                >
                  <span class="result-type-badge projet">
                    Projet
                  </span>
                  
                  <div class="result-content">
                    <h4>{{ result.titre }}</h4>
                    <div class="result-details">
                      <span class="project-name">
                        <i class="fas fa-film"></i> {{ result.titre }}
                      </span>
                    </div>
                    
                    <div class="result-meta">
                      <span class="statut" :class="getStatutClass(result.statutNom)">
                        {{ result.statutNom }}
                      </span>
                      <span class="date">
                        <i class="fas fa-calendar"></i> 
                        {{ formatDate(result.modifieLe) }}
                      </span>
                      <span class="toggle-arrow">
                        <i class="fas" :class="result.showDetails ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                        {{ result.showDetails ? 'Masquer' : 'Voir' }} le contenu
                      </span>
                    </div>
                    
                    <p v-if="result.synopsis" class="result-synopsis">
                      {{ truncateText(result.synopsis, 120) }}
                    </p>

                    <!-- Contenu du projet (épisodes/séquences/scènes) -->
                    <div v-if="result.showDetails && result.contenu" class="project-content">
                      <!-- Épisodes -->
                      <div v-if="result.contenu.episodes && result.contenu.episodes.length > 0" class="content-section">
                        <h5>Épisodes ({{ result.contenu.episodes.length }})</h5>
                        <div 
                          v-for="episode in result.contenu.episodes" 
                          :key="'episode-' + episode.id"
                          class="content-item episode-item"
                          @click.stop="navigateToEcranTravail(episode)"
                        >
                          <span class="content-type-badge episode">Épisode</span>
                          <div class="content-details">
                            <strong>{{ episode.ordre }}. {{ episode.titre }}</strong>
                            <span class="content-meta">
                              {{ episode.statutNom }} • {{ formatDate(episode.modifieLe) }}
                            </span>
                          </div>
                          <i class="fas fa-arrow-right content-arrow"></i>
                        </div>
                      </div>

                      <!-- Séquences -->
                      <div v-if="result.contenu.sequences && result.contenu.sequences.length > 0" class="content-section">
                        <h5>Séquences ({{ result.contenu.sequences.length }})</h5>
                        <div 
                          v-for="sequence in result.contenu.sequences" 
                          :key="'sequence-' + sequence.id"
                          class="content-item sequence-item"
                          @click.stop="navigateToEcranTravail(sequence)"
                        >
                          <span class="content-type-badge sequence">Séquence</span>
                          <div class="content-details">
                            <strong>{{ sequence.ordre }}. {{ sequence.titre }}</strong>
                            <span class="content-meta">
                              Épisode {{ sequence.ordreEpisode }} • {{ sequence.statutNom }} • {{ formatDate(sequence.modifieLe) }}
                            </span>
                          </div>
                          <i class="fas fa-arrow-right content-arrow"></i>
                        </div>
                      </div>

                      <!-- Scènes -->
                      <div v-if="result.contenu.scenes && result.contenu.scenes.length > 0" class="content-section">
                        <h5>Scènes ({{ result.contenu.scenes.length }})</h5>
                        <div 
                          v-for="scene in result.contenu.scenes" 
                          :key="'scene-' + scene.id"
                          class="content-item scene-item"
                          @click.stop="navigateToEcranTravail(scene)"
                        >
                          <span class="content-type-badge scene">Scène</span>
                          <div class="content-details">
                            <strong>{{ scene.ordre }}. {{ scene.titre }}</strong>
                            <span class="content-meta">
                              Séquence {{ scene.ordreSequence }} • {{ scene.statutNom }} • {{ formatDate(scene.modifieLe) }}
                            </span>
                          </div>
                          <i class="fas fa-arrow-right content-arrow"></i>
                        </div>
                      </div>

                      <div v-if="!result.contenu.episodes?.length && !result.contenu.sequences?.length && !result.contenu.scenes?.length" 
                           class="no-content">
                        <i class="fas fa-folder-open"></i>
                        <p>Aucun contenu trouvé dans ce projet</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Épisodes, séquences et scènes individuels (hors projets) -->
              <div v-if="globalSearchResults.autres.length > 0" class="results-category">
                <h4 class="category-title">Autres résultats ({{ globalSearchResults.autres.length }})</h4>
                <div 
                  v-for="result in globalSearchResults.autres" 
                  :key="result.id + result.type" 
                  class="search-result-item"
                  @click="navigateToEcranTravail(result)"
                >
                  <span class="result-type-badge" :class="result.type">
                    {{ getTypeLabel(result.type) }}
                  </span>
                  
                  <div class="result-content">
                    <h4>{{ result.titre }}</h4>
                    <div class="result-details">
                      <span class="project-name">
                        <i class="fas fa-film"></i> {{ result.projetTitre }}
                      </span>
                      <span v-if="result.episodeTitre" class="episode-info">
                        <i class="fas fa-play-circle"></i> Épisode {{ result.ordreEpisode }}: {{ result.episodeTitre }}
                      </span>
                      <span v-if="result.sequenceTitre" class="sequence-info">
                        <i class="fas fa-layer-group"></i> Séquence {{ result.ordreSequence }}: {{ result.sequenceTitre }}
                      </span>
                      <span v-if="result.ordreScene" class="scene-info">
                        <i class="fas fa-video"></i> Scène {{ result.ordreScene }}
                      </span>
                    </div>
                    
                    <div class="result-meta">
                      <span class="statut" :class="getStatutClass(result.statutNom)">
                        {{ result.statutNom }}
                      </span>
                      <span class="date">
                        <i class="fas fa-calendar"></i> 
                        {{ formatDate(result.modifieLe) }}
                      </span>
                    </div>
                    
                    <p v-if="result.synopsis" class="result-synopsis">
                      {{ truncateText(result.synopsis, 120) }}
                    </p>
                  </div>
                  
                  <i class="fas fa-arrow-right result-arrow"></i>
                </div>
              </div>
              
              <div v-if="totalResults === 0" class="no-results">
                <i class="fas fa-search"></i>
                <p>Aucun résultat trouvé pour "{{ globalSearchQuery }}"</p>
              </div>
            </div>
          </div>
        </div>
<div class="title-filtre" style="justify-content: center;">
          <h2> Bibliothèque de Projets</h2><br><br>
            <p class="subtitle">Vos films et séries en cours de création</p>
        </div><br>
        
        <div class="filters-scenariste">
          <div class="filter-group-scenariste">
            <label>Période de mise à jour:</label>
            <select v-model="filterTimePeriod">
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="this_week">Cette semaine</option>
              <option value="this_month">Ce mois-ci</option>
              <option value="this_year">Cette année</option>
              <option value="recent">Récent (7 derniers jours)</option>
            </select>
          </div>
          <div class="filter-group-scenariste">
            <label>Genre:</label>
            <select v-model="filterGenre">
              <option value="">Tous</option>
              <option v-for="genre in genres" :key="genre.idGenre" :value="genre.nomGenre">{{ genre.nomGenre }}</option>
            </select>
          </div>
          <div class="filter-group-scenariste">
            <label>Statut:</label>
            <select v-model="filterStatut">
              <option value="">Tous</option>
              <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.nomStatutsProjet">{{ statut.nomStatutsProjet }}</option>
            </select>
          </div>

          <div class="add-project-btn-container">
            <button class="add-project-btn" @click="goToAddProject">
              <i class="fas fa-plus-circle icon"></i> Nouveau Projet
            </button>
          </div>
        </div> <br> <br>
        
        <!-- Formulaire de modification de projet -->
        <div v-if="editingProject" class="edit-project-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3><i class="fas fa-edit icon"></i> Modifier le projet</h3>
              <button @click="cancelEdit" class="close-btn"><i class="fas fa-times icon"></i></button>
            </div>
            <form @submit.prevent="submitEdit" class="edit-form">
              <div class="form-group">
                <label for="edit-titre">Titre du projet *</label>
                <input 
                  type="text" 
                  id="edit-titre"
                  v-model="editForm.titre" 
                  required 
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="edit-synopsis">Synopsis</label>
                <textarea 
                  id="edit-synopsis"
                  v-model="editForm.synopsis" 
                  rows="4"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="edit-genre">Genre *</label>
                  <select 
                    id="edit-genre"
                    v-model="editForm.genreId" 
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
                  <label for="edit-statut">Statut *</label>
                  <select 
                    id="edit-statut"
                    v-model="editForm.statutId" 
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
                <label for="edit-dateFin">Date de fin *</label>
                <input 
                  type="date" 
                  id="edit-dateFin"
                  v-model="editForm.dateFin" 
                  required
                  class="form-input"
                />
              </div>

              <div v-if="editError" class="error-message">
                {{ editError }}
              </div>

              <div class="form-actions">
                <button type="button" @click="cancelEdit" class="cancel-btn"><i class="fas fa-times icon"></i> Annuler</button>
                <button type="submit" class="submit-btn" :disabled="editLoading">
                  <i class="fas fa-save icon"></i> {{ editLoading ? 'Modification en cours...' : 'Modifier le projet' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Nouvelle présentation des projets en grille type bibliothèque -->
        <div class="projects-library">
          <div v-for="(project, index) in filteredProjects" :key="project.id" class="movie-card" :style="{'--index': index + 1}">
            <div class="movie-poster">
              <div class="poster-icon">
                <i class="fas fa-film"></i>
              </div>
              <div class="movie-overlay">
                <div class="movie-statut">
                  <span class="statut-badge" :class="getStatutClass(project.statutNom)">
                    {{ project.statutNom }}
                  </span>
                </div>
                <div class="movie-actions">
                  <button class="action-btn edit-btn" @click.stop="startEdit(project)" title="Modifier">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button class="action-btn delete-btn" @click.stop="deleteProject(project.id)" title="Supprimer">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="movie-info">
              <h3 class="movie-title">{{ project.titre }}</h3>
              <p class="movie-genre">{{ project.genreNom }}</p>
              
              <div class="movie-meta">
                <div class="meta-item">
                  <i class="fas fa-calendar-plus"></i>
                  <span>{{ formatShortDate(project.creeLe) }}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-calendar-check"></i>
                  <span>{{ formatShortDate(project.modifieLe) }}</span>
                </div>
              </div>
              
              <div class="movie-synopsis" v-if="project.synopsis">
                <p>{{ truncateText(project.synopsis, 120) }}</p>
              </div>
              
              <div class="movie-actions-bottom">
                <button class="action-btn primary-btn" @click="$router.push(`/projet/${project.id}`)" title="Détails">
                  <i class="fas fa-info-circle"></i>
                  <span>Détails</span>
                </button>
                <button class="action-btn secondary-btn" @click="goToAddEpisode(project.id)" title="Ajouter un épisode">
                  <i class="fas fa-plus-circle"></i>
                  <span>Épisode</span>
                </button>
                <button class="action-btn accent-btn" @click="$router.push(`/projet/${project.id}/ecran-travail`)" title="Écran de travail">
                  <i class="fas fa-desktop"></i>
                  <span>Travailler</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucun projet -->
        <div v-if="filteredProjects.length === 0" class="no-projects">
          <div class="no-projects-icon">
            <i class="fas fa-film"></i>
          </div>
          <h3>Aucun projet trouvé</h3>
          <p>Commencez par créer votre premier projet !</p>
          <button class="add-project-btn-large" @click="goToAddProject">
            <i class="fas fa-plus-circle"></i>
            Créer un projet
          </button>
        </div>
      </main>
    </div>
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

      // Recherche globale - structure modifiée
      globalSearchQuery: '',
      searchStatut: '',
      searchDate: '',
      globalSearchResults: {
        projets: [],
        autres: []
      },
      showGlobalSearchResults: false,
      globalSearchTimeout: null,
      allStatuts: [],
      expandedProjects: new Set() // Pour garder la trace des projets dépliés
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
      
      // Filtre par genre
      if (this.filterGenre) {
        list = list.filter(p => p.genreNom === this.filterGenre);
      }
      
      // Filtre par statut
      if (this.filterStatut) {
        list = list.filter(p => p.statutNom === this.filterStatut);
      }
      
      // Filtre par période de mise à jour
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
    
    // Fermer les résultats de recherche en cliquant à l'extérieur
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
    
    // Méthodes de recherche globale
     // Méthodes de recherche globale modifiées
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
        
        if (this.searchDate) {
          params.append('date', this.searchDate);
        }
        
        const response = await axios.get(`/api/recherche-globale?${params}`);
        
        // Réorganiser les résultats : projets séparés des autres éléments
        const resultats = response.data;
        const projets = resultats.filter(r => r.type === 'projet');
        const autres = resultats.filter(r => r.type !== 'projet');
        
        // Ajouter la propriété showDetails aux projets
        const projetsAvecDetails = projets.map(projet => ({
          ...projet,
          showDetails: this.expandedProjects.has(projet.id),
          contenu: null // Chargé seulement quand on clique
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

    // Nouvelle méthode pour afficher/masquer le contenu d'un projet
    async toggleProjectDetails(projet) {
      // Basculer l'état d'affichage
      projet.showDetails = !projet.showDetails;
      
      if (projet.showDetails) {
        this.expandedProjects.add(projet.id);
        // Charger le contenu du projet si pas déjà fait
        if (!projet.contenu) {
          await this.chargerContenuProjet(projet);
        }
      } else {
        this.expandedProjects.delete(projet.id);
      }
    },

    async chargerContenuProjet(projet) {
      try {
        // Charger les épisodes, séquences et scènes de ce projet
        const [episodesResponse, sequencesResponse, scenesResponse] = await Promise.all([
          axios.get(`/api/episodes/projet/${projet.id}`),
          axios.get(`/api/sequences/projet/${projet.id}`),
          axios.get(`/api/scenes/projet/${projet.id}`)
        ]);

        // Formater les épisodes
        const episodesFormatted = (episodesResponse.data || []).map(episode => ({
          ...episode,
          type: 'episode',
          projetId: projet.id,
          id: episode.idEpisode || episode.id,
          // S'assurer que les propriétés nécessaires existent
          titre: episode.titre,
          statutNom: episode.statutNom,
          modifieLe: episode.modifieLe,
          ordre: episode.ordre
        }));

        // Formater les séquences  
        const sequencesFormatted = (sequencesResponse.data || []).map(sequence => ({
          ...sequence,
          type: 'sequence',
          projetId: projet.id,
          id: sequence.idSequence || sequence.id,
          episodeId: sequence.episodeId,
          // S'assurer que les propriétés nécessaires existent
          titre: sequence.titre,
          statutNom: sequence.statutNom,
          modifieLe: sequence.modifieLe,
          ordre: sequence.ordre,
          ordreEpisode: sequence.episode?.ordre
        }));

        // Formater les scènes
        const scenesFormatted = (scenesResponse.data || []).map(scene => ({
          ...scene,
          type: 'scene',
          projetId: projet.id,
          id: scene.idScene || scene.id,
          sequenceId: scene.sequenceId,
          // S'assurer que les propriétés nécessaires existent
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

    clearGlobalSearch() {
      this.globalSearchQuery = '';
      this.searchStatut = '';
      this.searchDate = '';
      this.globalSearchResults = { projets: [], autres: [] };
      this.showGlobalSearchResults = false;
      this.expandedProjects.clear();
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

    navigateToEcranTravail(result) {
      const queryParams = {};
      
      // Construire les paramètres selon le type de résultat
      if (result.type === 'projet') {
        // Pour un projet, on va à l'écran de travail du projet
        this.$router.push(`/projet/${result.projetId || result.id}/ecran-travail`);
      } 
      else if (result.type === 'episode') {
        queryParams.episodeId = result.id;
        this.$router.push({
          path: `/projet/${result.projetId}/ecran-travail`,
          query: queryParams
        });
      }
      else if (result.type === 'sequence') {
        queryParams.episodeId = result.episodeId;
        queryParams.sequenceId = result.id;
        this.$router.push({
          path: `/projet/${result.projetId}/ecran-travail`,
          query: queryParams
        });
      }
      else if (result.type === 'scene') {
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
        // Charger tous les statuts uniques depuis les différents types
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
        // En cas d'erreur, initialiser avec une liste vide
        this.allStatuts = [];
      }
    },

    handleClickOutsideSearch(event) {
      const searchContainer = event.target.closest('.global-search-section');
      if (!searchContainer) {
        this.showGlobalSearchResults = false;
      }
    },

    // Méthodes existantes
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


