<template>
  <div class="raccord-scene-container">
    <!-- Bouton pour ouvrir le modal -->
    <button 
      class="btn-open-raccord"
      @click="openRaccordModal"
      :disabled="!canOpenModal"
    >
      <i class="fas fa-link"></i>
      Créer un Raccord
    </button>

    <!-- Modal pour la création de raccord -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- En-tête du modal -->
        <div class="modal-header">
          <h3>
            <i class="fas fa-link"></i>
            Créer un Raccord entre Scènes
          </h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Formulaire de création de raccord -->
        <div class="raccord-form">
          <!-- Sélection des scènes -->
            <div class="form-section">
            <h4><i class="fas fa-film"></i> Sélection des Scènes</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label for="scene-source">Scène Source *</label>
                <select 
                  id="scene-source"
                  v-model="raccordData.sceneSourceId"
                  class="form-select"
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
                <small class="field-description">
                  Cette scène est automatiquement sélectionnée
                </small>
              </div>

                <div class="form-group">
                <label for="scene-cible">Scène Cible *</label>
                <select 
                  id="scene-cible"
                  v-model="raccordData.sceneCibleId"
                  @change="onSceneCibleChange"
                  class="form-select"
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

            <!-- Informations des scènes sélectionnées -->
            <div v-if="sceneSourceInfo || sceneCibleInfo" class="scenes-info">
              <!-- Scène Source (toujours affichée si définie) -->
              <div v-if="sceneSourceInfo" class="scene-info">
                <h5>Scène Source (fixe)</h5>
                <p><strong>Titre:</strong> {{ sceneSourceInfo.titre }}</p>
                <p><strong>Synopsis:</strong> {{ sceneSourceInfo.synopsis || 'Aucun' }}</p>
                <p><strong>Statut:</strong> {{ sceneSourceInfo.statutNom || 'Non défini' }}</p>
              </div>

              <!-- Scène Cible -->
              <div v-if="sceneCibleInfo" class="scene-info">
                <h5>Scène Cible</h5>
                <p><strong>Titre:</strong> {{ sceneCibleInfo.titre }}</p>
                <p><strong>Synopsis:</strong> {{ sceneCibleInfo.synopsis || 'Aucun' }}</p>
                <p><strong>Statut:</strong> {{ sceneCibleInfo.statutNom || 'Non défini' }}</p>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4><i class="fas fa-user"></i> Personnage et Comédien</h4>
            <p class="section-description">
              Optionnel - Liez ce raccord à un personnage spécifique
            </p>
            
            <div class="form-row">
              <div class="form-group">
                <label for="personnage">Personnage</label>
                <select 
                  id="personnage"
                  v-model="raccordData.personnageId"
                  @change="onPersonnageChange"
                  class="form-select"
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
                <small class="field-description">
                  Sélectionnez un personnage pour lier automatiquement le comédien
                </small>
              </div>

              <div class="form-group">
                <label for="comedien">Comédien (automatique)</label>
                <input 
                  id="comedien"
                  type="text" 
                  :value="getComedienNameFromPersonnage(raccordData.personnageId)" 
                  disabled 
                  class="form-select disabled-input"
                  placeholder="Sélectionnez un personnage d'abord"
                >
                <small class="field-description">
                  Le comédien est automatiquement déterminé par le personnage sélectionné
                </small>
              </div>
            </div>

            <!-- Affichage des informations du personnage sélectionné -->
            <div v-if="selectedPersonnageInfo" class="personnage-info">
              <h5>Informations du personnage sélectionné</h5>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Personnage:</strong> {{ selectedPersonnageInfo.nom }}
                </div>
                <div v-if="selectedPersonnageInfo.description" class="info-item">
                  <strong>Description:</strong> {{ selectedPersonnageInfo.description }}
                </div>
                <div v-if="selectedPersonnageInfo.comedienNom" class="info-item">
                  <strong>Comédien:</strong> {{ selectedPersonnageInfo.comedienNom }}
                </div>
                <div v-if="selectedPersonnageInfo.projetTitre" class="info-item">
                  <strong>Projet:</strong> {{ selectedPersonnageInfo.projetTitre }}
                </div>
              </div>
            </div>
          </div>
          

          <!-- Sélection des types de raccord -->
          <div class="form-section">
            <h4><i class="fas fa-tags"></i> Types de Raccord</h4>
            <div class="types-selection">
              <div 
                v-for="type in availableTypes" 
                :key="type.id"
                class="type-checkbox"
              >
                <label>
                  <input 
                    type="checkbox" 
                    :value="type.id" 
                    v-model="raccordData.selectedTypes"
                    @change="onTypeSelectionChange"
                  >
                  <span class="checkmark"></span>
                  {{ type.nomType }}
                </label>
                <small class="type-description">{{ type.description }}</small>
              </div>
            </div>
          </div>

          <!-- Description du raccord -->
          <div class="form-section">
            <h4><i class="fas fa-align-left"></i> Description du Raccord</h4>
            <div class="form-group">
              <textarea
                v-model="raccordData.description"
                rows="4"
                class="form-textarea"
                placeholder="Décrivez les éléments de continuité à respecter entre les scènes..."
              ></textarea>
            </div>
          </div>

          <!-- Sélection des photos existantes par type -->
          <div class="form-section">
            <h4><i class="fas fa-images"></i> Photos de Référence</h4>
            <p class="section-description">
              Sélectionnez les photos déjà sauvegardées pour chaque type de raccord
            </p>

            <div v-if="loadingPhotos" class="loading">
              <i class="fas fa-spinner fa-spin"></i> Chargement des photos...
            </div>

            <div v-else-if="availablePhotos.length === 0" class="no-photos">
              <p>Aucune photo disponible pour ces scènes</p>
            </div>

            <div v-else class="photos-selection">
              <!-- Filtrage par type -->
              <div class="photos-filter">
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
              <div class="photos-grid">
                <div 
                  v-for="photo in filteredPhotos" 
                  :key="photo.id"
                  class="photo-item"
                  :class="{ selected: isPhotoSelected(photo.id) }"
                  @click="togglePhotoSelection(photo)"
                >
                  <div class="photo-image">
                    <img :src="getImageUrl(photo.cheminFichier)" :alt="photo.descriptionImage">
                    <div class="photo-overlay">
                      <i class="fas fa-check"></i>
                    </div>
                  </div>
                  <div class="photo-info">
                    <span class="photo-type">{{ getTypeName(photo.typeRaccordId) }}</span>
                    <span class="photo-date">{{ formatDate(photo.creeLe) }}</span>
                    <p class="photo-description" v-if="photo.descriptionImage">
                      {{ photo.descriptionImage }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Photos sélectionnées -->
              <div v-if="selectedPhotos.length > 0" class="selected-photos">
                <h5>Photos sélectionnées ({{ selectedPhotos.length }})</h5>
                <div class="selected-grid">
                  <div 
                    v-for="photo in selectedPhotos" 
                    :key="photo.id"
                    class="selected-item"
                  >
                    <img :src="getImageUrl(photo.cheminFichier)" :alt="photo.descriptionImage">
                    <div class="selected-info">
                      <span>{{ getTypeName(photo.typeRaccordId) }}</span>
                      <button 
                        class="remove-btn"
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
          <div class="form-section">
            <h4><i class="fas fa-cog"></i> Options</h4>
            <div class="form-options">
              <div class="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    v-model="raccordData.estCritique"
                  >
                  <span class="checkmark"></span>
                  Raccord critique
                </label>
                <small class="option-description">
                  Ce raccord est essentiel pour la continuité du film
                </small>
              </div>

              <div class="form-group">
                <label for="statut-raccord">Statut du raccord</label>
                <select 
                  id="statut-raccord"
                  v-model="raccordData.statutRaccordId"
                  class="form-select"
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
          <div class="form-actions">
            <button 
              class="btn-cancel"
              @click="closeModal"
            >
              Annuler
            </button>
            <button 
              class="btn-submit"
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
const selectedPersonnageInfo = ref(null)

// Données du raccord
const raccordData = ref({
  sceneSourceId: null,
  sceneCibleId: null,
  selectedTypes: [],
  description: '',
  estCritique: false,
  statutRaccordId: 1,
  personnageId: null,   
  comedienId: null
})

const selectedPhotos = ref([])
const filteredScenesCible = ref([])

// Computed properties
const canOpenModal = computed(() => {
  return props.projetId !== null && props.sceneSourceId !== null
})

const canCreateRaccord = computed(() => {
  return raccordData.value.sceneSourceId && 
         raccordData.value.sceneCibleId && 
         raccordData.value.selectedTypes.length > 0
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

const onPersonnageChange = () => {
  if (raccordData.value.personnageId) {
    // Trouver les informations du personnage sélectionné
    const personnage = personnages.value.find(p => p.id === raccordData.value.personnageId)
    selectedPersonnageInfo.value = personnage || null
    
    // Mettre à jour automatiquement l'ID du comédien
    if (personnage && personnage.comedienId) {
      raccordData.value.comedienId = personnage.comedienId
    } else {
      raccordData.value.comedienId = null
    }
  } else {
    selectedPersonnageInfo.value = null
    raccordData.value.comedienId = null
  }
}

const getComedienNameFromPersonnage = (personnageId) => {
  if (!personnageId) return 'Aucun comédien'
  const personnage = personnages.value.find(p => p.id === personnageId)
  return personnage && personnage.comedienNom 
    ? personnage.comedienNom 
    : 'Aucun comédien assigné'
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
  if (!raccordData.value.sceneSourceId && !raccordData.value.sceneCibleId) {
    console.log('Aucune scène source ou cible définie')
    return
  }
  
  loadingPhotos.value = true
  try {
    const sceneIds = [
      raccordData.value.sceneSourceId,
      raccordData.value.sceneCibleId
    ].filter(id => id !== null && id !== undefined)
    
    console.log('Chargement des photos pour les scènes:', sceneIds)
    
    if (sceneIds.length === 0) {
      availablePhotos.value = []
      filteredPhotos.value = []
      return
    }
    
    // Charger les raccords pour chaque scène
    const requests = sceneIds.map(sceneId => 
      axios.get(`/api/raccords/scene/${sceneId}`)
    )
    
    const responses = await Promise.all(requests)
    
    // Extraire les images de tous les raccords
    availablePhotos.value = responses.flatMap((response, index) => 
      response.data.flatMap(raccord => 
        raccord.images?.map(image => ({
          ...image,
          typeRaccordId: raccord.typeRaccordId,
          sceneId: sceneIds[index],
          raccordId: raccord.id
        })) || []
      )
    )
    
    console.log('Photos disponibles:', availablePhotos.value)
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
  } catch (error) {
    console.error(`Erreur lors du chargement des infos de la scène ${type}:`, error)
  }
}

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
  return new Date(dateString).toLocaleDateString('fr-FR')
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
      personnageId: raccordData.value.personnageId,  
      comedienId: raccordData.value.comedienId 
    }

    const response = await axios.post('/api/raccords/scene-liaison', raccordPayload)
    
    if (response.status === 201) {
      alert('Raccord créé avec succès!')
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
    personnageId: null,  
    comedienId: null   
  }
  selectedPhotos.value = []
  sceneCibleInfo.value = null
  selectedPersonnageInfo.value = null
  
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
</script>
<style scoped>
.raccord-scene-container {
  display: inline-block;
}

.btn-open-raccord {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-open-raccord:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-open-raccord:disabled {
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
  width: 95%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: linear-gradient(135deg, #21294F 0%, #2c3e50 100%);
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

/* Form Styles */
.raccord-form {
  padding: 20px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h4 {
  margin-bottom: 15px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

/* Scenes Info */
.scenes-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 15px;
}

.scene-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.scene-info h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.scene-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}

/* Types Selection */
.types-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.type-checkbox {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.type-checkbox label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 5px;
}

.type-description {
  color: #666;
  font-size: 12px;
  display: block;
  margin-left: 28px;
}

/* Photos Selection */
.section-description {
  color: #666;
  margin-bottom: 15px;
  font-style: italic;
}

.photos-filter {
  margin-bottom: 15px;
}

.photos-filter label {
  margin-right: 10px;
  font-weight: 600;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.photo-item {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.photo-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.photo-item.selected {
  border-color: #28a745;
  background: #f8fff9;
}

.photo-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.photo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(40, 167, 69, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item.selected .photo-overlay {
  opacity: 1;
}

.photo-overlay i {
  color: white;
  font-size: 24px;
}

.photo-info {
  padding: 10px;
}

.photo-type {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 2px;
}

.photo-date {
  display: block;
  font-size: 10px;
  color: #666;
  margin-bottom: 5px;
}

.photo-description {
  font-size: 11px;
  color: #777;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Selected Photos */
.selected-photos {
  margin-top: 20px;
}

.selected-photos h5 {
  margin-bottom: 10px;
  color: #333;
}

.selected-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-item {
  position: relative;
  width: 80px;
  height: 80px;
  border: 2px solid #28a745;
  border-radius: 6px;
  overflow: hidden;
}

.selected-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 3px;
  font-size: 9px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Form Options */
.form-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 5px;
}

.option-description {
  color: #666;
  font-size: 12px;
  margin-left: 28px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-submit {
  background: #28a745;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading and No Data */
.loading,
.no-photos {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.loading i {
  margin-right: 10px;
}

/* Custom Checkbox */
input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 98%;
    margin: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .scenes-info {
    grid-template-columns: 1fr;
  }
  
  .types-selection {
    grid-template-columns: 1fr;
  }
  
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .form-options {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
.photo-image {
  position: relative;
  height: 120px;
  overflow: hidden;
  background: #f5f5f5; /* Fond de secours */
}

.photo-image img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Changé de 'cover' à 'contain' */
  background: white;
}

/* Améliorer l'affichage quand aucune photo */
.no-photos {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
  background: #f9f9f9;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.personnage-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #17a2b8;
  margin-top: 15px;
}

.personnage-info h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.info-item {
  font-size: 13px;
  color: #495057;
}

.info-item strong {
  color: #2c3e50;
}

.disabled-input {
  background-color: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

</style>