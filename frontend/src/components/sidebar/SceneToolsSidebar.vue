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
      
      <!-- Section Tournage -->
      <div class="tools-section">
        <h4><i class="fas fa-calendar-alt"></i> Tournage</h4>
        <SceneTournageSection 
          :scene="scene"
          :projet-id="projetId"
          :user-permissions="userPermissions"
          @tournage-updated="onTournageUpdated"
          @replanification-appliquee="onReplanification"
        />
      </div>
      
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

<style scoped>
.scene-tools-sidebar {
  position: fixed;
  top: 60px; /* ← Distance du haut */
  height: calc(100vh - 20px); /* ← Ajustement hauteur */
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateX(100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px; /* ← Optionnel */
  width: 280px;
}

/* État ouvert - position selon l'état de RightSidebar */
.scene-tools-sidebar.open {
  transform: translateX(0);
}

/* QUAND RightSidebar est FERMÉE */
.scene-tools-sidebar.open.without-right-sidebar {
  right: 50px; /* ← Même distance que RightSidebar */
}

/* QUAND RightSidebar est OUVERTE (théoriquement ne devrait pas arriver) */
.scene-tools-sidebar.open.with-right-sidebar {
  right: 225px; /* ← Sidebar ouverte + espace */
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #4a6fa5 0%, #3a5a8a 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* =============================================== */
/* RESPONSIVE - CALCULS DYNAMIQUES */
/* =============================================== */

/* Tablette */
@media (max-width: 1200px) {
  .scene-tools-sidebar {
    width: 320px;
  }
  
  /* Quand RightSidebar ouverte sur tablette */
  .scene-tools-sidebar.open.with-right-sidebar {
    right: 250px;
  }
}

/* Mobile/Tablette moyenne */
@media (max-width: 992px) {
  .scene-tools-sidebar {
    width: 300px;
  }
  
  .scene-tools-sidebar.open.with-right-sidebar {
    right: 220px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .scene-tools-sidebar {
    width: 100%;
    max-width: 350px;
    z-index: 2000;
  }
  
  /* Sur mobile, forcer la position à droite */
  .scene-tools-sidebar.open {
    right: 0 !important;
    box-shadow: -5px 0 30px rgba(0, 0, 0, 0.3);
  }
}

/* Petits mobiles */
@media (max-width: 576px) {
  .scene-tools-sidebar {
    max-width: 100%;
    border-left: none;
  }
  
  .sidebar-header {
    padding: 12px 15px;
  }
  
  .sidebar-content {
    padding: 15px;
  }
}

/* =============================================== */
/* STYLES POUR LE CONTENU */
/* =============================================== */

.tools-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tools-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.tools-section h4 {
  margin: 0 0 15px 0;
  color: #4a6fa5;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  min-height: 70px;
  position: relative;
}

.action-btn:hover {
  background: #e9ecef;
  border-color: #4a6fa5;
  transform: translateY(-2px);
}

.action-btn i {
  font-size: 20px;
  color: #4a6fa5;
  margin-bottom: 5px;
}

.action-btn span {
  font-size: 12px;
  color: #333;
  line-height: 1.3;
}

.badge {
  background: #dc3545;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  position: absolute;
  top: 5px;
  right: 5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item i {
  font-size: 20px;
  color: #4a6fa5;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 11px;
  color: #666;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 13px;
  color: #333;
  text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
  font-size: 11px;
  font-weight: 500;
}

/* Styles pour les composants enfants */
.scene-tools-sidebar :deep(.scene-tournage-section),
.scene-tools-sidebar :deep(.raccords-photos-component),
.scene-tools-sidebar :deep(.raccord-scene-component) {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid #e0e0e0;
}

.scene-tools-sidebar :deep(.section-title) {
  font-size: 14px;
  margin-bottom: 10px;
  color: #4a6fa5;
}
</style>

