<!-- ExportPDFManager.vue -->
<template>
  <div class="export-manager">
    <!-- Dropdown pour les exports PDF -->
    <div class="export-dropdown" v-if="showDropdown">
      <button class="export-main-btn" @click="toggleDropdown">
        <i class="fas fa-file-export"></i> Exporter en PDF
        <i class="fas fa-chevron-down" :class="{ 'rotated': dropdownOpen }"></i>
      </button>
      
      <div v-if="dropdownOpen" class="export-dropdown-content">
        <!-- Exports pour la scène -->
        <button 
          v-if="currentScene" 
          class="export-option" 
          @click="exportScenePDF(currentScene)"
          title="Exporter cette scène en PDF"
        >
          <i class="fas fa-file-pdf"></i> Scène PDF
        </button>
        
        <button 
          v-if="currentScene" 
          class="export-option" 
          @click="exportSceneDialoguesPDF(currentScene)"
          title="Exporter les dialogues de cette scène en PDF"
        >
          <i class="fas fa-file-pdf"></i> Dialogues Scène PDF
        </button>
        
        <button 
          v-if="currentScene" 
          class="export-option" 
          @click="exportRaccordsByScene(currentScene.idScene)"
          title="Exporter les raccords avec images de cette scène en PDF"
        >
          <i class="fas fa-file-pdf"></i> Raccords avec Images
        </button>
        
        <!-- Exports pour la séquence -->
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
          <i class="fas fa-file-pdf"></i> Dialogues Séquences PDF
        </button>
        
        <button 
          v-if="currentSequence" 
          class="export-option" 
          @click="exportSequenceCompletePDF"
          title="Exporter la séquence complète en PDF"
        >
          <i class="fas fa-file-pdf"></i> Séquence Complète PDF
        </button>
        
        <!-- Exports pour l'épisode -->
        <button 
          v-if="currentEpisode && currentSequence" 
          class="export-option" 
          @click="exportEpisodeWithSequencePDF"
          title="Exporter l'épisode avec séquence en PDF"
        >
          <i class="fas fa-file-pdf"></i> Épisode PDF
        </button>
        
        <!-- Exports pour le projet -->
        <button 
          v-if="projetId" 
          class="export-option" 
          @click="exportRaccordsProjetPDF"
          title="Exporter les raccords du projet en PDF"
        >
          <i class="fas fa-file-pdf"></i> Raccords Projet PDF
        </button>
        
        <!-- Export par comédien -->
        <div v-if="comediens && comediens.length > 0" class="comedien-export-section">
          <div class="comedien-selector">
            <label for="comedien-select">Exporter pour un comédien :</label>
            <select 
              id="comedien-select" 
              v-model="selectedComedien" 
              class="form-select"
            >
              <option value="">Sélectionner un comédien</option>
              <option 
                v-for="comedien in comediens" 
                :key="comedien.id" 
                :value="comedien.id"
              >
                {{ comedien.nom }}
              </option>
            </select>
            <button 
              @click="exportRaccordsByComedien(selectedComedien)" 
              :disabled="!selectedComedien"
              class="export-btn"
            >
              <i class="fas fa-file-pdf"></i> Export Raccords Comédien
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Version bouton simple (pour sidebar) -->
    <div v-else class="export-buttons-list">
      <button 
        v-if="currentSequence" 
        class="export-btn" 
        @click="exportScenesOnlyPDF"
        title="Exporter les scènes en PDF"
      >
        <i class="fas fa-file-pdf"></i> Scènes PDF
      </button>
      
      <button 
        v-if="currentSequence" 
        class="export-btn" 
        @click="exportSequenceDialoguesPDF"
        title="Exporter tous les dialogues de la séquence en PDF"
      >
        <i class="fas fa-file-pdf"></i> Dialogues PDF
      </button>
      
      <button 
        v-if="currentSequence" 
        class="export-btn" 
        @click="exportSequenceCompletePDF"
        title="Exporter la séquence complète en PDF"
      >
        <i class="fas fa-file-pdf"></i> Séquence PDF
      </button>
      
      <button 
        v-if="currentEpisode" 
        class="export-btn" 
        @click="exportEpisodeWithSequencePDF"
        title="Exporter l'épisode avec séquence en PDF"
      >
        <i class="fas fa-file-pdf"></i> Épisode PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { usePDFExporter } from '../composables/usePDFExporter';

const props = defineProps({
  showDropdown: {
    type: Boolean,
    default: true
  },
  currentScene: Object,
  currentSequence: Object,
  currentEpisode: Object,
  projetId: [String, Number],
  comediens: {
    type: Array,
    default: () => []
  }
});

const emits = defineEmits(['export-complete', 'export-error']);

const dropdownOpen = ref(false);
const selectedComedien = ref(null);

// Utiliser le composable pour les exports
const {
  exportScenesOnlyPDF,
  exportSceneDialoguesPDF,
  exportSequenceDialoguesPDF,
  exportSequenceCompletePDF,
  exportEpisodeWithSequencePDF,
  exportScenePDF,
  exportRaccordsProjetPDF,
  exportRaccordsByScene,
  exportRaccordsByComedien,
  formatDate
} = usePDFExporter(emits);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Fermer le dropdown quand on clique ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.export-dropdown')) {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.export-manager {
  position: relative;
  display: inline-block;
}

.export-dropdown {
  position: relative;
}

.export-main-btn {
  background: linear-gradient(135deg, #21294F, #2c3e50);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.export-main-btn:hover {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 41, 79, 0.3);
}

.export-main-btn i.fa-chevron-down {
  transition: transform 0.3s ease;
}

.export-main-btn i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.export-dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  z-index: 1000;
  margin-top: 5px;
  padding: 10px 0;
  border: 1px solid #e9ecef;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-option:hover {
  background-color: #f8f9fa;
  color: #21294F;
}

.export-option i {
  color: #dc3545;
  width: 20px;
}

.comedien-export-section {
  padding: 15px;
  border-top: 1px solid #e9ecef;
  margin-top: 10px;
}

.comedien-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comedien-selector label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.comedien-selector .form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.comedien-selector .export-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.comedien-selector .export-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.export-buttons-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.export-buttons-list .export-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  transition: all 0.2s ease;
}

.export-buttons-list .export-btn:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.export-buttons-list .export-btn i {
  color: #21294F;
}
</style>

