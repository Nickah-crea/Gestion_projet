<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-crea-raccord">
      <div class="sidebar-header-crea-raccord">
        <h2 class="sidebar-title-crea-raccord">Gestion Raccords</h2>
        <p class="sidebar-subtitle-crea-raccord">Gérez les raccords entre scènes</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-crea-raccord">
        <h3 class="section-title-crea-raccord"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-crea-raccord">
          <button 
            @click="goToForm" 
            class="sidebar-btn-crea-raccord" 
            :class="{ active: activeTab === 'form' && !editingRaccord }"
          >
            <i class="fas fa-plus"></i>
            Nouveau raccord
          </button>
          <button 
            @click="goToList" 
            class="sidebar-btn-crea-raccord"
            :class="{ active: activeTab === 'list' }"
          >
            <i class="fas fa-list"></i>
            Voir la liste
          </button>
        </div>
      </div>

      <!-- Section Filtres -->
      <div class="sidebar-section-crea-raccord">
        <h3 class="section-title-crea-raccord"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-crea-raccord">
          <div class="filter-item-crea-raccord">
            <label>Scène</label>
            <select v-model="selectedScene" class="filter-select-crea-raccord">
              <option value="">Toutes les scènes</option>
              <option v-for="scene in scenes" :key="scene.id" :value="scene.id">
                {{ scene.titre }} (Scène {{ scene.numero }})
              </option>
            </select>
          </div>

          <div class="filter-item-crea-raccord">
            <label>Personnage</label>
            <select v-model="selectedPersonnage" class="filter-select-crea-raccord">
              <option value="">Tous les personnages</option>
              <option v-for="personnage in personnages" :key="personnage.id" :value="personnage.id">
                {{ personnage.nom }}
              </option>
            </select>
          </div>
          
          <div class="filter-item-crea-raccord">
            <label>Comédien</label>
            <select v-model="selectedComedien" class="filter-select-crea-raccord">
              <option value="">Tous les comédiens</option>
              <option v-for="comedien in comediens" :key="comedien.id" :value="comedien.id">
                {{ comedien.nom }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-crea-raccord">
        <h3 class="section-title-crea-raccord"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-crea-raccord">
          <div class="stat-item-crea-raccord">
            <span class="stat-number-crea-raccord">{{ raccords.length }}</span>
            <span class="stat-label-crea-raccord">Total raccords</span>
          </div>
          <div class="stat-item-crea-raccord">
            <span class="stat-number-crea-raccord">{{ getRaccordsCritiques }}</span>
            <span class="stat-label-crea-raccord">Critiques</span>
          </div>
          <div class="stat-item-crea-raccord">
            <span class="stat-number-crea-raccord">{{ getTypesRaccordsCount }}</span>
            <span class="stat-label-crea-raccord">Types</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-raccord">
      <div class="creation-main-content-crea-raccord">
        
        <!-- En-tête principal -->
        <!-- <div class="main-header-crea-raccord">
          <h1 class="page-title-crea-raccord"><i class="fas fa-link"></i> Gestion des Raccords</h1>
          <p class="page-subtitle-crea-raccord">Créez et gérez les raccords de continuité entre vos scènes</p>
        </div> -->

        <!-- Système d'onglets -->
        <div class="tabs-container-crea-raccord">
          <div class="tabs-header-crea-raccord">
            <button 
              @click="activeTab = 'form'"
              :class="['tab-btn-crea-raccord', { active: activeTab === 'form' }]"
            >
              <i :class="editingRaccord ? 'fas fa-marker' : 'fas fa-plus'"></i>
              {{ editingRaccord ? 'Modifier raccord' : 'Créer raccord' }}
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['tab-btn-crea-raccord', { active: activeTab === 'list' }]"
            >
              <i class="fas fa-list"></i>
              Liste raccords
            </button>
          </div>
          
          <div class="tabs-content-crea-raccord">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-crea-raccord" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de l'onglet Formulaire -->
            <div v-show="activeTab === 'form'" class="tab-pane-crea-raccord">
              <!-- Formulaire de création/modification -->
              <div class="form-container-crea-raccord">
                <div class="form-header-crea-raccord">
                  <h3>
                    <i :class="editingRaccord ? 'fas fa-marker' : 'fas fa-plus'"></i>
                    {{ editingRaccord ? 'Modifier le raccord' : 'Créer un nouveau raccord' }}
                  </h3>
                  <button 
                    v-if="editingRaccord"
                    @click="goToForm"
                    class="back-btn-crea-raccord"
                  >
                    <i class="fas fa-plus"></i> Nouveau raccord
                  </button>
                </div>

                <form @submit.prevent="submitForm" class="raccord-form-crea-raccord">
                  <!-- Hiérarchie Projet -> Épisode -> Séquence -->
                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord">
                      <label for="projetId">Projet *</label>
                      <select 
                        id="projetId"
                        v-model="formData.projetId" 
                        @change="chargerEpisodesParProjet" 
                        required
                        class="search-input-crea-raccord"
                      >
                        <option value="">Sélectionner un projet</option>
                        <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                          {{ projet.titre }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord">
                      <label for="episodeId">Épisode *</label>
                      <select 
                        id="episodeId"
                        v-model="formData.episodeId" 
                        @change="chargerSequencesParEpisode" 
                        :disabled="!formData.projetId" 
                        required
                        class="search-input-crea-raccord"
                      >
                        <option value="">Sélectionner un épisode</option>
                        <option v-for="episode in episodesParProjet" :key="episode.idEpisode" :value="episode.idEpisode">
                          Épisode {{ episode.ordre }}: {{ episode.titre }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord">
                      <label for="sequenceId">Séquence *</label>
                      <select 
                        id="sequenceId"
                        v-model="formData.sequenceId" 
                        @change="chargerScenesParSequence" 
                        :disabled="!formData.episodeId" 
                        required
                        class="search-input-crea-raccord"
                      >
                        <option value="">Sélectionner une séquence</option>
                        <option v-for="sequence in sequencesParEpisode" :key="sequence.idSequence" :value="sequence.idSequence">
                          Séquence {{ sequence.ordre }}: {{ sequence.titre }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Scènes Source et Cible -->
                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord">
                      <label for="sceneSourceId">Scène Source *</label>
                      <select 
                        id="sceneSourceId"
                        v-model="formData.sceneSourceId" 
                        :disabled="!formData.sequenceId" 
                        required
                        class="search-input-crea-raccord"
                      >
                        <option value="">Sélectionner une scène source</option>
                        <option v-for="scene in scenesParSequence" :key="scene.idScene" :value="scene.idScene">
                          Scène {{ scene.ordre }}: {{ scene.titre }}
                        </option>
                      </select>
                    </div>

                    <div class="form-group-crea-raccord">
                      <label for="sceneCibleId">Scène Cible *</label>
                      <select 
                        id="sceneCibleId"
                        v-model="formData.sceneCibleId" 
                        :disabled="!formData.sequenceId" 
                        required
                        class="search-input-crea-raccord"
                      >
                        <option value="">Sélectionner une scène cible</option>
                        <option v-if="formData.sceneSourceId" :value="formData.sceneSourceId">
                          🔄 Même scène (continuité de tournage)
                        </option>
                        <option v-for="scene in scenesParSequence" :key="scene.idScene" :value="scene.idScene">
                          Scène {{ scene.ordre }}: {{ scene.titre }}
                        </option>
                      </select>
                      <small v-if="formData.sceneSourceId && formData.sceneCibleId === formData.sceneSourceId" class="same-scene-note-crea-raccord">
                        ⚠️ Raccord pour continuité dans la même scène (ex: tournage sur plusieurs jours)
                      </small>
                    </div>
                  </div>
                  
                  <!-- Personnage et Comédien -->
                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord">
                      <label for="personnageId">Personnage</label>
                      <select 
                        id="personnageId"
                        v-model="formData.personnageId" 
                        @change="updateComedienFromPersonnage"
                        class="search-input-crea-raccord"
                      >
                        <option value="">Aucun personnage</option>
                        <option v-for="personnage in personnages" :key="personnage.id" :value="personnage.id">
                          {{ personnage.nom }} 
                          <span v-if="personnage.comedienNom">- {{ personnage.comedienNom }}</span>
                        </option>
                      </select>
                    </div>

                    <div class="form-group-crea-raccord">
                      <label for="comedienAuto">Comédien (automatique)</label>
                      <input 
                        id="comedienAuto"
                        type="text" 
                        :value="getComedienNameFromPersonnage(formData.personnageId)" 
                        disabled 
                        class="search-input-crea-raccord disabled-input"
                        placeholder="Sélectionnez un personnage"
                      >
                      <small class="field-note-crea-raccord">Le comédien est automatiquement lié au personnage sélectionné</small>
                    </div>
                  </div>

                  <!-- Type et Statut -->
                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord">
                      <label for="typeRaccordId">Type de Raccord *</label>
                      <select 
                        id="typeRaccordId"
                        v-model="formData.typeRaccordId" 
                        required
                        class="search-input-crea-raccord"
                      >
                        <option value="">Sélectionner un type</option>
                        <option v-for="type in typesRaccord" :key="type.id" :value="type.id">
                          {{ type.nomType }}
                        </option>
                      </select>
                    </div>

                    <div class="form-group-crea-raccord">
                      <label for="statutRaccordId">Statut</label>
                      <select 
                        id="statutRaccordId"
                        v-model="formData.statutRaccordId" 
                        class="search-input-crea-raccord"
                      >
                        <option v-for="statut in statutsRaccord" :key="statut.id" :value="statut.id">
                          {{ statut.nomStatut }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord full-width">
                      <label for="description">Description</label>
                      <textarea 
                        id="description"
                        v-model="formData.description" 
                        rows="3" 
                        placeholder="Description du raccord..."
                        class="form-textarea-crea-raccord"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Checkbox critique -->
                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord checkbox-group-crea-raccord">
                      <label>
                        <input type="checkbox" v-model="formData.estCritique">
                        Raccord critique
                      </label>
                    </div>
                  </div>

                  <!-- Images de référence -->
                  <div class="form-row-crea-raccord">
                    <div class="form-group-crea-raccord full-width">
                      <label for="images">Images de référence</label>
                      <input 
                        id="images"
                        type="file" 
                        multiple 
                        accept="image/*" 
                        @change="handleImageUpload"
                        class="file-input-crea-raccord"
                      >
                      <div v-if="previewImages.length" class="image-previews-crea-raccord">
                        <div v-for="(preview, index) in previewImages" :key="index" class="image-preview-crea-raccord">
                          <img :src="preview" alt="Preview">
                          <button @click="removePreview(index)" class="remove-btn-crea-raccord">×</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="error" class="error-message-crea-raccord">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  </div>

                  <div class="form-actions-crea-raccord">
                    <button
                      v-if="editingRaccord"
                      type="button"
                      @click="goToForm"
                      class="cancel-btn-crea-raccord"
                    >
                      <i class="fas fa-times"></i> Annuler
                    </button>
                    <button
                      type="submit"
                      :disabled="loading"
                      class="submit-btn-crea-raccord"
                    >
                      <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                      <i v-else :class="editingRaccord ? 'fas fa-save' : 'fas fa-plus'"></i>
                      {{ loading ? 'Enregistrement...' : (editingRaccord ? 'Enregistrer' : 'Créer le raccord') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Contenu de l'onglet Liste -->
            <div v-show="activeTab === 'list'" class="tab-pane-crea-raccord">
              <!-- Liste des raccords -->
              <div class="raccords-list-crea-raccord">
                <div class="list-header-crea-raccord">
                  <h3><i class="fas fa-link"></i> Liste des raccords ({{ raccords.length }})</h3>
                  
                  <div class="search-section-crea-raccord">
                    <div class="search-group-crea-raccord">
                      <label for="raccordSearch">Rechercher un raccord</label>
                      <div class="search-input-container-crea-raccord">
                        <i class="fas fa-search search-icon-crea-raccord"></i>
                        <input
                          type="text"
                          id="raccordSearch"
                          v-model="searchTerm"
                          placeholder="Rechercher par description..."
                          class="search-input-large-crea-raccord"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="loadingRaccords" class="loading-state-crea-raccord">
                  <i class="fas fa-spinner fa-spin"></i>
                  <h3>Chargement des raccords...</h3>
                </div>
                
                <div v-else-if="raccords.length === 0" class="empty-state-crea-raccord">
                  <i class="fas fa-link"></i>
                  <h3>Aucun raccord trouvé</h3>
                  <div v-if="selectedScene || selectedPersonnage || selectedComedien">
                    <p>Aucun raccord ne correspond à vos critères de recherche.</p>
                  </div>
                  <div v-else>
                    <p>Aucun raccord créé pour le moment.</p>
                  </div>
                </div>

                <div v-else class="raccords-container-crea-raccord">
                  <div class="scene-groups-crea-raccord">
                    <div v-for="groupe in groupesRaccords" :key="groupe.sceneSourceId + '-' + groupe.sceneCibleId" class="scene-group-crea-raccord">
                      
                      <!-- En-tête du groupe -->
                      <div class="scene-group-header-crea-raccord">
                        <h4 class="group-title-crea-raccord">
                          <i class="fas fa-arrow-right"></i>
                          {{ groupe.titreGroupe }}
                        </h4>
                        <span class="badge-count-crea-raccord">{{ groupe.raccords.length }} raccord(s)</span>
                      </div>

                      <!-- Liste des raccords dans ce groupe -->
                      <div class="raccords-grid-crea-raccord">
                        <div v-for="raccord in groupe.raccords" :key="raccord.id" class="raccord-card-crea-raccord">
                          
                          <div class="raccord-header-crea-raccord">
                            <h5 class="raccord-title-crea-raccord">
                              <i class="fas fa-link"></i>
                              {{ raccord.typeRaccordNom }}
                            </h5>
                            <span :class="`status-badge-crea-raccord status-${raccord.statutRaccordNom.toLowerCase()}`">
                              {{ raccord.statutRaccordNom }}
                            </span>
                          </div>

                          <div class="raccord-content-crea-raccord">
                            <div class="raccord-info-crea-raccord">
                              <div v-if="raccord.personnageNom" class="detail-item-crea-raccord">
                                <i class="fas fa-user"></i>
                                <span><strong>Personnage:</strong> {{ raccord.personnageNom }}</span>
                              </div>
                              <div v-if="raccord.comedienNom" class="detail-item-crea-raccord">
                                <i class="fas fa-theater-masks"></i>
                                <span><strong>Comédien:</strong> {{ raccord.comedienNom }}</span>
                              </div>
                              <div v-if="raccord.description" class="detail-item-crea-raccord">
                                <i class="fas fa-align-left"></i>
                                <span class="description-text-crea-raccord">{{ raccord.description }}</span>
                              </div>
                              <div v-if="raccord.estCritique" class="detail-item-crea-raccord critique-item-crea-raccord">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>⚠️ Raccord critique</span>
                              </div>
                            </div>

                            <!-- Images du raccord -->
                            <div v-if="raccord.images && raccord.images.length" class="raccord-images-crea-raccord">
                              <h6 class="images-title-crea-raccord">
                                <i class="fas fa-images"></i>
                                Images de référence
                              </h6>
                              <div class="images-grid-crea-raccord">
                                <div v-for="image in raccord.images" :key="image.id" class="image-item-crea-raccord">
                                  <img 
                                    :src="`/api/raccords/image/${image.cheminFichier}`" 
                                    :alt="image.descriptionImage"
                                    @click="showImageModal(image)"
                                  >
                                </div>
                              </div>
                            </div>

                            <div class="raccord-actions-crea-raccord">
                              <button @click="editRaccord(raccord)" class="btn-edit-crea-raccord" title="Modifier">
                                <i class="fas fa-marker"></i>
                              </button>
                            
                              <button 
                                @click="ouvrirCalendrierScene(raccord.sceneSourceId)" 
                                class="btn-calendar-crea-raccord"
                                title="Planning Source"
                              >
                                <i class="fas fa-calendar"></i>
                              </button>
                              
                              <button 
                                @click="ouvrirCalendrierScene(raccord.sceneCibleId)" 
                                class="btn-calendar-secondary-crea-raccord"
                                title="Planning Cible"
                              >
                                <i class="fas fa-calendar-alt"></i>
                              </button>
                      
                              <button @click="deleteRaccord(raccord.id)" class="btn-delete-crea-raccord" title="Supprimer">
                                <i class="fas fa-trash"></i>
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
        </div>
      </div>
    </div>

    <!-- Modal d'affichage d'image -->
    <div v-if="selectedImage" class="modal-overlay-crea-raccord" @click="selectedImage = null">
      <div class="modal-content-crea-raccord" @click.stop>
        <div class="modal-header-crea-raccord">
          <h3>
            <i class="fas fa-image"></i>
            Image de référence
          </h3>
          <button @click="selectedImage = null" class="modal-close-btn-crea-raccord">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-crea-raccord">
          <img :src="`/api/raccords/image/${selectedImage.cheminFichier}`" :alt="selectedImage.descriptionImage">
          <p class="image-description-crea-raccord">{{ selectedImage.descriptionImage }}</p>
        </div>
        
        <div class="modal-footer-crea-raccord">
          <button type="button" @click="selectedImage = null" class="btn-close-modal-crea-raccord">
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
  name: 'GestionRaccords',
  data() {
    return {
      activeTab: 'list',
      loading: false,
      loadingRaccords: false,
      scenes: [],
      raccords: [],
      typesRaccord: [],
      statutsRaccord: [],
      selectedScene: '',
      editingRaccord: null,
      selectedImage: null,
      currentUserId: 1,
      personnages: [],
      comediens: [],
      selectedPersonnage: '',
      selectedComedien: '',
      searchTerm: '',
      projets: [],
      episodesParProjet: [],
      sequencesParEpisode: [],
      scenesParSequence: [],
      formData: {
        projetId: '',
        episodeId: '',
        sequenceId: '',
        sceneSourceId: '',
        sceneCibleId: '',
        typeRaccordId: '',
        description: '',
        estCritique: false,
        statutRaccordId: 1,
        images: [],
        personnageId: '',
        comedienId: ''
      },
      previewImages: []
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
    getRaccordsCritiques() {
      return this.raccords.filter(r => r.estCritique).length;
    },
    getTypesRaccordsCount() {
      return new Set(this.raccords.map(r => r.typeRaccordNom)).size;
    },
    groupesRaccords() {
      return this.grouperRaccordsParScene(this.raccords);
    }
  },
  watch: {
    selectedScene() {
      this.loadRaccords();
    },
    selectedPersonnage() {
      this.loadRaccords();
    },
    selectedComedien() {
      this.loadRaccords();
    }
  },
  async mounted() {
    await this.loadInitialData();
    await this.loadRaccords();
  },
  methods: {
    // Navigation entre onglets
    goToForm() {
      this.activeTab = 'form';
      this.resetForm();
    },
    goToList() {
      this.activeTab = 'list';
      this.loadRaccords();
    },

    async loadInitialData() {
      try {
        const [projetsRes, scenesRes, typesRes, statutsRes, personnagesRes, comediensRes] = await Promise.all([
          axios.get('/api/projets'),
          axios.get('/api/scenes'),
          axios.get('/api/raccords/types'),
          axios.get('/api/raccords/statuts'),
          axios.get('/api/personnages'),
          axios.get('/api/comediens')
        ]);

        this.projets = projetsRes.data;
        this.scenes = scenesRes.data;
        this.typesRaccord = typesRes.data;
        this.statutsRaccord = statutsRes.data;
        this.personnages = personnagesRes.data;
        this.comediens = comediensRes.data;
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    },

    async chargerEpisodesParProjet() {
      if (!this.formData.projetId) {
        this.episodesParProjet = [];
        this.formData.episodeId = '';
        this.formData.sequenceId = '';
        this.formData.sceneSourceId = '';
        this.formData.sceneCibleId = '';
        return;
      }
      try {
        const response = await axios.get(`/api/episodes/projet/${this.formData.projetId}`, {
          headers: { 'X-User-Id': this.currentUserId }
        });
        this.episodesParProjet = response.data;
      } catch (error) {
        console.error('Erreur chargement épisodes:', error);
        this.episodesParProjet = [];
      }
    },

    async chargerSequencesParEpisode() {
      if (!this.formData.episodeId) {
        this.sequencesParEpisode = [];
        this.formData.sequenceId = '';
        this.formData.sceneSourceId = '';
        this.formData.sceneCibleId = '';
        return;
      }
      try {
        const response = await axios.get(`/api/sequences/episodes/${this.formData.episodeId}`, {
          headers: { 'X-User-Id': this.currentUserId }
        });
        this.sequencesParEpisode = response.data;
      } catch (error) {
        console.error('Erreur chargement séquences:', error);
        this.sequencesParEpisode = [];
      }
    },

    async chargerScenesParSequence() {
      if (!this.formData.sequenceId) {
        this.scenesParSequence = [];
        this.formData.sceneSourceId = '';
        this.formData.sceneCibleId = '';
        return;
      }
      try {
        const response = await axios.get(`/api/scenes/sequences/${this.formData.sequenceId}`);
        this.scenesParSequence = response.data;
      } catch (error) {
        console.error('Erreur chargement scènes:', error);
        this.scenesParSequence = [];
      }
    },

    async loadRaccords() {
      this.loadingRaccords = true;
      try {
        let url = '/api/raccords';
        const params = new URLSearchParams();
        
        if (this.selectedScene) {
          params.append('sceneId', this.selectedScene);
        }
        if (this.selectedPersonnage) {
          params.append('personnageId', this.selectedPersonnage);
        }
        if (this.selectedComedien) {
          params.append('comedienId', this.selectedComedien);
        }

        if (params.toString()) {
          url += '?' + params.toString();
        }
        
        const response = await axios.get(url);
        this.raccords = response.data;
        
        await this.chargerDonneesPlanningPourRaccords();
        
      } catch (error) {
        console.error('Erreur lors du chargement des raccords:', error);
      } finally {
        this.loadingRaccords = false;
      }
    },

    async chargerDonneesPlanningPourRaccords() {
      try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
        
        const response = await axios.get('/api/scene-tournage/periode', {
          params: {
            startDate: this.formatDateForAPI(startDate),
            endDate: this.formatDateForAPI(endDate)
          }
        });
        
        const tournages = response.data;
        
        this.raccords = this.raccords.map(raccord => {
          const tournageSource = tournages.find(t => t.sceneId === raccord.sceneSourceId);
          const tournageCible = tournages.find(t => t.sceneId === raccord.sceneCibleId);
          
          return {
            ...raccord,
            dateTournageSource: tournageSource?.dateTournage || null,
            dateTournageCible: tournageCible?.dateTournage || null,
            statutTournageSource: tournageSource?.statutTournage || null,
            statutTournageCible: tournageCible?.statutTournage || null
          };
        });
        
      } catch (error) {
        console.error('Erreur chargement données planning:', error);
      }
    },

    formatDateForAPI(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    handleImageUpload(event) {
      const files = event.target.files;
      this.formData.images = Array.from(files);
      
      this.previewImages = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    },

    removePreview(index) {
      this.previewImages.splice(index, 1);
      this.formData.images.splice(index, 1);
    },

    async submitForm() {
      this.loading = true;
      try {
        if (!this.formData.sceneSourceId || !this.formData.sceneCibleId || !this.formData.typeRaccordId) {
          alert('Veuillez remplir tous les champs obligatoires');
          this.loading = false;
          return;
        }
        
        if (this.formData.sceneSourceId === this.formData.sceneCibleId) {
          if (!confirm('Vous créez un raccord pour la même scène. Ceci est utile pour la continuité de tournage sur plusieurs jours. Confirmer ?')) {
            return;
          }
        }

        const formData = new FormData();
        
        if (this.editingRaccord) {
          formData.append('sceneSourceId', this.formData.sceneSourceId.toString());
          formData.append('sceneCibleId', this.formData.sceneCibleId.toString());
          formData.append('typeRaccordId', this.formData.typeRaccordId.toString());
        } else {
          formData.append('sceneSourceId', this.formData.sceneSourceId.toString());
          formData.append('sceneCibleId', this.formData.sceneCibleId.toString());
          formData.append('typeRaccordId', this.formData.typeRaccordId.toString());
        }
        
        formData.append('description', this.formData.description || '');
        formData.append('estCritique', this.formData.estCritique.toString());
        formData.append('statutRaccordId', (this.formData.statutRaccordId || 1).toString());
        
        if (this.formData.personnageId) {
          formData.append('personnageId', this.formData.personnageId.toString());
        } else {
          formData.append('personnageId', '');
        }
        
        if (this.formData.comedienId) {
          formData.append('comedienId', this.formData.comedienId.toString());
        } else {
          formData.append('comedienId', '');
        }
        
        if (this.formData.images && this.formData.images.length > 0) {
          this.formData.images.forEach(image => {
            formData.append('images', image);
          });
        }

        let response;
        if (this.editingRaccord) {
          response = await axios.put(`/api/raccords/${this.editingRaccord.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          response = await axios.post('/api/raccords', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }

        this.resetForm();
        await this.loadRaccords();
        this.activeTab = 'list';
        
        alert(this.editingRaccord ? 'Raccord modifié avec succès!' : 'Raccord créé avec succès!');
        
      } catch (error) {
        console.error('Erreur détaillée lors de la sauvegarde:', error);
        console.error('Response error:', error.response?.data);
        this.error = 'Erreur lors de la sauvegarde du raccord: ' + (error.response?.data?.message || error.message);
      } finally {
        this.loading = false;
      }
    },

    updateComedienFromPersonnage() {
      if (this.formData.personnageId) {
        const selectedPersonnage = this.personnages.find(p => p.id === this.formData.personnageId);
        if (selectedPersonnage && selectedPersonnage.comedienId) {
          this.formData.comedienId = selectedPersonnage.comedienId;
        } else {
          this.formData.comedienId = '';
        }
      } else {
        this.formData.comedienId = '';
      }
    },

    getComedienNameFromPersonnage(personnageId) {
      if (!personnageId) return '';
      const personnage = this.personnages.find(p => p.id === personnageId);
      return personnage && personnage.comedienNom ? personnage.comedienNom : 'Aucun comédien assigné';
    },

    async editRaccord(raccord) {
      this.editingRaccord = raccord;
      
      try {
        this.formData = {
          projetId: '',
          episodeId: '',
          sequenceId: '',
          sceneSourceId: raccord.sceneSourceId,
          sceneCibleId: raccord.sceneCibleId,
          typeRaccordId: raccord.typeRaccordId,
          description: raccord.description,
          estCritique: raccord.estCritique,
          statutRaccordId: raccord.statutRaccordId,
          personnageId: raccord.personnageId || '',
          comedienId: raccord.comedienId || '',
          images: []
        };
        
        await this.chargerHierarchiePourRaccord(raccord);
        
        this.activeTab = 'form';
        
      } catch (error) {
        console.error('Erreur lors du chargement des données pour édition:', error);
        
        this.formData = {
          projetId: '',
          episodeId: '',
          sequenceId: '',
          sceneSourceId: raccord.sceneSourceId,
          sceneCibleId: raccord.sceneCibleId,
          typeRaccordId: raccord.typeRaccordId,
          description: raccord.description,
          estCritique: raccord.estCritique,
          statutRaccordId: raccord.statutRaccordId,
          personnageId: raccord.personnageId || '',
          comedienId: raccord.comedienId || '',
          images: []
        };
        
        this.activeTab = 'form';
      }
    },

    async chargerHierarchiePourRaccord(raccord) {
      try {
        const sceneResponse = await axios.get(`/api/scenes/${raccord.sceneSourceId}`);
        const scene = sceneResponse.data;
        
        if (scene && scene.sequenceId) {
          try {
            const sequenceResponse = await axios.get(`/api/sequences/${scene.sequenceId}`);
            const sequence = sequenceResponse.data;
            
            if (sequence && sequence.episodeId) {
              try {
                const episodeResponse = await axios.get(`/api/episodes/${sequence.episodeId}`);
                const episode = episodeResponse.data;
                
                if (episode && episode.projetId) {
                  this.formData.projetId = episode.projetId;
                  this.formData.episodeId = sequence.episodeId;
                  this.formData.sequenceId = scene.sequenceId;
                  
                  await this.chargerEpisodesParProjet();
                  await this.chargerSequencesParEpisode();
                  await this.chargerScenesParSequence();
                }
              } catch (episodeError) {
                console.warn('Impossible de charger l\'épisode:', episodeError);
                try {
                  const episodeResponse = await axios.get(`/api/episodes/${sequence.episodeId}`, {
                    headers: { 'X-User-Id': this.currentUserId }
                  });
                  const episode = episodeResponse.data;
                  
                  if (episode && episode.projetId) {
                    this.formData.projetId = episode.projetId;
                    this.formData.episodeId = sequence.episodeId;
                    this.formData.sequenceId = scene.sequenceId;
                    
                    await this.chargerEpisodesParProjet();
                    await this.chargerSequencesParEpisode();
                    await this.chargerScenesParSequence();
                  }
                } catch (episodeError2) {
                  console.warn('Impossible de charger l\'épisode même avec header:', episodeError2);
                }
              }
            }
          } catch (sequenceError) {
            console.warn('Impossible de charger la séquence:', sequenceError);
            try {
              const sequenceResponse = await axios.get(`/api/sequences/${scene.sequenceId}`, {
                headers: { 'X-User-Id': this.currentUserId }
              });
              const sequence = sequenceResponse.data;
              
              if (sequence && sequence.episodeId) {
                const episodeResponse = await axios.get(`/api/episodes/${sequence.episodeId}`, {
                  headers: { 'X-User-Id': this.currentUserId }
                });
                const episode = episodeResponse.data;
                
                if (episode && episode.projetId) {
                  this.formData.projetId = episode.projetId;
                  this.formData.episodeId = sequence.episodeId;
                  this.formData.sequenceId = scene.sequenceId;
                  
                  await this.chargerEpisodesParProjet();
                  await this.chargerSequencesParEpisode();
                  await this.chargerScenesParSequence();
                }
              }
            } catch (sequenceError2) {
              console.warn('Impossible de charger la séquence même avec header:', sequenceError2);
            }
          }
        }
      } catch (sceneError) {
        console.warn('Impossible de charger la scène:', sceneError);
      }
    },

    async deleteRaccord(id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce raccord ?')) {
        try {
          await axios.delete(`/api/raccords/${id}`);
          await this.loadRaccords();
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du raccord');
        }
      }
    },

    grouperRaccordsParScene(raccords) {
      const groupes = {};
      
      raccords.forEach(raccord => {
        const sceneKey = `${raccord.sceneSourceId}-${raccord.sceneCibleId}`;
        const sceneTitre = `${raccord.sceneSourceTitre} → ${raccord.sceneCibleTitre}`;
        
        if (!groupes[sceneKey]) {
          groupes[sceneKey] = {
            sceneSourceId: raccord.sceneSourceId,
            sceneCibleId: raccord.sceneCibleId,
            sceneSourceTitre: raccord.sceneSourceTitre,
            sceneCibleTitre: raccord.sceneCibleTitre,
            titreGroupe: sceneTitre,
            raccords: []
          };
        }
        
        groupes[sceneKey].raccords.push(raccord);
      });
      
      return Object.values(groupes);
    },
    
    ouvrirCalendrierScene(sceneId) {
      this.$router.push({
        path: '/calendrier-tournage',
        query: { sceneId: sceneId }
      });
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR');
    },
    
    formatDateForInput(dateString) {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },

    showImageModal(image) {
      this.selectedImage = image;
    },

    resetForm() {
      this.formData = {
        projetId: '',
        episodeId: '',
        sequenceId: '',
        sceneSourceId: '',
        sceneCibleId: '',
        typeRaccordId: '',
        description: '',
        estCritique: false,
        statutRaccordId: 1,
        images: [],
        personnageId: '',
        comedienId: ''
      };
      this.previewImages = [];
      this.editingRaccord = null;
      this.error = '';
    }
  }
};
</script>

