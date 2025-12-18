<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-crea-plateau">
      <div class="sidebar-header-crea-plateau">
        <h2 class="sidebar-title-crea-plateau">Gestion Plateaux</h2>
        <p class="sidebar-subtitle-crea-plateau">Créez et gérez vos plateaux</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-crea-plateau">
        <h3 class="section-title-crea-plateau"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-crea-plateau">
          <button 
            @click="goToForm" 
            class="sidebar-btn-crea-plateau" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouveau plateau
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-crea-plateau"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-crea-plateau">
        <h3 class="section-title-crea-plateau"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-crea-plateau">
          <div class="filter-item-crea-plateau">
            <label>Lieu</label>
            <div class="search-container-crea-plateau">
              <input
                type="text"
                v-model="filterLieuSearch"
                @focus="showFilterLieuSuggestions = true"
                @blur="hideFilterLieuSuggestions"
                @input="filterFilterLieux"
                :placeholder="filterLieuId ? getLieuName(filterLieuId) : 'Tous les lieux'"
                class="search-input-crea-plateau"
              />
              <div v-if="showFilterLieuSuggestions && filteredFilterLieux.length" class="suggestions-dropdown-crea-plateau">
                <div
                  v-for="lieu in filteredFilterLieux"
                  :key="lieu.id"
                  @mousedown="selectFilterLieu(lieu)"
                  class="suggestion-item-crea-plateau"
                >
                  {{ lieu.nomLieu }} - {{ lieu.projetTitre }}
                </div>
                <div @mousedown="clearFilterLieu" class="suggestion-item-crea-plateau clear-filter">
                  ✕ Effacer le filtre
                </div>
              </div>
            </div>
          </div>
          
          <div class="filter-item-crea-plateau">
            <label>Type de plateau</label>
            <select v-model="filterTypePlateau" class="filter-select-crea-plateau">
              <option value="">Tous les types</option>
              <option value="Intérieur">Intérieur</option>
              <option value="Extérieur">Extérieur</option>
              <option value="Studio">Studio</option>
              <option value="Naturel">Naturel</option>
              <option value="Décor">Décor</option>
              <option value="Virtuel">Virtuel</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-crea-plateau">
        <h3 class="section-title-crea-plateau"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-crea-plateau">
          <div class="stat-item-crea-plateau">
            <span class="stat-number-crea-plateau">{{ plateaux.length }}</span>
            <span class="stat-label-crea-plateau">Total plateaux</span>
          </div>
          <div class="stat-item-crea-plateau">
            <span class="stat-number-crea-plateau">{{ getPlateauxInterieur }}</span>
            <span class="stat-label-crea-plateau">Intérieurs</span>
          </div>
          <div class="stat-item-crea-plateau">
            <span class="stat-number-crea-plateau">{{ getPlateauxExterieur }}</span>
            <span class="stat-label-crea-plateau">Extérieurs</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-plateau">
      <div class="creation-main-content-crea-plateau">
        
        <!-- En-tête principal -->
        <!-- <div class="main-header-crea-plateau">
          <h1 class="page-title-crea-plateau"><i class="fas fa-video"></i> Gestion des Plateaux</h1>
          <p class="page-subtitle-crea-plateau">Créez, modifiez et gérez l'ensemble des plateaux de tournage</p>
        </div> -->

        <!-- Système d'onglets -->
        <div class="tabs-container-crea-plateau">
          <div class="tabs-header-crea-plateau">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-crea-plateau', { active: activeTab === 'form' }]"
            >
              <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
              {{ isEditing ? 'Modifier plateau' : 'Créer plateau' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-plateau', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste plateaux
            </button>
          </div>
          
          <div class="tabs-content-crea-plateau">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-crea-plateau" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-crea-plateau">
              <!-- Formulaire de création/modification -->
              <div class="form-container-crea-plateau">
                <div class="form-header-crea-plateau">
                  <h3>
                    <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
                    {{ isEditing ? 'Modifier le plateau' : 'Créer un nouveau plateau' }}
                  </h3>
                  <button 
                    v-if="isEditing"
                    @click="goToForm"
                    class="back-btn-crea-plateau"
                  >
                    <i class="fas fa-plus"></i> Nouveau plateau
                  </button>
                </div>

                <form @submit.prevent="submitForm" class="plateau-form-crea-plateau">
                  <!-- Ligne 1 : Lieu + Nom du plateau -->
                  <div class="form-row-crea-plateau">
                    <div class="form-group-crea-plateau">
                      <label for="lieuSearch">Lieu *</label>
                      <div class="search-container-crea-plateau">
                        <input
                          type="text"
                          id="lieuSearch"
                          v-model="lieuSearch"
                          @focus="showLieuSuggestions = true"
                          @blur="hideLieuSuggestions"
                          @input="filterLieux"
                          :placeholder="formData.lieuId ? getLieuName(formData.lieuId) : 'Rechercher un lieu...'"
                          required
                          class="search-input-crea-plateau"
                        />
                        <div v-if="showLieuSuggestions && filteredLieux.length" class="suggestions-dropdown-crea-plateau">
                          <div
                            v-for="lieu in filteredLieux"
                            :key="lieu.id"
                            @mousedown="selectLieu(lieu)"
                            class="suggestion-item-crea-plateau"
                          >
                            <div class="lieu-option-info-crea-plateau">
                              <div class="lieu-title-crea-plateau">{{ lieu.nomLieu }}</div>
                              <div class="lieu-details-crea-plateau">{{ lieu.projetTitre }}</div>
                            </div>
                          </div>
                        </div>
                        <div v-if="showLieuSuggestions && filteredLieux.length === 0" class="no-results-crea-plateau">
                          <i class="fas fa-search"></i> Aucun lieu trouvé
                        </div>
                      </div>
                    </div>

                    <div class="form-group-crea-plateau">
                      <label for="nom">Nom du plateau *</label>
                      <input 
                        id="nom"
                        v-model="formData.nom" 
                        type="text" 
                        required 
                        placeholder="Ex: Plateau principal, Plateau extérieur..."
                        class="search-input-crea-plateau"
                      >
                    </div>
                  </div>

                  <!-- Ligne 2 : Type de plateau + Scène -->
                  <div class="form-row-crea-plateau">
                    <div class="form-group-crea-plateau">
                      <label for="typePlateau">Type de plateau *</label>
                      <select 
                        id="typePlateau"
                        v-model="formData.typePlateau" 
                        required
                        class="search-input-crea-plateau"
                      >
                        <option value="">Sélectionnez un type</option>
                        <option value="Intérieur">Intérieur</option>
                        <option value="Extérieur">Extérieur</option>
                        <option value="Studio">Studio</option>
                        <option value="Naturel">Naturel</option>
                        <option value="Décor">Décor</option>
                        <option value="Virtuel">Virtuel</option>
                      </select>
                    </div>

                    <!-- <div class="form-group-crea-plateau">
                      <label for="sceneId">Scène (optionnel)</label>
                      <select 
                        id="sceneId"
                        v-model="formData.sceneId"
                        class="search-input-crea-plateau"
                      >
                        <option value="">Sélectionnez une scène</option>
                        <option v-for="scene in scenesFiltrees" :key="scene.idScene" :value="scene.idScene">
                          {{ scene.titre }} - {{ scene.sequenceTitre }}
                        </option>
                      </select>
                    </div> -->
                  </div>

                  <!-- Ligne 3 : Description -->
                  <div class="form-row-crea-plateau">
                    <div class="form-group-crea-plateau full-width">
                      <label for="description">Description</label>
                      <textarea 
                        id="description"
                        v-model="formData.description" 
                        rows="3" 
                        placeholder="Description du plateau..."
                        class="form-textarea-crea-plateau"
                      ></textarea>
                    </div>
                  </div>

                  <div v-if="error" class="error-message-crea-plateau">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-crea-plateau">
                    <button
                      v-if="isEditing"
                      type="button"
                      @click="goToForm"
                      class="cancel-btn-crea-plateau"
                    >
                      <i class="fas fa-times"></i> Annuler
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="submit-btn-crea-plateau"
                    >
                      <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                      <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                      {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer le plateau') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Contenu de l'onglet Liste -->
            <div v-show="activeTab === 'list'" class="tab-pane-crea-plateau">
              <!-- Liste des plateaux -->
              <div class="plateaux-list-crea-plateau">
                <div class="list-header-crea-plateau">
                  <h3><i class="fas fa-video"></i> Liste des plateaux ({{ filteredPlateaux.length }})</h3>
                  
                  <div class="search-section-crea-plateau">
                    <div class="search-group-crea-plateau">
                      <label for="plateauSearch">Rechercher un plateau</label>
                      <div class="search-input-container-crea-plateau">
                        <i class="fas fa-search search-icon-crea-plateau"></i>
                        <input
                          type="text"
                          id="plateauSearch"
                          v-model="searchTerm"
                          placeholder="Rechercher par nom..."
                          class="search-input-large-crea-plateau"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="loading-state-crea-plateau">
                  <i class="fas fa-spinner fa-spin"></i>
                  <h3>Chargement des plateaux...</h3>
                </div>
                
                <div v-else-if="filteredPlateaux.length === 0" class="empty-state-crea-plateau">
                  <i class="fas fa-video"></i>
                  <h3>Aucun plateau trouvé</h3>
                  <div v-if="searchTerm || filterLieuId || filterTypePlateau">
                    <p>Aucun plateau ne correspond à vos critères de recherche.</p>
                  </div>
                  <div v-else>
                    <p>Aucun plateau créé pour le moment.</p>
                  </div>
                </div>

                <div v-else class="plateaux-container-crea-plateau">
                  <div class="plateaux-grid-crea-plateau">
                    <div v-for="plateau in filteredPlateaux" :key="plateau.id" class="plateau-card-crea-plateau">
                      <div class="plateau-header-crea-plateau">
                        <div class="plateau-info-crea-plateau">
                          <h4 class="plateau-title-crea-plateau">
                            <i class="fas fa-video"></i>
                            {{ plateau.nom }}
                          </h4>
                          <span class="type-badge-crea-plateau" :class="getTypeClass(plateau.typePlateau)">
                            {{ plateau.typePlateau }}
                          </span>
                        </div>
                        <div class="plateau-actions-crea-plateau">
                          <button @click="editPlateau(plateau)" class="btn-edit-crea-plateau" title="Modifier">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button @click="deletePlateau(plateau.id)" class="btn-delete-crea-plateau" title="Supprimer">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div class="plateau-content-crea-plateau">
                        <div class="plateau-details-crea-plateau">
                          <div class="detail-item-crea-plateau">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Lieu:</strong> {{ plateau.lieuNom }}</span>
                          </div>
                          <div v-if="plateau.sceneTitre" class="detail-item-crea-plateau">
                            <i class="fas fa-film"></i>
                            <span><strong>Scène:</strong> {{ plateau.sceneTitre }}</span>
                          </div>
                          <div v-if="plateau.sequenceTitre" class="detail-item-crea-plateau">
                            <i class="fas fa-layer-group"></i>
                            <span><strong>Séquence:</strong> {{ plateau.sequenceTitre }}</span>
                          </div>
                          <div v-if="plateau.episodeTitre" class="detail-item-crea-plateau">
                            <i class="fas fa-tv"></i>
                            <span><strong>Épisode:</strong> {{ plateau.episodeTitre }}</span>
                          </div>
                          <div v-if="plateau.projetTitre" class="detail-item-crea-plateau">
                            <i class="fas fa-project-diagram"></i>
                            <span><strong>Projet:</strong> {{ plateau.projetTitre }}</span>
                          </div>
                          <div v-if="plateau.description" class="detail-item-crea-plateau">
                            <i class="fas fa-align-left"></i>
                            <span><strong>Description:</strong> {{ plateau.description }}</span>
                          </div>
                          <div class="detail-item-crea-plateau">
                            <i class="fas fa-calendar"></i>
                            <span><strong>Créé le:</strong> {{ formatDate(plateau.creeLe) }}</span>
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
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export default {
  name: 'CreationPlateau',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      activeTab: 'form',
      formData: {
        lieuId: '',
        sceneId: '',
        nom: '',
        typePlateau: '',
        description: ''
      },
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: true,
      error: '',
      
      // Données pour les listes
      lieux: [],
      scenes: [],
      plateaux: [],
      filteredPlateaux: [],
      
      // Filtres et recherche
      searchTerm: '',
      filterLieuId: '',
      filterTypePlateau: '',
      
      // Zones de liste modifiable
      lieuSearch: '',
      filterLieuSearch: '',
      showLieuSuggestions: false,
      showFilterLieuSuggestions: false,
      filteredLieux: [],
      filteredFilterLieux: []
    };
  },
  computed: {
    getTabIndicatorStyle() {
      const tabWidth = 100 / 2;
      const translateX = this.activeTab === 'form' ? 0 : 100;
      return {
        transform: `translateX(${translateX}%)`,
        width: `${tabWidth}%`
      };
    },
    getPlateauxInterieur() {
      return this.plateaux.filter(p => 
        p.typePlateau === 'Intérieur' || p.typePlateau === 'Studio' || p.typePlateau === 'Décor'
      ).length;
    },
    getPlateauxExterieur() {
      return this.plateaux.filter(p => 
        p.typePlateau === 'Extérieur' || p.typePlateau === 'Naturel'
      ).length;
    },
    filteredPlateaux() {
      return this.plateaux.filter(plateau => {
        const matchesSearch = plateau.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesLieu = !this.filterLieuId || plateau.lieuId === parseInt(this.filterLieuId);
        const matchesType = !this.filterTypePlateau || plateau.typePlateau === this.filterTypePlateau;
        return matchesSearch && matchesLieu && matchesType;
      });
    },
    scenesFiltrees() {
      if (!this.formData.lieuId) return [];
      
      const lieu = this.lieux.find(l => l.id === parseInt(this.formData.lieuId));
      if (!lieu) return [];
      
      return this.scenes.filter(scene => scene.projetId === lieu.projetId);
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
    
    await this.loadLieux();
    await this.loadScenes();
    await this.loadPlateaux();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    lieux: {
      handler(newVal) {
        this.filteredLieux = [...newVal];
        this.filteredFilterLieux = [...newVal];
      },
      deep: true
    }
  },
  methods: {
    // Navigation entre onglets
    goToForm() {
      this.activeTab = 'form';
      this.resetForm();
    },
    goToList() {
      this.activeTab = 'list';
      this.loadPlateaux();
    },
    handleClickOutside(event) {
      if (!event.target.closest('.search-container-crea-plateau')) {
        this.showLieuSuggestions = false;
        this.showFilterLieuSuggestions = false;
      }
    },
    async loadLieux() {
      try {
        const response = await axios.get('/api/lieux');
        this.lieux = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        alert('Erreur lors du chargement des lieux');
      }
    },
    async loadScenes() {
      try {
        const response = await axios.get('/api/scenes');
        this.scenes = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des scènes:', error);
        alert('Erreur lors du chargement des scènes');
      }
    },
    async loadPlateaux() {
      this.loading = true;
      try {
        const response = await axios.get('/api/plateaux');
        this.plateaux = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des plateaux:', error);
        this.error = 'Erreur lors du chargement des plateaux: ' + (error.response?.data?.message || error.message);
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      this.isSubmitting = true;
      try {
        const payload = {
          ...this.formData,
          lieuId: parseInt(this.formData.lieuId),
          sceneId: this.formData.sceneId ? parseInt(this.formData.sceneId) : null
        };
        
        if (this.isEditing) {
          await axios.put(`/api/plateaux/${this.editingId}`, payload);
          alert('Plateau modifié avec succès!');
        } else {
          await axios.post('/api/plateaux', payload);
          alert('Plateau créé avec succès!');
        }
        
        this.resetForm();
        await this.loadPlateaux();
        this.activeTab = 'list';
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du plateau:', error);
        this.error = 'Erreur: ' + (error.response?.data?.message || error.message);
      } finally {
        this.isSubmitting = false;
      }
    },
    editPlateau(plateau) {
      this.formData = {
        lieuId: plateau.lieuId.toString(),
        sceneId: plateau.sceneId ? plateau.sceneId.toString() : '',
        nom: plateau.nom,
        typePlateau: plateau.typePlateau,
        description: plateau.description || ''
      };
      this.lieuSearch = this.getLieuName(plateau.lieuId);
      this.isEditing = true;
      this.editingId = plateau.id;
      this.activeTab = 'form';
    },
    async deletePlateau(plateauId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce plateau ?')) {
        return;
      }
      
      try {
        await axios.delete(`/api/plateaux/${plateauId}`);
        await this.loadPlateaux();
        alert('Plateau supprimé avec succès!');
      } catch (error) {
        console.error('Erreur lors de la suppression du plateau:', error);
        alert('Erreur: ' + (error.response?.data?.message || error.message));
      }
    },
    resetForm() {
      this.formData = {
        lieuId: '',
        sceneId: '',
        nom: '',
        typePlateau: '',
        description: ''
      };
      this.lieuSearch = '';
      this.isEditing = false;
      this.editingId = null;
      this.error = '';
      this.filteredLieux = [...this.lieux];
    },
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    onLieuChange() {
      this.formData.sceneId = '';
    },
    getTypeClass(type) {
      switch (type) {
        case 'Intérieur': return 'type-interieur';
        case 'Extérieur': return 'type-exterieur';
        case 'Studio': return 'type-studio';
        case 'Naturel': return 'type-naturel';
        case 'Décor': return 'type-decor';
        case 'Virtuel': return 'type-virtuel';
        default: return '';
      }
    },
    
    // Méthodes pour les zones de liste modifiable
    filterLieux() {
      const searchTerm = this.lieuSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredLieux = [...this.lieux];
        return;
      }
      this.filteredLieux = this.lieux.filter(lieu => 
        lieu.nomLieu.toLowerCase().includes(searchTerm) ||
        lieu.projetTitre.toLowerCase().includes(searchTerm)
      );
    },
    filterFilterLieux() {
      const searchTerm = this.filterLieuSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredFilterLieux = [...this.lieux];
        return;
      }
      this.filteredFilterLieux = this.lieux.filter(lieu => 
        lieu.nomLieu.toLowerCase().includes(searchTerm)
      );
    },
    selectLieu(lieu) {
      this.formData.lieuId = lieu.id.toString();
      this.lieuSearch = `${lieu.nomLieu} - ${lieu.projetTitre}`;
      this.showLieuSuggestions = false;
      this.onLieuChange();
    },
    selectFilterLieu(lieu) {
      this.filterLieuId = lieu.id;
      this.filterLieuSearch = lieu.nomLieu;
      this.showFilterLieuSuggestions = false;
    },
    clearFilterLieu() {
      this.filterLieuId = '';
      this.filterLieuSearch = '';
      this.showFilterLieuSuggestions = false;
    },
    hideLieuSuggestions() {
      setTimeout(() => {
        this.showLieuSuggestions = false;
      }, 200);
    },
    hideFilterLieuSuggestions() {
      setTimeout(() => {
        this.showFilterLieuSuggestions = false;
      }, 200);
    },
    getLieuName(id) {
      const lieu = this.lieux.find(l => l.id === parseInt(id));
      return lieu ? `${lieu.nomLieu} - ${lieu.projetTitre}` : '';
    }
  }
};
</script>

