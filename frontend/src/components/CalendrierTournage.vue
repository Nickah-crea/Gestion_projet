<template>
  <div class="app-wrapper-global">
  <div class="calendrier-tournage">
    <div class="calendrier-header">
      <h2>📅 Calendrier de Tournage</h2>
      <div class="filters">
        <select v-model="filtreProjet" @change="chargerTournages">
          <option value="">Tous les projets</option>
          <option v-for="projet in projets" :key="projet.id" :value="projet.id">
            {{ projet.titre }}
          </option>
        </select>
        <select v-model="filtreStatut" @change="chargerTournages">
          <option value="">Tous les statuts</option>
          <option value="planifie">Planifié</option>
          <option value="confirme">Confirmé</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="reporte">Reporté</option>
        </select>
        <input type="date" v-model="filtreDate" @change="chargerTournages">
        <button @click="reinitialiserFiltres" class="btn btn-secondary">
          <i class="fas fa-times"></i> Réinitialiser
        </button>
      </div>
    </div>

    <div class="calendrier-view">
      <div class="calendar-grid">
        <div class="calendar-header">
          <div class="calendar-nav">
            <button @click="moisPrecedent">←</button>
            <h3>{{ moisCourant }}</h3>
            <button @click="moisSuivant">→</button>
          </div>
          <div class="week-days">
            <div v-for="day in joursSemaine" :key="day" class="week-day">{{ day }}</div>
          </div>
        </div>

        <!-- Section Alertes Raccords Critiques -->
        <div class="alertes-section" v-if="showAlertesRaccords && alertesRaccordsCritiques.length > 0">
          <div class="alertes-header">
            <h3>
              <i class="fas fa-exclamation-triangle"></i>
              Alertes Raccords Critiques
              <span class="badge badge-danger">{{ alertesRaccordsCritiques.length }}</span>
            </h3>
            <button @click="showAlertesRaccords = !showAlertesRaccords" class="btn-toggle">
              {{ showAlertesRaccords ? 'Masquer' : 'Afficher' }}
            </button>
          </div>
          <div class="alertes-list">
            <div v-for="alerte in alertesRaccordsCritiques" 
                :key="alerte.raccordId" 
                class="alerte-item critique"
                @click="ouvrirDetailsAlerte(alerte)">
              <div class="alerte-icon">🚨</div>
              <div class="alerte-content">
                <div class="alerte-title">{{ alerte.getTitreAlerte() }}</div>
                <div class="alerte-date">{{ formatDateDetails(alerte.getDateAlerte()) }}</div>
                <div class="alerte-scenes">{{ alerte.sceneSourceTitre }} → {{ alerte.sceneCibleTitre }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="calendar-days">
                <div v-for="day in joursCalendrier" :key="day.date" 
          :class="['calendar-day', { 
            'other-month': !day.isCurrentMonth, 
            'has-tournages': day.tournages.length > 0,
            'has-alertes-critiques': getAlertesPourDate(day.date).length > 0
          }]"
          @click="ouvrirModalPlanning(day.date)">
        
        <div class="day-header">
          {{ day.day }}
          <span v-if="getAlertesPourDate(day.date).length > 0" 
                class="alerte-indicator"
                title="Raccord(s) critique(s)"
                @click.stop="ouvrirDetailsAlerte(getAlertesPourDate(day.date)[0])">
            🚨
          </span>
        </div>
            <div class="tournages-list">
              <div v-for="tournage in day.tournages" :key="tournage.id"
                   :class="`tournage-item statut-${tournage.statutTournage}`">
                <div class="tournage-header">
                  <div class="tournage-time">{{ formatHeure(tournage.heureDebut) }} - {{ formatHeure(tournage.heureFin) }}</div>
                  <div class="tournage-actions-small">
                    <button @click.stop="ouvrirDetailsTournage(tournage)" class="btn-details-small" title="Voir les détails">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button @click.stop="ouvrirModificationTournage(tournage)" class="btn-edit-small" title="Modifier">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click.stop="supprimerTournageDirect(tournage)" class="btn-delete-small" title="Supprimer">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="tournage-title">{{ tournage.sceneTitre }}</div>
              </div>
            </div>

            <!-- Alertes raccords critiques -->
              <div v-if="getAlertesPourDate(day.date).length > 0" 
                  class="alertes-list-day">
                <div v-for="alerte in getAlertesPourDate(day.date)" 
                    :key="alerte.raccordId"
                    class="alerte-item-day critique"
                    @click.stop="ouvrirDetailsAlerte(alerte)"
                    :title="alerte.getDescriptionComplete()">
                  🚨 Raccord Critique
                </div>
              </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création/modification de planning -->
    <div v-if="showPlanningModal" class="modal-overlay" @click="fermerModalPlanning">
      <div class="modal-content planning-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-calendar-plus"></i>
            {{ isModificationPlanning ? 'Modifier le planning' : 'Créer un planning' }} - {{ selectedDateFormatted }}
          </h3>
          <button @click="fermerModalPlanning" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="soumettrePlanning" class="planning-form">
          <div class="form-row">
            <div class="form-group">
              <label for="projetId">Projet *</label>
              <select 
                id="projetId"
                v-model="formPlanning.projetId" 
                @change="chargerEpisodesParProjet"
                required
                class="form-select"
              >
                <option value="">Sélectionner un projet</option>
                <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                  {{ projet.titre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="episodeId">Épisode *</label>
              <select 
                id="episodeId"
                v-model="formPlanning.episodeId" 
                @change="chargerSequencesParEpisode"
                :disabled="!formPlanning.projetId"
                required
                class="form-select"
              >
                <option value="">Sélectionner un épisode</option>
                <option v-for="episode in episodesParProjet" :key="episode.idEpisode" :value="episode.idEpisode">
                  Épisode {{ episode.ordre }}: {{ episode.titre }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="sequenceId">Séquence *</label>
              <select 
                id="sequenceId"
                v-model="formPlanning.sequenceId" 
                @change="chargerScenesParSequence"
                :disabled="!formPlanning.episodeId"
                required
                class="form-select"
              >
                <option value="">Sélectionner une séquence</option>
                <option v-for="sequence in sequencesParEpisode" :key="sequence.idSequence" :value="sequence.idSequence">
                  Séquence {{ sequence.ordre }}: {{ sequence.titre }}
                </option>
              </select>
            </div>
            
              <div class="form-group">
                <label for="sceneId">Scène *</label>
                <select 
                  id="sceneId"
                  v-model="formPlanning.sceneId" 
                  :disabled="!formPlanning.sequenceId"
                  required
                  class="form-select"
                >
                  <option value="">Sélectionner une scène</option>
                  <option v-for="scene in scenesParSequence" :key="scene.idScene" :value="scene.idScene">
                    Scène {{ scene.ordre }}: {{ scene.titre }}
                    <span v-if="scene.statutActuel">({{ scene.statutActuel }})</span>
                  </option>
                </select>
                <small v-if="!isModificationPlanning" class="text-info">
                  <template v-if="!formPlanning.sequenceId">
                    <i class="fas fa-info-circle"></i>
                    Veuillez sélectionner une séquence pour voir les scènes disponibles
                  </template>
                  <template v-else-if="scenesParSequence.length === 0">
                    <i class="fas fa-info-circle"></i>
                    Toutes les scènes de cette séquence sont déjà planifiées.
                  </template>
                </small>
              </div>
          </div>


          <div class="form-row">
            <div class="form-group">
              <label for="lieuId">Lieu</label>
              <select 
                id="lieuId"
                v-model="formPlanning.lieuId" 
                @change="chargerPlateauxParLieu"
                class="form-select"
                :disabled="hasSceneLieu && !isModificationPlanning"
              >
                <option value="">Sélectionner un lieu</option>
                <option 
                  v-for="lieu in lieuxDisponibles" 
                  :key="lieu.id" 
                  :value="lieu.id"
                >
                  {{ lieu.nomLieu }} ({{ lieu.typeLieu }})
                </option>
              </select>
              <small v-if="hasSceneLieu && !isModificationPlanning" class="field-info">
                <i class="fas fa-info-circle"></i>
                Lieu pré-défini pour cette scène
              </small>
            </div>
            
            <div class="form-group">
              <label for="plateauId">Plateau</label>
              <select 
                id="plateauId"
                v-model="formPlanning.plateauId" 
                :disabled="(!formPlanning.lieuId) || (hasSceneLieu && !isModificationPlanning)"
                class="form-select"
              >
                <option value="">Sélectionner un plateau</option>
                <option 
                  v-for="plateau in plateauxParLieu" 
                  :key="plateau.id" 
                  :value="plateau.id"
                >
                  {{ plateau.nom }} ({{ plateau.typePlateau }})
                </option>
              </select>
              <small v-if="hasSceneLieu && !isModificationPlanning" class="field-info">
                <i class="fas fa-info-circle"></i>
                Plateau pré-défini pour cette scène
              </small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="heureDebut">Heure de début *</label>
              <input 
                type="time" 
                id="heureDebut"
                v-model="formPlanning.heureDebut" 
                required
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="heureFin">Heure de fin *</label>
              <input 
                type="time" 
                id="heureFin"
                v-model="formPlanning.heureFin" 
                required
                class="form-input"
              >
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="statutTournage">Statut *</label>
              <select 
                id="statutTournage"
                v-model="formPlanning.statutTournage" 
                required
                class="form-select"
              >
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="reporte">Reporté</option>
              </select>
            </div>
          </div>
          <div class="form-group full-width">
            <label for="notes">Notes</label>
            <textarea 
              id="notes"
              v-model="formPlanning.notes" 
              rows="3" 
              placeholder="Notes additionnelles pour le tournage..."
              class="form-textarea"
            ></textarea>
          </div>
          <div v-if="erreurPlanning" class="error-message" :class="{ 'conflict-warning': erreurPlanning.includes('Conflits') }">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="error-content">
                <span v-if="erreurPlanning.includes('Conflits')" class="conflict-title">Conflits détectés :</span>
                <pre class="error-text">{{ erreurPlanning }}</pre>
            </div>
        </div>
          <div class="modal-actions">
            <button 
              type="button" 
              @click="fermerModalPlanning" 
              class="btn btn-secondary"
            >
              <i class="fas fa-times"></i> Annuler
            </button>
            <!-- <button 
              v-if="isModificationPlanning"
              type="button" 
              @click="supprimerPlanning"
              class="btn btn-danger"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button> -->
            <button 
              type="submit" 
              :disabled="chargementPlanning"
              class="btn btn-primary"
            >
              <i class="fas fa-save"></i>
              {{ chargementPlanning ? 'Enregistrement...' : (isModificationPlanning ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de détails -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="showDetailsModal = false">
      <div class="modal-content details-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-info-circle"></i>
            Détails du tournage
          </h3>
          <button @click="showDetailsModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div v-if="selectedTournageDetails" class="details-content">
          <div class="detail-section">
            <h4>Informations de la scène</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Projet:</strong>
                <span>{{ selectedTournageDetails.projetTitre }}</span>
              </div>
              <div class="detail-item">
                <strong>Épisode:</strong>
                <span>{{ selectedTournageDetails.episodeTitre }}</span>
              </div>
              <div class="detail-item">
                <strong>Séquence:</strong>
                <span>{{ selectedTournageDetails.sequenceTitre }}</span>
              </div>
              <div class="detail-item">
                <strong>Scène:</strong>
                <span>{{ selectedTournageDetails.sceneTitre }}</span>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h4>Planning</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Date:</strong>
                <span>{{ formatDateDetails(selectedTournageDetails.dateTournage) }}</span>
              </div>
              <div class="detail-item">
                <strong>Heure:</strong>
                <span>{{ formatHeure(selectedTournageDetails.heureDebut) }} - {{ formatHeure(selectedTournageDetails.heureFin) }}</span>
              </div>
              <div class="detail-item">
                <strong>Statut:</strong>
                <span :class="`statut-badge statut-${selectedTournageDetails.statutTournage}`">
                  {{ getStatutLibelle(selectedTournageDetails.statutTournage) }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="selectedTournageDetails.lieuNom || selectedTournageDetails.plateauNom" class="detail-section">
            <h4>Lieu de tournage</h4>
            <div class="detail-grid">
              <div v-if="selectedTournageDetails.lieuNom" class="detail-item">
                <strong>Lieu:</strong>
                <span>{{ selectedTournageDetails.lieuNom }}</span>
              </div>
              <div v-if="selectedTournageDetails.plateauNom" class="detail-item">
                <strong>Plateau:</strong>
                <span>{{ selectedTournageDetails.plateauNom }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedTournageDetails.notes" class="detail-section">
            <h4>Notes</h4>
            <div class="notes-content">
              {{ selectedTournageDetails.notes }}
            </div>
          </div>
        </div>
        <div class="modal-actions">
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CalendrierTournage',
  data() {
    return {
      tournages: [],
      projets: [],
      filtreProjet: '',
      filtreStatut: '',
      filtreDate: '',
      dateCourante: new Date(),
      showDetailsModal: false,
      selectedTournageDetails: null,
      joursSemaine: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      showPlanningModal: false,
      isModificationPlanning: false,
      chargementPlanning: false,
      erreurPlanning: '',
      selectedDate: null,
      episodesParProjet: [],
      sequencesParEpisode: [],
      scenesParSequence: [],
      lieuxDisponibles: [],
      plateauxParLieu: [],
      conflitTimeout: null,
       selectedSceneId: null,
       alertesRaccordsCritiques: [],
      showAlertesRaccords: true,
      formPlanning: {
        id: null,
        projetId: '',
        episodeId: '',
        sequenceId: '',
        sceneId: '',
        dateTournage: '',
        heureDebut: '09:00',
        heureFin: '12:00',
        lieuId: null,
        plateauId: null,
        statutTournage: 'planifie',
        notes: '',
        sceneLieus: [],
        hasSceneLieu: false,
        sceneLieuData: {
          lieuId: null,
          plateauId: null
        }
      }
    };
  },

  watch: {
    'formPlanning.sceneId': {
      handler(newSceneId) {
        if (newSceneId && !this.isModificationPlanning) {
          // Charger les lieux associés à cette scène
          this.chargerSceneLieus(newSceneId);
        }
      },
      immediate: false
    }
  },
  
  computed: {
    moisCourant() {
      return this.dateCourante.toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      });
    },
    selectedDateFormatted() {
      if (!this.selectedDate) return '';
      return new Date(this.selectedDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    joursCalendrier() {
      const year = this.dateCourante.getFullYear();
      const month = this.dateCourante.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (7 - lastDay.getDay()));
      const days = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = this.formatDateForAPI(currentDate);
        const tournagesDuJour = this.tournages.filter(t => t.dateTournage === dateStr);
        days.push({
          date: dateStr,
          day: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === month,
          tournages: tournagesDuJour
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return days;
    }
  },
  methods: {
    async chargerTournages() {
      try {
        let url = '/api/scene-tournage/periode';
        const params = new URLSearchParams();
        const startDate = new Date(this.dateCourante.getFullYear(), this.dateCourante.getMonth(), 1);
        const endDate = new Date(this.dateCourante.getFullYear(), this.dateCourante.getMonth() + 1, 0);
        
        params.append('startDate', this.formatDateForAPI(startDate));
        params.append('endDate', this.formatDateForAPI(endDate));
        
        if (this.filtreProjet) params.append('projetId', this.filtreProjet);
        if (this.selectedSceneId) params.append('sceneId', this.selectedSceneId); // Nouveau filtre

        const response = await axios.get(`${url}?${params}`);
        
        // Filtrer côté client pour les autres filtres
        let tournagesFiltres = response.data;
        
        if (this.filtreStatut) {
          tournagesFiltres = tournagesFiltres.filter(t => t.statutTournage === this.filtreStatut);
        }
        
        if (this.filtreDate) {
          tournagesFiltres = tournagesFiltres.filter(t => t.dateTournage === this.filtreDate);
        }
        
        this.tournages = tournagesFiltres;
      } catch (error) {
        console.error('Erreur chargement tournages:', error);
        alert('Erreur lors du chargement du calendrier: ' + error.message);
      }
    },

    formatDateForAPI(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    formatHeure(heureString) {
      if (!heureString) return '';
      if (heureString.length === 5 && heureString.includes(':')) return heureString;
      if (heureString.length >= 8) return heureString.substring(0, 5);
      return heureString;
    },
    formatDateDetails(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    getStatutLibelle(statut) {
      const statuts = {
        planifie: 'Planifié',
        confirme: 'Confirmé',
        en_cours: 'En cours',
        termine: 'Terminé',
        reporte: 'Reporté'
      };
      return statuts[statut] || statut;
    },
    async chargerProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
      } catch (error) {
        console.error('Erreur chargement projets:', error);
      }
    },

     async chargerSceneLieus(sceneId) {
      try {
        const response = await axios.get(`/api/scene-tournage/scene-lieux/scene/${sceneId}`);
        this.sceneLieus = response.data;
        
        // Vérifier si la scène a des lieux associés
        if (this.sceneLieus.length > 0) {
          this.hasSceneLieu = true;
          // Prendre le premier lieu associé
          const premierLieu = this.sceneLieus[0];
          this.sceneLieuData = {
            lieuId: premierLieu.lieuId,
            plateauId: premierLieu.plateauId
          };
          
          // Pré-remplir les champs du formulaire
          this.formPlanning.lieuId = premierLieu.lieuId;
          this.formPlanning.plateauId = premierLieu.plateauId;
          
          // Charger les plateaux pour ce lieu
          if (premierLieu.lieuId) {
            await this.chargerPlateauxParLieu();
          }
        } else {
          this.hasSceneLieu = false;
          this.sceneLieuData = {
            lieuId: null,
            plateauId: null
          };
        }
      } catch (error) {
        console.error('Erreur chargement lieux scène:', error);
        this.sceneLieus = [];
        this.hasSceneLieu = false;
      }
    },
    moisPrecedent() {
      this.dateCourante = new Date(this.dateCourante.getFullYear(), this.dateCourante.getMonth() - 1, 1);
      this.chargerTournages();
    },
    moisSuivant() {
      this.dateCourante = new Date(this.dateCourante.getFullYear(), this.dateCourante.getMonth() + 1, 1);
      this.chargerTournages();
    },
    ouvrirDetailsTournage(tournage) {
      this.selectedTournageDetails = tournage;
      this.showDetailsModal = true;
    },
    ouvrirModificationTournage(tournage) {
      this.isModificationPlanning = true;
      this.selectedDate = tournage.dateTournage;
      this.erreurPlanning = '';
      this.formPlanning = {
        id: tournage.id,
        projetId: tournage.projetId || '',
        episodeId: tournage.episodeId || '',
        sequenceId: tournage.sequenceId || '',
        sceneId: tournage.sceneId || '',
        dateTournage: tournage.dateTournage,
        heureDebut: this.formatHeure(tournage.heureDebut),
        heureFin: this.formatHeure(tournage.heureFin),
        lieuId: tournage.lieuId || null,
        plateauId: tournage.plateauId || null,
        statutTournage: tournage.statutTournage,
        notes: tournage.notes || ''
      };
      Promise.all([
        this.chargerProjets(),
        this.chargerLieuxDisponibles(),
        this.chargerEpisodesParProjet(),
        this.chargerSequencesParEpisode(),
        this.chargerScenesParSequence(),
        this.chargerPlateauxParLieu()
      ]).then(() => {
        this.showPlanningModal = true;
      });
    },
    async ouvrirModalPlanning(date) {
      this.selectedDate = date;
      this.isModificationPlanning = false;
      this.erreurPlanning = '';
      this.hasSceneLieu = false;
      this.sceneLieus = []; 
      this.formPlanning = {
        id: null,
        projetId: '',
        episodeId: '',
        sequenceId: '',
        sceneId: '',
        dateTournage: date,
        heureDebut: '09:00',
        heureFin: '12:00',
        lieuId: null,
        plateauId: null,
        statutTournage: 'planifie',
        notes: ''
      };
      await Promise.all([
        this.chargerProjets(),
        this.chargerLieuxDisponibles()
      ]);
      this.showPlanningModal = true;
    },
    fermerModalPlanning() {
      this.showPlanningModal = false;
      this.selectedDate = null;
      this.erreurPlanning = '';
      this.episodesParProjet = [];
      this.sequencesParEpisode = [];
      this.scenesParSequence = [];
      this.plateauxParLieu = [];
      this.hasSceneLieu = false;
      this.sceneLieus = []; 
    },
    async chargerEpisodesParProjet() {
      if (!this.formPlanning.projetId) {
        this.episodesParProjet = [];
        return;
      }
      try {
        const response = await axios.get(`/api/episodes/projet/${this.formPlanning.projetId}`);
        this.episodesParProjet = response.data;
        this.formPlanning.episodeId = '';
        this.formPlanning.sequenceId = '';
        this.formPlanning.sceneId = '';
      } catch (error) {
        console.error('Erreur chargement épisodes:', error);
        this.episodesParProjet = [];
      }
    },
    async chargerSequencesParEpisode() {
      if (!this.formPlanning.episodeId) {
        this.sequencesParEpisode = [];
        return;
      }
      try {
        const response = await axios.get(`/api/sequences/episodes/${this.formPlanning.episodeId}`);
        this.sequencesParEpisode = response.data;
        this.formPlanning.sequenceId = '';
        this.formPlanning.sceneId = '';
      } catch (error) {
        console.error('Erreur chargement séquences:', error);
        this.sequencesParEpisode = [];
      }
    },

    async chargerScenesParSequence() {
      if (!this.formPlanning.sequenceId) {
        this.scenesParSequence = [];
        return;
      }
      
      try {
        const response = await axios.get(`/api/scenes/sequences/${this.formPlanning.sequenceId}`);
        let scenes = response.data;
        
        // Si c'est une création, vérifier chaque scène individuellement
        if (!this.isModificationPlanning) {
          const scenesAvecStatut = await Promise.all(
            scenes.map(async (scene) => {
              try {
                // Vérifier si cette scène a déjà un tournage
                const tournageResponse = await axios.get(`/api/scene-tournage/scene/${scene.idScene}`);
                // Si on arrive ici, c'est que la scène a un tournage (statut 200)
                return { ...scene, estPlanifiee: true };
              } catch (error) {
                // Si erreur 404, la scène n'est pas planifiée - C'EST NORMAL
                if (error.response?.status === 404) {
                  return { ...scene, estPlanifiee: false };
                }
                // Pour les autres erreurs, on considère que la scène n'est pas planifiée
                console.warn(`Erreur vérification scène ${scene.idScene}:`, error.message);
                return { ...scene, estPlanifiee: false };
              }
            })
          );
          
          // Filtrer pour garder seulement les scènes non planifiées
          scenes = scenesAvecStatut.filter(scene => !scene.estPlanifiee);
        }
        
        this.scenesParSequence = scenes;
        
      } catch (error) {
        console.error('Erreur chargement scènes:', error);
        this.scenesParSequence = [];
      }
    },
    async chargerLieuxDisponibles() {
      try {
        const response = await axios.get('/api/lieux');
        this.lieuxDisponibles = response.data;
      } catch (error) {
        console.error('Erreur chargement lieux:', error);
        this.lieuxDisponibles = [];
      }
    },
    async chargerPlateauxParLieu() {
      if (!this.formPlanning.lieuId) {
        this.plateauxParLieu = [];
        return;
      }
      try {
        const response = await axios.get(`/api/plateaux/lieux/${this.formPlanning.lieuId}`);
        this.plateauxParLieu = response.data;
        this.formPlanning.plateauId = '';
      } catch (error) {
        console.error('Erreur chargement plateaux:', error);
        this.plateauxParLieu = [];
      }
    },
    async verifierConflitsComediens() {
        if (!this.formPlanning.sceneId || !this.formPlanning.dateTournage || 
            !this.formPlanning.heureDebut || !this.formPlanning.heureFin) {
            return true; // La validation normale gérera les champs manquants
        }

        try {
            const response = await axios.get('/api/conflicts/check', {
                params: {
                    sceneId: this.formPlanning.sceneId,
                    dateTournage: this.formPlanning.dateTournage,
                    heureDebut: this.formPlanning.heureDebut,
                    heureFin: this.formPlanning.heureFin
                }
            });

            if (response.data.hasConflicts) {
                const messages = response.data.conflicts.join('\n');
                if (!confirm(`🚨 Conflits de comédiens détectés :\n\n${messages}\n\nVoulez-vous quand même continuer ?`)) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Erreur vérification conflits:', error);
            // Continuer malgré l'erreur de vérification
            return true;
        }
    },

    async verifierConflitsTempsReel() {
        if (this.formPlanning.sceneId && this.formPlanning.dateTournage && 
            this.formPlanning.heureDebut && this.formPlanning.heureFin) {
            try {
                const response = await axios.get('/api/conflicts/check', {
                    params: {
                        sceneId: this.formPlanning.sceneId,
                        dateTournage: this.formPlanning.dateTournage,
                        heureDebut: this.formPlanning.heureDebut,
                        heureFin: this.formPlanning.heureFin
                    }
                });

                if (response.data.hasConflicts) {
                    // Afficher les conflits dans l'interface
                    this.erreurPlanning = '⚠️ Conflits détectés :\n' + response.data.conflicts.join('\n');
                } else {
                    this.erreurPlanning = '';
                }
            } catch (error) {
                // Ne pas afficher d'erreur pour la vérification en temps réel
                this.erreurPlanning = '';
            }
        }
    },

async soumettrePlanning() {
        if (!this.validerFormulairePlanning()) return;
        
        // Vérifier les conflits avant soumission
        const peutContinuer = await this.verifierConflitsComediens();
        if (!peutContinuer) return;
        
        this.chargementPlanning = true;
        this.erreurPlanning = '';
        try {
            let response;
            if (this.isModificationPlanning) {
                response = await axios.put(`/api/scene-tournage/${this.formPlanning.id}`, this.formPlanning);
            } else {
                response = await axios.post('/api/scene-tournage', this.formPlanning);
            }
            await this.chargerTournages();
            this.fermerModalPlanning();
            alert(`✅ Planning ${this.isModificationPlanning ? 'modifié' : 'créé'} avec succès !`);
        } catch (error) {
            console.error('Erreur sauvegarde planning:', error);
            
            // Gérer spécifiquement les erreurs de conflit du backend
            if (error.response?.status === 400 && error.response?.data?.message?.includes('Conflits détectés')) {
                this.erreurPlanning = '🚨 Conflits de planning détectés : ' + error.response.data.message;
            } else {
                this.erreurPlanning = error.response?.data?.message || 'Erreur lors de la sauvegarde du planning';
            }
        } finally {
            this.chargementPlanning = false;
        }
    },

    // async supprimerPlanning() {
    //   if (!this.formPlanning.id || !confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) return;
    //   try {
    //     await axios.delete(`/api/scene-tournage/${this.formPlanning.id}`);
    //     await this.chargerTournages();
    //     this.fermerModalPlanning();
    //     alert('Planning supprimé avec succès!');
    //   } catch (error) {
    //     console.error('Erreur suppression planning:', error);
    //     this.erreurPlanning = error.response?.data?.message || 'Erreur lors de la suppression du planning';
    //   }
    // },
    async supprimerTournageDirect(tournage) {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer le tournage "${tournage.sceneTitre}" du ${this.formatDateDetails(tournage.dateTournage)} ?`)) {
        return;
      }
      
      try {
        await axios.delete(`/api/scene-tournage/${tournage.id}`);
        await this.chargerTournages();
        alert('✅ Tournage supprimé avec succès !');
      } catch (error) {
        console.error('Erreur suppression tournage:', error);
        alert('❌ Erreur lors de la suppression du tournage: ' + (error.response?.data?.message || error.message));
      }
    },
    // Mettre à jour la méthode validerFormulairePlanning
    validerFormulairePlanning() {
        this.erreurPlanning = '';
        
        if (!this.formPlanning.projetId) {
            this.erreurPlanning = 'Veuillez sélectionner un projet';
            return false;
        }
        if (!this.formPlanning.episodeId) {
            this.erreurPlanning = 'Veuillez sélectionner un épisode';
            return false;
        }
        if (!this.formPlanning.sequenceId) {
            this.erreurPlanning = 'Veuillez sélectionner une séquence';
            return false;
        }
        if (!this.formPlanning.sceneId) {
            this.erreurPlanning = 'Veuillez sélectionner une scène';
            return false;
        }
        if (!this.formPlanning.heureDebut || !this.formPlanning.heureFin) {
            this.erreurPlanning = 'Veuillez renseigner les heures de début et fin';
            return false;
        }
        if (this.formPlanning.heureDebut >= this.formPlanning.heureFin) {
            this.erreurPlanning = "L'heure de fin doit être après l'heure de début";
            return false;
        }
        
        return true;
    },
    reinitialiserFiltres() {
      this.filtreProjet = '';
      this.filtreStatut = '';
      this.filtreDate = '';
      this.chargerTournages();
    },

    gererParametresURL() {
      const urlParams = new URLSearchParams(window.location.search);
      const sceneId = urlParams.get('sceneId');
      
      if (sceneId) {
        // Filtrer automatiquement par cette scène
        this.selectedSceneId = parseInt(sceneId);
        this.chargerTournagesAvecFiltreScene();
      }
    },

    async chargerTournagesAvecFiltreScene() {
      if (!this.selectedSceneId) return;
      
      try {
        const response = await axios.get(`/api/scene-tournage/scene/${this.selectedSceneId}`);
        if (response.data) {
          // Afficher les détails de cette scène spécifique
          this.ouvrirDetailsTournage(response.data);
          
          // Optionnel: Centrer le calendrier sur la date de tournage
          if (response.data.dateTournage) {
            this.filtreDate = response.data.dateTournage;
            this.dateCourante = new Date(response.data.dateTournage);
          }
        }
      } catch (error) {
        console.error('Erreur chargement scène spécifique:', error);
      }
    },

     async chargerAlertesRaccordsCritiques() {
    try {
      const response = await axios.get('/api/raccords/alertes/critiques/calendrier');
      this.alertesRaccordsCritiques = response.data;
    } catch (error) {
      console.error('Erreur chargement alertes raccords:', error);
    }
  },

  getAlertesPourDate(date) {
    return this.alertesRaccordsCritiques.filter(alerte => {
      const dateAlerte = alerte.dateAlerte;
      return dateAlerte && dateAlerte === date;
    });
  },

  ouvrirDetailsAlerte(alerte) {
    this.$swal({
      title: alerte.getTitreAlerte(),
      html: `
        <div class="alerte-raccord-content">
          <div class="alerte-section">
            <h4>📋 Informations du raccord</h4>
            <p><strong>Scène Source:</strong> ${alerte.sceneSourceTitre}</p>
            <p><strong>Scène Cible:</strong> ${alerte.sceneCibleTitre}</p>
            <p><strong>Type:</strong> ${alerte.typeRaccord}</p>
            <p><strong>Description:</strong> ${alerte.description}</p>
          </div>
          <div class="alerte-section">
            <h4>⚠️ Alertes</h4>
            <ul>
              ${alerte.messagesAlerte.map(msg => `<li>${msg}</li>`).join('')}
            </ul>
          </div>
          <div class="alerte-section">
            <h4>📅 Dates de tournage</h4>
            <p><strong>Source:</strong> ${this.formatDateDetails(alerte.dateTournageSource)}</p>
            <p><strong>Cible:</strong> ${this.formatDateDetails(alerte.dateTournageCible)}</p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Voir dans Gestion Raccords',
      cancelButtonText: 'Fermer',
      customClass: {
        popup: 'alerte-raccord-modal'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.$router.push('/gestion-raccords');
      }
    });
  },

  },
  mounted() {
    this.chargerTournages();
    this.chargerProjets();
    this.gererParametresURL();
    this.chargerAlertesRaccordsCritiques();
    this.$watch(
        () => [
            this.formPlanning.sceneId,
            this.formPlanning.dateTournage,
            this.formPlanning.heureDebut,
            this.formPlanning.heureFin
        ],
        () => {
            if (this.formPlanning.sceneId && this.formPlanning.dateTournage && 
                this.formPlanning.heureDebut && this.formPlanning.heureFin) {
                // Délai pour éviter trop d'appels API
                clearTimeout(this.conflitTimeout);
                this.conflitTimeout = setTimeout(() => {
                    this.verifierConflitsTempsReel();
                }, 1000);
            }
        },
        { deep: true }
    );
  }
};
</script>

<style scoped>
.calendrier-tournage {
  padding: 20px;
  width: 1300px;
  margin: auto;
}

.calendrier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
}

.filters select,
.filters input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.calendar-grid {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
}

.calendar-nav button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #e9ecef;
}

.week-day {
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  border: 1px solid #e9ecef;
  padding: 5px;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day.other-month {
  background-color: #f8f9fa;
  color: #6c757d;
}

.calendar-day.has-tournages {
  background-color: #e8f5e8;
}

.day-header {
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
}

.tournages-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tournage-item {
  position: relative;
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tournage-item:hover {
  opacity: 0.8;
}

.tournage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}

.tournage-time {
  font-weight: bold;
  font-size: 9px;
}

.tournage-title {
  font-size: 9px;
  margin-bottom: 2px;
}

.tournage-actions-small {
  display: flex;
  gap: 2px;
}

.btn-details-small,
.btn-edit-small {
  padding: 2px 4px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-details-small:hover,
.btn-edit-small:hover {
  opacity: 1;
  transform: scale(1.1);
}

.btn-details-small {
  background-color: #17a2b8;
  color: white;
}

.btn-edit-small {
  background-color: #ffc107;
  color: black;
}

.statut-planifie { background-color: #fff3cd; color: #856404; }
.statut-confirme { background-color: #d1ecf1; color: #0c5460; }
.statut-en_cours { background-color: #d4edda; color: #155724; }
.statut-termine { background-color: #d1e7dd; color: #0f5132; }
.statut-reporte { background-color: #f8d7da; color: #721c24; }

.planning-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.planning-form {
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  flex: 0 0 100%;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #495057;
}

.form-input,
.form-select,
.form-textarea {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.details-modal {
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.details-content {
  padding: 20px;
}

.detail-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section h4::before {
  content: "•";
  color: #007bff;
  font-size: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
}

.detail-item strong {
  min-width: 140px;
  color: #343a40;
  font-weight: 600;
}

.detail-item span {
  flex: 1;
  color: #6c757d;
}

.notes-content {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
  line-height: 1.5;
}

.statut-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
}

@media (max-width: 768px) {
  .calendrier-tournage {
    width: 100%;
    padding: 10px;
  }
  .calendrier-header {
    flex-direction: column;
    gap: 10px;
  }
  .filters {
    flex-direction: column;
    width: 100%;
  }
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  .modal-actions {
    flex-direction: column;
  }
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filters select,
.filters input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filters .btn {
  padding: 8px 12px;
  white-space: nowrap;
}
.error-message.conflict-warning {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
}

.error-message.conflict-warning .conflict-title {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
}

.error-content {
    width: 100%;
}

.error-text {
    white-space: pre-wrap;
    font-family: inherit;
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
}

.info-message {
    background-color: #d1ecf1;
    color: #0c5460;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

/* Améliorer l'affichage des messages de conflit dans les détails */
.details-content .conflict-info {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    padding: 10px;
    margin: 10px 0;
}

.conflict-list {
    margin-top: 8px;
    padding-left: 20px;
}

.conflict-item {
    margin: 4px 0;
    font-size: 14px;
    color: #856404;
}

/* Style pour les jours avec conflits dans le calendrier */
.calendar-day.has-conflicts {
    background-color: #fff3cd;
    border: 2px solid #ffc107;
}

.conflict-indicator {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 8px;
    height: 8px;
    background-color: #dc3545;
    border-radius: 50%;
}
.btn-delete-small {
  padding: 2px 4px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
  background-color: #dc3545;
  color: white;
}

.btn-delete-small:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Ajustez la largeur du conteneur des actions si nécessaire */
.tournage-actions-small {
  display: flex;
  gap: 2px;
}

.alertes-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.alertes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.alertes-header h3 {
  margin: 0;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

.alertes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alerte-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.alerte-item.critique {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.alerte-item:hover {
  opacity: 0.8;
}

.alerte-icon {
  font-size: 18px;
}

.alerte-content {
  flex: 1;
}

.alerte-title {
  font-weight: bold;
  color: #721c24;
}

.alerte-date {
  font-size: 12px;
  color: #856404;
}

.alerte-scenes {
  font-size: 12px;
  color: #495057;
}

/* Indicateur dans les jours du calendrier */
.alerte-indicator {
  color: #dc3545;
  cursor: pointer;
  font-size: 12px;
  margin-left: 4px;
}

.calendar-day.has-alertes-critiques {
  background: #fff3cd !important;
  border: 2px solid #dc3545 !important;
}

.alertes-list-day {
  margin-top: 5px;
}

.alerte-item-day {
  background: #dc3545;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 9px;
  cursor: pointer;
  margin-bottom: 2px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alerte-item-day:hover {
  opacity: 0.8;
}

/* Modal d'alerte */
.alerte-raccord-content {
  text-align: left;
}

.alerte-section {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.alerte-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.alerte-section h4 {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 14px;
}

.alerte-section p {
  margin: 4px 0;
  font-size: 13px;
}

.alerte-section ul {
  margin: 4px 0;
  padding-left: 20px;
}

.alerte-section li {
  font-size: 13px;
  margin: 2px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .alertes-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .alerte-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

</style>