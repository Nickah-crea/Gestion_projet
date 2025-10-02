<template>
    <div class="app-wrapper">
  <div class="ecran-travail">
    <!-- Header avec titre de l'épisode -->
    <header class="header">
      <h2>Viewers</h2>
      <h1>Épisode: {{ currentEpisode?.titre || 'Chargement...' }}</h1>
      <div class="navigation">
        <button class="nav-btn" @click="goToPrevPage" :disabled="!currentSequence || isLoading">Précédent</button>
        <button class="nav-btn" @click="goToNextPage" :disabled="!currentSequence || isLoading">Suivant</button>
      </div>
    </header>

    <!-- Indicateur de chargement -->
    <div v-if="isLoading" class="loading">Chargement en cours...</div>

    <!-- Message d'erreur -->
    <div v-if="error && !isLoading" class="error-message">
      {{ error }}
      <button class="retry-btn" @click="retryFetch">Réessayer</button>
    </div>

    <!-- Contenu de la séquence -->
    <main class="sequence-page" v-if="currentSequence && !isLoading">
      <h2>Séquence {{ currentSequence.ordre }}: {{ currentSequence.titre }}
        <span class="comment-icon" @click="toggleSequenceCommentSection">
          💬 {{ sequenceCommentCount }}
        </span>
      </h2>
      
      <!-- Section commentaires séquence -->
      <div v-if="showSequenceCommentSection" class="comment-section">
        <h4>Commentaires sur la séquence</h4>
        
        <!-- Formulaire d'ajout de commentaire -->
        <div class="add-comment">
          <textarea v-model="newSequenceComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
          <button @click="addSequenceComment" class="add-comment-btn">Ajouter</button>
        </div>
        
        <!-- Liste des commentaires -->
        <div class="comments-list">
          <div v-for="comment in sequenceComments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-author">{{ comment.utilisateurNom }}</span>
              <span class="comment-date">{{ formatDate(comment.creeLe) }}</span>
            </div>
            <div class="comment-content">
              {{ comment.contenu }}
            </div>
            <div class="comment-actions" v-if="comment.utilisateurId === user.id">
              <button @click="deleteSequenceComment(comment.id)" class="delete-comment-btn">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <p><strong>Synopsis:</strong> {{ currentSequence.synopsis || 'Aucun synopsis' }}</p>
      <p><strong>Statut:</strong> {{ currentSequence.statutNom || 'Non défini' }}</p>

      <!-- Liste des scènes -->
      <div class="scenes-list">
        <div v-for="scene in currentSequence.scenes" :key="scene.idScene" class="scene-card">
          <h3>Scène {{ scene.ordre }}: {{ scene.titre }}
            <span class="comment-icon" @click="toggleSceneCommentSection(scene)">
              💬 {{ getSceneCommentCount(scene.idScene) }}
            </span>
          </h3>
          
          <!-- Section commentaires scène -->
          <div v-if="showSceneCommentModal && selectedScene?.idScene === scene.idScene" class="comment-section">
            <h4>Commentaires sur la scène</h4>
            
            <!-- Formulaire d'ajout de commentaire -->
            <div class="add-comment">
              <textarea v-model="newSceneComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
              <button @click="addSceneComment" class="add-comment-btn">Ajouter</button>
            </div>
            
            <!-- Liste des commentaires -->
            <div class="comments-list">
              <div v-for="comment in sceneComments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.utilisateurNom }}</span>
                  <span class="comment-date">{{ formatDate(comment.creeLe) }}</span>
                </div>
                <div class="comment-content">
                  {{ comment.contenu }}
                </div>
                <div class="comment-actions" v-if="comment.utilisateurId === user.id">
                  <button @click="deleteSceneComment(comment.id)" class="delete-comment-btn">Supprimer</button>
                </div>
              </div>
            </div>
            
            <button @click="closeSceneCommentModal" class="close-comments-btn">Fermer</button>
          </div>

          <p><strong>Synopsis:</strong> {{ scene.synopsis || 'Aucun synopsis' }}</p>
          <p><strong>Statut:</strong> {{ scene.statutNom || 'Non défini' }}</p>

          <!-- Lieux et Plateaux -->
          <div class="lieux-plateaux" v-if="scene.sceneLieus?.length">
            <h4>Lieux et Plateaux:</h4>
            <ul>
              <li v-for="sceneLieu in scene.sceneLieus" :key="sceneLieu.id">
                <strong>Lieu:</strong> {{ sceneLieu.lieuNom }} (Type: {{ sceneLieu.lieu?.typeLieu || 'Non spécifié' }})
                <span v-if="sceneLieu.plateauNom"> - <strong>Plateau:</strong> {{ sceneLieu.plateauNom }}</span>
                <p v-if="sceneLieu.descriptionUtilisation">Description: {{ sceneLieu.descriptionUtilisation }}</p>
              </li>
            </ul>
          </div>
          <p v-else>Aucun lieu ou plateau associé.</p>

          <!-- Dialogues -->
          <div class="dialogues" v-if="scene.dialogues?.length">
            <h4>Dialogues:</h4>
            <ul>
              <li v-for="dialogue in scene.dialogues" :key="dialogue.id">
                <strong>{{ dialogue.personnageNom || 'Narrateur' }}:</strong> {{ dialogue.texte }} <br><br>
                <span v-if="dialogue.observation">{{ dialogue.observation }}</span>
              </li>
            </ul>
          </div>
          <p v-else>Aucun dialogue associé.</p>
        </div>
      </div>
    </main>
    <div v-else-if="!isLoading" class="no-data">
      <p>Aucune séquence disponible pour cet épisode.</p>
    </div>
  </div>
  </div>
