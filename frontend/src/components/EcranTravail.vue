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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import RaccordSceneComponent from './RaccordSceneComponent.vue';
import RaccordsPhotosComponent from './RaccordsPhotosComponent.vue';
import EnvoieParEmail from './EnvoieParEmail.vue'
import ModalEditEpisode from './ModalEditEpisode.vue'
import ModalEditSequence from './ModalEditSequence.vue'
import ModalEditScene from './ModalEditScene.vue'
import ModalEditDialogue from './ModalEditDialogue.vue'
import ModalAddLieu from './ModalAddLieu.vue'

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

const formatDate = (date) => {
  if (!date) return 'Non planifié';
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Propriétés calculées
const currentEpisode = computed(() => store.currentEpisode);
const currentSequence = computed(() => store.currentSequence);
const error = computed(() => store.error);
const isLoading = computed(() => store.isLoading);
const hasNext = computed(() => store.hasNext);
const hasPrev = computed(() => store.hasPrev);


// Méthodes d'export PDF avec design de facture
const exportScenesOnlyPDF = async (returnData = false) => {
  if (!currentSequence.value) return
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    
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

//exportation de chaque scène
const exportScenePDF = async (scene) => {
  if (!scene) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79]; // #21294F
    const secondaryColor = [220, 53, 69]; // #dc3545
    const accentColor = [23, 162, 184]; // #17a2b8
    
    let yPosition = 20;
    
    // ========== EN-TÊTE ==========
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${currentEpisode.value?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode.value?.ordre}: ${currentEpisode.value?.titre}`, 20, 25);
    
    pdf.text(`Scène ${scene.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 160, 29);
    
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    yPosition = 60;
    
    // ========== TITRE DE LA SCÈNE ==========
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(`SCÈNE ${scene.ordre}: ${scene.titre}`, 20, yPosition);
    
    yPosition += 15;
    
    // ========== INFORMATIONS GÉNÉRALES ==========
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    
    // Synopsis
    if (scene.synopsis) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Synopsis:", 20, yPosition);
      yPosition += 7;
      
      pdf.setFont("helvetica", "normal");
      const synopsisLines = pdf.splitTextToSize(scene.synopsis, 170);
      pdf.text(synopsisLines, 25, yPosition);
      yPosition += (synopsisLines.length * 4.5) + 10;
    }
    
    // Statut
    pdf.setFont("helvetica", "bold");
    pdf.text("Statut:", 20, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(scene.statutNom || 'Non défini', 45, yPosition);
    yPosition += 10;
    
    // Lieux et plateaux
    if (scene.sceneLieus?.length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Lieux et Plateaux:", 20, yPosition);
      yPosition += 7;
      
      pdf.setFont("helvetica", "normal");
      scene.sceneLieus.forEach((sceneLieu, index) => {
        let lieuText = `• ${sceneLieu.lieuNom}`;
        if (sceneLieu.plateauNom) {
          lieuText += ` (Plateau: ${sceneLieu.plateauNom})`;
        }
        if (sceneLieu.descriptionUtilisation) {
          lieuText += ` - ${sceneLieu.descriptionUtilisation}`;
        }
        
        const lieuLines = pdf.splitTextToSize(lieuText, 165);
        lieuLines.forEach(line => {
          pdf.text(line, 25, yPosition);
          yPosition += 4.5;
        });
        yPosition += 2;
      });
      yPosition += 5;
    }
    
    // ========== DIALOGUES ==========
    if (scene.dialogues?.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text("DIALOGUES:", 20, yPosition);
      yPosition += 15;
      
      scene.dialogues.forEach((dialogue, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // En-tête dialogue
        pdf.setFillColor(245, 245, 245);
        pdf.rect(20, yPosition - 5, 170, 8, 'F');
        
        // Personnage
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...accentColor);
        pdf.text(`${dialogue.personnageNom || 'NARRATEUR'}:`, 22, yPosition);
        
        yPosition += 10;
        
        // Texte du dialogue
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        const dialogueLines = pdf.splitTextToSize(dialogue.texte, 165);
        pdf.text(dialogueLines, 25, yPosition);
        yPosition += (dialogueLines.length * 4.5) + 8;
        
        // Observation
        if (dialogue.observation) {
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.setFont("helvetica", "italic");
          const observationLines = pdf.splitTextToSize(`Note: ${dialogue.observation}`, 160);
          pdf.text(observationLines, 28, yPosition);
          yPosition += (observationLines.length * 4) + 6;
          pdf.setFont("helvetica", "normal");
        }
        
        // Ordre
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Dialogue ${dialogue.ordre}`, 180, yPosition - 10, { align: 'right' });
        
        yPosition += 10;
        
        // Ligne de séparation
        if (index < scene.dialogues.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(20, yPosition - 3, 190, yPosition - 3);
          yPosition += 5;
        }
      });
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "italic");
      pdf.text("Aucun dialogue dans cette scène", 20, yPosition);
      yPosition += 15;
    }
    
    // ========== COMMENTAIRES ==========
    // (Optionnel) Vous pouvez aussi ajouter les commentaires de la scène
    if (getSceneCommentCount(scene.idScene) > 0) {
      yPosition += 10;
      
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text(`COMMENTAIRES (${getSceneCommentCount(scene.idScene)})`, 20, yPosition);
      yPosition += 10;
      
      // Vous pourriez charger et afficher les commentaires ici
      // Pour l'instant, on indique juste qu'il y en a
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${getSceneCommentCount(scene.idScene)} commentaire(s) disponible(s)`, 25, yPosition);
      yPosition += 15;
    }
    
    // ========== INFORMATIONS DE TOURNAGE ==========
    // (Optionnel) Si vous avez des informations de tournage
    if (scene.tournages && scene.tournages.length > 0) {
      yPosition += 5;
      
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text("INFORMATIONS DE TOURNAGE:", 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      scene.tournages.forEach((tournage, index) => {
        const tournageText = `${tournage.dateTournage ? formatDate(tournage.dateTournage) : 'Date non définie'} - ${tournage.statutNom || 'Statut inconnu'}`;
        pdf.text(`• ${tournageText}`, 25, yPosition);
        yPosition += 6;
      });
    }
    
    // ========== PIED DE PAGE ==========
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Scène ${scene.ordre} - ${scene.titre.substring(0, 30)}${scene.titre.length > 30 ? '...' : ''}`, 20, 290);
      pdf.text(`Page ${i} sur ${totalPages}`, 105, 290, { align: 'center' });
      pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 190, 290, { align: 'right' });
    }
    
    // ========== SAUVEGARDE ==========
    const safeFileName = `scene-${scene.ordre}-${scene.titre}`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement alphanumérique et tirets
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .substring(0, 30); // Limiter la longueur
    
    pdf.save(`${safeFileName}.pdf`);
    
    console.log(`PDF de la scène ${scene.ordre} exporté avec succès`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF de la scène:', error);
    alert('Erreur lors de l\'export PDF: ' + error.message);
  }
};

const loadImageBase64 = async (filename) => {
  if (!filename) return null;
  try {
    const response = await axios.get(`/api/images/raccord/${filename}`, {
      responseType: 'blob'
    });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(response.data);
    });
  } catch (err) {
    console.warn('Impossible de charger l\'image:', filename);
    return null;
  }
};

// Fonction utilitaire améliorée pour charger les images
const getBase64FromUrl = async (filename, raccordId) => {
  if (!filename || filename.includes('undefined') || filename === 'undefined') {
    console.warn('Nom de fichier invalide:', filename);
    return null;
  }

  // Ajouter des logs de débogage
  console.log('Tentative de chargement image:', filename);

  try {
    // Essayer d'abord le serveur statique (avec le context path /api)
    const staticUrl = `http://localhost:8080/api/images/raccords/${filename}`;
    console.log('URL statique:', staticUrl);
    
    const staticResponse = await axios.get(staticUrl, {
      responseType: 'blob',
      timeout: 5000
    });
    
    console.log('Image chargée via serveur statique:', filename);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(staticResponse.data);
    });
  } catch (staticError) {
    console.warn('Erreur avec serveur statique:', staticError.message);
    
    // Fallback vers l'API
    try {
      const apiUrl = `http://localhost:8080/api/api/images/raccord/${filename}`;
      console.log('URL API:', apiUrl);
      
      const apiResponse = await axios.get(apiUrl, {
        responseType: 'blob',
        timeout: 5000
      });
      
      console.log('Image chargée via API:', filename);
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(apiResponse.data);
      });
    } catch (apiError) {
      console.warn('Échec des deux méthodes pour:', filename, apiError.message);
      return null;
    }
  }
};

