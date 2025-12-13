<template>
  <div v-if="show" class="modal-overlay-ecran-travail" @click="$emit('close')">
    <div class="modal-content-ecran-travail" @click.stop>
      <div class="modal-header-ecran-travail">
        <h3>
          <i class="fas fa-edit"></i>
          Modifier le dialogue
        </h3>
        <button @click="$emit('close')" class="close-btn-ecran-travail">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="$emit('save', editingDialogue)" class="edit-form-ecran-travail">
        <div class="form-group-ecran-travail">
          <label for="edit-dialogue-personnage">Personnage</label>
          <select
            id="edit-dialogue-personnage"
            v-model="editingDialogue.personnageId"
            required
            class="form-select-ecran-travail"
          >
            <option :value="null">Narration (sans personnage)</option>
            <option v-for="personnage in personnages" :key="personnage.id" :value="personnage.id">
              {{ personnage.nom }} ({{ personnage.projetTitre }})
            </option>
          </select>
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-dialogue-texte">Texte</label>
          <textarea
            id="edit-dialogue-texte"
            v-model="editingDialogue.texte"
            rows="4"
            class="form-textarea-ecran-travail"
            required
          ></textarea>
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-dialogue-ordre">Ordre</label>
          <input
            type="number"
            id="edit-dialogue-ordre"
            v-model="editingDialogue.ordre"
            required
            class="form-input-ecran-travail"
            @blur="$emit('validate-order')"
          />
          <div v-if="suggestedOrder" class="suggestion-ecran-travail">Suggestion: {{ suggestedOrder }}</div>
          <div v-if="orderError" class="error-message-ecran-travail">{{ orderError }}</div>
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-dialogue-observation">Observation</label>
          <textarea
            id="edit-dialogue-observation"
            v-model="editingDialogue.observation"
            rows="3"
            class="form-textarea-ecran-travail"
            placeholder="Observation optionnelle"
          ></textarea>
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
  editingDialogue: Object,
  personnages: Array,
  error: String,
  loading: Boolean,
  orderError: String,
  suggestedOrder: Number
})

defineEmits(['close', 'save', 'validate-order'])
</script>

