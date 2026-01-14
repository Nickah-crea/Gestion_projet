<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-crea-lieu">
      <div class="sidebar-header-crea-lieu">
        <h2 class="sidebar-title-crea-lieu">Gestion Lieux</h2>
        <p class="sidebar-subtitle-crea-lieu">Créez et gérez vos lieux</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-crea-lieu">
        <h3 class="section-title-crea-lieu"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-crea-lieu">
          <button 
            @click="goToForm" 
            class="sidebar-btn-crea-lieu" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouveau lieu
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-crea-lieu"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-crea-lieu">
        <h3 class="section-title-crea-lieu"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-crea-lieu">
          <div class="filter-item-crea-lieu">
            <label>Projet</label>
            <div class="search-container-crea-lieu">
              <input
                type="text"
                v-model="filterProjetSearch"
                @focus="showFilterProjetSuggestions = true"
                @blur="hideFilterProjetSuggestions"
                @input="filterFilterProjets"
                :placeholder="filterProjetId ? getProjetName(filterProjetId) : 'Tous les projets'"
                class="search-input-crea-lieu"
              />
              <div v-if="showFilterProjetSuggestions && filteredFilterProjets.length" class="suggestions-dropdown-crea-lieu">
                <div
                  v-for="projet in filteredFilterProjets"
                  :key="projet.id"
                  @mousedown="selectFilterProjet(projet)"
                  class="suggestion-item-crea-lieu"
                >
                  {{ projet.titre }} ({{ projet.genreNom }})
                </div>
                <div @mousedown="clearFilterProjet" class="suggestion-item-crea-lieu clear-filter">
                  ✕ Effacer le filtre
                </div>
              </div>
            </div>
          </div>
          
          <div class="filter-item-crea-lieu">
            <label>Type de lieu</label>
            <select v-model="filterTypeLieu" class="filter-select-crea-lieu">
              <option value="">Tous les types</option>
              <option value="Intérieur">Intérieur</option>
              <option value="Extérieur">Extérieur</option>
              <option value="Intérieur/Extérieur">Intérieur/Extérieur</option>
              <option value="Studio">Studio</option>
              <option value="Naturel">Naturel</option>
              <option value="Urbain">Urbain</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-crea-lieu">
        <h3 class="section-title-crea-lieu"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-crea-lieu">
          <div class="stat-item-crea-lieu">
            <span class="stat-number-crea-lieu">{{ lieux.length }}</span>
            <span class="stat-label-crea-lieu">Total lieux</span>
          </div>
          <div class="stat-item-crea-lieu">
            <span class="stat-number-crea-lieu">{{ getLieuxInterieur }}</span>
            <span class="stat-label-crea-lieu">Intérieurs</span>
          </div>
          <div class="stat-item-crea-lieu">
            <span class="stat-number-crea-lieu">{{ getLieuxExterieur }}</span>
            <span class="stat-label-crea-lieu">Extérieurs</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-lieu">
      <div class="creation-main-content-crea-lieu">
        
        <!-- En-tête principal -->
        <!-- <div class="main-header-crea-lieu">
          <h1 class="page-title-crea-lieu"><i class="fas fa-map-marker-alt"></i> Gestion des Lieux</h1>
          <p class="page-subtitle-crea-lieu">Créez, modifiez et gérez l'ensemble des lieux de vos projets</p>
        </div> -->

        <!-- Système d'onglets -->
        <div class="tabs-container-crea-lieu">
          <div class="tabs-header-crea-lieu">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-crea-lieu', { active: activeTab === 'form' }]"
            >
              <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
              {{ isEditing ? 'Modifier lieu' : 'Créer lieu' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-lieu', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste lieux
            </button>
          </div>
          
          <div class="tabs-content-crea-lieu">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-crea-lieu" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-crea-lieu">
              <!-- Formulaire de création/modification -->
              <div class="form-container-crea-lieu">
                <div class="form-header-crea-lieu">
                  <h3>
                    <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
                    {{ isEditing ? 'Modifier le lieu' : 'Créer un nouveau lieu' }}
                  </h3>
                </div>

                <form @submit.prevent="submitForm" class="lieu-form-crea-lieu">
                  <!-- Ligne 1 : Projet + Nom du lieu -->
                  <div class="form-row-crea-lieu">
                    <div class="form-group-crea-lieu">
                      <label for="projetSearch">Projet</label>
                      <div class="search-container-crea-lieu">
                        <input
                          type="text"
                          id="projetSearch"
                          v-model="projetSearch"
                          @focus="showProjetSuggestions = true"
                          @blur="hideProjetSuggestions"
                          @input="filterProjets"
                          :placeholder="formData.projetId ? getProjetName(formData.projetId) : 'Rechercher un projet...'"
                          required
                          class="search-input-crea-lieu"
                        />
                        <div v-if="showProjetSuggestions && filteredProjets.length" class="suggestions-dropdown-crea-lieu">
                          <div
                            v-for="projet in filteredProjets"
                            :key="projet.id"
                            @mousedown="selectProjet(projet)"
                            class="suggestion-item-crea-lieu"
                          >
                            <div class="projet-option-info-crea-lieu">
                              <div class="projet-title-crea-lieu">{{ projet.titre }}</div>
                              <div class="projet-details-crea-lieu">{{ projet.genreNom }}</div>
                            </div>
                          </div>
                        </div>
                        <div v-if="showProjetSuggestions && filteredProjets.length === 0" class="no-results-crea-lieu">
                          <i class="fas fa-search"></i> Aucun projet trouvé
                        </div>
                      </div>
                    </div>

                    <div class="form-group-crea-lieu">
                      <label for="nomLieu">Nom du lieu</label>
                      <input 
                        type="text" 
                        id="nomLieu"
                        v-model="formData.nomLieu"
                        required 
                        placeholder="Ex: Appartement principal, Rue de Paris..."
                        class="search-input-crea-lieu"
                      >
                    </div>
                  </div>

                  <!-- Ligne 2 : Type de lieu -->
                  <div class="form-row-crea-lieu">
                    <div class="form-group-crea-lieu">
                      <label for="typeLieu">Type de lieu</label>
                      <select 
                        id="typeLieu"
                        v-model="formData.typeLieu" 
                        required
                        class="search-input-crea-lieu"
                      >
                        <option value="">Sélectionnez un type</option>
                        <option value="Intérieur">Intérieur</option>
                        <option value="Extérieur">Extérieur</option>
                        <option value="Intérieur/Extérieur">Intérieur/Extérieur</option>
                        <option value="Studio">Studio</option>
                        <option value="Naturel">Naturel</option>
                        <option value="Urbain">Urbain</option>
                      </select>
                    </div>

                    <div class="form-group-crea-lieu">
                      <label for="adresse">Adresse</label>
                      <input 
                        id="adresse"
                        v-model="formData.adresse" 
                        type="text" 
                        placeholder="Adresse complète du lieu..."
                        class="search-input-crea-lieu"
                      >
                    </div>
                  </div>

                  <div v-if="error" class="error-message-crea-lieu">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-crea-lieu">
                    <button
                      v-if="isEditing"
                      type="button"
                      @click="goToForm"
                      class="cancel-btn-crea-lieu"
                    >
                      <i class="fas fa-times"></i> Annuler
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="submit-btn-crea-lieu"
                    >
                      <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                      <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                      {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer le lieu') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Contenu de l'onglet Liste -->
            <div v-show="activeTab === 'list'" class="tab-pane-crea-lieu">
              <!-- Liste des lieux -->
              <div class="lieux-list-crea-lieu">
                <div class="list-header-crea-lieu">
                  <h3><i class="fas fa-map-marker-alt"></i> Liste des lieux ({{ filteredLieux.length }})</h3>
                  
                  <div class="search-section-crea-lieu">
                    <div class="search-group-crea-lieu">
                      <label for="lieuSearch">Rechercher un lieu</label>
                      <div class="search-input-container-crea-lieu">
                        <i class="fas fa-search search-icon-crea-lieu"></i>
                        <input
                          type="text"
                          id="lieuSearch"
                          v-model="searchTerm"
                          placeholder="Rechercher par nom ou adresse..."
                          class="search-input-large-crea-lieu"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="loading-state-crea-lieu">
                  <i class="fas fa-spinner fa-spin"></i>
                  <h3>Chargement des lieux...</h3>
                </div>
                
                <div v-else-if="filteredLieux.length === 0" class="empty-state-crea-lieu">
                  <i class="fas fa-map-marker-alt"></i>
                  <h3>Aucun lieu trouvé</h3>
                  <div v-if="searchTerm || filterProjetId || filterTypeLieu">
                    <p>Aucun lieu ne correspond à vos critères de recherche.</p>
                  </div>
                  <div v-else>
                    <p>Aucun lieu créé pour le moment.</p>
                  </div>
                </div>

                <div v-else class="lieux-container-crea-lieu">
                  <div class="lieux-grid-crea-lieu">
                    <div v-for="lieu in filteredLieux" :key="lieu.id" class="lieu-card-crea-lieu">
                      <div class="lieu-header-crea-lieu">
                        <div class="lieu-info-crea-lieu">
                          <h4 class="lieu-title-crea-lieu">
                            <i class="fas fa-map-marker-alt"></i>
                            {{ lieu.nomLieu }}
                          </h4>
                          <span class="type-badge-crea-lieu" :class="getTypeClass(lieu.typeLieu)">
                            {{ lieu.typeLieu }}
                          </span>
                        </div>
                        <div class="lieu-actions-crea-lieu">
                          <button @click="viewLieuScenes(lieu)" class="btn-scenes-crea-lieu" title="Voir les scènes">
                            <i class="fas fa-film"></i>
                            {{ lieu.sceneCount || 0 }}
                          </button>
                          <button @click="editLieu(lieu)" class="btn-edit-crea-lieu" title="Modifier">
                            <i class="fas fa-marker"></i>
                          </button>
                        <button @click="confirmDeleteLieu(lieu.id)" class="btn-delete-crea-lieu" title="Supprimer">
                          <i class="fas fa-trash"></i>
                        </button>
                        </div>
                      </div>
                      
                      <div class="lieu-content-crea-lieu">
                        <div class="lieu-details-crea-lieu">
                          <div class="detail-item-crea-lieu">
                            <i class="fas fa-project-diagram"></i>
                            <span>{{ lieu.projetTitre }}</span>
                          </div>
                          <div v-if="lieu.adresse" class="detail-item-crea-lieu">
                            <i class="fas fa-location-dot"></i>
                            <span>{{ lieu.adresse }}</span>
                          </div>
                          <div class="detail-item-crea-lieu">
                            <i class="fas fa-calendar"></i>
                            <span>{{ formatDate(lieu.creeLe) }}</span>
                          </div>
                        </div>
                        
                        <!-- Liste des scènes utilisant ce lieu -->
                        <!-- <div v-if="lieu.scenes && lieu.scenes.length" class="scenes-section-crea-lieu">
                          <h5 class="scenes-title-crea-lieu">
                            <i class="fas fa-film"></i>
                            Scènes utilisant ce lieu:
                          </h5>
                          <div class="scenes-list-crea-lieu">
                            <div v-for="scene in lieu.scenes" :key="scene.id" class="scene-item-crea-lieu">
                              <span class="scene-name-crea-lieu">{{ scene.titre }}</span>
                              <span class="scene-usage-crea-lieu">({{ scene.descriptionUtilisation }})</span>
                            </div>
                          </div>
                        </div> -->
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

    <!-- Modale pour afficher les scènes d'un lieu -->
    <div v-if="showScenesModal" class="modal-overlay-crea-lieu" @click="showScenesModal = false">
      <div class="modal-content-crea-lieu" @click.stop>
        <div class="modal-header-crea-lieu">
          <h3>
            <i class="fas fa-film"></i>
            Scènes utilisant "{{ selectedLieu.nomLieu }}"
          </h3>
          <button @click="showScenesModal = false" class="modal-close-btn-crea-lieu">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-crea-lieu">
          <div v-if="selectedLieuScenes.length === 0" class="no-scenes-crea-lieu">
            <i class="fas fa-info-circle"></i>
            Aucune scène n'utilise ce lieu.
          </div>
          
          <div v-else class="scenes-details-crea-lieu">
            <div v-for="scene in selectedLieuScenes" :key="scene.id" class="scene-detail-crea-lieu">
              <h4 class="scene-title-crea-lieu">{{ scene.sceneTitre }}</h4>
              <div class="scene-info-crea-lieu">
                <div class="info-item-crea-lieu">
                  <i class="fas fa-layer-group"></i>
                  <span><strong>Séquence:</strong> {{ scene.sequenceTitre }}</span>
                </div>
                <div class="info-item-crea-lieu">
                  <i class="fas fa-tv"></i>
                  <span><strong>Épisode:</strong> {{ scene.episodeTitre }}</span>
                </div>
                <div class="info-item-crea-lieu">
                  <i class="fas fa-project-diagram"></i>
                  <span><strong>Projet:</strong> {{ scene.projetTitre }}</span>
                </div>
                <div class="info-item-crea-lieu">
                  <i class="fas fa-info-circle"></i>
                  <span><strong>Utilisation:</strong> {{ scene.descriptionUtilisation }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
<!-- Modale de confirmation de suppression -->
<div v-if="showDeleteModal" class="delete-confirmation-modal-Scenariste">
  <div class="modal-overlay-Scenariste" @click="closeDeleteModal"></div>
  <div class="modal-content-confirm-Scenariste">
    <div class="modal-header-confirm-Scenariste">
      <h3><i class="fas fa-exclamation-triangle"></i> Confirmation de suppression</h3>
      <button @click="closeDeleteModal" class="close-modal-btn-delete-Scenariste">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="modal-body-confirm-Scenariste">
      <div class="warning-icon-Scenariste">
        <i class="fas fa-trash"></i>
      </div>
      <p class="warning-text-Scenariste">
        Êtes-vous sûr de vouloir supprimer le lieu <strong>"{{ lieuToDelete?.nomLieu }}"</strong> ?
      </p>
      <p class="warning-subtext-Scenariste">
        Cette action est irréversible. Toutes les scènes utilisant ce lieu seront affectées.
      </p>
    </div>
    
    <div class="modal-footer-confirm-Scenariste">
      <button @click="closeDeleteModal" class="cancel-confirm-btn-Scenariste">
        <i class="fas fa-times"></i> Annuler
      </button>
      <button @click="executeDeleteLieu" class="delete-confirm-btn-Scenariste" :disabled="isDeleting">
        <span v-if="isDeleting"><i class="fas fa-spinner fa-spin"></i> Suppression...</span>
        <span v-else><i class="fas fa-trash"></i> Supprimer définitivement</span>
      </button>
    </div>
  </div>
</div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export default {
  name: 'CreationLieu',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      activeTab: 'form',
      formData: {
        projetId: '',
        nomLieu: '',
        typeLieu: '',
        adresse: ''
      },
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: true,
      error: '',
      
      // Données pour les listes
      projets: [],
      lieux: [],
      filteredLieux: [],
      
      // Filtres et recherche
      searchTerm: '',
      filterProjetId: '',
      filterTypeLieu: '',
      
      // Modale scènes
      showScenesModal: false,
      selectedLieu: {},
      selectedLieuScenes: [],
      
      // Zones de liste modifiable
      projetSearch: '',
      filterProjetSearch: '',
      showProjetSuggestions: false,
      showFilterProjetSuggestions: false,
      filteredProjets: [],
      filteredFilterProjets: [], 

       showDeleteModal: false,
      lieuToDelete: null,
      isDeleting: false,
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
    getLieuxInterieur() {
      return this.lieux.filter(l => 
        l.typeLieu === 'Intérieur' || l.typeLieu === 'Intérieur/Extérieur' || l.typeLieu === 'Studio'
      ).length;
    },
    getLieuxExterieur() {
      return this.lieux.filter(l => 
        l.typeLieu === 'Extérieur' || l.typeLieu === 'Intérieur/Extérieur' || l.typeLieu === 'Naturel' || l.typeLieu === 'Urbain'
      ).length;
    },
    filteredLieux() {
      return this.lieux.filter(lieu => {
        const matchesSearch = lieu.nomLieu.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            (lieu.adresse && lieu.adresse.toLowerCase().includes(this.searchTerm.toLowerCase()));
        const matchesProjet = !this.filterProjetId || lieu.projetId === parseInt(this.filterProjetId);
        const matchesType = !this.filterTypeLieu || lieu.typeLieu === this.filterTypeLieu;
        return matchesSearch && matchesProjet && matchesType;
      });
    }
  },
  async created() {
    axios.defaults.baseURL = API_BASE_URL;
    
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (user && user.id) {
          config.headers['X-User-Id'] = user.id;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    await this.loadProjets();
    await this.loadLieux();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    projets: {
      handler(newVal) {
        this.filteredProjets = [...newVal];
        this.filteredFilterProjets = [...newVal];
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
      this.loadLieux();
    },
    handleClickOutside(event) {
      if (!event.target.closest('.search-container-crea-lieu')) {
        this.showProjetSuggestions = false;
        this.showFilterProjetSuggestions = false;
      }
    },
    async loadProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        alert('Erreur lors du chargement des projets');
      }
    },
    async loadLieux() {
      this.loading = true;
      try {
        const response = await axios.get('/api/lieux');
        this.lieux = response.data;
        
        // Charger le nombre de scènes pour chaque lieu
        for (let lieu of this.lieux) {
          try {
            const scenesResponse = await axios.get(`/api/scene-lieux/lieux/${lieu.id}`);
            lieu.sceneCount = scenesResponse.data.length;
            
            // Charger les premières scènes pour l'affichage
            if (scenesResponse.data.length > 0) {
              lieu.scenes = scenesResponse.data.slice(0, 3);
            }
          } catch (error) {
            console.error('Erreur lors du chargement des scènes du lieu:', error);
            lieu.sceneCount = 0;
            lieu.scenes = [];
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        this.error = 'Erreur lors du chargement des lieux: ' + (error.response?.data?.message || error.message);
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      try {
        if (!this.user || !this.user.id) {
          alert('Erreur: Utilisateur non connecté');
          return;
        }

        const payload = {
          ...this.formData,
          projetId: parseInt(this.formData.projetId)
        };
        
        const config = {
          headers: {
            'X-User-Id': this.user.id
          }
        };
        
        if (this.isEditing) {
          await axios.put(`/api/lieux/${this.editingId}`, payload, config);
        } else {
          await axios.post('/api/lieux', payload, config);
        }
        
        this.resetForm();
        await this.loadLieux();
        this.activeTab = 'list';
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du lieu:', error);
        const errorMessage = error.response?.data?.message || error.message;
        
        if (error.response?.status === 403) {
          this.error = 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action';
        } else if (error.response?.status === 400) {
          this.error = 'Données invalides - ' + errorMessage;
        } else {
          this.error = errorMessage;
        }
      }
    },
    editLieu(lieu) {
      this.formData = {
        projetId: lieu.projetId.toString(),
        nomLieu: lieu.nomLieu,
        typeLieu: lieu.typeLieu,
        adresse: lieu.adresse || ''
      };
      this.projetSearch = this.getProjetName(lieu.projetId);
      this.isEditing = true;
      this.editingId = lieu.id;
      this.activeTab = 'form';
    },

  // Modal de confirmation de suppression
  confirmDeleteLieu(lieuId) {
    const lieu = this.lieux.find(l => l.id === lieuId);
    if (!lieu) return;
    
    this.lieuToDelete = lieu;
    this.showDeleteModal = true;
    this.isDeleting = false;
  },
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.lieuToDelete = null;
    this.isDeleting = false;
  },
  
  async executeDeleteLieu() {
    if (!this.lieuToDelete) return;
    
    this.isDeleting = true;
    
    try {
      if (!this.user || !this.user.id) {
        alert('Erreur: Utilisateur non connecté');
        return;
      }

      const config = {
        headers: {
          'X-User-Id': this.user.id
        }
      };

      await axios.delete(`/api/lieux/${this.lieuToDelete.id}`, config);
      
      // Recharger la liste
      await this.loadLieux();
      this.closeDeleteModal();
      
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 403) {
        this.showErrorMessage('Vous n\'avez pas les permissions nécessaires pour supprimer ce lieu');
      } else {
        this.showErrorMessage('Erreur: ' + errorMessage);
      }
      this.isDeleting = false;
    }
  },
  
  // Méthodes d'affichage de messages (optionnelles mais recommandées)
  showSuccessMessage(message) {
    // Vous pouvez implémenter un système de notification comme dans CreationComedien.vue
    alert(message); // Temporairement
  },
  
  showErrorMessage(message) {
    alert(message); // Temporairement
  },
    // async deleteLieu(lieuId) {
    //   if (!confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
    //     return;
    //   }
      
    //   try {
    //     if (!this.user || !this.user.id) {
    //       alert('Erreur: Utilisateur non connecté');
    //       return;
    //     }

    //     const config = {
    //       headers: {
    //         'X-User-Id': this.user.id
    //       }
    //     };

    //     await axios.delete(`/api/lieux/${lieuId}`, config);
    //     await this.loadLieux();
    //     alert('Lieu supprimé avec succès!');
    //   } catch (error) {
    //     console.error('Erreur lors de la suppression du lieu:', error);
    //     const errorMessage = error.response?.data?.message || error.message;
        
    //     if (error.response?.status === 403) {
    //       alert('Erreur: Vous n\'avez pas les permissions nécessaires pour supprimer ce lieu');
    //     } else {
    //       alert('Erreur: ' + errorMessage);
    //     }
    //   }
    // },
    resetForm() {
      this.formData = {
        projetId: '',
        nomLieu: '',
        typeLieu: '',
        adresse: ''
      };
      this.projetSearch = '';
      this.isEditing = false;
      this.editingId = null;
      this.error = '';
      this.filteredProjets = [...this.projets];
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
    async viewLieuScenes(lieu) {
      this.selectedLieu = lieu;
      try {
        const response = await axios.get(`/api/scene-lieux/lieux/${lieu.id}`);
        this.selectedLieuScenes = response.data;
        this.showScenesModal = true;
      } catch (error) {
        console.error('Erreur lors du chargement des scènes du lieu:', error);
        alert('Erreur lors du chargement des scènes');
      }
    },
    getTypeClass(type) {
      switch (type) {
        case 'Intérieur': return 'type-interieur';
        case 'Extérieur': return 'type-exterieur';
        case 'Intérieur/Extérieur': return 'type-mixte';
        case 'Studio': return 'type-studio';
        case 'Naturel': return 'type-naturel';
        case 'Urbain': return 'type-urbain';
        default: return '';
      }
    },
    
    // Méthodes pour les zones de liste modifiable
    filterProjets() {
      const searchTerm = this.projetSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredProjets = [...this.projets];
        return;
      }
      this.filteredProjets = this.projets.filter(projet => 
        projet.titre.toLowerCase().includes(searchTerm) ||
        (projet.genreNom && projet.genreNom.toLowerCase().includes(searchTerm))
      );
    },
    filterFilterProjets() {
      const searchTerm = this.filterProjetSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredFilterProjets = [...this.projets];
        return;
      }
      this.filteredFilterProjets = this.projets.filter(projet => 
        projet.titre.toLowerCase().includes(searchTerm)
      );
    },
    selectProjet(projet) {
      this.formData.projetId = projet.id.toString();
      this.projetSearch = `${projet.titre} (${projet.genreNom})`;
      this.showProjetSuggestions = false;
    },
    selectFilterProjet(projet) {
      this.filterProjetId = projet.id;
      this.filterProjetSearch = projet.titre;
      this.showFilterProjetSuggestions = false;
    },
    clearFilterProjet() {
      this.filterProjetId = '';
      this.filterProjetSearch = '';
      this.showFilterProjetSuggestions = false;
    },
    hideProjetSuggestions() {
      setTimeout(() => {
        this.showProjetSuggestions = false;
      }, 200);
    },
    hideFilterProjetSuggestions() {
      setTimeout(() => {
        this.showFilterProjetSuggestions = false;
      }, 200);
    },
    getProjetName(id) {
      const projet = this.projets.find(p => p.id === parseInt(id));
      return projet ? `${projet.titre} (${projet.genreNom})` : '';
    }
  }
};
</script>

