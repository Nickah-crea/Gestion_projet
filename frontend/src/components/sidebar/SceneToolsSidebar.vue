<template>
  <div 
    class="scene-tools-sidebar" 
    :class="{ 
      'open': isOpen,
      'without-right-sidebar': !rightSidebarOpen,
      'with-right-sidebar': rightSidebarOpen
    }"
  >
    <!-- En-tête de la sidebar -->
    <div class="sidebar-header">
      <h3><i class="fas fa-tools"></i> Outils Scène</h3>
      <button class="close-btn" @click="closeSidebar" title="Fermer">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <!-- Contenu de la sidebar -->
    <div class="sidebar-content">
      
      <!-- Section Raccords Photos -->
      <div class="tools-section">
        <h4><i class="fas fa-images"></i> Raccords Photos</h4>
        <RaccordsPhotosComponent 
          :scene-id="scene?.idScene"
          :scene-info="scene"
          @raccords-updated="onRaccordsUpdated"
        />
      </div>
      
      <!-- Section Création Raccord -->
      <div class="tools-section">
        <h4><i class="fas fa-link"></i> Créer un Raccord</h4>
        <RaccordSceneComponent 
          :projet-id="projetId"
          :episode-id="episodeId"
          :sequence-id="sequenceId"
          :scene-source-id="scene?.idScene"
          @raccord-created="onRaccordCreated"
        />
      </div>
      
      <!-- Section Actions Rapides -->
      <div class="tools-section">
        <h4><i class="fas fa-bolt"></i> Actions Rapides</h4>
        <div class="quick-actions">
          <button class="action-btn" @click="openAddLieuModal" title="Ajouter un lieu/plateau">
            <i class="fas fa-map-marker-alt"></i>
            <span>Lieu/Plateau</span>
          </button>
          
          <button class="action-btn" @click="exportScenePDF" title="Exporter cette scène en PDF">
            <i class="fas fa-file-pdf"></i>
            <span>Exporter PDF</span>
          </button>
          
          <button class="action-btn" @click="exportRaccordsWithImages" title="Exporter les raccords avec images">
            <i class="fas fa-file-image"></i>
            <span>Raccords + Images</span>
          </button>
          
          <button class="action-btn" @click="startAddDialogue" title="Ajouter un dialogue">
            <i class="fas fa-comment-medical"></i>
            <span>Nouveau dialogue</span>
          </button>
          
          <button class="action-btn" @click="openEmailModal" title="Envoyer par email">
            <i class="fas fa-envelope"></i>
            <span>Envoyer par email</span>
          </button>
          
          <button class="action-btn" @click="toggleComments" title="Afficher/masquer les commentaires">
            <i class="fas fa-comments"></i>
            <span>Commentaires</span>
            <span class="badge" v-if="commentCount > 0">{{ commentCount }}</span>
          </button>
        </div>
      </div>
      
      <!-- Section Statistiques -->
      <div class="tools-section" v-if="scene">
        <h4><i class="fas fa-chart-bar"></i> Statistiques</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <i class="fas fa-comment"></i>
            <div class="stat-info">
              <span class="stat-value">{{ scene.dialogues?.length || 0 }}</span>
              <span class="stat-label">Dialogues</span>
            </div>
          </div>
          
          <div class="stat-item">
            <i class="fas fa-image"></i>
            <div class="stat-info">
              <span class="stat-value">{{ photoCount || 0 }}</span>
              <span class="stat-label">Photos</span>
            </div>
          </div>
          
          <div class="stat-item">
            <i class="fas fa-link"></i>
            <div class="stat-info">
              <span class="stat-value">{{ raccordCount || 0 }}</span>
              <span class="stat-label">Raccords</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Section Informations -->
      <div class="tools-section" v-if="scene">
        <h4><i class="fas fa-info-circle"></i> Informations</h4>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">Ordre :</span>
            <span class="info-value">Scène {{ scene.ordre }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Statut :</span>
            <span class="info-value status-badge" :style="{ backgroundColor: getStatusColor(scene.statutNom) }">
              {{ scene.statutNom || 'Non défini' }}
            </span>
          </div>
          
          <div v-if="scene.lieuNom" class="info-item">
            <span class="info-label">Lieu :</span>
            <span class="info-value">{{ scene.lieuNom }}</span>
          </div>
          
          <div v-if="scene.lieuPlateau" class="info-item">
            <span class="info-label">Plateau :</span>
            <span class="info-value">{{ scene.lieuPlateau }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import SceneTournageSection from '../SceneTournageSection.vue';
import RaccordsPhotosComponent from '../RaccordsPhotosComponent.vue';
import RaccordSceneComponent from '../RaccordSceneComponent.vue';

const props = defineProps({
  scene: Object,
  projetId: [String, Number],
  episodeId: [String, Number],
  sequenceId: [String, Number],
  userPermissions: Object,
  commentCount: {
    type: Number,
    default: 0
  },
  photoCount: {
    type: Number,
    default: 0
  },
  raccordCount: {
    type: Number,
    default: 0
  },
  rightSidebarOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'close',
  'tournage-updated',
  'replanification-appliquee',
  'raccords-updated',
  'raccord-created',
  'add-dialogue',
  'add-lieu',
  'export-scene-pdf',
  'export-raccords-images',
  'toggle-comments',
  'open-email'
]);

const isOpen = ref(true);

// Méthodes
const closeSidebar = () => {
  isOpen.value = false;
  emit('close');
};

const onTournageUpdated = (data) => {
  emit('tournage-updated', data);
};

const onReplanification = (data) => {
  emit('replanification-appliquee', data);
};

const onRaccordsUpdated = () => {
  emit('raccords-updated');
};

const onRaccordCreated = () => {
  emit('raccord-created');
};

const openAddLieuModal = () => {
  emit('add-lieu', props.scene);
};

const exportScenePDF = () => {
  emit('export-scene-pdf', props.scene);
};

const exportRaccordsWithImages = () => {
  emit('export-raccords-images', props.scene?.idScene);
};

const startAddDialogue = () => {
  emit('add-dialogue', props.scene);
};

const toggleComments = () => {
  emit('toggle-comments', props.scene);
};

const openEmailModal = () => {
  emit('open-email', props.scene);
};

const getStatusColor = (status) => {
  if (!status) return '#6c757d';
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'en cours': return '#17a2b8';
    case 'terminé': return '#28a745';
    case 'à valider': return '#ffc107';
    case 'annulé': return '#dc3545';
    default: return '#6c757d';
  }
};

// Réouvrir automatiquement quand une nouvelle scène est sélectionnée
watch(() => props.scene, (newScene) => {
  if (newScene) {
    isOpen.value = true;
  }
}, { immediate: true });
</script>