// Export tous les raccords du projet - VERSION CORRIGÉE
const exportRaccordsProjetPDF = async () => {
  if (!store.projetInfos?.id) {
    alert("Aucun projet sélectionné");
    return;
  }

  try {
    console.log('Début export PDF pour projet:', store.projetInfos.id);
    
    const response = await axios.get(`/api/raccords/export/projet/${store.projetInfos.id}`);
    const raccords = response.data;

    console.log('Raccords reçus:', raccords);

    if (!raccords || raccords.length === 0) {
      alert("Aucun raccord trouvé pour ce projet");
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];

    // Page de garde
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 297, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text("FICHE RACCORDS", 105, 100, { align: 'center' });
    pdf.setFontSize(18);
    pdf.text(store.projetTitle.toUpperCase(), 105, 115, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 105, 180, { align: 'center' });

    pdf.addPage();
    let y = 30;

    // En-tête
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text("TOUS LES RACCORDS DU PROJET", 105, 15, { align: 'center' });

    // Parcourir tous les raccords
    for (const [index, r] of raccords.entries()) {
      if (y > 250) {
        pdf.addPage();
        y = 30;
      }

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${r.typeRaccordNom || 'Type inconnu'} – ${r.sceneSourceTitre || '?'} → ${r.sceneCibleTitre || '?'}`, 15, y);
      y += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      
      // Informations détaillées
      if (r.projetTitre) pdf.text(`Projet: ${r.projetTitre}`, 20, y), y += 6;
      if (r.episodeTitre) pdf.text(`Épisode: ${r.episodeTitre}`, 20, y), y += 6;
      if (r.sequenceTitre) pdf.text(`Séquence: ${r.sequenceTitre}`, 20, y), y += 6;
      if (r.comedienNom) pdf.text(`Comédien: ${r.comedienNom}`, 20, y), y += 6;
      if (r.personnageNom) pdf.text(`Personnage: ${r.personnageNom}`, 20, y), y += 6;
      
      if (r.description) {
        const lines = pdf.splitTextToSize(`Description: ${r.description}`, 170);
        pdf.text(lines, 20, y);
        y += lines.length * 5 + 4;
      }

      pdf.text(`Statut: ${r.statutRaccordNom || '?'} | Critique: ${r.estCritique ? 'Oui' : 'Non'}`, 20, y);
      y += 6;

      if (r.dateTournageSource || r.dateTournageCible) {
        pdf.text(`Tournage: ${formatDate(r.dateTournageSource) || '?'} → ${formatDate(r.dateTournageCible) || '?'}`, 20, y);
        y += 6;
      }

      // IMAGES - VERSION CORRIGÉE AVEC DÉBOGAGE
      if (r.images && r.images.length > 0) {
        console.log(`Raccord ${index} a ${r.images.length} images:`, r.images);
        
        pdf.text('Images associées:', 20, y);
        y += 8;
        
        let x = 20;
        let imagesAdded = 0;
        
        for (const img of r.images) {
          if (imagesAdded >= 2) break; // Limiter à 2 images maximum
          
          // Vérifier que le nom de fichier est valide
          if (!img.nomFichier || img.nomFichier.includes('undefined')) {
            console.warn('Nom de fichier invalide ignoré:', img.nomFichier);
            continue;
          }
          
          try {
            console.log('Tentative de chargement image:', img.nomFichier);
            const base64 = await getBase64FromUrl(img.nomFichier);
            
            if (base64) {
              pdf.addImage(base64, 'JPEG', x, y, 35, 35);
              x += 40;
              imagesAdded++;
              
              if (x > 150) {
                x = 20;
                y += 40;
              }
              
              console.log('Image chargée avec succès:', img.nomFichier);
            } else {
              console.warn('Échec chargement image:', img.nomFichier);
            }
          } catch (imgError) {
            console.warn('Erreur lors du chargement image:', img.nomFichier, imgError);
          }
        }
        
        if (imagesAdded > 0) {
          y += 40; // Espace après les images
          console.log(`${imagesAdded} images ajoutées pour le raccord ${index}`);
        } else {
          pdf.setFontSize(9);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Aucune image disponible', 20, y);
          y += 15;
          console.log('Aucune image disponible pour le raccord', index);
        }
      } else {
        console.log('Aucune image pour le raccord', index);
      }

      y += 10;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, y - 5, 195, y - 5);
      y += 5;
    }

    // Pied de page
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Projet: ${store.projetTitle} – Page ${i - 1}/${totalPages - 1}`, 105, 290, { align: 'center' });
    }

    pdf.save(`raccords-projet-${store.projetInfos.id}.pdf`);
    console.log('Export PDF terminé avec succès');

  } catch (err) {
    console.error('Erreur export raccords:', err);
    if (err.response?.status === 404) {
      alert("Endpoint non trouvé - vérifiez que le backend est correctement configuré");
    } else {
      alert("Erreur lors de la génération du PDF: " + (err.response?.data?.message || err.message));
    }
  }
};

