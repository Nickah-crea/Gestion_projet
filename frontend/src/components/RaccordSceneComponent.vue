[file name]: RaccordSceneComponent.vue
<template>
  <div class="raccord-scene-container-raccord-scene">
    <!-- Bouton pour ouvrir le modal -->
    <button 
      class="btn-open-raccord-raccord-scene"
      @click="openRaccordModal"
      :disabled="!canOpenModal"
    >
      <i class="fas fa-link"></i>
      Créer un Raccord
    </button>

    <!-- Modal pour la création de raccord -->
    <div v-if="showModal" class="modal-overlay-raccord-scene" @click="closeModal">
      <div class="modal-content-raccord-scene" @click.stop>
        <!-- En-tête du modal -->
        <div class="modal-header-raccord-scene">
          <h3>
            <i class="fas fa-link"></i>
            Créer un Raccord entre Scènes
          </h3>
          <button class="close-btn-raccord-scene" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Formulaire de création de raccord -->
        <div class="raccord-form-raccord-scene">
          <!-- Sélection des scènes -->
          <div class="form-section-raccord-scene">
            <h4><i class="fas fa-film"></i> Sélection des Scènes</h4>

            <!-- ALERTE D'INCOHÉRENCE CHRONOLOGIQUE -->
            <div 
              v-if="showChronologyAlert" 
              class="chronology-alert-raccord-scene"
              :class="{ critical: hasCriticalChronologyIssue }"
            >
              <div class="alert-content-raccord-scene">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="alert-text-raccord-scene">
                  <h5>⚠️ Incohérence chronologique détectée</h5>
                  <p>{{ chronologyAlertMessage }}</p>
                  <p class="alert-details-raccord-scene">
                    <strong>Scène source:</strong> {{ formatDate(sceneSourceTournageInfo?.dateTournage) || 'Non planifiée' }}<br>
                    <strong>Scène cible:</strong> {{ formatDate(sceneCibleTournageInfo?.dateTournage) || 'Non planifiée' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="form-row-raccord-scene">
              <div class="form-group-raccord-scene">
                <label for="scene-source">Scène Source *</label>
                <select 
                  id="scene-source"
                  v-model="raccordData.sceneSourceId"
                  class="form-select-raccord-scene"
                  disabled
                  required
                >
                  <option value="">Sélectionnez une scène source</option>
                  <option 
                    v-for="scene in availableScenes" 
                    :key="scene.idScene || scene.id" 
                    :value="scene.idScene || scene.id"
                    :selected="(scene.idScene || scene.id) === raccordData.sceneSourceId"
                  >
                    Scène {{ scene.ordre }}: {{ scene.titre }}
                  </option>
                </select>
                <small class="field-description-raccord-scene">
                  Cette scène est automatiquement sélectionnée
                </small>
              </div>

              <div class="form-group-raccord-scene">
                <label for="scene-cible">Scène Cible *</label>
                <select 
                  id="scene-cible"
                  v-model="raccordData.sceneCibleId"
                  @change="onSceneCibleChange"
                  class="form-select-raccord-scene"
                  required
                >
                  <option value="">Sélectionnez une scène cible</option>
                  <option 
                    v-for="scene in filteredScenesCible" 
                    :key="scene.idScene || scene.id" 
                    :value="scene.idScene || scene.id"
                  >
                    Scène {{ scene.ordre }}: {{ scene.titre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Informations des scènes sélectionnées AVEC DATES DE TOURNAGE -->
            <div v-if="sceneSourceInfo || sceneCibleInfo" class="scenes-info-raccord-scene">
              <!-- Scène Source -->
              <div v-if="sceneSourceInfo" class="scene-info-raccord-scene">
                <h5>Scène Source (fixe)</h5>
                <p><strong>Titre:</strong> {{ sceneSourceInfo.titre }}</p>
                <p><strong>Ordre:</strong> {{ sceneSourceInfo.ordre }}</p>
                <p><strong>Date tournage:</strong> 
                  <span :class="{ 'date-warning-raccord-scene': !sceneSourceTournageInfo }">
                    {{ sceneSourceTournageInfo ? formatDate(sceneSourceTournageInfo.dateTournage) : 'Non planifiée' }}
                  </span>
                </p>
                <p><strong>Statut:</strong> {{ sceneSourceTournageInfo?.statutTournage || 'Non défini' }}</p>
              </div>

              <!-- Scène Cible -->
              <div v-if="sceneCibleInfo" class="scene-info-raccord-scene">
                <h5>Scène Cible</h5>
                <p><strong>Titre:</strong> {{ sceneCibleInfo.titre }}</p>
                <p><strong>Ordre:</strong> {{ sceneCibleInfo.ordre }}</p>
                <p><strong>Date tournage:</strong> 
                  <span :class="{ 
                    'date-warning-raccord-scene': !sceneCibleTournageInfo,
                    'date-error-raccord-scene': hasCriticalChronologyIssue 
                  }">
                    {{ sceneCibleTournageInfo ? formatDate(sceneCibleTournageInfo.dateTournage) : 'Non planifiée' }}
                  </span>
                </p>
                <p><strong>Statut:</strong> {{ sceneCibleTournageInfo?.statutTournage || 'Non défini' }}</p>
              </div>
            </div>
          </div>

          <!-- Section Personnages et Comédiens -->
          <div class="form-section-raccord-scene">
            <h4><i class="fas fa-users"></i> Personnages et Comédiens</h4>
            <p class="section-description-raccord-scene">
              Optionnel - Liez ce raccord à un ou plusieurs personnages 
            </p>
            
            <div class="form-group-raccord-scene">
              <label for="personnages">Personnages</label>
              <select 
                id="personnages"
                v-model="raccordData.personnagesIds"
                @change="onPersonnagesChange"
                class="form-select-raccord-scene"
                multiple
                size="4"
              >
                <option value="">Aucun personnage</option>
                <option 
                  v-for="personnage in personnages" 
                  :key="personnage.id" 
                  :value="personnage.id"
                >
                  {{ personnage.nom }}
                  <span v-if="personnage.comedienNom"> - {{ personnage.comedienNom }}</span>
                </option>
              </select>
              <small class="field-description-raccord-scene">
                Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs personnages
              </small>
            </div>

            <!-- Affichage des comédiens sélectionnés -->
            <div v-if="selectedComediens.length > 0" class="selected-comediens-raccord-scene">
              <h5>Comédiens sélectionnés ({{ selectedComediens.length }})</h5>
              <div class="comediens-list-raccord-scene">
                <div 
                  v-for="comedien in selectedComediens" 
                  :key="comedien.id"
                  class="comedien-item-raccord-scene"
                >
                  <i class="fas fa-user"></i>
                  <span>{{ comedien.nom }}</span>
                  <span class="personnage-associe-raccord-scene" v-if="comedien.personnageNom">
                    ({{ comedien.personnageNom }})
                  </span>
                  <button 
                    class="remove-comedien-btn-raccord-scene"
                    @click="removeComedien(comedien.id)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Informations des personnages sélectionnés -->
            <div v-if="selectedPersonnagesInfo.length > 0" class="personnages-info-raccord-scene">
              <h5>Personnages sélectionnés ({{ selectedPersonnagesInfo.length }})</h5>
              <div class="personnages-grid-raccord-scene">
                <div 
                  v-for="personnage in selectedPersonnagesInfo" 
                  :key="personnage.id"
                  class="personnage-info-card-raccord-scene"
                >
                  <div class="personnage-header-raccord-scene">
                    <strong>{{ personnage.nom }}</strong>
                    <button 
                      class="remove-personnage-btn-raccord-scene"
                      @click="removePersonnage(personnage.id)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="personnage-details-raccord-scene">
                    <div v-if="personnage.description" class="detail-raccord-scene">
                      <strong>Description:</strong> {{ personnage.description }}
                    </div>
                    <div v-if="personnage.comedienNom" class="detail-raccord-scene">
                      <strong>Comédien:</strong> {{ personnage.comedienNom }}
                    </div>
                    <div v-if="personnage.projetTitre" class="detail-raccord-scene">
                      <strong>Projet:</strong> {{ personnage.projetTitre }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          <!-- Sélection des types de raccord -->
          <div class="form-section-raccord-scene">
            <h4><i class="fas fa-tags"></i> Types de Raccord</h4>
            <div class="types-selection-raccord-scene">
              <div 
                v-for="type in availableTypes" 
                :key="type.id"
                class="type-checkbox-raccord-scene"
              >
                <label>
                  <input 
                    type="checkbox" 
                    :value="type.id" 
                    v-model="raccordData.selectedTypes"
                    @change="onTypeSelectionChange"
                  >
                  <span class="checkmark-raccord-scene"></span>
                  {{ type.nomType }}
                </label>
                <small class="type-description-raccord-scene">{{ type.description }}</small>
              </div>
            </div>
          </div>

          <!-- Description du raccord -->
          <div class="form-section-raccord-scene">
            <h4><i class="fas fa-align-left"></i> Description du Raccord</h4>
            <div class="form-group-raccord-scene">
              <textarea
                v-model="raccordData.description"
                rows="4"
                class="form-textarea-raccord-scene"
                placeholder="Décrivez les éléments de continuité à respecter entre les scènes..."
              ></textarea>
            </div>
          </div>

          <!-- Sélection des photos existantes par type -->
          <div class="form-section-raccord-scene">
            <h4><i class="fas fa-images"></i> Photos de Référence</h4>
            <p class="section-description-raccord-scene">
              Sélectionnez les photos de la <strong>scène source</strong> à utiliser comme référence pour ce raccord
            </p>

            <div v-if="loadingPhotos" class="loading-raccord-scene">
              <i class="fas fa-spinner fa-spin"></i> Chargement des photos...
            </div>

            <div v-else-if="availablePhotos.length === 0" class="no-photos-raccord-scene">
              <p>Aucune photo disponible pour ces scènes</p>
            </div>

            <div v-else class="photos-selection-raccord-scene">
              <!-- Filtrage par type -->
              <div class="photos-filter-raccord-scene">
                <label>Filtrer par type:</label>
                <select v-model="selectedPhotoType" @change="filterPhotosByType">
                  <option value="">Tous les types</option>
                  <option 
                    v-for="type in availableTypes" 
                    :key="type.id" 
                    :value="type.id"
                  >
                    {{ type.nomType }}
                  </option>
                </select>
              </div>

              <!-- Liste des photos disponibles -->
              <div class="photos-grid-raccord-scene">
                <div 
                  v-for="photo in filteredPhotos" 
                  :key="photo.id"
                  class="photo-item-raccord-scene"
                  :class="{ 
                    selected: isPhotoSelected(photo.id),
                    shared: photo.isShared 
                  }"
                  @click="togglePhotoSelection(photo)"
                >
                  <div class="photo-image-raccord-scene">
                    <img :src="getImageUrl(photo.cheminFichier)" :alt="photo.descriptionImage">
                    <div class="photo-overlay-raccord-scene">
                      <i class="fas fa-check"></i>
                    </div>
                    <!-- Indicateur d'image partagée -->
                    <div v-if="photo.isShared" class="shared-indicator-raccord-scene" title="Image partagée">
                      <i class="fas fa-share-alt"></i>
                    </div>
                  </div>
                  <div class="photo-info-raccord-scene">
                    <span class="photo-type-raccord-scene">{{ getTypeName(photo.typeRaccordId) }}</span>
                    <span class="photo-date-raccord-scene">{{ formatDate(photo.creeLe) }}</span>
                    <span v-if="photo.isShared" class="shared-badge-raccord-scene">Partagée</span>
                    <p class="photo-description-raccord-scene" v-if="photo.descriptionImage">
                      {{ photo.descriptionImage }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Photos sélectionnées -->
              <div v-if="selectedPhotos.length > 0" class="selected-photos-raccord-scene">
                <h5>Photos sélectionnées ({{ selectedPhotos.length }})</h5>
                <div class="selected-grid-raccord-scene">
                  <div 
                    v-for="photo in selectedPhotos" 
                    :key="photo.id"
                    class="selected-item-raccord-scene"
                  >
                    <img :src="getImageUrl(photo.cheminFichier)" :alt="photo.descriptionImage">
                    <div class="selected-info-raccord-scene">
                      <span>{{ getTypeName(photo.typeRaccordId) }}</span>
                      <button 
                        class="remove-btn-raccord-scene"
                        @click="removeSelectedPhoto(photo.id)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Options supplémentaires -->
          <div class="form-section-raccord-scene">
            <h4><i class="fas fa-cog"></i> Options</h4>
            <div class="form-options-raccord-scene">
              <div class="checkbox-group-raccord-scene">
                <label>
                  <input 
                    type="checkbox" 
                    v-model="raccordData.estCritique"
                  >
                  <span class="checkmark-raccord-scene"></span>
                  Raccord critique
                </label>
                <small class="option-description-raccord-scene">
                  Ce raccord est essentiel pour la continuité du film
                </small>
              </div>

              <div class="form-group-raccord-scene">
                <label for="statut-raccord">Statut du raccord</label>
                <select 
                  id="statut-raccord"
                  v-model="raccordData.statutRaccordId"
                  class="form-select-raccord-scene"
                >
                  <option 
                    v-for="statut in availableStatuts" 
                    :key="statut.id" 
                    :value="statut.id"
                  >
                    {{ statut.nomStatut }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions-raccord-scene">
            <button 
              class="btn-cancel-raccord-scene"
              @click="closeModal"
            >
              Annuler
            </button>
            <button 
              class="btn-submit-raccord-scene"
              @click="createRaccord"
              :disabled="!canCreateRaccord"
            >
              <i class="fas fa-save"></i>
              Créer le Raccord
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

// Props
const props = defineProps({
  projetId: {
    type: Number,
    required: true
  },
  episodeId: {
    type: Number,
    default: null
  },
  sequenceId: {
    type: Number,
    default: null
  },
  sceneSourceId: { 
    type: Number,
    default: null
  }
})

// Émits
const emit = defineEmits(['raccord-created'])

// États réactifs
const showModal = ref(false)
const loadingPhotos = ref(false)
const availableScenes = ref([])
const availableTypes = ref([])
const availableStatuts = ref([])
const availablePhotos = ref([])
const filteredPhotos = ref([])
const selectedPhotoType = ref('')
const sceneSourceInfo = ref(null)
const sceneCibleInfo = ref(null)
const personnages = ref([])

// Données du raccord
const raccordData = ref({
  sceneSourceId: null,
  sceneCibleId: null,
  selectedTypes: [],
  description: '',
  estCritique: false,
  statutRaccordId: 1,
  personnagesIds: [],   
  comediensIds: []  
})

const selectedPhotos = ref([])
const filteredScenesCible = ref([])

const selectedPersonnagesInfo = ref([])
const selectedComediens = ref([])

const sceneSourceTournageInfo = ref(null)
const sceneCibleTournageInfo = ref(null)
const chronologyAlertMessage = ref('')

// Computed properties
const canOpenModal = computed(() => {
  return props.projetId !== null && props.sceneSourceId !== null
})

const canCreateRaccord = computed(() => {
  return raccordData.value.sceneSourceId && 
         raccordData.value.sceneCibleId && 
         raccordData.value.selectedTypes.length > 0
})

const showChronologyAlert = computed(() => {
  return hasChronologyIssue.value
})

const hasChronologyIssue = computed(() => {
  if (!sceneSourceTournageInfo.value || !sceneCibleTournageInfo.value) {
    return false
  }
  
  const sourceDate = new Date(sceneSourceTournageInfo.value.dateTournage)
  const targetDate = new Date(sceneCibleTournageInfo.value.dateTournage)
  
  // Vérifier si la scène cible est tournée avant la scène source
  return targetDate < sourceDate
})

const hasCriticalChronologyIssue = computed(() => {
  return hasChronologyIssue.value
})

// Watcher pour la prop sceneSourceId
watch(() => props.sceneSourceId, (newSceneSourceId) => {
  if (newSceneSourceId) {
    raccordData.value.sceneSourceId = newSceneSourceId
    if (showModal.value) {
      loadSceneInfo(newSceneSourceId, 'source')
      updateScenesCibleFilter()
      loadPhotosForScenes()
    }
  }
})

// Méthodes
const openRaccordModal = async () => {
  console.log('Ouverture modal - sceneSourceId:', props.sceneSourceId)
  
  if (!props.sceneSourceId) {
    alert('Aucune scène source définie')
    return
  }
  
  showModal.value = true
  
  // Définir automatiquement la scène source
  raccordData.value.sceneSourceId = props.sceneSourceId
  
  console.log('Chargement des données initiales...')
  await loadInitialData()
  
  // Charger les infos de la scène source automatiquement
  await loadSceneInfo(props.sceneSourceId, 'source')
  updateScenesCibleFilter()
  
  console.log('Modal ouvert avec scène source:', props.sceneSourceId)
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const loadInitialData = async () => {
  try {
    await Promise.all([
      loadScenes(),
      loadTypesRaccord(),
      loadStatutsRaccord(),
      loadPersonnages()
    ])
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    alert('Erreur lors du chargement des données')
  }
}

const loadScenes = async () => {
  try {
    let url = '/api/scenes'
    const params = new URLSearchParams()
    
    if (props.projetId) {
      params.append('projetId', props.projetId)
    } else if (props.episodeId) {
      params.append('episodeId', props.episodeId)
    } else if (props.sequenceId) {
      params.append('sequenceId', props.sequenceId)
    }
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    const response = await axios.get(url)
    availableScenes.value = response.data
    updateScenesCibleFilter()
    
    console.log('Scènes chargées - structure:', availableScenes.value[0])
  } catch (error) {
    console.error('Erreur lors du chargement des scènes:', error)
  }
}

// Méthode pour charger les informations de tournage d'une scène
const loadSceneTournageInfo = async (sceneId, type) => {
  try {
    // Essayer d'abord avec l'endpoint scene-tournage
    try {
      const response = await axios.get(`/api/scene-tournage/scene/${sceneId}`)
      if (response.data) {
        if (type === 'source') {
          sceneSourceTournageInfo.value = response.data
        } else {
          sceneCibleTournageInfo.value = response.data
        }
        updateChronologyAlert()
        return
      }
    } catch (error) {
      console.log(`Aucun tournage trouvé via scene-tournage pour la scène ${sceneId}`)
    }

    // Fallback: essayer avec planning-tournage
    try {
      const planningResponse = await axios.get(`/api/planning-tournage/scene/${sceneId}`)
      if (planningResponse.data && planningResponse.data.length > 0) {
        const tournageInfo = planningResponse.data[0]
        const formattedInfo = {
          dateTournage: tournageInfo.dateTournage,
          statutTournage: tournageInfo.statut?.nomStatut || tournageInfo.statutTournage,
          heureDebut: tournageInfo.heureDebut,
          heureFin: tournageInfo.heureFin
        }
        
        if (type === 'source') {
          sceneSourceTournageInfo.value = formattedInfo
        } else {
          sceneCibleTournageInfo.value = formattedInfo
        }
        updateChronologyAlert()
        return
      }
    } catch (error) {
      console.log(`Aucun planning trouvé pour la scène ${sceneId}`)
    }

    // Si aucun tournage trouvé
    if (type === 'source') {
      sceneSourceTournageInfo.value = null
    } else {
      sceneCibleTournageInfo.value = null
    }
    updateChronologyAlert()
    
  } catch (error) {
    console.error(`Erreur lors du chargement des infos de tournage pour la scène ${type}:`, error)
    if (type === 'source') {
      sceneSourceTournageInfo.value = null
    } else {
      sceneCibleTournageInfo.value = null
    }
    updateChronologyAlert()
  }
}

// Méthode pour mettre à jour le message d'alerte
const updateChronologyAlert = () => {
  if (!sceneSourceTournageInfo.value || !sceneCibleTournageInfo.value) {
    chronologyAlertMessage.value = ''
    return
  }

  const sourceDate = new Date(sceneSourceTournageInfo.value.dateTournage)
  const targetDate = new Date(sceneCibleTournageInfo.value.dateTournage)
  
  if (targetDate < sourceDate) {
    const daysDifference = Math.ceil((sourceDate - targetDate) / (1000 * 60 * 60 * 24))
    chronologyAlertMessage.value = `La scène cible est tournée ${daysDifference} jour(s) AVANT la scène source. Cette incohérence peut causer des problèmes de continuité.`
  } else {
    chronologyAlertMessage.value = ''
  }
}

const loadPersonnages = async () => {
  try {
    let url = '/api/personnages'
    
    // Si un projetId est spécifié, filtrer les personnages par projet
    if (props.projetId) {
      url += `?projetId=${props.projetId}`
    }
    
    const response = await axios.get(url)
    personnages.value = response.data
    console.log('Personnages chargés:', personnages.value.length)
  } catch (error) {
    console.error('Erreur lors du chargement des personnages:', error)
    personnages.value = []
  }
}

const onPersonnagesChange = () => {
  selectedPersonnagesInfo.value = []
  selectedComediens.value = []
  
  // Récupérer les informations des personnages sélectionnés
  raccordData.value.personnagesIds.forEach(personnageId => {
    const personnage = personnages.value.find(p => p.id === personnageId)
    if (personnage) {
      selectedPersonnagesInfo.value.push(personnage)
      
      // Ajouter le comédien associé s'il existe
      if (personnage.comedienId && personnage.comedienNom) {
        const comedienExists = selectedComediens.value.some(c => c.id === personnage.comedienId)
        if (!comedienExists) {
          selectedComediens.value.push({
            id: personnage.comedienId,
            nom: personnage.comedienNom,
            personnageNom: personnage.nom
          })
        }
      }
    }
  })
  
  // Mettre à jour les IDs des comédiens
  raccordData.value.comediensIds = selectedComediens.value.map(comedien => comedien.id)
}

const removePersonnage = (personnageId) => {
  const index = raccordData.value.personnagesIds.indexOf(personnageId)
  if (index !== -1) {
    raccordData.value.personnagesIds.splice(index, 1)
    onPersonnagesChange() // Recalculer les comédiens
  }
}

const removeComedien = (comedienId) => {
  const index = raccordData.value.comediensIds.indexOf(comedienId)
  if (index !== -1) {
    raccordData.value.comediensIds.splice(index, 1)
    
    // Retirer le comédien de l'affichage
    const comedienIndex = selectedComediens.value.findIndex(c => c.id === comedienId)
    if (comedienIndex !== -1) {
      selectedComediens.value.splice(comedienIndex, 1)
    }
    
    // Retirer les personnages associés à ce comédien
    const personnagesToRemove = selectedPersonnagesInfo.value
      .filter(p => p.comedienId === comedienId)
      .map(p => p.id)
    
    personnagesToRemove.forEach(personnageId => {
      removePersonnage(personnageId)
    })
  }
}

const loadTypesRaccord = async () => {
  try {
    const response = await axios.get('/api/raccords/types')
    availableTypes.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des types de raccord:', error)
  }
}

const loadStatutsRaccord = async () => {
  try {
    const response = await axios.get('/api/raccords/statuts')
    availableStatuts.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des statuts de raccord:', error)
  }
}

const loadPhotosForScenes = async () => {
  const sceneId = raccordData.value.sceneSourceId
  
  if (!sceneId) {
    console.log('Aucune scène source définie')
    availablePhotos.value = []
    filteredPhotos.value = []
    return
  }
  
  loadingPhotos.value = true
  try {
    console.log('Chargement des photos pour la scène source:', sceneId)
    
    // Charger les raccords seulement pour la scène source
    const response = await axios.get(`/api/raccords/scene/${sceneId}`)
    
    // Extraire les images de tous les raccords de la scène source
    availablePhotos.value = response.data.flatMap(raccord => {
      const ownImages = raccord.images?.map(image => ({
        ...image,
        typeRaccordId: raccord.typeRaccordId,
        sceneId: sceneId,
        raccordId: raccord.id,
        isShared: false // Image propre au raccord
      })) || []
      
      const sharedImages = raccord.sharedImages?.map(image => ({
        ...image,
        typeRaccordId: raccord.typeRaccordId,
        sceneId: sceneId,
        raccordId: raccord.id,
        isShared: true // Image partagée
      })) || []
      
      return [...ownImages, ...sharedImages]
    })
    
    console.log('Photos disponibles (scène source uniquement):', availablePhotos.value)
    filteredPhotos.value = [...availablePhotos.value]
    
  } catch (error) {
    console.error('Erreur lors du chargement des photos:', error)
    availablePhotos.value = []
  } finally {
    loadingPhotos.value = false
  }
}

const onSceneCibleChange = async () => {
  console.log('Scène cible changée:', raccordData.value.sceneCibleId)
  if (raccordData.value.sceneCibleId) {
    await loadSceneInfo(raccordData.value.sceneCibleId, 'cible')
  } else {
    sceneCibleInfo.value = null
  }
  await loadPhotosForScenes()
}

const onTypeSelectionChange = () => {
  filterPhotosByType()
}

const loadSceneInfo = async (sceneId, type) => {
  try {
    const response = await axios.get(`/api/scenes/${sceneId}`)
    if (type === 'source') {
      sceneSourceInfo.value = response.data
    } else {
      sceneCibleInfo.value = response.data
    }
    
    // Charger les informations de tournage
    await loadSceneTournageInfo(sceneId, type)
    
  } catch (error) {
    console.error(`Erreur lors du chargement des infos de la scène ${type}:`, error)
  }
}

// Watcher pour la scène cible
watch(() => raccordData.value.sceneCibleId, async (newSceneCibleId) => {
  console.log('Scène cible changée:', newSceneCibleId)
  if (newSceneCibleId) {
    await loadSceneInfo(newSceneCibleId, 'cible')
  } else {
    sceneCibleInfo.value = null
    sceneCibleTournageInfo.value = null
    chronologyAlertMessage.value = ''
  }
  await loadPhotosForScenes()
})

// Watcher pour la scène source (au cas où elle changerait)
watch(() => raccordData.value.sceneSourceId, async (newSceneSourceId) => {
  if (newSceneSourceId) {
    await loadSceneInfo(newSceneSourceId, 'source')
  }
})

const updateScenesCibleFilter = () => {
  if (raccordData.value.sceneSourceId && availableScenes.value.length > 0) {
    // Vérifier la structure des données pour utiliser le bon champ d'ID
    const firstScene = availableScenes.value[0]
    const idField = firstScene.idScene !== undefined ? 'idScene' : 'id'
    
    console.log(`Utilisation du champ d'ID: ${idField}`, firstScene)
    
    filteredScenesCible.value = availableScenes.value.filter(
      scene => scene[idField] !== raccordData.value.sceneSourceId
    )
    console.log('Scènes cible disponibles:', filteredScenesCible.value.length)
  } else {
    filteredScenesCible.value = [...availableScenes.value]
  }
}

const filterPhotosByType = () => {
  if (!selectedPhotoType.value) {
    filteredPhotos.value = [...availablePhotos.value]
  } else {
    filteredPhotos.value = availablePhotos.value.filter(
      photo => photo.typeRaccordId == selectedPhotoType.value
    )
  }
}

const togglePhotoSelection = (photo) => {
  const index = selectedPhotos.value.findIndex(p => p.id === photo.id)
  if (index === -1) {
    selectedPhotos.value.push(photo)
  } else {
    selectedPhotos.value.splice(index, 1)
  }
}

const removeSelectedPhoto = (photoId) => {
  const index = selectedPhotos.value.findIndex(p => p.id === photoId)
  if (index !== -1) {
    selectedPhotos.value.splice(index, 1)
  }
}

const isPhotoSelected = (photoId) => {
  return selectedPhotos.value.some(p => p.id === photoId)
}

const getImageUrl = (filename) => {
  return `/api/raccords/image/${filename}`
}

const getTypeName = (typeId) => {
  const type = availableTypes.value.find(t => t.id === typeId)
  return type ? type.nomType : 'Type inconnu'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Non planifiée'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const createRaccord = async () => {
  if (!canCreateRaccord.value) return

  try {
    const raccordPayload = {
      sceneSourceId: raccordData.value.sceneSourceId,
      sceneCibleId: raccordData.value.sceneCibleId,
      description: raccordData.value.description,
      estCritique: raccordData.value.estCritique,
      statutRaccordId: raccordData.value.statutRaccordId,
      typesRaccord: raccordData.value.selectedTypes,
      photosIds: selectedPhotos.value.map(photo => photo.id),
      personnagesIds: raccordData.value.personnagesIds, 
      comediensIds: raccordData.value.comediensIds    
    }

    // Utiliser le nouvel endpoint pour la création avec partage
    const response = await axios.post('/api/raccords/scene-liaison-shared', raccordPayload)
    
    if (response.status === 201) {
      alert('Raccord créé avec succès avec partage d\'images!')
      emit('raccord-created', response.data)
      closeModal()
    }
  } catch (error) {
    console.error('Erreur lors de la création du raccord:', error)
    alert('Erreur lors de la création du raccord: ' + (error.response?.data || error.message))
  }
}

const resetForm = () => {
  raccordData.value = {
    sceneSourceId: props.sceneSourceId,
    sceneCibleId: null,
    selectedTypes: [],
    description: '',
    estCritique: false,
    statutRaccordId: 1,
    personnagesIds: [],    
    comediensIds: []  
  }
  selectedPhotos.value = []
  sceneCibleInfo.value = null
  sceneCibleTournageInfo.value = null
  sceneSourceTournageInfo.value = null
  chronologyAlertMessage.value = ''
  selectedPersonnagesInfo.value = []   
  selectedComediens.value = []       
  
  // Mettre à jour le filtre avec la bonne structure d'ID
  if (availableScenes.value.length > 0 && props.sceneSourceId) {
    const firstScene = availableScenes.value[0]
    const idField = firstScene.idScene !== undefined ? 'idScene' : 'id'
    
    filteredScenesCible.value = availableScenes.value.filter(
      scene => scene[idField] !== props.sceneSourceId
    )
  } else {
    filteredScenesCible.value = [...availableScenes.value]
  }
  
  availablePhotos.value = []
  filteredPhotos.value = []
  selectedPhotoType.value = ''
}

// Initialisation
onMounted(() => {
  // Définir la scène source si elle est fournie
  if (props.sceneSourceId) {
    raccordData.value.sceneSourceId = props.sceneSourceId
  }
  
  // Charger les données de base
  loadTypesRaccord()
  loadStatutsRaccord()
  loadPersonnages()
})

// Exposer la méthode pour ouvrir le modal
defineExpose({
  openRaccordModal
})
</script>


