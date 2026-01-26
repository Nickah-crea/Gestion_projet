<template>
  <div class="app-wrapper-global" style="background: #F5E8B2;">
    <!-- Sidebar gauche -->
    <LeftSidebar
      class="creation-sidebar-crea-comedien-screen-work left-sidebar-ecran-travail-screen-work"
      :open="leftSidebarOpen"
      :projet-title="store.projetTitle"
      :projet-synopsis="store.projetSynopsis"
      :status-color="store.statusColor"
      :projet-status="store.projetStatus"
      :episodes-count="store.episodes.length"
      :total-sequences="store.totalSequences"
      :episodes="episodes"
      :sequences="sequences"
      :scenes="scenes"
      :current-episode="currentEpisode"
      :current-sequence="currentSequence"
      :current-scene="currentScene"
      :sequence-comment-count="sequenceCommentCount"
      :scene-comment-count="getSceneCommentCount(currentScene?.idScene)"
      :user-permissions="userPermissions"
      :sidebar-selection="sidebarSelection" 
      @edit-project="startEditProject"
      @delete-project="confirmDeleteProject"
      @edit-episode="startEditEpisode"
      @delete-episode="confirmDeleteEpisode"
      @edit-sequence="startEditSequence"
      @delete-sequence="deleteSequence"
      @edit-scene="startEditScene"
      @delete-scene="deleteScene"
      @view-sequence-comments="toggleSequenceCommentSection"
      @add-episode="goToAddEpisode"
      @add-sequence="goToAddSequence"
      @add-scene="addScene"
      @select-item="handleSidebarSelection" 
      @toggle-left="toggleLeftSidebar"
    />
    
    <!-- Sidebar droite -->
    <RightSidebar
      :open="sidebarOpen"
      :current-episode="currentEpisode"
      :current-sequence="currentSequence"
      :episodes="episodes"
      :user-permissions="userPermissions"
      :is-scene-mode="sidebarSelection.type === 'scene'"
      @toggle="toggleSidebar"
      @go-to-calendrier="goToCalendrierTournage"
      @export-scenes-only="exportScenesOnlyPDF"
      @export-sequence-dialogues="exportSequenceDialoguesPDF"
      @export-sequence-complete="exportSequenceCompletePDF"
      @export-episode="exportEpisodeWithSequencePDF"
      @add-episode="goToAddEpisode"
      @add-sequence="goToAddSequence"
      @add-lieu="goToAddLieu"
      @add-plateau="goToAddPlateau"
      @add-comedien="goToAddComedien"
      @add-personnage="goToAddPersonnage"
    />
    
    <!-- Navabr outils scènes (uniquement pour les scènes) -->
    <SceneToolsNavbar
      v-if="sidebarSelection.type === 'scene' && currentScene"
      :scene="currentScene"
      :projet-id="projetId"
      :episode-id="currentEpisode?.idEpisode"
      :sequence-id="currentSequence?.idSequence"
      :user-permissions="userPermissions"
      :comment-count="getSceneCommentCount(currentScene.idScene)"
      :photo-count="getPhotoCount(currentScene.idScene)"
      :raccord-count="getRaccordCount(currentScene.idScene)"
      :right-sidebar-open="sidebarOpen"
      :has-prev-scene="hasPrevScene"
      :has-next-scene="hasNextScene"
      :current-scene-index="store.currentSceneIndex"
      :total-scenes="scenes.length"
      @close="closeSceneToolsNavbar"
      @tournage-updated="onTournageUpdated"
      @raccords-updated="onRaccordsUpdated"
      @raccord-created="onRaccordCreated"
      @add-dialogue="startAddDialogue"
      @add-lieu="openAddLieuModal"
      @export-scene-pdf="exportScenePDF"
      @export-raccords-images="exportRaccordsByScene"
      @toggle-comments="toggleSceneCommentSection"
      @open-email="openEmailModal"
      @go-to-prev-scene="goToPrevScene"
      @go-to-next-scene="goToNextScene"
    />

    <div 
      class="header-ecran-travail-screen-work-header-navigation"
      :class="{
          'scene-mode-active-header-navigation': sidebarSelection.type === 'scene',
          'sequence-mode-active-header-navigation': sidebarSelection.type === 'sequence',
          'episode-mode-active-header-navigation': sidebarSelection.type === 'episode'
      }"
  >
      <!-- Header navigation unique sur une même ligne -->
      <div class="fixed-nav-container-screen-work-header-navigation">
          <!-- Bouton Précédent tout à gauche -->
          <div class="left-section-header-navigation">
              <div v-if="showNavButtons" class="global-navigation-buttons-header-navigation">
                  <button 
                      class="nav-btn-fixed-left-screen-work-header-navigation"
                      @click="goToPrevPage" 
                      :disabled="!hasPrev || isLoading"
                  >
                      <i class="fas fa-chevron-left"></i> Précédent
                  </button>
              </div>
          </div>
          
          <!-- Navigation scène au centre-gauche -->
          <div v-if="sidebarSelection.type === 'scene'" class="scene-section-header-navigation">
              <div class="scene-navigation-buttons-screen-work-header-navigation">
                  <button 
                      class="nav-btn-ecran-travail-screen-work-header-navigation scene-nav-btn-screen-work-header-navigation"
                      @click="goToPrevScene"
                      :disabled="!hasPrevScene || isLoading"
                      title="Scène précédente"
                  >
                      <i class="fas fa-chevron-left"></i> Scène Préc.
                  </button>
                  <button 
                      class="nav-btn-ecran-travail-screen-work-header-navigation scene-nav-btn-screen-work-header-navigation"
                      @click="goToNextScene"
                      :disabled="!hasNextScene || isLoading"
                      title="Scène suivante"
                  >
                      Scène Suiv. <i class="fas fa-chevron-right"></i>
                  </button>
              </div>
          </div>
          
          <!-- Contexte au centre -->
          <div class="center-section-header-navigation">
              <span v-if="currentEpisode || currentSequence || currentScene" class="current-context-screen-work-header-navigation">
                  {{ getCurrentContext() }}
              </span>
          </div>
          
          <!-- Bouton Suivant tout à droite -->
          <div class="right-section-header-navigation">
              <div v-if="showNavButtons" class="global-navigation-buttons-header-navigation">
                  <button 
                      class="nav-btn-fixed-right-screen-work-header-navigation"
                      @click="goToNextPage" 
                      :disabled="!hasNext || isLoading"
                  >
                      Suivant <i class="fas fa-chevron-right"></i>
                  </button>
              </div>
          </div>
      </div>
  </div>

    <!-- Contenu principal -->
    <div
      class="ecran-travail-ecran-travail-screen-work" 
      :class="{ 
        'with-tools-navbar': sidebarSelection.type === 'scene' && currentScene,
        'right-sidebar-open-screen-work': sidebarOpen,
        'with-secondary-navbar': sidebarSelection.type === 'scene' && currentScene,
        'project-view-mode': sidebarSelection.type === 'project' // AJOUT
      }"
      :style="getMainContentStyle()"
    >
      <!-- ==================== CONTENU DYNAMIQUE ==================== -->
      
      <!-- 1. VUE PROJET -->
      <div v-if="sidebarSelection.type === 'project'" class="main-content-view-screen-work project-view-mode">
        <div class="project-view-screen-work">
          <div class="project-header-view-screen-work">
            <h1 class="project-title-view-screen-work">{{ store.projetTitle }}</h1>
            <div class="project-status-badge-screen-work" :style="{ backgroundColor: store.statusColor }">
              {{ store.projetStatus }}
            </div>
          </div>
          
          <div class="project-details-view-screen-work">
            <div class="detail-section-header-screen-work">
              <h3><i class="fas fa-align-left"></i> Synopsis</h3>
              <button class="edit-project-title-btn" @click="startEditProjectModal">
                <i class="fas fa-pen"></i> Modifier le projet
              </button>
            </div>
            
            <div class="detail-section-content-screen-work">
              <p class="synopsis-text-screen-work">{{ store.projetSynopsis || 'Aucun synopsis disponible.' }}</p>
            </div>
            
            <!-- Actions supplémentaires en dessous si besoin -->
            <div class="project-actions-view-screen-work" v-if="userPermissions.canCreateEpisode">
              <button class="action-btn-secondary-screen-work" @click="goToAddEpisode">
                <i class="fas fa-plus"></i> Ajouter un épisode
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. VUE ÉPISODE -->
      <div v-else-if="sidebarSelection.type === 'episode'" class="main-content-view-screen-work">
        <!-- Conteneur principal identique à projet -->
        <div class="episode-view-container-screen-work">
          
          <!-- En-tête épisode (même structure que projet) -->
          <div class="episode-header-view-screen-work">
            <div class="episode-header-left-screen-work">
              <h1 class="episode-title-view-screen-work">
                Épisode {{ currentEpisode.ordre }} : {{ currentEpisode.titre }}
                <div class="episode-status-badge-screen-work">
                  {{ currentEpisode.statutNom || 'Non défini' }}
                </div>
                <span class="comment-badge-screen-work" @click="toggleEpisodeCommentSection">
                  <i class="fas fa-comments"></i> 
                  {{ getEpisodeCommentCount(currentEpisode.idEpisode) }} commentaire(s)
                </span>
              </h1>
            </div>
          </div>

          <!-- Barre d'actions (sous les stats) -->
          <div class="episode-actions-bar-screen-work">
            <button class="details-btn-screen-work" @click="showEpisodeDetailsModal = true">
              <i class="fas fa-info-circle"></i> Voir détails
            </button>
            
            <button v-if="userPermissions.canEditEpisode" class="edit-btn-screen-work" @click="startEditEpisode">
              <i class="fas fa-pen"></i> Modifier
            </button>
            
            <button v-if="userPermissions.canCreateEpisode" class="delete-btn-screen-work" @click="confirmDeleteEpisode">
              <i class="fas fa-trash"></i> Supprimer
            </button>
            
            <button v-if="userPermissions.canCreateSequence" class="add-btn-screen-work" @click="goToAddSequence">
              <i class="fas fa-plus"></i> Ajouter une séquence
            </button>
          </div>

          <!-- Section Commentaires (optionnelle, comme action supplémentaire) -->
            <div v-if="showEpisodeCommentSection" class="detail-section-screen-work comment-section-screen-work">
              <h3><i class="fas fa-comments"></i> Commentaires de l'épisode</h3>
              <div class="add-comment-screen-work">
                <textarea v-model="newEpisodeComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
                <button @click="addEpisodeComment" class="add-comment-btn-screen-work">
                  <i class="fas fa-plus-circle"></i> Ajouter
                </button>
              </div>
              
              <div class="comments-list-screen-work">
                <div v-for="comment in episodeComments" :key="comment.id" class="comment-item-screen-work">
                  <div class="comment-header-screen-work">
                    <span class="comment-author-screen-work">{{ comment.utilisateurNom }}</span>
                    <span class="comment-date-screen-work">{{ formatDate(comment.creeLe) }}</span>
                  </div>
                  <div class="comment-content-screen-work">
                    {{ comment.contenu }}
                  </div>
                  <div class="comment-actions-screen-work" v-if="comment.utilisateurId === user.id">
                    <button @click="deleteEpisodeComment(comment.id)" class="delete-comment-btn-screen-work">
                      <i class="fas fa-trash"></i> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          
          <!-- Section détails (structure projet) -->
          <div class="episode-details-view-screen-work">
            
            <!-- Section Équipe & Synopsis -->
            <div class="detail-section-screen-work">
              <!-- <button v-if="userPermissions.canEditEpisode" class="edit-episode-btn-screen-work" @click="startEditEpisode">
                  <i class="fas fa-pen"></i> Modifier
                </button> -->
              
              <div class="detail-section-content-screen-work">
                <!-- Équipe -->
                <div v-if="currentEpisode.realisateur || currentEpisode.scenariste" 
                    class="team-section-screen-work">
                  <h4><i class="fas fa-users"></i> Équipe</h4>
                  <div class="team-grid-screen-work">
                    <div v-if="currentEpisode.realisateur" class="team-member-screen-work">
                      <i class="fas fa-video"></i>
                      <div class="team-member-info-screen-work">
                        <span class="team-role-screen-work">Réalisateur</span>
                        <span class="team-name-screen-work">{{ currentEpisode.realisateur.nom }}</span>
                      </div>
                    </div>
                    <div v-if="currentEpisode.scenariste" class="team-member-screen-work">
                      <i class="fas fa-pen"></i>
                      <div class="team-member-info-screen-work">
                        <span class="team-role-screen-work">Scénariste</span>
                        <span class="team-name-screen-work">{{ currentEpisode.scenariste.nom }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Synopsis -->
                <div v-if="currentEpisode.synopsis" class="synopsis-section-screen-work">
                  <h4><i class="fas fa-align-left"></i> Synopsis</h4>
                  <p class="synopsis-text-screen-work">{{ currentEpisode.synopsis }}</p>
                </div>
                
                <div v-if="!currentEpisode.synopsis && !currentEpisode.realisateur && !currentEpisode.scenariste">
                  <p class="empty-message">Aucune information disponible. Ajoutez des détails en cliquant sur "Modifier".</p>
                </div>
              </div>
            </div>
            
            <!-- Section Séquences -->
            <div class="detail-section-screen-work">
              <div class="detail-section-header-screen-work">
                <h3><i class="fas fa-list-ol"></i> Séquences ({{ sequences.length }})</h3>
                <button v-if="userPermissions.canCreateSequence" class="add-btn-screen-work" @click="goToAddSequence">
                  <i class="fas fa-plus"></i> Ajouter une séquence
                </button>
              </div>
              
              <div v-if="sequences.length > 0" class="sequences-list-screen-work">
                <div 
                  v-for="sequence in sequences" 
                  :key="sequence.idSequence"
                  class="sequence-card-screen-work"
                  :class="{ 'active-screen-work': sidebarSelection.id === sequence.idSequence }"
                  @click="handleSidebarSelection({ type: 'sequence', id: sequence.idSequence })"
                >
                  <div class="sequence-card-header-screen-work">
                    <i class="fas fa-list-ol"></i>
                    <span class="sequence-order-screen-work">Séquence {{ sequence.ordre }}</span>
                    <span class="sequence-title-screen-work">{{ sequence.titre }}</span>
                  </div>
                  <div class="sequence-card-footer-screen-work">
                    <span class="scene-count-screen-work">
                      <i class="fas fa-film"></i> {{ sequence.scenes?.length || 0 }} scène(s)
                    </span>
                    <span class="sequence-status-screen-work">{{ sequence.statutNom || 'Non défini' }}</span>
                  </div>
                </div>
              </div>
              
              <div v-else class="empty-state-screen-work">
                <p>Aucune séquence dans cet épisode.</p>
                <button v-if="userPermissions.canCreateSequence" class="add-btn-screen-work" @click="goToAddSequence">
                  <i class="fas fa-plus"></i> Créer la première séquence
                </button>
              </div>
            </div>
            
            <!-- Actions supplémentaires (style projet) -->
            <div class="episode-actions-view-screen-work">
              <button class="action-btn-secondary-screen-work" @click="toggleEpisodeCommentSection">
                <i class="fas fa-comments"></i> 
                {{ showEpisodeCommentSection ? 'Masquer' : 'Afficher' }} les commentaires
              </button>
            </div>
          </div>
        </div>
        
        <!-- ==================== MODALE POUR LES INFORMATIONS DE L'ÉPISODE ==================== -->
        <div v-if="showEpisodeDetailsModal" class="modal-overlay-screen-work" @click="showEpisodeDetailsModal = false">
          <div class="modal-content-screen-work episode-details-modal" @click.stop>
            <div class="modal-header-screen-work">
              <h3><i class="fas fa-info-circle"></i> Informations de l'épisode</h3>
              <button @click="showEpisodeDetailsModal = false" class="close-btn-screen-work">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body-screen-work">
              <div class="details-grid-screen-work">
                <div class="detail-item-screen-work">
                  <span class="detail-label-screen-work">Titre :</span>
                  <span class="detail-value-screen-work">{{ currentEpisode.titre }}</span>
                </div>
                <div class="detail-item-screen-work">
                  <span class="detail-label-screen-work">Ordre :</span>
                  <span class="detail-value-screen-work">Épisode {{ currentEpisode.ordre }}</span>
                </div>
                <div class="detail-item-screen-work">
                  <span class="detail-label-screen-work">Statut :</span>
                  <span class="detail-value-screen-work">{{ currentEpisode.statutNom || 'Non défini' }}</span>
                </div>
                <div class="detail-item-screen-work" v-if="currentEpisode.dateCreation">
                  <span class="detail-label-screen-work">Créé le :</span>
                  <span class="detail-value-screen-work">{{ formatDate(currentEpisode.dateCreation) }}</span>
                </div>
                <div class="detail-item-screen-work" v-if="currentEpisode.dateModification">
                  <span class="detail-label-screen-work">Modifié le :</span>
                  <span class="detail-value-screen-work">{{ formatDate(currentEpisode.dateModification) }}</span>
                </div>
                <div class="detail-item-screen-work" v-if="currentEpisode.scenariste">
                  <span class="detail-label-screen-work">Scénariste :</span>
                  <span class="detail-value-screen-work">{{ currentEpisode.scenariste.nom }}</span>
                </div>
                <div class="detail-item-screen-work" v-if="currentEpisode.realisateur">
                  <span class="detail-label-screen-work">Réalisateur :</span>
                  <span class="detail-value-screen-work">{{ currentEpisode.realisateur.nom }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer-screen-work">
              <button @click="showEpisodeDetailsModal = false" class="btn-primary-screen-work">
                <i class="fas fa-check"></i> Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. VUE SÉQUENCE -->
      <div v-else-if="sidebarSelection.type === 'sequence'" class="main-content-view-screen-work">
        <!-- Conteneur principal identique à projet -->
        <div class="sequence-view-container-screen-work">
          
          <!-- En-tête séquence (même structure que projet) -->
          <div class="sequence-header-view-screen-work">
            <div class="sequence-header-left-screen-work">
              <h1 class="sequence-title-view-screen-work">
                <span class="sequence-order-badge-screen-work">
                  <i class="fas fa-list-ol"></i> Séquence {{ currentSequence.ordre }}
                </span>
                {{ currentSequence.titre }}
                <div class="sequence-status-badge-screen-work" :class="getStatusClass(currentSequence.statutNom)">
                  {{ currentSequence.statutNom || 'Non défini' }}
                </div>
                <span class="comment-badge-screen-work" @click="toggleSequenceCommentSection">
                  <i class="fas fa-comments"></i> 
                  {{ sequenceCommentCount }} commentaire(s)
                </span>
              </h1>
            </div>
          </div>
          
          <!-- Barre d'actions (sous les stats) -->
          <div class="sequence-actions-bar-screen-work">
            <button class="details-btn-screen-work" @click="showSequenceDetails = true">
              <i class="fas fa-info-circle"></i> Voir détails
            </button>
            
            <button v-if="userPermissions.canCreateSequence" class="edit-btn-screen-work" @click="startEditSequence(currentSequence)">
              <i class="fas fa-pen"></i> Modifier
            </button>
            
            <button v-if="userPermissions.canCreateSequence" class="delete-btn-screen-work" @click="deleteSequence(currentSequence.idSequence)">
              <i class="fas fa-trash"></i> Supprimer
            </button>
            
            <button v-if="userPermissions.canCreateScene" class="add-btn-screen-work" @click="goToAddScene">
              <i class="fas fa-plus"></i> Ajouter une scène
            </button>
            
            <button class="comments-btn-screen-work" @click="toggleSequenceCommentSection">
              <i class="fas fa-comments"></i> 
              {{ showSequenceCommentSection ? 'Masquer' : 'Afficher' }} les commentaires
            </button>
          </div>
          
          <!-- Section Commentaires (optionnelle) -->
            <div v-if="showSequenceCommentSection" class="detail-section-screen-work comment-section-screen-work">
              <div class="detail-section-header-screen-work">
                <h3><i class="fas fa-comments"></i> Commentaires</h3>
              </div>
              
              <div class="add-comment-screen-work">
                <textarea v-model="newSequenceComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
                <button @click="addSequenceComment" class="add-comment-btn-screen-work">
                  <i class="fas fa-plus-circle"></i> Ajouter
                </button>
              </div>
              
              <div class="comments-list-screen-work">
                <div v-for="comment in sequenceComments" :key="comment.id" class="comment-item-screen-work">
                  <div class="comment-header-screen-work">
                    <span class="comment-author-screen-work">{{ comment.utilisateurNom }}</span>
                    <span class="comment-date-screen-work">{{ formatDate(comment.creeLe) }}</span>
                  </div>
                  <div class="comment-content-screen-work">
                    {{ comment.contenu }}
                  </div>
                  <div class="comment-actions-screen-work" v-if="comment.utilisateurId === user.id">
                    <button @click="deleteSequenceComment(comment.id)" class="delete-comment-btn-screen-work">
                      <i class="fas fa-trash"></i> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>

          <!-- Section détails (structure projet) -->
          <div class="sequence-details-view-screen-work">
            
            <!-- Section Synopsis -->
            <div v-if="currentSequence.synopsis" class="detail-section-screen-work">
              <div class="detail-section-header-screen-work">
                <h3><i class="fas fa-align-left"></i> Synopsis</h3>
                <button v-if="userPermissions.canCreateSequence" class="edit-sequence-btn-screen-work" @click="startEditSequence(currentSequence)">
                  <i class="fas fa-pen"></i> Modifier
                </button>
              </div>
              
              <div class="detail-section-content-screen-work">
                <div class="synopsis-section-screen-work">
                  <p class="synopsis-text-screen-work">{{ currentSequence.synopsis }}</p>
                </div>
              </div>
            </div>
            
            <!-- Section Scènes -->
            <div class="detail-section-screen-work">
              <div class="detail-section-header-screen-work">
                <h3><i class="fas fa-film"></i> Scènes ({{ scenes.length }})</h3>
                <button v-if="userPermissions.canCreateScene" class="add-btn-screen-work" @click="goToAddScene">
                  <i class="fas fa-plus"></i> Ajouter une scène
                </button>
              </div>
              
              <div class="scenes-section-screen-work">
                <div v-if="scenes.length > 0" class="scenes-list-screen-work">
                  <div 
                    v-for="scene in scenes" 
                    :key="scene.idScene"
                    class="scene-card-screen-work"
                    :class="{ 'active-screen-work': sidebarSelection.id === scene.idScene }"
                    @click="handleSidebarSelection({ type: 'scene', id: scene.idScene })"
                  >
                    <div class="scene-card-header-screen-work">
                      <i class="fas fa-film"></i>
                      <span class="scene-order-screen-work">Scène {{ scene.ordre }}</span>
                      <span class="scene-title-screen-work">{{ scene.titre }}</span>
                      <span class="scene-status-screen-work">{{ scene.statutNom || 'Non défini' }}</span>
                    </div>
                    <div class="scene-card-body-screen-work">
                      <p v-if="scene.synopsis" class="scene-synopsis-screen-work">{{ scene.synopsis }}</p>
                      <div v-else class="scene-no-synopsis-screen-work">
                        <i class="fas fa-align-left"></i> Pas de synopsis
                      </div>
                    </div>
                    <div class="scene-card-footer-screen-work">
                      <span class="dialogue-count-screen-work">
                        <i class="fas fa-comment"></i> {{ scene.dialogues?.length || 0 }}
                      </span>
                      <button class="view-scene-btn-screen-work" @click.stop="handleSidebarSelection({ type: 'scene', id: scene.idScene })">
                        <i class="fas fa-eye"></i> Voir
                      </button>
                    </div>
                  </div>
                </div>
                
                <div v-else class="empty-state-screen-work">
                  <div class="empty-state-content-screen-work">
                    <i class="fas fa-film"></i>
                    <p>Aucune scène dans cette séquence.</p>
                    <button v-if="userPermissions.canCreateScene" class="add-first-scene-btn-screen-work" @click="goToAddScene">
                      <i class="fas fa-plus"></i> Créer la première scène
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Actions supplémentaires (style projet) -->
            <div class="sequence-actions-view-screen-work">
              <button class="action-btn-secondary-screen-work" @click="showSequenceDetails = true">
                <i class="fas fa-chart-bar"></i> 
                Voir les statistiques détaillées
              </button>
            </div>
          </div>
        </div>
        
        <!-- ==================== MODALE POUR LES INFORMATIONS DE LA SÉQUENCE ==================== -->
        <div v-if="showSequenceDetails" class="details-modal-overlay-screen-work" @click.self="showSequenceDetails = false">
          <div class="details-modal-screen-work">
            <!-- En-tête de la popup -->
            <div class="details-modal-header-screen-work">
              <h2>
                <i class="fas fa-info-circle"></i>
                Détails de la séquence
              </h2>
              <button class="close-details-modal-screen-work" @click="showSequenceDetails = false">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Contenu de la popup -->
            <div class="details-modal-content-screen-work">
              <!-- Section Informations principales -->
              <div class="details-section-screen-work">
                <h3 class="details-section-title-screen-work">
                  <i class="fas fa-info-circle"></i> Informations principales
                </h3>
                <div class="details-grid-screen-work">
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">
                      <i class="fas fa-hashtag"></i> Ordre :
                    </span>
                    <span class="detail-value-screen-work">Séquence {{ currentSequence.ordre }}</span>
                  </div>
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">
                      <i class="fas fa-heading"></i> Titre :
                    </span>
                    <span class="detail-value-screen-work">{{ currentSequence.titre }}</span>
                  </div>
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">
                      <i class="fas fa-tasks"></i> Statut :
                    </span>
                    <span class="detail-value-screen-work">
                      <span class="status-badge-screen-work" :class="getStatusClass(currentSequence.statutNom)">
                        {{ currentSequence.statutNom || 'Non défini' }}
                      </span>
                    </span>
                  </div>
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">
                      <i class="fas fa-play-circle"></i> Épisode parent :
                    </span>
                    <span class="detail-value-screen-work">
                      Épisode {{ currentEpisode?.ordre }} - {{ currentEpisode?.titre }}
                    </span>
                  </div>
                </div>
              </div>

              
              <!-- Section Statistiques -->
              <div class="details-section-screen-work">
                <h3 class="details-section-title-screen-work">
                  <i class="fas fa-chart-bar"></i> Statistiques
                </h3>
                <div class="stats-grid-screen-work">
                  <div class="stat-item-screen-work">
                    <div class="stat-icon-screen-work">
                      <i class="fas fa-film"></i>
                    </div>
                    <div class="stat-content-screen-work">
                      <div class="stat-number-screen-work">{{ scenes.length }}</div>
                      <div class="stat-label-screen-work">Scènes</div>
                    </div>
                  </div>
                  <div class="stat-item-screen-work">
                    <div class="stat-icon-screen-work">
                      <i class="fas fa-comment"></i>
                    </div>
                    <div class="stat-content-screen-work">
                      <div class="stat-number-screen-work">
                        {{ scenes.reduce((total, scene) => total + (scene.dialogues?.length || 0), 0) }}
                      </div>
                      <div class="stat-label-screen-work">Dialogues total</div>
                    </div>
                  </div>
                  <div class="stat-item-screen-work">
                    <div class="stat-icon-screen-work">
                      <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content-screen-work">
                      <div class="stat-number-screen-work">
                        {{ scenes.reduce((total, scene) => total + (scene.dureeEstimee || 0), 0) }} min
                      </div>
                      <div class="stat-label-screen-work">Durée estimée</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. VUE SCÈNE -->
      <div v-else-if="sidebarSelection.type === 'scene'" class="main-content-view-screen-work">
        <!-- Conteneur principal identique à projet -->
        <div class="scene-view-container-screen-work" v-if="currentScene">
          
          <!-- En-tête scène (même structure que projet) -->
          <div class="scene-header-view-screen-work">
            <div class="scene-header-left-screen-work">
              <h1 class="scene-title-view-screen-work">
                <span class="scene-order-badge-screen-work">
                  <i class="fas fa-film"></i> Scène {{ currentScene.ordre }}
                </span>
                {{ currentScene.titre }}
                <div class="scene-status-badge-screen-work">
                  {{ currentScene.statutNom || 'Non défini' }}
                </div>
                <span class="comment-badge-screen-work" @click="toggleSceneCommentSection(currentScene)">
                  <i class="fas fa-comments"></i> 
                  {{ getSceneCommentCount(currentScene.idScene) }} commentaire(s)
                </span>
              </h1>
            </div>
          </div>
          
          <!-- Barre d'actions (sous les stats) -->
          <div class="scene-actions-bar-screen-work">
            <button class="details-btn-screen-work" @click="showSceneDetailsModal = true">
              <i class="fas fa-info-circle"></i> Voir informations
            </button>
            
            <button v-if="userPermissions.canCreateScene" class="edit-btn-screen-work" @click="startEditScene(currentScene)">
              <i class="fas fa-pen"></i> Modifier la scène
            </button>
            
            <button v-if="userPermissions.canCreateScene" class="delete-btn-screen-work" @click="deleteScene(currentScene.idScene)">
              <i class="fas fa-trash"></i> Supprimer la scène
            </button>
            
            <button v-if="userPermissions.canCreateDialogue" class="add-btn-screen-work" @click="startAddDialogue(currentScene)">
              <i class="fas fa-plus"></i> Ajouter un dialogue
            </button>
            
            <button class="comments-btn-screen-work" @click="toggleSceneCommentSection(currentScene)">
              <i class="fas fa-comments"></i> 
              {{ showSceneCommentModal && selectedSceneForComments?.idScene === currentScene.idScene ? 'Masquer' : 'Afficher' }} les commentaires
            </button>
            
            <button class="back-btn-screen-work" @click="handleSidebarSelection({ type: 'sequence', id: currentSequence?.idSequence })">
              <i class="fas fa-arrow-left"></i> Retour à la séquence
            </button>
          </div>

          <!-- Section Commentaires (optionnelle) -->
            <div v-if="showSceneCommentModal && selectedSceneForComments?.idScene === currentScene.idScene" class="detail-section-screen-work comment-section-screen-work">
              <div class="detail-section-header-screen-work">
                <h3><i class="fas fa-comments"></i> Commentaires de la scène</h3>
              </div>
              
              <div class="add-comment-screen-work">
                <textarea v-model="newSceneComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
                <button @click="addSceneComment" class="add-comment-btn-screen-work">
                  <i class="fas fa-plus-circle"></i> Ajouter
                </button>
              </div>
              
              <div class="comments-list-screen-work">
                <div v-for="comment in sceneComments" :key="comment.id" class="comment-item-screen-work">
                  <div class="comment-header-screen-work">
                    <span class="comment-author-screen-work">{{ comment.utilisateurNom }}</span>
                    <span class="comment-date-screen-work">{{ formatDate(comment.creeLe) }}</span>
                  </div>
                  <div class="comment-content-screen-work">
                    {{ comment.contenu }}
                  </div>
                  <div class="comment-actions-screen-work" v-if="comment.utilisateurId === user.id">
                    <button @click="deleteSceneComment(comment.id)" class="delete-comment-btn-screen-work">
                      <i class="fas fa-trash"></i> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>

          <!-- Section Synopsis (si disponible) -->
          <div v-if="currentScene.synopsis" class="details-section-screen-work">
            <h3 class="details-section-title-screen-work">
              <i class="fas fa-align-left"></i> Synopsis
            </h3>
            <p class="synopsis-text-screen-work">{{ currentScene.synopsis }}</p>
          </div>
          
          <!-- Section Planning de Tournage -->
          <div class="scene-planning-section-screen-work">
            <div class="section-header-screen-work">
              <h3><i class="fas fa-video"></i> Planning de Tournage</h3>
            <SceneTournageSection 
              v-if="currentScene"
              :scene="currentScene"
              :projet-id="currentProjet?.idProjet || projetId"
              :user-permissions="userPermissions"
              @tournage-updated="onTournageUpdated"
            />
          </div>
        </div>  
          <!-- Section principale : Dialogues -->
          <div class="scene-details-view-screen-work">
            
            <!-- Section Dialogues -->
            <div class="detail-section-screen-work dialogues-section-screen-work">
              <div class="section-header-screen-work">
                <h3><i class="fas fa-comments"></i> Dialogues ({{ currentScene.dialogues?.length || 0 }})</h3>
                <button v-if="userPermissions.canCreateDialogue" class="edit-scene-btn-screen-work" @click="startAddDialogue(currentScene)">
                  <i class="fas fa-plus"></i> Nouveau dialogue
                </button>
              </div>
              
              <div v-if="currentScene.dialogues?.length" class="dialogues-list-screen-work">
                <div v-for="dialogue in currentScene.dialogues" :key="dialogue.id" class="dialogue-item-screen-work">
                  <div class="dialogue-header-screen-work">
                    <span class="dialogue-character-screen-work">
                      <strong>{{ dialogue.personnageNom || 'Narrateur' }} :</strong>
                    </span>
                    <span class="dialogue-order-screen-work">#{{ dialogue.ordre }}</span>
                  </div>
                  <div class="dialogue-content-screen-work" @mouseup="openHighlightModal(dialogue, $event)">
                    {{ dialogue.texte }}
                    
                    <!-- Surlignages -->
                    <template v-if="dialogueHighlights[dialogue.id]">
                      <span 
                        v-for="highlight in dialogueHighlights[dialogue.id]" 
                        :key="highlight.id"
                        class="text-highlight-screen-work"
                        :style="{ backgroundColor: highlight.couleur.valeurHex }"
                        :title="`Surligné par ${highlight.utilisateurNom}`"
                      >
                        {{ highlight.texteSurligne }}
                      </span>
                    </template>
                  </div>
                  
                  <div v-if="dialogue.observation" class="dialogue-observation-screen-work">
                    <i class="fas fa-sticky-note"></i> {{ dialogue.observation }}
                  </div>
                  
                  <div class="dialogue-actions-screen-work">
                    <button v-if="userPermissions.canCreateDialogue" class="action-icon-screen-work edit-icon-screen-work" @click="startEditDialogue(dialogue)" title="Modifier">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button v-if="userPermissions.canCreateDialogue" class="action-icon-screen-work delete-icon-screen-work" @click="deleteDialogue(dialogue.id)" title="Supprimer">
                      <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-icon-screen-work comment-icon-screen-work" @click="toggleDialogueCommentSection(dialogue)" title="Commentaires">
                      <i class="fas fa-comment"></i> {{ getDialogueCommentCount(dialogue.id) }}
                    </button>
                    <button v-if="userPermissions.canCreateDialogue" class="action-icon-screen-work highlight-icon-screen-work" @click="openHighlightModal(dialogue, $event)" title="Surligner">
                      <i class="fas fa-highlighter"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-screen-work">
                <p>Aucun dialogue dans cette scène.</p>
                <button v-if="userPermissions.canCreateDialogue" class="add-btn-screen-work" @click="startAddDialogue(currentScene)">
                  <i class="fas fa-plus"></i> Ajouter le premier dialogue
                </button>
              </div>
              
              <!-- Formulaire d'ajout de dialogue -->
              <div v-if="showAddDialogueSection && selectedSceneForDialogue?.idScene === currentScene.idScene" class="add-dialogue-form-screen-work">
                <h4><i class="fas fa-plus-circle"></i> Ajouter un dialogue</h4>
                
                <div class="form-group-screen-work">
                  <label>Personnage</label>
                  <select v-model="newDialogueData.personnageId" class="form-select-screen-work">
                    <option :value="null">Narration (sans personnage)</option>
                    <option 
                      v-for="personnage in personnages" 
                      :key="personnage.id" 
                      :value="personnage.id"
                    >
                      {{ personnage.nom }}
                    </option>
                  </select>
                </div>
                
                <div class="form-group-screen-work">
                  <label>Texte du dialogue</label>
                  <textarea 
                    v-model="newDialogueData.texte" 
                    rows="3" 
                    class="form-textarea-screen-work"
                    placeholder="Entrez le texte du dialogue..."
                    required
                  ></textarea>
                </div>
                
                <div class="form-group-screen-work">
                  <label>Observation</label>
                  <textarea 
                    v-model="newDialogueData.observation" 
                    rows="2" 
                    class="form-textarea-screen-work"
                    placeholder="Notes ou observations (optionnel)"
                  ></textarea>
                </div>
                
                <div class="form-actions-screen-work">
                  <button 
                    @click="createDialogueDirect(currentScene.idScene)" 
                    class="save-btn-screen-work"
                    :disabled="!newDialogueData.texte.trim()"
                  >
                    <i class="fas fa-save"></i> Ajouter le dialogue
                  </button>
                  <button 
                    @click="cancelAddDialogue" 
                    class="cancel-btn-screen-work"
                  >
                    <i class="fas fa-times"></i> Annuler
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Actions supplémentaires (style projet) -->
            <div class="scene-actions-view-screen-work">
              <button class="action-btn-secondary-screen-work" @click="showSceneDetailsModal = true">
                <i class="fas fa-info-circle"></i> 
                Voir toutes les informations de la scène
              </button>
            </div>
          </div>
        </div>
        
        <!-- ==================== MODALE POUR LES INFORMATIONS DE LA SCÈNE ==================== -->
        <div v-if="showSceneDetailsModal" class="scene-details-modal-overlay-screen-work" @click.self="showSceneDetailsModal = false">
          <div class="scene-details-modal-screen-work">
            <!-- En-tête de la popup -->
            <div class="scene-details-modal-header-screen-work">
              <h2>
                <i class="fas fa-info-circle"></i>
                Informations de la scène
              </h2>
              <button class="close-scene-details-modal-screen-work" @click="showSceneDetailsModal = false">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Contenu de la popup -->
            <div class="scene-details-modal-content-screen-work">
              <!-- Section Informations principales -->
              <div class="details-section-screen-work">
                <h3 class="details-section-title-screen-work">
                  <i class="fas fa-info-circle"></i> Informations principales
                </h3>
                <div class="details-grid-screen-work">
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">Titre :</span>
                    <span class="detail-value-screen-work">{{ currentScene.titre }}</span>
                  </div>
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">Ordre :</span>
                    <span class="detail-value-screen-work">Scène {{ currentScene.ordre }}</span>
                  </div>
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">Statut :</span>
                    <span class="detail-value-screen-work">{{ currentScene.statutNom || 'Non défini' }}</span>
                  </div>
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">Séquence :</span>
                    <span class="detail-value-screen-work">Séquence {{ currentSequence?.ordre }} - {{ currentSequence?.titre }}</span>
                  </div>
                  <div class="detail-item-screen-work">
                    <span class="detail-label-screen-work">Épisode :</span>
                    <span class="detail-value-screen-work">Épisode {{ currentEpisode?.ordre }} - {{ currentEpisode?.titre }}</span>
                  </div>
                </div>
              </div>
              
              
              <!-- Section Lieu (si disponible) -->
              <div v-if="currentScene.lieuNom || currentScene.lieuPlateau" class="details-section-screen-work">
                <h3 class="details-section-title-screen-work">
                  <i class="fas fa-map-marker-alt"></i> Lieu
                </h3>
                <div class="location-info-screen-work">
                  <i class="fas fa-map-marker-alt"></i>
                  <span v-if="currentScene.lieuNom">{{ currentScene.lieuNom }}</span>
                  <span v-if="currentScene.lieuPlateau"> - {{ currentScene.lieuPlateau }}</span>
                </div>
                <p v-if="currentScene.descriptionUtilisation" class="location-description-screen-work">
                  {{ currentScene.descriptionUtilisation }}
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="loading-view-screen-work">
        <div class="spinner-screen-work"></div>
        <p>Chargement en cours...</p>
      </div>

      <!-- Message d'erreur -->
      <div v-if="error && !isLoading" class="error-view-screen-work">
        <p>{{ error }}</p>
        <button class="retry-btn-screen-work" @click="retryFetch">Réessayer</button>
      </div>

      <!-- Message si aucun contenu -->
      <div v-if="!sidebarSelection.type && !isLoading && !error" class="empty-view-screen-work">
        <i class="fas fa-info-circle"></i>
        <p>Sélectionnez un élément dans la sidebar pour afficher ses détails</p>
      </div>

      <!-- ==================== MODALES ==================== -->
      
      <!-- Modale pour surlignage -->
      <div v-if="showHighlightModal" class="modal-overlay-screen-work" @click="closeHighlightModal">
        <div class="modal-content-screen-work" @click.stop>
          <div class="modal-header-screen-work">
            <h3>Surligner du texte</h3>
            <button @click="closeHighlightModal" class="close-btn-screen-work"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body-screen-work">
            <p><strong>Texte sélectionné :</strong> "{{ selectedText }}"</p>
            <div class="color-picker-screen-work">
              <label>Couleur :</label>
              <div class="color-options-screen-work">
                <div 
                  v-for="color in availableColors" 
                  :key="color.id"
                  class="color-option-screen-work"
                  :style="{ backgroundColor: color.valeurHex }"
                  :class="{ 'selected-screen-work': selectedColor?.id === color.id }"
                  @click="selectedColor = color"
                  :title="color.nom"
                ></div>
              </div>
            </div>
          </div>
          <div class="modal-footer-screen-work">
            <button @click="closeHighlightModal" class="btn-secondary-screen-work">Annuler</button>
            <button @click="applyHighlight" class="btn-primary-screen-work" :disabled="!selectedColor">Surligner</button>
          </div>
        </div>
      </div>

      <!-- Modale pour éditer le projet -->
      <ModalEditProject
        :show="showEditProjectModal"
        :editing-project="editingProject"
        :genres="genres"
        :statuts="statutsProjet"
        :error="editProjectError"
        :loading="editProjectLoading"
        @close="closeEditProjectModal"
        @save="saveEditedProject"
      />

      <!-- Modale pour éditer l'épisode -->
      <ModalEditEpisode
        :show="showEditEpisodeModal"
        :editing-episode="editingEpisode"
        :statuts="statutsEpisode"
        :error="editEpisodeError"
        :loading="editEpisodeLoading"
        @close="closeEditEpisodeModal"
        @save="saveEditedEpisode"
      />

      <!-- Modale pour éditer la séquence -->
      <ModalEditSequence
        :show="showEditSequenceModal"
        :editing-sequence="editingSequence"
        :statuts="statutsSequence"
        :error="editSequenceError"
        :loading="editSequenceLoading"
        @close="closeEditSequenceModal"
        @save="saveEditedSequence"
      />

      <!-- Modale pour éditer la scène -->
      <ModalEditScene
        :show="showEditSceneModal"
        :editing-scene="editingScene"
        :statuts="statutsScene"
        :error="editSceneError"
        :loading="editSceneLoading"
        @close="closeEditSceneModal"
        @save="saveEditedScene"
      />

      <!-- Modale pour éditer le dialogue -->
      <ModalEditDialogue
        :show="showEditDialogueModal"
        :editing-dialogue="editingDialogue"
        :personnages="personnages"
        :error="editDialogueError"
        :loading="editDialogueLoading"
        :order-error="orderError"
        :suggested-order="suggestedOrder"
        @close="closeEditDialogueModal"
        @save="saveEditedDialogue"
        @validate-order="validateOrder"
      />

      <!-- Modale pour commentaires de dialogue -->
      <div v-if="showDialogueCommentModal" class="modal-overlay-screen-work">
        <div class="modal-content-screen-work">
          <div class="modal-header-screen-work">
            <h3>Commentaires du dialogue</h3>
            <button @click="closeDialogueCommentModal" class="close-btn-screen-work"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body-screen-work">
            <div class="add-comment-screen-work">
              <textarea v-model="newDialogueComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
              <button @click="addDialogueComment" class="add-comment-btn-screen-work">Ajouter</button>
            </div>
            <div class="comments-list-screen-work">
              <div v-for="comment in dialogueComments" :key="comment.id" class="comment-item-screen-work">
                <div class="comment-header-screen-work">
                  <span class="comment-author-screen-work">{{ comment.utilisateurNom }}</span>
                  <span class="comment-date-screen-work">{{ formatDate(comment.creeLe) }}</span>
                </div>
                <div class="comment-content-screen-work">
                  {{ comment.contenu }}
                </div>
                <div class="comment-actions-screen-work" v-if="comment.utilisateurId === user.id">
                  <button @click="deleteDialogueComment(comment.id)" class="delete-comment-btn-screen-work">Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modale pour éditer le lieu et plateau -->
      <ModalAddLieu
        :show="showAddLieuModal"
        :scene="selectedSceneForLieu"
        :lieu-data="{
          selectedLieuId: selectedLieuId,
          selectedPlateauId: selectedPlateauId,
          descriptionUtilisation: descriptionUtilisation
        }"
        :available-lieux="availableLieux"
        :available-plateaux="availablePlateaux"
        :scene-lieus="sceneLieus"
        :error="addLieuError"
        :loading="addLieuLoading"
        @close="closeAddLieuModal"
        @add="addSceneLieu"
        @load-plateaux="loadAvailablePlateaux"
        @remove-lieu="removeLieuFromScene"
      />
    </div>
    
    <EnvoieParEmail 
      :show-modal="showEmailModal"
      :current-episode="currentEpisode"
      :current-sequence="currentSequence"
      :comediens="comediens"
      :projet-infos="store.projetInfos"
      @close="closeEmailModal"
      @email-sent="onEmailSent"
    />
  </div>
</template>


<script setup>
import { useEcranTravailStore } from '../stores/ecranTravailStore';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import SceneTournageSection from './SceneTournageSection.vue';
import RaccordSceneComponent from './RaccordSceneComponent.vue';
import RaccordsPhotosComponent from './RaccordsPhotosComponent.vue';
import EnvoieParEmail from './EnvoieParEmail.vue'
import ModalEditEpisode from './ModalEditEpisode.vue'
import ModalEditSequence from './ModalEditSequence.vue'
import ModalEditScene from './ModalEditScene.vue'
import ModalEditDialogue from './ModalEditDialogue.vue'
import ModalEditProject from './ModalEditProject.vue'
import ModalAddLieu from './ModalAddLieu.vue'
import LeftSidebar from './sidebar/LeftSidebar.vue';
import RightSidebar from './sidebar/RightSidebar.vue';
import SceneToolsNavbar from './sidebar/SceneToolsNavbar.vue';

// Importez les fonctions d'export depuis vos nouveaux fichiers
import { 
  formatDate,
  getBase64FromUrl 
} from '../utils/exportUtils';

import { 
  exportScenesOnlyPDF as exportScenesOnlyPDFFunc,
  exportSceneDialoguesPDF as exportSceneDialoguesPDFFunc,
  exportSequenceDialoguesPDF as exportSequenceDialoguesPDFFunc,
  exportSequenceCompletePDF as exportSequenceCompletePDFFunc,
  exportEpisodeWithSequencePDF as exportEpisodeWithSequencePDFFunc,
  exportScenePDF as exportScenePDFFunc,
  exportRaccordsProjetPDF as exportRaccordsProjetPDFFunc,
  exportRaccordsByScene as exportRaccordsBySceneFunc,
  exportRaccordsByComedien as exportRaccordsByComedienFunc
} from '../utils';

defineOptions({
  components: {
    SceneTournageSection,
    RaccordsPhotosComponent,
    RaccordSceneComponent,
    EnvoieParEmail,
    ModalEditEpisode,
    ModalEditSequence,
    ModalEditScene,
    ModalEditDialogue,
    ModalAddLieu,
    SceneToolsNavbar,
    ModalEditProject,
  }
})

const route = useRoute();
const router = useRouter();
const store = useEcranTravailStore();

const comediens = ref([]);
const selectedComedien = ref(null);

//Modal de l'episode dans l'écran
const showEpisodeDetailsModal = ref(false);

// Modal de séquence dans l'écran
const showSequenceDetails = ref(false)

// Modal de scène dans l'écran
const showSceneDetailsModal = ref(false)

// Méthode pour obtenir la classe CSS du statut
const getStatusClass = (statut) => {
  if (!statut) return ''
  const statutLower = statut.toLowerCase()
  
  if (statutLower.includes('terminé') || statutLower.includes('validé')) return 'status-completed'
  if (statutLower.includes('en cours') || statutLower.includes('écriture')) return 'status-in-progress'
  if (statutLower.includes('brouillon') || statutLower.includes('planning')) return 'status-draft'
  if (statutLower.includes('annulé') || statutLower.includes('rejeté')) return 'status-cancelled'
  
  return ''
}

// Fonction pour calculer le total des surlignages
const getTotalHighlights = computed(() => {
  return (scene) => {
    if (!scene || !scene.dialogues) return 0
    return scene.dialogues.reduce((total, dialogue) => {
      return total + (dialogueHighlights.value[dialogue.id]?.length || 0)
    }, 0)
  }
})

// État de la sidebar droite
const sidebarOpen = ref(true);

// État de la sélection dans la sidebar
const sidebarSelection = ref({
  type: 'project', // 'project', 'episode', 'sequence', 'scene'
  id: null
});

// Variables pour la navigation par scènes
const newlyCreatedSceneId = ref(null);

const showHighlightModal = ref(false);
const selectedDialogueForHighlight = ref(null);
const selectedText = ref('');
const selectedColor = ref(null);
const availableColors = ref([]);
const dialogueHighlights = ref({});

const userPermissions = ref({
    canEditEpisode: false,
    canCreateSequence: false,
    canCreateScene: false,
    canCreateDialogue: false,
    canCreateLieu: false,
    canCreatePlateau: false,
    canCreateComedien: false,
    canCreatePersonnage: false,

    // NOUVEAU : Permissions pour les raccords
    canCreateRaccord: false,
    canViewRaccords: true, // Par défaut true pour la consultation
    
    // NOUVEAU : Permissions pour l'export
    canExport: false,
    
    // NOUVEAU : Permissions pour l'email
    canSendEmail: false,
    
    // NOUVEAU : Permissions pour le tournage
    canPlanTournage: false,
    canEditTournage: false,
    
    // NOUVEAU : Permissions pour les commentaires
    canAddComments: true, // Par défaut true
    canDeleteComments: false,
    
    // NOUVEAU : Permissions pour les surlignages
    canHighlight: false,

});

const showEmailModal = ref(false)



const openEmailModal = () => {
  showEmailModal.value = true
}

const closeEmailModal = () => {
  showEmailModal.value = false
}

const onEmailSent = () => {
  console.log('Email envoyé avec succès')
}

// Méthode pour gérer les mises à jour
const onRaccordsUpdated = () => {
  console.log('Raccords mis à jour')
}

const onRaccordCreated = () => {
  console.log('Raccord entre scènes créé avec succès');
  if (store.currentSequence) {
    store.fetchSequenceDetails(store.currentSequence.idSequence);
  }
};

watch(() => sidebarSelection.value.type, (newType) => {
  // Fermer automatiquement quand on passe en mode scène
  if (newType === 'scene') {
    sidebarOpen.value = false;
  } 
  // Ouvrir automatiquement pour les autres sections (sauf si déjà ouvert)
  else if (!sidebarOpen.value) {
    sidebarOpen.value = true;
  }
}, { immediate: true });


// Méthode pour toggle la sidebar droite
const toggleSidebar = () => {
  // Si on est dans une scène, basculer entre sidebar droite et outils scène
  if (sidebarSelection.value.type === 'scene' && currentScene.value) {
    sidebarOpen.value = !sidebarOpen.value;
  } else {
    sidebarOpen.value = !sidebarOpen.value;
  }
};


// Variables réactives pour validation ordre
const existingOrders = ref([]);
const suggestedOrder = ref(null);
const orderError = ref('');

// Données pour les commentaires
const user = ref(JSON.parse(localStorage.getItem('user')) || null);
const showSequenceCommentSection = ref(false);
const newSequenceComment = ref('');
const sequenceComments = ref([]);
const sequenceCommentCount = ref(0);

const showSceneCommentModal = ref(false);
const selectedSceneForComments = ref(null);
const newSceneComment = ref('');
const sceneComments = ref([]);
const sceneCommentCounts = ref({});

const showDialogueCommentModal = ref(false);
const selectedDialogue = ref(null);
const newDialogueComment = ref('');
const dialogueComments = ref([]);
const dialogueCommentCounts = ref({});

// Données pour la modale d'ajout de lieu
const showAddLieuModal = ref(false);
const selectedSceneForLieu = ref(null);
const selectedLieuId = ref(null);
const selectedPlateauId = ref(null);
const descriptionUtilisation = ref('');
const availableLieux = ref([]);
const availablePlateaux = ref([]);
const sceneLieus = ref([]);
const addLieuError = ref('');
const addLieuLoading = ref(false);

// Dans les données réactives
const personnages = ref([]);

// Données pour l'édition du projet
const showEditProjectModal = ref(false);
const editingProject = ref({
  id: null,
  titre: '',
  synopsis: '',
  genreId: null,
  statutId: null,
  dateFin: ''
});
const statutsProjet = ref([]);
const genres = ref([]);
const editProjectError = ref('');
const editProjectLoading = ref(false);

// Données pour l'édition des épisodes
const showEditEpisodeModal = ref(false);
const editingEpisode = ref({
  id: null,
  titre: '',
  synopsis: '',
  ordre: null,
  statutId: null
});
const statutsEpisode = ref([]);
const editEpisodeError = ref('');
const editEpisodeLoading = ref(false);

// Données pour l'édition des séquences
const showEditSequenceModal = ref(false);
const editingSequence = ref({
  id: null,
  titre: '',
  synopsis: '',
  ordre: null,
  statutId: null
});
const statutsSequence = ref([]);
const editSequenceError = ref('');
const editSequenceLoading = ref(false);

// Données pour l'édition des scènes
const showEditSceneModal = ref(false);
const editingScene = ref({
  id: null,
  titre: '',
  synopsis: '',
  ordre: null,
  statutId: null
});
const statutsScene = ref([]);
const editSceneError = ref('');
const editSceneLoading = ref(false);

// Données pour l'édition des dialogues
const showEditDialogueModal = ref(false);
const editingDialogue = ref({
  id: null,
  personnageNom: '',
  texte: '',
  observation: ''
});
const editDialogueError = ref('');
const editDialogueLoading = ref(false);

// Projet ID
const projetId = ref(route.params.idProjet || '1');

// Variable pour suivre l'épisode et la séquence nouvellement créés
const newlyCreatedEpisodeId = ref(null);
const newlyCreatedSequenceId = ref(null);

// Pour les dialogues ( ajout )
const showAddDialogueSection = ref(false);
const selectedSceneForDialogue = ref(null);
const newDialogueData = ref({
  personnageId: null,
  texte: '',
  observation: '',
  ordre: 1
});

const showEpisodeCommentSection = ref(false);
const newEpisodeComment = ref('');
const episodeComments = ref([]);
const episodeCommentCounts = ref({});

// Méthodes pour charger les données
const loadGenres = async () => {
  try {
    const response = await axios.get('/api/genres');
    genres.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des genres:', error);
    genres.value = [];
  }
};

const loadStatutsProjet = async () => {
  try {
    const response = await axios.get('/api/statuts-projet');
    statutsProjet.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des statuts projet:', error);
    statutsProjet.value = [];
  }
};

// Méthode pour ouvrir la modale
const startEditProjectModal = () => {
  if (!store.projetInfos) return;
  
  editingProject.value = {
    id: store.projetInfos.id,
    titre: store.projetTitle || '',
    synopsis: store.projetSynopsis || '',
    genreId: store.projetInfos.genreId || null,
    statutId: getStatutProjetIdByNom(store.projetStatus),
    dateFin: store.projetInfos.dateFin || ''
  };
  
  editProjectError.value = '';
  showEditProjectModal.value = true;
};

// Helper pour obtenir l'ID du statut
const getStatutProjetIdByNom = (statutNom) => {
  const statut = statutsProjet.value.find(s => s.nomStatutsProjet === statutNom);
  return statut ? statut.idStatutProjet : null;
};

// Méthode pour calculer le style dynamique
const getMainContentStyle = () => {
  const styles = {};
  
  if (sidebarSelection.value.type === 'scene' && currentScene.value) {
    // Avec navbar secondaire : 60px (navbar principale) + 60px (navbar secondaire) = 120px
    styles.marginTop = '120px';
    styles.minHeight = 'calc(100vh - 120px)';
  } else {
    // Sans navbar secondaire : seulement 60px pour la navbar principale
    styles.marginTop = '60px';
    styles.minHeight = 'calc(100vh - 60px)';
  }
  
  return styles;
};

// Méthode pour sauvegarder
const saveEditedProject = async (projectData) => {
  editProjectLoading.value = true;
  editProjectError.value = '';

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      editProjectError.value = 'Utilisateur non connecté';
      return;
    }

    const url = `/api/projets/${projectData.id}`;
    const updateData = {
      titre: projectData.titre,
      synopsis: projectData.synopsis || '',
      genreId: projectData.genreId,
      statutId: projectData.statutId,
      dateFin: projectData.dateFin || null
    };
    
    const response = await axios.put(url, updateData, {
      headers: {
        'X-User-Id': user.id
      }
    });
    
    if (response.status === 200) {
      // Mettre à jour le store
      store.projetTitle = projectData.titre;
      store.projetSynopsis = projectData.synopsis || '';
      store.projetStatus = getStatutProjetNomById(projectData.statutId);
      store.projetInfos = { ...store.projetInfos, ...updateData };
      
      closeEditProjectModal();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    editProjectError.value = error.response?.data?.message || 'Erreur lors de la mise à jour du projet';
  } finally {
    editProjectLoading.value = false;
  }
};

