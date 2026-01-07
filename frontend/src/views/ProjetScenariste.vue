<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale originale - inchangée -->
    <div class="creation-sidebar-projet-scenariste">
      <div class="sidebar-header-projet-scenariste">
        <h2 class="sidebar-title-projet-scenariste">Gestion Projets</h2>
        <p class="sidebar-subtitle-projet-scenariste">Gérez vos projets et épisodes</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-projet-scenariste">
              <h3 class="section-title-projet-scenariste"><i class="fas fa-bolt"></i> Actions Rapides</h3>
              <div class="sidebar-actions-projet-scenariste">
                <button 
                  @click="goToAddEpisode" 
                  class="sidebar-btn-projet-scenariste nouvel-episode-btn" 
                >
                  <i class="fas fa-plus"></i>
                  Nouvel épisode
                </button>
                <button 
                  @click="goBack" 
                  class="sidebar-btn-projet-scenariste"
                >
                  <i class="fas fa-arrow-left"></i>
                  Retour aux projets
                </button>
              </div>
            </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-projet-scenariste">
        <h3 class="section-title-projet-scenariste"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-projet-scenariste">
          <div class="filter-item-projet-scenariste">
            <label for="timePeriodFilter">Période</label>
            <select 
              id="timePeriodFilter" 
              v-model="filterTimePeriod" 
              class="filter-select-projet-scenariste"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="this_week">Cette semaine</option>
              <option value="this_month">Ce mois-ci</option>
              <option value="this_year">Cette année</option>
              <option value="recent">Récent (7 derniers jours)</option>
            </select>
          </div>
          
          <div class="filter-item-projet-scenariste">
            <label for="statutFilter">Statut</label>
            <select 
              id="statutFilter" 
              v-model="filterStatut" 
              class="filter-select-projet-scenariste"
            >
              <option value="">Tous</option>
              <option v-for="statut in statutsEpisode" :key="statut.idStatutEpisode" :value="statut.nomStatutsEpisode">
                {{ statut.nomStatutsEpisode }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-projet-scenariste">
        <h3 class="section-title-projet-scenariste"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-projet-scenariste">
          <div class="stat-item-projet-scenariste">
            <span class="stat-number-projet-scenariste">{{ episodes.length }}</span>
            <span class="stat-label-projet-scenariste">Total épisodes</span>
          </div>
          <div class="stat-item-projet-scenariste">
            <span class="stat-number-projet-scenariste">{{ filteredEpisodes.length }}</span>
            <span class="stat-label-projet-scenariste">Épisodes filtrés</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-projet-scenariste">
      <div class="creation-main-content-projet-scenariste">


        <!-- Détails du projet avec design amélioré -->
        <div class="project-details-spiral-Scenariste">
          <div class="project-info-spiral-Scenariste">
            <div class="project-main-content-Scenariste">
              <div class="project-header-spiral-Scenariste">
                <h3 class="project-title-spiral-Scenariste">
                  <i class="fas fa-film"></i>
                  {{ projet.titre }}
                </h3>
                <span class="project-statut-badge-Scenariste" :class="getStatutClass(projet.statutNom)">
                  {{ projet.statutNom }}
                </span>
              </div>
              
              <div class="project-meta-spiral-Scenariste">
                <div class="meta-item-spiral-Scenariste">
                  <i class="fas fa-calendar-alt"></i>
                  <span class="meta-label">Créé le:</span>
                  <span class="meta-value">{{ formatDate(projet.creeLe) }}</span>
                </div>
                <div class="meta-item-spiral-Scenariste">
                  <i class="fas fa-edit"></i>
                  <span class="meta-label">Modifié le:</span>
                  <span class="meta-value">{{ formatDate(projet.modifieLe) }}</span>
                </div>
                <div class="meta-item-spiral-Scenariste" v-if="projet.dateFin">
                  <i class="fas fa-calendar-check"></i>
                  <span class="meta-label">Terminé le:</span>
                  <span class="meta-value">{{ formatDate(projet.dateFin) }}</span>
                </div>
                <div class="meta-item-spiral-Scenariste">
                  <i class="fas fa-tags"></i>
                  <span class="meta-label">Genre:</span>
                  <span class="meta-value">{{ projet.genreNom }}</span>
                </div>
              </div>
              
              <div class="project-synopsis-spiral-Scenariste" v-if="projet.synopsis">
                <h4><i class="fas fa-align-left"></i> Synopsis</h4>
                <p>{{ projet.synopsis }}</p>
              </div>
            </div>
          </div>
        </div>

      <!-- Grille des épisodes -->
      <div class="episodes-section-projet-scenariste">
        <div class="section-header-projet-scenariste">
          <h3>Liste des épisodes du projet</h3>
          <div class="episodes-count">
            <span class="count-text">{{ filteredEpisodes.length }} épisode(s)</span>
          </div>
        </div>
        <div class="projects-library-Scenariste">
          <div 
            v-for="(episode, index) in paginatedEpisodes" 
            :key="episode.idEpisode" 
            class="movie-card-Scenariste" 
            :style="{'--index': index + 1}"
          >
            <!-- Header de la carte avec statut à gauche et actions à droite -->
            <div class="movie-card-header-Scenariste">
              <div class="movie-statut-Scenariste">
                <span class="statut-badge-Scenariste" :class="getStatutClass(episode.statutNom)">
                  {{ episode.statutNom }}
                </span>
              </div>
              <div class="movie-actions-Scenariste">
                <button class="action-btn-Scenariste edit-btn-Scenariste" @click.stop="startEditEpisode(episode)" title="Modifier">
                  <i class="fas fa-marker"></i>
                </button>
                <button class="action-btn-Scenariste delete-btn-Scenariste" @click.stop="confirmDeleteEpisode(episode.idEpisode)" title="Supprimer">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <!-- Contenu de la carte -->
            <div class="movie-info-Scenariste">
              <h3 class="movie-title-Scenariste">{{ episode.titre }}</h3>
              
              <div class="movie-synopsis" v-if="episode.synopsis">
                <p>{{ truncateText(episode.synopsis, 120) }}</p>
              </div>
                            
              <!-- Métadonnées côte à côte avec séparateur -->
              <div class="movie-meta-Scenariste">
                <i class="fas fa-list-ol"></i><span>Ordre: {{ episode.ordre }}</span>
                <span class="meta-separator-Scenariste">|</span>
                <i class="fas fa-calendar"></i><span>{{ formatShortDate(episode.creeLe) }}</span>
                <span class="meta-separator-Scenariste">|</span>
                <i class="fas fa-layer-group"></i><span>{{ episode.nombreSequences || 0 }} séquences</span>
              </div>
              
              <!-- Actions en bas de carte -->
              <div class="movie-actions-bottom-Scenariste">
                <div class="actions-top-Scenariste">
                  <button class="action-btn-Scenariste accent-btn" @click="goToDetails(episode.idEpisode)" title="Détails">
                    <i class="fas fa-info-circle icon"></i>
                    <span>Détails</span>
                  </button>
                  <button class="action-btn-Scenariste primary-btn" @click="goToAddSequence(episode.idEpisode)" title="Ajouter séquence">
                    <i class="fas fa-plus"></i>
                    <span>Séquence</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

          <div v-if="shouldShowLoadMore" class="load-more-container">
                    <button class="load-more-btn" @click="loadMoreEpisodes">
                      <i class="fas fa-chevron-down"></i>
                      Voir plus d'épisodes ({{ filteredEpisodes.length - paginatedEpisodes.length }} restant(s))
                    </button>
          </div>

        <!-- Message si aucun épisode -->
        <div v-if="filteredEpisodes.length === 0" class="no-projects-Scenariste">
          <div class="no-projects-icon-Scenariste">
            <i class="fas fa-list-alt"></i>
          </div>
          <h3>Aucun épisode trouvé</h3>
          <p>Commencez par créer votre premier épisode !</p>
          <button class="add-project-btn-large-Scenariste" @click="goToAddEpisode">
            <i class="fas fa-plus-circle"></i>
            Créer un épisode
          </button>
        </div>

          <!-- Modal d'édition d'épisode -->
          <div v-if="showEditModal" class="edit-project-modal-Scenariste">
            <div class="modal-content-Scenariste">
              <div class="modal-header-Scenariste">
                <h3>Modifier l'épisode</h3>
                <button @click="closeEditModal" class="close-modal-btn-Scenariste">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="modal-body-Scenariste episode-edit-modal">
                <!-- Message d'erreur principal -->
                <div v-if="editError" class="error-message-Scenariste">
                  {{ editError }}
                </div>
                
                <div class="form-rows-container-Scenariste">
                  <!-- Ligne 1 : Titre + Ordre (côte à côte) -->
                  <div class="form-row-Scenariste">
                    <div class="form-group-Scenariste form-half-width-Scenariste">
                      <label>Titre:</label>
                      <input v-model="editingEpisode.titre" type="text" class="form-input-Scenariste" required>
                    </div>
                    
                    <div class="form-group-Scenariste form-half-width-Scenariste">
                      <label>Ordre:</label>
                      <input 
                        v-model="editingEpisode.ordre" 
                        type="number" 
                        class="form-input-Scenariste"
                        :class="{ 'error-input': orderError }"
                        @blur="validateOrder"
                        required
                      >
                      <!-- Message d'erreur pour l'ordre -->
                      <div v-if="orderError" class="order-error">
                        {{ orderError }}
                      </div>
                      <div v-if="suggestedOrder && !editingEpisode.ordre" class="suggestion-text">
                        Suggestion: Le prochain ordre disponible est {{ suggestedOrder }}
                        <button type="button" @click="useSuggestedOrder" class="suggestion-btn-projet-scenariste">
                          Utiliser cette valeur
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Ligne 2 : Statut (pleine largeur) -->
                  <div class="form-row-Scenariste">
                    <div class="form-group-Scenariste form-full-width-Scenariste">
                      <label>Statut:</label>
                      <select v-model="editingEpisode.statutId" class="form-select-Scenariste" required>
                        <option value="">Sélectionnez un statut</option>
                        <option v-for="statut in statutsEpisode" :key="statut.idStatutEpisode" :value="statut.idStatutEpisode">
                          {{ statut.nomStatutsEpisode }}
                        </option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Ligne 3 : Synopsis (pleine largeur) -->
                  <div class="form-row-Scenariste">
                    <div class="form-group-Scenariste form-full-width-Scenariste">
                      <label>Synopsis:</label>
                      <textarea v-model="editingEpisode.synopsis" class="form-textarea-Scenariste" rows="4" required></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="modal-footer-Scenariste">
                <button @click="closeEditModal" class="cancel-btn-Scenariste">Annuler</button>
                <button @click="saveEditedEpisode" :disabled="orderError !== '' || editLoading" class="save-btn-Scenariste">
                  <span v-if="editLoading">Enregistrement...</span>
                  <span v-else>Enregistrer</span>
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="delete-confirmation-modal-Scenariste">
      <div class="modal-overlay-Scenariste" @click="closeDeleteModal"></div>
      <div class="modal-content-confirm-Scenariste">
        <div class="modal-header-confirm-Scenariste">
          <h3><i class="fas fa-exclamation-triangle"></i> Confirmation de suppression</h3>
          <button @click="closeDeleteModal" class="close-modal-btn-Scenariste">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-confirm-Scenariste">
          <div class="warning-icon-Scenariste">
            <i class="fas fa-trash"></i>
          </div>
          <p class="warning-text-Scenariste">
            Êtes-vous sûr de vouloir supprimer l'épisode <strong>"{{ episodeToDelete?.titre }}"</strong> ?
          </p>
          <p class="warning-subtext-Scenariste">
            Cette action est irréversible. Toutes les séquences associées à cet épisode seront également supprimées.
          </p>
        </div>
        
        <div class="modal-footer-confirm-Scenariste">
          <button @click="closeDeleteModal" class="cancel-confirm-btn-Scenariste">
            <i class="fas fa-times"></i> Annuler
          </button>
          <button @click="executeDeleteEpisode" class="delete-confirm-btn-Scenariste" :disabled="isDeleting">
            <span v-if="isDeleting">Suppression...</span>
            <span v-else>Supprimer définitivement</span>
          </button>
        </div>
      </div>
    </div>
      <!-- Notification de succès/erreur -->
     <div v-if="notification.show" :class="['message-crea-profile', notification.type]" @click="hideNotification">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ notification.message }}
      <button class="message-close-crea-profile" @click.stop="hideNotification">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      projet: {},
      episodes: [],
      statutsEpisode: [],
      filterTimePeriod: 'all',
      filterStatut: '',
      showEditModal: false,
      editingEpisode: {
        idEpisode: null,
        titre: '',
        synopsis: '',
        ordre: null,
        statutId: null,
      },
     editError: '',
    orderError: '', 
    suggestedOrder: null, 
    existingOrders: [],
    originalOrder: null,
    showDeleteModal: false,
    episodeToDelete: null,
    isDeleting: false,
    deleteError: '' ,
      notification: {
      show: false,
      message: '',
      type: 'success' // 'success' ou 'error'
    },
    notificationTimeout: null,
     editLoading: false, 
     itemsPerPage: 6, // Afficher 6 épisodes initialement (2 lignes de 3)
    showLoadMore: false

    };
  },
  computed: {
    userInitials() {
      if (!this.user?.nom) return '';
      const names = this.user.nom.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    },
    filteredEpisodes() {
      let filtered = this.episodes;
      // Filtrer par statut
      if (this.filterStatut) {
        filtered = filtered.filter(episode => episode.statutNom === this.filterStatut);
      }

      // Filtrer par période
      const now = new Date();
      filtered = filtered.filter(episode => {
        const modifieLe = new Date(episode.modifieLe);
        switch (this.filterTimePeriod) {
          case 'today':
            return modifieLe.toDateString() === now.toDateString();
          case 'this_week':
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            return modifieLe >= oneWeekAgo;
          case 'this_month':
            return modifieLe.getMonth() === now.getMonth() && modifieLe.getFullYear() === now.getFullYear();
          case 'this_year':
            return modifieLe.getFullYear() === now.getFullYear();
          case 'recent':
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);
            return modifieLe >= sevenDaysAgo;
          default:
            return true;
        }
      });

      return filtered;
    },

    paginatedEpisodes() {
      return this.filteredEpisodes.slice(0, this.itemsPerPage);
    },
    // Computed pour savoir s'il faut afficher le bouton "Voir plus"
    shouldShowLoadMore() {
      return this.filteredEpisodes.length > this.itemsPerPage;
    }
  },
  async created() {
    await this.loadProjet();
    await this.loadEpisodes();
    await this.loadStatutsEpisode();
  },
  methods: {
    getStatutClass(statutNom) {
      if (!statutNom) return '';
      
      const statut = statutNom.toLowerCase();
      if (statut.includes('en cours') || statut.includes('actif')) {
        return 'statut-en-cours';
      } else if (statut.includes('terminé') || statut.includes('complet')) {
        return 'statut-termine';
      } else if (statut.includes('attente') || statut.includes('en attente')) {
        return 'statut-attente';
      } else if (statut.includes('annulé') || statut.includes('abandonné')) {
        return 'statut-annule';
      } else if (statut.includes('planifié') || statut.includes('planification')) {
        return 'statut-planifie';
      } else {
        return 'statut-attente';
      }
    },
    async loadProjet() {
      try {
        const response = await axios.get(`/api/projets/${this.$route.params.id}`);
        this.projet = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
      }
    },
    async loadEpisodes() {
      try {
        const response = await axios.get(`/api/episodes/projet/${this.$route.params.id}`);
        this.episodes = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des épisodes:', error);
      }
    },
    async loadStatutsEpisode() {
      try {
        const response = await axios.get('/api/statuts-episode');
        this.statutsEpisode = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      }
    }, 
    startEditEpisode(episode) {
      this.editingEpisode = {
        idEpisode: episode.idEpisode,
        titre: episode.titre,
        synopsis: episode.synopsis,
        ordre: episode.ordre,
        statutId: this.getStatutIdByNom(episode.statutNom),
      };
      this.originalOrder = episode.ordre;
      this.showEditModal = true;
      
      this.loadExistingOrders();
    },
    async loadExistingOrders() {
      try {
        const response = await axios.get(`/api/episodes/projet/${this.$route.params.id}`);
        
        this.existingOrders = response.data
          .filter(episode => episode.idEpisode !== this.editingEpisode.idEpisode)
          .map(episode => episode.ordre);
        
        this.calculateSuggestedOrder();
      } catch (error) {
        console.error('Erreur lors du chargement des ordres existants:', error);
      }
    },
    calculateSuggestedOrder() {
      if (this.existingOrders.length === 0) {
        this.suggestedOrder = 1;
      } else {
        const maxOrder = Math.max(...this.existingOrders);
        this.suggestedOrder = maxOrder + 1;
      }
    },
    validateOrder() {
      if (!this.editingEpisode.ordre) {
        this.orderError = 'L\'ordre est requis';
        return;
      }
      
      const orderNum = parseInt(this.editingEpisode.ordre);
      
      if (orderNum < 1) {
        this.orderError = 'L\'ordre doit être un nombre positif';
        return;
      }
      
      if (this.existingOrders.includes(orderNum) && orderNum !== this.originalOrder) {
        this.orderError = `L'ordre ${orderNum} existe déjà pour ce projet. Veuillez choisir un autre numéro.`;
        return;
      }
      
      this.orderError = '';
    },
    useSuggestedOrder() {
      this.editingEpisode.ordre = this.suggestedOrder;
      this.validateOrder();
    },

     loadMoreEpisodes() {
        // Augmente le nombre d'épisodes affichés par 6 (une nouvelle ligne)
        this.itemsPerPage += 6;
      },
      
      resetPagination() {
        // Réinitialise la pagination quand les filtres changent
        this.itemsPerPage = 6;
      },
  
    getStatutIdByNom(nom) {
      const statut = this.statutsEpisode.find(s => s.nomStatutsEpisode === nom);
      return statut ? statut.idStatutEpisode : null;
    },
  async saveEditedEpisode() {
        this.validateOrder();
    if (this.orderError) {
      return;
    }
  
   this.editLoading = true; 
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        this.editError = 'Utilisateur non connecté';
        this.showNotification('Utilisateur non connecté', 'error');
        return;
      }

      const response = await axios.put(`/api/episodes/${this.editingEpisode.idEpisode}`, {
        titre: this.editingEpisode.titre,
        synopsis: this.editingEpisode.synopsis,
        ordre: parseInt(this.editingEpisode.ordre),
        statutId: this.editingEpisode.statutId,
      }, {
        headers: {
          'X-User-Id': user.id
        }
      });
      
      this.showEditModal = false;
      this.editError = '';
      this.orderError = '';
      await this.loadEpisodes();
      
      // Notification de succès pour la modification
      // this.showNotification('Épisode modifié avec succès !', 'success');
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l épisode:', error);
      
      if (error.response?.status === 403) {
        this.showNotification('Modification refusée. Vous n\'avez pas les droits nécessaires.', 'error');
      } else if (error.response?.status === 400 && 
          error.response?.data?.message?.includes('ordre')) {
        this.orderError = 'Cet ordre existe déjà pour ce projet. Veuillez choisir un autre numéro.';
        this.editError = 'Erreur de validation: ' + this.orderError;
        this.showNotification(this.orderError, 'error');
      } else if (error.response?.status === 401) {
        this.editError = 'Session expirée. Veuillez vous reconnecter.';
        this.showNotification('Session expirée. Veuillez vous reconnecter.', 'error');
      } else {
        this.editError = error.response?.data?.message || 'Erreur lors de la mise à jour de l\'épisode';
        this.showNotification(this.editError, 'error');
      }
    } finally {
      this.editLoading = false;
    }
  },
