<template>
  <div class="left-sidebar-compact" :class="{ 'closed': !open }">
    <!-- BOUTON TOGGLE EN HAUT -->
    <button 
      class="sidebar-toggle" 
      @click="$emit('toggle-left')"
      :title="open ? 'Fermer la sidebar' : 'Ouvrir la sidebar'"
    >
      <i class="fas" :class="open ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
    </button>
    
    <!-- PROJET - Toujours visible en haut -->
    <div class="sidebar-header" v-if="open">
      <div class="project-header" @click="selectItem('project', null)">
        <div class="project-title-container">
        <div class="project-info">
          <i class="fas fa-project-diagram"></i>
          <h4 class="project-title">{{ projetTitle }}</h4>
          <span class="project-status statut-en-cours" :style="{ color: statusColor }">
            {{ projetStatus }}
          </span>
        </div>
        </div>
        <i class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': projectExpanded }"></i>
      </div>
      
      <!-- Détails projet (dépliable) -->
      <div v-if="projectExpanded" class="project-details">
        <p class="synopsis">{{ projetSynopsis || 'Aucun synopsis' }}</p>
        <div class="project-stats">
          <span><i class="fas fa-tv"></i> {{ episodesCount }} épisode(s)</span>
          <span><i class="fas fa-list-ol"></i> {{ totalSequences }} séquence(s)</span>
        </div>
        <div class="project-actions">
          <button @click="$emit('edit-project')" class="icon-btn" title="Modifier">
            <i class="fas fa-pen"></i>
          </button>
          <button @click="$emit('delete-project')" class="icon-btn delete" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation compacte - Mode icône quand fermé -->
    <div class="compact-nav">
      <!-- ÉPISODES -->
      <div class="nav-category">
        <div class="category-header" @click="toggleEpisodesDropdown">
          <div class="category-info">
            <i class="fas fa-tv"></i>
            <template v-if="open">
              <span>Épisodes</span>
              <span class="item-count">{{ episodes?.length || 0 }}</span>
            </template>
          </div>
          <i v-if="open" class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': episodesDropdownOpen }"></i>
        </div>
        
        <div v-if="episodesDropdownOpen && open && episodes?.length" class="category-items">
          <div 
            v-for="episode in episodes" 
            :key="episode.idEpisode"
            class="nav-item"
            :class="{
              'active': sidebarSelection.type === 'episode' && sidebarSelection.id === episode.idEpisode,
              'current': currentEpisode?.idEpisode === episode.idEpisode
            }"
            @click="selectItem('episode', episode.idEpisode)"
          >
            <i class="fas fa-tv"></i>
            <span class="item-text">Épisode {{ episode.ordre }}</span>
            <span class="item-title">{{ episode.titre }}</span>
            <div v-if="episodeHasDetails(episode)" class="has-details-indicator"></div>
          </div>
        </div>
      </div>

      <!-- SÉQUENCES -->
      <div class="nav-category">
        <div class="category-header" @click="toggleSequencesDropdown">
          <div class="category-info">
            <i class="fas fa-list-ol"></i>
            <template v-if="open">
              <span>Séquences</span>
              <span class="item-count">{{ sequences?.length || 0 }}</span>
            </template>
          </div>
          <i v-if="open" class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': sequencesDropdownOpen }"></i>
        </div>
        
        <div v-if="sequencesDropdownOpen && open && sequences?.length" class="category-items">
          <div 
            v-for="sequence in sequences" 
            :key="sequence.idSequence"
            class="nav-item"
            :class="{
              'active': sidebarSelection.type === 'sequence' && sidebarSelection.id === sequence.idSequence,
              'current': currentSequence?.idSequence === sequence.idSequence
            }"
            @click="selectItem('sequence', sequence.idSequence)"
          >
            <i class="fas fa-list-ol"></i>
            <span class="item-text">Séquence {{ sequence.ordre }}</span>
            <span class="item-title">{{ sequence.titre }}</span>
            <div v-if="sequence.synopsis" class="has-details-indicator"></div>
          </div>
        </div>
      </div>

      <!-- SCÈNES -->
      <div class="nav-category">
        <div class="category-header" @click="toggleScenesDropdown">
          <div class="category-info">
            <i class="fas fa-film"></i>
            <template v-if="open">
              <span>Scènes</span>
              <span class="item-count">{{ scenes?.length || 0 }}</span>
            </template>
          </div>
          <i v-if="open" class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': scenesDropdownOpen }"></i>
        </div>
        
        <div v-if="scenesDropdownOpen && open && scenes?.length" class="category-items">
          <div 
            v-for="scene in scenes" 
            :key="scene.idScene"
            class="nav-item"
            :class="{
              'active': sidebarSelection.type === 'scene' && sidebarSelection.id === scene.idScene,
              'current': currentScene?.idScene === scene.idScene
            }"
            @click="selectItem('scene', scene.idScene)"
          >
            <i class="fas fa-film"></i>
            <span class="item-text">Scène {{ scene.ordre }}</span>
            <span class="item-title">{{ scene.titre }}</span>
            <div v-if="scene.synopsis" class="has-details-indicator"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions globales - Seulement quand ouvert -->
    <!-- <div class="sidebar-footer" v-if="open">
      <button v-if="userPermissions?.canCreateEpisode" class="action-btn" @click="$emit('add-episode')">
        <i class="fas fa-plus"></i>
        <span>Nouvel épisode</span>
      </button>
      <button v-if="userPermissions?.canCreateSequence" class="action-btn" @click="$emit('add-sequence')">
        <i class="fas fa-plus"></i>
        <span>Nouvelle séquence</span>
      </button>
      <button v-if="userPermissions?.canCreateScene" class="action-btn" @click="$emit('add-scene')">
        <i class="fas fa-plus"></i>
        <span>Nouvelle scène</span>
      </button>
    </div>
     -->
    <!-- Quick Actions en mode fermé -->
    <!-- <div class="quick-actions-closed" v-if="!open">
      <button v-if="userPermissions?.canCreateEpisode" class="icon-btn-closed" @click="$emit('add-episode')" title="Nouvel épisode">
        <i class="fas fa-plus"></i>
      </button>
      <button v-if="userPermissions?.canCreateSequence" class="icon-btn-closed" @click="$emit('add-sequence')" title="Nouvelle séquence">
        <i class="fas fa-plus"></i>
      </button>
      <button v-if="userPermissions?.canCreateScene" class="icon-btn-closed" @click="$emit('add-scene')" title="Nouvelle scène">
        <i class="fas fa-plus"></i>
      </button>
    </div> -->
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: true
  },
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
  userPermissions: Object,
  sidebarSelection: Object
});

