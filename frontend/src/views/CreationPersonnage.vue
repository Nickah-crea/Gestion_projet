<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-crea-personnage">
      <div class="sidebar-header-crea-personnage">
        <h2 class="sidebar-title-crea-personnage">Gestion Personnages</h2>
        <p class="sidebar-subtitle-crea-personnage">Créez et gérez vos personnages</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-crea-personnage">
        <h3 class="section-title-crea-personnage"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-crea-personnage">
          <button 
            @click="goToForm" 
            class="sidebar-btn-crea-personnage" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouveau personnage
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-crea-personnage"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-crea-personnage">
        <h3 class="section-title-crea-personnage"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-crea-personnage">
          <div class="filter-item-crea-personnage">
            <label for="projetFilterSidebar">Projet</label>
            <select 
              id="projetFilterSidebar" 
              v-model="selectedProjetFilter" 
              @change="filterPersonnages"
              class="filter-select-crea-personnage"
            >
              <option value="">Tous les projets</option>
              <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                {{ projet.titre }}
              </option>
            </select>
          </div>
          
          <div class="filter-item-crea-personnage">
            <label for="comedienFilterSidebar">Comédien</label>
            <select 
              id="comedienFilterSidebar" 
              v-model="selectedComedienFilter" 
              @change="filterPersonnages"
              class="filter-select-crea-personnage"
            >
              <option value="">Tous les comédiens</option>
              <option v-for="comedien in comediens" :key="comedien.id" :value="comedien.id">
                {{ comedien.nom }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-crea-personnage">
        <h3 class="section-title-crea-personnage"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-crea-personnage">
          <div class="stat-item-crea-personnage">
            <span class="stat-number-crea-personnage">{{ personnages.length }}</span>
            <span class="stat-label-crea-personnage">Total personnages</span>
          </div>
          <div class="stat-item-crea-personnage">
            <span class="stat-number-crea-personnage">{{ getPersonnagesAvecComedien }}</span>
            <span class="stat-label-crea-personnage">Avec comédien</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-personnage">
      <div class="creation-main-content-crea-personnage">
        
        <!-- En-tête principal -->
        <!-- <div class="main-header-crea-personnage">
          <h1 class="page-title-crea-personnage"><i class="fas fa-user-tie"></i> Création et Gestion des Personnages</h1>
          <p class="page-subtitle-crea-personnage">Créez, modifiez et gérez l'ensemble des personnages de vos projets</p>
        </div> -->

        <!-- Système d'onglets -->
        <div class="tabs-container-crea-personnage">
          <div class="tabs-header-crea-personnage">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-crea-personnage', { active: activeTab === 'form' }]"
            >
              <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
              {{ isEditing ? 'Modifier personnage' : 'Créer personnage' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-personnage', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste personnages
            </button>
          </div>
          
          <div class="tabs-content-crea-personnage">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-crea-personnage" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-crea-personnage">
              <!-- Formulaire de création/modification -->
              <div class="form-container-crea-personnage">
                <div class="form-header-crea-personnage">
                  <h3>
                    <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
                    {{ isEditing ? 'Modifier le personnage' : 'Créer un nouveau personnage' }}
                  </h3>
                  <button 
                    v-if="isEditing"
                    @click="resetForm"
                    class="back-btn-crea-personnage"
                  >
                    <i class="fas fa-plus"></i> Nouveau personnage
                  </button>
                </div>

                <form @submit.prevent="submitForm" class="personnage-form-crea-personnage">
                  <div class="form-row-crea-personnage">
                    <div class="form-group-crea-personnage">
                      <label for="nom">Nom du personnage *</label>
                      <input
                        type="text"
                        id="nom"
                        v-model="formData.nom"
                        required
                        placeholder="Entrez le nom du personnage"
                        class="form-input-crea-personnage"
                      />
                    </div>
                  </div>

                  <!-- Projet + Comédien côte à côte -->
                  <div class="form-row-crea-personnage">
                    <!-- Projet -->
                    <div class="form-group-crea-personnage">
                      <label for="projetSearch">Projet *</label>
                      <div class="search-container-crea-personnage">
                        <input
                          type="text"
                          id="projetSearch"
                          v-model="projetSearch"
                          @input="filterProjets"
                          @focus="showProjetSuggestions = true"
                          placeholder="Rechercher un projet..."
                          class="search-input-crea-personnage"
                          required
                        />
                        <div v-if="showProjetSuggestions && filteredProjets.length > 0" class="suggestions-dropdown-crea-personnage">
                          <div
                            v-for="projet in filteredProjets"
                            :key="projet.id"
                            @click="selectProjet(projet)"
                            class="suggestion-item-crea-personnage"
                          >
                            {{ projet.titre }}
                          </div>
                        </div>
                        <div v-if="showProjetSuggestions && filteredProjets.length === 0" class="suggestions-dropdown-crea-personnage">
                          <div class="no-results-crea-personnage">
                            <i class="fas fa-search"></i>
                            Aucun projet trouvé
                          </div>
                        </div>
                      </div>
                      <input type="hidden" v-model="formData.projetId" required />
                    </div>

                    <!-- Comédien -->
                    <div class="form-group-crea-personnage">
                      <label for="comedienSearch">Comédien</label>
                      <div class="search-container-crea-personnage">
                        <input
                          type="text"
                          id="comedienSearch"
                          v-model="comedienSearch"
                          @input="filterComediens"
                          @focus="showComedienSuggestions = true"
                          placeholder="Rechercher un comédien..."
                          class="search-input-crea-personnage"
                        />
                        <button
                          type="button"
                          v-if="formData.comedienId"
                          @click="clearComedien"
                          class="clear-comedien-btn-crea-personnage"
                          title="Supprimer le comédien"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                        <div v-if="showComedienSuggestions && filteredComediens.length > 0" class="suggestions-dropdown-crea-personnage">
                          <div
                            v-for="comedien in filteredComediens"
                            :key="comedien.id"
                            @click="selectComedien(comedien)"
                            class="suggestion-item-crea-personnage"
                          >
                            {{ comedien.nom }} ({{ comedien.age }} ans)
                          </div>
                        </div>
                        <div v-if="showComedienSuggestions && filteredComediens.length === 0" class="suggestions-dropdown-crea-personnage">
                          <div class="no-results-crea-personnage">
                            <i class="fas fa-search"></i>
                            Aucun comédien trouvé
                          </div>
                        </div>
                      </div>
                      <input type="hidden" v-model="formData.comedienId" />
                    </div>
                  </div>

                  <div class="form-group-crea-personnage">
                    <label for="description">Description</label>
                    <textarea
                      id="description"
                      v-model="formData.description"
                      rows="4"
                      placeholder="Décrivez le personnage..."
                      class="form-textarea-crea-personnage"
                    ></textarea>
                  </div>

                  <div v-if="error" class="error-message-crea-personnage">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-crea-personnage">
                    <button
                      v-if="isEditing"
                      type="button"
                      @click="resetForm"
                      class="cancel-btn-crea-personnage"
                    >
                      <i class="fas fa-times"></i> Annuler
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="submit-btn-crea-personnage"
                    >
                      <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                      <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                      {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer le personnage') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Contenu de l'onglet Liste -->
            <div v-show="activeTab === 'list'" class="tab-pane-crea-personnage">
              <!-- Liste des personnages -->
              <div class="personnages-list-crea-personnage">
                <div class="list-header-crea-personnage">
                  <h3><i class="fas fa-user-tie"></i> Liste des personnages ({{ filteredPersonnages.length }})</h3>
                  
                  <div class="search-section-crea-personnage">
                    <div class="search-group-crea-personnage">
                      <label for="personnageSearch">Rechercher un personnage</label>
                      <div class="search-input-container-crea-personnage">
                        <i class="fas fa-search search-icon-crea-personnage"></i>
                        <input
                          type="text"
                          id="personnageSearch"
                          v-model="personnageSearch"
                          @input="filterPersonnages"
                          placeholder="Rechercher par nom, projet ou comédien..."
                          class="search-input-large-crea-personnage"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="loading-state-crea-personnage">
                  <i class="fas fa-spinner fa-spin"></i> Chargement...
                </div>
                
                <div v-else-if="filteredPersonnages.length === 0" class="empty-state-crea-personnage">
                  <i class="fas fa-user-tie"></i>
                  <div v-if="personnageSearch || selectedProjetFilter || selectedComedienFilter">
                    Aucun personnage ne correspond à vos critères de recherche.
                  </div>
                  <div v-else>
                    Aucun personnage créé pour le moment.
                  </div>
                </div>

                <div v-else class="personnages-table-container-crea-personnage">
                  <table class="personnages-table-crea-personnage">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Projet</th>
                        <th>Comédien</th>
                        <th>Description</th>
                        <th>Date création</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="personnage in filteredPersonnages" :key="personnage.id">
                        <td>
                          <strong>{{ personnage.nom }}</strong>
                        </td>
                        <td>{{ personnage.projetTitre }}</td>
                        <td>
                          <span v-if="personnage.comedienNom" class="comedien-assigne-crea-personnage">
                            <i class="fas fa-user"></i>
                            {{ personnage.comedienNom }}
                          </span>
                          <span v-else class="no-comedien-crea-personnage">
                            <i class="fas fa-user-slash"></i>
                            Non assigné
                          </span>
                        </td>
                        <td>
                          <div class="description-truncated-crea-personnage" :title="personnage.description">
                            {{ personnage.description || 'Aucune description' }}
                          </div>
                        </td>
                        <td>{{ formatDate(personnage.creeLe) }}</td>
                        <td>
                          <div class="table-actions-crea-personnage">
                            <button @click="openDetailsModal(personnage)" class="btn-view-crea-personnage" title="Voir détails">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button @click="editPersonnage(personnage)" class="btn-edit-crea-personnage" title="Modifier">
                              <i class="fas fa-marker"></i>
                            </button>
                            <button @click="deletePersonnage(personnage.id)" class="btn-delete-crea-personnage" title="Supprimer">
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

    <!-- Modal de détails -->
    <div v-if="showDetailsModal" class="modal-overlay-crea-personnage" @click="closeDetailsModal">
      <div class="modal-content-crea-personnage" @click.stop>
        <div class="modal-header-crea-personnage">
          <h3>
            <i class="fas fa-user-tie"></i>
            Détails du personnage
          </h3>
          <button @click="closeDetailsModal" class="modal-close-btn-crea-personnage">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-crea-personnage" v-if="selectedPersonnage">
          <div class="personnage-details-crea-personnage">
            <!-- Informations principales -->
            <div class="detail-info-crea-personnage">
              <div class="detail-row-crea-personnage">
                <span class="detail-label-crea-personnage">Nom :</span>
                <span class="detail-value-crea-personnage">{{ selectedPersonnage.nom }}</span>
              </div>
              
              <div class="detail-row-crea-personnage">
                <span class="detail-label-crea-personnage">Projet :</span>
                <span class="detail-value-crea-personnage">{{ selectedPersonnage.projetTitre }}</span>
              </div>
              
              <div class="detail-row-crea-personnage">
                <span class="detail-label-crea-personnage">Comédien :</span>
                <span class="detail-value-crea-personnage" v-if="selectedPersonnage.comedienNom">
                  <i class="fas fa-user"></i> {{ selectedPersonnage.comedienNom }}
                </span>
                <span class="detail-value-crea-personnage no-comedien" v-else>
                  <i class="fas fa-user-slash"></i> Non assigné
                </span>
              </div>
              
              <div class="detail-row-crea-personnage">
                <span class="detail-label-crea-personnage">Date de création :</span>
                <span class="detail-value-crea-personnage">{{ formatDate(selectedPersonnage.creeLe) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div class="detail-description-crea-personnage">
            <h4><i class="fas fa-file-alt"></i> Description</h4>
            <div class="description-content-crea-personnage">
              {{ selectedPersonnage.description || 'Aucune description disponible' }}
            </div>
          </div>
        </div>
        
        <div class="modal-footer-crea-personnage">
          <button @click="editPersonnage(selectedPersonnage)" class="btn-edit-modal-crea-personnage">
            <i class="fas fa-marker"></i> Modifier
          </button>
          <button @click="closeDetailsModal" class="btn-close-modal-crea-personnage">
            <i class="fas fa-times"></i> Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CreationPersonnage',
  data() {
    return {
      activeTab: 'form',
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
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: false,
      error: '',
      
      // Recherche et filtres
      projetSearch: '',
      comedienSearch: '',
      personnageSearch: '',
      showProjetSuggestions: false,
      showComedienSuggestions: false,
      filteredProjets: [],
      filteredComediens: [],
      selectedProjetFilter: '',
      selectedComedienFilter: '',
      
      // Modal de détails
      showDetailsModal: false,
      selectedPersonnage: null
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
    await this.loadPersonnages();
    this.filteredProjets = [...this.projets];
    this.filteredComediens = [...this.comediens];
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
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
      this.loadPersonnages();
    },

    async loadProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      }
    },

    async loadComediens() {
      try {
        const response = await axios.get('/api/comediens');
        this.comediens = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des comédiens:', error);
      }
    },

    async loadPersonnages() {
      this.loading = true;
      try {
        const response = await axios.get('/api/personnages');
        this.personnages = response.data;
        this.filteredPersonnages = this.personnages;
      } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
        this.error = 'Erreur lors du chargement des personnages';
      } finally {
        this.loading = false;
      }
    },

    filterProjets() {
      if (this.projetSearch.trim() === '') {
        this.filteredProjets = this.projets;
      } else {
        const searchTerm = this.projetSearch.toLowerCase();
        this.filteredProjets = this.projets.filter(projet =>
          projet.titre.toLowerCase().includes(searchTerm)
        );
      }
    },

    filterComediens() {
      if (this.comedienSearch.trim() === '') {
        this.filteredComediens = this.comediens;
      } else {
        const searchTerm = this.comedienSearch.toLowerCase();
        this.filteredComediens = this.comediens.filter(comedien =>
          comedien.nom.toLowerCase().includes(searchTerm) ||
          comedien.age.toString().includes(searchTerm)
        );
      }
    },

    filterPersonnages() {
      let filtered = this.personnages;

      // Filtre par recherche texte
      if (this.personnageSearch.trim() !== '') {
        const searchTerm = this.personnageSearch.toLowerCase();
        filtered = filtered.filter(personnage =>
          personnage.nom.toLowerCase().includes(searchTerm) ||
          personnage.projetTitre.toLowerCase().includes(searchTerm) ||
          (personnage.comedienNom && personnage.comedienNom.toLowerCase().includes(searchTerm))
        );
      }

      // Filtre par projet
      if (this.selectedProjetFilter !== '') {
        filtered = filtered.filter(personnage => 
          personnage.projetId == this.selectedProjetFilter
        );
      }

      // Filtre par comédien
      if (this.selectedComedienFilter !== '') {
        filtered = filtered.filter(personnage => 
          personnage.comedienId == this.selectedComedienFilter
        );
      }

      this.filteredPersonnages = filtered;
    },

    selectProjet(projet) {
      this.formData.projetId = projet.id;
      this.projetSearch = projet.titre;
      this.showProjetSuggestions = false;
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

    handleClickOutside(event) {
      if (!event.target.closest('.search-container-crea-personnage')) {
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
          alert('Personnage modifié avec succès');
        } else {
          await axios.post('/api/personnages', this.formData);
          alert('Personnage créé avec succès');
        }

        this.resetForm();
        await this.loadPersonnages();
        this.activeTab = 'list';
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        this.error = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      } finally {
        this.isSubmitting = false;
      }
    },

    editPersonnage(personnage) {
      this.formData = {
        nom: personnage.nom,
        description: personnage.description || '',
        projetId: personnage.projetId,
        comedienId: personnage.comedienId
      };
      
      const projet = this.projets.find(p => p.id === personnage.projetId);
      this.projetSearch = projet ? projet.titre : '';
      
      if (personnage.comedienId) {
        const comedien = this.comediens.find(c => c.id === personnage.comedienId);
        this.comedienSearch = comedien ? `${comedien.nom} (${comedien.age} ans)` : '';
      } else {
        this.comedienSearch = '';
      }
      
      this.isEditing = true;
      this.editingId = personnage.id;
      this.error = '';
      this.activeTab = 'form';
      this.closeDetailsModal();
    },

    async deletePersonnage(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) {
        return;
      }

      try {
        await axios.delete(`/api/personnages/${id}`);
        alert('Personnage supprimé avec succès');
        await this.loadPersonnages();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    },

    // Modal de détails
    openDetailsModal(personnage) {
      this.selectedPersonnage = personnage;
      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedPersonnage = null;
    },

    resetForm() {
      this.formData = {
        nom: '',
        description: '',
        projetId: '',
        comedienId: null
      };
      this.projetSearch = '';
      this.comedienSearch = '';
      this.isEditing = false;
      this.editingId = null;
      this.error = '';
      this.filteredProjets = [...this.projets];
      this.filteredComediens = [...this.comediens];
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

