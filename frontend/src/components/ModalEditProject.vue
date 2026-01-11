<template>
  <div v-if="show" class="modal-overlay-ecran-travail" @click="$emit('close')">
    <div class="modal-content-ecran-travail" @click.stop>
      <div class="modal-header-ecran-travail">
        <h3>
          <i class="fas fa-edit"></i>
          Modifier le projet
        </h3>
        <button @click="$emit('close')" class="close-btn-ecran-travail">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="$emit('save', editingProject)" class="edit-form-ecran-travail">
        <div class="form-group-ecran-travail">
          <label for="edit-project-titre">Titre *</label>
          <input
            type="text"
            id="edit-project-titre"
            v-model="editingProject.titre"
            required
            class="form-input-ecran-travail"
          />
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-project-genre">Genre *</label>
          <select
            id="edit-project-genre"
            v-model="editingProject.genreId"
            required
            class="form-select-ecran-travail"
          >
            <option value="">Sélectionnez un genre</option>
            <option v-for="genre in genres" :key="genre.idGenre" :value="genre.idGenre">
              {{ genre.nomGenre }}
            </option>
          </select>
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-project-statut">Statut *</label>
          <select
            id="edit-project-statut"
            v-model="editingProject.statutId"
            required
            class="form-select-ecran-travail"
          >
            <option value="">Sélectionnez un statut</option>
            <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.idStatutProjet">
              {{ statut.nomStatutsProjet }}
            </option>
          </select>
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-project-date-fin">Date de fin (optionnel)</label>
          <input
            type="date"
            id="edit-project-date-fin"
            v-model="editingProject.dateFin"
            class="form-input-ecran-travail"
          />
        </div>
        <div class="form-group-ecran-travail">
          <label for="edit-project-synopsis">Synopsis (optionnel)</label>
          <textarea
            id="edit-project-synopsis"
            v-model="editingProject.synopsis"
            rows="4"
            class="form-textarea-ecran-travail"
            placeholder="Synopsis du projet..."
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
  editingProject: Object,
  genres: Array,
  statuts: Array,
  error: String,
  loading: Boolean
})

defineEmits(['close', 'save'])
</script>



