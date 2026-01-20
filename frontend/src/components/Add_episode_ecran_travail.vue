<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-ecran">
      <div class="sidebar-header-ecran">
        <h2 class="sidebar-title-ecran">Création d'Épisode</h2>
        <p class="sidebar-subtitle-ecran">Ajoutez un nouvel épisode au projet</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-ecran">
        <h3 class="section-title-ecran"><i class="fas fa-bolt"></i> Navigation</h3>
        <div class="sidebar-actions-ecran">
          <button 
            @click="goToEcranTravail" 
            class="sidebar-btn-ecran "
          >
            <i class="fas fa-desktop"></i>
            Écran de travail
          </button>
          <button @click="goBack" class="sidebar-btn-ecran">
            <i class="fas fa-arrow-left"></i>
            Retour
          </button>
        </div>
      </div>

      <!-- Section Informations Projet -->
      <div class="sidebar-section-ecran">
        <h3 class="section-title-ecran"><i class="fas fa-info-circle"></i> Informations Projet</h3>
        <div class="projet-info-ecran">
          <div class="info-item-ecran">
            <span class="info-label-ecran">Projet :</span>
            <span class="info-value-ecran">{{ projetTitre || 'Chargement...' }}</span>
          </div>
          <div class="info-item-ecran">
            <span class="info-label-ecran">Épisodes existants :</span>
            <span class="info-value-ecran">{{ existingOrders.length }}</span>
          </div>
          <div class="info-item-ecran" v-if="suggestedOrdre">
            <span class="info-label-ecran">Ordre suggéré :</span>
            <span class="info-value-ecran suggestion-highlight-ecran">#{{ suggestedOrdre }}</span>
          </div>
        </div>
      </div>

      <!-- Section Aide -->
      <div class="sidebar-section-ecran">
        <h3 class="section-title-ecran"><i class="fas fa-question-circle"></i> Aide</h3>
        <div class="aide-content-ecran">
          <p class="aide-text-ecran">
            • L'ordre doit être unique pour chaque épisode dans le projet.<br>
            • Les champs marqués d'un * sont obligatoires.<br>
            • L'épisode sera créé dans le projet actuel.
          </p>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-ecran">
      <div class="creation-main-content-ecran">
        <div class="form-container-ecran">
          <!-- En-tête de formulaire -->
          <div class="form-header-ecran">
            <h2><i class="fas fa-plus-circle"></i> Créer votre épisode</h2>
          </div>

          <form @submit.prevent="submitForm" class="episode-form-ecran">
            <!-- Ligne 1 : Titre de l'épisode + Titre du projet -->
            <div class="form-row-ecran">
              <div class="form-group-ecran">
                <label for="titre">Titre de l'épisode *</label>
                <input 
                  type="text" 
                  id="titre"
                  v-model="form.titre" 
                  required 
                  placeholder="Entrez le titre"
                  class="form-input-ecran"
                />
              </div>
              <div class="form-group-ecran">
                <label for="projet">Titre du projet</label>
                <input 
                  id="projet"
                  :value="projetTitre" 
                  type="text"
                  disabled
                  class="form-input-ecran"
                />
              </div>
            </div>

            <!-- Ligne 2 : Ordre dans le projet + Statut -->
            <div class="form-row-ecran">
              <div class="form-group-ecran">
                <label for="ordre">Ordre dans le projet *</label>
                <input 
                  type="number" 
                  id="ordre"
                  v-model="form.ordre" 
                  required 
                  placeholder="Entrez le nombre"
                  min="1"
                  class="form-input-ecran"
                  :class="{ 'error-input': ordreError }"
                  @blur="validateOrdre"
                />
                <span v-if="ordreError" class="error-text-ecran">{{ ordreError }}</span>
                <span v-if="suggestedOrdre" class="suggestion-text-ecran">
                  Suggestion: Le prochain ordre disponible est {{ suggestedOrdre }}
                  <button type="button" @click="useSuggestedOrder" class="suggestion-btn-ecran">
                    Utiliser cette valeur
                  </button>
                </span>
              </div>
              <div class="form-group-ecran">
                <label for="statut">Statut *</label>
                <select 
                  id="statut"
                  v-model="form.statutId" 
                  required
                  class="form-select-ecran"
                >
                  <option value="">Sélectionner le statut</option>
                  <option v-for="statut in statutsEpisode" :key="statut.idStatutEpisode" :value="statut.idStatutEpisode">
                    {{ statut.nomStatutsEpisode }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Ligne 3 : Réalisateur + Scénariste -->
            <div class="form-row-ecran">
              <div class="form-group-ecran">
                <label for="realisateur">Réalisateur *</label>
                <select 
                  id="realisateur"
                  v-model="form.realisateurId" 
                  required
                  class="form-select-ecran"
                >
                  <option value="">Sélectionner un réalisateur</option>
                  <option v-for="realisateur in realisateurs" :key="realisateur.idRealisateur" :value="realisateur.idRealisateur">
                    {{ realisateur.nom }} - {{ realisateur.specialite }}
                  </option>
                </select>
              </div>
              <div class="form-group-ecran">
                <label for="scenariste">Scénariste *</label>
                <select 
                  id="scenariste"
                  v-model="form.scenaristeId" 
                  required
                  class="form-select-ecran"
                >
                  <option value="">Sélectionner un scénariste</option>
                  <option v-for="scenariste in scenaristes" :key="scenariste.idScenariste" :value="scenariste.idScenariste">
                    {{ scenariste.nom }} - {{ scenariste.specialite }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Ligne 4 : Synopsis (pleine largeur) -->
            <div class="form-group-ecran">
              <label for="synopsis">Synopsis</label>
              <textarea 
                id="synopsis"
                v-model="form.synopsis" 
                rows="6"
                placeholder="Entrez le synopsis..."
                class="form-textarea-ecran"
              ></textarea>
            </div>

            <div v-if="errorMessage" class="error-message-ecran">
              <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
            </div>

            <div class="form-actions-ecran">
              <button type="button" @click="goBack" class="cancel-btn-ecran">
                <i class="fas fa-times"></i> Annuler
              </button>
              <button type="submit" class="submit-btn-ecran" :disabled="loading || ordreError !== ''">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-plus-circle"></i>
                {{ loading ? 'Création en cours...' : 'Créer l\'épisode' }}
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
  name: 'AddEpisodeEcranTravailView',
  data() {
    return {
      showProfileMenu: false,
      user: null,
      projetTitre: '',
      statutsEpisode: [],
      existingOrders: [],
      realisateurs: [],
      scenaristes: [],
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
      newEpisodeId: null
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
    }
  },
  mounted() {
    this.loadUser();
    this.fetchProjetDetails();
    this.fetchStatutsEpisode();
    this.fetchExistingEpisodes();
    this.fetchRealisateurs();
    this.fetchScenaristes();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    loadUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
      } else {
        this.$router.push('/');
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
        this.projetTitre = response.data.titre;
        this.form.projetId = projetId;
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        this.errorMessage = 'Erreur lors du chargement des détails du projet. Veuillez réessayer.';
      }
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
    
    async fetchExistingEpisodes() {
      try {
        const projetId = this.$route.params.id || this.$route.params.projetId || this.$route.query.projetId;
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
        this.form.ordre = 1;
        return;
      }
      
      const maxOrder = Math.max(...this.existingOrders);
      this.suggestedOrdre = maxOrder + 1;
      this.form.ordre = this.suggestedOrdre;
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
      
      if (this.existingOrders.includes(orderNum)) {
        this.ordreError = `L'ordre ${orderNum} existe déjà pour ce projet. Veuillez choisir un autre numéro.`;
        return;
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
        const episodeData = {
          titre: this.form.titre,
          ordre: parseInt(this.form.ordre),
          statutId: this.form.statutId,
          synopsis: this.form.synopsis || '',
          realisateurId: this.form.realisateurId || null,
          scenaristeId: this.form.scenaristeId || null
        };

        const response = await axios.post(`/api/episodes/projet/${this.form.projetId}`, episodeData, {
          headers: {
            'X-User-Id': this.user.id 
          }
        });
        
        if (response.status === 201) {
          this.newEpisodeId = response.data.idEpisode;
          this.$router.push({
            path: `/projet/${this.form.projetId}/ecran-travail`,
            query: { episodeId: this.newEpisodeId }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'épisode:', error);
        
        if (error.response?.status === 400 && error.response?.data?.message?.includes('ordre')) {
          this.ordreError = 'Cet ordre existe déjà pour ce projet. Veuillez choisir un autre numéro.';
          this.errorMessage = this.ordreError;
        } else if (error.response?.status === 400) {
          this.errorMessage = error.response?.data?.message || 'Erreur de validation. Vérifiez les données saisies.';
        } else if (error.response?.status === 403) {
          this.errorMessage = 'Vous n\'avez pas les permissions nécessaires pour créer un épisode.';
        } else if (error.response?.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = 'Erreur lors de la création de l\'épisode. Veuillez réessayer.';
        }
      } finally {
        this.loading = false;
      }
    },
    
    goToEcranTravail() {
      this.$router.push(`/projet/${this.form.projetId}/ecran-travail`);
    },
    
    goBack() {
      if (this.newEpisodeId) {
        this.$router.push({
          path: `/projet/${this.form.projetId}/ecran-travail`,
          query: { episodeId: this.newEpisodeId }
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
