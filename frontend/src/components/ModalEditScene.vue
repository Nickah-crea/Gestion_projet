<template>
  <div v-if="show" class="modal-overlay-ecran-travail" @click="$emit('close')">
    <div class="modal-content-ecran-travail" @click.stop>
      <div class="modal-header-ecran-travail">
        <h3>
          <i class="fas fa-edit"></i>
          Modifier la scène
        </h3>
        <button @click="$emit('close')" class="close-btn-ecran-travail">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="$emit('save', editingScene)" class="edit-form-ecran-travail">
        <div class="form-group-ecran-travail">
          <label for="edit-scene-titre">Titre</label>
          <input
            type="text"
            id="edit-scene-titre"
            v-model="editingScene.titre"
            required
            class="form-input-ecran-travail"
          />
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-scene-synopsis">Synopsis</label>
          <textarea
            id="edit-scene-synopsis"
            v-model="editingScene.synopsis"
            rows="4"
            class="form-textarea-ecran-travail"
          ></textarea>
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-scene-ordre">Ordre</label>
          <input
            type="number"
            id="edit-scene-ordre"
            v-model="editingScene.ordre"
            required
            class="form-input-ecran-travail"
          />
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-scene-statut">Statut</label>
          <select
            id="edit-scene-statut"
            v-model="editingScene.statutId"
            required
            class="form-select-ecran-travail"
          >
            <option value="">Sélectionnez un statut</option>
            <option v-for="statut in statuts" :key="statut.id" :value="statut.id">
              {{ statut.nomStatutsScene }}
            </option>
          </select>
        </div>
        <div v-if="error" class="error-message-ecran-travail">
          {{ error }}
        </div>
        <div class="modal-actions-ecran-travail">
          <button type="button" @click="$emit('close')" class="cancel-btn-ecran-travail">Annuler</button>
          <button type="submit" class="save-btn-ecran-travail" :disabled="loading">
            {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  editingScene: Object,
  statuts: Array,
  error: String,
  loading: Boolean
})

defineEmits(['close', 'save'])
</script>