</template>

<script setup>
import { useEcranTravailStore } from '../stores/ecranTravailStore';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import axios from 'axios';
import '../assets/css/ecran_travail.css';

const route = useRoute();
const store = useEcranTravailStore();

// Données pour les commentaires
const user = ref(JSON.parse(localStorage.getItem('user')) || null);
const showSequenceCommentSection = ref(false);
const newSequenceComment = ref('');
const sequenceComments = ref([]);
const sequenceCommentCount = ref(0);

const showSceneCommentModal = ref(false);
const selectedScene = ref(null);
const newSceneComment = ref('');
const sceneComments = ref([]);
const sceneCommentCounts = ref({});

onMounted(async () => {
  const projetId = route.params.idProjet || '1';
  await store.fetchEpisodes(projetId);
});

// Méthodes pour les commentaires de séquence
const toggleSequenceCommentSection = async () => {
  showSequenceCommentSection.value = !showSequenceCommentSection.value;
  if (showSequenceCommentSection.value) {
    await loadSequenceComments();
    await loadSequenceCommentCount();
  }
};

const loadSequenceComments = async () => {
  try {
    const response = await axios.get(`/api/sequence-commentaires/sequence/${store.currentSequence.idSequence}`);
    sequenceComments.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires de séquence:', error);
  }
};

const loadSequenceCommentCount = async () => {
  try {
    const response = await axios.get(`/api/sequence-commentaires/sequence/${store.currentSequence.idSequence}/count`);
    sequenceCommentCount.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement du nombre de commentaires:', error);
  }
};

const addSequenceComment = async () => {
  if (!newSequenceComment.value.trim()) return;
  
  try {
    await axios.post('/api/sequence-commentaires', {
      contenu: newSequenceComment.value,
      sequenceId: store.currentSequence.idSequence
    }, {
      headers: {
        'X-User-Id': user.value.id
      }
    });
    
    newSequenceComment.value = '';
    await loadSequenceComments();
    await loadSequenceCommentCount();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    alert('Erreur lors de l\'ajout du commentaire');
  }
};

