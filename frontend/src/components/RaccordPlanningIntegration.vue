<template>
  <div class="raccord-planning-integration">
    <!-- Section Alertes -->
    <div class="alertes-section" v-if="alertes.length > 0 || chargementAlertes">
  <h3>
    <i class="fas fa-bell"></i>
    Alertes Planning Raccords
    <span v-if="alertes.length > 0" class="badge badge-danger">{{ alertes.length }}</span>
    <span v-else class="badge badge-secondary">Chargement...</span>
  </h3>
  
  <div v-if="chargementAlertes" class="loading-alertes">
    <i class="fas fa-spinner fa-spin"></i> Chargement des alertes...
  </div>
  
  <div v-else-if="alertes.length > 0" class="alertes-grid">
    <!-- contenu existant -->
  </div>
  
  <div v-else class="no-alertes">
    <i class="fas fa-check-circle"></i>
    Aucune alerte de planning pour le moment
  </div>
</div>

    <!-- Badges de statut dans la liste des raccords -->
    <div class="statuts-planning" v-if="raccordsAvecPlanning.length > 0">
      <h4>Statuts Planning des Raccords</h4>
      
      <div class="raccords-list">
        <div v-for="raccord in raccordsAvecPlanning" :key="raccord.id" class="raccord-item">
          <div class="raccord-header">
            <h5>{{ raccord.typeRaccordNom }}</h5>
            <div class="statuts-dates">
              <span class="badge-date" :class="getStatutClasse(raccord, 'source')">
                {{ formatDateCourt(raccord.dateTournageSource) }}
              </span>
              <i class="fas fa-arrow-right"></i>
              <span class="badge-date" :class="getStatutClasse(raccord, 'cible')">
                {{ formatDateCourt(raccord.dateTournageCible) }}
              </span>
            </div>
          </div>
          
          <div class="raccord-actions">
            <button @click="ouvrirCalendrierScene(raccord.sceneSourceId)" 
                    class="btn btn-outline-primary btn-sm">
              <i class="fas fa-calendar"></i> Planning Source
            </button>
            <button @click="ouvrirCalendrierScene(raccord.sceneCibleId)" 
                    class="btn btn-outline-secondary btn-sm">
              <i class="fas fa-calendar"></i> Planning Cible
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajustement de planning -->
    <div v-if="showModalAjustement" class="modal-overlay" @click="fermerModalAjustement">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>
            <i class="fas fa-calendar-alt"></i>
            Ajuster le Planning
          </h4>
          <button @click="fermerModalAjustement" class="close-btn">
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
        </div>
        
        <div class="modal-actions">
          <button @click="fermerModalAjustement" class="btn btn-secondary">
            Annuler
          </button>
          <button @click="appliquerAjustement" class="btn btn-primary">
            <i class="fas fa-save"></i> Appliquer les modifications
          </button>
        </div>
      </div>
    </div>

    <!-- Section Vue d'ensemble des statuts -->
    <div class="statuts-overview" v-if="raccordsAvecPlanning.length > 0">
    <h3>
        <i class="fas fa-chart-bar"></i>
        Vue d'ensemble des statuts
    </h3>
    
    <div class="stats-grid">
        <div class="stat-card stat-ok">
        <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
            <div class="stat-number">{{ stats.coherent }}</div>
            <div class="stat-label">Cohérents</div>
        </div>
        </div>
        
        <div class="stat-card stat-warning">
        <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
            <div class="stat-number">{{ stats.ecartImportant }}</div>
            <div class="stat-label">Écarts importants</div>
        </div>
        </div>
        
        <div class="stat-card stat-danger">
        <div class="stat-icon">
            <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
            <div class="stat-number">{{ stats.incoherent }}</div>
            <div class="stat-label">Incohérences</div>
        </div>
        </div>
        
        <div class="stat-card stat-info">
        <div class="stat-icon">
            <i class="fas fa-question-circle"></i>
        </div>
        <div class="stat-content">
            <div class="stat-number">{{ stats.indetermine }}</div>
            <div class="stat-label">Indéterminés</div>
        </div>
        </div>
    </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RaccordPlanningIntegration',
  data() {
    return {
      alertes: [],
      raccordsAvecPlanning: [],
      showModalAjustement: false,
      alerteSelectionnee: null,
      suggestionsReplanification: [],
      nouvelleDateTournage: '',
      nouvelleHeureDebut: '09:00',
      nouvelleHeureFin: '12:00',
      chargementAlertes: false, // ← Ajouter cette ligne
       chargementRaccords: false 
    };
  },
  computed: {
  stats() {
    const stats = {
      coherent: 0,
      ecartImportant: 0,
      incoherent: 0,
      indetermine: 0
    };
    
    this.raccordsAvecPlanning.forEach(raccord => {
      if (!raccord.dateTournageSource || !raccord.dateTournageCible) {
        stats.indetermine++;
        return;
      }
      
      const dateSource = new Date(raccord.dateTournageSource);
      const dateCible = new Date(raccord.dateTournageCible);
      const ecartJours = Math.abs(dateCible - dateSource) / (1000 * 60 * 60 * 24);
      
      if (dateCible < dateSource) {
        stats.incoherent++;
      } else if (ecartJours > 7) {
        stats.ecartImportant++;
      } else {
        stats.coherent++;
      }
    });
    
    return stats;
  }
},
  methods: {
async chargerAlertes() {
  try {
    console.log('Chargement des alertes...');
    const response = await axios.get('/api/raccords/alertes');
    this.alertes = response.data;
    console.log('Alertes chargées:', this.alertes.length, this.alertes);
  } catch (error) {
    console.error('Erreur chargement alertes:', error);
    console.error('Détails erreur:', error.response?.data);
  }
},
    
    async chargerRaccordsAvecPlanning() {
      try {
        const response = await axios.get('/api/raccords/avec-planning');
        this.raccordsAvecPlanning = response.data;
      } catch (error) {
        console.error('Erreur chargement raccords:', error);
      }
    },
    
    async ouvrirModalAjustement(alerte) {
      this.alerteSelectionnee = alerte;
      
      try {
        const response = await axios.get(`/api/raccords/${alerte.raccordId}/suggestions-replanification`);
        this.suggestionsReplanification = response.data;
      } catch (error) {
        console.error('Erreur chargement suggestions:', error);
      }
      
      this.showModalAjustement = true;
    },
    
    fermerModalAjustement() {
      this.showModalAjustement = false;
      this.alerteSelectionnee = null;
      this.suggestionsReplanification = [];
    },
    
    async appliquerSuggestion(date) {
      this.nouvelleDateTournage = this.formatDateForInput(date);
    },
    
    async appliquerAjustement() {
  if (!this.nouvelleDateTournage) {
    alert('Veuillez sélectionner une date');
    return;
  }
  
  try {
    const ajustementDTO = {
      sceneId: this.alerteSelectionnee.sceneId,
      nouvelleDate: this.nouvelleDateTournage,
      nouvelleHeureDebut: this.nouvelleHeureDebut,
      nouvelleHeureFin: this.nouvelleHeureFin,
      raisonAjustement: `Ajustement pour raccord: ${this.alerteSelectionnee.description}`,
      utilisateurId: 1, // Remplacer par l'ID utilisateur réel
      notifierEquipe: true,
      notesSupplementaires: 'Ajustement automatique basé sur les contraintes de raccord'
    };
    
    await axios.put(`/api/raccords/${this.alerteSelectionnee.raccordId}/ajuster-planning`, ajustementDTO);
    
    alert('Planning ajusté avec succès!');
    this.fermerModalAjustement();
    this.chargerAlertes();
    this.chargerRaccordsAvecPlanning();
    
  } catch (error) {
    console.error('Erreur ajustement planning:', error);
    if (error.response?.data?.includes("Conflits détectés")) {
      alert('Conflits détectés: ' + error.response.data);
    } else {
      alert('Erreur lors de l\'ajustement du planning');
    }
  }
},
    
    ouvrirCalendrierScene(sceneId) {
      // Navigation vers le calendrier avec filtre sur la scène
      this.$router.push(`/calendrier-tournage?sceneId=${sceneId}`);
    },
    
    voirDetailsRaccord(raccordId) {
      this.$router.push(`/gestion-raccords?raccordId=${raccordId}`);
    },
    
    getStatutClasse(raccord, type) {
      if (!raccord.dateTournageSource || !raccord.dateTournageCible) {
        return 'statut-indetermine';
      }
      
      const dateSource = new Date(raccord.dateTournageSource);
      const dateCible = new Date(raccord.dateTournageCible);
      const ecartJours = Math.abs(dateCible - dateSource) / (1000 * 60 * 60 * 24);
      
      if (type === 'source') {
        return 'statut-source';
      } else {
        if (dateCible < dateSource) {
          return 'statut-incoherent';
        } else if (ecartJours > 7) {
          return 'statut-ecart-important';
        } else {
          return 'statut-ok';
        }
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Non planifiée';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    formatDateCourt(dateString) {
      if (!dateString) return 'N/P';
      return new Date(dateString).toLocaleDateString('fr-FR');
    },
    
    formatDateForInput(date) {
      if (!date) return '';
      return new Date(date).toISOString().split('T')[0];
    }
  },
  
  mounted() {
    this.chargerAlertes();
    this.chargerRaccordsAvecPlanning();
  }
};
</script>

