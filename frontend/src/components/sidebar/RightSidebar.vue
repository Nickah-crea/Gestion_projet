<template>
  <div class="right-sidebar" :class="{ 'open': open }">
    <!-- Bouton toggle en haut -->
    <button class="sidebar-toggle" @click="$emit('toggle')" :title="open ? 'Fermer la sidebar' : 'Ouvrir la sidebar'">
      <i class="fas" :class="open ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
    </button>
    
    <!-- Contenu de la sidebar -->
    <div class="sidebar-content">
      <!-- Bouton Calendrier (toujours visible) -->
      <button 
        class="sidebar-btn" 
        @click="$emit('go-to-calendrier')"
        :title="open ? '' : 'Calendrier'"
      >
        <i class="fas fa-calendar-alt"></i>
        <span v-if="open">Calendrier</span>
      </button>

      <!-- Section Export -->
      <div class="export-section">
        <h4 v-if="open" class="sidebar-section-title">Exporter</h4>
        <div class="export-options">
          <button 
            v-if="currentSequence" 
            class="export-option" 
            @click="$emit('export-scenes-only')"
            :title="open ? 'Exporter les scènes en PDF' : 'Scènes PDF'"
          >
            <i class="fas fa-file-pdf"></i>
            <span v-if="open">Scènes PDF</span>
          </button>

          <button 
            v-if="currentSequence" 
            class="export-option" 
            @click="$emit('export-sequence-dialogues')"
            :title="open ? 'Exporter les dialogues en PDF' : 'Dialogues PDF'"
          >
            <i class="fas fa-file-pdf"></i>
            <span v-if="open">Dialogues PDF</span>
          </button>

          <button 
            v-if="currentSequence" 
            class="export-option" 
            @click="$emit('export-sequence-complete')"
            :title="open ? 'Exporter la séquence complète en PDF' : 'Séquence PDF'"
          >
            <i class="fas fa-file-pdf"></i>
            <span v-if="open">Séquence PDF</span>
          </button>

          <button 
            v-if="currentEpisode" 
            class="export-option" 
            @click="$emit('export-episode')"
            :title="open ? 'Exporter l\'épisode en PDF' : 'Épisode PDF'"
          >
            <i class="fas fa-file-pdf"></i>
            <span v-if="open">Épisode PDF</span>
          </button>
        </div>
      </div>

      <!-- Section Ajouter -->
      <div class="quick-links-section">
        <h4 v-if="open" class="sidebar-section-title">Ajouter</h4>
        <div class="quick-links">
          <button 
            v-if="showAddEpisode" 
            class="sidebar-btn" 
            @click="$emit('add-episode')"
            :title="open ? '' : 'Ajouter un épisode'"
          >
            <i class="fas fa-plus-circle"></i>
            <span v-if="open">Épisode</span>
          </button>
          
          <button 
            v-if="userPermissions.canCreateSequence" 
            class="sidebar-btn" 
            @click="$emit('add-sequence')"
            :title="open ? '' : 'Ajouter une séquence'"
          >
            <i class="fas fa-plus-circle"></i>
            <span v-if="open">Séquence</span>
          </button>
          
          <button 
            v-if="userPermissions.canCreateLieu" 
            class="sidebar-btn" 
            @click="$emit('add-lieu')"
            :title="open ? '' : 'Ajouter un lieu'"
          >
            <i class="fas fa-plus-circle"></i>
            <span v-if="open">Lieu</span>
          </button>
          
          <button 
            v-if="userPermissions.canCreatePlateau" 
            class="sidebar-btn" 
            @click="$emit('add-plateau')"
            :title="open ? '' : 'Ajouter un plateau'"
          >
            <i class="fas fa-plus-circle"></i>
            <span v-if="open">Plateau</span>
          </button>
          
          <button 
            v-if="userPermissions.canCreateComedien" 
            class="sidebar-btn" 
            @click="$emit('add-comedien')"
            :title="open ? '' : 'Ajouter un comédien'"
          >
            <i class="fas fa-plus-circle"></i>
            <span v-if="open">Comédien</span>
          </button>
          
          <button 
            v-if="userPermissions.canCreatePersonnage" 
            class="sidebar-btn" 
            @click="$emit('add-personnage')"
            :title="open ? '' : 'Ajouter un personnage'"
          >
            <i class="fas fa-plus-circle"></i>
            <span v-if="open">Personnage</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  currentEpisode: {
    type: Object,
    default: null
  },
  currentSequence: {
    type: Object,
    default: null
  },
  episodes: {
    type: Array,
    default: () => []
  },
  userPermissions: {
    type: Object,
    default: () => ({
      canEditEpisode: false,
      canCreateSequence: false,
      canCreateScene: false,
      canCreateDialogue: false,
      canCreateLieu: false,
      canCreatePlateau: false,
      canCreateComedien: false,
      canCreatePersonnage: false
    })
  },
  isSceneMode: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits([
  'toggle',
  'go-to-calendrier',
  'export-scenes-only',
  'export-sequence-dialogues',
  'export-sequence-complete',
  'export-episode',
  'add-episode',
  'add-sequence',
  'add-lieu',
  'add-plateau',
  'add-comedien',
  'add-personnage'
]);

// Computed
const showAddEpisode = computed(() => {
  return props.episodes.length === 0 || props.userPermissions.canEditEpisode;
});
</script>








