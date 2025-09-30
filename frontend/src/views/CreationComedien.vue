<template>
  <div class="creation-comedien">
    <h2>Création et Gestion des Comédiens</h2>
    
    <!-- Formulaire de création -->
    <div class="form-container">
      <h3>{{ isEditing ? 'Modifier' : 'Créer' }} un comédien</h3>
      <form @submit.prevent="submitForm" class="comedien-form" enctype="multipart/form-data">
        <div class="form-group">
          <label for="nom">Nom du comédien *</label>
          <input
            type="text"
            id="nom"
            v-model="formData.nom"
            required
            placeholder="Entrez le nom du comédien"
          />
        </div>

        <div class="form-group">
          <label for="age">Âge</label>
          <input
            type="number"
            id="age"
            v-model="formData.age"
            placeholder="Âge du comédien"
          />
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            placeholder="email@exemple.com"
          />
        </div>

        <!-- Sélection du projet avec recherche -->
        <div class="form-group">
          <label for="projetSearch">Projet *</label>
          <div class="search-container">
            <input
              type="text"
              id="projetSearch"
              v-model="projetSearch"
              @input="filterProjets"
              @focus="showProjetSuggestions = true"
              placeholder="Rechercher un projet..."
              class="search-input"
            />
            <div v-if="showProjetSuggestions && filteredProjets.length > 0" class="suggestions-dropdown">
              <div
                v-for="projet in filteredProjets"
                :key="projet.id"
                @click="selectProjet(projet)"
                class="suggestion-item"
              >
                {{ projet.titre }}
              </div>
            </div>
          </div>
          <input type="hidden" v-model="formData.projetId" required />
        </div>

        <div class="form-group">
          <label for="photo">Photo</label>
          <div class="photo-upload">
            <input
              type="file"
              id="photo"
              ref="photoInput"
              @change="handlePhotoUpload"
              accept="image/*"
              class="photo-input"
            />
            <label for="photo" class="photo-label">
              <span v-if="!previewPhoto">📷 Choisir une photo</span>
              <span v-else>📷 Changer la photo</span>
            </label>
            <div v-if="previewPhoto" class="photo-preview">
              <img :src="previewPhoto" alt="Aperçu de la photo" class="preview-image" />
              <button type="button" @click="removePhoto" class="remove-photo-btn">×</button>
            </div>
          </div>
        </div>

        <!-- Section Disponibilités -->
        <div class="form-group disponibilites-section">
          <label>Disponibilités</label>
          <div class="disponibilites-list">
            <div v-for="(dispo, index) in formData.disponibilites" :key="index" class="disponibilite-item">
              <div class="disponibilite-inputs">
                <input
                  type="date"
                  v-model="dispo.date"
                  class="date-input"
                  placeholder="Date"
                />
                <select v-model="dispo.statut" class="statut-select">
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="INDISPONIBLE">Indisponible</option>
                  <option value="OCCUPE">Occupé</option>
                </select>
                <button
                  type="button"
                  @click="removeDisponibilite(index)"
                  class="remove-dispo-btn"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="addDisponibilite"
            class="btn-add-dispo"
          >
            + Ajouter une disponibilité
          </button>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary"
          >
            {{ isEditing ? 'Modifier' : 'Créer' }} le comédien
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

    <!-- Liste des comédiens -->
    <div class="comediens-list">
      <div class="list-header">
        <h3>Liste des comédiens</h3>
        
        <!-- Zone de recherche des comédiens -->
        <div class="search-section">
          <div class="search-group">
            <label for="comedienSearch">Rechercher un comédien</label>
            <input
              type="text"
              id="comedienSearch"
              v-model="comedienSearch"
              @input="filterComediens"
              placeholder="Rechercher par nom, email ou projet..."
              class="search-input"
            />
          </div>
          
          <!-- Filtres supplémentaires -->
          <div class="filters-group">
            <div class="filter-item">
              <label for="projetFilter">Filtrer par projet</label>
              <select id="projetFilter" v-model="selectedProjetFilter" @change="filterComediens" class="filter-select">
                <option value="">Tous les projets</option>
                <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                  {{ projet.titre }}
                </option>
              </select>
            </div>
            
            <div class="filter-item">
              <label for="statutFilter">Filtrer par statut</label>
              <select id="statutFilter" v-model="selectedStatutFilter" @change="filterComediens" class="filter-select">
                <option value="">Tous les statuts</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="INDISPONIBLE">Indisponible</option>
                <option value="OCCUPE">Occupé</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading">Chargement...</div>
      
      <div v-else-if="filteredComediens.length === 0" class="empty-state">
        <div v-if="comedienSearch || selectedProjetFilter || selectedStatutFilter">
          Aucun comédien ne correspond à vos critères de recherche.
        </div>
        <div v-else>
          Aucun comédien créé pour le moment.
        </div>
      </div>

      <div v-else class="comediens-grid">
        <div
          v-for="comedien in filteredComediens"
          :key="comedien.id"
          class="comedien-card"
        >
          <div class="comedien-photo">
            <img 
              v-if="comedien.photoPath" 
              :src="getPhotoUrl(comedien.photoPath)" 
              :alt="comedien.nom"
              class="photo"
            />
            <div v-else class="photo-placeholder">📷</div>
          </div>
          
          <div class="comedien-info">
            <h4>{{ comedien.nom }}</h4>
            <p><strong>Âge:</strong> {{ comedien.age }} ans</p>
            <p><strong>Email:</strong> {{ comedien.email }}</p>
            <p><strong>Projet:</strong> {{ comedien.projetTitre || 'Non assigné' }}</p>
            
            <!-- Affichage des disponibilités -->
            <div v-if="comedien.disponibilites && comedien.disponibilites.length > 0" class="disponibilites-display">
              <strong>Disponibilités:</strong>
              <div v-for="dispo in comedien.disponibilites" :key="dispo.id" class="dispo-item">
                <span class="dispo-date">{{ formatDateSimple(dispo.date) }}</span>
                <span class="dispo-statut" :class="getStatutClass(dispo.statut)">
                  {{ getStatutText(dispo.statut) }}
                </span>
              </div>
            </div>
            <p v-else class="no-disponibilites">Aucune disponibilité définie</p>
            
            <p class="date-info">
              Créé le: {{ formatDate(comedien.creeLe) }}
            </p>
          </div>

          <div class="comedien-actions">
            <button
              @click="editComedien(comedien)"
              class="btn-edit"
              title="Modifier"
            >
              ✏️
            </button>
             <button
                @click="goToSceneComedien(comedien.id)"
                class="btn-link"
                title="Lier à une scène"
              >
                🎬
              </button>
            <button
              @click="deleteComedien(comedien.id)"
              class="btn-delete"
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/css/crea_comedien.css';

