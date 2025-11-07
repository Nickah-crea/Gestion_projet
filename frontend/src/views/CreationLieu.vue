<template>
  <div class="creation-lieu-container">

    <!-- Contenu principal -->
    <main class="#">
      <div class="page-header">
        <button @click="goBack" class="back-btn">← Retour</button>
        <h2>Gestion des Lieux</h2>
      </div>

      <!-- Formulaire de création -->
      <div class="creation-form">
        <h3>{{ isEditing ? 'Modifier' : 'Ajouter' }} un lieu</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Projet *</label>
            <div class="combobox-container">
              <input
                type="text"
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
                  {{ projet.titre }} ({{ projet.genreNom }})
                </li>
              </ul>
              <ul v-if="showProjetSuggestions && filteredProjets.length === 0" class="suggestions-list">
                <li class="suggestion-item no-results">Aucun projet trouvé</li>
              </ul>
            </div>
          </div>
          
          <div class="form-group">
            <label>Nom du lieu *</label>
            <input v-model="formData.nomLieu" type="text" required placeholder="Ex: Appartement principal, Rue de Paris...">
          </div>
          
          <div class="form-group">
            <label>Type de lieu *</label>
            <select v-model="formData.typeLieu" required>
              <option value="">Sélectionnez un type</option>
              <option value="Intérieur">Intérieur</option>
              <option value="Extérieur">Extérieur</option>
              <option value="Intérieur/Extérieur">Intérieur/Extérieur</option>
              <option value="Studio">Studio</option>
              <option value="Naturel">Naturel</option>
              <option value="Urbain">Urbain</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Adresse</label>
            <textarea v-model="formData.adresse" rows="3" placeholder="Adresse complète du lieu..."></textarea>
          </div>
          
          <button type="submit" class="submit-btn">{{ isEditing ? 'Modifier' : 'Ajouter' }} le lieu</button>
          <button v-if="isEditing" type="button" @click="resetForm" class="cancel-btn">Annuler</button>
        </form>
      </div>

      <!-- Liste des lieux -->
      <div class="lieux-list">
        <h3>Liste des lieux</h3>
        
        <div class="filters">
          <div class="filter-group">
            <input v-model="searchTerm" type="text" placeholder="Rechercher par nom..." />
          </div>
          
          <div class="filter-group">
            <select v-model="filterProjetId">
              <option value="">Tous les projets</option>
              <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                {{ projet.titre }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <select v-model="filterTypeLieu">
              <option value="">Tous les types</option>
              <option value="Intérieur">Intérieur</option>
              <option value="Extérieur">Extérieur</option>
              <option value="Intérieur/Extérieur">Intérieur/Extérieur</option>
              <option value="Studio">Studio</option>
              <option value="Naturel">Naturel</option>
              <option value="Urbain">Urbain</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading">Chargement des lieux...</div>
        
        <div v-else-if="filteredLieux.length === 0" class="no-data">
          Aucun lieu trouvé.
        </div>
        
        <div v-else class="lieux-grid">
          <div v-for="lieu in filteredLieux" :key="lieu.id" class="lieu-card">
            <div class="lieu-header">
              <h4>{{ lieu.nomLieu }}</h4>
              <div class="lieu-actions">
                <span class="icon-edit" @click="editLieu(lieu)">✏️</span>
                <span class="icon-delete" @click="deleteLieu(lieu.id)">🗑️</span>
                <span 
                  class="icon-scenes" 
                  @click="viewLieuScenes(lieu)"
                  title="Voir les scènes utilisant ce lieu"
                >
                  🎬
                </span>
              </div>
            </div>
            
            <div class="lieu-info">
              <p><strong>Projet:</strong> {{ lieu.projetTitre }}</p>
              <p><strong>Type:</strong> {{ lieu.typeLieu }}</p>
              <p v-if="lieu.adresse"><strong>Adresse:</strong> {{ lieu.adresse }}</p>
              <p><strong>Créé le:</strong> {{ formatDate(lieu.creeLe) }}</p>
              <p><strong>Scènes associées:</strong> {{ lieu.sceneCount || 0 }}</p>
            </div>
            
            <!-- Liste des scènes utilisant ce lieu -->
            <div v-if="lieu.scenes && lieu.scenes.length" class="scenes-section">
              <h5>Scènes utilisant ce lieu:</h5>
              <div v-for="scene in lieu.scenes" :key="scene.id" class="scene-item">
                <span>{{ scene.titre }} ({{ scene.descriptionUtilisation }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modale pour afficher les scènes d'un lieu -->
      <div v-if="showScenesModal" class="modal-overlay" @click="showScenesModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Scènes utilisant "{{ selectedLieu.nomLieu }}"</h3>
            <button class="modal-close" @click="showScenesModal = false">×</button>
          </div>
          
          <div class="scenes-list">
            <div v-if="selectedLieuScenes.length === 0" class="no-scenes">
              Aucune scène n'utilise ce lieu.
            </div>
            
            <div v-else>
              <div v-for="scene in selectedLieuScenes" :key="scene.id" class="scene-detail">
                <h4>{{ scene.sceneTitre }}</h4>
                <p><strong>Séquence:</strong> {{ scene.sequenceTitre }}</p>
                <p><strong>Épisode:</strong> {{ scene.episodeTitre }}</p>
                <p><strong>Projet:</strong> {{ scene.projetTitre }}</p>
                <p><strong>Utilisation:</strong> {{ scene.descriptionUtilisation }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showScenesModal = false" class="cancel-btn">Fermer</button>
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
  name: 'CreationLieu',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      showProfileMenu: false,
      formData: {
        projetId: '',
        nomLieu: '',
        typeLieu: '',
        adresse: ''
      },
      isEditing: false,
      editingId: null,
      projets: [],
      lieux: [],
      searchTerm: '',
      filterProjetId: '',
      filterTypeLieu: '',
      loading: true,
      showScenesModal: false,
      selectedLieu: {},
      selectedLieuScenes: [],
      // Nouvelles données pour la zone de liste modifiable
      projetSearch: '',
      showProjetSuggestions: false,
      filteredProjets: []
    };
  },
  computed: {
    userInitials() {
      if (!this.user?.nom) return '';
      const names = this.user.nom.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    },
    filteredLieux() {
      return this.lieux.filter(lieu => {
        const matchesSearch = lieu.nomLieu.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesProjet = !this.filterProjetId || lieu.projetId === parseInt(this.filterProjetId);
        const matchesType = !this.filterTypeLieu || lieu.typeLieu === this.filterTypeLieu;
        return matchesSearch && matchesProjet && matchesType;
      });
    }
  },
  async created() {
    axios.defaults.baseURL = API_BASE_URL;
    
    // Configuration de l'intercepteur pour ajouter l'en-tête X-User-Id
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Ajouter l'en-tête X-User-Id si l'utilisateur est connecté
        if (user && user.id) {
          config.headers['X-User-Id'] = user.id;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    await this.loadProjets();
    await this.loadLieux();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    // Mettre à jour la liste filtrée quand les projets changent
    projets: {
      handler(newVal) {
        this.filteredProjets = [...newVal];
      },
      deep: true
    }
  },
  methods: {
    async loadProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
        this.filteredProjets = [...this.projets];
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        alert('Erreur lors du chargement des projets');
      }
    },
    async loadLieux() {
      this.loading = true;
      try {
        const response = await axios.get('/api/lieux');
        this.lieux = response.data;
        
        // Charger le nombre de scènes pour chaque lieu
        for (let lieu of this.lieux) {
          try {
            const scenesResponse = await axios.get(`/api/scene-lieux/lieux/${lieu.id}`);
            lieu.sceneCount = scenesResponse.data.length;
            
            // Charger les premières scènes pour l'affichage
            if (scenesResponse.data.length > 0) {
              lieu.scenes = scenesResponse.data.slice(0, 3); // Afficher seulement 3 scènes
            }
          } catch (error) {
            console.error('Erreur lors du chargement des scènes du lieu:', error);
            lieu.sceneCount = 0;
            lieu.scenes = [];
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        alert('Erreur lors du chargement des lieux: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      try {
        // Vérifier que l'utilisateur est connecté
        if (!this.user || !this.user.id) {
          alert('Erreur: Utilisateur non connecté');
          return;
        }

        const payload = {
          ...this.formData,
          projetId: parseInt(this.formData.projetId)
        };
        
        // Configuration des en-têtes avec X-User-Id
        const config = {
          headers: {
            'X-User-Id': this.user.id
          }
        };
        
        if (this.isEditing) {
          await axios.put(`/api/lieux/${this.editingId}`, payload, config);
          alert('Lieu modifié avec succès!');
        } else {
          await axios.post('/api/lieux', payload, config);
          alert('Lieu créé avec succès!');
        }
        
        this.resetForm();
        await this.loadLieux();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du lieu:', error);
        const errorMessage = error.response?.data?.message || error.message;
        
        if (error.response?.status === 403) {
          alert('Erreur: Vous n\'avez pas les permissions nécessaires pour effectuer cette action');
        } else if (error.response?.status === 400) {
          alert('Erreur: Données invalides - ' + errorMessage);
        } else {
          alert('Erreur: ' + errorMessage);
        }
      }
    },
    editLieu(lieu) {
      this.formData = {
        projetId: lieu.projetId.toString(),
        nomLieu: lieu.nomLieu,
        typeLieu: lieu.typeLieu,
        adresse: lieu.adresse || ''
      };
      this.projetSearch = this.getProjetName(lieu.projetId);
      this.isEditing = true;
      this.editingId = lieu.id;
      
      document.querySelector('.creation-form').scrollIntoView({ behavior: 'smooth' });
    },
    async deleteLieu(lieuId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
        return;
      }
      
      try {
        // Vérifier que l'utilisateur est connecté
        if (!this.user || !this.user.id) {
          alert('Erreur: Utilisateur non connecté');
          return;
        }

        // Configuration des en-têtes avec X-User-Id
        const config = {
          headers: {
            'X-User-Id': this.user.id
          }
        };

        await axios.delete(`/api/lieux/${lieuId}`, config);
        await this.loadLieux();
        alert('Lieu supprimé avec succès!');
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        const errorMessage = error.response?.data?.message || error.message;
        
        if (error.response?.status === 403) {
          alert('Erreur: Vous n\'avez pas les permissions nécessaires pour supprimer ce lieu');
        } else {
          alert('Erreur: ' + errorMessage);
        }
      }
    },
    resetForm() {
      this.formData = {
        projetId: '',
        nomLieu: '',
        typeLieu: '',
        adresse: ''
      };
      this.projetSearch = '';
      this.isEditing = false;
      this.editingId = null;
      this.filteredProjets = [...this.projets];
    },
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async viewLieuScenes(lieu) {
      this.selectedLieu = lieu;
      try {
        const response = await axios.get(`/api/scene-lieux/lieux/${lieu.id}`);
        this.selectedLieuScenes = response.data;
        this.showScenesModal = true;
      } catch (error) {
        console.error('Erreur lors du chargement des scènes du lieu:', error);
        alert('Erreur lors du chargement des scènes');
      }
    },
    goBack() {
      this.$router.push('/scenariste');
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
    },
    async loadScenesForProject() {
      // Cette méthode peut être utilisée pour charger les scènes d'un projet spécifique
      // si nécessaire pour des fonctionnalités futures
    },
    
    // Méthodes pour la zone de liste modifiable
    filterProjets() {
      const searchTerm = this.projetSearch.toLowerCase();
      if (!searchTerm) {
        this.filteredProjets = [...this.projets];
        return;
      }
      this.filteredProjets = this.projets.filter(projet => 
        projet.titre.toLowerCase().includes(searchTerm) ||
        (projet.genreNom && projet.genreNom.toLowerCase().includes(searchTerm))
      );
    },

    selectProjet(projet) {
      this.formData.projetId = projet.id.toString();
      this.projetSearch = `${projet.titre} (${projet.genreNom})`;
      this.showProjetSuggestions = false;
    },

    hideProjetSuggestions() {
      // Petit délai pour permettre la sélection avant de cacher
      setTimeout(() => {
        this.showProjetSuggestions = false;
      }, 200);
    },

    getProjetName(id) {
      const projet = this.projets.find(p => p.id === parseInt(id));
      return projet ? `${projet.titre} (${projet.genreNom})` : '';
    }
  }
};
</script>


<style scoped>
/* Import des variables de couleurs du sidebar (adapté pour scoped) */
.creation-lieu-container {
  --primary-Scenariste: #7BBBFF;
  --primary-light-Scenariste: #A3D1FF;
  --primary-dark-Scenariste: #5AA9FF;
  --accent-Scenariste: #B8A9FF;
  --accent-light-Scenariste: #D0C7FF;
  --background-Scenariste: #F2FDFF;
  --surface-Scenariste: rgba(255, 255, 255, 0.15);
  --surface-hover-Scenariste: rgba(255, 255, 255, 0.25);
  --text-primary-Scenariste: #050F2A;
  --text-secondary-Scenariste: #1A2A4D;
  --text-muted-Scenariste: #4A5A7D;
  --border-Scenariste: rgba(255, 255, 255, 0.2);
  --border-dark-Scenariste: rgba(5, 15, 42, 0.3);
  --shadow-Scenariste: 0 8px 32px rgba(5, 15, 42, 0.1);
  --shadow-hover-Scenariste: 0 12px 40px rgba(5, 15, 42, 0.15);
  --radius-large: 50px; /* Pour boutons pill-shaped */
  --radius-sm: 25px; /* Pour inputs et cards */
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  min-height: 100vh;
  background: linear-gradient(135deg, var(--accent-light-Scenariste) 0%, var(--primary-light-Scenariste) 100%);
  color: var(--text-primary-Scenariste);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.main-content {
  max-width: 100%;
  width: 100%;
  display: flex;
  gap: 2rem; /* Séparation entre formulaire et liste */
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
}

.back-btn {
  background: var(--primary-Scenariste);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-large);
  cursor: pointer;
  transition: var(--transition);
  margin-right: 1rem;
}

.back-btn:hover {
  background: var(--primary-dark-Scenariste);
  transform: translateY(-2px);
}

.creation-form,
.lieux-list {
  flex: 1;
  background: var(--surface-Scenariste);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  box-shadow: var(--shadow-Scenariste);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-Scenariste);
}

.creation-form h3,
.lieux-list h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary-Scenariste);
  font-size: 1.2rem;
  border-bottom: 1px solid var(--border-dark-Scenariste);
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-secondary-Scenariste);
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-Scenariste);
  border-radius: var(--radius-sm);
  background: var(--surface-hover-Scenariste);
  color: var(--text-primary-Scenariste);
  transition: var(--transition);
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-Scenariste);
  box-shadow: 0 0 0 0.2rem rgba(123, 187, 255, 0.25);
}

