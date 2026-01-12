<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <div class="creation-sidebar-add-scene">
      <div class="sidebar-header-add-scene">
        <h2 class="sidebar-title-add-scene">Gestion des Scènes</h2>
        <p class="sidebar-subtitle-add-scene">Créez et gérez vos scènes</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-add-scene">
        <h3 class="section-title-add-scene"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-add-scene">
          <button 
            @click="goToForm" 
            class="sidebar-btn-add-scene" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouvelle scène
          </button>
          <button @click="goBack" class="sidebar-btn-add-scene">
            <i class="fas fa-arrow-left"></i>
            Retourner à la séquence
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-add-scene">
        <h3 class="section-title-add-scene"><i class="fas fa-filter"></i> Informations</h3>
        <div class="filter-group-add-scene">
          <div class="filter-item-add-scene">
            <label>Séquence parente</label>
            <div class="sequence-info-add-scene">
              <i class="fas fa-layer-group"></i>
              <span>{{ sequence?.titre || 'Non spécifiée' }}</span>
            </div>
          </div>
          
          <div class="filter-item-add-scene">
            <label>Épisode associé</label>
            <div class="sequence-info-add-scene">
              <i class="fas fa-film"></i>
              <span>{{ sequence?.episodeTitre || 'Non spécifié' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-add-scene">
        <h3 class="section-title-add-scene"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-add-scene">
          <div class="stat-item-add-scene">
            <span class="stat-number-add-scene">{{ scenesCount }}</span>
            <span class="stat-label-add-scene">Scènes total</span>
          </div>
          <div class="stat-item-add-scene">
            <span class="stat-number-add-scene">{{ scenesInSequence }}</span>
            <span class="stat-label-add-scene">Dans cette séquence</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-add-scene">
      <div class="creation-main-content-add-scene">
        
        <!-- Système d'onglets -->
        <div class="tabs-container-add-scene">
          <div class="tabs-header-add-scene">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-add-scene', { active: activeTab === 'form' }]"
            >
              <i class="fas fa-plus"></i>
              Créer une scène
            </button>
          </div>
          
          <div class="tabs-content-add-scene">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-add-scene" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-add-scene">
              <!-- En-tête de formulaire -->
              <div class="form-header-add-scene">
                <h3>
                  <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
                  {{ isEditing ? 'Modifier la scène' : 'Créer une nouvelle scène' }}
                </h3>
              </div>

              <!-- Formulaire de création/édition -->
              <form @submit.prevent="submitForm" class="scene-form-add-scene">
                <div class="form-row-add-scene">
                  <div class="form-group-add-scene">
                    <label for="titre">Titre de la scène *</label>
                    <input 
                      type="text" 
                      id="titre"
                      v-model="form.titre" 
                      required 
                      placeholder="Entrez le titre"
                      class="form-input-add-scene"
                    />
                  </div>

                  <div class="form-group-add-scene">
                    <label for="ordre">Ordre dans la séquence *</label>
                    <input 
                      type="number" 
                      id="ordre"
                      v-model="form.ordre" 
                      required 
                      placeholder="Entrez le nombre"
                      min="1"
                      class="form-input-add-scene"
                      :class="{ 'error-input': ordreError }"
                      @blur="validateOrdre"
                      :disabled="isEditing"
                    />
                    <span v-if="ordreError" class="error-text-add-scene">{{ ordreError }}</span>
                    <span v-if="suggestedOrdre && !isEditing" class="suggestion-text-add-scene">
                      Suggestion: Le prochain ordre disponible est {{ suggestedOrdre }}
                      <button type="button" @click="useSuggestedOrder" class="suggestion-btn-add-scene">
                        Utiliser cette valeur
                      </button>
                    </span>
                    <span v-if="isEditing" class="info-text-add-scene">
                      L'ordre ne peut pas être modifié pour une scène existante.
                    </span>
                  </div>
                </div>

                <div class="form-row-add-scene">
                  <div class="form-group-add-scene">
                    <label for="sequence">Séquence parente *</label>
                    <div class="sequence-display-add-scene">
                      <div class="sequence-display-content-add-scene">
                        <i class="fas fa-layer-group"></i>
                        <span>{{ sequence?.titre || 'Séquence non spécifiée' }}</span>
                      </div>
                      <input type="hidden" v-model="form.sequenceId" required />
                    </div>
                    <span class="info-text-add-scene">
                      La scène sera ajoutée à cette séquence
                    </span>
                  </div>

                  <div class="form-group-add-scene">
                    <label for="statut">Statut *</label>
                    <select 
                      id="statut"
                      v-model="form.statutId" 
                      required
                      class="form-select-add-scene"
                    >
                      <option value="">Sélectionner le statut</option>
                      <option v-for="statut in statutsScene" :key="statut.id" :value="statut.id">
                        {{ statut.nomStatutsScene }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-group-add-scene">
                  <label for="synopsis">Synopsis *</label>
                  <textarea 
                    id="synopsis"
                    v-model="form.synopsis" 
                    rows="6"
                    placeholder="Entrez le synopsis..."
                    class="form-textarea-add-scene"
                    required
                  ></textarea>
                </div>

                <div v-if="errorMessage" class="error-message-add-scene">
                  <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
                </div>

                <div class="form-actions-add-scene">
                  <button type="button" @click="cancelEdit" class="cancel-btn-add-scene">
                    <i class="fas fa-times"></i>
                    {{ isEditing ? 'Annuler' : 'Annuler' }}
                  </button>
                  <button type="submit" class="submit-btn-add-scene" :disabled="loading || ordreError !== ''">
                    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                    <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer la scène') }}
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
  name: 'AddSceneView',
  data() {
    return {
      activeTab: 'form',
      user: null,
      sequence: {},
      statutsScene: [],
      existingOrders: [],
      
      // Formulaire
      form: {
        titre: '',
        ordre: '',
        sequenceId: this.$route.params.sequenceId || '',
        statutId: '',
        synopsis: ''
      },
      
      loading: false,
      errorMessage: '',
      ordreError: '',
      suggestedOrdre: null,
      
      // Statistiques
      scenesCount: 0,
      scenesInSequence: 0,
      
      // Édition
      isEditing: false,
      editingId: null
    };
  },
  computed: {
    sequenceId() {
      return this.$route.params.sequenceId;
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
    await this.loadSequence();
    await this.loadStatutsScene();
    await this.fetchExistingScenes();
    await this.loadSceneStatistics();
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
    
    async loadSequence() {
      try {
        const response = await axios.get(`/api/sequences/${this.sequenceId}`, {
          headers: {
            'X-User-Id': this.user.id
          }
        });
        this.sequence = response.data;
        this.form.sequenceId = this.sequenceId;
      } catch (error) {
        console.error('Erreur lors du chargement de la séquence:', error);
        this.errorMessage = 'Erreur lors du chargement de la séquence.';
      }
    },
    
    async loadStatutsScene() {
      try {
        const response = await axios.get('/api/statuts-scene');
        this.statutsScene = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts de scène:', error);
        this.errorMessage = 'Erreur lors du chargement des statuts';
      }
    },
    
    async fetchExistingScenes() {
      try {
        const response = await axios.get(`/api/scenes/sequences/${this.sequenceId}`);
        this.existingOrders = response.data.map(scene => scene.ordre);
        this.calculateSuggestedOrdre();
        this.scenesInSequence = response.data.length;
      } catch (error) {
        console.error('Erreur lors du chargement des scènes existantes:', error);
      }
    },
    
    async loadSceneStatistics() {
      try {
        if (!this.user?.id) return;
        
        const response = await axios.get(`/api/scenes/utilisateur/${this.user.id}`);
        this.scenesCount = response.data.length;
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques des scènes:', error);
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
          this.ordreError = `L'ordre ${orderNum} existe déjà pour cette séquence. Veuillez choisir un autre numéro.`;
          return;
        }
      } else {
        // Pour la création, vérifier si l'ordre existe déjà
        if (this.existingOrders.includes(orderNum)) {
          this.ordreError = `L'ordre ${orderNum} existe déjà pour cette séquence. Veuillez choisir un autre numéro.`;
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
        let sceneData;
        
        if (this.isEditing) {
          // Pour la MODIFICATION
          sceneData = {
            titre: this.form.titre,
            synopsis: this.form.synopsis,
            ordre: parseInt(this.form.ordre),
            statutId: this.form.statutId
          };
          
          response = await axios.put(`/api/scenes/${this.editingId}`, sceneData, {
            headers: {
              'X-User-Id': user.id
            }
          });
        } else {
          // Pour la CRÉATION
          sceneData = {
            titre: this.form.titre,
            ordre: parseInt(this.form.ordre),
            sequenceId: this.form.sequenceId,
            statutId: this.form.statutId,
            synopsis: this.form.synopsis
          };
          
          response = await axios.post(`/api/scenes/sequences/${this.form.sequenceId}`, sceneData, {
            headers: {
              'X-User-Id': user.id
            }
          });
        }
        
        if (response.status === 201 || response.status === 200) {
          await this.fetchExistingScenes();
          await this.loadSceneStatistics();
          
          if (this.isEditing) {
            this.resetForm();
          } else {
            this.goBackToSequenceDetails();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création/modification de la scène:', error);
        
        if (error.response?.status === 400) {
          if (error.response?.data?.message?.includes('ordre')) {
            this.ordreError = 'Cet ordre existe déjà pour cette séquence. Veuillez choisir un autre numéro.';
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
        sequenceId: this.sequenceId,
        statutId: '',
        synopsis: ''
      };
      this.isEditing = false;
      this.editingId = null;
      this.errorMessage = '';
      this.ordreError = '';
      
      // Recharger les données
      this.loadSequence();
      this.fetchExistingScenes();
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    goBackToSequenceDetails() {
      this.$router.push(`/sequence/${this.sequenceId}/detail-sequence`);
    }
  }
};
</script>