// Helper pour obtenir le nom du statut
const getStatutProjetNomById = (statutId) => {
  const statut = statutsProjet.value.find(s => s.idStatutProjet === statutId);
  return statut ? statut.nomStatutsProjet : '';
};

// Méthode pour fermer la modale
const closeEditProjectModal = () => {
  showEditProjectModal.value = false;
  editingProject.value = { id: null, titre: '', synopsis: '', genreId: null, statutId: null, dateFin: '' };
  editProjectError.value = '';
};


// Propriétés calculées
const episodes = computed(() => store.episodes);
const sequences = computed(() => store.sequences);
const scenes = computed(() => store.scenes);
const currentScene = computed(() => store.currentScene);
const currentEpisode = computed(() => store.currentEpisode);
const currentSequence = computed(() => store.currentSequence);
const error = computed(() => store.error);
const isLoading = computed(() => store.isLoading);
const hasNext = computed(() => store.hasNext);
const hasPrev = computed(() => store.hasPrev);

// Calcul du nombre total de scènes
const totalScenes = computed(() => {
  return store.episodes.reduce((total, episode) => {
    return total + (episode.nombreScenes || 0);
  }, 0);
});

// Propriétés calculées pour la navigation
const hasNextScene = computed(() => store.hasNextScene);
const hasPrevScene = computed(() => store.hasPrevScene);