closeEditModal() {
  this.showEditModal = false;
  this.editingEpisode = {
    idEpisode: null,
    titre: '',
    synopsis: '',
    ordre: null,
    statutId: null,
  };
  this.editError = '';
  this.orderError = '';
  this.suggestedOrder = null;
  this.existingOrders = [];
  this.originalOrder = null;
  this.hideNotification(); 
},
    async confirmDeleteEpisode(episodeId) {
      const episode = this.episodes.find(ep => ep.idEpisode === episodeId);
      if (!episode) return;
      
      this.episodeToDelete = episode;
      this.showDeleteModal = true;
      this.deleteError = '';
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.episodeToDelete = null;
      this.isDeleting = false;
      this.deleteError = '';
    },

     showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message: message,
        type: type
      };
      
      // Annuler le timeout précédent s'il existe
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      
      // Masquer automatiquement après 5 secondes
      this.notificationTimeout = setTimeout(() => {
        this.hideNotification();
      }, 5000);
    },
    
    hideNotification() {
      this.notification.show = false;
      this.notification.message = '';
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = null;
      }
    },
    
    // Mettez à jour la méthode showSuccessNotification existante :
    showSuccessNotification(message) {
      this.showNotification(message, 'success');
    },

    async executeDeleteEpisode() {
    if (!this.episodeToDelete) return;
    
    this.isDeleting = true;
    this.deleteError = '';
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        this.deleteError = 'Utilisateur non connecté';
        this.showNotification('Utilisateur non connecté', 'error');
        this.isDeleting = false;
        return;
      }

      await axios.delete(`/api/episodes/${this.episodeToDelete.idEpisode}`, {
        headers: {
          'X-User-Id': user.id
        }
      });
      
      await this.loadEpisodes();
      this.closeDeleteModal();
      
      // Notification de succès
      this.showNotification('Épisode supprimé avec succès !', 'success');
      
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'épisode:', error);
      
      let errorMessage = 'Erreur lors de la suppression de l\'épisode';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Suppression refusée. Vous n\'avez pas les droits nécessaires pour supprimer cet épisode.';
        } else if (error.response.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          errorMessage = error.response.data?.message || `Erreur serveur (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion.';
      }
      
      this.deleteError = errorMessage;
      this.showNotification(errorMessage, 'error');
      this.isDeleting = false;
    }
  },
    goToAddEpisode() {
      this.$router.push(`/projet/${this.$route.params.id}/add-episode`);
    },
    goToDetails(episodeId) {
      this.$router.push(`/episode/${episodeId}/detail-episode`);
    },
    goToAddSequence(episodeId) {
      this.$router.push(`/episode/${episodeId}/add-sequence`);
    },
    goBack() {
      this.$router.push('/scenariste');
    },
    formatDate(date) {
      if (!date) return 'Non spécifié';
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },
    formatShortDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    },
    truncateText(text, length) {
      if (!text) return '';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    },
  },
};
</script>