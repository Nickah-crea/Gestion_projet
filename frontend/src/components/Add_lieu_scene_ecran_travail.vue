<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-crea-lieu-ecran">
      <div class="sidebar-header-crea-lieu-ecran">
        <h2 class="sidebar-title-crea-lieu-ecran">Gestion Lieux</h2>
        <p class="sidebar-subtitle-crea-lieu-ecran">Créez et gérez vos lieux dans ce projet</p>
      </div>

      <!-- Section Navigation -->
      <div class="sidebar-section-crea-lieu-ecran">
        <h3 class="section-title-crea-lieu-ecran"><i class="fas fa-bolt"></i> Navigation</h3>
        <div class="sidebar-actions-crea-lieu-ecran">
          <button 
            @click="goToEcranTravail" 
            class="sidebar-btn-crea-lieu-ecran"
          >
            <i class="fas fa-desktop"></i>
            Écran de travail
          </button>
          <button 
            @click="goBack" 
            class="sidebar-btn-crea-lieu-ecran"
          >
            <i class="fas fa-arrow-left"></i>
            Retour
          </button>
        </div>
      </div>

      <!-- Section Informations Projet -->
      <div class="sidebar-section-crea-lieu-ecran">
        <h3 class="section-title-crea-lieu-ecran"><i class="fas fa-info-circle"></i> Informations Projet</h3>
        <div class="projet-info-ecran">
          <div class="info-item-ecran">
            <span class="info-label-ecran">Projet :</span>
            <span class="info-value-ecran">{{ projetTitre || 'Chargement...' }}</span>
          </div>
          <div class="info-item-ecran">
            <span class="info-label-ecran">Lieux existants :</span>
            <span class="info-value-ecran">{{ lieux.length }}</span>
          </div>
          <div class="info-item-ecran">
            <span class="info-label-ecran">Lieux intérieurs :</span>
            <span class="info-value-ecran">{{ getLieuxInterieur }}</span>
          </div>
          <div class="info-item-ecran">
            <span class="info-label-ecran">Lieux extérieurs :</span>
            <span class="info-value-ecran">{{ getLieuxExterieur }}</span>
          </div>
        </div>
      </div>

      <!-- Section Aide -->
      <div class="sidebar-section-crea-lieu-ecran">
        <h3 class="section-title-crea-lieu-ecran"><i class="fas fa-question-circle"></i> Aide</h3>
        <div class="aide-content-ecran">
          <p class="aide-text-ecran">
            • Tous les lieux créés seront associés au projet actuel.<br>
            • Les champs marqués d'un * sont obligatoires.<br>
            • Vous pouvez gérer tous les lieux depuis cet écran.
          </p>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-lieu-ecran">
      <div class="creation-main-content-crea-lieu-ecran">
        
        <!-- Système d'onglets -->
        <div class="tabs-container-crea-lieu-ecran">
          <div class="tabs-header-crea-lieu-ecran">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-crea-lieu-ecran', { active: activeTab === 'form' }]"
            >
              <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
              {{ isEditing ? 'Modifier lieu' : 'Créer lieu' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-lieu-ecran', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste lieux
            </button>
          </div>
          
          <div class="tabs-content-crea-lieu-ecran">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-crea-lieu-ecran" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-crea-lieu-ecran">
              <!-- Formulaire de création/modification -->
              <div class="form-container-crea-lieu-ecran">
                <div class="form-header-crea-lieu-ecran">
                  <h3>
                    <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
                    {{ isEditing ? 'Modifier le lieu' : 'Créer un nouveau lieu' }}
                  </h3>
                </div>

                <form @submit.prevent="submitForm" class="lieu-form-crea-lieu-ecran">
                  <!-- Ligne 1 : Projet (non modifiable) + Nom du lieu -->
                  <div class="form-row-crea-lieu-ecran">
                    <div class="form-group-crea-lieu-ecran">
                      <label for="projet">Projet</label>
                      <input 
                        type="text" 
                        id="projet"
                        :value="projetTitre" 
                        disabled
                        class="form-input-disabled-ecran"
                      />
                    </div>

                    <div class="form-group-crea-lieu-ecran">
                      <label for="nomLieu">Nom du lieu *</label>
                      <input 
                        type="text" 
                        id="nomLieu"
                        v-model="formData.nomLieu"
                        required 
                        placeholder="Ex: Appartement principal, Rue de Paris..."
                        class="search-input-crea-lieu-ecran"
                      >
                    </div>
                  </div>

                  <!-- Ligne 2 : Type de lieu + Adresse -->
                  <div class="form-row-crea-lieu-ecran">
                    <div class="form-group-crea-lieu-ecran">
                      <label for="typeLieu">Type de lieu *</label>
                      <select 
                        id="typeLieu"
                        v-model="formData.typeLieu" 
                        required
                        class="search-input-crea-lieu-ecran"
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

                    <div class="form-group-crea-lieu-ecran">
                      <label for="adresse">Adresse</label>
                      <input 
                        id="adresse"
                        v-model="formData.adresse" 
                        type="text" 
                        placeholder="Adresse complète du lieu..."
                        class="search-input-crea-lieu-ecran"
                      >
                    </div>
                  </div>

                  <div v-if="error" class="error-message-crea-lieu-ecran">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-crea-lieu-ecran">
                    <button
                      v-if="isEditing"
                      type="button"
                      @click="goToForm"
                      class="cancel-btn-crea-lieu-ecran"
                    >
                      <i class="fas fa-times"></i> Annuler
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="submit-btn-crea-lieu-ecran"
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
            <div v-show="activeTab === 'list'" class="tab-pane-crea-lieu-ecran">
              <!-- Liste des lieux -->
              <div class="lieux-list-crea-lieu-ecran">
                <div class="list-header-crea-lieu-ecran">
                  <h3><i class="fas fa-map-marker-alt"></i> Liste des lieux ({{ filteredLieux.length }})</h3>
                  
                  <div class="search-section-crea-lieu-ecran">
                    <div class="search-group-crea-lieu-ecran">
                      <div class="search-input-container-crea-lieu-ecran">
                        <i class="fas fa-search search-icon-crea-lieu-ecran"></i>
                        <input
                          type="text"
                          id="lieuSearch"
                          v-model="searchTerm"
                          placeholder=" Rechercher par nom ou adresse..."
                          class="search-input-large-crea-lieu-ecran"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="loading-state-crea-lieu-ecran">
                  <i class="fas fa-spinner fa-spin"></i>
                  <h3>Chargement des lieux...</h3>
                </div>
                
                <div v-else-if="filteredLieux.length === 0" class="empty-state-crea-lieu-ecran">
                  <i class="fas fa-map-marker-alt"></i>
                  <h3>Aucun lieu trouvé</h3>
                  <div v-if="searchTerm">
                    <p>Aucun lieu ne correspond à vos critères de recherche.</p>
                  </div>
                  <div v-else>
                    <p>Aucun lieu créé pour ce projet.</p>
                    <button @click="goToForm" class="create-first-btn-ecran">
                      <i class="fas fa-plus"></i> Créer votre premier lieu
                    </button>
                  </div>
                </div>

                <div v-else class="lieux-container-crea-lieu-ecran">
                  <div class="lieux-grid-crea-lieu-ecran">
                    <div v-for="lieu in filteredLieux" :key="lieu.id" class="lieu-card-crea-lieu-ecran">
                      <div class="lieu-header-crea-lieu-ecran">
                        <div class="lieu-info-crea-lieu-ecran">
                          <h4 class="lieu-title-crea-lieu-ecran">
                            <i class="fas fa-map-marker-alt"></i>
                            {{ lieu.nomLieu }}
                          </h4>
                          <span class="type-badge-crea-lieu-ecran" :class="getTypeClass(lieu.typeLieu)">
                            {{ lieu.typeLieu }}
                          </span>
                        </div>
                        <div class="lieu-actions-crea-lieu-ecran">
                          <button @click="viewLieuScenes(lieu)" class="btn-scenes-crea-lieu-ecran" title="Voir les scènes">
                            <i class="fas fa-film"></i>
                            {{ lieu.sceneCount || 0 }}
                          </button>
                          <button @click="editLieu(lieu)" class="btn-edit-crea-lieu-ecran" title="Modifier">
                            <i class="fas fa-marker"></i>
                          </button>
                          <button @click="confirmDeleteLieu(lieu.id)" class="btn-delete-crea-lieu-ecran" title="Supprimer">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div class="lieu-content-crea-lieu-ecran">
                        <div class="lieu-details-crea-lieu-ecran">
                          <div v-if="lieu.adresse" class="detail-item-crea-lieu-ecran">
                            <i class="fas fa-location-dot"></i>
                            <span>{{ lieu.adresse }}</span>
                          </div>
                          <div class="detail-item-crea-lieu-ecran">
                            <i class="fas fa-calendar"></i>
                            <span>{{ formatDate(lieu.creeLe) }}</span>
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

    <!-- Modale pour afficher les scènes d'un lieu -->
    <div v-if="showScenesModal" class="modal-overlay-crea-lieu-ecran" @click="showScenesModal = false">
      <div class="modal-content-crea-lieu-ecran" @click.stop>
        <div class="modal-header-crea-lieu-ecran">
          <h3>
            <i class="fas fa-film"></i>
            Scènes utilisant "{{ selectedLieu.nomLieu }}"
          </h3>
          <button @click="showScenesModal = false" class="modal-close-btn-crea-lieu-ecran">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-crea-lieu-ecran">
          <div v-if="selectedLieuScenes.length === 0" class="no-scenes-crea-lieu-ecran">
            <i class="fas fa-info-circle"></i>
            Aucune scène n'utilise ce lieu.
          </div>
          
          <div v-else class="scenes-details-crea-lieu-ecran">
            <div v-for="scene in selectedLieuScenes" :key="scene.id" class="scene-detail-crea-lieu-ecran">
              <h4 class="scene-title-crea-lieu-ecran">{{ scene.sceneTitre }}</h4>
              <div class="scene-info-crea-lieu-ecran">
                <div class="info-item-crea-lieu-ecran">
                  <i class="fas fa-layer-group"></i>
                  <span><strong>Séquence:</strong> {{ scene.sequenceTitre }}</span>
                </div>
                <div class="info-item-crea-lieu-ecran">
                  <i class="fas fa-tv"></i>
                  <span><strong>Épisode:</strong> {{ scene.episodeTitre }}</span>
                </div>
                <div class="info-item-crea-lieu-ecran">
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
  name: 'AddLieuEcranTravail',
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
      projetTitre: '',
      lieux: [],
      filteredLieux: [],
      
      // Filtres et recherche
      searchTerm: '',
      
      // Modale scènes
      showScenesModal: false,
      selectedLieu: {},
      selectedLieuScenes: [],

      // Modale suppression
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
        return matchesSearch;
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
    
    await this.fetchProjetDetails();
    await this.loadLieux();
  },
  methods: {
    // Navigation
    goToEcranTravail() {
      this.$router.push(`/projet/${this.formData.projetId}/ecran-travail`);
    },
    
    goBack() {
      this.$router.push(`/projet/${this.formData.projetId}/ecran-travail`);
    },

    async fetchProjetDetails() {
      try {
        const projetId = this.$route.params.projetId || this.$route.params.id || this.$route.query.projetId;
        if (!projetId) {
          this.error = 'ID du projet non spécifié';
          return;
        }
        
        const response = await axios.get(`/api/projets/${projetId}`);
        this.projetTitre = response.data.titre;
        this.formData.projetId = projetId;
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        this.error = 'Erreur lors du chargement des détails du projet. Veuillez réessayer.';
      }
    },

    async loadLieux() {
      this.loading = true;
      try {
        // Charger uniquement les lieux du projet courant
        const response = await axios.get(`/api/lieux/projets/${this.formData.projetId}`);
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
      this.isEditing = true;
      this.editingId = lieu.id;
      this.activeTab = 'form';
    },

    goToForm() {
      this.activeTab = 'form';
      this.resetForm();
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
    
    showSuccessMessage(message) {
      alert(message);
    },
    
    showErrorMessage(message) {
      alert(message);
    },
    
    resetForm() {
      this.formData = {
        projetId: this.formData.projetId, // Garder le même projetId
        nomLieu: '',
        typeLieu: '',
        adresse: ''
      };
      this.isEditing = false;
      this.editingId = null;
      this.error = '';
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
    }
  }
};
</script>
