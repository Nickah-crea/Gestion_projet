<template>
  <div class="replanification-container">
    <!-- Bouton pour ouvrir le modal de replanification -->
    <button 
      v-if="showTriggerButton"
      class="btn-open-replanification"
      @click="openReplanificationModal"
      :disabled="!sceneId"
    >
      <i class="fas fa-calendar-alt"></i>
      Replanifier
    </button>

    <!-- Modal pour la replanification -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- En-tête du modal -->
        <div class="modal-header">
          <h3>
            <i class="fas fa-calendar-plus"></i>
            Replanification - Scène {{ sceneInfo?.ordre }}
          </h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Informations de la scène source -->
        <div class="scene-info-section">
          <div class="scene-details">
            <h4>Scène à replanifier</h4>
            <p><strong>Scène {{ sceneInfo?.ordre }}:</strong> {{ sceneInfo?.titre }}</p>
            <p><strong>Synopsis:</strong> {{ sceneInfo?.synopsis || 'Aucun synopsis' }}</p>
            <p><strong>Statut:</strong> {{ sceneInfo?.statutNom || 'Non défini' }}</p>
            
            <!-- Informations de tournage actuelles -->
            <div v-if="currentTournage" class="current-tournage-info">
              <h5>Tournage actuel :</h5>
              <p><strong>Date :</strong> {{ formatDate(currentTournage.dateTournage) }}</p>
              <p><strong>Heure début :</strong> {{ formatHeure(currentTournage.heureDebut) }}</p>
              <p><strong>Heure fin :</strong> {{ formatHeure(currentTournage.heureFin) }}</p>
              <p><strong>Statut :</strong> {{ currentTournage.statutTournage }}</p>
            </div>
            <div v-else class="no-tournage-info">
              <p><i class="fas fa-info-circle"></i> Aucun tournage planifié actuellement</p>
            </div>
          </div>
        </div>

        <!-- Raccords existants pour cette scène -->
        <div v-if="availableRaccords.length > 0" class="raccords-section">
          <h4><i class="fas fa-camera-retro"></i> Raccords existants</h4>
          <div class="raccords-list">
            <div 
              v-for="raccord in availableRaccords" 
              :key="raccord.id"
              class="raccord-item"
            >
              <div class="raccord-type-badge">
                {{ raccord.typeRaccordNom }}
              </div>
              <p class="raccord-description">{{ raccord.description || 'Aucune description' }}</p>
              <div class="raccord-photos-count">
                <i class="fas fa-camera"></i>
                {{ raccord.images?.length || 0 }} photo(s)
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire de replanification -->
        <div class="replanification-form-section">
          <h4><i class="fas fa-edit"></i> Nouvelle planification</h4>
          
          <!-- Sélection de la date -->
          <div class="form-group">
            <label for="nouvelle-date">Nouvelle date de tournage *</label>
            <input
              type="date"
              id="nouvelle-date"
              v-model="replanificationData.nouvelleDate"
              :min="minDate"
              class="form-input"
              required
            >
          </div>

          <!-- Choix de l'heure -->
          <div class="form-row">
            <div class="form-group">
              <label for="nouvelle-heure-debut">Nouvelle heure de début</label>
              <input
                type="time"
                id="nouvelle-heure-debut"
                v-model="replanificationData.nouvelleHeureDebut"
                class="form-input"
                step="300"
              >
              <small class="field-note">Laissez vide pour conserver l'heure actuelle</small>
            </div>
            
            <div class="form-group">
              <label for="nouvelle-heure-fin">Nouvelle heure de fin</label>
              <input
                type="time"
                id="nouvelle-heure-fin"
                v-model="replanificationData.nouvelleHeureFin"
                class="form-input"
                step="300" 
              >
              <small class="field-note">Laissez vide pour conserver l'heure actuelle</small>
            </div>
          </div>

          <!-- Raison de la replanification -->
          <div class="form-group">
            <label for="raison-replanification">Raison de la replanification *</label>
            <textarea
              id="raison-replanification"
              v-model="replanificationData.raison"
              rows="3"
              class="form-textarea"
              placeholder="Expliquez pourquoi cette scène doit être replanifiée..."
              required
            ></textarea>
          </div>

          <!-- Boutons d'action -->
          <div class="action-buttons">
            <button 
              class="btn-cancel"
              @click="closeModal"
              type="button"
            >
              Annuler
            </button>
            <button 
              class="btn-confirm"
              @click="confirmReplanification"
              :disabled="!canConfirmReplanification || loading"
              type="button"
            >
              <i class="fas fa-calendar-check" v-if="!loading"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              {{ loading ? 'Replanification...' : 'Confirmer la replanification' }}
            </button>
          </div>
        </div>

        <!-- Replanifications actives -->
        <div v-if="activeReplanifications.length > 0" class="active-replanifications-section">
          <h4><i class="fas fa-exclamation-triangle"></i> Replanifications en attente</h4>
          <div class="active-replanifications-list">
            <div 
              v-for="replanification in activeReplanifications" 
              :key="replanification.id"
              class="active-replanification-item"
            >
              <div class="replanification-header">
                <strong>Nouvelle date proposée : {{ formatDate(replanification.nouvelleDate) }}</strong>
                <span class="replanification-status status-planned">
                  {{ replanification.statut }}
                </span>
              </div>
              <div v-if="replanification.nouvelleHeureDebut || replanification.nouvelleHeureFin" class="replanification-heures">
                <p><strong>Heures :</strong> 
                  {{ formatHeure(replanification.nouvelleHeureDebut) }} - 
                  {{ formatHeure(replanification.nouvelleHeureFin) }}
                </p>
              </div>
              <p class="replanification-reason"><strong>Raison :</strong> {{ replanification.raison }}</p>
              <div class="replanification-actions">
                <button 
                  class="btn-apply"
                  @click="appliquerReplanification(replanification.id)"
                  type="button"
                >
                  <i class="fas fa-check"></i> Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'

