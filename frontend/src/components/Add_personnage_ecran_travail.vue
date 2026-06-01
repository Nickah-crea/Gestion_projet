<template>
  <div class="app-wrapper-global-crea-comedien">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-crea-comedien">
      <div class="sidebar-header-crea-comedien">
        <h2 class="sidebar-title-crea-comedien">Gestion Personnages</h2>
        <p class="sidebar-subtitle-crea-comedien">Créez et gérez les personnages</p>
      </div>

      <!-- Section Projet actuel -->
      <div class="sidebar-section-crea-comedien">
        <h3 class="section-title-crea-comedien"><i class="fas fa-film"></i> Projet actuel</h3>
        <div class="stats-crea-comedien">
          <div class="stat-item-crea-comedien">
            <span class="stat-number-crea-comedien" style="font-size: 18px;">{{ projetTitre || 'Non sélectionné' }}</span>
            <span class="stat-label-crea-comedien">Projet associé</span>
          </div>
        </div>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-crea-comedien">
        <h3 class="section-title-crea-comedien"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-crea-comedien">
          <button 
            @click="goToForm" 
            class="sidebar-btn-crea-comedien" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouveau personnage
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-crea-comedien list-view-btn"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
          <button 
            @click="goBack" 
            class="sidebar-btn-crea-comedien retour-btn"
          >
            <i class="fas fa-arrow-left"></i>
            Retour
          </button>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-crea-comedien">
        <h3 class="section-title-crea-comedien"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-crea-comedien">
          <div class="stat-item-crea-comedien">
            <span class="stat-number-crea-comedien">{{ personnages.length }}</span>
            <span class="stat-label-crea-comedien">Total personnages</span>
          </div>
          <div class="stat-item-crea-comedien">
            <span class="stat-number-crea-comedien">{{ getPersonnagesAvecComedien }}</span>
            <span class="stat-label-crea-comedien">Avec comédien</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-comedien">
      <div class="creation-main-content-crea-comedien">
        
        <!-- En-tête principal -->
        <div class="main-header-crea-comedien">
          <h1 class="page-title-crea-comedien">
            <i class="fas fa-user-circle"></i> 
            Gestion des Personnages
          </h1>
          <p class="page-subtitle-crea-comedien">
            Créez, modifiez et gérez les personnages de vos projets
          </p>
        </div>

        <!-- Système d'onglets -->
        <div class="tabs-container-crea-comedien">
          <div class="tabs-header-crea-comedien">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-crea-comedien', { active: activeTab === 'form' }]"
            >
              <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
              {{ isEditing ? 'Modifier personnage' : 'Créer personnage' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-comedien', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste personnages ({{ personnages.length }})
            </button>
          </div>
          
          <div class="tabs-content-crea-comedien">
            <div class="tab-indicator-crea-comedien" :style="getTabIndicatorStyle"></div>
            
            <div v-show="activeTab === 'form'" class="tab-pane-crea-comedien">
              <div class="form-container-crea-comedien">
                <div class="form-header-crea-comedien">
                  <h3>
                    <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
                    {{ isEditing ? 'Modifier le personnage' : 'Créer un nouveau personnage' }}
                  </h3>
                  <button v-if="isEditing" @click="resetForm" class="back-btn-crea-comedien">
                    <i class="fas fa-times"></i> Annuler la modification
                  </button>
                </div>

                <form @submit.prevent="submitForm" class="comedien-form-crea-comedien">
                  <!-- Ligne 1 : Nom -->
                  <div class="form-row-crea-comedien">
                    <div class="form-group-crea-comedien">
                      <label for="nom">Nom du personnage *</label>
                      <input
                        type="text"
                        id="nom"
                        v-model="formData.nom"
                        required
                        placeholder="Entrez le nom du personnage"
                        class="form-input-crea-comedien"
                      />
                    </div>

                    <div class="form-group-crea-comedien">
                      <label for="projet">Projet *</label>
                      <div class="search-container-crea-comedien">
                        <input
                          type="text"
                          id="projet"
                          v-model="projetSearch"
                          :disabled="!!currentProjetId"
                          @focus="showProjetSuggestions = true"
                          @input="filterProjets"
                          :placeholder="currentProjetId ? 'Projet déjà associé' : 'Rechercher un projet...'"
                          class="search-input-crea-comedien"
                          :class="{ 'disabled-input': !!currentProjetId }"
                        />
                        <div v-if="showProjetSuggestions && filteredProjets.length > 0 && !currentProjetId" class="suggestions-dropdown-crea-comedien">
                          <div
                            v-for="projet in filteredProjets"
                            :key="projet.id"
                            @click="selectProjet(projet)"
                            class="suggestion-item-crea-comedien"
                          >
                            {{ projet.titre }}
                          </div>
                        </div>
                      </div>
                      <input type="hidden" v-model="formData.projetId" required />
                    </div>
                  </div>

                  <!-- Ligne 2 : Description + Comédien -->
                  <div class="form-row-split-crea-comedien">
                    <!-- Colonne 1 : Description -->
                    <div class="form-group-crea-comedien">
                      <label for="description">Description</label>
                      <textarea
                        id="description"
                        v-model="formData.description"
                        rows="5"
                        placeholder="Décrivez le personnage (caractère, histoire, particularités...)"
                        class="form-textarea-crea-comedien"
                      ></textarea>
                    </div>

                    <!-- Colonne 2 : Comédien -->
                    <div class="form-group-crea-comedien">
                      <label for="comedien">Comédien associé</label>
                      <div class="search-container-crea-comedien">
                        <input
                          type="text"
                          id="comedien"
                          v-model="comedienSearch"
                          @focus="showComedienSuggestions = true"
                          @input="filterComediens"
                          :placeholder="formData.comedienId ? getComedienName(formData.comedienId) : 'Rechercher un comédien (optionnel)...'"
                          class="search-input-crea-comedien"
                        />
                        <button
                          type="button"
                          v-if="formData.comedienId"
                          @click="clearComedien"
                          class="clear-button-crea-comedien"
                          title="Supprimer le comédien"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                        <div v-if="showComedienSuggestions && filteredComediens.length > 0" class="suggestions-dropdown-crea-comedien">
                          <div
                            v-for="comedien in filteredComediens"
                            :key="comedien.id"
                            @click="selectComedien(comedien)"
                            class="suggestion-item-crea-comedien"
                          >
                            {{ comedien.nom }} ({{ comedien.age }} ans) - {{ comedien.projetTitre || 'Sans projet' }}
                          </div>
                        </div>
                        <div v-if="showComedienSuggestions && filteredComediens.length === 0 && comedienSearch" class="suggestions-dropdown-crea-comedien">
                          <div class="suggestion-item-crea-comedien no-results">
                            Aucun comédien trouvé
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="error" class="error-message-crea-comedien">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-crea-comedien">
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="submit-btn-crea-comedien"
                    >
                      <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                      <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                      {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer le personnage') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div v-show="activeTab === 'list'" class="tab-pane-crea-comedien">
              <div class="comediens-list-crea-comedien">
                <div class="list-header-crea-comedien">
                  <h3><i class="fas fa-users"></i> Liste des personnages ({{ filteredPersonnages.length }})</h3>
                  
                  <div class="search-section-crea-comedien">
                    <div class="search-group-crea-comedien">
                      <div class="search-input-container-crea-comedien">
                        <i class="fas fa-search search-icon-crea-comedien"></i>
                        <input
                          type="text"
                          id="personnageSearch"
                          v-model="personnageSearch"
                          @input="filterPersonnages"
                          placeholder=" Rechercher par nom, projet ou comédien..."
                          class="search-input-large-crea-comedien"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="loading-state-crea-comedien">
                  <i class="fas fa-spinner fa-spin"></i> Chargement...
                </div>
                
                <div v-else-if="filteredPersonnages.length === 0" class="empty-state-crea-comedien">
                  <i class="fas fa-user-circle"></i>
                  <div v-if="personnageSearch">
                    Aucun personnage ne correspond à votre recherche.
                  </div>
                  <div v-else>
                    Aucun personnage créé pour le moment.
                  </div>
                </div>

                <div v-else class="comediens-table-container-crea-comedien">
                  <table class="comediens-table-crea-comedien">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Projet</th>
                        <th>Comédien</th>
                        <th>Date création</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="personnage in filteredPersonnages" :key="personnage.id">
                        <td class="personnage-nom-cell">{{ personnage.nom }}</td>
                        <td class="personnage-desc-cell">
                          <div class="description-preview">
                            {{ truncateDescription(personnage.description) }}
                          </div>
                        </td>
                        <td>
                          <span class="projet-badge-crea-comedien">
                            <i class="fas fa-film"></i>
                            {{ personnage.projetTitre || 'Non assigné' }}
                          </span>
                        </td>
                        <td>
                          <span v-if="personnage.comedienNom" class="comedien-badge-crea-comedien">
                            <i class="fas fa-user"></i>
                            {{ personnage.comedienNom }}
                            <span v-if="personnage.comedienAge" class="comedien-age">({{ personnage.comedienAge }} ans)</span>
                          </span>
                          <span v-else class="no-comedien-badge-crea-comedien">
                            <i class="fas fa-user-slash"></i>
                            Non assigné
                          </span>
                        </td>
                        <td>{{ formatDate(personnage.creeLe) }}</td>
                        <td>
                          <div class="table-actions-crea-comedien">
                            <button @click="openDetailsModal(personnage)" class="btn-view-crea-comedien" title="Voir détails">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button @click="editPersonnage(personnage)" class="btn-edit-crea-comedien" title="Modifier">
                              <i class="fas fa-marker"></i>
                            </button>
                            <button @click="confirmDeletePersonnage(personnage.id)" class="btn-delete-crea-comedien" title="Supprimer">
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailsModal" class="modal-overlay-crea-comedien" @click="closeDetailsModal">
      <div class="modal-content-crea-comedien" @click.stop>
        <div class="modal-header-crea-comedien">
          <h3>
            <i class="fas fa-user-circle"></i>
            Détails du personnage
          </h3>
          <button @click="closeDetailsModal" class="modal-close-btn-crea-comedien">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-crea-comedien" v-if="selectedPersonnage">
          <div class="personnage-details-modal">
            <div class="detail-section">
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien"><i class="fas fa-tag"></i> Nom :</span>
                <span class="detail-value-crea-comedien">{{ selectedPersonnage.nom }}</span>
              </div>
              
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien"><i class="fas fa-film"></i> Projet :</span>
                <span class="detail-value-crea-comedien">{{ selectedPersonnage.projetTitre || 'Non assigné' }}</span>
              </div>
              
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien"><i class="fas fa-user"></i> Comédien :</span>
                <span class="detail-value-crea-comedien">
                  <span v-if="selectedPersonnage.comedienNom">
                    {{ selectedPersonnage.comedienNom }}
                    <span v-if="selectedPersonnage.comedienAge">({{ selectedPersonnage.comedienAge }} ans)</span>
                  </span>
                  <span v-else class="no-value">Non assigné</span>
                </span>
              </div>
              
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien"><i class="fas fa-calendar"></i> Date de création :</span>
                <span class="detail-value-crea-comedien">{{ formatDate(selectedPersonnage.creeLe) }}</span>
              </div>
              
              <div class="detail-row-crea-comedien full-width">
                <span class="detail-label-crea-comedien"><i class="fas fa-align-left"></i> Description :</span>
                <div class="detail-value-crea-comedien description-text">
                  {{ selectedPersonnage.description || 'Aucune description fournie.' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer-crea-comedien">
          <button @click="editPersonnage(selectedPersonnage)" class="btn-edit-modal-crea-comedien">
            <i class="fas fa-marker"></i> Modifier
          </button>
          <button @click="closeDetailsModal" class="btn-close-modal-crea-comedien">
            <i class="fas fa-times"></i> Fermer
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMATION SUPPRESSION -->
    <div v-if="showDeleteModal" class="modal-overlay-crea-comedien" @click="closeDeleteModal">
      <div class="modal-content-crea-comedien" @click.stop style="max-width: 500px;">
        <div class="modal-header-crea-comedien" style="border-bottom-color: #C47A6B;">
          <h3 style="color: #C47A6B;">
            <i class="fas fa-exclamation-triangle"></i>
            Confirmation de suppression
          </h3>
          <button @click="closeDeleteModal" class="modal-close-btn-crea-comedien">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-crea-comedien" style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px; color: #C47A6B;">
            <i class="fas fa-trash-alt"></i>
          </div>
          <p style="font-size: 16px; margin-bottom: 8px;">
            Êtes-vous sûr de vouloir supprimer le personnage <strong>{{ personnageToDelete?.nom }}</strong> ?
          </p>
          <p style="font-size: 14px; color: #8A9B78;">
            Cette action est irréversible.
          </p>
        </div>
        
        <div class="modal-footer-crea-comedien">
          <button @click="closeDeleteModal" class="cancel-btn-crea-comedien" style="background: transparent; border: 1px solid #DCCFB8;">
            <i class="fas fa-times"></i> Annuler
          </button>
          <button @click="executeDeletePersonnage" class="submit-btn-crea-comedien" style="background: #C47A6B;" :disabled="isDeleting">
            <i v-if="isDeleting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash"></i>
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- NOTIFICATION -->
    <div v-if="notification.show" :class="['message-crea-profile', notification.type]" @click="hideNotification">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ notification.message }}
      <button class="notification-close-crea-profile" @click.stop="hideNotification">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddPersonnageEcranTravail',
  data() {
    return {
      // UI
      activeTab: 'form',
      
      // Données
      formData: {
        nom: '',
        description: '',
        projetId: '',
        comedienId: null
      },
      projets: [],
      comediens: [],
      personnages: [],
      filteredPersonnages: [],
      
      // États
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: false,
      error: '',
      
      // Recherche et suggestions
      projetSearch: '',
      comedienSearch: '',
      personnageSearch: '',
      showProjetSuggestions: false,
      showComedienSuggestions: false,
      filteredProjets: [],
      filteredComediens: [],
      currentProjetId: null,
      projetTitre: null,
      
      // Modal détails
      showDetailsModal: false,
      selectedPersonnage: null,
      
      // Modal suppression
      showDeleteModal: false,
      personnageToDelete: null,
      isDeleting: false,
      
      // Notification
      notification: {
        show: false,
        message: '',
        type: 'success'
      },
      notificationTimeout: null
    };
  },
  
  computed: {
    getPersonnagesAvecComedien() {
      return this.personnages.filter(p => p.comedienId).length;
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
  
  async mounted() {
    await this.loadProjets();
    await this.loadComediens();
    
    // Récupérer l'ID du projet depuis les paramètres de route
    const projetId = this.$route.params.projetId || this.$route.params.id || this.$route.query.projetId;
    if (projetId) {
      this.currentProjetId = projetId;
      this.formData.projetId = projetId;
      await this.fetchProjetDetails(projetId);
    }
    
    await this.loadPersonnages();
    
    // Initialiser les listes filtrées
    this.filteredProjets = [...this.projets];
    this.filteredComediens = [...this.comediens];
  },
  
  beforeUnmount() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    document.removeEventListener('click', this.closeSuggestions);
  },
  
  watch: {
    projets: {
      handler(newVal) {
        this.filteredProjets = [...newVal];
      },
      deep: true
    },
    comediens: {
      handler(newVal) {
        this.filteredComediens = [...newVal];
      },
      deep: true
    }
  },
  
  methods: {
    goToForm() {
      this.activeTab = 'form';
      this.resetForm();
    },
    
    goToList() {
      this.activeTab = 'list';
      this.loadPersonnages();
    },
    
    goBack() {
      this.$router.go(-1);
    },
    async fetchProjetDetails(projetId) {
      try {
        const response = await axios.get(`/api/projets/${projetId}`);
        const projet = response.data;
        this.projetTitre = projet.titre;
        this.projetSearch = projet.titre;
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
      }
    },
    
    async loadProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
        this.filteredProjets = [...this.projets];
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        this.showNotification('Erreur lors du chargement des projets', 'error');
      }
    },
    
    async loadComediens() {
      try {
        const response = await axios.get('/api/comediens');
        this.comediens = response.data;
        this.filteredComediens = [...this.comediens];
      } catch (error) {
        console.error('Erreur lors du chargement des comédiens:', error);
        this.showNotification('Erreur lors du chargement des comédiens', 'error');
      }
    },
    
    async loadPersonnages() {
      this.loading = true;
      try {
        let url = '/api/personnages';
        if (this.currentProjetId) {
          url += `?projetId=${this.currentProjetId}`;
        }
        const response = await axios.get(url);
        this.personnages = response.data;
        this.filteredPersonnages = this.personnages;
      } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
        this.showNotification('Erreur lors du chargement des personnages', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    filterPersonnages() {
      if (this.personnageSearch.trim() === '') {
        this.filteredPersonnages = this.personnages;
      } else {
        const searchTerm = this.personnageSearch.toLowerCase();
        this.filteredPersonnages = this.personnages.filter(personnage =>
          personnage.nom.toLowerCase().includes(searchTerm) ||
          (personnage.projetTitre && personnage.projetTitre.toLowerCase().includes(searchTerm)) ||
          (personnage.comedienNom && personnage.comedienNom.toLowerCase().includes(searchTerm))
        );
      }
    },
    
    filterProjets() {
      const searchTerm = this.projetSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredProjets = [...this.projets];
        return;
      }
      this.filteredProjets = this.projets.filter(projet => 
        projet.titre.toLowerCase().includes(searchTerm)
      );
    },
    
    filterComediens() {
      const searchTerm = this.comedienSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredComediens = [...this.comediens];
        return;
      }
      this.filteredComediens = this.comediens.filter(comedien => 
        comedien.nom.toLowerCase().includes(searchTerm) || 
        comedien.age.toString().includes(searchTerm)
      );
    },
    
    selectProjet(projet) {
      if (!this.currentProjetId) {
        this.formData.projetId = projet.id;
        this.projetSearch = projet.titre;
        this.showProjetSuggestions = false;
      }
    },
    
    selectComedien(comedien) {
      this.formData.comedienId = comedien.id;
      this.comedienSearch = `${comedien.nom} (${comedien.age} ans)`;
      this.showComedienSuggestions = false;
    },
    
    clearComedien() {
      this.formData.comedienId = null;
      this.comedienSearch = '';
      this.showComedienSuggestions = false;
    },
    
    // Fermer les suggestions au clic
    closeSuggestions(event) {
      if (!event.target.closest('.search-container-crea-comedien')) {
        this.showProjetSuggestions = false;
        this.showComedienSuggestions = false;
      }
    },
    
    async submitForm() {
      this.isSubmitting = true;
      this.error = '';
      
      try {
        if (this.isEditing) {
          await axios.put(`/api/personnages/${this.editingId}`, this.formData);
          this.showNotification('Personnage modifié avec succès', 'success');
        } else {
          await axios.post('/api/personnages', this.formData);
          this.showNotification('Personnage créé avec succès', 'success');
        }
        
        this.resetForm();
        await this.loadPersonnages();
        this.activeTab = 'list';
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        this.error = error.response?.data?.message || 'Erreur lors de la sauvegarde';
        this.showNotification(this.error, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    resetForm() {
      this.formData = {
        nom: '',
        description: '',
        projetId: this.currentProjetId || '',
        comedienId: null
      };
      this.projetSearch = this.currentProjetId ? this.getProjetName(this.currentProjetId) : '';
      this.comedienSearch = '';
      this.isEditing = false;
      this.editingId = null;
      this.error = '';
      this.filteredProjets = [...this.projets];
      this.filteredComediens = [...this.comediens];
    },
    
    editPersonnage(personnage) {
      this.formData = {
        nom: personnage.nom,
        description: personnage.description || '',
        projetId: personnage.projetId,
        comedienId: personnage.comedienId || null
      };
      this.projetSearch = this.getProjetName(personnage.projetId);
      this.comedienSearch = personnage.comedienNom ? `${personnage.comedienNom} (${personnage.comedienAge} ans)` : '';
      this.isEditing = true;
      this.editingId = personnage.id;
      this.error = '';
      this.activeTab = 'form';
      this.closeDetailsModal();
    },
    
    confirmDeletePersonnage(id) {
      const personnage = this.personnages.find(p => p.id === id);
      if (!personnage) return;
      this.personnageToDelete = personnage;
      this.showDeleteModal = true;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.personnageToDelete = null;
      this.isDeleting = false;
    },
    
    async executeDeletePersonnage() {
      if (!this.personnageToDelete) return;
      
      this.isDeleting = true;
      
      try {
        await axios.delete(`/api/personnages/${this.personnageToDelete.id}`);
        this.showNotification('Personnage supprimé avec succès', 'success');
        await this.loadPersonnages();
        this.closeDeleteModal();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.showNotification('Erreur lors de la suppression', 'error');
      } finally {
        this.isDeleting = false;
      }
    },
    
    openDetailsModal(personnage) {
      this.selectedPersonnage = personnage;
      this.showDetailsModal = true;
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedPersonnage = null;
    },
    
    showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message: message,
        type: type
      };
      
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      
      this.notificationTimeout = setTimeout(() => {
        this.hideNotification();
      }, 4000);
    },
    
    hideNotification() {
      this.notification.show = false;
      this.notification.message = '';
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = null;
      }
    },
    
    truncateDescription(description, maxLength = 80) {
      if (!description) return 'Aucune description';
      if (description.length <= maxLength) return description;
      return description.substring(0, maxLength) + '...';
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
    
    getProjetName(id) {
      if (!id) return '';
      const projet = this.projets.find(p => p.id === id);
      return projet ? projet.titre : '';
    },
    
    getComedienName(id) {
      if (!id) return '';
      const comedien = this.comediens.find(c => c.id === id);
      return comedien ? `${comedien.nom} (${comedien.age} ans)` : '';
    }
  }
};
</script>

<!-- <style lang="scss" scoped>

// Styles supplémentaires spécifiques aux personnages
.disabled-input {
  opacity: 0.8;
  background: #F1EFE6 !important;
  cursor: not-allowed;
}

.form-textarea-crea-comedien {
  width: 100%;
  padding: 12px;
  border: 1px solid #DCCFB8;
  border-radius: 8px;
  font-size: 14px;
  color: #53443D;
  background: white;
  transition: all 0.2s ease;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #8A9B78;
    box-shadow: 0 0 0 2px rgba(138, 155, 120, 0.1);
  }

  &:hover {
    border-color: #9BB7C9;
  }
}

.clear-button-crea-comedien {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #C47A6B;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: #A55E4F;
    transform: translateY(-50%) scale(1.05);
  }
  
  i {
    font-size: 10px;
  }
}

