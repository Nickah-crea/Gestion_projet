<template>
  <div class="gestion-raccords">
    <div class="header">
      <h1>Gestion des Raccords</h1>
      <button @click="showForm = !showForm" class="btn btn-primary">
        {{ showForm ? 'Annuler' : 'Nouveau Raccord' }}
      </button>
    </div>

    <!-- Formulaire de création/modification -->
    <div v-if="showForm" class="form-container">
      <h2>{{ editingRaccord ? 'Modifier le Raccord' : 'Nouveau Raccord' }}</h2>
      <form @submit.prevent="submitForm" class="raccord-form">
        <div class="form-row">
          <div class="form-group">
            <label>Projet *</label>
            <select v-model="formData.projetId" @change="chargerEpisodesParProjet" required>
              <option value="">Sélectionner un projet</option>
              <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                {{ projet.titre }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Épisode *</label>
            <select v-model="formData.episodeId" @change="chargerSequencesParEpisode" :disabled="!formData.projetId" required>
              <option value="">Sélectionner un épisode</option>
              <option v-for="episode in episodesParProjet" :key="episode.idEpisode" :value="episode.idEpisode">
                Épisode {{ episode.ordre }}: {{ episode.titre }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Séquence *</label>
            <select v-model="formData.sequenceId" @change="chargerScenesParSequence" :disabled="!formData.episodeId" required>
              <option value="">Sélectionner une séquence</option>
              <option v-for="sequence in sequencesParEpisode" :key="sequence.idSequence" :value="sequence.idSequence">
                Séquence {{ sequence.ordre }}: {{ sequence.titre }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Scène Source *</label>
            <select v-model="formData.sceneSourceId" :disabled="!formData.sequenceId" required>
              <option value="">Sélectionner une scène source</option>
              <option v-for="scene in scenesParSequence" :key="scene.idScene" :value="scene.idScene">
                Scène {{ scene.ordre }}: {{ scene.titre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Scène Cible *</label>
            <select v-model="formData.sceneCibleId" :disabled="!formData.sequenceId" required>
              <option value="">Sélectionner une scène cible</option>
              <!-- Option spéciale pour la même scène -->
              <option v-if="formData.sceneSourceId" :value="formData.sceneSourceId">
                🔄 Même scène (continuité de tournage)
              </option>
              <option v-for="scene in scenesParSequence" :key="scene.idScene" :value="scene.idScene">
                Scène {{ scene.ordre }}: {{ scene.titre }}
              </option>
            </select>
            <small v-if="formData.sceneSourceId && formData.sceneCibleId === formData.sceneSourceId" class="same-scene-note">
              ⚠️ Raccord pour continuité dans la même scène (ex: tournage sur plusieurs jours)
            </small>
          </div>
        </div>
        
      <div class="form-row">
      <div class="form-group">
        <label>Personnage</label>
        <select v-model="formData.personnageId" @change="updateComedienFromPersonnage">
          <option value="">Aucun personnage</option>
          <option v-for="personnage in personnages" :key="personnage.id" :value="personnage.id">
            {{ personnage.nom }} 
            <span v-if="personnage.comedienNom">- {{ personnage.comedienNom }}</span>
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Comédien (automatique)</label>
        <input 
          type="text" 
          :value="getComedienNameFromPersonnage(formData.personnageId)" 
          disabled 
          class="disabled-input"
          placeholder="Sélectionnez un personnage"
        >
        <small class="field-note">Le comédien est automatiquement lié au personnage sélectionné</small>
      </div>
    </div>

        <div class="form-row">
          <div class="form-group">
            <label>Type de Raccord *</label>
            <select v-model="formData.typeRaccordId" required>
              <option value="">Sélectionner un type</option>
              <option v-for="type in typesRaccord" :key="type.id" :value="type.id">
                {{ type.nomType }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Statut</label>
            <select v-model="formData.statutRaccordId">
              <option v-for="statut in statutsRaccord" :key="statut.id" :value="statut.id">
                {{ statut.nomStatut }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="formData.description" rows="3" placeholder="Description du raccord..."></textarea>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="formData.estCritique">
            Raccord critique
          </label>
        </div>

        <div class="form-group">
          <label>Images de référence</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            @change="handleImageUpload"
            class="file-input"
          >
          <div v-if="previewImages.length" class="image-previews">
            <div v-for="(preview, index) in previewImages" :key="index" class="image-preview">
              <img :src="preview" alt="Preview">
              <button @click="removePreview(index)" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Enregistrement...' : (editingRaccord ? 'Modifier' : 'Créer') }}
          </button>
          <button type="button" @click="cancelForm" class="btn btn-secondary">
            Annuler
          </button>
        </div>
      </form>
    </div>

    <!-- Liste des raccords -->
    <div class="raccords-list">
      <h2>Raccords par Scène</h2>
      
      <!-- Filtres -->
      <div class="filters">
        <select v-model="selectedScene" @change="loadRaccords">
          <option value="">Toutes les scènes</option>
          <option v-for="scene in scenes" :key="scene.id" :value="scene.id">
            {{ scene.titre }} (Scène {{ scene.numero }})
          </option>
        </select>
      </div>

      <select v-model="selectedPersonnage" @change="loadRaccords">
        <option value="">Tous les personnages</option>
        <option v-for="personnage in personnages" :key="personnage.id" :value="personnage.id">
          {{ personnage.nom }}
        </option>
      </select>
      
      <select v-model="selectedComedien" @change="loadRaccords">
        <option value="">Tous les comédiens</option>
        <option v-for="comedien in comediens" :key="comedien.id" :value="comedien.id">
          {{ comedien.nom }}
        </option>
      </select>
    

      <div v-if="loadingRaccords" class="loading">Chargement...</div>
      
      <div v-else class="raccords-grid">
        <div v-for="raccord in raccords" :key="raccord.id" class="raccord-card">
          <div class="raccord-header">
            <h3>{{ raccord.typeRaccordNom }}</h3>
            <span :class="`status-badge status-${raccord.statutRaccordNom.toLowerCase()}`">
              {{ raccord.statutRaccordNom }}
            </span>
          </div>
          
          <div class="raccord-info">
            <p><strong>De:</strong> {{ raccord.sceneSourceTitre }}</p>
            <p><strong>Vers:</strong> {{ raccord.sceneCibleTitre }}</p>
            <p v-if="raccord.personnageNom"><strong>Personnage:</strong> {{ raccord.personnageNom }}</p>
            <p v-if="raccord.comedienNom"><strong>Comédien:</strong> {{ raccord.comedienNom }}</p>
            <p class="description">{{ raccord.description }}</p>
            <p v-if="raccord.estCritique" class="critique">⚠️ Raccord critique</p>
        
          </div>

          <!-- Images du raccord -->
          <div v-if="raccord.images && raccord.images.length" class="raccord-images">
            <h4>Images de référence</h4>
            <div class="images-grid">
              <div v-for="image in raccord.images" :key="image.id" class="image-item">
                <img 
                  :src="`/api/raccords/image/${image.cheminFichier}`" 
                  :alt="image.descriptionImage"
                  @click="showImageModal(image)"
                >
                <div class="image-info">
                  <p>{{ image.descriptionImage }}</p>
                  <button 
                    @click="deleteImage(raccord.id, image.id)" 
                    class="btn btn-danger btn-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="raccord-actions">
            <button @click="editRaccord(raccord)" class="btn btn-secondary btn-sm">
              Modifier
            </button>
            <button @click="addImagesToRaccord(raccord.id)" class="btn btn-info btn-sm">
              Ajouter images
            </button>
            <button @click="verifierRaccord(raccord.id)" class="btn btn-success btn-sm">
              Vérifier
            </button>
            <button @click="deleteRaccord(raccord.id)" class="btn btn-danger btn-sm">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour ajouter des images -->
    <div v-if="showImageModal" class="modal-overlay">
      <div class="modal">
        <h3>Ajouter des images au raccord</h3>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          @change="handleAdditionalImages"
          class="file-input"
        >
        <textarea 
          v-model="additionalImagesDescription" 
          placeholder="Description des images..."
          rows="3"
        ></textarea>
        <div class="modal-actions">
          <button @click="submitAdditionalImages" class="btn btn-primary">
            Ajouter
          </button>
          <button @click="showImageModal = false" class="btn btn-secondary">
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de vérification -->
    <div v-if="showVerificationModal" class="modal-overlay">
      <div class="modal">
        <h3>Vérifier le raccord</h3>
        <select v-model="verificationData.statutVerificationId" required>
          <option value="">Sélectionner un statut</option>
          <option v-for="statut in statutsVerification" :key="statut.id" :value="statut.id">
            {{ statut.nomStatut }}
          </option>
        </select>
        <textarea 
          v-model="verificationData.notes" 
          placeholder="Notes de vérification..."
          rows="4"
        ></textarea>
        <input 
          type="file" 
          accept="image/*" 
          @change="handlePreuveImage"
          class="file-input"
        >
        <div class="modal-actions">
          <button @click="submitVerification" class="btn btn-primary">
            Valider
          </button>
          <button @click="showVerificationModal = false" class="btn btn-secondary">
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'affichage d'image -->
    <div v-if="selectedImage" class="image-modal-overlay" @click="selectedImage = null">
      <div class="image-modal">
        <img :src="`/api/raccords/image/${selectedImage.cheminFichier}`" :alt="selectedImage.descriptionImage">
        <p>{{ selectedImage.descriptionImage }}</p>
      </div>
    </div>

    
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GestionRaccords',
  data() {
    return {
      showForm: false,
      loading: false,
      loadingRaccords: false,
      scenes: [],
      raccords: [],
      typesRaccord: [],
      statutsRaccord: [],
      statutsVerification: [],
      selectedScene: '',
      editingRaccord: null,
      selectedImage: null,
      showImageModal: false,
      showVerificationModal: false,
      currentRaccordId: null,
      additionalImagesDescription: '',
      preuveImage: null,
      personnages: [],
      comediens: [],
      selectedPersonnage: '',
      selectedComedien: '',
      filteredScenesCible: [],
      projets: [],
      episodesParProjet: [],
      sequencesParEpisode: [],
      scenesParSequence: [],
      formData: {
        sceneSourceId: '',
        sceneCibleId: '',
        typeRaccordId: '',
        description: '',
        estCritique: false,
        statutRaccordId: 1,
        images: [],
        personnageId: '',
        comedienId: ''
      },
      verificationData: {
        statutVerificationId: '',
        notes: '',
        preuveImage: null
      },
      previewImages: [],
      additionalImages: []
    };
  },
  async mounted() {
    await this.loadInitialData();
    await this.loadRaccords();
   this.filteredScenesCible = [...this.scenes];
  },
  methods: {
    async loadInitialData() {
    try {
      const [projetsRes, scenesRes, typesRes, statutsRes, verificationRes, personnagesRes, comediensRes] = await Promise.all([
        axios.get('/api/projets'),
        axios.get('/api/scenes'),
        axios.get('/api/raccords/types'),
        axios.get('/api/raccords/statuts'),
        axios.get('/api/raccords/statuts-verification'),
        axios.get('/api/personnages'),
        axios.get('/api/comediens')
      ]);

      this.projets = projetsRes.data;
      this.scenes = scenesRes.data;
      this.typesRaccord = typesRes.data;
      this.statutsRaccord = statutsRes.data;
      this.statutsVerification = verificationRes.data;
      this.personnages = personnagesRes.data;
      this.comediens = comediensRes.data;
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  },

  async chargerEpisodesParProjet() {
    if (!this.formData.projetId) {
      this.episodesParProjet = [];
      this.formData.episodeId = '';
      this.formData.sequenceId = '';
      this.formData.sceneSourceId = '';
      this.formData.sceneCibleId = '';
      return;
    }
    try {
      const response = await axios.get(`/api/episodes/projet/${this.formData.projetId}`);
      this.episodesParProjet = response.data;
      this.formData.episodeId = '';
      this.formData.sequenceId = '';
      this.formData.sceneSourceId = '';
      this.formData.sceneCibleId = '';
    } catch (error) {
      console.error('Erreur chargement épisodes:', error);
      this.episodesParProjet = [];
    }
  },

  async chargerSequencesParEpisode() {
    if (!this.formData.episodeId) {
      this.sequencesParEpisode = [];
      this.formData.sequenceId = '';
      this.formData.sceneSourceId = '';
      this.formData.sceneCibleId = '';
      return;
    }
    try {
      const response = await axios.get(`/api/sequences/episodes/${this.formData.episodeId}`);
      this.sequencesParEpisode = response.data;
      this.formData.sequenceId = '';
      this.formData.sceneSourceId = '';
      this.formData.sceneCibleId = '';
    } catch (error) {
      console.error('Erreur chargement séquences:', error);
      this.sequencesParEpisode = [];
    }
  },

  async chargerScenesParSequence() {
    if (!this.formData.sequenceId) {
      this.scenesParSequence = [];
      this.formData.sceneSourceId = '';
      this.formData.sceneCibleId = '';
      return;
    }
    try {
      const response = await axios.get(`/api/scenes/sequences/${this.formData.sequenceId}`);
      this.scenesParSequence = response.data;
      this.formData.sceneSourceId = '';
      this.formData.sceneCibleId = '';
    } catch (error) {
      console.error('Erreur chargement scènes:', error);
      this.scenesParSequence = [];
    }
  },


async loadRaccords() {
      this.loadingRaccords = true;
      try {
        let url = '/api/raccords';
        const params = new URLSearchParams();
        
        if (this.selectedScene) {
          params.append('sceneId', this.selectedScene);
        }
        if (this.selectedPersonnage) {
          params.append('personnageId', this.selectedPersonnage);
        }
        if (this.selectedComedien) {
          params.append('comedienId', this.selectedComedien);
        }

        if (params.toString()) {
          url += '?' + params.toString();
        }
        
        const response = await axios.get(url);
        this.raccords = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des raccords:', error);
      } finally {
        this.loadingRaccords = false;
      }
    },

    handleImageUpload(event) {
      const files = event.target.files;
      this.formData.images = Array.from(files);
      
      // Créer les previews
      this.previewImages = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    },

    handleAdditionalImages(event) {
      this.additionalImages = Array.from(event.target.files);
    },

    handlePreuveImage(event) {
      this.verificationData.preuveImage = event.target.files[0];
    },

    removePreview(index) {
      this.previewImages.splice(index, 1);
      this.formData.images.splice(index, 1);
    },

    updateSceneCibleOptions() {
      if (this.formData.sceneSourceId) {
        // Filtrer les scènes cible pour inclure toutes les scènes
        this.filteredScenesCible = this.scenes.filter(scene => 
          scene.idScene !== this.formData.sceneSourceId
        );
      } else {
        this.filteredScenesCible = [...this.scenes];
      }
    },

async submitForm() {
  this.loading = true;
  try {
          // Validation améliorée
      if (!this.formData.sceneSourceId || !this.formData.sceneCibleId || !this.formData.typeRaccordId) {
        alert('Veuillez remplir tous les champs obligatoires');
        this.loading = false;
        return;
      }
      
      // Validation spécifique pour les raccords sur la même scène
      if (this.formData.sceneSourceId === this.formData.sceneCibleId) {
        if (!confirm('Vous créez un raccord pour la même scène. Ceci est utile pour la continuité de tournage sur plusieurs jours. Confirmer ?')) {
          return;
        }
      }

    const formData = new FormData();
    
    // S'assurer que toutes les valeurs sont définies et converties en string
    formData.append('sceneSourceId', this.formData.sceneSourceId.toString());
    formData.append('sceneCibleId', this.formData.sceneCibleId.toString());
    formData.append('typeRaccordId', this.formData.typeRaccordId.toString());
    formData.append('description', this.formData.description || '');
    formData.append('estCritique', this.formData.estCritique.toString());
    formData.append('statutRaccordId', (this.formData.statutRaccordId || 1).toString());
    
    // AJOUTEZ CES LIGNES POUR LES NOUVEAUX CHAMPS
    if (this.formData.personnageId) {
        formData.append('personnageId', this.formData.personnageId.toString());
    }
    if (this.formData.comedienId) {
        formData.append('comedienId', this.formData.comedienId.toString());
    }
    
    // Ajouter les images
    if (this.formData.images && this.formData.images.length > 0) {
      this.formData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    console.log('Données envoyées:', {
      sceneSourceId: this.formData.sceneSourceId,
      sceneCibleId: this.formData.sceneCibleId,
      typeRaccordId: this.formData.typeRaccordId,
      description: this.formData.description,
      estCritique: this.formData.estCritique,
      statutRaccordId: this.formData.statutRaccordId,
      personnageId: this.formData.personnageId,    // AJOUT
      comedienId: this.formData.comedienId,        // AJOUT
      imagesCount: this.formData.images ? this.formData.images.length : 0
    });

    let response;
    if (this.editingRaccord) {
      response = await axios.put(`/api/raccords/${this.editingRaccord.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      response = await axios.post('/api/raccords', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    this.resetForm();
    await this.loadRaccords();
    this.showForm = false;
  } catch (error) {
    console.error('Erreur détaillée lors de la sauvegarde:', error);
    console.error('Response error:', error.response?.data);
    alert('Erreur lors de la sauvegarde du raccord: ' + (error.response?.data?.message || error.message));
  } finally {
    this.loading = false;
  }
},
    async addImagesToRaccord(raccordId) {
      this.currentRaccordId = raccordId;
      this.showImageModal = true;
    },

    async submitAdditionalImages() {
      try {
        const formData = new FormData();
        this.additionalImages.forEach(image => {
          formData.append('images', image);
        });
        formData.append('description', this.additionalImagesDescription);

        await axios.post(`/api/raccords/${this.currentRaccordId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        this.showImageModal = false;
        this.additionalImages = [];
        this.additionalImagesDescription = '';
        await this.loadRaccords();
      } catch (error) {
        console.error('Erreur lors de l\'ajout des images:', error);
        alert('Erreur lors de l\'ajout des images');
      }
    },

    async verifierRaccord(raccordId) {
      this.currentRaccordId = raccordId;
      this.showVerificationModal = true;
    },

    async submitVerification() {
      try {
        const formData = new FormData();
        formData.append('utilisateurId', 1); // À remplacer par l'ID de l'utilisateur connecté
        formData.append('statutVerificationId', this.verificationData.statutVerificationId);
        formData.append('notes', this.verificationData.notes);
        
        if (this.verificationData.preuveImage) {
          formData.append('preuveImage', this.verificationData.preuveImage);
        }

        await axios.post(`/api/raccords/${this.currentRaccordId}/verification`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        this.showVerificationModal = false;
        this.verificationData = {
          statutVerificationId: '',
          notes: '',
          preuveImage: null
        };
        await this.loadRaccords();
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        alert('Erreur lors de la vérification du raccord');
      }
    },

     updateComedienFromPersonnage() {
      if (this.formData.personnageId) {
        const selectedPersonnage = this.personnages.find(p => p.id === this.formData.personnageId);
        if (selectedPersonnage && selectedPersonnage.comedienId) {
          this.formData.comedienId = selectedPersonnage.comedienId;
        } else {
          this.formData.comedienId = '';
        }
      } else {
        this.formData.comedienId = '';
      }
    },

    getComedienNameFromPersonnage(personnageId) {
      if (!personnageId) return '';
      const personnage = this.personnages.find(p => p.id === personnageId);
      return personnage && personnage.comedienNom ? personnage.comedienNom : 'Aucun comédien assigné';
    },

    async editRaccord(raccord) {
    this.editingRaccord = raccord;
    
    // Charger les données hiérarchiques en fonction de la scène source
    try {
      const sceneResponse = await axios.get(`/api/scenes/${raccord.sceneSourceId}`);
      const scene = sceneResponse.data;
      
      // Charger la séquence, épisode et projet
      const sequenceResponse = await axios.get(`/api/sequences/${scene.sequenceId}`);
      const sequence = sequenceResponse.data;
      
      const episodeResponse = await axios.get(`/api/episodes/${sequence.episodeId}`);
      const episode = episodeResponse.data;
      
      // Charger les listes déroulantes
      await Promise.all([
        this.chargerEpisodesParProjet(),
        this.chargerSequencesParEpisode(),
        this.chargerScenesParSequence()
      ]);
      
      // Mettre à jour le formulaire
      this.formData = {
        projetId: episode.projetId,
        episodeId: sequence.episodeId,
        sequenceId: scene.sequenceId,
        sceneSourceId: raccord.sceneSourceId,
        sceneCibleId: raccord.sceneCibleId,
        typeRaccordId: raccord.typeRaccordId,
        description: raccord.description,
        estCritique: raccord.estCritique,
        statutRaccordId: raccord.statutRaccordId,
        personnageId: raccord.personnageId,
        comedienId: raccord.comedienId,
        images: []
      };
      
    } catch (error) {
      console.error('Erreur lors du chargement des données pour édition:', error);
    }
    
    this.showForm = true;
  },

    async deleteRaccord(id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce raccord ?')) {
        try {
          await axios.delete(`/api/raccords/${id}`);
          await this.loadRaccords();
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du raccord');
        }
      }
    },

    async deleteImage(raccordId, imageId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
        try {
          await axios.delete(`/api/raccords/images/${imageId}`);
          await this.loadRaccords();
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'image:', error);
          alert('Erreur lors de la suppression de l\'image');
        }
      }
    },

    showImageModal(image) {
      this.selectedImage = image;
    },

    resetForm() {
    this.formData = {
      projetId: '',
      episodeId: '',
      sequenceId: '',
      sceneSourceId: '',
      sceneCibleId: '',
      typeRaccordId: '',
      description: '',
      estCritique: false,
      statutRaccordId: 1,
      personnageId: '',
      comedienId: '',
      images: []
    };
    this.episodesParProjet = [];
    this.sequencesParEpisode = [];
    this.scenesParSequence = [];
    this.previewImages = [];
    this.editingRaccord = null;
  },


    cancelForm() {
      this.resetForm();
      this.showForm = false;
    }
  }
};
</script>

<style scoped>
.gestion-raccords {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.form-container {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-input {
  width: 100%;
  padding: 8px;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.image-previews {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.raccords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.raccord-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: white;
}

.raccord-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-a_verifier { background: #fff3cd; color: #856404; }
.status-en_cours { background: #d1ecf1; color: #0c5460; }
.status-valide { background: #d4edda; color: #155724; }
.status-non_conforme { background: #f8d7da; color: #721c24; }
.status-resolu { background: #e2e3e5; color: #383d41; }

.raccord-info p {
  margin: 5px 0;
}

.description {
  font-style: italic;
  color: #666;
}

.critique {
  color: #dc3545;
  font-weight: bold;
}

.raccord-images {
  margin-top: 15px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.image-item {
  position: relative;
}

.image-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.image-info {
  margin-top: 5px;
}

.image-info p {
  font-size: 12px;
  margin: 0;
}

.raccord-actions {
  display: flex;
  gap: 5px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-success { background: #28a745; color: white; }
.btn-danger { background: #dc3545; color: white; }
.btn-info { background: #17a2b8; color: white; }

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.image-modal {
  max-width: 90%;
  max-height: 90%;
}

.image-modal img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .raccords-grid {
    grid-template-columns: 1fr;
  }
  
  .raccord-actions {
    flex-direction: column;
  }
}
.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}
.same-scene-note {
  display: block;
  margin-top: 5px;
  color: #e67e22;
  font-style: italic;
  font-size: 12px;
}
.disabled-input {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.field-note {
  display: block;
  margin-top: 5px;
  color: #6c757d;
  font-size: 12px;
  font-style: italic;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

/* Style pour les options du select */
option {
  padding: 8px;
}
.form-group select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.loading-dropdown {
  color: #6c757d;
  font-style: italic;
}

.hierarchy-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.hierarchy-step {
  display: flex;
  align-items: center;
  gap: 5px;
}

.hierarchy-step.active {
  font-weight: bold;
  color: #007bff;
}

.hierarchy-arrow {
  color: #6c757d;
  margin: 0 5px;
}
</style>