.combobox-container {
  position: relative;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface-Scenariste);
  border: 1px solid var(--border-Scenariste);
  border-radius: var(--radius-sm);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: var(--shadow-Scenariste);
}

.suggestion-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-primary-Scenariste);
}

.suggestion-item:hover {
  background: var(--surface-hover-Scenariste);
}

.submit-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-large);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  margin-right: 0.5rem;
}

.submit-btn {
  background: var(--primary-Scenariste);
  color: white;
}

.cancel-btn {
  background: var(--border-dark-Scenariste);
  color: var(--text-primary-Scenariste);
}

.submit-btn:hover,
.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover-Scenariste);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 150px;
}

.lieux-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.lieu-card {
  background: var(--surface-Scenariste);
  border-radius: var(--radius-sm);
  padding: 1rem;
  box-shadow: var(--shadow-Scenariste);
  transition: var(--transition);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-Scenariste);
}

.lieu-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover-Scenariste);
}

.lieu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.lieu-header h4 {
  margin: 0;
  font-size: 1rem;
}

.lieu-actions span {
  cursor: pointer;
  margin-left: 0.5rem;
  transition: var(--transition);
}

.lieu-actions span:hover {
  transform: scale(1.1);
}

.lieu-info p {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: var(--text-muted-Scenariste);
}

.scenes-section {
  margin-top: 0.75rem;
  border-top: 1px solid var(--border-Scenariste);
  padding-top: 0.75rem;
}

.scene-item {
  font-size: 0.8rem;
  padding: 0.5rem;
  background: var(--surface-hover-Scenariste);
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 15, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--surface-Scenariste);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-Scenariste);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-Scenariste);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted-Scenariste);
  font-size: 1.5rem;
}

.scene-detail {
  background: var(--surface-hover-Scenariste);
  border-radius: var(--radius-sm);
  padding: 1rem;
  margin-bottom: 1rem;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-large);
  background: var(--primary-Scenariste);
  color: white;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.modal-actions button:hover {
  background: var(--primary-dark-Scenariste);
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .filters {
    flex-direction: column;
  }

  .lieux-grid {
    grid-template-columns: 1fr;
  }
}
</style>


