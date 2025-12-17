<template>
  <div class="app-wrapper-global">
    
    <!-- ==================== SIDEBAR GAUCHE (PROJET/ÉPISODE/SÉQUENCE/SCÈNE) ==================== -->
    <div class="left-sidebar">
      <!-- 1 - PROJET (Menu déroulant) -->
      <div class="sidebar-section">
        <div class="sidebar-header" @click="toggleProjectDropdown">
          <div class="sidebar-title">
            <i class="fas fa-project-diagram"></i>
            <h3>{{ store.projetTitle }}</h3>
          </div>
          <i class="fas" :class="projectDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        
        <div v-if="projectDropdownOpen" class="sidebar-content-dropdown">
          <!-- Synopsis du projet -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ store.projetSynopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut du projet -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span 
                class="status-badge" 
                :style="{ backgroundColor: store.statusColor }"
              >
                {{ store.projetStatus }}
              </span>
            </div>
          </div>
          
          <!-- Nombres d'épisodes et séquences -->
          <div class="info-section">
            <label class="info-label">Contenu</label>
            <div class="stats-container">
              <div class="stat-item">
                <i class="fas fa-film"></i>
                <span>{{ store.episodes.length }} épisode(s)</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-list-ol"></i>
                <span>{{ store.totalSequences }} séquence(s)</span>
              </div>
            </div>
          </div>
          
          <!-- Actions (Modifier/Supprimer) -->
          <div class="actions-section">
            <button 
              class="action-btn edit-btn"
              @click="startEditProject"
              title="Modifier le projet"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="confirmDeleteProject"
              title="Supprimer le projet"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <!-- 2 - ÉPISODE (Menu déroulant) - Visible uniquement si un épisode est sélectionné -->
      <div v-if="currentEpisode" class="sidebar-section">
        <div class="sidebar-header" @click="toggleEpisodeDropdown">
          <div class="sidebar-title">
            <i class="fas fa-tv"></i>
            <h3>Épisode {{ currentEpisode.ordre }}: {{ currentEpisode.titre }}</h3>
          </div>
          <i class="fas" :class="episodeDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        
        <div v-if="episodeDropdownOpen" class="sidebar-content-dropdown">
          <!-- Synopsis de l'épisode -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ currentEpisode.synopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut de l'épisode -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span class="status-badge">
                {{ currentEpisode.statutNom || 'Non défini' }}
              </span>
            </div>
          </div>
          
          <!-- Équipe de l'épisode -->
          <div v-if="currentEpisode.realisateur || currentEpisode.scenariste" class="info-section">
            <label class="info-label">Équipe</label>
            <div class="team-container">
              <div v-if="currentEpisode.realisateur" class="team-member">
                <i class="fas fa-video"></i>
                <span>Réalisateur: {{ currentEpisode.realisateur.nom }}</span>
              </div>
              <div v-if="currentEpisode.scenariste" class="team-member">
                <i class="fas fa-pen"></i>
                <span>Scénariste: {{ currentEpisode.scenariste.nom }}</span>
              </div>
            </div>
          </div>
          
          <!-- Actions (Modifier/Supprimer) -->
          <div v-if="userPermissions.canEditEpisode" class="actions-section">
            <button 
              class="action-btn edit-btn"
              @click="startEditEpisode"
              title="Modifier l'épisode"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="confirmDeleteEpisode"
              title="Supprimer l'épisode"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <!-- 3 - SÉQUENCE (Menu déroulant) - Visible uniquement si une séquence est sélectionnée -->
      <div v-if="currentSequence" class="sidebar-section">
        <div class="sidebar-header" @click="toggleSequenceDropdown">
          <div class="sidebar-title">
            <i class="fas fa-list-ol"></i>
            <h3>Séquence {{ currentSequence.ordre }}: {{ currentSequence.titre }}</h3>
          </div>
          <i class="fas" :class="sequenceDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        
        <div v-if="sequenceDropdownOpen" class="sidebar-content-dropdown">
          <!-- Synopsis de la séquence -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ currentSequence.synopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut de la séquence -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span class="status-badge">
                {{ currentSequence.statutNom || 'Non défini' }}
              </span>
            </div>
          </div>
          
          <!-- Commentaires -->
          <div class="info-section">
            <label class="info-label">Commentaires</label>
            <div class="comment-count">
              <i class="fas fa-comments"></i>
              <span>{{ sequenceCommentCount }} commentaire(s)</span>
              <button 
                class="view-comments-btn"
                @click="toggleSequenceCommentSection"
                title="Voir les commentaires"
              >
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          
          <!-- Actions (Modifier/Supprimer) -->
          <div v-if="userPermissions.canCreateSequence" class="actions-section">
            <button 
              class="action-btn edit-btn"
              @click="startEditSequence(currentSequence)"
              title="Modifier la séquence"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="deleteSequence(currentSequence.idSequence)"
              title="Supprimer la séquence"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <!-- 4 - SCÈNE (Menu déroulant) - Visible uniquement si une scène est sélectionnée -->
      <div v-if="selectedScene" class="sidebar-section">
        <div class="sidebar-header" @click="toggleSceneDropdown">
          <div class="sidebar-title">
            <i class="fas fa-film"></i>
            <h3>Scène {{ selectedScene.ordre }}: {{ selectedScene.titre }}</h3>
          </div>
          <i class="fas" :class="sceneDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        
        <div v-if="sceneDropdownOpen" class="sidebar-content-dropdown">
          <!-- Synopsis de la scène -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ selectedScene.synopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut de la scène -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span class="status-badge">
                {{ selectedScene.statutNom || 'Non défini' }}
              </span>
            </div>
          </div>
          
          <!-- Commentaires -->
          <div class="info-section">
            <label class="info-label">Commentaires</label>
            <div class="comment-count">
              <i class="fas fa-comments"></i>
              <span>{{ getSceneCommentCount(selectedScene.idScene) }} commentaire(s)</span>
            </div>
          </div>
          
          <!-- Actions (Modifier/Supprimer) -->
          <div v-if="userPermissions.canCreateScene" class="actions-section">
            <button 
              class="action-btn edit-btn"
              @click="startEditScene(selectedScene)"
              title="Modifier la scène"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="deleteScene(selectedScene.idScene)"
              title="Supprimer la scène"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <!-- Message si aucune scène sélectionnée -->
      <div v-else-if="currentSequence" class="sidebar-section">
        <div class="sidebar-header" @click="toggleSceneDropdown">
          <div class="sidebar-title">
            <i class="fas fa-film"></i>
            <h3>Scènes</h3>
          </div>
          <i class="fas" :class="sceneDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        
        <div v-if="sceneDropdownOpen" class="sidebar-content-dropdown">
          <p class="info-content">Sélectionnez une scène pour voir ses détails</p>
          <div class="scenes-list-mini">
            <div 
              v-for="scene in currentSequence.scenes" 
              :key="scene.idScene"
              class="scene-item-mini"
              @click="selectSceneForSidebar(scene)"
              :class="{ 'selected': selectedScene?.idScene === scene.idScene }"
            >
              <span>Scène {{ scene.ordre }}: {{ scene.titre }}</span>
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sidebar fixée à droite -->
    <div class="options-sidebar" :class="{ 'open': sidebarOpen }">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="fas" :class="sidebarOpen ? 'fa-chevron-right' : 'fa-plus-circle'"></i>
      </button>

      <div class="sidebar-content">
        <button class="nav-btn-ecran-travail" @click="goToCalendrierTournage">
          <i class="fas fa-calendar-alt"></i> Calendrier
        </button>

        <!-- Section Export dans la sidebar -->
        <div class="export-container">
          <div class="export-dropdown">
            <button class="export-main-btn">
              <i class="fas fa-file-export"></i> Exporter en PDF
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="export-dropdown-content">
              <button 
                v-if="currentSequence" 
                class="export-option" 
                @click="exportScenesOnlyPDF"
                title="Exporter les scènes en PDF"
              >
                <i class="fas fa-file-pdf"></i> Scènes PDF
              </button>

              <button 
                v-if="currentSequence" 
                class="export-option" 
                @click="exportSequenceDialoguesPDF"
                title="Exporter tous les dialogues de la séquence en PDF"
              >
                <i class="fas fa-file-pdf"></i> Dialogues PDF
              </button>

              <button 
                v-if="currentSequence" 
                class="export-option" 
                @click="exportSequenceCompletePDF"
                title="Exporter la séquence complète en PDF"
              >
                <i class="fas fa-file-pdf"></i> Séquence PDF
              </button>

              <button 
                v-if="currentEpisode" 
                class="export-option" 
                @click="exportEpisodeWithSequencePDF"
                title="Exporter l'épisode avec séquence en PDF"
              >
                <i class="fas fa-file-pdf"></i> Épisode PDF
              </button>
            </div>
          </div>
        </div>

        <div class="liens-ecran-travail">
          <button 
            v-if="episodes.length === 0 || userPermissions.canEditEpisode" 
            class="add-scene-btn-ecran-travail" 
            @click="goToAddEpisode"
          >
            <i class="fas fa-plus-circle" style="color: #21294F;"></i> Episode
          </button>     
          
          <button v-if="userPermissions.canCreateSequence" class="add-scene-btn-ecran-travail" @click="goToAddSequence">
            <i class="fas fa-plus-circle" style="color: #21294F;"></i> Séquence
          </button>
          
          <button v-if="userPermissions.canCreateLieu" class="add-scene-btn-ecran-travail" @click="goToAddLieu">
            <i class="fas fa-plus-circle" style="color: #21294F;"></i> Lieu
          </button>
          
          <button v-if="userPermissions.canCreatePlateau" class="add-scene-btn-ecran-travail" @click="goToAddPlateau">
            <i class="fas fa-plus-circle" style="color: #21294F;"></i> Plateau
          </button>
          
          <button v-if="userPermissions.canCreateComedien" class="add-scene-btn-ecran-travail" @click="goToAddComedien">
            <i class="fas fa-plus-circle" style="color: #21294F;"></i> Comedien
          </button>
          
          <button v-if="userPermissions.canCreatePersonnage" class="add-scene-btn-ecran-travail" @click="goToAddPersonnage">
            <i class="fas fa-plus-circle" style="color: #21294F;"></i> Personnage
          </button>
        </div>
      </div>
    </div>
    
    <!-- Contenu principal -->
    <div class="ecran-travail-ecran-travail">
      <!-- Header avec titre de l'épisode -->
      <header class="header-ecran-travail">
        <div class="navigation-ecran-travail">
          <!-- Groupe de DROITE : Précédent/Suivant + Calendrier -->
          <div class="navigation-right-section">
            <button class="nav-btn-ecran-travail" @click="goToPrevPage" :disabled="!hasPrev || isLoading">Précédent</button>
            <button class="nav-btn-ecran-travail" @click="goToNextPage" :disabled="!hasNext || isLoading">Suivant</button>
          </div>
        </div>

        <!-- Section Export dans la navbar -->
        <div class="export-container" v-if="currentSequence">
          <div class="export-dropdown">
            <button class="export-main-btn">
              <i class="fas fa-file-export"></i> Exporter en PDF
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="export-dropdown-content">
              <button 
                v-if="currentSequence" 
                class="export-option" 
                @click="exportScenesOnlyPDF"
                title="Exporter les scènes en PDF"
              >
                <i class="fas fa-file-pdf"></i> Scènes PDF
              </button>

              <button 
                v-if="currentSequence" 
                class="export-option" 
                @click="exportSequenceDialoguesPDF"
                title="Exporter tous les dialogues de la séquence en PDF"
              >
                <i class="fas fa-file-pdf"></i> Dialogues PDF
              </button>

              <button 
                v-if="currentSequence" 
                class="export-option" 
                @click="exportSequenceCompletePDF"
                title="Exporter la séquence complète en PDF"
              >
                <i class="fas fa-file-pdf"></i> Séquence PDF
              </button>

              <button 
                v-if="currentEpisode" 
                class="export-option" 
                @click="exportEpisodeWithSequencePDF"
                title="Exporter l'épisode avec séquence en PDF"
              >
                <i class="fas fa-file-pdf"></i> Épisode PDF
              </button>

              <!-- Sélecteur de comédien pour l'export -->
              <div class="comedien-selector-ecran-travail" v-if="comediens.length">
                <label for="comedien-select">Exporter les raccords pour :</label>
                <select id="comedien-select" v-model="selectedComedien" class="select-ecran-travail">
                  <option value="">Sélectionner un comédien</option>
                  <option v-for="comedien in comediens" :key="comedien.id" :value="comedien.id">
                    {{ comedien.nom }}
                  </option>
                </select>
                
                <button 
                  @click="exportRaccordsByComedien(selectedComedien)" 
                  :disabled="!selectedComedien"
                  class="export-btn-ecran-travail"
                >
                  <i class="fas fa-file-pdf"></i> Export Raccords Comédien
                </button>
              </div>
            </div>
          </div>
        </div>

        <h2 class="episode-title-ecran-travail"> Épisode {{ currentEpisode?.ordre }} : </h2><br>     

        <div class="title-episode-ecran-travail">
          <label> {{ currentEpisode?.titre || 'Chargement...' }} </label><br>
        </div>
        
        <div class="syno-episode-ecran-travail">
          <label><strong>Statut :</strong> {{ currentEpisode?.statutNom || 'Chargement...' }} </label>
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
          <span class="comment-icon-ecran-travail" @click="toggleSequenceCommentSection">
            <h3><i class="fas fa-comments " style="color: #21294F;"></i>{{ sequenceCommentCount }}</h3>
          </span>
        </h2>
        
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
                <span class="comment-icon-ecran-travail" @click="toggleSceneCommentSection(scene)">
                  <i class="fas fa-comments" style="color: #21294F;"></i> {{ getSceneCommentCount(scene.idScene) }}
                </span>

                <button 
                  class="export-option" 
                  @click="exportRaccordsProjetPDF"
                  title="Exporter les raccords du projet en PDF"
                >
                  <i class="fas fa-file-pdf"></i> Raccords Projet PDF
                </button>

                <!-- Dans la carte de scène -->
                <button 
                  @click="exportRaccordsByScene(scene.idScene)" 
                  class="export-scene-raccords-btn-ecran-travail"
                  title="Exporter les raccords et images de cette scène en PDF"
                >
                  <i class="fas fa-file-pdf"></i> Raccords avec Images
                </button>

                <div class="scene-actions-ecran-travail">
                  <button 
                    class="export-dialogues-btn-ecran-travail pdf-btn-ecran-travail" 
                    @click="exportSceneDialoguesPDF(scene)"
                    title="Exporter les dialogues de cette scène en PDF"
                  >
                    <i class="fas fa-file-pdf"></i> Exporter Dialogues PDF
                  </button>

                  <!-- Bouton d'exportation PDF pour cette scène spécifique -->
                  <button 
                    class="export-scene-btn-ecran-travail" 
                    @click="exportScenePDF(scene)"
                    title="Exporter cette scène en PDF"
                  >
                    <i class="fas fa-file-pdf"></i> Exporter Scène PDF
                  </button>

                  <RaccordsPhotosComponent 
                    :scene-id="scene.idScene"
                    :scene-info="scene"
                    @raccords-updated="onRaccordsUpdated"
                  />

                  <RaccordSceneComponent 
                    :projet-id="projetId"
                    :episode-id="currentEpisode?.idEpisode"
                    :sequence-id="currentSequence?.idSequence"
                    :scene-source-id="scene.idScene"  
                    @raccord-created="onRaccordCreated"
                  />

                  <button 
                    class="export-btn-ecran-travail email-btn"
                    @click="openEmailModal"
                    title="Envoyer un PDF par email"
                  >
                    <i class="fas fa-paper-plane"></i> Envoyer par Email
                  </button>
                </div>
              </h3>

              <!-- Section Tournage -->
              <SceneTournageSection 
                :scene="scene"
                :projet-id="projetId"
                :user-permissions="userPermissions"
                @tournage-updated="onTournageUpdated"
                @replanification-appliquee="onReplanificationDansScene"
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

              <p class="scene-info-ecran-travail"><strong>Statut:</strong> {{ scene.statutNom || 'Non défini' }}</p>
                        

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

                  <button 
      v-if="userPermissions.canCreateDialogue"
      class="add-dialogue-btn-ecran-travail"
      @click="startAddDialogue(scene)"
      title="Ajouter un dialogue à cette scène"
    >
      <i class="fas fa-comment-medical"></i> Ajouter un dialogue
    </button>

              <div class="add-dialogue-direct-ecran-travail" v-if="showAddDialogueSection && selectedSceneForDialogue?.idScene === scene.idScene">
                <div class="dialogue-creation-form-ecran-travail">
                  <h4><i class="fas fa-plus-circle"></i> Ajouter un dialogue</h4>
                  
                  <div class="form-group-creation-ecran-travail">
                    <label>Personnage</label>
                    <select v-model="newDialogueData.personnageId" class="form-select-ecran-travail">
                      <option :value="null">Narration (sans personnage)</option>
                      <option 
                        v-for="personnage in personnages" 
                        :key="personnage.id" 
                        :value="personnage.id"
                      >
                        {{ personnage.nom }}
                      </option>
                    </select>
                    <small class="text-muted" v-if="personnages.length === 0">
                      Aucun personnage créé pour ce projet. 
                      <a href="#" @click.prevent="goToAddPersonnage" style="color: #21294F;">
                        Créer un premier personnage
                      </a>
                    </small>
                  </div>
                  
                  <div class="form-group-creation-ecran-travail">
                    <label>Texte du dialogue *</label>
                    <textarea 
                      v-model="newDialogueData.texte" 
                      rows="3" 
                      class="form-textarea-ecran-travail"
                      placeholder="Entrez le texte du dialogue..."
                      required
                    ></textarea>
                  </div>
                  
                  <div class="form-group-creation-ecran-travail">
                    <label>Observation</label>
                    <textarea 
                      v-model="newDialogueData.observation" 
                      rows="2" 
                      class="form-textarea-ecran-travail"
                      placeholder="Notes ou observations (optionnel)"
                    ></textarea>
                  </div>
                  
                  <div class="dialogue-creation-actions-ecran-travail">
                    <button 
                      @click="createDialogueDirect(scene.idScene)" 
                      class="save-btn-ecran-travail"
                      :disabled="!newDialogueData.texte.trim()"
                    >
                      <i class="fas fa-save"></i> Ajouter le dialogue
                    </button>
                    <button 
                      @click="cancelAddDialogue" 
                      class="cancel-btn-ecran-travail"
                    >
                      <i class="fas fa-times"></i> Annuler
                    </button>
                  </div>
                </div>
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
import ModalAddLieu from './ModalAddLieu.vue'

