<template>
  <div v-if="show" class="modal-overlay-ecran-travail" @click="$emit('close')">
    <div class="modal-content-ecran-travail" @click.stop>
      <div class="modal-header-ecran-travail">
        <h3>Ajouter un Lieu/Plateau à la scène: {{ scene?.titre }}</h3>
        <button @click="$emit('close')" class="close-btn-ecran-travail">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="edit-form-ecran-travail">
        <div class="form-group-ecran-travail">
          <label for="lieu-select">Sélectionner un lieu existant</label>
          <select 
            id="lieu-select" 
            v-model="localLieuData.selectedLieuId" 
            @change="$emit('load-plateaux', localLieuData.selectedLieuId)" 
            class="form-select-ecran-travail" 
            required
          >
            <option value="">Choisir un lieu</option>
            <option v-if="availableLieux.length === 0" disabled>Aucun lieu disponible pour ce projet</option>
            <option v-for="lieu in availableLieux" :key="lieu.id" :value="lieu.id">
              {{ lieu.nomLieu }} ({{ lieu.typeLieu }})
            </option>
          </select>
        </div>
        
        <div class="form-group-ecran-travail" v-if="availablePlateaux.length > 0">
          <label for="plateau-select">Sélectionner un plateau existant (optionnel)</label>
          <select 
            id="plateau-select" 
            v-model="localLieuData.selectedPlateauId" 
            class="form-select-ecran-travail"
          >
            <option value="">Aucun plateau</option>
            <option v-for="plateau in availablePlateaux" :key="plateau.id" :value="plateau.id">
              {{ plateau.nom }} ({{ plateau.typePlateau }})
            </option>
          </select>
        </div>
        
        <div class="form-group-ecran-travail">
          <label for="description-utilisation">Description d'utilisation</label>
          <textarea 
            id="description-utilisation" 
            v-model="localLieuData.descriptionUtilisation" 
            rows="3" 
            class="form-textarea-ecran-travail" 
            placeholder="Description de l'utilisation de ce lieu/plateau dans la scène..."
          ></textarea>
        </div>
        
        <div v-if="error" class="error-message-ecran-travail">
          {{ error }}
        </div>
        
        <div class="modal-actions-ecran-travail">
          <button type="button" @click="$emit('close')" class="cancel-btn-ecran-travail">Annuler</button>
          <button type="submit" class="save-btn-ecran-travail" :disabled="loading">
            {{ loading ? 'Ajout en cours...' : 'Ajouter' }}
          </button>
        </div>
      </form>
      
      <!-- Liste des lieux déjà associés à cette scène -->
      <div class="associated-lieux-ecran-travail" v-if="sceneLieus.length > 0">
        <h4>Lieux déjà associés:</h4>
        <div v-for="sceneLieu in sceneLieus" :key="sceneLieu.id" class="scene-lieu-item-ecran-travail">
          <div class="scene-lieu-info-ecran-travail">
            <strong>{{ sceneLieu.lieuNom }}</strong>
            <span v-if="sceneLieu.plateauNom"> - Plateau: {{ sceneLieu.plateauNom }}</span>
            - {{ sceneLieu.descriptionUtilisation || 'Aucune description' }}
          </div>
          <button @click="$emit('remove-lieu', sceneLieu.id)" class="delete-btn-ecran-travail" title="Supprimer">
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  scene: Object,
  lieuData: Object,
  availableLieux: Array,
  availablePlateaux: Array,
  sceneLieus: Array,
  error: String,
  loading: Boolean
})

const emit = defineEmits(['close', 'add', 'load-plateaux', 'remove-lieu'])

// Créer une copie locale des données pour éviter la mutation directe
const localLieuData = ref({
  selectedLieuId: props.lieuData?.selectedLieuId || null,
  selectedPlateauId: props.lieuData?.selectedPlateauId || null,
  descriptionUtilisation: props.lieuData?.descriptionUtilisation || ''
})

// Mettre à jour localLieuData quand lieuData change
watch(() => props.lieuData, (newData) => {
  if (newData) {
    localLieuData.value = {
      selectedLieuId: newData.selectedLieuId || null,
      selectedPlateauId: newData.selectedPlateauId || null,
      descriptionUtilisation: newData.descriptionUtilisation || ''
    }
  }
}, { immediate: true, deep: true })

const handleSubmit = () => {
  emit('add', localLieuData.value)
}

// const deleteSceneLieu = async (sceneLieuId) => {
//   if (!userPermissions.value.canCreateLieu) {
//     alert('Vous n\'êtes pas autorisé à supprimer des lieux/plateaux pour cette scène.');
//     return;
//   }
  
//   if (confirm('Êtes-vous sûr de vouloir supprimer ce lieu/plateau ?')) {
//     try {
//       await axios.delete(`/api/scene-lieux/${sceneLieuId}`);
//       await store.fetchSequenceDetails(store.currentSequence.idSequence);
//     } catch (error) {
//       console.error('Erreur lors de la suppression du lieu/plateau:', error);
//       alert('Erreur lors de la suppression du lieu/plateau');
//     }
//   }
// };
</script>
