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

    <!-- Section Intégration Planning -->
    <div class="planning-integration-section">
      <h2>Intégration Planning</h2>
      <RaccordPlanningIntegration />
    </div>

    <!-- Filtres -->
    <div class="filters-section">
      <h3>Filtrer les raccords</h3>
      <div class="filters">
        <div class="filter-group">
          <label>Scène</label>
          <select v-model="selectedScene" @change="loadRaccords">
            <option value="">Toutes les scènes</option>
            <option v-for="scene in scenes" :key="scene.id" :value="scene.id">
              {{ scene.titre }} (Scène {{ scene.numero }})
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Personnage</label>
          <select v-model="selectedPersonnage" @change="loadRaccords">
            <option value="">Tous les personnages</option>
            <option v-for="personnage in personnages" :key="personnage.id" :value="personnage.id">
              {{ personnage.nom }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Comédien</label>
          <select v-model="selectedComedien" @change="loadRaccords">
            <option value="">Tous les comédiens</option>
            <option v-for="comedien in comediens" :key="comedien.id" :value="comedien.id">
              {{ comedien.nom }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste des raccords -->
    <div class="raccords-section">
      <h3>Liste des raccords</h3>
      
      <div v-if="loadingRaccords" class="loading">Chargement...</div>
      
      <div v-else class="raccords-grid">
        <div v-for="raccord in raccords" :key="raccord.id" class="raccord-card">
          <div class="raccord-header">
            <h3>{{ raccord.typeRaccordNom }}</h3>
            <span :class="`status-badge status-${raccord.statutRaccordNom.toLowerCase()}`">
              {{ raccord.statutRaccordNom }}
            </span>
          </div>

          <!-- Badge de planning -->
          <RaccordPlanningBadge :raccord="raccord" />

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
            
            <!-- Actions de planning -->
            <button 
              v-if="raccord.dateTournageSource || raccord.dateTournageCible"
              @click="ouvrirModalAjustementPlanning(raccord)" 
              class="btn btn-warning btn-sm"
            >
              <i class="fas fa-calendar-alt"></i> Ajuster Planning
            </button>
            
            <button 
              @click="ouvrirCalendrierScene(raccord.sceneSourceId)" 
              class="btn btn-outline-primary btn-sm"
            >
              <i class="fas fa-calendar"></i> Planning Source
            </button>
            
            <button 
              @click="ouvrirCalendrierScene(raccord.sceneCibleId)" 
              class="btn btn-outline-secondary btn-sm"
            >
              <i class="fas fa-calendar"></i> Planning Cible
            </button>
            
            <!-- Actions existantes -->
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

    <!-- Modal d'ajustement de planning -->
    <div v-if="showModalAjustementPlanning" class="modal-overlay" @click="fermerModalAjustementPlanning">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>
            <i class="fas fa-calendar-alt"></i>
            Ajuster le Planning
          </h4>
          <button @click="fermerModalAjustementPlanning" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="suggestionsReplanification.length > 0" class="suggestions-section">
            <h5>Suggestions de replanification:</h5>
            <div class="suggestions-list">
              <div v-for="(date, index) in suggestionsReplanification" 
                   :key="index" class="suggestion-item">
                <span>{{ formatDate(date) }}</span>
                <button @click="appliquerSuggestion(date)" class="btn btn-success btn-sm">
                  <i class="fas fa-check"></i> Appliquer
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Scène à ajuster:</label>
            <select v-model="sceneAAjuster" class="form-control">
              <option :value="raccordAjustement?.sceneSourceId">
                Source: {{ raccordAjustement?.sceneSourceTitre }}
              </option>
              <option :value="raccordAjustement?.sceneCibleId">
                Cible: {{ raccordAjustement?.sceneCibleTitre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Nouvelle date de tournage:</label>
            <input type="date" v-model="nouvelleDateTournage" class="form-control">
          </div>
          
          <div class="form-group">
            <label>Heure de début:</label>
            <input type="time" v-model="nouvelleHeureDebut" class="form-control">
          </div>
          
          <div class="form-group">
            <label>Heure de fin:</label>
            <input type="time" v-model="nouvelleHeureFin" class="form-control">
          </div>
          
          <div class="form-group">
            <label>Raison de l'ajustement:</label>
            <textarea v-model="raisonAjustement" class="form-control" rows="3"></textarea>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="fermerModalAjustementPlanning" class="btn btn-secondary">
            Annuler
          </button>
          <button @click="appliquerAjustementPlanning" class="btn btn-primary">
            <i class="fas fa-save"></i> Appliquer les modifications
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import RaccordPlanningIntegration from '../components/RaccordPlanningIntegration.vue';
import RaccordPlanningBadge from '../components/RaccordPlanningBadge.vue';

export default {
  name: 'GestionRaccords',
  components: {
    RaccordPlanningIntegration,
    RaccordPlanningBadge
  },
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
       currentUserId: 1,
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
      additionalImages: [],
      showModalAjustementPlanning: false,
      raccordAjustement: null,
      sceneAAjuster: null,
      nouvelleDateTournage: '',
      nouvelleHeureDebut: '09:00',
      nouvelleHeureFin: '12:00',
      raisonAjustement: '',
      suggestionsReplanification: []
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
    const response = await axios.get(`/api/episodes/projet/${this.formData.projetId}`, {
      headers: { 'X-User-Id': this.currentUserId }
    });
    this.episodesParProjet = response.data;
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
    const response = await axios.get(`/api/sequences/episodes/${this.formData.episodeId}`, {
      headers: { 'X-User-Id': this.currentUserId }
    });
    this.sequencesParEpisode = response.data;
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
    
    // Charger les données de planning pour chaque raccord
    await this.chargerDonneesPlanningPourRaccords();
    
  } catch (error) {
    console.error('Erreur lors du chargement des raccords:', error);
  } finally {
    this.loadingRaccords = false;
  }
},

async chargerDonneesPlanningPourRaccords() {
  try {
    // Charger tous les tournages pour la période concernée
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    
    const response = await axios.get('/api/scene-tournage/periode', {
      params: {
        startDate: this.formatDateForAPI(startDate),
        endDate: this.formatDateForAPI(endDate)
      }
    });
    
    const tournages = response.data;
    
    // Associer les dates de tournage aux raccords
    this.raccords = this.raccords.map(raccord => {
      const tournageSource = tournages.find(t => t.sceneId === raccord.sceneSourceId);
      const tournageCible = tournages.find(t => t.sceneId === raccord.sceneCibleId);
      
      return {
        ...raccord,
        dateTournageSource: tournageSource?.dateTournage || null,
        dateTournageCible: tournageCible?.dateTournage || null,
        statutTournageSource: tournageSource?.statutTournage || null,
        statutTournageCible: tournageCible?.statutTournage || null
      };
    });
    
  } catch (error) {
    console.error('Erreur chargement données planning:', error);
  }
},

formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
        
        // Pour la modification, inclure tous les champs
        if (this.editingRaccord) {
          formData.append('sceneSourceId', this.formData.sceneSourceId.toString());
          formData.append('sceneCibleId', this.formData.sceneCibleId.toString());
          formData.append('typeRaccordId', this.formData.typeRaccordId.toString());
        } else {
          formData.append('sceneSourceId', this.formData.sceneSourceId.toString());
          formData.append('sceneCibleId', this.formData.sceneCibleId.toString());
          formData.append('typeRaccordId', this.formData.typeRaccordId.toString());
        }
        
        formData.append('description', this.formData.description || '');
        formData.append('estCritique', this.formData.estCritique.toString());
        formData.append('statutRaccordId', (this.formData.statutRaccordId || 1).toString());
        
        if (this.formData.personnageId) {
          formData.append('personnageId', this.formData.personnageId.toString());
        } else {
          formData.append('personnageId', ''); // Important pour effacer le personnage
        }
        
        if (this.formData.comedienId) {
          formData.append('comedienId', this.formData.comedienId.toString());
        } else {
          formData.append('comedienId', ''); // Important pour effacer le comédien
        }
        
        // Ajouter les images
        if (this.formData.images && this.formData.images.length > 0) {
          this.formData.images.forEach(image => {
            formData.append('images', image);
          });
        }

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
        
        // Message de confirmation
        alert(this.editingRaccord ? 'Raccord modifié avec succès!' : 'Raccord créé avec succès!');
        
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
  
  try {
    // Remplir directement le formulaire avec les données du raccord
    this.formData = {
      projetId: '',
      episodeId: '',
      sequenceId: '',
      sceneSourceId: raccord.sceneSourceId,
      sceneCibleId: raccord.sceneCibleId,
      typeRaccordId: raccord.typeRaccordId,
      description: raccord.description,
      estCritique: raccord.estCritique,
      statutRaccordId: raccord.statutRaccordId,
      personnageId: raccord.personnageId || '',
      comedienId: raccord.comedienId || '',
      images: []
    };
    
    // Charger la hiérarchie de manière plus robuste
    await this.chargerHierarchiePourRaccord(raccord);
    
    this.showForm = true;
    
  } catch (error) {
    console.error('Erreur lors du chargement des données pour édition:', error);
    
    // Fallback: Remplir uniquement les données de base sans hiérarchie
    this.formData = {
      projetId: '',
      episodeId: '',
      sequenceId: '',
      sceneSourceId: raccord.sceneSourceId,
      sceneCibleId: raccord.sceneCibleId,
      typeRaccordId: raccord.typeRaccordId,
      description: raccord.description,
      estCritique: raccord.estCritique,
      statutRaccordId: raccord.statutRaccordId,
      personnageId: raccord.personnageId || '',
      comedienId: raccord.comedienId || '',
      images: []
    };
    
    this.showForm = true;
  }
},

// Nouvelle méthode pour charger la hiérarchie
async chargerHierarchiePourRaccord(raccord) {
  try {
    // Commencer par la scène source
    const sceneResponse = await axios.get(`/api/scenes/${raccord.sceneSourceId}`);
    const scene = sceneResponse.data;
    
    if (scene && scene.sequenceId) {
      // Charger la séquence SANS le header X-User-Id d'abord
      try {
        const sequenceResponse = await axios.get(`/api/sequences/${scene.sequenceId}`);
        const sequence = sequenceResponse.data;
        
        if (sequence && sequence.episodeId) {
          // Charger l'épisode SANS le header X-User-Id d'abord
          try {
            const episodeResponse = await axios.get(`/api/episodes/${sequence.episodeId}`);
            const episode = episodeResponse.data;
            
            if (episode && episode.projetId) {
              this.formData.projetId = episode.projetId;
              this.formData.episodeId = sequence.episodeId;
              this.formData.sequenceId = scene.sequenceId;
              
              // Maintenant charger les listes déroulantes AVEC les headers si nécessaires
              await this.chargerEpisodesParProjet();
              await this.chargerSequencesParEpisode();
              await this.chargerScenesParSequence();
            }
          } catch (episodeError) {
            console.warn('Impossible de charger l\'épisode:', episodeError);
            // Essayer sans header si ça échoue
            try {
              const episodeResponse = await axios.get(`/api/episodes/${sequence.episodeId}`, {
                headers: { 'X-User-Id': this.currentUserId }
              });
              const episode = episodeResponse.data;
              
              if (episode && episode.projetId) {
                this.formData.projetId = episode.projetId;
                this.formData.episodeId = sequence.episodeId;
                this.formData.sequenceId = scene.sequenceId;
                
                await this.chargerEpisodesParProjet();
                await this.chargerSequencesParEpisode();
                await this.chargerScenesParSequence();
              }
            } catch (episodeError2) {
              console.warn('Impossible de charger l\'épisode même avec header:', episodeError2);
            }
          }
        }
      } catch (sequenceError) {
        console.warn('Impossible de charger la séquence:', sequenceError);
        // Essayer sans header si ça échoue
        try {
          const sequenceResponse = await axios.get(`/api/sequences/${scene.sequenceId}`, {
            headers: { 'X-User-Id': this.currentUserId }
          });
          const sequence = sequenceResponse.data;
          
          if (sequence && sequence.episodeId) {
            // Continuer avec l'épisode...
            const episodeResponse = await axios.get(`/api/episodes/${sequence.episodeId}`, {
              headers: { 'X-User-Id': this.currentUserId }
            });
            const episode = episodeResponse.data;
            
            if (episode && episode.projetId) {
              this.formData.projetId = episode.projetId;
              this.formData.episodeId = sequence.episodeId;
              this.formData.sequenceId = scene.sequenceId;
              
              await this.chargerEpisodesParProjet();
              await this.chargerSequencesParEpisode();
              await this.chargerScenesParSequence();
            }
          }
        } catch (sequenceError2) {
          console.warn('Impossible de charger la séquence même avec header:', sequenceError2);
        }
      }
    }
  } catch (sceneError) {
    console.warn('Impossible de charger la scène:', sceneError);
  }
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

    async ouvrirModalAjustementPlanning(raccord) {
      this.raccordAjustement = raccord;
      this.sceneAAjuster = raccord.sceneCibleId; // Par défaut, ajuster la scène cible
      
      try {
        const response = await axios.get(`/api/raccords/${raccord.id}/suggestions-replanification`);
        this.suggestionsReplanification = response.data;
      } catch (error) {
        console.error('Erreur chargement suggestions:', error);
        this.suggestionsReplanification = [];
      }
      
      this.showModalAjustementPlanning = true;
    },
    
    fermerModalAjustementPlanning() {
      this.showModalAjustementPlanning = false;
      this.raccordAjustement = null;
      this.sceneAAjuster = null;
      this.nouvelleDateTournage = '';
      this.raisonAjustement = '';
      this.suggestionsReplanification = [];
    },
    
    appliquerSuggestion(date) {
      this.nouvelleDateTournage = this.formatDateForInput(date);
    },
    
   async appliquerAjustementPlanning() {
  if (!this.nouvelleDateTournage) {
    alert('Veuillez sélectionner une date');
    return;
  }
  
  try {
    const ajustementDTO = {
      sceneId: this.sceneAAjuster,
      nouvelleDate: this.nouvelleDateTournage,
      nouvelleHeureDebut: this.nouvelleHeureDebut,
      nouvelleHeureFin: this.nouvelleHeureFin,
      raisonAjustement: this.raisonAjustement || `Ajustement pour raccord: ${this.raccordAjustement.description}`,
      utilisateurId: 1, // Remplacer par l'ID utilisateur réel
      notifierEquipe: true,
      notesSupplementaires: 'Ajustement automatique basé sur les contraintes de raccord'
    };
    
    // IMPORTANT: Utiliser application/json et envoyer en JSON
    await axios.put(`/api/raccords/${this.raccordAjustement.id}/ajuster-planning`, 
      ajustementDTO,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    alert('Planning ajusté avec succès!');
    this.fermerModalAjustementPlanning();
    await this.loadRaccords();
    
  } catch (error) {
    console.error('Erreur ajustement planning:', error);
    const errorMessage = error.response?.data?.message || error.response?.data || error.message;
    alert('Erreur lors de l\'ajustement du planning: ' + errorMessage);
  }
},
    
    ouvrirCalendrierScene(sceneId) {
      // Navigation vers le calendrier avec filtre sur la scène
      this.$router.push({
        path: '/calendrier-tournage',
        query: { sceneId: sceneId }
      });
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR');
    },
    
    formatDateForInput(dateString) {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
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
        images: [],
        personnageId: '',
        comedienId: ''
      };
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
  max-width: 1200px; 
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
}

.form-container {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 30px;
  border: 1px solid #dee2e6;
}

.form-container h2 {
  margin-top: 0;
  color: #495057;
  margin-bottom: 25px;
}

.raccord-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #495057;
}

.form-group select,
.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group select:disabled,
.form-group input:disabled {
  background-color: #e9ecef;
  opacity: 0.7;
}

.disabled-input {
  background-color: #f8f9fa !important;
  color: #6c757d !important;
}

.file-input {
  padding: 8px !important;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.image-previews {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #1e7e34;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #138496;
}

.btn-outline-primary {
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline-primary:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.btn-outline-secondary {
  background-color: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline-secondary:hover:not(:disabled) {
  background-color: #6c757d;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.planning-integration-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #dee2e6;
}

.filters-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #dee2e6;
}

.filters-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #495057;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #495057;
  font-size: 14px;
}

.raccords-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.raccords-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #495057;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.raccords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.raccord-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
  transition: box-shadow 0.15s ease-in-out;
}

.raccord-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.raccord-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.raccord-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-en-attente {
  background-color: #fff3cd;
  color: #856404;
}

.status-valide {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-rejete {
  background-color: #f8d7da;
  color: #721c24;
}

.status-en-cours {
  background-color: #d4edda;
  color: #155724;
}

.raccord-info {
  margin-bottom: 15px;
}

.raccord-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #495057;
}

.raccord-info .description {
  font-style: italic;
  color: #6c757d;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

.critique {
  color: #dc3545 !important;
  font-weight: 600;
  margin-top: 10px !important;
}

.raccord-images {
  margin-bottom: 15px;
}

.raccord-images h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #495057;
}

.images-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.image-item {
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

.image-item:hover .image-info {
  opacity: 1;
}

.raccord-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
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
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
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
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
}

.image-modal img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.image-modal p {
  margin-top: 10px;
  text-align: center;
  color: #495057;
}

.field-note {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  font-style: italic;
}

.same-scene-note {
  font-size: 12px;
  color: #856404;
  background-color: #fff3cd;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 5px;
  border: 1px solid #ffeaa7;
}

/* Styles pour le modal d'ajustement de planning */
.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h4 {
  margin: 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.close-btn:hover {
  color: #495057;
}

.modal-body {
  padding: 20px;
}

.suggestions-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.suggestions-section h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #495057;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* Responsive */
@media (max-width: 768px) {
  .gestion-raccords {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .filters {
    grid-template-columns: 1fr;
  }
  
  .raccords-grid {
    grid-template-columns: 1fr;
  }
  
  .raccord-actions {
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal {
    width: 95%;
    padding: 20px;
  }
}
</style>