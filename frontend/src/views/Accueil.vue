<template>
  <div class="app-wrapper">
    <div class="accueil-container">
      <!-- Contenu principal -->
      <main class="main-content-scenariste">
        <div class="welcome-section">
          <h2>Bienvenue, {{ user?.nom }} !</h2>
          <p>Vous êtes connecté en tant que {{ user?.role }}</p>
        </div><br>

        <!-- Barre de recherche globale -->
        <div class="global-search-section">
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="performSearch" 
              placeholder="Rechercher des épisodes, scènes, séquences..." 
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Résultats de recherche -->
          <div v-if="showSearchResults" class="search-results">
            <div class="search-results-header">
              <h3>Résultats de recherche ({{ searchResults.length }})</h3>
              <button @click="clearSearch" class="close-results-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="results-list">
              <div 
                v-for="result in searchResults" 
                :key="result.id + result.type" 
                class="search-result-item"
                @click="navigateToResult(result)"
              >
                <span class="result-type-badge" :class="result.type">
                  {{ getTypeLabel(result.type) }}
                </span>
                <div class="result-content">
                  <h4>{{ result.titre }}</h4>
                  <div class="result-details">
                    <span>Projet: {{ result.projetTitre }}</span>
                    <span v-if="result.episodeTitre">Épisode: {{ result.episodeTitre }}</span>
                    <span v-if="result.sequenceTitre">Séquence: {{ result.sequenceTitre }}</span>
                    <span>Ordre: {{ result.ordre }}</span>
                  </div>
                  <p class="result-synopsis" v-if="result.synopsis">
                    {{ truncateText(result.synopsis, 100) }}
                  </p>
                </div>
                <i class="fas fa-arrow-right result-arrow"></i>
              </div>
              <div v-if="searchResults.length === 0" class="no-results">
                Aucun résultat trouvé pour "{{ searchQuery }}"
              </div>
            </div>
          </div>
        </div>

        <div class="title-filtre" style="display: flex; justify-content: center;">
            <h2>Les projets existants</h2>
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
              <i class="fas fa-plus-circle icon"></i> Projet
            </button>
          </div>
        </div> <br> <br>
        

        <!-- liste des projets -->
        <div class="project-list">
          <div v-for="(project, index) in filteredProjects" :key="project.id" class="project-card-scen" :style="{'--index': index + 1}">
            <div class="episode-header">
                <div class="episode-statut-scene-acc">
                  <p><i class="fas fa-flag"></i> {{ project.statutNom }}</p>
                </div>
            </div>

            <h3><i class="fas fa-film icon"></i> Titre: {{ project.titre }}</h3>
            <p>Genre: {{ project.genreNom }}</p>
            <p>Créé le: {{ formatDate(project.creeLe) }}</p>
            <p>Modifié le: {{ formatDate(project.modifieLe) }}</p>
            
            <div class="episode-footer">
              <div class="button-group">
                <button class="details-btn" @click="$router.push(`/projet/${project.id}`)">
                  <i class="fas fa-info-circle icon"></i> Détails
                </button>
              </div>
              <button class="add-episode-btn-scen" @click="$router.push(`/projet/${project.id}/ecran-travail-viewers`)">
                <i class="fas fa-desktop icon" style="color: #21294F;"></i> Écran de Travail
              </button>
            </div>
          </div>
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
      
      // Nouvelles données pour la recherche
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      searchTimeout: null
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
    
    // Méthodes de recherche
    performSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      if (this.searchQuery.trim().length < 2) {
        this.showSearchResults = false;
        this.searchResults = [];
        return;
      }
      
      this.searchTimeout = setTimeout(() => {
        this.executeSearch();
      }, 300);
    },

