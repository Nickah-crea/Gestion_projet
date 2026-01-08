<template>
  <div class="add-sequence-container">

    <!-- Contenu principal -->
    <main class="main-content">
      <div class="sequence-header">
        <button @click="goBack" class="back-btn">← Retour</button>
        <h2>Ajouter une nouvelle séquence</h2>
      </div>

      <!-- Formulaire d'ajout de séquence -->
      <div class="add-sequence-form">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="titre">Titre de la séquence</label>
            <input
              id="titre"
              v-model="formData.titre"
              type="text"
              required
              placeholder="Entrez le titre de la séquence"
            />
          </div>

          <div class="form-group">
            <label for="ordre">Ordre dans l'épisode</label>
            <input
              id="ordre"
              v-model="formData.ordre"
              type="number"
              min="1"
              required
              placeholder="Numéro d'ordre"
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

          <div class="form-group">
            <label for="synopsis">Synopsis</label>
            <textarea
              id="synopsis"
              v-model="formData.synopsis"
              required
              rows="5"
              placeholder="Décrivez le contenu de cette séquence"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="episode">Épisode lié</label>
            <input
              id="episode"
              :value="episode.titre"
              type="text"
              disabled
            />
          </div>

          <div class="form-group">
            <label for="statut">Statut *</label>
            <select
              id="statut"
              v-model="formData.statutId"
              required
            >
              <option value="" disabled>Sélectionnez un statut</option>
              <option 
                v-for="statut in statutsSequence" 
                :key="statut.id" 
                :value="statut.id"
              >
                {{ statut.nomStatutsSequence }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="loading || ordreError !== ''"
            >
              {{ loading ? 'Création en cours...' : 'Créer la séquence' }}
            </button>
            <button 
              type="button" 
              @click="goBack" 
              class="cancel-btn"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      showProfileMenu: false,
      episode: {},
      statutsSequence: [],
      existingOrders: [], // Liste des ordres existants
      formData: {
        titre: '',
        ordre: null,
        synopsis: '',
        statutId: null
      },
      loading: false,
      ordreError: '', // Erreur spécifique à l'ordre
      suggestedOrdre: null // Ordre suggéré
    };
  },
  computed: {
    userInitials() {
      if (!this.user?.nom) return '';
      const names = this.user.nom.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    },
    episodeId() {
      return this.$route.params.id || this.$route.params.episodeId;
    }
  },
  async created() {
    await this.loadEpisode();
    await this.loadStatutsSequence();
    await this.fetchExistingSequences(); // Charger les séquences existantes
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    async loadEpisode() {
      try {
        console.log('ID d\'épisode récupéré:', this.episodeId);
        console.log('Route params:', this.$route.params);
        
        const response = await axios.get(`/api/episodes/${this.episodeId}`, {
          headers: {
            'X-User-Id': this.user.id
          }
        });
        this.episode = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement de l\'épisode:', error);
        console.error('Détails de l\'erreur:', error.response?.data);
        alert('Impossible de charger les détails de l\'épisode');
      }
    },
    async loadStatutsSequence() {
      try {
        const response = await axios.get('/api/statuts-sequence');
        this.statutsSequence = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
        alert('Impossible de charger les statuts disponibles');
      }
    },
    async fetchExistingSequences() {
      try {
        const response = await axios.get(`/api/sequences/episodes/${this.episodeId}`);
        
        // Récupérer tous les ordres existants
        this.existingOrders = response.data.map(sequence => sequence.ordre);
        
        // Calculer le prochain ordre disponible
        this.calculateSuggestedOrdre();
        
      } catch (error) {
        console.error('Erreur lors du chargement des séquences existantes:', error);
      }
    },
    calculateSuggestedOrdre() {
      if (this.existingOrders.length === 0) {
        this.suggestedOrdre = 1;
        this.formData.ordre = 1;
        return;
      }
      
      // Trouver le plus grand ordre existant
      const maxOrder = Math.max(...this.existingOrders);
      this.suggestedOrdre = maxOrder + 1;
      
      // Pré-remplir avec l'ordre suggéré
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
      
      // Vérifier si l'ordre existe déjà
      if (this.existingOrders.includes(orderNum)) {
        this.ordreError = `L'ordre ${orderNum} existe déjà pour cet épisode. Veuillez choisir un autre numéro.`;
        return;
      }
      
      this.ordreError = '';
    },
    async submitForm() {
  // Valider l'ordre avant soumission
  this.validateOrdre();
  if (this.ordreError) {
    return;
  }
  
  this.loading = true;
  try {
    // Récupérer l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      throw new Error('Utilisateur non connecté');
    }

    const response = await axios.post(`/api/sequences/episodes/${this.episodeId}`, this.formData, {
      headers: {
        'X-User-Id': user.id
      }
    });
    
    alert('Séquence créée avec succès!');
    this.goBackToEpisodeDetails();
  } catch (error) {
    console.error('Erreur lors de la création de la séquence:', error);
    
    // Gestion spécifique des erreurs de duplication d'ordre
    if (error.response?.status === 400 && error.response?.data?.message?.includes('ordre')) {
      this.ordreError = 'Cet ordre existe déjà pour cet épisode. Veuillez choisir un autre numéro.';
    } else {
      alert('Erreur lors de la création de la séquence: ' + 
        (error.response?.data?.message || 'Veuillez réessayer'));
    }
  } finally {
    this.loading = false;
  }
},
    goBack() {
      this.$router.go(-1);
    },
    goBackToEpisodeDetails() {
      this.$router.push(`/episode/${this.episodeId}/detail-episode`);
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


