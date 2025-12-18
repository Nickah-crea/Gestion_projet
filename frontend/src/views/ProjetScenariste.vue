<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale -->
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
            class="sidebar-btn-projet-scenariste"
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
        
        <!-- En-tête principal -->
        <!-- <div class="main-header-projet-scenariste">
          <h1 class="page-title-projet-scenariste"><i class="fas fa-film"></i> Détails du Projet</h1>
          <p class="page-subtitle-projet-scenariste">Gérez les épisodes et détails de votre projet</p>
        </div> -->

        <!-- Détails du projet -->
        <div class="project-details-projet-scenariste">
          <div class="project-info-projet-scenariste">
            <div class="project-main-projet-scenariste">
              <h3>{{ projet.titre }}</h3>
              <div class="project-synopsis-projet-scenariste">
                <h4>Synopsis</h4>
                <p>{{ projet.synopsis || 'Aucun synopsis disponible' }}</p>
              </div>
            </div>
            
            <div class="project-sidebar-projet-scenariste">
              <div class="project-statut-projet-scenariste">
                <span class="statut-label">Statut:</span>
                <span class="statut-value">{{ projet.statutNom }}</span>
              </div>
              <div class="project-date-projet-scenariste">
                <span class="date-label">Créé le:</span>
                <span class="date-value">{{ formatDate(projet.creeLe) }}</span>
              </div>
              <div class="project-date-projet-scenariste">
                <span class="date-label">Modifié le:</span>
                <span class="date-value">{{ formatDate(projet.modifieLe) }}</span>
              </div>
              <div class="project-date-projet-scenariste" v-if="projet.dateFin">
                <span class="date-label">Terminé le:</span>
                <span class="date-value">{{ formatDate(projet.dateFin) }}</span>
              </div>
              <div class="project-genre-projet-scenariste">
                <span class="genre-label">Genre:</span>
                <span class="genre-value">{{ projet.genreNom }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section épisodes -->
        <div class="episodes-section-projet-scenariste">
          <div class="section-header-projet-scenariste">
            <h3>Épisodes</h3>
          </div>

          <!-- Liste des épisodes -->
          <div class="episodes-list-projet-scenariste">
            <div v-for="episode in filteredEpisodes" :key="episode.idEpisode" class="episode-card-projet-scenariste">
              <div class="episode-header-projet-scenariste">
                <div class="episode-statut-projet-scenariste status-badge-projet-scenariste" :class="getStatutBadgeClass(episode.statutNom)">
                  {{ episode.statutNom }}
                </div>
                <div class="episode-actions-projet-scenariste">
                  <i class="fas fa-pencil-alt icon-edit-projet-scenariste" @click="startEditEpisode(episode)"></i>
                  <i class="fas fa-trash-alt icon-delete-projet-scenariste" @click="confirmDeleteEpisode(episode.idEpisode)"></i>
                </div>
              </div>
              
              <div class="episode-content-projet-scenariste">
                <h4>{{ episode.titre }}</h4>
                <p class="episode-order-projet-scenariste">Ordre: {{ episode.ordre }}</p>
                
                <div class="episode-dates-projet-scenariste">
                  <p>Créé le: {{ formatDate(episode.creeLe) }}</p>
                  <p>Modifié le: {{ formatDate(episode.modifieLe) }}</p>
                  <p>Nombre de séquences: {{ episode.nombreSequences || 0 }}</p>
                </div>
                
                <div class="episode-synopsis-projet-scenariste" v-if="episode.synopsis">
                  <p>{{ truncateText(episode.synopsis, 100) }}</p>
                </div>
                
                <div class="episode-footer-projet-scenariste">
                  <button class="details-btn-projet-scenariste" @click="goToDetails(episode.idEpisode)">Détails</button>
                  <button class="add-sequence-btn-projet-scenariste" @click="goToAddSequence(episode.idEpisode)">+ Séquence</button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Modale pour modifier l'épisode -->
        <div v-if="showEditModal" class="modal-overlay-projet-scenariste" @click="closeEditModal">
          <div class="modal-content-projet-scenariste" @click.stop>
            <div class="modal-header-projet-scenariste">
              <h3>Modifier l'Épisode</h3>
              <button class="modal-close-btn-projet-scenariste" @click="closeEditModal">×</button>
            </div>
            
            <div class="modal-body-projet-scenariste">
              <!-- Message d'erreur général -->
              <div v-if="editError" class="error-message">
                {{ editError }}
              </div>
              
              <form @submit.prevent="saveEditedEpisode">
                <div class="form-group-projet-scenariste">
                  <label>Titre de l'épisode:</label>
                  <input v-model="editingEpisode.titre" type="text" required class="form-input-projet-scenariste"/>
                </div>
                <div class="form-group-projet-scenariste">
                  <label>Synopsis:</label>
                  <textarea v-model="editingEpisode.synopsis" required class="form-input-projet-scenariste"></textarea>
                </div>
                <div class="form-group-projet-scenariste">
                  <label>Ordre dans le projet:</label>
                  <input 
                    v-model="editingEpisode.ordre" 
                    type="number" 
                    required 
                    :class="{ 'error-input': orderError }"
                    @blur="validateOrder"
                    class="form-input-projet-scenariste"
                  />
                  <!-- Message d'erreur spécifique pour l'ordre -->
                  <div v-if="orderError" class="error-text">
                    {{ orderError }}
                  </div>
                  <!-- Suggestion d'ordre -->
                  <div v-if="suggestedOrder && !editingEpisode.ordre" class="suggestion-text">
                    Suggestion: Le prochain ordre disponible est {{ suggestedOrder }}
                    <button type="button" @click="useSuggestedOrder" class="suggestion-btn-projet-scenariste">
                      Utiliser cette valeur
                    </button>
                  </div>
                </div>
                <div class="form-group-projet-scenariste">
                  <label>Titre du projet:</label>
                  <input :value="projet.titre" type="text" disabled class="form-input-projet-scenariste"/>
                </div>
                <div class="form-group-projet-scenariste">
                  <label>Statut:</label>
                  <select v-model="editingEpisode.statutId" required class="form-input-projet-scenariste">
                    <option v-for="statut in statutsEpisode" :key="statut.idStatutEpisode" :value="statut.idStatutEpisode">
                      {{ statut.nomStatutsEpisode }}
                    </option>
                  </select>
                </div>
                <div class="modal-actions-projet-scenariste">
                  <button type="submit" class="save-btn-projet-scenariste" :disabled="orderError !== ''">Sauvegarder</button>
                  <button type="button" @click="closeEditModal" class="cancel-btn-projet-scenariste">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// import '../assets/css/projet_scenariste.css'; // Remplacer par l'import SCSS si nécessaire

export default {
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      showProfileMenu: false,
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
      originalOrder: null 
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
  },
  async created() {
    await this.loadProjet();
    await this.loadEpisodes();
    await this.loadStatutsEpisode();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    getStatutBadgeClass(statutNom) {
      return `status-${statutNom.toLowerCase().replace(/\s+/g, '-')}-projet-scenariste`;
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
      this.originalOrder = episode.ordre; // Sauvegarder l'ordre original
      this.showEditModal = true;
      
      // Charger les ordres existants et calculer la suggestion
      this.loadExistingOrders();
    },
     async loadExistingOrders() {
      try {
        // Récupérer tous les épisodes du projet
        const response = await axios.get(`/api/episodes/projet/${this.$route.params.id}`);
        
        // Filtrer les ordres existants (exclure l'épisode en cours d'édition)
        this.existingOrders = response.data
          .filter(episode => episode.idEpisode !== this.editingEpisode.idEpisode)
          .map(episode => episode.ordre);
        
        // Calculer le prochain ordre disponible
        this.calculateSuggestedOrder();
      } catch (error) {
        console.error('Erreur lors du chargement des ordres existants:', error);
      }
    },
    
    calculateSuggestedOrder() {
      if (this.existingOrders.length === 0) {
        this.suggestedOrder = 1;
      } else {
        // Trouver le plus grand ordre existant et ajouter 1
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
      
      // Vérifier si l'ordre existe déjà (sauf si c'est l'ordre original de cet épisode)
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

    getStatutIdByNom(nom) {
      const statut = this.statutsEpisode.find(s => s.nomStatutsEpisode === nom);
      return statut ? statut.idStatutEpisode : null;
    },
    async saveEditedEpisode() {
  // Valider l'ordre avant soumission
  this.validateOrder();
  if (this.orderError) {
    return;
  }
  
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      this.editError = 'Utilisateur non connecté';
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
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l épisode:', error);
    
    if (error.response?.status === 403) {
      this.editError = 'Modification refusée. Vous n\'avez pas les droits nécessaires pour accéder à cet épisode.';
    } else if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('ordre')) {
      this.orderError = 'Cet ordre existe déjà pour ce projet. Veuillez choisir un autre numéro.';
      this.editError = 'Erreur de validation: ' + this.orderError;
    } else {
      this.editError = error.response?.data?.message || 'Erreur lors de la mise à jour de l\'épisode';
    }
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
    },
    async confirmDeleteEpisode(episodeId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet épisode ?')) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        alert('Utilisateur non connecté');
        return;
      }

      await axios.delete(`/api/episodes/${episodeId}`, {
        headers: {
          'X-User-Id': user.id
        }
      });
      await this.loadEpisodes();
      alert('Épisode supprimé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'épisode:', error);
      alert('Erreur lors de la suppression de l\'épisode: ' + (error.response?.data?.message || error.message));
    }
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
      return new Date(date).toLocaleString();
    },
    truncateText(text, length) {
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
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
  },
};
</script>