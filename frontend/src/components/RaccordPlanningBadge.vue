<template>
  <div class="planning-badge" :class="statusClass">
    <div class="planning-dates">
      <div class="date-item">
        <i class="fas fa-film"></i>
        <span class="date-label">Source:</span>
        <span class="date-value">{{ sourceDateText }}</span>
        <span v-if="raccord.statutTournageSource" class="tournage-status" :class="`status-${raccord.statutTournageSource}`">
          ({{ getStatutTournageLabel(raccord.statutTournageSource) }})
        </span>
      </div>
      
      <i class="fas fa-arrow-right arrow"></i>
      
      <div class="date-item">
        <i class="fas fa-film"></i>
        <span class="date-label">Cible:</span>
        <span class="date-value">{{ cibleDateText }}</span>
        <span v-if="raccord.statutTournageCible" class="tournage-status" :class="`status-${raccord.statutTournageCible}`">
          ({{ getStatutTournageLabel(raccord.statutTournageCible) }})
        </span>
      </div>
    </div>
    
    <div v-if="statusMessage" class="status-message" :class="statusClass">
      <i :class="statusIcon"></i>
      {{ statusMessage }}
    </div>

    <!-- Messages d'alerte détaillés -->
    <div v-if="showAlertDetails" class="alert-details">
      <div v-if="hasIncoherenceChronologique" class="alert-detail incoherence">
        <i class="fas fa-exclamation-circle"></i>
        <strong>Incohérence chronologique :</strong> La scène cible est tournée avant la scène source.
        Cela peut causer des problèmes de continuité (costumes, décors, vieillissement).
      </div>
      
      <div v-if="hasEcartImportant" class="alert-detail ecart">
        <i class="fas fa-clock"></i>
        <strong>Écart important :</strong> {{ ecartJours }} jours entre les tournages.
        Risque d'oubli des détails de continuité.
      </div>

      <div v-if="hasDatesManquantes" class="alert-detail indetermine">
        <i class="fas fa-question-circle"></i>
        <strong>Dates manquantes :</strong> Une ou plusieurs scènes ne sont pas encore planifiées.
      </div>
    </div>

    <!-- Bouton pour voir/masquer les détails -->
    <div class="details-toggle" @click="toggleDetails">
      <span>{{ showAlertDetails ? 'Masquer les détails' : 'Voir les détails' }}</span>
      <i :class="showAlertDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RaccordPlanningBadge',
  props: {
    raccord: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showAlertDetails: false
    };
  },
  computed: {
    sourceDateText() {
      return this.raccord.dateTournageSource 
        ? this.formatDateCourt(this.raccord.dateTournageSource)
        : 'Non planifiée';
    },
    cibleDateText() {
      return this.raccord.dateTournageCible 
        ? this.formatDateCourt(this.raccord.dateTournageCible)
        : 'Non planifiée';
    },
    ecartJours() {
      if (!this.raccord.dateTournageSource || !this.raccord.dateTournageCible) {
        return 0;
      }
      const dateSource = new Date(this.raccord.dateTournageSource);
      const dateCible = new Date(this.raccord.dateTournageCible);
      return Math.abs(dateCible - dateSource) / (1000 * 60 * 60 * 24);
    },
    statusClass() {
      if (!this.raccord.dateTournageSource || !this.raccord.dateTournageCible) {
        return 'statut-indetermine';
      }
      
      const dateSource = new Date(this.raccord.dateTournageSource);
      const dateCible = new Date(this.raccord.dateTournageCible);
      
      if (dateCible < dateSource) {
        return 'statut-incoherent';
      } else if (this.ecartJours > 7) {
        return 'statut-ecart-important';
      } else {
        return 'statut-ok';
      }
    },
    statusMessage() {
      if (!this.raccord.dateTournageSource || !this.raccord.dateTournageCible) {
        return '📅 Dates de tournage manquantes';
      }
      
      const dateSource = new Date(this.raccord.dateTournageSource);
      const dateCible = new Date(this.raccord.dateTournageCible);
      
      if (dateCible < dateSource) {
        return '❌ Incohérence chronologique';
      } else if (this.ecartJours > 7) {
        return `⚠️ Écart important (${Math.round(this.ecartJours)} jours)`;
      } else {
        return '✅ Cohérent';
      }
    },
    statusIcon() {
      switch (this.statusClass) {
        case 'statut-ok': return 'fas fa-check-circle';
        case 'statut-ecart-important': return 'fas fa-exclamation-triangle';
        case 'statut-incoherent': return 'fas fa-times-circle';
        default: return 'fas fa-question-circle';
      }
    },
    // Nouvelles computed properties pour les alertes détaillées
    hasIncoherenceChronologique() {
      if (!this.raccord.dateTournageSource || !this.raccord.dateTournageCible) return false;
      const dateSource = new Date(this.raccord.dateTournageSource);
      const dateCible = new Date(this.raccord.dateTournageCible);
      return dateCible < dateSource;
    },
    hasEcartImportant() {
      return this.ecartJours > 7;
    },
    hasDatesManquantes() {
      return !this.raccord.dateTournageSource || !this.raccord.dateTournageCible;
    }
  },
  methods: {
    formatDateCourt(dateString) {
      if (!dateString) return 'N/P';
      return new Date(dateString).toLocaleDateString('fr-FR');
    },
    getStatutTournageLabel(statut) {
      const statuts = {
        'planifie': 'Planifié',
        'confirme': 'Confirmé',
        'en_cours': 'En cours',
        'termine': 'Terminé',
        'reporte': 'Reporté'
      };
      return statuts[statut] || statut;
    },
    toggleDetails() {
      this.showAlertDetails = !this.showAlertDetails;
    }
  }
}
</script>