const leftSidebarOpen = ref(true);

const getCurrentContext = () => {
  if (currentScene.value) {
    return `Épisode ${currentEpisode.value?.ordre} • Séquence ${currentSequence.value?.ordre} • Scène ${currentScene.value.ordre}`;
  }
  if (currentSequence.value) {
    return `Épisode ${currentEpisode.value?.ordre} • Séquence ${currentSequence.value.ordre}`;
  }
  if (currentEpisode.value) {
    return `Épisode ${currentEpisode.value.ordre}`;
  }
  return 'Vue Projet';
};


// Méthodes de toggle
const toggleLeftSidebar = () => {
  leftSidebarOpen.value = !leftSidebarOpen.value;
};

// Ajouter ces méthodes
const closeSceneToolsNavbar  = () => {
  // Optionnel : on pourrait réduire la sidebar plutôt que la fermer
  console.log('Fermer sidebar outils scène');
};

// Méthodes pour compter les photos et raccords
const getPhotoCount = (sceneId) => {
  // À implémenter selon votre API
  return 0;
};

const getRaccordCount = (sceneId) => {
  // À implémenter selon votre API
  return 0;
};

// Calcul pour afficher ou non les boutons de navigation
const showNavButtons = computed(() => {
  return sidebarSelection.value.type !== 'project';
});

