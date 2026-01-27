<template>
  <div class="creation-planning-container">
    <!-- Contenu principal -->
    <main class="main-content">
      <div class="page-header">
        <button @click="goBack" class="back-btn">← Retour</button>
        <h2>Gestion du Planning de Tournage</h2>
      </div>

      <!-- Formulaire de création -->
      <div class="creation-form">
        <h3>{{ isEditing ? 'Modifier' : 'Ajouter' }} un planning de tournage</h3>
        <form @submit.prevent="submitForm">
          <!-- Sélection de la scène -->
          <div class="form-group">
            <label>Scène </label>
            <div class="scene-selection">
              <div class="filter-row">
                <select v-model="filters.projetId" @change="onProjetChange" class="filter-select">
                  <option value="">Tous les projets</option>
                  <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                    {{ projet.titre }}
                  </option>
                </select>
                
                <select v-model="filters.episodeId" @change="onEpisodeChange" class="filter-select" :disabled="!filters.projetId">
                  <option value="">Tous les épisodes</option>
                  <option v-for="episode in episodesFiltres" :key="episode.id" :value="episode.id">
                    {{ episode.titre }}
                  </option>
                </select>
                
                <select v-model="filters.sequenceId" class="filter-select" :disabled="!filters.episodeId">
                  <option value="">Toutes les séquences</option>
                  <option v-for="sequence in sequencesFiltrees" :key="sequence.id" :value="sequence.id">
                    {{ sequence.titre }}
                  </option>
                </select>
              </div>
              
              <select v-model="formData.sceneId" required class="scene-select">
                <option value="">Sélectionner une scène</option>
                <option v-for="scene in scenesFiltrees" :key="scene.id" :value="scene.id">
                  {{ getSceneFullPath(scene) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Date et heures -->
          <div class="form-row">
            <div class="form-group">
              <label>Date de tournage </label>
              <input type="date" v-model="formData.dateTournage" required>
            </div>
            
            <div class="form-group">
              <label>Heure début</label>
              <input type="time" v-model="formData.heureDebut">
            </div>
            
            <div class="form-group">
              <label>Heure fin</label>
              <input type="time" v-model="formData.heureFin">
            </div>
          </div>

          <!-- Statut -->
          <div class="form-group">
            <label>Statut </label>
            <select v-model="formData.statutId" required>
              <option value="">Sélectionner un statut</option>
              <option v-for="statut in statuts" :key="statut.id" :value="statut.id">
                {{ statut.nomStatut }}
              </option>
            </select>
          </div>

          <!-- Lieu et Plateau -->
          <div class="form-group">
            <label>Lieu de tournage</label>
            <select v-model="formData.lieuId" @change="onLieuChange">
              <option value="">Sélectionner un lieu</option>
              <option v-for="lieu in lieuxDisponibles" :key="lieu.id" :value="lieu.id">
                {{ lieu.nomLieu }} - {{ lieu.projetTitre }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="formData.lieuId">
            <label>Plateau (optionnel)</label>
            <select v-model="formData.plateauId">
              <option value="">Sélectionner un plateau</option>
              <option v-for="plateau in plateauxDuLieu" :key="plateau.id" :value="plateau.id">
                {{ plateau.nom }} ({{ plateau.typePlateau }})
              </option>
            </select>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="formData.description" rows="3" placeholder="Notes supplémentaires sur le tournage..."></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn">
              {{ isEditing ? 'Modifier' : 'Ajouter' }} le planning
            </button>
            <button v-if="isEditing" type="button" @click="resetForm" class="cancel-btn">
              Annuler
            </button>
          </div>
        </form>
      </div>

      <!-- Liste des plannings -->
      <div class="planning-list">
        <h3>Planning de tournage</h3>
        
        <!-- Filtres -->
        <div class="filters">
          <div class="filter-group">
            <input v-model="searchTerm" type="text" placeholder="Rechercher par scène..." />
          </div>
          
          <div class="filter-group">
            <select v-model="filterStatutId">
              <option value="">Tous les statuts</option>
              <option v-for="statut in statuts" :key="statut.id" :value="statut.id">
                {{ statut.nomStatut }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <input type="date" v-model="filterDate" placeholder="Filtrer par date">
          </div>
        </div>

        <div v-if="loading" class="loading">Chargement du planning...</div>
        
        <div v-else-if="filteredPlanning.length === 0" class="no-data">
          Aucun planning de tournage trouvé.
        </div>
        
        <div v-else class="planning-grid">
          <div v-for="planning in filteredPlanning" :key="planning.id" class="planning-card">
            <div class="planning-header">
              <h4>{{ planning.sceneTitre }}</h4>
              <div class="planning-actions">
                <span class="icon-edit" @click="editPlanning(planning)" title="Modifier">✏️</span>
                <span class="icon-delete" @click="deletePlanning(planning.id)" title="Supprimer">🗑️</span>
              </div>
            </div>
            
            <div class="planning-info">
              <p><strong>Date:</strong> {{ formatDate(planning.dateTournage) }}</p>
              <p><strong>Heure:</strong> {{ planning.heureDebut || 'Non définie' }} - {{ planning.heureFin || 'Non définie' }}</p>
              <p><strong>Statut:</strong> 
                <span class="statut-badge" :class="getStatutClass(planning.statutNom)">
                  {{ planning.statutNom }}
                </span>
              </p>
              <p><strong>Projet:</strong> {{ planning.projetTitre }}</p>
              <p><strong>Épisode:</strong> {{ planning.episodeTitre }}</p>
              <p><strong>Séquence:</strong> {{ planning.sequenceTitre }}</p>
              <p v-if="planning.lieuNom"><strong>Lieu:</strong> {{ planning.lieuNom }}</p>
              <p v-if="planning.plateauNom"><strong>Plateau:</strong> {{ planning.plateauNom }}</p>
              <p v-if="planning.description"><strong>Description:</strong> {{ planning.description }}</p>
              <p><strong>Créé le:</strong> {{ formatDateTime(planning.creeLe) }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export default {
  name: 'CreationPlanningTournage',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      formData: {
        sceneId: '',
        dateTournage: '',
        heureDebut: '',
        heureFin: '',
        statutId: '',
        lieuId: '',
        plateauId: '',
        description: ''
      },
      filters: {
        projetId: '',
        episodeId: '',
        sequenceId: ''
      },
      isEditing: false,
      editingId: null,
      projets: [],
      episodes: [],
      sequences: [],
      scenes: [],
      statuts: [],
      lieuxDisponibles: [],
      plateauxDuLieu: [],
      planning: [],
      searchTerm: '',
      filterStatutId: '',
      filterDate: '',
      loading: true
    };
  },
  computed: {
    episodesFiltres() {
      if (!this.filters.projetId) return [];
      return this.episodes.filter(episode => episode.projetId === parseInt(this.filters.projetId));
    },
    sequencesFiltrees() {
      if (!this.filters.episodeId) return [];
      return this.sequences.filter(sequence => sequence.episodeId === parseInt(this.filters.episodeId));
    },
    scenesFiltrees() {
      let filtered = this.scenes;
      
      if (this.filters.sequenceId) {
        filtered = filtered.filter(scene => scene.sequenceId === parseInt(this.filters.sequenceId));
      } else if (this.filters.episodeId) {
        const episodeSequences = this.sequencesFiltrees.map(s => s.id);
        filtered = filtered.filter(scene => episodeSequences.includes(scene.sequenceId));
      } else if (this.filters.projetId) {
        const projetEpisodes = this.episodesFiltres.map(e => e.id);
        const projetSequences = this.sequences.filter(s => projetEpisodes.includes(s.episodeId)).map(s => s.id);
        filtered = filtered.filter(scene => projetSequences.includes(scene.sequenceId));
      }
      
      return filtered;
    },
    filteredPlanning() {
      return this.planning.filter(planning => {
        const matchesSearch = planning.sceneTitre?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                             planning.sequenceTitre?.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesStatut = !this.filterStatutId || planning.statutId === parseInt(this.filterStatutId);
        const matchesDate = !this.filterDate || planning.dateTournage === this.filterDate;
        
        return matchesSearch && matchesStatut && matchesDate;
      });
    }
  },
  async created() {
    axios.defaults.baseURL = API_BASE_URL;
    
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    await this.loadInitialData();
    await this.loadPlanning();
  },
  methods: {
    async loadInitialData() {
      try {
        const [projetsRes, episodesRes, sequencesRes, scenesRes, statutsRes, lieuxRes] = await Promise.all([
          axios.get('/api/projets'),
          axios.get('/api/episodes'),
          axios.get('/api/sequences'),
          axios.get('/api/scenes'),
          axios.get('/api/statuts-planning'),
          axios.get('/api/lieux')
        ]);
        
        this.projets = projetsRes.data || [];
        this.episodes = episodesRes.data || [];
        this.sequences = sequencesRes.data || [];
        this.scenes = scenesRes.data || [];
        this.statuts = statutsRes.data || [];
        this.lieuxDisponibles = lieuxRes.data || [];

        console.log('Données chargées:', {
          projets: this.projets.length,
          episodes: this.episodes.length,
          sequences: this.sequences.length,
          scenes: this.scenes.length,
          statuts: this.statuts.length,
          lieux: this.lieuxDisponibles.length
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        alert('Erreur lors du chargement des données initiales: ' + (error.response?.data?.message || error.message));
      }
    },
    
    async loadPlanning() {
      this.loading = true;
      try {
        const response = await axios.get('/api/planning-tournage');
        this.planning = response.data || [];
        console.log('Planning chargé:', this.planning.length, 'éléments');
      } catch (error) {
        console.error('Erreur lors du chargement du planning:', error);
        // Si l'endpoint /all ne fonctionne pas, essayez sans
        try {
          const response = await axios.get('/api/planning-tournage/all');
          this.planning = response.data || [];
        } catch (error2) {
          console.error('Erreur avec les deux endpoints:', error2);
          this.planning = [];
        }
      } finally {
        this.loading = false;
      }
    },
    
    onProjetChange() {
      this.filters.episodeId = '';
      this.filters.sequenceId = '';
      this.formData.sceneId = '';
    },
    
    onEpisodeChange() {
      this.filters.sequenceId = '';
      this.formData.sceneId = '';
    },
    
    async onLieuChange() {
      if (this.formData.lieuId) {
        try {
          const response = await axios.get(`/api/plateaux/lieu/${this.formData.lieuId}`);
          this.plateauxDuLieu = response.data || [];
        } catch (error) {
          console.error('Erreur lors du chargement des plateaux:', error);
          // Essayez avec l'autre endpoint
          try {
            const response = await axios.get(`/api/plateaux/lieux/${this.formData.lieuId}`);
            this.plateauxDuLieu = response.data || [];
          } catch (error2) {
            console.error('Erreur avec les deux endpoints plateaux:', error2);
            this.plateauxDuLieu = [];
          }
        }
      } else {
        this.plateauxDuLieu = [];
        this.formData.plateauId = '';
      }
    },
    
    getSceneFullPath(scene) {
      if (!scene) return '';
      
      const sequence = this.sequences.find(s => s.id === scene.sequenceId);
      if (!sequence) return scene.titre || `Scène ${scene.id}`;
      
      const episode = this.episodes.find(e => e.id === sequence.episodeId);
      if (!episode) return `${sequence.titre} - ${scene.titre}`;
      
      const projet = this.projets.find(p => p.id === episode.projetId);
      if (!projet) return `${episode.titre} - ${sequence.titre} - ${scene.titre}`;
      
      return `${projet.titre} → ${episode.titre} → ${sequence.titre} → ${scene.titre}`;
    },

    getStatutClass(statutNom) {
      if (!statutNom) return '';
      const statutCode = statutNom.toLowerCase().replace(/\s+/g, '_');
      return `statut-${statutCode}`;
    },
    
    async submitForm() {
      try {
        // Validation
        if (!this.formData.sceneId || !this.formData.dateTournage || !this.formData.statutId) {
          alert('Veuillez remplir les champs obligatoires: Scène, Date et Statut');
          return;
        }

        const payload = {
          sceneId: Number(this.formData.sceneId),
          dateTournage: this.formData.dateTournage,
          heureDebut: this.formData.heureDebut || null,
          heureFin: this.formData.heureFin || null,
          statutId: Number(this.formData.statutId),
          description: this.formData.description || '',
          lieuId: this.formData.lieuId ? Number(this.formData.lieuId) : null,
          plateauId: this.formData.plateauId ? Number(this.formData.plateauId) : null
        };

        console.log('Données envoyées:', payload);

        let response;
        if (this.isEditing) {
          response = await axios.put(`/api/planning-tournage/${this.editingId}`, payload);
        } else {
          response = await axios.post('/api/planning-tournage', payload);
        }
        
        console.log('Réponse du serveur:', response.data);
        
        this.resetForm();
        await this.loadPlanning();
        alert(this.isEditing ? 'Planning modifié avec succès!' : 'Planning créé avec succès!');
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        const errorMessage = error.response?.data?.message || error.response?.data || error.message;
        alert('Erreur lors de la sauvegarde: ' + errorMessage);
      }
    },
    
    editPlanning(planning) {
      this.formData = {
        sceneId: planning.sceneId?.toString() || '',
        dateTournage: planning.dateTournage || '',
        heureDebut: planning.heureDebut || '',
        heureFin: planning.heureFin || '',
        statutId: planning.statutId?.toString() || '',
        lieuId: planning.lieuId ? planning.lieuId.toString() : '',
        plateauId: planning.plateauId ? planning.plateauId.toString() : '',
        description: planning.description || ''
      };
      
      // Définir les filtres pour la scène sélectionnée
      const scene = this.scenes.find(s => s.id === planning.sceneId);
      if (scene) {
        const sequence = this.sequences.find(s => s.id === scene.sequenceId);
        if (sequence) {
          const episode = this.episodes.find(e => e.id === sequence.episodeId);
          if (episode) {
            this.filters.projetId = episode.projetId.toString();
            this.filters.episodeId = episode.id.toString();
            this.filters.sequenceId = sequence.id.toString();
          }
        }
      }
      
      this.isEditing = true;
      this.editingId = planning.id;
      
      // Charger les plateaux si un lieu est sélectionné
      if (this.formData.lieuId) {
        this.onLieuChange();
      }
      
      document.querySelector('.creation-form').scrollIntoView({ behavior: 'smooth' });
    },
    
    async deletePlanning(planningId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce planning de tournage ?')) {
        return;
      }
      
      try {
        await axios.delete(`/api/planning-tournage/${planningId}`);
        await this.loadPlanning();
        alert('Planning supprimé avec succès!');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
      }
    },
    
    resetForm() {
      this.formData = {
        sceneId: '',
        dateTournage: '',
        heureDebut: '',
        heureFin: '',
        statutId: '',
        lieuId: '',
        plateauId: '',
        description: ''
      };
      this.filters = {
        projetId: '',
        episodeId: '',
        sequenceId: ''
      };
      this.isEditing = false;
      this.editingId = null;
      this.plateauxDuLieu = [];
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('fr-FR');
    },
    
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';
      return new Date(dateTimeStr).toLocaleString('fr-FR');
    },
    
    goBack() {
      this.$router.push('/scenariste');
    }
  }
};
</script>