async executeSearch() {
  try {
    const query = this.searchQuery.trim();
    if (query.length < 2) return;
    
    console.log('Lancement de la recherche pour:', query);
    
    // Recherche dans les épisodes, scènes et séquences
    const [episodesResponse, scenesResponse, sequencesResponse] = await Promise.all([
      axios.get(`/api/recherche/episodes?q=${encodeURIComponent(query)}`).catch(error => {
        console.error('Erreur recherche épisodes:', error);
        return { data: [] };
      }),
      axios.get(`/api/recherche/scenes?q=${encodeURIComponent(query)}`).catch(error => {
        console.error('Erreur recherche scènes:', error);
        return { data: [] };
      }),
      axios.get(`/api/recherche/sequences?q=${encodeURIComponent(query)}`).catch(error => {
        console.error('Erreur recherche séquences:', error);
        return { data: [] };
      })
    ]);
    
    console.log('Réponses reçues:', {
      episodes: episodesResponse.data,
      scenes: scenesResponse.data,
      sequences: sequencesResponse.data
    });
    
    const episodes = (episodesResponse.data || []).map(episode => ({
      ...episode,
      type: 'episode',
      projetTitre: episode.projetTitre || 'Projet inconnu',
      projetId: episode.projetId || this.getProjetIdFromEpisode(episode)
    }));
    
    const scenes = (scenesResponse.data || []).map(scene => ({
      ...scene,
      type: 'scene',
      projetTitre: scene.projetTitre || 'Projet inconnu',
      episodeTitre: scene.episodeTitre || 'Épisode inconnu',
      projetId: scene.projetId || this.getProjetIdFromScene(scene)
    }));
    
    const sequences = (sequencesResponse.data || []).map(sequence => ({
      ...sequence,
      type: 'sequence',
      projetTitre: sequence.projetTitre || 'Projet inconnu',
      episodeTitre: sequence.episodeTitre || 'Épisode inconnu',
      projetId: sequence.projetId || this.getProjetIdFromSequence(sequence)
    }));
    
    this.searchResults = [...episodes, ...scenes, ...sequences];
    this.showSearchResults = true;
    
    console.log('Résultats combinés:', this.searchResults);
    
  } catch (error) {
    console.error('Erreur globale lors de la recherche:', error);
    this.searchResults = [];
    this.showSearchResults = true;
  }
},
    
    clearSearch() {
      this.searchQuery = '';
      this.searchResults = [];
      this.showSearchResults = false;
    },
    
    getTypeLabel(type) {
      const labels = {
        'episode': 'Épisode',
        'scene': 'Scène',
        'sequence': 'Séquence'
      };
      return labels[type] || type;
    },
    
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    // navigateToResult(result) {
    //   // Navigation vers l'écran de travail avec les paramètres appropriés
    //   const queryParams = {};
      
    //   if (result.type === 'episode') {
    //     queryParams.episodeId = result.id;
    //   } else if (result.type === 'sequence') {
    //     queryParams.episodeId = result.episodeId;
    //     queryParams.sequenceId = result.id;
    //   } else if (result.type === 'scene') {
    //     queryParams.episodeId = result.episodeId;
    //     queryParams.sequenceId = result.sequenceId;
    //   }
      
    //   this.$router.push({
    //     path: `/projet/${result.projetId}/ecran-travail`,
    //     query: queryParams
    //   });
      
    //   this.clearSearch();
    // },
    
    navigateToResult(result) {
  // Vérifier que result.projetId est bien défini
  if (!result.projetId) {
    console.error('ID du projet manquant dans le résultat de recherche');
    return;
  }
  
  const queryParams = {};
  
  if (result.type === 'episode') {
    queryParams.episodeId = result.id;
  } else if (result.type === 'sequence') {
    queryParams.episodeId = result.episodeId;
    queryParams.sequenceId = result.id;
  } else if (result.type === 'scene') {
    queryParams.episodeId = result.episodeId;
    queryParams.sequenceId = result.sequenceId;
  }
  
  this.$router.push({
    path: `/projet/${result.projetId}/ecran-travail`,
    query: queryParams
  });
  
  this.clearSearch();
},
    handleClickOutsideSearch(event) {
      const searchContainer = event.target.closest('.global-search-section');
      if (!searchContainer) {
        this.showSearchResults = false;
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
          // Mettre à jour la liste des projets
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
          await this.fetchProjects(); // Rafraîchir la liste
        } catch (error) {
          console.error('Erreur lors de la suppression du projet:', error);
          alert('Erreur lors de la suppression du projet');
        }
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
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
    },
    // Méthode de secours pour la recherche
    async executeSearch() {
  try {
    const query = this.searchQuery.trim();
    if (query.length < 2) return;
    
    console.log('Lancement de la recherche pour:', query);
    
    // D'abord essayer la recherche normale
    try {
      const [episodesResponse, scenesResponse, sequencesResponse] = await Promise.all([
        axios.get(`/api/recherche/episodes?q=${encodeURIComponent(query)}`),
        axios.get(`/api/recherche/scenes?q=${encodeURIComponent(query)}`),
        axios.get(`/api/recherche/sequences?q=${encodeURIComponent(query)}`)
      ]);
      
      console.log('Réponses reçues:', {
        episodes: episodesResponse.data,
        scenes: scenesResponse.data,
        sequences: sequencesResponse.data
      });
      
      this.processSearchResults(episodesResponse.data, scenesResponse.data, sequencesResponse.data);
      
    } catch (apiError) {
      console.warn('Recherche API échouée, utilisation de la recherche de secours:', apiError);
      await this.executeSearchFallback(query);
    }
    
  } catch (error) {
    console.error('Erreur globale lors de la recherche:', error);
    this.searchResults = [];
    this.showSearchResults = true;
  }
},