// Gestion de la sélection depuis la sidebar
const handleSidebarSelection = async ({ type, id }) => {
  console.log('Sélection sidebar:', type, id);
  
  // Mettre à jour la sélection locale
  sidebarSelection.value = { type, id };
  
  // Mettre à jour le store si nécessaire
  if (type === 'episode' && id) {
    await store.selectEpisodeById(id);
  } else if (type === 'sequence' && id) {
    await store.selectSequenceById(id);
  } else if (type === 'scene' && id) {
    await store.selectSceneById(id);
  }
  
  // Mettre à jour l'URL pour garder l'état
  updateRouteForSelection();
};

// Mettre à jour l'URL selon la sélection
const updateRouteForSelection = () => {
  const query = {};
  
  if (sidebarSelection.value.type === 'episode' && sidebarSelection.value.id) {
    query.episodeId = sidebarSelection.value.id;
    delete query.sequenceId;
    delete query.sceneId;
  } else if (sidebarSelection.value.type === 'sequence' && sidebarSelection.value.id) {
    query.sequenceId = sidebarSelection.value.id;
    delete query.sceneId;
    // Garder l'épisode parent si disponible
    if (store.currentEpisode?.idEpisode) {
      query.episodeId = store.currentEpisode.idEpisode;
    }
  } else if (sidebarSelection.value.type === 'scene' && sidebarSelection.value.id) {
    query.sceneId = sidebarSelection.value.id;
    // Garder l'épisode et la séquence parents si disponibles
    if (store.currentEpisode?.idEpisode) {
      query.episodeId = store.currentEpisode.idEpisode;
    }
    if (store.currentSequence?.idSequence) {
      query.sequenceId = store.currentSequence.idSequence;
    }
  } else {
    // Vue projet - vider les query params
    delete query.episodeId;
    delete query.sequenceId;
    delete query.sceneId;
  }
  
  router.push({ query });
};