const emit = defineEmits([
  'toggle-left',
  'edit-project',
  'delete-project',
  'add-episode',
  'add-sequence',
  'add-scene',
  'select-item'
]);

// État local
const projectExpanded = ref(false);
const episodesDropdownOpen = ref(false);
const sequencesDropdownOpen = ref(false);
const scenesDropdownOpen = ref(false);

// Méthodes
const openProjectDetails = () => {
  projectExpanded.value = !projectExpanded.value;
};

const toggleEpisodesDropdown = () => {
  if (!props.open) {
    episodesDropdownOpen.value = !episodesDropdownOpen.value;
    if (episodesDropdownOpen.value) {
      sequencesDropdownOpen.value = false;
      scenesDropdownOpen.value = false;
    }
    return;
  }
  
  episodesDropdownOpen.value = !episodesDropdownOpen.value;
  if (episodesDropdownOpen.value) {
    sequencesDropdownOpen.value = false;
    scenesDropdownOpen.value = false;
  }
};

const toggleSequencesDropdown = () => {
  if (!props.open) {
    sequencesDropdownOpen.value = !sequencesDropdownOpen.value;
    if (sequencesDropdownOpen.value) {
      episodesDropdownOpen.value = false;
      scenesDropdownOpen.value = false;
    }
    return;
  }
  
  sequencesDropdownOpen.value = !sequencesDropdownOpen.value;
  if (sequencesDropdownOpen.value) {
    episodesDropdownOpen.value = false;
    scenesDropdownOpen.value = false;
  }
};

const toggleScenesDropdown = () => {
  if (!props.open) {
    scenesDropdownOpen.value = !scenesDropdownOpen.value;
    if (scenesDropdownOpen.value) {
      episodesDropdownOpen.value = false;
      sequencesDropdownOpen.value = false;
    }
    return;
  }
  
  scenesDropdownOpen.value = !scenesDropdownOpen.value;
  if (scenesDropdownOpen.value) {
    episodesDropdownOpen.value = false;
    sequencesDropdownOpen.value = false;
  }
};

const selectItem = (type, id) => {
  if (type !== 'project') {
    projectExpanded.value = false;
  }
  
  if (type === 'episode') {
    episodesDropdownOpen.value = true;
    sequencesDropdownOpen.value = false;
    scenesDropdownOpen.value = false;
  } else if (type === 'sequence') {
    sequencesDropdownOpen.value = true;
    episodesDropdownOpen.value = false;
    scenesDropdownOpen.value = false;
  } else if (type === 'scene') {
    scenesDropdownOpen.value = true;
    episodesDropdownOpen.value = false;
    sequencesDropdownOpen.value = false;
  }
  
  emit('select-item', { type, id });
};

const episodeHasDetails = (episode) => {
  return episode.synopsis || episode.realisateur || episode.scenariste;
};
</script>