export default {
  name: 'CreationComedien',
  data() {
    return {
      formData: {
        nom: '',
        age: null,
        email: '',
        projetId: '',
        photo: null,
        disponibilites: []
      },
      comediens: [],
      filteredComediens: [],
      projets: [],
      filteredProjets: [],
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: false,
      previewPhoto: null,
      currentPhotoFile: null,
      
      // Recherche et filtres
      projetSearch: '',
      showProjetSuggestions: false,
      comedienSearch: '',
      selectedProjetFilter: '',
      selectedStatutFilter: ''
    };
  },
  async mounted() {
    await this.loadProjets();
    await this.loadComediens();
  },
  methods: {
    async loadProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
        this.filteredProjets = this.projets;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      }
    },

    async loadComediens() {
      this.loading = true;
      try {
        const response = await axios.get('/api/comediens');
        this.comediens = response.data;
        this.filteredComediens = this.comediens;
      } catch (error) {
        console.error('Erreur lors du chargement des comédiens:', error);
        alert('Erreur lors du chargement des comédiens');
      } finally {
        this.loading = false;
      }
    },

    filterProjets() {
      if (this.projetSearch.trim() === '') {
        this.filteredProjets = this.projets;
      } else {
        const searchTerm = this.projetSearch.toLowerCase();
        this.filteredProjets = this.projets.filter(projet =>
          projet.titre.toLowerCase().includes(searchTerm)
        );
      }
    },

    selectProjet(projet) {
      this.formData.projetId = projet.id;
      this.projetSearch = projet.titre;
      this.showProjetSuggestions = false;
    },

    filterComediens() {
      let filtered = this.comediens;

      // Filtre par recherche texte
      if (this.comedienSearch.trim() !== '') {
        const searchTerm = this.comedienSearch.toLowerCase();
        filtered = filtered.filter(comedien =>
          comedien.nom.toLowerCase().includes(searchTerm) ||
          comedien.email.toLowerCase().includes(searchTerm) ||
          (comedien.projetTitre && comedien.projetTitre.toLowerCase().includes(searchTerm))
        );
      }

      // Filtre par projet
      if (this.selectedProjetFilter !== '') {
        filtered = filtered.filter(comedien => 
          comedien.projetId == this.selectedProjetFilter
        );
      }

      // Filtre par statut de disponibilité
      if (this.selectedStatutFilter !== '') {
        filtered = filtered.filter(comedien =>
          comedien.disponibilites && 
          comedien.disponibilites.some(dispo => dispo.statut === this.selectedStatutFilter)
        );
      }

      this.filteredComediens = filtered;
    },

    getPhotoUrl(photoPath) {
      return `/api/comediens/photo/${photoPath}`;
    },

    handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.currentPhotoFile = file;
        
        // Créer un aperçu de l'image
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewPhoto = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    removePhoto() {
      this.previewPhoto = null;
      this.currentPhotoFile = null;
      this.$refs.photoInput.value = '';
    },

    

    addDisponibilite() {
      this.formData.disponibilites.push({
        date: '',
        statut: 'DISPONIBLE'
      });
    },

    removeDisponibilite(index) {
      this.formData.disponibilites.splice(index, 1);
    },

    async submitForm() {
      this.isSubmitting = true;
      try {
        const formData = new FormData();
        
        // Ajouter seulement les champs qui ont été modifiés
        if (this.formData.nom) formData.append('nom', this.formData.nom);
        if (this.formData.age) formData.append('age', this.formData.age);
        if (this.formData.email) formData.append('email', this.formData.email);
        if (this.formData.projetId) formData.append('projetId', this.formData.projetId);
        
        if (this.currentPhotoFile) {
          formData.append('photo', this.currentPhotoFile);
        }

        // Pour l'édition : envoyer seulement la première disponibilité si elle existe
        if (this.isEditing && this.formData.disponibilites.length > 0) {
          const firstDispo = this.formData.disponibilites[0];
          if (firstDispo.date) {
            formData.append('dateDisponibilite', firstDispo.date);
            formData.append('statutDisponibilite', firstDispo.statut);
          }
        }

        let response;
        if (this.isEditing) {
          response = await axios.put(`/api/comediens/${this.editingId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          alert('Comédien modifié avec succès');
        } else {
          response = await axios.post('/api/comediens', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          alert('Comédien créé avec succès');
        }
        
        this.resetForm();
        await this.loadComediens();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },

    editComedien(comedien) {
      this.originalData = { ...comedien }; // Sauvegarder les données originales
      this.formData = {
        nom: comedien.nom,
        age: comedien.age,
        email: comedien.email,
        projetId: comedien.projetId,
        disponibilites: comedien.disponibilites ? [...comedien.disponibilites] : []
      };
      
      // Mettre à jour la recherche de projet avec le projet actuel
      const projet = this.projets.find(p => p.id === comedien.projetId);
      this.projetSearch = projet ? projet.titre : '';
      
      if (comedien.photoPath) {
        this.previewPhoto = this.getPhotoUrl(comedien.photoPath);
      } else {
        this.previewPhoto = null;
      }
      
      this.currentPhotoFile = null;
      this.isEditing = true;
      this.editingId = comedien.id;
      
      document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    },

    async deleteComedien(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce comédien ?')) {
        return;
      }

      try {
        await axios.delete(`/api/comediens/${id}`);
        alert('Comédien supprimé avec succès');
        await this.loadComediens();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    },

    resetForm() {
      this.formData = {
        nom: '',
        age: null,
        email: '',
        projetId: '',
        photo: null,
        disponibilites: []
      };
      this.projetSearch = '';
      this.previewPhoto = null;
      this.currentPhotoFile = null;
      this.isEditing = false;
      this.editingId = null;
      this.$refs.photoInput.value = '';
      this.showProjetSuggestions = false;
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

    formatDateSimple(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR');
    },

    getStatutClass(statut) {
      switch (statut) {
        case 'DISPONIBLE': return 'statut-disponible';
        case 'INDISPONIBLE': return 'statut-indisponible';
        case 'OCCUPE': return 'statut-occupe';
        default: return '';
      }
    },

    getStatutText(statut) {
      switch (statut) {
        case 'DISPONIBLE': return 'Disponible';
        case 'INDISPONIBLE': return 'Indisponible';
        case 'OCCUPE': return 'Occupé';
        default: return statut;
      }
    },
    goToSceneComedien(comedienId) {
      this.$router.push({
        path: '/scene-comedien',
        query: { comedienId: comedienId }
      });
    }
    
  },

 
  watch: {
    // Fermer les suggestions quand on clique ailleurs
    showProjetSuggestions(value) {
      if (value) {
        setTimeout(() => {
          document.addEventListener('click', this.closeProjetSuggestions);
        }, 100);
      } else {
        document.removeEventListener('click', this.closeProjetSuggestions);
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeProjetSuggestions);
  }
};
</script>

