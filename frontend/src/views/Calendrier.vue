<template>
  <div class="calendrier-container">
    <div class="calendrier-header">
      <h2>Calendrier de Tournage</h2>
      <div class="controls">
        <select v-model="selectedProjet" @change="loadPlanning">
          <option value="">Tous les projets</option>
          <option v-for="projet in projets" :key="projet.id" :value="projet.id">
            {{ projet.titre }}
          </option>
        </select>
        <button @click="previousMonth" class="btn-nav">←</button>
        <span class="month-display">{{ currentMonth }}</span>
        <button @click="nextMonth" class="btn-nav">→</button>
        <button @click="showAddModal = true" class="btn-primary">Nouveau Planning</button>
      </div>
    </div>

    <div class="calendrier">
      <div class="calendrier-grid">
        <div class="calendrier-header-row">
          <div v-for="day in days" :key="day" class="calendrier-header-cell">
            {{ day }}
          </div>
        </div>
        <div class="calendrier-body">
          <div v-for="week in weeks" :key="week[0]" class="calendrier-week">
            <div
              v-for="day in week"
              :key="day.date"
              class="calendrier-day"
              :class="{
                'other-month': !day.isCurrentMonth,
                'today': day.isToday,
                'has-tournage': day.tournages && day.tournages.length > 0
              }"
              @click="selectDay(day)"
            >
              <div class="day-number">{{ day.date.getDate() }}</div>
              <div class="tournage-events">
                <div
                  v-for="tournage in day.tournages"
                  :key="tournage.id"
                  class="tournage-event"
                  :class="`statut-${tournage.statutCode}`"
                  @click.stop="viewTournage(tournage)"
                >
                  <div class="tournage-time">{{ tournage.heureDebut }}</div>
                  <div class="tournage-title">{{ tournage.sceneTitre }}</div>
                  <div class="tournage-lieu">{{ getLieuDisplay(tournage) }}</div>
                  <div class="tournage-statut">{{ tournage.statutNom }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ showEditModal ? 'Modifier' : 'Nouveau' }} Planning de Tournage</h3>
        <form @submit.prevent="savePlanning">
          <div class="form-group">
            <label>Scène *</label>
            <select v-model="form.sceneId" required>
              <option value="">Sélectionner une scène</option>
              <option v-for="scene in scenes" :key="scene.id" :value="scene.id">
                {{ scene.sequenceTitre }} - {{ scene.titre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Date de tournage *</label>
            <input type="date" v-model="form.dateTournage" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Heure début</label>
              <input type="time" v-model="form.heureDebut">
            </div>
            <div class="form-group">
              <label>Heure fin</label>
              <input type="time" v-model="form.heureFin">
            </div>
          </div>
          
          <div class="form-group">
            <label>Statut *</label>
            <select v-model="form.statutId" required>
              <option value="">Sélectionner un statut</option>
              <option v-for="statut in statuts" :key="statut.id" :value="statut.id">
                {{ statut.nomStatut }}
              </option>
            </select>
          </div>
          
          <!-- Nouveaux champs pour lieux et plateaux -->
          <div class="form-group">
            <label>Lieu de tournage</label>
            <select v-model="form.lieuId" @change="onLieuChange">
              <option value="">Sélectionner un lieu</option>
              <option v-for="lieu in lieuxDisponibles" :key="lieu.id" :value="lieu.id">
                {{ lieu.nomLieu }} - {{ lieu.projetTitre }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="form.lieuId && plateauxDuLieu.length > 0">
            <label>Plateau (optionnel)</label>
            <select v-model="form.plateauId">
              <option value="">Sélectionner un plateau</option>
              <option v-for="plateau in plateauxDuLieu" :key="plateau.id" :value="plateau.id">
                {{ plateau.nom }} ({{ plateau.typePlateau }})
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Description du tournage..."></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">
              {{ showEditModal ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de détails -->
    <div v-if="selectedTournage" class="modal-overlay">
      <div class="modal">
        <h3>Détails du Tournage</h3>
        <div class="tournage-details">
          <p><strong>Scène:</strong> {{ selectedTournage.sceneTitre }}</p>
          <p><strong>Séquence:</strong> {{ selectedTournage.sequenceTitre }}</p>
          <p><strong>Épisode:</strong> {{ selectedTournage.episodeTitre }}</p>
          <p><strong>Projet:</strong> {{ selectedTournage.projetTitre }}</p>
          <p><strong>Date:</strong> {{ formatDate(selectedTournage.dateTournage) }}</p>
          <p><strong>Heure:</strong> {{ selectedTournage.heureDebut }} - {{ selectedTournage.heureFin }}</p>
          <p><strong>Statut:</strong> {{ selectedTournage.statutNom }}</p>
          <p v-if="selectedTournage.lieuNom"><strong>Lieu:</strong> {{ selectedTournage.lieuNom }}</p>
          <p v-if="selectedTournage.plateauNom"><strong>Plateau:</strong> {{ selectedTournage.plateauNom }}</p>
          <p v-if="selectedTournage.lieuTournage"><strong>Lieu de tournage:</strong> {{ selectedTournage.lieuTournage }}</p>
          <p><strong>Description:</strong> {{ selectedTournage.description }}</p>
        </div>
        <div class="modal-actions">
          <button @click="editTournage(selectedTournage)" class="btn-primary">Modifier</button>
          <button @click="deleteTournage(selectedTournage)" class="btn-danger">Supprimer</button>
          <button @click="selectedTournage = null" class="btn-secondary">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/css/calendrier.css';

const API_BASE_URL = 'http://localhost:8080';

export default {
  name: 'Calendrier',
  data() {
    return {
      currentDate: new Date(),
      planning: [],
      projets: [],
      scenes: [],
      statuts: [],
      lieuxDisponibles: [],
      plateauxDuLieu: [],
      selectedProjet: '',
      showAddModal: false,
      showEditModal: false,
      selectedTournage: null,
      form: {
        id: null,
        sceneId: '',
        dateTournage: '',
        heureDebut: '',
        heureFin: '',
        statutId: '',
        description: '',
        lieuId: null,
        plateauId: null
      }
    };
  },
  computed: {
    days() {
      return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    },
    currentMonth() {
      return this.currentDate.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long' 
      });
    },
    weeks() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
      
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));
      
      const weeks = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const week = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(currentDate);
          const isCurrentMonth = date.getMonth() === month;
          const isToday = this.isToday(date);
          const tournages = this.getTournagesForDate(date);
          
          week.push({
            date,
            isCurrentMonth,
            isToday,
            tournages
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
      }
      
      return weeks;
    }
  },
  async mounted() {
    // Configuration d'axios
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

    await this.loadData();
    await this.loadPlanning();
  },
  methods: {
    async loadData() {
      try {
        const [projetsRes, scenesRes, statutsRes, lieuxRes] = await Promise.all([
          axios.get('/api/projets'),
          axios.get('/api/scenes'),
          axios.get('/api/statuts-planning'),
          axios.get('/api/lieux')
        ]);
        
        this.projets = projetsRes.data;
        this.scenes = scenesRes.data;
        this.statuts = statutsRes.data;
        this.lieuxDisponibles = lieuxRes.data;
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        alert('Erreur lors du chargement des données: ' + (error.response?.data?.message || error.message));
      }
    },

    async onLieuChange() {
      if (this.form.lieuId) {
        try {
          const response = await axios.get(`/api/plateaux/lieu/${this.form.lieuId}`);
          this.plateauxDuLieu = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement des plateaux:', error);
          this.plateauxDuLieu = [];
        }
      } else {
        this.plateauxDuLieu = [];
        this.form.plateauId = null;
      }
    },

    async loadPlanning() {
      try {
        const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        let url = `/api/planning-tournage?startDate=${startStr}&endDate=${endStr}`;
        
        if (this.selectedProjet) {
          url = `/api/planning-tournage/projet/${this.selectedProjet}?startDate=${startStr}&endDate=${endStr}`;
        }
        
        console.log('Chargement du planning avec URL:', url);
        const response = await axios.get(url);
        this.planning = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement du planning:', error);
        this.planning = [];
      }
    },

    getTournagesForDate(date) {
      const dateStr = date.toISOString().split('T')[0];
      return this.planning.filter(t => t.dateTournage === dateStr);
    },

    getLieuDisplay(tournage) {
      if (tournage.lieuNom && tournage.plateauNom) {
        return `${tournage.lieuNom} - ${tournage.plateauNom}`;
      } else if (tournage.lieuNom) {
        return tournage.lieuNom;
      } else if (tournage.lieuTournage) {
        return tournage.lieuTournage;
      }
      return 'Lieu non spécifié';
    },

    isToday(date) {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    },

    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.loadPlanning();
    },

    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.loadPlanning();
    },

    selectDay(day) {
      if (day.isCurrentMonth) {
        this.form.dateTournage = day.date.toISOString().split('T')[0];
        this.showAddModal = true;
      }
    },

    viewTournage(tournage) {
      this.selectedTournage = tournage;
    },

    editTournage(tournage) {
      this.form = {
        id: tournage.id,
        sceneId: tournage.sceneId,
        dateTournage: tournage.dateTournage,
        heureDebut: tournage.heureDebut || '',
        heureFin: tournage.heureFin || '',
        statutId: tournage.statutId,
        description: tournage.description || '',
        lieuId: tournage.lieuId || null,
        plateauId: tournage.plateauId || null
      };
      
      // Charger les plateaux si un lieu est sélectionné
      if (this.form.lieuId) {
        this.onLieuChange();
      }
      
      this.showEditModal = true;
      this.selectedTournage = null;
    },

    async deleteTournage(tournage) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce planning de tournage ?')) {
        try {
          await axios.delete(`/api/planning-tournage/${tournage.id}`);
          await this.loadPlanning();
          this.selectedTournage = null;
          alert('Planning supprimé avec succès!');
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
        }
      }
    },

    async savePlanning() {
      try {
        // Validation
        if (!this.form.sceneId || !this.form.dateTournage || !this.form.statutId) {
          alert('Veuillez remplir les champs obligatoires: Scène, Date et Statut');
          return;
        }

        const formData = {
          sceneId: Number(this.form.sceneId),
          dateTournage: this.form.dateTournage,
          heureDebut: this.form.heureDebut || null,
          heureFin: this.form.heureFin || null,
          statutId: Number(this.form.statutId),
          description: this.form.description || '',
          lieuId: this.form.lieuId ? Number(this.form.lieuId) : null,
          plateauId: this.form.plateauId ? Number(this.form.plateauId) : null
        };

        console.log('Données envoyées:', JSON.stringify(formData, null, 2));

        let response;
        if (this.showEditModal) {
          response = await axios.put(`/api/planning-tournage/${this.form.id}`, formData);
        } else {
          response = await axios.post('/api/planning-tournage', formData);
        }
        
        console.log('Réponse du serveur:', response.data);
        
        this.closeModal();
        await this.loadPlanning();
        alert('Planning sauvegardé avec succès!');
        
      } catch (error) {
        console.error('Erreur complète:', error);
        const errorMessage = error.response?.data?.message || error.response?.data || error.message;
        alert('Erreur lors de la sauvegarde: ' + errorMessage);
      }
    },

    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.selectedTournage = null;
      this.resetForm();
    },

    resetForm() {
      this.form = {
        id: null,
        sceneId: '',
        dateTournage: '',
        heureDebut: '',
        heureFin: '',
        statutId: '',
        description: '',
        lieuId: null,
        plateauId: null
      };
      this.plateauxDuLieu = [];
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    }
  }
};
</script>