onMounted(async () => {
  const projetIdLocal = route.params.idProjet || '1';
  projetId.value = projetIdLocal;
  
  // Charger les couleurs disponibles en premier
  await loadAvailableColors();
  
  await store.fetchEpisodes(projetIdLocal);
  
  // Initialiser la sélection depuis l'URL
  await initializeSelectionFromRoute();
  
  if (store.currentSequence) {
    await loadSequenceCommentCount();
    await loadSceneCommentCounts();
    await loadDialogueCommentCounts();
    await loadAvailableLieux();
  }
  
  // Charger les commentaires d'épisode si un épisode est sélectionné
  if (store.currentEpisode) {
    await loadEpisodeCommentCounts();
  }
  
  await Promise.all([
    loadStatutsEpisode(),
    loadStatutsSequence(),
    loadStatutsScene(),
    loadGenres(),
    loadStatutsProjet(),
  ]);
  
  await loadPersonnages();
});

// Initialiser la sélection depuis les paramètres de route
const initializeSelectionFromRoute = async () => {
  const { episodeId, sequenceId, sceneId } = route.query;
  
  if (sceneId) {
    sidebarSelection.value = { type: 'scene', id: parseInt(sceneId) };
    await store.selectSceneById(sceneId);
  } else if (sequenceId) {
    sidebarSelection.value = { type: 'sequence', id: parseInt(sequenceId) };
    await store.selectSequenceById(sequenceId);
  } else if (episodeId) {
    sidebarSelection.value = { type: 'episode', id: parseInt(episodeId) };
    await store.selectEpisodeById(episodeId);
  } else {
    sidebarSelection.value = { type: 'project', id: null };
  }
};

