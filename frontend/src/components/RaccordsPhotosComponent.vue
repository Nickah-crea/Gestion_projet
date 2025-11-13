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

          <!-- Upload de photos -->
          <div class="upload-section">
            <label>Photos pour ce type de raccord *</label>
            <div class="upload-area" @click="triggerFileInput">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                @change="handleFileSelect"
                style="display: none"
              >
              <div class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Cliquez pour sélectionner des photos</p>
                <small>Formats supportés: JPG, PNG, JPEG</small>
              </div>
            </div>

            <!-- Aperçu des photos sélectionnées -->
            <div v-if="selectedFiles.length > 0" class="files-preview">
              <h5>Photos sélectionnées ({{ selectedFiles.length }})</h5>
              <div class="preview-grid">
                <div 
                  v-for="(file, index) in selectedFiles" 
                  :key="index"
                  class="preview-item"
                >
                  <img :src="getFilePreview(file)" alt="Preview">
                  <button 
                    class="remove-file-btn"
                    @click="removeFile(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                  <span class="file-name">{{ file.name }}</span>
                </div>
              </div>
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
              :disabled="!canAddRaccord"
            >
              <i class="fas fa-save"></i>
              Ajouter les raccords
            </button>
          </div>
        </div>

        <!-- Liste des raccords existants -->
        <div class="existing-raccords-section">
          <h4><i class="fas fa-list"></i> Raccords existants</h4>
          
          <div v-if="loading" class="loading">
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

              <!-- Miniatures des photos -->
              <div v-if="raccord.images && raccord.images.length > 0" class="photos-miniatures">
                <div 
                  v-for="image in raccord.images.slice(0, 4)" 
                  :key="image.id"
                  class="miniature"
                  @click="viewImage(image)"
                >
                  <img :src="getImageUrl(image.cheminFichier)" alt="Miniature">
                </div>
                <div 
                  v-if="raccord.images.length > 4" 
                  class="miniature more-count"
                >
                  +{{ raccord.images.length - 4 }}
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
const availableTypes = ref([])
const existingRaccords = ref([])
const selectedRaccord = ref(null)

// Nouveau raccord
const newRaccord = ref({
  typeId: null,
  description: '',
  files: []
})

const selectedFiles = ref([])
const fileInput = ref(null)

// Computed properties
const canAddRaccord = computed(() => {
  return newRaccord.value.typeId && selectedFiles.value.length > 0
})

// Méthodes
const openRaccordsModal = async () => {
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
  loading.value = true
  try {
    await Promise.all([
      loadTypesRaccord(),
      loadExistingRaccords()
    ])
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    alert('Erreur lors du chargement des données')
  } finally {
    loading.value = false
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

const loadExistingRaccords = async () => {
  try {
    const response = await axios.get(`/api/raccords/scene/${props.sceneId}`)
    existingRaccords.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des raccords existants:', error)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  
  // Vérifier le type des fichiers
  const validFiles = files.filter(file => 
    file.type.startsWith('image/') && 
    ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
  )
  
  if (validFiles.length !== files.length) {
    alert('Seules les images JPG, JPEG et PNG sont autorisées')
  }
  
  selectedFiles.value = [...selectedFiles.value, ...validFiles]
  event.target.value = '' // Reset l'input
}

const getFilePreview = (file) => {
  return URL.createObjectURL(file)
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const resetNewRaccord = () => {
  newRaccord.value = {
    typeId: null,
    description: '',
    files: []
  }
  selectedFiles.value = []
}

const addRaccord = async () => {
  if (!canAddRaccord.value) return

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('sceneSourceId', props.sceneId)
    formData.append('sceneCibleId', props.sceneId) // Même scène pour les raccords de conservation
    formData.append('typeRaccordId', newRaccord.value.typeId)
    formData.append('description', newRaccord.value.description)
    formData.append('estCritique', 'false')
    formData.append('statutRaccordId', '1') // Statut "À vérifier" par défaut

    // Ajouter les fichiers
    selectedFiles.value.forEach(file => {
      formData.append('images', file)
    })

    const response = await axios.post('/api/raccords', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.status === 201) {
      alert('Raccords sauvegardés avec succès!')
      resetNewRaccord()
      await loadExistingRaccords()
      emit('raccords-updated')
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des raccords:', error)
    alert('Erreur lors de la sauvegarde des raccords: ' + (error.response?.data || error.message))
  } finally {
    loading.value = false
  }
}

const viewRaccord = (raccord) => {
  selectedRaccord.value = raccord
  showImageModal.value = true
}

const deleteRaccord = async (raccordId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce raccord ?')) {
    return
  }

  try {
    await axios.delete(`/api/raccords/${raccordId}`)
    await loadExistingRaccords()
    emit('raccords-updated')
    alert('Raccord supprimé avec succès!')
  } catch (error) {
    console.error('Erreur lors de la suppression du raccord:', error)
    alert('Erreur lors de la suppression du raccord')
  }
}

const viewImage = (image) => {
  // Ouvrir l'image dans un nouvel onglet ou afficher en grand
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
  // Charger les types de raccord au montage
  loadTypesRaccord()
})
</script>

<style scoped>
.raccords-photos-container {
  display: inline-block;
}

.btn-open-raccords {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-open-raccords:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-open-raccords:disabled {
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

/* Sections du modal */
.scene-info-section,
.add-raccord-section,
.existing-raccords-section {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.scene-info-section:last-child,
.add-raccord-section:last-child,
.existing-raccords-section:last-child {
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

/* Upload Section */
.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.upload-placeholder i {
  font-size: 2em;
  color: #667eea;
  margin-bottom: 10px;
}

.upload-placeholder p {
  margin: 0 0 5px 0;
  color: #666;
}

.upload-placeholder small {
  color: #999;
}

/* Files Preview */
.files-preview h5 {
  margin-bottom: 10px;
  color: #333;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.preview-item {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.remove-file-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 10px;
  cursor: pointer;
}

.file-name {
  display: block;
  padding: 5px;
  font-size: 10px;
  text-align: center;
  background: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel,
.btn-add {
  padding: 10px 20px;
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

.btn-add {
  background: #28a745;
  color: white;
}

.btn-add:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Existing Raccords */
.raccord-item {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: #f8f9fa;
}

.raccord-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.raccord-info h5 {
  margin: 0 0 5px 0;
  color: #21294F;
}

.raccord-date {
  font-size: 12px;
  color: #666;
}

.raccord-actions {
  display: flex;
  gap: 5px;
}

.btn-view,
.btn-delete {
  background: none;
  border: none;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-view {
  color: #17a2b8;
}

.btn-view:hover {
  background: #17a2b8;
  color: white;
}

.btn-delete {
  color: #dc3545;
}

.btn-delete:hover {
  background: #dc3545;
  color: white;
}

.raccord-description {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

/* Photos Miniatures */
.photos-miniatures {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.miniature {
  width: 60px;
  height: 60px;
  border: 2px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.miniature:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.miniature img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-count {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #666;
  font-weight: bold;
  font-size: 12px;
}

/* Image Modal */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.image-modal-content {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
}

.image-modal-header {
  background: #21294F;
  color: white;
  padding: 15px 20px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.gallery-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.gallery-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.image-info {
  padding: 10px;
  background: #f8f9fa;
}

.image-info p {
  margin: 5px 0;
  font-size: 12px;
  color: #666;
}

/* Loading and No Data */
.loading,
.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading i {
  margin-right: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .raccord-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .raccord-actions {
    align-self: flex-end;
  }
  
  .image-gallery {
    grid-template-columns: 1fr;
  }
}
</style>