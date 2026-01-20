<template>
  <div class="creation-comedien">
    <div class="form-header">
        <button @click="goBack" class="back-btn"> <i class="fas fa-sign icon"></i>
          Retour
        </button>
        <h2>Créer votre comédien</h2>
      </div>

    <!-- Formulaire de création -->
    <div class="form-container">
      <h3>{{ isEditing ? 'Modifier' : 'Créer' }} un comédien</h3>
      
      <!-- Champ non-modifiable avec le titre du projet -->
      <div class="form-group">
        <label for="projet">Projet associé</label>
        <input
          type="text"
          id="projet"
          :value="projetTitre"
          disabled
          class="disabled-input"
          placeholder="Chargement du projet..."
        />
      </div>

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
      <h3>Liste des comédiens du projet "{{ projetTitre }}"</h3>
      
      <div v-if="loading" class="loading">Chargement...</div>
      
      <div v-else-if="comediens.length === 0" class="empty-state">
        Aucun comédien créé pour ce projet.
      </div>

      <div v-else class="comediens-grid">
        <div
          v-for="comedien in comediens"
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

export default {
  name: 'CreationComedien',
  data() {
    return {
      projetId: null,
      projetTitre: 'Chargement...',
      formData: {
        nom: '',
        age: null,
        email: '',
        photo: null,
        disponibilites: []
      },
      comediens: [],
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      loading: false,
      previewPhoto: null,
      currentPhotoFile: null
    };
  },
  async mounted() {
  // Récupérer l'ID du projet depuis les paramètres de route - CORRECTION ICI
  this.projetId = this.$route.params.projetId; // Changé de idProjet à projetId
  
  console.log('Projet ID récupéré:', this.projetId);
  
  if (!this.projetId) {
    console.error('ID du projet non trouvé dans les paramètres de route');
    console.log('Params disponibles:', this.$route.params);
    
    // Tentative de récupération alternative
    this.projetId = this.$route.query.projetId;
    if (!this.projetId) {
      alert('Erreur: ID du projet manquant');
      this.$router.go(-1); // Retour en arrière
      return;
    }
  }
  
  await this.loadProjetInfo();
  await this.loadComediens();
},
  methods: {
     async loadProjetInfo() {
    try {
      console.log('Chargement des infos du projet ID:', this.projetId);
      const response = await axios.get(`/api/projets/${this.projetId}`);
      this.projetTitre = response.data.titre;
      console.log('Projet trouvé:', this.projetTitre);
    } catch (error) {
      console.error('Erreur lors du chargement des informations du projet:', error);
      this.projetTitre = 'Projet inconnu';
      
     
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
  },

    async loadComediens() {
    this.loading = true;
    try {
      console.log('Chargement des comédiens pour le projet ID:', this.projetId);
      const response = await axios.get(`/api/comediens/projet/${this.projetId}`);
      this.comediens = response.data;
      console.log('Comédiens chargés:', this.comediens.length);
    } catch (error) {
      console.error('Erreur lors du chargement des comédiens:', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      
      alert('Erreur lors du chargement des comédiens');
    } finally {
      this.loading = false;
    }
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
        formData.append('projetId', this.projetId);
        formData.append('nom', this.formData.nom);
        formData.append('age', this.formData.age);
        formData.append('email', this.formData.email);
        
        if (this.currentPhotoFile) {
          formData.append('photo', this.currentPhotoFile);
        }

        // Ajouter les disponibilités
        if (this.formData.disponibilites.length > 0) {
          this.formData.disponibilites.forEach((dispo, index) => {
            if (dispo.date) {
              formData.append('dateDisponibilite', dispo.date);
              formData.append('statutDisponibilite', dispo.statut);
            }
          });
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

    goBack() {
      this.$router.go(-1);
    },

    editComedien(comedien) {
      this.formData = {
        nom: comedien.nom,
        age: comedien.age,
        email: comedien.email,
        disponibilites: comedien.disponibilites ? [...comedien.disponibilites] : []
      };
      
      if (comedien.photoPath) {
        this.previewPhoto = this.getPhotoUrl(comedien.photoPath);
      } else {
        this.previewPhoto = null;
      }
      
      this.currentPhotoFile = null;
      this.isEditing = true;
      this.editingId = comedien.id;
      
      // Scroll to form
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
        photo: null,
        disponibilites: []
      };
      this.previewPhoto = null;
      this.currentPhotoFile = null;
      this.isEditing = false;
      this.editingId = null;
      this.$refs.photoInput.value = '';
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
    }
  }
};
</script>