.suggestions-dropdown-crea-comedien {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #DCCFB8;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  .suggestion-item-crea-comedien {
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.2s ease;
    color: #53443D;
    font-size: 14px;
    
    &:hover {
      background: #F1EFE6;
    }
    
    &.no-results {
      color: #B8A99A;
      cursor: default;
      text-align: center;
      
      &:hover {
        background: white;
      }
    }
  }
}

.personnage-nom-cell {
  font-weight: 600;
  color: #8A9B78;
}

.personnage-desc-cell {
  max-width: 250px;
  
  .description-preview {
    white-space: normal;
    word-break: break-word;
    line-height: 1.4;
  }
}

.projet-badge-crea-comedien {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #E3ECF2;
  color: #7A9BB3;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  
  i {
    font-size: 11px;
  }
}

.comedien-badge-crea-comedien {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(138, 155, 120, 0.15);
  color: #6B7A5C;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  
  .comedien-age {
    font-size: 10px;
    opacity: 0.7;
  }
  
  i {
    font-size: 11px;
  }
}

.no-comedien-badge-crea-comedien {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #F5F0E8;
  color: #B8A99A;
  border-radius: 20px;
  font-size: 12px;
  
  i {
    font-size: 11px;
  }
}

.personnage-details-modal {
  .detail-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-row-crea-comedien {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    
    &.full-width {
      flex-direction: column;
      
      .detail-label-crea-comedien {
        min-width: auto;
      }
    }
  }
  
  .description-text {
    white-space: pre-wrap;
    line-height: 1.5;
    background: #F1EFE6;
    padding: 12px;
    border-radius: 8px;
    margin-top: 4px;
  }
  
  .no-value {
    color: #B8A99A;
    font-style: italic;
  }
}

.message-crea-profile {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  animation: slideInRight 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &.success {
    background: #8A9B78;
    color: white;
  }
  
  &.error {
    background: #C47A6B;
    color: white;
  }
  
  .notification-close-crea-profile {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 14px;
    margin-left: 8px;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .creation-sidebar-crea-comedien {
    display: block;
    position: relative;
    width: 100%;
    height: auto;
    top: 0;
  }
  
  .creation-body-crea-comedien {
    margin-left: 0;
  }
  
  .personnage-desc-cell {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .personnage-desc-cell {
    max-width: 100px;
  }
  
  .projet-badge-crea-comedien,
  .comedien-badge-crea-comedien,
  .no-comedien-badge-crea-comedien {
    font-size: 10px;
    padding: 2px 6px;
  }
}
</style> -->

