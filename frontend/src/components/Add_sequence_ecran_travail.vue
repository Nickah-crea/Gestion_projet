<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-seq-ecran">
      <div class="sidebar-header-seq-ecran">
        <h2 class="sidebar-title-seq-ecran">Création de Séquence</h2>
        <p class="sidebar-subtitle-seq-ecran">Ajoutez une nouvelle séquence à l'épisode</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-seq-ecran">
        <h3 class="section-title-seq-ecran"><i class="fas fa-bolt"></i> Navigation</h3>
        <div class="sidebar-actions-seq-ecran">
          <button 
            @click="goToEcranTravail" 
            class="sidebar-btn-seq-ecran"
          >
            <i class="fas fa-desktop"></i>
            Écran de travail
          </button>
          <button @click="goBack" class="sidebar-btn-seq-ecran">
            <i class="fas fa-arrow-left"></i>
            Retour
          </button>
        </div>
      </div>

      <!-- Section Informations Épisode -->
      <div class="sidebar-section-seq-ecran">
        <h3 class="section-title-seq-ecran"><i class="fas fa-info-circle"></i> Informations</h3>
        <div class="filter-group-seq-ecran">
          <div class="filter-item-seq-ecran">
            <label>Épisode parent</label>
            <div class="episode-info-seq-ecran">
              <i class="fas fa-film"></i>
              <span>{{ episode?.titre || 'Chargement...' }}</span>
            </div>
          </div>
          
          <div class="filter-item-seq-ecran">
            <label>Projet associé</label>
            <div class="episode-info-seq-ecran">
              <i class="fas fa-project-diagram"></i>
              <span>{{ episode?.projetTitre || 'Non spécifié' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-seq-ecran">
        <h3 class="section-title-seq-ecran"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-seq-ecran">
          <div class="stat-item-seq-ecran">
            <span class="stat-number-seq-ecran">{{ sequencesInEpisode }}</span>
            <span class="stat-label-seq-ecran">Séquences existantes</span>
          </div>
          <div class="stat-item-seq-ecran">
            <span class="stat-number-seq-ecran">{{ suggestedOrdre || '?' }}</span>
            <span class="stat-label-seq-ecran">Ordre suggéré</span>
          </div>
        </div>
      </div>

      <!-- Section Aide -->
      <div class="sidebar-section-seq-ecran">
        <h3 class="section-title-seq-ecran"><i class="fas fa-question-circle"></i> Aide</h3>
        <div class="aide-content-seq-ecran">
          <p class="aide-text-seq-ecran">
            • L'ordre doit être unique pour chaque séquence dans l'épisode.<br>
            • Les champs marqués d'un * sont obligatoires.<br>
            • La séquence sera créée dans l'épisode actuel.
          </p>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-seq-ecran">
      <div class="creation-main-content-seq-ecran">
        <div class="form-container-seq-ecran">
          <!-- En-tête de formulaire -->
          <div class="form-header-seq-ecran">
            <!-- <button @click="goBack" class="back-btn-seq-ecran">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Retour
            </button> -->
            <h2><i class="fas fa-plus-circle"></i> Ajouter une nouvelle séquence</h2>
          </div>

          <form @submit.prevent="submitForm" class="sequence-form-seq-ecran">
            <!-- Ligne 1 : Titre + Ordre -->
            <div class="form-row-seq-ecran">
              <div class="form-group-seq-ecran">
                <label for="titre">Titre de la séquence *</label>
                <input 
                  type="text" 
                  id="titre"
                  v-model="formData.titre" 
                  required 
                  placeholder="Entrez le titre de la séquence"
                  class="form-input-seq-ecran"
                />
              </div>

              <div class="form-group-seq-ecran">
                <label for="ordre">Ordre dans l'épisode *</label>
                <input 
                  type="number" 
                  id="ordre"
                  v-model="formData.ordre" 
                  required 
                  placeholder="Numéro d'ordre"
                  min="1"
                  class="form-input-seq-ecran"
                  :class="{ 'error-input': ordreError }"
                  @blur="validateOrdre"
                />
                <span v-if="ordreError" class="error-text-seq-ecran">{{ ordreError }}</span>
                <span v-if="suggestedOrdre" class="suggestion-text-seq-ecran">
                  Suggestion: Le prochain ordre disponible est {{ suggestedOrdre }}
                  <button type="button" @click="useSuggestedOrder" class="suggestion-btn-seq-ecran">
                    Utiliser cette valeur
                  </button>
                </span>
              </div>
            </div>

            <!-- Ligne 2 : Épisode + Statut -->
            <div class="form-row-seq-ecran">
              <div class="form-group-seq-ecran">
                <label for="episode">Épisode lié</label>
                <div class="episode-display-seq-ecran">
                  <div class="episode-display-content-seq-ecran">
                    <i class="fas fa-film"></i>
                    <span>{{ episode?.titre || 'Épisode non spécifié' }}</span>
                  </div>
                </div>
                <span class="info-text-seq-ecran">
                  La séquence sera ajoutée à cet épisode
                </span>
              </div>

              <div class="form-group-seq-ecran">
                <label for="statut">Statut *</label>
                <select 
                  id="statut"
                  v-model="formData.statutId" 
                  required
                  class="form-select-seq-ecran"
                >
                  <option value="" disabled>Sélectionnez un statut</option>
                  <option 
                    v-for="statut in statutsSequence" 
                    :key="statut.id" 
                    :value="statut.id"
                  >
                    {{ statut.nomStatutsSequence }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Synopsis -->
            <div class="form-group-seq-ecran">
              <label for="synopsis">Synopsis *</label>
              <textarea 
                id="synopsis"
                v-model="formData.synopsis" 
                required 
                rows="5"
                placeholder="Décrivez le contenu de cette séquence"
                class="form-textarea-seq-ecran"
              ></textarea>
            </div>

            <div v-if="errorMessage" class="error-message-seq-ecran">
              <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
            </div>

            <div class="form-actions-seq-ecran">
              <button type="button" @click="goBack" class="cancel-btn-seq-ecran">
                <i class="fas fa-times"></i> Annuler
              </button>
              <button type="submit" class="submit-btn-seq-ecran" :disabled="loading || ordreError !== ''">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-plus-circle"></i>
                {{ loading ? 'Création en cours...' : 'Créer la séquence' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddSequenceEcranTravailView',
  data() {
    return {
      user: null,
      episode: {},
      statutsSequence: [],
      formData: {
        titre: '',
        ordre: null,
        synopsis: '',
        statutId: null
      },
      loading: false,
      errorMessage: '',
      newSequenceId: null,
      existingOrders: [],
      ordreError: '',
      suggestedOrdre: null,
      sequencesInEpisode: 0
    };
  },
  computed: {
    userInitials() {
      if (!this.user?.nom) return '';
      const names = this.user.nom.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    },
    episodeId() {
      return this.$route.params.episodeId || this.$route.params.id;
    }
  },
  async mounted() {
    await this.loadUser();
    await this.loadEpisode();
    await this.loadStatutsSequence();
    await this.fetchExistingSequences();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
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
          projetTitre: response.data.titre
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
        console.error('Erreur lors du chargement des statuts:', error);
        this.errorMessage = 'Erreur lors du chargement des statuts.';
      }
    },
    
    async fetchExistingSequences() {
      try {
        const response = await axios.get(`/api/sequences/episodes/${this.episodeId}`, {
          headers: {
            'X-User-Id': this.user.id
          }
        });
        
        this.existingOrders = response.data.map(sequence => sequence.ordre);
        this.sequencesInEpisode = response.data.length;
        this.calculateSuggestedOrdre();
        
      } catch (error) {
        console.error('Erreur lors du chargement des séquences existantes:', error);
        this.existingOrders = [];
        this.calculateSuggestedOrdre();
      }
    },
    
    calculateSuggestedOrdre() {
      if (this.existingOrders.length === 0) {
        this.suggestedOrdre = 1;
      } else {
        const maxOrder = Math.max(...this.existingOrders);
        this.suggestedOrdre = maxOrder + 1;
      }
      
      this.formData.ordre = this.suggestedOrdre;
    },
    
    validateOrdre() {
      if (!this.formData.ordre) {
        this.ordreError = 'L\'ordre est requis';
        return;
      }
      
      if (this.formData.ordre < 1) {
        this.ordreError = 'L\'ordre doit être un nombre positif';
        return;
      }
      
      if (this.existingOrders.includes(this.formData.ordre)) {
        this.ordreError = `L'ordre ${this.formData.ordre} existe déjà dans cet épisode`;
        return;
      }
      
      this.ordreError = '';
    },
    
    useSuggestedOrder() {
      this.formData.ordre = this.suggestedOrdre;
      this.validateOrdre();
    },
    
    async submitForm() {
      this.validateOrdre();
      
      if (this.ordreError) {
        this.errorMessage = 'Veuillez corriger les erreurs avant de soumettre';
        return;
      }
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          throw new Error('Utilisateur non connecté');
        }

        const response = await axios.post(`/api/sequences/episodes/${this.episodeId}`, this.formData, {
          headers: {
            'X-User-Id': user.id
          }
        });
        
        if (response.status === 201) {
          this.newSequenceId = response.data.idSequence;
          this.$router.push({
            path: `/projet/${this.episode.projetId}/ecran-travail`,
            query: { episodeId: this.episodeId, sequenceId: this.newSequenceId }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la création de la séquence:', error);
        
        if (error.response?.status === 400 && 
            error.response?.data?.message?.includes('ordre') &&
            error.response?.data?.message?.includes('existe')) {
          this.ordreError = 'Cet ordre existe déjà dans l\'épisode';
          this.errorMessage = 'Erreur de validation: ' + this.ordreError;
          await this.fetchExistingSequences();
        } else {
          this.errorMessage = error.response?.data?.message || 'Erreur lors de la création de la séquence. Veuillez réessayer.';
        }
      } finally {
        this.loading = false;
      }
    },
    
    goToEcranTravail() {
      if (this.episode?.projetId) {
        this.$router.push(`/projet/${this.episode.projetId}/ecran-travail`);
      }
    },
    
    goBack() {
      if (this.newSequenceId) {
        this.$router.push({
          path: `/projet/${this.episode.projetId}/ecran-travail`,
          query: { episodeId: this.episodeId, sequenceId: this.newSequenceId }
        });
      } else {
        this.$router.go(-1);
      }
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
    }
  }
};
</script>
