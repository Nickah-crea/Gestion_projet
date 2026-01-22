<template>
  <div class="replanification-container">
    <!-- Bouton pour ouvrir le modal de replanification -->
    <button 
      v-if="showTriggerButton && canShowButton"
      class="btn-open-replanification"
      @click="openReplanificationModal"
      :disabled="!sceneId || !hasPlanifiedTournage"
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
            <!-- <p><strong>Scène {{ sceneInfo?.ordre }}:</strong> {{ sceneInfo?.titre }}</p>
            <p><strong>Synopsis:</strong> {{ sceneInfo?.synopsis || 'Aucun synopsis' }}</p>
            <p><strong>Statut:</strong> {{ sceneInfo?.statutNom || 'Non défini' }}</p> -->
            
            <!-- Informations de tournage actuelles -->
            <div v-if="currentTournage" class="current-tournage-info">
              <h5>Tournage actuel :</h5>
              <p><strong>Date :</strong> {{ formatDate(currentTournage.dateTournage) }}</p>
              <p><strong>Heure début :</strong> {{ formatHeure(currentTournage.heureDebut) }}</p>
              <p><strong>Heure fin :</strong> {{ formatHeure(currentTournage.heureFin) }}</p>
              <p><strong>Statut :</strong> {{ getStatutLibelle(currentTournage.statutTournage) }}</p>
              <div v-if="!isPlanifiedTournage" class="statut-alert">
                <i class="fas fa-exclamation-circle"></i>
                <span>Seuls les tournages planifiés peuvent être replanifiés</span>
              </div>
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
        <div class="replanification-form-section" v-if="isPlanifiedTournage">
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
              @change="verifierConflitsTempsReel"
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
                @change="verifierConflitsTempsReel"
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
                @change="verifierConflitsTempsReel"
              >
              <small class="field-note">Laissez vide pour conserver l'heure actuelle</small>
            </div>
          </div>

          <!-- Affichage des conflits détectés -->
          <div v-if="conflitsDetected.length > 0" class="conflits-section">
            <div class="conflits-alert">
              <i class="fas fa-exclamation-triangle"></i>
              <strong>Conflits détectés :</strong>
              <ul class="conflits-list">
                <li v-for="(conflit, index) in conflitsDetected" :key="index">
                  {{ conflit }}
                </li>
              </ul>
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
              :disabled="!canConfirmReplanification || loading || conflitsDetected.length > 0"
              type="button"
            >
              <i class="fas fa-calendar-check" v-if="!loading"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              {{ loading ? 'Replanification...' : 'Confirmer la replanification' }}
            </button>
          </div>
        </div>

        <!-- Message si le tournage n'est pas planifié -->
        <div v-else-if="currentTournage && !isPlanifiedTournage" class="non-planified-message">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Cette scène ne peut pas être replanifiée</strong>
            <p>Le tournage actuel a le statut "{{ getStatutLibelle(currentTournage.statutTournage) }}" et doit être en statut "Planifié" pour être replanifié.</p>
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
    },
    userPermissions: {
      type: Object,
      default: () => ({
        canCreateScene: false
      })
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
    const conflitsDetected = ref([])

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

    // Vérifie si le tournage actuel est en statut "planifie"
    const isPlanifiedTournage = computed(() => {
      return currentTournage.value?.statutTournage === 'planifie'
    })

    // Vérifie s'il y a un tournage planifié
    const hasPlanifiedTournage = computed(() => {
      return isPlanifiedTournage.value
    })

    // Computed property pour conditionner l'affichage du bouton
    const canShowButton = computed(() => {
      // Vérifier si l'utilisateur a la permission de créer des scènes
      // ET s'il n'y a pas déjà une replanification active
      // ET s'il y a un tournage planifié
      return (
        props.userPermissions.canCreateScene && 
        !hasActiveReplanification.value &&
        hasPlanifiedTournage.value
      )
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
      conflitsDetected.value = []
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
        console.log('📊 Statut du tournage:', currentTournage.value?.statutTournage)
        
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

    const verifierConflitsTempsReel = async () => {
      if (!replanificationData.value.nouvelleDate) {
        conflitsDetected.value = []
        return
      }

      try {
        // Vérifier d'abord les disponibilités
        const disponibilitesResponse = await axios.get('/api/conflicts/check-disponibilites', {
          params: {
            sceneId: props.sceneId,
            dateTournage: replanificationData.value.nouvelleDate
          }
        })

        let conflicts = [...(disponibilitesResponse.data.conflicts || [])]

        // Si les heures sont définies, vérifier aussi les conflits horaires
        if (replanificationData.value.nouvelleHeureDebut && replanificationData.value.nouvelleHeureFin) {
          const conflitsResponse = await axios.get('/api/conflicts/check', {
            params: {
              sceneId: props.sceneId,
              dateTournage: replanificationData.value.nouvelleDate,
              heureDebut: replanificationData.value.nouvelleHeureDebut,
              heureFin: replanificationData.value.nouvelleHeureFin
            }
          })

          conflicts = [...conflicts, ...(conflitsResponse.data.conflicts || [])]
        }

        conflitsDetected.value = conflicts

      } catch (error) {
        console.error('❌ Erreur lors de la vérification des conflits:', error)
        // Ne pas bloquer l'utilisateur en cas d'erreur de vérification
      }
    }

    // Vérification finale des conflits avant confirmation
    const verifierConflitsFinaux = async () => {
      if (!replanificationData.value.nouvelleDate) {
        return true
      }

      try {
        let peutContinuer = true

        // Vérifier les disponibilités
        const disponibilitesResponse = await axios.get('/api/conflicts/check-disponibilites', {
          params: {
            sceneId: props.sceneId,
            dateTournage: replanificationData.value.nouvelleDate
          }
        })

        if (disponibilitesResponse.data.hasConflicts) {
          const messages = disponibilitesResponse.data.conflicts.join('\n')
          if (!confirm(`Problèmes de disponibilité détectés:\n\n${messages}\n\nVoulez-vous quand même continuer ?`)) {
            peutContinuer = false
          }
        }

        // Vérifier les conflits horaires si les heures sont définies
        if (peutContinuer && replanificationData.value.nouvelleHeureDebut && replanificationData.value.nouvelleHeureFin) {
          const conflitsResponse = await axios.get('/api/conflicts/check', {
            params: {
              sceneId: props.sceneId,
              dateTournage: replanificationData.value.nouvelleDate,
              heureDebut: replanificationData.value.nouvelleHeureDebut,
              heureFin: replanificationData.value.nouvelleHeureFin
            }
          })

          if (conflitsResponse.data.hasConflicts) {
            const messages = conflitsResponse.data.conflicts.join('\n')
            if (!confirm(`Conflits de planning détectés:\n\n${messages}\n\nVoulez-vous quand même continuer ?`)) {
              peutContinuer = false
            }
          }
        }

        return peutContinuer

      } catch (error) {
        console.error('❌ Erreur vérification conflits finaux:', error)
        // En cas d'erreur, permettre à l'utilisateur de continuer
        return true
      }
    }

    const confirmReplanification = async () => {
      if (!canConfirmReplanification.value) return

      // Vérifier que le tournage est toujours planifié
      if (!isPlanifiedTournage.value) {
        alert('Impossible de replanifier : le tournage n\'est plus en statut "Planifié"')
        return
      }

      // Validation des heures
      if (replanificationData.value.nouvelleHeureDebut && replanificationData.value.nouvelleHeureFin) {
        if (replanificationData.value.nouvelleHeureDebut >= replanificationData.value.nouvelleHeureFin) {
          alert('L\'heure de début doit être avant l\'heure de fin')
          return
        }
      }

      // Vérifier les conflits avant soumission
      const peutContinuer = await verifierConflitsFinaux()
      if (!peutContinuer) return

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

    const getStatutLibelle = (statut) => {
      const statuts = {
        'planifie': 'Planifié',
        'confirme': 'Confirmé',
        'en_cours': 'En cours',
        'termine': 'Terminé',
        'reporte': 'Reporté'
      }
      return statuts[statut] || statut
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

    // Watcher pour surveiller les changements du tournage
    watch(currentTournage, (newTournage) => {
      console.log('🔄 Tournage mis à jour:', newTournage?.statutTournage)
    }, { deep: true })

    // Watchers pour la vérification en temps réel des conflits
    watch(() => replanificationData.value.nouvelleDate, verifierConflitsTempsReel)
    watch(() => replanificationData.value.nouvelleHeureDebut, verifierConflitsTempsReel)
    watch(() => replanificationData.value.nouvelleHeureFin, verifierConflitsTempsReel)

    return {
      showModal,
      loading,
      availableRaccords,
      currentTournage,
      activeReplanifications,
      replanificationData,
      conflitsDetected,
      canConfirmReplanification,
      hasActiveReplanification,
      isPlanifiedTournage,
      hasPlanifiedTournage,
      minDate,
      canShowButton,
      openReplanificationModal,
      closeModal,
      confirmReplanification,
      appliquerReplanification,
      verifierConflitsTempsReel,
      formatDate,
      formatHeure,
      getStatutLibelle
    }
  }
}
</script>
