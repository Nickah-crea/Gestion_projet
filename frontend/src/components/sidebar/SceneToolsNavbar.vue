<template>
  <nav 
    class="scene-tools-navbar"
    :class="{ 
      'without-right-sidebar': !rightSidebarOpen,
      'with-right-sidebar': rightSidebarOpen
    }"
  >
    <!-- Section gauche : icône uniquement -->
    <div class="navbar-left-section">
      <div class="navbar-icon">
        <i class="fas fa-tools"></i>
      </div>
      <div v-if="!hasAnyPermissions" class="navbar-permission-notice">
        <i class="fas fa-eye"></i>
        <span>Mode consultation</span>
      </div>
    </div>

    <!-- Section centrale : outils principaux -->
    <div class="navbar-center-section">
      <!-- Raccords Photos -->
      <div class="nav-tool-item" v-if="userPermissions.canViewRaccords">
        <RaccordsPhotosComponent 
          :scene-id="scene?.idScene"
          :scene-info="scene"
          :user-permissions="filteredPermissions" 
          @raccords-updated="onRaccordsUpdated"
          ref="raccordsPhotosRef"
        />
      </div>
      
      <!-- Création Raccord -->
      <div class="nav-tool-item" v-if="userPermissions.canCreateRaccord">
        <RaccordSceneComponent 
          :projet-id="projetId"
          :episode-id="episodeId"
          :sequence-id="sequenceId"
          :scene-source-id="scene?.idScene"
          :user-permissions="filteredPermissions" 
          @raccord-created="onRaccordCreated"
          ref="raccordSceneRef"
        />
      </div>
      
      <!-- PDF Scène -->
      <div class="nav-tool-item" v-if="userPermissions.canExport">
        <button class="nav-tool-btn btn-pdf" @click="exportScenePDF">
          <i class="fas fa-file-pdf"></i>
          <span>PDF Scène</span>
        </button>
      </div>
      
      <!-- Raccords + Images -->
      <div class="nav-tool-item" v-if="userPermissions.canExport && userPermissions.canViewRaccords">
        <button class="nav-tool-btn btn-images" @click="exportRaccordsWithImages">
          <i class="fas fa-file-image"></i>
          <span>Raccords + Images</span>
        </button>
      </div>
      
      <!-- Email -->
      <div class="nav-tool-item" v-if="userPermissions.canSendEmail">
        <button class="nav-tool-btn btn-email" @click="openEmailModal">
          <i class="fas fa-envelope"></i>
          <span>Email</span>
        </button>
      </div>
    </div>

    <!-- Section droite : supprimée (plus de bouton fermer) -->
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
  userPermissions: {
    type: Object,
    default: () => ({
      canCreateScene: false,
      canCreateDialogue: false,
      canCreateLieu: false,
      canCreateRaccord: false,
      canViewRaccords: false,
      canExport: false,
      canSendEmail: false
    })
  },
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
  'raccords-updated',
  'raccord-created',
  'add-dialogue',
  'export-scene-pdf',
  'export-raccords-images',
  'toggle-comments',
  'open-email'
]);

const raccordsPhotosRef = ref(null);
const raccordSceneRef = ref(null);

const filteredPermissions = computed(() => ({
  canCreateScene: props.userPermissions.canCreateScene || false,
  canCreateDialogue: props.userPermissions.canCreateDialogue || false,
  canCreateLieu: props.userPermissions.canCreateLieu || false,
  canCreateRaccord: props.userPermissions.canCreateRaccord || false,
  canViewRaccords: props.userPermissions.canViewRaccords || false,
  canExport: props.userPermissions.canExport || false,
  canSendEmail: props.userPermissions.canSendEmail || false
}));

const hasAnyPermissions = computed(() => {
  const perms = props.userPermissions;
  return perms.canCreateScene || perms.canCreateDialogue || 
         perms.canCreateLieu || perms.canCreateRaccord || 
         perms.canViewRaccords || perms.canExport || perms.canSendEmail;
});

// Suppression de closeNavbar (plus utilisé)

const onRaccordsUpdated = () => emit('raccords-updated');
const onRaccordCreated = () => emit('raccord-created');

const exportScenePDF = () => {
  if (!props.userPermissions.canExport) {
    alert("Vous n'avez pas la permission d'exporter en PDF");
    return;
  }
  emit('export-scene-pdf', props.scene);
};

const exportRaccordsWithImages = () => {
  if (!props.userPermissions.canExport || !props.userPermissions.canViewRaccords) {
    alert("Vous n'avez pas la permission d'exporter les raccords");
    return;
  }
  emit('export-raccords-images', props.scene?.idScene);
};

const startAddDialogue = () => {
  if (!props.userPermissions.canCreateDialogue) {
    alert("Vous n'avez pas la permission d'ajouter un dialogue");
    return;
  }
  emit('add-dialogue', props.scene);
};

const toggleComments = () => emit('toggle-comments', props.scene);

const openEmailModal = () => emit('open-email', props.scene);

const updateComponentStyles = () => {
  nextTick(() => {
    const raccordButtons = document.querySelectorAll('.raccords-photos-container .btn-open-raccords, .raccord-scene-container .btn-open-raccord');
    raccordButtons.forEach(button => {
      button.className = '';
      button.classList.add('nav-tool-btn');
      const icon = button.querySelector('i');
      const text = button.querySelector('span') || button.textContent.replace(icon?.textContent || '', '');
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

onMounted(() => {
  updateComponentStyles();
});

onUnmounted(() => {});
</script>