export default {
  name: 'ReplanificationComponent',
  props: {
    sceneId: {
      type: Number,
      required: true
    },
    showTriggerButton: {
      type: Boolean,
      default: true
    },
    sceneInfo: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['replanification-updated', 'tournage-updated', 'replanification-appliquee'],

  setup(props, { emit }) {
    // États réactifs
    const showModal = ref(false)
    const loading = ref(false)
    const availableRaccords = ref([])
    const currentTournage = ref(null)
    const activeReplanifications = ref([])
    const isMounted = ref(false)

    // Données de replanification
    const replanificationData = ref({
      sceneId: props.sceneId, 
      nouvelleDate: '',
      nouvelleHeureDebut: '', 
      nouvelleHeureFin: '',
      raison: ''
    })

    // Computed properties
    const canConfirmReplanification = computed(() => {
      return (
        replanificationData.value.nouvelleDate &&
        replanificationData.value.raison.trim()
      )
    })

    const hasActiveReplanification = computed(() => {
      return activeReplanifications.value.some(r => r.statut === 'PLANIFIEE')
    })

    const minDate = computed(() => {
      return new Date().toISOString().split('T')[0]
    })

    // Méthodes
    const openReplanificationModal = async () => {
      console.log('🔄 Ouverture du modal de replanification')
      if (!isMounted.value) {
        await nextTick()
      }
      showModal.value = true
      await loadData()
    }

    const closeModal = () => {
      console.log('🔄 Fermeture du modal')
      showModal.value = false
      resetReplanificationData()
    }

    const loadData = async () => {
      if (!props.sceneId) {
        console.warn('SceneId non défini')
        return
      }

      console.log('🔄 Chargement des données pour la scène:', props.sceneId)
      loading.value = true
      try {
        await Promise.all([
          loadCurrentTournage(),
          loadAvailableRaccords(),
          loadActiveReplanifications()
        ])
        console.log('✅ Données chargées avec succès')
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error)
        alert('Erreur lors du chargement des données')
      } finally {
        loading.value = false
      }
    }

    const loadCurrentTournage = async () => {
      try {
        console.log(`🔄 Chargement du tournage pour la scène: ${props.sceneId}`)
        const response = await axios.get(`/api/scene-tournage/scene/${props.sceneId}`)
        currentTournage.value = response.data
        console.log('✅ Tournage chargé:', currentTournage.value)
        
        // Pré-remplir les heures actuelles dans le formulaire
        if (currentTournage.value) {
          replanificationData.value.nouvelleHeureDebut = formatTimeForInput(currentTournage.value.heureDebut) || '09:00'
          replanificationData.value.nouvelleHeureFin = formatTimeForInput(currentTournage.value.heureFin) || '12:00'
          console.log('✅ Heures pré-remplies:', {
            debut: replanificationData.value.nouvelleHeureDebut,
            fin: replanificationData.value.nouvelleHeureFin
          })
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('ℹ️ Aucun tournage existant pour cette scène')
          currentTournage.value = null
          // Définir des heures par défaut
          replanificationData.value.nouvelleHeureDebut = '09:00'
          replanificationData.value.nouvelleHeureFin = '12:00'
        } else {
          console.error('❌ Erreur lors du chargement du tournage actuel:', error)
          currentTournage.value = null
        }
      }
    }

    const loadAvailableRaccords = async () => {
      try {
        const response = await axios.get(`/api/raccords/scene/${props.sceneId}`)
        availableRaccords.value = response.data || []
        console.log('✅ Raccords chargés:', availableRaccords.value.length)
      } catch (error) {
        console.error('❌ Erreur lors du chargement des raccords disponibles:', error)
        availableRaccords.value = []
      }
    }

    const loadActiveReplanifications = async () => {
      try {
        const response = await axios.get(`/api/replanifications/scene/${props.sceneId}`)
        activeReplanifications.value = (response.data || []).filter(r => r.statut === 'PLANIFIEE')
        console.log('✅ Replanifications actives chargées:', activeReplanifications.value.length)
      } catch (error) {
        console.error('❌ Erreur lors du chargement des replanifications actives:', error)
        activeReplanifications.value = []
      }
    }

    const confirmReplanification = async () => {
      if (!canConfirmReplanification.value) return

      // Validation des heures
      if (replanificationData.value.nouvelleHeureDebut && replanificationData.value.nouvelleHeureFin) {
        if (replanificationData.value.nouvelleHeureDebut >= replanificationData.value.nouvelleHeureFin) {
          alert('L\'heure de début doit être avant l\'heure de fin')
          return
        }
      }

      console.log('🚀 Début de la replanification')
      loading.value = true
      try {
        const replanificationPayload = {
          sceneId: props.sceneId,
          nouvelleDate: replanificationData.value.nouvelleDate,
          nouvelleHeureDebut: replanificationData.value.nouvelleHeureDebut || null, 
          nouvelleHeureFin: replanificationData.value.nouvelleHeureFin || null,
          raison: replanificationData.value.raison
        }

        console.log('📤 Envoi de la replanification:', replanificationPayload)

        const response = await axios.post('/api/replanifications', replanificationPayload)
        console.log('✅ Replanification créée:', response.data)

        if (response.status === 201) {
          // Appliquer immédiatement la replanification
          console.log('🔄 Application de la replanification...')
          const replanificationAppliquee = await terminerReplanification(response.data.id)
          
          console.log('✅ Replanification appliquée avec succès!')
          
          // Émettre l'événement avec les nouvelles données de tournage
          emit('replanification-appliquee', {
            sceneId: props.sceneId,
            nouveauTournage: replanificationAppliquee.tournageMisAJour || replanificationAppliquee
          })
          
          alert('Replanification créée et appliquée avec succès!')
          closeModal()
          emit('replanification-updated')
          emit('tournage-updated')
        }
      } catch (error) {
        console.error('❌ Erreur lors de la replanification:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue'
        console.error('Détails de l\'erreur:', error.response?.data)
        alert('Erreur lors de la replanification: ' + errorMessage)
      } finally {
        loading.value = false
      }
    }

    const terminerReplanification = async (replanificationId) => {
      try {
        console.log(`🔄 Application de la replanification ID: ${replanificationId}`)
        const response = await axios.put(`/api/replanifications/${replanificationId}/terminer`)
        console.log('✅ Replanification terminée:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Erreur lors de l\'application de la replanification:', error)
        throw error
      }
    }

    const appliquerReplanification = async (replanificationId) => {
      if (!confirm('Êtes-vous sûr de vouloir appliquer cette replanification ? L\'ancien planning sera archivé.')) {
        return
      }

      try {
        const replanificationAppliquee = await terminerReplanification(replanificationId)
        
        // Émettre l'événement avec les nouvelles données de tournage
        emit('replanification-appliquee', {
          sceneId: props.sceneId,
          nouveauTournage: replanificationAppliquee.tournageMisAJour || replanificationAppliquee
        })
        
        alert('Replanification appliquée avec succès!')
        emit('tournage-updated')
        await loadData()
      } catch (error) {
        console.error('❌ Erreur lors de l\'application de la replanification:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue'
        alert('Erreur lors de l\'application: ' + errorMessage)
      }
    }

    const resetReplanificationData = () => {
      console.log('🔄 Réinitialisation des données du formulaire')
      replanificationData.value = {
        sceneId: props.sceneId,
        nouvelleDate: '',
        nouvelleHeureDebut: currentTournage.value ? formatTimeForInput(currentTournage.value.heureDebut) : '09:00', 
        nouvelleHeureFin: currentTournage.value ? formatTimeForInput(currentTournage.value.heureFin) : '12:00',     
        raison: ''
      }
    }

    // Fonctions utilitaires
    const formatDate = (dateString) => {
      if (!dateString) return 'Non définie'
      try {
        return new Date(dateString).toLocaleDateString('fr-FR')
      } catch (error) {
        console.error('Erreur formatDate:', error)
        return 'Date invalide'
      }
    }

    const formatHeure = (heureString) => {
      if (!heureString) return 'Non définie'
      
      try {
        // Si c'est déjà au format HH:mm, retourner tel quel
        if (heureString.length === 5 && heureString.includes(':')) {
          return heureString
        }
        
        // Si c'est au format HH:mm:ss, extraire seulement HH:mm
        if (heureString.length >= 8) {
          return heureString.substring(0, 5)
        }
        
        return heureString
      } catch (error) {
        console.error('Erreur formatHeure:', error)
        return heureString
      }
    }

    const formatTimeForInput = (timeString) => {
      if (!timeString) return ''
      return formatHeure(timeString)
    }

    // Lifecycle
    onMounted(() => {
      console.log('✅ Composant ReplanificationComponent monté')
      isMounted.value = true
      if (props.sceneId) {
        loadData()
      }
    })

    // Watcher pour recharger les données quand la scène change
    watch(() => props.sceneId, (newSceneId) => {
      console.log('🔄 SceneId changé:', newSceneId)
      if (newSceneId && isMounted.value) {
        loadData()
      }
    })

    return {
      showModal,
      loading,
      availableRaccords,
      currentTournage,
      activeReplanifications,
      replanificationData,
      canConfirmReplanification,
      hasActiveReplanification,
      minDate,
      openReplanificationModal,
      closeModal,
      confirmReplanification,
      appliquerReplanification,
      formatDate,
      formatHeure
    }
  }
}
</script>

<style scoped>
.replanification-container {
  display: inline-block;
}

.btn-open-replanification {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  margin-left: 10px;
}

.btn-open-replanification:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.btn-open-replanification:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 20px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4em;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2em;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Sections du modal */
.scene-info-section,
.raccords-section,
.replanification-form-section,
.active-replanifications-section {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.scene-info-section:last-child,
.raccords-section:last-child,
.replanification-form-section:last-child,
.active-replanifications-section:last-child {
  border-bottom: none;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #28a745;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.field-note {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
  font-style: italic;
}

/* Raccords */
.raccords-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.raccord-item {
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 10px;
  background: #f8f9fa;
}

.raccord-type-badge {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 5px;
}

.raccord-description {
  color: #666;
  margin: 5px 0;
  font-size: 14px;
}

.raccord-photos-count {
  color: #999;
  font-size: 12px;
}

/* Current Tournage Info */
.current-tournage-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-top: 10px;
  border-left: 4px solid #28a745;
}

.no-tournage-info {
  background: #fff3cd;
  padding: 15px;
  border-radius: 6px;
  margin-top: 10px;
  border-left: 4px solid #ffc107;
  color: #856404;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel,
.btn-confirm {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-confirm {
  background: #28a745;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Active Replanifications */
.active-replanifications-section {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.active-replanifications-list {
  display: grid;
  gap: 15px;
  margin-top: 10px;
}

.active-replanification-item {
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  background: white;
}

.replanification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.replanification-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-planned {
  background: #fff3cd;
  color: #856404;
}

.replanification-heures {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.replanification-reason {
  color: #666;
  margin-bottom: 10px;
}

.replanification-actions {
  margin-top: 10px;
  text-align: right;
}

.btn-apply {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.btn-apply:hover {
  background: #218838;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .replanification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>