import jsPDF from 'jspdf';

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
  }
})

const route = useRoute();
const router = useRouter();
const store = useEcranTravailStore();

const comediens = ref([]);
const selectedComedien = ref(null);

// État de la sidebar droite
const sidebarOpen = ref(false);

// État des menus déroulants de la sidebar gauche
const projectDropdownOpen = ref(true); // Ouvert par défaut
const episodeDropdownOpen = ref(false);
const sequenceDropdownOpen = ref(false);
const sceneDropdownOpen = ref(false);

// Scène sélectionnée pour la sidebar
const selectedScene = ref(null);

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

// Méthodes pour la sidebar gauche
const toggleProjectDropdown = () => {
  projectDropdownOpen.value = !projectDropdownOpen.value;
};

const toggleEpisodeDropdown = () => {
  episodeDropdownOpen.value = !episodeDropdownOpen.value;
};

const toggleSequenceDropdown = () => {
  sequenceDropdownOpen.value = !sequenceDropdownOpen.value;
};

const toggleSceneDropdown = () => {
  sceneDropdownOpen.value = !sceneDropdownOpen.value;
};

// Sélectionner une scène pour la sidebar
const selectSceneForSidebar = (scene) => {
  selectedScene.value = scene;
  sceneDropdownOpen.value = true;
};

