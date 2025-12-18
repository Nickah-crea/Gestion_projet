<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-crea-comedien">
      <div class="sidebar-header-crea-comedien">
        <h2 class="sidebar-title-crea-comedien">Gestion Comédiens</h2>
        <p class="sidebar-subtitle-crea-comedien">Créez et gérez vos comédiens</p>
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
            Nouveau comédien
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-crea-comedien"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-crea-comedien">
        <h3 class="section-title-crea-comedien"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-crea-comedien">
          <div class="filter-item-crea-comedien">
            <label for="projetFilterSidebar">Projet</label>
            <select 
              id="projetFilterSidebar" 
              v-model="selectedProjetFilter" 
              @change="filterComediens"
              class="filter-select-crea-comedien"
            >
              <option value="">Tous les projets</option>
              <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                {{ projet.titre }}
              </option>
            </select>
          </div>
          
          <div class="filter-item-crea-comedien">
            <label for="statutFilterSidebar">Statut</label>
            <select 
              id="statutFilterSidebar" 
              v-model="selectedStatutFilter" 
              @change="filterComediens"
              class="filter-select-crea-comedien"
            >
              <option value="">Tous les statuts</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="INDISPONIBLE">Indisponible</option>
              <option value="OCCUPE">Occupé</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-crea-comedien">
        <h3 class="section-title-crea-comedien"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-crea-comedien">
          <div class="stat-item-crea-comedien">
            <span class="stat-number-crea-comedien">{{ comediens.length }}</span>
            <span class="stat-label-crea-comedien">Total comédiens</span>
          </div>
          <div class="stat-item-crea-comedien">
            <span class="stat-number-crea-comedien">{{ getComediensDisponibles }}</span>
            <span class="stat-label-crea-comedien">Disponibles</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-comedien">
      <div class="creation-main-content-crea-comedien">
        
        <!-- En-tête principal -->
        <!-- <div class="main-header-crea-comedien">
          <h1 class="page-title-crea-comedien"><i class="fas fa-user-plus"></i> Gestion des Comédiens</h1>
          <p class="page-subtitle-crea-comedien">Créez, modifiez et gérez l'ensemble des comédiens de vos projets</p>
        </div> -->

        <!-- Système d'onglets -->
        <div class="tabs-container-crea-comedien">
          <div class="tabs-header-crea-comedien">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-crea-comedien', { active: activeTab === 'form' }]"
            >
              <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
              {{ isEditing ? 'Modifier comédien' : 'Créer comédien' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-comedien', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste comédiens
            </button>
          </div>
          
          <div class="tabs-content-crea-comedien">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-crea-comedien" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-crea-comedien">
              <!-- Formulaire de création/modification -->
              <div class="form-container-crea-comedien">
                <div class="form-header-crea-comedien">
                  <h3>
                    <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
                    {{ isEditing ? 'Modifier le comédien' : 'Créer un nouveau comédien' }}
                  </h3>
                  <button 
                    v-if="isEditing"
                    @click="goToForm"
                    class="back-btn-crea-comedien"
                  >
                    <i class="fas fa-plus"></i> Nouveau comédien
                  </button>
                </div>

                <form @submit.prevent="submitForm" class="comedien-form-crea-comedien" enctype="multipart/form-data">
                  <!-- Ligne 1 : Nom + Âge -->
                  <div class="form-row-crea-comedien">
                    <div class="form-group-crea-comedien">
                      <label for="nom">Nom du comédien *</label>
                      <input
                        type="text"
                        id="nom"
                        v-model="formData.nom"
                        required
                        placeholder="Entrez le nom du comédien"
                        class="form-input-crea-comedien"
                      />
                    </div>

                    <div class="form-group-crea-comedien">
                      <label for="age">Âge</label>
                      <input
                        type="number"
                        id="age"
                        v-model="formData.age"
                        placeholder="Âge du comédien"
                        class="form-input-crea-comedien"
                      />
                    </div>
                  </div>

                  <!-- Ligne 2 : Email + Projet -->
                  <div class="form-row-crea-comedien">
                    <div class="form-group-crea-comedien">
                      <label for="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        v-model="formData.email"
                        required
                        placeholder="email@exemple.com"
                        class="form-input-crea-comedien"
                      />
                    </div>

                    <!-- Sélection du projet avec recherche -->
                    <div class="form-group-crea-comedien">
                      <label for="projetSearch">Projet *</label>
                      <div class="search-container-crea-comedien">
                        <input
                          type="text"
                          id="projetSearch"
                          v-model="projetSearch"
                          @input="filterProjets"
                          @focus="showProjetSuggestions = true"
                          placeholder="Rechercher un projet..."
                          class="search-input-crea-comedien"
                        />
                        <div v-if="showProjetSuggestions && filteredProjets.length > 0" class="suggestions-dropdown-crea-comedien">
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

                  <!-- Ligne 3 : Disponibilités + Photo -->
                  <div class="form-row-split-crea-comedien">
                    <!-- Colonne 1 : Disponibilités -->
                    <div class="form-group-crea-comedien disponibilites-section-crea-comedien">
                      <label>Disponibilités</label>
                      <div class="disponibilites-list-crea-comedien">
                        <div v-for="(dispo, index) in formData.disponibilites" :key="index" class="disponibilite-item-crea-comedien">
                          <div class="disponibilite-inputs-crea-comedien">
                            <input
                              type="date"
                              v-model="dispo.date"
                              class="date-input-crea-comedien"
                              placeholder="Date"
                            />
                            <select v-model="dispo.statut" class="statut-select-crea-comedien">
                              <option value="DISPONIBLE">Disponible</option>
                              <option value="INDISPONIBLE">Indisponible</option>
                              <option value="OCCUPE">Occupé</option>
                            </select>
                            <button
                              type="button"
                              @click="removeDisponibilite(index)"
                              class="remove-dispo-btn-crea-comedien"
                              title="Supprimer"
                            >
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        @click="addDisponibilite"
                        class="btn-add-dispo-crea-comedien"
                      >
                        <i class="fas fa-plus"></i> Ajouter une disponibilité
                      </button>
                    </div>

                    <!-- Colonne 2 : Photo -->
                    <div class="form-group-crea-comedien photo-section-crea-comedien">
                      <label for="photo">Photo</label>
                      <div class="photo-upload-crea-comedien">
                        <input
                          type="file"
                          id="photo"
                          ref="photoInput"
                          @change="handlePhotoUpload"
                          accept="image/*"
                          class="photo-input-crea-comedien"
                        />
                        <label for="photo" class="photo-label-crea-comedien">
                          <i class="fas fa-camera"></i>
                          <span v-if="!previewPhoto">Choisir une photo</span>
                          <span v-else>Changer la photo</span>
                        </label>
                        <div v-if="previewPhoto" class="photo-preview-crea-comedien">
                          <img :src="previewPhoto" alt="Aperçu de la photo" class="preview-image-crea-comedien" />
                          <button type="button" @click="removePhoto" class="remove-photo-btn-crea-comedien">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="error" class="error-message-crea-comedien">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-crea-comedien">
                    <button
                      v-if="isEditing"
                      type="button"
                      @click="goToForm"
                      class="cancel-btn-crea-comedien"
                    >
                      <i class="fas fa-times"></i> Annuler
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="submit-btn-crea-comedien"
                    >
                      <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                      <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                      {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer le comédien') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Contenu de l'onglet Liste -->
            <div v-show="activeTab === 'list'" class="tab-pane-crea-comedien">
              <!-- Liste des comédiens -->
              <div class="comediens-list-crea-comedien">
                <div class="list-header-crea-comedien">
                  <h3><i class="fas fa-users"></i> Liste des comédiens ({{ filteredComediens.length }})</h3>
                  
                  <div class="search-section-crea-comedien">
                    <div class="search-group-crea-comedien">
                      <label for="comedienSearch">Rechercher un comédien</label>
                      <div class="search-input-container-crea-comedien">
                        <i class="fas fa-search search-icon-crea-comedien"></i>
                        <input
                          type="text"
                          id="comedienSearch"
                          v-model="comedienSearch"
                          @input="filterComediens"
                          placeholder="Rechercher par nom, email ou projet..."
                          class="search-input-large-crea-comedien"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="loading-state-crea-comedien">
                  <i class="fas fa-spinner fa-spin"></i> Chargement...
                </div>
                
                <div v-else-if="filteredComediens.length === 0" class="empty-state-crea-comedien">
                  <i class="fas fa-users"></i>
                  <div v-if="comedienSearch || selectedProjetFilter || selectedStatutFilter">
                    Aucun comédien ne correspond à vos critères de recherche.
                  </div>
                  <div v-else>
                    Aucun comédien créé pour le moment.
                  </div>
                </div>

                <div v-else class="comediens-table-container-crea-comedien">
                  <table class="comediens-table-crea-comedien">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Nom</th>
                        <th>Âge</th>
                        <th>Email</th>
                        <th>Projet</th>
                        <th>Disponibilités</th>
                        <th>Date création</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="comedien in filteredComediens" :key="comedien.id">
                        <td>
                          <img 
                            v-if="comedien.photoPath" 
                            :src="getPhotoUrl(comedien.photoPath)" 
                            :alt="comedien.nom"
                            class="table-photo-crea-comedien"
                          />
                          <div v-else class="photo-placeholder-crea-comedien">
                            <i class="fas fa-user"></i>
                          </div>
                        </td>
                        <td>{{ comedien.nom }}</td>
                        <td>{{ comedien.age }} ans</td>
                        <td>{{ comedien.email }}</td>
                        <td>{{ comedien.projetTitre || 'Non assigné' }}</td>
                        <td>
                          <div class="table-disponibilites-crea-comedien">
                            <div v-for="dispo in comedien.disponibilites" :key="dispo.id" class="table-dispo-item-crea-comedien">
                              <span class="dispo-date-crea-comedien">{{ formatDateSimple(dispo.date) }}</span>
                              <span class="status-badge-crea-comedien" :class="'status-' + dispo.statut.toLowerCase() + '-crea-comedien'">
                                <i :class="getStatutIcon(dispo.statut)"></i>
                                {{ getStatutText(dispo.statut) }}
                              </span>
                            </div>
                            <div v-if="!comedien.disponibilites || comedien.disponibilites.length === 0" class="no-disponibilites-crea-comedien">
                              Aucune
                            </div>
                          </div>
                        </td>
                        <td>{{ formatDate(comedien.creeLe) }}</td>
                        <td>
                          <div class="table-actions-crea-comedien">
                            <button @click="openDetailsModal(comedien)" class="btn-view-crea-comedien" title="Voir détails">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button @click="editComedien(comedien)" class="btn-edit-crea-comedien" title="Modifier">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button @click="goToSceneComedien(comedien.id)" class="btn-link-crea-comedien" title="Lier à une scène">
                              <i class="fas fa-link"></i>
                            </button>
                            <button @click="deleteComedien(comedien.id)" class="btn-delete-crea-comedien" title="Supprimer">
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
    <div v-if="showDetailsModal" class="modal-overlay-crea-comedien" @click="closeDetailsModal">
      <div class="modal-content-crea-comedien" @click.stop>
        <div class="modal-header-crea-comedien">
          <h3>
            <i class="fas fa-user"></i>
            Détails du comédien
          </h3>
          <button @click="closeDetailsModal" class="modal-close-btn-crea-comedien">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-crea-comedien" v-if="selectedComedien">
          <div class="comedien-details-crea-comedien">
            <!-- Photo -->
            <div class="detail-photo-section-crea-comedien">
              <img 
                v-if="selectedComedien.photoPath" 
                :src="getPhotoUrl(selectedComedien.photoPath)" 
                :alt="selectedComedien.nom"
                class="detail-photo-crea-comedien"
              />
              <div v-else class="detail-photo-placeholder-crea-comedien">
                <i class="fas fa-user"></i>
              </div>
            </div>
            
            <!-- Informations principales -->
            <div class="detail-info-crea-comedien">
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien">Nom :</span>
                <span class="detail-value-crea-comedien">{{ selectedComedien.nom }}</span>
              </div>
              
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien">Âge :</span>
                <span class="detail-value-crea-comedien">{{ selectedComedien.age }} ans</span>
              </div>
              
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien">Email :</span>
                <span class="detail-value-crea-comedien">{{ selectedComedien.email }}</span>
              </div>
              
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien">Projet :</span>
                <span class="detail-value-crea-comedien">{{ selectedComedien.projetTitre || 'Non assigné' }}</span>
              </div>
              
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien">Date de création :</span>
                <span class="detail-value-crea-comedien">{{ formatDate(selectedComedien.creeLe) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Disponibilités -->
          <div class="detail-disponibilites-crea-comedien">
            <h4><i class="fas fa-calendar-alt"></i> Disponibilités</h4>
            <div v-if="selectedComedien.disponibilites && selectedComedien.disponibilites.length > 0" 
                 class="disponibilites-grid-crea-comedien">
              <div v-for="dispo in selectedComedien.disponibilites" 
                   :key="dispo.id" 
                   class="dispo-card-crea-comedien"
                   :class="getStatutClass(dispo.statut)">
                <div class="dispo-date-crea-comedien">
                  <i class="fas fa-calendar-day"></i>
                  {{ formatDateSimple(dispo.date) }}
                </div>
                <div class="dispo-statut-crea-comedien">
                  <span class="status-badge-crea-comedien" :class="'status-' + dispo.statut.toLowerCase() + '-crea-comedien'">
                    <i :class="getStatutIcon(dispo.statut)"></i>
                    {{ getStatutText(dispo.statut) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="no-disponibilites-crea-comedien">
              <i class="fas fa-info-circle"></i>
              Aucune disponibilité définie
            </div>
          </div>
        </div>
        
        <div class="modal-footer-crea-comedien">
          <button @click="editComedien(selectedComedien)" class="btn-edit-modal-crea-comedien">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button @click="closeDetailsModal" class="btn-close-modal-crea-comedien">
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
  name: 'CreationComedien',
  data() {
    return {
      activeTab: 'form',
      formData: {
        nom: '',
        age: null,
        email: '',
        projetId: '',
        photo: null,
        disponibilites: []
      },
      comediens: [],
      filteredComediens: [],
      projets: [],
      filteredProjets: [],
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: false,
      previewPhoto: null,
      currentPhotoFile: null,
      error: '',
      
      // Recherche et filtres
      projetSearch: '',
      showProjetSuggestions: false,
      comedienSearch: '',
      selectedProjetFilter: '',
      selectedStatutFilter: '',
      
      // Modal de détails
      showDetailsModal: false,
      selectedComedien: null
    };
  },
  computed: {
    getComediensDisponibles() {
      return this.comediens.filter(comedien => 
        comedien.disponibilites && 
        comedien.disponibilites.some(dispo => dispo.statut === 'DISPONIBLE')
      ).length;
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
    document.addEventListener('click', this.closeProjetSuggestions);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeProjetSuggestions);
  },
  methods: {
    // Navigation entre onglets
    goToForm() {
      this.activeTab = 'form';
      this.resetForm();
    },

    goToList() {
      this.activeTab = 'list';
      this.loadComediens(); // Recharger les données
    },

    async loadProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
        this.filteredProjets = this.projets;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      }
    },

    async loadComediens() {
      this.loading = true;
      try {
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/comediens?t=${timestamp}`);
        this.comediens = response.data;
        this.filteredComediens = this.comediens;
        this.error = '';
      } catch (error) {
        console.error('Erreur lors du chargement des comédiens:', error);
        this.error = 'Erreur lors du chargement des comédiens';
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

    selectProjet(projet) {
      this.formData.projetId = projet.id;
      this.projetSearch = projet.titre;
      this.showProjetSuggestions = false;
    },

    closeProjetSuggestions(event) {
      if (!event.target.closest('.search-container-crea-comedien')) {
        this.showProjetSuggestions = false;
      }
    },

    filterComediens() {
      let filtered = this.comediens;

      if (this.comedienSearch.trim() !== '') {
        const searchTerm = this.comedienSearch.toLowerCase();
        filtered = filtered.filter(comedien =>
          comedien.nom.toLowerCase().includes(searchTerm) ||
          comedien.email.toLowerCase().includes(searchTerm) ||
          (comedien.projetTitre && comedien.projetTitre.toLowerCase().includes(searchTerm))
        );
      }

      if (this.selectedProjetFilter !== '') {
        filtered = filtered.filter(comedien => 
          comedien.projetId == this.selectedProjetFilter
        );
      }

      if (this.selectedStatutFilter !== '') {
        filtered = filtered.filter(comedien =>
          comedien.disponibilites && 
          comedien.disponibilites.some(dispo => dispo.statut === this.selectedStatutFilter)
        );
      }

      this.filteredComediens = filtered;
    },

    getPhotoUrl(photoPath) {
      return `/api/comediens/photo/${photoPath}`;
    },

    handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.currentPhotoFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewPhoto = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    removePhoto() {
      this.previewPhoto = null;
      this.currentPhotoFile = null;
      if (this.$refs.photoInput) {
        this.$refs.photoInput.value = '';
      }
    },

    addDisponibilite() {
      this.formData.disponibilites.push({
        date: '',
        statut: 'DISPONIBLE'
      });
    },

    removeDisponibilite(index) {
      this.formData.disponibilites.splice(index, 1);
    },

async submitForm() {
  this.isSubmitting = true;
  this.error = '';
  try {
    // Vérifier les dates dupliquées dans le formulaire
    const dateSet = new Set();
    const uniqueDisponibilites = [];
    
    this.formData.disponibilites.forEach(dispo => {
      if (dispo.date && !dateSet.has(dispo.date)) {
        dateSet.add(dispo.date);
        uniqueDisponibilites.push(dispo);
      }
    });
    
    // Remplacer par les disponibilités uniques
    this.formData.disponibilites = uniqueDisponibilites;
    
    // DEBUG: Afficher ce qui va être envoyé
    console.log('Disponibilités à envoyer:', this.formData.disponibilites);
    
    const formData = new FormData();
    
    if (this.formData.nom) formData.append('nom', this.formData.nom);
    if (this.formData.age) formData.append('age', this.formData.age);
    if (this.formData.email) formData.append('email', this.formData.email);
    if (this.formData.projetId) formData.append('projetId', this.formData.projetId);
    
    if (this.currentPhotoFile) {
      formData.append('photo', this.currentPhotoFile);
    }

    // Préparer les listes de dates et statuts
    const dates = [];
    const statuts = [];
    
    this.formData.disponibilites.forEach(dispo => {
      if (dispo.date) {
        dates.push(dispo.date);
        statuts.push(dispo.statut);
      }
    });
    
    // DEBUG: Afficher les listes
    console.log('Dates:', dates);
    console.log('Statuts:', statuts);
    
    // Ajouter chaque date individuellement
    dates.forEach(date => {
      formData.append('datesDisponibilite', date);
    });
    
    // Ajouter chaque statut individuellement
    statuts.forEach(statut => {
      formData.append('statutsDisponibilite', statut);
    });

    // DEBUG: Afficher le FormData
    for (let [key, value] of formData.entries()) {
      console.log(key + ': ' + value);
    }

    let response;
    if (this.isEditing) {
      response = await axios.put(`/api/comediens/${this.editingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Réponse mise à jour:', response.data);
      alert('Comédien modifié avec succès');
      await this.forceRefresh();
    } else {
      response = await axios.post('/api/comediens', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Comédien créé avec succès');
    }
    
    this.resetForm();
    // Attendre un peu pour que la base de données soit mise à jour
    await new Promise(resolve => setTimeout(resolve, 500));
    // Recharger les comédiens
    await this.loadComediens();
    this.activeTab = 'list';
  } catch (error) {
    console.error('Erreur complète:', error);
    console.error('Réponse d\'erreur:', error.response?.data);
    this.error = error.response?.data?.message || 'Erreur lors de la sauvegarde';
  } finally {
    this.isSubmitting = false;
  }
},

async forceRefresh() {
  // Réinitialiser les données
  this.comediens = [];
  this.filteredComediens = [];
  
  // Recharger avec un délai
  await new Promise(resolve => setTimeout(resolve, 300));
  await this.loadComediens();
  
  // Forcer le recalcul des filtres
  this.filterComediens();
},

editComedien(comedien) {
  // S'assurer qu'il n'y a pas de doublons de dates
  const uniqueDisponibilites = [];
  const dateSet = new Set();
  
  if (comedien.disponibilites) {
    comedien.disponibilites.forEach(dispo => {
      if (dispo.date && !dateSet.has(dispo.date)) {
        dateSet.add(dispo.date);
        uniqueDisponibilites.push({...dispo});
      }
    });
  }
  
  this.formData = {
    nom: comedien.nom,
    age: comedien.age,
    email: comedien.email,
    projetId: comedien.projetId,
    disponibilites: uniqueDisponibilites
  };
  
  const projet = this.projets.find(p => p.id === comedien.projetId);
  this.projetSearch = projet ? projet.titre : '';
  
  if (comedien.photoPath) {
    this.previewPhoto = this.getPhotoUrl(comedien.photoPath);
  } else {
    this.previewPhoto = null;
  }
  
  this.currentPhotoFile = null;
  this.isEditing = true;
  this.editingId = comedien.id;
  this.error = '';
  this.activeTab = 'form';
  this.closeDetailsModal();
},
    async deleteComedien(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce comédien ?')) {
        return;
      }

      try {
        await axios.delete(`/api/comediens/${id}`);
        alert('Comédien supprimé avec succès');
        await this.loadComediens();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    },

    // Modal de détails
    openDetailsModal(comedien) {
      this.selectedComedien = comedien;
      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedComedien = null;
    },

    // Obtenir l'icône du statut
    getStatutIcon(statut) {
      switch (statut) {
        case 'DISPONIBLE': return 'fas fa-check-circle';
        case 'INDISPONIBLE': return 'fas fa-times-circle';
        case 'OCCUPE': return 'fas fa-clock';
        default: return 'fas fa-question-circle';
      }
    },

resetForm() {
  this.formData = {
    nom: '',
    age: null,
    email: '',
    projetId: '',
    photo: null,
    disponibilites: []
  };
  this.projetSearch = '';
  this.previewPhoto = null;
  this.currentPhotoFile = null;
  this.isEditing = false;
  this.editingId = null;
  if (this.$refs.photoInput) {
    this.$refs.photoInput.value = '';
  }
  this.showProjetSuggestions = false;
  this.error = '';
  
  // Réinitialiser aussi les filtres de recherche
  this.comedienSearch = '';
  this.selectedProjetFilter = '';
  this.selectedStatutFilter = '';
},

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatDateSimple(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR');
    },

    getStatutClass(statut) {
      switch (statut) {
        case 'DISPONIBLE': return 'statut-disponible-crea-comedien';
        case 'INDISPONIBLE': return 'statut-indisponible-crea-comedien';
        case 'OCCUPE': return 'statut-occupe-crea-comedien';
        default: return '';
      }
    },

    getStatutText(statut) {
      switch (statut) {
        case 'DISPONIBLE': return 'Disponible';
        case 'INDISPONIBLE': return 'Indisponible';
        case 'OCCUPE': return 'Occupé';
        default: return statut;
      }
    },
    
    goToSceneComedien(comedienId) {
      this.$router.push({
        path: '/scene-comedien',
        query: { comedienId: comedienId }
      });
    }
  }
};
</script>