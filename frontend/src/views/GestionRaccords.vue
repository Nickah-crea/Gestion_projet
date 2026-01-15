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
                  <div class="form-section-title-crea-raccord">
                    <i class="fas fa-sitemap"></i>
                    Hiérarchie du projet
                  </div>

                  <div class="form-row-hierarchy-crea-raccord">
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
                  <div class="form-section-title-crea-raccord">
                    <i class="fas fa-exchange-alt"></i>
                    Scènes de raccordement
                  </div>

                  <div class="scene-hierarchy-section-crea-raccord">
                    <div class="form-row-dual-crea-raccord">
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
                      </div>
                    </div>
                    
                    <small v-if="formData.sceneSourceId && formData.sceneCibleId === formData.sceneSourceId" class="same-scene-note-crea-raccord">
                      ⚠️ Raccord pour continuité dans la même scène (ex: tournage sur plusieurs jours)
                    </small>
                  </div>

                  <!-- Personnage et Comédien -->
                  <div class="form-section-title-crea-raccord">
                    <i class="fas fa-users"></i>
                    Personnage et comédien
                  </div>

                  <div class="form-row-dual-crea-raccord">
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
                  <div class="form-section-title-crea-raccord">
                    <i class="fas fa-cog"></i>
                    Configuration du raccord
                  </div>

                  <div class="form-row-dual-crea-raccord">
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
                  <div class="form-section-title-crea-raccord">
                    <i class="fas fa-align-left"></i>
                    Description
                  </div>

                  <div class="form-row-full-crea-raccord">
                    <div class="form-group-crea-raccord">
                      <label for="description">Description du raccord</label>
                      <textarea 
                        id="description"
                        v-model="formData.description" 
                        rows="3" 
                        placeholder="Décrivez les détails du raccord..."
                        class="form-textarea-crea-raccord"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Checkbox critique -->
                  <div class="form-row-full-crea-raccord">
                    <div class="form-group-crea-raccord checkbox-group-crea-raccord">
                      <label>
                        <input type="checkbox" v-model="formData.estCritique">
                        Raccord critique
                      </label>
                    </div>
                  </div>

                  <!-- Images de référence -->
                  <div class="form-section-title-crea-raccord">
                    <i class="fas fa-images"></i>
                    Images de référence
                  </div>

                  <div class="form-row-full-crea-raccord">
                    <div class="form-group-crea-raccord">
                      <label for="images">Télécharger des images</label>
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
                      <div class="search-input-container-crea-raccord">
                        <i class="fas fa-search search-icon-crea-raccord"></i>
                        <input
                          type="text"
                          id="raccordSearch"
                          v-model="searchTerm"
                          placeholder=" Rechercher par description..."
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
                            <span 
                              :class="[
                                'raccord-statut-badge-crea-raccord',
                                `status-${getStatutSlug(raccord.statutRaccordNom)}-crea-raccord`
                              ]"
                            >
                              <i :class="getStatutIcon(raccord.statutRaccordNom)"></i>
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

    <!-- Modal d'erreur d'accès -->
    <div v-if="showAccessErrorModal" class="access-error-modal-crea-raccord" @click="closeAccessErrorModal">
      <div class="access-error-content-crea-raccord" @click.stop>
        <div class="access-error-header-crea-raccord">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Erreur d'accès
          </h3>
          <button @click="closeAccessErrorModal" class="access-error-close-crea-raccord">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="access-error-body-crea-raccord">
          <p>{{ accessErrorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression (identique à ProjetScenariste.vue) -->
      <div v-if="showDeleteModal" class="delete-confirmation-modal-Scenariste">
        <div class="modal-overlay-Scenariste" @click="closeDeleteModal"></div>
        <div class="modal-content-confirm-Scenariste">
          <div class="modal-header-confirm-Scenariste">
            <h3><i class="fas fa-exclamation-triangle"></i> Confirmation de suppression</h3>
            <button @click="closeDeleteModal" class="close-modal-btn-Scenariste">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body-confirm-Scenariste">
            <div class="warning-icon-Scenariste">
              <i class="fas fa-trash"></i>
            </div>
            <p class="warning-text-Scenariste">
              Êtes-vous sûr de vouloir supprimer le raccord <strong>"{{ raccordToDelete?.description || raccordToDelete?.typeRaccordNom || 'cet élément' }}"</strong> ?
            </p>
            <p class="warning-subtext-Scenariste">
              Cette action est irréversible. Toutes les images associées à ce raccord seront également supprimées.
            </p>
            <div v-if="deleteError" class="error-message-Scenariste">
              {{ deleteError }}
            </div>
          </div>
          
          <div class="modal-footer-confirm-Scenariste">
            <button @click="closeDeleteModal" class="cancel-confirm-btn-Scenariste">
              <i class="fas fa-times"></i> Annuler
            </button>
            <button @click="executeDeleteRaccord" class="delete-confirm-btn-Scenariste" :disabled="isDeleting">
              <span v-if="isDeleting">Suppression...</span>
              <span v-else>Supprimer définitivement</span>
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
      currentUserId: null,
      personnages: [],
      comediens: [],
      selectedPersonnage: '',
      selectedComedien: '',
      searchTerm: '',
      projets: [],
      episodesParProjet: [],
      sequencesParEpisode: [],
      scenesParSequence: [],
       permissions: {
        canCreateRaccord: false,
        canEditRaccord: false,
        canDeleteRaccord: false,
        canViewRaccords: false,
        canViewScenes: false
      },
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
      previewImages: [],
      user: null,
      showAccessErrorModal: false,
      accessErrorMessage: '',
      showDeleteModal: false,
      raccordToDelete: null,
      isDeleting: false,
      deleteError: '',
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
    },
      // Liste filtrée des projets accessibles
    accessibleProjets() {
      if (!this.user) return [];
      if (this.user.role === 'ADMIN') return this.projets;
      
      // Pour les réalisateurs et scénaristes, filtrer les projets accessibles
      return this.projets.filter(projet => 
        this.permissions.canViewScenes || 
        this.userProjetIds.includes(projet.id)
      );
    },
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
    },
     'formData.projetId'(newVal) {
      if (newVal) {
        this.checkProjectAccess(newVal);
      }
    },
    'formData.episodeId'(newVal) {
      if (newVal) {
        this.checkEpisodeAccess(newVal);
      }
    }
  },
  async mounted() {
    await this.loadUserData();
    await this.initializePermissions();
    await this.loadInitialData();
    await this.loadRaccords();
  },
  methods: {

      async loadUserData() {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          this.user = JSON.parse(userStr);
          this.currentUserId = this.user.id;
          
          if (!this.user || !this.user.id) {
            this.$router.push('/');
          }
        } else {
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        this.$router.push('/');
      }
    },
      // Initialiser les permissions
    async initializePermissions() {
      try {
        // Récupérer les permissions générales de l'utilisateur
        const role = this.user?.role;
        
        // Permissions par défaut basées sur le rôle
        if (role === 'ADMIN') {
          this.permissions = {
            canCreateRaccord: true,
            canEditRaccord: true,
            canDeleteRaccord: true,
            canViewRaccords: true,
            canViewScenes: true
          };
        } else if (role === 'REALISATEUR') {
          this.permissions = {
            canCreateRaccord: false,
            canEditRaccord: false,
            canDeleteRaccord: false,
            canViewRaccords: true,
            canViewScenes: true
          };
        } else if (role === 'SCENARISTE') {
          this.permissions = {
            canCreateRaccord: true,
            canEditRaccord: true,
            canDeleteRaccord: true,
            canViewRaccords: true,
            canViewScenes: true
          };
        } else {
          this.permissions = {
            canCreateRaccord: false,
            canEditRaccord: false,
            canDeleteRaccord: false,
            canViewRaccords: false,
            canViewScenes: false
          };
        }
        
        // Charger les projets accessibles
        await this.loadUserProjects();
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des permissions:', error);
      }
    },

        async loadUserProjects() {
      try {
        if (this.user?.role === 'ADMIN') {
          // Admin a accès à tous les projets
          const response = await axios.get('/api/projets');
          this.userProjetIds = response.data.map(p => p.id);
        } else {
          // Pour les autres rôles, récupérer les projets via les épisodes
          const episodesResponse = await axios.get(`/api/episodes/utilisateur/${this.currentUserId}`);
          this.userProjetIds = [...new Set(episodesResponse.data.map(ep => ep.projetId))];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des projets utilisateur:', error);
        this.userProjetIds = [];
      }
    },
     // Vérifier l'accès au projet
    async checkProjectAccess(projetId) {
      try {
        const hasAccess = await axios.get(`/api/projets/${projetId}/access-check`, {
          headers: { 'X-User-Id': this.currentUserId }
        });
        
        if (!hasAccess.data) {
          this.showAccessError(`Vous n'avez pas accès à ce projet.`);
          this.formData.projetId = '';
          this.episodesParProjet = [];
          return false;
        }
        return true;
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'accès au projet:', error);
        this.showAccessError(`Erreur de vérification d'accès au projet.`);
        return false;
      }
    },
        // Vérifier l'accès à l'épisode
    async checkEpisodeAccess(episodeId) {
      try {
        const hasAccess = await axios.get(`/api/episodes/${episodeId}/access-check`, {
          headers: { 'X-User-Id': this.currentUserId }
        });
        
        if (!hasAccess.data) {
          this.showAccessError(`Vous n'avez pas accès à cet épisode.`);
          this.formData.episodeId = '';
          this.sequencesParEpisode = [];
          return false;
        }
        return true;
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'accès à l\'épisode:', error);
        this.showAccessError(`Erreur de vérification d'accès à l'épisode.`);
        return false;
      }
    },
    // Navigation entre onglets
   goToForm() {
      if (!this.permissions.canCreateRaccord) {
        this.showAccessError('Vous n\'avez pas les permissions pour créer un raccord.');
        return;
      }
      this.activeTab = 'form';
      this.resetForm();
    },

    goToList() {
      if (!this.permissions.canViewRaccords) {
        this.showAccessError('Vous n\'avez pas les permissions pour voir les raccords.');
        return;
      }
      this.activeTab = 'list';
      this.loadRaccords();
    },

   async loadInitialData() {
      try {
        // Charger seulement les projets accessibles
        const projetsRes = await axios.get('/api/projets');
        this.projets = this.filterAccessibleData(projetsRes.data, 'projets');
        
        // Charger les scènes avec vérification d'accès
        const scenesRes = await axios.get('/api/scenes');
        this.scenes = this.filterAccessibleData(scenesRes.data, 'scenes');
        
        // Charger les autres données
        const [typesRes, statutsRes, personnagesRes, comediensRes] = await Promise.all([
          axios.get('/api/raccords/types'),
          axios.get('/api/raccords/statuts'),
          axios.get('/api/personnages'),
          axios.get('/api/comediens')
        ]);
        
        this.typesRaccord = typesRes.data;
        this.statutsRaccord = statutsRes.data;
        this.personnages = personnagesRes.data;
        this.comediens = comediensRes.data;
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    },

     filterAccessibleData(data, dataType) {
      if (!this.user) return [];
      if (this.user.role === 'ADMIN') return data;
      
      if (dataType === 'projets') {
        return data.filter(projet => this.userProjetIds.includes(projet.id));
      }
      
      return data;
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
      
      // Vérifier l'accès au projet
      const hasAccess = await this.checkProjectAccess(this.formData.projetId);
      if (!hasAccess) return;
      
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
      
      // Vérifier l'accès à l'épisode
      const hasAccess = await this.checkEpisodeAccess(this.formData.episodeId);
      if (!hasAccess) return;
      
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
      if (!this.permissions.canViewRaccords) {
        this.showAccessError('Vous n\'avez pas les permissions pour voir les raccords.');
        return;
      }
      
      this.loadingRaccords = true;
      try {
        let url = '/api/raccords';
        const params = new URLSearchParams();
        
        // Ajouter l'ID utilisateur pour filtrer les raccords accessibles
        params.append('userId', this.currentUserId);
        
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
      if (this.editingRaccord && !this.permissions.canEditRaccord) {
        this.showAccessError('Vous n\'avez pas les permissions pour modifier un raccord.');
        return;
      }
      
      if (!this.editingRaccord && !this.permissions.canCreateRaccord) {
        this.showAccessError('Vous n\'avez pas les permissions pour créer un raccord.');
        return;
      }
      
      this.loading = true;
      try {
        if (!this.formData.sceneSourceId || !this.formData.sceneCibleId || !this.formData.typeRaccordId) {
          alert('Veuillez remplir tous les champs obligatoires');
          this.loading = false;
          return;
        }
        
        // Vérifier l'accès aux scènes
        const hasAccessToScenes = await this.checkSceneAccess(
          this.formData.sceneSourceId, 
          this.formData.sceneCibleId
        );
        
        if (!hasAccessToScenes) {
          this.loading = false;
          return;
        }
        
        if (this.formData.sceneSourceId === this.formData.sceneCibleId) {
          if (!confirm('Vous créez un raccord pour la même scène. Ceci est utile pour la continuité de tournage sur plusieurs jours. Confirmer ?')) {
            return;
          }
        }

        const formData = new FormData();
        
        // Ajouter l'ID utilisateur pour vérification côté serveur
        formData.append('userId', this.currentUserId.toString());
        
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
            headers: { 
              'Content-Type': 'multipart/form-data',
              'X-User-Id': this.currentUserId
            }
          });
        } else {
          response = await axios.post('/api/raccords', formData, {
            headers: { 
              'Content-Type': 'multipart/form-data',
              'X-User-Id': this.currentUserId
            }
          });
        }

        this.resetForm();
        await this.loadRaccords();
        this.activeTab = 'list';
        
      } catch (error) {
        console.error('Erreur détaillée lors de la sauvegarde:', error);
        
        if (error.response?.status === 403) {
          this.showAccessError('Vous n\'avez pas les permissions pour effectuer cette action.');
        } else if (error.response?.status === 401) {
          this.showAccessError('Session expirée. Veuillez vous reconnecter.');
        } else {
          this.error = 'Erreur lors de la sauvegarde du raccord: ' + (error.response?.data?.message || error.message);
        }
      } finally {
        this.loading = false;
      }
    },

     // Vérifier l'accès aux scènes
    async checkSceneAccess(sceneSourceId, sceneCibleId) {
      try {
        // Vérifier l'accès à la scène source
        const sourceAccess = await axios.get(`/api/scenes/${sceneSourceId}/access-check`, {
          headers: { 'X-User-Id': this.currentUserId }
        });
        
        if (!sourceAccess.data) {
          this.showAccessError('Vous n\'avez pas accès à la scène source.');
          return false;
        }
        
        // Vérifier l'accès à la scène cible
        const cibleAccess = await axios.get(`/api/scenes/${sceneCibleId}/access-check`, {
          headers: { 'X-User-Id': this.currentUserId }
        });
        
        if (!cibleAccess.data) {
          this.showAccessError('Vous n\'avez pas accès à la scène cible.');
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'accès aux scènes:', error);
        this.showAccessError('Erreur de vérification d\'accès aux scènes.');
        return false;
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
      if (!this.permissions.canEditRaccord) {
        this.showAccessError('Vous n\'avez pas les permissions pour modifier un raccord.');
        return;
      }
      
      // Vérifier l'accès aux scènes du raccord
      const hasAccess = await this.checkSceneAccess(raccord.sceneSourceId, raccord.sceneCibleId);
      if (!hasAccess) return;
      
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
    if (!this.permissions.canDeleteRaccord) {
      this.showAccessError('Vous n\'avez pas les permissions pour supprimer un raccord.');
      return;
    }
    
    // Trouver le raccord à supprimer pour afficher ses infos
    const raccord = this.raccords.find(r => r.id === id);
    if (!raccord) return;
    
    this.raccordToDelete = raccord;
    this.showDeleteModal = true;
    this.deleteError = '';
  },
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.raccordToDelete = null;
    this.isDeleting = false;
    this.deleteError = '';
  },
  
  async executeDeleteRaccord() {
    if (!this.raccordToDelete) return;
    
    this.isDeleting = true;
    this.deleteError = '';
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        this.deleteError = 'Utilisateur non connecté';
        this.isDeleting = false;
        return;
      }

      await axios.delete(`/api/raccords/${this.raccordToDelete.id}`, {
        headers: {
          'X-User-Id': user.id
        }
      });
      
      await this.loadRaccords();
      this.closeDeleteModal();
      
      // Optionnel: Afficher une notification de succès
      // this.showSuccessNotification('Raccord supprimé avec succès!');
      
    } catch (error) {
      console.error('Erreur lors de la suppression du raccord:', error);
      
      let errorMessage = 'Erreur lors de la suppression du raccord';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Suppression refusée. Vous n\'avez pas les droits nécessaires pour supprimer ce raccord.';
        } else if (error.response.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          errorMessage = error.response.data?.message || `Erreur serveur (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion.';
      }
      
      this.deleteError = errorMessage;
      this.isDeleting = false;
    }
  },

     // Afficher les erreurs d'accès
    showAccessError(message) {
      alert(message);
      this.error = message;
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

    showAccessError(message) {
    this.accessErrorMessage = message;
    this.showAccessErrorModal = true;
  },
  
  closeAccessErrorModal() {
    this.showAccessErrorModal = false;
    this.accessErrorMessage = '';
  },

  getStatutSlug(statutNom) {
  if (!statutNom) return 'en-attente';
  
  const statut = statutNom.toLowerCase();
  if (statut.includes('actif') || statut.includes('en cours')) {
    return 'actif';
  } else if (statut.includes('résolu') || statut.includes('résolution')) {
    return 'résolu';
  } else if (statut.includes('terminé') || statut.includes('complet')) {
    return 'termine';
  } else if (statut.includes('critique')) {
    return 'critique';
  } else {
    return 'en-attente';
  }
},

// Méthode pour obtenir l'icône du statut
getStatutIcon(statutNom) {
  if (!statutNom) return 'fas fa-clock';
  
  const statut = statutNom.toLowerCase();
  if (statut.includes('actif') || statut.includes('en cours')) {
    return 'fas fa-play-circle';
  } else if (statut.includes('résolu') || statut.includes('résolution')) {
    return 'fas fa-check-circle';
  } else if (statut.includes('terminé') || statut.includes('complet')) {
    return 'fas fa-check-circle';
  } else if (statut.includes('critique')) {
    return 'fas fa-exclamation-triangle';
  } else {
    return 'fas fa-clock';
  }
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