const checkUserPermissions = async (episodeId) => {
    if (!user.value) return;
    
    try {
        const response = await axios.get(`/api/episodes/${episodeId}/permissions`, {
            headers: {
                'X-User-Id': user.value.id
            }
        });
        
        userPermissions.value = {
            // Permissions de base (déjà existantes)
            canEditEpisode: response.data.canEditEpisode || false,
            canCreateSequence: response.data.canCreateSequence || false,
            canCreateScene: response.data.canCreateScene || false,
            canCreateDialogue: response.data.canCreateDialogue || false,
            canCreateLieu: response.data.canCreateLieu || false,
            canCreatePlateau: response.data.canCreatePlateau || false,
            canCreateComedien: response.data.canCreateComedien || false,
            canCreatePersonnage: response.data.canCreatePersonnage || false,
            
            // NOUVEAU : Permissions pour les raccords
            canCreateRaccord: response.data.canCreateRaccord || true,
            canViewRaccords: response.data.canViewRaccords || true, 
            
            // NOUVEAU : Permissions pour l'export
            canExport: response.data.canExport || response.data.canCreateScene || false,
            
            // NOUVEAU : Permissions pour l'email
            canSendEmail: response.data.canSendEmail || true,
            
            // NOUVEAU : Permissions pour le tournage
            canPlanTournage: response.data.canPlanTournage || response.data.canCreateScene || false,
            canEditTournage: response.data.canEditTournage || response.data.canCreateScene || false,
            
            // NOUVEAU : Permissions pour les commentaires
            canAddComments: response.data.canAddComments || true, // Par défaut true
            canDeleteComments: response.data.canDeleteComments || false,
            
            // NOUVEAU : Permissions pour les surlignages
            canHighlight: response.data.canHighlight || response.data.canCreateDialogue || false
        };
        
        const accessResponse = await axios.get(`/api/episodes/${episodeId}/access-check`, {
            headers: {
                'X-User-Id': user.value.id
            }
        });
        
        if (!accessResponse.data) {  
            Object.keys(userPermissions.value).forEach(key => {
                userPermissions.value[key] = false;
            });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des permissions:', error);
        // Définir toutes les permissions à false en cas d'erreur
        userPermissions.value = {
            canEditEpisode: false,
            canCreateSequence: false,
            canCreateScene: false,
            canCreateDialogue: false,
            canCreateLieu: false,
            canCreatePlateau: false,
            canCreateComedien: false,
            canCreatePersonnage: false,
            canCreateRaccord: false,
            canViewRaccords: true, // Toujours permettre la vue
            canExport: false,
            canSendEmail: true,
            canPlanTournage: false,
            canEditTournage: false,
            canAddComments: true, // Toujours permettre d'ajouter des commentaires
            canDeleteComments: false,
            canHighlight: false
        };
    }
};

watch(() => store.currentEpisode, async (newEpisode) => {
    if (newEpisode) {
        await checkUserPermissions(newEpisode.idEpisode);
        await loadEpisodeCommentCounts();
        
        if (newEpisode.realisateur) {
            console.log('Réalisateur:', newEpisode.realisateur.nom);
        }
        if (newEpisode.scenariste) {
            console.log('Scénariste:', newEpisode.scenariste.nom);
        }
    }
});


// Watch pour mettre à jour la sélection quand le store change
watch(() => store.currentScene, (newScene) => {
  if (newScene && sidebarSelection.value.type === 'scene') {
    sidebarSelection.value.id = newScene.idScene;
  }
});

watch(() => store.currentSequence, (newSequence) => {
  if (newSequence && sidebarSelection.value.type === 'sequence') {
    sidebarSelection.value.id = newSequence.idSequence;
  }
});

watch(() => store.currentEpisode, (newEpisode) => {
  if (newEpisode && sidebarSelection.value.type === 'episode') {
    sidebarSelection.value.id = newEpisode.idEpisode;
  }
});

const loadPersonnages = async () => {
  try {
    const currentProjetId = projetId.value || store.projetId;
    
    if (!currentProjetId) {
      console.error('ID du projet non trouvé');
      personnages.value = [];
      return;
    }

    const response = await axios.get(`/api/personnages/projet/${currentProjetId}`);
    personnages.value = response.data;
    
    console.log(`Personnages chargés pour le projet ${currentProjetId}:`, personnages.value.length);
  } catch (error) {
    console.error('Erreur lors du chargement des personnages:', error);
    personnages.value = [];
  }
};

// Méthodes pour le surlignage
const applyHighlight = async () => {
  if (!selectedColor.value || !selectedDialogueForHighlight.value || !selectedText.value) {
    alert('Veuillez sélectionner une couleur et du texte.');
    return;
  }

  try {
    const highlightData = {
      dialogueId: selectedDialogueForHighlight.value.id,
      couleur: {
        id: selectedColor.value.id,
        nom: selectedColor.value.nom,
        valeurHex: selectedColor.value.valeurHex
      },
      utilisateurId: user.value.id,
      texteSurligne: selectedText.value,
      debutIndex: 0,
      finIndex: selectedText.value.length
    };

    const response = await axios.post('/api/dialogue-surlignages', highlightData);
    
    if (response.status === 200 || response.status === 201) {
      await loadDialogueHighlights(selectedDialogueForHighlight.value.id);
      closeHighlightModal();
      alert('Texte surligné avec succès !');
    }
  } catch (error) {
    console.error('Erreur lors du surlignage:', error);
    alert('Erreur lors du surlignage: ' + (error.response?.data?.message || error.message));
  }
};

const removeHighlight = async (highlightId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce surlignage ?')) {
    try {
      await axios.delete(`/api/dialogue-surlignages/${highlightId}`);
      await loadDialogueHighlights(selectedDialogueForHighlight.value.id);
    } catch (error) {
      console.error('Erreur lors de la suppression du surlignage:', error);
    }
  }
};

const closeHighlightModal = () => {
  showHighlightModal.value = false;
  selectedDialogueForHighlight.value = null;
  selectedText.value = '';
  selectedColor.value = null;
};

const loadAvailableColors = async () => {
  try {
    const response = await axios.get('/api/couleurs');
    availableColors.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des couleurs:', error);
  }
};

// Méthode pour ouvrir la modale de surlignage
const openHighlightModal = async (dialogue, event) => {
  if (availableColors.value.length === 0) {
    await loadAvailableColors();
  }
  
  selectedDialogueForHighlight.value = dialogue;
  const selection = window.getSelection();
  const selectedTextContent = selection.toString().trim();
  
  if (selectedTextContent) {
    selectedText.value = selectedTextContent;
    selectedColor.value = null;
    showHighlightModal.value = true;
    
    await loadDialogueHighlights(dialogue.id);
  } else {
    alert('Veuillez sélectionner du texte à surligner.');
  }
};

const startAddDialogue = (scene) => {
  if (!userPermissions.value.canCreateDialogue) {
    alert('Vous n\'êtes pas autorisé à créer des dialogues pour cette scène.');
    return;
  }
  
  selectedSceneForDialogue.value = scene;
  newDialogueData.value = {
    personnageId: null,
    texte: '',
    observation: '',
    ordre: 1
  };
  
  calculateDialogueOrder(scene.idScene);
  showAddDialogueSection.value = true;
};

const calculateDialogueOrder = async (sceneId) => {
  try {
    const response = await axios.get(`/api/dialogues/scene/${sceneId}`);
    const dialogues = response.data;
    
    if (dialogues && dialogues.length > 0) {
      const maxOrder = Math.max(...dialogues.map(d => d.ordre));
      newDialogueData.value.ordre = maxOrder + 1;
    } else {
      newDialogueData.value.ordre = 1;
    }
  } catch (error) {
    console.error('Erreur lors du calcul de l\'ordre:', error);
    newDialogueData.value.ordre = 1;
  }
};

const createDialogueDirect = async (sceneId) => {
  if (!newDialogueData.value.texte.trim()) {
    alert('Le texte du dialogue est requis.');
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      alert('Utilisateur non connecté');
      return;
    }

    const payload = {
      sceneId: parseInt(sceneId),
      personnageId: newDialogueData.value.personnageId ? parseInt(newDialogueData.value.personnageId) : null,
      texte: newDialogueData.value.texte,
      ordre: parseInt(newDialogueData.value.ordre),
      observation: newDialogueData.value.observation || ''
    };

    const response = await axios.post('/api/dialogues', payload, {
      headers: {
        'X-User-Id': user.id
      }
    });

    if (response.status === 201) {
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
      cancelAddDialogue();
      alert('Dialogue ajouté avec succès!');
    }
  } catch (error) {
    console.error('Erreur lors de la création du dialogue:', error);
    alert('Erreur: ' + (error.response?.data?.message || error.message || 'Erreur inconnue'));
  }
};

const cancelAddDialogue = () => {
  showAddDialogueSection.value = false;
  selectedSceneForDialogue.value = null;
  newDialogueData.value = {
    personnageId: null,
    texte: '',
    observation: '',
    ordre: 1
  };
};

// Charger les surlignages d'un dialogue
const loadDialogueHighlights = async (dialogueId) => {
  try {
    const response = await axios.get(`/api/dialogue-surlignages/dialogue/${dialogueId}`);
    dialogueHighlights.value[dialogueId] = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des surlignages:', error);
  }
};

// Méthodes pour l'édition
const startEditEpisode = () => {
  if (!store.currentEpisode) return;
  editingEpisode.value = {
    id: store.currentEpisode.idEpisode,
    titre: store.currentEpisode.titre,
    synopsis: store.currentEpisode.synopsis || '',
    ordre: store.currentEpisode.ordre,
    statutId: getStatutIdByNom('episode', store.currentEpisode.statutNom)
  };
  editEpisodeError.value = '';
  showEditEpisodeModal.value = true;
};

const saveEditedEpisode = async () => {
  editEpisodeLoading.value = true;
  editEpisodeError.value = '';

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      editEpisodeError.value = 'Utilisateur non connecté';
      return;
    }

    const url = `/api/episodes/${editingEpisode.value.id}`;
    const updateData = {
      titre: editingEpisode.value.titre,
      synopsis: editingEpisode.value.synopsis,
      ordre: parseInt(editingEpisode.value.ordre),
      statutId: editingEpisode.value.statutId
    };
    
    const response = await axios.put(url, updateData, {
      headers: {
        'X-User-Id': user.id
      }
    });
    
    if (response.status === 200) {
      store.currentEpisode.titre = editingEpisode.value.titre;
      store.currentEpisode.synopsis = editingEpisode.value.synopsis;
      store.currentEpisode.ordre = editingEpisode.value.ordre;
      store.currentEpisode.statutNom = getStatutNomById('episode', editingEpisode.value.statutId);
      const episodeIndex = store.episodes.findIndex(e => e.idEpisode === editingEpisode.value.id);
      if (episodeIndex !== -1) {
        store.episodes[episodeIndex] = { ...store.episodes[episodeIndex], ...editingEpisode.value };
      }
      closeEditEpisodeModal();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'épisode:', error);
    editEpisodeError.value = error.response?.data?.message || 'Erreur lors de la mise à jour de l\'épisode';
  } finally {
    editEpisodeLoading.value = false;
  }
};

// Méthode pour supprimer l'épisode
const confirmDeleteEpisode = async () => {
  if (!store.currentEpisode?.idEpisode) {
    alert('Aucun épisode sélectionné');
    return;
  }

  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'épisode "${store.currentEpisode.titre}" ? Cette action est irréversible et supprimera également toutes les séquences, scènes et dialogues associés.`)) {
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      alert('Utilisateur non connecté');
      return;
    }

    await axios.delete(`/api/episodes/${store.currentEpisode.idEpisode}`, {
      headers: {
        'X-User-Id': user.id
      }
    });

    await store.fetchEpisodes(projetId.value);
    
    // Retourner à la vue projet
    sidebarSelection.value = { type: 'project', id: null };
    router.push({ query: {} });
    
    alert('Épisode supprimé avec succès! Les ordres ont été recalculés automatiquement.');
    
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'épisode:', error);
    alert('Erreur lors de la suppression de l\'épisode: ' + (error.response?.data?.message || error.message));
  }
};

const closeEditEpisodeModal = () => {
  showEditEpisodeModal.value = false;
  editingEpisode.value = { id: null, titre: '', synopsis: '', ordre: null, statutId: null };
  editEpisodeError.value = '';
};

const startEditSequence = (sequence) => {
  if (!userPermissions.value.canCreateSequence) {
    alert('Vous n\'êtes pas autorisé à modifier des séquences pour cet épisode.');
    return;
  }
  
  editingSequence.value = {
    id: sequence.idSequence,
    titre: sequence.titre,
    synopsis: sequence.synopsis || '',
    ordre: sequence.ordre,
    statutId: getStatutIdByNom('sequence', sequence.statutNom)
  };
  editSequenceError.value = '';
  showEditSequenceModal.value = true;
};

const saveEditedSequence = async () => {
  editSequenceLoading.value = true;
  editSequenceError.value = '';

  try {
    const url = `/api/sequences/${editingSequence.value.id}`;
    const updateData = {
      titre: editingSequence.value.titre,
      synopsis: editingSequence.value.synopsis,
      ordre: parseInt(editingSequence.value.ordre),
      statutId: editingSequence.value.statutId
    };
    const response = await axios.put(url, updateData);
    if (response.status === 200) {
      store.currentSequence.titre = editingSequence.value.titre;
      store.currentSequence.synopsis = editingSequence.value.synopsis;
      store.currentSequence.ordre = editingSequence.value.ordre;
      store.currentSequence.statutNom = getStatutNomById('sequence', editingSequence.value.statutId);
      await store.fetchSequences(store.currentEpisode.idEpisode);
      closeEditSequenceModal();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la séquence:', error);
    editSequenceError.value = error.response?.data?.message || 'Erreur lors de la mise à jour de la séquence';
  } finally {
    editSequenceLoading.value = false;
  }
};

const closeEditSequenceModal = () => {
  showEditSequenceModal.value = false;
  editingSequence.value = { id: null, titre: '', synopsis: '', ordre: null, statutId: null };
  editSequenceError.value = '';
};

const startEditScene = (scene) => {
  if (!userPermissions.value.canCreateScene) {
    alert('Vous n\'êtes pas autorisé à modifier des scènes pour cette séquence.');
    return;
  }
  
  editingScene.value = {
    id: scene.idScene,
    titre: scene.titre,
    synopsis: scene.synopsis || '',
    ordre: scene.ordre,
    statutId: getStatutIdByNom('scene', scene.statutNom)
  };
  editSceneError.value = '';
  showEditSceneModal.value = true;
};

const saveEditedScene = async () => {
  editSceneLoading.value = true;
  editSceneError.value = '';

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      editSceneError.value = 'Utilisateur non connecté';
      return;
    }

    const url = `/api/scenes/${editingScene.value.id}`;
    const updateData = {
      titre: editingScene.value.titre,
      synopsis: editingScene.value.synopsis,
      ordre: parseInt(editingScene.value.ordre),
      statutId: editingScene.value.statutId
    };

    const response = await axios.put(url, updateData, {
      headers: {
        'X-User-Id': user.id
      }
    });
    
    if (response.status === 200) {
      const sceneIndex = store.scenes.findIndex(s => s.idScene === editingScene.value.id);
      if (sceneIndex !== -1) {
        store.scenes[sceneIndex] = {
          ...store.scenes[sceneIndex],
          titre: editingScene.value.titre,
          synopsis: editingScene.value.synopsis,
          ordre: editingScene.value.ordre,
          statutNom: getStatutNomById('scene', editingScene.value.statutId)
        };
      }
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
      closeEditSceneModal();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la scène:', error);
    editSceneError.value = error.response?.data?.message || 'Erreur lors de la mise à jour de la scène';
  } finally {
    editSceneLoading.value = false;
  }
};

const closeEditSceneModal = () => {
  showEditSceneModal.value = false;
  editingScene.value = { id: null, titre: '', synopsis: '', ordre: null, statutId: null };
  editSceneError.value = '';
};

