<!-- AddEpisode.vue - Version modifiée avec sidebar -->
<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-add-episode">
      <div class="sidebar-header-add-episode">
        <h2 class="sidebar-title-add-episode">Gestion des Épisodes</h2>
        <p class="sidebar-subtitle-add-episode">Créez et gérez vos épisodes</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-add-episode">
        <h3 class="section-title-add-episode"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-add-episode">
          <button 
            @click="goToForm" 
            class="sidebar-btn-add-episode" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouvel épisode
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-add-episode"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-add-episode">
        <h3 class="section-title-add-episode"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-add-episode">
          <div class="filter-item-add-episode">
            <label for="projetFilterSidebar">Projet</label>
            <select 
              id="projetFilterSidebar" 
              v-model="selectedProjetFilter" 
              @change="filterEpisodes"
              class="filter-select-add-episode"
            >
              <option value="">Tous les projets</option>
              <option v-for="projet in userProjets" :key="projet.id" :value="projet.id">
                {{ projet.titre }}
              </option>
            </select>
          </div>
          
          <div class="filter-item-add-episode">
            <label for="statutFilterSidebar">Statut</label>
            <select 
              id="statutFilterSidebar" 
              v-model="selectedStatutFilter" 
              @change="filterEpisodes"
              class="filter-select-add-episode"
            >
              <option value="">Tous les statuts</option>
              <option v-for="statut in statutsEpisode" :key="statut.idStatutEpisode" :value="statut.idStatutEpisode">
                {{ statut.nomStatutsEpisode }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-add-episode">
        <h3 class="section-title-add-episode"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-add-episode">
          <div class="stat-item-add-episode">
            <span class="stat-number-add-episode">{{ filteredEpisodes.length }}</span>
            <span class="stat-label-add-episode">Total épisodes</span>
          </div>
          <div class="stat-item-add-episode">
            <span class="stat-number-add-episode">{{ getActiveEpisodesCount }}</span>
            <span class="stat-label-add-episode">Actifs</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-add-episode">
      <div class="creation-main-content-add-episode">
        
        <!-- Système d'onglets -->
        <div class="tabs-container-add-episode">
          <div class="tabs-header-add-episode">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-add-episode', { active: activeTab === 'form' }]"
            >
              <i class="fas fa-plus"></i>
              Créer un épisode
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-add-episode', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste des épisodes
            </button>
          </div>
          
          <div class="tabs-content-add-episode">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-add-episode" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-add-episode">
              <!-- En-tête de formulaire -->
              <div class="form-header-add-episode">
                <h3>
                  <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
                  {{ isEditing ? 'Modifier l\'épisode' : 'Créer un nouvel épisode' }}
                </h3>
              </div>

              <!-- Formulaire de création/édition -->
              <form @submit.prevent="submitForm" class="episode-form-add-episode">
                <div class="form-row-add-episode">
                  <div class="form-group-add-episode">
                    <label for="titre">Titre de l'épisode *</label>
                    <input 
                      type="text" 
                      id="titre"
                      v-model="form.titre" 
                      required 
                      placeholder="Entrez le titre"
                      class="form-input-add-episode"
                    />
                  </div>

                  <div class="form-group-add-episode">
                    <label for="ordre">Ordre dans le projet *</label>
                    <input 
                      type="number" 
                      id="ordre"
                      v-model="form.ordre" 
                      required 
                      placeholder="Entrez le nombre"
                      min="1"
                      class="form-input-add-episode"
                      :class="{ 'error-input': ordreError }"
                      @blur="validateOrdre"
                      :disabled="isEditing"
                    />
                    <span v-if="ordreError" class="error-text-add-episode">{{ ordreError }}</span>
                    <span v-if="suggestedOrdre && !isEditing" class="suggestion-text-add-episode">
                      Suggestion: Le prochain ordre disponible est {{ suggestedOrdre }}
                      <button type="button" @click="useSuggestedOrder" class="suggestion-btn-add-episode">
                        Utiliser cette valeur
                      </button>
                    </span>
                    <span v-if="isEditing" class="info-text-add-episode">
                      L'ordre ne peut pas être modifié pour un épisode existant.
                    </span>
                  </div>
                </div>

                <div class="form-row-add-episode">
                  <div class="form-group-add-episode">
                    <label for="realisateur">Réalisateur *</label>
                    <select 
                      id="realisateur"
                      v-model="form.realisateurId" 
                      :required="!isEditing"
                      :disabled="isEditing"
                      class="form-select-add-episode"
                    >
                      <option value="">Sélectionner un réalisateur</option>
                      <option v-for="realisateur in realisateurs" :key="realisateur.idRealisateur" :value="realisateur.idRealisateur">
                        {{ realisateur.nom }} - {{ realisateur.specialite }}
                      </option>
                    </select>
                    <span v-if="isEditing" class="info-text-add-episode">
                      Le réalisateur ne peut pas être modifié pour un épisode existant.
                    </span>
                  </div>

                  <div class="form-group-add-episode">
                    <label for="scenariste">Scénariste *</label>
                    <select 
                      id="scenariste"
                      v-model="form.scenaristeId" 
                      :required="!isEditing"
                      :disabled="isEditing"
                      class="form-select-add-episode"
                    >
                      <option value="">Sélectionner un scénariste</option>
                      <option v-for="scenariste in scenaristes" :key="scenariste.idScenariste" :value="scenariste.idScenariste">
                        {{ scenariste.nom }} - {{ scenariste.specialite }}
                      </option>
                    </select>
                    <span v-if="isEditing" class="info-text-add-episode">
                      Le scénariste ne peut pas être modifié pour un épisode existant.
                    </span>
                  </div>
                </div>

                <div class="form-row-add-episode">
                  <div class="form-group-add-episode">
                    <label for="projet">Titre du projet *</label>
                    <div class="search-container-add-episode">
                      <input
                        type="text"
                        id="projetSearch"
                        v-model="projetSearch"
                        @input="filterProjets"
                        @focus="showProjetSuggestions = true"
                        placeholder="Rechercher un projet..."
                        class="search-input-add-episode"
                        required
                        :disabled="isEditing"
                      />
                      <div v-if="showProjetSuggestions && !isEditing" class="projet-suggestions-add-episode">
                        <div v-for="projet in filteredProjets" :key="projet.id" 
                             @click="selectProjet(projet)" 
                             class="suggestion-item-add-episode">
                          {{ projet.titre }}
                        </div>
                      </div>
                    </div>
                    <input type="hidden" v-model="form.projetId" required />
                    <span v-if="isEditing" class="info-text-add-episode">
                      Le projet ne peut pas être modifié pour un épisode existant.
                    </span>
                  </div>

                  <div class="form-group-add-episode">
                    <label for="statut">Statut *</label>
                    <select 
                      id="statut"
                      v-model="form.statutId" 
                      required
                      class="form-select-add-episode"
                    >
                      <option value="">Sélectionner le statut</option>
                      <option v-for="statut in statutsEpisode" :key="statut.idStatutEpisode" :value="statut.idStatutEpisode">
                        {{ statut.nomStatutsEpisode }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-group-add-episode">
                  <label for="synopsis">Synopsis</label>
                  <textarea 
                    id="synopsis"
                    v-model="form.synopsis" 
                    rows="6"
                    placeholder="Entrez le synopsis..."
                    class="form-textarea-add-episode"
                  ></textarea>
                </div>

                <div v-if="errorMessage" class="error-message-add-episode">
                  <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
                </div>

                <div class="form-actions-add-episode">
                  <button type="button" @click="cancelEdit" class="cancel-btn-add-episode">
                    <i class="fas fa-times"></i>
                    {{ isEditing ? 'Annuler' : 'Annuler' }}
                  </button>
                  <button type="submit" class="submit-btn-add-episode" :disabled="loading || ordreError !== ''">
                    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                    <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer l\'épisode') }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Contenu de l'onglet Liste -->
            <div v-show="activeTab === 'list'" class="tab-pane-add-episode">
              <!-- Liste des épisodes -->
              <div class="episodes-list-add-episode">
                <div class="list-header-add-episode">
                  <h3><i class="fas fa-film"></i> Liste de mes épisodes ({{ filteredEpisodes.length }})</h3>
                  
                  <div class="search-section-add-episode">
                    <div class="search-group-add-episode">
                      <label for="episodeSearch">Rechercher un épisode</label>
                      <div class="search-input-container-add-episode">
                        <i class="fas fa-search search-icon-add-episode"></i>
                        <input
                          type="text"
                          id="episodeSearch"
                          v-model="episodeSearch"
                          @input="filterEpisodes"
                          placeholder="Rechercher par titre, projet ou statut..."
                          class="search-input-large-add-episode"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loadingEpisodes" class="loading-state-add-episode">
                  <i class="fas fa-spinner fa-spin"></i> Chargement...
                </div>
                
                <div v-else-if="filteredEpisodes.length === 0" class="empty-state-add-episode">
                  <i class="fas fa-film"></i>
                  <div v-if="episodeSearch || selectedProjetFilter || selectedStatutFilter">
                    Aucun épisode ne correspond à vos critères de recherche.
                  </div>
                  <div v-else>
                    Aucun épisode créé pour le moment.
                  </div>
                </div>

                <div v-else class="episodes-table-container-add-episode">
                  <table class="episodes-table-add-episode">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Projet</th>
                        <th>Ordre</th>
                        <th>Réalisateur</th>
                        <th>Statut</th>
                        <th>Date création</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="episode in filteredEpisodes" :key="episode.idEpisode">
                        <td>
                          <strong>{{ episode.titre }}</strong>
                        </td>
                        <td>{{ episode.projetTitre }}</td>
                        <td>#{{ episode.ordre }}</td>
                        <td>
                          <span v-if="episode.realisateurNom" class="realisateur-assigne-add-episode">
                            <i class="fas fa-user"></i>
                            {{ episode.realisateurNom }}
                          </span>
                          <span v-else class="no-realisateur-add-episode">
                            <i class="fas fa-user-slash"></i>
                            Non assigné
                          </span>
                        </td>
                        <td>
                          <div class="episode-status-add-episode" :class="getStatusClass(episode.statutNom)">
                            <i :class="getStatusIcon(episode.statutNom)"></i>
                            {{ episode.statutNom || 'Non défini' }}
                          </div>
                        </td>
                        <td>{{ formatDate(episode.creeLe) }}</td>
                        <td>
                          <div class="table-actions-add-episode">
                            <button @click="openDetailsModal(episode)" class="btn-view-add-episode" title="Voir détails">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button @click="editEpisode(episode)" class="btn-edit-add-episode" title="Modifier">
                              <i class="fas fa-marker"></i>
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
    <div v-if="showDetailsModal" class="modal-overlay-add-episode" @click="closeDetailsModal">
      <div class="modal-content-add-episode" @click.stop>
        <div class="modal-header-add-episode">
          <h3>
            <i class="fas fa-film"></i>
            Détails de l'épisode
          </h3>
          <button @click="closeDetailsModal" class="modal-close-btn-add-episode">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-add-episode" v-if="selectedEpisode">
          <div class="episode-details-add-episode">
            <!-- Informations principales -->
            <div class="detail-info-add-episode">
              <div class="detail-row-add-episode">
                <span class="detail-label-add-episode">Titre :</span>
                <span class="detail-value-add-episode">{{ selectedEpisode.titre }}</span>
              </div>
              
              <div class="detail-row-add-episode">
                <span class="detail-label-add-episode">Projet :</span>
                <span class="detail-value-add-episode">{{ selectedEpisode.projetTitre }}</span>
              </div>
              
              <div class="detail-row-add-episode">
                <span class="detail-label-add-episode">Ordre :</span>
                <span class="detail-value-add-episode">#{{ selectedEpisode.ordre }}</span>
              </div>
              
              <div class="detail-row-add-episode">
                <span class="detail-label-add-episode">Réalisateur :</span>
                <span class="detail-value-add-episode" v-if="selectedEpisode.realisateurNom">
                  <i class="fas fa-user"></i> {{ selectedEpisode.realisateurNom }}
                </span>
                <span class="detail-value-add-episode no-realisateur" v-else>
                  <i class="fas fa-user-slash"></i> Non assigné
                </span>
              </div>

              <div class="detail-row-add-episode">
                <span class="detail-label-add-episode">Scénariste :</span>
                <span class="detail-value-add-episode" v-if="selectedEpisode.scenaristeNom">
                  <i class="fas fa-user-edit"></i> {{ selectedEpisode.scenaristeNom }}
                </span>
                <span class="detail-value-add-episode no-scenariste" v-else>
                  <i class="fas fa-user-slash"></i> Non assigné
                </span>
              </div>
              
              <div class="detail-row-add-episode">
                <span class="detail-label-add-episode">Statut :</span>
                <span class="detail-value-add-episode">
                  <div class="episode-status-add-episode" :class="getStatusClass(selectedEpisode.statutNom)">
                    <i :class="getStatusIcon(selectedEpisode.statutNom)"></i>
                    {{ selectedEpisode.statutNom || 'Non défini' }}
                  </div>
                </span>
              </div>
              
              <div class="detail-row-add-episode">
                <span class="detail-label-add-episode">Date de création :</span>
                <span class="detail-value-add-episode">{{ formatDate(selectedEpisode.creeLe) }}</span>
              </div>
              
              <div class="detail-row-add-episode">
                <span class="detail-label-add-episode">Date de modification :</span>
                <span class="detail-value-add-episode">{{ formatDate(selectedEpisode.modifieLe) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Synopsis -->
          <div class="detail-synopsis-add-episode">
            <h4><i class="fas fa-file-alt"></i> Synopsis</h4>
            <div class="synopsis-content-add-episode">
              {{ selectedEpisode.synopsis || 'Aucun synopsis disponible' }}
            </div>
          </div>
        </div>
        
        <div class="modal-footer-add-episode">
          <button @click="editEpisode(selectedEpisode)" class="btn-edit-modal-add-episode">
            <i class="fas fa-marker"></i> Modifier
          </button>
          <button @click="goToEpisodeDetails(selectedEpisode)" class="btn-details-modal-add-episode">
            <i class="fas fa-external-link-alt"></i> Voir détails complets
          </button>
          <button @click="closeDetailsModal" class="btn-close-modal-add-episode">
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
  name: 'AddEpisodeView',
  data() {
    return {
      activeTab: 'form',
      showProfileMenu: false,
      user: null,
      projetSearch: '',
      showProjetSuggestions: false,
      filteredProjets: [],
      userProjets: [],
      statutsEpisode: [],
      existingOrders: [],
      realisateurs: [],
      scenaristes: [],
      
      // Épisodes de l'utilisateur
      userEpisodes: [],
      filteredEpisodes: [],
      loadingEpisodes: false,
      selectedProjetFilter: '',
      selectedStatutFilter: '',
      episodeSearch: '',
      
      // Formulaire
      form: {
        titre: '',
        ordre: '',
        projetId: this.$route.params.id || this.$route.params.projetId || '',
        statutId: '',
        synopsis: '',
        realisateurId: '',
        scenaristeId: ''
      },
      
      loading: false,
      errorMessage: '',
      ordreError: '',
      suggestedOrdre: null,
      
      // Modal de détails
      showDetailsModal: false,
      selectedEpisode: null,
      isEditing: false,
      editingId: null
    };
  },
  computed: {
    userInitials() {
      if (!this.user?.nom) return '?';
      return this.user.nom
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    
    getActiveEpisodesCount() {
      return this.userEpisodes.filter(ep => 
        ['en-cours', 'en-production', 'post-production'].includes(
          ep.statutNom?.toLowerCase().replace(/\s+/g, '-')
        )
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
    await this.loadUser();
    await this.fetchProjetDetails();
    await this.fetchStatutsEpisode();
    await this.fetchExistingEpisodes();
    await this.fetchRealisateurs();
    await this.fetchScenaristes();
    await this.loadUserProjets();
    await this.loadUserEpisodes();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    // Navigation entre onglets
    goToForm() {
      this.activeTab = 'form';
      this.isEditing = false;
      this.editingId = null;
      this.resetForm();
    },

    goToList() {
      this.activeTab = 'list';
      this.loadUserEpisodes();
    },
    
    async loadUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
      } else {
        this.$router.push('/');
      }
    },
    
    async loadUserProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.userProjets = response.data;
        this.filteredProjets = [...this.userProjets];
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      }
    },
    
    async fetchProjetDetails() {
      try {
        const projetId = this.$route.params.id || this.$route.params.projetId || this.$route.query.projetId;
        if (!projetId) {
          this.errorMessage = 'ID du projet non spécifié';
          return;
        }
        
        const response = await axios.get(`/api/projets/${projetId}`);
        this.projetSearch = response.data.titre;
        this.form.projetId = projetId;
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        this.errorMessage = 'Erreur lors du chargement des détails du projet. Veuillez réessayer.';
      }
    },
    
    filterProjets() {
      if (this.projetSearch.trim() === '') {
        this.filteredProjets = this.userProjets;
      } else {
        const searchTerm = this.projetSearch.toLowerCase();
        this.filteredProjets = this.userProjets.filter(projet =>
          projet.titre.toLowerCase().includes(searchTerm)
        );
      }
    },
    
    selectProjet(projet) {
      this.form.projetId = projet.id;
      this.projetSearch = projet.titre;
      this.showProjetSuggestions = false;
      this.fetchExistingEpisodes();
    },
    
    async fetchStatutsEpisode() {
      try {
        const response = await axios.get('/api/statuts-episode');
        this.statutsEpisode = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts d\'épisode:', error);
        this.errorMessage = 'Erreur lors du chargement des statuts';
      }
    },
    
    async fetchExistingEpisodes() {
      try {
        const projetId = this.form.projetId;
        if (!projetId) return;
        
        const response = await axios.get(`/api/episodes/projet/${projetId}`);
        this.existingOrders = response.data.map(episode => episode.ordre);
        this.calculateSuggestedOrdre();
      } catch (error) {
        console.error('Erreur lors du chargement des épisodes existants:', error);
      }
    },
    
    calculateSuggestedOrdre() {
      if (this.existingOrders.length === 0) {
        this.suggestedOrdre = 1;
        if (!this.isEditing) {
          this.form.ordre = 1;
        }
        return;
      }
      
      const maxOrder = Math.max(...this.existingOrders);
      this.suggestedOrdre = maxOrder + 1;
      if (!this.isEditing) {
        this.form.ordre = this.suggestedOrdre;
      }
    },
    
    async loadUserEpisodes() {
      if (!this.user?.id) return;
      
      this.loadingEpisodes = true;
      try {
        const response = await axios.get(`/api/episodes/utilisateur/${this.user.id}`);
        this.userEpisodes = response.data;
        this.filteredEpisodes = this.userEpisodes;
      } catch (error) {
        console.error('Erreur lors du chargement des épisodes utilisateur:', error);
      } finally {
        this.loadingEpisodes = false;
      }
    },
    
    filterEpisodes() {
      let filtered = this.userEpisodes;

      // Filtre par recherche texte
      if (this.episodeSearch.trim() !== '') {
        const searchTerm = this.episodeSearch.toLowerCase();
        filtered = filtered.filter(episode =>
          episode.titre.toLowerCase().includes(searchTerm) ||
          episode.projetTitre.toLowerCase().includes(searchTerm) ||
          (episode.statutNom && episode.statutNom.toLowerCase().includes(searchTerm)) ||
          (episode.realisateurNom && episode.realisateurNom.toLowerCase().includes(searchTerm)) ||
          (episode.scenaristeNom && episode.scenaristeNom.toLowerCase().includes(searchTerm))
        );
      }

      // Filtre par projet
      if (this.selectedProjetFilter !== '') {
        filtered = filtered.filter(episode => 
          episode.projetId == this.selectedProjetFilter
        );
      }

      // Filtre par statut
      if (this.selectedStatutFilter !== '') {
        filtered = filtered.filter(episode => 
          episode.statutId == this.selectedStatutFilter
        );
      }

      this.filteredEpisodes = filtered;
    },
    
    validateOrdre() {
      if (!this.form.ordre) {
        this.ordreError = 'L\'ordre est requis';
        return;
      }
      
      const orderNum = parseInt(this.form.ordre);
      
      if (orderNum < 1) {
        this.ordreError = 'L\'ordre doit être au moins 1';
        return;
      }
      
      // Pour l'édition, on vérifie seulement si l'ordre a changé et s'il existe déjà
      if (this.isEditing) {
        const originalEpisode = this.userEpisodes.find(ep => ep.idEpisode === this.editingId);
        if (originalEpisode && orderNum !== originalEpisode.ordre) {
          if (this.existingOrders.includes(orderNum)) {
            this.ordreError = `L'ordre ${orderNum} existe déjà pour ce projet. Veuillez choisir un autre numéro.`;
            return;
          }
        }
      } else {
        // Pour la création, vérifier si l'ordre existe déjà
        if (this.existingOrders.includes(orderNum)) {
          this.ordreError = `L'ordre ${orderNum} existe déjà pour ce projet. Veuillez choisir un autre numéro.`;
          return;
        }
      }
      
      this.ordreError = '';
    },
    
    useSuggestedOrder() {
      this.form.ordre = this.suggestedOrdre;
      this.validateOrdre();
    },
    
    async fetchRealisateurs() {
      try {
        const response = await axios.get('/api/realisateurs');
        this.realisateurs = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des réalisateurs:', error);
      }
    },
    
    async fetchScenaristes() {
      try {
        const response = await axios.get('/api/scenaristes');
        this.scenaristes = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des scénaristes:', error);
      }
    },
    
    async submitForm() {
      this.validateOrdre();
      if (this.ordreError) {
        return;
      }
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          this.errorMessage = 'Utilisateur non connecté';
          return;
        }
        
        let response;
        let episodeData;
        
        if (this.isEditing) {
          // Pour la MODIFICATION : Envoyer uniquement les champs modifiables
          episodeData = {
            titre: this.form.titre,
            synopsis: this.form.synopsis,
            ordre: parseInt(this.form.ordre),
            statutId: this.form.statutId
          };
          
          response = await axios.put(`/api/episodes/${this.editingId}`, episodeData, {
            headers: {
              'X-User-Id': user.id
            }
          });
          
          alert('Épisode modifié avec succès');
        } else {
          // Pour la CRÉATION : Envoyer tous les champs
          episodeData = {
            titre: this.form.titre,
            ordre: parseInt(this.form.ordre),
            projetId: this.form.projetId,
            statutId: this.form.statutId,
            synopsis: this.form.synopsis,
            realisateurId: this.form.realisateurId,
            scenaristeId: this.form.scenaristeId
          };
          
          response = await axios.post(`/api/episodes/projet/${this.form.projetId}`, episodeData);
          alert('Épisode créé avec succès');
        }
        
        if (response.status === 201 || response.status === 200) {
          await this.loadUserEpisodes();
          await this.fetchExistingEpisodes();
          
          if (this.isEditing) {
            this.resetForm();
            this.activeTab = 'list';
          } else {
            this.$router.push(`/projet/${this.form.projetId}`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création/modification de l\'épisode:', error);
        
        if (error.response?.status === 400) {
          if (error.response?.data?.message?.includes('ordre')) {
            this.ordreError = 'Cet ordre existe déjà pour ce projet. Veuillez choisir un autre numéro.';
            this.errorMessage = this.ordreError;
          } else {
            // Afficher le message d'erreur du serveur
            this.errorMessage = error.response.data.message || 'Erreur de validation';
          }
        } else if (error.response?.status === 403) {
          this.errorMessage = 'Vous n\'avez pas les permissions nécessaires';
        } else if (error.response?.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = error.response?.data?.message || 'Erreur lors de l\'opération';
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Modal de détails
    openDetailsModal(episode) {
      this.selectedEpisode = episode;
      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedEpisode = null;
    },
    
    async editEpisode(episode) {
      try {
        // Récupérer les détails complets de l'épisode
        const response = await axios.get(`/api/episodes/${episode.idEpisode}`, {
          headers: {
            'X-User-Id': this.user.id
          }
        });
        
        const episodeDetails = response.data;
        
        // Pré-remplir le formulaire avec les données de l'épisode
        this.form = {
          titre: episodeDetails.titre,
          ordre: episodeDetails.ordre,
          projetId: episodeDetails.projetId,
          statutId: this.findStatutIdByName(episodeDetails.statutNom),
          synopsis: episodeDetails.synopsis || '',
          realisateurId: episodeDetails.realisateurId || '',
          scenaristeId: episodeDetails.scenaristeId || ''
        };
        
        // Trouver le projet correspondant et mettre à jour la recherche
        const projet = this.userProjets.find(p => p.id === episodeDetails.projetId);
        if (projet) {
          this.projetSearch = projet.titre;
        }
        
        this.isEditing = true;
        this.editingId = episodeDetails.idEpisode;
        this.errorMessage = '';
        this.activeTab = 'form';
        this.closeDetailsModal();
        
        // Recharger les épisodes existants pour valider l'ordre
        await this.fetchExistingEpisodes();
        
        // Valider l'ordre après le chargement
        this.validateOrdre();
        
      } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'épisode:', error);
        this.errorMessage = 'Erreur lors du chargement des détails de l\'épisode.';
      }
    },
    
    findStatutIdByName(statutNom) {
      const statut = this.statutsEpisode.find(s => 
        s.nomStatutsEpisode === statutNom || 
        s.nomStatutsEpisode?.toLowerCase() === statutNom?.toLowerCase()
      );
      return statut ? statut.idStatutEpisode : '';
    },
    
    cancelEdit() {
      if (this.isEditing) {
        this.resetForm();
        this.activeTab = 'list';
      } else {
        this.goBack();
      }
    },
    
    resetForm() {
      this.form = {
        titre: '',
        ordre: this.suggestedOrdre || '',
        projetId: this.$route.params.id || this.$route.params.projetId || '',
        statutId: '',
        synopsis: '',
        realisateurId: '',
        scenaristeId: ''
      };
      this.projetSearch = '';
      this.isEditing = false;
      this.editingId = null;
      this.errorMessage = '';
      this.ordreError = '';
      
      // Recharger les détails du projet si un ID est présent
      if (this.form.projetId) {
        this.fetchProjetDetails();
        this.fetchExistingEpisodes();
      }
    },
    
    // Navigation et actions sidebar
    goToEpisodeDetails(episode) {
      this.$router.push(`/episode/${episode.idEpisode}/detail-episode`);
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    // Utilitaires
    getStatusClass(statusName) {
      if (!statusName) return 'status-planifie-add-episode';
      
      const status = statusName.toLowerCase();
      if (status.includes('planifié') || status.includes('brouillon')) return 'status-planifie-add-episode';
      if (status.includes('cours') || status.includes('production')) return 'status-en-cours-add-episode';
      if (status.includes('terminé') || status.includes('validé') || status.includes('tourné')) return 'status-termine-add-episode';
      if (status.includes('annulé') || status.includes('abandonné')) return 'status-annule-add-episode';
      return 'status-planifie-add-episode';
    },
    
    getStatusIcon(statusName) {
      if (!statusName) return 'far fa-clock';
      
      const status = statusName.toLowerCase();
      if (status.includes('planifié') || status.includes('brouillon')) return 'far fa-clock';
      if (status.includes('cours') || status.includes('production')) return 'fas fa-play-circle';
      if (status.includes('terminé') || status.includes('validé') || status.includes('tourné')) return 'fas fa-check-circle';
      if (status.includes('annulé') || status.includes('abandonné')) return 'fas fa-times-circle';
      return 'far fa-clock';
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    
    handleClickOutside(event) {
      if (!event.target.closest('.search-container-add-episode') && !event.target.closest('.profile-section')) {
        this.showProjetSuggestions = false;
        this.showProfileMenu = false;
      }
    },
    
    seDeconnecter() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
};
</script>