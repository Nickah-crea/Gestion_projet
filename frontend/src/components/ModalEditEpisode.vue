<template>
  <div v-if="show" class="modal-overlay-ecran-travail" @click="$emit('close')">
    <div class="modal-content-ecran-travail" @click.stop>
      <div class="modal-header-ecran-travail">
        <h3>
          <i class="fas fa-edit"></i>
          Modifier l'épisode
        </h3>
        <button @click="$emit('close')" class="close-btn-ecran-travail">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="$emit('save', editingEpisode)" class="edit-form-ecran-travail">
        <div class="form-group-ecran-travail">
          <label for="edit-episode-titre">Titre</label>
          <input
            type="text"
            id="edit-episode-titre"
            v-model="editingEpisode.titre"
            required
            class="form-input-ecran-travail"
          />
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-episode-synopsis">Synopsis</label>
          <textarea
            id="edit-episode-synopsis"
            v-model="editingEpisode.synopsis"
            rows="4"
            class="form-textarea-ecran-travail"
          ></textarea>
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-episode-ordre">Ordre</label>
          <input
            type="number"
            id="edit-episode-ordre"
            v-model="editingEpisode.ordre"
            required
            class="form-input-ecran-travail"
          />
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-episode-statut">Statut</label>
          <select
            id="edit-episode-statut"
            v-model="editingEpisode.statutId"
            required
            class="form-select-ecran-travail"
          >
            <option value="">Sélectionnez un statut</option>
            <option v-for="statut in statuts" :key="statut.idStatutEpisode" :value="statut.idStatutEpisode">
              {{ statut.nomStatutsEpisode }}
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
  editingEpisode: Object,
  statuts: Array,
  error: String,
  loading: Boolean
})

defineEmits(['close', 'save'])
</script>

