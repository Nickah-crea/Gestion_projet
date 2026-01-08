<template>
  <div class="left-sidebar">
    <!-- Panneau gauche - Navigation (60px) -->
    <div class="sidebar-nav">
      <!-- PROJET - Toujours en haut -->
      <button 
        class="nav-item project-item main-item" 
        :class="{ 'active': activeSection === 'project' }"
        @click="openSection('project')"
        :title="projetTitle"
      >
        <i class="fas fa-project-diagram"></i>
        <span class="nav-label">Projet</span>
      </button>
      
      <!-- Séparateur -->
      <div class="nav-separator" v-if="episodes && episodes.length > 0"></div>
      
      <!-- ÉPISODES - Section -->
      <div v-if="episodes && episodes.length > 0" class="nav-section">
        <div class="nav-section-header" @click="toggleEpisodesSection">
          <i class="fas fa-tv"></i>
          <span class="nav-label">Épisodes ({{ episodes.length }})</span>
          <i class="fas episodes-toggle" :class="episodesCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
        </div>
        
        <div v-if="!episodesCollapsed" class="nav-items">
          <button 
            v-for="episode in episodes" 
            :key="episode.idEpisode"
            class="nav-item episode-item sub-item"
            :class="{ 
              'active': activeSection === 'episode' && activeId === episode.idEpisode,
              'has-details': episode.synopsis || episode.realisateur || episode.scenariste,
              'current': currentEpisode && currentEpisode.idEpisode === episode.idEpisode
            }"
            @click="openEpisode(episode)"
            :title="`Épisode ${episode.ordre}: ${episode.titre}`"
          >
            <i class="fas fa-tv sub-icon"></i>
            <span class="item-number">{{ episode.ordre }}</span>
          </button>
        </div>
      </div>
      
      <!-- SÉQUENCES - Section -->
      <div v-if="sequences && sequences.length > 0" class="nav-section">
        <div class="nav-section-header" @click="toggleSequencesSection">
          <i class="fas fa-list-ol"></i>
          <span class="nav-label">Séquences ({{ sequences.length }})</span>
          <i class="fas sequences-toggle" :class="sequencesCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
        </div>
        
        <div v-if="!sequencesCollapsed" class="nav-items">
          <button 
            v-for="sequence in sequences" 
            :key="sequence.idSequence"
            class="nav-item sequence-item sub-item"
            :class="{ 
              'active': activeSection === 'sequence' && activeId === sequence.idSequence,
              'has-details': sequence.synopsis,
              'current': currentSequence && currentSequence.idSequence === sequence.idSequence
            }"
            @click="openSequence(sequence)"
            :title="`Séquence ${sequence.ordre}: ${sequence.titre}`"
          >
            <i class="fas fa-list-ol sub-icon"></i>
            <span class="item-number">{{ sequence.ordre }}</span>
          </button>
        </div>
      </div>
      
      <!-- SCÈNES - Section -->
      <div v-if="scenes && scenes.length > 0" class="nav-section">
        <div class="nav-section-header" @click="toggleScenesSection">
          <i class="fas fa-film"></i>
          <span class="nav-label">Scènes ({{ scenes.length }})</span>
          <i class="fas scenes-toggle" :class="scenesCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
        </div>
        
        <div v-if="!scenesCollapsed" class="nav-items">
          <button 
            v-for="scene in scenes" 
            :key="scene.idScene"
            class="nav-item scene-item sub-item"
            :class="{ 
              'active': activeSection === 'scene' && activeId === scene.idScene,
              'has-details': scene.synopsis,
              'current': currentScene && currentScene.idScene === scene.idScene
            }"
            @click="openScene(scene)"
            :title="`Scène ${scene.ordre}: ${scene.titre}`"
          >
            <i class="fas fa-film sub-icon"></i>
            <span class="item-number">{{ scene.ordre }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Panneau droit - Détails (250px) -->
    <div class="sidebar-details" :class="{ 'open': detailsOpen }">
      <div class="details-header">
        <button class="close-details" @click="closeDetails" title="Fermer les détails">
          <i class="fas fa-times"></i>
        </button>
        <h3 class="details-title">{{ detailsTitle }}</h3>
      </div>
      
      <div class="details-content">
        <!-- DÉTAILS DU PROJET -->
        <div v-if="activeSection === 'project' && detailsOpen" class="details-section">
          <!-- Synopsis du projet -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ projetSynopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut du projet -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span 
                class="status-badge" 
                :style="{ backgroundColor: statusColor }"
              >
                {{ projetStatus }}
              </span>
            </div>
          </div>
          
          <!-- Nombres d'épisodes et séquences -->
          <div class="info-section">
            <label class="info-label">Contenu</label>
            <div class="stats-container">
              <div class="stat-item">
                <i class="fas fa-film"></i>
                <span>{{ episodesCount }} épisode(s)</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-list-ol"></i>
                <span>{{ totalSequences }} séquence(s)</span>
              </div>
            </div>
          </div>
          
          <!-- Actions (Modifier/Supprimer) -->
          <div class="actions-section">
            <button 
              class="action-btn edit-btn"
              @click="$emit('edit-project')"
              title="Modifier le projet"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="$emit('delete-project')"
              title="Supprimer le projet"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
        
        <!-- DÉTAILS DE L'ÉPISODE -->
        <div v-if="activeSection === 'episode' && activeEpisode && detailsOpen" class="details-section">
          <!-- Synopsis de l'épisode -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ activeEpisode.synopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut de l'épisode -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span class="status-badge">
                {{ activeEpisode.statutNom || 'Non défini' }}
              </span>
            </div>
          </div>
          
          <!-- Équipe de l'épisode -->
          <div v-if="activeEpisode.realisateur || activeEpisode.scenariste" class="info-section">
            <label class="info-label">Équipe</label>
            <div class="team-container">
              <div v-if="activeEpisode.realisateur" class="team-member">
                <i class="fas fa-video"></i>
                <span>Réalisateur: {{ activeEpisode.realisateur.nom }}</span>
              </div>
              <div v-if="activeEpisode.scenariste" class="team-member">
                <i class="fas fa-pen"></i>
                <span>Scénariste: {{ activeEpisode.scenariste.nom }}</span>
              </div>
            </div>
          </div>
          
          <!-- Actions (Modifier/Supprimer) -->
          <div v-if="userPermissions.canEditEpisode" class="actions-section">
            <button 
              class="action-btn edit-btn"
              @click="$emit('edit-episode', activeEpisode)"
              title="Modifier l'épisode"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="$emit('delete-episode', activeEpisode.idEpisode)"
              title="Supprimer l'épisode"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
        
        <!-- DÉTAILS DE LA SÉQUENCE -->
        <div v-if="activeSection === 'sequence' && activeSequence && detailsOpen" class="details-section">
          <!-- Synopsis de la séquence -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ activeSequence.synopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut de la séquence -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span class="status-badge">
                {{ activeSequence.statutNom || 'Non défini' }}
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
                @click="$emit('view-sequence-comments', activeSequence.idSequence)"
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
              @click="$emit('edit-sequence', activeSequence)"
              title="Modifier la séquence"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="$emit('delete-sequence', activeSequence.idSequence)"
              title="Supprimer la séquence"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
        
        <!-- DÉTAILS DE LA SCÈNE -->
        <div v-if="activeSection === 'scene' && activeScene && detailsOpen" class="details-section">
          <!-- Synopsis de la scène -->
          <div class="info-section">
            <label class="info-label">Synopsis</label>
            <p class="info-content">{{ activeScene.synopsis || 'Aucun synopsis' }}</p>
          </div>
          
          <!-- Statut de la scène -->
          <div class="info-section">
            <label class="info-label">Statut</label>
            <div class="status-container">
              <span class="status-badge">
                {{ activeScene.statutNom || 'Non défini' }}
              </span>
            </div>
          </div>
          
          <!-- Commentaires -->
          <div class="info-section">
            <label class="info-label">Commentaires</label>
            <div class="comment-count">
              <i class="fas fa-comments"></i>
              <span>{{ sceneCommentCount }} commentaire(s)</span>
            </div>
          </div>
          
          <!-- Actions (Modifier/Supprimer) -->
          <div v-if="userPermissions.canCreateScene" class="actions-section">
            <button 
              class="action-btn edit-btn"
              @click="$emit('edit-scene', activeScene)"
              title="Modifier la scène"
            >
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button 
              class="action-btn delete-btn"
              @click="$emit('delete-scene', activeScene.idScene)"
              title="Supprimer la scène"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
        
        <!-- MESSAGE SI AUCUN ÉLÉMENT SÉLECTIONNÉ -->
        <div v-if="!activeSection && detailsOpen" class="no-selection">
          <i class="fas fa-info-circle"></i>
          <p>Sélectionnez un élément pour voir ses détails</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
  projetTitle: String,
  projetSynopsis: String,
  statusColor: String,
  projetStatus: String,
  episodesCount: Number,
  totalSequences: Number,
  currentEpisode: Object,
  currentSequence: Object,
  currentScene: Object,
  episodes: Array,
  sequences: Array,
  scenes: Array,
  sequenceCommentCount: Number,
  sceneCommentCount: Number,
  userPermissions: Object
});