// Méthodes pour l'édition du dialogue
const startEditDialogue = async (dialogue) => {
  if (!userPermissions.value.canCreateDialogue) {
    alert('Vous n\'êtes pas autorisé à modifier des dialogues pour cette scène.');
    return;
  }
  
  editingDialogue.value = {
    id: dialogue.id,
    personnageId: dialogue.personnageId || null,
    texte: dialogue.texte,
    observation: dialogue.observation || '',
    ordre: dialogue.ordre || 1,
    sceneId: dialogue.sceneId
  };
  editDialogueError.value = '';
  orderError.value = '';
  await loadExistingOrders();
  showEditDialogueModal.value = true;
};

const loadExistingOrders = async () => {
  if (!editingDialogue.value.sceneId) return;
  try {
    const response = await axios.get(`/api/dialogues/scene/${editingDialogue.value.sceneId}`);
    existingOrders.value = response.data.map(d => d.ordre);
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
};

const validateOrder = () => {
  const ordre = parseInt(editingDialogue.value.ordre);
  if (isNaN(ordre) || ordre < 1) {
    orderError.value = 'L\'ordre doit être un nombre positif.';
    return false;
  }
  if (existingOrders.value.includes(ordre) && ordre !== parseInt(editingDialogue.value.ordreOriginal || editingDialogue.value.ordre)) {
    orderError.value = 'Cet ordre existe déjà dans la scène.';
    return false;
  }
  orderError.value = '';
  return true;
};

const saveEditedDialogue = async () => {
  if (!editingDialogue.value.texte.trim()) {
    editDialogueError.value = 'Le texte du dialogue est requis.';
    return;
  }
  if (!validateOrder()) {
    return;
  }

  editDialogueLoading.value = true;
  editDialogueError.value = '';

  try {
    const updateData = {
      sceneId: editingDialogue.value.sceneId,
      personnageId: editingDialogue.value.personnageId,
      texte: editingDialogue.value.texte,
      observation: editingDialogue.value.observation || null,
      ordre: parseInt(editingDialogue.value.ordre)
    };

    const response = await axios.put(`/api/dialogues/${editingDialogue.value.id}`, updateData, {
      headers: {
        'X-User-Id': user.value.id
      }
    });

    if (response.status === 200) {
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
      closeEditDialogueModal();
      alert('Dialogue modifié avec succès!');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du dialogue:', error);
    editDialogueError.value = error.response?.data?.message || 'Erreur lors de la mise à jour du dialogue';
    alert(editDialogueError.value);
  } finally {
    editDialogueLoading.value = false;
  }
};

const closeEditDialogueModal = () => {
  showEditDialogueModal.value = false;
  editingDialogue.value = { id: null, personnageId: null, texte: '', observation: '', ordre: 1, sceneId: null };
  editDialogueError.value = '';
  orderError.value = '';
  existingOrders.value = [];
  suggestedOrder.value = null;
};

const goToNextScene = async () => {
  if (store.currentScene && store.currentSceneIndex < store.scenes.length - 1) {
    const nextIndex = store.currentSceneIndex + 1;
    await handleSidebarSelection({ type: 'scene', id: store.scenes[nextIndex].idScene });
  }
};

const goToPrevScene = async () => {
  if (store.currentScene && store.currentSceneIndex > 0) {
    const prevIndex = store.currentSceneIndex - 1;
    await handleSidebarSelection({ type: 'scene', id: store.scenes[prevIndex].idScene });
  }
};

// Méthodes pour la navigation
const goToNextPage = () => store.goToNextPage();
const goToPrevPage = () => store.goToPrevPage();
const retryFetch = () => store.fetchEpisodes(projetId.value);

const selectEpisode = async (episodeId) => {
  await handleSidebarSelection({ type: 'episode', id: episodeId });
};

const selectSequence = async (sequenceId) => {
  await handleSidebarSelection({ type: 'sequence', id: sequenceId });
  newlyCreatedSequenceId.value = null;
};

// Méthodes pour l'ajout
const goToAddEpisode = async () => {
  if (!projetId.value) {
    console.error('ID du projet non trouvé !');
    const alternativeId = route.params.idProjet || route.query.projetId || store.projetId;
    if (alternativeId) {
      projetId.value = alternativeId;
    } else {
      alert('ID du projet manquant. Veuillez réessayer.');
      return;
    }
  }
  
  try {
    router.push(`/projet/${projetId.value}/add-episode-ecran-travail`);
  } catch (error) {
    console.error('Erreur lors de la navigation:', error);
    alert('Erreur lors de la navigation');
  }
};

const goToAddSequence = async () => {
  if (!userPermissions.value.canCreateSequence) {
    alert('Vous n\'êtes pas autorisé à créer des séquences pour cet épisode.');
    return;
  }
  
  if (!store.currentEpisode?.idEpisode) {
    console.error('ID de l\'épisode non trouvé !');
    alert('ID de l\'épisode manquant. Veuillez réessayer.');
    return;
  }
  
  router.push(`/episode/${store.currentEpisode.idEpisode}/add-sequence-ecran-travail`);
};

const goToAddScene = () => {
  if (!userPermissions.value.canCreateScene) {
    alert('Vous n\'êtes pas autorisé à créer des scènes pour cette séquence.');
    return;
  }
  
  const currentUrl = window.location.pathname + window.location.search;
  localStorage.setItem('lastEcranTravailUrl', currentUrl);
  
  router.push({
    path: `/sequence/${store.currentSequence?.idSequence}/add-scene-ecran-travail`,
    query: { 
      backUrl: currentUrl 
    }
  });
};

const addScene = () => {
  goToAddScene();
};

const goToAddComedien = () => {
  const projetIdToUse = projetId.value || store.projetId || route.params.idProjet;
  
  if (!projetIdToUse) {
    console.error('ID du projet non trouvé !');
    alert('ID du projet manquant. Veuillez réessayer.');
    return;
  }
  
  console.log('Navigation vers création comédien avec projet ID:', projetIdToUse);
  router.push(`/projet/${projetIdToUse}/add-comedien-ecran-travail`);
};

const goToAddLieu = () => {
  if (route.params.idProjet) {
    projetId.value = route.params.idProjet;
  }
  else if (store.projetId) {
    projetId.value = store.projetId;
  }
  else if (store.currentEpisode?.idEpisode) {
    axios.get(`/api/episodes/${store.currentEpisode.idEpisode}`)
      .then(response => {
        projetId.value = response.data.projetId;
        router.push(`/projet/${projetId.value}/add-lieu-scene-ecran-travail`);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération du projet:', error);
        fallbackToProjectSelection();
      });
    return;
  } else {
    fallbackToProjectSelection();
    return;
  }

  if (!projetId.value) {
    fallbackToProjectSelection();
    return;
  }

  router.push(`/projet/${projetId.value}/add-lieu-scene-ecran-travail`);
};

const fallbackToProjectSelection = () => {
  if (confirm('Impossible de déterminer le projet actuel. Souhaitez-vous sélectionner un projet manuellement ?')) {
    router.push('/projets');
  }
};

const goToAddPlateau = () => {
  if (!projetId.value) {
    console.error('ID du projet non trouvé !');
    alert('ID du projet manquant. Veuillez réessayer.');
    return;
  }
  router.push(`/projet/${projetId.value}/add-plateau-scene`);
};

const goToAddPersonnage = () => {
  if (!projetId.value) {
    console.error('ID du projet non trouvé !');
    alert('ID du projet manquant. Veuillez réessayer.');
    return;
  }
  router.push(`/projet/${projetId.value}/add-personnage-ecran-travail`);
};

// Méthodes pour la modale d'ajout de lieu
const openAddLieuModal = async (scene) => {
  if (!userPermissions.value.canCreateLieu) {
    alert('Vous n\'êtes pas autorisé à ajouter des lieux/plateaux pour cette scène.');
    return;
  }
  
  selectedSceneForLieu.value = scene;
  await loadAvailableLieux();
  await loadSceneLieus(scene.idScene);
  addLieuError.value = '';
  selectedLieuId.value = null;
  selectedPlateauId.value = null;
  descriptionUtilisation.value = '';
  availablePlateaux.value = [];
  showAddLieuModal.value = true;
};

const closeAddLieuModal = () => {
  showAddLieuModal.value = false;
  selectedSceneForLieu.value = null;
  selectedLieuId.value = null;
  selectedPlateauId.value = null;
  descriptionUtilisation.value = '';
  sceneLieus.value = [];
  addLieuError.value = '';
};

const loadSceneLieus = async (sceneId) => {
  try {
    const response = await axios.get(`/api/scene-lieux/scenes/${sceneId}`);
    sceneLieus.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des lieux de la scène:', error);
    sceneLieus.value = [];
  }
};

const addSceneLieu = async () => {
  if (!selectedLieuId.value) {
    addLieuError.value = 'Veuillez sélectionner un lieu.';
    return;
  }

  addLieuLoading.value = true;
  addLieuError.value = '';

  try {
    const lieuData = {
      sceneId: selectedSceneForLieu.value.idScene,
      lieuId: selectedLieuId.value,
      plateauId: selectedPlateauId.value || null,
      descriptionUtilisation: descriptionUtilisation.value
    };

    const response = await axios.post('/api/scene-lieux', lieuData);
    
    if (response.status === 201) {
      await loadSceneLieus(selectedSceneForLieu.value.idScene);
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
      
      selectedLieuId.value = null;
      selectedPlateauId.value = null;
      descriptionUtilisation.value = '';
      availablePlateaux.value = [];
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du lieu/plateau:', error);
    addLieuError.value = error.response?.data?.message || 'Erreur lors de l\'ajout du lieu/plateau';
  } finally {
    addLieuLoading.value = false;
  }
};

const removeLieuFromScene = async (sceneLieuId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce lieu/plateau de la scène ?')) {
    try {
      await axios.delete(`/api/scene-lieux/${sceneLieuId}`);
      await loadSceneLieus(selectedSceneForLieu.value.idScene);
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu/plateau:', error);
      alert('Erreur lors de la suppression du lieu/plateau');
    }
  }
};

// Charger les statuts
const loadStatutsEpisode = async () => {
  try {
    const response = await axios.get('/api/statuts-episode');
    statutsEpisode.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des statuts d\'épisode:', error);
  }
};

const loadStatutsSequence = async () => {
  try {
    const response = await axios.get('/api/statuts-sequence');
    statutsSequence.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des statuts de séquence:', error);
  }
};

const loadStatutsScene = async () => {
  try {
    const response = await axios.get('/api/statuts-scene');
    statutsScene.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des statuts de scène:', error);
  }
};

// Charger les lieux et plateaux disponibles
const loadAvailableLieux = async () => {
  try {
    if (route.params.idProjet) {
      projetId.value = route.params.idProjet;
    }
    else if (store.projetId) {
      projetId.value = store.projetId;
    }
    else if (store.currentEpisode?.idEpisode) {
      try {
        const episodeResponse = await axios.get(`/api/episodes/${store.currentEpisode.idEpisode}`);
        projetId.value = episodeResponse.data.projetId;
      } catch (error) {
        console.warn('Impossible de récupérer l\'ID du projet depuis l\'épisode:', error);
      }
    }

    if (!projetId.value) {
      console.error('Impossible de déterminer l\'ID du projet');
      availableLieux.value = [];
      return;
    }

    const response = await axios.get(`/api/lieux/projets/${projetId.value}`);
    availableLieux.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des lieux:', error);
    availableLieux.value = [];
  }
};

const loadAvailablePlateaux = async () => {
  if (!selectedLieuId.value) {
    availablePlateaux.value = [];
    return;
  }
  
  try {
    const response = await axios.get(`/api/scene-lieux/lieux/${selectedLieuId.value}/plateaux`);
    availablePlateaux.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des plateaux:', error);
    availablePlateaux.value = [];
  }
};

// Helpers
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getStatuts = (type) => {
  if (type === 'episode') return statutsEpisode.value;
  if (type === 'sequence') return statutsSequence.value;
  if (type === 'scene') return statutsScene.value;
  return [];
};

const getNomField = (type) => `nomStatuts${capitalize(type)}`;

const getIdField = (type) => {
  if (type === 'episode') return 'idStatutEpisode';
  return 'id';
};

const getStatutIdByNom = (type, nom) => {
  const statuts = getStatuts(type);
  const nomField = getNomField(type);
  const statut = statuts.find(s => s[nomField] === nom);
  const idField = getIdField(type);
  return statut ? statut[idField] : null;
};

const getStatutNomById = (type, id) => {
  const statuts = getStatuts(type);
  const idField = getIdField(type);
  const nomField = getNomField(type);
  const statut = statuts.find(s => s[idField] === id);
  return statut ? statut[nomField] : '';
};

// Méthodes pour les commentaires d'épisode
const toggleEpisodeCommentSection = async () => {
  showEpisodeCommentSection.value = !showEpisodeCommentSection.value;
  if (showEpisodeCommentSection.value) {
    await loadEpisodeComments();
    await loadEpisodeCommentCounts();
  }
};

const loadEpisodeComments = async () => {
  try {
    const response = await axios.get(`/api/commentaires/episode/${store.currentEpisode.idEpisode}`);
    episodeComments.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires d\'épisode:', error);
  }
};

const getEpisodeCommentCount = (episodeId) => {
  return episodeCommentCounts.value[episodeId] || 0;
};

