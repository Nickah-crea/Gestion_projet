import { defineStore } from 'pinia'
import axios from 'axios'

export const useEcranTravailStore = defineStore('ecranTravail', {
  state: () => ({
    episodes: [],
    currentEpisode: null,
    sequences: [],
    currentSequence: null,
    scenes: [], // Ajouté pour stocker toutes les scènes de la séquence
    currentScene: null, // Ajouté pour la scène actuellement sélectionnée
    currentEpisodeIndex: 0,
    currentSequenceIndex: 0,
    currentSceneIndex: 0, // Ajouté pour l'index de la scène actuelle
    projetId: null,
    projetInfos: null,
    error: null,
    isLoading: false,
    lastViewedEpisodeId: null,
    lastViewedSequenceId: null,
    lastViewedSceneId: null, // Ajouté pour mémoriser la dernière scène vue
  }),

  actions: {
    saveCurrentPosition() {
      this.lastViewedEpisodeId = this.currentEpisode ? this.currentEpisode.idEpisode : null;
      this.lastViewedSequenceId = this.currentSequence ? this.currentSequence.idSequence : null;
      this.lastViewedSceneId = this.currentScene ? this.currentScene.idScene : null; // Ajouté
    },

    async restorePosition() {
      if (this.lastViewedEpisodeId) {
        await this.selectEpisodeById(this.lastViewedEpisodeId);
      }
      if (this.lastViewedSequenceId) {
        await this.selectSequenceById(this.lastViewedSequenceId);
      }
      if (this.lastViewedSceneId) {
        await this.selectSceneById(this.lastViewedSceneId); // Ajouté
      }
    },

    async fetchProjetInfos(projetId) {
      this.isLoading = true;
      try {
        this.error = null;
        console.log(`Fetching project infos for projetId: ${projetId}`);
        
        const response = await axios.get(`/api/ecran-travail/projets/${projetId}/infos`);
        this.projetInfos = response.data;
        console.log('Project infos loaded:', this.projetInfos);
      } catch (error) {
        console.error('Error loading project infos:', error.response?.data || error.message);
        this.error = `Erreur lors du chargement des informations du projet: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEpisodes(projetId) {
      if (!projetId || projetId === 'null' || projetId === 'undefined') {
        console.error('projetId invalide:', projetId);
        this.error = 'ID du projet manquant ou invalide';
        this.isLoading = false;
        return;
      }
      
      this.isLoading = true;
      try {
        this.projetId = projetId;
        this.error = null;
        
        await this.fetchProjetInfos(projetId);
        
        console.log(`Fetching episodes for projetId: ${projetId}`);
        
        let response;
        try {
          response = await axios.get(`/api/projets/${projetId}/episodes`);
        } catch (firstError) {
          console.log('Première tentative échouée, essai avec préfixe ecran-travail');
          response = await axios.get(`/api/ecran-travail/projets/${projetId}/episodes`);
        }
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        if (response.status === 204 || !response.data || response.data.length === 0) {
          this.error = 'Aucun épisode trouvé pour ce projet.';
          this.episodes = [];
          this.currentEpisode = null;
          this.sequences = [];
          this.currentSequence = null;
          this.scenes = []; // Ajouté
          this.currentScene = null; // Ajouté
          this.currentEpisodeIndex = 0;
          return;
        }
        
        this.episodes = response.data;
        this.episodes.sort((a, b) => a.ordre - b.ordre);

        if (this.episodes.length > 0) {
          this.currentEpisodeIndex = 0;
          this.currentEpisode = this.episodes[0];
          await this.fetchSequences(this.episodes[0].idEpisode);
        }
      } catch (error) {
        console.error('Error details:', error);
        console.error('Response:', error.response);
        
        this.error = `Erreur lors du chargement des épisodes: ${error.response?.data?.message || error.message}`;
        this.currentEpisode = null;
        this.sequences = [];
        this.currentSequence = null;
        this.scenes = []; // Ajouté
        this.currentScene = null; // Ajouté
        this.currentEpisodeIndex = 0;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSequences(episodeId, setToFirst = true) {
      this.isLoading = true;
      try {
        this.error = null;
        console.log(`Fetching sequences for episodeId: ${episodeId}`);
        const response = await axios.get(`/api/ecran-travail/episodes/${episodeId}/sequences`);
        if (response.status === 204 || !response.data || response.data.length === 0) {
          console.log('Aucune séquence trouvée pour cet épisode.');
          this.sequences = [];
          this.currentSequence = null;
          this.scenes = []; // Ajouté
          this.currentScene = null; // Ajouté
          return;
        }
        this.sequences = response.data;
        this.sequences.sort((a, b) => a.ordre - b.ordre);
        if (this.sequences.length > 0 && setToFirst) {
          this.currentSequence = this.sequences[0];
          this.currentSequenceIndex = 0;
          await this.fetchSequenceDetails(this.sequences[0].idSequence);
        } else if (!setToFirst) {
          if (this.currentSequence) {
            this.currentSequenceIndex = this.sequences.findIndex(s => s.idSequence === this.currentSequence.idSequence);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des séquences:', error.response?.data || error.message);
        this.sequences = [];
        this.currentSequence = null;
        this.scenes = []; // Ajouté
        this.currentScene = null; // Ajouté
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSequenceDetails(sequenceId) {
      this.isLoading = true;
      try {
        this.error = null;
        console.log(`Fetching sequence details for sequenceId: ${sequenceId}`);
        const response = await axios.get(`/api/ecran-travail/sequences/${sequenceId}`);
        this.currentSequence = response.data;
        console.log('Sequence details:', this.currentSequence);
        
        // Extraire les scènes de la séquence
        if (this.currentSequence && this.currentSequence.scenes) {
          this.scenes = this.currentSequence.scenes;
          this.scenes.sort((a, b) => a.ordre - b.ordre);
          if (this.scenes.length > 0) {
            this.currentScene = this.scenes[0];
            this.currentSceneIndex = 0;
          } else {
            this.currentScene = null;
            this.currentSceneIndex = 0;
          }
        } else {
          this.scenes = [];
          this.currentScene = null;
          this.currentSceneIndex = 0;
        }
        
        const episode = this.episodes.find(e => e.idEpisode === this.currentSequence.episodeId);
        if (episode) {
          this.currentEpisode = episode;
          this.currentEpisodeIndex = this.episodes.findIndex(e => e.idEpisode === episode.idEpisode);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails de la séquence:', error.response?.data || error.message);
        this.error = `Erreur lors du chargement des détails de la séquence: ${error.message}`;
        this.currentSequence = null;
        this.scenes = []; // Ajouté
        this.currentScene = null; // Ajouté
      } finally {
        this.isLoading = false;
      }
    },

    async selectEpisodeById(episodeId) {
      if (this.episodes.length === 0) {
        await this.fetchEpisodes(this.projetId);
      }
      const index = this.episodes.findIndex(e => e.idEpisode === parseInt(episodeId));
      if (index !== -1) {
        this.currentEpisodeIndex = index;
        this.currentEpisode = this.episodes[index];
        this.sequences = [];
        this.currentSequence = null;
        this.scenes = []; // Ajouté
        this.currentScene = null; // Ajouté
        await this.fetchSequences(this.currentEpisode.idEpisode);
      } else {
        this.error = 'Épisode non trouvé.';
      }
    },

    async selectSequenceById(sequenceId) {
      await this.fetchSequenceDetails(sequenceId);
      if (this.currentSequence) {
        await this.fetchSequences(this.currentSequence.episodeId, false);
        this.currentSequenceIndex = this.sequences.findIndex(s => s.idSequence === parseInt(sequenceId));
      } else {
        this.error = 'Séquence non trouvée.';
      }
    },

    // NOUVELLE ACTION : Sélectionner une scène par son ID
    async selectSceneById(sceneId) {
      const index = this.scenes.findIndex(s => s.idScene === parseInt(sceneId));
      if (index !== -1) {
        this.currentSceneIndex = index;
        this.currentScene = this.scenes[index];
      } else {
        this.error = 'Scène non trouvée.';
      }
    },

    async goToNextPage() {
      this.isLoading = true;
      try {
        this.error = null;
        
        // D'abord, essayer d'aller à la scène suivante
        if (this.currentScene && this.currentSceneIndex < this.scenes.length - 1) {
          this.currentSceneIndex++;
          this.currentScene = this.scenes[this.currentSceneIndex];
          return;
        }
        
        // Si pas de scène suivante, essayer la séquence suivante
        if (this.currentSequence) {
          console.log(`Navigating to next sequence from: ${this.currentSequence.idSequence}`);
          const response = await axios.get(`/api/ecran-travail/sequences/${this.currentSequence.idSequence}/next`);
          if (response.status === 200) {
            this.currentSequence = response.data;
            console.log('Détails de la séquence fetchés :', response.data);
            
            // Mettre à jour les scènes
            if (this.currentSequence && this.currentSequence.scenes) {
              this.scenes = this.currentSequence.scenes;
              this.scenes.sort((a, b) => a.ordre - b.ordre);
              if (this.scenes.length > 0) {
                this.currentScene = this.scenes[0];
                this.currentSceneIndex = 0;
              } else {
                this.currentScene = null;
                this.currentSceneIndex = 0;
              }
            }
            
            this.currentSequenceIndex++;
            const episode = this.episodes.find(e => e.idEpisode === this.currentSequence.episodeId);
            if (episode) {
              this.currentEpisode = episode;
              this.currentEpisodeIndex = this.episodes.findIndex(e => e.idEpisode === episode.idEpisode);
              if (this.currentSequence.episodeId !== this.sequences[0]?.episodeId) {
                await this.fetchSequences(this.currentSequence.episodeId, false);
              }
            }
            return;
          } else if (response.status === 204) {
            console.log('No more sequences in episode, going to next episode');
          }
        }
        
        // Si pas de séquence suivante, essayer l'épisode suivant
        if (this.episodes.length > 0 && this.currentEpisodeIndex < this.episodes.length - 1) {
          this.currentEpisodeIndex++;
          this.currentEpisode = this.episodes[this.currentEpisodeIndex];
          this.currentSequence = null;
          this.currentSequenceIndex = 0;
          this.scenes = []; // Ajouté
          this.currentScene = null; // Ajouté
          this.currentSceneIndex = 0; // Ajouté
          console.log(`Navigating to next episode: ${this.currentEpisode.titre}`);
          await this.fetchSequences(this.currentEpisode.idEpisode);
        } else {
          this.error = 'Fin du projet.';
        }
      } catch (error) {
        console.error('Erreur lors de la navigation suivante:', error.response?.data || error.message);
        this.error = error.response?.status === 204 ? 'Fin du projet.' : `Erreur lors de la navigation: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },

    async goToPrevPage() {
      this.isLoading = true;
      try {
        this.error = null;
        
        // D'abord, essayer d'aller à la scène précédente
        if (this.currentScene && this.currentSceneIndex > 0) {
          this.currentSceneIndex--;
          this.currentScene = this.scenes[this.currentSceneIndex];
          return;
        }
        
        // Si pas de scène précédente, essayer la séquence précédente
        if (this.currentSequence) {
          console.log(`Navigating to previous sequence from: ${this.currentSequence.idSequence}`);
          const response = await axios.get(`/api/ecran-travail/sequences/${this.currentSequence.idSequence}/prev`);
          if (response.status === 200) {
            this.currentSequence = response.data;
            this.currentSequenceIndex--;
            console.log('Previous sequence:', this.currentSequence);
            
            // Mettre à jour les scènes
            if (this.currentSequence && this.currentSequence.scenes) {
              this.scenes = this.currentSequence.scenes;
              this.scenes.sort((a, b) => a.ordre - b.ordre);
              if (this.scenes.length > 0) {
                this.currentScene = this.scenes[this.scenes.length - 1];
                this.currentSceneIndex = this.scenes.length - 1;
              } else {
                this.currentScene = null;
                this.currentSceneIndex = 0;
              }
            }
            
            const episode = this.episodes.find(e => e.idEpisode === this.currentSequence.episodeId);
            if (episode) {
              this.currentEpisode = episode;
              this.currentEpisodeIndex = this.episodes.findIndex(e => e.idEpisode === episode.idEpisode);
              if (this.currentSequence.episodeId !== this.sequences[0]?.episodeId) {
                await this.fetchSequences(this.currentSequence.episodeId, false);
              }
            }
            return;
          } else if (response.status === 204) {
            console.log('No previous sequences');
          }
        }
        
        // Navigate to the previous episode if available
        if (this.currentEpisodeIndex > 0) {
          console.log('Navigating to previous episode');
          this.currentEpisodeIndex--;
          this.currentEpisode = this.episodes[this.currentEpisodeIndex];
          this.currentSequence = null;
          this.currentSequenceIndex = 0;
          this.scenes = []; // Ajouté
          this.currentScene = null; // Ajouté
          this.currentSceneIndex = 0; // Ajouté
          console.log(`Navigating to previous episode: ${this.currentEpisode.titre}`);
          await this.fetchSequences(this.currentEpisode.idEpisode);
          
          // If the previous episode has sequences, go to the last one
          if (this.sequences.length > 0) {
            this.currentSequence = this.sequences[this.sequences.length - 1];
            this.currentSequenceIndex = this.sequences.length - 1;
            await this.fetchSequenceDetails(this.currentSequence.idSequence);
            
            // Aller à la dernière scène de la séquence
            if (this.scenes.length > 0) {
              this.currentScene = this.scenes[this.scenes.length - 1];
              this.currentSceneIndex = this.scenes.length - 1;
            }
          }
          return;
        }
        
        // If no episodes or at the first episode with no sequences, reset to initial state
        this.currentEpisode = null;
        this.currentSequence = null;
        this.currentScene = null; // Ajouté
        this.currentEpisodeIndex = 0;
        this.currentSequenceIndex = 0;
        this.currentSceneIndex = 0; // Ajouté
        this.sequences = [];
        this.scenes = []; // Ajouté
        this.error = 'Début du projet.';
      } catch (error) {
        console.error('Erreur lors de la navigation précédente:', error.response?.data || error.message);
        this.error = error.response?.status === 204 ? 'Début du projet.' : `Erreur lors de la navigation: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },

    // NOUVELLE ACTION : Naviguer directement vers une scène spécifique
    async goToScene(sceneId) {
      try {
        // Si la scène fait partie des scènes actuelles
        const sceneIndex = this.scenes.findIndex(s => s.idScene === parseInt(sceneId));
        if (sceneIndex !== -1) {
          this.currentSceneIndex = sceneIndex;
          this.currentScene = this.scenes[sceneIndex];
          return;
        }
        
        // Sinon, charger les détails de la scène
        const response = await axios.get(`/api/scenes/${sceneId}`);
        if (response.status === 200) {
          const scene = response.data;
          
          // Charger la séquence parente
          await this.selectSequenceById(scene.sequenceId);
          
          // Trouver la scène dans la liste des scènes
          const newSceneIndex = this.scenes.findIndex(s => s.idScene === parseInt(sceneId));
          if (newSceneIndex !== -1) {
            this.currentSceneIndex = newSceneIndex;
            this.currentScene = this.scenes[newSceneIndex];
          }
        }
      } catch (error) {
        console.error('Erreur lors de la navigation vers la scène:', error);
        this.error = 'Scène non trouvée.';
      }
    },
  },

  getters: {
    hasNext: (state) => {
      // Vérifier s'il y a une scène suivante, une séquence suivante ou un épisode suivant
      if (state.currentScene && state.currentSceneIndex < state.scenes.length - 1) {
        return true;
      }
      if (state.episodes.length === 0) return false;
      return state.currentEpisodeIndex < state.episodes.length - 1;
    },
    
    hasPrev: (state) => {
      // Vérifier s'il y a une scène précédente, une séquence précédente ou un épisode précédent
      if (state.currentScene && state.currentSceneIndex > 0) {
        return true;
      }
      return state.currentEpisodeIndex > 0 || state.currentSequence || state.episodes.length === 0;
    },
    
    getBackUrl: (state) => {
      let url = `/projet/${state.projetId}/ecran-travail`;
      if (state.lastViewedEpisodeId) {
        url += `?episodeId=${state.lastViewedEpisodeId}`;
        if (state.lastViewedSequenceId) {
          url += `&sequenceId=${state.lastViewedSequenceId}`;
        }
        if (state.lastViewedSceneId) { // Ajouté
          url += `&sceneId=${state.lastViewedSceneId}`;
        }
      } else if (state.currentEpisode) {
        url += `?episodeId=${state.currentEpisode.idEpisode}`;
        if (state.currentSequence) {
          url += `&sequenceId=${state.currentSequence.idSequence}`;
        }
        if (state.currentScene) { // Ajouté
          url += `&sceneId=${state.currentScene.idScene}`;
        }
      }
      return url;
    },

    // Getters pour les infos du projet
    projetTitle: (state) => state.projetInfos?.titre || 'Projet sans titre',
    projetDescription: (state) => state.projetInfos?.description || '',
    projetAuteur: (state) => state.projetInfos?.auteur || '',
    projetStatus: (state) => state.projetInfos?.statutNom  || 'Non défini',
    projetSynopsis: (state) => state.projetInfos?.synopsis || '',
    statusColor: (state) => {
      const status = state.projetInfos?.statutNom ?.toLowerCase();
      switch (status) {
        case 'en cours': return '#ffc107';
        case 'terminé': return '#28a745';
        case 'en attente': return '#6c757d';
        case 'annulé': return '#dc3545';
        default: return '#6c757d';
      }
    },

    totalSequences: (state) => {
      return state.episodes.reduce((total, episode) => {
        return total + (episode.nombreSequences || 0);
      }, 0);
    },

    // NOUVEAU GETTER : Vérifier s'il y a une scène suivante dans la séquence actuelle
    hasNextScene: (state) => {
      return state.currentScene && state.currentSceneIndex < state.scenes.length - 1;
    },

    // NOUVEAU GETTER : Vérifier s'il y a une scène précédente dans la séquence actuelle
    hasPrevScene: (state) => {
      return state.currentScene && state.currentSceneIndex > 0;
    }
  },
});