const deleteSequenceComment = async (commentId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    try {
      await axios.delete(`/api/sequence-commentaires/${commentId}`);
      await loadSequenceComments();
      await loadSequenceCommentCount();
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  }
};

// Méthodes pour les commentaires de scène
const toggleSceneCommentSection = async (scene) => {
  selectedScene.value = scene;
  showSceneCommentModal.value = true;
  await loadSceneComments(scene.idScene);
};

const closeSceneCommentModal = () => {
  showSceneCommentModal.value = false;
  selectedScene.value = null;
  sceneComments.value = [];
};

const loadSceneComments = async (sceneId) => {
  try {
    const response = await axios.get(`/api/scene-commentaires/scene/${sceneId}`);
    sceneComments.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires de scène:', error);
  }
};

const getSceneCommentCount = (sceneId) => {
  return sceneCommentCounts.value[sceneId] || 0;
};

const loadSceneCommentCounts = async () => {
  if (!store.currentSequence?.scenes) return;
  
  for (const scene of store.currentSequence.scenes) {
    try {
      const response = await axios.get(`/api/scene-commentaires/scene/${scene.idScene}/count`);
      sceneCommentCounts.value[scene.idScene] = response.data;
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de commentaires pour la scène:', error);
      sceneCommentCounts.value[scene.idScene] = 0;
    }
  }
};

const addSceneComment = async () => {
  if (!newSceneComment.value.trim() || !selectedScene.value) return;
  
  try {
    await axios.post('/api/scene-commentaires', {
      contenu: newSceneComment.value,
      sceneId: selectedScene.value.idScene
    }, {
      headers: {
        'X-User-Id': user.value.id
      }
    });
    
    newSceneComment.value = '';
    await loadSceneComments(selectedScene.value.idScene);
    await loadSceneCommentCounts();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    alert('Erreur lors de l\'ajout du commentaire');
  }
};

const deleteSceneComment = async (commentId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    try {
      await axios.delete(`/api/scene-commentaires/${commentId}`);
      await loadSceneComments(selectedScene.value.idScene);
      await loadSceneCommentCounts();
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  }
};

// Méthode utilitaire pour formater les dates
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const goToNextPage = () => store.goToNextPage();
const goToPrevPage = () => store.goToPrevPage();
const retryFetch = () => store.fetchEpisodes(store.projetId || '1');

const currentEpisode = computed(() => store.currentEpisode);
const currentSequence = computed(() => store.currentSequence);
const error = computed(() => store.error);
const isLoading = computed(() => store.isLoading);

// Charger les compteurs de commentaires quand la séquence change
watch(() => store.currentSequence, async (newSequence) => {
  if (newSequence) {
    await loadSequenceCommentCount();
    await loadSceneCommentCounts();
  }
});
</script>

<style>
/* ecran_travail.css - Style inspiré de l'image: glassmorphism, minimaliste, avec éléments naturels et gradients */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Police Inter pour modernité (comme dans l'image) */
@font-face {
  font-family: 'Inter';
  src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
}

/* Variables - Palette beige doux, orange gradient, vert accents comme cactus */
:root {
  --primary: #FF9500; /* Orange vibrant comme bulle */
  --primary-light: #FFB74D;
  --primary-rgb: 255, 149, 0;
  
  --accent: #4CAF50; /* Vert pour accents naturels */
  --accent-rgb: 76, 175, 80;
  
  --surface: rgba(255, 255, 255, 0.8); /* Glassmorphism */
  --surface-dark: rgba(31, 41, 55, 0.8); /* Pour cartes sombres */
  
  --background: #FAF7F5; /* Beige clair fond */
  --background-rgb: 250, 247, 245;
  
  --text-primary: #1F2937; /* Gris foncé texte */
  --text-secondary: #6B7280; /* Gris moyen */
  --text-muted: #9CA3AF; /* Gris clair */
  
  --border: rgba(255, 255, 255, 0.5);
  --shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.1);
  --radius: 24px; /* Arrondis forts comme cartes dans image */
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --blur: blur(12px); /* Effet glass */
  
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;
}