processSearchResults(episodesData, scenesData, sequencesData) {
  const episodes = (episodesData || []).map(episode => ({
    ...episode,
    type: 'episode',
    projetTitre: episode.projetTitre || 'Projet inconnu',
    projetId: episode.projetId || this.extractProjetId(episode)
  }));
  
  const scenes = (scenesData || []).map(scene => ({
    ...scene,
    type: 'scene',
    projetTitre: scene.projetTitre || 'Projet inconnu',
    episodeTitre: scene.episodeTitre || 'Épisode inconnu',
    projetId: scene.projetId || this.extractProjetId(scene)
  }));
  
  const sequences = (sequencesData || []).map(sequence => ({
    ...sequence,
    type: 'sequence',
    projetTitre: sequence.projetTitre || 'Projet inconnu',
    episodeTitre: sequence.episodeTitre || 'Épisode inconnu',
    projetId: sequence.projetId || this.extractProjetId(sequence)
  }));
  
  this.searchResults = [...episodes, ...scenes, ...sequences];
  this.showSearchResults = true;
  
  console.log('Résultats combinés:', this.searchResults);
},

async executeSearchFallback(query) {
  try {
    // Recherche simplifiée - récupérer tous les projets et filtrer côté client
    const projetsResponse = await axios.get('/api/projets');
    const allProjects = projetsResponse.data || [];
    
    // Filtrer les projets dont le titre contient la requête
    const filteredProjects = allProjects.filter(project => 
      project.titre && project.titre.toLowerCase().includes(query.toLowerCase())
    );
    
    // Transformer en format de résultat de recherche
    this.searchResults = filteredProjects.map(project => ({
      id: project.id,
      titre: project.titre,
      type: 'projet',
      projetTitre: project.titre,
      synopsis: project.synopsis || '',
      ordre: 0,
      projetId: project.id
    }));
    
    this.showSearchResults = true;
    console.log('Résultats de secours:', this.searchResults);
    
  } catch (fallbackError) {
    console.error('Recherche de secours échouée:', fallbackError);
    this.searchResults = [];
    this.showSearchResults = true;
  }
},

extractProjetId(item) {
  // Logique pour extraire l'ID du projet si disponible
  return item.projetId || null;
},

  }
};
</script>

<style>
/* scenariste_acceuil.css - Style inspiré de l'image: cartes minimalistes, arrondis élevés, shadows subtils, logos ronds */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Police Inter pour clean et professionnel */
@font-face {
  font-family: 'Inter';
  src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff') format('woff');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff') format('woff');
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff') format('woff');
  font-weight: 700;
  font-style: normal;
}

