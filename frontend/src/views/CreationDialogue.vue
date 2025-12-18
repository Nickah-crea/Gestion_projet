<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-crea-dialogue">
      <div class="sidebar-header-crea-dialogue">
        <h2 class="sidebar-title-crea-dialogue">Gestion Dialogues</h2>
        <p class="sidebar-subtitle-crea-dialogue">Créez et gérez vos dialogues</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-crea-dialogue">
        <h3 class="section-title-crea-dialogue"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-crea-dialogue">
          <button 
            @click="goToForm" 
            class="sidebar-btn-crea-dialogue" 
            :class="{ active: activeTab === 'form' && !isEditing }"
          >
            <i class="fas fa-plus"></i>
            Nouveau dialogue
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-crea-dialogue"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-crea-dialogue">
        <h3 class="section-title-crea-dialogue"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-crea-dialogue">
          <div class="filter-item-crea-dialogue">
            <label>Scène</label>
            <div class="search-container-crea-dialogue">
              <input
                type="text"
                v-model="filterSceneSearch"
                @focus="showFilterSceneSuggestions = true"
                @blur="hideFilterSceneSuggestions"
                @input="filterFilterScenes"
                :placeholder="filterSceneId ? getSceneName(filterSceneId) : 'Toutes les scènes'"
                class="search-input-crea-dialogue"
              />
              <div v-if="showFilterSceneSuggestions && filteredFilterScenes.length" class="suggestions-dropdown-crea-dialogue">
                <div
                  v-for="scene in filteredFilterScenes"
                  :key="scene.idScene"
                  @mousedown="selectFilterScene(scene)"
                  class="suggestion-item-crea-dialogue"
                >
                  {{ scene.titre }}
                </div>
                <div @mousedown="clearFilterScene" class="suggestion-item-crea-dialogue clear-filter">
                  ✕ Effacer le filtre
                </div>
              </div>
            </div>
          </div>
          
          <div class="filter-item-crea-dialogue">
            <label>Personnage</label>
            <div class="search-container-crea-dialogue">
              <input
                type="text"
                v-model="filterPersonnageSearch"
                @focus="showFilterPersonnageSuggestions = true"
                @blur="hideFilterPersonnageSuggestions"
                @input="filterFilterPersonnages"
                :placeholder="filterPersonnageId ? (filterPersonnageId === 'null' ? 'Narration' : getPersonnageName(filterPersonnageId)) : 'Tous les personnages'"
                class="search-input-crea-dialogue"
              />
              <div v-if="showFilterPersonnageSuggestions && filteredFilterPersonnages.length" class="suggestions-dropdown-crea-dialogue">
                <div @mousedown="selectFilterPersonnage('null')" class="suggestion-item-crea-dialogue">
                  Narration
                </div>
                <div
                  v-for="personnage in filteredFilterPersonnages"
                  :key="personnage.id"
                  @mousedown="selectFilterPersonnage(personnage.id)"
                  class="suggestion-item-crea-dialogue"
                >
                  {{ personnage.nom }}
                </div>
                <div @mousedown="clearFilterPersonnage" class="suggestion-item-crea-dialogue clear-filter">
                  ✕ Effacer le filtre
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-crea-dialogue">
        <h3 class="section-title-crea-dialogue"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-crea-dialogue">
          <div class="stat-item-crea-dialogue">
            <span class="stat-number-crea-dialogue">{{ dialogues.length }}</span>
            <span class="stat-label-crea-dialogue">Total dialogues</span>
          </div>
          <div class="stat-item-crea-dialogue">
            <span class="stat-number-crea-dialogue">{{ getDialoguesNarration }}</span>
            <span class="stat-label-crea-dialogue">Narrations</span>
          </div>
          <div class="stat-item-crea-dialogue">
            <span class="stat-number-crea-dialogue">{{ getDialoguesAvecPersonnage }}</span>
            <span class="stat-label-crea-dialogue">Avec personnage</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-dialogue">
      <div class="creation-main-content-crea-dialogue">
        
        <!-- En-tête principal -->
        <!-- <div class="main-header-crea-dialogue">
          <h1 class="page-title-crea-dialogue"><i class="fas fa-comments"></i> Gestion des Dialogues</h1>
          <p class="page-subtitle-crea-dialogue">Créez, modifiez et gérez l'ensemble des dialogues de vos scènes</p>
        </div> -->

        <!-- Système d'onglets -->
        <div class="tabs-container-crea-dialogue">
          <div class="tabs-header-crea-dialogue">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-crea-dialogue', { active: activeTab === 'form' }]"
            >
              <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
              {{ isEditing ? 'Modifier dialogue' : 'Créer dialogue' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-dialogue', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste dialogues
            </button>
          </div>
          
          <div class="tabs-content-crea-dialogue">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-crea-dialogue" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-crea-dialogue">
              <!-- Formulaire de création/modification -->
              <div class="form-container-crea-dialogue">
                <div class="form-header-crea-dialogue">
                  <h3>
                    <i :class="isEditing ? 'fas fa-marker' : 'fas fa-plus'"></i>
                    {{ isEditing ? 'Modifier le dialogue' : 'Créer un nouveau dialogue' }}
                  </h3>
                  <button 
                    v-if="isEditing"
                    @click="goToForm"
                    class="back-btn-crea-dialogue"
                  >
                    <i class="fas fa-plus"></i> Nouveau dialogue
                  </button>
                </div>

                <form @submit.prevent="submitForm" class="dialogue-form-crea-dialogue">
                  <!-- Ligne 1 : Scène + Personnage -->
                  <div class="form-row-crea-dialogue">
                    <div class="form-group-crea-dialogue">
                      <label for="sceneSearch">Scène *</label>
                      <div class="search-container-crea-dialogue">
                        <input
                          type="text"
                          id="sceneSearch"
                          v-model="sceneSearch"
                          @focus="showSceneSuggestions = true"
                          @blur="hideSceneSuggestions"
                          @input="filterScenes"
                          :placeholder="formData.sceneId ? getSceneName(formData.sceneId) : 'Rechercher une scène...'"
                          required
                          class="search-input-crea-dialogue"
                        />
                        <div v-if="showSceneSuggestions && filteredScenes.length" class="suggestions-dropdown-crea-dialogue">
                          <div
                            v-for="scene in filteredScenes"
                            :key="scene.idScene"
                            @mousedown="selectScene(scene)"
                            class="suggestion-item-crea-dialogue"
                          >
                            <div class="scene-option-info-crea-dialogue">
                              <div class="scene-title-crea-dialogue">{{ scene.titre }}</div>
                              <div class="scene-details-crea-dialogue">{{ scene.sequenceTitre }}</div>
                            </div>
                          </div>
                        </div>
                        <div v-if="showSceneSuggestions && filteredScenes.length === 0" class="no-results-crea-dialogue">
                          <i class="fas fa-search"></i> Aucune scène trouvée
                        </div>
                      </div>
                    </div>

                    <div class="form-group-crea-dialogue">
                      <label for="personnageSearch">Personnage</label>
                      <div class="search-container-crea-dialogue">
                        <input
                          type="text"
                          id="personnageSearch"
                          v-model="personnageSearch"
                          @focus="showPersonnageSuggestions = true"
                          @blur="hidePersonnageSuggestions"
                          @input="filterPersonnages"
                          :placeholder="formData.personnageId ? getPersonnageName(formData.personnageId) : 'Rechercher un personnage...'"
                          class="search-input-crea-dialogue"
                        />
                        <div v-if="showPersonnageSuggestions && filteredPersonnages.length" class="suggestions-dropdown-crea-dialogue">
                          <div
                            v-for="personnage in filteredPersonnages"
                            :key="personnage.id"
                            @mousedown="selectPersonnage(personnage)"
                            class="suggestion-item-crea-dialogue"
                          >
                            <div class="scene-option-info-crea-dialogue">
                              <div class="scene-title-crea-dialogue">{{ personnage.nom }}</div>
                              <div class="scene-details-crea-dialogue">{{ personnage.projetTitre }}</div>
                            </div>
                          </div>
                        </div>
                        <div v-if="showPersonnageSuggestions && filteredPersonnages.length === 0" class="no-results-crea-dialogue">
                          <i class="fas fa-search"></i> Aucun personnage trouvé
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Ligne 2 : Texte -->
                  <div class="form-row-crea-dialogue">
                    <div class="form-group-crea-dialogue full-width">
                      <label for="texte">Texte du dialogue *</label>
                      <textarea 
                        id="texte"
                        v-model="formData.texte" 
                        required 
                        rows="4" 
                        placeholder="Entrez le texte du dialogue..."
                        class="form-textarea-crea-dialogue"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Ligne 3 : Ordre + Observation -->
                  <div class="form-row-crea-dialogue">
                    <div class="form-group-crea-dialogue">
                      <label for="ordre">Ordre *</label>
                      <input 
                        id="ordre"
                        v-model="formData.ordre" 
                        type="number" 
                        min="1" 
                        required
                        @blur="validateOrder"
                        :class="['search-input-crea-dialogue', { 'error-input': orderError }]"
                      >
                      <div v-if="suggestedOrder" class="suggestion-text-crea-dialogue">
                        Suggestion: Le prochain ordre disponible est {{ suggestedOrder }}
                        <button type="button" @click="useSuggestedOrder" class="suggestion-btn-crea-dialogue">
                          Utiliser cette valeur
                        </button>
                      </div>
                      <div v-if="orderError" class="error-text-crea-dialogue">
                        {{ orderError }}
                      </div>
                    </div>

                    <div class="form-group-crea-dialogue">
                      <label for="observation">Observation</label>
                      <textarea 
                        id="observation"
                        v-model="formData.observation" 
                        rows="3" 
                        placeholder="Notes ou observations..."
                        class="form-textarea-crea-dialogue"
                      ></textarea>
                    </div>
                  </div>

                  <div v-if="error" class="error-message-crea-dialogue">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-crea-dialogue">
                    <button
                      v-if="isEditing"
                      type="button"
                      @click="goToForm"
                      class="cancel-btn-crea-dialogue"
                    >
                      <i class="fas fa-times"></i> Annuler
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="submit-btn-crea-dialogue"
                    >
                      <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                      <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                      {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer le dialogue') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Contenu de l'onglet Liste -->
            <div v-show="activeTab === 'list'" class="tab-pane-crea-dialogue">
              <!-- Liste des dialogues -->
              <div class="dialogues-list-crea-dialogue">
                <div class="list-header-crea-dialogue">
                  <h3><i class="fas fa-comments"></i> Liste des dialogues ({{ filteredDialogues.length }})</h3>
                  
                  <div class="search-section-crea-dialogue">
                    <div class="search-group-crea-dialogue">
                      <label for="dialogueSearch">Rechercher un dialogue</label>
                      <div class="search-input-container-crea-dialogue">
                        <i class="fas fa-search search-icon-crea-dialogue"></i>
                        <input
                          type="text"
                          id="dialogueSearch"
                          v-model="searchTerm"
                          placeholder="Rechercher par texte..."
                          class="search-input-large-crea-dialogue"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="loading-state-crea-dialogue">
                  <i class="fas fa-spinner fa-spin"></i>
                  <h3>Chargement des dialogues...</h3>
                </div>
                
                <div v-else-if="filteredDialogues.length === 0" class="empty-state-crea-dialogue">
                  <i class="fas fa-comments"></i>
                  <h3>Aucun dialogue trouvé</h3>
                  <div v-if="searchTerm || filterSceneId || filterPersonnageId">
                    <p>Aucun dialogue ne correspond à vos critères de recherche.</p>
                  </div>
                  <div v-else>
                    <p>Aucun dialogue créé pour le moment.</p>
                  </div>
                </div>

                <div v-else class="dialogues-container-crea-dialogue">
                  <div class="dialogues-grid-crea-dialogue">
                    <div v-for="dialogue in filteredDialogues" :key="dialogue.id" class="dialogue-card-crea-dialogue">
                      <div class="dialogue-header-crea-dialogue">
                        <div class="dialogue-info-crea-dialogue">
                          <h4 class="dialogue-title-crea-dialogue">
                            <i class="fas fa-comment"></i>
                            {{ dialogue.personnageNom || 'Narration' }}
                          </h4>
                          <span class="scene-badge-crea-dialogue">{{ dialogue.sceneTitre }}</span>
                        </div>
                        <div class="dialogue-actions-crea-dialogue">
                          <button @click="openDialogueComments(dialogue)" class="btn-comment-crea-dialogue" title="Commentaires">
                            <i class="fas fa-comment"></i>
                            {{ dialogue.commentCount || 0 }}
                          </button>
                          <button @click="editDialogue(dialogue)" class="btn-edit-crea-dialogue" title="Modifier">
                            <i class="fas fa-marker"></i>
                          </button>
                          <button @click="deleteDialogue(dialogue.id)" class="btn-delete-crea-dialogue" title="Supprimer">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div class="dialogue-content-crea-dialogue">
                        <div class="dialogue-text-crea-dialogue">
                          {{ dialogue.texte }}
                        </div>
                        <div class="dialogue-meta-crea-dialogue">
                          <div class="meta-item-crea-dialogue">
                            <i class="fas fa-sort-numeric-down"></i>
                            <span>Ordre: {{ dialogue.ordre }}</span>
                          </div>
                          <div v-if="dialogue.observation" class="meta-item-crea-dialogue">
                            <i class="fas fa-sticky-note"></i>
                            <span>{{ dialogue.observation }}</span>
                          </div>
                          <div class="meta-item-crea-dialogue">
                            <i class="fas fa-calendar"></i>
                            <span>{{ formatDate(dialogue.creeLe) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale pour afficher les commentaires du dialogue -->
    <div v-if="showDialogueCommentModal" class="modal-overlay-crea-dialogue" @click="showDialogueCommentModal = false">
      <div class="modal-content-crea-dialogue" @click.stop>
        <div class="modal-header-crea-dialogue">
          <h3>
            <i class="fas fa-comments"></i>
            Commentaires - {{ selectedDialogue.personnageNom || 'Narration' }}
          </h3>
          <button @click="showDialogueCommentModal = false" class="modal-close-btn-crea-dialogue">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-crea-dialogue">
          <!-- Formulaire d'ajout de commentaire -->
          <div class="add-comment-crea-dialogue">
            <textarea v-model="newDialogueComment" placeholder="Ajouter un commentaire..." rows="3" class="comment-textarea-crea-dialogue"></textarea>
            <button @click="addDialogueComment" class="add-comment-btn-crea-dialogue">
              <i class="fas fa-plus"></i> Ajouter
            </button>
          </div>
          
          <!-- Liste des commentaires -->
          <div class="comments-list-crea-dialogue">
            <div v-for="comment in dialogueComments" :key="comment.id" class="comment-item-crea-dialogue">
              <div class="comment-header-crea-dialogue">
                <span class="comment-author-crea-dialogue">{{ comment.utilisateurNom }}</span>
                <span class="comment-date-crea-dialogue">{{ formatDate(comment.creeLe) }}</span>
              </div>
              <div class="comment-content-crea-dialogue">
                {{ comment.contenu }}
              </div>
              <div class="comment-actions-crea-dialogue" v-if="comment.utilisateurId === user.id">
                <button @click="deleteDialogueComment(comment.id)" class="delete-comment-btn-crea-dialogue">
                  <i class="fas fa-trash"></i> Supprimer
                </button>
              </div>
            </div>
            
            <div v-if="dialogueComments.length === 0" class="no-comments-crea-dialogue">
              <i class="fas fa-info-circle"></i>
              Aucun commentaire pour ce dialogue.
            </div>
          </div>
        </div>
        
        <div class="modal-footer-crea-dialogue">
          <button type="button" @click="showDialogueCommentModal = false" class="btn-close-modal-crea-dialogue">
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
  name: 'CreationDialogue',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      activeTab: 'form',
      formData: {
        sceneId: '',
        personnageId: null,
        texte: '',
        ordre: 1,
        observation: ''
      },
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: true,
      error: '',
      
      // Données pour les listes
      scenes: [],
      personnages: [],
      dialogues: [],
      filteredDialogues: [],
      
      // Filtres et recherche
      searchTerm: '',
      filterSceneId: '',
      filterPersonnageId: '',
      
      // Commentaires
      showDialogueCommentModal: false,
      dialogueComments: [],
      newDialogueComment: '',
      selectedDialogue: {},
      
      // Gestion des ordres
      existingOrders: [], 
      suggestedOrder: null,
      orderError: '',
      originalOrder: null,
      
      // Zones de liste modifiable
      sceneSearch: '',
      personnageSearch: '',
      filterSceneSearch: '',
      filterPersonnageSearch: '',
      showSceneSuggestions: false,
      showPersonnageSuggestions: false,
      showFilterSceneSuggestions: false,
      showFilterPersonnageSuggestions: false,
      filteredScenes: [],
      filteredPersonnages: [],
      filteredFilterScenes: [],
      filteredFilterPersonnages: []
    };
  },
  computed: {
    getTabIndicatorStyle() {
      const tabWidth = 100 / 2;
      const translateX = this.activeTab === 'form' ? 0 : 100;
      return {
        transform: `translateX(${translateX}%)`,
        width: `${tabWidth}%`
      };
    },
    getDialoguesNarration() {
      return this.dialogues.filter(d => !d.personnageId).length;
    },
    getDialoguesAvecPersonnage() {
      return this.dialogues.filter(d => d.personnageId).length;
    },
    filteredDialogues() {
      return this.dialogues.filter(dialogue => {
        const matchesSearch = dialogue.texte.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesScene = !this.filterSceneId || dialogue.sceneId === parseInt(this.filterSceneId);
        const matchesPersonnage = !this.filterPersonnageId || 
          (this.filterPersonnageId === 'null' && !dialogue.personnageId) || 
          dialogue.personnageId === parseInt(this.filterPersonnageId);
        return matchesSearch && matchesScene && matchesPersonnage;
      });
    }
  },
  async created() {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    await this.loadScenes();
    await this.loadPersonnages();
    await this.loadDialogues();
    document.addEventListener('click', this.handleClickOutside);
  },
  watch: {
    'formData.sceneId': function(newSceneId) {
      if (newSceneId) {
        this.loadExistingOrders();
      } else {
        this.existingOrders = [];
        this.suggestedOrder = null;
        this.orderError = '';
      }
    },
    scenes: {
      handler(newVal) {
        this.filteredScenes = [...newVal];
        this.filteredFilterScenes = [...newVal];
      },
      deep: true
    },
    personnages: {
      handler(newVal) {
        this.filteredPersonnages = [...newVal];
        this.filteredFilterPersonnages = [...newVal];
      },
      deep: true
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    // Navigation entre onglets
    goToForm() {
      this.activeTab = 'form';
      this.resetForm();
    },
    goToList() {
      this.activeTab = 'list';
      this.loadDialogues();
    },
    handleClickOutside(event) {
      if (!event.target.closest('.search-container-crea-dialogue')) {
        this.showSceneSuggestions = false;
        this.showPersonnageSuggestions = false;
        this.showFilterSceneSuggestions = false;
        this.showFilterPersonnageSuggestions = false;
      }
    },
    async loadScenes() {
      try {
        const response = await axios.get('/api/scenes');
        this.scenes = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des scènes:', error);
        alert('Erreur lors du chargement des scènes');
      }
    },
    async loadPersonnages() {
      try {
        const response = await axios.get('/api/personnages');
        this.personnages = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
        alert('Erreur lors du chargement des personnages');
      }
    },
    async loadDialogues() {
      this.loading = true;
      try {
        const response = await axios.get('/api/dialogues');
        this.dialogues = response.data;
        await this.loadCommentCounts();
      } catch (error) {
        console.error('Erreur lors du chargement des dialogues:', error);
        this.error = 'Erreur lors du chargement des dialogues: ' + (error.response?.data?.message || error.message);
      } finally {
        this.loading = false;
      }
    },
    async loadExistingOrders() {
      if (!this.formData.sceneId) return;
      
      try {
        const response = await axios.get(`/api/dialogues/scene/${this.formData.sceneId}`);
        this.existingOrders = response.data.map(dialogue => dialogue.ordre);
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
      
      if (!this.isEditing) {
        this.formData.ordre = this.suggestedOrder;
      }
    },
    validateOrder() {
      if (!this.formData.ordre) {
        this.orderError = 'L\'ordre est requis';
        return;
      }
      
      if (this.formData.ordre < 1) {
        this.orderError = 'L\'ordre doit être un nombre positif';
        return;
      }
      
      if (this.existingOrders.includes(this.formData.ordre) && 
          (!this.isEditing || this.formData.ordre !== this.originalOrder)) {
        this.orderError = `L'ordre ${this.formData.ordre} existe déjà dans cette scène`;
        return;
      }
      
      this.orderError = '';
    },
    useSuggestedOrder() {
      this.formData.ordre = this.suggestedOrder;
      this.validateOrder();
    },
    async submitForm() {
      this.validateOrder();
      
      if (this.orderError) {
        alert('Veuillez corriger les erreurs avant de soumettre');
        return;
      }
      
      this.isSubmitting = true;
      try {
        const payload = {
          ...this.formData,
          sceneId: parseInt(this.formData.sceneId),
          personnageId: this.formData.personnageId ? parseInt(this.formData.personnageId) : null,
          ordre: parseInt(this.formData.ordre)
        };
        
        if (this.isEditing) {
          await axios.put(`/api/dialogues/${this.editingId}`, payload);
          alert('Dialogue modifié avec succès!');
        } else {
          await axios.post('/api/dialogues', payload);
          alert('Dialogue créé avec succès!');
        }
        
        this.resetForm();
        await this.loadDialogues();
        this.activeTab = 'list';
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du dialogue:', error);
        
        if (error.response?.status === 400 && 
            error.response?.data?.message?.includes('ordre') &&
            error.response?.data?.message?.includes('existe')) {
          this.orderError = 'Cet ordre existe déjà dans la scène';
          alert('Erreur de validation: ' + this.orderError);
          await this.loadExistingOrders();
        } else {
          this.error = 'Erreur: ' + (error.response?.data?.message || error.message);
        }
      } finally {
        this.isSubmitting = false;
      }
    }, 
    editDialogue(dialogue) {
      this.formData = {
        sceneId: dialogue.sceneId.toString(),
        personnageId: dialogue.personnageId ? dialogue.personnageId.toString() : null,
        texte: dialogue.texte,
        ordre: dialogue.ordre,
        observation: dialogue.observation || ''
      };
      this.isEditing = true;
      this.editingId = dialogue.id;
      this.originalOrder = dialogue.ordre;
      
      this.sceneSearch = this.getSceneName(dialogue.sceneId);
      if (dialogue.personnageId) {
        this.personnageSearch = this.getPersonnageName(dialogue.personnageId);
      } else {
        this.personnageSearch = '';
      }
      
      this.loadExistingOrders();
      this.activeTab = 'form';
    },
    async deleteDialogue(dialogueId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce dialogue ?')) {
        return;
      }
      
      try {
        await axios.delete(`/api/dialogues/${dialogueId}`);
        await this.loadDialogues();
        alert('Dialogue supprimé avec succès!');
      } catch (error) {
        console.error('Erreur lors de la suppression du dialogue:', error);
        alert('Erreur: ' + (error.response?.data?.message || error.message));
      }
    },
    resetForm() {
      this.formData = {
        sceneId: '',
        personnageId: null,
        texte: '',
        ordre: 1,
        observation: ''
      };
      this.sceneSearch = '';
      this.personnageSearch = '';
      this.isEditing = false;
      this.editingId = null;
      this.originalOrder = null;
      this.existingOrders = [];
      this.suggestedOrder = null;
      this.orderError = '';
      this.showSceneSuggestions = false;
      this.showPersonnageSuggestions = false;
      this.error = '';
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
    async openDialogueComments(dialogue) {
      this.selectedDialogue = dialogue;
      await this.loadDialogueComments(dialogue.id);
      this.showDialogueCommentModal = true;
    },
    async loadDialogueComments(dialogueId) {
      try {
        const response = await axios.get(`/api/dialogues/commentaires/dialogue/${dialogueId}`);
        this.dialogueComments = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires de dialogue:', error);
        this.dialogueComments = [];
        alert('Erreur lors du chargement des commentaires');
      }
    },
    async addDialogueComment() {
      if (!this.newDialogueComment.trim()) {
        alert('Le commentaire ne peut pas être vide');
        return;
      }
      
      try {
        await axios.post('/api/dialogues/commentaires', {
          contenu: this.newDialogueComment,
          dialogueId: this.selectedDialogue.id
        }, {
          headers: {
            'X-User-Id': this.user.id
          }
        });
        
        this.newDialogueComment = '';
        await this.loadDialogueComments(this.selectedDialogue.id);
        await this.loadDialogues();
        alert('Commentaire ajouté avec succès!');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        alert('Erreur lors de l\'ajout du commentaire: ' + (error.response?.data?.message || error.message));
      }
    },
    async deleteDialogueComment(commentId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
        return;
      }
      
      try {
        await axios.delete(`/api/dialogues/commentaires/${commentId}`);
        await this.loadDialogueComments(this.selectedDialogue.id);
        await this.loadDialogues();
        alert('Commentaire supprimé avec succès!');
      } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        alert('Erreur lors de la suppression du commentaire: ' + (error.response?.data?.message || error.message));
      }
    },
    async loadCommentCounts() {
      for (let dialogue of this.dialogues) {
        try {
          const response = await axios.get(`/api/dialogues/commentaires/dialogue/${dialogue.id}/count`);
          dialogue.commentCount = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement du nombre de commentaires:', error);
          dialogue.commentCount = 0;
        }
      }
    },
    // Méthodes pour les zones de liste modifiable
    filterScenes() {
      const searchTerm = this.sceneSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredScenes = [...this.scenes];
        return;
      }
      this.filteredScenes = this.scenes.filter(scene => 
        scene.titre.toLowerCase().includes(searchTerm) || 
        scene.sequenceTitre.toLowerCase().includes(searchTerm)
      );
    },
    filterPersonnages() {
      const searchTerm = this.personnageSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredPersonnages = [...this.personnages];
        return;
      }
      this.filteredPersonnages = this.personnages.filter(personnage => 
        personnage.nom.toLowerCase().includes(searchTerm) || 
        personnage.projetTitre.toLowerCase().includes(searchTerm)
      );
    },
    filterFilterScenes() {
      const searchTerm = this.filterSceneSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredFilterScenes = [...this.scenes];
        return;
      }
      this.filteredFilterScenes = this.scenes.filter(scene => 
        scene.titre.toLowerCase().includes(searchTerm)
      );
    },
    filterFilterPersonnages() {
      const searchTerm = this.filterPersonnageSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredFilterPersonnages = [...this.personnages];
        return;
      }
      this.filteredFilterPersonnages = this.personnages.filter(personnage => 
        personnage.nom.toLowerCase().includes(searchTerm)
      );
    },
    selectScene(scene) {
      this.formData.sceneId = scene.idScene;
      this.sceneSearch = scene.titre;
      this.showSceneSuggestions = false;
    },
    selectPersonnage(personnage) {
      this.formData.personnageId = personnage.id;
      this.personnageSearch = personnage.nom;
      this.showPersonnageSuggestions = false;
    },
    selectFilterScene(scene) {
      this.filterSceneId = scene.idScene;
      this.filterSceneSearch = scene.titre;
      this.showFilterSceneSuggestions = false;
    },
    selectFilterPersonnage(personnageId) {
      this.filterPersonnageId = personnageId;
      if (personnageId === 'null') {
        this.filterPersonnageSearch = 'Narration';
      } else {
        const personnage = this.personnages.find(p => p.id === parseInt(personnageId));
        this.filterPersonnageSearch = personnage ? personnage.nom : '';
      }
      this.showFilterPersonnageSuggestions = false;
    },
    clearFilterScene() {
      this.filterSceneId = '';
      this.filterSceneSearch = '';
      this.showFilterSceneSuggestions = false;
    },
    clearFilterPersonnage() {
      this.filterPersonnageId = '';
      this.filterPersonnageSearch = '';
      this.showFilterPersonnageSuggestions = false;
    },
    hideSceneSuggestions() {
      setTimeout(() => {
        this.showSceneSuggestions = false;
      }, 200);
    },
    hidePersonnageSuggestions() {
      setTimeout(() => {
        this.showPersonnageSuggestions = false;
      }, 200);
    },
    hideFilterSceneSuggestions() {
      setTimeout(() => {
        this.showFilterSceneSuggestions = false;
      }, 200);
    },
    hideFilterPersonnageSuggestions() {
      setTimeout(() => {
        this.showFilterPersonnageSuggestions = false;
      }, 200);
    },
    getSceneName(id) {
      const scene = this.scenes.find(s => s.idScene === parseInt(id));
      return scene ? scene.titre : '';
    },
    getPersonnageName(id) {
      const personnage = this.personnages.find(p => p.id === parseInt(id));
      return personnage ? personnage.nom : '';
    }
  }
};
</script>