<style scoped>
.raccord-planning-integration {
  padding: 20px;
}

.alertes-section {
  margin-bottom: 30px;
}

.alertes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.alerte-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.alerte-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.niveau-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.niveau-critique { background-color: #dc3545; }
.niveau-moyen { background-color: #ffc107; color: black; }
.niveau-faible { background-color: #17a2b8; }

.dates-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 10px 0;
}

.date-item {
  display: flex;
  justify-content: space-between;
}

.messages-alerte {
  margin: 10px 0;
}

.message-item {
  padding: 5px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 5px;
  font-size: 14px;
}

.alerte-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.statuts-planning {
  margin-top: 30px;
}

.raccords-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.raccord-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.raccord-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.statuts-dates {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-date {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.statut-ok { background-color: #d4edda; color: #155724; }
.statut-incoherent { background-color: #f8d7da; color: #721c24; }
.statut-ecart-important { background-color: #fff3cd; color: #856404; }
.statut-indetermine { background-color: #e2e3e5; color: #383d41; }
.statut-source { background-color: #d1ecf1; color: #0c5460; }

.raccord-actions {
  display: flex;
  gap: 8px;
}

.suggestions-section {
  margin-bottom: 20px;
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
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

/* Styles modaux existants */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
/* Vue d'ensemble des statuts */
.statuts-overview {
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 5px;
}

.stat-ok { background: linear-gradient(135deg, #28a745, #20c997); }
.stat-warning { background: linear-gradient(135deg, #ffc107, #fd7e14); }
.stat-danger { background: linear-gradient(135deg, #dc3545, #e83e8c); }
.stat-info { background: linear-gradient(135deg, #6c757d, #5a6268); }
</style>