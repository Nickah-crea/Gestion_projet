<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-add-scene">
      <div class="sidebar-header-add-scene">
        <h2 class="sidebar-title-add-scene">Création de Scène</h2>
        <p class="sidebar-subtitle-add-scene">Ajoutez une nouvelle scène à la séquence</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-add-scene">
        <h3 class="section-title-add-scene"><i class="fas fa-bolt"></i> Navigation</h3>
        <div class="sidebar-actions-add-scene">
          <button 
            @click="goToEcranTravail" 
            class="sidebar-btn-add-scene"
          >
            <i class="fas fa-desktop"></i>
            Écran de travail
          </button>
          <button @click="goBack" class="sidebar-btn-add-scene">
            <i class="fas fa-arrow-left"></i>
            Retour
          </button>
        </div>
      </div>

      <!-- Section Informations Séquences -->
      <div class="sidebar-section-add-scene">
        <h3 class="section-title-add-scene"><i class="fas fa-info-circle"></i> Informations</h3>
        <div class="filter-group-add-scene">
          <div class="filter-item-add-scene">
            <label>Séquence parente</label>
            <div class="sequence-info-add-scene">
              <i class="fas fa-film"></i>
              <span>{{ sequenceTitre || 'Chargement...' }}</span>
            </div>
          </div>
          
          <div class="filter-item-add-scene">
            <label>Épisode associé</label>
            <div class="sequence-info-add-scene">
              <i class="fas fa-project-diagram"></i>
              <span>{{ episodeTitre || 'Non spécifié' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-add-scene">
        <h3 class="section-title-add-scene"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-add-scene">
          <div class="stat-item-add-scene">
            <span class="stat-number-add-scene">{{ scenesInSequence }}</span>
            <span class="stat-label-add-scene">Scènes existantes</span>
          </div>
          <div class="stat-item-add-scene">
            <span class="stat-number-add-scene">{{ suggestedOrder || '?' }}</span>
            <span class="stat-label-add-scene">Ordre suggéré</span>
          </div>
        </div>
      </div>

      <!-- Section Aide -->
      <div class="sidebar-section-add-scene">
        <h3 class="section-title-add-scene"><i class="fas fa-question-circle"></i> Aide</h3>
        <div class="aide-content-add-scene">
          <p class="aide-text-add-scene">
            • L'ordre doit être unique pour chaque scène dans la séquence.<br>
            • La scène sera créée dans la séquence actuelle.
          </p>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-add-scene">
      <div class="creation-main-content-add-scene">
        <div class="form-container-add-scene">
          <!-- En-tête de formulaire -->
          <div class="form-header-add-scene">
            <h2><i class="fas fa-plus-circle"></i> Ajouter une nouvelle scène</h2>
          </div>

          <form @submit.prevent="submitScene" class="scene-form-add-scene">
            <!-- Ligne 1 : Titre + Ordre -->
            <div class="form-row-add-scene">
              <div class="form-group-add-scene">
                <label for="titre">Titre de la scène</label>
                <input 
                  type="text" 
                  id="titre"
                  v-model="scene.titre" 
                  required 
                  placeholder="Entrez le titre de la scène"
                  class="form-input-add-scene"
                />
              </div>

              <div class="form-group-add-scene">
                <label for="ordre">Ordre dans la séquence</label>
                <input 
                  type="number" 
                  id="ordre"
                  v-model="scene.ordre" 
                  required 
                  placeholder="Numéro d'ordre"
                  min="1"
                  class="form-input-add-scene"
                  :class="{ 'error-input': orderError }"
                  @blur="validateOrder"
                />
                <span v-if="orderError" class="error-text-add-scene">{{ orderError }}</span>
                <span v-if="suggestedOrder" class="suggestion-text-add-scene">
                  Suggestion: Le prochain ordre disponible est {{ suggestedOrder }}
                  <button type="button" @click="useSuggestedOrder" class="suggestion-btn-add-scene">
                    Utiliser cette valeur
                  </button>
                </span>
              </div>
            </div>

            <!-- Synopsis -->
            <div class="form-group-add-scene">
              <label for="synopsis">Synopsis</label>
              <textarea 
                id="synopsis"
                v-model="scene.synopsis" 
                required 
                rows="5"
                placeholder="Décrivez le contenu de cette scène"
                class="form-textarea-add-scene"
              ></textarea>
            </div>

            <!-- Ligne 2 : Séquence + Statut -->
            <div class="form-row-add-scene">
              <div class="form-group-add-scene">
                <label for="sequence">Séquence liée</label>
                <div class="sequence-display-add-scene">
                  <div class="sequence-display-content-add-scene">
                    <i class="fas fa-film"></i>
                    <span>{{ sequenceTitre || 'Séquence non spécifiée' }}</span>
                  </div>
                </div>
                <span class="info-text-add-scene">
                  La scène sera ajoutée à cette séquence
                </span>
              </div>

              <div class="form-group-add-scene">
                <label for="statut">Statut</label>
                <select 
                  id="statut"
                  v-model="scene.statutId" 
                  required
                  class="form-select-add-scene"
                >
                  <option value="" disabled>Sélectionnez un statut</option>
                  <option 
                    v-for="statut in statutsScene" 
                    :key="statut.id" 
                    :value="statut.id"
                  >
                    {{ statut.nomStatutsScene }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="errorMessage" class="error-message-add-scene">
              <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
            </div>

            <div class="form-actions-add-scene">
              <button type="button" @click="goBack" class="cancel-btn-add-scene">
                <i class="fas fa-times"></i> Annuler
              </button>
              <button type="submit" class="submit-btn-add-scene" :disabled="loading || orderError !== ''">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-plus-circle"></i>
                {{ loading ? 'Création en cours...' : 'Créer la scène' }}
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
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      showProfileMenu: false,
      scene: {
        titre: '',
        ordre: null,
        synopsis: '',
        statutId: null
      },
      statutsScene: [],
      sequenceTitre: '',
      episodeTitre: '',
      loading: false,
      errorMessage: '',
      existingOrders: [],
      suggestedOrder: null,
      orderError: '',
      backUrl: null,
      scenesInSequence: 0
    };
  },
  computed: {
    userInitials() {
      if (!this.user?.nom) return '';
      const names = this.user.nom.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    },
    sequenceId() {
      return this.$route.params.sequenceId;
    }
  },
  async created() {
    // Récupérer l'URL de retour depuis les query params ou le localStorage
    this.backUrl = this.$route.query.backUrl 
      || localStorage.getItem('lastEcranTravailUrl') 
      || `/sequence/${this.sequenceId}/detail-sequence`;
    
    await this.loadStatutsScene();
    await this.loadSequenceDetails();
    await this.loadExistingOrders();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
   async loadStatutsScene() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const headers = user && user.id ? { 'X-User-Id': user.id } : {};
        
        const response = await axios.get('/api/statuts-scene', { headers });
        this.statutsScene = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
        this.errorMessage = 'Erreur lors du chargement des statuts';
      }
   },
   async loadSequenceDetails() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const headers = user && user.id ? { 'X-User-Id': user.id } : {};
        
        // Récupérer les détails de la séquence
        const sequenceResponse = await axios.get(`/api/sequences/${this.sequenceId}`, { headers });
        const sequence = sequenceResponse.data;
        this.sequenceTitre = sequence.titre;
        
        // Récupérer les détails de l'épisode parent
        if (sequence.episodeId) {
          const episodeResponse = await axios.get(`/api/episodes/${sequence.episodeId}`, { headers });
          this.episodeTitre = episodeResponse.data.titre;
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la séquence:', error);
        this.errorMessage = 'Impossible de charger les détails de la séquence';
      }
    },
    async loadExistingOrders() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const headers = user && user.id ? { 'X-User-Id': user.id } : {};
        
        // Récupérer toutes les scènes de cette séquence pour vérifier les ordres existants
        const response = await axios.get(`/api/scenes/sequences/${this.sequenceId}`, { headers });
        this.existingOrders = response.data.map(scene => scene.ordre);
        this.scenesInSequence = response.data.length;
        
        // Calculer le prochain ordre disponible
        this.calculateSuggestedOrder();
      } catch (error) {
        console.error('Erreur lors du chargement des ordres existants:', error);
        this.errorMessage = 'Impossible de vérifier les ordres existants';
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
      
      // Pré-remplir le champ avec la suggestion
      this.scene.ordre = this.suggestedOrder;
    },
    validateOrder() {
      if (!this.scene.ordre) {
        this.orderError = 'L\'ordre est requis';
        return;
      }
      
      if (this.scene.ordre < 1) {
        this.orderError = 'L\'ordre doit être un nombre positif';
        return;
      }
      
      // Vérifier si l'ordre existe déjà
      if (this.existingOrders.includes(this.scene.ordre)) {
        this.orderError = `L'ordre ${this.scene.ordre} existe déjà dans cette séquence`;
        return;
      }
      
      // Si tout est valide, effacer l'erreur
      this.orderError = '';
    },
    useSuggestedOrder() {
      this.scene.ordre = this.suggestedOrder;
      this.validateOrder();
    },
    async submitScene() {
      // Valider à nouveau avant soumission
      this.validateOrder();
      
      if (this.orderError) {
        this.errorMessage = 'Veuillez corriger les erreurs avant de soumettre';
        return;
      }
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        // Récupérer l'utilisateur connecté
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          throw new Error('Utilisateur non connecté');
        }

        // Ajouter le header X-User-Id
        const response = await axios.post(`/api/scenes/sequences/${this.sequenceId}`, this.scene, {
          headers: {
            'X-User-Id': user.id
          }
        });
        
        // Redirection vers l'URL sauvegardée
        this.$router.push(this.backUrl);
        
      } catch (error) {
        console.error('Erreur lors de la création de la scène:', error);
        
        // Vérifier si l'erreur est due à un doublon d'ordre
        if (error.response?.status === 400 && 
            error.response?.data?.message?.includes('ordre') &&
            error.response?.data?.message?.includes('existe')) {
          this.orderError = 'Cet ordre existe déjà dans la séquence';
          this.errorMessage = 'Erreur de validation: ' + this.orderError;
          
          // Recharger les ordres existants au cas où ils auraient changé
          await this.loadExistingOrders();
        } else {
          this.errorMessage = error.response?.data?.message || 'Erreur lors de la création de la scène';
        }
      } finally {
        this.loading = false;
      }
    },
    goToEcranTravail() {
      if (this.episodeId) {
        this.$router.push(`/projet/${this.episodeId}/ecran-travail`);
      } else {
        // Fallback vers la page précédente
        this.$router.go(-1);
      }
    },
    goBack() {
      // Utiliser l'URL de retour sauvegardée
      this.$router.push(this.backUrl);
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

<style scoped>
/* Suppression des anciens styles et import du nouveau fichier CSS */
</style>