/* Variables - Palette light gray, avec accents noirs et gris comme dans l'image */
:root {
  --primary: #000000; /* Noir pour boutons "Apply now" */
  --primary-rgb: 0, 0, 0;
  --secondary: #6B7280; /* Gris pour tags */
  --secondary-rgb: 107, 114, 128;
  --accent: #1F2937; /* Gris foncé pour titres */
  --accent-rgb: 31, 41, 55;
  --background: #F9FAFB; /* Fond gris très clair comme image */
  --background-rgb: 249, 250, 251;
  --surface: #FFFFFF; /* Blanc pour cartes */
  --border: #E5E7EB; /* Bordure gris clair */
  --text-primary: #111827; /* Noir profond */
  --text-secondary: #6B7280; /* Gris moyen */
  --text-muted: #9CA3AF; /* Gris clair */
  --shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.05); /* Shadow subtil comme cartes */
  --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.1);
  --radius: 20px; /* Arrondis élevés comme dans l'image */
  --transition: all 0.3s ease;
}

/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.app-wrapper {
  background: var(--background);
  min-height: 100vh;
  padding: 3rem 2rem;
  position: relative;
  overflow: hidden;
}

/* Container principal */
.accueil-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Section bienvenue - Simple et centrée comme headers dans image */
.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.welcome-section p {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Barre de recherche globale - Inspiré des inputs ronds et clean */
.global-search-section {
  margin-bottom: 3rem;
}

.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 1.2rem 1.5rem 1.2rem 3.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 1rem;
  color: var(--text-primary);
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  outline: none;
}

.clear-search-btn {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.2rem;
  transition: var(--transition);
}

.clear-search-btn:hover {
  color: var(--text-primary);
}

/* Résultats de recherche - Cartes comme job listings, avec hover */
.search-results {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-results-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-results-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.2rem;
  transition: var(--transition);
}

.close-results-btn:hover {
  color: var(--text-primary);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-result-item {
  display: flex;
  align-items: center;
  background: var(--background);
  border-radius: var(--radius);
  padding: 1rem;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.search-result-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.result-type-badge {
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius);
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 1rem;
  min-width: 80px;
  text-align: center;
}

.result-type-badge.episode {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.result-type-badge.scene {
  background: rgba(107, 114, 128, 0.1);
  color: var(--secondary);
}

.result-type-badge.sequence {
  background: rgba(76, 175, 80, 0.1);
  color: var(--success);
}

.result-content {
  flex: 1;
}

.result-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.result-details {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.3rem;
}

.result-details span {
  margin-right: 0.8rem;
}

.result-synopsis {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

.result-arrow {
  color: var(--text-muted);
  font-size: 1.2rem;
  transition: var(--transition);
}

.search-result-item:hover .result-arrow {
  transform: translateX(5px);
  color: var(--text-primary);
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1rem;
  font-style: italic;
}

/* Bibliothèque de projets - Grid de cartes comme job listings */
.projects-library {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.movie-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  transition: var(--transition);
  cursor: pointer;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

.movie-card:nth-child(1) { animation-delay: 0.1s; }
.movie-card:nth-child(2) { animation-delay: 0.2s; }
.movie-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.movie-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.movie-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}

.movie-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.2rem;
  transition: var(--transition);
}

.action-btn:hover {
  color: var(--text-primary);
}

.movie-info {
  margin-bottom: 1rem;
}

.movie-info p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.movie-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: rgba(107, 114, 128, 0.1); /* Gris clair comme tags dans image */
  color: var(--secondary);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius);
  font-size: 0.8rem;
  font-weight: 500;
}

.movie-actions-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.movie-progress {
  flex: 1;
  margin-right: 1rem;
}

.progress-bar {
  background: var(--border);
  border-radius: var(--radius);
  height: 6px;
  overflow: hidden;
}

.progress-fill {
  background: var(--primary);
  height: 100%;
  transition: width 0.5s ease;
}

.edit-movie-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.edit-movie-btn:hover {
  background: #333333;
  transform: scale(1.05);
}

/* Modals - Clean et rounded comme cartes */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-md);
  animation: scaleIn 0.4s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-modal {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  transition: var(--transition);
}

.close-modal:hover {
  color: var(--text-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--background);
  transition: var(--transition);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  background: var(--border);
  color: var(--text-primary);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.cancel-btn:hover {
  background: #F3F4F6;
}

.submit-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.submit-btn:hover {
  background: #333333;
  transform: scale(1.02);
}

/* Responsive */
@media (max-width: 768px) {
  .projects-library {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .search-results {
    margin: 1rem;
  }
}
</style>

