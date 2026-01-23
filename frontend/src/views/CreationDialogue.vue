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
                  :key="scene.id"
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
                            :key="scene.id"
                            @mousedown="selectScene(scene)"
                            class="suggestion-item-crea-dialogue"
                          >
                            <div class="scene-option-info-crea-dialogue">
                              <div class="scene-title-crea-dialogue">{{ scene.titre }}</div>
                              <div class="scene-details-crea-dialogue">{{ scene.sequenceTitre || scene.sequence?.titre || '' }}</div>
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
                              <div class="scene-details-crea-dialogue">{{ personnage.projetTitre || personnage.projet?.titre || '' }}</div>
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
                      <label for="texte">Texte du dialogue</label>
                      <textarea 
                        id="texte"
                        v-model="formData.texte"  
                        rows="4" 
                        placeholder="Entrez le texte du dialogue..."
                        class="form-textarea-crea-dialogue"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Ligne 3 : Ordre + Observation -->
                  <div class="form-row-crea-dialogue">
                    <div class="form-group-crea-dialogue">
                      <label for="ordre">Ordre</label>
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
                  <h3><i class="fas fa-comments"></i> Liste des dialogues ({{ totalDialoguesCount }})</h3>
                  
                  <div class="search-section-crea-dialogue">
                    <div class="search-group-crea-dialogue">
                      <div class="search-input-container-crea-dialogue">
                        <i class="fas fa-search search-icon-crea-dialogue"></i>
                        <input
                          type="text"
                          id="dialogueSearch"
                          v-model="searchTerm"
                          placeholder=" Rechercher par texte..."
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
                
                <div v-else-if="groupedDialogues.length === 0" class="empty-state-crea-dialogue">
                  <i class="fas fa-comments"></i>
                  <h3>Aucun dialogue trouvé</h3>
                  <div v-if="searchTerm || filterSceneId || filterPersonnageId">
                    <p>Aucun dialogue ne correspond à vos critères de recherche.</p>
                    <button @click="clearFilters" class="clear-filters-btn-crea-dialogue">
                      <i class="fas fa-times"></i> Effacer les filtres
                    </button>
                  </div>
                  <div v-else>
                    <p>Aucun dialogue créé pour le moment.</p>
                    <button @click="goToForm" class="create-first-btn-crea-dialogue">
                      <i class="fas fa-plus"></i> Créer votre premier dialogue
                    </button>
                  </div>
                </div>

                <div v-else class="dialogues-container-crea-dialogue">
                  
                  <!-- Groupes de dialogues par scène -->
                  <div v-for="sceneGroup in groupedDialogues" :key="sceneGroup.sceneId" class="scene-group-crea-dialogue">
                    <div class="scene-group-header-crea-dialogue">
                      <h4 class="scene-group-title-crea-dialogue">
                        <i class="fas fa-film"></i>
                        {{ sceneGroup.sceneTitre || 'Scène sans titre' }}
                        <span class="scene-dialogue-count-crea-dialogue">
                          ({{ sceneGroup.dialogues.length }} dialogue{{ sceneGroup.dialogues.length > 1 ? 's' : '' }})
                        </span>
                      </h4>
                    </div>
                    
                    <div class="scene-dialogues-container-crea-dialogue">
                      <!-- Dialogues visibles (limités par visibleCount) -->
                      <div class="dialogues-list-in-scene-crea-dialogue">
                        <div v-for="dialogue in getVisibleDialogues(sceneGroup)" 
                             :key="dialogue.id" 
                             class="dialogue-card-crea-dialogue">
                          <div class="dialogue-header-crea-dialogue">
                            <div class="dialogue-info-crea-dialogue">
                              <h4 class="dialogue-title-crea-dialogue">
                                <!-- <i class="fas fa-comments"></i> -->
                                {{ dialogue.personnageNom || dialogue.personnage?.nom || 'Narration' }}
                                <!-- <span class="dialogue-order-crea-dialogue">#{{ dialogue.ordre }}</span> : --> :
                                 <span class="dialogue-texte-crea-dialogue">{{ dialogue.texte }} </span> 
                              </h4>
                            </div>
                            <div class="dialogue-actions-crea-dialogue">
                              <button @click="openDialogueComments(dialogue)" class="btn-comment-crea-dialogue" title="Commentaires">
                                <i class="fas fa-comment"></i>
                                {{ dialogue.commentCount || 0 }}
                              </button>
                              <button @click="editDialogue(dialogue)" class="btn-edit-crea-dialogue" title="Modifier">
                                <i class="fas fa-marker"></i>
                              </button>
                              <button @click="confirmDeleteDialogue(dialogue)" class="btn-delete-crea-dialogue" title="Supprimer">
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          
                          <div class="dialogue-content-crea-dialogue">
                           
                            <div class="dialogue-meta-crea-dialogue">
                              <div v-if="dialogue.observation" class="meta-item-crea-dialogue">
                                <i class="fas fa-sticky-note"></i>
                                <span>{{ dialogue.observation }}</span>
                              </div>
                              <!-- <div class="meta-item-crea-dialogue">
                                <i class="fas fa-calendar"></i>
                                <span>{{ formatDate(dialogue.creeLe || dialogue.createdAt) }}</span>
                              </div> -->
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Bouton "Voir plus" si plus de dialogues que visibleCount -->
                      <div v-if="sceneGroup.dialogues.length > getVisibleCount(sceneGroup.sceneId)" 
                           class="see-more-container-crea-dialogue">
                        <button @click="showMoreDialogues(sceneGroup.sceneId)" class="see-more-btn-crea-dialogue">
                          <i class="fas fa-chevron-down"></i>
                          Voir plus ({{ sceneGroup.dialogues.length - getVisibleCount(sceneGroup.sceneId) }} restant{{ sceneGroup.dialogues.length - getVisibleCount(sceneGroup.sceneId) > 1 ? 's' : '' }})
                        </button>
                      </div>
                      
                      <!-- Bouton "Voir moins" si tous les dialogues sont visibles -->
                      <div v-if="getVisibleCount(sceneGroup.sceneId) > defaultVisibleCount && 
                                 getVisibleCount(sceneGroup.sceneId) >= sceneGroup.dialogues.length" 
                           class="see-less-container-crea-dialogue">
                        <button @click="showLessDialogues(sceneGroup.sceneId)" class="see-less-btn-crea-dialogue">
                          <i class="fas fa-chevron-up"></i>
                          Voir moins
                        </button>
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
            Commentaires - {{ selectedDialogue.personnageNom || selectedDialogue.personnage?.nom || 'Narration' }}
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
                <span class="comment-author-crea-dialogue">{{ comment.utilisateurNom || comment.user?.name || 'Utilisateur' }}</span>
                <span class="comment-date-crea-dialogue">{{ formatDate(comment.creeLe || comment.createdAt) }}</span>
              </div>
              <div class="comment-content-crea-dialogue">
                {{ comment.contenu || comment.content }}
              </div>
              <div class="comment-actions-crea-dialogue" v-if="comment.utilisateurId === user.id || comment.userId === user.id">
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

     <!-- Modal de confirmation de suppression -->
      <div v-if="showDeleteModal" class="delete-confirmation-modal-crea-dialogue">
        <div class="modal-overlay-crea-dialogue" @click="closeDeleteModal"></div>
        <div class="modal-content-confirm-crea-dialogue">
          <div class="modal-header-confirm-crea-dialogue">
            <h3><i class="fas fa-exclamation-triangle"></i> Confirmation de suppression</h3>
            <button @click="closeDeleteModal" class="close-modal-btn-crea-dialogue">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body-confirm-crea-dialogue">
            <div class="warning-icon-crea-dialogue">
              <i class="fas fa-trash"></i>
            </div>
            <p class="warning-text-crea-dialogue">
              Êtes-vous sûr de vouloir supprimer ce dialogue ?
            </p>
            <p class="warning-subtext-crea-dialogue">
              Cette action est irréversible. Tous les commentaires associés à ce dialogue seront également supprimés.
            </p>
          </div>
          
          <div class="modal-footer-confirm-crea-dialogue">
            <button @click="closeDeleteModal" class="cancel-confirm-btn-crea-dialogue">
              <i class="fas fa-times"></i> Annuler
            </button>
            <button @click="executeDeleteDialogue" class="delete-confirm-btn-crea-dialogue" :disabled="isDeleting">
              <span v-if="isDeleting"><i class="fas fa-spinner fa-spin"></i> Suppression...</span>
              <span v-else><i class="fas fa-trash"></i> Supprimer définitivement</span>
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'CreationDialogue',
  
  setup() {
    // Variables réactives
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const activeTab = ref('form');
    const formData = ref({
      sceneId: '',
      personnageId: null,
      texte: '',
      ordre: 1,
      observation: ''
    });
    const isEditing = ref(false);
    const editingId = ref(null);
    const isSubmitting = ref(false);
    const loading = ref(true);
    const error = ref('');
    
    // Données pour les listes
    const scenes = ref([]);
    const personnages = ref([]);
    const dialogues = ref([]);
    
    // Filtres et recherche
    const searchTerm = ref('');
    const filterSceneId = ref('');
    const filterPersonnageId = ref('');
    
    // Gestion de l'affichage par scène
    const visibleDialoguesCount = ref({}); // { sceneId: count }
    const defaultVisibleCount = ref(5); // Nombre de dialogues visibles par défaut
    
    // Commentaires
    const showDialogueCommentModal = ref(false);
    const dialogueComments = ref([]);
    const newDialogueComment = ref('');
    const selectedDialogue = ref({});
    
    // Gestion des ordres
    const existingOrders = ref([]);
    const suggestedOrder = ref(null);
    const orderError = ref('');
    const originalOrder = ref(null);
    
    // Zones de liste modifiable
    const sceneSearch = ref('');
    const personnageSearch = ref('');
    const filterSceneSearch = ref('');
    const filterPersonnageSearch = ref('');
    const showSceneSuggestions = ref(false);
    const showPersonnageSuggestions = ref(false);
    const showFilterSceneSuggestions = ref(false);
    const showFilterPersonnageSuggestions = ref(false);
    const filteredScenes = ref([]);
    const filteredPersonnages = ref([]);
    const filteredFilterScenes = ref([]);
    const filteredFilterPersonnages = ref([]);

    const showDeleteModal = ref(false);
    const dialogueToDelete = ref(null);
    const isDeleting = ref(false);
    
    // Debug
    const debugMode = ref(true); 
        
    // Computed properties
    const getTabIndicatorStyle = computed(() => {
      const tabWidth = 100 / 2;
      const translateX = activeTab.value === 'form' ? 0 : 100;
      return {
        transform: `translateX(${translateX}%)`,
        width: `${tabWidth}%`
      };
    });
    
    const getDialoguesNarration = computed(() => {
      return dialogues.value.filter(d => !d.personnageId && !d.personnage).length;
    });
    
    const getDialoguesAvecPersonnage = computed(() => {
      return dialogues.value.filter(d => d.personnageId || d.personnage).length;
    });
    
    const totalDialoguesCount = computed(() => {
      return filteredDialogues.value.length;
    });
    
    const filteredDialogues = computed(() => {
      console.log('Filtering dialogues:', {
        total: dialogues.value.length,
        searchTerm: searchTerm.value,
        filterSceneId: filterSceneId.value,
        filterPersonnageId: filterPersonnageId.value
      });
      
      return dialogues.value.filter(dialogue => {
        // Recherche par texte
        const matchesSearch = !searchTerm.value || 
          (dialogue.texte && dialogue.texte.toLowerCase().includes(searchTerm.value.toLowerCase()));
        
        // Filtre par scène
        const matchesScene = !filterSceneId.value || 
          dialogue.sceneId === parseInt(filterSceneId.value) || 
          (dialogue.scene && dialogue.scene.id === parseInt(filterSceneId.value));
        
        // Filtre par personnage
        let matchesPersonnage = true;
        if (filterPersonnageId.value) {
          if (filterPersonnageId.value === 'null') {
            matchesPersonnage = !dialogue.personnageId && !dialogue.personnage;
          } else {
            const personnageId = parseInt(filterPersonnageId.value);
            matchesPersonnage = dialogue.personnageId === personnageId || 
              (dialogue.personnage && dialogue.personnage.id === personnageId);
          }
        }
        
        const matches = matchesSearch && matchesScene && matchesPersonnage;
        if (matches) {
          console.log('Dialogue matches:', dialogue);
        }
        return matches;
      });
    });
    
    const groupedDialogues = computed(() => {
      console.log('Grouping dialogues:', filteredDialogues.value);
      
      // Grouper les dialogues par scène
      const grouped = {};
      
      filteredDialogues.value.forEach(dialogue => {
        // Extraire l'ID de la scène
        let sceneId;
        let sceneTitre;
        
        if (dialogue.sceneId) {
          sceneId = dialogue.sceneId;
          sceneTitre = dialogue.sceneTitre;
        } else if (dialogue.scene) {
          sceneId = dialogue.scene.id;
          sceneTitre = dialogue.scene.titre;
        } else {
          console.warn('Dialogue sans scène:', dialogue);
          return; // Skip les dialogues sans scène
        }
        
        if (!grouped[sceneId]) {
          grouped[sceneId] = {
            sceneId: sceneId,
            sceneTitre: sceneTitre || dialogue.scene?.titre || `Scène ${sceneId}`,
            dialogues: []
          };
        }
        grouped[sceneId].dialogues.push(dialogue);
      });
      
      // Trier les dialogues dans chaque scène par ordre
      Object.values(grouped).forEach(group => {
        group.dialogues.sort((a, b) => {
          const orderA = a.ordre || 999;
          const orderB = b.ordre || 999;
          return orderA - orderB;
        });
      });
      
      // Convertir en tableau et trier par titre de scène
      const result = Object.values(grouped).sort((a, b) => 
        (a.sceneTitre || '').localeCompare(b.sceneTitre || '')
      );
      
      console.log('Grouped result:', result);
      return result;
    });
    
    // Methods
    const goToForm = () => {
      activeTab.value = 'form';
      resetForm();
    };
    
    const goToList = () => {
      activeTab.value = 'list';
      loadDialogues();
    };
    
    const clearFilters = () => {
      searchTerm.value = '';
      filterSceneId.value = '';
      filterPersonnageId.value = '';
      filterSceneSearch.value = '';
      filterPersonnageSearch.value = '';
    };
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container-crea-dialogue')) {
        showSceneSuggestions.value = false;
        showPersonnageSuggestions.value = false;
        showFilterSceneSuggestions.value = false;
        showFilterPersonnageSuggestions.value = false;
      }
    };
    
    const loadScenes = async () => {
      try {
        const response = await axios.get('/api/scenes');
        console.log('Scenes loaded:', response.data);
        scenes.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des scènes:', error);
        alert('Erreur lors du chargement des scènes: ' + error.message);
      }
    };
    
    const loadPersonnages = async () => {
      try {
        const response = await axios.get('/api/personnages');
        console.log('Personnages loaded:', response.data);
        personnages.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
        alert('Erreur lors du chargement des personnages: ' + error.message);
      }
    };
    
    const loadDialogues = async () => {
      loading.value = true;
      try {
        console.log('Loading dialogues...');
        const response = await axios.get('/api/dialogues');
        console.log('Dialogues loaded:', response.data);
        dialogues.value = response.data;
        
        // Debug: Afficher le premier dialogue pour vérifier la structure
        if (dialogues.value.length > 0) {
          console.log('First dialogue structure:', dialogues.value[0]);
        }
        
        await loadCommentCounts();
        // Réinitialiser les compteurs visibles
        visibleDialoguesCount.value = {};
      } catch (error) {
        console.error('Erreur lors du chargement des dialogues:', error);
        error.value = 'Erreur lors du chargement des dialogues: ' + (error.response?.data?.message || error.message);
        alert('Erreur: ' + error.value);
      } finally {
        loading.value = false;
      }
    };
    
    const loadExistingOrders = async () => {
      if (!formData.value.sceneId) return;
      
      try {
        const response = await axios.get(`/api/dialogues/scene/${formData.value.sceneId}`);
        existingOrders.value = response.data.map(dialogue => dialogue.ordre);
        calculateSuggestedOrder();
      } catch (error) {
        console.error('Erreur lors du chargement des ordres existants:', error);
      }
    };
    
    const calculateSuggestedOrder = () => {
      if (existingOrders.value.length === 0) {
        suggestedOrder.value = 1;
      } else {
        const maxOrder = Math.max(...existingOrders.value);
        suggestedOrder.value = maxOrder + 1;
      }
      
      if (!isEditing.value) {
        formData.value.ordre = suggestedOrder.value;
      }
    };
    
    const validateOrder = () => {
      if (!formData.value.ordre) {
        orderError.value = 'L\'ordre est requis';
        return;
      }
      
      if (formData.value.ordre < 1) {
        orderError.value = 'L\'ordre doit être un nombre positif';
        return;
      }
      
      if (existingOrders.value.includes(formData.value.ordre) && 
          (!isEditing.value || formData.value.ordre !== originalOrder.value)) {
        orderError.value = `L'ordre ${formData.value.ordre} existe déjà dans cette scène`;
        return;
      }
      
      orderError.value = '';
    };
    
    const useSuggestedOrder = () => {
      formData.value.ordre = suggestedOrder.value;
      validateOrder();
    };
    
  const submitForm = async () => {
      // Valider les champs obligatoires
      if (!formData.value.sceneId) {
          alert('Veuillez sélectionner une scène');
          return;
      }
      
      // MODIFIÉ: Ne pas obliger le texte si observation présente
      const texte = formData.value.texte?.trim() || '';
      const observation = formData.value.observation?.trim() || '';
      
      if (!texte && !observation) {
          alert('Au moins le texte du dialogue ou une observation est obligatoire');
          return;
      }
      
      if (!formData.value.ordre || formData.value.ordre < 1) {
          alert('L\'ordre doit être un nombre positif');
          return;
      }
      
      validateOrder();
      
      if (orderError.value) {
          alert(orderError.value);
          return;
      }
      
      isSubmitting.value = true;
      error.value = '';
      
      try {
          const payload = {
              sceneId: parseInt(formData.value.sceneId),
              personnageId: formData.value.personnageId ? parseInt(formData.value.personnageId) : null,
              texte: texte, // Peut être vide si observation présente
              ordre: parseInt(formData.value.ordre),
              observation: observation // Peut être vide si texte présent
          };
          
          console.log('Submitting dialogue:', payload);
          
          if (isEditing.value) {
              const response = await axios.put(`/api/dialogues/${editingId.value}`, payload, {
                  headers: {
                      'X-User-Id': user.value.id
                  }
              });
              console.log('Update response:', response.data);
          } else {
              const response = await axios.post('/api/dialogues', payload, {
                  headers: {
                      'X-User-Id': user.value.id
                  }
              });
              console.log('Create response:', response.data);
          }
          
          resetForm();
          await loadDialogues();
          activeTab.value = 'list';
      } catch (error) {
          console.error('Erreur lors de la sauvegarde du dialogue:', error);
          console.error('Error details:', error.response);
          
          if (error.response?.status === 400) {
              const errorMessage = error.response?.data?.message || error.response?.data || 'Erreur de validation';
              error.value = errorMessage;
              alert('Erreur: ' + errorMessage);
              
              // Recharger les ordres existants si erreur d'ordre
              if (errorMessage.includes('ordre') || errorMessage.includes('existe')) {
                  await loadExistingOrders();
              }
          } else {
              error.value = 'Erreur: ' + (error.response?.data?.message || error.message);
              alert('Erreur lors de l\'opération: ' + error.value);
          }
      } finally {
          isSubmitting.value = false;
      }
  };
    
    const editDialogue = (dialogue) => {
      console.log('Editing dialogue:', dialogue);
      
      formData.value = {
        sceneId: (dialogue.sceneId || dialogue.scene?.id || '').toString(),
        personnageId: (dialogue.personnageId || dialogue.personnage?.id) ? 
          (dialogue.personnageId || dialogue.personnage.id).toString() : null,
        texte: dialogue.texte,
        ordre: dialogue.ordre,
        observation: dialogue.observation || ''
      };
      isEditing.value = true;
      editingId.value = dialogue.id;
      originalOrder.value = dialogue.ordre;
      
      sceneSearch.value = getSceneName(dialogue.sceneId || dialogue.scene?.id);
      if (dialogue.personnageId || dialogue.personnage) {
        personnageSearch.value = getPersonnageName(dialogue.personnageId || dialogue.personnage?.id);
      } else {
        personnageSearch.value = '';
      }
      
      loadExistingOrders();
      activeTab.value = 'form';
    };


    const confirmDeleteDialogue = (dialogue) => {
      dialogueToDelete.value = dialogue;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      dialogueToDelete.value = null;
      isDeleting.value = false;
    };