// Emits
const emit = defineEmits([
  'edit-project',
  'delete-project',
  'edit-episode',
  'delete-episode',
  'edit-sequence',
  'delete-sequence',
  'edit-scene',
  'delete-scene',
  'view-sequence-comments',
  'select-scene',
  'select-episode',
  'select-sequence'
]);

// Local state
const activeSection = ref('project');
const activeId = ref(null);
const detailsOpen = ref(true);
const activeEpisode = ref(null);
const activeSequence = ref(null);
const activeScene = ref(null);
const episodesCollapsed = ref(false);
const sequencesCollapsed = ref(false);
const scenesCollapsed = ref(false);

// Computed
const detailsTitle = computed(() => {
  switch (activeSection.value) {
    case 'project':
      return props.projetTitle;
    case 'episode':
      return activeEpisode.value ? `Épisode ${activeEpisode.value.ordre}: ${activeEpisode.value.titre}` : '';
    case 'sequence':
      return activeSequence.value ? `Séquence ${activeSequence.value.ordre}: ${activeSequence.value.titre}` : '';
    case 'scene':
      return activeScene.value ? `Scène ${activeScene.value.ordre}: ${activeScene.value.titre}` : '';
    default:
      return '';
  }
});

// Methods
const openSection = (section) => {
  activeSection.value = section;
  activeId.value = null;
  
  if (section === 'project') {
    // Garder les références aux éléments actuels
    activeEpisode.value = props.currentEpisode;
    activeSequence.value = props.currentSequence;
    activeScene.value = props.currentScene;
  } else {
    activeEpisode.value = null;
    activeSequence.value = null;
    activeScene.value = null;
  }
  
  detailsOpen.value = true;
};

