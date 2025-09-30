<template>
  <div class="creation-personnage">
    <h2>Création et Gestion des Personnages</h2>
    
    <!-- Formulaire de création -->
    <div class="form-container">
      <h3>{{ isEditing ? 'Modifier' : 'Créer' }} un personnage</h3>
      <form @submit.prevent="submitForm" class="personnage-form">
        <div class="form-group">
          <label for="nom">Nom du personnage *</label>
          <input
            type="text"
            id="nom"
            v-model="formData.nom"
            required
            placeholder="Entrez le nom du personnage"
          />
        </div>

        <div class="form-group">
          <label for="projet">Projet *</label>
          <div class="combobox-container">
            <input
              type="text"
              id="projet"
              v-model="projetSearch"
              @focus="showProjetSuggestions = true"
              @blur="hideProjetSuggestions"
              @input="filterProjets"
              :placeholder="formData.projetId ? getProjetName(formData.projetId) : 'Rechercher un projet...'"
              required
              class="combobox-input"
            />
            <ul v-if="showProjetSuggestions && filteredProjets.length" class="suggestions-list">
              <li
                v-for="projet in filteredProjets"
                :key="projet.id"
                @mousedown="selectProjet(projet)"
                class="suggestion-item"
              >
                {{ projet.titre }}
              </li>
            </ul>
            <ul v-if="showProjetSuggestions && filteredProjets.length === 0" class="suggestions-list">
              <li class="suggestion-item no-results">Aucun projet trouvé</li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            placeholder="Décrivez le personnage..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="comedien">Comédien</label>
          <div class="combobox-container">
            <input
              type="text"
              id="comedien"
              v-model="comedienSearch"
              @focus="showComedienSuggestions = true"
              @blur="hideComedienSuggestions"
              @input="filterComediens"
              :placeholder="formData.comedienId ? getComedienName(formData.comedienId) : 'Rechercher un comédien (optionnel)...'"
              class="combobox-input"
            />
            <button
              type="button"
              v-if="formData.comedienId"
              @click="clearComedien"
              class="clear-button"
              title="Supprimer le comédien"
            >
              ×
            </button>
            <ul v-if="showComedienSuggestions && filteredComediens.length" class="suggestions-list">
              <li
                v-for="comedien in filteredComediens"
                :key="comedien.id"
                @mousedown="selectComedien(comedien)"
                class="suggestion-item"
              >
                {{ comedien.nom }} ({{ comedien.age }} ans)
              </li>
            </ul>
            <ul v-if="showComedienSuggestions && filteredComediens.length === 0" class="suggestions-list">
              <li class="suggestion-item no-results">Aucun comédien trouvé</li>
            </ul>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary"
          >
            {{ isEditing ? 'Modifier' : 'Créer' }} le personnage
          </button>
          <button
            v-if="isEditing"
            type="button"
            @click="resetForm"
            class="btn-secondary"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>

    <!-- Liste des personnages -->
    <div class="personnages-list">
      <h3>Liste des personnages</h3>
      
      <div v-if="loading" class="loading">Chargement...</div>
      
      <div v-else-if="personnages.length === 0" class="empty-state">
        Aucun personnage créé pour le moment.
      </div>

      <div v-else class="personnages-grid">
        <div
          v-for="personnage in personnages"
          :key="personnage.id"
          class="personnage-card"
        >
          <div class="personnage-header">
            <h4>{{ personnage.nom }}</h4>
            <div class="actions">
              <button
                @click="editPersonnage(personnage)"
                class="btn-edit"
                title="Modifier"
              >
                ✏️
              </button>
              <button
                @click="deletePersonnage(personnage.id)"
                class="btn-delete"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div class="personnage-details">
            <p><strong>Projet:</strong> {{ personnage.projetTitre }}</p>
            <p><strong>Comédien:</strong> {{ personnage.comedienNom }}</p>
            <p v-if="personnage.description">
              <strong>Description:</strong> {{ personnage.description }}
            </p>
            <p class="date-info">
              Créé le: {{ formatDate(personnage.creeLe) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/css/crea_perso.css';

export default {
  name: 'CreationPersonnage',
  data() {
    return {
      formData: {
        nom: '',
        description: '',
        projetId: '',
       comedienId: null
      },
      projets: [],
      comediens: [],
      personnages: [],
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: false,
      // Nouvelles données pour les zones de liste modifiable
      projetSearch: '',
      comedienSearch: '',
      showProjetSuggestions: false,
      showComedienSuggestions: false,
      filteredProjets: [],
      filteredComediens: []
    };
  },
  async mounted() {
    await this.loadProjets();
    await this.loadComediens();
    await this.loadPersonnages();
    // Initialiser les listes filtrées
    this.filteredProjets = [...this.projets];
    this.filteredComediens = [...this.comediens];
  },
  watch: {
    // Mettre à jour les listes filtrées quand les données changent
    projets: {
      handler(newVal) {
        this.filteredProjets = [...newVal];
      },
      deep: true
    },
    comediens: {
      handler(newVal) {
        this.filteredComediens = [...newVal];
      },
      deep: true
    }
  },
  methods: {
    async loadProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        alert('Erreur lors du chargement des projets');
      }
    },

    async loadComediens() {
      try {
        const response = await axios.get('/api/comediens');
        this.comediens = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des comédiens:', error);
        alert('Erreur lors du chargement des comédiens');
      }
    },

    async loadPersonnages() {
      this.loading = true;
      try {
        const response = await axios.get('/api/personnages');
        this.personnages = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
        alert('Erreur lors du chargement des personnages');
      } finally {
        this.loading = false;
      }
    },

    async submitForm() {
      this.isSubmitting = true;
      try {
        if (this.isEditing) {
          await axios.put(`/api/personnages/${this.editingId}`, this.formData);
          alert('Personnage modifié avec succès');
        } else {
          await axios.post('/api/personnages', this.formData);
          alert('Personnage créé avec succès');
        }

        this.resetForm();
        await this.loadPersonnages();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },

    editPersonnage(personnage) {
      this.formData = {
        nom: personnage.nom,
        description: personnage.description || '',
        projetId: personnage.projetId,
        comedienId: personnage.comedienId
      };
      this.isEditing = true;
      this.editingId = personnage.id;
      
      // Scroll to form
      document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    },

    async deletePersonnage(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) {
        return;
      }

      try {
        await axios.delete(`/api/personnages/${id}`);
        alert('Personnage supprimé avec succès');
        await this.loadPersonnages();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    },

    resetForm() {
      this.formData = {
        nom: '',
        description: '',
        projetId: '',
        comedienId: ''
      };
      this.projetSearch = '';
      this.comedienSearch = '';
      this.isEditing = false;
      this.editingId = null;
      this.filteredProjets = [...this.projets];
      this.filteredComediens = [...this.comediens];
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Méthodes pour les zones de liste modifiable
    filterProjets() {
      const searchTerm = this.projetSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredProjets = [...this.projets];
        return;
      }
      this.filteredProjets = this.projets.filter(projet => 
        projet.titre.toLowerCase().includes(searchTerm)
      );
    },

    filterComediens() {
      const searchTerm = this.comedienSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredComediens = [...this.comediens];
        return;
      }
      this.filteredComediens = this.comediens.filter(comedien => 
        comedien.nom.toLowerCase().includes(searchTerm) || 
        comedien.age.toString().includes(searchTerm)
      );
    },

    selectProjet(projet) {
      this.formData.projetId = projet.id;
      this.projetSearch = projet.titre;
      this.showProjetSuggestions = false;
    },

    selectComedien(comedien) {
      this.formData.comedienId = comedien.id;
      this.comedienSearch = `${comedien.nom} (${comedien.age} ans)`;
      this.showComedienSuggestions = false;
    },

    clearComedien() {
      this.formData.comedienId = null;
      this.comedienSearch = '';
      this.showComedienSuggestions = false;
    },

    hideProjetSuggestions() {
      // Petit délai pour permettre la sélection avant de cacher
      setTimeout(() => {
        this.showProjetSuggestions = false;
      }, 200);
    },

    hideComedienSuggestions() {
      // Petit délai pour permettre la sélection avant de cacher
      setTimeout(() => {
        this.showComedienSuggestions = false;
      }, 200);
    },

    getProjetName(id) {
      const projet = this.projets.find(p => p.id === id);
      return projet ? projet.titre : '';
    },

    getComedienName(id) {
      if (!id) return '';
      const comedien = this.comediens.find(c => c.id === id);
      return comedien ? `${comedien.nom} (${comedien.age} ans)` : '';
    }
  }
};
</script>