const executeDeleteDialogue = async () => {
  if (!dialogueToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    // Ajoutez l'en-tête X-User-Id
    await axios.delete(`/api/dialogues/${dialogueToDelete.value.id}`, {
      headers: {
        'X-User-Id': user.value.id
      }
    });
    
    await loadDialogues();
    closeDeleteModal();
    
    // Notification de succès
    if (typeof showNotification === 'function') {
      showNotification('Dialogue supprimé avec succès', 'success');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du dialogue:', error);
    
    // Affichez plus de détails sur l'erreur
    if (error.response?.data) {
      console.error('Détails de l\'erreur:', error.response.data);
    }
    
    // Notification d'erreur
    if (typeof showNotification === 'function') {
      showNotification('Erreur lors de la suppression du dialogue', 'error');
    } else {
      alert('Erreur lors de la suppression du dialogue: ' + (error.response?.data?.message || error.message));
    }
    isDeleting.value = false;
  }
};
        
    
    const resetForm = () => {
      formData.value = {
        sceneId: '',
        personnageId: null,
        texte: '',
        ordre: 1,
        observation: ''
      };
      sceneSearch.value = '';
      personnageSearch.value = '';
      isEditing.value = false;
      editingId.value = null;
      originalOrder.value = null;
      existingOrders.value = [];
      suggestedOrder.value = null;
      orderError.value = '';
      showSceneSuggestions.value = false;
      showPersonnageSuggestions.value = false;
      error.value = '';
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Date inconnue';
      try {
        return new Date(dateString).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return 'Date invalide';
      }
    };
    
    const openDialogueComments = async (dialogue) => {
      selectedDialogue.value = dialogue;
      await loadDialogueComments(dialogue.id);
      showDialogueCommentModal.value = true;
    };
    
    const loadDialogueComments = async (dialogueId) => {
      try {
        const response = await axios.get(`/api/dialogues/commentaires/dialogue/${dialogueId}`);
        dialogueComments.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires de dialogue:', error);
        dialogueComments.value = [];
        // Ne pas alerter si c'est juste qu'il n'y a pas de commentaires
        if (error.response?.status !== 404) {
          alert('Erreur lors du chargement des commentaires: ' + error.message);
        }
      }
    };
    
    const addDialogueComment = async () => {
      if (!newDialogueComment.value.trim()) {
        alert('Le commentaire ne peut pas être vide');
        return;
      }
      
      try {
        await axios.post('/api/dialogues/commentaires', {
          contenu: newDialogueComment.value,
          dialogueId: selectedDialogue.value.id
        }, {
          headers: {
            'X-User-Id': user.value.id
          }
        });
        
        newDialogueComment.value = '';
        await loadDialogueComments(selectedDialogue.value.id);
        await loadDialogues();
        alert('Commentaire ajouté avec succès!');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        alert('Erreur lors de l\'ajout du commentaire: ' + (error.response?.data?.message || error.message));
      }
    };
    
    const deleteDialogueComment = async (commentId) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
        return;
      }
      
      try {
        await axios.delete(`/api/dialogues/commentaires/${commentId}`);
        await loadDialogueComments(selectedDialogue.value.id);
        await loadDialogues();
        alert('Commentaire supprimé avec succès!');
      } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        alert('Erreur lors de la suppression du commentaire: ' + (error.response?.data?.message || error.message));
      }
    };
    
    const loadCommentCounts = async () => {
      for (let dialogue of dialogues.value) {
        try {
          const response = await axios.get(`/api/dialogues/commentaires/dialogue/${dialogue.id}/count`);
          dialogue.commentCount = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement du nombre de commentaires:', error);
          dialogue.commentCount = 0;
        }
      }
    };
    
    // Méthodes pour les zones de liste modifiable
    const filterScenes = () => {
      const searchTerm = sceneSearch.value.toLowerCase();
      if (!searchTerm) {
        filteredScenes.value = [...scenes.value];
        return;
      }
      filteredScenes.value = scenes.value.filter(scene => 
        scene.titre.toLowerCase().includes(searchTerm) || 
        (scene.sequenceTitre && scene.sequenceTitre.toLowerCase().includes(searchTerm)) ||
        (scene.sequence && scene.sequence.titre && scene.sequence.titre.toLowerCase().includes(searchTerm))
      );
    };
    
    const filterPersonnages = () => {
      const searchTerm = personnageSearch.value.toLowerCase();
      if (!searchTerm) {
        filteredPersonnages.value = [...personnages.value];
        return;
      }
      filteredPersonnages.value = personnages.value.filter(personnage => 
        personnage.nom.toLowerCase().includes(searchTerm) || 
        (personnage.projetTitre && personnage.projetTitre.toLowerCase().includes(searchTerm)) ||
        (personnage.projet && personnage.projet.titre && personnage.projet.titre.toLowerCase().includes(searchTerm))
      );
    };
    
    const filterFilterScenes = () => {
      const searchTerm = filterSceneSearch.value.toLowerCase();
      if (!searchTerm) {
        filteredFilterScenes.value = [...scenes.value];
        return;
      }
      filteredFilterScenes.value = scenes.value.filter(scene => 
        scene.titre.toLowerCase().includes(searchTerm)
      );
    };
    
    const filterFilterPersonnages = () => {
      const searchTerm = filterPersonnageSearch.value.toLowerCase();
      if (!searchTerm) {
        filteredFilterPersonnages.value = [...personnages.value];
        return;
      }
      filteredFilterPersonnages.value = personnages.value.filter(personnage => 
        personnage.nom.toLowerCase().includes(searchTerm)
      );
    };
    
    const selectScene = (scene) => {
      formData.value.sceneId = scene.id || scene.idScene;
      sceneSearch.value = scene.titre;
      showSceneSuggestions.value = false;
    };
    
    const selectPersonnage = (personnage) => {
      formData.value.personnageId = personnage.id;
      personnageSearch.value = personnage.nom;
      showPersonnageSuggestions.value = false;
    };
    
    const selectFilterScene = (scene) => {
      filterSceneId.value = scene.id || scene.idScene;
      filterSceneSearch.value = scene.titre;
      showFilterSceneSuggestions.value = false;
    };
    
    const selectFilterPersonnage = (personnageId) => {
      filterPersonnageId.value = personnageId;
      if (personnageId === 'null') {
        filterPersonnageSearch.value = 'Narration';
      } else {
        const personnage = personnages.value.find(p => p.id === parseInt(personnageId));
        filterPersonnageSearch.value = personnage ? personnage.nom : '';
      }
      showFilterPersonnageSuggestions.value = false;
    };
    
    const clearFilterScene = () => {
      filterSceneId.value = '';
      filterSceneSearch.value = '';
      showFilterSceneSuggestions.value = false;
    };
    
    const clearFilterPersonnage = () => {
      filterPersonnageId.value = '';
      filterPersonnageSearch.value = '';
      showFilterPersonnageSuggestions.value = false;
    };
    
    const hideSceneSuggestions = () => {
      setTimeout(() => {
        showSceneSuggestions.value = false;
      }, 200);
    };
    
    const hidePersonnageSuggestions = () => {
      setTimeout(() => {
        showPersonnageSuggestions.value = false;
      }, 200);
    };
    
    const hideFilterSceneSuggestions = () => {
      setTimeout(() => {
        showFilterSceneSuggestions.value = false;
      }, 200);
    };
    
    const hideFilterPersonnageSuggestions = () => {
      setTimeout(() => {
        showFilterPersonnageSuggestions.value = false;
      }, 200);
    };
    
    const getSceneName = (id) => {
      if (!id) return '';
      const scene = scenes.value.find(s => s.id === parseInt(id) || s.idScene === parseInt(id));
      return scene ? scene.titre : '';
    };
    
    const getPersonnageName = (id) => {
      if (!id) return '';
      const personnage = personnages.value.find(p => p.id === parseInt(id));
      return personnage ? personnage.nom : '';
    };
    
    // Méthodes pour gérer l'affichage des dialogues
    const getVisibleCount = (sceneId) => {
      return visibleDialoguesCount.value[sceneId] || defaultVisibleCount.value;
    };
    
    const getVisibleDialogues = (sceneGroup) => {
      const visibleCount = getVisibleCount(sceneGroup.sceneId);
      return sceneGroup.dialogues.slice(0, visibleCount);
    };
    
    const showMoreDialogues = (sceneId) => {
      const currentCount = getVisibleCount(sceneId);
      // Utilisation correcte pour Vue 3 Composition API
      visibleDialoguesCount.value = {
        ...visibleDialoguesCount.value,
        [sceneId]: currentCount + defaultVisibleCount.value
      };
    };
    
    const showLessDialogues = (sceneId) => {
      visibleDialoguesCount.value = {
        ...visibleDialoguesCount.value,
        [sceneId]: defaultVisibleCount.value
      };
    };
    
    // Initialisation
    onMounted(async () => {
      // Configuration de l'intercepteur axios
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

      await loadScenes();
      await loadPersonnages();
      await loadDialogues();
      document.addEventListener('click', handleClickOutside);
    });
    
    // Nettoyage
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });
    
    // Watchers
    watch(() => formData.value.sceneId, (newSceneId) => {
      if (newSceneId) {
        loadExistingOrders();
      } else {
        existingOrders.value = [];
        suggestedOrder.value = null;
        orderError.value = '';
      }
    });
    
    watch(() => scenes.value, (newVal) => {
      filteredScenes.value = [...newVal];
      filteredFilterScenes.value = [...newVal];
    }, { deep: true });
    
    watch(() => personnages.value, (newVal) => {
      filteredPersonnages.value = [...newVal];
      filteredFilterPersonnages.value = [...newVal];
    }, { deep: true });
    
    watch(searchTerm, (newVal) => {
      console.log('Search term changed:', newVal);
    });
    
    watch(filterSceneId, (newVal) => {
      console.log('Scene filter changed:', newVal);
    });
    
    watch(filterPersonnageId, (newVal) => {
      console.log('Personnage filter changed:', newVal);
    });
    
    return {
      //variables
      user,
      activeTab,
      formData,
      isEditing,
      editingId,
      isSubmitting,
      loading,
      error,
      scenes,
      personnages,
      dialogues,
      searchTerm,
      filterSceneId,
      filterPersonnageId,
      visibleDialoguesCount,
      defaultVisibleCount,
      showDialogueCommentModal,
      dialogueComments,
      newDialogueComment,
      selectedDialogue,
      existingOrders,
      suggestedOrder,
      orderError,
      originalOrder,
      sceneSearch,
      personnageSearch,
      filterSceneSearch,
      filterPersonnageSearch,
      showSceneSuggestions,
      showPersonnageSuggestions,
      showFilterSceneSuggestions,
      showFilterPersonnageSuggestions,
      filteredScenes,
      filteredPersonnages,
      filteredFilterScenes,
      filteredFilterPersonnages,
      debugMode,
      showDeleteModal,
      dialogueToDelete,
      isDeleting,
      
      // Computed
      getTabIndicatorStyle,
      getDialoguesNarration,
      getDialoguesAvecPersonnage,
      totalDialoguesCount,
      filteredDialogues,
      groupedDialogues,
      
      // Methods
      goToForm,
      goToList,
      clearFilters,
      handleClickOutside,
      loadScenes,
      loadPersonnages,
      loadDialogues,
      loadExistingOrders,
      calculateSuggestedOrder,
      validateOrder,
      useSuggestedOrder,
      submitForm,
      editDialogue,
      resetForm,
      formatDate,
      openDialogueComments,
      loadDialogueComments,
      addDialogueComment,
      deleteDialogueComment,
      loadCommentCounts,
      filterScenes,
      filterPersonnages,
      filterFilterScenes,
      filterFilterPersonnages,
      selectScene,
      selectPersonnage,
      selectFilterScene,
      selectFilterPersonnage,
      clearFilterScene,
      clearFilterPersonnage,
      hideSceneSuggestions,
      hidePersonnageSuggestions,
      hideFilterSceneSuggestions,
      hideFilterPersonnageSuggestions,
      getSceneName,
      getPersonnageName,
      getVisibleCount,
      getVisibleDialogues,
      showMoreDialogues,
      showLessDialogues,
      confirmDeleteDialogue,
      closeDeleteModal,
      executeDeleteDialogue,
      deleteDialogue: executeDeleteDialogue
    };
  }
};
</script>