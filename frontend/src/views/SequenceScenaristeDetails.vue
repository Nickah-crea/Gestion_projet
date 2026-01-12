<template>
  <div class="sequence-scenariste-details-page">
    <div class="app-wrapper-global">
      <!-- Sidebar latérale - Même structure que EpisodeScenaristeDetails.vue -->
      <div class="creation-sidebar-projet-scenariste">
        <div class="sidebar-header-projet-scenariste">
          <h2 class="sidebar-title-projet-scenariste">Détails Séquence</h2>
          <p class="sidebar-subtitle-projet-scenariste">Gérez votre séquence et ses scènes</p>
        </div>

        <!-- Section Actions Rapides -->
        <div class="sidebar-section-projet-scenariste">
          <h3 class="section-title-projet-scenariste">
            <i class="fas fa-bolt"></i> Actions Rapides
          </h3>
          <div class="sidebar-actions-projet-scenariste">
            <button 
              @click="goToAddScene" 
              class="sidebar-btn-projet-scenariste nouvelle-scene-btn"
            >
              <i class="fas fa-plus"></i>
              Nouvelle scène
            </button>
            <button 
              @click="goBack" 
              class="sidebar-btn-projet-scenariste"
            >
              <i class="fas fa-arrow-left"></i>
              Retour à l'épisode
            </button>
          </div>
        </div>

        <!-- Section Filtres -->
        <div class="sidebar-section-projet-scenariste">
          <h3 class="section-title-projet-scenariste">
            <i class="fas fa-filter"></i> Filtres Scènes
          </h3>
          <div class="filter-group-projet-scenariste">
            <div class="filter-item-projet-scenariste">
              <label for="timePeriodFilter">Période de mise à jour</label>
              <select 
                id="timePeriodFilter" 
                v-model="filterTimePeriod" 
                class="filter-select-projet-scenariste"
              >
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="this_week">Cette semaine</option>
                <option value="this_month">Ce mois-ci</option>
                <option value="this_year">Cette année</option>
                <option value="recent">Récent (7 derniers jours)</option>
              </select>
            </div>
            
            <div class="filter-item-projet-scenariste">
              <label for="statutFilter">Statut</label>
              <select 
                id="statutFilter" 
                v-model="filterStatut" 
                class="filter-select-projet-scenariste"
              >
                <option value="">Tous</option>
                <option v-for="statut in statutsScene" :key="statut.id" :value="statut.nomStatutsScene">
                  {{ statut.nomStatutsScene }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section Statistiques -->
        <div class="sidebar-section-projet-scenariste">
          <h3 class="section-title-projet-scenariste">
            <i class="fas fa-chart-bar"></i> Statistiques
          </h3>
          <div class="stats-projet-scenariste">
            <div class="stat-item-projet-scenariste">
              <span class="stat-number-projet-scenariste">{{ scenes.length }}</span>
              <span class="stat-label-projet-scenariste">Total scènes</span>
            </div>
            <div class="stat-item-projet-scenariste">
              <span class="stat-number-projet-scenariste">{{ filteredScenes.length }}</span>
              <span class="stat-label-projet-scenariste">Scènes filtrées</span>
            </div>
            <div class="stat-item-projet-scenariste">
              <span class="stat-number-projet-scenariste">{{ commentCount }}</span>
              <span class="stat-label-projet-scenariste">Commentaires</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal à droite -->
      <div class="creation-body-projet-scenariste">
        <div class="creation-main-content-projet-scenariste">
          
          <!-- Message d'accès refusé -->
          <div v-if="accessDenied" class="access-denied">
            <div class="access-denied-content">
              <i class="fas fa-exclamation-triangle"></i>
              <h3>Accès refusé</h3>
              <p>Vous n'avez pas les droits nécessaires pour accéder à cette séquence.</p>
              <button @click="goBack" class="back-btn">Retour à l'épisode</button>
            </div>
          </div>

          <!-- Contenu principal -->
          <main v-else>
            <!-- Détails de la séquence avec design amélioré -->
            <div class="project-details-spiral-Scenariste">
              <div class="project-info-spiral-Scenariste">
                <div class="project-main-content-Scenariste">
                  <div class="project-header-spiral-Scenariste">
                    <h3 class="project-title-spiral-Scenariste">
                      <i class="fas fa-list-ol"></i>
                      {{ sequence.titre || 'Chargement...' }}
                    </h3>
                    <span v-if="sequence.statutNom" class="project-statut-badge-Scenariste" :class="getStatutClass(sequence.statutNom)">
                      {{ sequence.statutNom }}
                    </span>
                  </div>
                  
                  <div class="project-meta-spiral-Scenariste">
                    <div class="meta-item-spiral-Scenariste">
                      <i class="fas fa-list-ol"></i>
                      <span class="meta-label">Ordre:</span>
                      <span class="meta-value">{{ sequence.ordre || '-' }}</span>
                    </div>
                  
                    <div class="meta-item-spiral-Scenariste">
                      <i class="fas fa-calendar-alt"></i>
                      <span class="meta-label">Créé le:</span>
                      <span class="meta-value">{{ formatDate(sequence.creeLe) }}</span>
                    </div>
                    <div class="meta-item-spiral-Scenariste">
                      <i class="fas fa-edit"></i>
                      <span class="meta-label">Modifié le:</span>
                      <span class="meta-value">{{ formatDate(sequence.modifieLe) }}</span>
                    </div>
                    <div class="meta-item-spiral-Scenariste" v-if="sequence.dateFin">
                      <i class="fas fa-calendar-check"></i>
                      <span class="meta-label">Terminé le:</span>
                      <span class="meta-value">{{ formatDate(sequence.dateFin) }}</span>
                    </div>
                    
                    <div class="meta-item-spiral-Scenariste" v-if="episode && episode.titre">
                      <i class="fas fa-film"></i>
                      <span class="meta-label">Épisode:</span>
                      <span class="meta-value">{{ episode.titre }}</span>
                    </div>
                  </div>
                  
                  <div class="project-synopsis-spiral-Scenariste" v-if="sequence.synopsis">
                    <h4>
                      <i class="fas fa-align-left"></i> Synopsis
                      <span class="comment-icon" @click="toggleCommentSection">
                        <i class="fas fa-comment"></i> {{ commentCount }}
                      </span>
                    </h4>
                    <p>{{ sequence.synopsis }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Commentaires -->
            <div v-if="showCommentSection" class="comment-section">
              <div class="comment-header">
                <i class="fas fa-comments"></i>
                Commentaires
              </div>
              
              <!-- Formulaire d'ajout de commentaire -->
              <div class="add-comment">
                <textarea v-model="newComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
                <button @click="addComment" class="add-comment-btn">
                  <i class="fas fa-paper-plane"></i> Ajouter
                </button>
              </div>
              
              <!-- Liste des commentaires -->
              <div class="comments-list">
                <div v-for="comment in comments" :key="comment.id" class="comment-item">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.utilisateurNom }}</span>
                    <span class="comment-date">{{ formatDate(comment.creeLe) }}</span>
                  </div>
                  <div class="comment-content">
                    {{ comment.contenu }}
                  </div>
                  <div class="comment-actions" v-if="comment.utilisateurId === user.id">
                    <button @click="deleteComment(comment.id)" class="delete-comment-btn">
                      <i class="fas fa-trash"></i> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section scènes -->
            <div class="episodes-section-projet-scenariste">
              <div class="section-header-projet-scenariste">
                <h3>
                  <i class="fas fa-list-alt"></i>
                  Scènes de la séquence
                </h3>
              </div>

              <!-- Liste des scènes -->
                <div class="projects-library-Scenariste">
          <div v-for="scene in filteredScenes" :key="scene.idScene" class="movie-card-Scenariste">
            <!-- Header de la carte -->
            <div class="movie-card-header-Scenariste">
              <div class="movie-statut-Scenariste">
                <span class="statut-badge-Scenariste" :class="getStatutClass(scene.statutNom)">
                  {{ scene.statutNom }}
                </span>
              </div>
              <div class="movie-actions-Scenariste">
                <!-- AJOUT: Icône de lieu pour ajouter un lieu à la scène -->
                <button class="action-btn-Scenariste lieu-btn-Scenariste" @click.stop="openAddLieuModal(scene)" title="Ajouter un lieu">
                  <i class="fas fa-map-marker-alt"></i>
                </button>
                <button class="action-btn-Scenariste edit-btn-Scenariste" @click.stop="startEditScene(scene)" title="Modifier">
                  <i class="fas fa-marker"></i>
                </button>
                <button class="action-btn-Scenariste delete-btn-Scenariste" @click.stop="confirmDeleteScene(scene.idScene)" title="Supprimer">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <!-- Contenu de la carte -->
            <div class="movie-info-Scenariste">
              <h3 class="movie-title-Scenariste">{{ scene.titre }}</h3>
              
              <div class="movie-synopsis" v-if="scene.synopsis">
                <p>{{ truncateText(scene.synopsis, 120) }}</p>
              </div>
                                  
              <!-- Métadonnées -->
              <div class="movie-meta-Scenariste">
                <i class="fas fa-list-ol"></i><span>Ordre: {{ scene.ordre }}</span>
                <span class="meta-separator-Scenariste">|</span>
                <i class="fas fa-calendar"></i><span>{{ formatShortDate(scene.creeLe) }}</span>
              </div>
              
              <!-- Actions en bas de carte -->
              <div class="movie-actions-bottom-Scenariste">
                <div class="actions-top-Scenariste">
                  <button class="action-btn-Scenariste primary-btn" @click="openSynopsisModal(scene)" title="Détails">
                    <i class="fas fa-search"></i>
                    <span>Voir détails</span>
                  </button>
                  <button class="action-btn-Scenariste accent-btn" @click="openSceneComments(scene)" title="Commentaires">
                    <i class="fas fa-comment"></i>
                    <span>Commentaires ({{ scene.commentCount || 0 }})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

              <!-- Message si aucune scène -->
              <div v-if="filteredScenes.length === 0" class="no-projects-Scenariste">
                <div class="no-projects-icon-Scenariste">
                  <i class="fas fa-list-alt"></i>
                </div>
                <h3>Aucune scène trouvée</h3>
                <p>Commencez par créer votre première scène !</p>
                <button class="add-project-btn-large-Scenariste" @click="goToAddScene">
                  <i class="fas fa-plus-circle"></i>
                  Créer une scène
                </button>
              </div>
            </div>

            <!-- Modale pour modifier la scène -->
            <div v-if="showEditModal" class="edit-project-modal-Scenariste">
              <div class="modal-content-Scenariste">
                <div class="modal-header-Scenariste">
                  <h3><i class="fas fa-edit"></i> Modifier la Scène</h3>
                  <button @click="closeEditModal" class="close-modal-btn-Scenariste">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div class="modal-body-Scenariste">
                  <!-- Message d'erreur général -->
                  <div v-if="editError" class="error-message-Scenariste">
                    {{ editError }}
                  </div>
                  
                  <div class="form-rows-container-Scenariste">
                    <!-- Ligne 1 : Titre + Ordre -->
                    <div class="form-row-Scenariste">
                      <div class="form-group-Scenariste">
                        <label>Titre de la scène:</label>
                        <input v-model="editingScene.titre" type="text" class="form-input-Scenariste" required>
                      </div>
                      
                      <div class="form-group-Scenariste">
                        <label>Ordre dans la séquence:</label>
                        <input 
                          v-model="editingScene.ordre" 
                          type="number" 
                          class="form-input-Scenariste"
                          :class="{ 'error-input': orderError }"
                          @blur="validateOrder"
                          required
                        >
                        <!-- Message d'erreur pour l'ordre -->
                        <div v-if="orderError" class="order-error">
                          {{ orderError }}
                        </div>
                        <!-- Suggestion d'ordre -->
                        <div v-if="suggestedOrder && !editingScene.ordre" class="suggestion-text">
                          Suggestion: Le prochain ordre disponible est {{ suggestedOrder }}
                          <button type="button" @click="useSuggestedOrder" class="suggestion-btn-projet-scenariste">
                            Utiliser cette valeur
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Ligne 2 : Statut -->
                    <div class="form-row-Scenariste">
                      <div class="form-group-Scenariste form-full-width-Scenariste">
                        <label>Statut:</label>
                        <select v-model="editingScene.statutId" class="form-select-Scenariste" required>
                          <option value="">Sélectionnez un statut</option>
                          <option v-for="statut in statutsScene" :key="statut.id" :value="statut.id">
                            {{ statut.nomStatutsScene }}
                          </option>
                        </select>
                      </div>
                    </div>
                    
                    <!-- Ligne 3 : Synopsis -->
                    <div class="form-row-Scenariste">
                      <div class="form-group-Scenariste form-full-width-Scenariste">
                        <label>Synopsis:</label>
                        <textarea v-model="editingScene.synopsis" class="form-textarea-Scenariste" rows="4" required></textarea>
                      </div>
                    </div>
                    
                    <!-- Ligne 4 : Séquence (lecture seule) -->
                    <div class="form-row-Scenariste">
                      <div class="form-group-Scenariste form-full-width-Scenariste">
                        <label>Séquence parente:</label>
                        <input :value="sequence.titre || 'Chargement...'" type="text" class="form-input-Scenariste" disabled>
                      </div>
                    </div>
                  </div>
                  
                  <div class="modal-footer-Scenariste">
                    <button @click="closeEditModal" class="cancel-btn-Scenariste">Annuler</button>
                    <button type="submit" @click="saveEditedScene" class="save-btn-Scenariste" :disabled="orderError !== ''">
                      <i class="fas fa-save"></i> Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modale pour afficher le synopsis complet -->
            <div v-if="showSynopsisModal" class="edit-project-modal-Scenariste">
              <div class="modal-content-Scenariste synopsis-modal">
                <div class="modal-header-Scenariste">
                  <h3><i class="fas fa-file-alt"></i> {{ selectedScene.titre }}</h3>
                  <button @click="closeSynopsisModal" class="close-modal-btn-Scenariste">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div class="modal-body-Scenariste">
                  <!-- Informations sur les comédiens -->
                  <div class="content-section-Scenariste" v-if="selectedSceneComediens.length > 0">
                    <h5><i class="fas fa-users"></i> Comédiens dans cette scène</h5>
                    <div class="comedien-list">
                      <div v-for="comedien in selectedSceneComediens" :key="comedien.id" class="content-item-Scenariste">
                        <i class="fas fa-user"></i>
                        <span>{{ comedien.comedienNom }}</span>
                        <span v-if="comedien.personnageNom" class="meta-value">({{ comedien.personnageNom }})</span>
                      </div>
                    </div>
                  </div>

                  <!-- Informations sur les lieux et plateaux -->
                  <div class="content-section-Scenariste" v-if="selectedSceneLieus.length > 0">
                    <h5><i class="fas fa-map-marker-alt"></i> Lieux et plateaux</h5>
                    <div class="location-list">
                      <div v-for="sceneLieu in selectedSceneLieus" :key="sceneLieu.id" class="content-item-Scenariste">
                        <i class="fas fa-location-dot"></i>
                        <span><strong>{{ sceneLieu.lieuNom }}</strong></span>
                        <span v-if="sceneLieu.plateauNom" class="meta-value"> - Plateau: {{ sceneLieu.plateauNom }}</span>
                        <span v-if="sceneLieu.descriptionUtilisation" class="meta-value"> ({{ sceneLieu.descriptionUtilisation }})</span>
                      </div>
                    </div>
                  </div>

                  <!-- Synopsis -->
                  <div class="content-section-Scenariste">
                    <h5><i class="fas fa-align-left"></i> Synopsis</h5>
                    <p class="synopsis-content">{{ selectedScene.synopsis || 'Aucun synopsis disponible' }}</p>
                  </div>
                </div>
                
                <div class="modal-footer-Scenariste">
                  <button type="button" @click="closeSynopsisModal" class="cancel-btn-Scenariste">Fermer</button>
                </div>
              </div>
            </div>

            <!-- Modale pour afficher les commentaires de la scène -->
            <div v-if="showSceneCommentModal" class="edit-project-modal-Scenariste">
              <div class="modal-content-Scenariste">
                <div class="modal-header-Scenariste">
                  <h3><i class="fas fa-comments"></i> Commentaires - {{ selectedScene.titre }}</h3>
                  <button @click="showSceneCommentModal = false" class="close-modal-btn-Scenariste">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div class="modal-body-Scenariste">
                  <!-- Formulaire d'ajout de commentaire -->
                  <div class="add-comment">
                    <textarea v-model="newSceneComment" placeholder="Ajouter un commentaire..." rows="3" class="form-textarea-Scenariste"></textarea>
                    <button @click="addSceneComment" class="add-comment-btn">
                      <i class="fas fa-paper-plane"></i> Ajouter
                    </button>
                  </div>
                  
                  <!-- Liste des commentaires -->
                  <div class="comments-list">
                    <div v-for="comment in sceneComments" :key="comment.id" class="comment-item">
                      <div class="comment-header">
                        <span class="comment-author">{{ comment.utilisateurNom }}</span>
                        <span class="comment-date">{{ formatDate(comment.creeLe) }}</span>
                      </div>
                      <div class="comment-content">
                        {{ comment.contenu }}
                      </div>
                      <div class="comment-actions" v-if="comment.utilisateurId === user.id">
                        <button @click="deleteSceneComment(comment.id)" class="delete-comment-btn">
                          <i class="fas fa-trash"></i> Supprimer
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="sceneComments.length === 0" class="no-comments">
                      Aucun commentaire pour cette scène.
                    </div>
                  </div>
                </div>
                
                <div class="modal-footer-Scenariste">
                  <button type="button" @click="showSceneCommentModal = false" class="cancel-btn-Scenariste">Fermer</button>
                </div>
              </div>
            </div>

            <!-- Modale pour ajouter un lieu à la scène -->
            <div v-if="showAddLieuModal" class="edit-project-modal-Scenariste">
              <div class="modal-content-Scenariste">
                <div class="modal-header-Scenariste">
                  <h3><i class="fas fa-map-marker-alt"></i> Ajouter un lieu à la scène: {{ selectedScene.titre }}</h3>
                  <button @click="closeAddLieuModal" class="close-modal-btn-Scenariste">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div class="modal-body-Scenariste">
                  <form @submit.prevent="addLieuToScene">
                    <div class="form-rows-container-Scenariste">
                      <div class="form-row-Scenariste">
                        <div class="form-group-Scenariste form-full-width-Scenariste">
                          <label>Sélectionner un lieu:</label>
                          <select v-model="selectedLieuId" @change="onLieuChange" class="form-select-Scenariste" required>
                            <option value="" disabled>Sélectionner un lieu</option>
                            <option v-for="lieu in lieuxDisponibles" :key="lieu.id" :value="lieu.id">
                              {{ lieu.nomLieu }} ({{ lieu.typeLieu }})
                            </option>
                          </select>
                        </div>
                      </div>
                      
                      <div class="form-row-Scenariste" v-if="plateauxDisponibles.length > 0">
                        <div class="form-group-Scenariste form-full-width-Scenariste">
                          <label>Sélectionner un plateau (optionnel):</label>
                          <select v-model="selectedPlateauId" class="form-select-Scenariste">
                            <option value="" disabled>Sélectionner un plateau</option>
                            <option v-for="plateau in plateauxDisponibles" :key="plateau.id" :value="plateau.id">
                              {{ plateau.nom }} ({{ plateau.typePlateau }})
                            </option>
                          </select>
                        </div>
                      </div>
                      
                      <div class="form-row-Scenariste">
                        <div class="form-group-Scenariste form-full-width-Scenariste">
                          <label>Description d'utilisation:</label>
                          <textarea v-model="lieuDescription" placeholder="Ex: Jour, Nuit, Intérieur, Extérieur..." rows="3" class="form-textarea-Scenariste"></textarea>
                        </div>
                      </div>
                    </div>
                    
                    <div class="modal-footer-Scenariste">
                      <button type="submit" class="save-btn-Scenariste">Ajouter</button>
                      <button type="button" @click="closeAddLieuModal" class="cancel-btn-Scenariste">Annuler</button>
                    </div>
                  </form>
                
                  <!-- Liste des lieux déjà associés à cette scène -->
                  <div class="associated-lieux" v-if="sceneLieus.length > 0">
                    <h5><i class="fas fa-list"></i> Lieux déjà associés:</h5>
                    <div v-for="sceneLieu in sceneLieus" :key="sceneLieu.id" class="scene-lieu-item">
                      <div class="scene-lieu-info">
                        <strong>{{ sceneLieu.lieuNom }}</strong>
                        <span v-if="sceneLieu.plateauNom"> - Plateau: {{ sceneLieu.plateauNom }}</span>
                        - {{ sceneLieu.descriptionUtilisation || 'Aucune description' }}
                      </div>
                      <button @click="removeLieuFromScene(sceneLieu.id)" class="delete-comment-btn" title="Supprimer">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <!-- Modal de confirmation de suppression -->
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
              Êtes-vous sûr de vouloir supprimer la scène <strong>"{{ sceneToDelete?.titre }}"</strong> ?
            </p>
            <p class="warning-subtext-Scenariste">
              Cette action est irréversible. Tous les commentaires et lieux associés à cette scène seront également supprimés.
            </p>
          </div>
          
          <div class="modal-footer-confirm-Scenariste">
            <button @click="closeDeleteModal" class="cancel-confirm-btn-Scenariste">
              <i class="fas fa-times"></i> Annuler
            </button>
            <button @click="executeDeleteScene" class="delete-confirm-btn-Scenariste" :disabled="isDeleting">
              <span v-if="isDeleting"><i class="fas fa-spinner fa-spin"></i> Suppression...</span>
              <span v-else><i class="fas fa-trash"></i> Supprimer définitivement</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Notification de succès/erreur -->
      <div v-if="notification.show" :class="['message-crea-profile', notification.type]" @click="hideNotification">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ notification.message }}
        <button class="message-close-crea-profile" @click.stop="hideNotification">
          <i class="fas fa-times"></i>
        </button>
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
      sequence: {},
      episode: {},
      scenes: [],
      statutsScene: [],
      accessDenied: false,
      filterTimePeriod: 'all',
      filterStatut: '',
      showEditModal: false,
      editingScene: {
        idScene: null,
        titre: '',
        synopsis: '',
        ordre: null,
        statutId: null,
      },
      showCommentSection: false,
      newComment: '',
      comments: [],
      commentCount: 0,
      showSynopsisModal: false,
      selectedScene: {},
      showSceneCommentModal: false,
      sceneComments: [],
      newSceneComment: '',
      showAddLieuModal: false,
      selectedSceneForLieu: null,
      selectedLieuId: null,
      selectedPlateauId: null,
      plateauxDisponibles: [],
      lieuDescription: '',
      lieuxDisponibles: [],
      sceneLieus: [],
      selectedSceneComediens: [],
      selectedSceneLieus: [],
      editError: '',
      orderError: '',
      suggestedOrder: null,
      existingOrders: [],
      originalOrder: null,
      showDeleteModal: false,
      sceneToDelete: null,
      isDeleting: false,
      notification: {
        show: false,
        message: '',
        type: 'success'
      },
      notificationTimeout: null
    };
  },
  computed: {
    filteredScenes() {
      let filtered = this.scenes;

      // Filtrer par statut
      if (this.filterStatut) {
        filtered = filtered.filter(scene => scene.statutNom === this.filterStatut);
      }

      // Filtrer par période
      const now = new Date();
      filtered = filtered.filter(scene => {
        const modifieLe = new Date(scene.modifieLe);
        switch (this.filterTimePeriod) {
          case 'today':
            return modifieLe.toDateString() === now.toDateString();
          case 'this_week':
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            return modifieLe >= oneWeekAgo;
          case 'this_month':
            return modifieLe.getMonth() === now.getMonth() && modifieLe.getFullYear() === now.getFullYear();
          case 'this_year':
            return modifieLe.getFullYear() === now.getFullYear();
          case 'recent':
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);
            return modifieLe >= sevenDaysAgo;
          default:
            return true;
        }
      });

      return filtered;
    },
  },
  async created() {
    await this.loadSequence();
    if (this.sequence.episodeId) {
      await this.loadEpisode();
    }
    await this.loadScenes();
    await this.loadStatutsScene();
    await this.loadCommentCount();
    await this.loadLieuxDisponibles();
  },
  methods: {
    async loadSequence() {
      try {
        const response = await axios.get(`/api/sequences/${this.$route.params.id}`, {
          timeout: 10000, // Ajout d'un timeout de 10 secondes
          headers: {
            'X-User-Id': this.user.id
          }
        });
        this.sequence = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement de la séquence:', error);
        if (error.response?.status === 403) {
          this.accessDenied = true;
        } else {
          this.showNotification('Erreur lors du chargement de la séquence', 'error');
        }
      }
    },

    async loadEpisode() {
      try {
        if (this.sequence.episodeId) {
          const response = await axios.get(`/api/episodes/${this.sequence.episodeId}`, {
            timeout: 10000,
            headers: {
              'X-User-Id': this.user.id
            }
          });
          this.episode = response.data;
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'épisode:', error);
        // Ne pas afficher d'erreur pour l'utilisateur, juste logger
        this.episode = {};
      }
    },
    
    async loadScenes() {
      try {
        const response = await axios.get(`/api/scenes/sequences/${this.$route.params.id}`, {
          timeout: 10000,
          headers: {
            'X-User-Id': this.user.id
          }
        });
        this.scenes = response.data;
        
        // Charger le nombre de commentaires pour chaque scène
        for (let scene of this.scenes) {
          try {
            const countResponse = await axios.get(`/api/scene-commentaires/scene/${scene.idScene}/count`, {
              timeout: 5000
            });
            scene.commentCount = countResponse.data;
          } catch (error) {
            console.error('Erreur lors du chargement du nombre de commentaires pour la scène:', error);
            scene.commentCount = 0;
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des scènes:', error);
        this.showNotification('Erreur lors du chargement des scènes', 'error');
      }
    },

    async loadStatutsScene() {
      try {
        const response = await axios.get('/api/statuts-scene', {
          timeout: 10000
        });
        this.statutsScene = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      }
    },

    async loadComments() {
      try {
        const response = await axios.get(`/api/sequence-commentaires/sequence/${this.$route.params.id}`, {
          timeout: 10000
        });
        this.comments = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error);
      }
    },
    
    async loadCommentCount() {
      try {
        const response = await axios.get(`/api/sequence-commentaires/sequence/${this.$route.params.id}/count`, {
          timeout: 10000
        });
        this.commentCount = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de commentaires:', error);
      }
    },
    
    async toggleCommentSection() {
      this.showCommentSection = !this.showCommentSection;
      if (this.showCommentSection) {
        await this.loadComments();
      }
    },
    
    async addComment() {
      if (!this.newComment.trim()) return;
      
      try {
        await axios.post('/api/sequence-commentaires', {
          contenu: this.newComment,
          sequenceId: this.$route.params.id
        }, {
          headers: {
            'X-User-Id': this.user.id
          },
          timeout: 10000
        });
        
        this.newComment = '';
        await this.loadComments();
        await this.loadCommentCount();
        this.showNotification('Commentaire ajouté avec succès!', 'success');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        this.showNotification('Erreur lors de l\'ajout du commentaire', 'error');
      }
    },
    
    async deleteComment(commentId) {
      try {
        await axios.delete(`/api/sequence-commentaires/${commentId}`, {
          timeout: 10000
        });
        await this.loadComments();
        await this.loadCommentCount();
        this.showNotification('Commentaire supprimé avec succès!', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        this.showNotification('Erreur lors de la suppression du commentaire', 'error');
      }
    },
    
    async openSceneComments(scene) {
      this.selectedScene = scene;
      await this.loadSceneComments(scene.idScene);
      this.showSceneCommentModal = true;
    },

    async loadSceneComments(sceneId) {
      try {
        const response = await axios.get(`/api/scene-commentaires/scene/${sceneId}`, {
          timeout: 10000
        });
        this.sceneComments = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires de scène:', error);
        this.showNotification('Erreur lors du chargement des commentaires', 'error');
      }
    },

    async addSceneComment() {
      if (!this.newSceneComment.trim()) return;
      
      try {
        await axios.post('/api/scene-commentaires', {
          contenu: this.newSceneComment,
          sceneId: this.selectedScene.idScene
        }, {
          headers: {
            'X-User-Id': this.user.id
          },
          timeout: 10000
        });
        
        this.newSceneComment = '';
        await this.loadSceneComments(this.selectedScene.idScene);
        await this.loadScenes();
        this.showNotification('Commentaire ajouté avec succès!', 'success');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        this.showNotification('Erreur lors de l\'ajout du commentaire', 'error');
      }
    },

    async deleteSceneComment(commentId) {
      try {
        await axios.delete(`/api/scene-commentaires/${commentId}`, {
          timeout: 10000
        });
        await this.loadSceneComments(this.selectedScene.idScene);
        await this.loadScenes();
        this.showNotification('Commentaire supprimé avec succès!', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        this.showNotification('Erreur lors de la suppression du commentaire', 'error');
      }
    },

    startEditScene(scene) {
      this.editingScene = {
        idScene: scene.idScene,
        titre: scene.titre,
        synopsis: scene.synopsis,
        ordre: scene.ordre,
        statutId: this.getStatutIdByNom(scene.statutNom),
      };
      this.originalOrder = scene.ordre;
      this.showEditModal = true;
      
      this.loadExistingOrders();
    },

    async loadExistingOrders() {
      try {
        const response = await axios.get(`/api/scenes/sequences/${this.$route.params.id}`, {
          timeout: 10000,
          headers: {
            'X-User-Id': this.user.id
          }
        });
        
        this.existingOrders = response.data
          .filter(scene => scene.idScene !== this.editingScene.idScene)
          .map(scene => scene.ordre);
        
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
    },
    
    validateOrder() {
      if (!this.editingScene.ordre) {
        this.orderError = 'L\'ordre est requis';
        return;
      }
      
      const orderNum = parseInt(this.editingScene.ordre);
      
      if (orderNum < 1) {
        this.orderError = 'L\'ordre doit être un nombre positif';
        return;
      }
      
      if (this.existingOrders.includes(orderNum) && orderNum !== this.originalOrder) {
        this.orderError = `L'ordre ${orderNum} existe déjà pour cette séquence. Veuillez choisir un autre numéro.`;
        return;
      }
      
      this.orderError = '';
    },
    
    useSuggestedOrder() {
      this.editingScene.ordre = this.suggestedOrder;
      this.validateOrder();
    },

    getStatutIdByNom(nom) {
      const statut = this.statutsScene.find(s => s.nomStatutsScene === nom);
      return statut ? statut.id : null;
    },

    getStatutClass(statutNom) {
      if (!statutNom) return '';
      
      const statut = statutNom.toLowerCase();
      if (statut.includes('en cours') || statut.includes('actif')) {
        return 'statut-en-cours';
      } else if (statut.includes('terminé') || statut.includes('complet')) {
        return 'statut-termine';
      } else if (statut.includes('attente') || statut.includes('en attente')) {
        return 'statut-attente';
      } else if (statut.includes('annulé') || statut.includes('abandonné')) {
        return 'statut-annule';
      } else if (statut.includes('planifié') || statut.includes('planification')) {
        return 'statut-planifie';
      } else {
        return 'statut-attente';
      }
    },

    async saveEditedScene() {
      this.validateOrder();
      if (this.orderError) {
        return;
      }
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          this.showNotification('Utilisateur non connecté', 'error');
          return;
        }

        const response = await axios.put(`/api/scenes/${this.editingScene.idScene}`, {
          titre: this.editingScene.titre,
          synopsis: this.editingScene.synopsis,
          ordre: parseInt(this.editingScene.ordre),
          statutId: this.editingScene.statutId,
        }, {
          headers: {
            'X-User-Id': user.id
          },
          timeout: 10000
        });
        
        this.showEditModal = false;
        this.editError = '';
        this.orderError = '';
        await this.loadScenes();
        this.showNotification('Scène modifiée avec succès!', 'success');
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la scène:', error);
        
        if (error.response?.status === 400 && 
            error.response?.data?.message?.includes('ordre')) {
          this.orderError = 'Cet ordre existe déjà pour cette séquence. Veuillez choisir un autre numéro.';
          this.editError = 'Erreur de validation: ' + this.orderError;
          this.showNotification(this.orderError, 'error');
        } else {
          this.editError = error.response?.data?.message || 'Erreur lors de la mise à jour de la scène';
          this.showNotification(this.editError, 'error');
        }
      }
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editingScene = {
        idScene: null,
        titre: '',
        synopsis: '',
        ordre: null,
        statutId: null,
      };
      this.editError = '';
      this.orderError = '';
      this.suggestedOrder = null;
      this.existingOrders = [];
      this.originalOrder = null;
      this.hideNotification();
    },

    async confirmDeleteScene(sceneId) {
      const scene = this.scenes.find(sc => sc.idScene === sceneId);
      if (!scene) return;
      
      this.sceneToDelete = scene;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.sceneToDelete = null;
      this.isDeleting = false;
    },

    async executeDeleteScene() {
      if (!this.sceneToDelete) return;
      
      this.isDeleting = true;
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.id) {
          this.showNotification('Utilisateur non connecté', 'error');
          this.isDeleting = false;
          return;
        }

        await axios.delete(`/api/scenes/${this.sceneToDelete.idScene}`, {
          headers: {
            'X-User-Id': user.id
          },
          timeout: 10000
        });
        
        await this.loadScenes();
        this.closeDeleteModal();
        this.showNotification('Scène supprimée avec succès!', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression de la scène:', error);
        this.showNotification('Erreur lors de la suppression de la scène', 'error');
        this.isDeleting = false;
      }
    },

    async openAddLieuModal(scene) {
      this.selectedScene = scene;
      this.showAddLieuModal = true;
      await this.loadSceneLieus(scene.idScene);
    },
    
    closeAddLieuModal() {
      this.showAddLieuModal = false;
      this.selectedLieuId = null;
      this.lieuDescription = '';
      this.sceneLieus = [];
      this.selectedScene = {};
    },
    
    async loadLieuxDisponibles() {
      try {
        const response = await axios.get('/api/lieux', {
          timeout: 10000
        });
        this.lieuxDisponibles = response.data || [];
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        this.lieuxDisponibles = [];
      }
    },

    async loadSceneLieus(sceneId) {
      try {
        const response = await axios.get(`/api/scene-lieux/scenes/${sceneId}`, {
          timeout: 10000
        });
        this.sceneLieus = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des lieux de la scène:', error);
      }
    },

    async onLieuChange() {
      if (this.selectedLieuId) {
        try {
          const response = await axios.get(`/api/scene-lieux/lieux/${this.selectedLieuId}/plateaux`, {
            timeout: 10000
          });
          this.plateauxDisponibles = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement des plateaux:', error);
          this.plateauxDisponibles = [];
        }
      } else {
        this.plateauxDisponibles = [];
        this.selectedPlateauId = null;
      }
    },

    async addLieuToScene() {
      if (!this.selectedLieuId) {
        this.showNotification('Veuillez sélectionner un lieu', 'error');
        return;
      }
      
      try {
        const sceneId = Number(this.selectedScene.idScene);
        const lieuId = Number(this.selectedLieuId);
        const plateauId = this.selectedPlateauId ? Number(this.selectedPlateauId) : null;
        
        const payload = {
          sceneId: sceneId,
          lieuId: lieuId,
          plateauId: plateauId,
          descriptionUtilisation: this.lieuDescription || ''
        };

        const response = await axios.post('/api/scene-lieux', payload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        await this.loadSceneLieus(this.selectedScene.idScene);
        
        this.selectedLieuId = null;
        this.selectedPlateauId = null;
        this.lieuDescription = '';
        this.plateauxDisponibles = [];
        
        this.showNotification('Lieu et plateau ajoutés avec succès à la scène!', 'success');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du lieu:', error);
        let errorMessage = 'Erreur lors de l\'ajout du lieu';
        if (error.response?.data) {
          errorMessage += ': ' + (error.response.data.message || JSON.stringify(error.response.data));
        }
        this.showNotification(errorMessage, 'error');
      }
    },

    async removeLieuFromScene(sceneLieuId) {
      try {
        await axios.delete(`/api/scene-lieux/${sceneLieuId}`, {
          timeout: 10000
        });
        await this.loadSceneLieus(this.selectedScene.idScene);
        this.showNotification('Lieu retiré de la scène avec succès!', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        this.showNotification('Erreur lors de la suppression du lieu', 'error');
      }
    },

    async openSynopsisModal(scene) {
      this.selectedScene = scene;
      this.showSynopsisModal = true;
      
      // Charger les comédiens de la scène
      await this.loadSceneComediens(scene.idScene);
      
      // Charger les lieux de la scène
      await this.loadSceneLieus(scene.idScene);
    },

    async loadSceneComediens(sceneId) {
      try {
        const response = await axios.get(`/api/comedien-scene/scene/${sceneId}`, {
          timeout: 10000
        });
        this.selectedSceneComediens = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des comédiens de la scène:', error);
        this.selectedSceneComediens = [];
      }
    },

    closeSynopsisModal() {
      this.showSynopsisModal = false;
      this.selectedScene = {};
      this.selectedSceneComediens = [];
      this.selectedSceneLieus = [];
    },

    goToAddScene() {
      this.$router.push(`/sequence/${this.$route.params.id}/add-scene`);
    },
    
    goBack() {
      if (this.sequence.episodeId) {
        this.$router.push(`/episode/${this.sequence.episodeId}/detail-episode`);
      } else {
        this.$router.push('/projets');
      }
    },
    
    formatDate(date) {
      if (!date) return 'Non spécifié';
      try {
        return new Date(date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch (error) {
        return 'Date invalide';
      }
    },

    formatShortDate(date) {
      if (!date) return '';
      try {
        return new Date(date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short'
        });
      } catch (error) {
        return '';
      }
    },

    truncateText(text, length) {
      if (!text) return '';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    },

    showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message: message,
        type: type
      };
      
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      
      this.notificationTimeout = setTimeout(() => {
        this.hideNotification();
      }, 5000);
    },

    hideNotification() {
      this.notification.show = false;
      this.notification.message = '';
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = null;
      }
    }
  }
};
</script>