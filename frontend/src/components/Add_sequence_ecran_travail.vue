<template>
  <div class="app-wrapper">
  <div class="add-episode-container">
    <!-- Contenu principal -->
    <main class="main-content">
      <div class="form-header">
        <button @click="goBack" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour
        </button>
        <h2>Ajouter une nouvelle séquence</h2>
      </div>

      <form @submit.prevent="submitForm" class="episode-form">
        <!-- Ligne 1 : Titre de la séquence + Épisode lié -->
        <div class="form-row">
          <div class="form-group form-group-half">
            <label for="titre">Titre de la séquence </label>
            <input 
              type="text" 
              id="titre"
              v-model="formData.titre" 
              required 
              placeholder="Entrez le titre de la séquence"
              class="form-input"
            />
          </div>
          <div class="form-group form-group-half">
            <label for="episode">Épisode lié</label>
            <input 
              id="episode"
              :value="episode.titre" 
              type="text"
              disabled
              class="form-input"
            />
          </div>
        </div>

        <!-- Ligne 2 : Ordre dans l'épisode + Statut -->
        <div class="form-row">
          <div class="form-group form-group-half">
            <label for="ordre">Ordre dans l'épisode </label>
            <input 
              type="number" 
              id="ordre"
              v-model="formData.ordre" 
              required 
              placeholder="Entrez le nombre"
              min="1"
              class="form-input"
              :class="{ 'error-input': ordreError }"
              @blur="validateOrdre"
            />
            <span v-if="ordreError" class="error-text">{{ ordreError }}</span>
            <span v-if="suggestedOrdre" class="suggestion-text">
              Suggestion: Le prochain ordre disponible est {{ suggestedOrdre }}
              <button type="button" @click="useSuggestedOrder" class="suggestion-btn">
                Utiliser cette valeur
              </button>
            </span>
          </div>
          <div class="form-group form-group-half">
            <label for="statut">Statut </label>
            <select 
              id="statut"
              v-model="formData.statutId" 
              required
              class="form-select"
            >
              <option value="">Sélectionner le statut</option>
              <option v-for="statut in statutsSequence" :key="statut.idStatutSequence" :value="statut.idStatutSequence">
                {{ statut.nomStatutsSequence }}
              </option>
            </select>
          </div>
        </div>

        <!-- Ligne 3 : Synopsis (pleine largeur) -->
        <div class="form-group">
          <label for="synopsis">Synopsis *</label>
          <textarea 
            id="synopsis"
            v-model="formData.synopsis" 
            rows="6"
            placeholder="Décrivez le contenu de cette séquence"
            class="form-textarea"
          ></textarea>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="cancel-btn">Annuler</button>
          <button type="submit" class="submit-btn" :disabled="loading || ordreError !== ''">
            {{ loading ? 'Création en cours...' : 'Créer' }}
          </button>
        </div>
      </form>
    </main>
  </div>
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/css/add_episode.css';

export default {
  name: 'AddSequenceView',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      showProfileMenu: false,
      episode: {},
      statutsSequence: [],
      formData: {
        titre: '',
        ordre: null,
        synopsis: '',
        statutId: null
      },
      loading: false,
      errorMessage: '',
      newSequenceId: null,
      existingOrders: [],
      ordreError: '',
      suggestedOrdre: null
    };
  },
  computed: {
    userInitials() {
      if (!this.user?.nom) return '?';
      const names = this.user.nom.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    },
    episodeId() {
      return this.$route.params.episodeId || this.$route.params.id || this.$route.query.episodeId;
    }
  },
  mounted() {
    this.loadUser();
    this.loadEpisode();
    this.loadStatutsSequence();
    this.fetchExistingSequences();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    loadUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
      } else {
        this.$router.push('/');
      }
    },
    async loadEpisode() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const headers = user && user.id ? { 'X-User-Id': user.id } : {};
        const response = await axios.get(`/api/episodes/${this.episodeId}`, { headers });
        this.episode = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement de l\'épisode:', error);
        this.errorMessage = 'Erreur lors du chargement de l\'épisode. Veuillez réessayer.';
      }
    },
    async loadStatutsSequence() {
      try {
        const response = await axios.get('/api/statuts-sequence');
        this.statutsSequence = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts de séquence:', error);
        this.errorMessage = 'Erreur lors du chargement des statuts';
      }
    },
    async fetchExistingSequences() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const headers = user && user.id ? { 'X-User-Id': user.id } : {};
        const response = await axios.get(`/api/sequences/episode/${this.episodeId}`, { headers });
        this.existingOrders = response.data.map(sequence => sequence.ordre);
        this.calculateSuggestedOrdre();
      } catch (error) {
        console.error('Erreur lors du chargement des séquences existantes:', error);
        this.existingOrders = [];
        this.calculateSuggestedOrdre();
      }
    },
    calculateSuggestedOrdre() {
      if (this.existingOrders.length === 0) {
        this.suggestedOrdre = 1;
        this.formData.ordre = 1;
        return;
      }
      const maxOrder = Math.max(...this.existingOrders);
      this.suggestedOrdre = maxOrder + 1;
      this.formData.ordre = this.suggestedOrdre;
    },
    validateOrdre() {
      if (!this.formData.ordre) {
        this.ordreError = 'L\'ordre est requis';
        return;
      }
      const orderNum = parseInt(this.formData.ordre);
      if (orderNum < 1) {
        this.ordreError = 'L\'ordre doit être au moins 1';
        return;
      }
      if (this.existingOrders.includes(orderNum)) {
        this.ordreError = `L'ordre ${orderNum} existe déjà pour cet épisode. Veuillez choisir un autre numéro.`;
        return;
      }
      this.ordreError = '';
    },
    useSuggestedOrder() {
      this.formData.ordre = this.suggestedOrdre;
      this.validateOrdre();
    },
    async submitForm() {
      this.validateOrdre();
      if (this.ordreError) {
        return;
      }
      this.loading = true;
      this.errorMessage = '';
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          throw new Error('Utilisateur non connecté');
        }
        const response = await axios.post(`/api/sequences/episode/${this.episodeId}`, this.formData, {
          headers: { 'X-User-Id': user.id }
        });
        if (response.status === 201) {
          this.newSequenceId = response.data.idSequence;
          this.$router.push({
            path: `/projet/${this.episode.projetId}/ecran-travail`,
            query: { episodeId: this.episodeId, sequenceId: this.newSequenceId }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la création de la séquence:', error);
        if (error.response?.status === 400 && error.response?.data?.message?.includes('ordre')) {
          this.ordreError = 'Cet ordre existe déjà pour cet épisode. Veuillez choisir un autre numéro.';
        } else {
          this.errorMessage = error.response?.data?.message || 'Erreur lors de la création de la séquence';
        }
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      if (this.newSequenceId) {
        this.$router.push({
          path: `/projet/${this.episode.projetId}/ecran-travail`,
          query: { episodeId: this.episodeId, sequenceId: this.newSequenceId }
        });
      } else {
        this.$router.go(-1);
      }
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    handleClickOutside(event) {
      if (!event.target.closest('.profile-section')) {
        this.showProfileMenu = false;
      }
    },
    seDeconnecter() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
};
</script>