const loadEpisodeCommentCounts = async () => {
  if (store.currentEpisode) {
    try {
       const response = await axios.get(`/api/commentaires/episode/${store.currentEpisode.idEpisode}/count`); 
      episodeCommentCounts.value[store.currentEpisode.idEpisode] = response.data;
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de commentaires pour l\'épisode:', error);
      episodeCommentCounts.value[store.currentEpisode.idEpisode] = 0;
    }
  }
};

const addEpisodeComment = async () => {
  if (!newEpisodeComment.value.trim() || !store.currentEpisode) return;
  
  try {
   
    await axios.post('/api/commentaires', { 
      contenu: newEpisodeComment.value,
      episodeId: store.currentEpisode.idEpisode
    }, {
      headers: {
        'X-User-Id': user.value.id
      }
    });
    
    newEpisodeComment.value = '';
    await loadEpisodeComments();
    await loadEpisodeCommentCounts();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    alert('Erreur lors de l\'ajout du commentaire');
  }
};

const deleteEpisodeComment = async (commentId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    try {
      await axios.delete(`/api/commentaires/${commentId}`);
      await loadEpisodeComments();
      await loadEpisodeCommentCounts();
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  }
};

// Méthodes pour les commentaires
const toggleSequenceCommentSection = async () => {
  showSequenceCommentSection.value = !showSequenceCommentSection.value;
  if (showSequenceCommentSection.value) {
    await loadSequenceComments();
    await loadSequenceCommentCount();
  }
};

const loadSequenceComments = async () => {
  try {
    const response = await axios.get(`/api/sequence-commentaires/sequence/${store.currentSequence.idSequence}`);
    sequenceComments.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires de séquence:', error);
  }
};

const loadSequenceCommentCount = async () => {
  if (!store.currentSequence) return;
  try {
    const response = await axios.get(`/api/sequence-commentaires/sequence/${store.currentSequence.idSequence}/count`);
    sequenceCommentCount.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement du nombre de commentaires:', error);
  }
};

const addSequenceComment = async () => {
  if (!newSequenceComment.value.trim()) return;
  try {
    await axios.post('/api/sequence-commentaires', {
      contenu: newSequenceComment.value,
      sequenceId: store.currentSequence.idSequence
    }, {
      headers: {
        'X-User-Id': user.value.id
      }
    });
    newSequenceComment.value = '';
    await loadSequenceComments();
    await loadSequenceCommentCount();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    alert('Erreur lors de l\'ajout du commentaire');
  }
};

const deleteSequenceComment = async (commentId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    try {
      await axios.delete(`/api/sequence-commentaires/${commentId}`);
      await loadSequenceComments();
      await loadSequenceCommentCount();
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  }
};

const toggleSceneCommentSection = async (scene) => {
  selectedSceneForComments.value = scene;
  showSceneCommentModal.value = true;
  await loadSceneComments(scene.idScene);
};

const closeSceneCommentModal = () => {
  showSceneCommentModal.value = false;
  selectedSceneForComments.value = null;
  sceneComments.value = [];
};

const loadSceneComments = async (sceneId) => {
  try {
    const response = await axios.get(`/api/scene-commentaires/scene/${sceneId}`);
    sceneComments.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires de scène:', error);
  }
};

const onTournageUpdated = (tournageData) => {
  if (store.currentSequence) {
    store.fetchSequenceDetails(store.currentSequence.idSequence);
  }
};

const getSceneCommentCount = (sceneId) => {
  return sceneCommentCounts.value[sceneId] || 0;
};

const loadSceneCommentCounts = async () => {
  if (!store.scenes) return;
  for (const scene of store.scenes) {
    try {
      const response = await axios.get(`/api/scene-commentaires/scene/${scene.idScene}/count`);
      sceneCommentCounts.value[scene.idScene] = response.data;
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de commentaires pour la scène:', error);
      sceneCommentCounts.value[scene.idScene] = 0;
    }
  }
};

const addSceneComment = async () => {
  if (!newSceneComment.value.trim() || !selectedSceneForComments.value) return;
  try {
    await axios.post('/api/scene-commentaires', {
      contenu: newSceneComment.value,
      sceneId: selectedSceneForComments.value.idScene
    }, {
      headers: {
        'X-User-Id': user.value.id
      }
    });
    newSceneComment.value = '';
    await loadSceneComments(selectedSceneForComments.value.idScene);
    await loadSceneCommentCounts();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    alert('Erreur lors de l\'ajout du commentaire');
  }
};

const deleteSceneComment = async (commentId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    try {
      await axios.delete(`/api/scene-commentaires/${commentId}`);
      await loadSceneComments(selectedSceneForComments.value.idScene);
      await loadSceneCommentCounts();
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  }
};

const toggleDialogueCommentSection = async (dialogue) => {
  selectedDialogue.value = dialogue;
  showDialogueCommentModal.value = true;
  await loadDialogueComments(dialogue.id);
};

const closeDialogueCommentModal = () => {
  showDialogueCommentModal.value = false;
  selectedDialogue.value = null;
  dialogueComments.value = [];
};

const loadDialogueComments = async (dialogueId) => {
  try {
    const response = await axios.get(`/api/dialogues/commentaires/dialogue/${dialogueId}`);
    dialogueComments.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires de dialogue:', error);
  }
};

const getDialogueCommentCount = (dialogueId) => {
  return dialogueCommentCounts.value[dialogueId] || 0;
};

const loadDialogueCommentCounts = async () => {
  if (!store.scenes) return;
  for (const scene of store.scenes) {
    if (scene.dialogues && scene.dialogues.length > 0) {
      for (const dialogue of scene.dialogues) {
        try {
          const response = await axios.get(`/api/dialogues/commentaires/dialogue/${dialogue.id}/count`);
          dialogueCommentCounts.value[dialogue.id] = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement du nombre de commentaires pour le dialogue:', error);
          dialogueCommentCounts.value[dialogue.id] = 0;
        }
      }
    }
  }
};

const addDialogueComment = async () => {
  if (!newDialogueComment.value.trim() || !selectedDialogue.value) return;
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
    await loadDialogueCommentCounts();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    alert('Erreur lors de l\'ajout du commentaire');
  }
};

const deleteDialogueComment = async (commentId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    try {
      await axios.delete(`/api/dialogues/commentaires/${commentId}`);
      await loadDialogueComments(selectedDialogue.value.id);
      await loadDialogueCommentCounts();
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  }
};

const deleteSequence = async (sequenceId) => {
  if (!userPermissions.value.canCreateSequence) {
    alert('Vous n\'êtes pas autorisé à supprimer des séquences pour cet épisode.');
    return;
  }
  
  if (confirm('Êtes-vous sûr de vouloir supprimer cette séquence ? Les ordres seront automatiquement recalculés.')) {
    try {
      await axios.delete(`/api/sequences/${sequenceId}`);
      await store.fetchSequences(store.currentEpisode.idEpisode);
      // Retourner à la vue épisode
      sidebarSelection.value = { type: 'episode', id: store.currentEpisode.idEpisode };
      updateRouteForSelection();
      alert('Séquence supprimée avec succès! Les ordres ont été recalculés.');
    } catch (error) {
      console.error('Erreur lors de la suppression de la séquence:', error);
      alert('Erreur lors de la suppression de la séquence');
    }
  }
};

const deleteScene = async (sceneId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.id) {
      alert('Utilisateur non connecté');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette scène ? Les ordres seront automatiquement recalculés.')) {
      return;
    }

    await axios.delete(`/api/scenes/${sceneId}`, {
      headers: {
        'X-User-Id': user.id
      }
    });
    
    await store.fetchSequenceDetails(store.currentSequence.idSequence);
    alert('Scène supprimée avec succès! Les ordres ont été recalculés.');
  } catch (error) {
    console.error('Erreur DELETE complète:', error);
    console.error('Response data:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || error.response?.data || error.message;
    alert(`Erreur suppression: ${errorMessage}`);
  }
};

const deleteDialogue = async (dialogueId) => {
  if (!userPermissions.value.canCreateDialogue) {
    alert('Vous n\'êtes pas autorisé à supprimer des dialogues pour cette scène.');
    return;
  }
  
  if (confirm('Êtes-vous sûr de vouloir supprimer ce dialogue ?')) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.id) {
        alert('Utilisateur non connecté');
        return;
      }

      await axios.delete(`/api/dialogues/${dialogueId}`, {
        headers: {
          'X-User-Id': user.id
        }
      });
      
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
      alert('Dialogue supprimé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la suppression du dialogue:', error);
      alert('Erreur lors de la suppression du dialogue: ' + (error.response?.data?.message || error.message));
    }
  }
};

const onReplanificationDansScene = (data) => {
  console.log('🔄 Replanification dans scène détectée:', data)
  
  if (store.currentSequence) {
    store.fetchSequenceDetails(store.currentSequence.idSequence)
  }
};

const goToCalendrierTournage = () => {
  router.push('/calendrier-tournage');
};

// Méthodes d'export PDF avec design de facture
const exportScenesOnlyPDF = async () => {
  if (!currentSequence.value || !currentEpisode.value) {
    alert('Aucune séquence ou épisode sélectionné');
    return;
  }
  
  try {
    await exportScenesOnlyPDFFunc(currentSequence.value, currentEpisode.value);
    alert('PDF des scènes exporté avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des scènes:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const exportSceneDialoguesPDF = async (scene) => {
  try {
    await exportSceneDialoguesPDFFunc(scene, currentEpisode.value, currentSequence.value);
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des dialogues:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const exportSequenceDialoguesPDF = async () => {
  if (!currentSequence.value || !currentEpisode.value) {
    alert('Aucune séquence ou épisode sélectionné');
    return;
  }
  
  try {
    await exportSequenceDialoguesPDFFunc(currentSequence.value, currentEpisode.value);
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des dialogues de séquence:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const exportSequenceCompletePDF = async () => {
  if (!currentSequence.value || !currentEpisode.value) {
    alert('Aucune séquence ou épisode sélectionné');
    return;
  }
  
  try {
    await exportSequenceCompletePDFFunc(currentSequence.value, currentEpisode.value);
  } catch (error) {
    console.error('Erreur lors de l\'export PDF complet de la séquence:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const exportEpisodeWithSequencePDF = async () => {
  if (!currentEpisode.value || !currentSequence.value) {
    alert('Aucun épisode ou séquence sélectionné');
    return;
  }
  
  try {
    await exportEpisodeWithSequencePDFFunc(currentEpisode.value, currentSequence.value);
  } catch (error) {
    console.error('Erreur lors de l\'export PDF épisode + séquence:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const exportScenePDF = async (scene) => {
  if (!scene) {
    alert('Aucune scène sélectionnée');
    return;
  }
  
  try {
    await exportScenePDFFunc(scene, currentEpisode.value, getSceneCommentCount);
    alert('PDF de la scène exporté avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'export PDF de la scène:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const exportRaccordsProjetPDF = async () => {
  if (!store.projetInfos || !store.projetTitle) {
    alert('Aucun projet sélectionné');
    return;
  }
  
  try {
    await exportRaccordsProjetPDFFunc(store.projetInfos, store.projetTitle);
  } catch (error) {
    console.error('Erreur export raccords:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const exportRaccordsByScene = async (sceneId) => {
  if (!sceneId) {
    alert('Aucune scène sélectionnée');
    return;
  }
  
  try {
    await exportRaccordsBySceneFunc(
      sceneId, 
      store, 
      formatDate, 
      getBase64FromUrl
    );
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des raccords de scène:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const exportRaccordsByComedien = async (comedienId) => {
  if (!comedienId) {
    alert('Veuillez sélectionner un comédien');
    return;
  }

  try {
    await exportRaccordsByComedienFunc(comedienId, store.projetInfos, store.projetTitle);
  } catch (error) {
    console.error('Erreur export comédien:', error);
    alert('Erreur lors de l\'export PDF: ' + (error.response?.data?.message || error.message));
  }
};

const loadComediens = async () => {
  try {
    if (!projetId.value) {
      console.error('ID du projet non trouvé');
      return;
    }
    
    const response = await axios.get(`/api/comediens/projet/${projetId.value}`);
    comediens.value = response.data;
    console.log('Comédiens chargés:', comediens.value.length);
  } catch (error) {
    console.error('Erreur lors du chargement des comédiens:', error);
    comediens.value = [];
  }
};

const startEditProject = () => {
  router.push(`/projet/${store.projetInfos.id}/edit`);
};

const confirmDeleteProject = async () => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${store.projetTitle}" ? Cette action est irréversible.`)) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        alert('Utilisateur non connecté');
        return;
      }

      await axios.delete(`/api/projets/${store.projetInfos.id}`, {
        headers: {
          'X-User-Id': user.id
        }
      });

      router.push('/projets');
      alert('Projet supprimé avec succès!');
      
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      alert('Erreur lors de la suppression du projet: ' + (error.response?.data?.message || error.message));
    }
  }
};

const openRaccordsPhotosModal = (scene) => {
  // Ouvrir modale ou autre action pour les raccords photos
  console.log('Ouvrir raccords photos pour:', scene);
};

const openCreateRaccordModal = (scene) => {
  // Ouvrir modale pour créer un raccord
  console.log('Créer raccord pour:', scene);
};

const goToSequenceFromTools = (sequenceId) => {
  handleSidebarSelection({ type: 'sequence', id: sequenceId });
};

const goToEpisodeFromTools = (episodeId) => {
  handleSidebarSelection({ type: 'episode', id: episodeId });
};

const goToProjectFromTools = (projetId) => {
  handleSidebarSelection({ type: 'project', id: null });
};

</script>





