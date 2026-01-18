[file name]: SceneToolsNavbar.vue
<template>
  <nav 
    class="scene-tools-navbar"
    :class="{ 
      'without-right-sidebar': !rightSidebarOpen,
      'with-right-sidebar': rightSidebarOpen
    }"
  >
    <!-- Section gauche : titre et informations -->
    <div class="navbar-left-section">
      <div class="navbar-title">
        <i class="fas fa-tools"></i>
        <span>Outils Scène</span>
      </div>
    </div>

    <!-- Section centrale : outils principaux -->
    <div class="navbar-center-section">
      <!-- Raccords Photos - S'ouvre directement dans le composant -->
      <div class="nav-tool-item">
        <RaccordsPhotosComponent 
          :scene-id="scene?.idScene"
          :scene-info="scene"
          @raccords-updated="onRaccordsUpdated"
          ref="raccordsPhotosRef"
        />
      </div>
      
      <!-- Création Raccord - S'ouvre directement dans le composant -->
      <div class="nav-tool-item">
        <RaccordSceneComponent 
          :projet-id="projetId"
          :episode-id="episodeId"
          :sequence-id="sequenceId"
          :scene-source-id="scene?.idScene"
          @raccord-created="onRaccordCreated"
          ref="raccordSceneRef"
        />
      </div>
      
      <!-- Actions Rapides - Dropdown -->
      <div class="nav-tool-item dropdown">
        <button class="nav-tool-btn" @click="toggleDropdown('actions')">
          <i class="fas fa-bolt"></i>
          <span>Actions Rapides</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </button>
        <div v-if="activeDropdown === 'actions'" class="dropdown-content quick-actions-dropdown" @click.stop>
          <div class="quick-actions-grid">
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
      </div>
    </div>

    <!-- Section droite : navigation entre scènes -->
    <div class="navbar-right-section">
      <div class="scene-navigation">
        <button 
          class="nav-scene-btn prev-scene-btn"
          @click="goToPrevScene"
          :disabled="!hasPrevScene"
          title="Scène précédente"
        >
          <i class="fas fa-chevron-left"></i>
          <span>Scène Préc.</span>
        </button>
        
        <div class="scene-counter">
          <span class="current-scene">{{ currentSceneIndex + 1 }}</span>
          <span class="total-scenes">/{{ totalScenes }}</span>
        </div>
        
        <button 
          class="nav-scene-btn next-scene-btn"
          @click="goToNextScene"
          :disabled="!hasNextScene"
          title="Scène suivante"
        >
          <span>Scène Suiv.</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <button class="close-navbar-btn" @click="closeNavbar" title="Masquer les outils">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
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
  },
  hasPrevScene: {
    type: Boolean,
    default: false
  },
  hasNextScene: {
    type: Boolean,
    default: false
  },
  currentSceneIndex: {
    type: Number,
    default: 0
  },
  totalScenes: {
    type: Number,
    default: 0
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
  'open-email',
  'go-to-prev-scene',
  'go-to-next-scene'
]);

// Références aux composants
const raccordsPhotosRef = ref(null);
const raccordSceneRef = ref(null);

const activeDropdown = ref(null);

// Méthodes
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown;
};

const closeAllDropdowns = () => {
  activeDropdown.value = null;
};

const closeNavbar = () => {
  emit('close');
};

// Méthodes pour ouvrir directement les composants
const openRaccordsPhotos = () => {
  if (raccordsPhotosRef.value && raccordsPhotosRef.value.openRaccordsModal) {
    raccordsPhotosRef.value.openRaccordsModal();
  }
};

const openCreateRaccord = () => {
  if (raccordSceneRef.value && raccordSceneRef.value.openRaccordModal) {
    raccordSceneRef.value.openRaccordModal();
  }
};

const onRaccordsUpdated = () => {
  emit('raccords-updated');
};

const onRaccordCreated = () => {
  emit('raccord-created');
};

const openAddLieuModal = () => {
  emit('add-lieu', props.scene);
  closeAllDropdowns();
};

const exportScenePDF = () => {
  emit('export-scene-pdf', props.scene);
  closeAllDropdowns();
};

const exportRaccordsWithImages = () => {
  emit('export-raccords-images', props.scene?.idScene);
  closeAllDropdowns();
};

const startAddDialogue = () => {
  emit('add-dialogue', props.scene);
  closeAllDropdowns();
};

const toggleComments = () => {
  emit('toggle-comments', props.scene);
  closeAllDropdowns();
};

const openEmailModal = () => {
  emit('open-email', props.scene);
  closeAllDropdowns();
};

const goToPrevScene = () => {
  emit('go-to-prev-scene');
};

const goToNextScene = () => {
  emit('go-to-next-scene');
};

// Mettre à jour les styles des boutons pour qu'ils s'intègrent dans la navbar
const updateComponentStyles = () => {
  nextTick(() => {
    // Mettre à jour les boutons de RaccordsPhotosComponent
    const raccordButtons = document.querySelectorAll('.raccords-photos-container .btn-open-raccords, .raccord-scene-container .btn-open-raccord');
    
    raccordButtons.forEach(button => {
      // Supprimer les classes CSS originales
      button.className = '';
      
      // Ajouter les classes de style de la navbar
      button.classList.add('nav-tool-btn');
      
      // Mettre à jour le contenu si nécessaire
      const icon = button.querySelector('i');
      const text = button.querySelector('span') || button.textContent.replace(icon?.textContent || '', '');
      
      // Reconstruire le bouton
      button.innerHTML = '';
      if (icon) {
        const newIcon = document.createElement('i');
        newIcon.className = icon.className;
        button.appendChild(newIcon);
      }
      
      const span = document.createElement('span');
      span.textContent = text.trim();
      button.appendChild(span);
    });
  });
};

// Fermer les dropdowns en cliquant à l'extérieur
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // Mettre à jour les styles après le rendu
  updateComponentStyles();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>


