<template>
  <div class="app-wrapper">

    <div class="fixed-add-btn-links">
      
       <div class="options-sidebar" :class="{ 'open': sidebarOpen }">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="fas" :class="sidebarOpen ? 'fa-chevron-right' : 'fa-cog'"></i>
      </button>


      <div class="liens-ecran-travail">
        <button class="nav-btn-ecran-travail" @click="goToCalendrierTournage">
            <i class="fas fa-calendar-alt"></i> Calendrier
          </button>

            <button 
        v-if="episodes.length === 0 || userPermissions.canEditEpisode" 
        class="add-scene-btn-ecran-travail" 
        @click="goToAddEpisode"
      >
        <i class="fas fa-plus-circle" style="color: #21294F;"></i> Episode
        </button>     
          <button v-if="userPermissions.canCreateSequence" class="add-scene-btn-ecran-travail" @click="goToAddSequence">
            <i class="fas fa-plus-circle " style="color: #21294F;"></i> Séquence
          </button>
          <button v-if="userPermissions.canCreateLieu" class="add-scene-btn-ecran-travail" @click="goToAddLieu">
            <i class="fas fa-plus-circle " style="color: #21294F;"></i> Lieu
          </button>
          <button v-if="userPermissions.canCreatePlateau" class="add-scene-btn-ecran-travail" @click="goToAddPlateau">
            <i class="fas fa-plus-circle " style="color: #21294F;"></i> Plateau
          </button>
          <button v-if="userPermissions.canCreateComedien" class="add-scene-btn-ecran-travail" @click="goToAddComedien">
            <i class="fas fa-plus-circle " style="color: #21294F;"></i> Comedien
          </button>
          <button v-if="userPermissions.canCreatePersonnage" class="add-scene-btn-ecran-travail" @click="goToAddPersonnage">
            <i class="fas fa-plus-circle " style="color: #21294F;"></i> Personnage
          </button>
      </div>
    </div>
    </div>

    <div class="ecran-travail-ecran-travail">
      <!-- Header avec titre de l'épisode -->
      <header class="header-ecran-travail">
        <div class="navigation-ecran-travail">
          <button class="nav-btn-ecran-travail" @click="goToPrevPage" :disabled="!hasPrev || isLoading">Précédent</button>
          <button class="nav-btn-ecran-travail" @click="goToNextPage" :disabled="!hasNext || isLoading">Suivant</button>
           <button class="nav-btn-ecran-travail" @click="goToCalendrierTournage">
              <i class="fas fa-calendar-alt"></i> Calendrier
            </button>
          <div class="export-container-ecran-travail">
          <div class="export-dropdown-ecran-travail">
            <button class="export-main-btn-ecran-travail">
              <i class="fas fa-file-export"></i> Exporter en PDF
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="export-dropdown-content-ecran-travail">
              <!-- Export PDF des scènes seulement -->
              <button 
                v-if="currentSequence" 
                class="export-option-ecran-travail" 
                @click="exportScenesOnlyPDF"
                title="Exporter les scènes en PDF"
              >
                <i class="fas fa-file-pdf"></i> Scènes PDF
              </button>

              <!-- Export PDF des dialogues d'une scène -->
              <button 
                v-if="currentSequence" 
                class="export-option-ecran-travail" 
                @click="exportSequenceDialoguesPDF"
                title="Exporter tous les dialogues de la séquence en PDF"
              >
                <i class="fas fa-file-pdf"></i> Dialogues PDF
              </button>

              <!-- Export PDF séquence complète -->
              <button 
                v-if="currentSequence" 
                class="export-option-ecran-travail" 
                @click="exportSequenceCompletePDF"
                title="Exporter la séquence complète en PDF"
              >
                <i class="fas fa-file-pdf"></i> Séquence PDF
              </button>

              <!-- Export PDF épisode avec séquence -->
              <button 
                v-if="currentEpisode" 
                class="export-option-ecran-travail" 
                @click="exportEpisodeWithSequencePDF"
                title="Exporter l'épisode avec séquence en PDF"
              >
                <i class="fas fa-file-pdf"></i> Épisode PDF
              </button>
            </div>
          </div>
        </div>
        </div>

        
        <!-- En-tête avec les informations du projet -->
    <div class="project-header" v-if="store.projetInfos">
      <div class="project-info-card">
        <div class="project-header-top">
          <h1 class="project-title">{{ store.projetTitle }}</h1>
          <div class="project-actions">
              <!-- Bouton Modifier -->
              <button class="action-btn edit-btn" @click="startEdit(store.projetInfos)" title="Modifier le projet">
                <i class="fas fa-pen"></i>
              </button>
              <!-- Bouton Supprimer -->
              <button class="action-btn delete-btn" @click="deleteProject(store.projetInfos.id)" title="Supprimer le projet">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          <span 
            class="project-status" 
            :style="{ backgroundColor: store.statusColor }"
          >
            {{ store.projetStatus }}
          </span>
        </div>
        
        
        <div class="project-meta">
          <span class="project-author" v-if="store.projetAuteur">
            <i class="fas fa-user"></i> Par {{ store.projetAuteur }}
          </span>
          <span class="project-date" v-if="store.projetInfos.dateCreation">
            <i class="fas fa-calendar"></i> Créé le {{ formatDate(store.projetInfos.dateCreation) }}
          </span>
        </div>

        <!-- Synopsis du projet -->
        <div class="project-synopsis" v-if="store.projetSynopsis">
          <h3>Synopsis</h3>
          <p>{{ store.projetSynopsis }}</p>
        </div>

        <p class="project-description" v-if="store.projetDescription">
          {{ store.projetDescription }}
        </p>

        <div class="project-stats" v-if="store.episodes.length > 0">
          <span class="stat">
            <i class="fas fa-film"></i>
            {{ store.episodes.length }} épisode(s)
          </span>
          <span class="stat">
            <i class="fas fa-list-ol"></i>
            {{ store.totalSequences }} séquence(s)
          </span>
          <span class="stat" v-if="store.projetInfos.dureeTotale">
            <i class="fas fa-clock"></i>
            {{ store.projetInfos.dureeTotale }} min
          </span>
        </div>
      </div>
    </div>

        <h2 class="episode-title-ecran-travail"> Épisode {{ currentEpisode?.ordre }} : </h2><br>     

       <div class="title-episode-ecran-travail">
          <label> {{ currentEpisode?.titre || 'Chargement...' }} </label>

          <!-- Afficher le bouton modifier seulement si l'utilisateur a la permission -->
          <span v-if="userPermissions.canEditEpisode" class="icon-edit-ecran-travail" @click="startEditEpisode">
            <i class="fas fa-pen icon-ecran-travail" style="background: none;"></i>
          </span> <br>
          <span v-if="userPermissions.canEditEpisode" class="icon-delete-ecran-travail" @click="confirmDeleteEpisode">
            <i class="fas fa-trash icon-ecran-travail" style="color: #dc3545; background: none;"></i>
          </span>
          <br>
        </div>
        
        <div class="syno-episode-ecran-travail">
          <label><strong>Synopsis :</strong> {{ currentEpisode?.synopsis || 'Chargement...' }} </label><br>
          <label><strong>Statut :</strong> {{ currentEpisode?.statutNom || 'Chargement...' }} </label>
        </div>

        <div class="episode-equipe-ecran-travail" v-if="currentEpisode">
          <div class="equipe-info-ecran-travail">
            <strong>Équipe de l'épisode :</strong>
            <span v-if="currentEpisode.realisateur" class="realisateur-info-ecran-travail">
              Réalisateur : {{ currentEpisode.realisateur.nom }}
            </span>
            <span v-if="currentEpisode.scenariste" class="scenariste-info-ecran-travail">
              Scénariste : {{ currentEpisode.scenariste.nom }}
            </span>
          </div>
        </div>
      </header>

      <!-- Navigation par numéros d'épisodes -->
        <div class="episode-navigation-ecran-travail">
          <span
            v-for="episode in episodes"
            :key="episode.idEpisode"
            class="episode-number-ecran-travail"
            :class="{ 'active-ecran-travail': episode.idEpisode === currentEpisode?.idEpisode, 'new-episode-ecran-travail': episode.idEpisode === newlyCreatedEpisodeId }"
            @click="selectEpisode(episode.idEpisode)"
          >Ep
            {{ episode.ordre }}
            <span v-if="episode.idEpisode === newlyCreatedEpisodeId" class="blinking-icon-ecran-travail">✨</span>
          </span>
        </div>

      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="loading-ecran-travail">Chargement en cours...</div>

      <!-- Message d'erreur -->
      <div v-if="error && !isLoading" class="error-message-ecran-travail">
        {{ error }}
        <button class="retry-btn-ecran-travail" @click="retryFetch">Réessayer</button>
      </div>

       <!-- Liens de création - Masquer ceux non autorisés -->
      <div class="liens-ecran-travail">
            <button 
        v-if="episodes.length === 0 || userPermissions.canEditEpisode" 
        class="add-scene-btn-ecran-travail" 
        @click="goToAddEpisode"
      >
        <i class="fas fa-plus-circle" style="color: #21294F;"></i> Episode
      </button>     
        <button v-if="userPermissions.canCreateSequence" class="add-scene-btn-ecran-travail" @click="goToAddSequence">
          <i class="fas fa-plus-circle " style="color: #21294F;"></i> Séquence
        </button>
        <button v-if="userPermissions.canCreateLieu" class="add-scene-btn-ecran-travail" @click="goToAddLieu">
          <i class="fas fa-plus-circle " style="color: #21294F;"></i> Lieu
        </button>
        <button v-if="userPermissions.canCreatePlateau" class="add-scene-btn-ecran-travail" @click="goToAddPlateau">
          <i class="fas fa-plus-circle " style="color: #21294F;"></i> Plateau
        </button>
        <button v-if="userPermissions.canCreateComedien" class="add-scene-btn-ecran-travail" @click="goToAddComedien">
          <i class="fas fa-plus-circle " style="color: #21294F;"></i> Comedien
        </button>
        <button v-if="userPermissions.canCreatePersonnage" class="add-scene-btn-ecran-travail" @click="goToAddPersonnage">
          <i class="fas fa-plus-circle " style="color: #21294F;"></i> Personnage
        </button>
      </div>

      <div class="sequences-title-ecran-travail">
        <h2>Les séquences :</h2>
      </div>

      <div class="sequence-navigation-container-ecran-travail">
        <!-- Navigation par numéros de séquences -->
        <div v-if="currentEpisode && !isLoading" class="sequence-navigation-ecran-travail">
          <span
            v-for="(sequence, index) in sequences"
            :key="sequence.idSequence"
            class="sequence-number-ecran-travail"
            :class="{ 'active-ecran-travail': sequence.idSequence === currentSequence?.idSequence, 'new-sequence-ecran-travail': sequence.idSequence === newlyCreatedSequenceId }"
            @click="selectSequence(sequence.idSequence)"
          >
            <span v-if="index > 0"></span>Seq
            {{ sequence.ordre }}
            <span v-if="sequence.idSequence === newlyCreatedSequenceId" class="blinking-icon-ecran-travail">✨</span>
          </span>
        </div>
      </div>

      <!-- Contenu de la séquence -->
       <main class="sequence-page-ecran-travail" v-if="currentSequence && !isLoading">
        <h2 class="sequence-title-ecran-travail">
          Séquence 0{{ currentSequence.ordre }} : {{ currentSequence.titre }}
          <span v-if="userPermissions.canCreateSequence" class="icon-edit-ecran-travail" @click="startEditSequence(currentSequence)">
            <i class="fas fa-pen" style="color: #17a2b8;"></i>
          </span>
          <span v-if="userPermissions.canCreateSequence" class="icon-delete-ecran-travail" @click="deleteSequence(currentSequence.idSequence)">
            <i class="fas fa-trash " style="color: #dc3545;"></i>
          </span>
          <span class="comment-icon-ecran-travail" @click="toggleSequenceCommentSection">
            <h3><i class="fas fa-comments " style="color: #21294F;"></i>{{ sequenceCommentCount }}</h3>
          </span>
        </h2>

        <!-- Section commentaires séquence -->
        <div v-if="showSequenceCommentSection" class="comment-section-ecran-travail">
          <h4><i class="fas fa-comments icon-ecran-travail" style="color: #21294F;"></i>Commentaires sur la séquence</h4>
          <div class="add-comment-ecran-travail">
            <textarea v-model="newSequenceComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
            <button @click="addSequenceComment" class="add-comment-btn-ecran-travail"><i class="fas fa-plus-circle"></i>Ajouter</button>
          </div>
          <div class="comments-list-ecran-travail">
            <div v-for="comment in sequenceComments" :key="comment.id" class="comment-item-ecran-travail">
              <div class="comment-header-ecran-travail">
                <span class="comment-author-ecran-travail">{{ comment.utilisateurNom }}</span>
                <span class="comment-date-ecran-travail">{{ formatDate(comment.creeLe) }}</span>
              </div>
              <div class="comment-content-ecran-travail">
                {{ comment.contenu }}
              </div>
              <div class="comment-actions-ecran-travail" v-if="comment.utilisateurId === user.id">
                <button @click="deleteSequenceComment(comment.id)" class="delete-comment-btn-ecran-travail"><i class="fas fa-trash icon-ecran-travail"></i>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
        
        <p class="sequence-info-ecran-travail"><strong>Synopsis:</strong> {{ currentSequence.synopsis || 'Aucun synopsis' }}</p>
        <p class="sequence-info-ecran-travail"><strong>Statut:</strong> {{ currentSequence.statutNom || 'Non défini' }}</p>

        <!-- Section scènes -->
        <div class="scenes-section-ecran-travail">
          <div class="section-header-ecran-travail">
            <h3>Scènes</h3>
            <button class="add-scene-btn-ecran-travail" @click="goToAddScene"><i class="fas fa-plus-circle " style="color: #21294F;"></i> Scène</button>
          </div>

          <!-- Liste des scènes -->
          <div class="scenes-list-ecran-travail">
            
            <div v-for="scene in currentSequence.scenes" :key="scene.idScene" class="scene-card-ecran-travail">
            <h3 class="scene-title-ecran-travail">
              Scène {{ scene.ordre }}: {{ scene.titre }}
              <span v-if="userPermissions.canCreateScene" class="icon-edit-ecran-travail" @click="startEditScene(scene)">
                <i class="fas fa-pen" style="color: #17a2b8;"></i>
              </span>
              <span v-if="userPermissions.canCreateScene" class="icon-delete-ecran-travail" @click="deleteScene(scene.idScene)">
                <i class="fas fa-trash " style="color: #dc3545;"></i>
              </span>
              <span class="comment-icon-ecran-travail" @click="toggleSceneCommentSection(scene)">
                <i class="fas fa-comments" style="color: #21294F;"></i> {{ getSceneCommentCount(scene.idScene) }}
              </span>

               <!-- Dans chaque scene-card, remplacer le bouton existant par : -->
                <div class="scene-actions-ecran-travail">
                  <button 
                    v-if="userPermissions.canCreateScene" 
                    class="export-dialogues-btn-ecran-travail pdf-btn-ecran-travail" 
                    @click="exportSceneDialoguesPDF(scene)"
                    title="Exporter les dialogues de cette scène en PDF"
                  >
                    <i class="fas fa-file-pdf"></i> Exporter Dialogues PDF
                  </button>
                </div>
            </h3>

              <!-- Section Tournage -->
            <SceneTournageSection 
              :scene="scene"
              :projet-id="projetId"
              :user-permissions="userPermissions"
              @tournage-updated="onTournageUpdated"
            />

              <!-- Section commentaires scène -->
              <div v-if="showSceneCommentModal && selectedScene?.idScene === scene.idScene" class="comment-section-ecran-travail">
                <h4>Commentaires sur la scène</h4>
                <div class="add-comment-ecran-travail">
                  <textarea v-model="newSceneComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
                  <button @click="addSceneComment" class="add-comment-btn-ecran-travail"><i class="fas fa-plus-circle"></i>Ajouter</button>
                </div>

                <div class="comments-list-ecran-travail">
                  <div v-for="comment in sceneComments" :key="comment.id" class="comment-item-ecran-travail">
                    <div class="comment-header-ecran-travail">
                      <span class="comment-author-ecran-travail">{{ comment.utilisateurNom }}</span>
                      <span class="comment-date-ecran-travail">{{ formatDate(comment.creeLe) }}</span>
                    </div>
                    <div class="comment-content-ecran-travail">
                      {{ comment.contenu }}
                    </div>
                    <div class="comment-actions-ecran-travail" v-if="comment.utilisateurId === user.id">
                      <button @click="deleteSceneComment(comment.id)" class="delete-comment-btn-ecran-travail"><i class="fas fa-trash icon-ecran-travail"></i>Supprimer</button>
                    </div>
                  </div>
                </div>
                <button @click="closeSceneCommentModal" class="close-comments-btn-ecran-travail">Fermer</button>
              </div>

              <p class="scene-info-ecran-travail"><strong>Synopsis:</strong> {{ scene.synopsis || 'Aucun synopsis' }}</p>
              <p class="scene-info-ecran-travail"><strong>Statut:</strong> {{ scene.statutNom || 'Non défini' }}</p>

              <div class="section-header-ecran-travail">
                <h4><i class="fas fa-map-pin" style="color: #dc3545;"></i>Lieux et Plateaux:</h4>
                <button v-if="userPermissions.canCreateLieu" class="add-lieu-btn-ecran-travail" @click="openAddLieuModal(scene)">
                  <i class="fas fa-plus-circle" style="color: #21294F;"></i>Lieu/Plateau
                </button>
              </div>

              <!-- Lieux et Plateaux -->
              <div class="lieux-plateaux-ecran-travail" v-if="scene.sceneLieus?.length">
                <ul class="lieux-list-ecran-travail">
                  <li v-for="sceneLieu in scene.sceneLieus" :key="sceneLieu.id" class="lieu-item-ecran-travail">
                    <strong>{{ sceneLieu.lieuNom || 'Lieu inconnu' }}</strong>
                    <span v-if="sceneLieu.plateauNom"> - <strong>Plateau:</strong> {{ sceneLieu.plateauNom }}</span>
                    <span v-if="userPermissions.canCreateLieu" class="icon-delete-ecran-travail" @click="deleteSceneLieu(sceneLieu.id)">
                      <i class="fas fa-trash" style="color: #dc3545;"></i>
                    </span>
                    <p v-if="sceneLieu.descriptionUtilisation" class="lieu-description-ecran-travail">Description: {{ sceneLieu.descriptionUtilisation }}</p>
                  </li>
                </ul>
              </div>
              <p v-else class="no-lieux-ecran-travail">Aucun lieu ou plateau associé.</p>

              <div class="section-header-ecran-travail">
                    <h4><i class="fas fa-comments" ></i>Dialogues:</h4> 
                </div>
              <!-- Dialogues -->
            

              <!-- Modifier la section des dialogues dans le template -->
              <div class="dialogues-ecran-travail" v-if="scene.dialogues?.length">
                <ul class="dialogues-list-ecran-travail">
                  <li v-for="dialogue in scene.dialogues" :key="dialogue.id" class="dialogue-item-ecran-travail">
                    <div 
                      class="dialogue-text-ecran-travail" 
                      @mouseup="openHighlightModal(dialogue, $event)"
                      :data-dialogue-id="dialogue.id"
                    >
                      <strong>{{ dialogue.personnageNom || 'Narrateur' }}:</strong> 
                      <span class="dialogue-content-ecran-travail">{{ dialogue.texte }}</span>
                      
                      <!-- Afficher les surlignages -->
                      <template v-if="dialogueHighlights[dialogue.id]">
                        <span 
                          v-for="highlight in dialogueHighlights[dialogue.id]" 
                          :key="highlight.id"
                          class="text-highlight-ecran-travail"
                          :style="{ backgroundColor: highlight.couleur.valeurHex }"
                          :title="`Surligné par ${highlight.utilisateurNom}`"
                        >
                          {{ highlight.texteSurligne }}
                        </span>
                      </template>
                    </div>
                    
                    <span v-if="dialogue.observation" class="dialogue-observation-ecran-travail">
                      {{ dialogue.observation }}
                    </span>
                    
                    <div class="dialogue-actions-ecran-travail">
                      <span v-if="userPermissions.canCreateDialogue" class="icon-edit-ecran-travail" @click="startEditDialogue(dialogue)">
                        <i class="fas fa-pen" style="color: #17a2b8;"></i>
                      </span>
                      <span v-if="userPermissions.canCreateDialogue" class="icon-delete-ecran-travail" @click="deleteDialogue(dialogue.id)">
                        <i class="fas fa-trash" style="color: #dc3545;"></i>
                      </span>
                      <span class="comment-icon-ecran-travail" @click="toggleDialogueCommentSection(dialogue)">
                        <i class="fas fa-comment" style="color: #21294F;"></i> 
                        {{ getDialogueCommentCount(dialogue.id) }}
                      </span>
                      <span v-if="userPermissions.canCreateDialogue" class="highlight-icon-ecran-travail" @click="openHighlightModal(dialogue, $event)" title="Surligner">
                        <i class="fas fa-highlighter" style="color: #ffeb3b;"></i>
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div class="section-header-ecran-travail">
                  <h4><i class="fas fa-comments" ></i></h4> 
                 <button v-if="userPermissions.canCreateDialogue" class="add-dialogue-btn-ecran-travail" @click="goToAddDialogue(scene.idScene)">
                    <i class="fas fa-plus-circle" style="color: #21294F;"></i> Dialogue
                  </button>
              </div>                    
            
            </div>
          </div>
        </div>
      </main>
     <div v-else-if="!isLoading" class="no-data-ecran-travail">
      <p>Aucune séquence disponible pour cet épisode.</p>
    </div>

      <!-- Ajouter cette modale après les autres modales -->
      <div v-if="showHighlightModal" class="modal-overlay-ecran-travail" @click="closeHighlightModal">
        <div class="modal-content-ecran-travail" @click.stop>
          <div class="modal-header-ecran-travail">
            <h3>
              <i class="fas fa-highlighter"></i>
              Surligner le texte
            </h3>
            <button @click="closeHighlightModal" class="close-btn-ecran-travail">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="highlight-preview-ecran-travail">
            <p><strong>Texte sélectionné :</strong></p>
            <div class="selected-text-preview-ecran-travail">{{ selectedText }}</div>
          </div>
          
          <div class="color-selection-ecran-travail">
            <h4>Choisir une couleur :</h4>
            <div class="color-palette-ecran-travail">
              <div 
                v-for="color in availableColors" 
                :key="color.id"
                class="color-option-ecran-travail"
                :class="{ 'selected-ecran-travail': selectedColor?.id === color.id }"
                :style="{ backgroundColor: color.valeurHex }"
                @click="selectedColor = color"
                :title="color.nom"
              ></div>
            </div>
          </div>
          
          <div v-if="dialogueHighlights[selectedDialogueForHighlight?.id]?.length" class="existing-highlights-ecran-travail">
            <h4>Surlignages existants :</h4>
            <div 
              v-for="highlight in dialogueHighlights[selectedDialogueForHighlight?.id]" 
              :key="highlight.id"
              class="highlight-item-ecran-travail"
            >
              <span 
                class="highlight-sample-ecran-travail"
                :style="{ backgroundColor: highlight.couleur.valeurHex }"
              ></span>
              <span class="highlight-text-ecran-travail">{{ highlight.texteSurligne }}</span>
              <span class="highlight-info-ecran-travail">par {{ highlight.utilisateurNom }}</span>
              <button 
                v-if="highlight.utilisateurId === user.id"
                @click="removeHighlight(highlight.id)"
                class="delete-highlight-btn-ecran-travail"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="modal-actions-ecran-travail">
            <button type="button" @click="closeHighlightModal" class="cancel-btn-ecran-travail">
              Annuler
            </button>
            <button 
              type="button" 
              @click="applyHighlight" 
              class="save-btn-ecran-travail"
              :disabled="!selectedColor"
            >
              <i class="fas fa-highlighter"></i> Appliquer
            </button>
          </div>
        </div>
      </div>

      <!-- Modale pour éditer l'épisode -->
      <div v-if="showEditEpisodeModal" class="modal-overlay-ecran-travail">
        <div class="modal-content-ecran-travail">
          <div class="modal-header-ecran-travail">
            <h3>
              <i class="fas fa-edit"></i>
              Modifier l'épisode
            </h3>
            <button @click="closeEditEpisodeModal" class="close-btn-ecran-travail"><i class="fas fa-times"></i></button>
          </div>
          <form @submit.prevent="saveEditedEpisode" class="edit-form-ecran-travail">
            <div class="form-group-ecran-travail">
              <label for="edit-episode-titre">Titre</label>
              <input
                type="text"
                id="edit-episode-titre"
                v-model="editingEpisode.titre"
                required
                class="form-input-ecran-travail"
              />
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-episode-synopsis">Synopsis</label>
              <textarea
                id="edit-episode-synopsis"
                v-model="editingEpisode.synopsis"
                rows="4"
                class="form-textarea-ecran-travail"
              ></textarea>
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-episode-ordre">Ordre</label>
              <input
                type="number"
                id="edit-episode-ordre"
                v-model="editingEpisode.ordre"
                required
                class="form-input-ecran-travail"
              />
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-episode-statut">Statut</label>
              <select
                id="edit-episode-statut"
                v-model="editingEpisode.statutId"
                required
                class="form-select-ecran-travail"
              >
                <option value="">Sélectionnez un statut</option>
                <option v-for="statut in statutsEpisode" :key="statut.idStatutEpisode" :value="statut.idStatutEpisode">
                  {{ statut.nomStatutsEpisode }}
                </option>
              </select>
            </div>
            <div v-if="editEpisodeError" class="error-message-ecran-travail">
              {{ editEpisodeError }}
            </div>
            <div class="modal-actions-ecran-travail">
              <button type="button" @click="closeEditEpisodeModal" class="cancel-btn-ecran-travail">Annuler</button>
              <button type="submit" class="save-btn-ecran-travail" :disabled="editEpisodeLoading">
                {{ editEpisodeLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modale pour éditer la séquence -->
      <div v-if="showEditSequenceModal" class="modal-overlay-ecran-travail">
        <div class="modal-content-ecran-travail">
          <div class="modal-header-ecran-travail">
            <h3>
              <i class="fas fa-edit"></i>
              Modifier la séquence
            </h3>
            <button @click="closeEditSequenceModal" class="close-btn-ecran-travail"><i class="fas fa-times"></i></button>
          </div>
          <form @submit.prevent="saveEditedSequence" class="edit-form-ecran-travail">
            <div class="form-group-ecran-travail">
              <label for="edit-sequence-titre">Titre</label>
              <input
                type="text"
                id="edit-sequence-titre"
                v-model="editingSequence.titre"
                required
                class="form-input-ecran-travail"
              />
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-sequence-synopsis">Synopsis</label>
              <textarea
                id="edit-sequence-synopsis"
                v-model="editingSequence.synopsis"
                rows="4"
                class="form-textarea-ecran-travail"
              ></textarea>
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-sequence-ordre">Ordre</label>
              <input
                type="number"
                id="edit-sequence-ordre"
                v-model="editingSequence.ordre"
                required
                class="form-input-ecran-travail"
              />
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-sequence-statut">Statut</label>
              <select
                id="edit-sequence-statut"
                v-model="editingSequence.statutId"
                required
                class="form-select-ecran-travail"
              >
                <option value="">Sélectionnez un statut</option>
                <option v-for="statut in statutsSequence" :key="statut.id" :value="statut.id">
                  {{ statut.nomStatutsSequence }}
                </option>
              </select>
            </div>
            <div v-if="editSequenceError" class="error-message-ecran-travail">
              {{ editSequenceError }}
            </div>
            <div class="modal-actions-ecran-travail">
              <button type="button" @click="closeEditSequenceModal" class="cancel-btn-ecran-travail">Annuler</button>
              <button type="submit" class="save-btn-ecran-travail" :disabled="editSequenceLoading">
                {{ editSequenceLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modale pour éditer la scène -->
      <div v-if="showEditSceneModal" class="modal-overlay-ecran-travail">
        <div class="modal-content-ecran-travail">
          <div class="modal-header-ecran-travail">
            <h3>
              <i class="fas fa-edit"></i>
              Modifier la scène
            </h3>
            <button @click="closeEditSceneModal" class="close-btn-ecran-travail"><i class="fas fa-times"></i></button>
          </div>
          <form @submit.prevent="saveEditedScene" class="edit-form-ecran-travail">
            <div class="form-group-ecran-travail">
              <label for="edit-scene-titre">Titre</label>
              <input
                type="text"
                id="edit-scene-titre"
                v-model="editingScene.titre"
                required
                class="form-input-ecran-travail"
              />
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-scene-synopsis">Synopsis</label>
              <textarea
                id="edit-scene-synopsis"
                v-model="editingScene.synopsis"
                rows="4"
                class="form-textarea-ecran-travail"
              ></textarea>
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-scene-ordre">Ordre</label>
              <input
                type="number"
                id="edit-scene-ordre"
                v-model="editingScene.ordre"
                required
                class="form-input-ecran-travail"
              />
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-scene-statut">Statut</label>
              <select
                id="edit-scene-statut"
                v-model="editingScene.statutId"
                required
                class="form-select-ecran-travail"
              >
                <option value="">Sélectionnez un statut</option>
                <option v-for="statut in statutsScene" :key="statut.id" :value="statut.id">
                  {{ statut.nomStatutsScene }}
                </option>
              </select>
            </div>
            <div v-if="editSceneError" class="error-message-ecran-travail">
              {{ editSceneError }}
            </div>
            <div class="modal-actions-ecran-travail">
              <button type="button" @click="closeEditSceneModal" class="cancel-btn-ecran-travail">Annuler</button>
              <button type="submit" class="save-btn-ecran-travail" :disabled="editSceneLoading">
                {{ editSceneLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modale pour éditer le dialogue -->
      <div v-if="showEditDialogueModal" class="modal-overlay-ecran-travail">
        <div class="modal-content-ecran-travail">
          <div class="modal-header-ecran-travail">
            <h3>
              <i class="fas fa-edit"></i>
              Modifier le dialogue
            </h3>
            <button @click="closeEditDialogueModal" class="close-btn-ecran-travail"><i class="fas fa-times"></i></button>
          </div>
          <form @submit.prevent="saveEditedDialogue" class="edit-form-ecran-travail">
            <div class="form-group-ecran-travail">
              <label for="edit-dialogue-personnage">Personnage</label>
              <select
                id="edit-dialogue-personnage"
                v-model="editingDialogue.personnageId"
                required
                class="form-select-ecran-travail"
              >
                <option :value="null">Narration (sans personnage)</option>
                <option v-for="personnage in personnages" :key="personnage.id" :value="personnage.id">
                  {{ personnage.nom }} ({{ personnage.projetTitre }})
                </option>
              </select>
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-dialogue-texte">Texte</label>
              <textarea
                id="edit-dialogue-texte"
                v-model="editingDialogue.texte"
                rows="4"
                class="form-textarea-ecran-travail"
                required
              ></textarea>
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-dialogue-ordre">Ordre</label>
              <input
                type="number"
                id="edit-dialogue-ordre"
                v-model="editingDialogue.ordre"
                required
                class="form-input-ecran-travail"
                @blur="validateOrder"
              />
              <div v-if="suggestedOrder" class="suggestion-ecran-travail">Suggestion: {{ suggestedOrder }}</div>
              <div v-if="orderError" class="error-message-ecran-travail">{{ orderError }}</div>
            </div>
            <div class="form-group-ecran-travail">
              <label for="edit-dialogue-observation">Observation</label>
              <textarea
                id="edit-dialogue-observation"
                v-model="editingDialogue.observation"
                rows="3"
                class="form-textarea-ecran-travail"
                placeholder="Observation optionnelle"
              ></textarea>
            </div>
            <div v-if="editDialogueError" class="error-message-ecran-travail">
              {{ editDialogueError }}
            </div>
            <div class="modal-actions-ecran-travail">
              <button type="button" @click="closeEditDialogueModal" class="cancel-btn-ecran-travail">Annuler</button>
              <button type="submit" class="save-btn-ecran-travail" :disabled="editDialogueLoading">
                {{ editDialogueLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modale pour commentaires de dialogue -->
      <div v-if="showDialogueCommentModal" class="modal-overlay-ecran-travail">
        <div class="modal-content-ecran-travail">
          <div class="modal-header-ecran-travail">
            <h3>Commentaires du dialogue</h3>
            <button @click="closeDialogueCommentModal" class="close-btn-ecran-travail"><i class="fas fa-times"></i></button>
          </div>
          <div class="add-comment-ecran-travail">
            <textarea v-model="newDialogueComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
            <button @click="addDialogueComment" class="add-comment-btn-ecran-travail">Ajouter</button>
          </div>
          <div class="comments-list-ecran-travail">
            <div v-for="comment in dialogueComments" :key="comment.id" class="comment-item-ecran-travail">
              <div class="comment-header-ecran-travail">
                <span class="comment-author-ecran-travail">{{ comment.utilisateurNom }}</span>
                <span class="comment-date-ecran-travail">{{ formatDate(comment.creeLe) }}</span>
              </div>
              <div class="comment-content-ecran-travail">
                {{ comment.contenu }}
              </div>
              <div class="comment-actions-ecran-travail" v-if="comment.utilisateurId === user.id">
                <button @click="deleteDialogueComment(comment.id)" class="delete-comment-btn-ecran-travail">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modale pour ajouter un lieu/plateau -->
      <div v-if="showAddLieuModal" class="modal-overlay-ecran-travail" @click="closeAddLieuModal">
        <div class="modal-content-ecran-travail" @click.stop>
          <div class="modal-header-ecran-travail">
            <h3>Ajouter un Lieu/Plateau à la scène: {{ selectedSceneForLieu?.titre }}</h3>
            <button @click="closeAddLieuModal" class="close-btn-ecran-travail"><i class="fas fa-times"></i></button>
          </div>
          
          <form @submit.prevent="addSceneLieu" class="edit-form-ecran-travail">
            <div class="form-group-ecran-travail">
              <label for="lieu-select">Sélectionner un lieu existant</label>
              <select id="lieu-select" v-model="selectedLieuId" @change="loadAvailablePlateaux" class="form-select-ecran-travail" required>
                <option value="">Choisir un lieu</option>
                <option v-if="availableLieux.length === 0" disabled>Aucun lieu disponible pour ce projet</option>
                <option v-for="lieu in availableLieux" :key="lieu.id" :value="lieu.id">
                  {{ lieu.nomLieu }} ({{ lieu.typeLieu }})
                </option>
              </select>
            </div>
            
            <div class="form-group-ecran-travail" v-if="availablePlateaux.length > 0">
              <label for="plateau-select">Sélectionner un plateau existant (optionnel)</label>
              <select id="plateau-select" v-model="selectedPlateauId" class="form-select-ecran-travail">
                <option value="">Aucun plateau</option>
                <option v-for="plateau in availablePlateaux" :key="plateau.id" :value="plateau.id">
                  {{ plateau.nom }} ({{ plateau.typePlateau }})
                </option>
              </select>
            </div>
            
            <div class="form-group-ecran-travail">
              <label for="description-utilisation">Description d'utilisation</label>
              <textarea 
                id="description-utilisation" 
                v-model="descriptionUtilisation" 
                rows="3" 
                class="form-textarea-ecran-travail" 
                placeholder="Description de l'utilisation de ce lieu/plateau dans la scène..."
              ></textarea>
            </div>
            
            <div v-if="addLieuError" class="error-message-ecran-travail">
              {{ addLieuError }}
            </div>
            
            <div class="modal-actions-ecran-travail">
              <button type="button" @click="closeAddLieuModal" class="cancel-btn-ecran-travail">Annuler</button>
              <button type="submit" class="save-btn-ecran-travail" :disabled="addLieuLoading">
                {{ addLieuLoading ? 'Ajout en cours...' : 'Ajouter' }}
              </button>
            </div>
          </form>
          
          <!-- Liste des lieux déjà associés à cette scène -->
          <div class="associated-lieux-ecran-travail" v-if="sceneLieus.length > 0">
            <h4>Lieux déjà associés:</h4>
            <div v-for="sceneLieu in sceneLieus" :key="sceneLieu.id" class="scene-lieu-item-ecran-travail">
              <div class="scene-lieu-info-ecran-travail">
                <strong>{{ sceneLieu.lieuNom }}</strong>
                <span v-if="sceneLieu.plateauNom"> - Plateau: {{ sceneLieu.plateauNom }}</span>
                - {{ sceneLieu.descriptionUtilisation || 'Aucune description' }}
              </div>
              <button @click="removeLieuFromScene(sceneLieu.id)" class="delete-btn-ecran-travail" title="Supprimer">
                🗑️
              </button>
            </div>
          </div>
        </div>
        
         <!-- Modal d'édition du projet -->
    <div v-if="editingProject" class="edit-project-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Modifier le projet</h3>
          <button @click="cancelEdit" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="editError" class="error-message">
            {{ editError }}
          </div>
          
          <div class="form-group">
            <label>Titre:</label>
            <input v-model="editForm.titre" type="text" class="form-input">
          </div>
          
          <div class="form-group">
            <label>Synopsis:</label>
            <textarea v-model="editForm.synopsis" class="form-textarea" rows="4"></textarea>
          </div>
          
          <div class="form-group">
            <label>Genre:</label>
            <select v-model="editForm.genreId" class="form-select">
              <option value="">Sélectionnez un genre</option>
              <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                {{ genre.nomGenre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Statut:</label>
            <select v-model="editForm.statutId" class="form-select">
              <option value="">Sélectionnez un statut</option>
              <option v-for="statut in statuts" :key="statut.id" :value="statut.id">
                {{ statut.nomStatutsProjet }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Date de fin:</label>
            <input v-model="editForm.dateFin" type="date" class="form-input">
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelEdit" class="cancel-btn">Annuler</button>
          <button @click="submitEdit" :disabled="editLoading" class="save-btn">
            {{ editLoading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>

      </div>
    </div>
  </div>
</template>


<script setup>
import { useEcranTravailStore } from '../stores/ecranTravailStore';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import SceneTournageSection from './SceneTournageSection.vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

components: {
  SceneTournageSection
}

const route = useRoute();
const router = useRouter();
const store = useEcranTravailStore();

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
    canCreatePersonnage: false
});

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
const selectedScene = ref(null);
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

// Propriétés calculées
const episodes = computed(() => store.episodes);
const sequences = computed(() => store.sequences);

// onMounted(async () => {
//   const projetIdLocal = route.params.idProjet || '1';
//   projetId.value = projetIdLocal;
//   await store.fetchEpisodes(projetIdLocal);
//   if (store.currentSequence) {
//     await loadSequenceCommentCount();
//     await loadSceneCommentCounts();
//     await loadDialogueCommentCounts();
//     await loadAvailableLieux();
//   }
//   await Promise.all([
//     loadStatutsEpisode(),
//     loadStatutsSequence(),
//     loadStatutsScene()
//   ]);
//   await loadPersonnages();

//   const episodeId = route.query.episodeId;
//   const sequenceId = route.query.sequenceId;

//   if (episodeId) {
//     await store.selectEpisodeById(episodeId);
//   }

//   if (sequenceId) {
//     await store.selectSequenceById(sequenceId);
//   }
// });

// Dans la section onMounted, charger les couleurs AVANT d'essayer de les utiliser
onMounted(async () => {
  const projetIdLocal = route.params.idProjet || '1';
  projetId.value = projetIdLocal;
  
  // Charger les couleurs disponibles en premier
  await loadAvailableColors();
  
  await store.fetchEpisodes(projetIdLocal);
  if (store.currentSequence) {
    await loadSequenceCommentCount();
    await loadSceneCommentCounts();
    await loadDialogueCommentCounts();
    await loadAvailableLieux();
  }
  await Promise.all([
    loadStatutsEpisode(),
    loadStatutsSequence(),
    loadStatutsScene()
  ]);
  await loadPersonnages();

  const episodeId = route.query.episodeId;
  const sequenceId = route.query.sequenceId;

  if (episodeId) {
    await store.selectEpisodeById(episodeId);
  }

  if (sequenceId) {
    await store.selectSequenceById(sequenceId);
  }
});

const checkUserPermissions = async (episodeId) => {
    if (!user.value) return;
    
    try {
        const response = await axios.get(`/api/episodes/${episodeId}/permissions`, {
            headers: {
                'X-User-Id': user.value.id
            }
        });
        
        userPermissions.value = response.data;
        
        // Vérification supplémentaire d'accès
        const accessResponse = await axios.get(`/api/episodes/${episodeId}/access-check`, {
            headers: {
                'X-User-Id': user.value.id
            }
        });
        
        // Si l'utilisateur n'a pas accès, désactiver toutes les permissions
        if (!accessResponse.data) {
            Object.keys(userPermissions.value).forEach(key => {
                userPermissions.value[key] = false;
            });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des permissions:', error);
        // Par défaut, tout à false pour la sécurité
        Object.keys(userPermissions.value).forEach(key => {
            userPermissions.value[key] = false;
        });
    }
};

watch(() => store.currentEpisode, async (newEpisode) => {
    if (newEpisode) {
        await checkUserPermissions(newEpisode.idEpisode);
        
        // Afficher les noms du réalisateur et scénariste
        if (newEpisode.realisateur) {
            console.log('Réalisateur:', newEpisode.realisateur.nom);
        }
        if (newEpisode.scenariste) {
            console.log('Scénariste:', newEpisode.scenariste.nom);
        }
    }
});

const loadPersonnages = async () => {
  try {
    const response = await axios.get('/api/personnages');
    personnages.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des personnages:', error);
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
      // Recharger les surlignages
      await loadDialogueHighlights(selectedDialogueForHighlight.value.id);
      
      // Fermer la modale
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


onMounted(async () => {
  // Récupération correcte de l'ID du projet depuis les paramètres de route
  projetId.value = route.params.idProjet;
  
  if (!projetId.value) {
    console.error('ID du projet non trouvé dans les params de route !');
    
    // Tentative de récupération depuis l'URL actuelle
    const pathSegments = route.path.split('/');
    const projetIndex = pathSegments.indexOf('projet');
    if (projetIndex !== -1 && pathSegments[projetIndex + 1]) {
      projetId.value = pathSegments[projetIndex + 1];
    }
    
    if (!projetId.value) {
      console.error('ID du projet non trouvable dans l\'URL !');
      return;
    }
  }

  await store.fetchEpisodes(projetId.value);
  
  
  // Charger les données supplémentaires
  if (store.currentSequence) {
    await loadSequenceCommentCount();
    await loadSceneCommentCounts();
    await loadDialogueCommentCounts();
    await loadAvailableLieux();
  }
  
  await Promise.all([
    loadStatutsEpisode(),
    loadStatutsSequence(),
    loadStatutsScene()
  ]);
  
  await loadPersonnages();

  // Gestion de la navigation vers un épisode/spécifique
  const episodeId = route.query.episodeId;
  const sequenceId = route.query.sequenceId;

  if (episodeId) {
    await store.selectEpisodeById(episodeId);
  }

  if (sequenceId) {
    await store.selectSequenceById(sequenceId);
  }
});


// Watchers
watch(
  () => route.query.episodeId,
  async (newId) => {
    if (newId) {
      await store.selectEpisodeById(newId);
    }
  },
  { immediate: true }
);

watch(() => route.params.idProjet, async (newProjetId) => {
  if (newProjetId) {
    projetId.value = newProjetId;
    await loadAvailableLieux();
  }
});

watch(() => store.currentSequence, async (newSequence) => {
  if (newSequence) {
    await loadSequenceCommentCount();
    await loadSceneCommentCounts();
    await loadDialogueCommentCounts();
  }
});

// Watcher pour les changements de paramètres de route
watch(
  () => route.params.idProjet,
  async (newProjetId) => {
    if (newProjetId && newProjetId !== projetId.value) {
      projetId.value = newProjetId;
      await store.fetchEpisodes(projetId.value);
      await loadAvailableLieux();
    }
  },
  { immediate: true }
);

watch(
  () => route.query,
  async (newQuery) => {
    // Si un episodeId est passé dans les query params
    if (newQuery.episodeId && newQuery.episodeId !== store.currentEpisode?.idEpisode) {
      await store.selectEpisodeById(newQuery.episodeId);
    }
    
    // Si un sequenceId est passé dans les query params
    if (newQuery.sequenceId && newQuery.sequenceId !== store.currentSequence?.idSequence) {
      await store.selectSequenceById(newQuery.sequenceId);
    }
  },
  { immediate: true, deep: true }
);

// Watcher pour les changements de paramètres de route
watch(
  () => route.params.idProjet,
  async (newProjetId) => {
    if (newProjetId && newProjetId !== projetId.value) {
      projetId.value = newProjetId;
      await store.fetchEpisodes(projetId.value);
      await loadAvailableLieux();
    }
  },
  { immediate: true }
);


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
    // Priorité 1: ID du projet depuis les paramètres de route
    if (route.params.idProjet) {
      projetId.value = route.params.idProjet;
    }
    // Priorité 2: ID du projet depuis le store
    else if (store.projetId) {
      projetId.value = store.projetId;
    }
    // Priorité 3: ID du projet depuis l'épisode courant (si disponible)
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

// Charger les couleurs disponibles
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
  // S'assurer que les couleurs sont chargées
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
    
    // Charger les surlignages existants
    await loadDialogueHighlights(dialogue.id);
  } else {
    alert('Veuillez sélectionner du texte à surligner.');
  }
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

    // Recharger les épisodes - les ordres seront automatiquement corrigés
    await store.fetchEpisodes(projetId.value);
    
    // Sélectionner le premier épisode disponible
    if (store.episodes.length > 0) {
      await store.selectEpisodeById(store.episodes[0].idEpisode);
      router.push({
        path: route.path,
        query: { 
          ...route.query,
          episodeId: store.episodes[0].idEpisode 
        }
      });
    } else {
      // Rediriger vers la page du projet si aucun épisode
      router.push(`/projet/${projetId.value}`);
    }
    
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
      const sceneIndex = store.currentSequence.scenes.findIndex(s => s.idScene === editingScene.value.id);
      if (sceneIndex !== -1) {
        store.currentSequence.scenes[sceneIndex] = {
          ...store.currentSequence.scenes[sceneIndex],
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
  // Check doublon (exclure l'ordre actuel si édition)
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
    return;  // Bloque si ordre invalide
  }

  editDialogueLoading.value = true;
  editDialogueError.value = '';

  try {
    const updateData = {
      sceneId: editingDialogue.value.sceneId,  // Ajouté comme dans CreationDialogue
      personnageId: editingDialogue.value.personnageId,
      texte: editingDialogue.value.texte,
      observation: editingDialogue.value.observation || null,
      ordre: parseInt(editingDialogue.value.ordre)
    };

    const response = await axios.put(`/api/dialogues/${editingDialogue.value.id}`, updateData, {
      headers: {
        'X-User-Id': user.value.id  // Ajouté pour cohérence avec commentaires
      }
    });

    if (response.status === 200) {
      // Mise à jour locale optionnelle, mais recharge complet comme CreationDialogue
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
      closeEditDialogueModal();
      // Alert comme dans CreationDialogue
      alert('Dialogue modifié avec succès!');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du dialogue:', error);
    editDialogueError.value = error.response?.data?.message || 'Erreur lors de la mise à jour du dialogue';
    alert(editDialogueError.value);  // Aligné sur CreationDialogue
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

// Méthodes pour la navigation
const goToNextPage = () => store.goToNextPage();
const goToPrevPage = () => store.goToPrevPage();
const retryFetch = () => store.fetchEpisodes(projetId.value);

const selectEpisode = async (episodeId) => {
  try {
    await store.selectEpisodeById(episodeId);
    router.push({ query: { ...route.query, episodeId } });
  } catch (error) {
    console.error('Erreur lors de la sélection de l\'épisode:', error);
  }
};

// const selectSequence = async (sequenceId) => {
//   try {
//     await store.selectSequenceById(sequenceId);
//     router.push({ query: { ...route.query, sequenceId } });
//   } catch (error) {
//     console.error('Erreur lors de la sélection de la séquence:', error);
//   }
// };

const selectSequence = async (sequenceId) => {
  await store.selectSequenceById(sequenceId);
  // Si newlyCreatedSequenceId n'est pas défini, supprimez cette ligne ou ajoutez const newlyCreatedSequenceId = ref(null);
  newlyCreatedSequenceId.value = null;
};

// Méthodes pour l'ajout
const goToAddEpisode = async () => {
  // Utiliser la variable projetId qui est maintenant correctement initialisée
  if (!projetId.value) {
    console.error('ID du projet non trouvé !');
    
    // Tentative de récupération alternative
    const alternativeId = route.params.idProjet || route.query.projetId || store.projetId;
    if (alternativeId) {
      projetId.value = alternativeId;
    } else {
      alert('ID du projet manquant. Veuillez réessayer.');
      return;
    }
  }
  
  try {
    // Navigation directe vers la page de création d'épisode
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
  
  // Navigation vers la page d'ajout de séquence
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

const goToAddDialogue = (sceneId) => {
  router.push(`/scene/${sceneId}/add-dialogue-scene-ecran-travail`);
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
  // Priorité 1: ID du projet depuis les paramètres de route
  if (route.params.idProjet) {
    projetId.value = route.params.idProjet;
  }
  // Priorité 2: ID du projet depuis le store
  else if (store.projetId) {
    projetId.value = store.projetId;
  }
  // Priorité 3: ID du projet depuis l'épisode courant (si disponible)
  else if (store.currentEpisode?.idEpisode) {
    // On essaie de récupérer l'ID du projet depuis l'épisode
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

// Méthode de fallback si l'ID du projet n'est pas trouvé
const fallbackToProjectSelection = () => {
  if (confirm('Impossible de déterminer le projet actuel. Souhaitez-vous sélectionner un projet manuellement ?')) {
    // Rediriger vers une page de sélection de projet ou utiliser une modale
    router.push('/projets'); // Adaptez cette route selon votre application
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
  selectedScene.value = scene;
  showSceneCommentModal.value = true;
  await loadSceneComments(scene.idScene);
};

const closeSceneCommentModal = () => {
  showSceneCommentModal.value = false;
  selectedScene.value = null;
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
  // Recharger les données si nécessaire
  if (store.currentSequence) {
    store.fetchSequenceDetails(store.currentSequence.idSequence);
  }
};

const getSceneCommentCount = (sceneId) => {
  return sceneCommentCounts.value[sceneId] || 0;
};

const loadSceneCommentCounts = async () => {
  if (!store.currentSequence?.scenes) return;
  for (const scene of store.currentSequence.scenes) {
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
  if (!newSceneComment.value.trim() || !selectedScene.value) return;
  try {
    await axios.post('/api/scene-commentaires', {
      contenu: newSceneComment.value,
      sceneId: selectedScene.value.idScene
    }, {
      headers: {
        'X-User-Id': user.value.id
      }
    });
    newSceneComment.value = '';
    await loadSceneComments(selectedScene.value.idScene);
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
      await loadSceneComments(selectedScene.value.idScene);
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
  if (!store.currentSequence?.scenes) return;
  for (const scene of store.currentSequence.scenes) {
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
      // Recharger les séquences pour voir les nouveaux ordres
      await store.fetchSequences(store.currentEpisode.idEpisode);
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
    
    // Recharger les détails de la séquence pour voir les nouveaux ordres
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
      await axios.delete(`/api/dialogues/${dialogueId}`);
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
    } catch (error) {
      console.error('Erreur lors de la suppression du dialogue:', error);
      alert('Erreur lors de la suppression du dialogue');
    }
  }
};

const deleteSceneLieu = async (sceneLieuId) => {
  if (!userPermissions.value.canCreateLieu) {
    alert('Vous n\'êtes pas autorisé à supprimer des lieux/plateaux pour cette scène.');
    return;
  }
  
  if (confirm('Êtes-vous sûr de vouloir supprimer ce lieu/plateau ?')) {
    try {
      await axios.delete(`/api/scene-lieux/${sceneLieuId}`);
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu/plateau:', error);
      alert('Erreur lors de la suppression du lieu/plateau');
    }
  }
};

const goToCalendrierTournage = () => {
  router.push('/calendrier-tournage');
};

// Méthode utilitaire pour formater les dates
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// Propriétés calculées
const currentEpisode = computed(() => store.currentEpisode);
const currentSequence = computed(() => store.currentSequence);
const error = computed(() => store.error);
const isLoading = computed(() => store.isLoading);
const hasNext = computed(() => store.hasNext);
const hasPrev = computed(() => store.hasPrev);


// Méthodes d'export PDF avec design de facture
const exportScenesOnlyPDF = async () => {
  if (!currentSequence.value) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Couleurs de l'application
    const primaryColor = [33, 41, 79]; // #21294F
    const secondaryColor = [220, 53, 69]; // #dc3545
    const accentColor = [23, 162, 184]; // #17a2b8
    
    let yPosition = 20;
    
    // En-tête avec design de facture
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Logo/Titre à gauche
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${currentEpisode.value?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode.value?.ordre}: ${currentEpisode.value?.titre}`, 20, 25);
    
    // Informations à droite
    pdf.text(`Séquence ${currentSequence.value.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Scènes: ${currentSequence.value.scenes?.length || 0}`, 160, 29);
    
    // Ligne de séparation
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    yPosition = 60;
    
    // Titre principal
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.text(`LISTE DES SCÈNES - SÉQUENCE ${currentSequence.value.ordre}`, 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Séquence: ${currentSequence.value.titre}`, 20, yPosition);
    
    yPosition += 20;
    
    // Tableau des scènes
    currentSequence.value.scenes.forEach((scene, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
        
        // En-tête sur les nouvelles pages
        pdf.setFillColor(...primaryColor);
        pdf.rect(0, 0, 210, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`Suite - Scènes Séquence ${currentSequence.value.ordre}`, 20, 20);
        yPosition = 40;
      }
      
      // En-tête de scène
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition - 8, 170, 10, 'F');
      
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(11);
      pdf.text(`SCÈNE ${scene.ordre}: ${scene.titre}`, 22, yPosition);
      
      yPosition += 12;
      
      // Informations scène
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      
      // Synopsis
      const synopsisLines = pdf.splitTextToSize(scene.synopsis || 'Aucun synopsis', 160);
      pdf.text('Synopsis:', 22, yPosition);
      pdf.text(synopsisLines, 25, yPosition + 4);
      
      // Statut et lieux à droite
      pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 130, yPosition);
      
      const lieuxText = scene.sceneLieus?.length 
        ? scene.sceneLieus.map(sl => sl.lieuNom).join(', ')
        : 'Aucun lieu';
      const lieuxLines = pdf.splitTextToSize(`Lieux: ${lieuxText}`, 55);
      pdf.text(lieuxLines, 130, yPosition + 5);
      
      yPosition += Math.max(synopsisLines.length * 3.5, lieuxLines.length * 3.5, 15) + 15;
      
      // Ligne de séparation
      if (index < currentSequence.value.scenes.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition - 5, 190, yPosition - 5);
        yPosition += 5;
      }
    });
    
    // Pied de page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
      pdf.text(`Exporté le ${new Date().toLocaleDateString()}`, 105, 293, { align: 'center' });
    }
    
    pdf.save(`scenes-sequence-${currentSequence.value.ordre}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des scènes:', error);
    alert('Erreur lors de l\'export PDF');
  }
};

const exportSceneDialoguesPDF = async (scene) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // En-tête
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${currentEpisode.value?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode.value?.ordre} - Séquence ${currentSequence.value?.ordre}`, 20, 25);
    
    pdf.text(`Scène ${scene.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Dialogues: ${scene.dialogues?.length || 0}`, 160, 29);
    
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    let yPosition = 60;
    
    // Titre
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.text(`DIALOGUES - SCÈNE ${scene.ordre}`, 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Scène: ${scene.titre}`, 20, yPosition);
    
    yPosition += 15;
    
    // Dialogues
    if (scene.dialogues?.length) {
      scene.dialogues.forEach((dialogue, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Personnage avec fond
        pdf.setFillColor(245, 245, 245);
        pdf.rect(20, yPosition - 5, 170, 8, 'F');
        
        pdf.setFontSize(11);
        pdf.setTextColor(...primaryColor);
        pdf.text(`${dialogue.personnageNom || 'NARRATEUR'}:`, 22, yPosition);
        
        yPosition += 10;
        
        // Texte du dialogue
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        const dialogueLines = pdf.splitTextToSize(dialogue.texte, 165);
        pdf.text(dialogueLines, 25, yPosition);
        yPosition += (dialogueLines.length * 4.5) + 5;
        
        // Observation
        if (dialogue.observation) {
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Note: ${dialogue.observation}`, 25, yPosition);
          yPosition += 8;
        }
        
        yPosition += 8;
        
        // Ligne de séparation
        if (index < scene.dialogues.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(20, yPosition - 3, 190, yPosition - 3);
          yPosition += 5;
        }
      });
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Aucun dialogue dans cette scène', 20, yPosition);
    }
    
    // Pied de page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    pdf.save(`dialogues-scene-${scene.ordre}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des dialogues:', error);
    alert('Erreur lors de l\'export PDF');
  }
};

const exportSequenceDialoguesPDF = async () => {
  if (!currentSequence.value) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // En-tête
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${currentEpisode.value?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode.value?.ordre}: ${currentEpisode.value?.titre}`, 20, 25);
    
    pdf.text(`Séquence ${currentSequence.value.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Scènes: ${currentSequence.value.scenes?.length || 0}`, 160, 29);
    
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    let yPosition = 60;
    
    // Titre
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.text(`DIALOGUES COMPLETS - SÉQUENCE ${currentSequence.value.ordre}`, 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Séquence: ${currentSequence.value.titre}`, 20, yPosition);
    
    yPosition += 20;
    
    // Parcourir toutes les scènes
    currentSequence.value.scenes.forEach(scene => {
      if (scene.dialogues?.length) {
        // Titre de la scène
        if (yPosition > 230) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, yPosition - 5, 170, 8, 'F');
        
        pdf.setFontSize(14);
        pdf.setTextColor(...primaryColor);
        pdf.text(`SCÈNE ${scene.ordre}: ${scene.titre}`, 22, yPosition);
        yPosition += 15;
        
        // Dialogues de la scène
        scene.dialogues.forEach((dialogue, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Personnage
          pdf.setFontSize(11);
          pdf.setTextColor(23, 162, 184);
          pdf.text(`${dialogue.personnageNom || 'NARRATEUR'}:`, 25, yPosition);
          
          yPosition += 7;
          
          // Texte
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          const dialogueLines = pdf.splitTextToSize(dialogue.texte, 160);
          pdf.text(dialogueLines, 30, yPosition);
          yPosition += (dialogueLines.length * 4.5) + 8;
          
          // Ligne de séparation entre dialogues
          if (index < scene.dialogues.length - 1) {
            pdf.setDrawColor(220, 220, 220);
            pdf.line(25, yPosition - 3, 185, yPosition - 3);
            yPosition += 5;
          }
        });
        
        yPosition += 15;
        
        // Ligne de séparation entre scènes
        pdf.setDrawColor(180, 180, 180);
        pdf.line(20, yPosition - 5, 190, yPosition - 5);
        yPosition += 10;
      }
    });
    
    // Pied de page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    pdf.save(`dialogues-sequence-${currentSequence.value.ordre}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des dialogues de séquence:', error);
    alert('Erreur lors de l\'export PDF');
  }
};

const exportSequenceCompletePDF = async () => {
  if (!currentSequence.value) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // Page de garde
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 297, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text(`SÉQUENCE ${currentSequence.value.ordre}`, 105, 120, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(currentSequence.value.titre.toUpperCase(), 105, 140, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.text(`Statut: ${currentSequence.value.statutNom}`, 105, 160, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode.value?.ordre}: ${currentEpisode.value?.titre}`, 105, 180, { align: 'center' });
    pdf.text(`Projet: ${currentEpisode.value?.projetTitre || 'Série TV'}`, 105, 190, { align: 'center' });
    
    pdf.text(`Exporté le ${new Date().toLocaleDateString()}`, 105, 210, { align: 'center' });
    
    pdf.addPage();
    
    // En-tête pages suivantes
    const addHeader = (pageNum) => {
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(`SÉQUENCE ${currentSequence.value.ordre} - ${currentSequence.value.titre}`, 20, 15);
      pdf.text(`Page ${pageNum}`, 190, 15, { align: 'right' });
      
      pdf.setDrawColor(...secondaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, 35, 190, 35);
    };
    
    let yPosition = 45;
    let pageNum = 2;
    
    addHeader(pageNum);
    
    // Synopsis séquence
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(16);
    pdf.text('SYNOPSIS DE LA SÉQUENCE', 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const synopsisLines = pdf.splitTextToSize(currentSequence.value.synopsis || 'Aucun synopsis', 170);
    pdf.text(synopsisLines, 20, yPosition);
    yPosition += (synopsisLines.length * 4) + 25;
    
    // Scènes
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.text('DÉTAIL DES SCÈNES', 20, yPosition);
    yPosition += 20;
    
    currentSequence.value.scenes.forEach((scene, sceneIndex) => {
      if (yPosition > 250) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum);
        yPosition = 45;
      }
      
      // En-tête scène
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition - 5, 170, 8, 'F');
      
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryColor);
      pdf.text(`SCÈNE ${scene.ordre}: ${scene.titre}`, 22, yPosition);
      yPosition += 15;
      
      // Informations scène
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 22, yPosition);
      yPosition += 8;
      
      // Synopsis scène
      pdf.text('Synopsis:', 22, yPosition);
      const sceneSynopsisLines = pdf.splitTextToSize(scene.synopsis || 'Aucun synopsis', 160);
      pdf.text(sceneSynopsisLines, 25, yPosition + 4);
      yPosition += (sceneSynopsisLines.length * 3.5) + 10;
      
      // Lieux
      if (scene.sceneLieus?.length) {
        pdf.text('Lieux:', 22, yPosition);
        scene.sceneLieus.forEach((sceneLieu, lieuIndex) => {
          const lieuText = `• ${sceneLieu.lieuNom}${sceneLieu.plateauNom ? ` (Plateau: ${sceneLieu.plateauNom})` : ''}`;
          pdf.text(lieuText, 25, yPosition + 4 + (lieuIndex * 4));
        });
        yPosition += (scene.sceneLieus.length * 4) + 8;
      }
      
      // Dialogues (premiers seulement)
      if (scene.dialogues?.length) {
        pdf.text('Dialogues:', 22, yPosition);
        yPosition += 6;
        
        // Afficher seulement les 3 premiers dialogues pour l'aperçu
        scene.dialogues.slice(0, 3).forEach((dialogue, dialogueIndex) => {
          pdf.setFontSize(9);
          pdf.setTextColor(23, 162, 184);
          pdf.text(`${dialogue.personnageNom || 'NARRATEUR'}:`, 25, yPosition);
          yPosition += 4;
          
          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0);
          const previewText = dialogue.texte.length > 100 ? dialogue.texte.substring(0, 100) + '...' : dialogue.texte;
          const previewLines = pdf.splitTextToSize(previewText, 155);
          pdf.text(previewLines, 30, yPosition);
          yPosition += (previewLines.length * 3) + 6;
        });
        
        if (scene.dialogues.length > 3) {
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`... et ${scene.dialogues.length - 3} dialogue(s) supplémentaire(s)`, 25, yPosition);
          yPosition += 8;
        }
      }
      
      yPosition += 15;
      
      // Ligne de séparation entre scènes
      if (sceneIndex < currentSequence.value.scenes.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition - 5, 190, yPosition - 5);
        yPosition += 10;
      }
    });
    
    // Pied de page final
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Document complet - ${totalPages - 1} pages`, 105, 290, { align: 'center' });
    }
    
    pdf.save(`sequence-${currentSequence.value.ordre}-complete.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF complet de la séquence:', error);
    alert('Erreur lors de l\'export PDF');
  }
};

const exportEpisodeWithSequencePDF = async () => {
  if (!currentEpisode.value || !currentSequence.value) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // Page de garde
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 297, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text(`ÉPISODE ${currentEpisode.value.ordre}`, 105, 100, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(currentEpisode.value.titre.toUpperCase(), 105, 120, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(`Séquence ${currentSequence.value.ordre}`, 105, 140, { align: 'center' });
    pdf.text(currentSequence.value.titre, 105, 155, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Statut: ${currentEpisode.value.statutNom}`, 105, 175, { align: 'center' });
    
    // Équipe
    if (currentEpisode.value.realisateur || currentEpisode.value.scenariste) {
      pdf.text('ÉQUIPE:', 105, 195, { align: 'center' });
      let teamY = 205;
      
      if (currentEpisode.value.realisateur) {
        pdf.text(`Réalisateur: ${currentEpisode.value.realisateur.nom}`, 105, teamY, { align: 'center' });
        teamY += 8;
      }
      
      if (currentEpisode.value.scenariste) {
        pdf.text(`Scénariste: ${currentEpisode.value.scenariste.nom}`, 105, teamY, { align: 'center' });
        teamY += 8;
      }
    }
    
    pdf.text(`Exporté le ${new Date().toLocaleDateString()}`, 105, 230, { align: 'center' });
    
    pdf.addPage();
    
    let yPosition = 20;
    let pageNum = 2;
    
    // En-tête pages suivantes
    const addHeader = (pageNum) => {
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(`ÉPISODE ${currentEpisode.value.ordre} - ${currentEpisode.value.titre}`, 20, 15);
      pdf.text(`Page ${pageNum}`, 190, 15, { align: 'right' });
      
      pdf.setDrawColor(...secondaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, 35, 190, 35);
    };
    
    addHeader(pageNum);
    yPosition = 45;
    
    // Synopsis épisode
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(16);
    pdf.text('SYNOPSIS DE L\'ÉPISODE', 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const episodeSynopsisLines = pdf.splitTextToSize(currentEpisode.value.synopsis || 'Aucun synopsis', 170);
    pdf.text(episodeSynopsisLines, 20, yPosition);
    yPosition += (episodeSynopsisLines.length * 4) + 25;
    
    // Informations séquence
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.text('INFORMATIONS DE LA SÉQUENCE', 20, yPosition);
    
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Séquence ${currentSequence.value.ordre}: ${currentSequence.value.titre}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Statut: ${currentSequence.value.statutNom}`, 20, yPosition);
    yPosition += 8;
    
    const sequenceSynopsisLines = pdf.splitTextToSize(`Synopsis: ${currentSequence.value.synopsis || 'Aucun synopsis'}`, 170);
    pdf.text(sequenceSynopsisLines, 20, yPosition);
    yPosition += (sequenceSynopsisLines.length * 4) + 20;
    
    // Résumé des scènes
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryColor);
    pdf.text('RÉSUMÉ DES SCÈNES', 20, yPosition);
    yPosition += 15;
    
    currentSequence.value.scenes.forEach((scene, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum);
        yPosition = 45;
      }
      
      pdf.setFontSize(11);
      pdf.setTextColor(...primaryColor);
      pdf.text(`• Scène ${scene.ordre}: ${scene.titre}`, 25, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      
      // Synopsis court
      const shortSynopsis = scene.synopsis 
        ? (scene.synopsis.length > 120 ? scene.synopsis.substring(0, 120) + '...' : scene.synopsis)
        : 'Aucun synopsis';
      pdf.text(`  ${shortSynopsis}`, 28, yPosition);
      yPosition += 5;
      
      // Statut et lieux
      pdf.text(`  Statut: ${scene.statutNom || 'Non défini'}`, 28, yPosition);
      yPosition += 4;
      
      const lieuxCount = scene.sceneLieus?.length || 0;
      pdf.text(`  Lieux: ${lieuxCount}`, 28, yPosition);
      yPosition += 4;
      
      const dialoguesCount = scene.dialogues?.length || 0;
      pdf.text(`  Dialogues: ${dialoguesCount}`, 28, yPosition);
      yPosition += 8;
      
      // Ligne de séparation
      if (index < currentSequence.value.scenes.length - 1) {
        pdf.setDrawColor(220, 220, 220);
        pdf.line(25, yPosition - 2, 185, yPosition - 2);
        yPosition += 5;
      }
    });
    
    // Pied de page final
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Rapport Épisode ${currentEpisode.value.ordre} - Séquence ${currentSequence.value.ordre}`, 105, 290, { align: 'center' });
    }
    
    pdf.save(`episode-${currentEpisode.value.ordre}-sequence-${currentSequence.value.ordre}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF épisode + séquence:', error);
    alert('Erreur lors de l\'export PDF');
  }

  
};


</script>