/* Reset et base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

body {
  background: var(--background);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Wrapper avec fond et animation subtile */
.app-wrapper {
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, var(--background) 0%, rgba(250, 247, 245, 0.8) 100%);
}

/* Animation de fond avec bulles flottantes comme dans l'image */
.app-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.1) 0%, transparent 50%);
  animation: gradientShift 20s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* Écran travail avec glass container */
.ecran-travail {
  background: var(--surface);
  backdrop-filter: var(--blur);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  padding: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header minimaliste */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.header h2 {
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.navigation {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.nav-btn:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading avec animation pulse */
.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Message d'erreur avec shake */
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(var(--danger-rgb), 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 1.5rem;
  border-radius: var(--radius);
  margin-bottom: 2rem;
  animation: shake 0.5s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.retry-btn {
  background: var(--danger);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
}

.retry-btn:hover {
  background: #DC2626;
  transform: scale(1.05);
}

/* Page de séquence avec glass card */
.sequence-page {
  background: var(--surface);
  backdrop-filter: var(--blur);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sequence-page h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-icon {
  cursor: pointer;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  transition: var(--transition);
}

.comment-icon:hover {
  background: rgba(var(--accent-rgb), 0.2);
  transform: scale(1.1);
}

/* Section commentaires avec scroll doux */
.comment-section {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius);
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
}

.comment-section h4 {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.add-comment {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.add-comment textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  transition: var(--transition);
}

.add-comment textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.add-comment-btn {
  background: linear-gradient(135deg, var(--accent) 0%, #22C55E 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  align-self: flex-end;
}

.add-comment-btn:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-sm);
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-light) transparent;
}

.comment-item {
  background: var(--surface-dark);
  border-radius: var(--radius);
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  color: white;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 500;
}

.comment-date {
  color: rgba(255, 255, 255, 0.7);
}

.comment-content {
  font-size: 0.875rem;
  line-height: 1.4;
}

.comment-actions {
  text-align: right;
  margin-top: 0.5rem;
}

.delete-comment-btn {
  background: var(--danger);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.75rem;
  transition: var(--transition);
}

.delete-comment-btn:hover {
  background: #DC2626;
  transform: scale(1.05);
}

/* Cartes de scène avec hover lift */
.scene-card {
  background: var(--surface);
  backdrop-filter: var(--blur);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.scene-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.scene-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Dialogues list avec indent */
.dialogues-list {
  margin-top: 1rem;
}

.dialogue-item {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius);
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Modal content glass */
.modal-content {
  background: var(--surface);
  backdrop-filter: var(--blur);
  border-radius: var(--radius);
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  box-shadow: var(--shadow-md);
  animation: fadeInUp 0.5s ease-out;
}

.modal-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

/* Responsive adaptations */
@media (max-width: 768px) {
  .ecran-travail {
    padding: 1.5rem;
  }

  .header h1 {
    font-size: 1.75rem;
  }

  .navigation {
    flex-direction: column;
    gap: 0.75rem;
  }

  .nav-btn {
    width: 100%;
  }

  .sequence-page {
    padding: 1rem;
  }

  .scene-card {
    padding: 1rem;
  }

  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.5rem;
  }

  .sequence-page h2 {
    font-size: 1.25rem;
  }

  .scene-card h3 {
    font-size: 1.1rem;
  }
}

/* Navigation de séquence avec pills comme boutons dans image */
.sequence-navigation {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.sequence-number {
  background: var(--surface-dark);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px; /* Pill shape */
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
}

.sequence-number:hover {
  background: var(--primary);
  transform: scale(1.1);
}

.sequence-number.active {
  background: var(--primary);
  box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.3);
}

.separator {
  color: var(--text-muted);
  align-self: center;
}

.new-sequence {
  position: relative;
}
</style>