const openEpisode = (episode) => {
  activeSection.value = 'episode';
  activeId.value = episode.idEpisode;
  activeEpisode.value = episode;
  activeSequence.value = null;
  activeScene.value = null;
  detailsOpen.value = true;
  
  // Émettre l'événement pour sélectionner l'épisode
  emit('select-episode', episode.idEpisode);
};

const openSequence = (sequence) => {
  activeSection.value = 'sequence';
  activeId.value = sequence.idSequence;
  activeEpisode.value = null;
  activeSequence.value = sequence;
  activeScene.value = null;
  detailsOpen.value = true;
  
  // Émettre l'événement pour sélectionner la séquence
  emit('select-sequence', sequence.idSequence);
};

const openScene = (scene) => {
  activeSection.value = 'scene';
  activeId.value = scene.idScene;
  activeEpisode.value = null;
  activeSequence.value = null;
  activeScene.value = scene;
  detailsOpen.value = true;
  
  // Émettre l'événement pour sélectionner la scène
  emit('select-scene', scene.idScene);
};

const closeDetails = () => {
  detailsOpen.value = false;
};

const toggleEpisodesSection = () => {
  episodesCollapsed.value = !episodesCollapsed.value;
};

const toggleSequencesSection = () => {
  sequencesCollapsed.value = !sequencesCollapsed.value;
};

const toggleScenesSection = () => {
  scenesCollapsed.value = !scenesCollapsed.value;
};

// Watchers pour synchroniser avec les props
watch(() => props.currentEpisode, (newEpisode) => {
  if (newEpisode && activeSection.value === 'episode' && activeId.value === newEpisode.idEpisode) {
    activeEpisode.value = newEpisode;
  }
});

watch(() => props.currentSequence, (newSequence) => {
  if (newSequence && activeSection.value === 'sequence' && activeId.value === newSequence.idSequence) {
    activeSequence.value = newSequence;
  }
});

watch(() => props.currentScene, (newScene) => {
  if (newScene && activeSection.value === 'scene' && activeId.value === newScene.idScene) {
    activeScene.value = newScene;
  }
});

// Initialiser avec le projet
openSection('project');
</script>