const exportRaccordsByScene = async (sceneId) => {
  try {
    console.log('Début export PDF pour scène:', sceneId);
    
    // 1. Récupérer les raccords de la scène
    const raccordsResponse = await axios.get(`/api/raccords/scene/${sceneId}`);
    const raccords = raccordsResponse.data;

    // 2. Récupérer et filtrer les raccords pour exclure ceux où la scène est source avec images partagées
    const raccordsAvecImagesPartagees = await Promise.all(
      raccords.map(async (raccord) => {
        try {
          // Vérifier si ce raccord doit être exclu
          // Règle: Exclure les raccords où la scène exportée est la source
          // et où il y a des images partagées avec d'autres scènes
          const estSceneSource = raccord.sceneSourceId === sceneId;
          
          // Si la scène est la source, vérifier s'il y a des images partagées
          if (estSceneSource) {
            // Appel API pour obtenir les images partagées
            const sharedImagesResponse = await axios.get(`/api/raccords/${raccord.id}/shared-images`);
            const sharedImages = sharedImagesResponse.data || [];
            
            // Si la scène est source ET il y a des images partagées, exclure ce raccord
            if (sharedImages.length > 0) {
              console.log(`Raccord ${raccord.id} exclu: scène source avec ${sharedImages.length} image(s) partagée(s)`);
              return null; // Exclure ce raccord
            }
            
            // Si pas d'images partagées, inclure le raccord sans images partagées
            raccord.sharedImages = [];
            return raccord;
          }
          
          // Si la scène est la cible, inclure le raccord avec toutes les images partagées
          if (raccord.sceneCibleId === sceneId) {
            const sharedImagesResponse = await axios.get(`/api/raccords/${raccord.id}/shared-images`);
            const sharedImages = sharedImagesResponse.data || [];
            
            // Filtrer les images partagées pour éviter les doublons avec les images directes
            const filteredSharedImages = sharedImages.filter(sharedImage => {
              const isAlreadyInDirectImages = raccord.images?.some(directImage => 
                directImage.id === sharedImage.id
              );
              return !isAlreadyInDirectImages;
            });
            
            raccord.sharedImages = filteredSharedImages;
            console.log(`Raccord ${raccord.id} inclus (scène cible): ${filteredSharedImages.length} image(s) partagée(s)`);
            return raccord;
          }
          
          // Cas par défaut (normalement ne devrait pas arriver)
          raccord.sharedImages = [];
          return raccord;
          
        } catch (error) {
          console.warn(`Erreur lors de la récupération des images partagées pour le raccord ${raccord.id}:`, error);
          raccord.sharedImages = [];
          return raccord;
        }
      })
    );

    // Filtrer les nulls (raccords exclus)
    const raccordsFiltres = raccordsAvecImagesPartagees.filter(r => r !== null);
    
    console.log(`Raccords pour scène ${sceneId}:`);
    console.log(`- Total originaux: ${raccords.length}`);
    console.log(`- Après filtrage: ${raccordsFiltres.length}`);
    console.log(`- Exclus: ${raccords.length - raccordsFiltres.length}`);

    if (!raccordsFiltres || raccordsFiltres.length === 0) {
      alert('Aucun raccord trouvé pour cette scène après filtrage. Les raccords où cette scène est la source avec des images partagées ont été exclus.');
      return;
    }

    const scene = store.currentSequence?.scenes?.find(s => s.idScene === sceneId);
    const sceneTitre = scene?.titre || `Scène ${sceneId}`;
    const sceneOrdre = scene?.ordre || '';

    // Créer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Couleurs professionnelles
    const colorPrimary = [59, 1, 11];         // #3B010B - Deep Wine
    const colorSecondary = [117, 22, 45];     // #75162D - Burgundy
    const colorAccent = [242, 217, 160];      // #F2D9A0 - Sand Gold
    const colorLight = [250, 247, 242];       // #FAF7F2 - Fond clair
    const colorBackground = [255, 255, 255];  // Blanc pur
    const colorShared = [72, 61, 139];        // #483D8B - DarkSlateBlue pour images partagées
    const colorSharedLight = [230, 230, 250]; // Lavender pour fond images partagées
    
    // ========== PAGE DE GARDE ==========
    pdf.setFillColor(...colorBackground);
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Bordure décorative supérieure
    pdf.setFillColor(...colorAccent);
    pdf.rect(0, 0, 210, 5, 'F');
    
    // Titre principal
    pdf.setFontSize(26);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colorPrimary);
    pdf.text("RAPPORT DES RACCORDS", 105, 70, { align: 'center' });
    
    // Ligne décorative
    pdf.setDrawColor(...colorSecondary);
    pdf.setLineWidth(1);
    pdf.line(60, 80, 150, 80);
    
    // Titre de la scène
    pdf.setFontSize(32);
    pdf.setTextColor(...colorSecondary);
    pdf.text(`SCÈNE ${sceneOrdre}`, 105, 100, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setTextColor(...colorPrimary);
    const sceneTitleLines = pdf.splitTextToSize(sceneTitre, 160);
    let titleY = 115;
    sceneTitleLines.forEach(line => {
      pdf.text(line, 105, titleY, { align: 'center' });
      titleY += 10;
    });
    
    // Informations contextuelles
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(80, 80, 80);
    
    if (store.currentSequence) {
      pdf.text(`Séquence ${store.currentSequence.ordre} : ${store.currentSequence.titre}`, 105, titleY + 5, { align: 'center' });
    }
    if (store.currentEpisode) {
      pdf.text(`Épisode ${store.currentEpisode.ordre} : ${store.currentEpisode.titre}`, 105, titleY + 15, { align: 'center' });
    }
    
    // Statistiques (après filtrage)
    const totalRaccordsOrigine = raccords.length;
    const totalRaccords = raccordsFiltres.length;
    const raccordsExclus = totalRaccordsOrigine - totalRaccords;
    const totalImagesDirectes = raccordsFiltres.reduce((sum, r) => sum + (r.images?.length || 0), 0);
    const totalImagesPartagees = raccordsFiltres.reduce((sum, r) => sum + (r.sharedImages?.length || 0), 0);
    const totalImages = totalImagesDirectes + totalImagesPartagees;
    const raccordsCritiques = raccordsFiltres.filter(r => r.estCritique).length;
    const raccordsAvecPartage = raccordsFiltres.filter(r => r.sharedImages?.length > 0).length;
    
    // Cadre statistiques
    const statsY = titleY + 35;
    pdf.setFillColor(...colorLight);
    pdf.roundedRect(40, statsY, 130, 65, 8, 8, 'F');
    pdf.setDrawColor(...colorAccent);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(40, statsY, 130, 65, 8, 8);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colorPrimary);
    pdf.text("RÉSUMÉ STATISTIQUES", 105, statsY + 10, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${totalRaccordsOrigine} raccords originaux`, 50, statsY + 22);
    pdf.text(`${raccordsCritiques} critiques`, 105, statsY + 22, { align: 'center' });
    pdf.text(`${raccordsAvecPartage} avec partage`, 160, statsY + 22, { align: 'right' });
    
    pdf.text(`${totalRaccords} raccords inclus`, 50, statsY + 32);
    pdf.text(`${raccordsExclus} exclus (source)`, 105, statsY + 32, { align: 'center' });
    pdf.text(`${totalImagesDirectes} images directes`, 50, statsY + 42);
    
    pdf.text(`${totalImagesPartagees} partagées`, 105, statsY + 42, { align: 'center' });
    pdf.text(`${totalImages} total images`, 160, statsY + 42, { align: 'right' });
    
    // Date
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 275, { align: 'center' });

    // ========== PAGES SUIVANTES ==========
    let currentPage = 2;
    let yPosition = 30;
    
    const addPageHeader = () => {
      pdf.setFillColor(...colorLight);
      pdf.rect(0, 0, 210, 25, 'F');
      
      pdf.setDrawColor(...colorAccent);
      pdf.setLineWidth(0.3);
      pdf.line(0, 25, 210, 25);
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colorPrimary);
      pdf.text(`SCÈNE ${sceneOrdre} : ${sceneTitre}`, 20, 15);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colorSecondary);
      pdf.text(`Page ${currentPage - 1}`, 190, 15, { align: 'right' });
      
      yPosition = 35;
    };

    pdf.addPage();
    addPageHeader();

    // Fonction pour charger et ajouter une image
    const addImageToPDF = async (image, isShared = false) => {
      if (!image.nomFichier || image.nomFichier.includes('undefined')) {
        console.warn('Image ignorée - nom invalide');
        return null;
      }
      
      try {
        const imageUrl = `http://localhost:8080/api/images/raccords/${image.nomFichier}`;
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'blob',
          timeout: 15000
        });
        
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageResponse.data);
        });
        
        return base64;
      } catch (imageError) {
        console.warn(`Erreur image:`, imageError);
        return null;
      }
    };

    // Fonction pour calculer les dimensions d'affichage
    const calculateImageDimensions = (img) => {
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;
      const aspectRatio = originalWidth / originalHeight;
      
      // Limites maximales
      const MAX_WIDTH = 80;  // mm
      const MAX_HEIGHT = 80; // mm
      const MIN_SIZE = 30;   // mm (taille minimale)
      
      let displayWidth, displayHeight;
      
      if (aspectRatio > 1) {
        // Image paysage
        displayWidth = Math.min(MAX_WIDTH, originalWidth / 10);
        displayHeight = displayWidth / aspectRatio;
        
        if (displayHeight < MIN_SIZE) {
          displayHeight = MIN_SIZE;
          displayWidth = displayHeight * aspectRatio;
        }
      } else {
        // Image portrait
        displayHeight = Math.min(MAX_HEIGHT, originalHeight / 10);
        displayWidth = displayHeight * aspectRatio;
        
        if (displayWidth < MIN_SIZE) {
          displayWidth = MIN_SIZE;
          displayHeight = displayWidth / aspectRatio;
        }
      }
      
      return { displayWidth, displayHeight, originalWidth, originalHeight, aspectRatio };
    };

    // ========== PARCOURIR LES RACCORDS ==========
    for (const [index, raccord] of raccordsFiltres.entries()) {
      const raccordIndex = index + 1;
      
      // Vérifier l'espace pour la section texte
      const sectionHeightWithoutImages = 45 + (raccord.description ? 20 : 0);
      const totalImagesRaccord = (raccord.images?.length || 0) + (raccord.sharedImages?.length || 0);
      
      // Si pas assez de place, nouvelle page
      if (yPosition + sectionHeightWithoutImages > 250) {
        pdf.addPage();
        currentPage++;
        addPageHeader();
      }
      
      // === EN-TÊTE DU RACCORD ===
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(15, yPosition - 5, 180, 12, 4, 4, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colorPrimary);
      
      // Indicateur images partagées
      let raccordTitle = `Raccord ${raccordIndex} : ${raccord.typeRaccordNom || 'Type non spécifié'}`;
      if (raccord.sharedImages?.length > 0) {
        raccordTitle += ` (${raccord.sharedImages.length} image(s) partagée(s))`;
      }
      
      pdf.text(raccordTitle, 20, yPosition);
      
      // Indicateur critique
      if (raccord.estCritique) {
        pdf.setFillColor(...colorSecondary);
        pdf.circle(190, yPosition - 2, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(6);
        pdf.text('C', 189.5, yPosition);
        pdf.setTextColor(...colorPrimary);
      }
      
      yPosition += 10;
      
      // === INFORMATIONS DU RACCORD ===
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      
      // Scènes avec indication du rôle de cette scène
      const isSceneSource = raccord.sceneSourceId === sceneId;
      const role = isSceneSource ? "Source" : "Cible";
      const otherScene = isSceneSource ? raccord.sceneCibleTitre : raccord.sceneSourceTitre;
      
      pdf.text(`Scènes : ${role} (${sceneTitre}) → ${isSceneSource ? "Cible" : "Source"} (${otherScene})`, 20, yPosition);
      yPosition += 6;
      
      // Personnage/Comédien
      if (raccord.personnageNom || raccord.comedienNom) {
        const actorText = raccord.personnageNom ? 
          `${raccord.personnageNom}${raccord.comedienNom ? ` (${raccord.comedienNom})` : ''}` : 
          raccord.comedienNom || '';
        pdf.text(`Interprète : ${actorText}`, 20, yPosition);
        yPosition += 6;
      }
      
      // Description
      if (raccord.description) {
        const descLines = pdf.splitTextToSize(`Description : ${raccord.description}`, 165);
        descLines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += 5;
        });
        yPosition += 2;
      }
      
      // Dates et statut
      if (raccord.dateTournageSource || raccord.dateTournageCible) {
        const dateSource = raccord.dateTournageSource ? formatDate(raccord.dateTournageSource) : 'À planifier';
        const dateCible = raccord.dateTournageCible ? formatDate(raccord.dateTournageCible) : 'À planifier';
        pdf.text(`Dates tournage : ${dateSource} → ${dateCible}`, 20, yPosition);
        yPosition += 6;
      }
      
      pdf.text(`Statut : ${raccord.statutRaccordNom || 'Non défini'}`, 20, yPosition);
      yPosition += 10;
      
      // === IMAGES DIRECTES ===
      if (raccord.images && raccord.images.length > 0) {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colorPrimary);
        pdf.text("Images directes :", 20, yPosition);
        yPosition += 8;
        
        await processImages(pdf, raccord.images, false);
      }
      
      // === IMAGES PARTAGÉES ===
      // Afficher les images partagées SEULEMENT si cette scène est la cible
      // (les raccords où la scène est source avec images partagées ont déjà été exclus)
      const shouldShowSharedImages = raccord.sceneCibleId === sceneId && 
                                    raccord.sharedImages && 
                                    raccord.sharedImages.length > 0;
      
      if (shouldShowSharedImages) {
        // Vérifier l'espace pour le titre des images partagées
        if (yPosition > 250) {
          pdf.addPage();
          currentPage++;
          addPageHeader();
        }
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colorShared);
        pdf.text("Images partagées (provenant de la scène source) :", 20, yPosition);
        yPosition += 8;
        
        await processImages(pdf, raccord.sharedImages, true);
      }
      
      // Si aucune image
      if ((!raccord.images || raccord.images.length === 0) && 
          (!shouldShowSharedImages)) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(150, 150, 150);
        pdf.text('Aucune image disponible', 20, yPosition);
        yPosition += 15;
      }
      
      // === SÉPARATION ENTRE RACCORDS ===
      if (index < raccordsFiltres.length - 1) {
        if (yPosition < 270) {
          pdf.setDrawColor(230, 230, 230);
          pdf.setLineWidth(0.3);
          pdf.line(20, yPosition, 190, yPosition);
          yPosition += 15;
        }
      }
    }
    
    // Fonction pour traiter les images (directes et partagées)
    async function processImages(pdf, images, isShared = false) {
      let imageX = 25;
      let imageY = yPosition;
      let imagesInCurrentRow = 0;
      
      for (const [imgIndex, image] of images.entries()) {
        try {
          const base64 = await addImageToPDF(image, isShared);
          
          if (base64) {
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = reject;
              img.src = base64;
            });
            
            const { displayWidth, displayHeight, originalWidth, originalHeight } = calculateImageDimensions(img);
            const captionHeight = 10;
            const totalImageHeight = displayHeight + captionHeight + 5;
            
            // Vérifier si l'image rentre sur la page
            if (imageY + totalImageHeight > 270) {
              pdf.addPage();
              currentPage++;
              addPageHeader();
              imageX = 25;
              imageY = yPosition;
              imagesInCurrentRow = 0;
            }
            
            // Vérifier si l'image dépasse à droite
            if (imageX + displayWidth > 185 && imagesInCurrentRow > 0) {
              imageX = 25;
              imageY += totalImageHeight;
              imagesInCurrentRow = 0;
              
              if (imageY + totalImageHeight > 270) {
                pdf.addPage();
                currentPage++;
                addPageHeader();
                imageX = 25;
                imageY = yPosition;
                imagesInCurrentRow = 0;
              }
            }
            
            // Cadre avec couleur différente pour les images partagées
            if (isShared) {
              pdf.setFillColor(...colorSharedLight);
            } else {
              pdf.setFillColor(250, 250, 250);
            }
            
            pdf.roundedRect(imageX - 2, imageY - 2, displayWidth + 4, displayHeight + 4, 4, 4, 'F');
            
            if (isShared) {
              pdf.setDrawColor(...colorShared);
            } else {
              pdf.setDrawColor(...colorAccent);
            }
            
            pdf.setLineWidth(0.5);
            pdf.roundedRect(imageX - 2, imageY - 2, displayWidth + 4, displayHeight + 4, 4, 4);
            
            // Ajouter l'image
            pdf.addImage(base64, 'JPEG', imageX, imageY, displayWidth, displayHeight);
            
            // Badge selon le type d'image
            if (isShared) {
              // Badge pour image partagée (S = Shared)
              pdf.setFillColor(...colorShared);
              pdf.circle(imageX + 5, imageY + 5, 4, 'F');
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(6);
              pdf.text('S', imageX + 4.2, imageY + 6.5);
            } else if (image.estImageReference) {
              // Badge pour image de référence (R = Reference)
              pdf.setFillColor(...colorSecondary);
              pdf.circle(imageX + 5, imageY + 5, 4, 'F');
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(6);
              pdf.text('R', imageX + 4, imageY + 6.5);
            }
            
            // Légende
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "normal");
            
            if (isShared) {
              pdf.setTextColor(...colorShared);
            } else {
              pdf.setTextColor(80, 80, 80);
            }
            
            let caption = image.descriptionImage || `Image ${imgIndex + 1}`;
            if (isShared) {
              caption = `[Partagé] ${caption}`;
            }
            caption += ` (${originalWidth}×${originalHeight})`;
            
            const captionLines = pdf.splitTextToSize(caption, displayWidth - 10);
            
            captionLines.forEach((line, lineIndex) => {
              pdf.text(line, imageX, imageY + displayHeight + 5 + (lineIndex * 3));
            });
            
            imagesInCurrentRow++;
            imageX += displayWidth + 15;
            
            if (imageX + 50 > 185) {
              imageX = 25;
              imageY += totalImageHeight;
              imagesInCurrentRow = 0;
            }
            
            console.log(`✅ Image ${imgIndex + 1} ajoutée${isShared ? ' (partagée)' : ''}`);
          }
        } catch (imageError) {
          console.warn(`Erreur image ${imgIndex + 1}:`, imageError);
          addImagePlaceholder(pdf, imageX, imageY, isShared);
          
          imagesInCurrentRow++;
          imageX += 65;
          
          if (imageX + 50 > 185) {
            imageX = 25;
            imageY += 65;
            imagesInCurrentRow = 0;
          }
        }
      }
      
      // Mettre à jour la position Y après les images
      if (imagesInCurrentRow > 0) {
        imageY += 80;
      }
      yPosition = imageY + 10;
    }
    
    // Fonction pour ajouter un placeholder d'image
    function addImagePlaceholder(pdf, x, y, isShared = false) {
      const placeholderSize = 50;
      
      if (isShared) {
        pdf.setFillColor(...colorSharedLight);
      } else {
        pdf.setFillColor(245, 245, 245);
      }
      
      pdf.roundedRect(x, y, placeholderSize, placeholderSize, 4, 4, 'F');
      
      if (isShared) {
        pdf.setDrawColor(...colorShared);
      } else {
        pdf.setDrawColor(200, 200, 200);
      }
      
      pdf.setLineWidth(0.5);
      pdf.line(x, y, x + placeholderSize, y + placeholderSize);
      pdf.line(x + placeholderSize, y, x, y + placeholderSize);
      
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      
      const text = isShared ? 'Partagé non disp.' : 'Non disponible';
      pdf.text(text, x + placeholderSize/2 - (isShared ? 15 : 10), y + placeholderSize/2);
    }
    
    // ========== PAGE DE SYNTHÈSE ==========
    pdf.addPage();
    currentPage++;
    
    // Header pour la page de synthèse
    pdf.setFillColor(...colorLight);
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setDrawColor(...colorAccent);
    pdf.setLineWidth(0.3);
    pdf.line(0, 25, 210, 25);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colorPrimary);
    pdf.text("SYNTHÈSE DU RAPPORT", 20, 15);
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...colorSecondary);
    pdf.text(`Page ${currentPage - 1}`, 190, 15, { align: 'right' });
    
    yPosition = 40;
    
    // Titre
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colorPrimary);
    pdf.text("RÉCAPITULATIF COMPLET", 20, yPosition);
    yPosition += 15;
    
    // Cadre de synthèse
    pdf.setFillColor(...colorLight);
    pdf.roundedRect(20, yPosition - 5, 170, 150, 8, 8, 'F');
    pdf.setDrawColor(...colorAccent);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(20, yPosition - 5, 170, 150, 8, 8);
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...colorPrimary);
    
    const summaryY = yPosition + 5;
    let lineY = summaryY;
    
    const summaryItems = [
      `Scène documentée : ${sceneOrdre} - ${sceneTitre}`,
      `Total des raccords originaux : ${totalRaccordsOrigine}`,
      `Raccords inclus dans le rapport : ${totalRaccords}`,
      `Raccords exclus (source avec partage) : ${raccordsExclus}`,
      `Raccords critiques : ${raccordsCritiques}`,
      `Raccords avec images partagées : ${raccordsAvecPartage}`,
      `Images directes : ${totalImagesDirectes}`,
      `Images partagées : ${totalImagesPartagees}`,
      `Total images affichées : ${totalImages}`,
      `Date de génération : ${new Date().toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`
    ];
    
    // Types de raccords
    const typesUniques = [...new Set(raccordsFiltres.map(r => r.typeRaccordNom).filter(Boolean))];
    if (typesUniques.length > 0) {
      summaryItems.push(`Types de raccords : ${typesUniques.join(', ')}`);
    }
    
    // Note sur le filtrage
    summaryItems.push('');
    summaryItems.push('POLITIQUE DE FILTRAGE :');
    summaryItems.push('  • Les raccords où cette scène est la SOURCE et qui ont');
    summaryItems.push('    des images partagées avec d\'autres scènes sont EXCLUS.');
    summaryItems.push('  • Cette exclusion évite les doublons d\'images, car les');
    summaryItems.push('    images proviennent déjà de cette scène.');
    summaryItems.push('  • Les images partagées sont uniquement affichées quand');
    summaryItems.push('    cette scène est la CIBLE.');
    
    // Légende
    summaryItems.push('');
    summaryItems.push('Légende :');
    summaryItems.push('  • [C] Raccord critique');
    summaryItems.push('  • [R] Image de référence (directe)');
    summaryItems.push('  • [S] Image partagée (provenant de la scène source)');
    
    summaryItems.forEach(item => {
      if (item === '') {
        lineY += 3;
      } else if (item.startsWith('POLITIQUE') || item.startsWith('Légende') || item.includes('•')) {
        pdf.setFontSize(9);
        pdf.text(item, 25, lineY);
        lineY += 5;
      } else {
        pdf.setFontSize(10);
        pdf.text(`• ${item}`, 25, lineY);
        lineY += 7;
      }
    });
    
    // Note
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(120, 120, 120);
    pdf.text("Document technique à usage interne de la production", 105, lineY + 15, { align: 'center' });
    
    // ========== PIED DE PAGE SUR TOUTES LES PAGES ==========
    const totalPages = pdf.internal.getNumberOfPages();
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      pdf.setPage(pageNum);
      
      // Ligne de séparation bas de page
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(20, 280, 190, 280);
      
      // Texte pied de page
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      
      if (pageNum === 1) {
        pdf.text(`${store.projetTitle || 'Production'}`, 20, 285);
        pdf.text(`Document des raccords avec images partagées`, 105, 285, { align: 'center' });
        pdf.text(`Scène ${sceneOrdre}`, 190, 285, { align: 'right' });
      } else {
        const pageTitle = sceneTitre.substring(0, 25) + (sceneTitre.length > 25 ? '...' : '');
        pdf.text(pageTitle, 20, 285);
        pdf.text(`Page ${pageNum - 1}/${totalPages - 1}`, 105, 285, { align: 'center' });
        const now = new Date();
        pdf.text(`${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`, 190, 285, { align: 'right' });
      }
    }
    
    // ========== SAUVEGARDE ==========
    const safeFileName = `raccords-scene-${sceneOrdre}-${sceneTitre}`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    pdf.save(`raccords-${safeFileName}.pdf`);
    
    console.log(`Export PDF terminé avec succès !`);
    console.log(`Fichier : raccords-${safeFileName}.pdf`);
    console.log(`${totalRaccords} raccord(s) inclus, ${raccordsExclus} exclu(s)`);
    console.log(`${totalImagesDirectes} image(s) directes, ${totalImagesPartagees} image(s) partagée(s)`);
    
    alert(`PDF généré avec succès !\n\n` +
          `${totalRaccordsOrigine} raccord(s) originaux\n` +
          `${totalRaccords} raccord(s) inclus dans le rapport\n` +
          `${raccordsExclus} raccord(s) exclus (source avec partage)\n` +
          `${totalImagesDirectes} image(s) directes\n` +
          `${totalImagesPartagees} image(s) partagée(s)\n\n` +
          `Fichier : raccords-${safeFileName}.pdf`);
    
  } catch (err) {
    console.error('Erreur lors de l\'export PDF:', err);
    
    let errorMessage = 'Erreur lors de la génération du document';
    if (err.response?.status === 404) {
      errorMessage = 'Scène non trouvée';
    } else if (err.message.includes('timeout')) {
      errorMessage = 'Temps de chargement dépassé';
    } else if (err.message.includes('Network Error')) {
      errorMessage = 'Problème de connexion';
    }
    
    alert(`${errorMessage}\n\n${err.message || 'Veuillez réessayer'}`);
  }
};

</script>
