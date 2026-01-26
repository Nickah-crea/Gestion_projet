<template>
  <div class="left-sidebar-projet-scenariste" :class="{ 'closed': !open }">
    <!-- Mode ouvert -->
    <template v-if="open">
      <!-- En-tête de la sidebar -->
      <div class="sidebar-header-projet-scenariste">
        <h2 class="sidebar-title-projet-scenariste">
          <i class="fas fa-film"></i>
          Navigation
        </h2>
      </div>

      <!-- Bouton toggle pour ouvrir/fermer -->
      <button 
        class="sidebar-toggle-btn-projet-scenariste" 
        @click="$emit('toggle-left')"
        title="Fermer la sidebar"
      >
        <i class="fas fa-chevron-left"></i>
        <span>Fermer</span>
      </button>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-projet-scenariste">
        <h3 class="section-title-projet-scenariste">
          <i class="fas fa-bolt"></i> 
          <span>Actions</span>
        </h3>
        <div class="sidebar-actions-projet-scenariste">
          <button 
            v-if="userRole !== 'UTILISATEUR'"
            @click="$emit('add-episode')" 
            class="sidebar-btn-projet-scenariste nouvel-episode-btn" 
          >
            <i class="fas fa-plus"></i>
            <span>Nouvel épisode</span>
          </button>
          <button 
            @click="goToDashboard" 
            class="sidebar-btn-projet-scenariste back-btn"
          >
            <i class="fas fa-arrow-left"></i>
            <span>Retour au tableau</span>
          </button>
        </div>
      </div>

      <!-- Détails du projet -->
      <div class="project-details-sidebar-projet-scenariste" @click="selectItem('project', null)">
        <div class="project-header-sidebar-projet-scenariste">
          <div class="project-title-container-sidebar">
            <i class="fas fa-project-diagram"></i>
            <div class="project-info-sidebar">
              <h4 class="project-title-sidebar">{{ projetTitle }}</h4>
              <span class="project-status-sidebar" :class="getStatutClass(projetStatus)">
                {{ projetStatus }}
              </span>
            </div>
          </div>
          <i class="fas fa-chevron-right project-chevron"></i>
        </div>
      </div>

      <!-- Navigation par catégories -->
      <div class="navigation-sections-projet-scenariste">
        <!-- ÉPISODES -->
        <div class="sidebar-section-projet-scenariste">
          <div class="category-header-projet-scenariste" @click="toggleEpisodesDropdown">
            <h3 class="section-title-projet-scenariste">
              <i class="fas fa-tv"></i>
              <span>Épisodes</span>
              <span class="item-count">{{ episodes?.length || 0 }}</span>
            </h3>
            <i class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': episodesDropdownOpen }"></i>
          </div>
          
          <div v-if="episodesDropdownOpen && episodes?.length" class="category-items-projet-scenariste">
            <div 
              v-for="episode in episodes" 
              :key="episode.idEpisode"
              class="nav-item-projet-scenariste"
              :class="{
                'active': sidebarSelection.type === 'episode' && sidebarSelection.id === episode.idEpisode,
                'current': currentEpisode?.idEpisode === episode.idEpisode
              }"
              @click="selectItem('episode', episode.idEpisode)"
            >
              <i class="fas fa-tv"></i>
              <div class="nav-item-content">
                <span class="nav-item-title">Épisode {{ episode.ordre }}</span>
                <span class="nav-item-subtitle">{{ episode.titre }}</span>
              </div>
              <div v-if="episodeHasDetails(episode)" class="has-details-indicator"></div>
            </div>
          </div>
        </div>

        <!-- SÉQUENCES -->
        <div class="sidebar-section-projet-scenariste">
          <div class="category-header-projet-scenariste" @click="toggleSequencesDropdown">
            <h3 class="section-title-projet-scenariste">
              <i class="fas fa-list-ol"></i>
              <span>Séquences</span>
              <span class="item-count">{{ sequences?.length || 0 }}</span>
            </h3>
            <i class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': sequencesDropdownOpen }"></i>
          </div>
          
          <div v-if="sequencesDropdownOpen && sequences?.length" class="category-items-projet-scenariste">
            <div 
              v-for="sequence in sequences" 
              :key="sequence.idSequence"
              class="nav-item-projet-scenariste"
              :class="{
                'active': sidebarSelection.type === 'sequence' && sidebarSelection.id === sequence.idSequence,
                'current': currentSequence?.idSequence === sequence.idSequence
              }"
              @click="selectItem('sequence', sequence.idSequence)"
            >
              <i class="fas fa-list-ol"></i>
              <div class="nav-item-content">
                <span class="nav-item-title">Séquence {{ sequence.ordre }}</span>
                <span class="nav-item-subtitle">{{ sequence.titre }}</span>
              </div>
              <div v-if="sequence.synopsis" class="has-details-indicator"></div>
            </div>
          </div>
        </div>

        <!-- SCÈNES -->
        <div class="sidebar-section-projet-scenariste">
          <div class="category-header-projet-scenariste" @click="toggleScenesDropdown">
            <h3 class="section-title-projet-scenariste">
              <i class="fas fa-film"></i>
              <span>Scènes</span>
              <span class="item-count">{{ scenes?.length || 0 }}</span>
            </h3>
            <i class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': scenesDropdownOpen }"></i>
          </div>
          
          <div v-if="scenesDropdownOpen && scenes?.length" class="category-items-projet-scenariste">
            <div 
              v-for="scene in scenes" 
              :key="scene.idScene"
              class="nav-item-projet-scenariste"
              :class="{
                'active': sidebarSelection.type === 'scene' && sidebarSelection.id === scene.idScene,
                'current': currentScene?.idScene === scene.idScene
              }"
              @click="selectItem('scene', scene.idScene)"
            >
              <i class="fas fa-film"></i>
              <div class="nav-item-content">
                <span class="nav-item-title">Scène {{ scene.ordre }}</span>
                <span class="nav-item-subtitle">{{ scene.titre }}</span>
              </div>
              <div v-if="scene.synopsis" class="has-details-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Mode fermé -->
    <template v-else>
      <!-- Bouton pour rouvrir la sidebar -->
      <button 
        class="sidebar-toggle-btn-projet-scenariste closed-mode" 
        @click="$emit('toggle-left')"
        title="Ouvrir la sidebar"
      >
        <i class="fas fa-chevron-right"></i>
      </button>

      <!-- Projet en mode icône -->
      <div 
        class="icon-item-closed" 
        @click="selectItem('project', null)"
        :class="{ 'active': sidebarSelection.type === 'project' }"
        title="Projet"
      >
        <i class="fas fa-project-diagram"></i>
        <span class="icon-badge" v-if="projetStatus" :class="getStatutClass(projetStatus)"></span>
      </div>

      <!-- Espacement -->
      <div class="closed-spacer"></div>

      <!-- Actions rapides en mode icône -->
      <div class="quick-actions-closed-projet-scenariste">
        <button 
          v-if="userRole !== 'UTILISATEUR'"
          @click="$emit('add-episode')" 
          class="icon-btn-closed" 
          title="Nouvel épisode"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button 
          @click="goToDashboard" 
          class="icon-btn-closed" 
          title="Retour au tableau"
        >
          <i class="fas fa-home"></i>
        </button>
      </div>

      <!-- Épisodes en mode icône -->
      <div v-if="episodes?.length" class="category-closed">
        <div class="category-header-closed" @click="toggleEpisodesDropdown" :title="`${episodes.length} épisode(s)`">
          <i class="fas fa-tv"></i>
          <span class="item-count-closed">{{ episodes?.length || 0 }}</span>
        </div>
        
        <div v-if="episodesDropdownOpen" class="category-items-closed">
          <div 
            v-for="episode in episodes" 
            :key="episode.idEpisode"
            class="nav-item-closed"
            :class="{
              'active': sidebarSelection.type === 'episode' && sidebarSelection.id === episode.idEpisode,
              'current': currentEpisode?.idEpisode === episode.idEpisode
            }"
            @click="selectItem('episode', episode.idEpisode)"
            :title="`Épisode ${episode.ordre}: ${episode.titre}`"
          >
            <i class="fas fa-tv"></i>
            <span class="item-order-closed">{{ episode.ordre }}</span>
            <div v-if="episodeHasDetails(episode)" class="has-details-indicator-closed"></div>
          </div>
        </div>
      </div>

      <!-- Espacement -->
      <div v-if="episodes?.length" class="closed-spacer-small"></div>

      <!-- Séquences en mode icône -->
      <div v-if="sequences?.length" class="category-closed">
        <div class="category-header-closed" @click="toggleSequencesDropdown" :title="`${sequences.length} séquence(s)`">
          <i class="fas fa-list-ol"></i>
          <span class="item-count-closed">{{ sequences?.length || 0 }}</span>
        </div>
        
        <div v-if="sequencesDropdownOpen" class="category-items-closed">
          <div 
            v-for="sequence in sequences" 
            :key="sequence.idSequence"
            class="nav-item-closed"
            :class="{
              'active': sidebarSelection.type === 'sequence' && sidebarSelection.id === sequence.idSequence,
              'current': currentSequence?.idSequence === sequence.idSequence
            }"
            @click="selectItem('sequence', sequence.idSequence)"
            :title="`Séquence ${sequence.ordre}: ${sequence.titre}`"
          >
            <i class="fas fa-list-ol"></i>
            <span class="item-order-closed">{{ sequence.ordre }}</span>
            <div v-if="sequence.synopsis" class="has-details-indicator-closed"></div>
          </div>
        </div>
      </div>

      <!-- Espacement -->
      <div v-if="sequences?.length" class="closed-spacer-small"></div>

      <!-- Scènes en mode icône -->
      <div v-if="scenes?.length" class="category-closed">
        <div class="category-header-closed" @click="toggleScenesDropdown" :title="`${scenes.length} scène(s)`">
          <i class="fas fa-film"></i>
          <span class="item-count-closed">{{ scenes?.length || 0 }}</span>
        </div>
        
        <div v-if="scenesDropdownOpen" class="category-items-closed">
          <div 
            v-for="scene in scenes" 
            :key="scene.idScene"
            class="nav-item-closed"
            :class="{
              'active': sidebarSelection.type === 'scene' && sidebarSelection.id === scene.idScene,
              'current': currentScene?.idScene === scene.idScene
            }"
            @click="selectItem('scene', scene.idScene)"
            :title="`Scène ${scene.ordre}: ${scene.titre}`"
          >
            <i class="fas fa-film"></i>
            <span class="item-order-closed">{{ scene.ordre }}</span>
            <div v-if="scene.synopsis" class="has-details-indicator-closed"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  open: {
    type: Boolean,
    default: true
  },
  projetTitle: String,
  projetStatus: String,
  currentEpisode: Object,
  currentSequence: Object,
  currentScene: Object,
  episodes: Array,
  sequences: Array,
  scenes: Array,
  userRole: {
    type: String,
    default: 'UTILISATEUR'
  },
  sidebarSelection: {
    type: Object,
    default: () => ({})
  }
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
const episodesDropdownOpen = ref(false);
const sequencesDropdownOpen = ref(false);
const scenesDropdownOpen = ref(false);

// Méthodes
const toggleEpisodesDropdown = () => {
  episodesDropdownOpen.value = !episodesDropdownOpen.value;
  if (episodesDropdownOpen.value) {
    sequencesDropdownOpen.value = false;
    scenesDropdownOpen.value = false;
  }
};

const toggleSequencesDropdown = () => {
  sequencesDropdownOpen.value = !sequencesDropdownOpen.value;
  if (sequencesDropdownOpen.value) {
    episodesDropdownOpen.value = false;
    scenesDropdownOpen.value = false;
  }
};

const toggleScenesDropdown = () => {
  scenesDropdownOpen.value = !scenesDropdownOpen.value;
  if (scenesDropdownOpen.value) {
    episodesDropdownOpen.value = false;
    sequencesDropdownOpen.value = false;
  }
};

const selectItem = (type, id) => {
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

const getStatutClass = (statutNom) => {
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
};

const goToDashboard = () => {
  router.push('/scenariste');
};
</script>


