<template>
  <div class="raccords-photos-container">
    <!-- Bouton pour ouvrir le modal -->
    <button 
      v-if="showTriggerButton"
      class="btn-open-raccords"
      @click="openRaccordsModal"
      :disabled="!sceneId"
    >
      <i class="fas fa-camera-retro"></i>
      Photos Raccords
    </button>

    <!-- Modal pour la gestion des raccords -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- En-tête du modal -->
        <div class="modal-header">
          <h3>
            <i class="fas fa-camera"></i>
            Photos de Raccords - Scène {{ sceneInfo?.ordre }}
          </h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Informations de la scène -->
        <div class="scene-info-section">
          <div class="scene-details">
            <h4>{{ sceneInfo?.titre }}</h4>
            <p><strong>Synopsis:</strong> {{ sceneInfo?.synopsis || 'Aucun synopsis' }}</p>
            <p><strong>Statut:</strong> {{ sceneInfo?.statutNom || 'Non défini' }}</p>
          </div>
        </div>

        <!-- Section d'ajout de nouveaux raccords -->
        <div class="add-raccord-section">
          <h4><i class="fas fa-plus-circle"></i> Ajouter de nouveaux raccords</h4>
          
          <!-- Sélection du type de raccord -->
          <div class="form-group">
            <label for="type-raccord">Type de raccord *</label>
            <select 
              id="type-raccord"
              v-model="newRaccord.typeId"
              class="form-select"
              required
            >
              <option value="">Sélectionnez un type</option>
              <option 
                v-for="type in availableTypes" 
                :key="type.id" 
                :value="type.id"
              >
                {{ type.nomType }}
              </option>
            </select>
          </div>

          <!-- Description du raccord -->
          <div class="form-group">
            <label for="raccord-description">Description</label>
            <textarea
              id="raccord-description"
              v-model="newRaccord.description"
              rows="3"
              class="form-textarea"
              placeholder="Décrivez les éléments à conserver pour le prochain tournage..."
            ></textarea>
          </div>

          <!-- Upload de photos - MÊME LOGIQUE QUE GestionRaccords.vue -->
          <div class="upload-section">
            <label>Photos pour ce type de raccord *</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              @change="handleImageUpload"
              class="file-input"
            >
            <div v-if="previewImages.length" class="image-previews">
              <div v-for="(preview, index) in previewImages" :key="index" class="image-preview">
                <img :src="preview" alt="Preview">
                <button @click="removePreview(index)" class="remove-btn">×</button>
              </div>
            </div>
            <small class="field-note">Formats supportés: JPG, PNG, JPEG</small>
          </div>

          <!-- Options supplémentaires -->
          <div class="form-options">
            <div class="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  v-model="newRaccord.estCritique"
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
                v-model="newRaccord.statutRaccordId"
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

          <!-- Bouton d'ajout -->
          <div class="action-buttons">
            <button 
              class="btn-cancel"
              @click="resetNewRaccord"
            >
              Annuler
            </button>
            <button 
              class="btn-add"
              @click="addRaccord"
              :disabled="!canAddRaccord || loading"
            >
              <i class="fas fa-save"></i>
              {{ loading ? 'Enregistrement...' : 'Ajouter les raccords' }}
            </button>
          </div>
        </div>

        <!-- Liste des raccords existants -->
        <div class="existing-raccords-section">
          <h4><i class="fas fa-list"></i> Raccords existants</h4>
          
          <div v-if="loadingRaccords" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Chargement...
          </div>

          <div v-else-if="existingRaccords.length === 0" class="no-data">
            <p>Aucun raccord sauvegardé pour cette scène</p>
          </div>

          <div v-else class="raccords-list">
            <div 
              v-for="raccord in existingRaccords" 
              :key="raccord.id"
              class="raccord-item"
            >
              <div class="raccord-header">
                <div class="raccord-info">
                  <h5>{{ raccord.typeRaccordNom || getTypeName(raccord.typeRaccordId) }}</h5>
                  <span class="raccord-date">
                    Créé le {{ formatDate(raccord.creeLe) }}
                  </span>
                  <!-- Indicateur d'images partagées -->
                  <span 
                    v-if="raccord.sharedImages && raccord.sharedImages.length > 0" 
                    class="shared-badge"
                  >
                    <i class="fas fa-share-alt"></i>
                    {{ raccord.sharedImages.length }} image(s) partagée(s)
                  </span>
                </div>
                <div class="raccord-actions">
                  <button 
                    class="btn-view"
                    @click="viewRaccord(raccord)"
                    title="Voir les photos"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="btn-delete"
                    @click="deleteRaccord(raccord.id)"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <p v-if="raccord.description" class="raccord-description">
                {{ raccord.description }}
              </p>

              <!-- Miniatures des photos (propres + partagées) -->
              <div v-if="getAllImagesForRaccord(raccord).length > 0" class="photos-miniatures">
                <div 
                  v-for="image in getAllImagesForRaccord(raccord).slice(0, 4)" 
                  :key="image.id"
                  class="miniature"
                  @click="viewImage(image)"
                >
                  <img :src="getImageUrl(image.cheminFichier)" alt="Miniature">
                </div>
                <div 
                  v-if="getAllImagesForRaccord(raccord).length > 4" 
                  class="miniature more-count"
                >
                  +{{ getAllImagesForRaccord(raccord).length - 4 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de visualisation des photos -->
        <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
          <div class="image-modal-content" @click.stop>
            <div class="image-modal-header">
              <h4>{{ selectedRaccord ? (selectedRaccord.typeRaccordNom || getTypeName(selectedRaccord.typeRaccordId)) : 'Photos' }}</h4>
              <button class="close-btn" @click="closeImageModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="image-gallery">
              <div 
                v-for="image in selectedRaccord?.images || []" 
                :key="image.id"
                class="gallery-item"
              >
                <img :src="getImageUrl(image.cheminFichier)" :alt="image.nomFichier">
                <div class="image-info">
                  <p>{{ image.nomFichier }}</p>
                  <p v-if="image.descriptionImage">{{ image.descriptionImage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Props
const props = defineProps({
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
})

// Émits
const emit = defineEmits(['raccords-updated'])

// États réactifs
const showModal = ref(false)
const showImageModal = ref(false)
const loading = ref(false)
const loadingRaccords = ref(false)
const availableTypes = ref([])
const availableStatuts = ref([])
const existingRaccords = ref([])
const selectedRaccord = ref(null)
const previewImages = ref([])

const currentUserId = ref(null)

// Nouveau raccord - MÊME STRUCTURE QUE GestionRaccords.vue
const newRaccord = ref({
  typeId: null,
  description: '',
  estCritique: false,
  statutRaccordId: 1,
  images: []
})

// Computed properties
const canAddRaccord = computed(() => {
  return newRaccord.value.typeId && newRaccord.value.images.length > 0
})

// Méthodes
const checkAccessBeforeOpen = async () => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      alert('Vous devez être connecté')
      return false
    }
    
    const user = JSON.parse(userStr)
    
    // Vérifier l'accès à la scène
    const response = await axios.get(`/api/raccords/scene/${props.sceneId}/access-check`, {
      headers: { 'X-User-Id': user.id }
    })
    
    if (response.data) {
      return true
    } else {
      alert('Vous n\'avez pas accès à cette scène')
      return false
    }
  } catch (error) {
    console.error('Erreur de vérification d\'accès:', error)
    alert('Erreur de vérification d\'accès')
    return false
  }
}

const openRaccordsModal = async () => {
  // Vérifier l'accès avant d'ouvrir
  const hasAccess = await checkAccessBeforeOpen()
  if (!hasAccess) return
  
  showModal.value = true
  await loadData()
}

const closeModal = () => {
  showModal.value = false
  resetNewRaccord()
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedRaccord.value = null
}

const loadData = async () => {
  loadingRaccords.value = true
  try {
    await Promise.all([
      loadTypesRaccord(),
      loadStatutsRaccord(),
      loadExistingRaccords()
    ])
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    alert('Erreur lors du chargement des données')
  } finally {
    loadingRaccords.value = false
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
    // Définir le statut par défaut
    if (availableStatuts.value.length > 0 && !newRaccord.value.statutRaccordId) {
      newRaccord.value.statutRaccordId = availableStatuts.value[0].id
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statuts de raccord:', error)
  }
}

const loadExistingRaccords = async () => {
  try {
    const response = await axios.get(`/api/raccords/scene/${props.sceneId}`)
    
    // Filtrer les raccords : exclure ceux où cette scène est la source avec des images partagées
    const filteredRaccords = await Promise.all(
      response.data.map(async (raccord) => {
        try {
          // Récupérer les images partagées pour ce raccord
          const sharedImagesResponse = await axios.get(`/api/raccords/${raccord.id}/shared-images`)
          const sharedImages = sharedImagesResponse.data || []
          
          // Vérifier si ce raccord doit être exclu
          // Règle: Exclure les raccords où cette scène est la source ET il y a des images partagées
          const isThisSceneSource = raccord.sceneSourceId === props.sceneId
          const hasSharedImages = sharedImages.length > 0
          
          if (isThisSceneSource && hasSharedImages) {
            console.log(`Raccord ${raccord.id} exclu: scène source avec ${sharedImages.length} image(s) partagée(s)`)
            return null // Exclure ce raccord
          }
          
          // Si la scène est cible, inclure le raccord avec les images partagées
          if (raccord.sceneCibleId === props.sceneId) {
            raccord.sharedImages = sharedImages
            console.log(`Raccord ${raccord.id} inclus (scène cible): ${sharedImages.length} image(s) partagée(s)`)
          } else {
            // Si la scène est source sans images partagées, ou autre cas
            raccord.sharedImages = []
          }
          
          return raccord
          
        } catch (error) {
          console.warn(`Erreur lors de la récupération des images partagées pour le raccord ${raccord.id}:`, error)
          raccord.sharedImages = []
          return raccord
        }
      })
    )
    
    // Filtrer les nulls (raccords exclus)
    existingRaccords.value = filteredRaccords.filter(r => r !== null)
    
    console.log(`Raccords pour scène ${props.sceneId}:`)
    console.log(`- Total originaux: ${response.data.length}`)
    console.log(`- Après filtrage: ${existingRaccords.value.length}`)
    console.log(`- Exclus: ${response.data.length - existingRaccords.value.length}`)
    
  } catch (error) {
    console.error('Erreur lors du chargement des raccords existants:', error)
    existingRaccords.value = []
  }
}

const loadSharedImages = async (raccordId) => {
  try {
    const response = await axios.get(`/api/raccords/${raccordId}/shared-images`)
    const raccordIndex = existingRaccords.value.findIndex(r => r.id === raccordId)
    if (raccordIndex !== -1) {
      existingRaccords.value[raccordIndex].sharedImages = response.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des images partagées:', error)
  }
}

// MÊME LOGIQUE D'UPLOAD QUE GestionRaccords.vue
const handleImageUpload = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    newRaccord.value.images = Array.from(files)
    
    // Créer les previews
    previewImages.value = []
    Array.from(files).forEach(file => {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Seules les images sont autorisées')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImages.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
}

const removePreview = (index) => {
  previewImages.value.splice(index, 1)
  newRaccord.value.images.splice(index, 1)
}

const resetNewRaccord = () => {
  newRaccord.value = {
    typeId: null,
    description: '',
    estCritique: false,
    statutRaccordId: 1,
    images: []
  }
  previewImages.value = []
}


const addRaccord = async () => {
  if (!canAddRaccord.value) return

  loading.value = true
  try {
    // Récupérer l'utilisateur connecté
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      throw new Error('Utilisateur non connecté')
    }
    
    const user = JSON.parse(userStr)
    const userId = user.id
    
    const formData = new FormData()
    
    // Ajouter les champs du raccord
    formData.append('sceneSourceId', props.sceneId.toString())
    formData.append('sceneCibleId', props.sceneId.toString())
    formData.append('typeRaccordId', newRaccord.value.typeId.toString())
    formData.append('description', newRaccord.value.description || '')
    formData.append('estCritique', newRaccord.value.estCritique.toString())
    formData.append('statutRaccordId', newRaccord.value.statutRaccordId.toString())
    
    // Ajouter les images
    if (newRaccord.value.images && newRaccord.value.images.length > 0) {
      newRaccord.value.images.forEach(image => {
        formData.append('images', image)
      })
    }

    const response = await axios.post('/api/raccords', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-User-Id': userId  // ← AJOUTER CET EN-TÊTE
      }
    })

    if (response.status === 201) {
      alert('Raccords sauvegardés avec succès!')
      resetNewRaccord()
      await loadExistingRaccords()
      emit('raccords-updated')
    }
  } catch (error) {
    console.error('Erreur détaillée lors de la sauvegarde:', error)
    
    // Message d'erreur plus informatif
    if (error.response?.status === 400) {
      if (error.response.data === "Accès non autorisé") {
        alert('Erreur: Vous n\'avez pas accès à cette scène.')
      } else if (error.response.data.includes("Un raccord de ce type existe déjà")) {
        alert('Erreur: Un raccord de ce type existe déjà pour cette scène.')
      } else {
        alert('Erreur 400: ' + (error.response.data || 'Données invalides'))
      }
    } else if (error.response?.status === 403) {
      alert('Erreur: Accès refusé. Vérifiez vos permissions.')
    } else {
      alert('Erreur lors de la sauvegarde des raccords: ' + (error.response?.data?.message || error.message))
    }
  } finally {
    loading.value = false
  }
}

const viewRaccord = (raccord) => {
  selectedRaccord.value = raccord
  showImageModal.value = true
}

const deleteRaccord = async (raccordId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce raccord ? Cette action supprimera également les associations d\'images partagées.')) {
    return
  }

  try {
    // Récupérer l'utilisateur connecté
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      throw new Error('Utilisateur non connecté')
    }
    
    const user = JSON.parse(userStr)
    const userId = user.id
    
    await axios.delete(`/api/raccords/${raccordId}`, {
      headers: {
        'X-User-Id': userId  // ← AJOUTER CET EN-TÊTE
      }
    })
    await loadExistingRaccords()
    emit('raccords-updated')
    alert('Raccord supprimé avec succès!')
  } catch (error) {
    console.error('Erreur lors de la suppression du raccord:', error)
    
    if (error.response?.status === 403) {
      alert('Erreur: Vous n\'avez pas les permissions pour supprimer ce raccord.')
    } else {
      alert('Erreur lors de la suppression du raccord')
    }
  }
}

// const getAllImagesForRaccord = (raccord) => {
//   return raccord.images || []
// }

const getAllImagesForRaccord = (raccord) => {
  // Récupérer les images propres au raccord
  const ownImages = raccord.images || []
  
  // Récupérer les images partagées
  // IMPORTANT: Ne montrer les images partagées QUE si cette scène est la cible
  const sharedImages = (raccord.sceneCibleId === props.sceneId) 
    ? (raccord.sharedImages || [])
    : []
  
  // Combiner les images (propres + partagées si applicables)
  const allImages = [...ownImages, ...sharedImages]
  
  // Ajouter un flag pour identifier les images partagées
  allImages.forEach((image, index) => {
    if (index >= ownImages.length) {
      image.isShared = true
    } else {
      image.isShared = false
    }
  })
  
  return allImages
}

const viewImage = (image) => {
  window.open(getImageUrl(image.cheminFichier), '_blank')
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

// Initialisation
onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    currentUserId.value = user.id
  }
  loadTypesRaccord()
  loadStatutsRaccord()
})
</script>