<style scoped>
.planning-badge {
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  border: 2px solid;
  transition: all 0.3s ease;
}

.planning-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.planning-dates {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  flex-wrap: wrap;
}

.date-label {
  font-weight: bold;
  font-size: 12px;
  color: #495057;
}

.date-value {
  font-size: 12px;
  font-weight: 600;
}

.tournage-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.status-planifie { background-color: #fff3cd; color: #856404; }
.status-confirme { background-color: #d1ecf1; color: #0c5460; }
.status-en_cours { background-color: #d4edda; color: #155724; }
.status-termine { background-color: #28a745; color: white; }
.status-reporte { background-color: #f8d7da; color: #721c24; }

.arrow {
  color: #6c757d;
  margin: 0 5px;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: bold;
  justify-content: center;
  margin: 8px 0;
  padding: 6px;
  border-radius: 4px;
}

/* Détails des alertes */
.alert-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.alert-detail {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.alert-detail i {
  margin-top: 2px;
  flex-shrink: 0;
}

.alert-detail.incoherence {
  background-color: rgba(220, 53, 69, 0.1);
  border-left: 3px solid #dc3545;
  color: #721c24;
}

.alert-detail.ecart {
  background-color: rgba(255, 193, 7, 0.1);
  border-left: 3px solid #ffc107;
  color: #856404;
}

.alert-detail.indetermine {
  background-color: rgba(108, 117, 125, 0.1);
  border-left: 3px solid #6c757d;
  color: #383d41;
}

/* Bouton toggle */
.details-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.details-toggle:hover {
  background-color: rgba(0,0,0,0.05);
  color: #495057;
}

/* Classes de statut principales */
.statut-ok { 
  background-color: #d4edda; 
  color: #155724; 
  border-color: #28a745; 
}

.statut-incoherent { 
  background-color: #f8d7da; 
  color: #721c24; 
  border-color: #dc3545; 
}

.statut-ecart-important { 
  background-color: #fff3cd; 
  color: #856404; 
  border-color: #ffc107; 
}

.statut-indetermine { 
  background-color: #e9ecef; 
  color: #495057; 
  border-color: #6c757d; 
}

/* Responsive */
@media (max-width: 768px) {
  .planning-dates {
    flex-direction: column;
    gap: 8px;
  }
  
  .arrow {
    transform: rotate(90deg);
    margin: 5px 0;
  }
  
  .date-item {
    justify-content: center;
    text-align: center;
  }
}
</style>