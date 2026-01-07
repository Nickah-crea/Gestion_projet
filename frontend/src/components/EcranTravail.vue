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
      <div v-if="currentScene" class="sidebar-section">
        <div class="sidebar-header" @click="toggleSceneDropdown">
          <div class="sidebar-title">
            <i class="fas fa-film"></i>
            <h3>Scène {{ currentScene.ordre }}: {{ currentScene.titre }}</h3>
          </div>
          <i class="fas" :class="sceneDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        
        <div v-if="sceneDropdownOpen" class="sidebar-content-dropdown">
          <!-- Synopsis de la scène -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ currentScene.synopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut de la scène -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span class="status-badge">
                {{ currentScene.statutNom || 'Non défini' }}
              </span>
            </div>
          </div>
          
          <!-- Commentaires -->
          <div class="info-section">
            <label class="info-label">Commentaires</label>
            <div class="comment-count">
              <i class="fas fa-comments"></i>
              <span>{{ getSceneCommentCount(currentScene.idScene) }} commentaire(s)</span>
            </div>
          </div>
          
          <!-- Actions (Modifier/Supprimer) -->
          <div v-if="userPermissions.canCreateScene" class="actions-section">
            <button 
              class="action-btn edit-btn"
              @click="startEditScene(currentScene)"
              title="Modifier la scène"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="deleteScene(currentScene.idScene)"
              title="Supprimer la scène"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <!-- Message si aucune scène sélectionnée -->
      <div v-else-if="currentSequence && scenes.length > 0" class="sidebar-section">
        <div class="sidebar-header" @click="toggleSceneDropdown">
          <div class="sidebar-title">
            <i class="fas fa-film"></i>
            <h3>Scènes ({{ scenes.length }})</h3>
          </div>
          <i class="fas" :class="sceneDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        
        <div v-if="sceneDropdownOpen" class="sidebar-content-dropdown">
          <p class="info-content">Sélectionnez une scène pour voir ses détails</p>
          <div class="scenes-list-mini">
            <div 
              v-for="scene in scenes" 
              :key="scene.idScene"
              class="scene-item-mini"
              @click="selectScene(scene.idScene)"
              :class="{ 'selected': currentScene?.idScene === scene.idScene }"
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
            <!-- Navigation par épisode/séquence -->
            <button class="nav-btn-ecran-travail" @click="goToPrevPage" :disabled="!hasPrev || isLoading">Précédent</button>
            <button class="nav-btn-ecran-travail" @click="goToNextPage" :disabled="!hasNext || isLoading">Suivant</button>
            
            <!-- Navigation par scène (visible seulement si une scène est sélectionnée) -->
            <div v-if="currentScene" class="scene-navigation-buttons">
              <button 
                class="nav-btn-ecran-travail scene-nav-btn"
                @click="goToPrevScene"
                :disabled="!hasPrevScene || isLoading"
                title="Scène précédente"
              >
                <i class="fas fa-chevron-left"></i> Scène Préc.
              </button>
              <button 
                class="nav-btn-ecran-travail scene-nav-btn"
                @click="goToNextScene"
                :disabled="!hasNextScene || isLoading"
                title="Scène suivante"
              >
                Scène Suiv. <i class="fas fa-chevron-right"></i>
              </button>
            </div>
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
          :class="{ 
            'active-ecran-travail': episode.idEpisode === currentEpisode?.idEpisode, 
            'new-episode-ecran-travail': episode.idEpisode === newlyCreatedEpisodeId 
          }"
          @click="selectEpisode(episode.idEpisode)"
        >
          Ep {{ episode.ordre }}
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
            :class="{ 
              'active-ecran-travail': sequence.idSequence === currentSequence?.idSequence, 
              'new-sequence-ecran-travail': sequence.idSequence === newlyCreatedSequenceId 
            }"
            @click="selectSequence(sequence.idSequence)"
          >
            <span v-if="index > 0"></span>
            Seq {{ sequence.ordre }}
            <span v-if="sequence.idSequence === newlyCreatedSequenceId" class="blinking-icon-ecran-travail">✨</span>
          </span>
        </div>
      </div>

      <!-- NOUVELLE SECTION : Navigation par scènes -->
      <div v-if="currentSequence && scenes.length > 0" class="scene-navigation-ecran-travail">
        <h3>Navigation par scènes :</h3>
        <div class="scene-numbers-container">
          <span
            v-for="scene in scenes"
            :key="scene.idScene"
            class="scene-number-ecran-travail"
            :class="{ 
              'active-ecran-travail': currentScene?.idScene === scene.idScene,
              'new-scene-ecran-travail': scene.idScene === newlyCreatedSceneId
            }"
            @click="selectScene(scene.idScene)"
            :title="`Scène ${scene.ordre}: ${scene.titre}`"
          >
            Sc{{ scene.ordre }}
            <span v-if="scene.idScene === newlyCreatedSceneId" class="blinking-icon-ecran-travail">✨</span>
          </span>
        </div>
      </div>

      <!-- ==================== CONTENU PRINCIPAL ==================== -->
      
      <!-- 1. Vue de la SÉQUENCE (par défaut, quand aucune scène n'est sélectionnée) -->
      <main v-if="currentSequence && !currentScene && !isLoading" class="sequence-page-ecran-travail">
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
            <h3>Scènes ({{ scenes.length }})</h3>
            <button class="add-scene-btn-ecran-travail" @click="goToAddScene"><i class="fas fa-plus-circle " style="color: #21294F;"></i> Scène</button>
          </div>

          <!-- Liste des scènes (cliquable pour voir une scène spécifique) -->
          <div class="scenes-list-ecran-travail">
            <div 
              v-for="scene in scenes" 
              :key="scene.idScene" 
              class="scene-card-ecran-travail"
              @click="selectScene(scene.idScene)"
            >
              <div class="scene-header-ecran-travail">
                <h3 class="scene-title-ecran-travail">
                  Scène {{ scene.ordre }}: {{ scene.titre }}
                  <span class="comment-icon-ecran-travail" @click.stop="toggleSceneCommentSection(scene)">
                    <i class="fas fa-comments" style="color: #21294F;"></i> {{ getSceneCommentCount(scene.idScene) }}
                  </span>
                </h3>
                
                <div class="scene-actions-ecran-travail">
                  <button 
                    class="export-scene-btn-ecran-travail" 
                    @click.stop="exportScenePDF(scene)"
                    title="Exporter cette scène en PDF"
                  >
                    <i class="fas fa-file-pdf"></i> Exporter Scène
                  </button>
                  
                  <button 
                    class="export-dialogues-btn-ecran-travail" 
                    @click.stop="exportSceneDialoguesPDF(scene)"
                    title="Exporter les dialogues de cette scène en PDF"
                  >
                    <i class="fas fa-file-pdf"></i> Dialogues
                  </button>
                  
                  <button 
                    @click.stop="exportRaccordsByScene(scene.idScene)" 
                    class="export-scene-raccords-btn-ecran-travail"
                    title="Exporter les raccords et images"
                  >
                    <i class="fas fa-file-pdf"></i> Raccords
                  </button>
                  
                  <button 
                    class="export-btn-ecran-travail email-btn"
                    @click.stop="openEmailModal"
                    title="Envoyer par Email"
                  >
                    <i class="fas fa-paper-plane"></i> Email
                  </button>
                </div>
              </div>
              
              <p class="scene-info-ecran-travail">
                <strong>Statut:</strong> {{ scene.statutNom || 'Non défini' }}
                <span v-if="scene.synopsis" class="scene-synopsis-ecran-travail">
                  | <strong>Synopsis:</strong> {{ scene.synopsis.substring(0, 100) }}...
                </span>
              </p>
              
              <!-- Aperçu des dialogues -->
              <div v-if="scene.dialogues?.length" class="dialogues-preview-ecran-travail">
                <div class="dialogues-preview-header">
                  <strong>Dialogues ({{ scene.dialogues.length }}):</strong>
                  <button class="view-all-dialogues-btn" @click.stop="selectScene(scene.idScene)">
                    Voir tous <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
                <ul class="dialogues-preview-list">
                  <li v-for="(dialogue, index) in scene.dialogues.slice(0, 3)" :key="dialogue.id" class="dialogue-preview-item">
                    <strong>{{ dialogue.personnageNom || 'Narrateur' }}:</strong> 
                    <span>{{ dialogue.texte.substring(0, 80) }}{{ dialogue.texte.length > 80 ? '...' : '' }}</span>
                  </li>
                  <li v-if="scene.dialogues.length > 3" class="more-dialogues">
                    + {{ scene.dialogues.length - 3 }} autres dialogues...
                  </li>
                </ul>
              </div>
              
              <!-- Bouton pour voir la scène complète -->
              <button class="view-scene-btn-ecran-travail" @click.stop="selectScene(scene.idScene)">
                <i class="fas fa-external-link-alt"></i> Voir la scène complète
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <!-- 2. Vue d'une SCÈNE SPÉCIFIQUE (quand une scène est sélectionnée) -->
      <main v-else-if="currentScene && !isLoading" class="scene-page-ecran-travail">
        <div class="scene-page-header">
          <div class="scene-header-left">
            <h2 class="scene-page-title-ecran-travail">
              Scène {{ currentScene.ordre }}: {{ currentScene.titre }}
              <button class="back-to-sequence-btn" @click="clearSelectedScene" title="Retour à la séquence">
                <i class="fas fa-arrow-left"></i> Retour à la séquence
              </button>
            </h2>
            <p class="scene-page-info-ecran-travail">
              <strong>Statut:</strong> {{ currentScene.statutNom || 'Non défini' }}
              <span v-if="currentScene.synopsis">
                | <strong>Synopsis:</strong> {{ currentScene.synopsis }}
              </span>
            </p>
          </div>
          
          <div class="scene-header-actions">
            <button class="add-dialogue-btn-ecran-travail" @click="startAddDialogue(currentScene)">
              <i class="fas fa-comment-medical"></i> Ajouter un dialogue
            </button>
            <button class="edit-scene-btn-ecran-travail" @click="startEditScene(currentScene)">
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button class="delete-scene-btn-ecran-travail" @click="deleteScene(currentScene.idScene)">
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
        
        <!-- Section commentaires scène -->
        <div class="scene-comments-section-ecran-travail">
          <div class="comments-header">
            <h3><i class="fas fa-comments"></i> Commentaires ({{ getSceneCommentCount(currentScene.idScene) }})</h3>
            <button class="toggle-comments-btn" @click="toggleSceneCommentSection(currentScene)">
              {{ showSceneCommentModal ? 'Masquer' : 'Afficher' }}
            </button>
          </div>
          
          <div v-if="showSceneCommentModal && selectedSceneForComments?.idScene === currentScene.idScene" class="comment-section-ecran-travail">
            <div class="add-comment-ecran-travail">
              <textarea v-model="newSceneComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
              <button @click="addSceneComment" class="add-comment-btn-ecran-travail"><i class="fas fa-plus-circle"></i> Ajouter</button>
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
        </div>
        
        <!-- Section Tournage -->
        <SceneTournageSection 
          :scene="currentScene"
          :projet-id="projetId"
          :user-permissions="userPermissions"
          @tournage-updated="onTournageUpdated"
          @replanification-appliquee="onReplanificationDansScene"
        />
        
        <!-- Section Dialogues complète -->
        <div class="scene-dialogues-section-ecran-travail">
          <div class="dialogues-header">
            <h3><i class="fas fa-comments"></i> Dialogues ({{ currentScene.dialogues?.length || 0 }})</h3>
            <button class="add-dialogue-btn-ecran-travail" @click="startAddDialogue(currentScene)">
              <i class="fas fa-plus"></i> Nouveau dialogue
            </button>
          </div>
          
          <div class="dialogues-ecran-travail" v-if="currentScene.dialogues?.length">
            <ul class="dialogues-list-ecran-travail">
              <li v-for="dialogue in currentScene.dialogues" :key="dialogue.id" class="dialogue-item-ecran-travail">
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
          <div v-else class="no-dialogues-ecran-travail">
            <p>Aucun dialogue dans cette scène.</p>
          </div>
          
          <!-- Formulaire d'ajout de dialogue -->
          <div class="add-dialogue-direct-ecran-travail" v-if="showAddDialogueSection && selectedSceneForDialogue?.idScene === currentScene.idScene">
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
                  @click="createDialogueDirect(currentScene.idScene)" 
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
        
        <!-- Section outils de scène -->
        <div class="scene-tools-section-ecran-travail">
          <h3><i class="fas fa-tools"></i> Outils</h3>
          <div class="scene-tools-grid">
            <RaccordsPhotosComponent 
              :scene-id="currentScene.idScene"
              :scene-info="currentScene"
              @raccords-updated="onRaccordsUpdated"
            />

            <RaccordSceneComponent 
              :projet-id="projetId"
              :episode-id="currentEpisode?.idEpisode"
              :sequence-id="currentSequence?.idSequence"
              :scene-source-id="currentScene.idScene"  
              @raccord-created="onRaccordCreated"
            />
            
            <button 
              class="export-scene-full-btn-ecran-travail" 
              @click="exportScenePDF(currentScene)"
              title="Exporter cette scène complète en PDF"
            >
              <i class="fas fa-file-pdf"></i> Exporter Scène PDF
            </button>
            
            <button 
              class="export-raccords-scene-btn-ecran-travail"
              @click="exportRaccordsByScene(currentScene.idScene)"
              title="Exporter les raccords avec images"
            >
              <i class="fas fa-file-pdf"></i> Raccords avec Images
            </button>
            
            <button 
              class="open-add-lieu-btn"
              @click="openAddLieuModal(currentScene)"
              title="Ajouter un lieu/plateau"
            >
              <i class="fas fa-map-marker-alt"></i> Ajouter Lieu/Plateau
            </button>
          </div>
        </div>
      </main>
      
      <div v-else-if="!isLoading" class="no-data-ecran-travail">
        <p>Aucune séquence disponible pour cet épisode.</p>
      </div>

      <!-- ==================== MODALES ==================== -->
      
      <!-- Modale pour surlignage -->
      <div v-if="showHighlightModal" class="modal-overlay-ecran-travail" @click="closeHighlightModal">
        <div class="modal-content-ecran-travail" @click.stop>
          <!-- ... contenu de la modale de surlignage ... -->
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
        <!-- ... contenu de la modale de commentaires ... -->
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
const projectDropdownOpen = ref(true);
const episodeDropdownOpen = ref(false);
const sequenceDropdownOpen = ref(false);
const sceneDropdownOpen = ref(false);

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

// NOUVELLE : Sélectionner une scène pour la sidebar
const selectSceneForSidebar = (scene) => {
  store.currentScene = scene;
  store.currentSceneIndex = store.scenes.findIndex(s => s.idScene === scene.idScene);
  sceneDropdownOpen.value = true;
};

// Méthodes pour l'édition/suppression du projet
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
const selectedSceneForComments = ref(null); // Changé de selectedScene à selectedSceneForComments
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
const scenes = computed(() => store.scenes); // NOUVEAU
const currentScene = computed(() => store.currentScene); // NOUVEAU

// Propriétés calculées pour la navigation
const hasNextScene = computed(() => store.hasNextScene);
const hasPrevScene = computed(() => store.hasPrevScene);

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
  const sceneId = route.query.sceneId; // NOUVEAU

  if (episodeId) {
    await store.selectEpisodeById(episodeId);
  }

  if (sequenceId) {
    await store.selectSequenceById(sequenceId);
  }

  if (sceneId) { // NOUVEAU
    await store.selectSceneById(sceneId);
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


onMounted(async () => {
  projetId.value = route.params.idProjet;
  
  if (!projetId.value) {
    console.error('ID du projet non trouvé dans les params de route !');
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
  const sceneId = route.query.sceneId; // NOUVEAU

  if (episodeId) {
    await store.selectEpisodeById(episodeId);
  }

  if (sequenceId) {
    await store.selectSequenceById(sequenceId);
  }

  if (sceneId) { // NOUVEAU
    await store.selectSceneById(sceneId);
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

// NOUVEAU : Watcher pour les scènes
watch(() => store.scenes, (newScenes) => {
  console.log('Scènes mises à jour:', newScenes.length);
});

// NOUVEAU : Watcher pour la scène actuelle
watch(() => store.currentScene, (newScene) => {
  if (newScene) {
    console.log('Scène actuelle changée:', newScene.titre);
    // Mettre à jour l'URL avec l'ID de la scène
    if (route.query.sceneId !== newScene.idScene.toString()) {
      router.push({ 
        query: { 
          ...route.query, 
          sceneId: newScene.idScene 
        } 
      });
    }
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
    if (newQuery.episodeId && newQuery.episodeId !== store.currentEpisode?.idEpisode) {
      await store.selectEpisodeById(newQuery.episodeId);
    }
    
    if (newQuery.sequenceId && newQuery.sequenceId !== store.currentSequence?.idSequence) {
      await store.selectSequenceById(newQuery.sequenceId);
    }
    
    // NOUVEAU : Gestion du paramètre sceneId
    if (newQuery.sceneId && newQuery.sceneId !== store.currentScene?.idScene) {
      await store.selectSceneById(newQuery.sceneId);
    }
  },
  { immediate: true, deep: true }
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

// NOUVELLE MÉTHODE : Retour à la vue séquence (désélectionner la scène)
const clearSelectedScene = () => {
  store.currentScene = null;
  store.currentSceneIndex = 0;
  router.push({ 
    query: { 
      ...route.query,
      sceneId: undefined 
    } 
  });
};

// Modifiez la méthode selectScene pour gérer la désélection
const selectScene = async (sceneId) => {
  try {
    // Si on clique sur la scène déjà sélectionnée, on retourne à la vue séquence
    if (store.currentScene && store.currentScene.idScene === parseInt(sceneId)) {
      clearSelectedScene();
    } else {
      await store.selectSceneById(sceneId);
      router.push({ 
        query: { 
          ...route.query, 
          sceneId 
        } 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la sélection de la scène:', error);
  }
};

const goToNextScene = async () => {
  if (store.currentScene && store.currentSceneIndex < store.scenes.length - 1) {
    const nextIndex = store.currentSceneIndex + 1;
    await selectScene(store.scenes[nextIndex].idScene);
  }
};

const goToPrevScene = async () => {
  if (store.currentScene && store.currentSceneIndex > 0) {
    const prevIndex = store.currentSceneIndex - 1;
    await selectScene(store.scenes[prevIndex].idScene);
  }
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

const selectSequence = async (sequenceId) => {
  await store.selectSequenceById(sequenceId);
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

// Propriétés calculées
const currentEpisode = computed(() => store.currentEpisode);
const currentSequence = computed(() => store.currentSequence);
const error = computed(() => store.error);
const isLoading = computed(() => store.isLoading);
const hasNext = computed(() => store.hasNext);
const hasPrev = computed(() => store.hasPrev);

</script>


<style scoped>
/* ==================== STYLES POUR LA VUE SCÈNE ==================== */

/* Page de scène */
.scene-page-ecran-travail {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.scene-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

.scene-header-left {
  flex: 1;
}

.scene-page-title-ecran-travail {
  color: #21294F;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.scene-page-info-ecran-travail {
  color: #666;
  font-size: 14px;
}

.scene-header-actions {
  display: flex;
  gap: 10px;
}

.back-to-sequence-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.3s;
}

.back-to-sequence-btn:hover {
  background-color: #f8f9fa;
  border-color: #21294F;
  color: #21294F;
}

/* Section commentaires scène */
.scene-comments-section-ecran-travail {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.toggle-comments-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

/* Section dialogues */
.scene-dialogues-section-ecran-travail {
  margin: 20px 0;
}

.dialogues-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.no-dialogues-ecran-travail {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
  background-color: #fafafa;
  border-radius: 8px;
  border: 2px dashed #eee;
}

/* Section outils */
.scene-tools-section-ecran-travail {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7ff;
  border-radius: 8px;
  border: 1px solid #e0e5ff;
}

.scene-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.scene-tools-grid > * {
  min-height: 50px;
}

.export-scene-full-btn-ecran-travail,
.export-raccords-scene-btn-ecran-travail,
.open-add-lieu-btn {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  font-weight: 500;
}

.export-scene-full-btn-ecran-travail:hover {
  background-color: #21294F;
  color: white;
  border-color: #21294F;
}

.export-raccords-scene-btn-ecran-travail:hover {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.open-add-lieu-btn:hover {
  background-color: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

/* ==================== STYLES POUR LA VUE SÉQUENCE ==================== */

/* Carte de scène dans la vue séquence */
.scene-card-ecran-travail {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.scene-card-ecran-travail:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-color: #21294F;
}

.scene-header-ecran-travail {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.scene-synopsis-ecran-travail {
  color: #666;
  font-size: 14px;
  margin-left: 10px;
}

/* Aperçu des dialogues */
.dialogues-preview-ecran-travail {
  margin: 15px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #21294F;
}

.dialogues-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.view-all-dialogues-btn {
  background: none;
  border: none;
  color: #21294F;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dialogues-preview-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dialogue-preview-item {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  font-size: 13px;
  color: #555;
}

.dialogue-preview-item:last-child {
  border-bottom: none;
}

.more-dialogues {
  font-style: italic;
  color: #999;
  font-size: 12px;
  text-align: center;
  padding: 10px;
}

/* Bouton voir la scène */
.view-scene-btn-ecran-travail {
  display: block;
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background-color: #21294F;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  font-weight: 500;
  transition: background-color 0.3s;
}

.view-scene-btn-ecran-travail:hover {
  background-color: #1a2140;
}

/* Boutons d'actions */
.edit-scene-btn-ecran-travail,
.delete-scene-btn-ecran-travail {
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.edit-scene-btn-ecran-travail:hover {
  background-color: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.delete-scene-btn-ecran-travail:hover {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

/* ==================== STYLES COMMUNS ==================== */

/* Navigation par scènes */
.scene-navigation-ecran-travail {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.scene-navigation-ecran-travail h3 {
  margin-bottom: 10px;
  color: #21294F;
  font-size: 16px;
}

.scene-numbers-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.scene-number-ecran-travail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  height: 35px;
  padding: 0 10px;
  background-color: #e9ecef;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.scene-number-ecran-travail:hover {
  background-color: #dee2e6;
  transform: translateY(-2px);
}

.scene-number-ecran-travail.active-ecran-travail {
  background-color: #21294F;
  color: white;
  border-color: #21294F;
  box-shadow: 0 2px 4px rgba(33, 41, 79, 0.2);
}

.scene-number-ecran-travail.new-scene-ecran-travail {
  background-color: #e3f2fd;
  border: 1px dashed #1976d2;
}

/* Navigation par scène dans le header */
.scene-navigation-buttons {
  display: flex;
  gap: 10px;
  margin-left: 10px;
}

.scene-nav-btn {
  font-size: 12px !important;
  padding: 6px 10px !important;
  background-color: #e9ecef !important;
  color: #495057 !important;
  border: 1px solid #ced4da !important;
}

.scene-nav-btn:hover:not(:disabled) {
  background-color: #dee2e6 !important;
}

/* Animation pour l'icône clignotante */
.blinking-icon-ecran-travail {
  animation: blink 1.5s infinite;
  margin-left: 4px;
  font-size: 10px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Ajustement pour la sidebar des scènes */
.scenes-list-mini {
  max-height: 300px;
  overflow-y: auto;
}

.scene-item-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin: 4px 0;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid #e9ecef;
}

.scene-item-mini:hover {
  background-color: #e9ecef;
}

.scene-item-mini.selected {
  background-color: #21294F;
  color: white;
  border-color: #21294F;
}

.scene-item-mini span {
  font-size: 14px;
}

.scene-item-mini i {
  font-size: 12px;
}
</style>