// Méthodes pour l'édition/suppression du projet
const startEditProject = () => {
  // Utiliser la même modale que pour l'édition d'épisode ou créer une spécifique
  // Pour l'instant, on redirige vers la page d'édition du projet
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

      // Rediriger vers la liste des projets
      router.push('/projets');
      alert('Projet supprimé avec succès!');
      
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      alert('Erreur lors de la suppression du projet: ' + (error.response?.data?.message || error.message));
    }
  }
};

// Méthode pour toggle la sidebar droite
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
  console.log('Sidebar ouverte:', sidebarOpen.value);
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

// Pour les dialogues ( ajout )
const showAddDialogueSection = ref(false);
const selectedSceneForDialogue = ref(null);
const newDialogueData = ref({
  personnageId: null,
  texte: '',
  observation: '',
  ordre: 1
});

// Propriétés calculées
const episodes = computed(() => store.episodes);
const sequences = computed(() => store.sequences);

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
        Object.keys(userPermissions.value).forEach(key => {
            userPermissions.value[key] = false;
        });
    }
};


watch(() => store.currentEpisode, async (newEpisode) => {
    if (newEpisode) {
        await checkUserPermissions(newEpisode.idEpisode);
        
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

// Watcher pour recharger les personnages quand le projet change
watch(
  () => projetId.value,
  async (newProjetId) => {
    if (newProjetId) {
      await loadPersonnages();
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
  
  // Calculer l'ordre automatique
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
      // Recharger les données de la séquence
      await store.fetchSequenceDetails(store.currentSequence.idSequence);
      
      // Réinitialiser le formulaire
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

// const deleteSceneLieu = async (sceneLieuId) => {
//   if (!userPermissions.value.canCreateLieu) {
//     alert('Vous n\'êtes pas autorisé à supprimer des lieux/plateaux pour cette scène.');
//     return;
//   }
  
//   if (confirm('Êtes-vous sûr de vouloir supprimer ce lieu/plateau ?')) {
//     try {
//       await axios.delete(`/api/scene-lieux/${sceneLieuId}`);
//       await store.fetchSequenceDetails(store.currentSequence.idSequence);
//     } catch (error) {
//       console.error('Erreur lors de la suppression du lieu/plateau:', error);
//       alert('Erreur lors de la suppression du lieu/plateau');
//     }
//   }
// };

const onReplanificationDansScene = (data) => {
  console.log('🔄 Replanification dans scène détectée:', data)
  
  // Recharger les données de la séquence pour s'assurer que tout est synchronisé
  if (store.currentSequence) {
    store.fetchSequenceDetails(store.currentSequence.idSequence)
  }
};

const goToCalendrierTournage = () => {
  router.push('/calendrier-tournage');
};

// Méthode utilitaire pour formater les dates
// const formatDate = (date) => {
//   return new Date(date).toLocaleString();
// };


// Propriétés calculées
const currentEpisode = computed(() => store.currentEpisode);
const currentSequence = computed(() => store.currentSequence);
const error = computed(() => store.error);
const isLoading = computed(() => store.isLoading);
const hasNext = computed(() => store.hasNext);
const hasPrev = computed(() => store.hasPrev);

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
    // Passez la fonction getSceneCommentCount si nécessaire
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
    // Passez store, formatDate et getBase64FromUrl à la fonction
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

</script>
