<!-- AddSequence.vue - Version avec sidebar -->
<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-add-sequence">
      <div class="sidebar-header-add-sequence">
        <h2 class="sidebar-title-add-sequence">Gestion des Séquences</h2>
        <p class="sidebar-subtitle-add-sequence">Créez et gérez vos séquences</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-add-sequence">
        <h3 class="section-title-add-sequence"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-add-sequence">
          <button 
            @click="goToForm" 
            class="sidebar-btn-add-sequence" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouvelle séquence
          </button>
          <button @click="goBack" class="sidebar-btn-add-sequence">
                  <i class="fas fa-arrow-left"></i>
                  Retourner à l'épisode
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-add-sequence">
        <h3 class="section-title-add-sequence"><i class="fas fa-filter"></i> Informations</h3>
        <div class="filter-group-add-sequence">
          <div class="filter-item-add-sequence">
            <label>Épisode parent</label>
            <div class="episode-info-add-sequence">
              <i class="fas fa-film"></i>
              <span>{{ episode?.titre || 'Non spécifié' }}</span>
            </div>
          </div>
          
          <div class="filter-item-add-sequence">
            <label>Projet associé</label>
            <div class="episode-info-add-sequence">
              <i class="fas fa-project-diagram"></i>
              <span>{{ episode?.projetTitre || 'Non spécifié' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-add-sequence">
        <h3 class="section-title-add-sequence"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-add-sequence">
          <div class="stat-item-add-sequence">
            <span class="stat-number-add-sequence">{{ sequencesCount }}</span>
            <span class="stat-label-add-sequence">Séquences total</span>
          </div>
          <div class="stat-item-add-sequence">
            <span class="stat-number-add-sequence">{{ sequencesInEpisode }}</span>
            <span class="stat-label-add-sequence">Dans cet épisode</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-add-sequence">
      <div class="creation-main-content-add-sequence">
        
        <!-- Système d'onglets -->
        <div class="tabs-container-add-sequence">
          <div class="tabs-header-add-sequence">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-add-sequence', { active: activeTab === 'form' }]"
            >
              <i class="fas fa-plus"></i>
              Créer une séquence
            </button>
          </div>
          
          <div class="tabs-content-add-sequence">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-add-sequence" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-add-sequence">
              <!-- En-tête de formulaire -->
              <div class="form-header-add-sequence">
                <h3>
                  <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
                  {{ isEditing ? 'Modifier la séquence' : 'Créer une nouvelle séquence' }}
                </h3>
              </div>

              <!-- Formulaire de création/édition -->
              <form @submit.prevent="submitForm" class="sequence-form-add-sequence">
                <div class="form-row-add-sequence">
                  <div class="form-group-add-sequence">
                    <label for="titre">Titre de la séquence *</label>
                    <input 
                      type="text" 
                      id="titre"
                      v-model="form.titre" 
                      required 
                      placeholder="Entrez le titre"
                      class="form-input-add-sequence"
                    />
                  </div>

                  <div class="form-group-add-sequence">
                    <label for="ordre">Ordre dans l'épisode *</label>
                    <input 
                      type="number" 
                      id="ordre"
                      v-model="form.ordre" 
                      required 
                      placeholder="Entrez le nombre"
                      min="1"
                      class="form-input-add-sequence"
                      :class="{ 'error-input': ordreError }"
                      @blur="validateOrdre"
                      :disabled="isEditing"
                    />
                    <span v-if="ordreError" class="error-text-add-sequence">{{ ordreError }}</span>
                    <span v-if="suggestedOrdre && !isEditing" class="suggestion-text-add-sequence">
                      Suggestion: Le prochain ordre disponible est {{ suggestedOrdre }}
                      <button type="button" @click="useSuggestedOrder" class="suggestion-btn-add-sequence">
                        Utiliser cette valeur
                      </button>
                    </span>
                    <span v-if="isEditing" class="info-text-add-sequence">
                      L'ordre ne peut pas être modifié pour une séquence existante.
                    </span>
                  </div>
                </div>

                <div class="form-row-add-sequence">
                  <div class="form-group-add-sequence">
                    <label for="episode">Épisode parent *</label>
                    <div class="episode-display-add-sequence">
                      <div class="episode-display-content-add-sequence">
                        <i class="fas fa-film"></i>
                        <span>{{ episode?.titre || 'Épisode non spécifié' }}</span>
                      </div>
                      <input type="hidden" v-model="form.episodeId" required />
                    </div>
                    <span class="info-text-add-sequence">
                      La séquence sera ajoutée à cet épisode
                    </span>
                  </div>

                  <div class="form-group-add-sequence">
                    <label for="statut">Statut *</label>
                    <select 
                      id="statut"
                      v-model="form.statutId" 
                      required
                      class="form-select-add-sequence"
                    >
                      <option value="">Sélectionner le statut</option>
                      <option v-for="statut in statutsSequence" :key="statut.id" :value="statut.id">
                        {{ statut.nomStatutsSequence }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-group-add-sequence">
                  <label for="synopsis">Synopsis</label>
                  <textarea 
                    id="synopsis"
                    v-model="form.synopsis" 
                    rows="6"
                    placeholder="Entrez le synopsis..."
                    class="form-textarea-add-sequence"
                  ></textarea>
                </div>

                <div v-if="errorMessage" class="error-message-add-sequence">
                  <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
                </div>

                <div class="form-actions-add-sequence">
                  <button type="button" @click="cancelEdit" class="cancel-btn-add-sequence">
                    <i class="fas fa-times"></i>
                    {{ isEditing ? 'Annuler' : 'Annuler' }}
                  </button>
                  <button type="submit" class="submit-btn-add-sequence" :disabled="loading || ordreError !== ''">
                    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                    <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer la séquence') }}
                  </button>
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

export default {
  name: 'AddSequenceView',
  data() {
    return {
      activeTab: 'form',
      user: null,
      episode: {},
      statutsSequence: [],
      existingOrders: [],
      
      // Formulaire
      form: {
        titre: '',
        ordre: '',
        episodeId: this.$route.params.id || this.$route.params.episodeId || '',
        statutId: '',
        synopsis: ''
      },
      
      loading: false,
      errorMessage: '',
      ordreError: '',
      suggestedOrdre: null,
      
      // Statistiques
      sequencesCount: 0,
      sequencesInEpisode: 0,
      
      // Édition
      isEditing: false,
      editingId: null
    };
  },
  computed: {
    episodeId() {
      return this.$route.params.id || this.$route.params.episodeId;
    },
    
    getTabIndicatorStyle() {
      const tabWidth = 100;
      return {
        transform: `translateX(0)`,
        width: `${tabWidth}%`
      };
    }
  },
  async mounted() {
    await this.loadUser();
    await this.loadEpisode();
    await this.loadStatutsSequence();
    await this.fetchExistingSequences();
    await this.loadSequenceStatistics();
  },
  methods: {
    // Navigation entre onglets
    goToForm() {
      this.activeTab = 'form';
      this.isEditing = false;
      this.editingId = null;
      this.resetForm();
    },

    async loadUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
      } else {
        this.$router.push('/');
      }
    },
    
async loadEpisode() {
  try {
    const response = await axios.get(`/api/episodes/${this.episodeId}`, {
      headers: {
        'X-User-Id': this.user.id
      }
    });
    this.episode = response.data;
    this.form.episodeId = this.episodeId;
    
    if (this.episode.projetId && !this.episode.projetTitre) {
      await this.loadProjetDetails();
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'épisode:', error);
    this.errorMessage = 'Erreur lors du chargement de l\'épisode.';
  }
},

async loadProjetDetails() {
  try {
    if (!this.episode?.projetId) return;
    
    const response = await axios.get(`/api/projets/${this.episode.projetId}`, {
      headers: {
        'X-User-Id': this.user.id
      }
    });
  
    this.episode = {
      ...this.episode,
      projetTitre: response.data.titre,
      projetDetails: response.data
    };
  } catch (error) {
    console.error('Erreur lors du chargement du projet:', error);
  }
},
    
    async loadStatutsSequence() {
      try {
        const response = await axios.get('/api/statuts-sequence');
        this.statutsSequence = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts de séquence:', error);
        this.errorMessage = 'Erreur lors du chargement des statuts';
      }
    },
    
    async fetchExistingSequences() {
      try {
        const response = await axios.get(`/api/sequences/episodes/${this.episodeId}`);
        this.existingOrders = response.data.map(sequence => sequence.ordre);
        this.calculateSuggestedOrdre();
        this.sequencesInEpisode = response.data.length;
      } catch (error) {
        console.error('Erreur lors du chargement des séquences existantes:', error);
      }
    },
    
    async loadSequenceStatistics() {
      try {
        if (!this.user?.id) return;
        
        const response = await axios.get(`/api/sequences/utilisateur/${this.user.id}`);
        this.sequencesCount = response.data.length;
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques des séquences:', error);
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
        if (this.existingOrders.includes(orderNum)) {
          this.ordreError = `L'ordre ${orderNum} existe déjà pour cet épisode. Veuillez choisir un autre numéro.`;
          return;
        }
      } else {
        // Pour la création, vérifier si l'ordre existe déjà
        if (this.existingOrders.includes(orderNum)) {
          this.ordreError = `L'ordre ${orderNum} existe déjà pour cet épisode. Veuillez choisir un autre numéro.`;
          return;
        }
      }
      
      this.ordreError = '';
    },
    
    useSuggestedOrder() {
      this.form.ordre = this.suggestedOrdre;
      this.validateOrdre();
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
        let sequenceData;
        
        if (this.isEditing) {
          // Pour la MODIFICATION
          sequenceData = {
            titre: this.form.titre,
            synopsis: this.form.synopsis,
            ordre: parseInt(this.form.ordre),
            statutId: this.form.statutId
          };
          
          response = await axios.put(`/api/sequences/${this.editingId}`, sequenceData, {
            headers: {
              'X-User-Id': user.id
            }
          });
        } else {
          // Pour la CRÉATION
          sequenceData = {
            titre: this.form.titre,
            ordre: parseInt(this.form.ordre),
            episodeId: this.form.episodeId,
            statutId: this.form.statutId,
            synopsis: this.form.synopsis
          };
          
          response = await axios.post(`/api/sequences/episodes/${this.form.episodeId}`, sequenceData, {
            headers: {
              'X-User-Id': user.id
            }
          });
        }
        
        if (response.status === 201 || response.status === 200) {
          await this.fetchExistingSequences();
          await this.loadSequenceStatistics();
          
          if (this.isEditing) {
            this.resetForm();
          } else {
            this.goBackToEpisodeDetails();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création/modification de la séquence:', error);
        
        if (error.response?.status === 400) {
          if (error.response?.data?.message?.includes('ordre')) {
            this.ordreError = 'Cet ordre existe déjà pour cet épisode. Veuillez choisir un autre numéro.';
            this.errorMessage = this.ordreError;
          } else {
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
    
    cancelEdit() {
      if (this.isEditing) {
        this.resetForm();
      } else {
        this.goBack();
      }
    },
    
    resetForm() {
      this.form = {
        titre: '',
        ordre: this.suggestedOrdre || '',
        episodeId: this.episodeId,
        statutId: '',
        synopsis: ''
      };
      this.isEditing = false;
      this.editingId = null;
      this.errorMessage = '';
      this.ordreError = '';
      
      // Recharger les données
      this.loadEpisode();
      this.fetchExistingSequences();
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    goBackToEpisodeDetails() {
      this.$router.push(`/episode/${this.episodeId}/detail-episode`);
    }
  }
};
</script>