<template>
  <div class="app-wrapper-global-scene-comedien">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-scene-comedien">
      <div class="sidebar-header-scene-comedien">
        <h2 class="sidebar-title-scene-comedien">Liaisons Scènes</h2>
        <p class="sidebar-subtitle-scene-comedien">Gérez les associations comédiens-scènes</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-scene-comedien">
        <h3 class="section-title-scene-comedien"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-scene-comedien">
          <button 
            @click="goToForm" 
            class="sidebar-btn-scene-comedien" 
            :class="{ active: activeTab === 'form' }"
          >
            <i class="fas fa-plus"></i>
            Nouvelle liaison
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-scene-comedien"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
          <button @click="goBack" class="sidebar-btn-scene-comedien">
            <i class="fas fa-arrow-left"></i>
            Retour comédiens
          </button>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-scene-comedien">
        <h3 class="section-title-scene-comedien"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-scene-comedien">
          <div class="stat-item-scene-comedien">
            <span class="stat-number-scene-comedien">{{ liaisons.length }}</span>
            <span class="stat-label-scene-comedien">Total liaisons</span>
          </div>
          <div class="stat-item-scene-comedien">
            <span class="stat-number-scene-comedien">{{ groupedLiaisons.length }}</span>
            <span class="stat-label-scene-comedien">Comédiens liés</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-scene-comedien">
      <div class="creation-main-content-scene-comedien">
        
        <!-- En-tête principal -->
        <div class="main-header-scene-comedien">
          <h1 class="page-title-scene-comedien">
            <i class="fas fa-link"></i> Liaison Comédien à une Scène
          </h1>
          <p class="page-subtitle-scene-comedien">
            Associez des comédiens aux scènes de vos projets
            <span v-if="selectedComedien" class="selected-comedien-info-scene-comedien">
              • Comédien sélectionné : <strong>{{ selectedComedien.nom }}</strong>
            </span>
          </p>
        </div>

        <!-- Système d'onglets -->
        <div class="tabs-container-scene-comedien">
          <div class="tabs-header-scene-comedien">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-scene-comedien', { active: activeTab === 'form' }]"
            >
              <i class="fas fa-plus"></i>
              Créer liaison
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-scene-comedien', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste des liaisons
            </button>
          </div>
          
          <div class="tabs-content-scene-comedien">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-scene-comedien" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-scene-comedien">
              <!-- Formulaire de création -->
              <div class="form-container-scene-comedien">
                <div class="form-header-scene-comedien">
                  <h3>
                    <i class="fas fa-link"></i>
                    Associer un comédien à une scène
                  </h3>
                </div>

                <form @submit.prevent="submitForm" class="liaison-form-scene-comedien">
                  <div class="form-row-scene-comedien">
                    <!-- Comédien (lecture seule) -->
                    <div class="form-group-scene-comedien">
                      <label for="comedien">Comédien *</label>
                      <div class="readonly-field-scene-comedien">
                        <i class="fas fa-user"></i>
                        <span>{{ selectedComedienName }}</span>
                      </div>
                      <input 
                        v-model="newLiaison.idComedien" 
                        type="hidden" 
                      />
                    </div>

                    <!-- Scène (recherche) -->
                    <div class="form-group-scene-comedien">
                      <label for="sceneSearch">Scène *</label>
                      <div class="search-container-scene-comedien">
                        <input
                          type="text"
                          id="sceneSearch"
                          v-model="sceneSearch"
                          @input="filterScenes"
                          @focus="showSceneDropdown = true"
                          placeholder="Rechercher une scène..."
                          class="search-input-scene-comedien"
                          required
                        />
                        <div v-if="showSceneDropdown && filteredScenesList.length > 0" 
                             class="suggestions-dropdown-scene-comedien">
                          <div
                            v-for="scene in filteredScenesList"
                            :key="scene.idScene"
                            @click="selectScene(scene)"
                            class="suggestion-item-scene-comedien"
                            :class="{ 'selected': newLiaison.idScene === scene.idScene }"
                          >
                            <div class="scene-option-info-scene-comedien">
                              <strong>{{ scene.titre }}</strong>
                              <span class="scene-details-scene-comedien">
                                {{ scene.sequenceTitre }} • 
                                <span class="scene-statut-scene-comedien" :class="'statut-' + scene.statutNom.toLowerCase()">
                                  {{ scene.statutNom }}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div v-if="showSceneDropdown && filteredScenesList.length === 0" 
                             class="suggestions-dropdown-scene-comedien">
                          <div class="no-results-scene-comedien">
                            <i class="fas fa-search"></i>
                            Aucune scène trouvée
                          </div>
                        </div>
                      </div>
                      <input 
                        v-model="newLiaison.idScene" 
                        type="hidden" 
                      />
                    </div>
                  </div>

                  <div v-if="error" class="error-message-scene-comedien">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-scene-comedien">
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="submit-btn-scene-comedien"
                    >
                      <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-link"></i>
                      {{ isSubmitting ? 'Création...' : 'Créer la liaison' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Contenu de l'onglet Liste -->
            <div v-show="activeTab === 'list'" class="tab-pane-scene-comedien">
              <!-- Liste des liaisons -->
              <div class="liaisons-list-scene-comedien">
                <div class="list-header-scene-comedien">
                  <h3><i class="fas fa-list"></i> Liste des liaisons ({{ liaisons.length }})</h3>
                  
                  <div class="search-section-scene-comedien">
                    <div class="search-group-scene-comedien">
                      <label for="searchLiaisons">Rechercher une liaison</label>
                      <div class="search-input-container-scene-comedien">
                        <i class="fas fa-search search-icon-scene-comedien"></i>
                        <input
                          type="text"
                          id="searchLiaisons"
                          v-model="searchTerm"
                          placeholder="Rechercher par comédien ou scène..."
                          class="search-input-large-scene-comedien"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="loading-state-scene-comedien">
                  <i class="fas fa-spinner fa-spin"></i> Chargement...
                </div>
                
                <div v-else-if="groupedLiaisons.length === 0" class="empty-state-scene-comedien">
                  <i class="fas fa-link"></i>
                  <div v-if="searchTerm">
                    Aucune liaison ne correspond à vos critères de recherche.
                  </div>
                  <div v-else>
                    Aucune liaison comédien-scène créée pour le moment.
                  </div>
                </div>

                <div v-else class="liaisons-container-scene-comedien">
                  <!-- Groupement par comédien -->
                  <div v-for="comedien in groupedLiaisons" :key="comedien.id" 
                       class="comedien-group-scene-comedien">
                    <div class="comedien-header-scene-comedien">
                      <div class="comedien-info-scene-comedien">
                        <h4>{{ comedien.nom }}</h4>
                        <span class="scene-count-scene-comedien">
                          {{ comedien.scenes.length }} scène(s)
                        </span>
                      </div>
                    </div>
                    
                    <div class="scenes-grid-scene-comedien">
                      <div v-for="scene in comedien.scenes" :key="scene.id" 
                           class="scene-card-scene-comedien">
                        <div class="scene-info-scene-comedien">
                          <div class="scene-main-info-scene-comedien">
                            <h5 class="scene-title-scene-comedien">
                              <i class="fas fa-film"></i>
                              {{ scene.sceneTitre }}
                            </h5>
                            <span class="scene-statut-badge-scene-comedien" 
                                  :class="'statut-' + scene.sceneStatut.toLowerCase()">
                              {{ scene.sceneStatut }}
                            </span>
                          </div>
                          
                          <div class="scene-details-grid-scene-comedien">
                            <div class="scene-detail-item-scene-comedien">
                              <i class="fas fa-layer-group"></i>
                              <span>Séquence: {{ scene.sequenceTitre }}</span>
                            </div>
                            <div class="scene-detail-item-scene-comedien">
                              <i class="fas fa-calendar"></i>
                              <span>Créé le: {{ formatDate(scene.creeLe) }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="scene-actions-scene-comedien">
                          <button @click="deleteLiaison(scene.id)" 
                                  class="btn-delete-scene-comedien" 
                                  title="Supprimer la liaison">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export default {
  name: 'SceneComedien',
  data() {
    return {
      activeTab: 'form',
      newLiaison: {
        idComedien: '',
        idScene: ''
      },
      selectedComedien: null,
      scenes: [],
      filteredScenesList: [],
      liaisons: [],
      searchTerm: '',
      sceneSearch: '',
      showSceneDropdown: false,
      selectedScene: null,
      loading: false,
      isSubmitting: false,
      error: ''
    };
  },
  computed: {
    filteredLiaisons() {
      if (!this.searchTerm) return this.liaisons;
      const term = this.searchTerm.toLowerCase();
      return this.liaisons.filter(liaison =>
        liaison.comedienNom.toLowerCase().includes(term) ||
        liaison.sceneTitre.toLowerCase().includes(term) ||
        liaison.sequenceTitre.toLowerCase().includes(term)
      );
    },
    selectedComedienName() {
      if (!this.selectedComedien) return 'Chargement...';
      return `${this.selectedComedien.nom} (${this.selectedComedien.email})`;
    },
    groupedLiaisons() {
      const grouped = {};
      
      this.filteredLiaisons.forEach(liaison => {
        if (!grouped[liaison.idComedien]) {
          grouped[liaison.idComedien] = {
            id: liaison.idComedien,
            nom: liaison.comedienNom,
            scenes: []
          };
        }
        grouped[liaison.idComedien].scenes.push(liaison);
      });
      
      return Object.values(grouped);
    },
    getTabIndicatorStyle() {
      const tabWidth = 100 / 2;
      const translateX = this.activeTab === 'form' ? 0 : 100;
      return {
        transform: `translateX(${translateX}%)`,
        width: `${tabWidth}%`
      };
    }
  },
  async created() {
    axios.defaults.baseURL = API_BASE_URL;
    
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Récupérer l'ID du comédien depuis l'URL
    const comedienId = this.$route.query.comedienId;
    if (comedienId) {
      this.newLiaison.idComedien = comedienId;
      await this.loadSelectedComedien(comedienId);
    }
    
    await this.loadData();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    // Navigation entre onglets
    goToForm() {
      this.activeTab = 'form';
      this.resetForm();
    },

    goToList() {
      this.activeTab = 'list';
      this.loadLiaisons(); // Recharger les données
    },

    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadScenes(),
          this.loadLiaisons()
        ]);
        this.filteredScenesList = this.scenes;
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        this.error = 'Erreur lors du chargement des données';
      } finally {
        this.loading = false;
      }
    },
    
    async loadSelectedComedien(comedienId) {
      try {
        const response = await axios.get(`/api/comediens/${comedienId}`);
        this.selectedComedien = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement du comédien:', error);
        this.error = 'Comédien non trouvé';
        this.goBack();
      }
    },
    
    async loadScenes() {
      try {
        const response = await axios.get('/api/scenes');
        this.scenes = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des scènes:', error);
        throw error;
      }
    },
    
    async loadLiaisons() {
      try {
        const response = await axios.get('/api/comedien-scene');
        this.liaisons = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des liaisons:', error);
        throw error;
      }
    },
    
    filterScenes() {
      if (!this.sceneSearch) {
        this.filteredScenesList = this.scenes;
        return;
      }
      
      const searchTerm = this.sceneSearch.toLowerCase();
      this.filteredScenesList = this.scenes.filter(scene =>
        scene.titre.toLowerCase().includes(searchTerm) ||
        scene.sequenceTitre.toLowerCase().includes(searchTerm) ||
        scene.statutNom.toLowerCase().includes(searchTerm)
      );
    },
    
    selectScene(scene) {
      this.newLiaison.idScene = scene.idScene;
      this.selectedScene = scene;
      this.sceneSearch = `${scene.titre} - ${scene.sequenceTitre}`;
      this.showSceneDropdown = false;
    },
    
    async submitForm() {
      if (!this.newLiaison.idScene) {
        this.error = 'Veuillez sélectionner une scène';
        return;
      }
      
      this.isSubmitting = true;
      this.error = '';
      
      try {
        await axios.post('/api/comedien-scene', this.newLiaison);
        this.resetForm();
        await this.loadLiaisons();
        this.activeTab = 'list';
      } catch (error) {
        console.error('Erreur lors de la création de l\'association:', error);
        this.error = error.response?.data?.message || 'Erreur lors de la création de la liaison';
      } finally {
        this.isSubmitting = false;
      }
    },
    
    resetForm() {
      this.newLiaison.idScene = '';
      this.sceneSearch = '';
      this.selectedScene = null;
      this.filteredScenesList = this.scenes;
      this.error = '';
    },
    
    async deleteLiaison(liaisonId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette association ?')) {
        return;
      }

      try {
        await axios.delete(`/api/comedien-scene/${liaisonId}`);
        await this.loadLiaisons();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.error = error.response?.data?.message || 'Erreur lors de la suppression';
      }
    },
    
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    goBack() {
      this.$router.push('/creation-comedien');
    },
    
    handleClickOutside(event) {
      if (!event.target.closest('.search-container-scene-comedien')) {
        this.showSceneDropdown = false;
      }
    }
  }
};
</script>
