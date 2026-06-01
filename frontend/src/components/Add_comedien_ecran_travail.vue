<template>
  <div class="app-wrapper-global-crea-comedien">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-crea-comedien">
      <div class="sidebar-header-crea-comedien">
        <h2 class="sidebar-title-crea-comedien">Gestion Comédiens</h2>
        <p class="sidebar-subtitle-crea-comedien">Gérez les comédiens du projet</p>
      </div>

      <!-- Section Projet actuel -->
      <div class="sidebar-section-crea-comedien">
        <h3 class="section-title-crea-comedien"><i class="fas fa-film"></i> Projet actuel</h3>
        <div class="stats-crea-comedien">
          <div class="stat-item-crea-comedien">
            <span class="stat-number-crea-comedien" style="font-size: 18px;">{{ projetTitre }}</span>
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
            Nouveau comédien
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
            Retour au projet
          </button>
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
        <div class="main-header-crea-comedien">
          <h1 class="page-title-crea-comedien">
            <i class="fas fa-user-plus"></i> 
            Gestion des Comédiens - {{ projetTitre }}
          </h1>
          <p class="page-subtitle-crea-comedien">
            Créez, modifiez et gérez les comédiens associés à ce projet
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
              {{ isEditing ? 'Modifier comédien' : 'Créer comédien' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-comedien', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste comédiens ({{ comediens.length }})
            </button>
          </div>
          
          <div class="tabs-content-crea-comedien">
            <div class="tab-indicator-crea-comedien" :style="getTabIndicatorStyle"></div>
            
            <div v-show="activeTab === 'form'" class="tab-pane-crea-comedien">
              <div class="form-container-crea-comedien">
                <div class="form-header-crea-comedien">
                  <h3>
                    <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
                    {{ isEditing ? 'Modifier le comédien' : 'Créer un nouveau comédien' }}
                  </h3>
                  <button v-if="isEditing" @click="resetForm" class="back-btn-crea-comedien">
                    <i class="fas fa-times"></i> Annuler la modification
                  </button>
                </div>

                <form @submit.prevent="submitForm" class="comedien-form-crea-comedien" enctype="multipart/form-data">
                  <!-- Projet associé (non modifiable) -->
                  <div class="form-group-crea-comedien">
                    <label for="projet">Projet associé</label>
                    <input
                      type="text"
                      id="projet"
                      :value="projetTitre"
                      disabled
                      class="form-input-crea-comedien disabled-input"
                      placeholder="Chargement du projet..."
                    />
                  </div>

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

                  <!-- Ligne 2 : Email -->
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
                    <div class="form-group-crea-comedien">
                      <!-- Espace réservé pour garder l'alignement -->
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

            <!-- ONGLET LISTE -->
            <div v-show="activeTab === 'list'" class="tab-pane-crea-comedien">
              <div class="comediens-list-crea-comedien">
                <div class="list-header-crea-comedien">
                  <h3><i class="fas fa-users"></i> Liste des comédiens ({{ comediens.length }})</h3>
                  
                  <div class="search-section-crea-comedien">
                    <div class="search-group-crea-comedien">
                      <div class="search-input-container-crea-comedien">
                        <i class="fas fa-search search-icon-crea-comedien"></i>
                        <input
                          type="text"
                          id="comedienSearch"
                          v-model="comedienSearch"
                          @input="filterComediens"
                          placeholder=" Rechercher par nom, email..."
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
                  <div v-if="comedienSearch">
                    Aucun comédien ne correspond à votre recherche.
                  </div>
                  <div v-else>
                    Aucun comédien créé pour le projet "{{ projetTitre }}".
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
                              <i class="fas fa-marker"></i>
                            </button>
                            <button @click="confirmDeleteComedien(comedien.id)" class="btn-delete-crea-comedien" title="Supprimer">
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

    <!-- MODAL DE DÉTAILS -->
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
                <span class="detail-value-crea-comedien">{{ projetTitre }}</span>
              </div>
              <div class="detail-row-crea-comedien">
                <span class="detail-label-crea-comedien">Date de création :</span>
                <span class="detail-value-crea-comedien">{{ formatDate(selectedComedien.creeLe) }}</span>
              </div>
            </div>
          </div>
          
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
            Êtes-vous sûr de vouloir supprimer le comédien <strong>{{ comedianToDelete?.nom }}</strong> ?
          </p>
          <p style="font-size: 14px; color: #8A9B78;">
            Cette action est irréversible.
          </p>
        </div>
        
        <div class="modal-footer-crea-comedien">
          <button @click="closeDeleteModal" class="cancel-btn-crea-comedien" style="background: transparent; border: 1px solid #DCCFB8;">
            <i class="fas fa-times"></i> Annuler
          </button>
          <button @click="executeDeleteComedian" class="submit-btn-crea-comedien" style="background: #C47A6B;" :disabled="isDeleting">
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
  name: 'AddComedienEcranTravail',
  data() {
    return {
      // UI
      activeTab: 'form',
      
      // Données projet
      projetId: null,
      projetTitre: 'Chargement...',
      
      // Formulaire
      formData: {
        nom: '',
        age: null,
        email: '',
        disponibilites: []
      },
      comediens: [],
      filteredComediens: [],
      
      // États
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: false,
      previewPhoto: null,
      currentPhotoFile: null,
      error: '',
      
      // Recherche et filtres
      comedienSearch: '',
      
      // Modal détails
      showDetailsModal: false,
      selectedComedien: null,
      
      // Modal suppression
      showDeleteModal: false,
      comedianToDelete: null,
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
    this.projetId = this.$route.params.projetId || this.$route.query.projetId;
    
    console.log('Projet ID récupéré:', this.projetId);
    
    if (!this.projetId) {
      console.error('ID du projet non trouvé dans les paramètres de route');
      this.showNotification('Erreur: ID du projet manquant', 'error');
      setTimeout(() => this.goBack(), 2000);
      return;
    }
    
    await this.loadProjetInfo();
    await this.loadComediens();
  },
  
  beforeUnmount() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  },
  
  methods: {
    goToForm() {
      this.activeTab = 'form';
      this.resetForm();
    },
    
    goToList() {
      this.activeTab = 'list';
      this.loadComediens();
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    async loadProjetInfo() {
      try {
        console.log('Chargement des infos du projet ID:', this.projetId);
        const response = await axios.get(`/api/projets/${this.projetId}`);
        this.projetTitre = response.data.titre;
        console.log('Projet trouvé:', this.projetTitre);
      } catch (error) {
        console.error('Erreur lors du chargement des informations du projet:', error);
        this.projetTitre = 'Projet inconnu';
        this.showNotification('Erreur lors du chargement du projet', 'error');
      }
    },
    
    async loadComediens() {
      this.loading = true;
      try {
        console.log('Chargement des comédiens pour le projet ID:', this.projetId);
        const response = await axios.get(`/api/comediens/projet/${this.projetId}`);
        this.comediens = response.data;
        this.filteredComediens = this.comediens;
        console.log('Comédiens chargés:', this.comediens.length);
      } catch (error) {
        console.error('Erreur lors du chargement des comédiens:', error);
        this.showNotification('Erreur lors du chargement des comédiens', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    filterComediens() {
      if (this.comedienSearch.trim() === '') {
        this.filteredComediens = this.comediens;
      } else {
        const searchTerm = this.comedienSearch.toLowerCase();
        this.filteredComediens = this.comediens.filter(comedien =>
          comedien.nom.toLowerCase().includes(searchTerm) ||
          comedien.email.toLowerCase().includes(searchTerm)
        );
      }
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
        const dateSet = new Set();
        const uniqueDisponibilites = [];
        
        this.formData.disponibilites.forEach(dispo => {
          if (dispo.date && !dateSet.has(dispo.date)) {
            dateSet.add(dispo.date);
            uniqueDisponibilites.push(dispo);
          }
        });
        
        this.formData.disponibilites = uniqueDisponibilites;
        
        const formData = new FormData();
        formData.append('projetId', this.projetId);
        
        if (this.formData.nom) formData.append('nom', this.formData.nom);
        if (this.formData.age) formData.append('age', this.formData.age);
        if (this.formData.email) formData.append('email', this.formData.email);
        
        if (this.currentPhotoFile) {
          formData.append('photo', this.currentPhotoFile);
        }
        
        this.formData.disponibilites.forEach(dispo => {
          if (dispo.date) {
            formData.append('dateDisponibilite', dispo.date);
            formData.append('statutDisponibilite', dispo.statut);
          }
        });
        
        let response;
        if (this.isEditing) {
          response = await axios.put(`/api/comediens/${this.editingId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          this.showNotification('Comédien modifié avec succès', 'success');
        } else {
          response = await axios.post('/api/comediens', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          this.showNotification('Comédien créé avec succès', 'success');
        }
        
        this.resetForm();
        await this.loadComediens();
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
        age: null,
        email: '',
        disponibilites: []
      };
      this.previewPhoto = null;
      this.currentPhotoFile = null;
      this.isEditing = false;
      this.editingId = null;
      this.error = '';
      if (this.$refs.photoInput) {
        this.$refs.photoInput.value = '';
      }
    },
    
    editComedien(comedien) {
      const uniqueDisponibilites = [];
      const dateSet = new Set();
      
      if (comedien.disponibilites) {
        comedien.disponibilites.forEach(dispo => {
          if (dispo.date && !dateSet.has(dispo.date)) {
            dateSet.add(dispo.date);
            uniqueDisponibilites.push({ ...dispo });
          }
        });
      }
      
      this.formData = {
        nom: comedien.nom,
        age: comedien.age,
        email: comedien.email,
        disponibilites: uniqueDisponibilites
      };
      
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
    
    confirmDeleteComedien(id) {
      const comedian = this.comediens.find(c => c.id === id);
      if (!comedian) return;
      this.comedianToDelete = comedian;
      this.showDeleteModal = true;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.comedianToDelete = null;
      this.isDeleting = false;
    },
    
    async executeDeleteComedian() {
      if (!this.comedianToDelete) return;
      
      this.isDeleting = true;
      
      try {
        await axios.delete(`/api/comediens/${this.comedianToDelete.id}`);
        this.showNotification('Comédien supprimé avec succès', 'success');
        await this.loadComediens();
        this.closeDeleteModal();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.showNotification('Erreur lors de la suppression', 'error');
      } finally {
        this.isDeleting = false;
      }
    },
    
    openDetailsModal(comedien) {
      this.selectedComedien = comedien;
      this.showDetailsModal = true;
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedComedien = null;
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
    
    formatDateSimple(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('fr-FR');
    },
    
    getStatutIcon(statut) {
      switch (statut) {
        case 'DISPONIBLE': return 'fas fa-check-circle';
        case 'INDISPONIBLE': return 'fas fa-times-circle';
        case 'OCCUPE': return 'fas fa-clock';
        default: return 'fas fa-question-circle';
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
    
    getStatutClass(statut) {
      switch (statut) {
        case 'DISPONIBLE': return 'statut-disponible-crea-comedien';
        case 'INDISPONIBLE': return 'statut-indisponible-crea-comedien';
        case 'OCCUPE': return 'statut-occupe-crea-comedien';
        default: return '';
      }
    }
  }
};
</script>

<!-- <style lang="scss" scoped>
// Styles supplémentaires spécifiques
.disabled-input {
  opacity: 0.8;
  background: #F1EFE6 !important;
  cursor: not-allowed;
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
}
</style> -->

